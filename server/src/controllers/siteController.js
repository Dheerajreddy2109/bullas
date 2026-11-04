import BlogPost from '../../models/BlogPost.js';
import Template from '../../models/Template.js';
import { translatedContent, translatedPosts } from '../services/translationService.js';
import { categoryFilter, readPage } from '../utils/blogRules.js';
import { DEFAULT_LANGUAGE, readLanguage, SITE_LANGUAGES } from '../utils/languages.js';
import { scoped } from '../utils/scoped.js';

// Same response as an unknown site, so visitors can't discover unpublished sites.
// The language a visitor asked for, or null when they should see the site as it was written.
function wantedLanguage(req) {
  const language = readLanguage(req.query.lang);
  return language && language !== (req.site.language ?? DEFAULT_LANGUAGE) ? language : null;
}

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
  const { name, subdomain } = req.site;
  res.json({
    name,
    subdomain,
    content: await translatedContent(req.site, readLanguage(req.query.lang) ?? req.site.language ?? DEFAULT_LANGUAGE),
    templateSlug: template?.slug,
    language: req.site.language ?? DEFAULT_LANGUAGE,
    languages: SITE_LANGUAGES,
  });
}

// The site comes from the address, not an ID, so nobody can list another site's posts by guessing.
export async function getPublicBlog(req, res) {
  if (hiddenSite(req, res)) return;

  const paging = readPage(req.query);
  if (!paging) return res.status(400).json({ error: 'Invalid page' });

  const posts = scoped(BlogPost, req.site._id);
  const filter = { status: 'published' };
  const category = categoryFilter(req.query.category);
  if (category === null) return res.status(400).json({ error: 'Invalid category' });
  if (category !== undefined) filter.category = category;
  const [items, total] = await Promise.all([
    posts
      .find(filter)
      .select('title slug description image category publishedAt -_id')
      .sort({ publishedAt: -1 })
      .skip(paging.skip)
      .limit(paging.limit),
    posts.countDocuments(filter),
  ]);
  const language = wantedLanguage(req);
  res.json({
    posts: language ? await translatedPosts(req.site, items, language) : items,
    page: paging.page,
    totalPages: Math.ceil(total / paging.limit),
    total,
  });
}

export async function getPublicPost(req, res) {
  if (hiddenSite(req, res)) return;

  const post = await scoped(BlogPost, req.site._id)
    .findOne({ slug: req.params.slug.normalize('NFC').toLowerCase(), status: 'published' })
    .select('title slug description body image category publishedAt -_id');
  // Drafts get the same 404 as missing posts, so their slugs can't be discovered.
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const language = wantedLanguage(req);
  res.json(language ? (await translatedPosts(req.site, [post], language))[0] : post);
}
