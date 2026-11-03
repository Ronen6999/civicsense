// Keep in sync with server/src/constants/complaint.js

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

// Translation keys for values stored in English in the database.
export const STATUS_KEY = {
  Submitted: 'submitted',
  'Under Review': 'underReview',
  'In Progress': 'inProgress',
  Resolved: 'resolved',
  Rejected: 'rejected',
};
export const PRIORITY_KEY = { Low: 'low', Medium: 'medium', High: 'high', Urgent: 'urgent' };
export const CATEGORY_KEY = {
  Infrastructure: 'infrastructure',
  'Electrical & Water': 'electricalWater',
  'Sanitation & Hygiene': 'sanitation',
  'Hostel & Accommodation': 'hostel',
  'Canteen & Food': 'canteen',
  Academic: 'academic',
  'IT & Network': 'itNetwork',
  Transport: 'transport',
  'Safety & Security': 'safety',
  Other: 'other',
};
export const DEPARTMENT_KEY = {
  Maintenance: 'maintenance',
  'Hostel Administration': 'hostelAdministration',
  'Academic Affairs': 'academicAffairs',
  Security: 'security',
  'IT Services': 'itServices',
  'Canteen / Mess': 'canteenMess',
  Transport: 'transport',
  'General Administration': 'generalAdministration',
};

export const LANGUAGES = [
  // Native names are the languages' own names, not translations.
  { code: 'en', nativeName: 'English' },
  { code: 'as', nativeName: 'অসমীয়া' },
];
