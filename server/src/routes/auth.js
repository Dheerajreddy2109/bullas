import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { changePassword, getCurrentUser, login, logout } from '../controllers/authController.js';
import { requireLogin } from '../middleware/requireAuth.js';
import { requireJson } from '../middleware/requireJson.js';

// A function, so each route counts its own attempts.
const attemptLimiter = () =>
  rateLimit({
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

export default router;
