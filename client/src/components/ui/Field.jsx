import { useId } from 'react';

const controlClass = (invalid) =>
  `block w-full rounded-lg border bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 sm:text-sm ${
    invalid ? 'border-red-500' : 'border-slate-300'
  }`;

export default function Field({
  label,
  hint,
  error,
  required = false,
  requiredLabel,
  optionalLabel,
  as: Control = 'input',
  className = '',
  inputClassName = '',
  children,
  ...controlProps
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-800">
        {label}
        {required && requiredLabel && <span className="ml-1 font-normal text-slate-500">({requiredLabel})</span>}
        {!required && optionalLabel && <span className="ml-1 font-normal text-slate-500">({optionalLabel})</span>}
      </label>
      <Control
        id={id}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`${controlClass(Boolean(error))} ${inputClassName}`}
        {...controlProps}
      >
        {children}
      </Control>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-slate-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
