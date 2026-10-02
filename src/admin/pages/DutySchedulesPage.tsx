import React, { useCallback, useEffect, useState } from 'react';
import { DutyScheduleDto, DutyStatus, SiteSettingsDto, StaffDto } from '../../services/api';
import {
  DUTY_STATUS_LABELS,
  DUTY_STATUS_OPTIONS,
  DUTY_STATUS_TONES,
  formatIsoDate,
  personName,
  weekdayOf,
} from '../../services/statuses';
import { useAuth } from '../auth';
import {
  AdminButton,
  AdminCheckbox,
  AdminInput,
  AdminModal,
  AdminSelect,
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
import { describeError, emptyToNull, fieldErrors } from '../utils';

/** Hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD */
function todayInVietnam(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}

const NONE = '';

/** Màu viền/chữ của ô chọn trạng thái theo tông trạng thái */
const DUTY_STATUS_SELECT_STYLES = {
  green: 'border-[#a6d3b4] text-[#155f33]',
  gray: 'border-gray-300 text-[#414755]',
  amber: 'border-amber-300 text-amber-800',
  red: 'border-red-300 text-[#bb0112]',
} as const;

/** Danh sách chọn nhân sự: nhân sự đang hoạt động + người đang được gán (kể cả đã ẩn, để giữ lịch sử) */
function staffOptions(staff: StaffDto[], currentId: string | null | undefined, allowNone: boolean) {
  const options = staff
    .filter((member) => member.isActive || member.id === currentId)
    .map((member) => ({
      value: member.id,
      label: `${personName(member)}${member.isActive ? '' : ' (đã ẩn)'} — ${member.position}`,
    }));
  return allowNone ? [{ value: NONE, label: '— Không phân công —' }, ...options] : options;
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------
interface DutyForm {
  dutyDate: string;
  doctorStaffId: string;
  responsibleStaffId: string;
  nurseStaffId: string;
  note: string;
  status: DutyStatus;
  isActive: boolean;
  sortOrder: string;
}

const DutyFormModal: React.FC<{
  schedule: DutyScheduleDto | null;
  staff: StaffDto[];
  onClose: () => void;
  onSaved: (message: string) => void;
}> = ({ schedule, staff, onClose, onSaved }) => {
  const { request } = useAuth();
  const [form, setForm] = useState<DutyForm>(() => ({
    dutyDate: schedule?.dutyDate ?? todayInVietnam(),
    doctorStaffId: schedule?.doctor.id ?? NONE,
    responsibleStaffId: schedule?.responsible?.id ?? NONE,
    nurseStaffId: schedule?.nurse?.id ?? NONE,
    note: schedule?.note ?? '',
    status: schedule?.status ?? 'PLANNED',
    isActive: schedule?.isActive ?? true,
    sortOrder: String(schedule?.sortOrder ?? 0),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof DutyForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const sortOrder = Number(form.sortOrder);
    const clientErrors: Record<string, string> = {};
    if (!form.dutyDate) clientErrors.dutyDate = 'Vui lòng chọn ngày';
    if (!form.doctorStaffId) clientErrors.doctorStaffId = 'Vui lòng chọn bác sĩ trực chính';
    if (form.sortOrder.trim() === '' || !Number.isInteger(sortOrder) || sortOrder < 0) {
      clientErrors.sortOrder = 'Thứ tự phải là số nguyên ≥ 0';
    }
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setSaving(true);
    setErrors({});
    setFormError(null);
    const body = {
      dutyDate: form.dutyDate,
      doctorStaffId: form.doctorStaffId,
      responsibleStaffId: form.responsibleStaffId || null,
      nurseStaffId: form.nurseStaffId || null,
      note: emptyToNull(form.note),
      status: form.status,
      isActive: form.isActive,
      sortOrder,
    };
    try {
      if (schedule) {
        await request<DutyScheduleDto>(`/admin/duty-schedules/${schedule.id}`, { method: 'PUT', body });
        onSaved('Đã cập nhật lịch trực.');
      } else {
        await request<DutyScheduleDto>('/admin/duty-schedules', { method: 'POST', body });
        onSaved('Đã thêm lịch trực.');
      }
    } catch (error) {
      setErrors(fieldErrors(error));
      setFormError(describeError(error));
      setSaving(false);
    }
  };

  return (
    <AdminModal
      title={schedule ? 'Sửa lịch trực' : 'Thêm lịch trực'}
      onClose={onClose}
      locked={saving}
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </AdminButton>
          <AdminButton type="submit" form="duty-form" icon="save" loading={saving}>
            Lưu lịch trực
          </AdminButton>
        </>
      }
    >
      <form id="duty-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-900" role="alert">
            {formError}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput
            label="Ngày trực"
            type="date"
            required
            value={form.dutyDate}
            onChange={set('dutyDate')}
            error={errors.dutyDate}
            hint={form.dutyDate ? weekdayOf(form.dutyDate) : undefined}
          />
          <AdminSelect
            label="Trạng thái"
            value={form.status}
            onChange={set('status')}
            options={DUTY_STATUS_OPTIONS}
            error={errors.status}
          />
        </div>
        <AdminSelect
          label="Bác sĩ trực chính"
          required
          value={form.doctorStaffId}
          onChange={set('doctorStaffId')}
          options={[{ value: NONE, label: '— Chọn nhân sự —' }, ...staffOptions(staff, schedule?.doctor.id, false)]}
          error={errors.doctorStaffId}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminSelect
            label="Cán bộ phụ trách"
            value={form.responsibleStaffId}
            onChange={set('responsibleStaffId')}
            options={staffOptions(staff, schedule?.responsible?.id, true)}
            error={errors.responsibleStaffId}
          />
          <AdminSelect
            label="Điều dưỡng ca trực"
            value={form.nurseStaffId}
            onChange={set('nurseStaffId')}
            options={staffOptions(staff, schedule?.nurse?.id, true)}
            error={errors.nurseStaffId}
          />
        </div>
        <AdminInput
          label="Ghi chú ca trực"
          value={form.note}
          onChange={set('note')}
          error={errors.note}
          maxLength={200}
          placeholder="Ví dụ: Trực 24/24 · Kíp cấp cứu trực ban 24/7"
          hint="Hiển thị dưới ngày trực trên website. Không nhập tên nhân sự ở đây — chọn ở các ô bên trên."
        />
        <div className="grid grid-cols-2 gap-4 items-end">
          <AdminInput
            label="Thứ tự trong ngày"
            type="number"
            min={0}
            step={1}
            value={form.sortOrder}
            onChange={set('sortOrder')}
            error={errors.sortOrder}
          />
          <div className="pb-2">
            <AdminCheckbox
              label="Hiển thị"
              hint="Bỏ chọn để ẩn lịch này khỏi website"
              checked={form.isActive}
              onChange={(checked) => setForm((current) => ({ ...current, isActive: checked }))}
            />
          </div>
        </div>
      </form>
    </AdminModal>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export const DutySchedulesPage: React.FC = () => {
  const { request } = useAuth();
  const [schedules, setSchedules] = useState<DutyScheduleDto[] | null>(null);
  const [staff, setStaff] = useState<StaffDto[]>([]);
  const [sectionEnabled, setSectionEnabled] = useState<boolean | null>(null);
  const [scope, setScope] = useState<'upcoming' | 'all'>('upcoming');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const [editing, setEditing] = useState<DutyScheduleDto | 'new' | null>(null);
  const [deleting, setDeleting] = useState<DutyScheduleDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const query = scope === 'upcoming' ? `?from=${todayInVietnam()}` : '';
      const [scheduleResult, staffResult, settingsResult] = await Promise.all([
        request<DutyScheduleDto[]>(`/admin/duty-schedules${query}`),
        request<StaffDto[]>('/admin/staff'),
        request<SiteSettingsDto>('/site-settings'),
      ]);
      setSchedules(scheduleResult.data);
      setStaff(staffResult.data);
      setSectionEnabled(settingsResult.data.dutyScheduleEnabled);
    } catch (error) {
      setLoadError(describeError(error));
    }
  }, [request, scope]);

  useEffect(() => {
    setSchedules(null);
    load();
  }, [load]);

  const handleSaved = (message: string) => {
    setEditing(null);
    setNotice({ type: 'success', text: message });
    load();
  };

  const toggleSection = async (enabled: boolean) => {
    setBusy('section');
    try {
      const { data } = await request<SiteSettingsDto>('/admin/site-settings', { method: 'PUT', body: { dutyScheduleEnabled: enabled } });
      setSectionEnabled(data.dutyScheduleEnabled);
      setNotice({
        type: 'success',
        text: enabled ? 'Đã hiển thị lịch trực trên website.' : 'Đã ẩn lịch trực khỏi website (dữ liệu lịch vẫn được giữ nguyên).',
      });
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
    } finally {
      setBusy(null);
    }
  };

  const update = async (schedule: DutyScheduleDto, body: Record<string, unknown>, message: string) => {
    setBusy(schedule.id);
    try {
      await request(`/admin/duty-schedules/${schedule.id}`, { method: 'PUT', body });
      setNotice({ type: 'success', text: message });
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
    } finally {
      setBusy(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await request(`/admin/duty-schedules/${deleting.id}`, { method: 'DELETE' });
      setNotice({ type: 'success', text: 'Đã xóa lịch trực.' });
      setDeleting(null);
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Lịch trực cấp cứu"
        description='Bảng "Lịch trực cấp cứu tuần này" ở trang Thông báo & Lịch trực (website hiển thị 7 ngày tính từ hôm nay, tự cập nhật).'
        actions={
          <AdminButton icon="add" onClick={() => setEditing('new')} disabled={staff.length === 0}>
            Thêm lịch trực
          </AdminButton>
        }
      />
      <Notice notice={notice} onClose={closeNotice} />

      <Card className="mb-4 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {sectionEnabled === null ? (
          <span className="text-sm text-gray-500">Đang tải cài đặt...</span>
        ) : (
          <AdminCheckbox
            label="Hiển thị lịch trực trên website"
            hint={
              sectionEnabled
                ? 'Đang hiển thị. Bỏ chọn để tạm ẩn cả section (dữ liệu lịch không bị xóa).'
                : 'Đang ẩn khỏi website. Bạn vẫn quản lý lịch bình thường.'
            }
            checked={sectionEnabled}
            onChange={(checked) => busy !== 'section' && toggleSection(checked)}
          />
        )}
        <div className="flex gap-1.5" role="group" aria-label="Phạm vi lịch">
          <AdminButton size="sm" variant={scope === 'upcoming' ? 'primary' : 'secondary'} onClick={() => setScope('upcoming')}>
            Từ hôm nay
          </AdminButton>
          <AdminButton size="sm" variant={scope === 'all' ? 'primary' : 'secondary'} onClick={() => setScope('all')}>
            Tất cả
          </AdminButton>
        </div>
      </Card>

      <Card>
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : !schedules ? (
          <LoadingState />
        ) : schedules.length === 0 ? (
          <EmptyState
            icon="calendar_month"
            message={scope === 'upcoming' ? 'Chưa có lịch trực từ hôm nay.' : 'Chưa có lịch trực.'}
            action={
              <AdminButton icon="add" onClick={() => setEditing('new')} disabled={staff.length === 0}>
                Thêm lịch trực
              </AdminButton>
            }
          />
        ) : (
          <AdminTable headers={['Ngày', 'Bác sĩ', 'Cán bộ', 'Điều dưỡng', 'Trạng thái', 'Thao tác']}>
            {schedules.map((schedule) => (
              <tr key={schedule.id} className={`align-top hover:bg-gray-50/60 ${schedule.isActive ? '' : 'opacity-60'}`}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="block font-semibold text-[#121c2a]">{weekdayOf(schedule.dutyDate)}</span>
                  <span className="text-xs text-gray-500">{formatIsoDate(schedule.dutyDate)}</span>
                  {schedule.note && <span className="block text-xs text-[#006c4e]">{schedule.note}</span>}
                </td>
                <td className="px-4 py-3 min-w-[150px] font-medium text-[#1c7a42]">
                  {personName(schedule.doctor)}
                  {!schedule.doctor.isActive && <span className="block text-[11px] text-gray-500">(nhân sự đã ẩn)</span>}
                </td>
                <td className="px-4 py-3 min-w-[140px] text-[#414755]">{personName(schedule.responsible) || '—'}</td>
                <td className="px-4 py-3 min-w-[140px] text-[#414755]">{personName(schedule.nurse) || '—'}</td>
                <td className="px-4 py-3 min-w-[170px]">
                  <label className="sr-only" htmlFor={`status-${schedule.id}`}>
                    Đổi trạng thái
                  </label>
                  <select
                    id={`status-${schedule.id}`}
                    value={schedule.status}
                    disabled={busy !== null}
                    onChange={(event) =>
                      update(
                        schedule,
                        { status: event.target.value },
                        `Đã đổi trạng thái: ${DUTY_STATUS_LABELS[event.target.value as DutyStatus]}.`,
                      )
                    }
                    className={`w-full rounded-lg border bg-white px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1c7a42]/30 ${DUTY_STATUS_SELECT_STYLES[DUTY_STATUS_TONES[schedule.status]]}`}
                  >
                    {DUTY_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          schedule,
                          { isActive: !schedule.isActive },
                          schedule.isActive ? 'Đã ẩn lịch khỏi website.' : 'Đã hiển thị lịch trên website.',
                        )
                      }
                      disabled={busy !== null}
                      title={schedule.isActive ? 'Bấm để ẩn khỏi website' : 'Bấm để hiển thị trên website'}
                      className="disabled:opacity-50"
                    >
                      <StatusBadge tone={schedule.isActive ? 'green' : 'gray'}>{schedule.isActive ? 'Hiển thị' : 'Đã ẩn'}</StatusBadge>
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <AdminButton size="sm" variant="secondary" icon="edit" onClick={() => setEditing(schedule)}>
                      Sửa
                    </AdminButton>
                    <AdminButton size="sm" variant="ghost" icon="delete" className="text-[#bb0112]" onClick={() => setDeleting(schedule)}>
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
        <DutyFormModal
          schedule={editing === 'new' ? null : editing}
          staff={staff}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message="Bạn có chắc chắn muốn xóa lịch trực này không? Nếu chỉ muốn tạm ẩn, hãy dùng nút Hiển thị/Đã ẩn."
          detail={`${weekdayOf(deleting.dutyDate)} ${formatIsoDate(deleting.dutyDate)} — ${personName(deleting.doctor)}`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
};
