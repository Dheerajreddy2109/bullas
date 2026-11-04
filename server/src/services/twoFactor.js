import { createHash, randomBytes } from 'node:crypto';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import { decrypt, encrypt } from '../utils/secretBox.js';

const ISSUER = 'Bullas';
const BACKUP_CODE_COUNT = 10;
// None: a code stops working the moment its timer ends. This needs the server's clock to be
// accurate, and a phone clock that is well off will fail until the phone's time is corrected.
const CLOCK_TOLERANCE_SECONDS = 0;

// Required for staff accounts on the live server; your computer can opt in with TWO_FACTOR_REQUIRED=true.
export function twoFactorEnforced() {
  return process.env.NODE_ENV === 'production' || process.env.TWO_FACTOR_REQUIRED === 'true';
}

export function twoFactorRequiredFor(user) {
  return twoFactorEnforced() && (user.role === 'superadmin' || user.role === 'builder');
}

export async function startSetup(user) {
  const secret = generateSecret();
  user.twoFactorPendingSecret = encrypt(secret);
  await user.save();

  const otpauthUrl = generateURI({ issuer: ISSUER, label: user.email, secret });
  return { otpauthUrl, qrDataUrl: await QRCode.toDataURL(otpauthUrl), manualKey: secret };
}

// Backup codes are long and random, so a fast hash is enough; bcrypt is for guessable passwords.
const hashCode = (code) => createHash('sha256').update(code.toLowerCase().replace(/[\s-]/g, '')).digest('hex');

function newBackupCodes() {
  const codes = Array.from({ length: BACKUP_CODE_COUNT }, () => {
    const raw = randomBytes(5).toString('hex');
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
  return { codes, hashes: codes.map(hashCode) };
}

// Checks a 6-digit code, refusing one that has already been used, so a code seen over
// someone's shoulder can't be replayed within its 30 seconds.
function checkAppCode(encryptedSecret, code, lastStep) {
  if (!/^\d{6}$/.test(code)) return null;
  const result = verifySync({ secret: decrypt(encryptedSecret), token: code, epochTolerance: CLOCK_TOLERANCE_SECONDS });
  if (!result.valid || result.timeStep <= (lastStep ?? -1)) return null;
  return result.timeStep;
}

export async function enableTwoFactor(user, code) {
  if (!user.twoFactorPendingSecret) return null;
  const step = checkAppCode(user.twoFactorPendingSecret, String(code ?? '').trim(), user.twoFactorLastStep);
  if (step === null) return null;

  const { codes, hashes } = newBackupCodes();
  user.twoFactorSecret = user.twoFactorPendingSecret;
  user.twoFactorPendingSecret = undefined;
  user.twoFactorBackupCodes = hashes;
  user.twoFactorLastStep = step;
  user.twoFactorEnabled = true;
  // Ends logins that were made without the second step.
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  await user.save();
  return codes;
}

// Accepts the app code or one unused backup code. A used backup code is removed, so it works once.
export async function checkSecondFactor(user, rawCode) {
  const code = String(rawCode ?? '').trim();
  if (!user.twoFactorEnabled || !user.twoFactorSecret) return false;

  const step = checkAppCode(user.twoFactorSecret, code, user.twoFactorLastStep);
  if (step !== null) {
    user.twoFactorLastStep = step;
    await user.save();
    return true;
  }

  const hash = hashCode(code);
  if (code.length >= 10 && user.twoFactorBackupCodes?.includes(hash)) {
    user.twoFactorBackupCodes = user.twoFactorBackupCodes.filter((item) => item !== hash);
    await user.save();
    return true;
  }
  return false;
}

// Used for turning it off, the super admin's reset, and the recovery script.
export async function clearTwoFactor(user) {
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorPendingSecret = undefined;
  user.twoFactorBackupCodes = [];
  user.twoFactorLastStep = undefined;
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  await user.save();
}
