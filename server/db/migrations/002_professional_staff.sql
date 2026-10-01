-- 002_professional_staff.sql
-- Nhân sự chuyên môn (trang Giới thiệu) + nội dung tiêu đề section nhân sự trong site_settings.
-- Idempotent: chạy lại nhiều lần không lỗi và không mất dữ liệu. Không sửa dữ liệu hiện có.

-- ---------------------------------------------------------------------------
-- PROFESSIONAL_STAFF
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS professional_staff (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text NOT NULL CHECK (length(btrim(full_name)) > 0),
  title         text,                 -- Chức danh viết tắt hiển thị trước tên, ví dụ "Bs.CKI."
  position      text NOT NULL CHECK (length(btrim(position)) > 0), -- Chức vụ, ví dụ "Trưởng Trạm Y tế"
  department    text,                 -- Chuyên môn / Bộ phận
  bio           text,                 -- Giới thiệu
  qualification text,                 -- Trình độ
  avatar_url    text,
  is_active     boolean NOT NULL DEFAULT true,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS professional_staff_active_sort_idx ON professional_staff (is_active, sort_order);

DROP TRIGGER IF EXISTS professional_staff_set_updated_at ON professional_staff;
CREATE TRIGGER professional_staff_set_updated_at BEFORE UPDATE ON professional_staff
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Giống các bảng khác: bật RLS, không policy => Supabase Data API (anon key) không truy cập được
ALTER TABLE professional_staff ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- SITE_SETTINGS: tiêu đề section "Nhân sự chuyên môn" (mặc định = nội dung đang hiển thị)
-- ---------------------------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS staff_section_label       text NOT NULL DEFAULT 'Nhân sự chuyên môn',
  ADD COLUMN IF NOT EXISTS staff_section_title       text NOT NULL DEFAULT 'Đội ngũ y bác sĩ & Nhân viên y tế',
  ADD COLUMN IF NOT EXISTS staff_section_description text DEFAULT 'Cán bộ tận tâm, y đức trong sáng, được đào tạo chính quy';
