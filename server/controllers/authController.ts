import { loginSchema } from '../schemas/auth.js';
import * as authService from '../services/authService.js';
import { unauthorized } from '../utils/errors.js';
import { asyncHandler, sendSuccess } from '../utils/http.js';

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  sendSuccess(res, await authService.login(input));
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized('UNAUTHORIZED', 'Chưa xác thực');
  sendSuccess(res, req.user);
});
