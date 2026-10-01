import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, ApiRequestOptions, ApiResult, apiRequest, AuthUser, LoginResult } from '../services/api';
import { navigate } from './router';

// JWT lưu trong sessionStorage: chỉ tồn tại trong tab hiện tại, tự xóa khi đóng tab.
// Không lưu mật khẩu; không log token; token không bao giờ hiển thị trên UI.
const TOKEN_KEY = 'code-hospital.admin.token';

function readToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Trình duyệt chặn storage: phiên chỉ tồn tại trong bộ nhớ
  }
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  /** true khi bị đăng xuất do token hết hạn/không hợp lệ */
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  retry: () => void;
  /** Gọi API kèm JWT; tự đăng xuất và chuyển về trang đăng nhập khi nhận 401 */
  request: <T>(path: string, options?: Omit<ApiRequestOptions, 'token'>) => Promise<ApiResult<T>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(readToken);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (readToken() ? 'loading' : 'unauthenticated'));
  const [sessionExpired, setSessionExpired] = useState(false);
  const [verifyAttempt, setVerifyAttempt] = useState(0);

  const clearSession = useCallback((expired: boolean) => {
    writeToken(null);
    setToken(null);
    setUser(null);
    setStatus('unauthenticated');
    setSessionExpired(expired);
    navigate('/admin/login', { replace: true });
  }, []);

  // Xác thực lại token đã lưu khi mở trang
  useEffect(() => {
    const storedToken = readToken();
    if (!storedToken) return;
    let active = true;
    setStatus('loading');
    apiRequest<AuthUser>('/auth/me', { token: storedToken })
      .then(({ data }) => {
        if (!active) return;
        setUser(data);
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) clearSession(true);
        else setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [verifyAttempt, clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiRequest<LoginResult>('/auth/login', { method: 'POST', body: { email, password } });
    writeToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setStatus('authenticated');
    setSessionExpired(false);
    return data.user;
  }, []);

  const logout = useCallback(() => clearSession(false), [clearSession]);
  const retry = useCallback(() => setVerifyAttempt((attempt) => attempt + 1), []);

  const request = useCallback(
    async <T,>(path: string, options: Omit<ApiRequestOptions, 'token'> = {}) => {
      try {
        return await apiRequest<T>(path, { ...options, token });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) clearSession(true);
        throw error;
      }
    },
    [token, clearSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, sessionExpired, login, logout, retry, request }),
    [status, user, sessionExpired, login, logout, retry, request],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return context;
}
