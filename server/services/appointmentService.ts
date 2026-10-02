import { randomInt } from 'node:crypto';
import pg from 'pg';
import { getPool, query } from '../db/pool.js';
import type {
  AdminAppointmentListQuery,
  AdminAppointmentUpdateInput,
  AppointmentCreateInput,
  AppointmentLookupInput,
} from '../schemas/appointment.js';
import {
  APPOINTMENT_MAX_DAYS_AHEAD,
  APPOINTMENT_SLOTS,
  APPOINTMENT_TRANSITIONS,
  APPOINTMENT_WORKING_DAYS,
  DELETABLE_APPOINTMENT_STATUSES,
  slotLabel,
  type AdminAppointmentDetailDto,
  type AdminAppointmentListItemDto,
  type AppointmentHistoryEntry,
  type AppointmentSensitiveDto,
  type AppointmentStatus,
  type PublicAppointmentDto,
} from '../types/appointment.js';
import { AppError, notFound } from '../utils/errors.js';
import {
  assertEncryptionConfigured,
  decryptField,
  encryptField,
  hashEquals,
  hashField,
  maskCitizenId,
  maskPhone,
} from '../utils/sensitiveData.js';
import { writeAuditLog } from './auditService.js';

const RESOURCE = 'appointment';
const NOT_FOUND_MESSAGE = 'Không tìm thấy lịch hẹn';

// ---------------------------------------------------------------------------
// Ngày giờ theo múi giờ Việt Nam
// ---------------------------------------------------------------------------
const vnFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function nowInVietnam(): { date: string; minutes: number } {
  const parts = Object.fromEntries(vnFormatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function weekday(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay();
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

/** Lý do một ngày/khung giờ không đặt được (null = đặt được) */
function unavailableReason(date: string, time?: string): string | null {
  const now = nowInVietnam();
  if (date < now.date) return 'Ngày khám đã qua';
  if (date > addDays(now.date, APPOINTMENT_MAX_DAYS_AHEAD)) {
    return `Chỉ nhận đặt lịch trước tối đa ${APPOINTMENT_MAX_DAYS_AHEAD} ngày`;
  }
  if (!(APPOINTMENT_WORKING_DAYS as readonly number[]).includes(weekday(date))) {
    return 'Trạm chỉ nhận đặt lịch khám từ Thứ Hai đến Thứ Sáu';
  }
  if (time && date === now.date && toMinutes(time) <= now.minutes) return 'Khung giờ đã qua';
  return null;
}

// ---------------------------------------------------------------------------
// Options & availability (public)
// ---------------------------------------------------------------------------
export async function getBookingOptions() {
  const [locations, services] = await Promise.all([
    query<{ id: string; name: string; address: string }>(
      'SELECT id, name, address FROM locations WHERE is_active = true ORDER BY sort_order, created_at',
    ),
    query<{ id: string; title: string }>('SELECT id, title FROM services WHERE is_active = true ORDER BY sort_order, created_at'),
  ]);
  const now = nowInVietnam();
  return {
    locations: locations.rows,
    services: services.rows,
    slots: APPOINTMENT_SLOTS.map(({ time, label }) => ({ time, label })),
    workingDays: [...APPOINTMENT_WORKING_DAYS],
    minDate: now.date,
    maxDate: addDays(now.date, APPOINTMENT_MAX_DAYS_AHEAD),
  };
}

async function slotCapacity(client: Pick<pg.PoolClient, 'query'> = getPool()): Promise<number> {
  const { rows } = await client.query<{ capacity: number }>(
    'SELECT appointment_slot_capacity AS capacity FROM site_settings WHERE id = 1',
  );
  return rows[0]?.capacity ?? 10;
}

export async function getAvailability(locationId: string, date: string) {
  const dayReason = unavailableReason(date);
  const location = await query('SELECT 1 FROM locations WHERE id = $1 AND is_active = true', [locationId]);
  if (!location.rowCount) throw new AppError(400, 'VALIDATION_ERROR', 'Cơ sở không hợp lệ');

  const [capacity, booked] = await Promise.all([
    slotCapacity(),
    query<{ appointment_time: string; total: number }>(
      `SELECT appointment_time, count(*)::int AS total FROM appointments
       WHERE location_id = $1 AND appointment_date = $2 AND deleted_at IS NULL AND status <> 'CANCELLED'
       GROUP BY appointment_time`,
      [locationId, date],
    ),
  ]);
  const bookedBySlot = new Map(booked.rows.map((row) => [row.appointment_time, row.total]));
  return {
    date,
    reason: dayReason,
    slots: APPOINTMENT_SLOTS.map(({ time, label }) => {
      const reason = unavailableReason(date, time) ?? ((bookedBySlot.get(time) ?? 0) >= capacity ? 'Khung giờ đã đủ lượt' : null);
      return { time, label, available: reason === null, reason };
    }),
  };
}

// ---------------------------------------------------------------------------
// Đặt lịch (public)
// ---------------------------------------------------------------------------
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bỏ I, O, 0, 1 để dễ đọc

function generateBookingCode(): string {
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `AH-${nowInVietnam().date.slice(0, 4)}-${suffix}`;
}

const DUPLICATE_MESSAGE = 'Số điện thoại hoặc CCCD này đã có lịch hẹn trong ngày đã chọn. Vui lòng chọn ngày khác hoặc liên hệ Trạm.';

export async function createAppointment(input: AppointmentCreateInput): Promise<PublicAppointmentDto> {
  assertEncryptionConfigured();
  const reason = unavailableReason(input.appointmentDate, input.appointmentTime);
  if (reason) throw new AppError(400, 'SLOT_UNAVAILABLE', reason);

  const phoneHash = hashField('phone', input.phone);
  const citizenHash = input.citizenId ? hashField('citizen_id', input.citizenId) : null;

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    // Backend tự kiểm tra cơ sở/dịch vụ (không tin dữ liệu frontend)
    const refs = await client.query<{ location_name: string; location_address: string; service_title: string }>(
      `SELECT l.name AS location_name, l.address AS location_address, s.title AS service_title
       FROM locations l, services s
       WHERE l.id = $1 AND l.is_active = true AND s.id = $2 AND s.is_active = true`,
      [input.locationId, input.serviceId],
    );
    if (!refs.rows[0]) throw new AppError(400, 'VALIDATION_ERROR', 'Cơ sở hoặc dịch vụ không hợp lệ');

    // Khóa theo khung giờ để đếm chỗ chính xác khi nhiều người đặt cùng lúc
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      `appointment-slot:${input.locationId}:${input.appointmentDate}:${input.appointmentTime}`,
    ]);
    const capacity = await slotCapacity(client);
    const booked = await client.query<{ total: number }>(
      `SELECT count(*)::int AS total FROM appointments
       WHERE location_id = $1 AND appointment_date = $2 AND appointment_time = $3
         AND deleted_at IS NULL AND status <> 'CANCELLED'`,
      [input.locationId, input.appointmentDate, input.appointmentTime],
    );
    if ((booked.rows[0]?.total ?? 0) >= capacity) {
      throw new AppError(409, 'SLOT_FULL', 'Khung giờ này đã đủ lượt đặt. Vui lòng chọn khung giờ khác.');
    }

    const duplicate = await client.query(
      `SELECT 1 FROM appointments
       WHERE appointment_date = $1 AND deleted_at IS NULL AND status <> 'CANCELLED'
         AND (phone_hash = $2 OR ($3::text IS NOT NULL AND citizen_id_hash = $3))
       LIMIT 1`,
      [input.appointmentDate, phoneHash, citizenHash],
    );
    if (duplicate.rowCount) throw new AppError(409, 'DUPLICATE_BOOKING', DUPLICATE_MESSAGE);

    const values = [
      input.fullName,
      encryptField('phone', input.phone),
      phoneHash,
      maskPhone(input.phone),
      input.citizenId ? encryptField('citizen_id', input.citizenId) : null,
      citizenHash,
      input.citizenId ? maskCitizenId(input.citizenId) : null,
      input.locationId,
      input.serviceId,
      input.appointmentDate,
      input.appointmentTime,
      input.note ?? null,
    ];

    let inserted: { id: string; booking_code: string } | undefined;
    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      await client.query('SAVEPOINT booking_code');
      try {
        const result = await client.query<{ id: string; booking_code: string }>(
          `INSERT INTO appointments (booking_code, full_name, phone_encrypted, phone_hash, phone_masked,
                                     citizen_id_encrypted, citizen_id_hash, citizen_id_masked,
                                     location_id, service_id, appointment_date, appointment_time, note)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING id, booking_code`,
          [generateBookingCode(), ...values],
        );
        inserted = result.rows[0];
      } catch (error) {
        await client.query('ROLLBACK TO SAVEPOINT booking_code');
        if (error instanceof pg.DatabaseError && error.code === '23505') {
          if (error.constraint === 'appointments_booking_code_key') continue; // trùng mã ngẫu nhiên: thử lại
          throw new AppError(409, 'DUPLICATE_BOOKING', DUPLICATE_MESSAGE);
        }
        throw error;
      }
    }
    if (!inserted) throw new AppError(500, 'INTERNAL_ERROR', 'Không tạo được mã đặt lịch, vui lòng thử lại');

    await writeAuditLog(
      { actorUserId: null, action: 'APPOINTMENT_CREATED', resourceType: RESOURCE, resourceId: inserted.id, metadata: { source: 'public' } },
      client,
    );
    await client.query('COMMIT');

    const ref = refs.rows[0];
    return {
      bookingCode: inserted.booking_code,
      status: 'PENDING',
      appointmentDate: input.appointmentDate,
      appointmentTime: input.appointmentTime,
      slotLabel: slotLabel(input.appointmentTime),
      location: { name: ref.location_name, address: ref.location_address },
      service: { title: ref.service_title },
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/** Tra cứu bằng mã + số điện thoại. Sai mã hay sai SĐT đều trả cùng một lỗi (không lộ mã nào tồn tại). */
export async function lookupAppointment(input: AppointmentLookupInput): Promise<PublicAppointmentDto> {
  assertEncryptionConfigured();
  const { rows } = await query<{
    booking_code: string;
    status: AppointmentStatus;
    appointment_date: string;
    appointment_time: string;
    phone_hash: string;
    location_name: string;
    location_address: string;
    service_title: string;
  }>(
    `SELECT a.booking_code, a.status, to_char(a.appointment_date, 'YYYY-MM-DD') AS appointment_date, a.appointment_time,
            a.phone_hash, l.name AS location_name, l.address AS location_address, s.title AS service_title
     FROM appointments a JOIN locations l ON l.id = a.location_id JOIN services s ON s.id = a.service_id
     WHERE a.booking_code = $1 AND a.deleted_at IS NULL`,
    [input.bookingCode],
  );
  const row = rows[0];
  const expectedHash = hashField('phone', input.verification.phone);
  if (!row || !hashEquals(row.phone_hash, expectedHash)) {
    throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy lịch hẹn hoặc thông tin xác minh không đúng');
  }
  return {
    bookingCode: row.booking_code,
    status: row.status,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    slotLabel: slotLabel(row.appointment_time),
    location: { name: row.location_name, address: row.location_address },
    service: { title: row.service_title },
  };
}

// ---------------------------------------------------------------------------
// Quản trị (đã qua authenticate + requireAdmin)
// ---------------------------------------------------------------------------
interface AdminRow {
  id: string;
  booking_code: string;
  full_name: string;
  phone_masked: string;
  citizen_id_masked: string | null;
  location_id: string;
  location_name: string;
  service_id: string;
  service_title: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  note: string | null;
  internal_note: string | null;
  created_at: Date;
  updated_at: Date;
}

// Không bao giờ SELECT cột *_encrypted ở danh sách/chi tiết — chỉ bản đã che
const SELECT_ADMIN = `
  SELECT a.id, a.booking_code, a.full_name, a.phone_masked, a.citizen_id_masked,
         a.location_id, l.name AS location_name, a.service_id, s.title AS service_title,
         to_char(a.appointment_date, 'YYYY-MM-DD') AS appointment_date, a.appointment_time, a.status,
         a.note, a.internal_note, a.created_at, a.updated_at
  FROM appointments a
  JOIN locations l ON l.id = a.location_id
  JOIN services s ON s.id = a.service_id`;

function toListItem(row: AdminRow): AdminAppointmentListItemDto {
  return {
    id: row.id,
    bookingCode: row.booking_code,
    fullName: row.full_name,
    phoneMasked: row.phone_masked,
    citizenIdMasked: row.citizen_id_masked,
    location: { id: row.location_id, name: row.location_name },
    service: { id: row.service_id, name: row.service_title },
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    slotLabel: slotLabel(row.appointment_time),
    status: row.status,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listAppointments(filter: AdminAppointmentListQuery): Promise<{ items: AdminAppointmentListItemDto[]; total: number }> {
  const conditions = ['a.deleted_at IS NULL'];
  const values: unknown[] = [];
  const add = (sql: string, value: unknown) => {
    values.push(value);
    conditions.push(sql.replace('?', `$${values.length}`));
  };
  if (filter.date) add('a.appointment_date = ?::date', filter.date);
  if (filter.locationId) add('a.location_id = ?', filter.locationId);
  if (filter.serviceId) add('a.service_id = ?', filter.serviceId);
  if (filter.status) add('a.status = ?', filter.status);
  const where = `WHERE ${conditions.join(' AND ')}`;

  const [list, count] = await Promise.all([
    query<AdminRow>(
      `${SELECT_ADMIN} ${where}
       ORDER BY a.appointment_date DESC, a.appointment_time, a.created_at
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, filter.limit, filter.offset],
    ),
    query<{ total: number }>(`SELECT count(*)::int AS total FROM appointments a ${where}`, values),
  ]);
  return { items: list.rows.map(toListItem), total: count.rows[0]?.total ?? 0 };
}

async function findAdminRow(id: string): Promise<AdminRow> {
  const { rows } = await query<AdminRow>(`${SELECT_ADMIN} WHERE a.id = $1 AND a.deleted_at IS NULL`, [id]);
  if (!rows[0]) throw notFound(NOT_FOUND_MESSAGE);
  return rows[0];
}

async function history(id: string): Promise<AppointmentHistoryEntry[]> {
  const { rows } = await query<{ action: string; actor_name: string | null; metadata: Record<string, unknown>; created_at: Date }>(
    `SELECT al.action, u.full_name AS actor_name, al.metadata, al.created_at
     FROM audit_logs al LEFT JOIN users u ON u.id = al.actor_user_id
     WHERE al.resource_type = $1 AND al.resource_id = $2
     ORDER BY al.created_at DESC
     LIMIT 50`,
    [RESOURCE, id],
  );
  return rows.map((row) => ({
    action: row.action,
    actorName: row.actor_name,
    fromStatus: typeof row.metadata.fromStatus === 'string' ? row.metadata.fromStatus : null,
    toStatus: typeof row.metadata.toStatus === 'string' ? row.metadata.toStatus : null,
    fields: Array.isArray(row.metadata.fields) ? row.metadata.fields.filter((f): f is string => typeof f === 'string') : [],
    createdAt: row.created_at.toISOString(),
  }));
}

async function toDetail(row: AdminRow): Promise<AdminAppointmentDetailDto> {
  return {
    ...toListItem(row),
    note: row.note,
    internalNote: row.internal_note,
    allowedTransitions: [...APPOINTMENT_TRANSITIONS[row.status]],
    canDelete: DELETABLE_APPOINTMENT_STATUSES.includes(row.status),
    updatedAt: row.updated_at.toISOString(),
    history: await history(row.id),
  };
}

export async function getAppointmentDetail(id: string, actorUserId: string): Promise<AdminAppointmentDetailDto> {
  const row = await findAdminRow(id);
  await writeAuditLog({ actorUserId, action: 'APPOINTMENT_VIEWED', resourceType: RESOURCE, resourceId: id });
  return toDetail(row);
}

/** Giải mã SĐT/CCCD khi quản trị chủ động yêu cầu; luôn ghi audit log (không ghi giá trị) */
export async function revealSensitiveData(id: string, actorUserId: string): Promise<AppointmentSensitiveDto> {
  assertEncryptionConfigured();
  const { rows } = await query<{ phone_encrypted: string; citizen_id_encrypted: string | null }>(
    'SELECT phone_encrypted, citizen_id_encrypted FROM appointments WHERE id = $1 AND deleted_at IS NULL',
    [id],
  );
  const row = rows[0];
  if (!row) throw notFound(NOT_FOUND_MESSAGE);

  let result: AppointmentSensitiveDto;
  try {
    result = {
      phone: decryptField('phone', row.phone_encrypted),
      citizenId: row.citizen_id_encrypted ? decryptField('citizen_id', row.citizen_id_encrypted) : null,
    };
  } catch {
    // Sai khóa / dữ liệu hỏng — không log bản mã hay giá trị
    throw new AppError(500, 'DECRYPTION_FAILED', 'Không giải mã được dữ liệu (kiểm tra cấu hình khóa mã hóa)');
  }
  await writeAuditLog({
    actorUserId,
    action: 'APPOINTMENT_SENSITIVE_DATA_VIEWED',
    resourceType: RESOURCE,
    resourceId: id,
    metadata: { fields: row.citizen_id_encrypted ? ['phone', 'citizen_id'] : ['phone'] },
  });
  return result;
}

export async function updateAppointment(
  id: string,
  input: AdminAppointmentUpdateInput,
  actorUserId: string,
): Promise<AdminAppointmentDetailDto> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const current = await client.query<{ status: AppointmentStatus; internal_note: string | null }>(
      'SELECT status, internal_note FROM appointments WHERE id = $1 AND deleted_at IS NULL FOR UPDATE',
      [id],
    );
    if (!current.rows[0]) throw notFound(NOT_FOUND_MESSAGE);
    const { status: fromStatus, internal_note: currentNote } = current.rows[0];

    const statusChanged = input.status !== undefined && input.status !== fromStatus;
    if (statusChanged && input.status && !APPOINTMENT_TRANSITIONS[fromStatus].includes(input.status)) {
      throw new AppError(400, 'INVALID_TRANSITION', 'Không thể chuyển lịch hẹn sang trạng thái này');
    }
    const noteChanged = input.internalNote !== undefined && input.internalNote !== currentNote;

    if (statusChanged || noteChanged) {
      await client.query(
        `UPDATE appointments SET status = COALESCE($2, status),
                internal_note = CASE WHEN $3 THEN $4 ELSE internal_note END
         WHERE id = $1`,
        [id, statusChanged ? input.status : null, noteChanged, input.internalNote ?? null],
      );
      await writeAuditLog(
        {
          actorUserId,
          action: statusChanged && input.status === 'CANCELLED' ? 'APPOINTMENT_CANCELLED' : 'APPOINTMENT_UPDATED',
          resourceType: RESOURCE,
          resourceId: id,
          metadata: {
            source: 'admin',
            fields: [...(statusChanged ? ['status'] : []), ...(noteChanged ? ['internal_note'] : [])],
            ...(statusChanged && input.status ? { fromStatus, toStatus: input.status } : {}),
          },
        },
        client,
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
  return toDetail(await findAdminRow(id));
}

/** Xóa mềm (chỉ lịch đã hủy / không đến), có audit log; dữ liệu vẫn còn trong database */
export async function softDeleteAppointment(id: string, actorUserId: string): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const current = await client.query<{ status: AppointmentStatus }>(
      'SELECT status FROM appointments WHERE id = $1 AND deleted_at IS NULL FOR UPDATE',
      [id],
    );
    if (!current.rows[0]) throw notFound(NOT_FOUND_MESSAGE);
    if (!DELETABLE_APPOINTMENT_STATUSES.includes(current.rows[0].status)) {
      throw new AppError(400, 'INVALID_STATE', 'Chỉ xóa được lịch hẹn đã hủy hoặc không đến');
    }
    await client.query('UPDATE appointments SET deleted_at = now(), deleted_by = $2 WHERE id = $1', [id, actorUserId]);
    await writeAuditLog(
      { actorUserId, action: 'APPOINTMENT_DELETED', resourceType: RESOURCE, resourceId: id, metadata: { source: 'admin' } },
      client,
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
