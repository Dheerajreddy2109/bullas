import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Site from '../../models/Site.js';
import User from '../../models/User.js';
import { passwordProblem } from '../utils/passwordRules.js';

function summarizeOwner(owner) {
  const { _id, name, email, disabled, mustChangePassword } = owner;
  return { _id, name, email, disabled, mustChangePassword };
}

// Matches on siteId too, so a site's ownerId can only ever reach that site's own owner.
async function findSiteOwner(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: 'Invalid site ID' });
    return {};
  }
  const site = await Site.findById(req.params.id).select('name subdomain ownerId');
  if (!site) {
    res.status(404).json({ error: 'Site not found' });
    return {};
  }
  const owner = site.ownerId
    ? await User.findOne({ _id: site.ownerId, siteId: site._id, role: 'siteowner' })
    : null;
  if (!owner) {
    res.status(404).json({ error: 'This site has no owner' });
    return {};
  }
  return { site, owner };
}

export async function getSiteOwner(req, res) {
  const { site, owner } = await findSiteOwner(req, res);
  if (!owner) return;
  res.json({ site: { _id: site._id, name: site.name, subdomain: site.subdomain }, owner: summarizeOwner(owner) });
}

export async function resetOwnerPassword(req, res) {
  const { temporaryPassword } = req.body ?? {};
  const problem = passwordProblem(temporaryPassword);
  if (problem) return res.status(400).json({ error: problem });

  const { owner } = await findSiteOwner(req, res);
  if (!owner) return;

  owner.passwordHash = await bcrypt.hash(temporaryPassword, 12);
  // The owner must replace it, so the super admin stops knowing their password.
  owner.mustChangePassword = true;
  // Ends every existing login, in case the old password was why it needed resetting.
  owner.sessionVersion = (owner.sessionVersion ?? 0) + 1;
  await owner.save();
  res.json(summarizeOwner(owner));
}

export async function setOwnerDisabled(req, res) {
  const { disabled } = req.body ?? {};
  if (typeof disabled !== 'boolean') {
    return res.status(400).json({ error: 'disabled must be true or false' });
  }

  const { owner } = await findSiteOwner(req, res);
  if (!owner) return;

  owner.disabled = disabled;
  // Logging out at once matters when disabling, so a disabled owner isn't left with a working session.
  if (disabled) owner.sessionVersion = (owner.sessionVersion ?? 0) + 1;
  await owner.save();
  res.json(summarizeOwner(owner));
}
