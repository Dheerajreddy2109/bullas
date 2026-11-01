import app from './app.js';
import { connectDB } from './db.js';

// AWS may need a different port than local development, so it must be configurable.
// Not 5000: macOS AirPlay Receiver often occupies it.
const PORT = process.env.PORT || 4000;

// Connect first: a server without its database would only return errors.
try {
  await connectDB();
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1);
}

// Kept apart from app.js so tests can use the app without opening a real port.
app.listen(PORT, () => {
  console.log(`Bullas server running at http://localhost:${PORT}`);
});
