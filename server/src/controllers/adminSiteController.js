import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Site from '../../models/Site.js';
import Template from '../../models/Template.js';
import User from '../../models/User.js';
import { scheduleSiteTranslation } from '../services/translationService.js';
import { canManageSite } from '../utils/canManageSite.js';
import { passwordProblem } from '../utils/passwordRules.js';

// Named fields rather than "everything except", so a private field added later stays hidden.
// content is left out of lists because it can be large and a list page doesn't need it.
const SITE_SUMMARY = 'name subdomain templateId ownerId builderId customDomain domainStatus status createdAt';

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

// Includes defaultContent, which the list leaves out, because a preview needs all of it.
export async function getTemplate(req, res) {
  const template = await Template.findOne({ slug: req.params.slug.toLowerCase(), isActive: true });
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const { name, slug, description, defaultContent } = template;
  res.json({ name, slug, description, defaultContent });
}

export async function listSites(req, res) {
  // A builder's list is filtered on the server, so other builders' sites never reach their browser.
  const filter = req.user.role === 'builder' ? { builderId: req.user._id } : {};
  const sites = await Site.find(filter)
    .select(SITE_SUMMARY)
    .populate('templateId', 'name slug')
    .populate('ownerId', 'name email disabled mustChangePassword')
    .populate('builderId', 'name email')
    .sort({ createdAt: -1 });
  res.json(sites);
}

export async function createSite(req, res) {
  // Only these fields are read, so a request can't set status or customDomain itself.
  const { name, subdomain, templateSlug, ownerName, ownerEmail, temporaryPassword } = req.body ?? {};

  // Strings only: an object like { $ne: null } would act as a database operator.
  const fields = [name, subdomain, templateSlug, ownerName, ownerEmail, temporaryPassword];
  if (fields.some((field) => typeof field !== 'string')) {
    return res.status(400).json({ error: 'Please fill in every field' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim())) {
    return res.status(400).json({ error: 'That owner email does not look valid' });
  }

  const problem = passwordProblem(temporaryPassword);
  if (problem) {
    return res.status(400).json({ error: problem });
  }

  const template = await Template.findOne({
    slug: templateSlug.toLowerCase().trim(),
    isActive: true,
  });
  if (!template) {
    return res.status(400).json({ error: 'Template not found' });
  }

  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  // Made up front because the site and its owner each need to store the other's ID.
  const siteId = new mongoose.Types.ObjectId();
  const ownerId = new mongoose.Types.ObjectId();

  try {
    let site;
    // Saves both or neither, so a failed owner can't leave a site nobody can log in to.
    await mongoose.connection.transaction(async (session) => {
      site = new Site({
        _id: siteId,
        name,
        subdomain,
        ownerId,
        // A builder's new site is theirs; a super admin's starts unassigned and can be assigned later.
        builderId: req.user.role === 'builder' ? req.user._id : undefined,
        templateId: template._id,
        content: structuredClone(template.defaultContent),
      });
      await site.save({ session });

      const owner = new User({
        _id: ownerId,
        name: ownerName,
        email: ownerEmail,
        passwordHash,
        role: 'siteowner',
        siteId,
        mustChangePassword: true,
      });
      await owner.save({ session });
    });

    res.status(201).json({
      ...summarize(site),
      owner: { name: ownerName.trim(), email: ownerEmail.trim().toLowerCase() },
    });
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
  // Only the super admin learns that a site doesn't exist; builders get 403 for both cases.
  if (!site && req.user.role === 'superadmin') {
    return res.status(404).json({ error: 'Site not found' });
  }
  if (!canManageSite(req.user, site)) {
    return res.status(403).json({ error: 'Not allowed here' });
  }

  site.status = status;
  await site.save();
  if (status === 'published') scheduleSiteTranslation(site._id);
  res.json(summarize(site));
}

// Super admin only: gives a site to a builder, or takes it back with builderId null.
export async function assignSiteBuilder(req, res) {
  const { builderId } = req.body ?? {};

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid site ID' });
  }
  if (builderId !== null && !mongoose.isValidObjectId(builderId)) {
    return res.status(400).json({ error: 'builderId must be a builder ID or null' });
  }

  const site = await Site.findById(req.params.id);
  if (!site) return res.status(404).json({ error: 'Site not found' });

  if (builderId !== null) {
    // Checked, so a site can't be handed to an owner or a made-up ID.
    const builder = await User.exists({ _id: builderId, role: 'builder' });
    if (!builder) return res.status(400).json({ error: 'That builder does not exist' });
  }

  site.builderId = builderId ?? undefined;
  await site.save();
  res.json({ ...summarize(site), builderId: site.builderId ?? null });
}
