import BlogPost from '../../models/BlogPost.js';
import Template from '../../models/Template.js';
import { readPage } from '../utils/blogRules.js';
import { scoped } from '../utils/scoped.js';

// Same response as an unknown site, so visitors can't discover unpublished sites.
function hiddenSite(req, res) {
  if (req.site.status === 'published') return false;
  res.status(404).json({ error: 'Site not found' });
  return true;
}

export async function getPublicSite(req, res) {
  if (hiddenSite(req, res)) return;

  // The slug lets the browser choose which layout to draw; nothing else about the template is sent.
  const template = await Template.findById(req.site.templateId).select('slug');

  // An explicit list, so private fields added to Site later can't leak by default.
  const { name, subdomain, content } = req.site;
  res.json({ name, subdomain, content, templateSlug: template?.slug });
}

// The site comes from the address, not an ID, so nobody can list another site's posts by guessing.
export async function getPublicBlog(req, res) {
  if (hiddenSite(req, res)) return;

  const paging = readPage(req.query);
  if (!paging) return res.status(400).json({ error: 'Invalid page' });

  const posts = scoped(BlogPost, req.site._id);
  const filter = { status: 'published' };
  const [items, total] = await Promise.all([
    posts
      .find(filter)
      .select('title slug description image publishedAt -_id')
      .sort({ publishedAt: -1 })
      .skip(paging.skip)
      .limit(paging.limit),
    posts.countDocuments(filter),
  ]);
  res.json({ posts: items, page: paging.page, totalPages: Math.ceil(total / paging.limit), total });
}

export async function getPublicPost(req, res) {
  if (hiddenSite(req, res)) return;

  const post = await scoped(BlogPost, req.site._id)
    .findOne({ slug: req.params.slug.normalize('NFC').toLowerCase(), status: 'published' })
    .select('title slug description body image publishedAt -_id');
  // Drafts get the same 404 as missing posts, so their slugs can't be discovered.
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
}
