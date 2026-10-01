import { ApiError } from '../services/api';

export const SYSTEM_ERROR_MESSAGE = 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.';
export const FORBIDDEN_MESSAGE = 'Bạn không có quyền thực hiện thao tác này.';

/** Thông báo lỗi thân thiện; không bao giờ hiển thị lỗi database gốc */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return FORBIDDEN_MESSAGE;
    if (error.status === 0) {
      return error.code === 'API_NOT_CONFIGURED'
        ? 'Chưa cấu hình địa chỉ API (VITE_API_BASE_URL).'
        : 'Không kết nối được máy chủ. Vui lòng kiểm tra kết nối và thử lại.';
    }
    if (error.status >= 500) return SYSTEM_ERROR_MESSAGE;
    // 400/401/404/409: thông báo đã được backend chuẩn hóa (tiếng Việt, không chứa lỗi DB gốc)
    if (error.status === 400 && error.details.length > 0) {
      return `${error.message}: ${error.details.map((detail) => detail.message).join('; ')}`;
    }
    return error.message;
  }
  return SYSTEM_ERROR_MESSAGE;
}

/** Lỗi validation theo từng trường (path từ zod ở backend, ví dụ "latitude") */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || error.status !== 400) return {};
  const result: Record<string, string> = {};
  for (const detail of error.details) {
    const field = detail.path.split('.')[0];
    if (field && !result[field]) result[field] = detail.message;
  }
  return result;
}

/** Tạo slug không dấu từ tiêu đề tiếng Việt */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

/**
 * Di chuyển một mục lên/xuống và đánh số lại sort_order 1..n.
 * Trả về các mục cần cập nhật (chỉ những mục có thứ tự thay đổi).
 */
export function reorderUpdates<T extends { id: string; sortOrder: number }>(
  items: T[],
  index: number,
  direction: -1 | 1,
): { id: string; sortOrder: number }[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return [];
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next
    .map((item, position) => ({ id: item.id, sortOrder: position + 1, current: item.sortOrder }))
    .filter((item) => item.sortOrder !== item.current)
    .map(({ id, sortOrder }) => ({ id, sortOrder }));
}

/** Chuỗi rỗng → null (để xóa giá trị), ngược lại trả chuỗi đã trim */
export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Ho_Chi_Minh',
});

export function formatDateTime(iso: string | null): string {
  return iso ? dateTimeFormatter.format(new Date(iso)) : '—';
}

/** ISO → giá trị cho <input type="datetime-local"> (giờ máy người dùng) */
export function toDateTimeLocal(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/** Giá trị <input type="datetime-local"> → ISO 8601 */
export function fromDateTimeLocal(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
