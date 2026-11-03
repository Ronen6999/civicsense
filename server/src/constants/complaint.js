// Keep in sync with client/src/constants/complaint.js

export const STATUSES = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const CATEGORIES = [
  'Infrastructure',
  'Electrical & Water',
  'Sanitation & Hygiene',
  'Hostel & Accommodation',
  'Canteen & Food',
  'Academic',
  'IT & Network',
  'Transport',
  'Safety & Security',
  'Other',
];

export const DEPARTMENTS = [
  'Maintenance',
  'Hostel Administration',
  'Academic Affairs',
  'Security',
  'IT Services',
  'Canteen / Mess',
  'Transport',
  'General Administration',
];

export const LANGUAGES = ['en', 'as'];

// Statuses that count as "pending" on the dashboard
export const PENDING_STATUSES = ['Submitted', 'Under Review'];
// Statuses where no further work is expected
export const CLOSED_STATUSES = ['Resolved', 'Rejected'];
// Priorities counted as "high priority"
export const HIGH_PRIORITIES = ['High', 'Urgent'];
