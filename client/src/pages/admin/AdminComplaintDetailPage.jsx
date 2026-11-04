import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import { Alert, ErrorState, Spinner } from '../../components/ui/Feedback.jsx';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badges.jsx';
import StatusTimeline from '../../components/StatusTimeline.jsx';
import { CATEGORIES, CATEGORY_KEY, DEPARTMENTS, DEPARTMENT_KEY, PRIORITIES, PRIORITY_KEY, STATUSES, STATUS_KEY } from '../../constants/complaint.js';
import { adminApi } from '../../services/api.js';
import { formatDateTime } from '../../utils/format.js';

export default function AdminComplaintDetailPage() {
  const { t } = useTranslation();
  const { complaintId } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(
    (signal) => {
      setLoadError('');
      setNotFound(false);
      return adminApi
        .getComplaint(complaintId, signal)
        .then(({ complaint: c }) => setComplaint(c))
        .catch((err) => {
          if (err.name === 'AbortError') return;
          if (err.status === 404) setNotFound(true);
          else setLoadError(err.network ? t('errors.network') : err.message);
        });
    },
    [complaintId, t]
  );

  useEffect(() => {
    const controller = new AbortController();
    setComplaint(null);
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const backLink = (
    <Link to="/admin" className="text-sm text-brand-700 underline">
      {t('admin.detail.back')}
    </Link>
  );

  if (notFound) {
    return (
      <div>
        {backLink}
        <Alert tone="error" className="mt-4">
          {t('admin.detail.notFound', { id: complaintId })}
        </Alert>
      </div>
    );
  }
  if (loadError) {
    return (
      <div>
        {backLink}
        <ErrorState message={loadError} onRetry={() => load()} />
      </div>
    );
  }
  if (!complaint) return <Spinner label={t('admin.detail.loading')} />;

  return (
    <div className="space-y-6">
      <div>
        {backLink}
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold text-slate-600">{complaint.complaintId}</p>
            <h1 className="mt-1 break-words text-2xl font-bold text-slate-900">{complaint.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={complaint.priority} emptyLabel={t('admin.detail.noPriority')} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title={t('admin.detail.complaint')}>
            <p className="whitespace-pre-wrap break-words text-sm text-slate-900">{complaint.description}</p>
            <dl className="mt-4 grid gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
              <Meta label={t('admin.location')}>{complaint.location}</Meta>
              <Meta label={t('admin.detail.preferredLanguage')}>{complaint.language === 'as' ? 'অসমীয়া' : 'English'}</Meta>
              <Meta label={t('admin.submitted')}>{formatDateTime(complaint.createdAt)}</Meta>
            </dl>
            {complaint.imageUrl && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-600">{t('admin.detail.attachedPhoto')}</p>
                <a href={complaint.imageUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={complaint.imageUrl}
                    alt={t('admin.detail.attachedPhoto')}
                    loading="lazy"
                    className="max-h-80 rounded-md border border-slate-200 object-contain"
                  />
                </a>
              </div>
            )}
          </Card>

          <Card title={t('admin.detail.aiAnalysis')}>
            {complaint.aiSummary ? (
              <div className="space-y-3 text-sm">
                <p className="whitespace-pre-wrap text-slate-900">{complaint.aiSummary.summary}</p>
                {complaint.aiSummary.spamDetected && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-950">
                    <strong>{t('admin.detail.possibleSpam')}</strong>{' '}
                    ({Math.round((complaint.aiSummary.spamConfidence || 0) * 100)}% {t('admin.detail.confidence')})
                    {complaint.aiSummary.spamReason && <p className="mt-1">{complaint.aiSummary.spamReason}</p>}
                  </div>
                )}
                <dl className="grid gap-4 sm:grid-cols-3">
                  {complaint.aiSummary.imageAnalysis && <Meta label={t('admin.detail.imageInspection')}>{complaint.aiSummary.imageAnalysis}</Meta>}
                  {complaint.aiSummary.duplicateDetected && (
                    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                      <strong>{t('admin.detail.possibleDuplicate')}</strong> {complaint.aiSummary.duplicateOf} ({Math.round((complaint.aiSummary.duplicateConfidence || 0) * 100)}% {t('admin.detail.confidence')})
                      {complaint.aiSummary.duplicateReason ? ` — ${complaint.aiSummary.duplicateReason}` : ''}
                    </div>
                  )}
                  <Meta label={t('admin.detail.generated')}>
                    {formatDateTime(complaint.aiSummary.generatedAt)}
                    {complaint.aiSummary.model ? ` · ${complaint.aiSummary.model}` : ''}
                  </Meta>
                </dl>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                {t('admin.detail.noAi')}
              </p>
            )}
          </Card>

          <NotesCard complaint={complaint} onUpdated={setComplaint} />
        </div>

        <div className="space-y-6">
          <StatusCard complaint={complaint} onUpdated={setComplaint} />
          <TriageCard complaint={complaint} onUpdated={setComplaint} />
          <Card title={t('admin.detail.statusHistory')}>
            <StatusTimeline entries={complaint.statusHistory} showActor />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Meta({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">{label}</dt>
      <dd className="mt-1 text-slate-900">{children}</dd>
    </div>
  );
}

function SelectField({ id, label, value, onChange, options, emptyLabel }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
      >
        {emptyLabel && <option value="">{emptyLabel}</option>}
        {options.map((o) => {
          const option = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={option.value} value={option.value}>
            {option.label}
          </option>
        })}
      </select>
    </div>
  );
}

function errorText(err, t) {
  return err.network ? t('errors.network') : err.message;
}

function StatusCard({ complaint, onUpdated }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(complaint.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => setStatus(complaint.status), [complaint.status]);

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const { complaint: updated } = await adminApi.updateStatus(complaint.complaintId, status);
      onUpdated(updated);
      setSaved(true);
    } catch (err) {
      setError(errorText(err, t));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title={t('admin.detail.updateStatus')}>
      <div className="space-y-3">
        {error && <Alert tone="error">{error}</Alert>}
        {saved && <Alert tone="success">{t('admin.detail.statusUpdated')}</Alert>}
        <SelectField id="d-status" label={t('admin.status')} value={status} onChange={setStatus} options={STATUSES.map((v) => ({ value: v, label: t(`status.${STATUS_KEY[v]}`) }))} />
        <p className="text-xs text-slate-600">{t('admin.detail.statusInfo')}</p>
        <Button onClick={save} disabled={saving || status === complaint.status} className="w-full">
          {saving ? t('admin.detail.saving') : t('admin.detail.update')}
        </Button>
      </div>
    </Card>
  );
}

function TriageCard({ complaint, onUpdated }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    category: complaint.category || '',
    priority: complaint.priority || '',
    assignedDepartment: complaint.assignedDepartment || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(
    () =>
      setForm({
        category: complaint.category || '',
        priority: complaint.priority || '',
        assignedDepartment: complaint.assignedDepartment || '',
      }),
    [complaint.category, complaint.priority, complaint.assignedDepartment]
  );

  const dirty =
    form.category !== (complaint.category || '') ||
    form.priority !== (complaint.priority || '') ||
    form.assignedDepartment !== (complaint.assignedDepartment || '');

  const set = (field) => (value) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const { complaint: updated } = await adminApi.updateTriage(complaint.complaintId, {
        category: form.category || null,
        priority: form.priority || null,
        assignedDepartment: form.assignedDepartment || null,
      });
      onUpdated(updated);
      setSaved(true);
    } catch (err) {
      setError(errorText(err, t));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title={t('admin.detail.triage')}>
      <div className="space-y-3">
        {error && <Alert tone="error">{error}</Alert>}
        {saved && <Alert tone="success">{t('admin.detail.saved')}</Alert>}
        <SelectField id="d-category" label={t('admin.category')} value={form.category} onChange={set('category')} options={CATEGORIES.map((v) => ({ value: v, label: t(`category.${CATEGORY_KEY[v]}`) }))} emptyLabel={t('admin.detail.notSet')} />
        <SelectField id="d-priority" label={t('admin.priority')} value={form.priority} onChange={set('priority')} options={PRIORITIES.map((v) => ({ value: v, label: t(`priority.${PRIORITY_KEY[v]}`) }))} emptyLabel={t('admin.detail.notSet')} />
        <SelectField
          id="d-department"
          label={t('admin.department')}
          value={form.assignedDepartment}
          onChange={set('assignedDepartment')}
          options={DEPARTMENTS.map((v) => ({ value: v, label: t(`department.${DEPARTMENT_KEY[v]}`) }))}
          emptyLabel={t('admin.detail.unassigned')}
        />
        <p className="text-xs text-slate-600">{t('admin.detail.triageInfo')}</p>
        <Button onClick={save} disabled={saving || !dirty} className="w-full">
          {saving ? t('admin.detail.saving') : t('admin.detail.saveChanges')}
        </Button>
      </div>
    </Card>
  );
}

function NotesCard({ complaint, onUpdated }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const add = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setError('');
    try {
      const { complaint: updated } = await adminApi.addNote(complaint.complaintId, text);
      onUpdated(updated);
      setText('');
    } catch (err) {
      setError(errorText(err, t));
    } finally {
      setSaving(false);
    }
  };

  const notes = [...complaint.internalNotes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Card title={t('admin.detail.internalNotes')}>
      <p className="mb-3 text-xs text-slate-600">{t('admin.detail.notesInfo')}</p>

      <form onSubmit={add} className="space-y-2">
        {error && <Alert tone="error">{error}</Alert>}
        <label htmlFor="d-note" className="sr-only">
          {t('admin.detail.newNote')}
        </label>
        <textarea
          id="d-note"
          rows={3}
          maxLength={2000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('admin.detail.notePlaceholder')}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <Button type="submit" size="sm" disabled={saving || !text.trim()}>
          {saving ? t('admin.detail.adding') : t('admin.detail.addNote')}
        </Button>
      </form>

      {notes.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">{t('admin.detail.noNotes')}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((note) => (
            <li key={note._id} className="rounded-md bg-slate-50 p-3">
              <p className="whitespace-pre-wrap break-words text-sm text-slate-900">{note.text}</p>
              <p className="mt-1 text-xs text-slate-600">
                {note.authorName} · {formatDateTime(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
