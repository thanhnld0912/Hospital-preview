import { AppointmentStatus, DutyStatus } from './api';

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

export const APPOINTMENT_STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'ARRIVED', label: 'Đã đến' },
  { value: 'IN_PROGRESS', label: 'Đang khám' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'NO_SHOW', label: 'Không đến' },
];

export const APPOINTMENT_STATUS_LABELS = Object.fromEntries(
  APPOINTMENT_STATUS_OPTIONS.map((o) => [o.value, o.label]),
) as Record<AppointmentStatus, string>;

export const APPOINTMENT_STATUS_TONES: Record<AppointmentStatus, 'green' | 'gray' | 'amber' | 'red'> = {
  PENDING: 'amber',
  CONFIRMED: 'green',
  ARRIVED: 'green',
  IN_PROGRESS: 'green',
  COMPLETED: 'gray',
  CANCELLED: 'red',
  NO_SHOW: 'red',
};

/** Nhãn nút thao tác chuyển trạng thái trong trang quản trị */
export const APPOINTMENT_ACTION_LABELS: Record<AppointmentStatus, { label: string; icon: string }> = {
  PENDING: { label: 'Chờ xác nhận', icon: 'hourglass_empty' },
  CONFIRMED: { label: 'Xác nhận', icon: 'check_circle' },
  ARRIVED: { label: 'Đánh dấu đã đến', icon: 'how_to_reg' },
  IN_PROGRESS: { label: 'Đang khám', icon: 'stethoscope' },
  COMPLETED: { label: 'Hoàn thành', icon: 'task_alt' },
  CANCELLED: { label: 'Hủy lịch', icon: 'cancel' },
  NO_SHOW: { label: 'Không đến', icon: 'person_off' },
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
