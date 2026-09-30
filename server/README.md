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
   - mở **SQL Editor** trên Supabase, dán nội dung `server/db/migrations/001_initial.sql` và Run. Script idempotent, chạy lại không lỗi.
4. **Chạy seed** (cần `ADMIN_PASSWORD` ≥ 12 ký tự trong `.env`):
   ```bash
   npm run db:seed
   ```
   Tạo: 1 admin, `site_settings`, 5 địa điểm, 6 dịch vụ, 3 thông báo + 3 tin tức. Seed an toàn khi chạy lại (không ghi đè dữ liệu đã có, không đổi mật khẩu admin đã tồn tại).
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
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` (trùng slug/email) |
| 413 | `PAYLOAD_TOO_LARGE` |
| 500 | `DATABASE_ERROR`, `INTERNAL_ERROR` (production không trả chi tiết lỗi/stack trace) |
| 503 | `DATABASE_UNAVAILABLE` |

### Trường mở rộng so với schema MVP

Để frontend hiện tại hiển thị đầy đủ mà không mất nội dung, schema có thêm:

- `posts`: `type` (`NEWS`/`ANNOUNCEMENT`), `thumbnail_alt`, `color_scheme`, `author`, `issued_by`, `is_urgent`. Nội dung tin tức lưu dạng văn bản, các đoạn cách nhau một dòng trống.
- `services`: `short_description`, `color_scheme`, `schedule`, `fee_info`, `target_audience`, `procedure` (mảng các bước), `notes`.

## Deploy lên Vercel

1. Import repository vào Vercel (Framework Preset: **Vite**; Build Command `npm run build`; Output `dist`).
2. Khai báo Environment Variables (Production/Preview): `DATABASE_URL` (Transaction pooler, port 6543), `DATABASE_SSL=true`, `JWT_SECRET`, `FRONTEND_URL=https://<domain>`, `NODE_ENV=production`, `VITE_API_BASE_URL=/api`.
3. `api/index.ts` được Vercel build thành Serverless Function; `vercel.json` rewrite `/api/*` → function này. Frontend vẫn được phục vụ tĩnh từ `dist`.
4. Chạy migration/seed từ máy local (trỏ `DATABASE_URL` tới database production) hoặc qua Supabase SQL Editor.
5. Kiểm tra `https://<domain>/api/health`.

> **Lưu ý TypeScript 7:** project dùng `typescript@7` (bản native), không còn JavaScript compiler API mà builder `@vercel/node` dùng để biên dịch `api/index.ts`. Chưa kiểm chứng được trên Vercel. Nếu bước build function báo lỗi liên quan tới `typescript`, các hướng xử lý (cần quyết định trước khi áp dụng):
> 1. Dùng TypeScript 5.x cho project (đổi version devDependency; cần kiểm tra lại frontend);
> 2. Build sẵn backend bằng `esbuild` (đã có trong devDependencies) thành JavaScript và để Vercel deploy file JS đó.
