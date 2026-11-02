import { Router } from 'express';
import { getPublicSite } from '../controllers/siteController.js';
import { resolveSite, requireSite } from '../middleware/resolveSite.js';

const router = Router();

router.get('/', resolveSite, requireSite, getPublicSite);

export default router;
