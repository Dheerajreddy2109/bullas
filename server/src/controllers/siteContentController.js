import { detectImageType } from '../middleware/uploadImage.js';
import { countSiteImages, saveSiteImage } from '../services/imageStorage.js';
import Template from '../../models/Template.js';
import { ContentError, sanitizeContent } from '../utils/sanitizeContent.js';
import { switchTemplateContent } from '../utils/templateSwitch.js';

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

// The templates a site can switch to. Owners can't use the admin-only template list, so this is per site.
export async function listSiteTemplates(req, res) {
  const templates = await Template.find({ isActive: true }).select('name slug description previewImage').lean();
  res.json({ current: req.managedSite.templateId?.slug, templates });
}

// Body: { templateSlug, dryRun }. A dry run only returns the preview and saves nothing.
export async function changeSiteTemplate(req, res) {
  const site = req.managedSite;
  const { templateSlug, dryRun } = req.body ?? {};

  if (typeof templateSlug !== 'string' || !templateSlug) {
    return res.status(400).json({ error: 'Choose a template' });
  }
  const target = await Template.findOne({ slug: templateSlug.toLowerCase(), isActive: true });
  if (!target) {
    return res.status(404).json({ error: 'Template not found' });
  }
  if (!site.templateId) {
    return res.status(409).json({ error: 'This site has no template' });
  }
  if (site.templateId._id.equals(target._id)) {
    return res.status(409).json({ error: 'The site already uses this template' });
  }

  const result = switchTemplateContent({
    fromSlug: site.templateId.slug,
    fromDefaults: site.templateId.defaultContent,
    fromContent: site.content,
    toDefaults: target.defaultContent,
    archive: site.contentArchive ?? {},
  });

  let content;
  try {
    // The same checks as a normal save, so moved or restored content can't skip them.
    content = sanitizeContent(target.defaultContent, result.content, null, site._id.toString());
  } catch (err) {
    if (err instanceof ContentError) {
      return res.status(400).json({ error: err.message });
    }
    throw err;
  }

  if (dryRun !== true) {
    site.templateId = target._id;
    site.content = content;
    site.contentArchive = result.archive;
    // Mongoose can't see changes inside flexible fields unless told.
    site.markModified('content');
    site.markModified('contentArchive');
    await site.save();
  }

  res.json({
    templateSlug: target.slug,
    templateName: target.name,
    content,
    moved: result.moved,
    keptAside: result.keptAside,
    saved: dryRun !== true,
  });
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
