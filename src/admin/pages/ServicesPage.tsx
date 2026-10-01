import React, { useCallback, useEffect, useState } from 'react';
import { ColorScheme, ServiceDto } from '../../services/api';
import { useAuth } from '../auth';
import {
  AdminButton,
  AdminCheckbox,
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
import { describeError, emptyToNull, fieldErrors, reorderUpdates, slugify } from '../utils';

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------
interface ServiceForm {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  colorScheme: ColorScheme;
  schedule: string;
  feeInfo: string;
  targetAudience: string;
  procedure: string;
  notes: string;
  isActive: boolean;
  sortOrder: string;
}

const ServiceFormModal: React.FC<{
  service: ServiceDto | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}> = ({ service, nextSortOrder, onClose, onSaved }) => {
  const { request } = useAuth();
  const [form, setForm] = useState<ServiceForm>(() => ({
    title: service?.title ?? '',
    slug: service?.slug ?? '',
    shortDescription: service?.shortDescription ?? '',
    description: service?.description ?? '',
    icon: service?.icon ?? 'medical_services',
    colorScheme: service?.colorScheme ?? 'primary',
    schedule: service?.schedule ?? '',
    feeInfo: service?.feeInfo ?? '',
    targetAudience: service?.targetAudience ?? '',
    procedure: service?.procedure.join('\n') ?? '',
    notes: service?.notes ?? '',
    isActive: service?.isActive ?? true,
    sortOrder: String(service?.sortOrder ?? nextSortOrder),
  }));
  const [slugEdited, setSlugEdited] = useState(service !== null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set =
    (field: keyof ServiceForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const sortOrder = Number(form.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setErrors({ sortOrder: 'Thứ tự phải là số nguyên ≥ 0' });
      return;
    }
    setSaving(true);
    setErrors({});
    setFormError(null);
    const body = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      shortDescription: emptyToNull(form.shortDescription),
      description: form.description.trim(),
      icon: emptyToNull(form.icon),
      colorScheme: form.colorScheme,
      schedule: emptyToNull(form.schedule),
      feeInfo: emptyToNull(form.feeInfo),
      targetAudience: emptyToNull(form.targetAudience),
      // Mỗi dòng là một bước thực hiện
      procedure: form.procedure.split('\n').map((step) => step.trim()).filter(Boolean),
      notes: emptyToNull(form.notes),
      isActive: form.isActive,
      sortOrder,
    };
    try {
      if (service) {
        await request<ServiceDto>(`/admin/services/${service.id}`, { method: 'PUT', body });
        onSaved('Đã cập nhật dịch vụ.');
      } else {
        await request<ServiceDto>('/admin/services', { method: 'POST', body });
        onSaved('Đã thêm dịch vụ.');
      }
    } catch (error) {
      setErrors(fieldErrors(error));
      setFormError(describeError(error));
      setSaving(false);
    }
  };

  return (
    <AdminModal
      title={service ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
      size="lg"
      onClose={onClose}
      locked={saving}
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </AdminButton>
          <AdminButton type="submit" form="service-form" icon="save" loading={saving}>
            Lưu dịch vụ
          </AdminButton>
        </>
      }
    >
      <form id="service-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-900" role="alert">
            {formError}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput
            label="Tên dịch vụ"
            required
            value={form.title}
            onChange={(event) => {
              const title = event.target.value;
              setForm((current) => ({ ...current, title, slug: slugEdited ? current.slug : slugify(title) }));
            }}
            error={errors.title}
            autoFocus
          />
          <AdminInput
            label="Slug"
            required
            value={form.slug}
            onChange={(event) => {
              setSlugEdited(true);
              setForm((current) => ({ ...current, slug: event.target.value }));
            }}
            error={errors.slug}
            hint="Chữ thường không dấu, số và dấu gạch ngang."
          />
        </div>
        <AdminTextarea
          label="Mô tả ngắn"
          rows={2}
          value={form.shortDescription}
          onChange={set('shortDescription')}
          error={errors.shortDescription}
          hint="Hiển thị trên thẻ dịch vụ ở trang chủ và danh sách dịch vụ."
        />
        <AdminTextarea
          label="Mô tả chi tiết"
          rows={4}
          value={form.description}
          onChange={set('description')}
          error={errors.description}
          hint='Hiển thị ở mục "Mô tả chuyên môn".'
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <AdminInput
              label="Icon"
              value={form.icon}
              onChange={set('icon')}
              error={errors.icon}
              hint="Tên icon Material Symbols, ví dụ: vaccines"
            />
            {form.icon.trim() && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#414755]">
                Xem trước: <span className="material-symbols-outlined text-[#1c7a42]">{form.icon.trim()}</span>
              </span>
            )}
          </div>
          <AdminSelect
            label="Màu"
            value={form.colorScheme}
            onChange={set('colorScheme')}
            options={[
              { value: 'primary', label: 'Xanh lá (mặc định)' },
              { value: 'secondary', label: 'Xanh ngọc' },
              { value: 'tertiary', label: 'Đỏ' },
            ]}
          />
          <AdminInput label="Chi phí" value={form.feeInfo} onChange={set('feeInfo')} error={errors.feeInfo} placeholder="Ví dụ: Miễn phí" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="Thời gian phục vụ" value={form.schedule} onChange={set('schedule')} error={errors.schedule} />
          <AdminInput label="Đối tượng áp dụng" value={form.targetAudience} onChange={set('targetAudience')} error={errors.targetAudience} />
        </div>
        <AdminTextarea
          label="Các bước thực hiện"
          rows={5}
          value={form.procedure}
          onChange={set('procedure')}
          error={errors.procedure}
          hint="Mỗi dòng là một bước."
        />
        <AdminTextarea label="Ghi chú" rows={2} value={form.notes} onChange={set('notes')} error={errors.notes} />
        <div className="grid grid-cols-2 gap-4 items-end">
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
      </form>
    </AdminModal>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export const ServicesPage: React.FC = () => {
  const { request } = useAuth();
  const [services, setServices] = useState<ServiceDto[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const [editing, setEditing] = useState<ServiceDto | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ServiceDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const { data } = await request<ServiceDto[]>('/admin/services');
      setServices(data);
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

  const toggleActive = async (service: ServiceDto) => {
    setBusyId(service.id);
    try {
      await request(`/admin/services/${service.id}`, { method: 'PUT', body: { isActive: !service.isActive } });
      setNotice({ type: 'success', text: service.isActive ? 'Đã ẩn dịch vụ khỏi website.' : 'Đã hiển thị dịch vụ trên website.' });
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    if (!services) return;
    const updates = reorderUpdates(services, index, direction);
    if (updates.length === 0) return;
    setBusyId(services[index].id);
    try {
      for (const update of updates) {
        await request(`/admin/services/${update.id}`, { method: 'PUT', body: { sortOrder: update.sortOrder } });
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
      await request(`/admin/services/${deleting.id}`, { method: 'DELETE' });
      setNotice({ type: 'success', text: 'Đã xóa dịch vụ.' });
      setDeleting(null);
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const nextSortOrder = (services?.reduce((max, item) => Math.max(max, item.sortOrder), 0) ?? 0) + 1;

  return (
    <>
      <PageHeader
        title="Dịch vụ"
        description="Danh mục dịch vụ hiển thị ở trang chủ và trang Dịch vụ y tế."
        actions={
          <AdminButton icon="add" onClick={() => setEditing('new')}>
            Thêm dịch vụ
          </AdminButton>
        }
      />
      <Notice notice={notice} onClose={closeNotice} />
      <Card>
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : !services ? (
          <LoadingState />
        ) : services.length === 0 ? (
          <EmptyState
            icon="medical_services"
            message="Chưa có dịch vụ."
            action={
              <AdminButton icon="add" onClick={() => setEditing('new')}>
                Thêm dịch vụ
              </AdminButton>
            }
          />
        ) : (
          <AdminTable headers={['Dịch vụ', 'Trạng thái', 'Thứ tự', 'Thao tác']}>
            {services.map((service, index) => (
              <tr key={service.id} className="align-top hover:bg-gray-50/60">
                <td className="px-4 py-3 min-w-[260px]">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef6f0] text-[#1c7a42]">
                      <span className="material-symbols-outlined text-xl">{service.icon ?? 'medical_services'}</span>
                    </span>
                    <div>
                      <span className="font-semibold text-[#121c2a]">{service.title}</span>
                      <span className="mt-0.5 block text-xs text-gray-500">/{service.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(service)}
                    disabled={busyId !== null}
                    title={service.isActive ? 'Bấm để ẩn khỏi website' : 'Bấm để hiển thị trên website'}
                    className="disabled:opacity-50"
                  >
                    <StatusBadge tone={service.isActive ? 'green' : 'gray'}>{service.isActive ? 'Hoạt động' : 'Đã tắt'}</StatusBadge>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-6 text-center font-mono text-xs text-[#414755]">{service.sortOrder}</span>
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || busyId !== null}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#414755] hover:bg-gray-100 disabled:opacity-30"
                      aria-label={`Đưa ${service.title} lên`}
                    >
                      <span className="material-symbols-outlined text-lg">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === services.length - 1 || busyId !== null}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#414755] hover:bg-gray-100 disabled:opacity-30"
                      aria-label={`Đưa ${service.title} xuống`}
                    >
                      <span className="material-symbols-outlined text-lg">arrow_downward</span>
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <AdminButton size="sm" variant="secondary" icon="edit" onClick={() => setEditing(service)}>
                      Sửa
                    </AdminButton>
                    <AdminButton size="sm" variant="ghost" icon="delete" className="text-[#bb0112]" onClick={() => setDeleting(service)}>
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
        <ServiceFormModal
          service={editing === 'new' ? null : editing}
          nextSortOrder={nextSortOrder}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {deleting && (
        <ConfirmDialog detail={deleting.title} loading={deleteLoading} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
};
