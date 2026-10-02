// REST client cho backend (server/). Base URL lấy từ VITE_API_BASE_URL, không hard-code.

const rawBaseUrl: unknown = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL =
  typeof rawBaseUrl === 'string' && rawBaseUrl.trim() !== '' ? rawBaseUrl.trim().replace(/\/+$/, '') : null;

const DEFAULT_TIMEOUT_MS = 15_000;

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor(message: string, status: number, code: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ---------------------------------------------------------------------------
// Kiểu dữ liệu API (khớp với server/types/content.ts và server/types/auth.ts)
// ---------------------------------------------------------------------------
export type ColorScheme = 'primary' | 'secondary' | 'tertiary';
export type PostType = 'NEWS' | 'ANNOUNCEMENT';
export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  /** Hiện backend chỉ có 'ADMIN'; để kiểu string để frontend vẫn chặn đúng nếu sau này có thêm role */
  role: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export interface SiteSettingsDto {
  siteName: string;
  organizationName: string;
  managingUnit: string;
  phone: string;
  email: string | null;
  description: string | null;
  logoUrl: string | null;
  staffSectionLabel: string;
  staffSectionTitle: string;
  staffSectionDescription: string | null;
  dutyScheduleEnabled: boolean;
  appointmentSlotCapacity: number;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Lịch trực cấp cứu
// ---------------------------------------------------------------------------
export type DutyStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'SHIFT_CHANGED' | 'SUSPENDED';

export interface DutyStaffRef {
  id: string;
  fullName: string;
  title: string | null;
  isActive: boolean;
}

export interface DutyScheduleDto {
  id: string;
  dutyDate: string;
  doctor: DutyStaffRef;
  responsible: DutyStaffRef | null;
  nurse: DutyStaffRef | null;
  note: string | null;
  status: DutyStatus;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicDutyPerson {
  fullName: string;
  title: string | null;
}

export interface PublicDutyScheduleDto {
  id: string;
  dutyDate: string;
  doctor: PublicDutyPerson;
  responsible: PublicDutyPerson | null;
  nurse: PublicDutyPerson | null;
  note: string | null;
  status: DutyStatus;
}

export interface PublicDutySchedulesResponse {
  enabled: boolean;
  schedules: PublicDutyScheduleDto[];
}

// ---------------------------------------------------------------------------
// Đặt lịch khám
// ---------------------------------------------------------------------------
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface BookingOptionsDto {
  locations: { id: string; name: string; address: string }[];
  services: { id: string; title: string }[];
  slots: { time: string; label: string }[];
  workingDays: number[];
  minDate: string;
  maxDate: string;
}

export interface AvailabilityDto {
  date: string;
  reason: string | null;
  slots: { time: string; label: string; available: boolean; reason: string | null }[];
}

/** Phản hồi công khai sau khi đặt lịch: không chứa SĐT/CCCD */
export interface PublicAppointmentDto {
  bookingCode: string;
  status: AppointmentStatus;
  appointmentDate: string;
  appointmentTime: string;
  slotLabel: string;
  location: { name: string; address: string };
  service: { title: string };
}

export interface AdminAppointmentListItemDto {
  id: string;
  bookingCode: string;
  fullName: string;
  phoneMasked: string;
  citizenIdMasked: string | null;
  location: { id: string; name: string };
  service: { id: string; name: string };
  appointmentDate: string;
  appointmentTime: string;
  slotLabel: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface AppointmentHistoryEntry {
  action: string;
  actorName: string | null;
  fromStatus: string | null;
  toStatus: string | null;
  fields: string[];
  createdAt: string;
}

export interface AdminAppointmentDetailDto extends AdminAppointmentListItemDto {
  note: string | null;
  internalNote: string | null;
  allowedTransitions: AppointmentStatus[];
  canDelete: boolean;
  updatedAt: string;
  history: AppointmentHistoryEntry[];
}

export interface AppointmentSensitiveDto {
  phone: string;
  citizenId: string | null;
}

/** Nhân sự chuyên môn (bản đầy đủ — trang quản trị /admin/staff) */
export interface StaffDto {
  id: string;
  fullName: string;
  title: string | null;
  position: string;
  department: string | null;
  bio: string | null;
  qualification: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Nhân sự chuyên môn (bản công khai — GET /staff) */
export type PublicStaffDto = Pick<
  StaffDto,
  'id' | 'fullName' | 'title' | 'position' | 'department' | 'bio' | 'qualification' | 'avatarUrl'
>;

export interface LocationDto {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  /** URL Google Maps riêng của địa điểm (tọa độ → map_url → địa chỉ) */
  mapUrl: string;
  /** Giá trị map_url do admin nhập (null nếu chưa nhập) */
  customMapUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostDto {
  id: string;
  type: PostType;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
  category: string | null;
  colorScheme: ColorScheme;
  author: string | null;
  issuedBy: string | null;
  isUrgent: boolean;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  icon: string | null;
  colorScheme: ColorScheme;
  schedule: string | null;
  feeInfo: string | null;
  targetAudience: string | null;
  procedure: string[];
  notes: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HealthDto {
  status: string;
  database: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------
export interface ApiResult<T> {
  data: T;
  meta?: { total: number };
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** JWT — được gửi trong header Authorization: Bearer <token> */
  token?: string | null;
  timeoutMs?: number;
}

interface ApiSuccessBody {
  success: true;
  data: unknown;
  meta?: { total: number };
}

interface ApiErrorBody {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

function isSuccessBody(body: unknown): body is ApiSuccessBody {
  return typeof body === 'object' && body !== null && (body as { success?: unknown }).success === true && 'data' in body;
}

function isErrorBody(body: unknown): body is ApiErrorBody {
  if (typeof body !== 'object' || body === null) return false;
  const error = (body as { error?: unknown }).error;
  return typeof error === 'object' && error !== null && typeof (error as { message?: unknown }).message === 'string';
}

function toDetails(details: unknown): ApiErrorDetail[] {
  if (!Array.isArray(details)) return [];
  return details.filter(
    (item): item is ApiErrorDetail =>
      typeof item === 'object' && item !== null && typeof item.path === 'string' && typeof item.message === 'string',
  );
}

/** Gọi {API_BASE_URL}{path}; ném ApiError khi thiếu cấu hình, lỗi mạng/timeout, HTTP lỗi hoặc body sai định dạng */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResult<T>> {
  if (!API_BASE_URL) {
    throw new ApiError('VITE_API_BASE_URL chưa được cấu hình', 0, 'API_NOT_CONFIGURED');
  }

  const { method = 'GET', body, token, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError('Máy chủ phản hồi quá lâu', 0, 'TIMEOUT');
    }
    throw new ApiError(error instanceof Error ? error.message : 'Không kết nối được máy chủ', 0, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timer);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(`Phản hồi không phải JSON (HTTP ${response.status})`, response.status, 'INVALID_RESPONSE');
  }

  if (!response.ok || !isSuccessBody(payload)) {
    const error = isErrorBody(payload) ? payload.error : null;
    throw new ApiError(
      error?.message ?? `HTTP ${response.status}`,
      response.status,
      error?.code ?? 'HTTP_ERROR',
      toDetails(error?.details),
    );
  }

  // Dữ liệu được map/kiểm tra ở tầng sử dụng trước khi hiển thị
  return { data: payload.data as T, meta: payload.meta };
}

export async function apiGet<T>(path: string): Promise<T> {
  return (await apiRequest<T>(path)).data;
}
