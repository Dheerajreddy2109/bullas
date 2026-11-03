import { detectImageType } from '../middleware/uploadImage.js';
import { countSiteImages, saveSiteImage } from '../services/imageStorage.js';
import { ContentError, sanitizeContent } from '../utils/sanitizeContent.js';

const MAX_IMAGES_PER_SITE = 200;

export function getSiteContent(req, res) {
  const { _id, name, subdomain, status, templateId, content } = req.managedSite;
  res.json({ _id, name, subdomain, status, templateSlug: templateId?.slug, content });
}

export async function updateSiteContent(req, res) {
  const site = req.managedSite;

  if (!site.templateId) {
    return res.status(409).json({ error: 'This site has no template' });
  }

  let content;
  try {
    content = sanitizeContent(
      site.templateId.defaultContent,
      req.body?.content,
      site.content,
      site._id.toString()
    );
  } catch (err) {
    if (err instanceof ContentError) {
      return res.status(400).json({ error: err.message });
    }
    throw err;
  }

  site.content = content;
  // Mongoose can't see changes inside a flexible field unless told.
  site.markModified('content');
  await site.save();
  res.json({ content });
}

export async function uploadSiteImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Choose an image to upload' });
  }

  const extension = detectImageType(req.file.buffer);
  if (!extension) {
    return res.status(415).json({ error: 'Image must be a JPG, PNG or WebP file' });
  }

  const siteId = req.managedSite._id.toString();
  if ((await countSiteImages(siteId)) >= MAX_IMAGES_PER_SITE) {
    return res.status(409).json({ error: `This site has reached its limit of ${MAX_IMAGES_PER_SITE} images` });
  }

  const url = await saveSiteImage(siteId, req.file.buffer, extension);
  res.status(201).json({ url });
}
