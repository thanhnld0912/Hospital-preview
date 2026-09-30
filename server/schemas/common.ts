import { z } from 'zod';
import { COLOR_SCHEMES } from '../types/content.js';

export const idParamSchema = z.object({ id: z.uuid('ID không hợp lệ') });

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Không được để trống')
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang');

export const slugParamSchema = z.object({ slug: slugSchema });

export const colorSchemeSchema = z.enum(COLOR_SCHEMES);

export const requiredText = (max: number) => z.string().trim().min(1, 'Không được để trống').max(max);

/** Chuỗi tùy chọn; chuỗi rỗng được lưu thành null */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value));

const urlOrPathPattern = /^(https?:\/\/|\/)/;

/** URL http(s) hoặc đường dẫn nội bộ bắt đầu bằng "/" (ví dụ /logo.jpg) */
export const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => value === '' || urlOrPathPattern.test(value), 'Phải là URL http(s) hoặc đường dẫn bắt đầu bằng "/"')
  .nullable()
  .optional()
  .transform((value) => (value === '' ? null : value));

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email('Email không hợp lệ'));

export const hasAtLeastOneField = (value: Record<string, unknown>) =>
  Object.values(value).some((field) => field !== undefined);

export const AT_LEAST_ONE_FIELD_MESSAGE = 'Cần ít nhất một trường để cập nhật';
