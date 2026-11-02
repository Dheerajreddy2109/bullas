import { Router } from 'express';
import { getOwnSite } from '../controllers/ownerController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { resolveSite, requireSite } from '../middleware/resolveSite.js';

const router = Router();

// On the router, so a route added here later can't forget the checks.
router.use(resolveSite, requireSite, requireAuth, requireRole('siteowner'));

router.get('/site', getOwnSite);

export default router;
