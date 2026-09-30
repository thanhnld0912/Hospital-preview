-- 001_initial.sql
-- Schema ban đầu cho backend code-hospital (PostgreSQL / Supabase).
-- Có thể chạy trực tiếp trong Supabase SQL Editor hoặc bằng `npm run db:migrate`.
-- Script idempotent: chạy lại nhiều lần không lỗi và không mất dữ liệu.

-- Tự cập nhật cột updated_at khi UPDATE
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash text NOT NULL,
  full_name     text NOT NULL,
  role          text NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN')),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- SITE SETTINGS (chỉ có một dòng, id = 1)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id                smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name         text NOT NULL,
  organization_name text NOT NULL,
  managing_unit     text NOT NULL,
  phone             text NOT NULL,
  email             text,
  description       text,
  logo_url          text,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- LOCATIONS
-- latitude/longitude để trống cho tới khi được xác minh; khi trống, API tạo
-- map_url tìm kiếm theo địa chỉ.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  address    text NOT NULL,
  phone      text,
  latitude   double precision CHECK (latitude BETWEEN -90 AND 90),
  longitude  double precision CHECK (longitude BETWEEN -180 AND 180),
  map_url    text,
  is_active  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT locations_coordinates_pair CHECK ((latitude IS NULL) = (longitude IS NULL))
);
CREATE INDEX IF NOT EXISTS locations_active_sort_idx ON locations (is_active, sort_order);

-- ---------------------------------------------------------------------------
-- POSTS (tin tức + thông báo)
-- Ngoài các trường MVP, thêm type/author/issued_by/is_urgent/color_scheme/
-- thumbnail_alt để hiển thị đúng giao diện frontend hiện tại.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          text NOT NULL DEFAULT 'NEWS' CHECK (type IN ('NEWS', 'ANNOUNCEMENT')),
  title         text NOT NULL,
  slug          text NOT NULL UNIQUE,
  excerpt       text,
  content       text NOT NULL DEFAULT '',
  thumbnail_url text,
  thumbnail_alt text,
  category      text,
  color_scheme  text NOT NULL DEFAULT 'primary' CHECK (color_scheme IN ('primary', 'secondary', 'tertiary')),
  author        text,
  issued_by     text,
  is_urgent     boolean NOT NULL DEFAULT false,
  status        text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_public_idx ON posts (status, type, published_at DESC);

-- ---------------------------------------------------------------------------
-- SERVICES
-- Ngoài các trường MVP, thêm short_description/schedule/fee_info/
-- target_audience/procedure/notes/color_scheme cho trang Dịch vụ hiện tại.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  slug              text NOT NULL UNIQUE,
  description       text NOT NULL DEFAULT '',
  short_description text,
  icon              text,
  color_scheme      text NOT NULL DEFAULT 'primary' CHECK (color_scheme IN ('primary', 'secondary', 'tertiary')),
  schedule          text,
  fee_info          text,
  target_audience   text,
  procedure         text[] NOT NULL DEFAULT '{}',
  notes             text,
  is_active         boolean NOT NULL DEFAULT true,
  sort_order        integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS services_active_sort_idx ON services (is_active, sort_order);

-- ---------------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS site_settings_set_updated_at ON site_settings;
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS locations_set_updated_at ON locations;
CREATE TRIGGER locations_set_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS posts_set_updated_at ON posts;
CREATE TRIGGER posts_set_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS services_set_updated_at ON services;
CREATE TRIGGER services_set_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Supabase tự công khai các bảng schema public qua Data API (PostgREST).
-- Bật RLS và KHÔNG tạo policy => anon/authenticated key không đọc/ghi được
-- (đặc biệt users.password_hash). Backend kết nối bằng role owner nên không bị ảnh hưởng.
-- ---------------------------------------------------------------------------
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE services      ENABLE ROW LEVEL SECURITY;
