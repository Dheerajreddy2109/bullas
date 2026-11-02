import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getCurrentUser, login, logout } from '../controllers/authController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireJson } from '../middleware/requireJson.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  // Only failures count, so a correct login doesn't use up an attempt.
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes' },
});

const router = Router();

router.post('/login', requireJson, loginLimiter, login);
router.post('/logout', requireJson, logout);
router.get('/me', requireAuth, getCurrentUser);

export default router;
