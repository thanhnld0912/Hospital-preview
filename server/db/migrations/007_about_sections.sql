-- 007_about_sections.sql
-- Nội dung 2 section trên trang Giới thiệu do quản trị chỉnh sửa trong site_settings:
--   * "Cơ sở vật chất"      : facility_section_* + facility_items  (danh sách {title, description})
--   * "Đánh giá chất lượng" : quality_section_*  + quality_items   (danh sách {title, score})
-- Giá trị mặc định = nội dung đang hiển thị trên website, nên dữ liệu hiện có không đổi.
-- Idempotent: chạy lại nhiều lần không lỗi và không mất dữ liệu. Không sửa dữ liệu hiện có.

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS facility_section_label       text NOT NULL DEFAULT 'Cơ sở vật chất',
  ADD COLUMN IF NOT EXISTS facility_section_title       text NOT NULL DEFAULT 'Trang thiết bị y tế tại Trạm',
  ADD COLUMN IF NOT EXISTS facility_section_description text,
  ADD COLUMN IF NOT EXISTS facility_items               jsonb NOT NULL DEFAULT '[
    {"title": "Máy điện tim 6 cần", "description": "Đo điện tâm đồ tầm soát bệnh tim mạch, thiếu máu cơ tim và rối loạn nhịp tại chỗ."},
    {"title": "Máy đo đường huyết & Tủ thuốc GSP", "description": "Xét nghiệm mao mạch nhanh kiểm soát đường máu cho bệnh nhân Đái tháo đường."},
    {"title": "Dây chuyền lạnh bảo quản Vắc xin", "description": "Tủ lạnh chuyên dụng đạt chuẩn GSP có hệ thống giám sát nhiệt độ 24/7 tự động."},
    {"title": "Bộ sơ cứu & Bình Oxy hồi sức", "description": "Trang bị sẵn sàng xử trí suy hô hấp, tai nạn thương tích và sốc phản vệ 24/24."}
  ]'::jsonb CHECK (jsonb_typeof(facility_items) = 'array'),
  ADD COLUMN IF NOT EXISTS quality_section_label        text NOT NULL DEFAULT 'Đánh giá chất lượng',
  ADD COLUMN IF NOT EXISTS quality_section_title        text NOT NULL DEFAULT 'Tiêu chí Quốc gia về Y tế xã/phường giai đoạn 2021-2030',
  ADD COLUMN IF NOT EXISTS quality_section_description  text DEFAULT 'Trạm Y tế phường An Hải duy trì đạt chuẩn 10/10 tiêu chí theo Quyết định của Bộ Y tế',
  ADD COLUMN IF NOT EXISTS quality_items                jsonb NOT NULL DEFAULT '[
    {"title": "Chỉ đạo, điều hành công tác CSSK nhân dân", "score": "100%"},
    {"title": "Nhân lực y tế đạt chuẩn theo định biên", "score": "100%"},
    {"title": "Cơ sở hạ tầng & Phòng ốc chuyên môn", "score": "98%"},
    {"title": "Trang thiết bị, thuốc & phương tiện y tế", "score": "97%"},
    {"title": "Kế hoạch - Tài chính & Bảo hiểm y tế", "score": "100%"},
    {"title": "Y tế dự phòng, phòng chống HIV/AIDS", "score": "100%"},
    {"title": "Khám chữa bệnh, phục hồi chức năng & YHCT", "score": "96%"},
    {"title": "Chăm sóc sức khỏe sinh sản & KHHGĐ", "score": "99%"},
    {"title": "Ứng dụng CNTT & Hồ sơ sức khỏe điện tử", "score": "98%"},
    {"title": "Truyền thông - Giáo dục sức khỏe cộng đồng", "score": "100%"}
  ]'::jsonb CHECK (jsonb_typeof(quality_items) = 'array');
