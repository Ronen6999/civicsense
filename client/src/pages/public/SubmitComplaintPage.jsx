import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button.jsx';
import Field from '../../components/ui/Field.jsx';
import { Alert, Skeleton } from '../../components/ui/Feedback.jsx';
import CopyButton from '../../components/ui/CopyButton.jsx';
import TranslationNotice from '../../components/TranslationNotice.jsx';
import { CATEGORIES, CATEGORY_KEY, LANGUAGES } from '../../constants/complaint.js';
import { publicApi } from '../../services/api.js';
import { useToast } from '../../components/ui/ToastProvider.jsx';

const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const LIMITS = { title: [5, 150], description: [20, 5000], location: [2, 120] };

const emptyForm = { title: '', description: '', location: '', category: '', language: 'en' };

const typeToExt = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
};

export default function SubmitComplaintPage() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [form, setForm] = useState({ ...emptyForm, language: i18n.language.startsWith('as') ? 'as' : 'en' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [config, setConfig] = useState(null);
  const fileInput = useRef(null);
  const successHeading = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    publicApi
      .getConfig(controller.signal)
      .then(setConfig)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setConfig({ imageUploadEnabled: false, maxImageSizeMb: 5, allowedImageTypes: DEFAULT_ALLOWED_TYPES });
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!image) {
      setImagePreview('');
      return;
    }
    const nextUrl = URL.createObjectURL(image);
    setImagePreview(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [image]);

  useEffect(() => {
    if (result) successHeading.current?.focus();
  }, [result]);

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const maxMb = config?.maxImageSizeMb ?? 5;
  const allowedTypes = config?.allowedImageTypes || DEFAULT_ALLOWED_TYPES;
  const acceptedTypesLabel = useMemo(
    () => allowedTypes.map((type) => typeToExt[type]).filter(Boolean).join(', '),
    [allowedTypes]
  );
  const descriptionCount = [...form.description].length;

  const validateImage = (file) => {
    if (!file) return '';
    if (!allowedTypes.includes(file.type)) return t('submit.fields.image.wrongType');
    if (file.size > maxMb * 1024 * 1024) return t('submit.fields.image.tooLarge', { max: maxMb });
    return '';
  };

  const setSelectedImage = (file) => {
    const imageError = validateImage(file);
    setErrors((prev) => ({ ...prev, image: imageError || undefined }));
    if (imageError) {
      setImage(null);
      return;
    }
    setImage(file || null);
  };

  const onImageChange = (event) => setSelectedImage(event.target.files?.[0] || null);

  const removeImage = () => {
    setImage(null);
    setErrors((prev) => ({ ...prev, image: undefined }));
    if (fileInput.current) fileInput.current.value = '';
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    if (fileInput.current) fileInput.current.files = event.dataTransfer.files;
  };

  const validate = () => {
    const next = {};
    const len = (value) => [...value.trim()].length;

    if (len(form.title) < LIMITS.title[0] || len(form.title) > LIMITS.title[1]) {
      next.title = t('submit.validation.titleLength');
    }
    if (len(form.description) < LIMITS.description[0] || len(form.description) > LIMITS.description[1]) {
      next.description = t('submit.validation.descriptionLength');
    }
    if (len(form.location) < LIMITS.location[0] || len(form.location) > LIMITS.location[1]) {
      next.location = t('submit.validation.locationLength');
    }

    return next;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitError('');
    const found = validate();
    setErrors((prev) => ({ ...prev, ...found }));
    if (Object.keys(found).length > 0) {
      setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
      return;
    }

    const body = new FormData();
    body.set('title', form.title.trim());
    body.set('description', form.description.trim());
    body.set('location', form.location.trim());
    body.set('language', form.language);
    if (form.category) body.set('category', form.category);
    if (image) body.set('image', image);

    setSubmitting(true);
    try {
      const data = await publicApi.submitComplaint(body);
      setResult(data);
      showToast(t('submit.toastSuccess'), 'success');
    } catch (err) {
      if (err.network) setSubmitError(t('errors.network'));
      else if (err.status === 429) setSubmitError(t('errors.tooManyRequests'));
      else setSubmitError(err.message || t('errors.generic'));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm({ ...emptyForm, language: i18n.language.startsWith('as') ? 'as' : 'en' });
    setImage(null);
    setErrors({});
    setSubmitError('');
    setResult(null);
  };

  if (result) {
    return (
      <section className="mx-auto max-w-2xl surface-card p-6 sm:p-8">
        <h1 ref={successHeading} tabIndex={-1} className="text-2xl font-bold text-slate-900 focus:outline-none">
          {t('submit.success.title')}
        </h1>
        <p className="mt-2 text-sm text-slate-700">{t('submit.success.intro')}</p>

        <dl className="mt-5 space-y-4">
          <div className="rounded-lg border border-slate-200 p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">{t('submit.success.complaintId')}</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2">
              <code className="font-mono text-lg font-semibold text-slate-900">{result.complaintId}</code>
              <CopyButton value={result.complaintId} label={`${t('common.copy')}: ${t('submit.success.complaintId')}`} />
            </dd>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">{t('submit.success.token')}</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2">
              <code className="font-mono text-lg font-semibold text-slate-900">{result.trackingToken}</code>
              <CopyButton value={result.trackingToken} label={`${t('common.copy')}: ${t('submit.success.token')}`} />
            </dd>
          </div>
        </dl>

        <Alert tone="warning" className="mt-4">
          {t('submit.success.warning')}
        </Alert>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button as={Link} to="/track" state={{ complaintId: result.complaintId, token: result.trackingToken }}>
            {t('submit.success.trackNow')}
          </Button>
          <Button variant="secondary" onClick={reset}>
            {t('submit.success.submitAnother')}
          </Button>
        </div>
      </section>
    );
  }

  const uploadsDisabled = config && !config.imageUploadEnabled;

  return (
    <section className="mx-auto max-w-[48rem]">
      <TranslationNotice />

      <div className="surface-card p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('submit.title')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-700">{t('submit.intro')}</p>

        <form onSubmit={onSubmit} noValidate className="mt-5 space-y-3.5 sm:space-y-5 lg:space-y-6">
          {submitError && (
            <Alert tone="error" title={t('submit.failed')}>
              {submitError}
            </Alert>
          )}

          <Field
            label={t('submit.fields.title.label')}
            hint={t('submit.fields.title.hint')}
            error={errors.title}
            required
            requiredLabel={t('common.required')}
            value={form.title}
            onChange={update('title')}
            placeholder={t('submit.fields.title.placeholder')}
            maxLength={LIMITS.title[1]}
            autoComplete="off"
            inputClassName="py-2 text-sm"
          />

          <div>
            <Field
              as="textarea"
              rows={5}
              label={t('submit.fields.description.label')}
              hint={t('submit.fields.description.hint')}
              error={errors.description}
              required
              requiredLabel={t('common.required')}
              value={form.description}
              onChange={update('description')}
              placeholder={t('submit.fields.description.placeholder')}
              maxLength={LIMITS.description[1]}
              inputClassName="min-h-[8rem] resize-y py-2 text-sm"
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {t('submit.fields.description.counter', { count: descriptionCount, max: LIMITS.description[1] })}
            </p>
          </div>

          <div className="grid gap-3.5 lg:grid-cols-2 lg:gap-4">
            <Field
              label={t('submit.fields.location.label')}
              hint={t('submit.fields.location.hint')}
              error={errors.location}
              required
              requiredLabel={t('common.required')}
              value={form.location}
              onChange={update('location')}
              placeholder={t('submit.fields.location.placeholder')}
              maxLength={LIMITS.location[1]}
              autoComplete="off"
              inputClassName="py-2 text-sm"
            />

            <Field
              as="select"
              label={t('submit.fields.category.label')}
              hint={t('submit.fields.category.hint')}
              optionalLabel={t('common.optional')}
              value={form.category}
              onChange={update('category')}
              inputClassName="py-2 text-sm"
            >
              <option value="">{t('submit.fields.category.placeholder')}</option>
              {CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {t(`category.${CATEGORY_KEY[value]}`, value)}
                </option>
              ))}
            </Field>
          </div>

          <div>
            <label htmlFor="complaint-image" className="mb-1.5 block text-sm font-medium text-slate-800">
              {t('submit.fields.image.label')} <span className="font-normal text-slate-500">({t('common.optional')})</span>
            </label>

            {uploadsDisabled ? (
              <Alert tone="info">{t('submit.fields.image.disabled')}</Alert>
            ) : !config ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`rounded-lg border p-3 transition-colors ${
                  dragOver ? 'border-brand-400 bg-brand-50' : 'border-slate-300 bg-white'
                }`}
              >
                <input
                  ref={fileInput}
                  id="complaint-image"
                  type="file"
                  accept={allowedTypes.join(',')}
                  onChange={onImageChange}
                  aria-invalid={errors.image ? 'true' : undefined}
                  aria-describedby={errors.image ? 'complaint-image-hint' : undefined}
                  className="sr-only"
                />

                {!image ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-md bg-brand-50 p-2 text-brand-700">
                        <AttachmentIcon />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{t('submit.fields.image.attachTitle')}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{t('submit.fields.image.hint')}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {t('submit.fields.image.supportedAndLimit', { formats: acceptedTypesLabel, max: maxMb })}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto sm:shrink-0"
                      onClick={() => fileInput.current?.click()}
                    >
                      {t('submit.fields.image.choose')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <img src={imagePreview} alt={t('submit.fields.image.previewAlt')} className="h-20 w-24 rounded-md border border-slate-200 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{image.name}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{Math.round(image.size / 1024)} KB</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {t('submit.fields.image.supportedAndLimit', { formats: acceptedTypesLabel, max: maxMb })}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                      <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" onClick={() => fileInput.current?.click()}>
                        {t('submit.fields.image.replace')}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 sm:flex-none" onClick={removeImage}>
                        {t('submit.fields.image.remove')}
                      </Button>
                    </div>
                  </div>
                )}

                {errors.image && (
                  <p id="complaint-image-hint" className="mt-2 text-sm text-red-700" role="alert">
                    {errors.image}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <Field
              as="select"
              label={t('submit.fields.language.label')}
              hint={t('submit.fields.language.hint')}
              value={form.language}
              onChange={update('language')}
              inputClassName="py-2 text-sm"
            >
              {LANGUAGES.map(({ code, nativeName }) => (
                <option key={code} value={code} lang={code}>
                  {nativeName}
                </option>
              ))}
            </Field>

            <Button type="submit" disabled={submitting} className="w-full sm:w-auto sm:min-w-44 lg:mb-5">
              {submitting ? t('submit.submitting') : t('submit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

function AttachmentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 12.5 13.8 5.7a3 3 0 1 1 4.2 4.2L10 18a5 5 0 0 1-7-7L11 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
