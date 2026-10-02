import React, { useCallback, useEffect, useState } from 'react';
import { FacilityItemDto, QualityItemDto, SiteSettingsDto } from '../../services/api';
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
  facilitySectionLabel: string;
  facilitySectionTitle: string;
  facilitySectionDescription: string;
  /** Mỗi dòng một thiết bị: "Tên | Mô tả" */
  facilityItems: string;
  qualitySectionLabel: string;
  qualitySectionTitle: string;
  qualitySectionDescription: string;
  /** Mỗi dòng một tiêu chí: "Tiêu chí | Kết quả" */
  qualityItems: string;
  appointmentSlotCapacity: string;
}

/** Giới hạn khớp với validation ở backend */
const MAX_SECTION_ITEMS = 30;
const ITEM_SEPARATOR = ' | ';

/** Danh sách mục <-> textarea: mỗi dòng "tên | nội dung phụ" (nội dung phụ có thể bỏ trống) */
function itemsToText(lines: { title: string; rest: string }[]): string {
  return lines.map(({ title, rest }) => (rest ? `${title}${ITEM_SEPARATOR}${rest}` : title)).join('\n');
}

function parseLines(text: string): { title: string; rest: string }[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf('|');
      return separator === -1
        ? { title: line, rest: '' }
        : { title: line.slice(0, separator).trim(), rest: line.slice(separator + 1).trim() };
    });
}

/** Lỗi nhập liệu của danh sách (trả về null nếu hợp lệ) */
function validateLines(lines: { title: string; rest: string }[], titleMax: number, restMax: number, restLabel: string): string | null {
  if (lines.length > MAX_SECTION_ITEMS) return `Tối đa ${MAX_SECTION_ITEMS} dòng`;
  for (const [index, line] of lines.entries()) {
    if (!line.title) return `Dòng ${index + 1}: thiếu tên trước dấu "|"`;
    if (line.title.length > titleMax) return `Dòng ${index + 1}: tên tối đa ${titleMax} ký tự`;
    if (line.rest.length > restMax) return `Dòng ${index + 1}: ${restLabel} tối đa ${restMax} ký tự`;
  }
  return null;
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
    facilitySectionLabel: settings.facilitySectionLabel,
    facilitySectionTitle: settings.facilitySectionTitle,
    facilitySectionDescription: settings.facilitySectionDescription ?? '',
    facilityItems: itemsToText(settings.facilityItems.map((item) => ({ title: item.title, rest: item.description }))),
    qualitySectionLabel: settings.qualitySectionLabel,
    qualitySectionTitle: settings.qualitySectionTitle,
    qualitySectionDescription: settings.qualitySectionDescription ?? '',
    qualityItems: itemsToText(settings.qualityItems.map((item) => ({ title: item.title, rest: item.score }))),
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
    const facilityLines = parseLines(form.facilityItems);
    const qualityLines = parseLines(form.qualityItems);
    const facilityError = validateLines(facilityLines, 200, 500, 'mô tả');
    const qualityError = validateLines(qualityLines, 200, 20, 'kết quả');
    if (facilityError || qualityError) {
      setErrors({ ...(facilityError && { facilityItems: facilityError }), ...(qualityError && { qualityItems: qualityError }) });
      return;
    }
    const facilityItems: FacilityItemDto[] = facilityLines.map(({ title, rest }) => ({ title, description: rest }));
    const qualityItems: QualityItemDto[] = qualityLines.map(({ title, rest }) => ({ title, score: rest }));
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
          facilitySectionLabel: form.facilitySectionLabel.trim(),
          facilitySectionTitle: form.facilitySectionTitle.trim(),
          facilitySectionDescription: emptyToNull(form.facilitySectionDescription),
          facilityItems,
          qualitySectionLabel: form.qualitySectionLabel.trim(),
          qualitySectionTitle: form.qualitySectionTitle.trim(),
          qualitySectionDescription: emptyToNull(form.qualitySectionDescription),
          qualityItems,
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
              <legend className="sr-only">Giới thiệu cơ sở vật chất</legend>
              <div>
                <h2 className="text-sm font-bold text-[#121c2a]">Giới thiệu cơ sở vật chất</h2>
                <p className="text-xs text-gray-500">Section "Cơ sở vật chất" trên trang Giới thiệu.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminInput
                  label="Tiêu đề nhỏ"
                  required
                  value={form.facilitySectionLabel}
                  onChange={update('facilitySectionLabel')}
                  error={errors.facilitySectionLabel}
                  hint="Hiển thị chữ in hoa phía trên tiêu đề chính."
                />
                <AdminInput
                  label="Tiêu đề chính"
                  required
                  value={form.facilitySectionTitle}
                  onChange={update('facilitySectionTitle')}
                  error={errors.facilitySectionTitle}
                />
              </div>
              <AdminTextarea
                label="Mô tả"
                rows={3}
                value={form.facilitySectionDescription}
                onChange={update('facilitySectionDescription')}
                error={errors.facilitySectionDescription}
                hint="Đoạn giới thiệu dưới tiêu đề. Để trống nếu không muốn hiển thị."
              />
              <AdminTextarea
                label="Danh sách trang thiết bị"
                rows={6}
                value={form.facilityItems}
                onChange={update('facilityItems')}
                error={errors.facilityItems}
                hint={`Mỗi dòng một thiết bị, dạng "Tên thiết bị | Mô tả" (mô tả có thể bỏ trống). Tối đa ${MAX_SECTION_ITEMS} dòng; để trống để ẩn danh sách.`}
              />
            </fieldset>
            <fieldset className="space-y-4 border-t border-gray-100 pt-5">
              <legend className="sr-only">Đánh giá chất lượng</legend>
              <div>
                <h2 className="text-sm font-bold text-[#121c2a]">Đánh giá chất lượng</h2>
                <p className="text-xs text-gray-500">Section "Đánh giá chất lượng" trên trang Giới thiệu.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminInput
                  label="Tiêu đề nhỏ"
                  required
                  value={form.qualitySectionLabel}
                  onChange={update('qualitySectionLabel')}
                  error={errors.qualitySectionLabel}
                  hint="Hiển thị chữ in hoa phía trên tiêu đề chính."
                />
                <AdminInput
                  label="Tiêu đề chính"
                  required
                  value={form.qualitySectionTitle}
                  onChange={update('qualitySectionTitle')}
                  error={errors.qualitySectionTitle}
                />
              </div>
              <AdminTextarea
                label="Mô tả"
                rows={2}
                value={form.qualitySectionDescription}
                onChange={update('qualitySectionDescription')}
                error={errors.qualitySectionDescription}
                hint="Để trống nếu không muốn hiển thị dòng mô tả."
              />
              <AdminTextarea
                label="Danh sách tiêu chí"
                rows={8}
                value={form.qualityItems}
                onChange={update('qualityItems')}
                error={errors.qualityItems}
                hint={`Mỗi dòng một tiêu chí, dạng "Tên tiêu chí | Kết quả" (ví dụ: "Nhân lực y tế | 100%"; kết quả có thể bỏ trống). Số thứ tự tự đánh. Tối đa ${MAX_SECTION_ITEMS} dòng.`}
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
