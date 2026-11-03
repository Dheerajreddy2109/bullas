import mongoose from 'mongoose';
import BlogPost from '../../models/BlogPost.js';
import { readPage, readPostInput, slugify } from '../utils/blogRules.js';
import { ContentError } from '../utils/sanitizeContent.js';
import { scoped } from '../utils/scoped.js';

const LIST_FIELDS = 'title slug description image status publishedAt updatedAt';

// Every query goes through scoped(), so this site's ID is always part of the filter.
const postsOf = (req) => scoped(BlogPost, req.managedSite._id);

function sendInputError(err, res) {
  if (err instanceof ContentError) {
    res.status(400).json({ error: err.message });
    return true;
  }
  if (err.code === 11000) {
    res.status(409).json({ error: 'That slug is already used on this site' });
    return true;
  }
  return false;
}

async function findPost(req, res) {
  if (!mongoose.isValidObjectId(req.params.postId)) {
    res.status(400).json({ error: 'Invalid post ID' });
    return null;
  }
  const post = await postsOf(req).findOne({ _id: req.params.postId });
  if (!post) res.status(404).json({ error: 'Post not found' });
  return post;
}

// Adds -2, -3 and so on, so two posts with the same title don't block each other.
async function uniqueSlug(posts, base) {
  for (let n = 1; n < 1000; n += 1) {
    const slug = n === 1 ? base : `${base.slice(0, 75)}-${n}`;
    if (!(await posts.findOne({ slug }).select('_id'))) return slug;
  }
  return `${base.slice(0, 60)}-${Date.now()}`;
}

export async function listPosts(req, res) {
  const paging = readPage(req.query, 50);
  if (!paging) return res.status(400).json({ error: 'Invalid page' });

  const filter = {};
  if (req.query.status === 'draft' || req.query.status === 'published') filter.status = req.query.status;

  const posts = postsOf(req);
  const sort = filter.status === 'published' ? { publishedAt: -1 } : { updatedAt: -1 };
  const [items, total] = await Promise.all([
    posts.find(filter).select(LIST_FIELDS).sort(sort).skip(paging.skip).limit(paging.limit),
    posts.countDocuments(filter),
  ]);
  res.json({ posts: items, page: paging.page, totalPages: Math.ceil(total / paging.limit), total });
}

export async function getPost(req, res) {
  const post = await findPost(req, res);
  if (post) res.json(post);
}

export async function createPost(req, res) {
  try {
    const input = readPostInput(req.body, req.managedSite._id.toString(), { creating: true });
    const posts = postsOf(req);
    // A typed slug is kept exactly, so a clash is reported; a generated one is made unique.
    const slug = input.slug ?? (await uniqueSlug(posts, slugify(input.title)));
    const post = await posts.create({ ...input, slug, status: 'draft' });
    res.status(201).json(post);
  } catch (err) {
    if (!sendInputError(err, res)) throw err;
  }
}

export async function updatePost(req, res) {
  const post = await findPost(req, res);
  if (!post) return;

  try {
    Object.assign(post, readPostInput(req.body, req.managedSite._id.toString(), { creating: false }));
    await post.save();
    res.json(post);
  } catch (err) {
    if (!sendInputError(err, res)) throw err;
  }
}

export async function setPostStatus(req, res) {
  const { status } = req.body ?? {};
  if (status !== 'draft' && status !== 'published') {
    return res.status(400).json({ error: 'status must be draft or published' });
  }

  const post = await findPost(req, res);
  if (!post) return;

  post.status = status;
  // Set once, so unpublishing and republishing keeps the post's original date.
  if (status === 'published' && !post.publishedAt) post.publishedAt = new Date();
  await post.save();
  res.json(post);
}

export async function deletePost(req, res) {
  const post = await findPost(req, res);
  if (!post) return;

  await postsOf(req).deleteOne({ _id: post._id });
  res.json({ status: 'deleted' });
}
