import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { Complaint } from '../models/Complaint.js';
import { signAdminToken } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getDashboardStats,
  listComplaints,
  toAdminDetail,
} from '../services/complaintService.js';

// Compared against when the email is unknown, so response time does not reveal valid emails.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const publicAdmin = (admin) => ({ id: admin.id, name: admin.name, email: admin.email });

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.valid.body;

  const admin = await Admin.findOne({ email }).select('+passwordHash');
  const hash = admin?.passwordHash || DUMMY_HASH;
  const passwordOk = await bcrypt.compare(password, hash);

  if (!admin || !admin.isActive || !passwordOk) {
    throw ApiError.unauthorized('Incorrect email or password.');
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  res.json({ token: signAdminToken(admin), admin: publicAdmin(admin) });
});

export const me = (req, res) => {
  res.json({ admin: publicAdmin(req.admin) });
};

export const stats = asyncHandler(async (_req, res) => {
  res.json({ stats: await getDashboardStats() });
});

export const list = asyncHandler(async (req, res) => {
  res.json(await listComplaints(req.valid.query));
});

async function findOrThrow(complaintId) {
  const complaint = await Complaint.findOne({ complaintId });
  if (!complaint) throw ApiError.notFound('Complaint not found.');
  return complaint;
}

export const detail = asyncHandler(async (req, res) => {
  const complaint = await findOrThrow(req.valid.params.complaintId);
  res.json({ complaint: toAdminDetail(complaint) });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { complaintId } = req.valid.params;
  const { status } = req.valid.body;

  // Conditional update keeps the change and its history entry atomic,
  // and refuses no-op changes so history only records real transitions.
  const updated = await Complaint.findOneAndUpdate(
    { complaintId, status: { $ne: status } },
    {
      $set: { status },
      $push: {
        statusHistory: {
          status,
          changedAt: new Date(),
          changedBy: req.admin._id,
          changedByName: req.admin.name,
        },
      },
    },
    { new: true, runValidators: true }
  );

  if (!updated) {
    await findOrThrow(complaintId); // throws 404 if it does not exist
    throw ApiError.badRequest(`Complaint is already "${status}".`);
  }

  res.json({ complaint: toAdminDetail(updated) });
});

export const addNote = asyncHandler(async (req, res) => {
  const { complaintId } = req.valid.params;
  const { text } = req.valid.body;

  const updated = await Complaint.findOneAndUpdate(
    { complaintId },
    {
      $push: {
        internalNotes: {
          text,
          author: req.admin._id,
          authorName: req.admin.name,
          createdAt: new Date(),
        },
      },
    },
    { new: true, runValidators: true }
  );
  if (!updated) throw ApiError.notFound('Complaint not found.');

  res.status(201).json({ complaint: toAdminDetail(updated) });
});

export const updateTriage = asyncHandler(async (req, res) => {
  const { complaintId } = req.valid.params;
  const updated = await Complaint.findOneAndUpdate(
    { complaintId },
    { $set: req.valid.body },
    { new: true, runValidators: true }
  );
  if (!updated) throw ApiError.notFound('Complaint not found.');

  res.json({ complaint: toAdminDetail(updated) });
});
