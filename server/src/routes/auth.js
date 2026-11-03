import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { changePassword, getCurrentUser, login, logout, verifyLoginCode } from '../controllers/authController.js';
import { confirmTwoFactor, disableTwoFactor, setupTwoFactor } from '../controllers/twoFactorController.js';
import { requireLogin, requirePasswordChanged } from '../middleware/requireAuth.js';
import { requireJson } from '../middleware/requireJson.js';

// Off on your computer so testing logins never locks you out, and on automatically on the live
// server (NODE_ENV=production), so it can't be forgotten. LOGIN_LIMIT=on forces it on for tests.
// Checked on every request rather than once, so a test can switch it on before it runs.
const limitEnabled = () => process.env.NODE_ENV === 'production' || process.env.LOGIN_LIMIT === 'on';

// A function, so each route counts its own attempts.
const attemptLimiter = () =>
  rateLimit({
    skip: () => !limitEnabled(),
    windowMs: 15 * 60 * 1000,
    limit: 5,
    // Only failures count, so a correct attempt doesn't use one up.
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Try again in 15 minutes' },
  });

const router = Router();

router.post('/login', requireJson, attemptLimiter(), login);
router.post('/logout', requireJson, logout);
// requireLogin, not requireAuth: these must work while a temporary password is still in use.
router.get('/me', requireLogin, getCurrentUser);
router.post('/change-password', requireJson, requireLogin, attemptLimiter(), changePassword);

// The second login step: limited like passwords, because 6-digit codes could otherwise be guessed.
router.post('/2fa/verify', requireJson, attemptLimiter(), verifyLoginCode);
// Allowed before 2FA is set up (that's the point), but only after a temporary password is replaced.
const canSetUp = [requireLogin, requirePasswordChanged];
router.post('/2fa/setup', requireJson, canSetUp, setupTwoFactor);
router.post('/2fa/enable', requireJson, canSetUp, attemptLimiter(), confirmTwoFactor);
router.post('/2fa/disable', requireJson, canSetUp, attemptLimiter(), disableTwoFactor);

export default router;
