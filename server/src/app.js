import express from 'express';

const app = express();

// Without this, req.body is undefined when a client sends JSON.
app.use(express.json());

// Lets us (and later AWS monitoring) check the server is alive without touching site data.
// The /api prefix stops data routes clashing with website pages like /blog.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
