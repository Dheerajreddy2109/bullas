import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import { AUTH_COOKIE, isAdminHost, signToken } from '../middleware/requireAuth.js';
import { findSiteByHostname } from '../middleware/resolveSite.js';

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

function publicUser({ name, email, role, siteId }) {
  return { name, email, role, siteId };
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

  // TODO(2FA): when user.twoFactorEnabled is true, don't set the cookie yet. Ask for the
  // authenticator app's 6-digit code, verify it against the user's stored secret, then log in.
  res.cookie(AUTH_COOKIE, signToken(user), { ...cookieOptions, maxAge: EIGHT_HOURS });
  res.json(publicUser(user));
}

export function logout(req, res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
  res.json({ status: 'logged out' });
}

export function getCurrentUser(req, res) {
  res.json(publicUser(req.user));
}
