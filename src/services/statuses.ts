import { DutyStatus } from './api';

// Một nguồn duy nhất cho nhãn tiếng Việt và màu của các trạng thái (website công khai + quản trị)

export const DUTY_STATUS_OPTIONS: { value: DutyStatus; label: string }[] = [
  { value: 'PLANNED', label: 'Theo kế hoạch' },
  { value: 'ACTIVE', label: 'Đang trực ca' },
  { value: 'COMPLETED', label: 'Đã kết thúc' },
  { value: 'SHIFT_CHANGED', label: 'Đã thay ca' },
  { value: 'SUSPENDED', label: 'Tạm ngưng' },
];

export const DUTY_STATUS_LABELS = Object.fromEntries(DUTY_STATUS_OPTIONS.map((o) => [o.value, o.label])) as Record<
  DutyStatus,
  string
>;

/** Màu badge theo tông của từng trạng thái (dùng cho StatusBadge quản trị) */
export const DUTY_STATUS_TONES: Record<DutyStatus, 'green' | 'gray' | 'amber' | 'red'> = {
  PLANNED: 'gray',
  ACTIVE: 'green',
  COMPLETED: 'gray',
  SHIFT_CHANGED: 'amber',
  SUSPENDED: 'red',
};

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

/** "2026-10-05" -> "Thứ Hai" (thứ tính từ chính ngày, không lưu riêng) */
export function weekdayOf(isoDate: string): string {
  return WEEKDAYS[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];
}

/** "2026-10-05" -> "05/10/2026" */
export function formatIsoDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/** Tên hiển thị: chức danh viết tắt + họ tên */
export function personName(person: { title: string | null; fullName: string } | null): string {
  return person ? [person.title, person.fullName].filter(Boolean).join(' ') : '';
}
