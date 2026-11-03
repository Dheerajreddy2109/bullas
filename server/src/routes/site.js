import { Router } from 'express';
import { getPublicBlog, getPublicPost, getPublicSite } from '../controllers/siteController.js';
import { resolveSite, requireSite } from '../middleware/resolveSite.js';

const router = Router();

// On the router, so every public route works out the site from the address first.
router.use(resolveSite, requireSite);

router.get('/', getPublicSite);
router.get('/blog', getPublicBlog);
router.get('/blog/:slug', getPublicPost);

export default router;
