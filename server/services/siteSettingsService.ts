import { query } from '../db/pool.js';
import { buildUpdateSet } from '../db/sql.js';
import type { SiteSettingsUpdateInput } from '../schemas/siteSettings.js';
import type { FacilityItem, QualityItem, SiteSettingsDto } from '../types/content.js';
import { notFound } from '../utils/errors.js';

interface SiteSettingsRow {
  site_name: string;
  organization_name: string;
  managing_unit: string;
  phone: string;
  email: string | null;
  description: string | null;
  logo_url: string | null;
  staff_section_label: string;
  staff_section_title: string;
  staff_section_description: string | null;
  facility_section_label: string;
  facility_section_title: string;
  facility_section_description: string | null;
  facility_items: FacilityItem[];
  quality_section_label: string;
  quality_section_title: string;
  quality_section_description: string | null;
  quality_items: QualityItem[];
  duty_schedule_enabled: boolean;
  appointment_slot_capacity: number;
  updated_at: Date;
}

const NOT_INITIALIZED = 'Chưa có cấu hình website — hãy chạy seed (npm run db:seed)';

/** Cột jsonb: truyền chuỗi JSON (pg mặc định chuyển mảng JS thành mảng Postgres, không phải JSON) */
function toJson(value: unknown[] | undefined): string | undefined {
  return value === undefined ? undefined : JSON.stringify(value);
}

function toDto(row: SiteSettingsRow): SiteSettingsDto {
  return {
    siteName: row.site_name,
    organizationName: row.organization_name,
    managingUnit: row.managing_unit,
    phone: row.phone,
    email: row.email,
    description: row.description,
    logoUrl: row.logo_url,
    staffSectionLabel: row.staff_section_label,
    staffSectionTitle: row.staff_section_title,
    staffSectionDescription: row.staff_section_description,
    facilitySectionLabel: row.facility_section_label,
    facilitySectionTitle: row.facility_section_title,
    facilitySectionDescription: row.facility_section_description,
    facilityItems: row.facility_items,
    qualitySectionLabel: row.quality_section_label,
    qualitySectionTitle: row.quality_section_title,
    qualitySectionDescription: row.quality_section_description,
    qualityItems: row.quality_items,
    dutyScheduleEnabled: row.duty_schedule_enabled,
    appointmentSlotCapacity: row.appointment_slot_capacity,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getSiteSettings(): Promise<SiteSettingsDto> {
  const { rows } = await query<SiteSettingsRow>('SELECT * FROM site_settings WHERE id = 1');
  if (!rows[0]) throw notFound(NOT_INITIALIZED);
  return toDto(rows[0]);
}

export async function updateSiteSettings(input: SiteSettingsUpdateInput): Promise<SiteSettingsDto> {
  const { assignments, values } = buildUpdateSet({
    site_name: input.siteName,
    organization_name: input.organizationName,
    managing_unit: input.managingUnit,
    phone: input.phone,
    email: input.email,
    description: input.description,
    logo_url: input.logoUrl,
    staff_section_label: input.staffSectionLabel,
    staff_section_title: input.staffSectionTitle,
    staff_section_description: input.staffSectionDescription,
    facility_section_label: input.facilitySectionLabel,
    facility_section_title: input.facilitySectionTitle,
    facility_section_description: input.facilitySectionDescription,
    facility_items: toJson(input.facilityItems),
    quality_section_label: input.qualitySectionLabel,
    quality_section_title: input.qualitySectionTitle,
    quality_section_description: input.qualitySectionDescription,
    quality_items: toJson(input.qualityItems),
    duty_schedule_enabled: input.dutyScheduleEnabled,
    appointment_slot_capacity: input.appointmentSlotCapacity,
  });
  const { rows } = await query<SiteSettingsRow>(
    `UPDATE site_settings SET ${assignments.join(', ')} WHERE id = 1 RETURNING *`,
    values,
  );
  if (!rows[0]) throw notFound(NOT_INITIALIZED);
  return toDto(rows[0]);
}
