import { query } from '../db/pool.js';
import { buildUpdateSet } from '../db/sql.js';
import type { DutyAdminListQuery, DutyCreateInput, DutyUpdateInput } from '../schemas/dutySchedule.js';
import type { DutyScheduleDto, DutyStaffRef, DutyStatus, PublicDutyScheduleDto } from '../types/content.js';
import { AppError, notFound } from '../utils/errors.js';

interface DutyRow {
  id: string;
  duty_date: string;
  note: string | null;
  status: DutyStatus;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  doctor_id: string;
  doctor_name: string;
  doctor_title: string | null;
  doctor_active: boolean;
  responsible_id: string | null;
  responsible_name: string | null;
  responsible_title: string | null;
  responsible_active: boolean | null;
  nurse_id: string | null;
  nurse_name: string | null;
  nurse_title: string | null;
  nurse_active: boolean | null;
}

const NOT_FOUND_MESSAGE = 'Không tìm thấy lịch trực';

// Ngày trả về dạng chuỗi YYYY-MM-DD (tránh lệch múi giờ khi pg chuyển kiểu date sang Date)
const SELECT_DUTY = `
  SELECT d.id, to_char(d.duty_date, 'YYYY-MM-DD') AS duty_date, d.note, d.status, d.is_active, d.sort_order,
         d.created_at, d.updated_at,
         doc.id AS doctor_id, doc.full_name AS doctor_name, doc.title AS doctor_title, doc.is_active AS doctor_active,
         res.id AS responsible_id, res.full_name AS responsible_name, res.title AS responsible_title,
         res.is_active AS responsible_active,
         nur.id AS nurse_id, nur.full_name AS nurse_name, nur.title AS nurse_title, nur.is_active AS nurse_active
  FROM duty_schedules d
  JOIN professional_staff doc ON doc.id = d.doctor_staff_id
  LEFT JOIN professional_staff res ON res.id = d.responsible_staff_id
  LEFT JOIN professional_staff nur ON nur.id = d.nurse_staff_id`;

// "Hôm nay" theo giờ Việt Nam
const TODAY_VN = `(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date`;

function staffRef(id: string | null, name: string | null, title: string | null, active: boolean | null): DutyStaffRef | null {
  return id && name ? { id, fullName: name, title, isActive: active ?? false } : null;
}

function toDto(row: DutyRow): DutyScheduleDto {
  return {
    id: row.id,
    dutyDate: row.duty_date,
    doctor: { id: row.doctor_id, fullName: row.doctor_name, title: row.doctor_title, isActive: row.doctor_active },
    responsible: staffRef(row.responsible_id, row.responsible_name, row.responsible_title, row.responsible_active),
    nurse: staffRef(row.nurse_id, row.nurse_name, row.nurse_title, row.nurse_active),
    note: row.note,
    status: row.status,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function publicPerson(name: string | null, title: string | null) {
  return name ? { fullName: name, title } : null;
}

function toPublicDto(row: DutyRow): PublicDutyScheduleDto {
  return {
    id: row.id,
    dutyDate: row.duty_date,
    doctor: { fullName: row.doctor_name, title: row.doctor_title },
    responsible: publicPerson(row.responsible_name, row.responsible_title),
    nurse: publicPerson(row.nurse_name, row.nurse_title),
    note: row.note,
    status: row.status,
  };
}

/**
 * Website công khai: { enabled, schedules }. Khi quản trị tắt section => không trả lịch nào.
 * Hiển thị lịch đang bật trong 7 ngày tính từ hôm nay (giờ Việt Nam).
 */
export async function getPublicDutySchedules(): Promise<{ enabled: boolean; schedules: PublicDutyScheduleDto[] }> {
  const settings = await query<{ duty_schedule_enabled: boolean }>('SELECT duty_schedule_enabled FROM site_settings WHERE id = 1');
  const enabled = settings.rows[0]?.duty_schedule_enabled ?? false;
  if (!enabled) return { enabled: false, schedules: [] };
  const { rows } = await query<DutyRow>(
    `${SELECT_DUTY}
     WHERE d.is_active = true AND d.duty_date BETWEEN ${TODAY_VN} AND ${TODAY_VN} + 6
     ORDER BY d.duty_date, d.sort_order, d.created_at`,
  );
  return { enabled: true, schedules: rows.map(toPublicDto) };
}

export async function listDutySchedules(filter: DutyAdminListQuery): Promise<DutyScheduleDto[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (filter.from) {
    values.push(filter.from);
    conditions.push(`d.duty_date >= $${values.length}::date`);
  }
  if (filter.to) {
    values.push(filter.to);
    conditions.push(`d.duty_date <= $${values.length}::date`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query<DutyRow>(`${SELECT_DUTY} ${where} ORDER BY d.duty_date, d.sort_order, d.created_at`, values);
  return rows.map(toDto);
}

async function getDutySchedule(id: string): Promise<DutyScheduleDto> {
  const { rows } = await query<DutyRow>(`${SELECT_DUTY} WHERE d.id = $1`, [id]);
  if (!rows[0]) throw notFound(NOT_FOUND_MESSAGE);
  return toDto(rows[0]);
}

/**
 * Nhân sự được chọn phải tồn tại và đang hoạt động. Nhân sự đã ẩn chỉ được giữ nguyên
 * ở lịch cũ (không chọn mới) — truyền `keep` là các ID đang gán sẵn trên lịch.
 */
async function assertAssignableStaff(ids: (string | null | undefined)[], keep: Set<string> = new Set()): Promise<void> {
  const toCheck = [...new Set(ids.filter((id): id is string => !!id && !keep.has(id)))];
  if (toCheck.length === 0) return;
  const { rows } = await query<{ id: string }>(
    'SELECT id FROM professional_staff WHERE id = ANY($1::uuid[]) AND is_active = true',
    [toCheck],
  );
  if (rows.length !== toCheck.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Nhân sự được chọn không tồn tại hoặc đã bị ẩn');
  }
}

export async function createDutySchedule(input: DutyCreateInput): Promise<DutyScheduleDto> {
  await assertAssignableStaff([input.doctorStaffId, input.responsibleStaffId, input.nurseStaffId]);
  const { rows } = await query<{ id: string }>(
    `INSERT INTO duty_schedules (duty_date, doctor_staff_id, responsible_staff_id, nurse_staff_id, note, status,
                                 is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'PLANNED'), COALESCE($7, true), COALESCE($8, 0))
     RETURNING id`,
    [
      input.dutyDate,
      input.doctorStaffId,
      input.responsibleStaffId ?? null,
      input.nurseStaffId ?? null,
      input.note ?? null,
      input.status ?? null,
      input.isActive ?? null,
      input.sortOrder ?? null,
    ],
  );
  return getDutySchedule(rows[0].id);
}

export async function updateDutySchedule(id: string, input: DutyUpdateInput): Promise<DutyScheduleDto> {
  const current = await getDutySchedule(id);
  const assigned = new Set([current.doctor.id, current.responsible?.id, current.nurse?.id].filter((v): v is string => !!v));
  await assertAssignableStaff([input.doctorStaffId, input.responsibleStaffId, input.nurseStaffId], assigned);

  const { assignments, values } = buildUpdateSet({
    duty_date: input.dutyDate,
    doctor_staff_id: input.doctorStaffId,
    responsible_staff_id: input.responsibleStaffId,
    nurse_staff_id: input.nurseStaffId,
    note: input.note,
    status: input.status,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  });
  values.push(id);
  const { rowCount } = await query(`UPDATE duty_schedules SET ${assignments.join(', ')} WHERE id = $${values.length}`, values);
  if (!rowCount) throw notFound(NOT_FOUND_MESSAGE);
  return getDutySchedule(id);
}

export async function deleteDutySchedule(id: string): Promise<void> {
  const { rowCount } = await query('DELETE FROM duty_schedules WHERE id = $1', [id]);
  if (!rowCount) throw notFound(NOT_FOUND_MESSAGE);
}
