import http from 'node:http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/db.js';
import { AUTH_COOKIE, signToken } from '../src/middleware/requireAuth.js';
import { useResolverForTests } from '../src/services/dnsCheck.js';
import { normalizeDomain } from '../src/utils/domainRules.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';
import User from '../models/User.js';

// Names only this script's records, so cleanup can't touch real accounts or sites.
const PREFIX = 'testdomain-';
const ROOT = process.env.ROOT_DOMAIN;
const ADMIN_HOST = `admin.${ROOT}`;
const TARGET = process.env.CNAME_TARGET || `sites.${ROOT}`;
// Reserved documentation names, so these tests can never match a real customer's domain.
const GOOD = 'bullas-test-good.com';
const ROOT_ONLY = 'bullas-test-rootonly.com';
const BAD = 'bullas-test-bad.com';

// Fixed DNS answers, so the test doesn't depend on the internet or on real records existing.
const FAKE_DNS = {
  resolveCname: {
    [`www.${GOOD}`]: [`${TARGET}.`],
    [`www.${BAD}`]: ['somewhere-else.example.'],
  },
  resolve4: {},
};
useResolverForTests({
  resolveCname: async (name) => {
    if (FAKE_DNS.resolveCname[name]) return FAKE_DNS.resolveCname[name];
    throw Object.assign(new Error('no record'), { code: 'ENODATA' });
  },
  resolve4: async (name) => {
    if (FAKE_DNS.resolve4[name]) return FAKE_DNS.resolve4[name];
    throw Object.assign(new Error('no record'), { code: 'ENODATA' });
  },
});

let failures = 0;
function check(label, passed) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  if (!passed) failures += 1;
}

async function cleanUp() {
  await User.deleteMany({ email: { $regex: `^${PREFIX}.*@bullas\\.test$` } });
  await Site.deleteMany({ subdomain: { $regex: `^${PREFIX}` } });
}

// Uses http rather than fetch, because fetch doesn't allow setting the Host header.
function request(port, { method = 'GET', path, host, token, body, headers = {} }) {
  const payload = body ? JSON.stringify(body) : undefined;
  const allHeaders = { Host: host, ...headers };
  if (token) allHeaders.Cookie = `${AUTH_COOKIE}=${token}`;
  if (payload) {
    allHeaders['Content-Type'] = 'application/json';
    allHeaders['Content-Length'] = Buffer.byteLength(payload);
  }
  return new Promise((resolve, reject) => {
    const req = http.request({ port, host: '127.0.0.1', method, path, headers: allHeaders }, (res) => {
      let text = '';
      res.on('data', (chunk) => (text += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          // Some responses have no body; the status code is still checked.
        }
        resolve({ status: res.statusCode, json });
      });
    });
    req.on('error', reject);
    req.end(payload);
  });
}

// Domain cleaning, checked without the database.
check('a URL with https:// and www. is cleaned', normalizeDomain('https://WWW.Dheeraj.com/about') === 'dheeraj.com');
check('a trailing dot is removed', normalizeDomain('dheeraj.com.') === 'dheeraj.com');
check('a Telugu domain becomes its xn-- form', normalizeDomain('తెలుగు.com')?.startsWith('xn--'));
check('an IP address is rejected', normalizeDomain('13.233.10.20') === null);
check('a single word is rejected', normalizeDomain('localhost') === null);
check('a reserved ending is rejected', normalizeDomain('shop.localhost') === null);
check('a label starting with a hyphen is rejected', normalizeDomain('-bad.com') === null);
check('an object is rejected', normalizeDomain({ $ne: null }) === null);

let server;
try {
  await connectDB();
  await Promise.all([Site.init(), User.init()]);
  await cleanUp();

  const template = await Template.findOne({ isActive: true });
  if (!template) throw new Error('Template not found. Run scripts/seed.js first');
  const makeSite = (letter) =>
    Site.create({
      name: `Domain Test ${letter}`,
      subdomain: `${PREFIX}${letter}`,
      status: 'published',
      templateId: template._id,
      content: structuredClone(template.defaultContent),
    });
  const siteA = await makeSite('a');
  const siteB = await makeSite('b');
  const admin = await User.create({
    name: 'Admin',
    email: `${PREFIX}admin@bullas.test`,
    passwordHash: '!not-a-real-hash',
    role: 'superadmin',
  });
  const owner = await User.create({
    name: 'Owner',
    email: `${PREFIX}owner@bullas.test`,
    passwordHash: '!not-a-real-hash',
    role: 'siteowner',
    siteId: siteA._id,
  });

  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const api = (options) => request(port, options);
  const asAdmin = (options) => api({ host: ADMIN_HOST, token: signToken(admin), ...options });
  const domainOf = (site) => `/api/sites/${site._id}/domain`;
  const save = (site, domain) => asAdmin({ method: 'PUT', path: domainOf(site), body: { domain } });
  const verify = (site) => asAdmin({ method: 'POST', path: `${domainOf(site)}/verify`, body: {} });
  const ask = (domain, headers) =>
    api({ host: '127.0.0.1', path: `/api/internal/domain-allowed?domain=${encodeURIComponent(domain)}`, headers });

  // Saving
  const info = await asAdmin({ path: domainOf(siteA) });
  check('the domain page shows the CNAME target', info.json?.cnameTarget === TARGET);
  const saved = await save(siteA, `https://www.${GOOD}/`);
  check('a domain is saved cleaned and pending', saved.json?.customDomain === GOOD && saved.json?.domainStatus === 'pending');
  check('a badly formed domain gets 400', (await save(siteB, 'not a domain')).status === 400);
  check(`a ${ROOT} address gets 400`, (await save(siteB, `shop.${ROOT}`)).status === 400);
  check('a domain used by another site gets 409', (await save(siteB, GOOD)).status === 409);
  check(
    'an owner cannot manage domains',
    (await api({ host: ADMIN_HOST, token: signToken(owner), path: domainOf(siteA) })).status === 403
  );

  // A pending domain is not live and gets no certificate.
  check('a pending domain gets no certificate', (await ask(GOOD)).status === 404);
  check('a pending domain does not show the site', (await api({ host: GOOD, path: '/api/site' })).status === 404);

  // Verifying
  const verified = await verify(siteA);
  check('a correct CNAME connects the domain', verified.json?.domainStatus === 'connected');
  check('the ask endpoint approves a connected domain', (await ask(GOOD)).status === 200);
  check('the ask endpoint approves its www version', (await ask(`www.${GOOD}`)).status === 200);
  check('the ask endpoint refuses unknown domains', (await ask('random-unknown-domain.com')).status === 404);
  check(`the ask endpoint refuses ${ROOT} names`, (await ask(`anything.${ROOT}`)).status === 404);
  check(
    'the ask endpoint refuses requests forwarded from the internet',
    (await ask(GOOD, { 'X-Forwarded-For': '203.0.113.9' })).status === 404
  );
  check('a connected domain shows the site', (await api({ host: GOOD, path: '/api/site' })).status === 200);
  check('its www version shows the site too', (await api({ host: `www.${GOOD}`, path: '/api/site' })).status === 200);

  await save(siteB, BAD);
  const failed = await verify(siteB);
  check(
    'a wrong CNAME fails with a clear message',
    failed.json?.domainStatus === 'failed' && failed.json.domainMessage.includes('somewhere-else.example')
  );
  check('a failed domain gets no certificate', (await ask(BAD)).status === 404);

  // Root domain by A record, when a server IP is configured.
  if (process.env.SERVER_IP) {
    FAKE_DNS.resolve4[ROOT_ONLY] = [process.env.SERVER_IP];
    await save(siteB, ROOT_ONLY);
    check('an A record to the server IP connects', (await verify(siteB)).json?.domainStatus === 'connected');
  } else {
    console.log('SKIP: A record check (SERVER_IP is not set in .env)');
  }

  // Changing and removing
  const changed = await save(siteA, 'bullas-test-other.com');
  check(
    'changing the domain makes it pending again',
    changed.status === 200 &&
    (await asAdmin({ path: domainOf(siteA) })).json?.domainStatus === 'pending'
  );
  check('the old domain stops working at once', (await api({ host: GOOD, path: '/api/site' })).status === 404);
  const removed = await asAdmin({ method: 'DELETE', path: domainOf(siteA) });
  check('a domain can be removed', removed.json?.customDomain === '' && removed.json?.domainStatus === 'none');
  check('after removal the subdomain still works', (await api({ host: `${siteA.subdomain}.${ROOT}`, path: '/api/site' })).status === 200);
  check('verifying with no domain gets 400', (await verify(siteA)).status === 400);
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
