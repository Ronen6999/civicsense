import { Router } from 'express';
import { getPublicConfig, submitComplaint, trackComplaint } from '../controllers/publicController.js';
import { submitLimiter, trackLimiter } from '../middleware/rateLimiters.js';
import { uploadSingleImage } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { submitComplaintSchema, trackComplaintSchema } from '../validators/schemas.js';

const router = Router();

router.get('/config', getPublicConfig);

// Rate limit first, then parse the (optional) multipart image, then validate text fields.
router.post('/complaints', submitLimiter, uploadSingleImage, validate(submitComplaintSchema), submitComplaint);

// POST (not GET) so the tracking token never appears in URLs or access logs.
router.post('/complaints/track', trackLimiter, validate(trackComplaintSchema), trackComplaint);

export default router;
