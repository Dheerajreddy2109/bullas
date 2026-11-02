import mongoose from 'mongoose';
import { connectDB } from '../src/db.js';
import { scoped } from '../src/utils/scoped.js';
import { findSiteByHostname } from '../src/middleware/resolveSite.js';
import Site from '../models/Site.js';
import BlogPost from '../models/BlogPost.js';

const SLUG = 'isolation-test';
const SPOOF_SLUG = 'isolation-test-spoof';
const TEMP_SUBDOMAIN = 'isolation-test-site';
const TEMP_DOMAIN = 'isolation-test.example';

let failures = 0;
function check(label, passed) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${label}`);
  if (!passed) failures += 1;
}

async function rejects(action) {
  try {
    await action();
    return false;
  } catch {
    return true;
  }
}

// Names only this script's records, so cleanup can't touch real content.
async function cleanUp(siteIds) {
  await BlogPost.deleteMany({ slug: { $in: [SLUG, SPOOF_SLUG] }, siteId: { $in: siteIds } });
  await Site.deleteOne({ subdomain: TEMP_SUBDOMAIN });
}

let siteIds = [];
try {
  await connectDB();
  await Promise.all([Site.init(), BlogPost.init()]);

  const demo = await Site.findOne({ subdomain: 'demo' });
  const hidden = await Site.findOne({ subdomain: 'hidden' });
  if (!demo || !hidden) {
    throw new Error('Demo sites not found. Run scripts/seed.js first');
  }
  siteIds = [demo._id, hidden._id];
  await cleanUp(siteIds);

  const demoPosts = scoped(BlogPost, demo._id);
  const hiddenPosts = scoped(BlogPost, hidden._id);

  const demoPost = await demoPosts.create({ title: 'Demo post', slug: SLUG });
  const hiddenPost = await hiddenPosts.create({ title: 'Hidden post', slug: SLUG });
  check('two sites can use the same slug', Boolean(demoPost && hiddenPost));

  check(
    'one site cannot use the same slug twice',
    await rejects(() => demoPosts.create({ title: 'Duplicate', slug: SLUG }))
  );

  const found = await demoPosts.find({ slug: SLUG });
  check(
    'find returns only the site\'s own post',
    found.length === 1 && found[0]._id.equals(demoPost._id)
  );

  check(
    'cannot read another site\'s post by its ID',
    (await demoPosts.findOne({ _id: hiddenPost._id })) === null
  );

  const spoofedRead = await demoPosts.find({ slug: SLUG, siteId: hidden._id });
  check(
    'a siteId in the filter cannot override the scope',
    spoofedRead.length === 1 && spoofedRead[0]._id.equals(demoPost._id)
  );

  const updated = await demoPosts.updateOne({ _id: hiddenPost._id }, { title: 'Hacked' });
  const afterUpdate = await BlogPost.findById(hiddenPost._id);
  check(
    'cannot update another site\'s post',
    updated.modifiedCount === 0 && afterUpdate.title === 'Hidden post'
  );

  const deleted = await demoPosts.deleteOne({ _id: hiddenPost._id });
  check(
    'cannot delete another site\'s post',
    deleted.deletedCount === 0 && (await BlogPost.exists({ _id: hiddenPost._id })) !== null
  );

  check(
    'cannot move a post to another site',
    await rejects(() => demoPosts.updateOne({ _id: demoPost._id }, { $set: { siteId: hidden._id } }))
  );

  const spoofedCreate = await demoPosts.create({
    title: 'Spoofed',
    slug: SPOOF_SLUG,
    siteId: hidden._id,
  });
  check('a siteId in create data cannot override the scope', spoofedCreate.siteId.equals(demo._id));

  const ownUpdate = await demoPosts.updateOne({ _id: demoPost._id }, { title: 'Edited' });
  check('a site can still update its own post', ownUpdate.modifiedCount === 1);

  check('scoped() refuses a missing siteId', await rejects(async () => scoped(BlogPost, undefined)));

  const tempSite = await Site.create({
    name: 'Isolation Test',
    subdomain: TEMP_SUBDOMAIN,
    templateId: demo.templateId,
    content: {},
    customDomain: TEMP_DOMAIN,
    domainStatus: 'pending',
  });
  check('a pending custom domain does not match', (await findSiteByHostname(TEMP_DOMAIN)) === null);

  tempSite.domainStatus = 'connected';
  await tempSite.save();
  const matched = await findSiteByHostname(TEMP_DOMAIN);
  check('a connected custom domain matches', Boolean(matched?._id.equals(tempSite._id)));
} catch (err) {
  console.error('Test run failed:', err.message);
  failures += 1;
} finally {
  await cleanUp(siteIds);
  await mongoose.disconnect();
}

console.log(failures === 0 ? 'All checks passed' : `${failures} check(s) failed`);
process.exitCode = failures === 0 ? 0 : 1;
