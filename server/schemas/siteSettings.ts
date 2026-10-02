import { z } from 'zod';
import { AT_LEAST_ONE_FIELD_MESSAGE, emailSchema, hasAtLeastOneField, optionalText, optionalUrl, requiredText } from './common.js';

/** Số mục tối đa của mỗi danh sách trên trang Giới thiệu */
const MAX_SECTION_ITEMS = 30;

const facilityItemSchema = z.object({
  title: requiredText(200),
  description: z.string().trim().max(500),
});

const qualityItemSchema = z.object({
  title: requiredText(200),
  score: z.string().trim().max(20),
});

export const siteSettingsUpdateSchema = z
  .object({
    siteName: requiredText(200).optional(),
    organizationName: requiredText(200).optional(),
    managingUnit: requiredText(200).optional(),
    phone: requiredText(50).optional(),
    email: emailSchema.nullable().optional(),
    description: optionalText(1000),
    logoUrl: optionalUrl,
    staffSectionLabel: requiredText(100).optional(),
    staffSectionTitle: requiredText(200).optional(),
    staffSectionDescription: optionalText(500),
    facilitySectionLabel: requiredText(100).optional(),
    facilitySectionTitle: requiredText(200).optional(),
    facilitySectionDescription: optionalText(2000),
    facilityItems: z.array(facilityItemSchema).max(MAX_SECTION_ITEMS).optional(),
    qualitySectionLabel: requiredText(100).optional(),
    qualitySectionTitle: requiredText(200).optional(),
    qualitySectionDescription: optionalText(1000),
    qualityItems: z.array(qualityItemSchema).max(MAX_SECTION_ITEMS).optional(),
    dutyScheduleEnabled: z.boolean().optional(),
    appointmentSlotCapacity: z.number().int().min(1).max(500).optional(),
  })
  .refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD_MESSAGE);

export type SiteSettingsUpdateInput = z.infer<typeof siteSettingsUpdateSchema>;
