// REST client cho backend (server/). Base URL lấy từ VITE_API_BASE_URL, không hard-code.

const rawBaseUrl: unknown = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL =
  typeof rawBaseUrl === 'string' && rawBaseUrl.trim() !== '' ? rawBaseUrl.trim().replace(/\/+$/, '') : null;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type ColorScheme = 'primary' | 'secondary' | 'tertiary';

// Kiểu dữ liệu trả về từ API (khớp với server/types/content.ts)
export interface SiteSettingsDto {
  siteName: string;
  organizationName: string;
  managingUnit: string;
  phone: string;
  email: string | null;
  description: string | null;
  logoUrl: string | null;
}

export interface LocationDto {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string;
}

export interface PostDto {
  id: string;
  type: 'NEWS' | 'ANNOUNCEMENT';
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
  publishedAt: string | null;
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
}

interface ApiSuccessBody {
  success: true;
  data: unknown;
}

interface ApiErrorBody {
  success: false;
  error: { code: string; message: string };
}

function isSuccessBody(body: unknown): body is ApiSuccessBody {
  return typeof body === 'object' && body !== null && (body as { success?: unknown }).success === true && 'data' in body;
}

function isErrorBody(body: unknown): body is ApiErrorBody {
  if (typeof body !== 'object' || body === null) return false;
  const error = (body as { error?: unknown }).error;
  return typeof error === 'object' && error !== null && typeof (error as { message?: unknown }).message === 'string';
}

/** GET {API_BASE_URL}{path}; ném ApiError khi cấu hình thiếu, lỗi mạng, HTTP lỗi hoặc body sai định dạng */
export async function apiGet<T>(path: string): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('VITE_API_BASE_URL chưa được cấu hình', 0, 'API_NOT_CONFIGURED');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { headers: { Accept: 'application/json' } });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(`Phản hồi không phải JSON (HTTP ${response.status})`, response.status, 'INVALID_RESPONSE');
  }

  if (!response.ok || !isSuccessBody(body)) {
    const error = isErrorBody(body) ? body.error : null;
    throw new ApiError(error?.message ?? `HTTP ${response.status}`, response.status, error?.code ?? 'HTTP_ERROR');
  }

  // Dữ liệu được map/kiểm tra ở tầng siteContent trước khi hiển thị
  return body.data as T;
}
