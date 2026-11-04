import mongoose from 'mongoose';
import { CATEGORIES, DEPARTMENTS, LANGUAGES, PRIORITIES, STATUSES } from '../constants/complaint.js';

const { Schema } = mongoose;

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    changedAt: { type: Date, default: Date.now },
    // null for the initial "Submitted" entry (created by the complainant)
    changedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    changedByName: { type: String, default: null },
  },
  { _id: false }
);

const internalNoteSchema = new Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    author: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    authorName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const aiSummarySchema = new Schema(
  {
    summary: { type: String, default: null },
    imageAnalysis: { type: String, default: null },
    duplicateDetected: { type: Boolean, default: false },
    duplicateConfidence: { type: Number, min: 0, max: 1, default: null },
    duplicateOf: { type: String, default: null },
    duplicateReason: { type: String, default: null },
    spamDetected: { type: Boolean, default: false },
    spamConfidence: { type: Number, min: 0, max: 1, default: null },
    spamReason: { type: String, default: null },
    language: { type: String, enum: [...LANGUAGES, null], default: null },
    model: { type: String, default: null },
    generatedAt: { type: Date, default: null },
  },
  { _id: false }
);

const complaintSchema = new Schema(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    // HMAC-SHA256 of the tracking token. The raw token is never stored.
    trackingTokenHash: { type: String, required: true, select: false },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    language: { type: String, enum: LANGUAGES, required: true, default: 'en' },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null, select: false },
    imageHash: { type: String, default: null, index: true, select: false },
    // AI sets the initial values; administrators can override them.
    category: { type: String, enum: [...CATEGORIES, null], default: null },
    priority: { type: String, enum: [...PRIORITIES, null], default: null },
    aiSummary: { type: aiSummarySchema, default: () => ({}) },
    assignedDepartment: { type: String, enum: [...DEPARTMENTS, null], default: null },
    status: { type: String, enum: STATUSES, default: 'Submitted', index: true },
    statusHistory: { type: [statusHistorySchema], default: [] },
    internalNotes: { type: [internalNoteSchema], default: [] },
  },
  { timestamps: true }
);

complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ priority: 1 });

export const Complaint = mongoose.model('Complaint', complaintSchema);
