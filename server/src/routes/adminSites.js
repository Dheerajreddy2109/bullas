import { Router } from 'express';
import {
  createSite,
  listSites,
  listTemplates,
  updateSiteStatus,
} from '../controllers/adminSiteController.js';
import { requireSuperAdmin } from '../middleware/requireSuperAdmin.js';
import { requireJson } from '../middleware/requireJson.js';

const router = Router();

// On the router, so a route added here later can't forget the login check.
router.use(requireSuperAdmin);

router.get('/templates', listTemplates);
router.get('/sites', listSites);
router.post('/sites', requireJson, createSite);
router.patch('/sites/:id/status', requireJson, updateSiteStatus);

export default router;
