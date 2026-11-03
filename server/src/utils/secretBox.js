import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// 2FA secrets must be readable again to check codes, so they are encrypted rather than hashed.
// AES-256-GCM also detects tampering: a changed value fails to decrypt instead of giving garbage.
function key() {
  const hex = process.env.TWO_FACTOR_KEY ?? '';
  if (!/^[0-9a-f]{64}$/i.test(hex)) {
    throw new Error('TWO_FACTOR_KEY must be 64 hex characters. Check server/.env');
  }
  return Buffer.from(hex, 'hex');
}

export function hasTwoFactorKey() {
  return /^[0-9a-f]{64}$/i.test(process.env.TWO_FACTOR_KEY ?? '');
}

export function encrypt(text) {
  // A fresh random IV each time, so the same secret never encrypts to the same value twice.
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), data.toString('base64')].join(':');
}

export function decrypt(stored) {
  const [version, iv, tag, data] = stored.split(':');
  if (version !== 'v1') throw new Error('Unknown secret format');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
}
