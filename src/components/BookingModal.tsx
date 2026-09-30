import React, { useState } from 'react';
import { AppointmentRecord } from '../types';
import { MEDICAL_SERVICES, STATION_INFO } from '../data/healthStationData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, defaultService }) => {
  const [citizenName, setCitizenName] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState(defaultService || MEDICAL_SERVICES[0].title);
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('07:30 - 08:30 (Sáng)');
  const [symptomsOrNotes, setSymptomsOrNotes] = useState('');
  const [submittedBooking, setSubmittedBooking] = useState<AppointmentRecord | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !phone.trim()) return;

    const newBooking: AppointmentRecord = {
      id: `AH-${Math.floor(1000 + Math.random() * 9000)}`,
      citizenName,
      citizenId: citizenId || 'Đã liên kết VNeID',
      phone,
      serviceType,
      preferredDate,
      timeSlot,
      symptomsOrNotes,
      status: 'Đã xác nhận',
      createdAt: new Date().toLocaleDateString('vi-VN')
    };

    // Store in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('anhai_appointments') || '[]');
      existing.unshift(newBooking);
      localStorage.setItem('anhai_appointments', JSON.stringify(existing.slice(0, 10)));
    } catch {
      // ignore
    }

    setSubmittedBooking(newBooking);
  };

  const handleReset = () => {
    setSubmittedBooking(null);
    setCitizenName('');
    setCitizenId('');
    setPhone('');
    setSymptomsOrNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-green-100 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#1c7a42] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-2xl">event_available</span>
            <div>
              <h3 className="text-lg font-bold">Đặt lịch hẹn khám / Tiêm chủng</h3>
              <p className="text-xs text-green-100">Trạm Y tế phường An Hải, TP. Đà Nẵng</p>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {submittedBooking ? (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-[#006c4e] rounded-full mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#006c4e] bg-emerald-50 px-2.5 py-1 rounded-full">
                  Đặt lịch thành công
                </span>
                <h4 className="text-xl font-bold text-[#121c2a] mt-2">Phiếu hẹn khám điện tử</h4>
                <p className="text-xs text-[#414755] mt-1">
                  Vui lòng lưu lại mã số thứ tự hoặc chụp màn hình để xuất trình tại bàn tiếp đón.
                </p>
              </div>

              {/* Ticket Card */}
              <div className="p-5 bg-[#eef6f0] border-2 border-dashed border-[#a6d3b4] rounded-xl text-left space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-green-200">
                  <span className="text-xs font-semibold text-[#414755]">Mã số thứ tự khám:</span>
                  <span className="text-xl font-mono font-bold text-[#1c7a42]">{submittedBooking.id}</span>
                </div>
                <div className="text-xs text-[#414755] space-y-1">
                  <p><strong>Người khám:</strong> {submittedBooking.citizenName}</p>
                  <p><strong>Số điện thoại:</strong> {submittedBooking.phone}</p>
                  <p><strong>Dịch vụ:</strong> {submittedBooking.serviceType}</p>
                  <p><strong>Ngày hẹn:</strong> {submittedBooking.preferredDate}</p>
                  <p><strong>Khung giờ:</strong> {submittedBooking.timeSlot}</p>
                  <p><strong>Địa điểm:</strong> Bàn tiếp đón - {STATION_INFO.fullAddress}</p>
                </div>
                <div className="pt-2 border-t border-green-200 flex items-center gap-1.5 text-xs text-[#006c4e] font-semibold">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Đã ghi nhận trên hệ thống tiếp nhận của Trạm</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  <span>In phiếu hẹn</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2 px-3 bg-[#1c7a42] hover:bg-[#155f33] text-white rounded-xl text-xs font-semibold"
                >
                  Xong
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <p className="text-xs text-[#414755]">
                Đăng ký trước giúp nhân viên y tế chuẩn bị hồ sơ bệnh án, chuẩn bị vắc xin và giảm thiểu thời gian chờ đợi của bà con.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#121c2a] mb-1">
                  Họ và tên người khám / tiêm chủng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#121c2a] mb-1">
                    Số CCCD / Mã định danh
                  </label>
                  <input
                    type="text"
                    placeholder="12 chữ số CCCD (tùy chọn)"
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#121c2a] mb-1">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0905 xxx xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121c2a] mb-1">
                  Nhu cầu dịch vụ y tế <span className="text-red-500">*</span>
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42] bg-white"
                >
                  {MEDICAL_SERVICES.map((s) => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                  <option value="Khám sức khỏe Người cao tuổi">Khám sức khỏe Người cao tuổi</option>
                  <option value="Cấp phát thuốc BHYT định kỳ">Cấp phát thuốc BHYT định kỳ</option>
                  <option value="Tư vấn dinh dưỡng và chăm sóc thai nghén">Tư vấn dinh dưỡng và chăm sóc thai nghén</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#121c2a] mb-1">
                    Ngày hẹn dự kiến <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#121c2a] mb-1">
                    Khung giờ tiếp nhận
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42] bg-white"
                  >
                    <option value="07:30 - 08:30 (Sáng)">07:30 - 08:30 (Sáng)</option>
                    <option value="08:30 - 09:30 (Sáng)">08:30 - 09:30 (Sáng)</option>
                    <option value="09:30 - 10:30 (Sáng)">09:30 - 10:30 (Sáng)</option>
                    <option value="13:30 - 14:30 (Chiều)">13:30 - 14:30 (Chiều)</option>
                    <option value="14:30 - 16:00 (Chiều)">14:30 - 16:00 (Chiều)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121c2a] mb-1">
                  Triệu chứng hoặc ghi chú cho y bác sĩ
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Đo huyết áp định kỳ, bé tiêm mũi 5 trong 1 lần thứ 2..."
                  value={symptomsOrNotes}
                  onChange={(e) => setSymptomsOrNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#414755] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1c7a42] hover:bg-[#155f33] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                  <span>Xác nhận đặt lịch hẹn</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
