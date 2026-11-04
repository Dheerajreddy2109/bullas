import http from 'node:http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/db.js';
import { AUTH_COOKIE, signToken } from '../src/middleware/requireAuth.js';
import { setTranslationProvider, translateSite } from '../src/services/translationService.js';
import BlogPost from '../models/BlogPost.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';
import Translation from '../models/Translation.js';
import TranslationUsage from '../models/TranslationUsage.js';
import User from '../models/User.js';

// Names only this script's records, so cleanup can't touch real accounts, sites or translations.
const PREFIX = 'testtranslate-';
process.env.TRANSLATION_SHARED_SCOPE = `${PREFIX}shared`;
process.env.TRANSLATION_USAGE_PREFIX = PREFIX;
process.env.TRANSLATE_MONTHLY_LIMIT = '10000000';

const ROOT = process.env.ROOT_DOMAIN;
const HOST_A = `${PREFIX}a.${ROOT}`;
const HOST_B = `${PREFIX}b.${ROOT}`;

let failures = 0;
function check(label, passed) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  if (!passed) failures += 1;
}

const SCRIPT_WORD = { te: 'రవి', ta: 'ரவி', hi: 'रवि', ml: 'രവി', or: 'ରବି', en: 'Ravi' };
// Never reaches Google: it records what it was asked, and marks the text with the language.
let calls = [];
let failNext = false;
let evilHtml = false;
setTranslationProvider(async (strings, language, format) => {
  if (failNext) throw new Error('fake outage');
  calls.push({ strings, language, format });
  return strings.map((text) => {
    // A name in a sentence: Google gives it back in the new script, or unchanged for "Stubborn".
    const name = /<b>(.*?)<\/b>/.exec(text)?.[1];
    if (name === 'Danda') return 'x <b>ରବି |</b> y';
    if (name === 'Particle') return text.startsWith('His') ? 'x <b>रवि है</b> y' : `x <b>${name}</b> y`;
    if (name) return `x <b>${name === 'Stubborn' ? name : `${SCRIPT_WORD[language]} ${name}`}</b> y`;
    return evilHtml && format === 'html' ? `${text}<script>alert(1)</script>` : `[${language}] ${text}`;
  });
});
const sentText = () => calls.flatMap((call) => call.strings);

async function cleanUp() {
  const sites = await Site.find({ subdomain: { $regex: `^${PREFIX}` } }).select('_id');
  const ids = sites.map((site) => site._id);
  await BlogPost.deleteMany({ siteId: { $in: ids } });
  await Translation.deleteMany({ scope: { $in: [...ids.map(String), `${PREFIX}shared`] } });
  await TranslationUsage.deleteMany({ month: { $regex: `^${PREFIX}` } });
  await User.deleteMany({ email: { $regex: `^${PREFIX}.*@bullas\\.test$` } });
  await Site.deleteMany({ _id: { $in: ids } });
}

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
const usedThisMonth = async () =>
  (await TranslationUsage.findOne({ month: `${PREFIX}${new Date().toISOString().slice(0, 7)}` }))?.characters ?? 0;

let server;
try {
  await connectDB();
  await Promise.all([Site.init(), User.init(), BlogPost.init(), Translation.init(), TranslationUsage.init()]);
  await cleanUp();

  const template = await Template.findOne({ slug: 'panchayat-classic' });
  const makeContent = (villageName) => {
    const content = structuredClone(template.defaultContent);
    findSection(content, 'village').fields.name.value = `Ramapuram ${villageName}`;
    findSection(content, 'village').fields.tagline.value = villageName;
    findSection(content, 'contact').fields.phone.value = '98490 12345';
    findSection(content, 'contact').fields.email.value = 'office@example.com';
    findSection(content, 'members').fields.people.value = [{ role: 'Sarpanch', name: 'Ravi', phone: '98490 00000', photo: '' }];
    findSection(content, 'menu').fields.items.value = [{ label: 'హోమ్', href: '#top' }, { label: 'Contact us', href: '#contact' }];
    return content;
  };
  const makeSite = (letter, status, language = 'en') =>
    Site.create({
      name: `Translate ${letter}`,
      subdomain: `${PREFIX}${letter}`,
      status,
      language,
      templateId: template._id,
      content: makeContent(`Village ${letter}`),
    });
  const siteA = await makeSite('a', 'published');
  const siteB = await makeSite('b', 'published');
  const hidden = await makeSite('hidden', 'draft');

  await BlogPost.create({ siteId: siteA._id, title: 'Published post', slug: 'pub', description: 'Short summary', body: '<p>Body <a href="https://example.com">link</a></p>', status: 'published', publishedAt: new Date() });
  await BlogPost.create({ siteId: siteA._id, title: 'Secret draft', slug: 'draft', body: '<p>Private words</p>', status: 'draft' });

  const makeOwner = (key, siteId) =>
    User.create({ name: key, email: `${PREFIX}${key}@bullas.test`, passwordHash: '!not-a-real-hash', role: 'siteowner', siteId });
  const tokenA = signToken(await makeOwner('a', siteA._id));

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const api = (options) => request(port, options);

  // Dry run
  const dry = await translateSite(siteA._id, { dryRun: true });
  check('a dry run counts characters', dry.characters > 0);
  check('a dry run sends nothing', calls.length === 0);
  check('a dry run saves nothing', (await Translation.countDocuments({ scope: siteA._id.toString() })) === 0);
  check('a dry run uses none of the limit', (await usedThisMonth()) === 0);

  // Reading before anything is translated
  const before = await api({ path: '/api/site?lang=ta', host: HOST_A });
  check('untranslated content shows as written', findSection(before.json.content, 'village').fields.tagline.value === 'Village a');
  check('a visitor reading a language sends nothing', calls.length === 0);

  // Translating
  const report = await translateSite(siteA._id);
  const languages = [...new Set(calls.map((call) => call.language))].sort();
  check('every language is covered', languages.join() === 'en,hi,ml,or,ta,te');
  check("the owner's own words aren't sent to their own language", !calls.some((call) => call.language === 'en' && call.strings.includes('Village a')));
  const sampleHeading = findSection(template.defaultContent, 'members').fields.title.value;
  check("sample text isn't sent to the language it's already in", !calls.some((call) => call.language === 'te' && call.strings.includes(sampleHeading)));
  check('the count matches the dry run', report.characters === dry.characters);
  check('the limit counts what was sent', (await usedThisMonth()) === report.characters);
  const sent = sentText();
  check('village text is sent', sent.includes('Village a'));
  check('published posts are sent', sent.includes('Published post') && sent.some((text) => text.includes('Body')));
  check('drafts are never sent', !sent.some((text) => /Secret draft|Private words/.test(text)));
  check('names are never sent alone', !sent.includes('Ravi') && !sent.some((text) => text.startsWith('Ramapuram')));
  check('names are sent inside a sentence', sent.includes('Name: <b>Ravi</b>'));
  check('a Latin name is not sent to English', !calls.some((call) => call.language === 'en' && call.strings.includes('Name: <b>Ravi</b>')));
  check('a Latin name is sent to the language the site is not written in', calls.some((call) => call.language === 'te' && call.strings.includes('Name: <b>Ravi</b>')));
  check('phone numbers are never sent', !sent.some((text) => /98490/.test(text)));
  check('email addresses are never sent', !sent.includes('office@example.com'));
  check('menu links are never sent', !sent.includes('#contact') && sent.includes('Contact us'));
  check('blog bodies are sent as HTML', calls.some((call) => call.format === 'html' && call.strings.some((text) => text.includes('Body'))));
  check('other text is sent as plain text', calls.some((call) => call.format === 'text' && call.strings.includes('Village a')));

  // Translating again costs nothing
  calls = [];
  const again = await translateSite(siteA._id);
  check('translating again sends nothing', calls.length === 0 && again.characters === 0);

  // Visitors reading
  const tamil = await api({ path: '/api/site?lang=ta', host: HOST_A });
  check('a visitor gets the chosen language', findSection(tamil.json.content, 'village').fields.tagline.value === '[ta] Village a');
  check('the phone stays as written', findSection(tamil.json.content, 'contact').fields.phone.value === '98490 12345');
  check('list items are translated', findSection(tamil.json.content, 'members').fields.people.value[0].role === '[ta] Sarpanch');
  check('menu labels are translated', findSection(tamil.json.content, 'menu').fields.items.value[1].label === '[ta] Contact us');
  check('menu links stay as written', findSection(tamil.json.content, 'menu').fields.items.value[1].href === '#contact');
  check('the site says which language it was written in', tamil.json.language === 'en' && tamil.json.languages.length === 6);
  const original = await api({ path: '/api/site?lang=en', host: HOST_A });
  check('the written language shows the original', findSection(original.json.content, 'village').fields.tagline.value === 'Village a');
  check('sample headings appear in the language the site is written in', findSection(original.json.content, 'members').fields.title.value.startsWith('[en] '));
  check('sample name placeholders are translated', findSection(tamil.json.content, 'village').fields.leftLeaderName.value.startsWith('[ta] '));
  check('wrong sample wording is corrected', tamil.json.content && (await Translation.exists({ scope: `${PREFIX}shared`, language: 'ta', text: 'முகப்பு' })) !== null);
  check('a name appears in the chosen script', findSection(tamil.json.content, 'members').fields.people.value[0].name === 'ரவி Ravi');
  check('a Latin name stays as written in English', findSection(original.json.content, 'members').fields.people.value[0].name === 'Ravi');
  check('sample footer title stays for the browser to recognise', findSection(makeContent('x'), 'footer').fields.text.value === findSection(tamil.json.content, 'footer').fields.text.value);
  const unknown = await api({ path: '/api/site?lang=xx', host: HOST_A });
  check('an unknown language shows the original', unknown.status === 200 && findSection(unknown.json.content, 'village').fields.tagline.value === 'Village a');
  const list = await api({ path: '/api/site/blog?lang=ta', host: HOST_A });
  check('blog lists are translated', list.json.posts[0].title === '[ta] Published post' && list.json.posts[0].description === '[ta] Short summary');
  const post = await api({ path: '/api/site/blog/pub?lang=ta', host: HOST_A });
  check('a post is translated', post.json.title === '[ta] Published post' && post.json.body.includes('Body'));
  check('a link in a post survives', post.json.body.includes('href="https://example.com"'));
  check('the post address stays the same', post.json.slug === 'pub');
  const draftRead = await api({ path: '/api/site/blog/draft?lang=ta', host: HOST_A });
  check('a draft stays hidden in any language', draftRead.status === 404);
  const hiddenRead = await api({ path: '/api/site?lang=ta', host: `${PREFIX}hidden.${ROOT}` });
  check('an unpublished site stays hidden in any language', hiddenRead.status === 404);
  const contentRead = await api({ path: `/api/sites/${siteA._id}/content`, host: HOST_A, token: tokenA });
  check('the editor always shows the original', findSection(contentRead.json.content, 'village').fields.tagline.value === 'Village a');

  // Names Google can't convert, and names already in the right script
  calls = [];
  const named = await Site.findById(siteB._id);
  findSection(named.content, 'members').fields.people.value = [
    { role: 'Sarpanch', name: 'Stubborn', phone: '', photo: '' },
    { role: 'Sarpanch', name: 'சுரேஷ்', phone: '', photo: '' },
    { role: 'Sarpanch', name: 'Particle', phone: '', photo: '' },
    { role: 'Sarpanch', name: 'Danda', phone: '', photo: '' },
  ];
  named.markModified('content');
  await named.save();
  await translateSite(siteB._id);
  check('a stubborn name gets a second try', sentText().includes('Mr. <b>Stubborn</b>'));
  const namedRead = await api({ path: '/api/site?lang=ta', host: HOST_B });
  check('a name Google can\'t convert stays as written', findSection(namedRead.json.content, 'members').fields.people.value[0].name === 'Stubborn');
  check('a name already in the script stays exactly', findSection(namedRead.json.content, 'members').fields.people.value[1].name === 'சுரேஷ்');
  check('a name in the chosen script is never sent', !calls.some((call) => call.language === 'ta' && call.strings.some((text) => text.includes('சுரேஷ்'))));
  const hindiNamed = await api({ path: '/api/site?lang=hi', host: HOST_B });
  const odiaNamed = await api({ path: '/api/site?lang=or', host: HOST_B });
  check('a stray mark after a name is removed', findSection(odiaNamed.json.content, 'members').fields.people.value[3].name === 'ରବି');
  check('a small word after a Hindi name is removed', findSection(hindiNamed.json.content, 'members').fields.people.value[2].name === 'रवि');
  calls = [];
  await translateSite(siteB._id);
  check('a stubborn name is not sent again', calls.length === 0);

  // A changed sentence
  calls = [];
  const edited = structuredClone(contentRead.json.content);
  findSection(edited, 'village').fields.tagline.value = 'New name';
  check('the owner saves a change', (await api({ method: 'PUT', path: `/api/sites/${siteA._id}/content`, host: HOST_A, token: tokenA, body: { content: edited } })).status === 200);
  check('saving in a test sends nothing by itself', calls.length === 0);
  await translateSite(siteA._id);
  check('only the changed text is sent', sentText().every((text) => text === 'New name') && calls.length === 5);

  // Sites stay separate
  calls = [];
  await translateSite(hidden._id);
  check('an unpublished site is never sent', calls.length === 0);
  await translateSite(siteB._id);
  const bSent = sentText();
  check('sample text is shared, so another site sends less', !bSent.includes('Contact details'));
  check("one site's text doesn't reach another's page", !JSON.stringify((await api({ path: '/api/site?lang=ta', host: HOST_B })).json).includes('New name'));
  const sameWords = await Site.findById(siteB._id);
  findSection(sameWords.content, 'village').fields.tagline.value = 'New name';
  sameWords.markModified('content');
  await sameWords.save();
  check(
    "identical words on another site don't reuse the first site's translation",
    findSection((await api({ path: '/api/site?lang=ta', host: HOST_B })).json.content, 'village').fields.tagline.value === 'New name'
  );

  // Unsafe text from outside
  evilHtml = true;
  await BlogPost.create({ siteId: siteB._id, title: 'Evil', slug: 'evil', body: '<p>Harmless</p>', status: 'published', publishedAt: new Date() });
  await translateSite(siteB._id);
  evilHtml = false;
  const evil = await api({ path: '/api/site/blog/evil?lang=ta', host: HOST_B });
  check('a script in a translation is removed', evil.json.body.includes('Harmless') && !evil.json.body.includes('<script'));

  // Failures and the limit
  const usedBefore = await usedThisMonth();
  await BlogPost.create({ siteId: siteB._id, title: 'Outage post', slug: 'outage', status: 'published', publishedAt: new Date() });
  failNext = true;
  let threw = false;
  try {
    await translateSite(siteB._id);
  } catch {
    threw = true;
  }
  failNext = false;
  check('a failed request is reported', threw);
  check('a failed request gives its characters back', (await usedThisMonth()) === usedBefore);
  check('a failure leaves the site working', (await api({ path: '/api/site?lang=ta', host: HOST_B })).status === 200);

  calls = [];
  process.env.TRANSLATE_MONTHLY_LIMIT = String(usedBefore + 5);
  const limited = await translateSite(siteB._id);
  check('the limit stops translating', limited.limitReached === true && calls.length === 0);
  check('the limit is never passed', (await usedThisMonth()) <= usedBefore + 5);
  check('a site over the limit shows its original words', (await api({ path: '/api/site/blog/outage?lang=ta', host: HOST_B })).json.title === 'Outage post');
  process.env.TRANSLATE_MONTHLY_LIMIT = '10000000';

  const long = `<p>${'word '.repeat(5000)}</p>`.repeat(3);
  await BlogPost.create({ siteId: siteB._id, title: 'Long', slug: 'long', body: long, status: 'published', publishedAt: new Date() });
  calls = [];
  await translateSite(siteB._id);
  check('a long post is split into requests that fit', calls.filter((call) => call.format === 'html').every((call) => call.strings.join('').length <= 20000));

  // Choosing the written language
  const setLanguage = (language, options = {}) =>
    api({ method: 'PUT', path: `/api/sites/${siteA._id}/language`, host: HOST_A, token: tokenA, body: { language }, ...options });
  check('an owner can set the written language', (await setLanguage('ta')).status === 200 && (await Site.findById(siteA._id)).language === 'ta');
  check('an unknown language is refused', (await setLanguage('xx')).status === 400);
  check('setting it needs a login', (await setLanguage('te', { token: null })).status === 401);
  check(
    "an owner can't set another site's language",
    (await api({ method: 'PUT', path: `/api/sites/${siteB._id}/language`, host: HOST_A, token: tokenA, body: { language: 'te' } })).status === 403
  );
} catch (err) {
  console.error(err);
  failures += 1;
} finally {
  await cleanUp();
  server?.close();
  await mongoose.disconnect();
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll translation checks passed');
process.exit(failures ? 1 : 0);
