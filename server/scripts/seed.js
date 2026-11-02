import mongoose from 'mongoose';
import { connectDB } from '../src/db.js';
import User from '../models/User.js';
import Template from '../models/Template.js';
import Site from '../models/Site.js';
import businessStarter from '../seed/templates/businessStarter.js';
import localShop from '../seed/templates/localShop.js';
import panchayatClassic from '../seed/templates/panchayatClassic.js';
import portfolioLight from '../seed/templates/portfolioLight.js';

const superAdmin = {
  name: 'Super Admin',
  email: 'superadmin@bullas.local',
  // Deliberately not a valid hash, so no password can ever log in to this placeholder.
  passwordHash: '!placeholder-not-a-real-hash',
  role: 'superadmin',
};

const templates = [businessStarter, panchayatClassic, portfolioLight, localShop];

try {
  await connectDB();
  // Wait for the unique indexes, otherwise the script may exit before they are built.
  await Promise.all([User.init(), Template.init(), Site.init()]);

  // Checks the role, not the email: the real admin changes that email and must not get a twin.
  if (await User.exists({ role: 'superadmin' })) {
    console.log('Super admin already exists, skipped');
  } else {
    await User.create(superAdmin);
    console.log('Super admin created');
  }

  // Templates are defined in code, so they are updated here. Real sites keep their own copies.
  for (const template of templates) {
    await Template.findOneAndUpdate({ slug: template.slug }, template, {
      upsert: true,
      runValidators: true,
    });
    console.log(`Template "${template.slug}" saved`);
  }

  // One public and one draft site, so both outcomes of site lookup can be tested.
  // Their content is refreshed because they are test data, and their owners are left alone.
  const { _id: templateId } = await Template.findOne({ slug: businessStarter.slug });
  const demoSites = [
    { name: 'Demo Site', subdomain: 'demo', status: 'published' },
    { name: 'Hidden Site', subdomain: 'hidden', status: 'draft' },
  ];
  for (const site of demoSites) {
    await Site.findOneAndUpdate(
      { subdomain: site.subdomain },
      {
        $set: { templateId, content: structuredClone(businessStarter.defaultContent) },
        $setOnInsert: { name: site.name, status: site.status },
      },
      { upsert: true, runValidators: true }
    );
    console.log(`Site "${site.subdomain}" saved`);
  }
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  // An open connection would keep the script running forever.
  await mongoose.disconnect();
}
