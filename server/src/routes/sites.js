import { Router } from 'express';
import {
  createSite,
  listSites,
  updateSiteStatus,
} from '../controllers/adminSiteController.js';
import {
  getSiteOwner,
  resetOwnerPassword,
  setOwnerDisabled,
} from '../controllers/ownerAdminController.js';
import { requireAdminHost, requireAuth, requireRole } from '../middleware/requireAuth.js';
import { requireJson } from '../middleware/requireJson.js';

const router = Router();

// On the router, so a route added here later can't forget the login check.
router.use(requireAdminHost, requireAuth, requireRole('superadmin'));

router.get('/', listSites);
router.post('/', requireJson, createSite);
router.patch('/:id/status', requireJson, updateSiteStatus);
router.get('/:id/owner', getSiteOwner);
router.post('/:id/owner/reset-password', requireJson, resetOwnerPassword);
router.patch('/:id/owner/status', requireJson, setOwnerDisabled);

export default router;
