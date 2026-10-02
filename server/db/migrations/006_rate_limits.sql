-- 006_rate_limits.sql
-- Bộ đếm giới hạn tần suất (fixed window) dùng chung cho mọi instance serverless trên Vercel
-- (bộ nhớ trong process không chia sẻ giữa các instance nên không dùng được).
-- key_hash = HMAC của địa chỉ IP (không lưu IP gốc).
-- Idempotent.

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket       text NOT NULL,
  key_hash     text NOT NULL,
  window_start timestamptz NOT NULL,
  hits         integer NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket, key_hash, window_start)
);
CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON rate_limits (window_start);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
