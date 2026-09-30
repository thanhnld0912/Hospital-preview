import React, { Ref } from 'react';
import { StationLocation } from '../types';
import { buildGoogleMapsEmbedUrl } from '../services/maps';

interface LocationListProps {
  locations: StationLocation[];
  selectedId?: string;
  onSelect: (location: StationLocation) => void;
}

/** Danh sách địa điểm; mỗi địa điểm có nút "Xem bản đồ" riêng */
export const LocationList: React.FC<LocationListProps> = ({ locations, selectedId, onSelect }) => {
  return (
    <ul className="mt-0.5 space-y-1.5">
      {locations.map((location) => {
        const isSelected = location.id === selectedId;
        return (
          <li key={location.id} className="text-[#121c2a]">
            <span className="font-semibold">{location.name}:</span> {location.address}
            {location.phone && <span className="block text-[#414755]">Điện thoại: {location.phone}</span>}
            <button
              type="button"
              onClick={() => onSelect(location)}
              aria-pressed={isSelected}
              className="ml-1 inline-flex items-center gap-0.5 font-bold text-[#1c7a42] hover:underline"
            >
              <span className="material-symbols-outlined text-sm">{isSelected ? 'location_on' : 'map'}</span>
              <span>{isSelected ? 'Đang xem' : 'Xem bản đồ'}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

interface LocationMapProps {
  location?: StationLocation;
  className: string;
  ref?: Ref<HTMLDivElement>;
}

/** Bản đồ Google của đúng địa điểm đang chọn (theo địa chỉ hoặc tọa độ đã xác minh của địa điểm đó) */
export const LocationMap: React.FC<LocationMapProps> = ({ location, className, ref }) => {
  return (
    <div ref={ref} className={`${className} relative overflow-hidden bg-[#eef6f0]`}>
      {location && (
        <>
          <iframe
            key={location.id}
            title={`Bản đồ vị trí ${location.name}`}
            src={buildGoogleMapsEmbedUrl(location)}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          {/* Map Card Overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white/95 backdrop-blur-xs p-4 rounded-xl shadow-lg border border-gray-200 max-w-sm">
            <div className="flex items-center gap-1.5 text-[#1c7a42] text-xs font-bold">
              <span className="material-symbols-outlined text-base">pin_drop</span>
              <span>{location.name}</span>
            </div>
            <p className="text-xs text-[#414755] mt-1 leading-relaxed">{location.address}</p>
            <a
              href={location.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#1c7a42] font-semibold hover:underline"
            >
              <span>Mở trong Google Maps</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
};
