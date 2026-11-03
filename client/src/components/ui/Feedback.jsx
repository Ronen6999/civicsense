const ALERT_STYLES = {
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-brand-200 bg-brand-50 text-brand-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
  success: 'border-green-200 bg-green-50 text-green-900',
};

export function Alert({ tone = 'info', title, children, className = '' }) {
  const live = tone === 'error' ? { role: 'alert' } : { role: 'status' };
  return (
    <div {...live} className={`rounded-lg border px-4 py-3 text-sm ${ALERT_STYLES[tone]} ${className}`}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={title ? 'mt-1' : ''}>{children}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-3 py-10 text-slate-600 ${className}`}>
      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden="true" />;
}

export function EmptyState({ title, children }) {
  return (
    <div className="surface-card px-4 py-12 text-center">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {children && <p className="mt-1 text-sm text-slate-600">{children}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry, retryLabel = 'Try again' }) {
  return (
    <div className="surface-card px-4 py-10 text-center">
      <p role="alert" className="text-sm text-red-800">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md px-3 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-300 hover:bg-brand-50"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
