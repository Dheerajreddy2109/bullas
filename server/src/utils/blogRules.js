import sanitizeHtml from 'sanitize-html';
import { checkImage, ContentError } from './sanitizeContent.js';

// Letters from any language, so Telugu titles make real slugs instead of empty ones.
export const SLUG_PATTERN = /^[\p{L}\p{M}\p{N}]+(-[\p{L}\p{M}\p{N}]+)*$/u;
const MAX_SLUG = 80;
const MAX_TITLE = 200;
const MAX_DESCRIPTION = 500;
const MAX_BODY = 50000;

export function slugify(title) {
  const slug = title
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .slice(0, MAX_SLUG)
    .replace(/^-+|-+$/g, '');
  return slug || 'post';
}

// A guest list, not a blocklist: anything not named here is removed, including scripts and
// event attributes like onerror, so a post can't run code in a visitor's browser.
export function cleanBody(html) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a'],
    allowedAttributes: { a: ['href', 'rel', 'target'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      // The browser's editor makes divs for new lines, so they become paragraphs.
      div: 'p',
      // Set here rather than kept from the input, so a post can't choose its own link rules.
      // nofollow and ugc stop spam links gaining search rank; noopener stops new tabs controlling this one.
      a: sanitizeHtml.simpleTransform('a', { rel: 'nofollow ugc noopener noreferrer', target: '_blank' }),
    },
  });
}

function checkText(value, label, max, required = false) {
  if (value === undefined && !required) return undefined;
  if (typeof value !== 'string') throw new ContentError(`${label} must be text`);
  const text = value.trim();
  if (required && !text) throw new ContentError(`${label} is required`);
  if (text.length > max) throw new ContentError(`${label} must be at most ${max} characters`);
  return text;
}

// Returns only the fields that were sent and are allowed, so status and siteId can't be set here.
export function readPostInput(body, siteId, { creating }) {
  const input = body ?? {};
  const post = {};

  const title = checkText(input.title, 'Title', MAX_TITLE, creating);
  if (title !== undefined) post.title = title;

  const description = checkText(input.description, 'Description', MAX_DESCRIPTION);
  if (description !== undefined) post.description = description;

  if (input.body !== undefined) {
    if (typeof input.body !== 'string') throw new ContentError('Body must be text');
    if (input.body.length > MAX_BODY) throw new ContentError(`Body must be at most ${MAX_BODY} characters`);
    post.body = cleanBody(input.body);
  }

  if (input.image !== undefined) post.image = checkImage(input.image, 'Image', siteId);

  if (input.slug !== undefined && input.slug !== '') {
    const slug = checkText(input.slug, 'Slug', MAX_SLUG).normalize('NFC').toLowerCase();
    if (!SLUG_PATTERN.test(slug)) {
      throw new ContentError('Slug may only use letters, numbers and single hyphens');
    }
    post.slug = slug;
  }

  return post;
}

// Returns null for a bad page number, so the route can answer 400 instead of guessing.
export function readPage(query, maxLimit = 20) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1 || page > 1000) return null;
  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) return null;
  return { page, limit, skip: (page - 1) * limit };
}
