import { createHash } from 'node:crypto';
import BlogPost from '../../models/BlogPost.js';
import Site from '../../models/Site.js';
import Translation from '../../models/Translation.js';
import TranslationUsage from '../../models/TranslationUsage.js';
import { cleanBody } from '../utils/blogRules.js';
import { DEFAULT_LANGUAGE, SITE_LANGUAGES } from '../utils/languages.js';
import { googleTranslate, hasTranslateKey } from './googleTranslate.js';

// Below Google's 500,000 free characters: their count and ours can differ slightly, and their
// month can start a few hours away from ours. Stopping early is what keeps this free.
const DEFAULT_MONTHLY_LIMIT = 450000;
// Google's limits for one request are higher; these keep each request comfortably inside them.
const MAX_STRINGS = 100;
const MAX_CHARACTERS = 20000;
// Phones and addresses mean the same in every language.
const NEVER_TRANSLATE = new Set(['phone', 'email', 'href']);
// Sent alone, a name is treated as an ordinary word ("Mani" became "I" in Tamil), so these go
// inside a sentence that says it's a name. The footer's text is the site's name, so it's one too.
// Sample placeholders like "Sarpanch's name" are ordinary text, and translated as such.
const NAME_FIELDS = new Set(['name', 'englishName', 'leftLeaderName', 'rightLeaderName', 'centralLeaderName', 'stateLeaderName', 'text']);
// Tried in order, because Google sometimes leaves a name unchanged in one shape but not another.
// The first adds no grammar around the name, so it comes out clean. "Mr." is last because it can
// turn a name into a word ("Mani" became the Hindi for "wealth"), so it only gets what's left.
const NAME_SENTENCES = [
  (name) => `Name: <b>${name}</b>`,
  (name) => `Ravi and <b>${name}</b> and Kumar`,
  (name) => `His name is <b>${name}</b>.`,
  (name) => `I met <b>${name}</b> yesterday.`,
  (name) => `Mr. <b>${name}</b>`,
];
// Hindi puts small words after a name, and they can land inside the bold: "धीरज है" is "is Dheeraj".
const HINDI_TRAILING_WORD = /\s+(है|हैं|से|का|की|के|को|ने|था|थे)$/u;
// How to tell a name is already written in a language's script, and needs no change.
const SCRIPTS = {
  te: /[\u0C00-\u0C7F]/,
  ta: /[\u0B80-\u0BFF]/,
  hi: /[\u0900-\u097F]/,
  ml: /[\u0D00-\u0D7F]/,
  or: /[\u0B00-\u0B7F]/,
  en: /[A-Za-z]/,
};
const inScript = (text, language) => SCRIPTS[language]?.test(text) ?? false;
// Sample words a translator gets wrong without context: "Home" came back as "house",
// and the announcements heading as "advertisements". These are saved instead of being sent.
const SAMPLE_WORDING = {
  'హోమ్': { en: 'Home', ta: 'முகப்பு', or: 'ମୁଖ୍ୟ ପୃଷ୍ଠା', hi: 'होम', ml: 'ഹോം' },
  'ప్రకటనలు': { en: 'Announcements', ta: 'அறிவிப்புகள்', or: 'ଘୋଷଣା', hi: 'घोषणाएँ', ml: 'അറിയിപ്പുകൾ' },
};
const SWEEP_EVERY = 6 * 60 * 60 * 1000;

let provider = googleTranslate;
// For tests, which must never call Google.
export const setTranslationProvider = (next) => {
  provider = next;
};

// Tests set these, so their made-up translations and counts can never reach a real site.
const sharedScope = () => process.env.TRANSLATION_SHARED_SCOPE ?? 'shared';
const usageMonth = () => `${process.env.TRANSLATION_USAGE_PREFIX ?? ''}${new Date().toISOString().slice(0, 7)}`;
const monthlyLimit = () => Number(process.env.TRANSLATE_MONTHLY_LIMIT) || DEFAULT_MONTHLY_LIMIT;

const fingerprint = (format, text) => createHash('sha256').update(`${format}\0${text}`).digest('hex');
// Text with no letters, like "2026" or "98490", has nothing to translate.
const worthTranslating = (text) => typeof text === 'string' && /\p{L}/u.test(text);

// Calls visit(text, write, isName, key) for every piece of translatable text in a site's content.
function walkContent(content, visit) {
  for (const section of content?.sections ?? []) {
    for (const [key, field] of Object.entries(section.fields ?? {})) {
      if (NEVER_TRANSLATE.has(key)) continue;
      if (field?.type === 'text' || field?.type === 'textarea') {
        if (worthTranslating(field.value)) visit(field.value, (text) => (field.value = text), NAME_FIELDS.has(key), key);
      } else if (field?.type === 'list') {
        for (const item of field.value ?? []) {
          for (const [itemKey, type] of Object.entries(field.itemFields ?? {})) {
            if (NEVER_TRANSLATE.has(itemKey) || (type !== 'text' && type !== 'textarea')) continue;
            if (worthTranslating(item[itemKey])) visit(item[itemKey], (text) => (item[itemKey] = text), NAME_FIELDS.has(itemKey), itemKey);
          }
        }
      }
    }
  }
}

const POST_TEXT_FIELDS = ['title', 'description'];

// Sends one group of pieces only if it fits this month's limit. The count goes up first,
// in one step, so two translations running together can't both slip past the limit.
async function reserveCharacters(count) {
  const month = usageMonth();
  // In a new month there's no record yet, so the check below alone would let this through.
  if (count > monthlyLimit()) return false;
  try {
    const usage = await TranslationUsage.findOneAndUpdate(
      { month, characters: { $lte: monthlyLimit() - count } },
      { $inc: { characters: count } },
      { upsert: true, returnDocument: 'after' }
    );
    return Boolean(usage);
  } catch (err) {
    // The month's record exists but is too full to match, so the insert clashes: limit reached.
    if (err.code === 11000) return false;
    throw err;
  }
}

const releaseCharacters = (count) =>
  TranslationUsage.updateOne({ month: usageMonth() }, { $inc: { characters: -count } });

// A blog body can be longer than one request allows, so it's cut between paragraphs.
function splitLongText(text) {
  if (text.length <= MAX_CHARACTERS) return [text];
  const pieces = [];
  let current = '';
  for (const block of text.split(/(?<=<\/(?:p|h2|h3|ul|ol|blockquote)>)/)) {
    for (let rest = block; rest; rest = rest.slice(MAX_CHARACTERS)) {
      const part = rest.slice(0, MAX_CHARACTERS);
      if (current.length + part.length > MAX_CHARACTERS) {
        pieces.push(current);
        current = '';
      }
      current += part;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

// Groups text into requests small enough to send, remembering which piece belongs to which text.
function buildRequests(items) {
  const requests = [];
  let request = { parts: [], characters: 0 };
  items.forEach((item, itemIndex) => {
    splitLongText(item.text).forEach((part) => {
      if (request.parts.length >= MAX_STRINGS || request.characters + part.length > MAX_CHARACTERS) {
        requests.push(request);
        request = { parts: [], characters: 0 };
      }
      request.parts.push({ itemIndex, text: part });
      request.characters += part.length;
    });
  });
  if (request.parts.length) requests.push(request);
  return requests;
}

const titleCase = (name) => name.replace(/(^|\s)(\p{Ll})/gu, (match, space, letter) => space + letter.toUpperCase());
const decodeEntities = (text) =>
  text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// One round of sending names in a sentence. Bold marks the name, so it can be found again in
// the answer. Returns the name in the new script, or null where Google left it unchanged.
async function sendNames(names, language, sentence, report) {
  const strings = names.map((name) => sentence(titleCase(name)));
  const characters = strings.join('').length;
  report.characters += characters;
  if (!(await reserveCharacters(characters))) {
    report.limitReached = true;
    return names.map(() => null);
  }
  let answers;
  try {
    answers = await provider(strings, language, 'html');
  } catch (err) {
    await releaseCharacters(characters);
    throw err;
  }
  return answers.map((answer) => {
    let found = /<b>(.*?)<\/b>/s.exec(answer)?.[1]?.trim();
    // Sentence-ending marks can land inside the bold too: Odia gave "ରେଡ୍ଡୀ |".
    found = found?.replace(/[\s|।.,]+$/u, '');
    if (found && language === 'hi') found = found.replace(HINDI_TRAILING_WORD, '');
    return found && inScript(found, language) ? decodeEntities(found) : null;
  });
}

async function translateNames(items, language, dryRun, report) {
  for (let start = 0; start < items.length; start += MAX_STRINGS) {
    const group = items.slice(start, start + MAX_STRINGS);
    if (dryRun) {
      report.characters += group.map((item) => NAME_SENTENCES[0](item.text)).join('').length;
      continue;
    }
    const results = group.map(() => null);
    for (const sentence of NAME_SENTENCES) {
      const waiting = group.flatMap((item, index) => (results[index] ? [] : [{ item, index }]));
      if (!waiting.length) break;
      const answers = await sendNames(waiting.map(({ item }) => item.text), language, sentence, report);
      if (report.limitReached) return;
      waiting.forEach(({ index }, position) => {
        results[index] = answers[position];
      });
    }
    await Promise.all(
      group.map((item, index) =>
        // A name Google can't convert is saved as written, so it isn't sent again and again.
        Translation.updateOne(
          { scope: item.scope, language, hash: item.hash },
          { $set: { text: results[index] ?? item.text } },
          { upsert: true }
        )
      )
    );
    report.pieces += group.length;
  }
}

async function translateItems(items, language, format, dryRun, report) {
  const requests = buildRequests(items);
  const results = items.map(() => []);

  for (const request of requests) {
    report.characters += request.characters;
    if (dryRun) continue;

    if (!(await reserveCharacters(request.characters))) {
      report.limitReached = true;
      return;
    }
    let translated;
    try {
      translated = await provider(request.parts.map((part) => part.text), language, format);
    } catch (err) {
      await releaseCharacters(request.characters);
      throw err;
    }
    request.parts.forEach((part, index) => results[part.itemIndex].push(translated[index]));
  }
  if (dryRun) return;

  await Promise.all(
    items.map((item, index) => {
      const joined = results[index].join('');
      // Blog bodies are shown as real HTML, and this came from outside: clean it like an owner's.
      const text = format === 'html' ? cleanBody(joined) : joined;
      return Translation.updateOne(
        { scope: item.scope, language, hash: item.hash },
        { $set: { text } },
        { upsert: true }
      );
    })
  );
  report.pieces += items.length;
}

// Translates whatever on this published site isn't translated yet, and only that.
// Returns what happened: { characters, pieces, limitReached }. dryRun only counts.
export async function translateSite(siteId, { dryRun = false } = {}) {
  const report = { characters: 0, pieces: 0, limitReached: false };
  const site = await Site.findById(siteId).populate('templateId');
  if (!site || site.status !== 'published') return report;

  const siteScope = site._id.toString();
  const sampleText = new Set();
  walkContent(site.templateId?.defaultContent, (text) => sampleText.add(text));

  const wanted = new Map();
  const want = (format, text, scope) => wanted.set(`${format}\0${scope}\0${text}`, { format, text, scope });

  const realNames = new Set();
  walkContent(site.content, (text, _write, isName, key) => {
    const isSample = sampleText.has(text);
    // The browser recognises the footer's sample title, to show the village name instead.
    if (key === 'text' && isSample) return;
    if (isName && !isSample) realNames.add(text);
    else want('text', text, isSample ? sharedScope() : siteScope);
  });
  // Published only: drafts stay private until the owner chooses to publish them.
  const posts = await BlogPost.find({ siteId: site._id, status: 'published' }).select('title description body').lean();
  for (const post of posts) {
    for (const key of POST_TEXT_FIELDS) if (worthTranslating(post[key])) want('text', post[key], siteScope);
    if (worthTranslating(post.body)) want('html', post.body, siteScope);
  }

  const source = site.language ?? DEFAULT_LANGUAGE;
  const everything = [...wanted.values()].map((item) => ({ ...item, hash: fingerprint(item.format, item.text) }));
  for (const language of SITE_LANGUAGES) {
    // The owner's own words need no translation into the language they wrote them in, but
    // untouched sample headings do, so a site written in English doesn't show Telugu ones.
    const nameItems = [...realNames]
      .filter((name) => !inScript(name, language))
      .map((text) => ({ format: 'name', text, scope: siteScope, hash: fingerprint('name', text) }));
    let items = language === source ? everything.filter((item) => item.scope === sharedScope()) : everything;
    // The sample text is already in Telugu, so sending it to Telugu would only waste the allowance.
    if (language === DEFAULT_LANGUAGE) items = items.filter((item) => item.scope !== sharedScope());
    items = [...items, ...nameItems];
    const saved = await Translation.find({
      language,
      hash: { $in: items.map((item) => item.hash) },
      scope: { $in: [siteScope, sharedScope()] },
    })
      .select('scope hash')
      .lean();
    const known = new Set(saved.map((row) => `${row.scope}\0${row.hash}`));
    const stillMissing = items.filter((item) => !known.has(`${item.scope}\0${item.hash}`));
    const fixed = stillMissing.filter((item) => item.scope === sharedScope() && SAMPLE_WORDING[item.text]?.[language]);
    const missing = stillMissing.filter((item) => !fixed.includes(item));

    if (!dryRun) {
      await Promise.all(
        fixed.map((item) =>
          Translation.updateOne(
            { scope: item.scope, language, hash: item.hash },
            { $set: { text: SAMPLE_WORDING[item.text][language] } },
            { upsert: true }
          )
        )
      );
    }

    for (const format of ['text', 'html']) {
      const group = missing.filter((item) => item.format === format);
      if (group.length) await translateItems(group, language, format, dryRun, report);
      if (report.limitReached) return report;
    }
    const names = missing.filter((item) => item.format === 'name');
    if (names.length) await translateNames(names, language, dryRun, report);
    if (report.limitReached) return report;
  }
  return report;
}

// ---------- Reading: only ever looks in the database, so it can't cost anything ----------

async function loadTranslations(siteId, language, keys) {
  const hashes = keys.map(([format, text]) => fingerprint(format, text));
  const rows = await Translation.find({
    language,
    hash: { $in: hashes },
    scope: { $in: [siteId.toString(), sharedScope()] },
  })
    .select('scope hash text')
    .lean();
  const shared = rows.filter((row) => row.scope === sharedScope());
  return {
    all: new Map(rows.map((row) => [row.hash, row.text])),
    shared: new Map(shared.map((row) => [row.hash, row.text])),
  };
}

// A copy of the content in the chosen language. Anything not translated yet stays as written.
// In the language the site is written in, the owner's own words stay; only untouched sample text
// and names written in another script change.
export async function translatedContent(site, language) {
  const isSource = language === (site.language ?? DEFAULT_LANGUAGE);
  const content = structuredClone(site.content);
  const keys = [];
  walkContent(content, (text, _write, isName) => {
    keys.push(['text', text]);
    if (isName) keys.push(['name', text]);
  });
  const found = await loadTranslations(site._id, language, keys);
  walkContent(content, (text, write, isName, key) => {
    let translation;
    if (isName) {
      // A name written in this script already is right as it is.
      if (inScript(text, language)) return;
      translation = found.all.get(fingerprint('name', text));
      // The footer's sample title must stay as it is, for the browser to recognise it.
      if (!translation && key !== 'text') translation = found.shared.get(fingerprint('text', text));
    } else {
      translation = (isSource ? found.shared : found.all).get(fingerprint('text', text));
    }
    if (translation) write(translation);
  });
  return content;
}

// Copies of blog posts in another language, as plain objects.
export async function translatedPosts(site, posts, language) {
  const plain = posts.map((post) => (post.toObject ? post.toObject() : { ...post }));
  const keys = plain.flatMap((post) => [
    ...POST_TEXT_FIELDS.filter((key) => worthTranslating(post[key])).map((key) => ['text', post[key]]),
    ...(worthTranslating(post.body) ? [['html', post.body]] : []),
  ]);
  const found = await loadTranslations(site._id, language, keys);
  for (const post of plain) {
    for (const key of POST_TEXT_FIELDS) {
      const translation = found.all.get(fingerprint('text', post[key] ?? ''));
      if (translation) post[key] = translation;
    }
    if (post.body) {
      const translation = found.all.get(fingerprint('html', post.body));
      if (translation) post.body = translation;
    }
  }
  return plain;
}

// ---------- Running in the background on the real server ----------

let enabled = false;
let running = false;
const waiting = new Set();

async function work() {
  if (running) return;
  running = true;
  while (waiting.size) {
    const [siteId] = waiting;
    waiting.delete(siteId);
    try {
      const report = await translateSite(siteId);
      if (report.characters) console.log(`Translated site ${siteId}: ${report.characters} characters`);
      if (report.limitReached) console.log('Monthly translation limit reached; the rest continues next month');
    } catch (err) {
      // A translation problem must never affect the site; the next sweep tries again.
      console.error(`Translation failed for site ${siteId}: ${err.message}`);
    }
  }
  running = false;
}

// Called when an owner saves or publishes. Does nothing in tests, which never enable it.
export function scheduleSiteTranslation(siteId) {
  if (!enabled) return;
  waiting.add(siteId.toString());
  work();
}

// Only the real server calls this. The sweep picks up what a restart or the limit interrupted.
export function startAutoTranslation() {
  if (!hasTranslateKey()) {
    console.log('GOOGLE_TRANSLATE_KEY is not set, so sites show their original language only');
    return;
  }
  enabled = true;
  const sweep = async () => {
    const sites = await Site.find({ status: 'published' }).select('_id').lean();
    sites.forEach((site) => scheduleSiteTranslation(site._id));
  };
  sweep().catch((err) => console.error(`Translation sweep failed: ${err.message}`));
  setInterval(() => sweep().catch((err) => console.error(`Translation sweep failed: ${err.message}`)), SWEEP_EVERY).unref();
}
