import React, { useCallback, useEffect, useState } from 'react';
import { LocationDto } from '../../services/api';
import { buildGoogleMapsEmbedUrl, buildGoogleMapsSearchUrl } from '../../services/maps';
import { useAuth } from '../auth';
import {
  AdminButton,
  AdminCheckbox,
  AdminInput,
  AdminModal,
  AdminTable,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
  NoticeMessage,
  PageHeader,
  StatusBadge,
} from '../components/ui';
import { describeError, emptyToNull, fieldErrors, reorderUpdates } from '../utils';

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------
interface LocationForm {
  name: string;
  address: string;
  phone: string;
  latitude: string;
  longitude: string;
  mapUrl: string;
  isActive: boolean;
  sortOrder: string;
}

function parseCoordinate(value: string, limit: number): number | null | 'invalid' {
  const trimmed = value.trim().replace(',', '.');
  if (trimmed === '') return null;
  const number = Number(trimmed);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : 'invalid';
}

/** Xem trước bản đồ CHỈ từ tọa độ đang nhập của chính địa điểm này (không tự đoán) */
const LocationMapPreview: React.FC<{ address: string; latitude: number | null; longitude: number | null; mapUrl: string }> = ({
  address,
  latitude,
  longitude,
  mapUrl,
}) => {
  const hasCoordinates = latitude !== null && longitude !== null;
  return (
    <div className="rounded-lg border border-gray-200 bg-[#f7faf8] p-3">
      <p className="mb-2 text-xs font-semibold text-[#121c2a]">Xem trước bản đồ</p>
      {hasCoordinates ? (
        <iframe
          title="Xem trước vị trí theo tọa độ"
          src={buildGoogleMapsEmbedUrl({ address, latitude, longitude })}
          className="h-56 w-full rounded-md border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 bg-white text-center">
          <span className="material-symbols-outlined text-2xl text-gray-400">location_off</span>
          <span className="text-sm font-medium text-[#414755]">Chưa thiết lập tọa độ</span>
          <span className="px-4 text-xs text-gray-500">Website vẫn hiển thị bản đồ bằng cách tìm theo địa chỉ.</span>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {mapUrl.trim() && (
          <a
            href={mapUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-[#a6d3b4] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1c7a42] hover:bg-[#eef6f0]"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Xem trên Google Maps
          </a>
        )}
        {address.trim() && (
          <a
            href={buildGoogleMapsSearchUrl({ address: address.trim(), latitude: null, longitude: null })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#414755] hover:bg-gray-50"
          >
            <span className="material-symbols-outlined text-sm">search</span>
            Tìm địa chỉ này trên Google Maps
          </a>
        )}
      </div>
    </div>
  );
};

const LocationFormModal: React.FC<{
  location: LocationDto | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}> = ({ location, nextSortOrder, onClose, onSaved }) => {
  const { request } = useAuth();
  const [form, setForm] = useState<LocationForm>(() => ({
    name: location?.name ?? '',
    address: location?.address ?? '',
    phone: location?.phone ?? '',
    latitude: location?.latitude?.toString() ?? '',
    longitude: location?.longitude?.toString() ?? '',
    mapUrl: location?.customMapUrl ?? '',
    isActive: location?.isActive ?? true,
    sortOrder: String(location?.sortOrder ?? nextSortOrder),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const latitude = parseCoordinate(form.latitude, 90);
  const longitude = parseCoordinate(form.longitude, 180);
  const set = (field: keyof LocationForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    // Xóa lỗi cũ của trường đang sửa (tọa độ: xóa lỗi của cả cặp latitude/longitude)
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      if (field === 'latitude' || field === 'longitude') {
        delete next.latitude;
        delete next.longitude;
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const clientErrors: Record<string, string> = {};
    if (latitude === 'invalid') clientErrors.latitude = 'Latitude phải là số từ -90 đến 90';
    if (longitude === 'invalid') clientErrors.longitude = 'Longitude phải là số từ -180 đến 180';
    if (latitude !== 'invalid' && longitude !== 'invalid' && (latitude === null) !== (longitude === null)) {
      clientErrors.latitude = 'Cần nhập đồng thời latitude và longitude (hoặc để trống cả hai)';
    }
    const sortOrder = Number(form.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) clientErrors.sortOrder = 'Thứ tự phải là số nguyên ≥ 0';
    if (Object.keys(clientErrors).length > 0 || latitude === 'invalid' || longitude === 'invalid') {
      setErrors(clientErrors);
      return;
    }

    setSaving(true);
    setErrors({});
    setFormError(null);
    try {
      const body = {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: emptyToNull(form.phone),
        latitude,
        longitude,
        mapUrl: emptyToNull(form.mapUrl),
        isActive: form.isActive,
        sortOrder,
      };
      if (location) {
        await request<LocationDto>(`/admin/locations/${location.id}`, { method: 'PUT', body });
        onSaved('Đã cập nhật địa điểm.');
      } else {
        await request<LocationDto>('/admin/locations', { method: 'POST', body });
        onSaved('Đã thêm địa điểm.');
      }
    } catch (error) {
      setErrors(fieldErrors(error));
      setFormError(describeError(error));
      setSaving(false);
    }
  };

  return (
    <AdminModal
      title={location ? 'Sửa địa điểm' : 'Thêm địa điểm'}
      size="lg"
      onClose={onClose}
      locked={saving}
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </AdminButton>
          <AdminButton type="submit" form="location-form" icon="save" loading={saving}>
            Lưu địa điểm
          </AdminButton>
        </>
      }
    >
      <form id="location-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          {formError && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-900" role="alert">
              {formError}
            </p>
          )}
          <AdminInput label="Tên địa điểm" required value={form.name} onChange={set('name')} error={errors.name} autoFocus />
          <AdminInput label="Địa chỉ" required value={form.address} onChange={set('address')} error={errors.address} />
          <AdminInput label="Số điện thoại" value={form.phone} onChange={set('phone')} error={errors.phone} hint="Để trống nếu không có." />
          <div className="grid grid-cols-2 gap-3">
            <AdminInput
              label="Latitude"
              inputMode="decimal"
              placeholder="Ví dụ: 16.06"
              value={form.latitude}
              onChange={set('latitude')}
              error={errors.latitude}
            />
            <AdminInput
              label="Longitude"
              inputMode="decimal"
              placeholder="Ví dụ: 108.23"
              value={form.longitude}
              onChange={set('longitude')}
              error={errors.longitude}
            />
          </div>
          <p className="-mt-2 text-xs text-gray-500">
            Chỉ nhập tọa độ đã xác minh (trên Google Maps: nhấp chuột phải vào đúng vị trí → sao chép tọa độ). Để trống nếu
            chưa có.
          </p>
          <AdminInput
            label="Map URL"
            placeholder="https://maps.app.goo.gl/..."
            value={form.mapUrl}
            onChange={set('mapUrl')}
            error={errors.mapUrl}
            hint="Tùy chọn. Dùng khi chưa có tọa độ; nếu có tọa độ, website ưu tiên tọa độ."
          />
          <div className="grid grid-cols-2 gap-3 items-end">
            <AdminInput
              label="Thứ tự"
              type="number"
              min={0}
              step={1}
              value={form.sortOrder}
              onChange={set('sortOrder')}
              error={errors.sortOrder}
            />
            <div className="pb-2">
              <AdminCheckbox
                label="Hoạt động"
                hint="Hiển thị trên website"
                checked={form.isActive}
                onChange={(checked) => setForm((current) => ({ ...current, isActive: checked }))}
              />
            </div>
          </div>
        </div>
        <LocationMapPreview
          address={form.address}
          latitude={latitude === 'invalid' ? null : latitude}
          longitude={longitude === 'invalid' ? null : longitude}
          mapUrl={form.mapUrl}
        />
      </form>
    </AdminModal>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export const LocationsPage: React.FC = () => {
  const { request } = useAuth();
  const [locations, setLocations] = useState<LocationDto[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const [editing, setEditing] = useState<LocationDto | 'new' | null>(null);
  const [deleting, setDeleting] = useState<LocationDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const { data } = await request<LocationDto[]>('/admin/locations');
      setLocations(data);
    } catch (error) {
      setLoadError(describeError(error));
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = (message: string) => {
    setEditing(null);
    setNotice({ type: 'success', text: message });
    load();
  };

  const toggleActive = async (location: LocationDto) => {
    setBusyId(location.id);
    try {
      await request(`/admin/locations/${location.id}`, { method: 'PUT', body: { isActive: !location.isActive } });
      setNotice({ type: 'success', text: location.isActive ? 'Đã ẩn địa điểm khỏi website.' : 'Đã hiển thị địa điểm trên website.' });
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    if (!locations) return;
    const updates = reorderUpdates(locations, index, direction);
    if (updates.length === 0) return;
    setBusyId(locations[index].id);
    try {
      for (const update of updates) {
        await request(`/admin/locations/${update.id}`, { method: 'PUT', body: { sortOrder: update.sortOrder } });
      }
      setNotice({ type: 'success', text: 'Đã cập nhật thứ tự.' });
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
    } finally {
      await load();
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await request(`/admin/locations/${deleting.id}`, { method: 'DELETE' });
      setNotice({ type: 'success', text: 'Đã xóa địa điểm.' });
      setDeleting(null);
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const nextSortOrder = (locations?.reduce((max, item) => Math.max(max, item.sortOrder), 0) ?? 0) + 1;

  return (
    <>
      <PageHeader
        title="Địa điểm"
        description="Các cơ sở / điểm trạm hiển thị trên trang chủ, trang Liên hệ và bản đồ."
        actions={
          <AdminButton icon="add" onClick={() => setEditing('new')}>
            Thêm địa điểm
          </AdminButton>
        }
      />
      <Notice notice={notice} onClose={closeNotice} />
      <Card>
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : !locations ? (
          <LoadingState />
        ) : locations.length === 0 ? (
          <EmptyState
            icon="location_off"
            message="Chưa có địa điểm."
            action={
              <AdminButton icon="add" onClick={() => setEditing('new')}>
                Thêm địa điểm
              </AdminButton>
            }
          />
        ) : (
          <AdminTable headers={['Tên', 'Địa chỉ', 'Điện thoại', 'Trạng thái', 'Thứ tự', 'Thao tác']}>
            {locations.map((location, index) => (
              <tr key={location.id} className="align-top hover:bg-gray-50/60">
                <td className="px-4 py-3 min-w-[150px]">
                  <span className="font-semibold text-[#121c2a]">{location.name}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {location.latitude !== null ? 'Có tọa độ' : 'Chưa có tọa độ'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#414755] min-w-[220px]">
                  {location.address}
                  <a
                    href={location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 flex items-center gap-0.5 text-xs font-semibold text-[#1c7a42] hover:underline"
                  >
                    Xem bản đồ <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </td>
                <td className="px-4 py-3 text-[#414755] whitespace-nowrap">{location.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(location)}
                    disabled={busyId !== null}
                    title={location.isActive ? 'Bấm để ẩn khỏi website' : 'Bấm để hiển thị trên website'}
                    className="disabled:opacity-50"
                  >
                    <StatusBadge tone={location.isActive ? 'green' : 'gray'}>
                      {location.isActive ? 'Hoạt động' : 'Đã tắt'}
                    </StatusBadge>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-6 text-center font-mono text-xs text-[#414755]">{location.sortOrder}</span>
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || busyId !== null}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#414755] hover:bg-gray-100 disabled:opacity-30"
                      aria-label={`Đưa ${location.name} lên`}
                    >
                      <span className="material-symbols-outlined text-lg">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === locations.length - 1 || busyId !== null}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#414755] hover:bg-gray-100 disabled:opacity-30"
                      aria-label={`Đưa ${location.name} xuống`}
                    >
                      <span className="material-symbols-outlined text-lg">arrow_downward</span>
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <AdminButton size="sm" variant="secondary" icon="edit" onClick={() => setEditing(location)}>
                      Sửa
                    </AdminButton>
                    <AdminButton size="sm" variant="ghost" icon="delete" className="text-[#bb0112]" onClick={() => setDeleting(location)}>
                      Xóa
                    </AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </Card>

      {editing && (
        <LocationFormModal
          location={editing === 'new' ? null : editing}
          nextSortOrder={nextSortOrder}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {deleting && (
        <ConfirmDialog
          detail={`${deleting.name} — ${deleting.address}`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
};
