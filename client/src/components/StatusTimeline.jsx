import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { STATUS_KEY } from '../constants/complaint.js';
import { formatDateTime } from '../utils/format.js';

const FLOW = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

export default function StatusTimeline({ entries = [], currentStatus, showActor = false, translate = true }) {
  const { t } = useTranslation();

  const ordered = useMemo(
    () => [...entries].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt)),
    [entries]
  );

  const visited = new Set(ordered.map((entry) => entry.status));
  const displayStatus = currentStatus || ordered.at(-1)?.status;
  const rejected = displayStatus === 'Rejected';

  return (
    <div>
      {!rejected ? (
        <ol className="grid gap-3 sm:grid-cols-4" aria-label={t('track.result.progress')}>
          {FLOW.map((status, index) => {
            const done = visited.has(status);
            const active = displayStatus === status;
            return (
              <li
                key={status}
                className={`rounded-lg border px-3 py-3 text-sm transition-colors ${
                  done ? 'border-brand-200 bg-brand-50' : 'border-slate-200 bg-white'
                } ${active ? 'ring-2 ring-brand-300' : ''}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{index + 1}</p>
                <p className={`mt-1 font-medium ${done ? 'text-brand-900' : 'text-slate-700'}`}>
                  {translate ? t(`status.${STATUS_KEY[status]}`, status) : status}
                </p>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-900">{t('status.rejected')}</p>
          <p className="mt-1 text-sm text-red-800">{t('track.result.rejectedInfo')}</p>
        </div>
      )}

      <ol className="relative mt-5 border-l-2 border-slate-200 pl-5">
        {[...ordered].reverse().map((entry, index) => {
          const isLatest = index === 0;
          const isRejected = entry.status === 'Rejected';
          return (
            <li key={`${entry.status}-${entry.changedAt}`} className="relative pb-5 last:pb-0">
              <span
                aria-hidden="true"
                className={`absolute -left-[30px] top-1 h-4 w-4 rounded-full border-2 border-white ${
                  isRejected ? 'bg-red-500' : isLatest ? 'bg-brand-700' : 'bg-slate-300'
                }`}
              />
              <p className="text-sm font-medium text-slate-900">
                {translate ? t(`status.${STATUS_KEY[entry.status]}`, entry.status) : entry.status}
              </p>
              <p className="text-xs text-slate-600">
                <time dateTime={new Date(entry.changedAt).toISOString()}>{formatDateTime(entry.changedAt)}</time>
                {showActor && entry.changedByName && <span> · {entry.changedByName}</span>}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
