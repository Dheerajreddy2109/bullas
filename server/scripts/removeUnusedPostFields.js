// One-time cleanup: the Posts tabs now show only blog posts, so the Photo gallery section and the
// history and information fields do nothing. This removes them from the templates and every site.
//   node --env-file=.env scripts/removeUnusedPostFields.js          -> dry run: prints, changes nothing
//   node --env-file=.env scripts/removeUnusedPostFields.js --apply  -> updates templates and sites
// Each site's full content is first copied to contentArchive.beforePostsCleanup, so nothing is lost.
import mongoose from 'mongoose';
import { connectDB } from '../src/db.js';
import { sanitizeContent } from '../src/utils/sanitizeContent.js';
import Site from '../models/Site.js';
import Template from '../models/Template.js';
import businessStarter from '../seed/templates/businessStarter.js';
import localShop from '../seed/templates/localShop.js';
import panchayatClassic from '../seed/templates/panchayatClassic.js';
import portfolioLight from '../seed/templates/portfolioLight.js';

const APPLY = process.argv.includes('--apply');
const NEW_TEMPLATES = [panchayatClassic, portfolioLight, businessStarter, localShop];
const REMOVED_ABOUT_FIELDS = ['historyTitle', 'history', 'historyImage', 'infoTitle', 'info', 'infoImage'];

const findSection = (content, key) => content?.sections?.find?.((section) => section?.key === key);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

try {
  await connectDB();
  console.log(APPLY ? 'APPLYING changes\n' : 'DRY RUN: nothing will be changed\n');

  const newBySlug = new Map(NEW_TEMPLATES.map((template) => [template.slug, template]));
  const sites = await Site.find().populate('templateId');
  const updates = [];

  for (const site of sites) {
    const slug = site.templateId?.slug;
    const target = newBySlug.get(slug);
    const label = `${site.name} (${site.subdomain})`;

    if (!target) {
      console.log(`- ${label}: SKIPPED, unknown template "${slug}"`);
      continue;
    }
    if (!findSection(site.content, 'gallery')) {
      console.log(`- ${label}: already cleaned, skipped`);
      continue;
    }

    // What the owner filled in, compared with the old template, so the report shows what matters.
    const oldDefaults = site.templateId.defaultContent;
    const changed = REMOVED_ABOUT_FIELDS.filter(
      (key) => !same(findSection(site.content, 'about')?.fields?.[key]?.value, findSection(oldDefaults, 'about')?.fields?.[key]?.value)
    );
    const oldPhotos = findSection(site.content, 'gallery')?.fields?.images?.value ?? [];
    if (!same(oldPhotos, findSection(oldDefaults, 'gallery')?.fields?.images?.value)) changed.push('gallery');

    // The same checks as a normal save. Building from the new template is what drops the old fields.
    let content;
    try {
      content = sanitizeContent(target.defaultContent, site.content, null, site._id.toString());
    } catch (err) {
      console.log(`- ${label}: SKIPPED, ${err.message}`);
      continue;
    }

    console.log(`- ${label}: archived then removed. Owner's content among them: ${changed.join(', ') || 'none'}`);
    updates.push({ site, content });
  }

  if (APPLY) {
    for (const { site, content } of updates) {
      site.contentArchive = { ...(site.contentArchive ?? {}), beforePostsCleanup: structuredClone(site.content) };
      site.content = content;
      site.markModified('content');
      site.markModified('contentArchive');
      await site.save();
    }
    console.log(`\n${updates.length} site(s) cleaned`);
    for (const template of NEW_TEMPLATES) {
      await Template.findOneAndUpdate({ slug: template.slug }, template, { runValidators: true });
    }
    console.log('Templates updated');
  } else {
    console.log(`\n${updates.length} site(s) would be cleaned. Run again with --apply to do it.`);
  }
} catch (err) {
  console.error('Cleanup failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
