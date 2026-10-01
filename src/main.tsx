import {createRoot} from 'react-dom/client';
import {lazy, Suspense} from 'react';
import App from './App.tsx';
import './index.css';
import {preloadSiteContent} from './services/siteContent';

// Khu vực quản trị được tải riêng (code splitting) — không làm nặng website công khai
const AdminApp = lazy(() => import('./admin/AdminApp'));

const root = createRoot(document.getElementById('root')!);
const {pathname} = window.location;

if (pathname === '/admin' || pathname.startsWith('/admin/')) {
  root.render(
    <Suspense fallback={null}>
      <AdminApp />
    </Suspense>,
  );
} else {
  // Lấy dữ liệu từ API trước khi render để hiển thị đúng nội dung admin đã cập nhật
  preloadSiteContent().finally(() => root.render(<App />));
}
