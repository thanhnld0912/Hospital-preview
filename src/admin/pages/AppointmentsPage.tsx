import React, { useCallback, useEffect, useState } from 'react';
import {
  AdminAppointmentDetailDto,
  AdminAppointmentListItemDto,
  AppointmentSensitiveDto,
  AppointmentStatus,
  LocationDto,
  ServiceDto,
} from '../../services/api';
import {
  APPOINTMENT_ACTION_LABELS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_OPTIONS,
  APPOINTMENT_STATUS_TONES,
  formatIsoDate,
} from '../../services/statuses';
import { useAuth } from '../auth';
import {
  AdminButton,
  AdminInput,
  AdminModal,
  AdminSelect,
  AdminTable,
  AdminTextarea,
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
import { describeError, emptyToNull, formatDateTime } from '../utils';

const PAGE_SIZE = 20;
/** Dữ liệu nhạy cảm chỉ hiển thị tạm thời, tự che lại sau 60 giây */
const REVEAL_SECONDS = 60;

const HISTORY_LABELS: Record<string, string> = {
  APPOINTMENT_CREATED: 'Người dân gửi đặt lịch',
  APPOINTMENT_VIEWED: 'Xem chi tiết',
  APPOINTMENT_SENSITIVE_DATA_VIEWED: 'Xem dữ liệu nhạy cảm',
  APPOINTMENT_UPDATED: 'Cập nhật',
  APPOINTMENT_CANCELLED: 'Hủy lịch hẹn',
  APPOINTMENT_DELETED: 'Xóa lịch hẹn',
};

const FIELD_LABELS: Record<string, string> = {
  status: 'trạng thái',
  internal_note: 'ghi chú nội bộ',
  phone: 'số điện thoại',
  citizen_id: 'CCCD',
};

function statusLabel(value: string | null): string {
  return value && value in APPOINTMENT_STATUS_LABELS ? APPOINTMENT_STATUS_LABELS[value as AppointmentStatus] : value ?? '';
}

// ---------------------------------------------------------------------------
// Chi tiết lịch hẹn
// ---------------------------------------------------------------------------
const AppointmentDetailModal: React.FC<{
  id: string;
  onClose: () => void;
  onChanged: (message: string) => void;
}> = ({ id, onClose, onChanged }) => {
  const { request } = useAuth();
  const [detail, setDetail] = useState<AdminAppointmentDetailDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [internalNote, setInternalNote] = useState('');
  // Chỉ giữ trong state của modal (không lưu storage / URL); xóa khi hết giờ hoặc đóng modal
  const [sensitive, setSensitive] = useState<AppointmentSensitiveDto | null>(null);
  const [revealLeft, setRevealLeft] = useState(0);
  const [confirming, setConfirming] = useState<AppointmentStatus | 'DELETE' | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const { data } = await request<AdminAppointmentDetailDto>(`/admin/appointments/${id}`);
      setDetail(data);
      setInternalNote(data.internalNote ?? '');
    } catch (error) {
      setLoadError(describeError(error));
    }
  }, [id, request]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!sensitive) return;
    if (revealLeft <= 0) {
      setSensitive(null);
      return;
    }
    const timer = setTimeout(() => setRevealLeft((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [sensitive, revealLeft]);

  const reveal = async () => {
    setBusy('reveal');
    setActionError(null);
    try {
      const { data } = await request<AppointmentSensitiveDto>(`/admin/appointments/${id}/sensitive-data`, { method: 'POST' });
      setSensitive(data);
      setRevealLeft(REVEAL_SECONDS);
    } catch (error) {
      setActionError(describeError(error));
    } finally {
      setBusy(null);
    }
  };

  const changeStatus = async (status: AppointmentStatus) => {
    setBusy(status);
    setActionError(null);
    try {
      const { data } = await request<AdminAppointmentDetailDto>(`/admin/appointments/${id}`, { method: 'PUT', body: { status } });
      setDetail(data);
      onChanged(`Đã chuyển lịch hẹn sang "${APPOINTMENT_STATUS_LABELS[status]}".`);
    } catch (error) {
      setActionError(describeError(error));
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  };

  const saveNote = async () => {
    setBusy('note');
    setActionError(null);
    try {
      const { data } = await request<AdminAppointmentDetailDto>(`/admin/appointments/${id}`, {
        method: 'PUT',
        body: { internalNote: emptyToNull(internalNote) },
      });
      setDetail(data);
      setInternalNote(data.internalNote ?? '');
      onChanged('Đã lưu ghi chú nội bộ.');
    } catch (error) {
      setActionError(describeError(error));
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy('delete');
    setActionError(null);
    try {
      await request(`/admin/appointments/${id}`, { method: 'DELETE' });
      onChanged('Đã xóa lịch hẹn khỏi danh sách (dữ liệu được lưu trữ, có ghi nhật ký).');
      onClose();
    } catch (error) {
      setActionError(describeError(error));
      setBusy(null);
      setConfirming(null);
    }
  };

  const close = () => {
    setSensitive(null);
    onClose();
  };

  return (
    <AdminModal title={detail ? `Lịch hẹn ${detail.bookingCode}` : 'Chi tiết lịch hẹn'} size="lg" onClose={close} locked={busy !== null || confirming !== null}>
      {loadError ? (
        <ErrorState message={loadError} onRetry={load} />
      ) : !detail ? (
        <LoadingState />
      ) : (
        <div className="space-y-5">
          {actionError && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-900" role="alert">
              {actionError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={APPOINTMENT_STATUS_TONES[detail.status]}>{APPOINTMENT_STATUS_LABELS[detail.status]}</StatusBadge>
            <span className="text-xs text-gray-500">Gửi lúc {formatDateTime(detail.createdAt)}</span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-500">Họ tên</dt>
              <dd className="font-semibold text-[#121c2a] break-words">{detail.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Ngày / khung giờ khám</dt>
              <dd className="font-semibold text-[#121c2a]">
                {formatIsoDate(detail.appointmentDate)} · {detail.slotLabel}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Số điện thoại</dt>
              <dd className="font-mono text-[#121c2a]" data-field="phone">
                {sensitive ? sensitive.phone : detail.phoneMasked}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">CCCD</dt>
              <dd className="font-mono text-[#121c2a]" data-field="citizen-id">
                {sensitive ? sensitive.citizenId ?? '—' : detail.citizenIdMasked ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Cơ sở</dt>
              <dd className="text-[#121c2a]">{detail.location.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Dịch vụ</dt>
              <dd className="text-[#121c2a]">{detail.service.name}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-500">Ghi chú của người dân</dt>
              <dd className="text-[#121c2a] whitespace-pre-wrap break-words">{detail.note || '—'}</dd>
            </div>
          </dl>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-amber-900">
              {sensitive
                ? `Đang hiển thị dữ liệu nhạy cảm — tự ẩn sau ${revealLeft} giây. Thao tác đã được ghi nhật ký.`
                : 'SĐT và CCCD được che mặc định. Chỉ xem khi thực sự cần (thao tác được ghi nhật ký).'}
            </p>
            {sensitive ? (
              <AdminButton size="sm" variant="secondary" icon="visibility_off" onClick={() => setSensitive(null)}>
                Ẩn ngay
              </AdminButton>
            ) : (
              <AdminButton size="sm" variant="secondary" icon="visibility" loading={busy === 'reveal'} loadingText="Đang tải..." onClick={reveal}>
                Hiển thị dữ liệu nhạy cảm
              </AdminButton>
            )}
          </div>

          {detail.allowedTransitions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#121c2a] mb-2">Cập nhật trạng thái</h3>
              <div className="flex flex-wrap gap-2">
                {detail.allowedTransitions.map((status) => {
                  const action = APPOINTMENT_ACTION_LABELS[status];
                  const destructive = status === 'CANCELLED' || status === 'NO_SHOW';
                  return (
                    <AdminButton
                      key={status}
                      size="sm"
                      variant={destructive ? 'ghost' : 'primary'}
                      icon={action.icon}
                      className={destructive ? 'text-[#bb0112] border-red-200' : ''}
                      loading={busy === status}
                      disabled={busy !== null}
                      onClick={() => (destructive ? setConfirming(status) : changeStatus(status))}
                    >
                      {action.label}
                    </AdminButton>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <AdminTextarea
              label="Ghi chú nội bộ"
              rows={2}
              maxLength={2000}
              value={internalNote}
              onChange={(event) => setInternalNote(event.target.value)}
              hint="Chỉ hiển thị trong trang quản trị."
            />
            <AdminButton
              size="sm"
              variant="secondary"
              icon="save"
              className="mt-2"
              loading={busy === 'note'}
              disabled={busy !== null || internalNote.trim() === (detail.internalNote ?? '')}
              onClick={saveNote}
            >
              Lưu ghi chú
            </AdminButton>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#121c2a] mb-2">Lịch sử thao tác</h3>
            <ol className="space-y-1.5 text-xs text-[#414755] max-h-48 overflow-y-auto">
              {detail.history.map((entry, index) => (
                <li key={index} className="flex flex-wrap gap-x-2 border-l-2 border-[#d4ecdb] pl-2">
                  <span className="text-gray-500">{formatDateTime(entry.createdAt)}</span>
                  <span className="font-medium text-[#121c2a]">{HISTORY_LABELS[entry.action] ?? entry.action}</span>
                  {entry.fromStatus && entry.toStatus && (
                    <span>
                      {statusLabel(entry.fromStatus)} → {statusLabel(entry.toStatus)}
                    </span>
                  )}
                  {entry.fields.length > 0 && !entry.toStatus && (
                    <span>({entry.fields.map((field) => FIELD_LABELS[field] ?? field).join(', ')})</span>
                  )}
                  <span className="text-gray-500">— {entry.actorName ?? 'Website công khai'}</span>
                </li>
              ))}
            </ol>
          </div>

          {detail.canDelete && (
            <div className="border-t border-gray-100 pt-4">
              <AdminButton size="sm" variant="ghost" icon="delete" className="text-[#bb0112]" onClick={() => setConfirming('DELETE')}>
                Xóa khỏi danh sách
              </AdminButton>
            </div>
          )}
        </div>
      )}

      {confirming && detail && (
        <ConfirmDialog
          message={
            confirming === 'DELETE'
              ? 'Xóa lịch hẹn khỏi danh sách? Dữ liệu được lưu trữ (xóa mềm) và thao tác được ghi nhật ký.'
              : confirming === 'CANCELLED'
                ? 'Bạn có chắc chắn muốn hủy lịch hẹn này không?'
                : 'Đánh dấu người dân không đến khám?'
          }
          detail={`${detail.bookingCode} — ${detail.fullName}`}
          confirmLabel={confirming === 'DELETE' ? 'Xóa' : APPOINTMENT_ACTION_LABELS[confirming].label}
          loading={busy !== null}
          onConfirm={() => (confirming === 'DELETE' ? remove() : changeStatus(confirming))}
          onCancel={() => setConfirming(null)}
        />
      )}
    </AdminModal>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
interface Filters {
  date: string;
  locationId: string;
  serviceId: string;
  status: string;
}

const EMPTY_FILTERS: Filters = { date: '', locationId: '', serviceId: '', status: '' };

export const AppointmentsPage: React.FC = () => {
  const { request } = useAuth();
  const [items, setItems] = useState<AdminAppointmentListItemDto[] | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    Promise.all([request<LocationDto[]>('/admin/locations'), request<ServiceDto[]>('/admin/services')])
      .then(([locationResult, serviceResult]) => {
        setLocations(locationResult.data);
        setServices(serviceResult.data);
      })
      .catch(() => undefined);
  }, [request]);

  const load = useCallback(async () => {
    setLoadError(null);
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
    for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
    try {
      const { data, meta } = await request<AdminAppointmentListItemDto[]>(`/admin/appointments?${params.toString()}`);
      setItems(data);
      setTotal(meta?.total ?? data.length);
    } catch (error) {
      setLoadError(describeError(error));
    }
  }, [request, filters, offset]);

  useEffect(() => {
    setItems(null);
    load();
  }, [load]);

  const setFilter = (field: keyof Filters) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOffset(0);
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <PageHeader
        title="Đặt lịch khám"
        description="Lịch hẹn người dân gửi từ website. SĐT và CCCD được che mặc định."
        actions={
          <AdminButton variant="secondary" icon="refresh" onClick={load}>
            Làm mới
          </AdminButton>
        }
      />
      <Notice notice={notice} onClose={closeNotice} />

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminInput label="Ngày khám" type="date" value={filters.date} onChange={setFilter('date')} />
          <AdminSelect
            label="Cơ sở"
            value={filters.locationId}
            onChange={setFilter('locationId')}
            options={[{ value: '', label: 'Tất cả cơ sở' }, ...locations.map((l) => ({ value: l.id, label: l.name }))]}
          />
          <AdminSelect
            label="Dịch vụ"
            value={filters.serviceId}
            onChange={setFilter('serviceId')}
            options={[{ value: '', label: 'Tất cả dịch vụ' }, ...services.map((s) => ({ value: s.id, label: s.title }))]}
          />
          <AdminSelect
            label="Trạng thái"
            value={filters.status}
            onChange={setFilter('status')}
            options={[{ value: '', label: 'Tất cả trạng thái' }, ...APPOINTMENT_STATUS_OPTIONS]}
          />
        </div>
        {hasFilters && (
          <AdminButton
            size="sm"
            variant="ghost"
            icon="filter_alt_off"
            className="mt-3"
            onClick={() => {
              setOffset(0);
              setFilters(EMPTY_FILTERS);
            }}
          >
            Xóa bộ lọc
          </AdminButton>
        )}
      </Card>

      <Card>
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : !items ? (
          <LoadingState />
        ) : items.length === 0 ? (
          <EmptyState icon="event_busy" message={hasFilters ? 'Không có lịch hẹn phù hợp bộ lọc.' : 'Chưa có lịch hẹn.'} />
        ) : (
          <>
            <AdminTable headers={['Mã', 'Ngày khám', 'Họ tên', 'SĐT', 'CCCD', 'Cơ sở', 'Dịch vụ', 'Trạng thái', 'Thao tác']}>
              {items.map((item) => (
                <tr key={item.id} className="align-top hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1c7a42] whitespace-nowrap">{item.bookingCode}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="block text-[#121c2a]">{formatIsoDate(item.appointmentDate)}</span>
                    <span className="text-xs text-gray-500">{item.slotLabel}</span>
                  </td>
                  <td className="px-4 py-3 min-w-[140px] font-medium text-[#121c2a]">{item.fullName}</td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{item.phoneMasked}</td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{item.citizenIdMasked ?? '—'}</td>
                  <td className="px-4 py-3 min-w-[120px] text-xs text-[#414755]">{item.location.name}</td>
                  <td className="px-4 py-3 min-w-[140px] text-xs text-[#414755]">{item.service.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={APPOINTMENT_STATUS_TONES[item.status]}>{APPOINTMENT_STATUS_LABELS[item.status]}</StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <AdminButton size="sm" variant="secondary" icon="visibility" onClick={() => setOpenId(item.id)}>
                      Chi tiết
                    </AdminButton>
                  </td>
                </tr>
              ))}
            </AdminTable>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-4 py-3 text-xs text-[#414755]">
              <span>
                {offset + 1}–{offset + items.length} / {total} lịch hẹn
              </span>
              <div className="flex gap-1.5">
                <AdminButton size="sm" variant="secondary" icon="chevron_left" disabled={offset === 0} onClick={() => setOffset(Math.max(offset - PAGE_SIZE, 0))}>
                  Trước
                </AdminButton>
                <AdminButton size="sm" variant="secondary" disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset(offset + PAGE_SIZE)}>
                  Sau
                </AdminButton>
              </div>
            </div>
          </>
        )}
      </Card>

      {openId && (
        <AppointmentDetailModal
          id={openId}
          onClose={() => setOpenId(null)}
          onChanged={(message) => {
            setNotice({ type: 'success', text: message });
            load();
          }}
        />
      )}
    </>
  );
};
