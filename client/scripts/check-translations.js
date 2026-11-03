// Lists translation keys that exist in en.json but are missing from another locale.
//   npm run i18n:check            report only
//   npm run i18n:check -- --strict  exit with code 1 if anything is missing (for CI)
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n', 'locales');
const load = (file) => JSON.parse(readFileSync(join(dir, file), 'utf8'));

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );

const base = flatten(load('en.json'));
const strict = process.argv.includes('--strict');
let anyMissing = false;

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'en.json')) {
  const have = new Set(flatten(load(file)));
  const missing = base.filter((k) => !have.has(k));
  const lang = file.replace('.json', '');
  console.log(`${lang}: ${base.length - missing.length}/${base.length} keys translated`);
  if (missing.length) {
    anyMissing = true;
    for (const key of missing) console.log(`  missing: ${key}`);
  }
}

if (strict && anyMissing) process.exit(1);
