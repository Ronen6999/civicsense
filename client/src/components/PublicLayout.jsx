import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import Button from './ui/Button.jsx';

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100'
  }`;

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="grid h-9 w-9 place-items-center rounded-md bg-brand-700 text-sm font-bold text-white"
    >
      CS
    </span>
  );
}

export default function PublicLayout() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        {t('nav.skipToContent')}
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <LogoMark />
            <div className="leading-tight">
              <p className="text-base font-semibold text-brand-900">{t('common.appName')}</p>
              <p className="text-xs text-slate-600">{t('common.tagline')}</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <nav aria-label={t('nav.main')} className="flex items-center gap-1">
              <NavLink to="/" end className={navClass}>
                {t('nav.home')}
              </NavLink>
              <NavLink to="/report" className={navClass}>
                {t('nav.report')}
              </NavLink>
              <NavLink to="/track" className={navClass}>
                {t('nav.track')}
              </NavLink>
            </nav>
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 md:hidden"
            aria-label={t('nav.toggleMenu')}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d={menuOpen ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-nav" className="border-t border-slate-200 bg-white md:hidden">
            <nav aria-label={t('nav.main')} className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              <NavLink to="/" end className={navClass} onClick={() => setMenuOpen(false)}>
                {t('nav.home')}
              </NavLink>
              <NavLink to="/report" className={navClass} onClick={() => setMenuOpen(false)}>
                {t('nav.report')}
              </NavLink>
              <NavLink to="/track" className={navClass} onClick={() => setMenuOpen(false)}>
                {t('nav.track')}
              </NavLink>
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
              <Button as={Link} to="/admin/login" variant="secondary" size="sm" onClick={() => setMenuOpen(false)}>
                {t('nav.admin')}
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.text')}</p>
          <div className="flex items-center gap-4">
            <Link to="/report" className="hover:text-slate-900">
              {t('nav.report')}
            </Link>
            <Link to="/track" className="hover:text-slate-900">
              {t('nav.track')}
            </Link>
            <Link to="/admin/login" className="hover:text-slate-900">
              {t('nav.admin')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
