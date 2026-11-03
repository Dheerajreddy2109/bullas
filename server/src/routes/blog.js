import { Router } from 'express';
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
  setPostStatus,
  updatePost,
} from '../controllers/blogController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireJson } from '../middleware/requireJson.js';
import { requireSiteAccess } from '../middleware/requireSiteAccess.js';

// mergeParams lets these routes read the site's :id from where this router is connected.
const router = Router({ mergeParams: true });

// On the router, so a route added here later can't forget the canManageSite check.
router.use(requireAuth, requireSiteAccess);

router.get('/', listPosts);
router.post('/', requireJson, createPost);
router.get('/:postId', getPost);
router.put('/:postId', requireJson, updatePost);
router.patch('/:postId/status', requireJson, setPostStatus);
router.delete('/:postId', deletePost);

export default router;
