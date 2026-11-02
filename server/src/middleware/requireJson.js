// Customer sites share bullas.in, so SameSite won't stop them. Browsers won't send JSON
// to another host unless CORS allows it, and it never does here.
export function requireJson(req, res, next) {
  if (!req.get('content-type')?.startsWith('application/json')) {
    return res.status(415).json({ error: 'Request must be JSON' });
  }
  next();
}
