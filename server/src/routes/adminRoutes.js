import { Router } from 'express';
import {
  addNote,
  detail,
  list,
  login,
  me,
  stats,
  updateStatus,
  updateTriage,
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import {
  addNoteSchema,
  complaintIdParamSchema,
  listQuerySchema,
  loginSchema,
  updateStatusSchema,
  updateTriageSchema,
} from '../validators/schemas.js';

const router = Router();

// Only login is public; everything below requires a valid admin JWT.
router.post('/auth/login', loginLimiter, validate(loginSchema), login);

router.use(requireAdmin);

router.get('/auth/me', me);
router.get('/stats', stats);
router.get('/complaints', validate(listQuerySchema, 'query'), list);
router.get('/complaints/:complaintId', validate(complaintIdParamSchema, 'params'), detail);
router.patch(
  '/complaints/:complaintId/status',
  validate(complaintIdParamSchema, 'params'),
  validate(updateStatusSchema),
  updateStatus
);
router.post(
  '/complaints/:complaintId/notes',
  validate(complaintIdParamSchema, 'params'),
  validate(addNoteSchema),
  addNote
);
router.patch(
  '/complaints/:complaintId',
  validate(complaintIdParamSchema, 'params'),
  validate(updateTriageSchema),
  updateTriage
);

export default router;
