import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../constants/complaint.js';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className="inline-flex overflow-hidden rounded-lg ring-1 ring-inset ring-slate-300"
    >
      {LANGUAGES.map(({ code, nativeName }) => {
        const active = i18n.language.startsWith(code);
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            onClick={() => i18n.changeLanguage(code)}
            className={`min-h-9 px-3 text-sm font-medium transition-colors ${
              active ? 'bg-brand-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {nativeName}
          </button>
        );
      })}
    </div>
  );
}
