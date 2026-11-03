import { randomBytes } from 'node:crypto';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// The only file that touches the disk, so moving to S3 means rewriting just this one.
export const UPLOAD_ROOT = path.resolve(import.meta.dirname, '../../uploads');

export async function countSiteImages(siteId) {
  try {
    return (await readdir(path.join(UPLOAD_ROOT, String(siteId)))).length;
  } catch (err) {
    if (err.code === 'ENOENT') return 0;
    throw err;
  }
}

export async function saveSiteImage(siteId, buffer, extension) {
  const folder = path.join(UPLOAD_ROOT, String(siteId));
  await mkdir(folder, { recursive: true });

  // A random name, so a sender's file name can never choose where the file is written.
  const fileName = `${randomBytes(16).toString('hex')}.${extension}`;
  await writeFile(path.join(folder, fileName), buffer);
  return `/uploads/${siteId}/${fileName}`;
}
