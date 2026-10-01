import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { AdminLink, usePathname } from '../router';

export const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/settings', label: 'Thông tin website', icon: 'settings' },
  { to: '/admin/locations', label: 'Địa điểm', icon: 'location_on' },
  { to: '/admin/posts', label: 'Tin tức', icon: 'newspaper' },
  { to: '/admin/services', label: 'Dịch vụ', icon: 'medical_services' },
] as const;

const AdminSidebar: React.FC<{ pathname: string; onNavigate: () => void }> = ({ pathname, onNavigate }) => {
  const { logout } = useAuth();
  return (
    <nav className="flex h-full flex-col gap-1 p-3" aria-label="Điều hướng quản trị">
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = pathname === item.to;
        return (
          <AdminLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? 'bg-[#d4ecdb] text-[#155f33] font-semibold' : 'text-[#414755] hover:bg-[#eef6f0] hover:text-[#121c2a]'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </AdminLink>
        );
      })}
      <div className="mt-auto border-t border-gray-200 pt-3 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#414755] hover:bg-[#eef6f0]"
        >
          <span className="material-symbols-outlined text-xl">open_in_new</span>
          <span>Xem website</span>
        </a>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#bb0112] hover:bg-red-50"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </nav>
  );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const current = ADMIN_NAV_ITEMS.find((item) => item.to === pathname);

  useEffect(() => {
    document.title = `${current?.label ?? 'Quản trị'} – Code-Hospital Admin`;
  }, [current]);

  // Đóng drawer bằng phím Esc
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKey = (event: KeyboardEvent) => event.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#121c2a]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-[#414755] hover:bg-gray-100"
          aria-label="Mở menu quản trị"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <AdminLink to="/admin" className="flex items-center gap-2.5 min-w-0">
          <img src="/logo.jpg" alt="" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" />
          <span className="truncate text-base font-bold text-[#1c7a42]">Code-Hospital</span>
          <span className="hidden sm:inline-flex rounded-md bg-[#eef6f0] px-2 py-0.5 text-xs font-semibold text-[#155f33]">
            Admin
          </span>
        </AdminLink>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-sm font-semibold text-[#121c2a]">{user?.fullName}</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4ecdb] text-sm font-bold text-[#155f33]">
            {user?.fullName.trim().charAt(0).toUpperCase() ?? 'A'}
          </span>
          <button
            type="button"
            onClick={logout}
            className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-[#414755] hover:bg-gray-50"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-gray-200 bg-white">
          <AdminSidebar pathname={pathname} onNavigate={() => undefined} />
        </aside>

        {/* Drawer mobile */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu quản trị">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
              <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
                <span className="font-bold text-[#1c7a42]">Code-Hospital Admin</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
                  aria-label="Đóng menu"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AdminSidebar pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {current && current.to !== '/admin' && (
            <nav className="mb-2 flex items-center gap-1.5 text-xs text-gray-500" aria-label="Breadcrumb">
              <AdminLink to="/admin" className="hover:text-[#1c7a42]">
                Dashboard
              </AdminLink>
              <span>/</span>
              <span className="font-semibold text-[#1c7a42]">{current.label}</span>
            </nav>
          )}
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
