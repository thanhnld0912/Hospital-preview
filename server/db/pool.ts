import pg from 'pg';
import { getDatabaseConfig } from '../config/env.js';

let pool: pg.Pool | undefined;

// Pool được tạo một lần cho mỗi instance (serverless tái sử dụng giữa các request "warm")
export function getPool(): pg.Pool {
  if (!pool) {
    const config = getDatabaseConfig();
    pool = new pg.Pool({
      connectionString: config.url,
      // Supabase yêu cầu SSL; chứng chỉ của Supabase không nằm trong CA mặc định của Node
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      // Serverless: giữ ít kết nối mỗi instance, nên dùng Supabase Transaction pooler (port 6543)
      max: config.isProduction ? 3 : 10,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
    pool.on('error', (error) => {
      console.error('[db] Lỗi trên kết nối idle:', error.message);
    });
  }
  return pool;
}

export function query<T extends pg.QueryResultRow>(text: string, params: unknown[] = []) {
  return getPool().query<T>(text, params);
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
