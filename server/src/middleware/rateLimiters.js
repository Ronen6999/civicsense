import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const build = ({ max, windowMs }, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message } },
  });

export const submitLimiter = build(
  env.rateLimits.submit,
  'Too many complaints submitted from this network. Please try again later.'
);

export const trackLimiter = build(
  env.rateLimits.track,
  'Too many tracking attempts. Please wait a while and try again.'
);

export const loginLimiter = build(
  env.rateLimits.login,
  'Too many login attempts. Please wait a while and try again.'
);
