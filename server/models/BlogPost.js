import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    // Required so a post can never exist without belonging to exactly one site.
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // Slugs appear in URLs, so spaces and symbols would produce broken links.
      match: [/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug may only use letters, numbers and hyphens'],
    },
    description: { type: String, default: '' },
    body: { type: String, default: '' },
    image: { type: String, default: '' },
    // Draft by default so unfinished writing isn't shown to the public.
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Unique within a site only, so two different sites can both have /blog/welcome.
blogPostSchema.index({ siteId: 1, slug: 1 }, { unique: true });
// Starts with siteId because a public blog page always lists one site's latest posts.
blogPostSchema.index({ siteId: 1, status: 1, publishedAt: -1 });

export default mongoose.model('BlogPost', blogPostSchema);
