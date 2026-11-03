import multer from 'multer';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(_req, _res, next) {
  next(ApiError.notFound('Route not found.'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = 500;
  let message = 'Something went wrong. Please try again later.';
  let details;

  if (err instanceof ApiError) {
    status = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `Image is too large. Maximum size is ${Math.round(env.maxImageSizeBytes / 1024 / 1024)} MB.`
        : 'Invalid upload.';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON.';
  } else if (err?.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Invalid data.';
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = 'Invalid identifier.';
  }

  if (status >= 500) {
    console.error(err);
  }

  const body = { error: { message } };
  if (details) body.error.details = details;
  if (!env.isProduction && status >= 500) body.error.debug = err?.message;

  res.status(status).json(body);
}
