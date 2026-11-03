import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, role: 'admin' }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  });
}

/** Protects every /api/admin/* route except login. */
export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw ApiError.unauthorized('Session expired or invalid. Please sign in again.');
  }

  // Look the admin up on every request so deactivated accounts lose access immediately.
  const admin = await Admin.findById(payload.sub);
  if (!admin || !admin.isActive) throw ApiError.unauthorized('Account not found or disabled.');

  req.admin = admin;
  next();
});
