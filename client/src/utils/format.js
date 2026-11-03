import i18n from '../i18n/index.js';

const localeFor = (lang) => (lang === 'as' ? 'as-IN' : 'en-IN');

function safeFormat(value, options) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(localeFor(i18n.language), options).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-IN', options).format(date);
  }
}

export const formatDate = (value) => safeFormat(value, { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (value) =>
  safeFormat(value, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
