import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button.jsx';
import Field from '../../components/ui/Field.jsx';
import { Alert, Skeleton } from '../../components/ui/Feedback.jsx';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badges.jsx';
import StatusTimeline from '../../components/StatusTimeline.jsx';
import TranslationNotice from '../../components/TranslationNotice.jsx';
import { CATEGORY_KEY, DEPARTMENT_KEY } from '../../constants/complaint.js';
import { publicApi } from '../../services/api.js';
import { formatDate, formatDateTime } from '../../utils/format.js';

export default function TrackComplaintPage() {
  const { t } = useTranslation();
  const prefill = useLocation().state;

  const [complaintId, setComplaintId] = useState(prefill?.complaintId || '');
  const [token, setToken] = useState(prefill?.token || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complaint, setComplaint] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!complaintId.trim() || !token.trim()) {
      setError(t('track.notFound'));
      return;
    }

    setLoading(true);
    try {
      const data = await publicApi.trackComplaint(complaintId.trim(), token.trim());
      setComplaint(data.complaint);
    } catch (err) {
      setComplaint(null);
      if (err.network) setError(t('errors.network'));
      else if (err.status === 404) setError(t('track.notFound'));
      else if (err.status === 429) setError(t('errors.tooManyRequests'));
      else setError(err.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const checkAnother = () => {
    setComplaint(null);
    setComplaintId('');
    setToken('');
    setError('');
  };

  const category = complaint?.category
    ? t(`category.${CATEGORY_KEY[complaint.category]}`, complaint.category)
    : t('track.result.categoryPending');

  const department = complaint?.assignedDepartment
    ? t(`department.${DEPARTMENT_KEY[complaint.assignedDepartment]}`, complaint.assignedDepartment)
    : t('track.result.departmentPending');

  return (
    <section className="mx-auto max-w-3xl">
      <TranslationNotice />

      {!complaint && (
        <div className="surface-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">{t('track.title')}</h1>
          <p className="mt-2 text-slate-700">{t('track.intro')}</p>

          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
            {error && <Alert tone="error">{error}</Alert>}

            <Field
              label={t('track.complaintId')}
              required
              requiredLabel={t('common.required')}
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder={t('track.complaintIdPlaceholder')}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              inputClassName="font-mono"
            />
            <Field
              label={t('track.token')}
              required
              requiredLabel={t('common.required')}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t('track.tokenPlaceholder')}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              inputClassName="font-mono"
            />
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? t('track.checking') : t('track.submit')}
            </Button>
          </form>

          {loading && (
            <div className="mt-5 space-y-3" aria-hidden="true">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
        </div>
      )}

      {complaint && (
        <section className="space-y-5">
          <div className="surface-card p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-slate-900">{t('track.result.title')}</h1>
            <p className="mt-1 text-sm text-slate-600">{t('track.result.subtitle')}</p>

            <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Item label={t('track.result.complaintId')}>
                <code className="font-mono font-semibold">{complaint.complaintId}</code>
              </Item>
              <Item label={t('track.result.submitted')}>{formatDate(complaint.createdAt)}</Item>
              <Item label={t('track.result.lastUpdated')}>{formatDateTime(complaint.updatedAt || complaint.createdAt)}</Item>
              <Item label={t('track.result.status')}>
                <StatusBadge status={complaint.status} />
              </Item>
              <Item label={t('track.result.complaintTitle')} wide>
                {complaint.title}
              </Item>
              <Item label={t('track.result.category')}>{category}</Item>
              <Item label={t('track.result.priority')}>
                <PriorityBadge priority={complaint.priority} emptyLabel={t('track.result.priorityPending')} />
              </Item>
              <Item label={t('track.result.department')}>{department}</Item>
              <Item label={t('track.result.aiSummary')} wide>
                {complaint.aiSummary?.summary || t('track.result.summaryPending')}
              </Item>
            </dl>
          </div>

          <div className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">{t('track.result.timeline')}</h2>
            <div className="mt-4">
              <StatusTimeline entries={complaint.statusHistory} currentStatus={complaint.status} />
            </div>
          </div>

          <Button variant="secondary" onClick={checkAnother}>
            {t('track.result.checkAnother')}
          </Button>
        </section>
      )}
    </section>
  );
}

function Item({ label, wide = false, children }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  );
}
