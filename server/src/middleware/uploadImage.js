import multer from 'multer';

const TWO_MEGABYTES = 2 * 1024 * 1024;

const parseUpload = multer({
  // Kept in memory until it's checked, so a rejected file never reaches the disk.
  storage: multer.memoryStorage(),
  limits: { fileSize: TWO_MEGABYTES, files: 1 },
}).single('image');

// Browsers can send file uploads to another host without asking first, so customer sites could
// use a logged-in cookie. They can't add this header unless CORS allows it, and it never does.
export function requireUploadHeader(req, res, next) {
  if (req.get('x-bullas-upload') !== '1') {
    return res.status(403).json({ error: 'Not allowed here' });
  }
  next();
}

export function uploadImage(req, res, next) {
  parseUpload(req, res, (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Image must be 2 MB or smaller' });
    }
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Send one image in the "image" field' });
    }
    if (err) return next(err);
    next();
  });
}

// Reads the file's first bytes, because its name and declared type are only labels.
export function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.subarray(0, 8).equals(pngSignature)) {
    return 'png';
  }
  if (
    buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buffer.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}
