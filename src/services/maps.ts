import { StationLocation } from '../types';

// Thành phố được thêm vào truy vấn để Google Maps tìm đúng khu vực (địa chỉ gốc giữ nguyên)
const CITY = 'Đà Nẵng';

type MappableLocation = Pick<StationLocation, 'address' | 'latitude' | 'longitude'>;

/** Truy vấn riêng của từng địa điểm: tọa độ đã xác minh, hoặc chính địa chỉ của địa điểm đó */
function locationQuery(location: MappableLocation): string {
  return location.latitude !== null && location.longitude !== null
    ? `${location.latitude},${location.longitude}`
    : `${location.address}, ${CITY}`;
}

/** Mở Google Maps tìm đúng địa điểm (cùng quy tắc với server/utils/maps.ts) */
export function buildGoogleMapsSearchUrl(location: MappableLocation): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery(location))}`;
}

/** Bản đồ Google nhúng (iframe, không cần API key) cho một địa điểm */
export function buildGoogleMapsEmbedUrl(location: MappableLocation): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery(location))}&z=16&output=embed`;
}
