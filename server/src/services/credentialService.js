import crypto from 'node:crypto';
import { env } from '../config/env.js';

// 32 symbols (no I, O, 0, 1) so each random byte maps to exactly 5 bits with no modulo bias,
// and the codes are easy to read aloud or copy by hand.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomString(length) {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] & 31];
  }
  return out;
}

/** Public, shareable reference, e.g. CS-2026-K7M2QX. Not a secret. */
export function generateComplaintId(date = new Date()) {
  return `CS-${date.getUTCFullYear()}-${randomString(6)}`;
}

/** Secret tracking token (100 bits), e.g. 7K2MQ-X9TPA-4HWNC-B3RYD. Shown to the user once. */
export function generateTrackingToken() {
  const raw = randomString(20);
  return raw.match(/.{5}/g).join('-');
}

/** Accepts the token with or without dashes/spaces and in any case. */
export function normalizeTrackingToken(token) {
  return String(token).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function normalizeComplaintId(id) {
  return String(id).trim().toUpperCase();
}

/** Keyed hash so a database leak alone does not allow offline guessing of tokens. */
export function hashTrackingToken(token) {
  return crypto
    .createHmac('sha256', env.trackingTokenSecret)
    .update(normalizeTrackingToken(token))
    .digest('hex');
}

export function tokenMatchesHash(token, storedHash) {
  const candidate = Buffer.from(hashTrackingToken(token), 'hex');
  const stored = Buffer.from(storedHash || '', 'hex');
  if (candidate.length !== stored.length) return false;
  return crypto.timingSafeEqual(candidate, stored);
}
