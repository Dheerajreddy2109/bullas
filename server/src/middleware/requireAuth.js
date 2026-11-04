import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { findSiteByHostname } from './resolveSite.js';
import { twoFactorRequiredFor } from '../services/twoFactor.js';

export const AUTH_COOKIE = 'bullas_session';
// Holds the 'password correct, code still needed' state between the two login steps.
export const TWO_FACTOR_COOKIE = 'bullas_2fa';
const TWO_FACTOR_AUDIENCE = 'bullas-2fa-pending';

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_HOST = `admin.${process.env.ROOT_DOMAIN?.toLowerCase()}`;
// Marks what the token is for, so a token signed for another purpose can't log anyone in.
const AUDIENCE = 'bullas-login';

// A short secret can be guessed offline, and anyone who guesses it can forge tokens.
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters. Check server/.env');
}

export function signToken(user) {
  return jwt.sign({ role: user.role, sv: user.sessionVersion ?? 0 }, JWT_SECRET, {
    subject: user._id.toString(),
    audience: AUDIENCE,
    algorithm: 'HS256',
    // A JWT can't be cancelled, so a short life limits how long a stolen one works.
    expiresIn: '8h',
  });
}

// A different audience from a login token, so this half-step can never be used as a login.
// Five minutes is enough to open the app and type a code.
export function signPendingToken(user) {
  return jwt.sign({ sv: user.sessionVersion ?? 0 }, JWT_SECRET, {
    subject: user._id.toString(),
    audience: TWO_FACTOR_AUDIENCE,
    algorithm: 'HS256',
    expiresIn: '5m',
  });
}

export function readPendingToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'], audience: TWO_FACTOR_AUDIENCE });
  } catch {
    return null;
  }
}

export function isAdminHost(req) {
  return req.hostname?.toLowerCase() === ADMIN_HOST;
}

// Customer domains must not even reveal the admin area exists, so they get a plain 404.
export function requireAdminHost(req, res, next) {
  if (!isAdminHost(req)) {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
}

// Checks who is asking, for the few routes someone with a temporary password may still use.
// Reads a login token without refusing the request, for logout, which must work even when expired.
export function readLoginToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'], audience: AUDIENCE });
  } catch {
    return null;
  }
}

export async function requireLogin(req, res, next) {
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

  // Loaded every time, so a removed account or changed role applies before the token expires.
  const user = await User.findById(payload.sub);
  // A token from before a password change, reset or disable no longer matches, so it stops working.
  if (!user || (payload.sv ?? 0) !== (user.sessionVersion ?? 0)) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  if (user.disabled) {
    return res.status(403).json({ error: 'This account is disabled', code: 'ACCOUNT_DISABLED' });
  }

  // A valid token only works at its own address, so one owner can't reach another site.
  let allowedHere;
  if (user.role === 'superadmin' || user.role === 'builder') {
    allowedHere = isAdminHost(req);
  } else if (isAdminHost(req)) {
    // Let it through so requireRole can refuse it with the clearer role error.
    allowedHere = true;
  } else {
    req.site ??= await findSiteByHostname(req.hostname);
    allowedHere = Boolean(req.site?._id.equals(user.siteId));
  }
  if (!allowedHere) {
    return res.status(403).json({ error: 'Not allowed here' });
  }

  req.user = user;
  next();
}

export function requirePasswordChanged(req, res, next) {
  if (req.user.mustChangePassword) {
    return res.status(403).json({
      error: 'Change your temporary password first',
      code: 'PASSWORD_CHANGE_REQUIRED',
    });
  }
  next();
}

// Staff on the live server must set up 2FA before doing anything else, like a temporary password.
function requireTwoFactorSetup(req, res, next) {
  if (twoFactorRequiredFor(req.user) && !req.user.twoFactorEnabled) {
    return res.status(403).json({
      error: 'Set up two-factor login first',
      code: 'TWO_FACTOR_SETUP_REQUIRED',
    });
  }
  next();
}

// The default for all routes, so a new route is blocked for temporary passwords and missing 2FA automatically.
export const requireAuth = [requireLogin, requirePasswordChanged, requireTwoFactorSetup];

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Not allowed here' });
    }
    next();
  };
}
