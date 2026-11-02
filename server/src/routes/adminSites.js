import { Router } from 'express';
import { getTemplate, listTemplates } from '../controllers/adminSiteController.js';
import { requireAdminHost, requireAuth, requireRole } from '../middleware/requireAuth.js';

const router = Router();

// On the router, so a route added here later can't forget the login check.
router.use(requireAdminHost, requireAuth, requireRole('superadmin'));

router.get('/templates', listTemplates);
router.get('/templates/:slug', getTemplate);

export default router;
