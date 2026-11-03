import { Router } from 'express';
import { isDomainAllowed } from '../controllers/domainController.js';

const LOCAL_ADDRESSES = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

// Only Caddy on this same machine may ask. Requests Caddy forwards from the internet carry
// X-Forwarded-For, so those are refused even though they also arrive from 127.0.0.1.
function requireLocalCaller(req, res, next) {
  if (!LOCAL_ADDRESSES.includes(req.socket.remoteAddress) || req.get('x-forwarded-for')) {
    return res.status(404).end();
  }
  next();
}

const router = Router();

router.use(requireLocalCaller);
router.get('/domain-allowed', isDomainAllowed);

export default router;
