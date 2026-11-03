import { useTranslation } from 'react-i18next';
import { PRIORITY_KEY, STATUS_KEY } from '../../constants/complaint.js';

const STATUS_STYLES = {
  Submitted: 'bg-slate-100 text-slate-800 ring-slate-300',
  'Under Review': 'bg-amber-50 text-amber-900 ring-amber-300',
  'In Progress': 'bg-brand-50 text-brand-800 ring-brand-300',
  Resolved: 'bg-green-50 text-green-900 ring-green-300',
  Rejected: 'bg-red-50 text-red-900 ring-red-300',
};

const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-700 ring-slate-300',
  Medium: 'bg-sky-50 text-sky-900 ring-sky-300',
  High: 'bg-orange-50 text-orange-900 ring-orange-300',
  Urgent: 'bg-red-50 text-red-900 ring-red-300',
};

const base =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap';

export function StatusBadge({ status }) {
  const { t } = useTranslation();
  return (
    <span className={`${base} ${STATUS_STYLES[status] || STATUS_STYLES.Submitted}`}>
      {t(`status.${STATUS_KEY[status]}`, status)}
    </span>
  );
}

export function PriorityBadge({ priority, emptyLabel }) {
  const { t } = useTranslation();
  if (!priority) return <span className="text-sm text-slate-500">{emptyLabel ?? '—'}</span>;
  return (
    <span className={`${base} ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.Low}`}>
      {t(`priority.${PRIORITY_KEY[priority]}`, priority)}
    </span>
  );
}
