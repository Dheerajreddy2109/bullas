import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Site from '../../models/Site.js';
import User from '../../models/User.js';
import {
  checkSecondFactor,
  clearTwoFactor,
  enableTwoFactor,
  startSetup,
  twoFactorRequiredFor,
} from '../services/twoFactor.js';
import { hasTwoFactorKey } from '../utils/secretBox.js';
import { publicUser, setLoginCookie } from './authController.js';

const SECRET_FIELDS = '+twoFactorSecret +twoFactorPendingSecret +twoFactorBackupCodes +twoFactorLastStep';

function requireKey(res) {
  if (hasTwoFactorKey()) return true;
  res.status(503).json({ error: 'Two-factor login is not configured on this server yet (TWO_FACTOR_KEY)' });
  return false;
}

export async function setupTwoFactor(req, res) {
  if (!requireKey(res)) return;
  if (req.user.twoFactorEnabled) {
    return res.status(409).json({ error: 'Two-factor login is already on' });
  }
  res.json(await startSetup(await User.findById(req.user._id).select(SECRET_FIELDS)));
}

export async function confirmTwoFactor(req, res) {
  if (!requireKey(res)) return;
  const user = await User.findById(req.user._id).select(SECRET_FIELDS);
  if (user.twoFactorEnabled) {
    return res.status(409).json({ error: 'Two-factor login is already on' });
  }

  const backupCodes = await enableTwoFactor(user, req.body?.code);
  if (!backupCodes) {
    return res.status(400).json({ error: 'That code is wrong or expired. Wait for the next code in your phone app and try again' });
  }

  // Turning it on ended other logins, so this browser gets a fresh one.
  setLoginCookie(res, user);
  // The only time the plain backup codes exist; the database keeps hashes.
  res.json({ backupCodes, user: publicUser(user) });
}

export async function disableTwoFactor(req, res) {
  if (twoFactorRequiredFor(req.user)) {
    return res.status(403).json({ error: 'Two-factor login is required for this account' });
  }

  const { password, code } = req.body ?? {};
  const user = await User.findById(req.user._id).select(`+passwordHash ${SECRET_FIELDS}`);
  // Both factors, so a browser someone left logged in can't be used to switch it off.
  const passwordOk = typeof password === 'string' && (await bcrypt.compare(password, user.passwordHash));
  if (!passwordOk || !(await checkSecondFactor(user, code))) {
    return res.status(401).json({ error: 'Wrong password or code' });
  }

  await clearTwoFactor(user);
  setLoginCookie(res, user);
  res.json(publicUser(user));
}

// Super admin only: for a builder or owner who lost their phone and backup codes.
async function resetFor(res, user) {
  if (!user) return res.status(404).json({ error: 'User not found' });
  await clearTwoFactor(await User.findById(user._id).select(SECRET_FIELDS));
  res.json({ twoFactorEnabled: false });
}

export async function resetBuilderTwoFactor(req, res) {
  if (!mongoose.isValidObjectId(req.params.userId)) return res.status(400).json({ error: 'Invalid user ID' });
  await resetFor(res, await User.findOne({ _id: req.params.userId, role: 'builder' }));
}

export async function resetOwnerTwoFactor(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid site ID' });
  const site = await Site.findById(req.params.id).select('ownerId');
  const owner = site?.ownerId
    ? await User.findOne({ _id: site.ownerId, siteId: site._id, role: 'siteowner' })
    : null;
  await resetFor(res, owner);
}
