import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Field from '../../components/ui/Field.jsx';
import { Alert } from '../../components/ui/Feedback.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import LanguageSwitcher from '../../components/LanguageSwitcher.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const { admin, checking, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const destination = location.state?.from || '/admin';

  if (!checking && admin) return <Navigate to={destination} replace />;

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err) {
      if (err.network) setError(t('errors.network'));
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex items-center justify-between">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-bold text-brand-800">{t('admin.loginTitle')}</h1>
        <p className="mt-1 text-sm text-slate-600">{t('admin.loginIntro')}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-5">
          {error && <Alert tone="error">{error}</Alert>}
          <Field
            label={t('admin.email')}
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label={t('admin.password')}
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('admin.signingIn') : t('admin.signIn')}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link to="/" className="text-slate-600 underline hover:text-slate-900">
            {t('admin.backPublic')}
          </Link>
        </p>
      </div>
    </div>
  );
}
