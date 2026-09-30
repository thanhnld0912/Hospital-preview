import { z } from 'zod';
import { AT_LEAST_ONE_FIELD_MESSAGE, emailSchema, hasAtLeastOneField, optionalText, optionalUrl, requiredText } from './common.js';

export const siteSettingsUpdateSchema = z
  .object({
    siteName: requiredText(200).optional(),
    organizationName: requiredText(200).optional(),
    managingUnit: requiredText(200).optional(),
    phone: requiredText(50).optional(),
    email: emailSchema.nullable().optional(),
    description: optionalText(1000),
    logoUrl: optionalUrl,
  })
  .refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD_MESSAGE);

export type SiteSettingsUpdateInput = z.infer<typeof siteSettingsUpdateSchema>;
