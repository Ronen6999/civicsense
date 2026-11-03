import { ApiError } from '../utils/ApiError.js';

/**
 * Validate req[source] with a zod schema. Parsed (and cleaned) data is placed on
 * req.valid[source]; controllers must read from there, never from raw req.body/query.
 */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(ApiError.badRequest(details[0]?.message || 'Invalid request.', details));
    }
    req.valid = req.valid || {};
    req.valid[source] = result.data;
    return next();
  };
