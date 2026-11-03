import http from 'node:http';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/db.js';
import { AUTH_COOKIE } from '../src/middleware/requireAuth.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';
import User from '../models/User.js';

// Names only this script's records, so cleanup can't touch real accounts or sites.
const PREFIX = 'testauth-';
const EMAIL_DOMAIN = '@bullas.test';
const ROOT = process.env.ROOT_DOMAIN;
const ADMIN_HOST = `admin.${ROOT}`;
const HOST_A = `${PREFIX}a.${ROOT}`;
const HOST_B = `${PREFIX}b.${ROOT}`;
// Random for each run, so a leftover account could never be logged in to.
// The login limit is off on development computers, so it's switched on here to test it.
process.env.LOGIN_LIMIT = 'on';
const PASSWORD = randomBytes(16).toString('hex');

let failures = 0;
function check(label, passed) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  if (!passed) failures += 1;
}

async function cleanUp() {
  await User.deleteMany({ email: { $regex: `^${PREFIX}.*${EMAIL_DOMAIN}$` } });
  await Site.deleteMany({ subdomain: { $regex: `^${PREFIX}` } });
}

// Uses http rather than fetch, because fetch doesn't allow setting the Host header.
function request(port, { method = 'GET', path, host, cookie, body }) {
  const payload = body ? JSON.stringify(body) : undefined;
  const headers = { Host: host };
  if (cookie) headers.Cookie = `${AUTH_COOKIE}=${cookie}`;
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
          // Some error responses aren't JSON; the status code is still checked.
        }
        resolve({ status: res.statusCode, json, text, setCookie: res.headers['set-cookie']?.[0] });
      });
    });
    req.on('error', reject);
    req.end(payload);
  });
}

let server;
try {
  await connectDB();
  await Promise.all([Site.init(), User.init()]);
  await cleanUp();

  const template = await Template.findOne({ isActive: true });
  if (!template) {
    throw new Error('Template not found. Run scripts/seed.js first');
  }

  const makeSite = (letter) =>
    Site.create({
      name: `Auth Test ${letter}`,
      subdomain: `${PREFIX}${letter}`,
      templateId: template._id,
      content: { owner: letter },
    });
  const siteA = await makeSite('a');
  const siteB = await makeSite('b');

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const makeUser = (key, role, siteId, extra = {}) =>
    User.create({
      name: `Test ${key}`,
      email: `${PREFIX}${key}${EMAIL_DOMAIN}`,
      passwordHash,
      role,
      siteId,
      ...extra,
    });
  const ownerA = await makeUser('a', 'siteowner', siteA._id);
  await makeUser('b', 'siteowner', siteB._id);
  const admin = await makeUser('admin', 'superadmin');

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const api = (options) => request(port, options);

  const login = (host, email, password = PASSWORD) =>
    api({ method: 'POST', path: '/api/auth/login', host, body: { email, password } });
  const tokenFrom = (response) => response.setCookie?.match(new RegExp(`${AUTH_COOKIE}=([^;]+)`))?.[1];

  const loginA = await login(HOST_A, ownerA.email);
  const tokenA = tokenFrom(loginA);
  check('an owner can log in on their own site', loginA.status === 200 && Boolean(tokenA));
  check(
    'the cookie is httpOnly, strict and tied to one host',
    /HttpOnly/i.test(loginA.setCookie) &&
      /SameSite=Strict/i.test(loginA.setCookie) &&
      !/Domain=/i.test(loginA.setCookie)
  );
  check('login never returns the password hash', !loginA.text.includes('passwordHash'));

  check('an owner cannot log in on another site', (await login(HOST_B, ownerA.email)).status === 401);
  check('an owner cannot log in on the admin host', (await login(ADMIN_HOST, ownerA.email)).status === 401);

  const loginAdmin = await login(ADMIN_HOST, admin.email);
  const tokenAdmin = tokenFrom(loginAdmin);
  check('a super admin can log in on the admin host', loginAdmin.status === 200 && Boolean(tokenAdmin));
  check('a super admin cannot log in on a site', (await login(HOST_A, admin.email)).status === 401);

  const me = await api({ path: '/api/auth/me', host: HOST_A, cookie: tokenA });
  check('/me with a token returns the user', me.status === 200 && me.json?.role === 'siteowner');
  check('/me without a token gets 401', (await api({ path: '/api/auth/me', host: HOST_A })).status === 401);
  check(
    '/me with an altered token gets 401',
    (await api({ path: '/api/auth/me', host: HOST_A, cookie: `${tokenA}x` })).status === 401
  );

  const ownerOnAdmin = await api({ path: '/api/sites', host: ADMIN_HOST, cookie: tokenA });
  check('an owner calling a super admin route gets 403', ownerOnAdmin.status === 403);
  check(
    'the super admin area stays hidden on a site',
    (await api({ path: '/api/sites', host: HOST_A, cookie: tokenA })).status === 404
  );
  check(
    'a super admin can use a super admin route',
    (await api({ path: '/api/sites', host: ADMIN_HOST, cookie: tokenAdmin })).status === 200
  );

  check(
    'a super admin calling an owner route gets 403',
    (await api({ path: '/api/owner/site', host: HOST_A, cookie: tokenAdmin })).status === 403
  );
  check(
    "an owner's token on another site gets 403 on /me",
    (await api({ path: '/api/auth/me', host: HOST_B, cookie: tokenA })).status === 403
  );
  check(
    "an owner's token on another site gets 403 on the owner route",
    (await api({ path: '/api/owner/site', host: HOST_B, cookie: tokenA })).status === 403
  );
  check(
    'the owner route without a token gets 401',
    (await api({ path: '/api/owner/site', host: HOST_A })).status === 401
  );

  const ownSite = await api({ path: '/api/owner/site', host: HOST_A, cookie: tokenA });
  check(
    'an owner can read their own draft site',
    ownSite.status === 200 && ownSite.json?.status === 'draft' && ownSite.json?.content?.owner === 'a'
  );
  check('the same draft stays hidden from the public', (await api({ path: '/api/site', host: HOST_A })).status === 404);

  const tempOwner = await makeUser('temp', 'siteowner', siteA._id, { mustChangePassword: true });
  const tempToken = tokenFrom(await login(HOST_A, tempOwner.email));
  const change = (body) =>
    api({ method: 'POST', path: '/api/auth/change-password', host: HOST_A, cookie: tempToken, body });
  const NEW_PASSWORD = randomBytes(16).toString('hex');

  check('a temporary password can still log in', Boolean(tempToken));
  const tempMe = await api({ path: '/api/auth/me', host: HOST_A, cookie: tempToken });
  check('/me works and reports the change is needed', tempMe.json?.mustChangePassword === true);
  const blocked = await api({ path: '/api/owner/site', host: HOST_A, cookie: tempToken });
  check(
    'other routes get 403 until the password changes',
    blocked.status === 403 && blocked.json?.code === 'PASSWORD_CHANGE_REQUIRED'
  );
  check(
    'changing the password without logging in gets 401',
    (
      await api({
        method: 'POST',
        path: '/api/auth/change-password',
        host: HOST_A,
        body: { currentPassword: PASSWORD, newPassword: NEW_PASSWORD },
      })
    ).status === 401
  );
  check(
    'a wrong current password gets 401',
    (await change({ currentPassword: 'wrong', newPassword: NEW_PASSWORD })).status === 401
  );
  check(
    'a short new password gets 400',
    (await change({ currentPassword: PASSWORD, newPassword: 'short' })).status === 400
  );
  check(
    'reusing the temporary password gets 400',
    (await change({ currentPassword: PASSWORD, newPassword: PASSWORD })).status === 400
  );
  const changed = await change({ currentPassword: PASSWORD, newPassword: NEW_PASSWORD });
  check('a valid change succeeds', changed.status === 200 && changed.json?.mustChangePassword === false);
  check(
    'the new cookie from the change works on the owner route',
    (await api({ path: '/api/owner/site', host: HOST_A, cookie: tokenFrom(changed) })).status === 200
  );
  check(
    'the old login stops working after the change',
    (await api({ path: '/api/owner/site', host: HOST_A, cookie: tempToken })).status === 401
  );
  const storedTemp = await User.findById(tempOwner._id).select('+passwordHash');
  check(
    'the new password replaces the old one',
    (await bcrypt.compare(NEW_PASSWORD, storedTemp.passwordHash)) &&
      !(await bcrypt.compare(PASSWORD, storedTemp.passwordHash))
  );

  const logout = await api({ method: 'POST', path: '/api/auth/logout', host: HOST_A, body: {} });
  check('logout clears the cookie', logout.status === 200 && /Expires=Thu, 01 Jan 1970/i.test(logout.setCookie));

  await User.deleteOne({ _id: ownerA._id });
  check(
    "a deleted owner's token stops working at once",
    (await api({ path: '/api/auth/me', host: HOST_A, cookie: tokenA })).status === 401
  );

  // Three failures so far, so two more reach the limit and the next is refused.
  await login(ADMIN_HOST, 'nobody@bullas.test', 'wrong');
  await login(ADMIN_HOST, 'nobody@bullas.test', 'wrong');
  check(
    'login is refused after 5 failed attempts, even with the right password',
    (await login(ADMIN_HOST, admin.email)).status === 429
  );
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
