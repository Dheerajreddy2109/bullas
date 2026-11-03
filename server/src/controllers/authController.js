import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import { AUTH_COOKIE, isAdminHost, signToken } from '../middleware/requireAuth.js';
import { findSiteByHostname } from '../middleware/resolveSite.js';
import { passwordProblem } from '../utils/passwordRules.js';

const EIGHT_HOURS = 8 * 60 * 60 * 1000;

// No Domain option: the browser then sends this cookie only to the address that set it,
// so a login on one site is never sent to another site or to the admin area.
const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

// Compared when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('no-account-has-this-password', 12);

// The address decides which accounts can log in here, so an owner can't log in elsewhere.
async function findAccount(req, email) {
  if (isAdminHost(req)) {
    return User.findOne({ email, role: 'superadmin' }).select('+passwordHash');
  }

  const site = await findSiteByHostname(req.hostname);
  if (!site) return null;
  return User.findOne({ email, role: 'siteowner', siteId: site._id }).select('+passwordHash');
}

function publicUser({ name, email, role, siteId, mustChangePassword }) {
  return { name, email, role, siteId, mustChangePassword };
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};

  // Strings only: an object like { $ne: null } would act as a database operator.
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'Wrong email or password' });
  }

  const user = await findAccount(req, email.toLowerCase().trim());

  const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  // One message for both cases, so attackers can't learn which emails exist.
  if (!user || !matches) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }

  // Checked only after the password matches, so this can't be used to find out who is disabled.
  if (user.disabled) {
    return res.status(403).json({ error: 'This account is disabled. Contact the Bullas administrator.' });
  }

  // TODO(2FA): when user.twoFactorEnabled is true, don't set the cookie yet. Ask for the
  // authenticator app's 6-digit code, verify it against the user's stored secret, then log in.
  setLoginCookie(res, user);
  res.json(publicUser(user));
}

function setLoginCookie(res, user) {
  res.cookie(AUTH_COOKIE, signToken(user), { ...cookieOptions, maxAge: EIGHT_HOURS });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body ?? {};

  // Asks for the current password, so a browser left logged in can't be taken over.
  if (typeof currentPassword !== 'string') {
    return res.status(401).json({ error: 'Current password is wrong' });
  }
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(401).json({ error: 'Current password is wrong' });
  }

  const problem = passwordProblem(newPassword);
  if (problem) {
    return res.status(400).json({ error: problem });
  }
  // Otherwise the person who chose the temporary password would still know it.
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'Choose a different password' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.mustChangePassword = false;
  // Ends every other login, such as a browser someone else used with the old password.
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  await user.save();
  // A fresh cookie, so the person who just changed it stays logged in here.
  setLoginCookie(res, user);
  res.json(publicUser(user));
}

export function logout(req, res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
  res.json({ status: 'logged out' });
}

export function getCurrentUser(req, res) {
  res.json(publicUser(req.user));
}
