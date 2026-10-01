import 'dotenv/config';
import bcrypt from 'bcryptjs';
import type pg from 'pg';
import { z } from 'zod';
// Dữ liệu ban đầu lấy từ nguồn dữ liệu tĩnh hiện tại của frontend (một nguồn duy nhất, không copy tay)
import { ANNOUNCEMENTS, MEDICAL_SERVICES, NEWS_ARTICLES, STAFF_PROFILES, STATION_INFO } from '../../src/data/healthStationData.js';
import { closePool, getPool } from './pool.js';

const isProduction = process.env.NODE_ENV === 'production';

const seedEnvSchema = z.object({
  // admin@example.com chỉ là mặc định cho development; production phải khai báo ADMIN_EMAIL
  ADMIN_EMAIL: isProduction
    ? z.string().trim().toLowerCase().pipe(z.email())
    : z.string().trim().toLowerCase().pipe(z.email()).default('admin@example.com'),
  ADMIN_PASSWORD: z.string().min(12, 'ADMIN_PASSWORD phải có ít nhất 12 ký tự'),
  ADMIN_FULL_NAME: z.string().trim().min(1).default('Quản trị viên'),
});

/** '28/09/2026' -> '2026-09-28T00:00:00+07:00' (giờ Việt Nam) */
function toIsoDate(ddmmyyyy: string): string {
  const [day, month, year] = ddmmyyyy.split('/');
  return `${year}-${month}-${day}T00:00:00+07:00`;
}

async function seedAdmin(client: pg.PoolClient): Promise<void> {
  const parsed = seedEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Thiếu/không hợp lệ biến seed: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  }
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FULL_NAME } = parsed.data;
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const result = await client.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, 'ADMIN')
     ON CONFLICT (email) DO NOTHING`,
    [ADMIN_EMAIL, passwordHash, ADMIN_FULL_NAME],
  );
  const maskedEmail = maskEmail(ADMIN_EMAIL);
  console.log(result.rowCount ? `✓ Tạo admin ${maskedEmail}` : `- Admin ${maskedEmail} đã tồn tại (giữ nguyên mật khẩu)`);
}

/** "admin@example.com" -> "ad***@example.com" (không in đầy đủ thông tin đăng nhập ra log) */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain ?? ''}`;
}

async function seedSiteSettings(client: pg.PoolClient): Promise<void> {
  const result = await client.query(
    `INSERT INTO site_settings (id, site_name, organization_name, managing_unit, phone, email, description, logo_url)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO NOTHING`,
    [
      STATION_INFO.name,
      'Trạm Y tế',
      'Ủy ban Nhân dân phường An Hải',
      '02363 844075',
      STATION_INFO.email,
      'Cổng thông tin điện tử và dịch vụ chăm sóc sức khỏe cộng đồng Trạm Y tế phường An Hải, TP. Đà Nẵng.',
      STATION_INFO.logoUrl,
    ],
  );
  console.log(result.rowCount ? '✓ Tạo site_settings' : '- site_settings đã tồn tại (giữ nguyên)');
}

async function seedLocations(client: pg.PoolClient): Promise<void> {
  const { rows } = await client.query<{ total: number }>('SELECT count(*)::int AS total FROM locations');
  if ((rows[0]?.total ?? 0) > 0) {
    console.log('- locations đã có dữ liệu (giữ nguyên)');
    return;
  }
  // Địa chỉ do khách hàng cung cấp — giữ nguyên. Tọa độ để trống (chưa xác minh).
  for (const [index, location] of STATION_INFO.locations.entries()) {
    await client.query('INSERT INTO locations (name, address, sort_order) VALUES ($1, $2, $3)', [
      location.name,
      location.address,
      index + 1,
    ]);
  }
  console.log(`✓ Tạo ${STATION_INFO.locations.length} locations`);
}

async function seedServices(client: pg.PoolClient): Promise<void> {
  let created = 0;
  for (const [index, service] of MEDICAL_SERVICES.entries()) {
    const result = await client.query(
      `INSERT INTO services (title, slug, description, short_description, icon, color_scheme, schedule,
                             fee_info, target_audience, procedure, notes, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (slug) DO NOTHING`,
      [
        service.title,
        service.id,
        service.fullDesc,
        service.shortDesc,
        service.icon,
        service.colorScheme,
        service.schedule,
        service.feeInfo,
        service.targetAudience,
        service.procedure,
        service.notes ?? null,
        index + 1,
      ],
    );
    created += result.rowCount ?? 0;
  }
  console.log(`✓ services: thêm ${created}/${MEDICAL_SERVICES.length} (bỏ qua slug đã có)`);
}

async function seedPosts(client: pg.PoolClient): Promise<void> {
  let created = 0;
  const insert = `INSERT INTO posts (type, title, slug, excerpt, content, thumbnail_url, thumbnail_alt, category,
                                     color_scheme, author, issued_by, is_urgent, status, published_at)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PUBLISHED', $13)
                  ON CONFLICT (slug) DO NOTHING`;

  for (const item of ANNOUNCEMENTS) {
    const result = await client.query(insert, [
      'ANNOUNCEMENT', item.title, item.id, item.summary, item.content, null, null, item.tag,
      item.tagColor, null, item.issuedBy, item.isUrgent ?? false, toIsoDate(item.date),
    ]);
    created += result.rowCount ?? 0;
  }
  for (const item of NEWS_ARTICLES) {
    const result = await client.query(insert, [
      'NEWS', item.title, item.id, item.summary, item.content.join('\n\n'), item.imageUrl, item.imageAlt,
      item.category, item.categoryColor, item.author, null, false, toIsoDate(item.date),
    ]);
    created += result.rowCount ?? 0;
  }
  console.log(`✓ posts: thêm ${created}/${ANNOUNCEMENTS.length + NEWS_ARTICLES.length} (bỏ qua slug đã có)`);
}

async function seedStaff(client: pg.PoolClient): Promise<void> {
  const { rows } = await client.query<{ total: number }>('SELECT count(*)::int AS total FROM professional_staff');
  if ((rows[0]?.total ?? 0) > 0) {
    console.log('- professional_staff đã có dữ liệu (giữ nguyên)');
    return;
  }
  // Đúng nhân sự đang hiển thị trên website, giữ nguyên nội dung và thứ tự
  for (const [index, member] of STAFF_PROFILES.entries()) {
    await client.query(
      `INSERT INTO professional_staff (full_name, title, position, department, bio, qualification, avatar_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        member.fullName,
        member.title,
        member.position,
        member.department,
        member.bio,
        member.qualification,
        member.avatarUrl,
        index + 1,
      ],
    );
  }
  console.log(`✓ Tạo ${STAFF_PROFILES.length} nhân sự chuyên môn`);
}

async function seed(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await seedAdmin(client);
    await seedSiteSettings(client);
    await seedLocations(client);
    await seedServices(client);
    await seedPosts(client);
    await seedStaff(client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

seed()
  .then(() => console.log('Seed hoàn tất.'))
  .catch((error: unknown) => {
    console.error('Seed thất bại:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => closePool());
