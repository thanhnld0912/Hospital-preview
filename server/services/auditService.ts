import type pg from 'pg';
import { query } from '../db/pool.js';

export const AUDIT_ACTIONS = [
  'APPOINTMENT_CREATED',
  'APPOINTMENT_VIEWED',
  'APPOINTMENT_SENSITIVE_DATA_VIEWED',
  'APPOINTMENT_UPDATED',
  'APPOINTMENT_CANCELLED',
  'APPOINTMENT_DELETED',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

/**
 * metadata chỉ được chứa thông tin mô tả thao tác (tên trường, trạng thái cũ/mới...),
 * KHÔNG chứa giá trị CCCD/SĐT/ghi chú của người dân.
 */
export interface AuditMetadata {
  fields?: string[];
  fromStatus?: string;
  toStatus?: string;
  source?: 'public' | 'admin';
}

interface AuditEntry {
  actorUserId: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  metadata?: AuditMetadata;
}

type Queryable = Pick<pg.PoolClient, 'query'>;

/** Ghi audit log; truyền client để ghi trong cùng transaction với thay đổi dữ liệu */
export async function writeAuditLog(entry: AuditEntry, client?: Queryable): Promise<void> {
  const sql = `INSERT INTO audit_logs (actor_user_id, action, resource_type, resource_id, metadata)
               VALUES ($1, $2, $3, $4, $5::jsonb)`;
  const params = [entry.actorUserId, entry.action, entry.resourceType, entry.resourceId, JSON.stringify(entry.metadata ?? {})];
  if (client) await client.query(sql, params);
  else await query(sql, params);
}
