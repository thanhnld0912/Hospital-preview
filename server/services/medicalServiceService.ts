import { query } from '../db/pool.js';
import { buildUpdateSet } from '../db/sql.js';
import type { ServiceCreateInput, ServiceUpdateInput } from '../schemas/service.js';
import type { ColorScheme, ServiceDto } from '../types/content.js';
import { notFound } from '../utils/errors.js';

interface ServiceRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  icon: string | null;
  color_scheme: ColorScheme;
  schedule: string | null;
  fee_info: string | null;
  target_audience: string | null;
  procedure: string[];
  notes: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

const NOT_FOUND_MESSAGE = 'Không tìm thấy dịch vụ';

function toDto(row: ServiceRow): ServiceDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    icon: row.icon,
    colorScheme: row.color_scheme,
    schedule: row.schedule,
    feeInfo: row.fee_info,
    targetAudience: row.target_audience,
    procedure: row.procedure,
    notes: row.notes,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listActiveServices(): Promise<ServiceDto[]> {
  const { rows } = await query<ServiceRow>(
    'SELECT * FROM services WHERE is_active = true ORDER BY sort_order, created_at',
  );
  return rows.map(toDto);
}

/** Quản trị: gồm cả dịch vụ đang tắt */
export async function listAllServices(): Promise<ServiceDto[]> {
  const { rows } = await query<ServiceRow>('SELECT * FROM services ORDER BY sort_order, created_at');
  return rows.map(toDto);
}

export async function getActiveService(id: string): Promise<ServiceDto> {
  const { rows } = await query<ServiceRow>('SELECT * FROM services WHERE id = $1 AND is_active = true', [id]);
  if (!rows[0]) throw notFound(NOT_FOUND_MESSAGE);
  return toDto(rows[0]);
}

export async function createService(input: ServiceCreateInput): Promise<ServiceDto> {
  const { rows } = await query<ServiceRow>(
    `INSERT INTO services (title, slug, description, short_description, icon, color_scheme, schedule,
                           fee_info, target_audience, procedure, notes, is_active, sort_order)
     VALUES ($1, $2, COALESCE($3, ''), $4, $5, COALESCE($6, 'primary'), $7,
             $8, $9, COALESCE($10::text[], '{}'), $11, COALESCE($12, true), COALESCE($13, 0))
     RETURNING *`,
    [
      input.title,
      input.slug,
      input.description ?? null,
      input.shortDescription ?? null,
      input.icon ?? null,
      input.colorScheme ?? null,
      input.schedule ?? null,
      input.feeInfo ?? null,
      input.targetAudience ?? null,
      input.procedure ?? null,
      input.notes ?? null,
      input.isActive ?? null,
      input.sortOrder ?? null,
    ],
  );
  return toDto(rows[0]);
}

export async function updateService(id: string, input: ServiceUpdateInput): Promise<ServiceDto> {
  const { assignments, values } = buildUpdateSet({
    title: input.title,
    slug: input.slug,
    description: input.description,
    short_description: input.shortDescription,
    icon: input.icon,
    color_scheme: input.colorScheme,
    schedule: input.schedule,
    fee_info: input.feeInfo,
    target_audience: input.targetAudience,
    procedure: input.procedure,
    notes: input.notes,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  });
  values.push(id);
  const { rows } = await query<ServiceRow>(
    `UPDATE services SET ${assignments.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values,
  );
  if (!rows[0]) throw notFound(NOT_FOUND_MESSAGE);
  return toDto(rows[0]);
}

export async function deleteService(id: string): Promise<void> {
  const { rowCount } = await query('DELETE FROM services WHERE id = $1', [id]);
  if (!rowCount) throw notFound(NOT_FOUND_MESSAGE);
}
