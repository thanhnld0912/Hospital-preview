import React, { useState } from 'react';
import { VACCINE_CATALOG } from '../../data/healthStationData';
import { NavTab } from '../../types';

interface VaccinationScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenBooking: (serviceName?: string) => void;
}

export const VaccinationScreen: React.FC<VaccinationScreenProps> = ({
  onNavigate,
  onOpenBooking,
}) => {
  const [filterAge, setFilterAge] = useState<string>('all');
  const [babyDob, setBabyDob] = useState<string>('');
  const [calculatedAgeMonths, setCalculatedAgeMonths] = useState<number | null>(null);

  const filterOptions = [
    { id: 'all', label: 'Tất cả vắc xin' },
    { id: 'newborn', label: 'Trẻ sơ sinh' },
    { id: '2-4months', label: '2 - 4 tháng' },
    { id: '9months', label: '9 tháng' },
    { id: '12-24months', label: '12 - 24 tháng' },
    { id: 'pregnant', label: 'Phụ nữ mang thai' },
  ];

  const filteredVaccines = VACCINE_CATALOG.filter((v) => {
    if (filterAge === 'all') return true;
    if (filterAge === 'newborn') return v.id === 'bcg' || v.id === 'hep-b-birth';
    if (filterAge === '2-4months') return v.id === '5-in-1' || v.id === 'polio-opv-ipv';
    if (filterAge === '9months') return v.id === 'measles-single' || v.id === 'polio-opv-ipv';
    if (filterAge === '12-24months') return v.id === 'mr-combined' || v.id === 'dpt-booster' || v.id === 'je-encephalitis';
    if (filterAge === 'pregnant') return v.id === 'tetanus-pregnant';
    return true;
  });

  const handleCalculateAge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyDob) return;
    const dob = new Date(babyDob);
    const today = new Date();
    const diffMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    setCalculatedAgeMonths(Math.max(0, diffMonths));
  };

  return (
    <div className="w-full bg-[#f7faf8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 space-y-10">
        {/* Header Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#414755] mb-2">
            <button onClick={() => onNavigate('trang-chu')} className="hover:text-[#1c7a42]">Trang chủ</button>
            <span>/</span>
            <span className="text-[#006c4e] font-semibold">Tiêm chủng mở rộng</span>
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#006c4e] bg-emerald-50 px-2.5 py-1 rounded-full">
            Chương trình Tiêm chủng Quốc gia
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121c2a] mt-2">
            Lịch tiêm chủng & Danh mục Vắc xin mở rộng
          </h1>
          <p className="text-sm text-[#414755] mt-1 max-w-3xl leading-relaxed">
            100% vắc xin trong chương trình Tiêm chủng mở rộng tại Trạm Y tế phường An Hải được Nhà nước cấp miễn phí hoàn toàn và bảo quản nghiêm ngặt theo chuẩn GSP.
          </p>
        </div>

        {/* Schedule Announcement Highlight */}
        <div className="bg-[#006c4e] text-white p-6 sm:p-8 rounded-2xl shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Lịch tiêm định kỳ tháng 10/2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Ngày 05 & Ngày 20 hàng tháng</h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              • Đợt 1 (Ngày 05): Tiêm vắc xin 5 trong 1, Bại liệt OPV/IPV cho trẻ dưới 1 tuổi.<br />
              • Đợt 2 (Ngày 20): Tiêm vắc xin Sởi, Sởi-Rubella, Viêm não Nhật Bản và tiêm vét cho các bé hoãn đợt 1.<br />
              • Thời gian tiếp đón: Buổi sáng từ 07:30 đến 11:00.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <button
              onClick={() => onOpenBooking('Tiêm chủng mở rộng quốc gia')}
              className="px-5 py-3 bg-white hover:bg-emerald-50 text-[#006c4e] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">event_available</span>
              <span>Đăng ký hẹn giờ tiêm cho bé</span>
            </button>
            <p className="text-[11px] text-emerald-200 text-center">
              Đặt giờ trước giúp phụ huynh không phải chờ đợi
            </p>
          </div>
        </div>

        {/* Interactive Baby Age Due Calculator */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-emerald-200 space-y-4">
          <div className="flex items-center gap-2 text-[#006c4e]">
            <span className="material-symbols-outlined text-2xl">calculate</span>
            <h3 className="text-base font-bold">Tra cứu mũi tiêm đến hạn theo ngày sinh của bé</h3>
          </div>
          <p className="text-xs text-[#414755]">
            Nhập ngày sinh của con để xem những loại vắc xin bé cần tiêm trong giai đoạn hiện tại:
          </p>

          <form onSubmit={handleCalculateAge} className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              required
              value={babyDob}
              onChange={(e) => setBabyDob(e.target.value)}
              className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006c4e] bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#006c4e] hover:bg-[#00513a] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Kiểm tra lịch tiêm
            </button>
            {calculatedAgeMonths !== null && (
              <span className="text-xs font-semibold text-[#006c4e] bg-emerald-50 px-3 py-2 rounded-xl">
                Bé hiện tại khoảng <strong>{calculatedAgeMonths} tháng tuổi</strong>
              </span>
            )}
          </form>

          {calculatedAgeMonths !== null && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs space-y-1.5 text-emerald-950">
              <p className="font-bold text-sm text-[#006c4e]">Gợi ý mũi tiêm phù hợp cho bé:</p>
              {calculatedAgeMonths === 0 && <p>• Cần tiêm: Vắc xin Lao (BCG) và Viêm gan B trong tháng đầu sau sinh.</p>}
              {calculatedAgeMonths >= 2 && calculatedAgeMonths <= 4 && (
                <p>• Cần tiêm: Vắc xin 5 trong 1 (Bạch hầu - Ho gà - Uốn ván - Viêm gan B - Hib) và uống vắc xin Bại liệt OPV liều 1, 2 hoặc 3.</p>
              )}
              {calculatedAgeMonths >= 5 && calculatedAgeMonths < 9 && (
                <p>• Cần tiêm: Vắc xin Bại liệt tiêm (IPV) lúc 5 tháng tuổi. Kiểm tra lại các mũi tiêm thiếu.</p>
              )}
              {calculatedAgeMonths >= 9 && calculatedAgeMonths < 12 && (
                <p>• Cần tiêm: Mũi vắc xin Sởi đơn bắt buộc lúc 9 tháng tuổi.</p>
              )}
              {calculatedAgeMonths >= 12 && calculatedAgeMonths < 18 && (
                <p>• Cần tiêm: Vắc xin Viêm não Nhật Bản (mũi 1 và mũi 2 cách nhau 1-2 tuần).</p>
              )}
              {calculatedAgeMonths >= 18 && (
                <p>• Cần tiêm: Vắc xin Sởi - Rubella (MR) và vắc xin DPT mũi 4 nhắc lại lúc 18-24 tháng tuổi.</p>
              )}
            </div>
          )}
        </div>

        {/* Filter Tabs for Vaccine Catalog */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilterAge(opt.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterAge === opt.id
                    ? 'bg-[#006c4e] text-white shadow-xs'
                    : 'bg-white hover:bg-gray-100 text-[#414755] border border-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Vaccine Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVaccines.map((v) => (
              <div
                key={v.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-[#006c4e] bg-emerald-50 px-2 py-0.5 rounded">
                      {v.isNationalProgram ? 'Miễn phí TCMR' : 'Dịch vụ'}
                    </span>
                    <span className="text-xs font-bold text-[#1c7a42]">{v.recommendedAge}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#121c2a]">{v.name}</h3>
                  <p className="text-xs font-semibold text-[#006c4e] mt-1">{v.diseaseTarget}</p>
                  
                  <div className="mt-3 p-2.5 bg-[#f7faf8] rounded-xl text-xs space-y-1">
                    <p className="text-[#414755]"><strong>Liều lượng:</strong> {v.dosage}</p>
                    <p className="text-[#414755]"><strong>Lưu ý:</strong> {v.notes}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Chuẩn bảo quản GSP</span>
                  <button
                    onClick={() => onOpenBooking(`Tiêm chủng: ${v.name}`)}
                    className="text-[#006c4e] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Hẹn lịch tiêm</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4-Step Safety Flow reminder */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
          <h3 className="text-base font-bold text-[#121c2a] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1c7a42]">verified</span>
            <span>Quy trình 4 bước tiêm chủng an toàn tại Trạm Y tế phường An Hải</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#eef6f0] rounded-xl border border-green-50">
              <div className="w-7 h-7 rounded-full bg-[#1c7a42] text-white flex items-center justify-center font-bold text-xs mb-2">1</div>
              <h4 className="text-xs font-bold text-[#121c2a]">Tiếp đón & Đối chiếu sổ</h4>
              <p className="text-xs text-[#414755] mt-1">Kiểm tra lịch sử tiêm chủng, cân nặng và nhiệt độ ban đầu của bé.</p>
            </div>
            <div className="p-4 bg-[#eef6f0] rounded-xl border border-green-50">
              <div className="w-7 h-7 rounded-full bg-[#1c7a42] text-white flex items-center justify-center font-bold text-xs mb-2">2</div>
              <h4 className="text-xs font-bold text-[#121c2a]">Khám sàng lọc trước tiêm</h4>
              <p className="text-xs text-[#414755] mt-1">Bác sĩ nghe tim phổi, kiểm tra họng và xác định bé đủ điều kiện tiêm.</p>
            </div>
            <div className="p-4 bg-[#eef6f0] rounded-xl border border-green-50">
              <div className="w-7 h-7 rounded-full bg-[#1c7a42] text-white flex items-center justify-center font-bold text-xs mb-2">3</div>
              <h4 className="text-xs font-bold text-[#121c2a]">Tiêm đúng kỹ thuật chuyên môn</h4>
              <p className="text-xs text-[#414755] mt-1">Nhân viên y tế thực hiện đúng nguyên tắc "3 kiểm tra, 5 đối chiếu".</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="w-7 h-7 rounded-full bg-[#bb0112] text-white flex items-center justify-center font-bold text-xs mb-2">4</div>
              <h4 className="text-xs font-bold text-red-900">Theo dõi 30 phút tại trạm</h4>
              <p className="text-xs text-red-800 mt-1">Quan sát nhịp thở, sắc mặt và hướng dẫn phụ huynh theo dõi 48h tại nhà.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
