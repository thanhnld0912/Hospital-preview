import React from 'react';
import { STATION_INFO } from '../data/healthStationData';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-red-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with emergency alert styling */}
        <div className="bg-[#bb0112] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl animate-pulse">e911_emergency</span>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded">Hỗ trợ khẩn cấp 24/7</span>
              <h3 className="text-xl font-bold mt-0.5">Đường dây nóng cấp cứu</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#414755]">
            Trạm Y tế phường An Hải luôn duy trì kíp trực y bác sĩ và phương tiện sơ cấp cứu 24/24 giờ phục vụ người dân trên địa bàn.
          </p>

          {/* Quick Call Action 1: Trực trạm */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase font-bold text-[#bb0112]">Trực ban Trạm Y tế phường An Hải</p>
              <p className="text-xl font-bold text-[#121c2a] mt-0.5">{STATION_INFO.hotline}</p>
              <p className="text-xs text-[#414755]">Sơ cấp cứu tại trạm, xử lý chấn thương, ngộ độc, điều động kíp trực</p>
            </div>
            <a 
              href={`tel:${STATION_INFO.hotline.replace(/[^0-9]/g, '')}`}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#bb0112] hover:bg-[#a0010f] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base">call</span>
              <span>Gọi trạm ngay</span>
            </a>
          </div>

          {/* Quick Call Action 2: 115 */}
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase font-bold text-orange-800">Cấp cứu thành phố Đà Nẵng</p>
              <p className="text-xl font-bold text-[#121c2a] mt-0.5">Số máy khẩn: 115</p>
              <p className="text-xs text-[#414755]">Xe cứu thương chuyên dụng, tai nạn giao thông nghiêm trọng, ngừng tim</p>
            </div>
            <a 
              href="tel:115"
              className="w-full sm:w-auto px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base">ambulance</span>
              <span>Gọi 115</span>
            </a>
          </div>

          {/* Critical Triage Tips while waiting */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="text-xs font-bold text-[#121c2a] uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-sm text-[#1c7a42]">info</span>
              <span>Lưu ý trong khi chờ hỗ trợ y tế:</span>
            </h4>
            <ul className="text-xs text-[#414755] space-y-1.5 list-disc list-inside">
              <li>Đặt nạn nhân nằm chỗ thoáng khí, không tụ tập đông người quanh bệnh nhân.</li>
              <li>Nếu nghi ngờ đột quỵ (méo miệng, yếu tay, nói đớ), ghi nhớ chính xác thời điểm khởi phát.</li>
              <li>Tuyệt đối <strong>không</strong> cạo gió, chích máu đầu ngón tay hay cho uống nước/thuốc khi bệnh nhân li bì, hôn mê.</li>
              <li>Cử một người ra đầu ngõ/trục đường chính để đón xe cấp cứu.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#414755]">
          <span>Địa chỉ trạm: {STATION_INFO.fullAddress}</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
