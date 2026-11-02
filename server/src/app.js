import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import adminSiteRoutes from './routes/adminSites.js';
import siteRoutes from './routes/site.js';

const app = express();

// Without this, req.body is undefined when a client sends JSON.
app.use(express.json());
// The login token lives in a cookie, so routes need cookies parsed.
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminSiteRoutes);
app.use('/api/site', siteRoutes);

// Lets us (and later AWS monitoring) check the server is alive without touching site data.
// The /api prefix stops data routes clashing with website pages like /blog.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
