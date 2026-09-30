import { z } from 'zod';
import { AT_LEAST_ONE_FIELD_MESSAGE, hasAtLeastOneField, optionalText, optionalUrl, requiredText } from './common.js';

const locationFields = z.object({
  name: requiredText(200),
  address: requiredText(500),
  phone: optionalText(50),
  // Chỉ nhập khi tọa độ đã được xác minh; để trống thì bản đồ tìm theo địa chỉ
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  mapUrl: optionalUrl,
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
});

export const locationCreateSchema = locationFields.refine(
  (value) => (value.latitude == null) === (value.longitude == null),
  { message: 'Cần nhập đồng thời latitude và longitude (hoặc để trống cả hai)', path: ['latitude'] },
);

export const locationUpdateSchema = locationFields.partial().refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD_MESSAGE);

export type LocationCreateInput = z.infer<typeof locationCreateSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
