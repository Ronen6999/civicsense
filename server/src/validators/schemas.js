import { z } from 'zod';
import {
  CATEGORIES,
  DEPARTMENTS,
  LANGUAGES,
  PRIORITIES,
  STATUSES,
} from '../constants/complaint.js';
import { cleanText } from '../utils/text.js';

const text = (min, max, label) =>
  z
    .string({ required_error: `${label} is required.`, invalid_type_error: `${label} must be text.` })
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(min, `${label} must be at least ${min} characters.`)
        .max(max, `${label} must be at most ${max} characters.`)
    );

export const submitComplaintSchema = z.object({
  title: text(5, 150, 'Title'),
  description: text(20, 5000, 'Description'),
  location: text(2, 120, 'Location'),
  language: z.enum(LANGUAGES, { errorMap: () => ({ message: 'Language must be "en" or "as".' }) }),
  category: z.enum(CATEGORIES).optional(),
});

export const trackComplaintSchema = z.object({
  complaintId: z
    .string({ required_error: 'Complaint ID is required.' })
    .trim()
    .min(1, 'Complaint ID is required.')
    .max(40),
  token: z
    .string({ required_error: 'Tracking token is required.' })
    .trim()
    .min(1, 'Tracking token is required.')
    .max(60),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required.' }).trim().toLowerCase().email('Enter a valid email.'),
  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password is required.').max(200),
});

export const complaintIdParamSchema = z.object({
  complaintId: z.string().trim().toUpperCase().min(1).max(40),
});

export const listQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    status: z.enum(STATUSES).optional(),
    category: z.enum(CATEGORIES).optional(),
    priority: z.enum(PRIORITIES).optional(),
    review: z.enum(['all', 'flagged']).default('all'),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be YYYY-MM-DD').optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be YYYY-MM-DD').optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(['newest', 'oldest']).default('newest'),
  })
  .transform((q) => {
    const out = { ...q };
    out.search = q.search ? cleanText(q.search) : undefined;
    out.from = q.from ? new Date(`${q.from}T00:00:00.000Z`) : undefined;
    out.to = q.to ? new Date(`${q.to}T23:59:59.999Z`) : undefined;
    return out;
  })
  .refine((q) => !(q.from && Number.isNaN(q.from.getTime())), { message: 'from is not a valid date.' })
  .refine((q) => !(q.to && Number.isNaN(q.to.getTime())), { message: 'to is not a valid date.' });

export const updateStatusSchema = z.object({
  status: z.enum(STATUSES, { errorMap: () => ({ message: `Status must be one of: ${STATUSES.join(', ')}.` }) }),
});

export const addNoteSchema = z.object({
  text: text(1, 2000, 'Note'),
});

export const updateTriageSchema = z
  .object({
    assignedDepartment: z.enum(DEPARTMENTS).nullable().optional(),
    category: z.enum(CATEGORIES).nullable().optional(),
    priority: z.enum(PRIORITIES).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field to update.' });
