import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // A missing value otherwise produces a confusing driver error.
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Check server/.env');
  }

  // Fail after 10 seconds so a bad connection doesn't look like a frozen server.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connected');
}
