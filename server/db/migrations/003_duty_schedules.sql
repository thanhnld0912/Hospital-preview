-- 003_duty_schedules.sql
-- Lịch trực cấp cứu (tab Thông báo & Lịch trực) + công tắc hiển thị section trong site_settings.
-- Idempotent: chạy lại nhiều lần không lỗi và không mất dữ liệu.

-- ---------------------------------------------------------------------------
-- DUTY_SCHEDULES — tham chiếu professional_staff (không lưu trùng tên nhân viên)
-- ON DELETE RESTRICT: không xóa được nhân sự còn trong lịch trực => giữ nguyên lịch sử.
-- Nhân sự bị ẩn (is_active = false) vẫn hiển thị đúng ở các lịch đã phân công.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS duty_schedules (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  duty_date            date NOT NULL,
  doctor_staff_id      uuid NOT NULL REFERENCES professional_staff (id) ON DELETE RESTRICT,
  responsible_staff_id uuid REFERENCES professional_staff (id) ON DELETE RESTRICT,
  nurse_staff_id       uuid REFERENCES professional_staff (id) ON DELETE RESTRICT,
  note                 text,  -- Ghi chú ca trực công khai, ví dụ "Trực 24/24"
  status               text NOT NULL DEFAULT 'PLANNED'
                         CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'SHIFT_CHANGED', 'SUSPENDED')),
  is_active            boolean NOT NULL DEFAULT true,
  sort_order           integer NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS duty_schedules_public_idx ON duty_schedules (is_active, duty_date, sort_order);
CREATE INDEX IF NOT EXISTS duty_schedules_date_idx ON duty_schedules (duty_date);
CREATE INDEX IF NOT EXISTS duty_schedules_status_idx ON duty_schedules (status);
-- Index cho khóa ngoại (kiểm tra RESTRICT khi xóa nhân sự)
CREATE INDEX IF NOT EXISTS duty_schedules_doctor_idx ON duty_schedules (doctor_staff_id);
CREATE INDEX IF NOT EXISTS duty_schedules_responsible_idx ON duty_schedules (responsible_staff_id);
CREATE INDEX IF NOT EXISTS duty_schedules_nurse_idx ON duty_schedules (nurse_staff_id);

DROP TRIGGER IF EXISTS duty_schedules_set_updated_at ON duty_schedules;
CREATE TRIGGER duty_schedules_set_updated_at BEFORE UPDATE ON duty_schedules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE duty_schedules ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- SITE_SETTINGS: bật/tắt section lịch trực trên website (dữ liệu lịch vẫn giữ nguyên khi tắt)
-- ---------------------------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS duty_schedule_enabled boolean NOT NULL DEFAULT true;
