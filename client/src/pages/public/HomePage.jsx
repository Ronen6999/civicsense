import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button.jsx';
import TranslationNotice from '../../components/TranslationNotice.jsx';

const STEPS = ['step1', 'step2', 'step3'];

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <TranslationNotice />

      <section className="surface-card p-6 sm:p-8">
        <p className="text-sm font-medium text-brand-700">{t('home.kicker')}</p>
        <h1 className="mt-2 max-w-3xl text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t('home.title')}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-700 sm:text-lg">{t('home.subtitle')}</p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button as={Link} to="/report" className="w-full sm:w-auto">
            {t('home.reportCta')}
          </Button>
          <Button as={Link} to="/track" variant="secondary" className="w-full sm:w-auto">
            {t('home.trackCta')}
          </Button>
        </div>
      </section>

      <section aria-labelledby="how-it-works" className="mt-8">
        <h2 id="how-it-works" className="text-lg font-semibold text-slate-900">
          {t('home.stepsTitle')}
        </h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step} className="surface-card p-4">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
                {index + 1}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{t(`home.${step}Title`)}</h3>
              <p className="mt-1 text-sm text-slate-700">{t(`home.${step}Body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{t('home.categoriesTitle')}</h2>
          <p className="mt-2 text-sm text-slate-700">{t('home.categoriesBody')}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {['infrastructure', 'hostel', 'academic', 'itNetwork', 'transport', 'safety'].map((categoryKey) => (
              <li
                key={categoryKey}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {t(`category.${categoryKey}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{t('home.trustTitle')}</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>{t('home.trustPrivacy')}</li>
            <li>{t('home.trustAccessible')}</li>
            <li>{t('home.trustBilingual')}</li>
          </ul>
        </div>
      </section>
    </>
  );
}
