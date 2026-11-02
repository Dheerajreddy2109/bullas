import mongoose from 'mongoose';
import { connectDB } from '../src/db.js';
import User from '../models/User.js';
import Template from '../models/Template.js';

const superAdmin = {
  name: 'Super Admin',
  email: 'superadmin@bullas.local',
  // Deliberately not a valid hash, so no password can ever log in to this placeholder.
  passwordHash: '!placeholder-not-a-real-hash',
  role: 'superadmin',
};

const template = {
  name: 'Business Starter',
  slug: 'business-starter',
  description: 'A simple business site with a banner, about text and contact details.',
  defaultContent: {
    sections: [
      {
        key: 'banner',
        label: 'Banner',
        fields: {
          heading: { type: 'text', value: 'Welcome to our business' },
          image: { type: 'image', value: '' },
        },
      },
      {
        key: 'about',
        label: 'About',
        fields: {
          text: { type: 'textarea', value: 'Tell visitors about your business.' },
        },
      },
      {
        key: 'contact',
        label: 'Contact',
        fields: {
          email: { type: 'text', value: '' },
          phone: { type: 'text', value: '' },
        },
      },
    ],
  },
};

// Skips records that exist, so re-running can't duplicate them or overwrite later edits.
async function seedOne(Model, filter, data, label) {
  if (await Model.exists(filter)) {
    console.log(`${label} already exists, skipped`);
    return;
  }
  await Model.create(data);
  console.log(`${label} created`);
}

try {
  await connectDB();
  // Wait for the unique indexes, otherwise the script may exit before they are built.
  await Promise.all([User.init(), Template.init()]);

  await seedOne(User, { email: superAdmin.email, role: 'superadmin' }, superAdmin, 'Super admin');
  await seedOne(Template, { slug: template.slug }, template, 'Template');
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  // An open connection would keep the script running forever.
  await mongoose.disconnect();
}
