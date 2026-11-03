import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button.jsx';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-xl py-10">
      <div className="surface-card p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{t('errors.notFound')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('home.subtitle')}</p>
        <Button as={Link} to="/" className="mt-6">
          {t('nav.home')}
        </Button>
      </div>
    </section>
  );
}
