import express from 'express';
import cookieParser from 'cookie-parser';
import { resolveSite, requireSite } from './middleware/resolveSite.js';
import authRoutes from './routes/auth.js';

const app = express();

// Without this, req.body is undefined when a client sends JSON.
app.use(express.json());
// The login token lives in a cookie, so routes need cookies parsed.
app.use(cookieParser());

app.use('/api/auth', authRoutes);

// Lets us (and later AWS monitoring) check the server is alive without touching site data.
// The /api prefix stops data routes clashing with website pages like /blog.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/site', resolveSite, requireSite, (req, res) => {
  // Same response as an unknown site, so visitors can't discover unpublished sites.
  if (req.site.status !== 'published') {
    return res.status(404).json({ error: 'Site not found' });
  }

  // An explicit list, so private fields added to Site later can't leak by default.
  const { name, subdomain, content } = req.site;
  res.json({ name, subdomain, content });
});

export default app;
