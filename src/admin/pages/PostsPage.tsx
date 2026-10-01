import React, { useCallback, useEffect, useState } from 'react';
import { ColorScheme, PostDto, PostStatus, PostType } from '../../services/api';
import { useAuth } from '../auth';
import {
  AdminButton,
  AdminCheckbox,
  AdminInput,
  AdminModal,
  AdminSelect,
  AdminTable,
  AdminTextarea,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
  NoticeMessage,
  PageHeader,
  StatusBadge,
} from '../components/ui';
import { describeError, emptyToNull, fieldErrors, formatDateTime, fromDateTimeLocal, slugify, toDateTimeLocal } from '../utils';

const PAGE_LIMIT = 100;

const TYPE_LABELS: Record<PostType, string> = { NEWS: 'Tin tức', ANNOUNCEMENT: 'Thông báo' };

const COLOR_OPTIONS = [
  { value: 'primary', label: 'Xanh lá (mặc định)' },
  { value: 'secondary', label: 'Xanh ngọc' },
  { value: 'tertiary', label: 'Đỏ (nổi bật)' },
];

function isScheduled(post: PostDto): boolean {
  return post.status === 'PUBLISHED' && post.publishedAt !== null && new Date(post.publishedAt).getTime() > Date.now();
}

const PostStatusBadge: React.FC<{ post: PostDto }> = ({ post }) =>
  post.status === 'DRAFT' ? (
    <StatusBadge tone="gray">Nháp</StatusBadge>
  ) : isScheduled(post) ? (
    <StatusBadge tone="amber">Hẹn giờ</StatusBadge>
  ) : (
    <StatusBadge tone="green">Đã xuất bản</StatusBadge>
  );

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------
interface PostForm {
  type: PostType;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  category: string;
  colorScheme: ColorScheme;
  author: string;
  issuedBy: string;
  isUrgent: boolean;
  publishedAt: string;
}

const PostEditorModal: React.FC<{ post: PostDto | null; onClose: () => void; onSaved: (message: string) => void }> = ({
  post,
  onClose,
  onSaved,
}) => {
  const { request } = useAuth();
  const [form, setForm] = useState<PostForm>(() => ({
    type: post?.type ?? 'NEWS',
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    thumbnailUrl: post?.thumbnailUrl ?? '',
    thumbnailAlt: post?.thumbnailAlt ?? '',
    category: post?.category ?? '',
    colorScheme: post?.colorScheme ?? 'primary',
    author: post?.author ?? '',
    issuedBy: post?.issuedBy ?? '',
    isUrgent: post?.isUrgent ?? false,
    publishedAt: toDateTimeLocal(post?.publishedAt ?? null),
  }));
  // Bài mới: slug tự sinh theo tiêu đề cho tới khi admin tự sửa slug
  const [slugEdited, setSlugEdited] = useState(post !== null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<PostStatus | null>(null);
  const isPublished = post?.status === 'PUBLISHED';
  const saving = savingStatus !== null;

  const set =
    (field: keyof PostForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
    setForm((current) => ({ ...current, title, slug: slugEdited ? current.slug : slugify(title) }));
  };

  const save = async (status: PostStatus) => {
    if (!form.title.trim() || !form.slug.trim()) {
      setErrors({ ...(form.title.trim() ? {} : { title: 'Không được để trống' }), ...(form.slug.trim() ? {} : { slug: 'Không được để trống' }) });
      return;
    }
    setSavingStatus(status);
    setErrors({});
    setFormError(null);
    const publishedAt = fromDateTimeLocal(form.publishedAt);
    const isAnnouncement = form.type === 'ANNOUNCEMENT';
    const body = {
      type: form.type,
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: emptyToNull(form.excerpt),
      content: form.content,
      thumbnailUrl: emptyToNull(form.thumbnailUrl),
      thumbnailAlt: emptyToNull(form.thumbnailAlt),
      category: emptyToNull(form.category),
      colorScheme: form.colorScheme,
      author: isAnnouncement ? null : emptyToNull(form.author),
      issuedBy: isAnnouncement ? emptyToNull(form.issuedBy) : null,
      isUrgent: isAnnouncement ? form.isUrgent : false,
      status,
      // Xuất bản mà để trống ngày đăng => backend đặt thời điểm hiện tại (hoặc giữ ngày đăng cũ)
      ...(publishedAt !== null ? { publishedAt } : status === 'DRAFT' ? { publishedAt: null } : {}),
    };
    try {
      if (post) {
        await request<PostDto>(`/admin/posts/${post.id}`, { method: 'PUT', body });
        onSaved(status === 'PUBLISHED' ? 'Đã cập nhật và xuất bản bài viết.' : 'Đã lưu bản nháp.');
      } else {
        await request<PostDto>('/admin/posts', { method: 'POST', body });
        onSaved(status === 'PUBLISHED' ? 'Đã tạo và xuất bản bài viết.' : 'Đã tạo bản nháp.');
      }
    } catch (error) {
      setErrors(fieldErrors(error));
      setFormError(describeError(error));
      setSavingStatus(null);
    }
  };

  const isAnnouncement = form.type === 'ANNOUNCEMENT';

  return (
    <AdminModal
      title={post ? 'Sửa bài viết' : 'Tạo bài viết'}
      size="lg"
      onClose={onClose}
      locked={saving}
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </AdminButton>
          <AdminButton
            variant="secondary"
            icon="draft"
            onClick={() => save('DRAFT')}
            loading={savingStatus === 'DRAFT'}
            disabled={saving}
          >
            {isPublished ? 'Chuyển về nháp' : 'Lưu nháp'}
          </AdminButton>
          <AdminButton icon="publish" onClick={() => save('PUBLISHED')} loading={savingStatus === 'PUBLISHED'} disabled={saving}>
            {isPublished ? 'Lưu & giữ xuất bản' : 'Xuất bản'}
          </AdminButton>
        </>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save(isPublished ? 'PUBLISHED' : 'DRAFT');
        }}
        className="space-y-4"
      >
        {formError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-900" role="alert">
            {formError}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminSelect
            label="Loại bài viết"
            value={form.type}
            onChange={set('type')}
            options={[
              { value: 'NEWS', label: 'Tin tức & Hoạt động' },
              { value: 'ANNOUNCEMENT', label: 'Thông báo' },
            ]}
            hint={isAnnouncement ? 'Hiển thị ở mục Thông báo.' : 'Hiển thị ở mục Tin tức & Hoạt động.'}
          />
          <AdminInput
            label={isAnnouncement ? 'Nhãn thông báo' : 'Chuyên mục'}
            value={form.category}
            onChange={set('category')}
            error={errors.category}
            placeholder={isAnnouncement ? 'Ví dụ: Lịch tiêm chủng' : 'Ví dụ: Truyền thông y tế'}
          />
          <AdminSelect label="Màu nhãn" value={form.colorScheme} onChange={set('colorScheme')} options={COLOR_OPTIONS} />
        </div>
        <AdminInput label="Tiêu đề" required value={form.title} onChange={handleTitle} error={errors.title} autoFocus />
        <AdminInput
          label="Slug"
          required
          value={form.slug}
          onChange={(event) => {
            setSlugEdited(true);
            setForm((current) => ({ ...current, slug: event.target.value }));
          }}
          error={errors.slug}
          hint="Chữ thường không dấu, số và dấu gạch ngang. Tự tạo từ tiêu đề."
        />
        <AdminTextarea label="Mô tả ngắn" rows={2} value={form.excerpt} onChange={set('excerpt')} error={errors.excerpt} />
        <AdminTextarea
          label="Nội dung"
          rows={10}
          value={form.content}
          onChange={set('content')}
          error={errors.content}
          hint={
            isAnnouncement
              ? 'Giữ nguyên xuống dòng khi hiển thị.'
              : 'Mỗi đoạn văn cách nhau bằng một dòng trống.'
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput
            label="Thumbnail URL"
            value={form.thumbnailUrl}
            onChange={set('thumbnailUrl')}
            error={errors.thumbnailUrl}
            placeholder="https://..."
            hint={isAnnouncement ? 'Thông báo hiện không hiển thị ảnh.' : 'Ảnh đại diện của tin tức.'}
          />
          <AdminInput
            label="Mô tả ảnh (alt)"
            value={form.thumbnailAlt}
            onChange={set('thumbnailAlt')}
            error={errors.thumbnailAlt}
            hint="Dành cho người dùng trình đọc màn hình."
          />
          {isAnnouncement ? (
            <AdminInput label="Đơn vị ban hành" value={form.issuedBy} onChange={set('issuedBy')} error={errors.issuedBy} />
          ) : (
            <AdminInput label="Tác giả" value={form.author} onChange={set('author')} error={errors.author} />
          )}
          <AdminInput
            label="Ngày đăng"
            type="datetime-local"
            value={form.publishedAt}
            onChange={set('publishedAt')}
            error={errors.publishedAt}
            hint="Để trống: đăng ngay khi xuất bản. Ngày trong tương lai: hẹn giờ đăng."
          />
        </div>
        {isAnnouncement && (
          <AdminCheckbox
            label="Thông báo khẩn cấp"
            hint='Hiển thị nhãn "Khẩn cấp" trên trang Thông báo.'
            checked={form.isUrgent}
            onChange={(checked) => setForm((current) => ({ ...current, isUrgent: checked }))}
          />
        )}
        {form.thumbnailUrl && !isAnnouncement && (
          <img src={form.thumbnailUrl} alt={form.thumbnailAlt || 'Xem trước ảnh'} className="h-32 rounded-lg border border-gray-200 object-cover" />
        )}
      </form>
    </AdminModal>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
type StatusFilter = 'ALL' | PostStatus;
type TypeFilter = 'ALL' | PostType;

export const PostsPage: React.FC = () => {
  const { request } = useAuth();
  const [posts, setPosts] = useState<PostDto[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeMessage | null>(null);
  const [editing, setEditing] = useState<PostDto | 'new' | null>(null);
  const [deleting, setDeleting] = useState<PostDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const closeNotice = useCallback(() => setNotice(null), []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const { data, meta } = await request<PostDto[]>(`/admin/posts?limit=${PAGE_LIMIT}`);
      setPosts(data);
      setTotal(meta?.total ?? data.length);
    } catch (error) {
      setLoadError(describeError(error));
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = (message: string) => {
    setEditing(null);
    setNotice({ type: 'success', text: message });
    load();
  };

  const togglePublish = async (post: PostDto) => {
    setBusyId(post.id);
    const publish = post.status === 'DRAFT';
    try {
      await request(`/admin/posts/${post.id}`, { method: 'PUT', body: { status: publish ? 'PUBLISHED' : 'DRAFT' } });
      setNotice({ type: 'success', text: publish ? 'Đã xuất bản bài viết.' : 'Đã gỡ bài viết khỏi website (chuyển về nháp).' });
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await request(`/admin/posts/${deleting.id}`, { method: 'DELETE' });
      setNotice({ type: 'success', text: 'Đã xóa bài viết.' });
      setDeleting(null);
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: describeError(error) });
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const visiblePosts = (posts ?? []).filter(
    (post) => (statusFilter === 'ALL' || post.status === statusFilter) && (typeFilter === 'ALL' || post.type === typeFilter),
  );

  const filterButton = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
      active ? 'bg-[#1c7a42] border-[#1c7a42] text-white' : 'bg-white border-gray-200 text-[#414755] hover:bg-gray-50'
    }`;

  return (
    <>
      <PageHeader
        title="Tin tức & Thông báo"
        description="Bài viết đã xuất bản hiển thị ở mục Tin tức & Hoạt động và Thông báo trên website."
        actions={
          <AdminButton icon="add" onClick={() => setEditing('new')}>
            Tạo bài viết
          </AdminButton>
        }
      />
      <Notice notice={notice} onClose={closeNotice} />
      <Card>
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : !posts ? (
          <LoadingState />
        ) : posts.length === 0 ? (
          <EmptyState
            icon="article"
            message="Chưa có bài viết."
            action={
              <AdminButton icon="add" onClick={() => setEditing('new')}>
                Tạo bài viết
              </AdminButton>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
              {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((value) => (
                <button key={value} type="button" className={filterButton(statusFilter === value)} onClick={() => setStatusFilter(value)}>
                  {value === 'ALL' ? 'Tất cả' : value === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-gray-200" />
              {(['ALL', 'NEWS', 'ANNOUNCEMENT'] as const).map((value) => (
                <button key={value} type="button" className={filterButton(typeFilter === value)} onClick={() => setTypeFilter(value)}>
                  {value === 'ALL' ? 'Mọi loại' : TYPE_LABELS[value]}
                </button>
              ))}
            </div>
            {total > posts.length && (
              <p className="px-4 pt-3 text-xs text-amber-800">
                Đang hiển thị {posts.length}/{total} bài mới nhất.
              </p>
            )}
            {visiblePosts.length === 0 ? (
              <EmptyState message="Không có bài viết phù hợp bộ lọc." icon="filter_alt_off" />
            ) : (
              <AdminTable headers={['Tiêu đề', 'Loại', 'Trạng thái', 'Ngày đăng', 'Thao tác']}>
                {visiblePosts.map((post) => (
                  <tr key={post.id} className="align-top hover:bg-gray-50/60">
                    <td className="px-4 py-3 min-w-[260px]">
                      <span className="font-semibold text-[#121c2a]">{post.title}</span>
                      <span className="mt-0.5 block text-xs text-gray-500">
                        /{post.slug}
                        {post.category && ` · ${post.category}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#414755]">{TYPE_LABELS[post.type]}</td>
                    <td className="px-4 py-3">
                      <PostStatusBadge post={post} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-[#414755]">{formatDateTime(post.publishedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <AdminButton size="sm" variant="secondary" icon="edit" onClick={() => setEditing(post)}>
                          Sửa
                        </AdminButton>
                        <AdminButton
                          size="sm"
                          variant="ghost"
                          icon={post.status === 'DRAFT' ? 'publish' : 'unpublished'}
                          onClick={() => togglePublish(post)}
                          disabled={busyId !== null}
                          loading={busyId === post.id}
                          loadingText="Đang lưu..."
                        >
                          {post.status === 'DRAFT' ? 'Xuất bản' : 'Gỡ xuống'}
                        </AdminButton>
                        <AdminButton size="sm" variant="ghost" icon="delete" className="text-[#bb0112]" onClick={() => setDeleting(post)}>
                          Xóa
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </AdminTable>
            )}
          </>
        )}
      </Card>

      {editing && (
        <PostEditorModal post={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
      {deleting && (
        <ConfirmDialog detail={deleting.title} loading={deleteLoading} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
};
