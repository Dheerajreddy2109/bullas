import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../src/db.js';
import User from '../models/User.js';

let hideInput = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    // Stops the terminal echoing keystrokes, so the password never appears on screen.
    if (!hideInput) process.stdout.write(chunk);
    callback();
  },
});
const terminal = createInterface({ input: process.stdin, output, terminal: true });

async function askHidden(prompt) {
  process.stdout.write(prompt);
  hideInput = true;
  const answer = await terminal.question('');
  hideInput = false;
  process.stdout.write('\n');
  return answer;
}

try {
  const email = (await terminal.question('New super admin email: ')).trim();
  const password = await askHidden('New password: ');
  const confirmation = await askHidden('Repeat password: ');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('That email does not look valid');
  }
  if (password !== confirmation) {
    throw new Error('The passwords do not match');
  }
  if (password.length < 12) {
    throw new Error('The password must be at least 12 characters');
  }
  // bcrypt ignores anything past 72 bytes, so a longer password would be weaker than it looks.
  if (Buffer.byteLength(password) > 72) {
    throw new Error('The password must be at most 72 bytes');
  }

  await connectDB();

  const admins = await User.find({ role: 'superadmin' });
  if (admins.length !== 1) {
    throw new Error(`Expected 1 super admin but found ${admins.length}. Nothing changed`);
  }

  const [admin] = admins;
  admin.email = email;
  // Cost 12 makes each guess slow for an attacker while a login still feels instant.
  admin.passwordHash = await bcrypt.hash(password, 12);
  await admin.save();
  console.log(`Super admin updated: ${admin.email}`);
} catch (err) {
  console.error('Could not update the super admin:', err.message);
  process.exitCode = 1;
} finally {
  terminal.close();
  await mongoose.disconnect();
}
