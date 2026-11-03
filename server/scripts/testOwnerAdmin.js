import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/db.js';
import { AUTH_COOKIE, signToken } from '../src/middleware/requireAuth.js';
import { UPLOAD_ROOT } from '../src/services/imageStorage.js';
import BlogPost from '../models/BlogPost.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';
import User from '../models/User.js';

// Names only this script's records, so cleanup can't touch real accounts, sites or posts.
const PREFIX = 'testowner-';
const ROOT = process.env.ROOT_DOMAIN;
const ADMIN_HOST = `admin.${ROOT}`;
const HOST_A = `${PREFIX}a.${ROOT}`;
const HOST_B = `${PREFIX}b.${ROOT}`;
// Random for each run, so a leftover account could never be logged in to.
const PASSWORD = randomBytes(16).toString('hex');
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), randomBytes(16)]);

let failures = 0;
function check(label, passed) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  if (!passed) failures += 1;
}

async function cleanUp() {
  const sites = await Site.find({ subdomain: { $regex: `^${PREFIX}` } }).select('_id');
  for (const site of sites) {
    await rm(path.join(UPLOAD_ROOT, site._id.toString()), { recursive: true, force: true });
  }
  await BlogPost.deleteMany({ siteId: { $in: sites.map((site) => site._id) } });
  await User.deleteMany({ email: { $regex: `^${PREFIX}.*@bullas\\.test$` } });
  await Site.deleteMany({ subdomain: { $regex: `^${PREFIX}` } });
}

// Uses http rather than fetch, because fetch doesn't allow setting the Host header.
function request(port, { method = 'GET', path: urlPath, host, token, body, raw, headers = {} }) {
  const payload = raw ?? (body ? JSON.stringify(body) : undefined);
  const allHeaders = { Host: host, ...headers };
  if (token) allHeaders.Cookie = `${AUTH_COOKIE}=${token}`;
  if (body) allHeaders['Content-Type'] = 'application/json';
  if (payload) allHeaders['Content-Length'] = Buffer.byteLength(payload);

  return new Promise((resolve, reject) => {
    const req = http.request({ port, method, path: urlPath, headers: allHeaders }, (res) => {
      let text = '';
      res.on('data', (chunk) => (text += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          // Some error responses aren't JSON; the status code is still checked.
        }
        const token = res.headers['set-cookie']?.[0]?.match(new RegExp(`${AUTH_COOKIE}=([^;]+)`))?.[1];
        resolve({ status: res.statusCode, json, token });
      });
    });
    req.on('error', reject);
    req.end(payload);
  });
}

function multipart(file) {
  const boundary = `----bullas${randomBytes(8).toString('hex')}`;
  return {
    raw: Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="a.png"\r\nContent-Type: image/png\r\n\r\n`
      ),
      file,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

let server;
try {
  await connectDB();
  await Promise.all([Site.init(), User.init(), BlogPost.init()]);
  await cleanUp();

  const template = await Template.findOne({ slug: 'panchayat-classic' });
  if (!template) throw new Error('Template not found. Run scripts/seed.js first');

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  async function makeSiteWithOwner(letter) {
    const siteId = new mongoose.Types.ObjectId();
    const owner = await User.create({
      name: `Owner ${letter}`,
      email: `${PREFIX}${letter}@bullas.test`,
      passwordHash,
      role: 'siteowner',
      siteId,
    });
    const site = await Site.create({
      _id: siteId,
      name: `Owner Test ${letter}`,
      subdomain: `${PREFIX}${letter}`,
      status: 'published',
      ownerId: owner._id,
      templateId: template._id,
      content: structuredClone(template.defaultContent),
    });
    return { site, owner };
  }
  const { site: siteA, owner: ownerA } = await makeSiteWithOwner('a');
  const { site: siteB, owner: ownerB } = await makeSiteWithOwner('b');
  const admin = await User.create({
    name: 'Admin',
    email: `${PREFIX}admin@bullas.test`,
    passwordHash,
    role: 'superadmin',
  });
  const adminToken = signToken(admin);
  const postB = await BlogPost.create({ siteId: siteB._id, title: 'B post', slug: 'b-post' });

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const api = (options) => request(port, options);
  const login = (host, email, password = PASSWORD) =>
    api({ method: 'POST', path: '/api/auth/login', host, body: { email, password } });

  const tokenA = (await login(HOST_A, ownerA.email)).token;
  check('owner A can log in on their own site', Boolean(tokenA));

  // Owner A attacking site B, the IDOR checks: every one must be refused.
  const asA = (options) => api({ host: HOST_A, token: tokenA, ...options });
  const B = `/api/sites/${siteB._id}`;
  const upload = multipart(PNG);
  const attacks = [
    ['read B content', { path: `${B}/content` }],
    ['save B content', { method: 'PUT', path: `${B}/content`, body: { content: {} } }],
    [
      'upload to B',
      {
        method: 'POST',
        path: `${B}/upload`,
        raw: upload.raw,
        headers: { 'Content-Type': upload.contentType, 'x-bullas-upload': '1' },
      },
    ],
    ['list B posts', { path: `${B}/blog` }],
    ['read a B post', { path: `${B}/blog/${postB._id}` }],
    ['create a B post', { method: 'POST', path: `${B}/blog`, body: { title: 'x' } }],
    ['edit a B post', { method: 'PUT', path: `${B}/blog/${postB._id}`, body: { title: 'x' } }],
    ['publish a B post', { method: 'PATCH', path: `${B}/blog/${postB._id}/status`, body: { status: 'published' } }],
    ['delete a B post', { method: 'DELETE', path: `${B}/blog/${postB._id}` }],
  ];
  for (const [label, options] of attacks) {
    check(`owner A trying to ${label} gets 403`, (await asA(options)).status === 403);
  }
  check('site B post is untouched', (await BlogPost.findById(postB._id))?.title === 'B post');

  // Owners can't use super admin actions, from any address.
  const ownerOnAdmin = (options) => api({ host: ADMIN_HOST, token: tokenA, ...options });
  check('owner listing all sites gets 403', (await ownerOnAdmin({ path: '/api/sites' })).status === 403);
  check(
    'owner resetting another owner gets 403',
    (await ownerOnAdmin({ method: 'POST', path: `${B}/owner/reset-password`, body: { temporaryPassword: 'x'.repeat(12) } })).status === 403
  );
  check(
    'owner disabling another owner gets 403',
    (await ownerOnAdmin({ method: 'PATCH', path: `${B}/owner/status`, body: { disabled: true } })).status === 403
  );
  check('the super admin area stays hidden on a site', (await asA({ path: '/api/sites' })).status === 404);

  // Owner A can still manage their own site.
  check('owner A can read their own content', (await asA({ path: `/api/sites/${siteA._id}/content` })).status === 200);
  check(
    'owner A can create their own post',
    (await asA({ method: 'POST', path: `/api/sites/${siteA._id}/blog`, body: { title: 'Mine' } })).status === 201
  );

  // Super admin: view, reset and disable owners.
  const asAdmin = (options) => api({ host: ADMIN_HOST, token: adminToken, ...options });
  const ownerInfo = await asAdmin({ path: `${B}/owner` });
  check('the super admin can view a site owner', ownerInfo.json?.owner?.email === ownerB.email);
  check('owner details never include the password hash', !JSON.stringify(ownerInfo.json).includes('passwordHash'));
  const listed = (await asAdmin({ path: '/api/sites' })).json?.find((item) => item._id === siteB._id.toString());
  check('the site list shows each owner', listed?.ownerId?.email === ownerB.email);

  const tokenB = (await login(HOST_B, ownerB.email)).token;
  const NEW_TEMP = randomBytes(12).toString('hex');
  check(
    'a short reset password gets 400',
    (await asAdmin({ method: 'POST', path: `${B}/owner/reset-password`, body: { temporaryPassword: 'short' } })).status === 400
  );
  const reset = await asAdmin({ method: 'POST', path: `${B}/owner/reset-password`, body: { temporaryPassword: NEW_TEMP } });
  check('the super admin can reset a password', reset.status === 200 && reset.json?.mustChangePassword === true);
  check(
    "a reset ends the owner's existing logins",
    (await api({ host: HOST_B, token: tokenB, path: `${B}/content` })).status === 401
  );
  const afterReset = await login(HOST_B, ownerB.email, NEW_TEMP);
  check('the owner can log in with the new temporary password', afterReset.status === 200);
  check(
    'and must change it before editing',
    (await api({ host: HOST_B, token: afterReset.token, path: `${B}/content` })).status === 403
  );

  const disable = await asAdmin({ method: 'PATCH', path: `${B}/owner/status`, body: { disabled: true } });
  check('the super admin can disable an owner', disable.status === 200 && disable.json?.disabled === true);
  check(
    "disabling ends the owner's existing logins",
    (await api({ host: HOST_B, token: afterReset.token, path: '/api/auth/me' })).status === 401
  );
  check('a disabled owner cannot log in', (await login(HOST_B, ownerB.email, NEW_TEMP)).status === 403);
  check(
    'a non-true/false disabled value gets 400',
    (await asAdmin({ method: 'PATCH', path: `${B}/owner/status`, body: { disabled: 'yes' } })).status === 400
  );
  await asAdmin({ method: 'PATCH', path: `${B}/owner/status`, body: { disabled: false } });
  check('an enabled owner can log in again', (await login(HOST_B, ownerB.email, NEW_TEMP)).status === 200);

  const noOwnerSite = await Site.create({
    name: 'No owner',
    subdomain: `${PREFIX}none`,
    templateId: template._id,
    content: {},
  });
  check('a site without an owner gets 404', (await asAdmin({ path: `/api/sites/${noOwnerSite._id}/owner` })).status === 404);
  check('an invalid site ID gets 400', (await asAdmin({ path: '/api/sites/bad-id/owner' })).status === 400);
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
