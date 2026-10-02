-- 005_appointments.sql
-- Đặt lịch khám (public, không cần tài khoản).
-- Số điện thoại & CCCD được mã hóa ở tầng ứng dụng (AES-256-GCM, khóa DATA_ENCRYPTION_KEY phía server):
--   *_encrypted : bản mã (chỉ giải mã khi ADMIN chủ động xem, có ghi audit log)
--   *_hash      : HMAC-SHA256 có khóa — phát hiện đặt trùng / xác minh tra cứu mà không cần giải mã
--   *_masked    : bản che sẵn để hiển thị (ví dụ 09******123, ********1234)
-- Không có cột plaintext và không index dữ liệu nhạy cảm dạng plaintext.
-- Idempotent.

CREATE TABLE IF NOT EXISTS appointments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Mã tra cứu công khai, ngẫu nhiên (không dùng ID tuần tự)
  booking_code         text NOT NULL UNIQUE CHECK (booking_code ~ '^AH-[0-9]{4}-[A-Z0-9]{6}$'),
  full_name            text NOT NULL CHECK (length(btrim(full_name)) BETWEEN 2 AND 100),
  phone_encrypted      text NOT NULL,
  phone_hash           text NOT NULL,
  phone_masked         text NOT NULL,
  citizen_id_encrypted text,
  citizen_id_hash      text,
  citizen_id_masked    text,
  location_id          uuid NOT NULL REFERENCES locations (id) ON DELETE RESTRICT,
  service_id           uuid NOT NULL REFERENCES services (id) ON DELETE RESTRICT,
  appointment_date     date NOT NULL,
  appointment_time     text NOT NULL CHECK (appointment_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  note                 text CHECK (note IS NULL OR length(note) <= 500),
  internal_note        text CHECK (internal_note IS NULL OR length(internal_note) <= 2000),
  status               text NOT NULL DEFAULT 'PENDING'
                         CHECK (status IN ('PENDING', 'CONFIRMED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  -- Xóa mềm: không xóa vật lý lịch hẹn
  deleted_at           timestamptz,
  deleted_by           uuid REFERENCES users (id) ON DELETE RESTRICT,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CHECK ((citizen_id_encrypted IS NULL) = (citizen_id_hash IS NULL))
);
CREATE INDEX IF NOT EXISTS appointments_date_status_idx ON appointments (appointment_date, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS appointments_location_idx ON appointments (location_id);
CREATE INDEX IF NOT EXISTS appointments_service_idx ON appointments (service_id);
CREATE INDEX IF NOT EXISTS appointments_created_idx ON appointments (created_at);
-- Đếm chỗ đã đặt theo cơ sở/ngày/khung giờ
CREATE INDEX IF NOT EXISTS appointments_slot_idx ON appointments (location_id, appointment_date, appointment_time)
  WHERE deleted_at IS NULL AND status <> 'CANCELLED';
-- Chống đặt trùng: mỗi số điện thoại / CCCD chỉ có 1 lịch hẹn còn hiệu lực trong một ngày
CREATE UNIQUE INDEX IF NOT EXISTS appointments_phone_day_uniq ON appointments (phone_hash, appointment_date)
  WHERE deleted_at IS NULL AND status <> 'CANCELLED';
CREATE UNIQUE INDEX IF NOT EXISTS appointments_citizen_day_uniq ON appointments (citizen_id_hash, appointment_date)
  WHERE deleted_at IS NULL AND status <> 'CANCELLED' AND citizen_id_hash IS NOT NULL;

DROP TRIGGER IF EXISTS appointments_set_updated_at ON appointments;
CREATE TRIGGER appointments_set_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- SITE_SETTINGS: số lượt đặt tối đa cho mỗi khung giờ tại mỗi cơ sở (quản trị chỉnh trong Thông tin website)
-- ---------------------------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS appointment_slot_capacity integer NOT NULL DEFAULT 10
    CHECK (appointment_slot_capacity BETWEEN 1 AND 500);
