import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import {
  AUTH_COOKIE,
  TWO_FACTOR_COOKIE,
  isAdminHost,
  readLoginToken,
  readPendingToken,
  signPendingToken,
  signToken,
} from '../middleware/requireAuth.js';
import { findSiteByHostname } from '../middleware/resolveSite.js';
import { checkSecondFactor, twoFactorRequiredFor } from '../services/twoFactor.js';
import { passwordProblem } from '../utils/passwordRules.js';

const EIGHT_HOURS = 8 * 60 * 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;

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

// Which accounts may log in at this address, so an owner can't log in elsewhere.
async function accountFilter(req) {
  if (isAdminHost(req)) return { role: { $in: ['superadmin', 'builder'] } };
  const site = await findSiteByHostname(req.hostname);
  return site ? { role: 'siteowner', siteId: site._id } : null;
}

export function publicUser(user) {
  const { name, email, role, siteId, mustChangePassword, twoFactorEnabled } = user;
  return { name, email, role, siteId, mustChangePassword, twoFactorEnabled, twoFactorRequired: twoFactorRequiredFor(user) };
}

export function setLoginCookie(res, user) {
  res.cookie(AUTH_COOKIE, signToken(user), { ...cookieOptions, maxAge: EIGHT_HOURS });
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};

  // Strings only: an object like { $ne: null } would act as a database operator.
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'Wrong email or password' });
  }

  const filter = await accountFilter(req);
  const user = filter
    ? await User.findOne({ email: email.toLowerCase().trim(), ...filter }).select('+passwordHash')
    : null;

  const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  // One message for both cases, so attackers can't learn which emails exist.
  if (!user || !matches) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }

  // Checked only after the password matches, so this can't be used to find out who is disabled.
  if (user.disabled) {
    return res.status(403).json({ error: 'This account is disabled. Contact the Bullas administrator.' });
  }

  // With 2FA on, a correct password only earns a short pass to the code step, never a login.
  if (user.twoFactorEnabled) {
    res.cookie(TWO_FACTOR_COOKIE, signPendingToken(user), { ...cookieOptions, maxAge: FIVE_MINUTES });
    return res.json({ twoFactorRequired: true });
  }

  setLoginCookie(res, user);
  res.json(publicUser(user));
}

export async function verifyLoginCode(req, res) {
  const payload = readPendingToken(req.cookies?.[TWO_FACTOR_COOKIE]);
  if (!payload) {
    return res.status(401).json({ error: 'Your login step expired. Enter your password again.' });
  }

  // Same address rules as the password step, and the account must be unchanged since then.
  const filter = await accountFilter(req);
  const user = filter
    ? await User.findOne({ _id: payload.sub, ...filter }).select(
        '+twoFactorSecret +twoFactorBackupCodes +twoFactorLastStep'
      )
    : null;
  if (!user || user.disabled || (payload.sv ?? 0) !== (user.sessionVersion ?? 0)) {
    return res.status(401).json({ error: 'Your login step expired. Enter your password again.' });
  }

  if (!(await checkSecondFactor(user, req.body?.code))) {
    return res.status(401).json({ error: 'That code is wrong or already used' });
  }

  res.clearCookie(TWO_FACTOR_COOKIE, cookieOptions);
  setLoginCookie(res, user);
  res.json(publicUser(user));
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

// Ends this account's sessions on every device, not just this browser, as agreed: anyone who
// logs out can be sure no other computer is still logged in as them.
export async function logout(req, res) {
  const payload = readLoginToken(req.cookies?.[AUTH_COOKIE]);
  // Only a still-valid token raises the version, so an old cookie can't log out a newer session.
  if (payload) {
    await User.updateOne(
      { _id: payload.sub, sessionVersion: payload.sv ?? 0 },
      { $inc: { sessionVersion: 1 } }
    );
  }

  res.clearCookie(AUTH_COOKIE, cookieOptions);
  res.clearCookie(TWO_FACTOR_COOKIE, cookieOptions);
  res.json({ status: 'logged out' });
}

export function getCurrentUser(req, res) {
  res.json(publicUser(req.user));
}
