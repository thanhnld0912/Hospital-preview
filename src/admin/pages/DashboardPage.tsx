import React, { useCallback, useEffect, useState } from 'react';
import { ApiError, apiRequest, HealthDto, LocationDto, PostDto, ServiceDto } from '../../services/api';
import { useAuth } from '../auth';
import { AdminButton, Card, PageHeader } from '../components/ui';
import { AdminLink } from '../router';

type Stat = { value: string; detail: string } | { error: true } | null;
type Health = 'online' | 'database-error' | 'offline' | null;

interface StatCardProps {
  label: string;
  icon: string;
  stat: Stat;
  to: string;
  linkLabel: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, icon, stat, to, linkLabel }) => (
  <Card className="p-5 flex flex-col">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-[#414755]">{label}</span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eef6f0] text-[#1c7a42]">
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </span>
    </div>
    {stat === null ? (
      <span className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-100" aria-label="Đang tải" />
    ) : 'error' in stat ? (
      <span className="mt-3 text-sm text-[#bb0112]">Không tải được</span>
    ) : (
      <>
        <span className="mt-2 text-3xl font-bold text-[#121c2a]">{stat.value}</span>
        <span className="text-xs text-gray-500">{stat.detail}</span>
      </>
    )}
    <AdminLink to={to} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#1c7a42] hover:underline">
      {linkLabel}
      <span className="material-symbols-outlined text-sm">arrow_forward</span>
    </AdminLink>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const { request, user } = useAuth();
  const [locations, setLocations] = useState<Stat>(null);
  const [posts, setPosts] = useState<Stat>(null);
  const [services, setServices] = useState<Stat>(null);
  const [health, setHealth] = useState<Health>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [locationResult, postResult, publishedResult, serviceResult, healthResult] = await Promise.allSettled([
      request<LocationDto[]>('/admin/locations'),
      request<PostDto[]>('/admin/posts?limit=1'),
      request<PostDto[]>('/admin/posts?status=PUBLISHED&limit=1'),
      request<ServiceDto[]>('/admin/services'),
      apiRequest<HealthDto>('/health'),
    ]);

    setLocations(
      locationResult.status === 'fulfilled'
        ? {
            value: String(locationResult.value.data.length),
            detail: `${locationResult.value.data.filter((item) => item.isActive).length} đang hiển thị`,
          }
        : { error: true },
    );
    setPosts(
      postResult.status === 'fulfilled'
        ? {
            value: String(postResult.value.meta?.total ?? 0),
            detail:
              publishedResult.status === 'fulfilled'
                ? `${publishedResult.value.meta?.total ?? 0} đã xuất bản`
                : 'Tin tức & thông báo',
          }
        : { error: true },
    );
    setServices(
      serviceResult.status === 'fulfilled'
        ? {
            value: String(serviceResult.value.data.length),
            detail: `${serviceResult.value.data.filter((item) => item.isActive).length} đang hiển thị`,
          }
        : { error: true },
    );
    if (healthResult.status === 'fulfilled') setHealth('online');
    else setHealth(healthResult.reason instanceof ApiError && healthResult.reason.status === 503 ? 'database-error' : 'offline');
    setRefreshing(false);
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  const healthView = {
    online: { dot: 'bg-[#1c7a42]', text: 'Online', detail: 'API và cơ sở dữ liệu hoạt động' },
    'database-error': { dot: 'bg-amber-500', text: 'Lỗi database', detail: 'API chạy nhưng không kết nối được cơ sở dữ liệu' },
    offline: { dot: 'bg-[#bb0112]', text: 'Offline', detail: 'Không kết nối được API' },
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Xin chào ${user?.fullName ?? ''} — tổng quan nội dung website.`}
        actions={
          <AdminButton variant="secondary" icon="refresh" onClick={load} loading={refreshing} loadingText="Đang tải...">
            Làm mới
          </AdminButton>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Địa điểm" icon="location_on" stat={locations} to="/admin/locations" linkLabel="Quản lý địa điểm" />
        <StatCard label="Bài viết" icon="newspaper" stat={posts} to="/admin/posts" linkLabel="Quản lý tin tức" />
        <StatCard label="Dịch vụ" icon="medical_services" stat={services} to="/admin/services" linkLabel="Quản lý dịch vụ" />
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#414755]">Backend</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eef6f0] text-[#1c7a42]">
              <span className="material-symbols-outlined text-xl">dns</span>
            </span>
          </div>
          {health === null ? (
            <span className="mt-3 h-8 w-24 animate-pulse rounded bg-gray-100" aria-label="Đang tải" />
          ) : (
            <>
              <span className="mt-2 flex items-center gap-2 text-2xl font-bold text-[#121c2a]">
                <span className={`h-3 w-3 rounded-full ${healthView[health].dot}`} />
                {healthView[health].text}
              </span>
              <span className="text-xs text-gray-500">{healthView[health].detail}</span>
            </>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-bold text-[#121c2a]">Thao tác nhanh</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { to: '/admin/settings', icon: 'call', label: 'Sửa số điện thoại, email' },
            { to: '/admin/locations', icon: 'add_location_alt', label: 'Cập nhật địa điểm & bản đồ' },
            { to: '/admin/posts', icon: 'edit_note', label: 'Đăng tin tức / thông báo' },
            { to: '/admin/services', icon: 'medical_services', label: 'Cập nhật dịch vụ' },
          ].map((item) => (
            <AdminLink
              key={item.label}
              to={item.to}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#121c2a] hover:border-[#a6d3b4] hover:bg-[#eef6f0]"
            >
              <span className="material-symbols-outlined text-lg text-[#1c7a42]">{item.icon}</span>
              {item.label}
            </AdminLink>
          ))}
        </div>
      </Card>
    </>
  );
};
