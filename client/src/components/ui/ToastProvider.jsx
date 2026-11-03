import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message, tone = 'info') => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => dismissToast(id), 2400);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto rounded-lg border px-4 py-2 text-sm shadow-lg transition-opacity ${
              item.tone === 'error'
                ? 'border-red-200 bg-red-50 text-red-900'
                : item.tone === 'success'
                  ? 'border-green-200 bg-green-50 text-green-900'
                  : 'border-slate-200 bg-white text-slate-800'
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
