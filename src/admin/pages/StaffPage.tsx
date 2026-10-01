import React, { useCallback, useEffect, useState } from 'react';
import { StaffDto } from '../../services/api';
import { useAuth } from '../auth';
import {
  AdminButton,
  AdminCheckbox,
  AdminInput,
  AdminModal,
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
import { describeError, emptyToNull, fieldErrors, reorderUpdates } from '../utils';

/** Tên hiển thị trên website: chức danh viết tắt + họ tên, ví dụ "Bs.CKI. Tuấn Thọ Sinh" */
function displayName(member: Pick<StaffDto, 'title' | 'fullName'>): string {
  return [member.title, member.fullName].filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------
interface StaffForm {
  fullName: string;
  title: string;
  position: string;
  department: string;
  bio: string;
  qualification: string;
  avatarUrl: string;
  isActive: boolean;
  sortOrder: string;
}

const StaffFormModal: React.FC<{
  member: StaffDto | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}> = ({ member, nextSortOrder, onClose, onSaved }) => {
  const { request } = useAuth();
  const [form, setForm] = useState<StaffForm>(() => ({
    fullName: member?.fullName ?? '',
    title: member?.title ?? '',
    position: member?.position ?? '',
    department: member?.department ?? '',
    bio: member?.bio ?? '',
    qualification: member?.qualification ?? '',
    avatarUrl: member?.avatarUrl ?? '',
    isActive: member?.isActive ?? true,
    sortOrder: String(member?.sortOrder ?? nextSortOrder),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof StaffForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [field]: value }));
    // Sửa trường nào thì bỏ lỗi cũ của trường đó
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
    if (!form.fullName.trim()) clientErrors.fullName = 'Không được để trống';
    if (!form.position.trim()) clientErrors.position = 'Không được để trống';
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
      fullName: form.fullName.trim(),
      title: emptyToNull(form.title),
      position: form.position.trim(),
      department: emptyToNull(form.department),
      bio: emptyToNull(form.bio),
      qualification: emptyToNull(form.qualification),
      avatarUrl: emptyToNull(form.avatarUrl),
      isActive: form.isActive,
      sortOrder,
    };
    try {
      if (member) {
        await request<StaffDto>(`/admin/staff/${member.id}`, { method: 'PUT', body });
        onSaved('Đã cập nhật nhân sự.');
      } else {
        await request<StaffDto>('/admin/staff', { method: 'POST', body });
        onSaved('Đã thêm nhân sự.');
      }
    } catch (error) {
      setErrors(fieldErrors(error));
      setFormError(describeError(error));
      setSaving(false);
    }
  };

  const preview = displayName({ title: form.title.trim() || null, fullName: form.fullName.trim() });

  return (
    <AdminModal
      title={member ? 'Sửa nhân sự' : 'Thêm nhân sự'}
      size="lg"
      onClose={onClose}
      locked={saving}
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </AdminButton>
          <AdminButton type="submit" form="staff-form" icon="save" loading={saving}>
            Lưu nhân sự
          </AdminButton>
        </>
      }
    >
      <form id="staff-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-900" role="alert">
            {formError}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminInput
            label="Họ và tên"
            required
            value={form.fullName}
            onChange={set('fullName')}
            error={errors.fullName}
            className="md:col-span-2"
            placeholder="Ví dụ: Tuấn Thọ Sinh"
            autoFocus
          />
          <AdminInput
            label="Chức danh"
            value={form.title}
            onChange={set('title')}
            error={errors.title}
            placeholder="Ví dụ: Bs.CKI."
            hint="Viết tắt, hiển thị trước họ tên."
          />
        </div>
        {preview && (
          <p className="text-xs text-gray-500">
            Hiển thị trên website: <span className="font-semibold text-[#121c2a]">{preview}</span>
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput
            label="Chức vụ"
            required
            value={form.position}
            onChange={set('position')}
            error={errors.position}
            placeholder="Ví dụ: Trưởng Trạm Y tế"
          />
          <AdminInput
            label="Chuyên môn/Bộ phận"
            value={form.department}
            onChange={set('department')}
            error={errors.department}
            placeholder="Ví dụ: Ban Điều hành & Khám chữa bệnh"
          />
        </div>
        <AdminTextarea label="Giới thiệu" rows={3} value={form.bio} onChange={set('bio')} error={errors.bio} />
        <AdminInput
          label="Trình độ"
          value={form.qualification}
          onChange={set('qualification')}
          error={errors.qualification}
          placeholder="Ví dụ: Bác sĩ Chuyên khoa I Nội khoa"
          hint='Hiển thị ở dòng "Trình độ" cuối thẻ nhân sự.'
        />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
          <AdminInput
            label="Ảnh đại diện (không bắt buộc)"
            value={form.avatarUrl}
            onChange={set('avatarUrl')}
            error={errors.avatarUrl}
            hint='URL https://... hoặc đường dẫn bắt đầu bằng "/". Để trống sẽ hiển thị chữ cái đầu.'
          />
          {form.avatarUrl.trim() && (
            <img
              src={form.avatarUrl.trim()}
              alt="Xem trước ảnh đại diện"
              className="h-12 w-12 rounded-full border border-gray-200 object-cover md:mt-5"
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 items-end">
          <AdminInput
            label="Thứ tự hiển thị"
            type="number"
            min={0}
            step={1}
            required
            value={form.sortOrder}
            onChange={set('sortOrder')}
            error={errors.sortOrder}
          />
          <div className="pb-2">
            <AdminCheckbox
              label="Hiển thị"
              hint="Trạng thái: bỏ chọn để ẩn khỏi website"
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
export const StaffPage: React.FC = () => {
  const { request } = useAuth();
  const [staff, setStaff] = useState<StaffDto[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const [editing, setEditing] = useState<StaffDto | 'new' | null>(null);
  const [deleting, setDeleting] = useState<StaffDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const { data } = await request<StaffDto[]>('/admin/staff');
      setStaff(data);
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

  const toggleActive = async (member: StaffDto) => {
    setBusyId(member.id);
    try {
      await request(`/admin/staff/${member.id}`, { method: 'PUT', body: { isActive: !member.isActive } });
      setNotice({ type: 'success', text: member.isActive ? 'Đã ẩn nhân sự khỏi website.' : 'Đã hiển thị nhân sự trên website.' });
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    if (!staff) return;
    const updates = reorderUpdates(staff, index, direction);
    if (updates.length === 0) return;
    setBusyId(staff[index].id);
    try {
      for (const update of updates) {
        await request(`/admin/staff/${update.id}`, { method: 'PUT', body: { sortOrder: update.sortOrder } });
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
      await request(`/admin/staff/${deleting.id}`, { method: 'DELETE' });
      setNotice({ type: 'success', text: 'Đã xóa nhân sự.' });
      setDeleting(null);
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const nextSortOrder = (staff?.reduce((max, item) => Math.max(max, item.sortOrder), 0) ?? 0) + 1;

  return (
    <>
      <PageHeader
        title="Nhân sự chuyên môn"
        description='Đội ngũ y bác sĩ & nhân viên hiển thị ở mục "Nhân sự chuyên môn" trên trang Giới thiệu.'
        actions={
          <AdminButton icon="add" onClick={() => setEditing('new')}>
            Thêm nhân sự
          </AdminButton>
        }
      />
      <Notice notice={notice} onClose={closeNotice} />
      <Card>
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : !staff ? (
          <LoadingState />
        ) : staff.length === 0 ? (
          <EmptyState
            icon="groups"
            message="Chưa có nhân sự."
            action={
              <AdminButton icon="add" onClick={() => setEditing('new')}>
                Thêm nhân sự
              </AdminButton>
            }
          />
        ) : (
          <AdminTable headers={['Nhân sự', 'Trạng thái', 'Thứ tự', 'Thao tác']}>
            {staff.map((member, index) => {
              const name = displayName(member);
              return (
                <tr key={member.id} className="align-top hover:bg-gray-50/60">
                  <td className="px-4 py-3 min-w-[260px]">
                    <div className="flex items-start gap-3">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover bg-[#eef6f0]" />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef6f0] font-bold text-[#1c7a42]">
                          {name.slice(0, 1)}
                        </span>
                      )}
                      <div>
                        <span className="font-semibold text-[#121c2a]">{name}</span>
                        <span className="mt-0.5 block text-xs font-medium text-[#1c7a42]">{member.position}</span>
                        {member.department && <span className="block text-xs text-gray-500">{member.department}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(member)}
                      disabled={busyId !== null}
                      title={member.isActive ? 'Bấm để ẩn khỏi website' : 'Bấm để hiển thị trên website'}
                      className="disabled:opacity-50"
                    >
                      <StatusBadge tone={member.isActive ? 'green' : 'gray'}>{member.isActive ? 'Hiển thị' : 'Đã ẩn'}</StatusBadge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-6 text-center font-mono text-xs text-[#414755]">{member.sortOrder}</span>
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || busyId !== null}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#414755] hover:bg-gray-100 disabled:opacity-30"
                        aria-label={`Đưa ${name} lên`}
                      >
                        <span className="material-symbols-outlined text-lg">arrow_upward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === staff.length - 1 || busyId !== null}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#414755] hover:bg-gray-100 disabled:opacity-30"
                        aria-label={`Đưa ${name} xuống`}
                      >
                        <span className="material-symbols-outlined text-lg">arrow_downward</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <AdminButton size="sm" variant="secondary" icon="edit" onClick={() => setEditing(member)}>
                        Sửa
                      </AdminButton>
                      <AdminButton size="sm" variant="ghost" icon="delete" className="text-[#bb0112]" onClick={() => setDeleting(member)}>
                        Xóa
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminTable>
        )}
      </Card>

      {editing && (
        <StaffFormModal
          member={editing === 'new' ? null : editing}
          nextSortOrder={nextSortOrder}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message="Bạn có chắc chắn muốn xóa nhân sự này không? Thao tác không thể hoàn tác."
          detail={displayName(deleting)}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
};
