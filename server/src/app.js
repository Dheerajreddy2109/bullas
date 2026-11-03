import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import adminSiteRoutes from './routes/adminSites.js';
import sitesRoutes from './routes/sites.js';
import siteContentRoutes from './routes/siteContent.js';
import blogRoutes from './routes/blog.js';
import siteRoutes from './routes/site.js';
import ownerRoutes from './routes/owner.js';
import { UPLOAD_ROOT } from './services/imageStorage.js';

const app = express();

// Without this, req.body is undefined when a client sends JSON.
// 1 MB because a full site's Telugu content can pass the default 100 KB.
app.use(express.json({ limit: '1mb' }));
// The login token lives in a cookie, so routes need cookies parsed.
app.use(cookieParser());

app.use(
  '/uploads',
  express.static(UPLOAD_ROOT, {
    index: false,
    dotfiles: 'deny',
    setHeaders(res) {
      // Stops a browser treating an upload as a page or script, whatever is inside it.
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'");
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminSiteRoutes);
// Before sitesRoutes, whose router-wide super admin check would otherwise refuse site owners.
app.use('/api/sites/:id/blog', blogRoutes);
app.use('/api/sites/:id', siteContentRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/owner', ownerRoutes);

// Lets us (and later AWS monitoring) check the server is alive without touching site data.
// The /api prefix stops data routes clashing with website pages like /blog.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Express's default error page can expose file paths, so unexpected errors get a plain message.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.status ?? err.statusCode ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong' : 'Bad request' });
});

export default app;
