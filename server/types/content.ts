export const COLOR_SCHEMES = ['primary', 'secondary', 'tertiary'] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

export const POST_TYPES = ['NEWS', 'ANNOUNCEMENT'] as const;
export type PostType = (typeof POST_TYPES)[number];

export const POST_STATUSES = ['DRAFT', 'PUBLISHED'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

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
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Lịch trực cấp cứu
// ---------------------------------------------------------------------------
export const DUTY_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'SHIFT_CHANGED', 'SUSPENDED'] as const;
export type DutyStatus = (typeof DUTY_STATUSES)[number];

export interface DutyStaffRef {
  id: string;
  fullName: string;
  title: string | null;
  isActive: boolean;
}

/** Bản đầy đủ cho trang quản trị */
export interface DutyScheduleDto {
  id: string;
  dutyDate: string; // YYYY-MM-DD
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

/** Bản công khai: chỉ tên/chức danh nhân sự và trạng thái */
export interface PublicDutyScheduleDto {
  id: string;
  dutyDate: string;
  doctor: { fullName: string; title: string | null };
  responsible: { fullName: string; title: string | null } | null;
  nurse: { fullName: string; title: string | null } | null;
  note: string | null;
  status: DutyStatus;
}

/** Nhân sự chuyên môn — bản đầy đủ cho trang quản trị */
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

/** Nhân sự chuyên môn — bản công khai: chỉ các trường hiển thị trên website */
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
  mapUrl: string;
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
