import { Router } from 'express';
import {
  assignSiteBuilder,
  createSite,
  listSites,
  updateSiteStatus,
} from '../controllers/adminSiteController.js';
import { getDomain, removeDomain, setDomain, verifyDomain } from '../controllers/domainController.js';
import {
  getSiteOwner,
  resetOwnerPassword,
  setOwnerDisabled,
} from '../controllers/ownerAdminController.js';
import { resetOwnerTwoFactor } from '../controllers/twoFactorController.js';
import { requireAdminHost, requireAuth, requireRole } from '../middleware/requireAuth.js';
import { requireJson } from '../middleware/requireJson.js';

const router = Router();
const superAdminOnly = requireRole('superadmin');

// On the router, so a route added here later can't forget the login check.
// Builders pass this, so each route below must also check which sites are theirs.
router.use(requireAdminHost, requireAuth, requireRole('superadmin', 'builder'));

router.get('/', listSites);
router.post('/', requireJson, createSite);
router.patch('/:id/status', requireJson, updateSiteStatus);

// Owners, domains and assignments are kept for the super admin, as agreed.
router.patch('/:id/builder', superAdminOnly, requireJson, assignSiteBuilder);
router.get('/:id/owner', superAdminOnly, getSiteOwner);
router.post('/:id/owner/reset-password', superAdminOnly, requireJson, resetOwnerPassword);
router.patch('/:id/owner/status', superAdminOnly, requireJson, setOwnerDisabled);
router.post('/:id/owner/two-factor/reset', superAdminOnly, requireJson, resetOwnerTwoFactor);
router.get('/:id/domain', superAdminOnly, getDomain);
router.put('/:id/domain', superAdminOnly, requireJson, setDomain);
router.post('/:id/domain/verify', superAdminOnly, requireJson, verifyDomain);
router.delete('/:id/domain', superAdminOnly, removeDomain);

export default router;
