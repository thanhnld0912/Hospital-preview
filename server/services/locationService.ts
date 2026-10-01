import { query } from '../db/pool.js';
import { buildUpdateSet } from '../db/sql.js';
import type { LocationCreateInput, LocationUpdateInput } from '../schemas/location.js';
import type { LocationDto } from '../types/content.js';
import { notFound } from '../utils/errors.js';
import { buildGoogleMapsSearchUrl } from '../utils/maps.js';

interface LocationRow {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

const NOT_FOUND_MESSAGE = 'Không tìm thấy địa điểm';

function toDto(row: LocationRow): LocationDto {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    latitude: row.latitude,
    longitude: row.longitude,
    // Ưu tiên: tọa độ đã xác minh → map_url do admin nhập → tìm theo địa chỉ của chính địa điểm này
    mapUrl:
      row.latitude !== null && row.longitude !== null
        ? buildGoogleMapsSearchUrl(row)
        : (row.map_url ?? buildGoogleMapsSearchUrl(row)),
    // Giá trị gốc của cột map_url (null nếu admin chưa nhập) — dùng cho form quản trị
    customMapUrl: row.map_url,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listActiveLocations(): Promise<LocationDto[]> {
  const { rows } = await query<LocationRow>(
    'SELECT * FROM locations WHERE is_active = true ORDER BY sort_order, created_at',
  );
  return rows.map(toDto);
}

/** Quản trị: gồm cả địa điểm đang tắt */
export async function listAllLocations(): Promise<LocationDto[]> {
  const { rows } = await query<LocationRow>('SELECT * FROM locations ORDER BY sort_order, created_at');
  return rows.map(toDto);
}

export async function getActiveLocation(id: string): Promise<LocationDto> {
  const { rows } = await query<LocationRow>('SELECT * FROM locations WHERE id = $1 AND is_active = true', [id]);
  if (!rows[0]) throw notFound(NOT_FOUND_MESSAGE);
  return toDto(rows[0]);
}

export async function createLocation(input: LocationCreateInput): Promise<LocationDto> {
  const { rows } = await query<LocationRow>(
    `INSERT INTO locations (name, address, phone, latitude, longitude, map_url, is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true), COALESCE($8, 0))
     RETURNING *`,
    [
      input.name,
      input.address,
      input.phone ?? null,
      input.latitude ?? null,
      input.longitude ?? null,
      input.mapUrl ?? null,
      input.isActive ?? null,
      input.sortOrder ?? null,
    ],
  );
  return toDto(rows[0]);
}

export async function updateLocation(id: string, input: LocationUpdateInput): Promise<LocationDto> {
  const { assignments, values } = buildUpdateSet({
    name: input.name,
    address: input.address,
    phone: input.phone,
    latitude: input.latitude,
    longitude: input.longitude,
    map_url: input.mapUrl,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  });
  values.push(id);
  const { rows } = await query<LocationRow>(
    `UPDATE locations SET ${assignments.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values,
  );
  if (!rows[0]) throw notFound(NOT_FOUND_MESSAGE);
  return toDto(rows[0]);
}

export async function deleteLocation(id: string): Promise<void> {
  const { rowCount } = await query('DELETE FROM locations WHERE id = $1', [id]);
  if (!rowCount) throw notFound(NOT_FOUND_MESSAGE);
}
