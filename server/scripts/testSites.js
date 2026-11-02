import http from 'node:http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/db.js';
import { AUTH_COOKIE, signSuperAdminToken } from '../src/middleware/requireSuperAdmin.js';
import User from '../models/User.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';

// Names only this script's records, so cleanup can't touch real sites.
const PREFIX = 'testsites-';
const INACTIVE_SLUG = 'testsites-inactive';
const ROOT = process.env.ROOT_DOMAIN;
const ADMIN_HOST = `admin.${ROOT}`;

let failures = 0;
function check(label, passed) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  if (!passed) failures += 1;
}

async function cleanUp() {
  await Site.deleteMany({ subdomain: { $regex: `^${PREFIX}` } });
  await Template.deleteOne({ slug: INACTIVE_SLUG });
}

// Uses http rather than fetch, because fetch doesn't allow setting the Host header.
function request(port, { method = 'GET', path, host = ADMIN_HOST, cookie, body, raw }) {
  const payload = raw ?? (body ? JSON.stringify(body) : undefined);
  const headers = { Host: host };
  if (cookie) headers.Cookie = cookie;
  if (body) headers['Content-Type'] = 'application/json';
  if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

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
        resolve({ status: res.statusCode, json });
      });
    });
    req.on('error', reject);
    req.end(payload);
  });
}

let server;
try {
  await connectDB();
  await Promise.all([Site.init(), Template.init()]);
  await cleanUp();

  const admin = await User.findOne({ role: 'superadmin' });
  const template = await Template.findOne({ isActive: true });
  if (!admin || !template) {
    throw new Error('Super admin or template not found. Run scripts/seed.js first');
  }
  await Template.create({
    name: 'Inactive Test',
    slug: INACTIVE_SLUG,
    defaultContent: {},
    isActive: false,
  });

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  const cookie = `${AUTH_COOKIE}=${signSuperAdminToken(admin)}`;
  const api = (options) => request(port, { cookie, ...options });
  const create = (fields) =>
    api({
      method: 'POST',
      path: '/api/admin/sites',
      body: { name: 'Test', templateSlug: template.slug, ...fields },
    });

  const anonymous = await request(port, { path: '/api/admin/sites' });
  check('not logged in gets 401', anonymous.status === 401);

  const customerHost = await api({ path: '/api/admin/sites', host: `demo.${ROOT}` });
  check('a customer domain gets 404', customerHost.status === 404);

  const a = await create({
    subdomain: `${PREFIX}a`,
    status: 'published',
    customDomain: 'stolen.example',
    domainStatus: 'connected',
    ownerId: admin._id,
  });
  check('a valid site gets 201', a.status === 201);
  check('a new site is a draft even if the request asks for published', a.json?.status === 'draft');

  const savedA = await Site.findById(a.json._id);
  check(
    'extra fields in the request are ignored',
    savedA.customDomain === undefined && savedA.domainStatus === 'none' && !savedA.ownerId
  );

  const b = await create({ subdomain: `${PREFIX}b` });
  savedA.content.sections[0].label = 'Changed';
  savedA.markModified('content');
  await savedA.save();
  const savedB = await Site.findById(b.json._id);
  const freshTemplate = await Template.findById(template._id);
  check(
    'editing one site changes neither the template nor another site',
    savedB.content.sections[0].label !== 'Changed' &&
      freshTemplate.defaultContent.sections[0].label !== 'Changed'
  );

  const duplicate = await create({ subdomain: `${PREFIX}a` });
  check('a duplicate subdomain gets 409', duplicate.status === 409);

  const capitalised = await create({ subdomain: `${PREFIX}A`.toUpperCase() });
  check('a differently capitalised subdomain gets 409', capitalised.status === 409);

  const reserved = await create({ subdomain: 'admin' });
  check('a reserved subdomain gets 400', reserved.status === 400);

  const badFormat = await create({ subdomain: 'not valid!' });
  check('an invalid subdomain gets 400', badFormat.status === 400);

  const injected = await create({ subdomain: { $ne: null } });
  check('an object instead of a subdomain gets 400', injected.status === 400);

  const unknownTemplate = await create({ subdomain: `${PREFIX}c`, templateSlug: 'no-such-template' });
  check('an unknown template gets 400', unknownTemplate.status === 400);

  const inactive = await create({ subdomain: `${PREFIX}d`, templateSlug: INACTIVE_SLUG });
  check('an inactive template gets 400', inactive.status === 400);

  const notJson = await api({ method: 'POST', path: '/api/admin/sites', raw: 'name=Test' });
  check('a non-JSON request gets 415', notJson.status === 415);

  const statusPath = `/api/admin/sites/${a.json._id}/status`;
  const badId = await api({
    method: 'PATCH',
    path: '/api/admin/sites/not-an-id/status',
    body: { status: 'published' },
  });
  check('an invalid site ID gets 400', badId.status === 400);

  const badStatus = await api({ method: 'PATCH', path: statusPath, body: { status: 'live' } });
  check('an invalid status gets 400', badStatus.status === 400);

  const siteHost = `${PREFIX}a.${ROOT}`;
  const beforePublish = await request(port, { path: '/api/site', host: siteHost });
  check('a draft site is hidden from the public', beforePublish.status === 404);

  const published = await api({ method: 'PATCH', path: statusPath, body: { status: 'published' } });
  check('publishing returns 200', published.status === 200 && published.json?.status === 'published');

  const afterPublish = await request(port, { path: '/api/site', host: siteHost });
  check('a published site is public', afterPublish.status === 200);

  const list = await api({ path: '/api/admin/sites' });
  const listed = list.json?.find((site) => site._id === a.json._id);
  check('the site list includes the site without content', Boolean(listed) && !('content' in listed));

  const templates = await api({ path: '/api/admin/templates' });
  check(
    'the template list hides inactive templates',
    templates.json?.some((item) => item.slug === template.slug) &&
      !templates.json?.some((item) => item.slug === INACTIVE_SLUG)
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
