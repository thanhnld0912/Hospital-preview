import React, { useState } from 'react';
import { BookingButton } from '../BookingButton';
import { useSiteContent } from '../../services/siteContent';
import { NavTab, MedicalService } from '../../types';

interface ServicesScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenBooking: (serviceName?: string) => void;
  onOpenEmergency: () => void;
}

export const ServicesScreen: React.FC<ServicesScreenProps> = ({
  onNavigate,
  onOpenBooking,
  onOpenEmergency,
}) => {
  const { services } = useSiteContent();
  const [selectedServiceId, setSelectedServiceId] = useState<string>();
  const selectedService: MedicalService | undefined = services.find((s) => s.id === selectedServiceId) ?? services[0];

  return (
    <div className="w-full bg-[#f7faf8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 space-y-10">
        {/* Header Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#414755] mb-2">
            <button onClick={() => onNavigate('trang-chu')} className="hover:text-[#1c7a42]">Trang chủ</button>
            <span>/</span>
            <span className="text-[#1c7a42] font-semibold">Dịch vụ y tế</span>
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#1c7a42] bg-green-50 px-2.5 py-1 rounded-full">
            Chăm sóc ban đầu & Khám BHYT
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121c2a] mt-2">
            Danh mục dịch vụ y tế & Quy trình khám chữa bệnh
          </h1>
          <p className="text-sm text-[#414755] mt-1 max-w-3xl leading-relaxed">
            Các kỹ thuật y tế được thực hiện trực tiếp bởi bác sĩ và cán bộ chuyên môn Trạm Y tế phường An Hải theo phân tuyến kỹ thuật của Bộ Y tế.
          </p>
        </div>

        {/* BHYT Digital Procedure Callout Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-green-200 bg-gradient-to-r from-green-50/60 to-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#1c7a42]">
              <span className="material-symbols-outlined text-2xl">badge</span>
              <h3 className="text-base font-bold">Khám chữa bệnh BHYT qua CCCD gắn chip & VNeID</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#414755] leading-relaxed max-w-2xl">
              Người dân có thẻ BHYT đăng ký ban đầu tại Trạm Y tế phường An Hải hoặc các trạm y tế trên địa bàn TP. Đà Nẵng chỉ cần xuất trình Căn cước công dân gắn chip hoặc ứng dụng VNeID định danh mức 2 để thực hiện thủ tục khám nhanh chóng.
            </p>
          </div>
          <BookingButton
            onOpen={() => onOpenBooking(selectedService?.title)}
            className="px-5 py-2.5 bg-[#1c7a42] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5"
            activeClassName="hover:bg-[#155f33]"
          >
            <span className="material-symbols-outlined text-base">event_available</span>
            <span>Đặt lịch khám</span>
          </BookingButton>
        </div>

        {/* Main Services Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Service Selector List (4 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#414755] px-1">
              Chọn dịch vụ y tế ({services.length})
            </h3>
            {services.map((s) => {
              const isSelected = selectedService?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedServiceId(s.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border flex items-start gap-3 ${
                    isSelected
                      ? 'bg-white border-[#1c7a42] shadow-md ring-2 ring-[#1c7a42]/10'
                      : 'bg-white/80 hover:bg-white border-gray-200 text-[#414755]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#1c7a42] text-white' : 'bg-gray-100 text-[#414755]'
                  }`}>
                    <span className="material-symbols-outlined text-xl">{s.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold ${isSelected ? 'text-[#1c7a42]' : 'text-[#121c2a]'}`}>
                      {s.title}
                    </h4>
                    <p className="text-xs text-[#414755] line-clamp-1 mt-0.5">{s.shortDesc}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">{s.schedule.split('(')[0]}</span>
                      <span className="font-semibold text-[#006c4e]">{s.feeInfo}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Detailed Service View (7 cols) */}
          {selectedService && (
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-gray-200 space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-[#1c7a42] flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">{selectedService.icon}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#1c7a42]">{selectedService.feeInfo}</span>
                    <h2 className="text-xl font-bold text-[#121c2a] mt-0.5">{selectedService.title}</h2>
                  </div>
                </div>
                <BookingButton
                  onOpen={() => onOpenBooking(selectedService?.title)}
                  className="px-4 py-2 bg-[#006c4e] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shrink-0"
                  activeClassName="hover:bg-[#00513a]"
                >
                  <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                  <span>Hẹn khám</span>
                </BookingButton>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs uppercase font-bold text-[#414755] tracking-wider mb-1.5">Mô tả chuyên môn</h3>
                <p className="text-sm text-[#121c2a] leading-relaxed">
                  {selectedService.fullDesc}
                </p>
              </div>

              {/* Target & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#f7faf8] rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-[#1c7a42] block">Thời gian phục vụ:</span>
                  <span className="text-xs text-[#121c2a] mt-1 block">{selectedService.schedule}</span>
                </div>
                <div className="p-3.5 bg-[#f7faf8] rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-[#006c4e] block">Đối tượng áp dụng:</span>
                  <span className="text-xs text-[#121c2a] mt-1 block">{selectedService.targetAudience}</span>
                </div>
              </div>

              {/* Step by step procedure */}
              <div>
                <h3 className="text-xs uppercase font-bold text-[#414755] tracking-wider mb-2.5">
                  Các bước thực hiện thủ tục
                </h3>
                <div className="space-y-2.5">
                  {selectedService.procedure.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#121c2a]">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-[#1c7a42] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency note */}
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between gap-4">
                <div className="text-xs text-red-900">
                  <strong>Trường hợp khẩn cấp:</strong> Nếu bệnh nhân có dấu hiệu mất ý thức hoặc khó thở, vui lòng gọi cấp cứu ngay.
                </div>
                <button
                  onClick={onOpenEmergency}
                  className="px-3 py-1.5 bg-[#bb0112] hover:bg-[#a0010f] text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                >
                  Cấp cứu 24/7
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
