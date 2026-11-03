import app from './app.js';
import { connectDB } from './db.js';
import { hasTwoFactorKey } from './utils/secretBox.js';

// AWS may need a different port than local development, so it must be configurable.
// Not 5000: macOS AirPlay Receiver often occupies it.
const PORT = process.env.PORT || 4000;

// Staff must use 2FA on the live server, which can't work without the encryption key.
if (process.env.NODE_ENV === 'production' && !hasTwoFactorKey()) {
  console.error('TWO_FACTOR_KEY must be set in server/.env on the live server');
  process.exit(1);
}

// Connect first: a server without its database would only return errors.
try {
  await connectDB();
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1);
}

// Kept apart from app.js so tests can use the app without opening a real port.
// HOST=127.0.0.1 on the live server, so only Caddy can reach Node and port 4000 isn't public.
app.listen(PORT, process.env.HOST, () => {
  console.log(`Bullas server running at http://localhost:${PORT}`);
});
