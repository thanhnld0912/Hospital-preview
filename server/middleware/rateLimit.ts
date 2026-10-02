import { createHmac, hkdfSync } from 'node:crypto';
import type { RequestHandler } from 'express';
import { getAppConfig } from '../config/env.js';
import { query } from '../db/pool.js';
import { AppError } from '../utils/errors.js';

// Giới hạn tần suất theo IP, cửa sổ cố định, bộ đếm lưu trong PostgreSQL (bảng rate_limits)
// để dùng chung giữa các instance serverless trên Vercel. Không lưu IP gốc: key = HMAC(IP).
// Lỗi database khi đếm => cho qua (fail-open) để không chặn nhầm người dân; lỗi được log (không kèm IP).

interface RateLimitOptions {
  bucket: string;
  windowSeconds: number;
  max: number;
  message: string;
}

let ipKey: Buffer | undefined;
function hashIp(ip: string): string {
  ipKey ??= Buffer.from(hkdfSync('sha256', getAppConfig().jwtSecret, 'code-hospital/rate-limit', 'ip-hmac/v1', 32));
  return createHmac('sha256', ipKey).update(ip).digest('hex');
}

export function rateLimit({ bucket, windowSeconds, max, message }: RateLimitOptions): RequestHandler {
  return (req, res, next) => {
    // trust proxy đã bật trong app.ts => req.ip là IP client thật (X-Forwarded-For do Vercel đặt)
    const keyHash = hashIp(req.ip ?? 'unknown');
    const windowStartMs = Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000;

    query<{ hits: number }>(
      `INSERT INTO rate_limits (bucket, key_hash, window_start, hits)
       VALUES ($1, $2, to_timestamp($3::double precision / 1000), 1)
       ON CONFLICT (bucket, key_hash, window_start) DO UPDATE SET hits = rate_limits.hits + 1
       RETURNING hits`,
      [bucket, keyHash, windowStartMs],
    )
      .then(({ rows }) => {
        // Dọn các cửa sổ cũ thỉnh thoảng (không chặn request)
        if (Math.random() < 0.02) {
          query(`DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`).catch(() => undefined);
        }
        const hits = rows[0]?.hits ?? 0;
        res.setHeader('RateLimit-Limit', String(max));
        res.setHeader('RateLimit-Remaining', String(Math.max(max - hits, 0)));
        if (hits > max) {
          const retryAfter = Math.ceil((windowStartMs + windowSeconds * 1000 - Date.now()) / 1000);
          res.setHeader('Retry-After', String(Math.max(retryAfter, 1)));
          next(new AppError(429, 'RATE_LIMITED', message));
          return;
        }
        next();
      })
      .catch((error: unknown) => {
        console.error(`[rate-limit] Không đếm được (${bucket}):`, error instanceof Error ? error.message : 'unknown');
        next();
      });
  };
}

/** Từ chối sớm body quá lớn cho các endpoint public nhỏ (trước khi xử lý) */
export function maxBodyBytes(limit: number): RequestHandler {
  return (req, _res, next) => {
    const length = Number(req.headers['content-length'] ?? 0);
    if (length > limit) {
      next(new AppError(413, 'PAYLOAD_TOO_LARGE', 'Dữ liệu gửi lên quá lớn'));
      return;
    }
    next();
  };
}

/** Không cho trình duyệt/CDN lưu cache phản hồi chứa dữ liệu quản trị / cá nhân */
export const noStore: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};
