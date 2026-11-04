import mongoose from 'mongoose';

// These names are needed by Bullas itself, so a customer must not be able to claim them.
const RESERVED_SUBDOMAINS = ['www', 'admin', 'superadmin', 'api', 'app', 'sites', 'mail', 'root'];

// No siteId field: a site's own _id is the siteId that other documents point to.
const siteSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Site name is required'], trim: true },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [
        {
          // Follows DNS rules, which also forbid a hyphen at either end of the name.
          validator: (value) => /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(value),
          message: 'Subdomain must be 3 to 30 lowercase letters, numbers or inner hyphens',
        },
        {
          validator: (value) => !RESERVED_SUBDOMAINS.includes(value),
          message: 'This subdomain is reserved',
        },
      ],
    },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
    // Optional at first: site and owner each need the other's ID, so one must be saved first.
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // The builder (staff member) responsible for this site. Empty means only the super admin manages it.
    // Indexed because each builder's site list is filtered by it.
    builderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    // A private copy, so editing this site never changes the template or any other site.
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    // Content saved under each template the site used before, so switching back loses nothing.
    // Never sent to the browser; only the template-switch route reads it.
    contentArchive: { type: mongoose.Schema.Types.Mixed, default: {} },
    customDomain: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      // Sparse skips missing values only; '' or null would clash between sites, so drop them.
      sparse: true,
      set: (value) => value || undefined,
    },
    domainStatus: {
      type: String,
      enum: ['none', 'pending', 'connected', 'failed'],
      default: 'none',
    },
    // The last DNS check's explanation, so the super admin can see why a domain failed.
    domainMessage: { type: String, default: '' },
    domainCheckedAt: { type: Date },
    // Draft by default so a half-built site isn't shown to the public.
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  // minimize: false keeps empty objects in content, which templates may rely on.
  { timestamps: true, minimize: false }
);

export default mongoose.model('Site', siteSchema);
