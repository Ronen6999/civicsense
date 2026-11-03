import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const multerInstance = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxImageSizeBytes, files: 1, fields: 10, fieldSize: 20 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(ApiError.badRequest('Only JPEG, PNG or WebP images are allowed.'));
    }
    return cb(null, true);
  },
});

/** Check the real file signature, since the client-declared MIME type can be faked. */
function looksLikeAllowedImage(buf) {
  if (!buf || buf.length < 12) return false;
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isPng = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp =
    buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
  return isJpeg || isPng || isWebp;
}

export const uploadSingleImage = [
  multerInstance.single('image'),
  (req, _res, next) => {
    if (req.file && !looksLikeAllowedImage(req.file.buffer)) {
      return next(ApiError.badRequest('The uploaded file is not a valid JPEG, PNG or WebP image.'));
    }
    return next();
  },
];
