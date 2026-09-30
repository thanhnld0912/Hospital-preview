import type { AuthUser } from './auth.js';

declare global {
  namespace Express {
    interface Request {
      /** Được gán bởi middleware `authenticate` sau khi xác thực JWT thành công */
      user?: AuthUser;
    }
  }
}

export {};
