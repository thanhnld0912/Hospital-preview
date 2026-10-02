import { z } from 'zod';
import { APPOINTMENT_SLOT_TIMES, APPOINTMENT_STATUSES } from '../types/appointment.js';
import { AT_LEAST_ONE_FIELD_MESSAGE, hasAtLeastOneField, optionalText } from './common.js';
import { isoDateSchema } from './dutySchedule.js';

// ---------------------------------------------------------------------------
// Chuẩn hóa dữ liệu người dân nhập (không tin dữ liệu từ frontend)
// ---------------------------------------------------------------------------

/** "0905 123.456", "+84 905123456" -> "0905123456" */
export const phoneSchema = z
  .string()
  .max(30)
  .transform((value) => {
    const digits = value.replace(/[\s.\-()]/g, '');
    if (digits.startsWith('+84')) return `0${digits.slice(3)}`;
    if (/^84\d{9,10}$/.test(digits)) return `0${digits.slice(2)}`;
    return digits;
  })
  .pipe(z.string().regex(/^0\d{9,10}$/, 'Số điện thoại không hợp lệ (10–11 chữ số, bắt đầu bằng 0)'));

/** CCCD: 12 chữ số; không bắt buộc (chuỗi rỗng => null) */
const citizenIdSchema = z
  .string()
  .max(30)
  .transform((value) => value.replace(/\s/g, ''))
  .pipe(z.union([z.literal(''), z.string().regex(/^\d{12}$/, 'Số CCCD phải gồm 12 chữ số')]))
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .optional();

const fullNameSchema = z
  .string()
  .transform((value) => value.trim().replace(/\s+/g, ' '))
  .pipe(
    z
      .string()
      .min(2, 'Họ tên quá ngắn')
      .max(100, 'Họ tên quá dài')
      // Không chứa ký tự điều khiển / thẻ HTML
      .refine((value) => !/[<>{}\p{Cc}]/u.test(value), 'Họ tên chứa ký tự không hợp lệ'),
  );

export const bookingCodeSchema = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .pipe(z.string().regex(/^AH-\d{4}-[A-Z0-9]{6}$/, 'Mã đặt lịch không hợp lệ'));

// strict: từ chối mọi trường ngoài danh sách (chống mass assignment: status, booking_code, internal_note...)
export const appointmentCreateSchema = z
  .object({
    fullName: fullNameSchema,
    phone: phoneSchema,
    citizenId: citizenIdSchema,
    locationId: z.uuid('Cơ sở không hợp lệ'),
    serviceId: z.uuid('Dịch vụ không hợp lệ'),
    appointmentDate: isoDateSchema,
    appointmentTime: z.enum(APPOINTMENT_SLOT_TIMES as [string, ...string[]], { message: 'Khung giờ không hợp lệ' }),
    note: optionalText(500),
    consent: z.literal(true, { message: 'Vui lòng đồng ý để Trạm sử dụng thông tin liên hệ cho lịch hẹn' }),
    // Bẫy spam (ô ẩn trên form) — người thật không điền
    website: z.string().max(0, 'Dữ liệu không hợp lệ').optional(),
  })
  .strict();

export const availabilityQuerySchema = z.object({
  locationId: z.uuid('Cơ sở không hợp lệ'),
  date: isoDateSchema,
});

/** Tra cứu: mã đặt lịch + yếu tố xác minh. MVP: số điện thoại; sau này thêm method 'OTP' khi tích hợp SMS. */
export const appointmentLookupSchema = z
  .object({
    bookingCode: bookingCodeSchema,
    verification: z.discriminatedUnion('method', [z.object({ method: z.literal('PHONE'), phone: phoneSchema }).strict()]),
  })
  .strict();

export const adminAppointmentListQuerySchema = z.object({
  date: isoDateSchema.optional(),
  locationId: z.uuid().optional(),
  serviceId: z.uuid().optional(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

/** Quản trị chỉ được đổi trạng thái và ghi chú nội bộ (không sửa mã, thông tin cá nhân) */
export const adminAppointmentUpdateSchema = z
  .object({
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    internalNote: optionalText(2000),
  })
  .strict()
  .refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD_MESSAGE);

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type AppointmentLookupInput = z.infer<typeof appointmentLookupSchema>;
export type AdminAppointmentListQuery = z.infer<typeof adminAppointmentListQuerySchema>;
export type AdminAppointmentUpdateInput = z.infer<typeof adminAppointmentUpdateSchema>;
