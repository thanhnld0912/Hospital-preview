import React, { useState } from 'react';
import { STATION_INFO } from '../../data/healthStationData';
import { NavTab, OutbreakReport } from '../../types';

interface ContactScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenEmergency: () => void;
}

export const ContactScreen: React.FC<ContactScreenProps> = ({ onNavigate, onOpenEmergency }) => {
  const [reporterName, setReporterName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('Tổ dân phố 1');
  const [type, setType] = useState<OutbreakReport['type']>('Nước đọng / lăng quăng');
  const [description, setDescription] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !phone.trim() || !description.trim()) return;

    setReportSuccess(true);
    setTimeout(() => {
      setReporterName('');
      setPhone('');
      setAddress('');
      setDescription('');
    }, 1000);
  };

  return (
    <div className="w-full bg-[#f8f9ff] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 space-y-10">
        {/* Header Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#414755] mb-2">
            <button onClick={() => onNavigate('trang-chu')} className="hover:text-[#0057c2]">Trang chủ</button>
            <span>/</span>
            <span className="text-[#0057c2] font-semibold">Liên hệ & Chỉ dẫn</span>
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#0057c2] bg-blue-50 px-2.5 py-1 rounded-full">
            Kênh tiếp nhận ý kiến công dân
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121c2a] mt-2">
            Thông tin liên lạc, Chỉ dẫn đường đi & Phản ánh dịch tễ
          </h1>
          <p className="text-sm text-[#414755] mt-1 max-w-3xl leading-relaxed">
            Mọi phản ánh về dịch bệnh, lăng quăng bọ gậy, chất lượng tiếp đón hoặc yêu cầu tư vấn y tế đều được cán bộ trạm tiếp nhận và xử lý nhanh chóng.
          </p>
        </div>

        {/* Map & Direction Full Block */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Map view (Image) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div 
              className="w-full h-72 sm:h-96 rounded-xl bg-cover bg-center relative overflow-hidden border border-gray-200"
              style={{ backgroundImage: `url('${STATION_INFO.images.map}')` }}
            >
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-4 rounded-xl shadow-lg border border-gray-200 max-w-xs text-xs">
                <p className="font-bold text-[#0057c2] flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">pin_drop</span>
                  <span>Trạm Y tế phường An Hải</span>
                </p>
                <p className="text-gray-600 mt-1">{STATION_INFO.fullAddress}</p>
                <div className="mt-2 text-[11px] text-[#006c4e] font-semibold">
                  Gần cầu Sông Hàn và trung tâm hành chính Sơn Trà
                </div>
              </div>
            </div>

            {/* Transit tips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-blue-50">
                <span className="font-bold text-[#0057c2] block mb-1">Xe máy & Xe đạp:</span>
                <p className="text-[#414755]">Bãi giữ xe miễn phí có mái che ngay trước cổng trạm y tế.</p>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-blue-50">
                <span className="font-bold text-[#006c4e] block mb-1">Ô tô & Taxi:</span>
                <p className="text-[#414755]">Đường Trần Khát Chân thông thoáng, có khu vực dừng đón trả bệnh nhân.</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-50">
                <span className="font-bold text-[#bb0112] block mb-1">Luồng Cấp cứu:</span>
                <p className="text-red-900">Cổng số 2 dành riêng cho xe cứu thương 115 tiếp cận sảnh hồi sức.</p>
              </div>
            </div>
          </div>

          {/* Contact Details List */}
          <div className="lg:col-span-5 bg-[#f8f9ff] p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-[#0057c2] uppercase font-bold tracking-wider">{STATION_INFO.district}</span>
                <h3 className="text-xl font-bold text-[#121c2a] mt-0.5">{STATION_INFO.name}</h3>
                <p className="text-xs text-[#414755] mt-1">{STATION_INFO.fullAddress}</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-[#414755] block">Đường dây nóng cấp cứu (24/7):</span>
                  <a href={`tel:${STATION_INFO.hotline}`} className="text-base font-bold text-[#bb0112] block mt-0.5 hover:underline">
                    {STATION_INFO.hotline}
                  </a>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-[#414755] block">Tư vấn tiêm chủng mở rộng:</span>
                  <span className="text-sm font-bold text-[#006c4e] block mt-0.5">{STATION_INFO.vaccineHotline}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-[#414755] block">Hòm thư điện tử công vụ:</span>
                  <span className="font-semibold text-[#121c2a] block mt-0.5">{STATION_INFO.email}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-[#414755] block">Giờ khám bệnh hành chính:</span>
                  <span className="font-semibold text-[#121c2a] block mt-0.5">Sáng 07:30 - 11:30 | Chiều 13:30 - 17:00 (Thứ 2 - Thứ 6)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-gray-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={onOpenEmergency}
                className="w-full py-2.5 bg-[#bb0112] hover:bg-[#a0010f] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">call</span>
                <span>Gọi trực ban cấp cứu ngay</span>
              </button>
            </div>
          </div>
        </div>

        {/* Citizen Epidemic / Outbreak Feedback Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-gray-200 space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs uppercase font-bold text-[#0057c2] tracking-wider">Hợp tác cộng đồng</span>
            <h2 className="text-xl font-bold text-[#121c2a] mt-0.5">
              Báo cáo điểm nguy cơ dịch bệnh & Ý kiến đóng góp của người dân
            </h2>
            <p className="text-xs sm:text-sm text-[#414755] mt-1 leading-relaxed">
              Nếu phát hiện ổ lăng quăng bọ gậy đọng nước tại bãi đất trống, ca bệnh sốt xuất huyết trong tổ dân phố, hoặc có góp ý nâng cao chất lượng phục vụ, xin gửi thông tin về Trạm Y tế:
            </p>
          </div>

          {reportSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-[#006c4e] text-white rounded-full mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">check</span>
              </div>
              <h3 className="text-lg font-bold text-[#121c2a]">Cảm ơn ý kiến phản ánh của bạn!</h3>
              <p className="text-xs text-[#414755] max-w-md mx-auto">
                Cán bộ Đội y tế cơ động Trạm Y tế phường An Hải sẽ xác minh hiện trường và xử lý trong vòng 24 giờ làm việc.
              </p>
              <button
                onClick={() => setReportSuccess(false)}
                className="px-4 py-2 bg-[#006c4e] text-white rounded-xl text-xs font-bold"
              >
                Gửi phản ánh khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#121c2a] mb-1">
                  Họ và tên người phản ánh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Thị Mai"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0057c2]"
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
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0057c2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121c2a] mb-1">
                  Tổ dân phố tại phường An Hải
                </label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0057c2] bg-white"
                >
                  {Array.from({ length: 15 }, (_, i) => (
                    <option key={i + 1} value={`Tổ dân phố ${i + 1}`}>Tổ dân phố {i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121c2a] mb-1">
                  Vấn đề cần phản ánh <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as OutbreakReport['type'])}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0057c2] bg-white"
                >
                  <option value="Nước đọng / lăng quăng">Nước đọng / Ổ bọ gậy, lăng quăng</option>
                  <option value="Sốt xuất huyết">Nghi ngờ ca mắc Sốt xuất huyết</option>
                  <option value="Tay chân miệng">Nghi ngờ ca mắc Tay chân miệng</option>
                  <option value="Vệ sinh an toàn thực phẩm">An toàn vệ sinh thực phẩm</option>
                  <option value="Khác">Góp ý chất lượng dịch vụ trạm</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#121c2a] mb-1">
                  Địa chỉ cụ thể hoặc điểm mốc
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lô đất trống cạnh số 34 đường Hà Bổng..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0057c2]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#121c2a] mb-1">
                  Mô tả chi tiết nội dung phản ánh <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mô tả cụ thể về hiện trạng, tình hình dịch bệnh hoặc ý kiến đóng góp của người dân..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0057c2]"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0057c2] hover:bg-[#004398] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  <span>Gửi phản ánh cho Trạm Y tế</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
