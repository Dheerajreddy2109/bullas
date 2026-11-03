import http from 'node:http';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { generateSync } from 'otplib';
import app from '../src/app.js';
import { connectDB } from '../src/db.js';
import { AUTH_COOKIE, TWO_FACTOR_COOKIE } from '../src/middleware/requireAuth.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';
import User from '../models/User.js';

// A throwaway key if this computer has none yet, so the test never needs your real one.
process.env.TWO_FACTOR_KEY ||= randomBytes(32).toString('hex');

// Names only this script's records, so cleanup can't touch real accounts or sites.
const PREFIX = 'test2fa-';
const ROOT = process.env.ROOT_DOMAIN;
const ADMIN_HOST = `admin.${ROOT}`;
const PASSWORD = randomBytes(16).toString('hex');

let failures = 0;
function check(label, passed) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  if (!passed) failures += 1;
}

async function cleanUp() {
  await User.deleteMany({ email: { $regex: `^${PREFIX}.*@bullas\\.test$` } });
  await Site.deleteMany({ subdomain: { $regex: `^${PREFIX}` } });
}

// Codes for this moment, or the next 30-second step (to test without waiting for the clock).
const codeAt = (secret, offsetSteps = 0) =>
  generateSync({ secret, epoch: Math.floor(Date.now() / 1000) + offsetSteps * 30 });

// Uses http rather than fetch, because fetch doesn't allow setting the Host header.
function request(port, { method = 'GET', path, host = ADMIN_HOST, cookies = {}, body }) {
  const payload = body ? JSON.stringify(body) : undefined;
  const headers = { Host: host };
  const cookie = Object.entries(cookies)
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  if (cookie) headers.Cookie = cookie;
  if (payload) {
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(payload);
  }
  return new Promise((resolve, reject) => {
    const req = http.request({ port, method, path, headers }, (res) => {
      let text = '';
      res.on('data', (chunk) => (text += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          // Some responses have no JSON body; the status code is still checked.
        }
        const read = (name) =>
          (res.headers['set-cookie'] ?? []).map((line) => line.match(new RegExp(`^${name}=([^;]*)`))?.[1]).find((v) => v !== undefined);
        resolve({ status: res.statusCode, json, session: read(AUTH_COOKIE), pending: read(TWO_FACTOR_COOKIE) });
      });
    });
    req.on('error', reject);
    req.end(payload);
  });
}

let server;
try {
  await connectDB();
  await Promise.all([User.init(), Site.init()]);
  await cleanUp();

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const builder = await User.create({ name: 'Builder', email: `${PREFIX}builder@bullas.test`, passwordHash, role: 'builder' });
  await User.create({ name: 'Admin', email: `${PREFIX}admin@bullas.test`, passwordHash, role: 'superadmin' });

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const api = (options) => request(port, options);
  const login = (email, host = ADMIN_HOST) =>
    api({ method: 'POST', path: '/api/auth/login', host, body: { email, password: PASSWORD } });

  // Enforcement on, as on the live server.
  process.env.TWO_FACTOR_REQUIRED = 'true';
  const first = await login(builder.email);
  let session = first.session;
  check('without 2FA set up, a builder still gets a login', first.status === 200 && Boolean(session));
  check('and is told setup is required', first.json?.twoFactorRequired === true && first.json?.twoFactorEnabled === false);
  check(
    'everything else is blocked until 2FA is set up',
    (await api({ path: '/api/sites', cookies: { [AUTH_COOKIE]: session } })).json?.code === 'TWO_FACTOR_SETUP_REQUIRED'
  );

  // Setup
  const setup = await api({ method: 'POST', path: '/api/auth/2fa/setup', cookies: { [AUTH_COOKIE]: session }, body: {} });
  const secret = setup.json?.manualKey;
  check('setup returns a QR code and a key', setup.status === 200 && setup.json.qrDataUrl.startsWith('data:image/png') && Boolean(secret));
  const stored = await User.findById(builder._id).select('+twoFactorPendingSecret');
  check('the secret is stored encrypted, never as the plain key', stored.twoFactorPendingSecret?.startsWith('v1:') && !stored.twoFactorPendingSecret.includes(secret));

  check(
    'a wrong code does not turn 2FA on',
    (await api({ method: 'POST', path: '/api/auth/2fa/enable', cookies: { [AUTH_COOKIE]: session }, body: { code: '000000' } })).status === 400
  );
  const enabled = await api({ method: 'POST', path: '/api/auth/2fa/enable', cookies: { [AUTH_COOKIE]: session }, body: { code: codeAt(secret) } });
  const backupCodes = enabled.json?.backupCodes ?? [];
  check('a correct code turns 2FA on and gives 10 backup codes', enabled.status === 200 && backupCodes.length === 10);
  check('turning it on ends the old login', (await api({ path: '/api/auth/me', cookies: { [AUTH_COOKIE]: session } })).status === 401);
  session = enabled.session;
  check('this browser gets a fresh login and can now work', (await api({ path: '/api/sites', cookies: { [AUTH_COOKIE]: session } })).status === 200);
  const hashes = (await User.findById(builder._id).select('+twoFactorBackupCodes')).twoFactorBackupCodes;
  check('backup codes are stored only as hashes', hashes.length === 10 && !hashes.includes(backupCodes[0]));

  // Logging in with 2FA
  const step1 = await login(builder.email);
  check('a correct password alone gives no login', step1.json?.twoFactorRequired === true && !step1.session && Boolean(step1.pending));
  check(
    'the half-step pass cannot be used as a login',
    (await api({ path: '/api/auth/me', cookies: { [AUTH_COOKIE]: step1.pending } })).status === 401
  );
  const verify = (code, pending = step1.pending, host = ADMIN_HOST) =>
    api({ method: 'POST', path: '/api/auth/2fa/verify', host, cookies: { [TWO_FACTOR_COOKIE]: pending }, body: { code } });
  check('a wrong code gets 401', (await verify('123456')).status === 401);
  check('the code used to turn 2FA on cannot be reused', (await verify(codeAt(secret))).status === 401);
  const codeNext = codeAt(secret, 1);
  const good = await verify(codeNext);
  check('the next code logs in', good.status === 200 && Boolean(good.session));
  check('the same code cannot be used twice', (await verify(codeNext, (await login(builder.email)).pending)).status === 401);
  check('verifying with no half-step pass gets 401', (await verify(codeAt(secret, 1), undefined)).status === 401);
  check(
    'the half-step pass does not work on a customer site',
    (await verify(backupCodes[9], (await login(builder.email)).pending, `demo.${ROOT}`)).status === 401
  );

  const backupLogin = await verify(backupCodes[0], (await login(builder.email)).pending);
  check('a backup code logs in', backupLogin.status === 200);
  check('a backup code works only once', (await verify(backupCodes[0], (await login(builder.email)).pending)).status === 401);

  // Turning it off
  session = backupLogin.session;
  check(
    'required accounts cannot turn 2FA off',
    (await api({ method: 'POST', path: '/api/auth/2fa/disable', cookies: { [AUTH_COOKIE]: session }, body: { password: PASSWORD, code: backupCodes[1] } })).status === 403
  );
  process.env.TWO_FACTOR_REQUIRED = 'false';
  check(
    'turning it off needs the right password',
    (await api({ method: 'POST', path: '/api/auth/2fa/disable', cookies: { [AUTH_COOKIE]: session }, body: { password: 'wrong', code: backupCodes[1] } })).status === 401
  );
  const off = await api({ method: 'POST', path: '/api/auth/2fa/disable', cookies: { [AUTH_COOKIE]: session }, body: { password: PASSWORD, code: backupCodes[2] } });
  check('with password and code, 2FA can be turned off when optional', off.status === 200 && off.json?.twoFactorEnabled === false);
  const plain = await login(builder.email);
  check('after turning it off, the password logs in directly', plain.status === 200 && Boolean(plain.session));

  // Super admin reset, and site owners
  process.env.TWO_FACTOR_REQUIRED = 'true';
  const adminLogin = await login(`${PREFIX}admin@bullas.test`);
  // Enable 2FA on the admin directly, so the reset routes can be reached.
  const adminSetup = await api({ method: 'POST', path: '/api/auth/2fa/setup', cookies: { [AUTH_COOKIE]: adminLogin.session }, body: {} });
  const adminOn = await api({ method: 'POST', path: '/api/auth/2fa/enable', cookies: { [AUTH_COOKIE]: adminLogin.session }, body: { code: codeAt(adminSetup.json.manualKey) } });
  const asAdmin = { [AUTH_COOKIE]: adminOn.session };

  const builderSetup = await api({ method: 'POST', path: '/api/auth/2fa/setup', cookies: { [AUTH_COOKIE]: plain.session }, body: {} });
  await api({ method: 'POST', path: '/api/auth/2fa/enable', cookies: { [AUTH_COOKIE]: plain.session }, body: { code: codeAt(builderSetup.json.manualKey) } });
  const reset = await api({ method: 'POST', path: `/api/users/${builder._id}/two-factor/reset`, cookies: asAdmin, body: {} });
  check('the super admin can reset a builder\'s 2FA', reset.status === 200 && (await User.findById(builder._id)).twoFactorEnabled === false);

  const template = await Template.findOne({ isActive: true });
  const siteId = new mongoose.Types.ObjectId();
  const owner = await User.create({ name: 'Owner', email: `${PREFIX}owner@bullas.test`, passwordHash, role: 'siteowner', siteId });
  await Site.create({ _id: siteId, name: '2FA site', subdomain: `${PREFIX}site`, status: 'published', ownerId: owner._id, templateId: template._id, content: {} });
  const ownerLogin = await login(owner.email, `${PREFIX}site.${ROOT}`);
  check('2FA stays optional for site owners', ownerLogin.status === 200 && ownerLogin.json?.twoFactorRequired === false);
  check(
    'owners can still work without it',
    (await api({ path: `/api/sites/${siteId}/content`, host: `${PREFIX}site.${ROOT}`, cookies: { [AUTH_COOKIE]: ownerLogin.session } })).status === 200
  );
  check(
    'the super admin can reset an owner\'s 2FA',
    (await api({ method: 'POST', path: `/api/sites/${siteId}/owner/two-factor/reset`, cookies: asAdmin, body: {} })).status === 200
  );
  process.env.TWO_FACTOR_REQUIRED = 'false';
} catch (err) {
  console.error('Test run failed:', err.message);
  failures += 1;
} finally {
  await cleanUp();
  server?.close();
  await mongoose.disconnect();
}

console.log(failures === 0 ? 'All checks passed' : `${failures} check(s) failed`);
process.exitCode = failures === 0 ? 0 : 1;
