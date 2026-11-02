import mongoose from 'mongoose';
import Site from '../../models/Site.js';
import Template from '../../models/Template.js';

// Named fields rather than "everything except", so a private field added later stays hidden.
// content is left out of lists because it can be large and a list page doesn't need it.
const SITE_SUMMARY = 'name subdomain templateId ownerId customDomain domainStatus status createdAt';

function summarize(site) {
  const { _id, name, subdomain, templateId, status, domainStatus, createdAt } = site;
  return { _id, name, subdomain, templateId, status, domainStatus, createdAt };
}

export async function listTemplates(req, res) {
  const templates = await Template.find({ isActive: true }).select(
    'name slug description previewImage'
  );
  res.json(templates);
}

export async function listSites(req, res) {
  const sites = await Site.find().select(SITE_SUMMARY).sort({ createdAt: -1 });
  res.json(sites);
}

export async function createSite(req, res) {
  // Only these fields are read, so a request can't set status or customDomain itself.
  const { name, subdomain, templateSlug } = req.body ?? {};

  // Strings only: an object like { $ne: null } would act as a database operator.
  if (
    typeof name !== 'string' ||
    typeof subdomain !== 'string' ||
    typeof templateSlug !== 'string'
  ) {
    return res.status(400).json({ error: 'name, subdomain and templateSlug are required' });
  }

  const template = await Template.findOne({
    slug: templateSlug.toLowerCase().trim(),
    isActive: true,
  });
  if (!template) {
    return res.status(400).json({ error: 'Template not found' });
  }

  try {
    const site = await Site.create({
      name,
      subdomain,
      templateId: template._id,
      content: structuredClone(template.defaultContent),
    });
    res.status(201).json(summarize(site));
  } catch (err) {
    // Relies on the unique index, because checking first would leave a gap for two requests.
    if (err.code === 11000) {
      return res.status(409).json({ error: 'That subdomain is already taken' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    throw err;
  }
}

export async function updateSiteStatus(req, res) {
  const { status } = req.body ?? {};

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid site ID' });
  }
  if (status !== 'draft' && status !== 'published') {
    return res.status(400).json({ error: 'status must be draft or published' });
  }

  const site = await Site.findById(req.params.id);
  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }

  site.status = status;
  await site.save();
  res.json(summarize(site));
}
