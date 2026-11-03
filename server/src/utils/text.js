// Normalise to NFC so visually identical Assamese/Unicode strings are stored identically,
// and strip control characters (except newline and tab) that have no place in user text.
export function cleanText(value) {
  return String(value)
    .normalize('NFC')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
