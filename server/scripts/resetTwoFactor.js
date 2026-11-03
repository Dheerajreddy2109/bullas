// Recovery for an admin-area account that lost both its phone and its backup codes.
// Run on the server: node --env-file=.env scripts/resetTwoFactor.js
// It only works with access to the server itself, which is what makes it safe to have.
import { createInterface } from 'node:readline/promises';
import mongoose from 'mongoose';
import { connectDB } from '../src/db.js';
import { clearTwoFactor } from '../src/services/twoFactor.js';
import User from '../models/User.js';

const terminal = createInterface({ input: process.stdin, output: process.stdout });

try {
  const email = (await terminal.question('Email of the super admin or builder to reset: ')).trim().toLowerCase();
  await connectDB();

  const user = await User.findOne({ email, role: { $in: ['superadmin', 'builder'] } }).select(
    '+twoFactorSecret +twoFactorPendingSecret +twoFactorBackupCodes +twoFactorLastStep'
  );
  if (!user) throw new Error(`No super admin or builder has the email ${email}`);

  await clearTwoFactor(user);
  console.log(`Two-factor login reset for ${email}. They must set it up again at next login.`);
} catch (err) {
  console.error('Could not reset:', err.message);
  process.exitCode = 1;
} finally {
  terminal.close();
  await mongoose.disconnect();
}
