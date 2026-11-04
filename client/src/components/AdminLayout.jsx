import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './ui/Button.jsx';
import { Spinner } from './ui/Feedback.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import SiteLogo from './SiteLogo.jsx';

/** Wraps every /admin page except login. Redirects to login when there is no valid session. */
export default function AdminLayout() {
  const { admin, checking, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (checking) return <Spinner label={t('admin.checkingSession')} className="min-h-screen" />;
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-3 text-lg font-bold text-brand-800">
              <SiteLogo />
              <span>
                CivicSense <span className="text-sm font-medium text-slate-600">{t('admin.label')}</span>
              </span>
            </Link>
            <Link to="/" className="hidden text-sm text-slate-600 underline hover:text-slate-900 sm:inline">
              {t('admin.viewPublic')}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-700 sm:inline">{admin.name}</span>
            <LanguageSwitcher />
            <Button variant="secondary" size="sm" onClick={logout}>
              {t('admin.signOut')}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
