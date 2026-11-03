import mongoose from 'mongoose';
import Site from '../../models/Site.js';
import { canManageSite } from '../utils/canManageSite.js';

// Runs after requireAuth. The ID in the URL is only a request; the site is checked against the user.
export async function requireSiteAccess(req, res, next) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid site ID' });
  }

  const site = await Site.findById(id).populate('templateId');

  // Only the super admin learns that a site doesn't exist. Everyone else gets the same 403
  // for missing sites and other people's sites, so IDs can't be probed.
  if (!site && req.user.role === 'superadmin') {
    return res.status(404).json({ error: 'Site not found' });
  }
  if (!canManageSite(req.user, site)) {
    return res.status(403).json({ error: 'Not allowed here' });
  }

  req.managedSite = site;
  next();
}
