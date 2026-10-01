import { useEffect, useState } from 'react';
import { ANNOUNCEMENTS, MEDICAL_SERVICES, NEWS_ARTICLES, STAFF_PROFILES, STATION_INFO } from '../data/healthStationData';
import { Announcement, MedicalService, NewsArticle, StaffProfile, StationLocation } from '../types';
import { API_BASE_URL, apiGet, LocationDto, PostDto, PublicStaffDto, ServiceDto, SiteSettingsDto } from './api';
import { buildGoogleMapsSearchUrl } from './maps';

export type StationInfo = typeof STATION_INFO;

export interface SiteContent {
  stationInfo: StationInfo;
  locations: StationLocation[];
  services: MedicalService[];
  announcements: Announcement[];
  news: NewsArticle[];
  staff: StaffProfile[];
}

// ---------------------------------------------------------------------------
// Dữ liệu dự phòng: dữ liệu tĩnh hiện tại, dùng khi backend chưa chạy hoặc API lỗi
// ---------------------------------------------------------------------------
const FALLBACK_LOCATIONS: StationLocation[] = STATION_INFO.locations.map((location, index) => ({
  id: `fallback-location-${index + 1}`,
  name: location.name,
  address: location.address,
  phone: null,
  latitude: null,
  longitude: null,
  mapUrl: buildGoogleMapsSearchUrl({ address: location.address, latitude: null, longitude: null }),
}));

const FALLBACK_CONTENT: SiteContent = {
  stationInfo: STATION_INFO,
  locations: FALLBACK_LOCATIONS,
  services: MEDICAL_SERVICES,
  announcements: ANNOUNCEMENTS,
  news: NEWS_ARTICLES,
  staff: STAFF_PROFILES,
};

// ---------------------------------------------------------------------------
// Map dữ liệu API -> kiểu dữ liệu giao diện đang dùng (giữ nguyên UI)
// ---------------------------------------------------------------------------
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
});

function formatDate(iso: string | null): string {
  return iso ? dateFormatter.format(new Date(iso)) : '';
}

function mapLocations(dtos: LocationDto[]): StationLocation[] {
  return dtos.map((dto) => ({
    id: dto.id,
    name: dto.name,
    address: dto.address,
    phone: dto.phone,
    latitude: dto.latitude,
    longitude: dto.longitude,
    mapUrl: dto.mapUrl || buildGoogleMapsSearchUrl(dto),
  }));
}

function mapServices(dtos: ServiceDto[]): MedicalService[] {
  return dtos.map((dto) => ({
    id: dto.slug,
    title: dto.title,
    icon: dto.icon ?? 'medical_services',
    colorScheme: dto.colorScheme,
    shortDesc: dto.shortDescription ?? '',
    fullDesc: dto.description,
    schedule: dto.schedule ?? '',
    feeInfo: dto.feeInfo ?? '',
    targetAudience: dto.targetAudience ?? '',
    procedure: dto.procedure,
    notes: dto.notes ?? undefined,
  }));
}

function mapAnnouncement(dto: PostDto): Announcement {
  return {
    id: dto.slug,
    title: dto.title,
    tag: dto.category ?? 'Thông báo',
    tagColor: dto.colorScheme,
    date: formatDate(dto.publishedAt),
    isUrgent: dto.isUrgent,
    summary: dto.excerpt ?? '',
    content: dto.content,
    issuedBy: dto.issuedBy ?? '',
  };
}

function mapNews(dto: PostDto): NewsArticle {
  return {
    id: dto.slug,
    title: dto.title,
    category: dto.category ?? 'Tin tức',
    categoryColor: dto.colorScheme,
    date: formatDate(dto.publishedAt),
    imageUrl: dto.thumbnailUrl ?? '',
    imageAlt: dto.thumbnailAlt ?? dto.title,
    summary: dto.excerpt ?? '',
    // Nội dung lưu dạng văn bản, mỗi đoạn cách nhau một dòng trống
    content: dto.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
    author: dto.author ?? '',
  };
}

function mergeStationInfo(settings: SiteSettingsDto | null, locations: StationLocation[]): StationInfo {
  return {
    ...STATION_INFO,
    ...(settings && {
      name: settings.siteName,
      parentAgency: `Trực thuộc ${settings.managingUnit}`,
      managingUnit: settings.managingUnit,
      hotline: settings.phone,
      email: settings.email ?? STATION_INFO.email,
      logoUrl: settings.logoUrl ?? STATION_INFO.logoUrl,
      staffSection: {
        label: settings.staffSectionLabel,
        title: settings.staffSectionTitle,
        description: settings.staffSectionDescription,
      },
    }),
    // Địa chỉ chính = địa điểm đầu tiên theo thứ tự sắp xếp
    fullAddress: locations[0]?.address ?? STATION_INFO.fullAddress,
    locations: locations.map(({ name, address }) => ({ name, address })),
  };
}

// ---------------------------------------------------------------------------
// Tải dữ liệu: API được ưu tiên; phần nào lỗi thì log rõ và dùng dữ liệu dự phòng phần đó
// ---------------------------------------------------------------------------
async function fetchOrFallback<D, T>(label: string, path: string, fallback: T, map: (data: D) => T): Promise<T> {
  try {
    return map(await apiGet<D>(path));
  } catch (error) {
    console.error(`[API] Không tải được ${label} (${API_BASE_URL}${path}) — đang hiển thị dữ liệu tĩnh dự phòng.`, error);
    return fallback;
  }
}

async function loadSiteContent(): Promise<SiteContent> {
  if (!API_BASE_URL) {
    console.warn('[API] VITE_API_BASE_URL chưa được cấu hình — website đang hiển thị dữ liệu tĩnh dự phòng.');
    return FALLBACK_CONTENT;
  }

  const [settings, locations, services, posts, staff] = await Promise.all([
    fetchOrFallback('cấu hình website', '/site-settings', null, (dto: SiteSettingsDto): SiteSettingsDto | null => dto),
    fetchOrFallback('danh sách địa điểm', '/locations', FALLBACK_LOCATIONS, mapLocations),
    fetchOrFallback('danh sách dịch vụ', '/services', MEDICAL_SERVICES, mapServices),
    fetchOrFallback('tin tức & thông báo', '/posts?limit=100', null, (dtos: PostDto[]): PostDto[] | null => dtos),
    fetchOrFallback('nhân sự chuyên môn', '/staff', STAFF_PROFILES, (dtos: PublicStaffDto[]): StaffProfile[] => dtos),
  ]);

  return {
    stationInfo: mergeStationInfo(settings, locations),
    locations,
    services,
    announcements: posts ? posts.filter((post) => post.type === 'ANNOUNCEMENT').map(mapAnnouncement) : ANNOUNCEMENTS,
    news: posts ? posts.filter((post) => post.type === 'NEWS').map(mapNews) : NEWS_ARTICLES,
    staff,
  };
}

// Tải một lần cho toàn bộ ứng dụng, các component dùng chung kết quả
let cachedContent: SiteContent | null = null;
let pendingContent: Promise<SiteContent> | null = null;

function getSiteContent(): Promise<SiteContent> {
  pendingContent ??= loadSiteContent().then((content) => {
    cachedContent = content;
    return content;
  });
  return pendingContent;
}

/**
 * Tải nội dung trước lần render đầu tiên (main.tsx) để website hiển thị ngay dữ liệu mới nhất
 * từ API, không hiện thoáng qua dữ liệu tĩnh. Không bao giờ reject: lỗi đã được log và dùng dự phòng.
 */
export function preloadSiteContent(): Promise<SiteContent> {
  return getSiteContent();
}

/** Nội dung website: dữ liệu API (đã tải trước); dữ liệu dự phòng chỉ khi API lỗi/chưa cấu hình */
export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(() => cachedContent ?? FALLBACK_CONTENT);

  useEffect(() => {
    if (cachedContent) return;
    let active = true;
    getSiteContent().then((loaded) => {
      if (active) setContent(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  return content;
}
