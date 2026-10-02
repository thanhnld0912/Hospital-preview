// Đặt lịch khám — hằng số nghiệp vụ dùng chung cho schema, service và API options.

export const APPOINTMENT_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Chuyển trạng thái hợp lệ (trạng thái cuối: COMPLETED, CANCELLED, NO_SHOW) */
export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  PENDING: ['CONFIRMED', 'ARRIVED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['ARRIVED', 'CANCELLED', 'NO_SHOW'],
  ARRIVED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

/** Chỉ cho phép xóa mềm lịch hẹn đã hủy / không đến */
export const DELETABLE_APPOINTMENT_STATUSES: readonly AppointmentStatus[] = ['CANCELLED', 'NO_SHOW'];

/** Khung giờ tiếp nhận (giờ hành chính Thứ Hai – Thứ Sáu, giờ Việt Nam) */
export const APPOINTMENT_SLOTS = [
  { time: '07:30', label: '07:30 - 08:30 (Sáng)' },
  { time: '08:30', label: '08:30 - 09:30 (Sáng)' },
  { time: '09:30', label: '09:30 - 10:30 (Sáng)' },
  { time: '13:30', label: '13:30 - 14:30 (Chiều)' },
  { time: '14:30', label: '14:30 - 16:00 (Chiều)' },
] as const;
export const APPOINTMENT_SLOT_TIMES = APPOINTMENT_SLOTS.map((slot) => slot.time);

/** Thứ trong tuần nhận đặt lịch (0 = Chủ Nhật ... 6 = Thứ Bảy) */
export const APPOINTMENT_WORKING_DAYS = [1, 2, 3, 4, 5] as const;
/** Đặt trước tối đa bao nhiêu ngày */
export const APPOINTMENT_MAX_DAYS_AHEAD = 60;

export function slotLabel(time: string): string {
  return APPOINTMENT_SLOTS.find((slot) => slot.time === time)?.label ?? time;
}

export interface AppointmentRef {
  id: string;
  name: string;
}

/** Danh sách quản trị — dữ liệu nhạy cảm đã che */
export interface AdminAppointmentListItemDto {
  id: string;
  bookingCode: string;
  fullName: string;
  phoneMasked: string;
  citizenIdMasked: string | null;
  location: AppointmentRef;
  service: AppointmentRef;
  appointmentDate: string;
  appointmentTime: string;
  slotLabel: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface AppointmentHistoryEntry {
  action: string;
  actorName: string | null;
  fromStatus: string | null;
  toStatus: string | null;
  fields: string[];
  createdAt: string;
}

export interface AdminAppointmentDetailDto extends AdminAppointmentListItemDto {
  note: string | null;
  internalNote: string | null;
  allowedTransitions: AppointmentStatus[];
  canDelete: boolean;
  updatedAt: string;
  history: AppointmentHistoryEntry[];
}

export interface AppointmentSensitiveDto {
  phone: string;
  citizenId: string | null;
}

/** Phản hồi công khai sau khi đặt / tra cứu: không chứa SĐT, CCCD */
export interface PublicAppointmentDto {
  bookingCode: string;
  status: AppointmentStatus;
  appointmentDate: string;
  appointmentTime: string;
  slotLabel: string;
  location: { name: string; address: string };
  service: { title: string };
}
