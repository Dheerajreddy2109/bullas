import { Router } from 'express';
import {
  createBuilder,
  getBuilder,
  listBuilders,
  resetBuilderPassword,
  setBuilderDisabled,
} from '../controllers/userController.js';
import { resetBuilderTwoFactor } from '../controllers/twoFactorController.js';
import { requireAdminHost, requireAuth, requireRole } from '../middleware/requireAuth.js';
import { requireJson } from '../middleware/requireJson.js';

const router = Router();

// On the router, so a route added here later is also super admin only.
router.use(requireAdminHost, requireAuth, requireRole('superadmin'));

router.get('/', listBuilders);
router.post('/', requireJson, createBuilder);
router.get('/:userId', getBuilder);
router.post('/:userId/reset-password', requireJson, resetBuilderPassword);
router.patch('/:userId/status', requireJson, setBuilderDisabled);
router.post('/:userId/two-factor/reset', requireJson, resetBuilderTwoFactor);

export default router;
