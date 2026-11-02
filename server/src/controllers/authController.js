import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import { AUTH_COOKIE, signSuperAdminToken } from '../middleware/requireSuperAdmin.js';

const EIGHT_HOURS = 8 * 60 * 60 * 1000;

// No Domain option: the browser then sends this cookie to the admin host only, not customer sites.
const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

// Compared when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('no-account-has-this-password', 12);

export async function login(req, res) {
  const { email, password } = req.body ?? {};

  // Strings only: an object like { $ne: null } would act as a database operator.
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'Wrong email or password' });
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    role: 'superadmin',
  }).select('+passwordHash');

  const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  // One message for both cases, so attackers can't learn which emails exist.
  if (!user || !matches) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }

  res.cookie(AUTH_COOKIE, signSuperAdminToken(user), { ...cookieOptions, maxAge: EIGHT_HOURS });
  res.json({ name: user.name, email: user.email, role: user.role });
}

export function logout(req, res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
  res.json({ status: 'logged out' });
}

export function getCurrentUser(req, res) {
  const { name, email, role } = req.user;
  res.json({ name, email, role });
}
