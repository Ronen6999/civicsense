import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import { EmptyState, ErrorState, Spinner } from '../../components/ui/Feedback.jsx';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badges.jsx';
import { CATEGORIES, CATEGORY_KEY, DEPARTMENTS, DEPARTMENT_KEY, PRIORITIES, PRIORITY_KEY, STATUSES, STATUS_KEY } from '../../constants/complaint.js';
import { adminApi } from '../../services/api.js';
import { formatDate } from '../../utils/format.js';

const FILTER_KEYS = ['search', 'status', 'category', 'priority', 'from', 'to', 'sort', 'page'];

const STAT_CARDS = [
  { key: 'total', label: 'total', hint: 'allComplaints' },
  { key: 'pending', label: 'pending', hint: 'submittedReview' },
  { key: 'inProgress', label: 'inProgress', hint: 'beingWorked' },
  { key: 'resolved', label: 'resolved', hint: 'closedResolved' },
  { key: 'highPriority', label: 'highPriority', hint: 'highOpen' },
];

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));
  const page = Number(filters.page) > 0 ? Number(filters.page) : 1;

  const [searchText, setSearchText] = useState(filters.search);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [list, setList] = useState(null);
  const [listError, setListError] = useState('');
  const [loading, setLoading] = useState(true);

  const setFilters = useCallback(
    (changes) => {
      const next = new URLSearchParams(params);
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      if (!('page' in changes)) next.delete('page'); // any filter change goes back to page 1
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  useEffect(() => {
    const controller = new AbortController();
    setStatsError('');
    adminApi
      .stats(controller.signal)
      .then(({ stats: s }) => setStats(s))
      .catch((err) => err.name !== 'AbortError' && setStatsError(err.message));
    return () => controller.abort();
  }, []);

  const queryKey = JSON.stringify([filters.search, filters.status, filters.category, filters.priority, filters.from, filters.to, filters.sort, page]);

  const load = useCallback(
    (signal) => {
      setLoading(true);
      setListError('');
      return adminApi
        .listComplaints(
          {
            search: filters.search,
            status: filters.status,
            category: filters.category,
            priority: filters.priority,
            from: filters.from,
            to: filters.to,
            sort: filters.sort || undefined,
            page,
            limit: 20,
          },
          signal
        )
        .then(setList)
        .catch((err) => {
          if (err.name !== 'AbortError') setListError(err.network ? t('errors.network') : err.message);
        })
        .finally(() => {
          // An aborted request has been superseded; the newer one owns the loading state.
          if (!signal?.aborted) setLoading(false);
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryKey]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const hasFilters = FILTER_KEYS.some((k) => k !== 'page' && k !== 'sort' && filters[k]);

  const onSearch = (event) => {
    event.preventDefault();
    setFilters({ search: searchText.trim() });
  };

  const clearFilters = () => {
    setSearchText('');
    setParams({}, { replace: true });
  };

  return (
    <div className="space-y-6">
      <section aria-label="Statistics">
        {statsError ? (
          <ErrorState message={`${t('errors.generic')} ${statsError}`} />
        ) : (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {STAT_CARDS.map(({ key, label, hint }) => (
              <div key={key} className="rounded-lg border border-slate-200 bg-white p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">{t(`admin.stats.${label}`)}</dt>
                <dd className="mt-1 text-2xl font-bold text-slate-900">{stats ? stats[key] : '–'}</dd>
                <p className="mt-0.5 text-xs text-slate-500">{t(`admin.stats.${hint}`)}</p>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-labelledby="complaints-heading" className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h1 id="complaints-heading" className="text-lg font-semibold text-slate-900">
            {t('admin.complaints')}
          </h1>

          <form onSubmit={onSearch} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="sm:col-span-2 lg:col-span-2">
              <label htmlFor="f-search" className="mb-1 block text-xs font-medium text-slate-700">
                {t('admin.search')}
              </label>
              <div className="flex gap-2">
                <input
                  id="f-search"
                  type="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={t('admin.searchPlaceholder')}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <Button type="submit" size="sm">
                  {t('admin.search')}
                </Button>
              </div>
            </div>
            <Select id="f-status" label={t('admin.status')} value={filters.status} onChange={(v) => setFilters({ status: v })} options={STATUSES.map((v) => ({ value: v, label: t(`status.${STATUS_KEY[v]}`) }))} />
            <Select id="f-category" label={t('admin.category')} value={filters.category} onChange={(v) => setFilters({ category: v })} options={CATEGORIES.map((v) => ({ value: v, label: t(`category.${CATEGORY_KEY[v]}`) }))} />
            <Select id="f-priority" label={t('admin.priority')} value={filters.priority} onChange={(v) => setFilters({ priority: v })} options={PRIORITIES.map((v) => ({ value: v, label: t(`priority.${PRIORITY_KEY[v]}`) }))} />
            <Select
              id="f-sort"
              label={t('admin.sort')}
              value={filters.sort}
              onChange={(v) => setFilters({ sort: v })}
              options={[{ value: '', label: t('admin.newestFirst') }, { value: 'oldest', label: t('admin.oldestFirst') }]}
              allowAll={false}
            />
            <div>
              <label htmlFor="f-from" className="mb-1 block text-xs font-medium text-slate-700">
                {t('admin.fromDate')}
              </label>
              <input
                id="f-from"
                type="date"
                value={filters.from}
                max={filters.to || undefined}
                onChange={(e) => setFilters({ from: e.target.value })}
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="f-to" className="mb-1 block text-xs font-medium text-slate-700">
                {t('admin.toDate')}
              </label>
              <input
                id="f-to"
                type="date"
                value={filters.to}
                min={filters.from || undefined}
                onChange={(e) => setFilters({ to: e.target.value })}
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            {hasFilters && (
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {t('admin.clearFilters')}
                </Button>
              </div>
            )}
          </form>
        </div>

        {listError ? (
          <ErrorState message={listError} onRetry={() => load()} />
        ) : !list ? (
          <Spinner label={t('common.loading')} />
        ) : list.items.length === 0 ? (
          <EmptyState title={hasFilters ? t('admin.noMatch') : t('admin.noComplaints')}>
            {hasFilters ? t('admin.tryRemoving') : t('admin.newSubmissions')}
          </EmptyState>
        ) : (
          <>
            <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <caption className="sr-only">Complaints</caption>
                <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3">{t('admin.id')}</th>
                    <th scope="col" className="px-4 py-3">{t('admin.title')}</th>
                    <th scope="col" className="hidden px-4 py-3 md:table-cell">{t('admin.location')}</th>
                    <th scope="col" className="hidden px-4 py-3 lg:table-cell">{t('admin.category')}</th>
                    <th scope="col" className="px-4 py-3">{t('admin.priority')}</th>
                    <th scope="col" className="px-4 py-3">{t('admin.status')}</th>
                    <th scope="col" className="hidden px-4 py-3 xl:table-cell">{t('admin.department')}</th>
                    <th scope="col" className="hidden px-4 py-3 sm:table-cell">{t('admin.submitted')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.items.map((c) => (
                    <tr key={c.complaintId} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                        <Link to={`/admin/complaints/${c.complaintId}`} className="font-semibold text-brand-700 underline">
                          {c.complaintId}
                        </Link>
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-slate-900" title={c.title}>
                        {c.title}
                      </td>
                      <td className="hidden max-w-[12rem] truncate px-4 py-3 text-slate-700 md:table-cell">{c.location}</td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 lg:table-cell">{c.category ? t(`category.${CATEGORY_KEY[c.category]}`, c.category) : '—'}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 xl:table-cell">{c.assignedDepartment ? t(`department.${DEPARTMENT_KEY[c.assignedDepartment]}`, c.assignedDepartment) : '—'}</td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 sm:table-cell">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
              <p>
                {list.total} {t('admin.complaintCount')}{list.total === 1 ? '' : 's'} · {t('admin.page')} {list.page} {t('admin.of')} {list.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setFilters({ page: String(page - 1) })}>
                  {t('admin.previous')}
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= list.totalPages} onClick={() => setFilters({ page: String(page + 1) })}>
                  {t('admin.next')}
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Select({ id, label, value, onChange, options, allowAll = true }) {
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
        {allowAll && <option value="">All</option>}
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
