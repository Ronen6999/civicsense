import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import as from './locales/as.json';

const STORAGE_KEY = 'civicsense.lang';
const SUPPORTED = ['en', 'as'];

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(stored) ? stored : 'en';
  } catch {
    return 'en';
  }
}

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`]
  );
}

const resources = { en: { translation: en }, as: { translation: as } };

/** Keys present in English but absent in the given language. */
export function getMissingKeys(lang) {
  const have = new Set(flatten(resources[lang]?.translation ?? {}));
  return flatten(en).filter((key) => !have.has(key));
}

i18n.use(initReactI18next).init({
  resources,
  lng: readStoredLanguage(),
  // Untranslated Assamese keys fall back to English until real translations are added.
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
});

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage unavailable (private mode); preference just will not persist */
  }
}

applyLanguage(i18n.language);
i18n.on('languageChanged', applyLanguage);

export default i18n;
