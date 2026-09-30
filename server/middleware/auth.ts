import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getAppConfig } from '../config/env.js';
import { findActiveUserById } from '../services/authService.js';
import { USER_ROLES } from '../types/auth.js';
import { forbidden, unauthorized } from '../utils/errors.js';
import { asyncHandler } from '../utils/http.js';

const tokenPayloadSchema = z.object({
  sub: z.uuid(),
  role: z.enum(USER_ROLES),
});

/** Xác thực "Authorization: Bearer <token>" (JWT HS256) và gán req.user */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw unauthorized('UNAUTHORIZED', 'Thiếu token xác thực (Authorization: Bearer <token>)');
  }

  let payload: unknown;
  try {
    payload = jwt.verify(header.slice('Bearer '.length).trim(), getAppConfig().jwtSecret, {
      algorithms: ['HS256'],
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw unauthorized('TOKEN_EXPIRED', 'Token đã hết hạn, vui lòng đăng nhập lại');
    }
    throw unauthorized('INVALID_TOKEN', 'Token không hợp lệ');
  }

  const claims = tokenPayloadSchema.safeParse(payload);
  if (!claims.success) {
    throw unauthorized('INVALID_TOKEN', 'Token không hợp lệ');
  }

  // Kiểm tra lại DB để tài khoản bị vô hiệu hóa mất quyền ngay, không chờ token hết hạn
  const user = await findActiveUserById(claims.data.sub);
  if (!user) {
    throw unauthorized('INVALID_TOKEN', 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa');
  }

  req.user = user;
  next();
});

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    next(unauthorized('UNAUTHORIZED', 'Chưa xác thực'));
    return;
  }
  if (req.user.role !== 'ADMIN') {
    next(forbidden('Chỉ quản trị viên mới được thực hiện thao tác này'));
    return;
  }
  next();
};
