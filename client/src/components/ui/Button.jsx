const VARIANTS = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 disabled:bg-brand-300',
  secondary:
    'bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
  ghost: 'text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-400',
};

const SIZES = {
  md: 'min-h-11 px-4 py-2 text-sm',
  sm: 'min-h-9 px-3 py-1.5 text-sm',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  type,
  ...props
}) {
  const typeProp = Component === 'button' ? { type: type || 'button' } : {};
  return (
    <Component
      {...typeProp}
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    />
  );
}
