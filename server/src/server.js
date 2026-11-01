import app from './app.js';

// AWS may need a different port than local development, so it must be configurable.
// Not 5000: macOS AirPlay Receiver often occupies it.
const PORT = process.env.PORT || 4000;

// Kept apart from app.js so tests can use the app without opening a real port.
app.listen(PORT, () => {
  console.log(`Bullas server running at http://localhost:${PORT}`);
});
