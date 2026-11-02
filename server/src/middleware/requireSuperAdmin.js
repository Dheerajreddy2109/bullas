import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

export const AUTH_COOKIE = 'bullas_admin';

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_HOST = `admin.${process.env.ROOT_DOMAIN?.toLowerCase()}`;
// Marks the token's purpose, so a future site owner token can't pass as a super admin one.
const AUDIENCE = 'superadmin';

// A short secret can be guessed offline, and anyone who guesses it can forge tokens.
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters. Check server/.env');
}

export function signSuperAdminToken(user) {
  return jwt.sign({ role: user.role }, JWT_SECRET, {
    subject: user._id.toString(),
    audience: AUDIENCE,
    algorithm: 'HS256',
    // A JWT can't be cancelled, so a short life limits how long a stolen one works.
    expiresIn: '8h',
  });
}

// Customer domains must not even offer super admin login, so they get a plain 404.
export function requireAdminHost(req, res, next) {
  if (req.hostname?.toLowerCase() !== ADMIN_HOST) {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
}

export async function requireSuperAdmin(req, res, next) {
  if (req.hostname?.toLowerCase() !== ADMIN_HOST) {
    return res.status(404).json({ error: 'Not found' });
  }

  let payload;
  try {
    // Fixing the algorithm stops a forged token from choosing a weaker one.
    payload = jwt.verify(req.cookies?.[AUTH_COOKIE], JWT_SECRET, {
      algorithms: ['HS256'],
      audience: AUDIENCE,
    });
  } catch {
    return res.status(401).json({ error: 'Not logged in' });
  }

  // Checked every time, so a removed admin loses access before the token expires.
  const user = await User.findOne({ _id: payload.sub, role: 'superadmin' });
  if (!user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  req.user = user;
  next();
}
