import { query } from '../db/pool.js';
import { buildUpdateSet } from '../db/sql.js';
import type { SiteSettingsUpdateInput } from '../schemas/siteSettings.js';
import type { SiteSettingsDto } from '../types/content.js';
import { notFound } from '../utils/errors.js';

interface SiteSettingsRow {
  site_name: string;
  organization_name: string;
  managing_unit: string;
  phone: string;
  email: string | null;
  description: string | null;
  logo_url: string | null;
  updated_at: Date;
}

const NOT_INITIALIZED = 'Chưa có cấu hình website — hãy chạy seed (npm run db:seed)';

function toDto(row: SiteSettingsRow): SiteSettingsDto {
  return {
    siteName: row.site_name,
    organizationName: row.organization_name,
    managingUnit: row.managing_unit,
    phone: row.phone,
    email: row.email,
    description: row.description,
    logoUrl: row.logo_url,
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
  });
  const { rows } = await query<SiteSettingsRow>(
    `UPDATE site_settings SET ${assignments.join(', ')} WHERE id = 1 RETURNING *`,
    values,
  );
  if (!rows[0]) throw notFound(NOT_INITIALIZED);
  return toDto(rows[0]);
}
