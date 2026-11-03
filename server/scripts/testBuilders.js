import http from 'node:http';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/db.js';
import { AUTH_COOKIE, signToken } from '../src/middleware/requireAuth.js';
import BlogPost from '../models/BlogPost.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';
import User from '../models/User.js';

// Names only this script's records, so cleanup can't touch real accounts, sites or posts.
const PREFIX = 'testbuilder-';
const ROOT = process.env.ROOT_DOMAIN;
const ADMIN_HOST = `admin.${ROOT}`;
// Random for each run, so a leftover account could never be logged in to.
const PASSWORD = randomBytes(16).toString('hex');

let failures = 0;
function check(label, passed) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  if (!passed) failures += 1;
}

async function cleanUp() {
  const sites = await Site.find({ subdomain: { $regex: `^${PREFIX}` } }).select('_id');
  await BlogPost.deleteMany({ siteId: { $in: sites.map((site) => site._id) } });
  await User.deleteMany({ email: { $regex: `^${PREFIX}.*@bullas\\.test$` } });
  await Site.deleteMany({ subdomain: { $regex: `^${PREFIX}` } });
}

// Uses http rather than fetch, because fetch doesn't allow setting the Host header.
function request(port, { method = 'GET', path, host = ADMIN_HOST, token, body }) {
  const payload = body ? JSON.stringify(body) : undefined;
  const headers = { Host: host };
  if (token) headers.Cookie = `${AUTH_COOKIE}=${token}`;
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
        const token = res.headers['set-cookie']?.[0]?.match(new RegExp(`${AUTH_COOKIE}=([^;]+)`))?.[1];
        resolve({ status: res.statusCode, json, token });
      });
    });
    req.on('error', reject);
    req.end(payload);
  });
}

let server;
try {
  await connectDB();
  await Promise.all([Site.init(), User.init(), BlogPost.init()]);
  await cleanUp();

  const template = await Template.findOne({ isActive: true });
  if (!template) throw new Error('Template not found. Run scripts/seed.js first');

  const admin = await User.create({
    name: 'Admin',
    email: `${PREFIX}admin@bullas.test`,
    passwordHash: '!not-a-real-hash',
    role: 'superadmin',
  });
  const adminToken = signToken(admin);

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const api = (options) => request(port, options);
  const asAdmin = (options) => api({ token: adminToken, ...options });

  // Creating builders
  const created = await asAdmin({
    method: 'POST',
    path: '/api/users',
    body: { name: 'Ravi', email: `${PREFIX}ravi@bullas.test`, temporaryPassword: PASSWORD },
  });
  check('the super admin can create a builder', created.status === 201 && created.json?.role === 'builder');
  check('a new builder must change their password', created.json?.mustChangePassword === true);
  check('the response never includes the password hash', !JSON.stringify(created.json).includes('passwordHash'));
  check(
    'a duplicate email gets 409',
    (await asAdmin({
      method: 'POST',
      path: '/api/users',
      body: { name: 'Again', email: `${PREFIX}ravi@bullas.test`, temporaryPassword: PASSWORD },
    })).status === 409
  );
  check(
    'a short password gets 400',
    (await asAdmin({ method: 'POST', path: '/api/users', body: { name: 'X', email: `${PREFIX}x@bullas.test`, temporaryPassword: 'short' } })).status === 400
  );

  // A builder logs in on the admin address and must change the temporary password first.
  const ravi = await User.findById(created.json._id);
  const login = await api({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: ravi.email, password: PASSWORD },
  });
  check('a builder can log in on the admin address', login.status === 200 && login.json?.role === 'builder');
  check(
    'a builder with a temporary password is blocked until it changes',
    (await api({ token: login.token, path: '/api/sites' })).status === 403
  );
  check(
    'a builder cannot log in on a customer site',
    (await api({ method: 'POST', path: '/api/auth/login', host: `demo.${ROOT}`, body: { email: ravi.email, password: PASSWORD } })).status === 401
  );

  // Two ready builders, A and B, without temporary passwords.
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const makeBuilder = (key) =>
    User.create({ name: `Builder ${key}`, email: `${PREFIX}${key}@bullas.test`, passwordHash, role: 'builder' });
  const builderA = await makeBuilder('a');
  const builderB = await makeBuilder('b');
  const tokenA = signToken(builderA);
  const tokenB = signToken(builderB);
  const asA = (options) => api({ token: tokenA, ...options });

  const createSite = (token, letter) =>
    api({
      token,
      method: 'POST',
      path: '/api/sites',
      body: {
        name: `Builder site ${letter}`,
        subdomain: `${PREFIX}${letter}`,
        templateSlug: template.slug,
        ownerName: 'Owner',
        ownerEmail: `${PREFIX}owner-${letter}@bullas.test`,
        temporaryPassword: PASSWORD,
      },
    });
  const siteA = (await createSite(tokenA, 'a')).json;
  const siteB = (await createSite(tokenB, 'b')).json;
  check('builders can create sites', Boolean(siteA?._id && siteB?._id));
  check('a builder\'s new site is assigned to them', (await Site.findById(siteA._id)).builderId?.equals(builderA._id));
  check('builders can read the templates', (await asA({ path: '/api/admin/templates' })).status === 200);

  const listA = (await asA({ path: '/api/sites' })).json ?? [];
  check(
    'a builder\'s list shows only their own sites',
    listA.some((site) => site._id === siteA._id) && !listA.some((site) => site._id === siteB._id)
  );
  const adminList = (await asAdmin({ path: '/api/sites' })).json ?? [];
  check(
    'the super admin sees every builder\'s sites',
    adminList.some((site) => site._id === siteA._id) && adminList.some((site) => site._id === siteB._id)
  );

  // Builder A attacking builder B's site: every attempt must be refused.
  const B = `/api/sites/${siteB._id}`;
  const post = await BlogPost.create({ siteId: siteB._id, title: 'B post', slug: 'b-post' });
  const attacks = [
    ['read B content', { path: `${B}/content` }],
    ['save B content', { method: 'PUT', path: `${B}/content`, body: { content: {} } }],
    ['list B posts', { path: `${B}/blog` }],
    ['edit a B post', { method: 'PUT', path: `${B}/blog/${post._id}`, body: { title: 'x' } }],
    ['delete a B post', { method: 'DELETE', path: `${B}/blog/${post._id}` }],
    ['publish B', { method: 'PATCH', path: `${B}/status`, body: { status: 'published' } }],
  ];
  for (const [label, options] of attacks) {
    check(`builder A trying to ${label} gets 403`, (await asA(options)).status === 403);
  }
  check(
    'a missing site gives builders 403, not 404',
    (await asA({ path: `/api/sites/${new mongoose.Types.ObjectId()}/content` })).status === 403
  );
  check('site B is unchanged', (await Site.findById(siteB._id)).status === 'draft');

  // Builder A can work on their own site.
  check('builder A can edit their own content', (await asA({ path: `/api/sites/${siteA._id}/content` })).status === 200);
  check(
    'builder A can publish their own site',
    (await asA({ method: 'PATCH', path: `/api/sites/${siteA._id}/status`, body: { status: 'published' } })).status === 200
  );
  check(
    'builder A can blog on their own site',
    (await asA({ method: 'POST', path: `/api/sites/${siteA._id}/blog`, body: { title: 'Hello' } })).status === 201
  );

  // Super admin only: owners, domains, users and assignments.
  const A = `/api/sites/${siteA._id}`;
  const superOnly = [
    ['view the owner', { path: `${A}/owner` }],
    ['reset the owner password', { method: 'POST', path: `${A}/owner/reset-password`, body: { temporaryPassword: PASSWORD } }],
    ['disable the owner', { method: 'PATCH', path: `${A}/owner/status`, body: { disabled: true } }],
    ['view the domain', { path: `${A}/domain` }],
    ['set a domain', { method: 'PUT', path: `${A}/domain`, body: { domain: 'bullas-test-x.com' } }],
    ['reassign a site', { method: 'PATCH', path: `${A}/builder`, body: { builderId: null } }],
    ['list users', { path: '/api/users' }],
    ['create a user', { method: 'POST', path: '/api/users', body: { name: 'x', email: 'x@y.com', temporaryPassword: PASSWORD } }],
  ];
  for (const [label, options] of superOnly) {
    check(`a builder trying to ${label} gets 403`, (await asA(options)).status === 403);
  }

  // Reassigning
  const assign = await asAdmin({ method: 'PATCH', path: `${B}/builder`, body: { builderId: builderA._id.toString() } });
  check('the super admin can reassign a site', assign.status === 200);
  check('builder A now sees the reassigned site', (await asA({ path: `${B}/content` })).status === 200);
  check('builder B loses it', (await api({ token: tokenB, path: `${B}/content` })).status === 403);
  check(
    'a site can only be given to a builder',
    (await asAdmin({ method: 'PATCH', path: `${B}/builder`, body: { builderId: admin._id.toString() } })).status === 400
  );
  const unassign = await asAdmin({ method: 'PATCH', path: `${B}/builder`, body: { builderId: null } });
  check('a site can be unassigned', unassign.status === 200 && unassign.json?.builderId === null);

  // Reset and disable
  const reset = await asAdmin({ method: 'POST', path: `/api/users/${builderA._id}/reset-password`, body: { temporaryPassword: randomBytes(12).toString('hex') } });
  check('the super admin can reset a builder\'s password', reset.status === 200 && reset.json?.mustChangePassword === true);
  check('a reset ends the builder\'s existing logins', (await asA({ path: '/api/sites' })).status === 401);
  const disable = await asAdmin({ method: 'PATCH', path: `/api/users/${builderB._id}/status`, body: { disabled: true } });
  check('the super admin can disable a builder', disable.status === 200 && disable.json?.disabled === true);
  check('a disabled builder is logged out at once', (await api({ token: tokenB, path: '/api/sites' })).status === 401);
  check(
    'a disabled builder cannot log in',
    (await api({ method: 'POST', path: '/api/auth/login', body: { email: builderB.email, password: PASSWORD } })).status === 403
  );
  check('the super admin cannot be disabled through this page', (await asAdmin({ method: 'PATCH', path: `/api/users/${admin._id}/status`, body: { disabled: true } })).status === 404);

  const users = (await asAdmin({ path: '/api/users' })).json ?? [];
  check(
    'the users list shows builders with site counts and no owners',
    users.some((user) => user._id === builderA._id.toString() && user.siteCount === 1) &&
      users.every((user) => user.role === 'builder')
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
