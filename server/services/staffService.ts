import pg from 'pg';
import { query } from '../db/pool.js';
import { buildUpdateSet } from '../db/sql.js';
import type { StaffCreateInput, StaffUpdateInput } from '../schemas/staff.js';
import type { PublicStaffDto, StaffDto } from '../types/content.js';
import { AppError, notFound } from '../utils/errors.js';

interface StaffRow {
  id: string;
  full_name: string;
  title: string | null;
  position: string;
  department: string | null;
  bio: string | null;
  qualification: string | null;
  avatar_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

const NOT_FOUND_MESSAGE = 'Không tìm thấy nhân sự';

function toDto(row: StaffRow): StaffDto {
  return {
    id: row.id,
    fullName: row.full_name,
    title: row.title,
    position: row.position,
    department: row.department,
    bio: row.bio,
    qualification: row.qualification,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function toPublicDto(row: StaffRow): PublicStaffDto {
  return {
    id: row.id,
    fullName: row.full_name,
    title: row.title,
    position: row.position,
    department: row.department,
    bio: row.bio,
    qualification: row.qualification,
    avatarUrl: row.avatar_url,
  };
}

/** Website công khai: chỉ nhân sự đang hiển thị, theo thứ tự sắp xếp */
export async function listActiveStaff(): Promise<PublicStaffDto[]> {
  const { rows } = await query<StaffRow>(
    'SELECT * FROM professional_staff WHERE is_active = true ORDER BY sort_order, created_at',
  );
  return rows.map(toPublicDto);
}

/** Quản trị: gồm cả nhân sự đang ẩn */
export async function listAllStaff(): Promise<StaffDto[]> {
  const { rows } = await query<StaffRow>('SELECT * FROM professional_staff ORDER BY sort_order, created_at');
  return rows.map(toDto);
}

export async function createStaff(input: StaffCreateInput): Promise<StaffDto> {
  const { rows } = await query<StaffRow>(
    `INSERT INTO professional_staff (full_name, title, position, department, bio, qualification, avatar_url,
                                     is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, true), COALESCE($9, 0))
     RETURNING *`,
    [
      input.fullName,
      input.title ?? null,
      input.position,
      input.department ?? null,
      input.bio ?? null,
      input.qualification ?? null,
      input.avatarUrl ?? null,
      input.isActive ?? null,
      input.sortOrder ?? null,
    ],
  );
  return toDto(rows[0]);
}

export async function updateStaff(id: string, input: StaffUpdateInput): Promise<StaffDto> {
  const { assignments, values } = buildUpdateSet({
    full_name: input.fullName,
    title: input.title,
    position: input.position,
    department: input.department,
    bio: input.bio,
    qualification: input.qualification,
    avatar_url: input.avatarUrl,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  });
  values.push(id);
  const { rows } = await query<StaffRow>(
    `UPDATE professional_staff SET ${assignments.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values,
  );
  if (!rows[0]) throw notFound(NOT_FOUND_MESSAGE);
  return toDto(rows[0]);
}

export async function deleteStaff(id: string): Promise<void> {
  try {
    const { rowCount } = await query('DELETE FROM professional_staff WHERE id = $1', [id]);
    if (!rowCount) throw notFound(NOT_FOUND_MESSAGE);
  } catch (error) {
    // Lịch trực tham chiếu nhân sự (ON DELETE RESTRICT) — giữ lịch sử, đề nghị ẩn thay vì xóa
    if (error instanceof pg.DatabaseError && error.code === '23503') {
      throw new AppError(409, 'CONFLICT', 'Nhân sự đang có trong lịch trực. Hãy ẩn nhân sự thay vì xóa để giữ lịch sử.');
    }
    throw error;
  }
}
