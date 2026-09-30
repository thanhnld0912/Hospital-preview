import { query } from '../db/pool.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler, sendSuccess } from '../utils/http.js';

export const health = asyncHandler(async (_req, res) => {
  try {
    await query('SELECT 1');
  } catch (error) {
    console.error('[health] Không kết nối được database:', error instanceof Error ? error.message : error);
    throw new AppError(503, 'DATABASE_UNAVAILABLE', 'Không kết nối được cơ sở dữ liệu');
  }
  sendSuccess(res, { status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
});
