import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/db.js';
import { AUTH_COOKIE, signToken } from '../src/middleware/requireAuth.js';
import { UPLOAD_ROOT } from '../src/services/imageStorage.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';
import User from '../models/User.js';

// Names only this script's records, so cleanup can't touch real accounts or sites.
const PREFIX = 'testcontent-';
const ROOT = process.env.ROOT_DOMAIN;
const ADMIN_HOST = `admin.${ROOT}`;
const HOST_A = `${PREFIX}a.${ROOT}`;
const HOST_B = `${PREFIX}b.${ROOT}`;

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  randomBytes(32),
]);
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), randomBytes(32)]);
const WEBP = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.from([0x24, 0, 0, 0]),
  Buffer.from('WEBP'),
  randomBytes(16),
]);

let failures = 0;
function check(label, passed) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  if (!passed) failures += 1;
}

let createdSiteIds = [];
async function cleanUp() {
  for (const id of createdSiteIds) {
    await rm(path.join(UPLOAD_ROOT, id), { recursive: true, force: true });
  }
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
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        let json = null;
        try {
          json = JSON.parse(buffer.toString());
        } catch {
          // Images and some error responses aren't JSON; the status code is still checked.
        }
        resolve({ status: res.statusCode, json, buffer, headers: res.headers });
      });
    });
    req.on('error', reject);
    req.end(payload);
  });
}

function multipart(file, fileName, contentType) {
  const boundary = `----bullas${randomBytes(8).toString('hex')}`;
  return {
    raw: Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${fileName}"\r\n` +
          `Content-Type: ${contentType}\r\n\r\n`
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
  await Promise.all([Site.init(), User.init()]);
  await cleanUp();

  const template = await Template.findOne({ slug: 'panchayat-classic' });
  if (!template) throw new Error('Template not found. Run scripts/seed.js first');

  const makeSite = (letter) =>
    Site.create({
      name: `Content Test ${letter}`,
      subdomain: `${PREFIX}${letter}`,
      templateId: template._id,
      content: structuredClone(template.defaultContent),
    });
  const siteA = await makeSite('a');
  const siteB = await makeSite('b');
  createdSiteIds = [siteA._id.toString(), siteB._id.toString()];

  const makeUser = (key, role, siteId, extra = {}) =>
    User.create({
      name: `Test ${key}`,
      email: `${PREFIX}${key}@bullas.test`,
      passwordHash: '!not-a-real-hash',
      role,
      siteId,
      ...extra,
    });
  const ownerA = await makeUser('a', 'siteowner', siteA._id);
  const ownerTemp = await makeUser('temp', 'siteowner', siteA._id, { mustChangePassword: true });
  const admin = await makeUser('admin', 'superadmin');
  const tokenA = signToken(ownerA);
  const tokenTemp = signToken(ownerTemp);
  const tokenAdmin = signToken(admin);

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const api = (options) => request(port, options);

  const contentPath = (site) => `/api/sites/${site._id}/content`;
  const uploadPath = (site) => `/api/sites/${site._id}/upload`;
  const upload = (site, token, host, file, fileName = 'photo.png', type = 'image/png', extra = {}) => {
    const { raw, contentType } = multipart(file, fileName, type);
    return api({
      method: 'POST',
      path: uploadPath(site),
      host,
      token,
      raw,
      headers: { 'Content-Type': contentType, 'x-bullas-upload': '1', ...extra },
    });
  };
  const contentWith = (change) => {
    const content = structuredClone(template.defaultContent);
    change(content);
    return { content };
  };
  const section = (content, key) => content.sections.find((item) => item.key === key);
  const save = (change) =>
    api({
      method: 'PUT',
      path: contentPath(siteA),
      host: HOST_A,
      token: tokenA,
      body: contentWith(change),
    });

  // Permissions
  check(
    'an owner can read their own content',
    (await api({ path: contentPath(siteA), host: HOST_A, token: tokenA })).status === 200
  );
  check(
    'no token gets 401',
    (await api({ path: contentPath(siteA), host: HOST_A })).status === 401
  );
  check(
    "an owner reading another site's ID gets 403",
    (await api({ path: contentPath(siteB), host: HOST_A, token: tokenA })).status === 403
  );
  check(
    "an owner saving to another site's ID gets 403",
    (await api({ method: 'PUT', path: contentPath(siteB), host: HOST_A, token: tokenA, body: { content: {} } })).status === 403
  );
  check(
    'an owner uploading to another site gets 403',
    (await upload(siteB, tokenA, HOST_A, PNG)).status === 403
  );
  check(
    "an owner's token on another site's address gets 403",
    (await api({ path: contentPath(siteB), host: HOST_B, token: tokenA })).status === 403
  );
  check(
    'a temporary password gets 403',
    (await api({ path: contentPath(siteA), host: HOST_A, token: tokenTemp })).status === 403
  );
  check(
    'a super admin can read any site from the admin address',
    (await api({ path: contentPath(siteB), host: ADMIN_HOST, token: tokenAdmin })).status === 200
  );
  check(
    'an invalid site ID gets 400',
    (await api({ path: '/api/sites/not-an-id/content', host: ADMIN_HOST, token: tokenAdmin })).status === 400
  );
  const unknownId = new mongoose.Types.ObjectId();
  check(
    'a super admin asking for an unknown site gets 404',
    (await api({ path: `/api/sites/${unknownId}/content`, host: ADMIN_HOST, token: tokenAdmin })).status === 404
  );
  check(
    'an owner asking for an unknown site gets 403, revealing nothing',
    (await api({ path: `/api/sites/${unknownId}/content`, host: HOST_A, token: tokenA })).status === 403
  );
  check(
    'saving without JSON gets 415',
    (await api({ method: 'PUT', path: contentPath(siteA), host: HOST_A, token: tokenA, raw: 'x' })).status === 415
  );

  // Saving content
  const saved = await save((content) => {
    section(content, 'village').fields.name.value = 'కొత్త గ్రామం';
  });
  const reread = await Site.findById(siteA._id);
  check(
    'a text edit is saved',
    saved.status === 200 && section(reread.content, 'village').fields.name.value === 'కొత్త గ్రామం'
  );
  check(
    "saving one site doesn't change another",
    section((await Site.findById(siteB._id)).content, 'village').fields.name.value !== 'కొత్త గ్రామం'
  );

  await save((content) => {
    section(content, 'village').fields.name.label = 'Hacked label';
    section(content, 'village').fields.injected = { type: 'text', label: 'x', value: 'x' };
    section(content, 'members').fields.people.value[0].isAdmin = true;
    content.sections.push({ key: 'injected', label: 'x', fields: {} });
  });
  const afterTamper = (await Site.findById(siteA._id)).content;
  check(
    'changed labels and extra fields are dropped',
    section(afterTamper, 'village').fields.name.label !== 'Hacked label' &&
      !section(afterTamper, 'village').fields.injected &&
      !('isAdmin' in section(afterTamper, 'members').fields.people.value[0]) &&
      !section(afterTamper, 'injected')
  );

  check(
    'an outside image URL gets 400',
    (await save((c) => { section(c, 'branding').fields.logo.value = 'https://evil.example/x.png'; })).status === 400
  );
  check(
    "another site's image path gets 400",
    (await save((c) => {
      section(c, 'branding').fields.logo.value = `/uploads/${siteB._id}/${'a'.repeat(32)}.png`;
    })).status === 400
  );
  check(
    'a path escaping the uploads folder gets 400',
    (await save((c) => { section(c, 'branding').fields.logo.value = `/uploads/${siteA._id}/../../secret.png`; })).status === 400
  );
  check(
    'a javascript: link gets 400',
    (await save((c) => { section(c, 'menu').fields.items.value[0].href = 'javascript:alert(1)'; })).status === 400
  );
  check(
    'a bad colour gets 400',
    (await save((c) => { section(c, 'branding').fields.brandColor.value = 'red;background:url(x)'; })).status === 400
  );
  check(
    'an object instead of text gets 400',
    (await save((c) => { section(c, 'village').fields.name.value = { $ne: null }; })).status === 400
  );
  check(
    'text that is too long gets 400',
    (await save((c) => { section(c, 'village').fields.name.value = 'x'.repeat(301); })).status === 400
  );
  check(
    'a list that is too long gets 400',
    (await save((c) => {
      section(c, 'members').fields.people.value = Array(51).fill({ role: 'x', name: 'x', phone: '', photo: '' });
    })).status === 400
  );

  // Uploads
  const png = await upload(siteA, tokenA, HOST_A, PNG);
  check('a PNG upload succeeds', png.status === 201 && /\.png$/.test(png.json?.url));
  check('a JPG upload succeeds', /\.jpg$/.test((await upload(siteA, tokenA, HOST_A, JPG, 'a.jpg', 'image/jpeg')).json?.url));
  check('a WebP upload succeeds', /\.webp$/.test((await upload(siteA, tokenA, HOST_A, WEBP, 'a.webp', 'image/webp')).json?.url));

  const served = await api({ path: png.json.url, host: HOST_A });
  check(
    'an uploaded image is served with protective headers',
    served.status === 200 &&
      served.buffer.equals(PNG) &&
      served.headers['content-type'] === 'image/png' &&
      served.headers['x-content-type-options'] === 'nosniff'
  );

  const withImage = await save((c) => { section(c, 'branding').fields.logo.value = png.json.url; });
  check("a site can use its own uploaded image", withImage.status === 200);

  check(
    'a file over 2 MB gets 413',
    (await upload(siteA, tokenA, HOST_A, Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)]))).status === 413
  );
  check(
    'an SVG gets 415',
    (await upload(siteA, tokenA, HOST_A, Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>'), 'a.svg', 'image/svg+xml')).status === 415
  );
  check(
    'text pretending to be a JPG gets 415',
    (await upload(siteA, tokenA, HOST_A, Buffer.from('<script>alert(1)</script>'), 'photo.jpg', 'image/jpeg')).status === 415
  );
  const traversal = await upload(siteA, tokenA, HOST_A, PNG, '../../../evil.png');
  check(
    "a dangerous file name can't choose the location",
    traversal.status === 201 && new RegExp(`^/uploads/${siteA._id}/[a-f0-9]{32}\\.png$`).test(traversal.json?.url)
  );
  const noHeader = await upload(siteA, tokenA, HOST_A, PNG, 'a.png', 'image/png', { 'x-bullas-upload': '' });
  check('an upload without the custom header gets 403', noHeader.status === 403);
  const noFile = await api({
    method: 'POST',
    path: uploadPath(siteA),
    host: HOST_A,
    token: tokenA,
    headers: { 'x-bullas-upload': '1' },
  });
  check('an upload with no file gets 400', noFile.status === 400);
  check(
    "files outside uploads can't be read",
    (await api({ path: '/uploads/../package.json', host: HOST_A })).status === 404 &&
      (await api({ path: '/uploads/..%2f..%2fpackage.json', host: HOST_A })).status === 404
  );

  const folderA = path.join(UPLOAD_ROOT, siteA._id.toString());
  const before = (await readdir(folderA)).length;
  for (let i = before; i < 200; i += 1) {
    await writeFile(path.join(folderA, `filler-${i}`), '');
  }
  check(
    'the 200-image limit gets 409',
    (await upload(siteA, tokenA, HOST_A, PNG)).status === 409
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
