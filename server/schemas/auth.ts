import { z } from 'zod';
import { emailSchema } from './common.js';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mật khẩu là bắt buộc').max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;
