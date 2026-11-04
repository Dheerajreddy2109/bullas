// Translates what's missing on every published site.
//   node --env-file=.env scripts/translateSites.js          -> dry run: counts, sends nothing
//   node --env-file=.env scripts/translateSites.js --apply  -> translates, within the monthly limit
import mongoose from 'mongoose';
import { connectDB } from '../src/db.js';
import { hasTranslateKey } from '../src/services/googleTranslate.js';
import { translateSite } from '../src/services/translationService.js';
import Site from '../models/Site.js';
import '../models/Template.js';
import TranslationUsage from '../models/TranslationUsage.js';

const APPLY = process.argv.includes('--apply');

try {
  await connectDB();
  if (APPLY && !hasTranslateKey()) throw new Error('GOOGLE_TRANSLATE_KEY is not set in .env');
  console.log(APPLY ? 'TRANSLATING\n' : 'DRY RUN: nothing will be sent\n');

  const sites = await Site.find({ status: 'published' }).select('name subdomain');
  let total = 0;
  for (const site of sites) {
    const report = await translateSite(site._id, { dryRun: !APPLY });
    total += report.characters;
    console.log(`- ${site.name} (${site.subdomain}): ${report.characters} characters`);
    if (report.limitReached) {
      console.log('Monthly limit reached; stopping here. The rest continues next month.');
      break;
    }
  }
  const usage = await TranslationUsage.findOne({ month: new Date().toISOString().slice(0, 7) });
  console.log(`\nTotal: ${total} characters. Used so far this month: ${usage?.characters ?? 0}.`);
} catch (err) {
  console.error('Failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
