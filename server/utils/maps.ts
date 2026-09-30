// Thành phố được thêm vào truy vấn để Google Maps tìm đúng khu vực (địa chỉ gốc giữ nguyên)
const CITY = 'Đà Nẵng';

interface MappableLocation {
  address: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * URL Google Maps riêng cho từng địa điểm: dùng tọa độ khi đã được xác minh,
 * nếu không thì tìm theo chính địa chỉ của địa điểm (không tự đoán tọa độ).
 */
export function buildGoogleMapsSearchUrl(location: MappableLocation): string {
  const query =
    location.latitude !== null && location.longitude !== null
      ? `${location.latitude},${location.longitude}`
      : `${location.address}, ${CITY}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
