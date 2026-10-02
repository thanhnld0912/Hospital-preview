import React from 'react';
import { STATION_INFO } from '../../data/healthStationData';
import { BookingButton } from '../BookingButton';
import { useSiteContent } from '../../services/siteContent';
import { NavTab } from '../../types';

// Biểu tượng & màu của thẻ thiết bị lặp lại theo thứ tự (giữ thiết kế cũ; nội dung do quản trị nhập)
const FACILITY_ICONS = [
  { icon: 'ecg_heart', color: 'text-[#1c7a42]' },
  { icon: 'water_drop', color: 'text-[#006c4e]' },
  { icon: 'vaccines', color: 'text-[#bb0112]' },
  { icon: 'emergency', color: 'text-purple-600' },
];

interface AboutScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenBooking: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate, onOpenBooking }) => {
  // Nhân sự và tiêu đề section lấy từ API (quản trị cập nhật), dự phòng dữ liệu tĩnh khi API lỗi
  const { staff, stationInfo, facilitySection, qualitySection } = useSiteContent();
  const { staffSection } = stationInfo;

  return (
    <div className="w-full bg-[#f7faf8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 space-y-10">
        {/* Breadcrumb & Title */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#414755] mb-2">
            <button onClick={() => onNavigate('trang-chu')} className="hover:text-[#1c7a42]">Trang chủ</button>
            <span>/</span>
            <span className="text-[#1c7a42] font-semibold">Giới thiệu trạm</span>
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#006c4e] bg-emerald-50 px-2.5 py-1 rounded-full">
            Cơ quan y tế cơ sở
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121c2a] mt-2">
            Giới thiệu chung về Trạm Y tế phường An Hải
          </h1>
          <p className="text-sm text-[#414755] mt-1 max-w-3xl leading-relaxed">
            Đơn vị y tế công lập tuyến đầu trực thuộc Ủy ban Nhân dân phường An Hải, phục vụ chăm sóc và bảo vệ sức khỏe cho nhân dân địa phương.
          </p>
        </div>

        {/* Hero Banner with Doctor Consultation Photo */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xl font-bold text-[#1c7a42]">
              Sứ mệnh đồng hành vì sức khỏe cộng đồng
            </h2>
            <p className="text-sm text-[#414755] leading-relaxed">
              Trạm Y tế phường An Hải nằm trên địa bàn phường An Hải, TP. Đà Nẵng. Với nhiệm vụ là "người gác cổng" của hệ thống y tế, trạm đảm nhiệm vai trò tiếp nhận khám chữa bệnh ban đầu, quản lý bệnh không lây nhiễm, tiêm chủng mở rộng và phòng chống dịch bệnh tại địa bàn dân cư.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#eef6f0] rounded-xl text-center">
                <span className="text-2xl font-bold text-[#1c7a42] block font-mono">100%</span>
                <span className="text-xs text-[#414755]">Tổ dân phố phủ sóng</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center">
                <span className="text-2xl font-bold text-[#006c4e] block font-mono">12+</span>
                <span className="text-xs text-[#414755]">Cán bộ y tế & CTV</span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-center col-span-2 sm:col-span-1">
                <span className="text-2xl font-bold text-[#bb0112] block font-mono">24/7</span>
                <span className="text-xs text-[#414755]">Trực cấp cứu</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 rounded-xl overflow-hidden shadow-md">
            <img 
              src={STATION_INFO.images.hero} 
              alt="Đội ngũ bác sĩ và nhân viên y tế tại Trạm Y tế An Hải" 
              className="w-full h-64 object-cover"
            />
          </div>
        </div>

        {/* Section: Medical Staff & Leadership */}
        <div className="space-y-4">
          <div>
            <span className="text-xs uppercase font-bold text-[#1c7a42] tracking-wider">{staffSection.label}</span>
            <h2 className="text-xl font-bold text-[#121c2a] mt-0.5">{staffSection.title}</h2>
            {staffSection.description && <p className="text-xs text-[#414755]">{staffSection.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {staff.map((member) => {
              // Chức danh viết tắt + họ tên, ví dụ "Bs.CKI. Tuấn Thọ Sinh"
              const displayName = [member.title, member.fullName].filter(Boolean).join(' ');
              return (
                <div key={member.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={displayName}
                          className="w-12 h-12 rounded-full object-cover shrink-0 bg-green-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-green-100 text-[#1c7a42] flex items-center justify-center font-bold text-lg">
                          {displayName.slice(0, 1)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-[#121c2a]">{displayName}</h3>
                        <p className="text-xs font-semibold text-[#1c7a42]">{member.position}</p>
                        {member.department && <p className="text-[11px] text-gray-500">{member.department}</p>}
                      </div>
                    </div>
                    {member.bio && (
                      <p className="text-xs text-[#414755] leading-relaxed border-t border-gray-100 pt-3">
                        {member.bio}
                      </p>
                    )}
                  </div>
                  {member.qualification && (
                    <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Trình độ:</span>
                      <span className="font-semibold text-gray-700">{member.qualification}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Facilities & Medical Equipment — nội dung do quản trị chỉnh sửa (Thông tin website) */}
        {facilitySection && (
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase font-bold text-[#006c4e] tracking-wider">{facilitySection.label}</span>
                <h2 className="text-xl font-bold text-[#121c2a] mt-0.5">{facilitySection.title}</h2>
                {facilitySection.description && (
                  <p className="text-xs text-[#414755] whitespace-pre-line">{facilitySection.description}</p>
                )}
              </div>
              <BookingButton
                onOpen={onOpenBooking}
                className="px-4 py-2 bg-[#1c7a42] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 self-start"
                activeClassName="hover:bg-[#155f33]"
              >
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                <span>Đặt lịch khám bệnh</span>
              </BookingButton>
            </div>

            {facilitySection.items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {facilitySection.items.map((item, index) => {
                  const { icon, color } = FACILITY_ICONS[index % FACILITY_ICONS.length];
                  return (
                    <div key={index} className="p-4 bg-[#f7faf8] rounded-xl border border-green-50">
                      <span className={`material-symbols-outlined text-2xl ${color} mb-1`}>{icon}</span>
                      <h4 className="text-sm font-bold text-[#121c2a]">{item.title}</h4>
                      {item.description && <p className="text-xs text-[#414755] mt-1">{item.description}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Section: National Health Criteria Evaluation — nội dung do quản trị chỉnh sửa (Thông tin website) */}
        {qualitySection && (
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-[#1c7a42] tracking-wider">{qualitySection.label}</span>
              <h2 className="text-xl font-bold text-[#121c2a] mt-0.5">{qualitySection.title}</h2>
              {qualitySection.description && (
                <p className="text-xs text-[#414755] whitespace-pre-line">{qualitySection.description}</p>
              )}
            </div>

            {qualitySection.items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {qualitySection.items.map((c, index) => (
                  <div key={index} className="p-3 bg-[#f7faf8] rounded-xl border border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-[#1c7a42] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-xs text-[#121c2a] font-medium">{c.title}</span>
                    </div>
                    {c.score && (
                      <span className="text-xs font-mono font-bold text-[#006c4e] bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                        {c.score}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
