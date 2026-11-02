import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../src/db.js';
import Site from '../models/Site.js';
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
  const subdomain = (await terminal.question('Site subdomain: ')).trim().toLowerCase();
  const name = (await terminal.question('Owner name: ')).trim();
  const email = (await terminal.question('Owner email: ')).trim();
  const password = await askHidden('Password: ');
  const confirmation = await askHidden('Repeat password: ');

  if (!name) {
    throw new Error('The owner needs a name');
  }
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

  const site = await Site.findOne({ subdomain });
  if (!site) {
    throw new Error(`No site has the subdomain "${subdomain}"`);
  }
  if (site.ownerId) {
    throw new Error(`The site "${subdomain}" already has an owner. Nothing changed`);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // A transaction saves both or neither, so a failure can't leave an owner without a site link.
  await mongoose.connection.transaction(async (session) => {
    const [owner] = await User.create(
      [{ name, email, passwordHash, role: 'siteowner', siteId: site._id }],
      { session }
    );
    site.ownerId = owner._id;
    await site.save({ session });
  });

  console.log(`Owner created for ${subdomain}: ${email.toLowerCase()}`);
} catch (err) {
  console.error('Could not create the owner:', err.message);
  process.exitCode = 1;
} finally {
  terminal.close();
  await mongoose.disconnect();
}
