import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './auth';
import { AdminLayout } from './components/AdminLayout';
import { AdminButton, EmptyState, ErrorState, LoadingState } from './components/ui';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { DutySchedulesPage } from './pages/DutySchedulesPage';
import { LocationsPage } from './pages/LocationsPage';
import { LoginPage } from './pages/LoginPage';
import { PostsPage } from './pages/PostsPage';
import { ServicesPage } from './pages/ServicesPage';
import { SettingsPage } from './pages/SettingsPage';
import { StaffPage } from './pages/StaffPage';
import { AdminLink, navigate, usePathname } from './router';

const ROUTES: Record<string, React.FC> = {
  '/admin': DashboardPage,
  '/admin/settings': SettingsPage,
  '/admin/locations': LocationsPage,
  '/admin/posts': PostsPage,
  '/admin/services': ServicesPage,
  '/admin/staff': StaffPage,
  '/admin/duty-schedules': DutySchedulesPage,
  '/admin/appointments': AppointmentsPage,
};

const FullScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#f5f7f6] p-4">{children}</div>
);

/** Chỉ hiển thị nội dung khi đã đăng nhập với role ADMIN (backend cũng kiểm tra trên mọi /api/admin/*) */
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status, user, retry, logout } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') navigate('/admin/login', { replace: true });
  }, [status]);

  if (status === 'error') {
    return (
      <FullScreen>
        <ErrorState message="Không kết nối được máy chủ để kiểm tra phiên đăng nhập." onRetry={retry} />
      </FullScreen>
    );
  }
  if (status !== 'authenticated' || !user) {
    return (
      <FullScreen>
        <LoadingState message="Đang kiểm tra phiên đăng nhập..." />
      </FullScreen>
    );
  }
  if (user.role !== 'ADMIN') {
    return (
      <FullScreen>
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xs max-w-md">
          <span className="material-symbols-outlined text-4xl text-[#bb0112]">block</span>
          <p className="mt-3 text-sm font-semibold text-[#121c2a]">Bạn không có quyền truy cập khu vực quản trị.</p>
          <AdminButton className="mt-5" variant="secondary" icon="logout" onClick={logout}>
            Đăng xuất
          </AdminButton>
        </div>
      </FullScreen>
    );
  }
  return <>{children}</>;
};

const AdminRoutes: React.FC = () => {
  const pathname = usePathname();

  if (pathname === '/admin/login') return <LoginPage />;

  const Page = ROUTES[pathname];
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        {Page ? (
          <Page />
        ) : (
          <EmptyState
            icon="search_off"
            message="Không tìm thấy trang quản trị này."
            action={
              <AdminLink to="/admin" className="text-sm font-semibold text-[#1c7a42] hover:underline">
                Về Dashboard
              </AdminLink>
            }
          />
        )}
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminRoutes />
    </AuthProvider>
  );
}
