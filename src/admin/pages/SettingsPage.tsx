import React, { useCallback, useEffect, useState } from 'react';
import { SiteSettingsDto } from '../../services/api';
import { useAuth } from '../auth';
import {
  AdminButton,
  AdminInput,
  AdminTextarea,
  Card,
  ErrorState,
  LoadingState,
  Notice,
  NoticeMessage,
  PageHeader,
} from '../components/ui';
import { describeError, emptyToNull, fieldErrors, formatDateTime } from '../utils';

interface SettingsForm {
  siteName: string;
  organizationName: string;
  managingUnit: string;
  phone: string;
  email: string;
  description: string;
  logoUrl: string;
  staffSectionLabel: string;
  staffSectionTitle: string;
  staffSectionDescription: string;
  appointmentSlotCapacity: string;
}

function toForm(settings: SiteSettingsDto): SettingsForm {
  return {
    siteName: settings.siteName,
    organizationName: settings.organizationName,
    managingUnit: settings.managingUnit,
    phone: settings.phone,
    email: settings.email ?? '',
    description: settings.description ?? '',
    logoUrl: settings.logoUrl ?? '',
    staffSectionLabel: settings.staffSectionLabel,
    staffSectionTitle: settings.staffSectionTitle,
    staffSectionDescription: settings.staffSectionDescription ?? '',
    appointmentSlotCapacity: String(settings.appointmentSlotCapacity),
  };
}

export const SettingsPage: React.FC = () => {
  const { request } = useAuth();
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  const load = useCallback(async () => {
    setLoadError(null);
    setForm(null);
    try {
      const { data } = await request<SiteSettingsDto>('/site-settings');
      setForm(toForm(data));
      setUpdatedAt(data.updatedAt);
    } catch (error) {
      setLoadError(describeError(error));
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (field: keyof SettingsForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => (current ? { ...current, [field]: event.target.value } : current));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    const appointmentSlotCapacity = Number(form.appointmentSlotCapacity);
    if (!Number.isInteger(appointmentSlotCapacity) || appointmentSlotCapacity < 1 || appointmentSlotCapacity > 500) {
      setErrors({ appointmentSlotCapacity: 'Phải là số nguyên từ 1 đến 500' });
      return;
    }
    setSaving(true);
    setErrors({});
    setNotice(null);
    try {
      const { data } = await request<SiteSettingsDto>('/admin/site-settings', {
        method: 'PUT',
        body: {
          siteName: form.siteName.trim(),
          organizationName: form.organizationName.trim(),
          managingUnit: form.managingUnit.trim(),
          phone: form.phone.trim(),
          email: emptyToNull(form.email),
          description: emptyToNull(form.description),
          logoUrl: emptyToNull(form.logoUrl),
          staffSectionLabel: form.staffSectionLabel.trim(),
          staffSectionTitle: form.staffSectionTitle.trim(),
          staffSectionDescription: emptyToNull(form.staffSectionDescription),
          appointmentSlotCapacity,
        },
      });
      setForm(toForm(data));
      setUpdatedAt(data.updatedAt);
      setNotice({ type: 'success', text: 'Đã cập nhật thông tin website.' });
    } catch (error) {
      setErrors(fieldErrors(error));
      setNotice({ type: 'error', text: describeError(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Thông tin website"
        description="Thông tin chung hiển thị trên đầu trang, chân trang và trang Liên hệ của website."
      />
      <Notice notice={notice} onClose={closeNotice} />
      <Card className="p-5 sm:p-6">
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : !form ? (
          <LoadingState />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput
                label="Tên website"
                required
                value={form.siteName}
                onChange={update('siteName')}
                error={errors.siteName}
                hint="Hiển thị ở đầu trang website (ví dụ: TRẠM Y TẾ PHƯỜNG AN HẢI)."
              />
              <AdminInput
                label="Tên đơn vị"
                required
                value={form.organizationName}
                onChange={update('organizationName')}
                error={errors.organizationName}
                hint="Ví dụ: Trạm Y tế. Hiện chưa hiển thị trực tiếp trên website."
              />
              <AdminInput
                label="Đơn vị quản lý"
                required
                value={form.managingUnit}
                onChange={update('managingUnit')}
                error={errors.managingUnit}
                hint='Website hiển thị dạng "Trực thuộc {Đơn vị quản lý}".'
              />
              <AdminInput
                label="Số điện thoại"
                required
                value={form.phone}
                onChange={update('phone')}
                error={errors.phone}
                hint="Đường dây nóng hiển thị trên toàn website và nút gọi điện."
              />
              <AdminInput
                label="Email"
                type="email"
                value={form.email}
                onChange={update('email')}
                error={errors.email}
              />
              <AdminInput
                label="Logo URL"
                value={form.logoUrl}
                onChange={update('logoUrl')}
                error={errors.logoUrl}
                hint='Đường dẫn ảnh, ví dụ "/logo.jpg" hoặc https://...'
              />
            </div>
            <AdminTextarea
              label="Mô tả"
              rows={3}
              value={form.description}
              onChange={update('description')}
              error={errors.description}
              hint="Mô tả ngắn về website. Hiện chưa hiển thị trực tiếp trên website."
            />
            {form.logoUrl && (
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-[#f7faf8] p-3">
                <img src={form.logoUrl} alt="Xem trước logo" className="h-12 w-12 object-contain" />
                <span className="text-xs text-gray-500">Xem trước logo</span>
              </div>
            )}
            <fieldset className="space-y-4 border-t border-gray-100 pt-5">
              <legend className="sr-only">Nội dung giới thiệu</legend>
              <div>
                <h2 className="text-sm font-bold text-[#121c2a]">Nội dung giới thiệu</h2>
                <p className="text-xs text-gray-500">
                  Tiêu đề section "Nhân sự chuyên môn" trên trang Giới thiệu. Danh sách nhân sự quản lý ở mục Nhân sự.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminInput
                  label="Tiêu đề nhỏ"
                  required
                  value={form.staffSectionLabel}
                  onChange={update('staffSectionLabel')}
                  error={errors.staffSectionLabel}
                  hint="Hiển thị chữ in hoa phía trên tiêu đề chính."
                />
                <AdminInput
                  label="Tiêu đề chính"
                  required
                  value={form.staffSectionTitle}
                  onChange={update('staffSectionTitle')}
                  error={errors.staffSectionTitle}
                />
              </div>
              <AdminTextarea
                label="Mô tả"
                rows={2}
                value={form.staffSectionDescription}
                onChange={update('staffSectionDescription')}
                error={errors.staffSectionDescription}
                hint="Để trống nếu không muốn hiển thị dòng mô tả."
              />
            </fieldset>
            <fieldset className="space-y-4 border-t border-gray-100 pt-5">
              <legend className="sr-only">Đặt lịch khám</legend>
              <div>
                <h2 className="text-sm font-bold text-[#121c2a]">Đặt lịch khám</h2>
                <p className="text-xs text-gray-500">Giới hạn số lượt người dân đặt lịch qua website.</p>
              </div>
              <AdminInput
                label="Số lượt tối đa mỗi khung giờ (mỗi cơ sở)"
                type="number"
                min={1}
                max={500}
                step={1}
                required
                className="md:max-w-xs"
                value={form.appointmentSlotCapacity}
                onChange={update('appointmentSlotCapacity')}
                error={errors.appointmentSlotCapacity}
                hint="Khi đủ lượt, khung giờ đó không nhận thêm lịch hẹn."
              />
            </fieldset>
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-gray-500">Cập nhật lần cuối: {formatDateTime(updatedAt)}</span>
              <AdminButton type="submit" icon="save" loading={saving}>
                Lưu thay đổi
              </AdminButton>
            </div>
          </form>
        )}
      </Card>
    </>
  );
};
