// One-time move of existing sites onto the shared village-portal sections.
//   node --env-file=.env scripts/migrateToVillagePortal.js          -> dry run: prints, changes nothing
//   node --env-file=.env scripts/migrateToVillagePortal.js --apply  -> updates templates and sites
// Each site's old content is stored in contentArchive.beforeVillagePortal, so nothing is lost.
import mongoose from 'mongoose';
import { connectDB } from '../src/db.js';
import { moveContent } from '../src/utils/templateSwitch.js';
import { sanitizeContent } from '../src/utils/sanitizeContent.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';
import businessStarter from '../seed/templates/businessStarter.js';
import localShop from '../seed/templates/localShop.js';
import panchayatClassic from '../seed/templates/panchayatClassic.js';
import portfolioLight from '../seed/templates/portfolioLight.js';

const APPLY = process.argv.includes('--apply');
const NEW_TEMPLATES = [panchayatClassic, portfolioLight, businessStarter, localShop];
const rule = (from, to, convert) => ({ from: from.split('.'), to: to.split('.'), convert });

const COMMON = [
  rule('branding.logo', 'branding.logo'),
  rule('branding.brandColor', 'branding.brandColor'),
  rule('menu.items', 'menu.items'),
  rule('contact.title', 'contact.title'),
  rule('contact.address', 'contact.address'),
  rule('contact.phone', 'contact.phone'),
  rule('contact.email', 'contact.email'),
  rule('footer.text', 'footer.text'),
];

// Cards (services, work, products, offers) become business announcements: the closest fit.
const cardsToAnnouncements = (items) =>
  items.map((item) => ({
    category: 'business',
    title: item.title ?? '',
    details: item.description ?? '',
    date: '',
    phone: '',
    image: item.image ?? '',
  }));

const businessLike = (cardSections) => [
  ...COMMON,
  rule('hero.title', 'village.name'),
  rule('hero.subtitle', 'village.subtitle'),
  rule('hero.image', 'village.bannerImage'),
  rule('about.title', 'about.historyTitle'),
  rule('about.text', 'about.history'),
  rule('about.image', 'about.historyImage'),
  ...cardSections.map((key) => rule(`${key}.items`, 'announcements.items', cardsToAnnouncements)),
];

// Where each old template's fields go in the new sections.
const RULES = {
  'business-starter': businessLike(['services']),
  'portfolio-light': businessLike(['work']),
  'local-shop': businessLike(['products', 'offers']),
  'panchayat-classic': [
    ...COMMON,
    ...['name', 'englishName', 'location', 'tagline'].map((key) => rule(`village.${key}`, `village.${key}`)),
    rule('members.title', 'members.title'),
    rule('members.people', 'members.people'),
    ...['title', 'centralTitle', 'central', 'stateTitle', 'state'].map((key) => rule(`schemes.${key}`, `schemes.${key}`)),
    ...['title', 'historyTitle', 'history', 'historyImage', 'infoTitle', 'info', 'infoImage'].map((key) =>
      rule(`about.${key}`, `about.${key}`)
    ),
    rule('about.latestTitle', 'about.recentTitle'),
    rule('notices.title', 'events.title'),
    rule('notices.items', 'events.items', (items) => items.map((item) => ({ ...item, time: '' }))),
    rule('announcements.title', 'announcements.title'),
    rule('announcements.items', 'announcements.items', (items) =>
      items.map((item) => ({
        category: 'others',
        title: item.title ?? '',
        details: item.place ?? '',
        date: item.date ?? '',
        phone: '',
        image: item.image ?? '',
      }))
    ),
    rule('gallery.title', 'gallery.title'),
    rule('gallery.images', 'gallery.images'),
  ],
};

const isVillagePortal = (content) => content?.sections?.some?.((section) => section.key === 'topBar');

try {
  await connectDB();
  console.log(APPLY ? 'APPLYING changes\n' : 'DRY RUN: nothing will be changed\n');

  // The old defaults must be read before the templates are updated: they tell what an owner changed.
  const oldTemplates = new Map((await Template.find()).map((template) => [template._id.toString(), template]));
  const newBySlug = new Map(NEW_TEMPLATES.map((template) => [template.slug, template]));

  const sites = await Site.find();
  const updates = [];
  for (const site of sites) {
    const oldTemplate = oldTemplates.get(site.templateId?.toString());
    const slug = oldTemplate?.slug;
    const target = newBySlug.get(slug);

    if (!target) {
      console.log(`- ${site.name} (${site.subdomain}): SKIPPED, unknown template "${slug}"`);
      continue;
    }
    if (isVillagePortal(site.content)) {
      console.log(`- ${site.name} (${site.subdomain}): already moved, skipped`);
      continue;
    }

    const result = moveContent({
      fromContent: site.content,
      fromDefaults: oldTemplate.defaultContent,
      toBase: target.defaultContent,
      rules: RULES[slug],
    });
    // The same checks as a normal save; a site that fails is reported and left untouched.
    let content;
    try {
      content = sanitizeContent(target.defaultContent, result.content, null, site._id.toString());
    } catch (err) {
      console.log(`- ${site.name} (${site.subdomain}): SKIPPED, ${err.message}`);
      continue;
    }

    console.log(`- ${site.name} (${site.subdomain}), ${slug} -> ${target.name}`);
    console.log(`    moves across: ${result.moved.join(', ') || 'nothing changed by the owner'}`);
    console.log(`    kept in archive only: ${result.keptAside.join(', ') || 'nothing'}`);
    updates.push({ site, content });
  }

  if (APPLY) {
    for (const template of NEW_TEMPLATES) {
      await Template.findOneAndUpdate({ slug: template.slug }, template, { runValidators: true });
    }
    console.log('\nTemplates updated');
    for (const { site, content } of updates) {
      site.contentArchive = { ...(site.contentArchive ?? {}), beforeVillagePortal: structuredClone(site.content) };
      site.content = content;
      site.markModified('content');
      site.markModified('contentArchive');
      await site.save();
    }
    console.log(`${updates.length} site(s) moved`);
  } else {
    console.log(`\n${updates.length} site(s) would be moved. Run again with --apply to do it.`);
  }
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
