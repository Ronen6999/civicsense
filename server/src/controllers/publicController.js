import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  deleteImage,
  isImageUploadEnabled,
  uploadComplaintImage,
} from '../services/cloudinaryService.js';
import {
  createComplaint,
  findByCredentials,
  toPublicTracking,
} from '../services/complaintService.js';
import { env } from '../config/env.js';
import { analyseComplaint, hashImage, isAiAnalysisEnabled } from '../services/aiService.js';

/** Lets the client know which optional features this server has enabled. */
export const getPublicConfig = (_req, res) => {
  res.json({
    imageUploadEnabled: isImageUploadEnabled(),
    aiAnalysisEnabled: isAiAnalysisEnabled(),
    maxImageSizeMb: Math.round(env.maxImageSizeBytes / 1024 / 1024),
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  });
};

export const submitComplaint = asyncHandler(async (req, res) => {
  const data = req.valid.body;

  let image = null;
  if (req.file) {
    if (!isImageUploadEnabled()) {
      throw ApiError.unavailable('Image uploads are not enabled on this server. Please submit without an image.');
    }
    try {
      image = await uploadComplaintImage(req.file.buffer);
    } catch (err) {
      console.error('Cloudinary upload failed:', err.message);
      throw new ApiError(502, 'The image could not be uploaded. Try again, or submit without an image.');
    }
  }

  let result;
  try {
    result = await createComplaint({ ...data, image, imageHash: hashImage(req.file?.buffer) });
  } catch (err) {
    await deleteImage(image?.publicId);
    throw err;
  }

  const { complaint, trackingToken } = result;
  // Wait for the initial AI classification so the complaint is created with
  // category, priority, and department already assigned. A Groq failure must
  // not prevent the complaint itself from being submitted.
  try {
    await analyseComplaint({ complaint, imageBuffer: req.file?.buffer, imageMimeType: req.file?.mimetype });
  } catch (err) {
    console.error('AI complaint analysis failed:', err.message);
  }
  // The raw token is only ever sent here, once. It cannot be recovered later.
  res.status(201).json({
    complaintId: complaint.complaintId,
    trackingToken,
    status: complaint.status,
    createdAt: complaint.createdAt,
  });
});

export const trackComplaint = asyncHandler(async (req, res) => {
  const { complaintId, token } = req.valid.body;
  const complaint = await findByCredentials(complaintId, token);
  if (!complaint) {
    // Same response for unknown ID and wrong token.
    throw ApiError.notFound('No complaint matches that complaint ID and tracking token.');
  }
  res.json({ complaint: toPublicTracking(complaint) });
});
