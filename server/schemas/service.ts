import { z } from 'zod';
import {
  AT_LEAST_ONE_FIELD_MESSAGE,
  colorSchemeSchema,
  hasAtLeastOneField,
  optionalText,
  requiredText,
  slugSchema,
} from './common.js';

const serviceFields = z.object({
  title: requiredText(300),
  slug: slugSchema,
  description: z.string().trim().max(20_000).optional(),
  shortDescription: optionalText(1000),
  icon: optionalText(100),
  colorScheme: colorSchemeSchema.optional(),
  schedule: optionalText(500),
  feeInfo: optionalText(300),
  targetAudience: optionalText(1000),
  procedure: z.array(requiredText(1000)).max(50).optional(),
  notes: optionalText(2000),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
});

export const serviceCreateSchema = serviceFields;
export const serviceUpdateSchema = serviceFields.partial().refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD_MESSAGE);

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
