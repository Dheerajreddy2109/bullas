import mongoose from 'mongoose';

// No siteId: templates are global and shared; each site gets its own copy of the content.
const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Lowercase because slugs are used as stable identifiers and in URLs.
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    previewImage: { type: String, default: '' },
    // Mixed because each template has different sections, so one fixed shape won't fit.
    defaultContent: { type: mongoose.Schema.Types.Mixed, required: true },
    // Lets us retire a template without breaking the sites already built from it.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Template', templateSchema);
