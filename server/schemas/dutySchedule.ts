import { z } from 'zod';
import { DUTY_STATUSES } from '../types/content.js';
import { AT_LEAST_ONE_FIELD_MESSAGE, hasAtLeastOneField, optionalText } from './common.js';

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có dạng YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Ngày không hợp lệ');

const staffId = z.uuid('Nhân sự không hợp lệ');

const dutyFields = z.object({
  dutyDate: isoDateSchema,
  doctorStaffId: staffId,
  responsibleStaffId: staffId.nullable().optional(),
  nurseStaffId: staffId.nullable().optional(),
  note: optionalText(200),
  status: z.enum(DUTY_STATUSES).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
});

// strict: từ chối trường lạ (chống mass assignment)
export const dutyCreateSchema = dutyFields.strict();
export const dutyUpdateSchema = dutyFields.partial().strict().refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD_MESSAGE);

export const dutyAdminListQuerySchema = z.object({
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
});

export type DutyCreateInput = z.infer<typeof dutyCreateSchema>;
export type DutyUpdateInput = z.infer<typeof dutyUpdateSchema>;
export type DutyAdminListQuery = z.infer<typeof dutyAdminListQuerySchema>;
