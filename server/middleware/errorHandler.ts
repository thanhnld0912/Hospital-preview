import type { ErrorRequestHandler, RequestHandler } from 'express';
import pg from 'pg';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

const CONNECTION_ERROR_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN']);

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function hasStringProp<K extends string>(value: unknown, key: K): value is Record<K, string> {
  return typeof value === 'object' && value !== null && typeof (value as Record<string, unknown>)[key] === 'string';
}

function toErrorResponse(error: unknown): { status: number; body: ErrorBody } {
  if (error instanceof ZodError) {
    return {
      status: 400,
      body: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        details: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      },
    };
  }

  if (error instanceof AppError) {
    return {
      status: error.status,
      body: { code: error.code, message: error.message, ...(error.details !== undefined && { details: error.details }) },
    };
  }

  if (error instanceof pg.DatabaseError) {
    // Không trả lỗi PostgreSQL gốc cho client
    switch (error.code) {
      case '23505':
        return { status: 409, body: { code: 'CONFLICT', message: 'Dữ liệu bị trùng (ví dụ slug hoặc email đã tồn tại)' } };
      case '23503':
        return { status: 409, body: { code: 'CONFLICT', message: 'Dữ liệu đang được tham chiếu bởi bản ghi khác' } };
      case '23514':
      case '23502':
        return { status: 400, body: { code: 'VALIDATION_ERROR', message: 'Dữ liệu vi phạm ràng buộc của cơ sở dữ liệu' } };
      default:
        return { status: 500, body: { code: 'DATABASE_ERROR', message: 'Lỗi cơ sở dữ liệu' } };
    }
  }

  if (
    (hasStringProp(error, 'code') && CONNECTION_ERROR_CODES.has(error.code)) ||
    (error instanceof Error && /timeout exceeded when trying to connect|Connection terminated/i.test(error.message))
  ) {
    return { status: 503, body: { code: 'DATABASE_UNAVAILABLE', message: 'Không kết nối được cơ sở dữ liệu' } };
  }

  // Lỗi của express.json() (body-parser)
  if (hasStringProp(error, 'type')) {
    if (error.type === 'entity.parse.failed') {
      return { status: 400, body: { code: 'INVALID_JSON', message: 'Body không phải JSON hợp lệ' } };
    }
    if (error.type === 'entity.too.large') {
      return { status: 413, body: { code: 'PAYLOAD_TOO_LARGE', message: 'Dữ liệu gửi lên quá lớn' } };
    }
  }

  return {
    status: 500,
    body: {
      code: 'INTERNAL_ERROR',
      message: isProduction() || !(error instanceof Error) ? 'Lỗi hệ thống' : error.message,
    },
  };
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Không tìm thấy endpoint ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  const { status, body } = toErrorResponse(error);
  if (status >= 500) {
    // Log đầy đủ phía server (không gửi stack trace cho client)
    console.error('[api]', error);
  }
  res.status(status).json({ success: false, error: body });
};
