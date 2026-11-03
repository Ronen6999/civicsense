import { useTranslation } from 'react-i18next';
import { getMissingKeys } from '../i18n/index.js';
import { Alert } from './ui/Feedback.jsx';

const missingAssamese = getMissingKeys('as').length;

/** Honest notice shown only while the Assamese locale file is incomplete. Disappears on its own once it is full. */
export default function TranslationNotice() {
  const { i18n, t } = useTranslation();
  if (i18n.language !== 'as' || missingAssamese === 0) return null;
  return (
    <Alert tone="warning" className="mb-6">
      {t('notice.translationsIncomplete')}
    </Alert>
  );
}
