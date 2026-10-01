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
  updatedAt: string;
}

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
