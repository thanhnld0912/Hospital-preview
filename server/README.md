# Backend API — Trạm Y tế phường An Hải

REST API để quản lý nội dung website (cấu hình chung, địa điểm, dịch vụ, tin tức/thông báo) mà không cần sửa source frontend.

```
Frontend (Vite/React)  →  REST API /api/*  →  Express 4  →  PostgreSQL (Supabase) qua `pg`
```

## Tech stack

| Thành phần | Công nghệ |
|---|---|
| Runtime | Node.js >= 18 |
| Ngôn ngữ | TypeScript (`strict: true`, cấu hình ở `tsconfig.server.json`) |
| Framework | Express 4 |
| Database | PostgreSQL trên Supabase, truy cập trực tiếp bằng `pg` (Pool). **Không ORM, không Supabase client/Auth** |
| Xác thực | JWT HS256 (`jsonwebtoken`) + `bcryptjs` |
| Validation | `zod` |
| Bảo mật / log | `helmet`, `cors` (whitelist từ env), `morgan` |
| Deploy | Vercel Serverless Function, entry `api/index.ts` |

## Cấu trúc

```
api/index.ts              Entry Vercel: export Express app (không app.listen)
server/
├── app.ts                Tạo Express app: helmet, cors, morgan, json, routes, error handler
├── dev.ts                Dev server local (app.listen) — chỉ dùng khi phát triển
├── config/env.ts         Đọc & validate biến môi trường bằng zod
├── db/
│   ├── pool.ts           pg Pool dùng chung + hàm query()
│   ├── sql.ts            Helper tạo mệnh đề UPDATE an toàn
│   ├── migrate.ts        Chạy các file SQL trong migrations/ (ghi nhận vào schema_migrations)
│   ├── seed.ts           Tạo admin + dữ liệu ban đầu (lấy từ src/data/healthStationData.ts)
│   └── migrations/001_initial.sql
├── routes/               index.ts (public + auth), admin.ts (JWT + ADMIN)
├── controllers/          Mỏng: validate input bằng zod → gọi service → trả response
├── services/             Business logic + SQL
├── middleware/           auth.ts (authenticate, requireAdmin), errorHandler.ts
├── schemas/              zod schema cho body / params / query
├── types/                Kiểu dữ liệu (DTO, AuthUser, mở rộng Express.Request)
└── utils/                AppError, asyncHandler, sendSuccess/sendList, URL Google Maps
```

## Biến môi trường

Sao chép `.env.example` → `.env` ở thư mục gốc (file `.env*` đã nằm trong `.gitignore`, **không commit**).

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | ✔ | Chuỗi kết nối PostgreSQL của Supabase |
| `DATABASE_SSL` | | `true` (mặc định, Supabase) / `false` (Postgres local không SSL) |
| `JWT_SECRET` | ✔ | Chuỗi ngẫu nhiên ≥ 32 ký tự |
| `JWT_EXPIRES_IN_SECONDS` | | Thời hạn token, mặc định `28800` (8 giờ) |
| `FRONTEND_URL` | ✔ | Origin được phép gọi API (CORS), nhiều origin cách nhau bởi dấu phẩy |
| `NODE_ENV` | | `development` / `production` |
| `PORT` | | Port dev server local, mặc định `3001` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FULL_NAME` | seed | Chỉ dùng khi chạy `npm run db:seed` |
| `DATA_ENCRYPTION_KEY` | đặt lịch | 32 byte base64 — khóa mã hóa SĐT/CCCD lịch hẹn (AES-256-GCM). Chỉ phía server, **không** dùng tiền tố `VITE_`. Thiếu khóa ⇒ API đặt lịch trả 503 `FEATURE_NOT_CONFIGURED`, các chức năng khác vẫn chạy. Dùng cùng một khóa cho mọi môi trường dùng chung database |
| `VITE_API_BASE_URL` | frontend | `http://localhost:3001/api` khi dev; `/api` khi deploy cùng domain trên Vercel |

Tạo `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Thiết lập database (Supabase)

1. **Tạo project** tại <https://supabase.com> → New project (ghi lại database password).
2. **Lấy connection string**: nút **Connect** → tab *Connection string* → chọn:
   - **Transaction pooler** (port `6543`) — khuyến nghị cho Vercel serverless;
   - hoặc Session pooler / Direct connection khi chạy local.
   Thay `[YOUR-PASSWORD]` rồi gán vào `DATABASE_URL`. **Không** thêm `?sslmode=...` (SSL điều khiển bằng `DATABASE_SSL`).
3. **Chạy migration** — chọn một trong hai cách:
   - `npm run db:migrate` (đọc `DATABASE_URL` từ `.env`), hoặc
   - mở **SQL Editor** trên Supabase, dán lần lượt nội dung các file trong `server/db/migrations/` (`001_initial.sql`, `002_professional_staff.sql`, …) theo thứ tự và Run. Script idempotent, chạy lại không lỗi.
4. **Chạy seed** (cần `ADMIN_PASSWORD` ≥ 12 ký tự trong `.env`):
   ```bash
   npm run db:seed
   ```
   Tạo: 1 admin, `site_settings`, 5 địa điểm, 6 dịch vụ, 3 thông báo + 3 tin tức, 5 nhân sự chuyên môn, lịch trực tuần (tham chiếu nhân sự). Seed an toàn khi chạy lại (không ghi đè dữ liệu đã có, không đổi mật khẩu admin đã tồn tại).
5. **Cấu hình biến môi trường** (local: `.env`; production: Vercel → Project Settings → Environment Variables).

> Migration bật **Row Level Security** cho mọi bảng và không tạo policy, để Data API (anon key) của Supabase không đọc/ghi được dữ liệu (đặc biệt `users.password_hash`). Backend kết nối bằng role owner nên không bị ảnh hưởng.

### Tọa độ địa điểm

`latitude`/`longitude` để **trống** trong seed vì chưa được xác minh — không tự đoán. Khi trống, API trả `mapUrl` dạng
`https://www.google.com/maps/search/?api=1&query=<địa chỉ của chính địa điểm đó>, Đà Nẵng`.
Khi đã có tọa độ chính xác, cập nhật qua `PUT /api/admin/locations/:id` với cả `latitude` và `longitude` (hoặc nhập `mapUrl` cụ thể).

## Chạy local

```bash
npm install
npm run db:migrate      # lần đầu
npm run db:seed         # lần đầu
npm run dev:api         # API: http://localhost:3001/api  (health: /api/health)
npm run dev             # Frontend: http://localhost:3000 (đặt VITE_API_BASE_URL=http://localhost:3001/api)
```

Kiểm tra:

```bash
npm run typecheck:api   # TypeScript strict cho backend
npm run lint            # TypeScript cho frontend
npm run build           # Build frontend (Vite)
```

Nếu API không chạy hoặc lỗi, frontend vẫn hiển thị dữ liệu tĩnh dự phòng (`src/data/healthStationData.ts`) và log lỗi `[API] ...` trong console trình duyệt.

## Xác thực

1. `POST /api/auth/login` với `{ "email": "...", "password": "..." }` → nhận `data.token`.
2. Gửi header `Authorization: Bearer <token>` cho các endpoint `/api/admin/*` và `/api/auth/me`.

- Token ký bằng HS256, payload `{ sub: <userId>, role: "ADMIN" }`, hết hạn theo `JWT_EXPIRES_IN_SECONDS`.
- Mỗi request có token đều kiểm tra lại tài khoản trong DB: tài khoản bị vô hiệu hóa (`is_active = false`) mất quyền ngay.
- Response không bao giờ chứa `password_hash`.

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"<ADMIN_PASSWORD>"}'
```

## API endpoints

Prefix: `/api`

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/health` | Public | Trạng thái API + kết nối DB (503 nếu DB lỗi) |
| POST | `/auth/login` | Public | Đăng nhập, trả JWT |
| GET | `/auth/me` | JWT | Thông tin tài khoản hiện tại |
| GET | `/site-settings` | Public | Cấu hình chung website |
| PUT | `/admin/site-settings` | ADMIN | Cập nhật một phần cấu hình |
| GET | `/locations` | Public | Địa điểm đang hoạt động (theo `sort_order`), kèm `mapUrl` riêng |
| GET | `/locations/:id` | Public | Chi tiết địa điểm |
| POST | `/admin/locations` | ADMIN | Tạo địa điểm |
| PUT | `/admin/locations/:id` | ADMIN | Cập nhật một phần |
| DELETE | `/admin/locations/:id` | ADMIN | Xóa |
| GET | `/posts?type=&category=&limit=&offset=` | Public | Bài đã xuất bản (`type`: `NEWS` \| `ANNOUNCEMENT`; `limit` 1–100, mặc định 50) |
| GET | `/posts/:slug` | Public | Chi tiết bài đã xuất bản |
| POST | `/admin/posts` | ADMIN | Tạo bài (mặc định `DRAFT`; `PUBLISHED` không có `publishedAt` ⇒ đăng ngay) |
| PUT | `/admin/posts/:id` | ADMIN | Cập nhật một phần |
| DELETE | `/admin/posts/:id` | ADMIN | Xóa |
| GET | `/services` | Public | Dịch vụ đang hoạt động (theo `sort_order`) |
| GET | `/services/:id` | Public | Chi tiết dịch vụ |
| POST | `/admin/services` | ADMIN | Tạo dịch vụ |
| PUT | `/admin/services/:id` | ADMIN | Cập nhật một phần |
| DELETE | `/admin/services/:id` | ADMIN | Xóa |
| GET | `/staff` | Public | Nhân sự chuyên môn đang hiển thị (theo `sort_order`), chỉ các trường hiển thị |
| POST | `/admin/staff` | ADMIN | Thêm nhân sự |
| PUT | `/admin/staff/:id` | ADMIN | Cập nhật một phần |
| DELETE | `/admin/staff/:id` | ADMIN | Xóa (409 nếu nhân sự còn trong lịch trực — hãy ẩn thay vì xóa) |
| GET | `/duty-schedules` | Public | `{ enabled, schedules }` — lịch trực đang bật trong 7 ngày từ hôm nay (giờ VN); `enabled=false` ⇒ không trả lịch. `Cache-Control: no-store` (website thăm dò mỗi 20 giây) |
| POST | `/admin/duty-schedules` | ADMIN | Thêm lịch trực (nhân sự chọn từ `professional_staff`) |
| PUT | `/admin/duty-schedules/:id` | ADMIN | Cập nhật một phần (ngày, nhân sự, trạng thái, ghi chú, ẩn/hiện, thứ tự) |
| DELETE | `/admin/duty-schedules/:id` | ADMIN | Xóa |
| GET | `/appointments/options` | Public | Cơ sở, dịch vụ đang hoạt động, khung giờ, khoảng ngày được đặt |
| GET | `/appointments/availability?locationId=&date=` | Public | Khung giờ còn nhận theo cơ sở/ngày |
| POST | `/appointments` | Public | Đặt lịch (rate limit 10 lần/15 phút/IP, body ≤ 8 KB). Trả mã đặt lịch + thông tin tối thiểu, không trả SĐT/CCCD |
| POST | `/appointments/lookup` | Public | Tra cứu bằng mã đặt lịch + `verification: { method: "PHONE", phone }` (rate limit 20/15 phút/IP). Sai mã hay sai SĐT trả cùng một lỗi 404. Thiết kế sẵn để thêm `method: "OTP"` |
| GET | `/admin/appointments?date=&locationId=&serviceId=&status=&limit=&offset=` | ADMIN | Danh sách lịch hẹn (SĐT/CCCD đã che) |
| GET | `/admin/appointments/:id` | ADMIN | Chi tiết (đã che) + lịch sử thao tác; ghi audit `APPOINTMENT_VIEWED` |
| POST | `/admin/appointments/:id/sensitive-data` | ADMIN | Giải mã SĐT/CCCD; ghi audit `APPOINTMENT_SENSITIVE_DATA_VIEWED` |
| PUT | `/admin/appointments/:id` | ADMIN | Chỉ `status` (theo luồng hợp lệ) và `internalNote`; ghi audit |
| DELETE | `/admin/appointments/:id` | ADMIN | Xóa mềm (chỉ lịch đã hủy / không đến); ghi audit `APPOINTMENT_DELETED` |

Danh sách dành cho trang quản trị (JWT + ADMIN) — trả cả mục đang tắt và bài nháp, khác với GET public:

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/locations` | Mọi địa điểm (kể cả `isActive = false`), kèm `customMapUrl` (giá trị gốc cột `map_url`) |
| GET | `/admin/posts?type=&status=&category=&limit=&offset=` | Mọi bài viết (DRAFT/PUBLISHED/hẹn giờ), mới tạo lên đầu |
| GET | `/admin/services` | Mọi dịch vụ (kể cả đang tắt) |
| GET | `/admin/staff` | Mọi nhân sự (kể cả đang ẩn) |
| GET | `/admin/duty-schedules?from=&to=` | Mọi lịch trực (kể cả đang ẩn), lọc theo khoảng ngày |

`mapUrl` của địa điểm được tạo theo thứ tự ưu tiên: **tọa độ đã xác minh → `map_url` admin nhập → tìm theo địa chỉ của chính địa điểm**.

### Định dạng response

```jsonc
// Thành công
{ "success": true, "data": { ... } }
// Danh sách
{ "success": true, "data": [ ... ], "meta": { "total": 10 } }
// Lỗi
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [ ... ] } }
```

| HTTP | `error.code` |
|---|---|
| 400 | `VALIDATION_ERROR`, `INVALID_JSON` |
| 401 | `UNAUTHORIZED`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `INVALID_CREDENTIALS` |
| 403 | `FORBIDDEN`, `ACCOUNT_DISABLED` |
| 409 | `DUPLICATE_BOOKING`, `SLOT_FULL` (đặt lịch) |
| 429 | `RATE_LIMITED` (kèm header `Retry-After`) |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` (trùng slug/email) |
| 413 | `PAYLOAD_TOO_LARGE` |
| 500 | `DATABASE_ERROR`, `INTERNAL_ERROR` (production không trả chi tiết lỗi/stack trace) |
| 503 | `DATABASE_UNAVAILABLE`, `FEATURE_NOT_CONFIGURED` (thiếu `DATA_ENCRYPTION_KEY`) |

### Trường mở rộng so với schema MVP

Để frontend hiện tại hiển thị đầy đủ mà không mất nội dung, schema có thêm:

- `posts`: `type` (`NEWS`/`ANNOUNCEMENT`), `thumbnail_alt`, `color_scheme`, `author`, `issued_by`, `is_urgent`. Nội dung tin tức lưu dạng văn bản, các đoạn cách nhau một dòng trống.
- `services`: `short_description`, `color_scheme`, `schedule`, `fee_info`, `target_audience`, `procedure` (mảng các bước), `notes`.
- `professional_staff` (migration 002): `full_name`, `title` (chức danh viết tắt, ví dụ `Bs.CKI.` — website hiển thị trước họ tên), `position` (chức vụ), `department`, `bio`, `qualification` (trình độ), `avatar_url`, `is_active`, `sort_order`.
- `site_settings` (migration 002): `staff_section_label`, `staff_section_title`, `staff_section_description` — tiêu đề section "Nhân sự chuyên môn" trên trang Giới thiệu.

## Admin Dashboard

Giao diện quản trị nằm trong frontend hiện tại (`src/admin/`), tải riêng (code splitting) nên không làm nặng website công khai.

| URL | Chức năng |
|---|---|
| `/admin/login` | Đăng nhập (email + mật khẩu tài khoản ADMIN tạo bởi seed) |
| `/admin` | Tổng quan: số địa điểm, bài viết, dịch vụ, trạng thái backend |
| `/admin/settings` | Thông tin website (tên, đơn vị quản lý, số điện thoại, email, mô tả, logo) và nội dung giới thiệu (tiêu đề section nhân sự) |
| `/admin/locations` | Thêm/sửa/xóa/bật-tắt/sắp xếp địa điểm; xem trước bản đồ theo tọa độ |
| `/admin/posts` | Tin tức & thông báo: tạo, sửa, lưu nháp, xuất bản/gỡ xuống, xóa |
| `/admin/services` | Thêm/sửa/xóa/bật-tắt/sắp xếp dịch vụ |
| `/admin/staff` | Nhân sự chuyên môn: thêm/sửa/xóa/ẩn-hiện/sắp xếp |
| `/admin/duty-schedules` | Lịch trực: thêm/sửa/xóa, đổi nhân sự/trạng thái/ngày/thứ tự, ẩn-hiện từng lịch, bật/tắt cả section trên website |
| `/admin/appointments` | Đặt lịch khám: lọc theo ngày/cơ sở/dịch vụ/trạng thái, xem chi tiết, xác nhận → đã đến → đang khám → hoàn thành, hủy, không đến, ghi chú nội bộ, xem dữ liệu nhạy cảm (có audit), xóa mềm |

- JWT lưu trong `sessionStorage` của tab (tự xóa khi đóng tab), tự gắn `Authorization: Bearer <token>`; nhận 401 ⇒ tự đăng xuất và về `/admin/login`.
- Không có đăng ký / quên mật khẩu / quản lý người dùng: tài khoản admin quản lý qua seed hoặc database. Website công khai chỉ có liên kết nhỏ "Đăng nhập quản trị" ở chân trang dẫn tới `/admin/login`.
- Website công khai tải dữ liệu từ API trước khi hiển thị, nên nội dung admin vừa lưu xuất hiện ngay khi tải lại trang (không cần build lại).
- Local: chạy `npm run dev:api` và `npm run dev` (với `VITE_API_BASE_URL=http://localhost:3001/api`), mở `http://localhost:3000/admin`.

## Lịch trực & đặt lịch khám — bảo mật

- **Lịch trực "realtime"**: website thăm dò `GET /api/duty-schedules` mỗi 20 giây (chỉ khi tab đang mở, tải ngay khi quay lại tab). Không dùng WebSocket (Vercel serverless không giữ kết nối) và không dùng Supabase Realtime (cần đưa anon key + policy đọc bảng ra trình duyệt).
- **Dữ liệu nhạy cảm**: SĐT và CCCD mã hóa AES-256-GCM ở tầng ứng dụng (`server/utils/sensitiveData.ts`), kèm HMAC có khóa để chống đặt trùng/xác minh tra cứu, và bản che sẵn (`09*****456`, `********1234`). Không có cột plaintext. Danh sách/chi tiết quản trị chỉ trả bản che; giải mã qua POST riêng, luôn ghi audit log. Frontend không lưu dữ liệu này vào storage/URL.
- **Audit log** (`audit_logs`): tạo, xem, xem dữ liệu nhạy cảm, cập nhật, hủy, xóa lịch hẹn. `metadata` chỉ chứa tên trường / trạng thái cũ-mới, không chứa giá trị SĐT/CCCD.
- **Rate limit** lưu trong bảng `rate_limits` (dùng chung mọi instance serverless), khóa là HMAC của IP (không lưu IP gốc): đăng nhập 10/15 phút, đặt lịch 10/15 phút, tra cứu 20/15 phút.
- **Chống spam/trùng**: Zod strict (từ chối trường lạ), ô bẫy (honeypot), tối đa 1 lịch hẹn còn hiệu lực/ngày cho mỗi SĐT hoặc CCCD (unique index), giới hạn số lượt mỗi khung giờ (`site_settings.appointment_slot_capacity`, khóa advisory khi đếm), chỉ nhận Thứ Hai–Thứ Sáu, tối đa 60 ngày tới, không nhận khung giờ đã qua.
- Mã đặt lịch `AH-YYYY-XXXXXX` ngẫu nhiên (crypto), không dùng ID tuần tự; không có endpoint public `GET /appointments/:id`.

## Deploy lên Vercel

1. Import repository vào Vercel (Framework Preset: **Vite**; Build Command `npm run build`; Output `dist`).
2. Khai báo Environment Variables (Production/Preview): `DATABASE_URL` (Transaction pooler, port 6543), `DATABASE_SSL=true`, `JWT_SECRET`, `DATA_ENCRYPTION_KEY`, `FRONTEND_URL=https://<domain>`, `NODE_ENV=production`, `VITE_API_BASE_URL=/api`.
3. `api/index.ts` được Vercel build thành Serverless Function; `vercel.json` rewrite `/api/*` → function này và `/admin/*` → `index.html` (để mở trực tiếp/tải lại các trang quản trị). Frontend vẫn được phục vụ tĩnh từ `dist`.
4. Chạy migration/seed từ máy local (trỏ `DATABASE_URL` tới database production) hoặc qua Supabase SQL Editor.
5. Kiểm tra `https://<domain>/api/health`.

> **Lưu ý TypeScript 7:** project dùng `typescript@7` (bản native), không còn JavaScript compiler API mà builder `@vercel/node` dùng để biên dịch `api/index.ts`. Chưa kiểm chứng được trên Vercel. Nếu bước build function báo lỗi liên quan tới `typescript`, các hướng xử lý (cần quyết định trước khi áp dụng):
> 1. Dùng TypeScript 5.x cho project (đổi version devDependency; cần kiểm tra lại frontend);
> 2. Build sẵn backend bằng `esbuild` (đã có trong devDependencies) thành JavaScript và để Vercel deploy file JS đó.
