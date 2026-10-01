import { z } from 'zod';
import { AT_LEAST_ONE_FIELD_MESSAGE, hasAtLeastOneField, optionalText, optionalUrl, requiredText } from './common.js';

const staffFields = z.object({
  fullName: requiredText(200),
  title: optionalText(50),
  position: requiredText(200),
  department: optionalText(300),
  bio: optionalText(2000),
  qualification: optionalText(300),
  avatarUrl: optionalUrl,
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
});

export const staffCreateSchema = staffFields;
export const staffUpdateSchema = staffFields.partial().refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD_MESSAGE);

export type StaffCreateInput = z.infer<typeof staffCreateSchema>;
export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;
