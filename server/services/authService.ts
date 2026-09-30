import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAppConfig } from '../config/env.js';
import { query } from '../db/pool.js';
import type { LoginInput } from '../schemas/auth.js';
import type { AuthUser, UserRole } from '../types/auth.js';
import { AppError } from '../utils/errors.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

// Hash giả (không ứng với tài khoản nào) để so sánh khi email không tồn tại,
// giúp thời gian phản hồi tương đương và không lộ email nào đã đăng ký.
const DUMMY_PASSWORD_HASH = '$2b$12$x8yRBrEEtA4Ze5kKhxP9Mun4.DmG4bxWACyi3Qe7dCh/el3IFV5zC';

function toAuthUser(row: UserRow): AuthUser {
  return { id: row.id, email: row.email, fullName: row.full_name, role: row.role };
}

export async function login(input: LoginInput): Promise<{ token: string; user: AuthUser }> {
  const { rows } = await query<UserRow>(
    'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = $1',
    [input.email],
  );
  const user = rows[0];
  const passwordMatches = await bcrypt.compare(input.password, user?.password_hash ?? DUMMY_PASSWORD_HASH);

  if (!user || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng');
  }
  if (!user.is_active) {
    throw new AppError(403, 'ACCOUNT_DISABLED', 'Tài khoản đã bị vô hiệu hóa');
  }

  const config = getAppConfig();
  const token = jwt.sign({ role: user.role }, config.jwtSecret, {
    algorithm: 'HS256',
    subject: user.id,
    expiresIn: config.jwtExpiresInSeconds,
  });

  return { token, user: toAuthUser(user) };
}

export async function findActiveUserById(id: string): Promise<AuthUser | null> {
  const { rows } = await query<UserRow>(
    'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE id = $1 AND is_active = true',
    [id],
  );
  return rows[0] ? toAuthUser(rows[0]) : null;
}
