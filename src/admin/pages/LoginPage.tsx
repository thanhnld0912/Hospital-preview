import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { AdminButton, AdminInput, LoadingState } from '../components/ui';
import { navigate } from '../router';
import { describeError } from '../utils';

export const LoginPage: React.FC = () => {
  const { status, login, sessionExpired } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Đăng nhập – Code-Hospital Admin';
  }, []);

  // Đã đăng nhập thì không ở lại trang đăng nhập
  useEffect(() => {
    if (status === 'authenticated') navigate('/admin', { replace: true });
  }, [status]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (loginError) {
      setError(describeError(loginError));
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7f6] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <img src="/logo.jpg" alt="Biểu trưng Trạm Y tế An Hải" width={72} height={72} className="h-18 w-18 object-contain" />
            <h1 className="mt-3 text-xl font-bold text-[#1c7a42]">Code-Hospital</h1>
            <p className="text-sm text-[#414755]">Quản trị hệ thống</p>
          </div>

          {status === 'loading' ? (
            <LoadingState message="Đang kiểm tra phiên đăng nhập..." />
          ) : (
            // method="post": thông tin đăng nhập không bao giờ xuất hiện trên URL
            <form method="post" onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate={false}>
              {sessionExpired && !error && (
                <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900" role="status">
                  Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
                </p>
              )}
              {error && (
                <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-900" role="alert">
                  {error}
                </p>
              )}
              <AdminInput
                label="Email"
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
              />
              <AdminInput
                label="Mật khẩu"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={submitting}
              />
              <AdminButton type="submit" className="w-full" icon="login" loading={submitting} loadingText="Đang đăng nhập...">
                Đăng nhập
              </AdminButton>
            </form>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">
          <a href="/" className="hover:text-[#1c7a42] hover:underline">
            ← Về trang website
          </a>
        </p>
      </div>
    </div>
  );
};
