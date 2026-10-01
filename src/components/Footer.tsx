import React from 'react';
import { useSiteContent } from '../services/siteContent';
import { NavTab } from '../types';

interface FooterProps {
  onNavigate: (tab: NavTab) => void;
  onOpenEmergency: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenEmergency }) => {
  const { stationInfo, locations } = useSiteContent();

  return (
    <footer className="w-full bg-[#f7faf8] text-[#414755] border-t border-[#d9eadd] mt-12">
      {/* Blue Emergency Callout Ribbon */}
      <div className="bg-[#1c7a42] text-white py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl shrink-0">local_hospital</span>
            <div>
              <p className="text-base font-bold">Cần hỗ trợ y tế khẩn cấp tại địa bàn phường An Hải?</p>
              <p className="text-xs text-green-100">
                Đội ngũ bác sĩ và nhân viên y tế trạm luôn túc trực hỗ trợ sơ cấp cứu ban đầu và chuyển viện an toàn 24/7.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenEmergency}
            className="bg-white hover:bg-green-50 text-[#1c7a42] px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">call</span>
            <span>Gọi cấp cứu: {stationInfo.hotline}</span>
          </button>
        </div>
      </div>

      {/* 4 Main Institutional Columns */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Column 1: Cơ quan chủ quản */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1c7a42] text-xl">health_and_safety</span>
            <span className="text-xs text-[#121c2a] uppercase font-bold tracking-wider">Cơ quan chủ quản</span>
          </div>
          <p className="text-xs text-[#414755] leading-relaxed">
            {stationInfo.parentAgency}
          </p>
          <p className="text-xs text-[#1c7a42] font-bold mt-1">
            {stationInfo.name}
          </p>
          <div className="text-xs text-[#414755]">
            <p>Địa chỉ:</p>
            <ul className="mt-1 space-y-1">
              {locations.map((location) => (
                <li key={location.id}>
                  <strong className="text-[#121c2a]">{location.name}:</strong> {location.address}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Column 2: Thông tin liên hệ */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1c7a42] text-xl">perm_phone_msg</span>
            <span className="text-xs text-[#121c2a] uppercase font-bold tracking-wider">Thông tin liên hệ</span>
          </div>
          <ul className="flex flex-col gap-1.5 text-xs text-[#414755]">
            <li>
              Điện thoại trực trạm: <strong className="text-[#121c2a]">{stationInfo.hotline}</strong>
            </li>
            <li>
              Đường dây nóng tiêm chủng: <strong className="text-[#121c2a]">{stationInfo.vaccineHotline}</strong>
            </li>
            <li>
              Email công vụ: <strong className="text-[#121c2a]">{stationInfo.email}</strong>
            </li>
            <li>
              Cổng điều hành: <strong className="text-[#121c2a]">{stationInfo.portalUrl}</strong>
            </li>
          </ul>
        </div>

        {/* Column 3: Thời gian làm việc */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1c7a42] text-xl">more_time</span>
            <span className="text-xs text-[#121c2a] uppercase font-bold tracking-wider">Thời gian làm việc</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#d9eadd]">
            <p className="text-xs text-[#121c2a] font-semibold">Khám bệnh hành chính:</p>
            <p className="text-xs text-[#414755]">Thứ 2 - Thứ 6: 07:30 - 17:00</p>
            <p className="text-xs text-[#121c2a] font-semibold mt-1.5">Trực cấp cứu & dịch bệnh:</p>
            <p className="text-xs text-[#006c4e] font-bold">24/7 tất cả các ngày trong tuần</p>
          </div>
        </div>

        {/* Column 4: Lưu ý & Hướng dẫn */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1c7a42] text-xl">policy</span>
            <span className="text-xs text-[#121c2a] uppercase font-bold tracking-wider">Lưu ý & Hướng dẫn</span>
          </div>
          <p className="text-xs text-[#414755] leading-relaxed">
            Người dân khi đến khám chữa bệnh vui lòng mang theo Căn cước công dân gắn chip hoặc ứng dụng VNeID / VssID đã tích hợp thẻ BHYT.
          </p>
          <div className="p-2.5 bg-red-50 rounded-lg text-red-900 text-xs border border-red-100 flex items-start gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#bb0112] shrink-0 mt-0.5">info</span>
            <span>Thông tin trên website được điều hành và cập nhật chính thức bởi Trạm Y tế phường An Hải.</span>
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="bg-[#e3f0e6] py-3 border-t border-[#d9eadd]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-2 text-xs text-[#414755]">
          <p>© 2026 Trạm Y tế phường An Hải – Thành phố Đà Nẵng. Bản quyền thuộc cơ quan y tế địa phương.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <button onClick={() => onNavigate('gioi-thieu')} className="hover:text-[#1c7a42] transition-colors">
              Quy chế hoạt động
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('huong-dan-suc-khoe')} className="hover:text-[#1c7a42] transition-colors">
              Bảo mật dữ liệu công dân
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('lien-he')} className="hover:text-[#1c7a42] transition-colors">
              Sơ đồ trang & Chỉ dẫn
            </button>
            <span>•</span>
            {/* Lối vào trang đăng nhập quản trị (chỉ là liên kết; quyền do backend kiểm tra) */}
            <a href="/admin/login" className="inline-flex items-center gap-1 hover:text-[#1c7a42] transition-colors">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>Đăng nhập quản trị</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
