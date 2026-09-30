import React, { useRef, useState } from 'react';
import { NavTab, MedicalService, Announcement, NewsArticle, HealthGuide, StationLocation } from '../../types';
import { HEALTH_GUIDES } from '../../data/healthStationData';
import { useSiteContent } from '../../services/siteContent';
import { LocationList, LocationMap } from '../Locations';

interface HomeScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenBooking: (serviceName?: string) => void;
  onOpenEmergency: () => void;
  onOpenArticle: (type: 'announcement' | 'news' | 'guide', item: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenBooking,
  onOpenEmergency,
  onOpenArticle,
}) => {
  const { stationInfo, locations, services, announcements, news } = useSiteContent();
  const [selectedLocationId, setSelectedLocationId] = useState<string>();
  const selectedLocation = locations.find((location) => location.id === selectedLocationId) ?? locations[0];
  const mapRef = useRef<HTMLDivElement>(null);

  const handleSelectLocation = (location: StationLocation) => {
    setSelectedLocationId(location.id);
    // Trên mobile bản đồ nằm dưới/trên danh sách: cuộn tới bản đồ vừa cập nhật
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: HERO & EMERGENCY CALLOUT */}
      <section className="w-full bg-[#eef6f0] py-6 sm:py-10 border-b border-[#d9eadd]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {/* High Priority Emergency Alert Pill */}
          <div className="mb-6 bg-[#bb0112] text-white p-3 sm:px-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-white animate-pulse shrink-0">emergency</span>
              <div className="text-xs sm:text-sm">
                <span className="font-bold tracking-wide mr-1.5">ĐƯỜNG DÂY NÓNG KHẨN CẤP:</span>
                <span className="font-bold underline cursor-pointer" onClick={onOpenEmergency}>
                  Cấp cứu / Trực ban trạm: {stationInfo.hotline}
                </span>
                <span className="hidden md:inline opacity-90 ml-2">— Phục vụ 24/7 đối với sơ cấp cứu ban đầu</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenEmergency}
              className="bg-white text-[#bb0112] px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors shrink-0 shadow-2xs"
            >
              Gọi cấp cứu ngay
            </button>
          </div>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Hero Text Column */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 bg-[#d4ecdb] text-[#155f33] rounded-full text-xs font-bold uppercase tracking-wide">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>Y tế cơ sở phục vụ nhân dân</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1c7a42] tracking-tight font-extrabold leading-tight">
                  {stationInfo.name}
                </h1>
                <p className="text-base sm:text-lg text-[#006c4e] font-semibold mt-1">
                  Chăm sóc sức khỏe cộng đồng – Đồng hành cùng người dân
                </p>
              </div>

              <p className="text-sm sm:text-base text-[#414755] leading-relaxed">
                Trạm Y tế phường An Hải cung cấp các hoạt động chăm sóc sức khỏe ban đầu, phòng bệnh, tư vấn sức khỏe và các chương trình y tế cộng đồng phục vụ người dân trên địa bàn.
              </p>

              {/* Core Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('dich-vu-y-te')}
                  className="h-11 px-5 bg-[#1c7a42] hover:bg-[#155f33] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <span className="material-symbols-outlined text-lg">medical_services</span>
                  <span>Xem dịch vụ y tế</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenBooking()}
                  className="h-11 px-5 bg-[#006c4e] hover:bg-[#00513a] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <span className="material-symbols-outlined text-lg">event_available</span>
                  <span>Đặt lịch khám online</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('lien-he')}
                  className="h-11 px-4 bg-white hover:bg-gray-100 text-[#1c7a42] rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border border-[#a6d3b4] shadow-2xs"
                >
                  <span className="material-symbols-outlined text-lg">pin_drop</span>
                  <span>Vị trí trạm</span>
                </button>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-[#414755] text-xs">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#006c4e] text-base">check_circle</span>
                  Thân thiện & Tận tâm
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#006c4e] text-base">check_circle</span>
                  Đạt chuẩn Y tế Quốc gia
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#006c4e] text-base">check_circle</span>
                  Vì sức khỏe cộng đồng
                </span>
              </div>
            </div>

            {/* Hero Photo Visual (Image 1) */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#c3cbc5]/50 bg-white">
                <img
                  src={stationInfo.images.hero}
                  alt="Cán bộ nhân viên y tế Trạm Y tế phường An Hải khám và tư vấn sức khỏe"
                  className="w-full h-[320px] sm:h-[390px] object-cover"
                />
                {/* Atmospheric gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-[#006c4e] text-white px-2 py-0.5 rounded text-[11px] font-bold">
                      Cơ sở An Hải
                    </span>
                    <span className="text-xs text-gray-200">
                      Tuyến y tế phường An Hải, TP. Đà Nẵng
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-white drop-shadow-xs">
                    Tiếp đón chu đáo - Tận tình hướng dẫn quy trình khám chữa bệnh
                  </p>
                </div>
              </div>

              {/* Floating Accent pill */}
              <div className="hidden sm:flex absolute -bottom-3 -right-3 bg-white p-3 rounded-xl shadow-lg border border-gray-200 items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#77fac7] flex items-center justify-center text-[#00513a]">
                  <span className="material-symbols-outlined text-xl">health_and_safety</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#121c2a]">Khám BHYT Cơ sở</p>
                  <p className="text-[11px] text-[#414755]">Áp dụng VNeID & CCCD gắn chip</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: QUICK INFORMATION BAR (4 Priority Blocks) */}
      <section className="w-full bg-white shadow-2xs border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Block 1: Địa chỉ */}
            <div className="bg-[#eef6f0] p-4 rounded-xl flex flex-col justify-between hover:bg-[#e3f0e6] transition-colors border border-green-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-[#1c7a42] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">location_on</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#414755] uppercase font-bold tracking-wider">Địa chỉ Trạm</span>
                  <p className="text-sm text-[#121c2a] font-bold mt-0.5">Số 127 Nguyễn Trung Trực</p>
                  <p className="text-xs text-[#414755]">Phường An Hải, TP. Đà Nẵng</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('lien-he')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1c7a42] hover:underline"
              >
                <span>Chỉ đường đến trạm</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Block 2: Liên hệ */}
            <div className="bg-[#eef6f0] p-4 rounded-xl flex flex-col justify-between hover:bg-[#e3f0e6] transition-colors border border-green-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#006c4e] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">call</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#414755] uppercase font-bold tracking-wider">Điện thoại liên hệ</span>
                  <p className="text-sm text-[#121c2a] font-bold mt-0.5">{stationInfo.hotline}</p>
                  <p className="text-xs text-[#414755]">Đường dây nóng hỗ trợ người dân</p>
                </div>
              </div>
              <button
                onClick={onOpenEmergency}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#006c4e] hover:underline"
              >
                <span>Gọi ngay cho trạm</span>
                <span className="material-symbols-outlined text-sm">phone_in_talk</span>
              </button>
            </div>

            {/* Block 3: Giờ làm việc */}
            <div className="bg-[#eef6f0] p-4 rounded-xl flex flex-col justify-between hover:bg-[#e3f0e6] transition-colors border border-green-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-200 text-[#1c7a42] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">schedule</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#414755] uppercase font-bold tracking-wider">Giờ làm việc</span>
                  <p className="text-sm text-[#121c2a] font-bold mt-0.5">07:30 - 17:00</p>
                  <p className="text-xs text-[#414755]">Sáng: 07:30 - 11:30 | Chiều: 13:30 - 17:00</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#bb0112]">
                <span className="w-2 h-2 rounded-full bg-[#bb0112] inline-block animate-ping"></span>
                <span>Cấp cứu trực ban: 24/7</span>
              </div>
            </div>

            {/* Block 4: Lịch hoạt động */}
            <div className="bg-[#eef6f0] p-4 rounded-xl flex flex-col justify-between hover:bg-[#e3f0e6] transition-colors border border-green-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-200 text-[#006c4e] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">calendar_month</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#414755] uppercase font-bold tracking-wider">Lịch công tác tuần</span>
                  <p className="text-sm text-[#121c2a] font-bold mt-0.5">Tiêm chủng & Khám BHYT</p>
                  <p className="text-xs text-[#414755]">Đang phục vụ số: AH-024</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('thong-bao')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1c7a42] hover:underline"
              >
                <span>Xem lịch chi tiết</span>
                <span className="material-symbols-outlined text-sm">event_note</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: QUICK ACCESS (Thông tin dành cho người dân) */}
      <section className="w-full py-10 bg-[#f7faf8]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
            <div>
              <span className="text-xs text-[#1c7a42] uppercase font-bold tracking-wider">Tiện ích phục vụ</span>
              <h2 className="text-xl sm:text-2xl text-[#121c2a] font-bold mt-0.5">Thông tin dành cho người dân</h2>
              <p className="text-xs sm:text-sm text-[#414755]">Truy cập nhanh các mục thông tin và thủ tục y tế thường ngày tại phường</p>
            </div>
            <span className="text-xs text-[#414755] font-medium">6 danh mục tiếp cận nhanh</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Dịch vụ y tế */}
            <div 
              onClick={() => onNavigate('dich-vu-y-te')}
              className="group bg-white p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#d4ecdb] flex items-center justify-center text-[#1c7a42] group-hover:bg-[#1c7a42] group-hover:text-white transition-colors mb-4">
                  <span className="material-symbols-outlined text-2xl">stethoscope</span>
                </div>
                <h3 className="text-base text-[#121c2a] font-bold group-hover:text-[#1c7a42] transition-colors">Dịch vụ y tế</h3>
                <p className="text-xs text-[#414755] mt-1.5 leading-relaxed">
                  Thông tin các dịch vụ khám chữa bệnh sơ cấp cứu, khám bảo hiểm y tế cơ sở và chăm sóc phục hồi.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[#1c7a42] text-xs font-bold">
                <span>Tra cứu dịch vụ</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">chevron_right</span>
              </div>
            </div>

            {/* Card 2: Tiêm chủng */}
            <div 
              onClick={() => onNavigate('tiem-chung')}
              className="group bg-white p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#77fac7] flex items-center justify-center text-[#006c4e] group-hover:bg-[#006c4e] group-hover:text-white transition-colors mb-4">
                  <span className="material-symbols-outlined text-2xl">vaccines</span>
                </div>
                <h3 className="text-base text-[#121c2a] font-bold group-hover:text-[#006c4e] transition-colors">Tiêm chủng mở rộng</h3>
                <p className="text-xs text-[#414755] mt-1.5 leading-relaxed">
                  Lịch tiêm mở rộng, vắc xin định kỳ cho trẻ sơ sinh, trẻ nhỏ và phụ nữ mang thai trên địa bàn.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[#006c4e] text-xs font-bold">
                <span>Lịch tiêm chủng</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">chevron_right</span>
              </div>
            </div>

            {/* Card 3: Thông báo */}
            <div 
              onClick={() => onNavigate('thong-bao')}
              className="group bg-white p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#ffdad6] flex items-center justify-center text-[#bb0112] group-hover:bg-[#bb0112] group-hover:text-white transition-colors mb-4">
                  <span className="material-symbols-outlined text-2xl">campaign</span>
                </div>
                <h3 className="text-base text-[#121c2a] font-bold group-hover:text-[#bb0112] transition-colors">Thông báo y tế</h3>
                <p className="text-xs text-[#414755] mt-1.5 leading-relaxed">
                  Thông báo mới nhất từ Sở Y tế TP. Đà Nẵng, UBND phường An Hải và điều phối của trạm.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[#bb0112] text-xs font-bold">
                <span>Xem thông báo</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">chevron_right</span>
              </div>
            </div>

            {/* Card 4: Tin tức */}
            <div 
              onClick={() => onNavigate('tin-tuc-va-hoat-dong')}
              className="group bg-white p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#d9eadd] flex items-center justify-center text-[#1c7a42] group-hover:bg-[#1c7a42] group-hover:text-white transition-colors mb-4">
                  <span className="material-symbols-outlined text-2xl">newspaper</span>
                </div>
                <h3 className="text-base text-[#121c2a] font-bold group-hover:text-[#1c7a42] transition-colors">Tin tức & Hoạt động</h3>
                <p className="text-xs text-[#414755] mt-1.5 leading-relaxed">
                  Hoạt động truyền thông phòng dịch, y tế học đường, an toàn thực phẩm và vệ sinh môi trường khu dân cư.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[#1c7a42] text-xs font-bold">
                <span>Đọc tin tức</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">chevron_right</span>
              </div>
            </div>

            {/* Card 5: Hướng dẫn sức khỏe */}
            <div 
              onClick={() => onNavigate('huong-dan-suc-khoe')}
              className="group bg-white p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#77fac7]/40 flex items-center justify-center text-[#006c4e] group-hover:bg-[#006c4e] group-hover:text-white transition-colors mb-4">
                  <span className="material-symbols-outlined text-2xl">health_and_safety</span>
                </div>
                <h3 className="text-base text-[#121c2a] font-bold group-hover:text-[#006c4e] transition-colors">Hướng dẫn sức khỏe</h3>
                <p className="text-xs text-[#414755] mt-1.5 leading-relaxed">
                  Cẩm nang phòng chống sốt xuất huyết, cúm mùa, chăm sóc người cao tuổi và dinh dưỡng hợp lý.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[#006c4e] text-xs font-bold">
                <span>Xem cẩm nang</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">chevron_right</span>
              </div>
            </div>

            {/* Card 6: Đường đi & Chỉ dẫn */}
            <div 
              onClick={() => onNavigate('lien-he')}
              className="group bg-white p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#d8e8dc] flex items-center justify-center text-[#1c7a42] group-hover:bg-[#1c7a42] group-hover:text-white transition-colors mb-4">
                  <span className="material-symbols-outlined text-2xl">alt_route</span>
                </div>
                <h3 className="text-base text-[#121c2a] font-bold group-hover:text-[#1c7a42] transition-colors">Đường đi & Chỉ dẫn</h3>
                <p className="text-xs text-[#414755] mt-1.5 leading-relaxed">
                  Sơ đồ định vị, lộ trình phương tiện giao thông và hướng dẫn tiếp đón công dân tại trạm.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[#1c7a42] text-xs font-bold">
                <span>Xem sơ đồ</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ABOUT AN HẢI HEALTH STATION (Giới thiệu 2 cột) */}
      <section className="w-full py-12 bg-[#eef6f0] border-t border-b border-[#d9eadd]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Accreditation & Visual Overview */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex-1">
                <span className="text-xs text-[#006c4e] uppercase font-bold tracking-wider">Tổ chức đơn vị</span>
                <h3 className="text-lg text-[#121c2a] font-bold mt-1">Cơ cấu & Đội ngũ chuyên môn</h3>
                <p className="text-xs text-[#414755] mt-2 leading-relaxed">
                  Trạm Y tế phường An Hải hoạt động trực thuộc Ủy ban Nhân dân phường An Hải, thực hiện quy chế chuyên môn ngành Y tế theo đúng chỉ đạo của Sở Y tế TP. Đà Nẵng.
                </p>

                <div className="mt-4 space-y-2">
                  <div className="p-2.5 bg-[#eef6f0] rounded-xl flex items-center justify-between text-xs">
                    <span className="text-[#414755]">Trưởng Trạm Y tế:</span>
                    <span className="font-bold text-[#1c7a42]">Bs.CKI. Tuấn Thọ Sinh</span>
                  </div>
                  <div className="p-2.5 bg-[#eef6f0] rounded-xl flex items-center justify-between text-xs">
                    <span className="text-[#414755]">Phụ trách Tiêm chủng & Dịch vụ:</span>
                    <span className="font-bold text-[#1c7a42]">Ys. Nguyễn Thị Lan</span>
                  </div>
                  <div className="p-2.5 bg-[#eef6f0] rounded-xl flex items-center justify-between text-xs">
                    <span className="text-[#414755]">Bộ phận Hành chính & BHYT:</span>
                    <span className="font-bold text-[#1c7a42]">NHS. Trần Thị Thu Thảo</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-[#006c4e] font-semibold">
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Đạt tiêu chí Quốc gia về Y tế xã/phường giai đoạn đến 2030</span>
                </div>
              </div>

              <div className="p-5 bg-[#1c7a42] text-white rounded-2xl flex items-center gap-4 shadow-xs">
                <span className="material-symbols-outlined text-4xl shrink-0">diversity_1</span>
                <div>
                  <p className="text-sm font-bold">Gắn kết cộng đồng địa phương</p>
                  <p className="text-xs text-green-100 mt-0.5 leading-relaxed">
                    Phối hợp chặt chẽ với Tổ dân phố, Hội Phụ nữ và Đoàn Thanh niên phường trong công tác chăm sóc sức khỏe ban đầu.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Official Roles & Directives */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs text-[#1c7a42] uppercase font-bold tracking-wider">Giới thiệu tổng quan</span>
                <h2 className="text-xl sm:text-2xl text-[#121c2a] font-bold mt-1">
                  Chức năng & Nhiệm vụ của Trạm Y tế
                </h2>
              </div>

              <div className="space-y-3.5">
                {/* Chức năng */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5 text-[#1c7a42]">
                    <span className="material-symbols-outlined text-lg">assignment</span>
                    <h3 className="text-sm sm:text-base font-bold text-[#121c2a]">Chức năng</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#414755] leading-relaxed">
                    Là cơ sở y tế ban đầu của mạng lưới y tế công lập, có chức năng cung cấp, thực hiện các dịch vụ chăm sóc sức khỏe ban đầu cho nhân dân trên địa bàn phường An Hải theo quy định của pháp luật.
                  </p>
                </div>

                {/* Nhiệm vụ */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5 text-[#006c4e]">
                    <span className="material-symbols-outlined text-lg">task_alt</span>
                    <h3 className="text-sm sm:text-base font-bold text-[#121c2a]">Nhiệm vụ trọng tâm</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#414755] leading-relaxed">
                    Thực hiện sơ cứu, cấp cứu thông thường; khám bệnh, chữa bệnh thông thường theo phân tuyến kỹ thuật; tiêm chủng mở rộng; chăm sóc sức khỏe sinh sản và kế hoạch hóa gia đình; phòng chống bệnh truyền nhiễm và bệnh mạn tính không lây.
                  </p>
                </div>

                {/* Vai trò trong cộng đồng */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5 text-gray-700">
                    <span className="material-symbols-outlined text-lg">groups</span>
                    <h3 className="text-sm sm:text-base font-bold text-[#121c2a]">Vai trò trong cộng đồng dân cư</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#414755] leading-relaxed">
                    Làm cầu nối quản lý hồ sơ sức khỏe điện tử công dân, giám sát dịch bệnh chủ động tại cơ sở, nâng cao nhận thức vệ sinh phòng bệnh và đảm bảo mọi người dân đều được tiếp cận dịch vụ y tế công bằng, thuận tiện.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('gioi-thieu')}
                  className="h-11 px-6 bg-[#d9eadd] hover:bg-[#cbe0d1] text-[#121c2a] rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">info</span>
                  <span>Xem thông tin đầy đủ về Trạm & Cơ cấu tổ chức</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: MEDICAL SERVICES GRID (Dịch vụ y tế) */}
      <section className="w-full py-12 bg-white" id="dich-vu">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs text-[#1c7a42] uppercase font-bold tracking-wider">Phục vụ nhân dân</span>
            <h2 className="text-xl sm:text-2xl text-[#121c2a] font-bold mt-1">Danh mục dịch vụ y tế tại Trạm</h2>
            <p className="text-xs sm:text-sm text-[#414755] mt-1.5">
              Các dịch vụ được thực hiện bởi cán bộ chuyên môn theo đúng danh mục phân tuyến kỹ thuật của Bộ Y tế
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#f7faf8] p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      service.colorScheme === 'secondary'
                        ? 'bg-[#77fac7] text-[#006c4e]'
                        : service.colorScheme === 'tertiary'
                        ? 'bg-[#ffdad6] text-[#bb0112]'
                        : 'bg-[#d4ecdb] text-[#1c7a42]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">{service.icon}</span>
                  </div>
                  <h3 className="text-base text-[#121c2a] font-bold">{service.title}</h3>
                  <p className="text-xs text-[#414755] mt-2 leading-relaxed">
                    {service.shortDesc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs">
                  <span className="text-[#414755]">{service.schedule.split('(')[0]}</span>
                  <span className={`font-semibold ${
                    service.colorScheme === 'secondary'
                      ? 'text-[#006c4e]'
                      : service.colorScheme === 'tertiary'
                      ? 'text-[#bb0112]'
                      : 'text-[#1c7a42]'
                  }`}>
                    {service.feeInfo}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate('dich-vu-y-te')}
              className="px-6 py-2.5 bg-[#eef6f0] hover:bg-[#d4ecdb] text-[#1c7a42] border border-[#a6d3b4] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <span>Xem chi tiết quy trình khám BHYT & kỹ thuật chuyên môn</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 6: VACCINATION SPOTLIGHT (Tiêm chủng) */}
      <section className="w-full py-12 bg-[#eef6f0] border-t border-b border-[#d9eadd]" id="tiem-chung">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {/* Headline banner */}
          <div className="bg-[#1c7a42] text-white p-6 sm:p-8 rounded-2xl mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded text-xs font-bold uppercase mb-2">
                <span className="material-symbols-outlined text-sm">shield</span>
                <span>Chương trình Tiêm chủng Quốc gia</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Chủ động phòng bệnh – Bảo vệ sức khỏe cộng đồng</h2>
              <p className="text-xs sm:text-sm text-green-100 mt-1.5 leading-relaxed">
                Trạm Y tế phường An Hải tổ chức các buổi tiêm chủng đảm bảo an toàn tuyệt đối, tuân thủ nghiêm ngặt quy trình tiếp đón - khám sàng lọc - tiêm và theo dõi sau tiêm.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('tiem-chung')}
              className="h-11 px-5 bg-white text-[#1c7a42] hover:bg-green-50 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shrink-0 shadow-xs"
            >
              <span className="material-symbols-outlined text-lg">search</span>
              <span>Tra cứu lịch tiêm chủng chi tiết</span>
            </button>
          </div>

          {/* 3 Key Vaccination Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 text-[#1c7a42]">
                  <span className="material-symbols-outlined text-2xl">event_available</span>
                  <span className="text-xs uppercase font-bold tracking-wider">Lịch định kỳ</span>
                </div>
                <h3 className="text-base text-[#121c2a] font-bold">Lịch tiêm mở rộng định kỳ</h3>
                <p className="text-xs text-[#414755] mt-1.5">
                  Thực hiện vào các ngày cố định hàng tháng do Trạm Y tế công bố.
                </p>
                <div className="mt-4 p-3 bg-[#eef6f0] rounded-xl space-y-1.5 text-xs text-[#121c2a]">
                  <p><strong>Thời gian:</strong> Ngày 05 & 20 hàng tháng</p>
                  <p><strong>Buổi sáng:</strong> 07:30 - 11:00</p>
                  <p><strong>Địa điểm:</strong> Phòng tiêm chủng Trạm Y tế</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-[#006c4e] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">check</span>
                <span>Vắc xin được bảo quản đúng chuẩn GSP</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 text-[#006c4e]">
                  <span className="material-symbols-outlined text-2xl">family_restroom</span>
                  <span className="text-xs uppercase font-bold tracking-wider">Đối tượng</span>
                </div>
                <h3 className="text-base text-[#121c2a] font-bold">Đối tượng ưu tiên phục vụ</h3>
                <p className="text-xs text-[#414755] mt-1.5">
                  Bảo đảm quyền lợi phòng bệnh cho mọi người dân trong độ tuổi tiêm chủng trên địa bàn.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-[#414755]">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#006c4e] text-sm shrink-0 mt-0.5">done</span>
                    <span>Trẻ sơ sinh và trẻ nhỏ dưới 1 tuổi (Lao, Viêm gan B, 5 trong 1, Bại liệt, Sởi)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#006c4e] text-sm shrink-0 mt-0.5">done</span>
                    <span>Trẻ từ 18 - 24 tháng (Bạch hầu - Ho gà - Uốn ván, Sởi - Rubella)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#006c4e] text-sm shrink-0 mt-0.5">done</span>
                    <span>Phụ nữ trong độ tuổi sinh đẻ và phụ nữ đang mang thai (Uốn ván)</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-[#1c7a42] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">info</span>
                <span>Vui lòng mang theo Sổ tiêm chủng</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 text-[#bb0112]">
                  <span className="material-symbols-outlined text-2xl">health_metrics</span>
                  <span className="text-xs uppercase font-bold tracking-wider">Quy trình</span>
                </div>
                <h3 className="text-base text-[#121c2a] font-bold">Quy trình & Theo dõi sau tiêm</h3>
                <p className="text-xs text-[#414755] mt-1.5">
                  Bốn bước khép kín bảo đảm an toàn sinh mạng tuyệt đối cho người tiêm chủng.
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#121c2a]">
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center font-bold text-[11px] text-[#1c7a42] shrink-0">1</span>
                    <span>Tiếp đón, kiểm tra sổ & hồ sơ tiêm</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#121c2a]">
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center font-bold text-[11px] text-[#1c7a42] shrink-0">2</span>
                    <span>Bác sĩ khám sàng lọc & tư vấn chỉ định</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#121c2a]">
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center font-bold text-[11px] text-[#1c7a42] shrink-0">3</span>
                    <span>Thực hiện tiêm đúng kỹ thuật chuyên môn</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#bb0112] font-bold">
                    <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center font-bold text-[11px] text-[#bb0112] shrink-0">4</span>
                    <span>Theo dõi tại trạm tối thiểu 30 phút</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-[#414755]">
                <span>Tiếp tục theo dõi tại nhà trong vòng 24 - 48 giờ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: ANNOUNCEMENTS & LOCAL NEWS */}
      <section className="w-full py-12 bg-white" id="thong-bao">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Thông báo mới nhất (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#bb0112] uppercase font-bold tracking-wider">Thông tin chính thức</span>
                  <h2 className="text-lg sm:text-xl text-[#121c2a] font-bold">Thông báo mới nhất</h2>
                </div>
                <button
                  onClick={() => onNavigate('thong-bao')}
                  className="text-xs text-[#1c7a42] font-bold hover:underline"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    onClick={() => onOpenArticle('announcement', announcement)}
                    className="bg-[#f7faf8] p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        announcement.tagColor === 'tertiary'
                          ? 'bg-red-100 text-[#bb0112]'
                          : announcement.tagColor === 'secondary'
                          ? 'bg-emerald-100 text-[#006c4e]'
                          : 'bg-green-100 text-[#1c7a42]'
                      }`}>
                        {announcement.tag}
                      </span>
                      <span className="text-xs text-[#414755] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        {announcement.date}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#121c2a] hover:text-[#1c7a42] transition-colors line-clamp-2">
                      {announcement.title}
                    </h3>
                    <p className="text-xs text-[#414755] mt-1 line-clamp-2">
                      {announcement.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Tin tức & Hoạt động (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4" id="tin-tuc">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#1c7a42] uppercase font-bold tracking-wider">Đời sống y tế địa phương</span>
                  <h2 className="text-lg sm:text-xl text-[#121c2a] font-bold">Tin tức & Hoạt động</h2>
                </div>
                <button
                  onClick={() => onNavigate('tin-tuc-va-hoat-dong')}
                  className="text-xs text-[#1c7a42] font-bold hover:underline"
                >
                  Chuyên mục tin tức
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {news.map((article) => (
                  <article
                    key={article.id}
                    onClick={() => onOpenArticle('news', article)}
                    className="group bg-[#f7faf8] rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex flex-col cursor-pointer"
                  >
                    <div className="h-32 bg-gray-200 overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-[#414755] mb-1">
                          <span className={`font-semibold ${
                            article.categoryColor === 'secondary'
                              ? 'text-[#006c4e]'
                              : article.categoryColor === 'tertiary'
                              ? 'text-[#bb0112]'
                              : 'text-[#1c7a42]'
                          }`}>
                            {article.category}
                          </span>
                          <span>{article.date}</span>
                        </div>
                        <h3 className="text-xs font-bold text-[#121c2a] line-clamp-2 group-hover:text-[#1c7a42] transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-[11px] text-[#414755] line-clamp-2 mt-1">
                          {article.summary}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-200/60 text-[11px] text-[#1c7a42] font-bold flex items-center gap-0.5">
                        <span>Đọc tiếp</span>
                        <span>→</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: HEALTH EDUCATION & ADVICE */}
      <section className="w-full py-12 bg-[#eef6f0] border-t border-b border-[#d9eadd]" id="goc-suc-khoe">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs text-[#006c4e] uppercase font-bold tracking-wider">Cẩm nang hướng dẫn</span>
            <h2 className="text-xl sm:text-2xl text-[#121c2a] font-bold mt-1">Góc sức khỏe cộng đồng</h2>
            <p className="text-xs sm:text-sm text-[#414755] mt-1.5">
              Những kiến thức y học thường thức thiết thực giúp từng gia đình chủ động phòng chống dịch bệnh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {HEALTH_GUIDES.map((guide) => (
              <div
                key={guide.id}
                onClick={() => onOpenArticle('guide', guide)}
                className={`p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer border ${
                  guide.colorScheme === 'tertiary'
                    ? 'bg-red-50/70 border-red-100'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      guide.colorScheme === 'tertiary'
                        ? 'bg-[#bb0112] text-white'
                        : guide.colorScheme === 'secondary'
                        ? 'bg-emerald-100 text-[#006c4e]'
                        : 'bg-green-100 text-[#1c7a42]'
                    }`}
                  >
                    <span className="material-symbols-outlined">{guide.icon}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#121c2a]">{guide.title}</h3>
                  <p className="text-xs text-[#414755] mt-1.5 leading-relaxed">
                    {guide.summary}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-gray-100 flex items-center gap-1 text-xs font-bold">
                  <span className={guide.colorScheme === 'tertiary' ? 'text-[#bb0112]' : 'text-[#1c7a42]'}>
                    Đọc hướng dẫn chi tiết
                  </span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: LOCATION & CONTACT OVERVIEW */}
      <section className="w-full py-12 bg-white" id="lien-he">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs text-[#1c7a42] uppercase font-bold tracking-wider">Thông tin liên lạc</span>
            <h2 className="text-xl sm:text-2xl text-[#121c2a] font-bold mt-1">Tìm Trạm Y tế phường An Hải</h2>
            <p className="text-xs sm:text-sm text-[#414755] mt-1.5">
              Địa chỉ cơ sở hành chính, số điện thoại trực ban và bản đồ định vị phục vụ người dân đến thăm khám
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Panel: Direct Contact Details */}
            <div className="lg:col-span-5 bg-[#f7faf8] p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-[#1c7a42] font-bold uppercase tracking-wider">{stationInfo.district}</span>
                  <h3 className="text-lg text-[#121c2a] font-bold">{stationInfo.name}</h3>
                  <p className="text-xs text-[#414755]">{stationInfo.city}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-[#414755] block">Địa chỉ các cơ sở:</span>
                    <LocationList locations={locations} selectedId={selectedLocation?.id} onSelect={handleSelectLocation} />
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-[#414755] block">Đường dây nóng / Trực ban:</span>
                    <span className="font-bold text-[#1c7a42] text-sm mt-0.5 block">{stationInfo.hotline}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100">
                    <span className="text-[#414755] block">Giờ khám bệnh hành chính:</span>
                    <span className="font-semibold text-[#121c2a] mt-0.5 block">07:30 - 11:30 | 13:30 - 17:00 (Thứ 2 - Thứ 6)</span>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-red-700 block font-semibold">Trực cấp cứu ban đầu:</span>
                    <span className="font-bold text-[#bb0112] mt-0.5 block">24/7 (Cả Thứ Bảy, Chủ Nhật và Ngày Lễ)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-200 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={onOpenEmergency}
                  className="flex-1 h-11 bg-[#1c7a42] hover:bg-[#155f33] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  <span>Gọi điện cho trạm</span>
                </button>
                <a
                  href={selectedLocation?.mapUrl ?? 'https://www.google.com/maps'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-11 bg-white hover:bg-gray-100 text-[#121c2a] border border-gray-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">directions</span>
                  <span>Chỉ đường trên bản đồ</span>
                </a>
              </div>
            </div>

            {/* Right Panel: Map View (bản đồ của địa điểm đang chọn) */}
            <div className="lg:col-span-7 bg-[#f7faf8] p-2 rounded-2xl border border-gray-100 flex flex-col">
              <LocationMap
                ref={mapRef}
                location={selectedLocation}
                className="w-full h-80 lg:h-full min-h-[360px] rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
