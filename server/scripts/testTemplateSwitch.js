import http from 'node:http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/db.js';
import { AUTH_COOKIE, signToken } from '../src/middleware/requireAuth.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';
import User from '../models/User.js';

// Names only this script's records, so cleanup can't touch real accounts or sites.
const PREFIX = 'testswitch-';
const ROOT = process.env.ROOT_DOMAIN;
const ADMIN_HOST = `admin.${ROOT}`;
const HOST_A = `${PREFIX}a.${ROOT}`;

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
function request(port, { method = 'GET', path, host, token, body }) {
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
          // Some error responses aren't JSON; the status code is still checked.
        }
        resolve({ status: res.statusCode, json, text });
      });
    });
    req.on('error', reject);
    req.end(payload);
  });
}

const findSection = (content, key) => content.sections.find((section) => section.key === key);
const valueOf = (content, sectionKey, fieldKey) => findSection(content, sectionKey)?.fields?.[fieldKey]?.value;

let server;
try {
  await connectDB();
  await Promise.all([Site.init(), User.init()]);
  await cleanUp();

  const panchayat = await Template.findOne({ slug: 'panchayat-classic' });
  if (!findSection(panchayat?.defaultContent ?? { sections: [] }, 'topBar')) {
    throw new Error('Run scripts/migrateToVillagePortal.js --apply first, so templates have the shared sections');
  }
  const heritage = await Template.findOne({ slug: 'portfolio-light' });

  const makeSite = (letter) =>
    Site.create({
      name: `Switch Test ${letter}`,
      subdomain: `${PREFIX}${letter}`,
      templateId: panchayat._id,
      content: structuredClone(panchayat.defaultContent),
      status: 'published',
    });
  const siteA = await makeSite('a');
  const siteB = await makeSite('b');

  const makeUser = (key, role, siteId) =>
    User.create({
      name: `Test ${key}`,
      email: `${PREFIX}${key}@bullas.test`,
      passwordHash: '!not-a-real-hash',
      role,
      siteId,
    });
  const tokenA = signToken(await makeUser('a', 'siteowner', siteA._id));
  const tokenAdmin = signToken(await makeUser('admin', 'superadmin'));
  const tokenBuilder = signToken(await makeUser('builder', 'builder'));

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const api = (options) => request(port, options);

  const switchTo = (templateSlug, { site = siteA, host = HOST_A, token = tokenA, dryRun } = {}) =>
    api({ method: 'PUT', path: `/api/sites/${site._id}/template`, host, token, body: { templateSlug, dryRun } });
  const readContent = async () =>
    (await api({ path: `/api/sites/${siteA._id}/content`, host: HOST_A, token: tokenA })).json;
  const saveContent = (content) =>
    api({ method: 'PUT', path: `/api/sites/${siteA._id}/content`, host: HOST_A, token: tokenA, body: { content } });

  // The owner fills in their Panchayat Classic site.
  const filled = structuredClone(panchayat.defaultContent);
  findSection(filled, 'village').fields.name.value = 'Mani Village';
  findSection(filled, 'branding').fields.brandColor.value = '#123456';
  findSection(filled, 'members').fields.people.value = [{ role: 'Sarpanch', name: 'Ravi', phone: '9999999999', photo: '' }];
  findSection(filled, 'events').fields.items.value = [
    { title: 'Gram Sabha', date: '5 June', time: '10 AM', place: 'Office', image: '' },
  ];
  findSection(filled, 'announcements').fields.items.value = [
    { category: 'wedding', title: 'Ramu weds Sita', details: 'Best wishes', date: '', phone: '', image: '' },
  ];
  check('the owner saves their content', (await saveContent(filled)).status === 200);

  // Permissions and bad requests
  check('no login gets 401', (await switchTo('portfolio-light', { token: null })).status === 401);
  check(
    "an owner switching another site's template gets 403",
    (await switchTo('portfolio-light', { site: siteB })).status === 403
  );
  check(
    'a builder not assigned to the site gets 403',
    (await switchTo('portfolio-light', { host: ADMIN_HOST, token: tokenBuilder, dryRun: true })).status === 403
  );
  check('a missing template name gets 400', (await switchTo('')).status === 400);
  check('an unknown template gets 404', (await switchTo('no-such-template')).status === 404);
  check('the current template gets 409', (await switchTo('panchayat-classic')).status === 409);
  check(
    'a request without JSON is refused',
    (await api({ method: 'PUT', path: `/api/sites/${siteA._id}/template`, host: HOST_A, token: tokenA })).status === 415
  );

  const list = await api({ path: `/api/sites/${siteA._id}/templates`, host: HOST_A, token: tokenA });
  check('an owner can list templates', list.status === 200 && list.json.templates.length >= 4);
  check('the list marks the current template', list.json?.current === 'panchayat-classic');
  check(
    "an owner can't list templates through another site",
    (await api({ path: `/api/sites/${siteB._id}/templates`, host: HOST_A, token: tokenA })).status === 403
  );

  // Dry run: a preview only
  const preview = await switchTo('portfolio-light', { dryRun: true });
  check('a dry run returns a preview', preview.status === 200 && preview.json.saved === false);
  check('the preview carries the members', valueOf(preview.json.content, 'members', 'people')?.[0]?.name === 'Ravi');
  const afterPreview = await Site.findById(siteA._id).populate('templateId');
  check('a dry run changes nothing', afterPreview.templateId.slug === 'panchayat-classic');
  check(
    'a super admin can preview any site',
    (await switchTo('portfolio-light', { host: ADMIN_HOST, token: tokenAdmin, dryRun: true })).status === 200
  );

  // Panchayat Classic -> Heritage: same sections, so everything moves.
  const toHeritage = await switchTo('portfolio-light');
  check('the switch succeeds', toHeritage.status === 200 && toHeritage.json.saved === true);
  check('nothing is kept aside', toHeritage.json.keptAside.length === 0);
  let content = await readContent();
  check('the site now uses Heritage', content.templateSlug === 'portfolio-light');
  check('the village name moved', valueOf(content.content, 'village', 'name') === 'Mani Village');
  check('the members moved', valueOf(content.content, 'members', 'people')?.[0]?.name === 'Ravi');
  check('the events moved', valueOf(content.content, 'events', 'items')?.[0]?.time === '10 AM');
  check('the announcement kept its category', valueOf(content.content, 'announcements', 'items')?.[0]?.category === 'wedding');
  check("the owner's own colour is kept", valueOf(content.content, 'branding', 'brandColor') === '#123456');
  check('the editor never receives the archive', !('contentArchive' in content));
  const publicSite = await api({ path: '/api/site', host: HOST_A });
  check('the public site never receives the archive', publicSite.status === 200 && !publicSite.text.includes('contentArchive'));

  // An unchanged colour takes the new template's own colour.
  findSection(content.content, 'branding').fields.brandColor.value = valueOf(heritage.defaultContent, 'branding', 'brandColor');
  check('the owner resets the colour', (await saveContent(content.content)).status === 200);
  const back = await switchTo('panchayat-classic');
  check('switching back succeeds', back.status === 200);
  check(
    "an unchanged colour becomes the new template's colour",
    valueOf(back.json.content, 'branding', 'brandColor') === valueOf(panchayat.defaultContent, 'branding', 'brandColor')
  );
  check('the members are still there', valueOf(back.json.content, 'members', 'people')?.[0]?.name === 'Ravi');

  const unknownId = new mongoose.Types.ObjectId();
  check(
    'a super admin switching an unknown site gets 404',
    (await switchTo('portfolio-light', { site: { _id: unknownId }, host: ADMIN_HOST, token: tokenAdmin })).status === 404
  );
} catch (err) {
  console.error(err);
  failures += 1;
} finally {
  await cleanUp();
  server?.close();
  await mongoose.disconnect();
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll template switch checks passed');
process.exit(failures ? 1 : 0);
