import { Complaint } from '../models/Complaint.js';
import { escapeRegex } from '../utils/text.js';
import {
  CLOSED_STATUSES,
  HIGH_PRIORITIES,
  PENDING_STATUSES,
  STATUSES,
} from '../constants/complaint.js';
import {
  generateComplaintId,
  generateTrackingToken,
  hashTrackingToken,
  normalizeComplaintId,
  tokenMatchesHash,
} from './credentialService.js';

const MAX_ID_ATTEMPTS = 5;

export async function createComplaint({ title, description, language, location, category, image, imageHash }) {
  const trackingToken = generateTrackingToken();
  const trackingTokenHash = hashTrackingToken(trackingToken);

  for (let attempt = 1; attempt <= MAX_ID_ATTEMPTS; attempt += 1) {
    try {
      const complaint = await Complaint.create({
        complaintId: generateComplaintId(),
        trackingTokenHash,
        title,
        description,
        language,
        location,
        category: category || null,
        imageUrl: image?.url ?? null,
        imagePublicId: image?.publicId ?? null,
        imageHash: imageHash ?? null,
        status: 'Submitted',
        statusHistory: [{ status: 'Submitted', changedAt: new Date() }],
      });
      return { complaint, trackingToken };
    } catch (err) {
      const isIdCollision = err?.code === 11000 && err?.keyPattern?.complaintId;
      if (!isIdCollision || attempt === MAX_ID_ATTEMPTS) throw err;
    }
  }
  throw new Error('Unable to generate a unique complaint ID.');
}

export async function findByCredentials(complaintId, token) {
  hashTrackingToken(token);
  const complaint = await Complaint.findOne({
    complaintId: normalizeComplaintId(complaintId),
  }).select('+trackingTokenHash');
  if (!complaint) return null;
  return tokenMatchesHash(token, complaint.trackingTokenHash) ? complaint : null;
}

export function toPublicTracking(complaint) {
  return {
    complaintId: complaint.complaintId,
    title: complaint.title,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
    category: complaint.category,
    status: complaint.status,
    priority: complaint.priority,
    assignedDepartment: complaint.assignedDepartment,
    aiSummary: complaint.aiSummary?.summary
      ? {
          summary: complaint.aiSummary.summary,
          language: complaint.aiSummary.language,
          generatedAt: complaint.aiSummary.generatedAt,
        }
      : null,
    statusHistory: complaint.statusHistory.map((entry) => ({
      status: entry.status,
      changedAt: entry.changedAt,
    })),
  };
}

export function toAdminListItem(complaint) {
  return {
    complaintId: complaint.complaintId,
    title: complaint.title,
    location: complaint.location,
    language: complaint.language,
    category: complaint.category,
    priority: complaint.priority,
    status: complaint.status,
    assignedDepartment: complaint.assignedDepartment,
    hasImage: Boolean(complaint.imageUrl),
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  };
}

export function toAdminDetail(complaint) {
  return {
    complaintId: complaint.complaintId,
    title: complaint.title,
    description: complaint.description,
    location: complaint.location,
    language: complaint.language,
    imageUrl: complaint.imageUrl,
    category: complaint.category,
    priority: complaint.priority,
    aiSummary: complaint.aiSummary?.generatedAt ? complaint.aiSummary : null,
    assignedDepartment: complaint.assignedDepartment,
    status: complaint.status,
    statusHistory: complaint.statusHistory,
    internalNotes: complaint.internalNotes,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  };
}

export async function listComplaints({ search, status, category, priority, from, to, page, limit, sort }) {
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to) filter.createdAt.$lte = to;
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ complaintId: rx }, { title: rx }, { description: rx }, { location: rx }];
  }

  const sortSpec = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  const [items, total] = await Promise.all([
    Complaint.find(filter)
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Complaint.countDocuments(filter),
  ]);

  return {
    items: items.map(toAdminListItem),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getDashboardStats() {
  const [byStatusRows, highPriorityOpen] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.countDocuments({
      priority: { $in: HIGH_PRIORITIES },
      status: { $nin: CLOSED_STATUSES },
    }),
  ]);

  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const row of byStatusRows) byStatus[row._id] = row.count;

  const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
  const pending = PENDING_STATUSES.reduce((sum, s) => sum + byStatus[s], 0);

  return {
    total,
    pending,
    inProgress: byStatus['In Progress'],
    resolved: byStatus.Resolved,
    rejected: byStatus.Rejected,
    highPriority: highPriorityOpen,
    byStatus,
  };
}
