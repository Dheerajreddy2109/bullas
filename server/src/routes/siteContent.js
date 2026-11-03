import { Router } from 'express';
import {
  getSiteContent,
  updateSiteContent,
  uploadSiteImage,
} from '../controllers/siteContentController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireJson } from '../middleware/requireJson.js';
import { requireSiteAccess } from '../middleware/requireSiteAccess.js';
import { requireUploadHeader, uploadImage } from '../middleware/uploadImage.js';

// mergeParams lets these routes read the :id from where this router is connected in app.js.
const router = Router({ mergeParams: true });

// Listed on each route, not router.use, so other /api/sites/:id URLs pass through to their own checks.
const canManage = [requireAuth, requireSiteAccess];

router.get('/content', canManage, getSiteContent);
router.put('/content', requireJson, canManage, updateSiteContent);
// Permission comes first, so a refused request never gets to send a file.
router.post('/upload', canManage, requireUploadHeader, uploadImage, uploadSiteImage);

export default router;
