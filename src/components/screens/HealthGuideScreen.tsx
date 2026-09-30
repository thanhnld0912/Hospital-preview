import React, { useState } from 'react';
import { HEALTH_GUIDES } from '../../data/healthStationData';
import { NavTab, HealthGuide } from '../../types';

interface HealthGuideScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenArticle: (type: 'announcement' | 'news' | 'guide', item: any) => void;
  onOpenEmergency: () => void;
}

export const HealthGuideScreen: React.FC<HealthGuideScreenProps> = ({
  onNavigate,
  onOpenArticle,
  onOpenEmergency,
}) => {
  // BMI & Blood pressure state
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [assessmentResult, setAssessmentResult] = useState<{
    bmi: number | null;
    bmiStatus: string;
    bpStatus: string;
    recommendation: string;
  } | null>(null);

  const handleCalculateHealth = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);

    let bmiVal: number | null = null;
    let bmiText = '';
    if (w > 0 && h > 0) {
      bmiVal = parseFloat((w / (h * h)).toFixed(1));
      if (bmiVal < 18.5) bmiText = 'Thiếu cân (gầy)';
      else if (bmiVal < 23) bmiText = 'Bình thường (chuẩn người châu Á)';
      else if (bmiVal < 25) bmiText = 'Thừa cân / Tiền béo phì';
      else bmiText = 'Béo phì độ I hoặc II';
    }

    let bpText = 'Chưa nhập số đo huyết áp';
    let advice = 'Nên duy trì tập thể dục 30 phút mỗi ngày và uống đủ 2 lít nước.';

    if (sys && dia) {
      if (sys < 120 && dia < 80) {
        bpText = 'Huyết áp tối ưu (< 120/80 mmHg)';
        advice = 'Chỉ số huyết áp rất tốt! Hãy tiếp tục duy trì chế độ ăn nhạt và lối sống năng động.';
      } else if (sys <= 129 && dia < 85) {
        bpText = 'Huyết áp bình thường (120-129 / 80-84 mmHg)';
        advice = 'Chỉ số ở mức bình thường. Khám kiểm tra định kỳ mỗi 6 tháng tại Trạm Y tế.';
      } else if (sys <= 139 || dia <= 89) {
        bpText = 'Tiền tăng huyết áp (130-139 / 85-89 mmHg)';
        advice = 'Có dấu hiệu tiền tăng huyết áp. Cần giảm lượng muối ăn, hạn chế rượu bia và đến trạm đo lại sau 1-2 tuần.';
      } else if (sys >= 140 || dia >= 90) {
        bpText = 'Nghi ngờ Tăng huyết áp (≥ 140/90 mmHg)';
        advice = 'Chỉ số cao hơn mức bình thường. Bạn nên đến Trạm Y tế phường An Hải để bác sĩ thăm khám và đăng ký sổ quản lý huyết áp BHYT.';
      }
    }

    setAssessmentResult({
      bmi: bmiVal,
      bmiStatus: bmiText,
      bpStatus: bpText,
      recommendation: advice,
    });
  };

  return (
    <div className="w-full bg-[#f7faf8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 space-y-10">
        {/* Header Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#414755] mb-2">
            <button onClick={() => onNavigate('trang-chu')} className="hover:text-[#1c7a42]">Trang chủ</button>
            <span>/</span>
            <span className="text-[#006c4e] font-semibold">Hướng dẫn sức khỏe</span>
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#006c4e] bg-emerald-50 px-2.5 py-1 rounded-full">
            Y học thường thức & Phòng bệnh
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121c2a] mt-2">
            Cẩm nang sức khỏe cộng đồng & Tự kiểm tra chỉ số
          </h1>
          <p className="text-sm text-[#414755] mt-1 max-w-3xl leading-relaxed">
            Kiến thức y tế chính thống được biên soạn bởi bác sĩ Trạm Y tế phường An Hải nhằm nâng cao năng lực tự chăm sóc sức khỏe cho từng hộ gia đình.
          </p>
        </div>

        {/* Triage Decision Banner: Trạm Y tế vs 115 */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-red-200 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-center gap-2 text-[#bb0112]">
              <span className="material-symbols-outlined text-2xl">help_center</span>
              <h2 className="text-base sm:text-lg font-bold">Phân loại khẩn cấp: Khi nào đến Trạm Y tế vs Khi nào gọi 115?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <span className="font-bold text-[#1c7a42] block mb-1">ĐẾN TRẠM Y TẾ PHƯỜNG:</span>
                <p className="text-[#414755] leading-relaxed">
                  Sốt nhẹ, cảm cúm, đau bụng lâm râm, vết trầy xước phần mềm, tiêm phòng vắc xin, kiểm tra huyết áp và cấp phát thuốc BHYT định kỳ.
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <span className="font-bold text-[#bb0112] block mb-1">GỌI NGAY CẤP CỨU 115:</span>
                <p className="text-red-950 leading-relaxed">
                  Khó thở dữ dội, đau thắt ngực lan ra cánh tay, méo miệng/yếu liệt tay chân (đột quỵ), tai nạn chấn thương sọ não, co giật hôn mê.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-2">
            <button
              onClick={onOpenEmergency}
              className="w-full py-3 bg-[#bb0112] hover:bg-[#a0010f] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">e911_emergency</span>
              <span>Đường dây nóng cấp cứu</span>
            </button>
            <p className="text-[11px] text-gray-500 text-center">
              Trực ban tiếp nhận 24/7 đối với sơ cứu ban đầu
            </p>
          </div>
        </div>

        {/* Interactive Tool: BMI & Blood Pressure Self-assessment */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-green-200 space-y-4">
          <div className="flex items-center gap-2 text-[#1c7a42]">
            <span className="material-symbols-outlined text-2xl">vital_signs</span>
            <h3 className="text-base sm:text-lg font-bold">Công cụ đánh giá Chỉ số khối cơ thể (BMI) & Huyết áp</h3>
          </div>
          <p className="text-xs text-[#414755]">
            Tự kiểm tra để nhận lời khuyên dinh dưỡng và phòng ngừa biến chứng tim mạch từ đội ngũ y tế cơ sở:
          </p>

          <form onSubmit={handleCalculateHealth} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#121c2a] mb-1">Cân nặng (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="Ví dụ: 62"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#121c2a] mb-1">Chiều cao (cm)</label>
              <input
                type="number"
                required
                placeholder="Ví dụ: 165"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#121c2a] mb-1">Huyết áp tâm thu (Tối đa, mmHg)</label>
              <input
                type="number"
                placeholder="Ví dụ: 120"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#121c2a] mb-1">Huyết áp tâm trương (Tối thiểu, mmHg)</label>
              <input
                type="number"
                placeholder="Ví dụ: 80"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42]"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1c7a42] hover:bg-[#155f33] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Đánh giá sức khỏe ngay
              </button>
            </div>
          </form>

          {/* Assessment Result Card */}
          {assessmentResult && (
            <div className="mt-4 p-5 bg-[#eef6f0] border border-[#a6d3b4] rounded-2xl animate-in zoom-in-95 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-green-200">
                <div>
                  <span className="text-xs text-[#414755]">Chỉ số BMI của bạn:</span>
                  <p className="text-xl font-bold text-[#1c7a42] mt-0.5">
                    {assessmentResult.bmi} <span className="text-xs font-normal text-[#414755]">({assessmentResult.bmiStatus})</span>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-[#414755]">Phân loại huyết áp:</span>
                  <p className="text-sm font-bold text-[#121c2a] mt-0.5">{assessmentResult.bpStatus}</p>
                </div>
              </div>
              <div className="pt-3 text-xs text-[#121c2a] flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-[#006c4e] shrink-0 mt-0.5">health_and_safety</span>
                <div>
                  <strong className="block text-[#006c4e]">Lời khuyên từ Bác sĩ Trạm Y tế:</strong>
                  <p className="mt-0.5 leading-relaxed">{assessmentResult.recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4 Health Handbook Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#121c2a]">Cẩm nang phòng bệnh & Hướng dẫn y học thường thức</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HEALTH_GUIDES.map((guide) => (
              <div
                key={guide.id}
                onClick={() => onOpenArticle('guide', guide)}
                className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      guide.colorScheme === 'tertiary'
                        ? 'bg-red-100 text-[#bb0112]'
                        : guide.colorScheme === 'secondary'
                        ? 'bg-emerald-100 text-[#006c4e]'
                        : 'bg-green-100 text-[#1c7a42]'
                    }`}>
                      <span className="material-symbols-outlined">{guide.icon}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase">{guide.category}</span>
                      <h3 className="text-base font-bold text-[#121c2a]">{guide.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-[#414755] leading-relaxed mt-2">
                    {guide.summary}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1c7a42]">
                  <span>Xem chi tiết cẩm nang</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
