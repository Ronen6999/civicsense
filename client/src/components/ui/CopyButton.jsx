import { useTranslation } from 'react-i18next';
import Button from './Button.jsx';
import { useToast } from './ToastProvider.jsx';

export default function CopyButton({ value, label }) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(t('common.copied'), 'success');
    } catch {
      showToast(t('common.copyFallback'), 'info');
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={copy} aria-label={label}>
      {t('common.copy')}
    </Button>
  );
}
