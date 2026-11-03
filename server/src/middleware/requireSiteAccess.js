import mongoose from 'mongoose';
import Site from '../../models/Site.js';
import { canManageSite } from '../utils/canManageSite.js';

// Runs after requireAuth. The ID in the URL is only a request, and is checked before any lookup.
export async function requireSiteAccess(req, res, next) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid site ID' });
  }
  // Checked before the lookup, so an owner can't use the answer to learn which IDs exist.
  if (!canManageSite(req.user, id)) {
    return res.status(403).json({ error: 'Not allowed here' });
  }

  const site = await Site.findById(id).populate('templateId');
  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }

  req.managedSite = site;
  next();
}
