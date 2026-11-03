import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

let configured = false;

function configure() {
  if (configured) return;
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  configured = true;
}

/** Configure Cloudinary once when image uploads are enabled. */
export function initializeCloudinary() {
  if (!env.cloudinary.enabled) return false;
  configure();
  return true;
}

export const isImageUploadEnabled = () => env.cloudinary.enabled;

/**
 * Upload an image buffer to Cloudinary.
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export function uploadComplaintImage(buffer) {
  configure();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'civicsense/complaints',
        resource_type: 'image',
        // Strip EXIF (including GPS) so uploaders stay anonymous.
        transformation: [{ flags: 'strip_profile' }],
        allowed_formats: ['jpg', 'png', 'webp'],
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/** Best-effort cleanup, used if the database write fails after a successful upload. */
export async function deleteImage(publicId) {
  if (!publicId || !env.cloudinary.enabled) return;
  configure();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Failed to delete orphaned image', publicId, err.message);
  }
}
