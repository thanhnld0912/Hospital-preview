import { query } from '../db/pool.js';
import { buildUpdateSet } from '../db/sql.js';
import type { PostCreateInput, PostListQuery, PostUpdateInput } from '../schemas/post.js';
import type { ColorScheme, PostDto, PostStatus, PostType } from '../types/content.js';
import { notFound } from '../utils/errors.js';

interface PostRow {
  id: string;
  type: PostType;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail_url: string | null;
  thumbnail_alt: string | null;
  category: string | null;
  color_scheme: ColorScheme;
  author: string | null;
  issued_by: string | null;
  is_urgent: boolean;
  status: PostStatus;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const NOT_FOUND_MESSAGE = 'Không tìm thấy bài viết';

// Bài công khai: đã xuất bản và tới thời điểm đăng
const PUBLIC_CONDITION = `status = 'PUBLISHED' AND published_at IS NOT NULL AND published_at <= now()`;

function toDto(row: PostRow): PostDto {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    thumbnailUrl: row.thumbnail_url,
    thumbnailAlt: row.thumbnail_alt,
    category: row.category,
    colorScheme: row.color_scheme,
    author: row.author,
    issuedBy: row.issued_by,
    isUrgent: row.is_urgent,
    status: row.status,
    publishedAt: row.published_at ? row.published_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listPublishedPosts(filters: PostListQuery): Promise<{ items: PostDto[]; total: number }> {
  const conditions = [PUBLIC_CONDITION];
  const params: unknown[] = [];
  if (filters.type) {
    params.push(filters.type);
    conditions.push(`type = $${params.length}`);
  }
  if (filters.category) {
    params.push(filters.category);
    conditions.push(`category = $${params.length}`);
  }
  const where = conditions.join(' AND ');

  const [list, count] = await Promise.all([
    query<PostRow>(
      `SELECT * FROM posts WHERE ${where}
       ORDER BY published_at DESC, created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, filters.limit, filters.offset],
    ),
    query<{ total: number }>(`SELECT count(*)::int AS total FROM posts WHERE ${where}`, params),
  ]);

  return { items: list.rows.map(toDto), total: count.rows[0]?.total ?? 0 };
}

export async function getPublishedPostBySlug(slug: string): Promise<PostDto> {
  const { rows } = await query<PostRow>(`SELECT * FROM posts WHERE slug = $1 AND ${PUBLIC_CONDITION}`, [slug]);
  if (!rows[0]) throw notFound(NOT_FOUND_MESSAGE);
  return toDto(rows[0]);
}

export async function createPost(input: PostCreateInput): Promise<PostDto> {
  // Xuất bản mà không chỉ định thời điểm => đăng ngay
  const publishedAt = input.publishedAt ?? (input.status === 'PUBLISHED' ? new Date().toISOString() : null);
  const { rows } = await query<PostRow>(
    `INSERT INTO posts (type, title, slug, excerpt, content, thumbnail_url, thumbnail_alt, category,
                        color_scheme, author, issued_by, is_urgent, status, published_at)
     VALUES (COALESCE($1, 'NEWS'), $2, $3, $4, COALESCE($5, ''), $6, $7, $8,
             COALESCE($9, 'primary'), $10, $11, COALESCE($12, false), COALESCE($13, 'DRAFT'), $14)
     RETURNING *`,
    [
      input.type ?? null,
      input.title,
      input.slug,
      input.excerpt ?? null,
      input.content ?? null,
      input.thumbnailUrl ?? null,
      input.thumbnailAlt ?? null,
      input.category ?? null,
      input.colorScheme ?? null,
      input.author ?? null,
      input.issuedBy ?? null,
      input.isUrgent ?? null,
      input.status ?? null,
      publishedAt,
    ],
  );
  return toDto(rows[0]);
}

export async function updatePost(id: string, input: PostUpdateInput): Promise<PostDto> {
  const { assignments, values } = buildUpdateSet({
    type: input.type,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    thumbnail_url: input.thumbnailUrl,
    thumbnail_alt: input.thumbnailAlt,
    category: input.category,
    color_scheme: input.colorScheme,
    author: input.author,
    issued_by: input.issuedBy,
    is_urgent: input.isUrgent,
    status: input.status,
    published_at: input.publishedAt,
  });
  if (input.status === 'PUBLISHED' && input.publishedAt === undefined) {
    // Chuyển sang xuất bản lần đầu => đặt thời điểm đăng, giữ nguyên nếu đã có
    assignments.push('published_at = COALESCE(published_at, now())');
  }
  values.push(id);
  const { rows } = await query<PostRow>(
    `UPDATE posts SET ${assignments.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values,
  );
  if (!rows[0]) throw notFound(NOT_FOUND_MESSAGE);
  return toDto(rows[0]);
}

export async function deletePost(id: string): Promise<void> {
  const { rowCount } = await query('DELETE FROM posts WHERE id = $1', [id]);
  if (!rowCount) throw notFound(NOT_FOUND_MESSAGE);
}
