-- 004_audit_logs.sql
-- Nhật ký thao tác quan trọng (đặt lịch, xem dữ liệu nhạy cảm, đổi trạng thái...).
-- metadata KHÔNG BAO GIỜ chứa CCCD/số điện thoại đầy đủ — chỉ tên trường, trạng thái cũ/mới...
-- Idempotent.

CREATE TABLE IF NOT EXISTS audit_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- NULL = thao tác từ website công khai (ví dụ người dân đặt lịch)
  actor_user_id uuid REFERENCES users (id) ON DELETE RESTRICT,
  action        text NOT NULL CHECK (action ~ '^[A-Z][A-Z_]*$'),
  resource_type text NOT NULL,
  resource_id   text,
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx ON audit_logs (resource_type, resource_id, created_at);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs (created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
