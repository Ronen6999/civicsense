import 'dotenv/config';

const required = (name) => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}. See server/.env.example`);
  }
  return value.trim();
};

const requiredSecret = (name) => {
  const value = required(name);
  if (value.length < 32) {
    throw new Error(`${name} must be at least 32 characters long.`);
  }
  return value;
};

const int = (name, fallback) => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
};

const jwtSecret = requiredSecret('JWT_SECRET');
const trackingTokenSecret = requiredSecret('TRACKING_TOKEN_SECRET');

if (jwtSecret === trackingTokenSecret) {
  throw new Error('JWT_SECRET and TRACKING_TOKEN_SECRET must be different values.');
}

const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() || '',
  apiKey: process.env.CLOUDINARY_API_KEY?.trim() || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET?.trim() || '',
};

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: int('PORT', 5000),
  mongodbUri: required('MONGODB_URI'),
  mongodbDnsServer: process.env.MONGODB_DNS_SERVER?.trim() || '',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  trustProxy: process.env.TRUST_PROXY === '1',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  trackingTokenSecret,
  cloudinary: {
    ...cloudinary,
    enabled: Boolean(cloudinary.cloudName && cloudinary.apiKey && cloudinary.apiSecret),
  },
  maxImageSizeBytes: int('MAX_IMAGE_SIZE_MB', 5) * 1024 * 1024,
  groq: {
    apiKey: process.env.GROQ_API_KEY?.trim() || '',
    model: process.env.GROQ_MODEL?.trim() || 'qwen/qwen3.8-27b',
    enabled: Boolean(process.env.GROQ_API_KEY?.trim()),
  },
  rateLimits: {
    submit: {
      max: int('SUBMIT_RATE_LIMIT_MAX', 10),
      windowMs: int('SUBMIT_RATE_LIMIT_WINDOW_MIN', 60) * 60 * 1000,
    },
    track: {
      max: int('TRACK_RATE_LIMIT_MAX', 30),
      windowMs: int('TRACK_RATE_LIMIT_WINDOW_MIN', 15) * 60 * 1000,
    },
    login: {
      max: int('LOGIN_RATE_LIMIT_MAX', 10),
      windowMs: int('LOGIN_RATE_LIMIT_WINDOW_MIN', 15) * 60 * 1000,
    },
  },
});
