import http from 'node:http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/db.js';
import { AUTH_COOKIE, signToken } from '../src/middleware/requireAuth.js';
import BlogPost from '../models/BlogPost.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';
import User from '../models/User.js';

// Names only this script's records, so cleanup can't touch real accounts, sites or posts.
const PREFIX = 'testblog-';
const ROOT = process.env.ROOT_DOMAIN;
const HOST_A = `${PREFIX}a.${ROOT}`;
const HOST_B = `${PREFIX}b.${ROOT}`;

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
  await Promise.all([Site.init(), User.init(), BlogPost.init()]);
  await cleanUp();

  const template = await Template.findOne({ isActive: true });
  if (!template) throw new Error('Template not found. Run scripts/seed.js first');

  const makeSite = (letter, status) =>
    Site.create({
      name: `Blog Test ${letter}`,
      subdomain: `${PREFIX}${letter}`,
      status,
      templateId: template._id,
      content: structuredClone(template.defaultContent),
    });
  const siteA = await makeSite('a', 'published');
  const siteB = await makeSite('b', 'draft');

  const makeUser = (key, siteId) =>
    User.create({
      name: `Test ${key}`,
      email: `${PREFIX}${key}@bullas.test`,
      passwordHash: '!not-a-real-hash',
      role: 'siteowner',
      siteId,
    });
  const tokenA = signToken(await makeUser('a', siteA._id));
  const tokenB = signToken(await makeUser('b', siteB._id));

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const api = (options) => request(port, options);

  const blogA = `/api/sites/${siteA._id}/blog`;
  const blogB = `/api/sites/${siteB._id}/blog`;
  const asA = (options) => api({ host: HOST_A, token: tokenA, ...options });
  const create = (body) => asA({ method: 'POST', path: blogA, body });
  const publish = (id) => asA({ method: 'PATCH', path: `${blogA}/${id}/status`, body: { status: 'published' } });

  // Create, publish and the public view
  const first = await create({ title: 'Gram Sabha Meeting', description: 'Agenda', body: '<p>Hello</p>' });
  const second = await create({ title: 'Clean Village Drive', body: '<p>Join us</p>' });
  const third = await create({ title: 'Draft Idea', body: '<p>Not ready</p>' });
  check('posts are created as drafts', first.status === 201 && first.json?.status === 'draft');
  check('a slug is made from the title', first.json?.slug === 'gram-sabha-meeting');

  await publish(first.json._id);
  await publish(second.json._id);
  const publicList = await api({ path: '/api/site/blog', host: HOST_A });
  const publicSlugs = publicList.json?.posts?.map((post) => post.slug) ?? [];
  check(
    'the public list returns only the 2 published posts',
    publicList.status === 200 &&
      publicList.json.total === 2 &&
      publicSlugs.includes('gram-sabha-meeting') &&
      publicSlugs.includes('clean-village-drive') &&
      !publicSlugs.includes('draft-idea')
  );
  check(
    'the public list leaves out post bodies and IDs',
    publicList.json?.posts?.every((post) => !('body' in post) && !('_id' in post))
  );

  const publicPost = await api({ path: '/api/site/blog/gram-sabha-meeting', host: HOST_A });
  check('a published post can be read by its slug', publicPost.status === 200 && publicPost.json?.body === '<p>Hello</p>');
  check(
    "a draft's slug gets 404 in public",
    (await api({ path: '/api/site/blog/draft-idea', host: HOST_A })).status === 404
  );

  const pageTwo = await api({ path: '/api/site/blog?page=2&limit=1', host: HOST_A });
  check(
    'pages split the posts',
    pageTwo.json?.posts?.length === 1 && pageTwo.json.totalPages === 2 && pageTwo.json.page === 2
  );
  check('a bad page number gets 400', (await api({ path: '/api/site/blog?page=-1', host: HOST_A })).status === 400);
  check('a page size over 20 gets 400', (await api({ path: '/api/site/blog?limit=500', host: HOST_A })).status === 400);
  check(
    "an unpublished site's blog gets 404",
    (await api({ path: '/api/site/blog', host: HOST_B })).status === 404
  );

  const firstPublishedAt = (await BlogPost.findById(first.json._id)).publishedAt.getTime();
  await asA({ method: 'PATCH', path: `${blogA}/${first.json._id}/status`, body: { status: 'draft' } });
  await publish(first.json._id);
  check(
    'republishing keeps the original publish date',
    (await BlogPost.findById(first.json._id)).publishedAt.getTime() === firstPublishedAt
  );

  // Slugs
  const telugu = await create({ title: 'గ్రామ సభ సమావేశం' });
  check('a Telugu title makes a Telugu slug', telugu.status === 201 && telugu.json?.slug === 'గ్రామ-సభ-సమావేశం');
  check(
    'a Telugu slug works in a public address',
    await publish(telugu.json._id).then(async () =>
      (await api({ path: `/api/site/blog/${encodeURIComponent('గ్రామ-సభ-సమావేశం')}`, host: HOST_A })).status === 200
    )
  );
  const repeat = await create({ title: 'Gram Sabha Meeting' });
  check('the same title twice gets -2', repeat.json?.slug === 'gram-sabha-meeting-2');
  check('a typed slug that is taken gets 409', (await create({ title: 'Other', slug: 'gram-sabha-meeting' })).status === 409);
  check('a slug with spaces gets 400', (await create({ title: 'Other', slug: 'bad slug!' })).status === 400);
  const sameSlugOtherSite = await api({
    method: 'POST',
    path: blogB,
    host: HOST_B,
    token: tokenB,
    body: { title: 'Gram Sabha Meeting' },
  });
  check('another site can use the same slug', sameSlugOtherSite.json?.slug === 'gram-sabha-meeting');

  // Sanitizing
  const dirty = await create({
    title: 'Dirty',
    body:
      '<p onclick="steal()">Hi<script>steal()</script></p><img src=x onerror="steal()">' +
      '<a href="javascript:steal()">bad</a><a href="https://example.com" rel="follow">good</a>' +
      '<p style="background:url(x)">styled</p><div>line</div><iframe src="https://evil.example"></iframe>',
  });
  const cleanBody = dirty.json?.body ?? '';
  check(
    'scripts, event attributes, images and iframes are removed',
    !/script|onclick|onerror|<img|<iframe|steal/i.test(cleanBody)
  );
  check('javascript: links lose their href', !/javascript:/i.test(cleanBody) && cleanBody.includes('<a'));
  check(
    'safe links get our rel and target',
    cleanBody.includes('href="https://example.com"') &&
      cleanBody.includes('rel="nofollow ugc noopener noreferrer"') &&
      cleanBody.includes('target="_blank"') &&
      !cleanBody.includes('rel="follow"')
  );
  check('style attributes are removed and divs become paragraphs', !/style=/.test(cleanBody) && cleanBody.includes('<p>line</p>'));

  // Validation
  check('a missing title gets 400', (await create({ body: '<p>x</p>' })).status === 400);
  check('a title over 200 characters gets 400', (await create({ title: 'x'.repeat(201) })).status === 400);
  check('an outside image gets 400', (await create({ title: 'x', image: 'https://evil.example/a.png' })).status === 400);
  const sneaky = await create({ title: 'Sneaky', status: 'published', siteId: siteB._id.toString() });
  check(
    'status and siteId in the request are ignored',
    sneaky.json?.status === 'draft' && sneaky.json?.siteId === siteA._id.toString()
  );
  check('a bad status gets 400', (await asA({ method: 'PATCH', path: `${blogA}/${third.json._id}/status`, body: { status: 'live' } })).status === 400);
  check('creating without JSON gets 415', (await asA({ method: 'POST', path: blogA })).status === 415);

  // Permissions
  const bPost = sameSlugOtherSite.json._id;
  check("an owner listing another site's posts gets 403", (await asA({ path: blogB })).status === 403);
  check("an owner creating on another site gets 403", (await asA({ method: 'POST', path: blogB, body: { title: 'x' } })).status === 403);
  check("an owner editing another site's post gets 403", (await asA({ method: 'PUT', path: `${blogB}/${bPost}`, body: { title: 'x' } })).status === 403);
  check("an owner publishing another site's post gets 403", (await asA({ method: 'PATCH', path: `${blogB}/${bPost}/status`, body: { status: 'published' } })).status === 403);
  check("an owner deleting another site's post gets 403", (await asA({ method: 'DELETE', path: `${blogB}/${bPost}` })).status === 403);
  check(
    "another site's post ID through your own site gets 404",
    (await asA({ path: `${blogA}/${bPost}` })).status === 404 &&
      (await asA({ method: 'DELETE', path: `${blogA}/${bPost}` })).status === 404 &&
      (await BlogPost.exists({ _id: bPost })) !== null
  );
  check('no token gets 401', (await api({ path: blogA, host: HOST_A })).status === 401);

  // Update and delete
  const edited = await asA({
    method: 'PUT',
    path: `${blogA}/${third.json._id}`,
    body: { title: 'Edited', slug: 'edited-slug', body: '<p>New<script>x</script></p>' },
  });
  check(
    'an edit saves and is sanitized',
    edited.status === 200 && edited.json?.title === 'Edited' && edited.json?.slug === 'edited-slug' && edited.json?.body === '<p>New</p>'
  );
  check(
    'editing to a taken slug gets 409',
    (await asA({ method: 'PUT', path: `${blogA}/${third.json._id}`, body: { slug: 'clean-village-drive' } })).status === 409
  );
  const deleted = await asA({ method: 'DELETE', path: `${blogA}/${third.json._id}` });
  check('a post can be deleted', deleted.status === 200 && (await BlogPost.exists({ _id: third.json._id })) === null);

  const adminList = await asA({ path: `${blogA}?status=draft` });
  check('the admin list can filter drafts', adminList.json?.posts?.every((post) => post.status === 'draft'));
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
