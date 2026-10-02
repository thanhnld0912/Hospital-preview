import React, { useState } from 'react';
import { useDutySchedules } from '../../services/dutySchedules';
import { useSiteContent } from '../../services/siteContent';
import { DUTY_STATUS_LABELS, formatIsoDate, personName, weekdayOf } from '../../services/statuses';
import { NavTab, Announcement } from '../../types';

interface NoticesScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenArticle: (type: 'announcement' | 'news' | 'guide', item: any) => void;
  onOpenEmergency: () => void;
}

export const NoticesScreen: React.FC<NoticesScreenProps> = ({
  onNavigate,
  onOpenArticle,
  onOpenEmergency,
}) => {
  const { stationInfo, announcements } = useSiteContent();
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'vaccine' | 'general'>('all');
  // Lịch trực lấy từ API, tự cập nhật định kỳ; quản trị tắt section => không hiển thị
  const duty = useDutySchedules();
  const showDutySection = duty.data?.enabled === true || duty.error;

  const filteredNotices = announcements.filter((item) => {
    if (filterType === 'urgent') return item.isUrgent;
    if (filterType === 'vaccine') return item.tagColor === 'secondary';
    if (filterType === 'general') return !item.isUrgent;
    return true;
  });

  return (
    <div className="w-full bg-[#f7faf8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 space-y-10">
        {/* Header Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#414755] mb-2">
            <button onClick={() => onNavigate('trang-chu')} className="hover:text-[#1c7a42]">Trang chủ</button>
            <span>/</span>
            <span className="text-[#bb0112] font-semibold">Thông báo & Lịch trực</span>
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#bb0112] bg-red-50 px-2.5 py-1 rounded-full">
            Kênh thông tin chỉ đạo điều hành
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121c2a] mt-2">
            Thông báo y tế & Lịch trực cấp cứu 24/7
          </h1>
          <p className="text-sm text-[#414755] mt-1 max-w-3xl leading-relaxed">
            Các văn bản hướng dẫn, lịch tiêm chủng, chiến dịch vệ sinh phòng dịch và bảng phân công kíp trực của Trạm Y tế phường An Hải.
          </p>
        </div>

        {/* 24/7 Duty Schedule Table Card */}
        {showDutySection && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-200 space-y-4" data-section="duty-schedule">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs uppercase font-bold text-[#006c4e] tracking-wider">Trực ban thường trực</span>
              </div>
              <h2 className="text-lg font-bold text-[#121c2a] mt-0.5">Lịch trực cấp cứu tuần này tại Trạm</h2>
            </div>
            <button
              onClick={onOpenEmergency}
              className="px-4 py-2 bg-[#bb0112] hover:bg-[#a0010f] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 self-start shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">phone_in_talk</span>
              <span>Đường dây nóng trực ban: {stationInfo.hotline}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f7faf8] text-[#414755] uppercase border-y border-gray-100">
                <tr>
                  <th className="py-3 px-4">Thứ / Ngày</th>
                  <th className="py-3 px-4">Bác sĩ trực chính</th>
                  <th className="py-3 px-4">Cán bộ phụ trách</th>
                  <th className="py-3 px-4">Điều dưỡng ca trực</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {duty.error && (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center text-[#414755]">
                      Không tải được lịch trực. Vui lòng gọi đường dây nóng {stationInfo.hotline} để được hỗ trợ.
                    </td>
                  </tr>
                )}
                {duty.data?.enabled && duty.data.schedules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center text-[#414755]">
                      Lịch trực đang được cập nhật. Vui lòng gọi đường dây nóng {stationInfo.hotline}.
                    </td>
                  </tr>
                )}
                {duty.data?.schedules.map((shift) => (
                  <tr key={shift.id} className={shift.status === 'ACTIVE' ? 'bg-emerald-50/50 font-semibold' : 'hover:bg-gray-50'}>
                    <td className="py-3 px-4 text-[#121c2a]">
                      <span className="block font-bold">{weekdayOf(shift.dutyDate)}</span>
                      <span className="text-[11px] text-gray-500">{formatIsoDate(shift.dutyDate)}</span>
                      {shift.note && <span className="block text-[11px] font-semibold text-[#006c4e]">{shift.note}</span>}
                    </td>
                    <td className="py-3 px-4 text-[#1c7a42]">{personName(shift.doctor)}</td>
                    <td className="py-3 px-4 text-[#414755]">{personName(shift.responsible) || '—'}</td>
                    <td className="py-3 px-4 text-[#414755]">{personName(shift.nurse) || '—'}</td>
                    <td className="py-3 px-4">
                      {shift.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#77fac7] text-[#00513a]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006c4e] animate-ping"></span>
                          {DUTY_STATUS_LABELS.ACTIVE}
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap ${
                            shift.status === 'SUSPENDED'
                              ? 'text-[#bb0112] bg-red-50'
                              : shift.status === 'SHIFT_CHANGED'
                                ? 'text-amber-800 bg-amber-50'
                                : 'text-gray-500 bg-gray-100'
                          }`}
                        >
                          {DUTY_STATUS_LABELS[shift.status]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Notices Filter & List */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[#121c2a]">Danh sách văn bản thông báo</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'all' ? 'bg-[#1c7a42] text-white' : 'bg-white text-gray-600 border'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterType('urgent')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'urgent' ? 'bg-[#bb0112] text-white' : 'bg-white text-gray-600 border'
                }`}
              >
                Khẩn cấp / Mùa mưa
              </button>
              <button
                onClick={() => setFilterType('vaccine')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'vaccine' ? 'bg-[#006c4e] text-white' : 'bg-white text-gray-600 border'
                }`}
              >
                Tiêm chủng
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredNotices.map((n) => (
              <div
                key={n.id}
                onClick={() => onOpenArticle('announcement', n)}
                className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      n.tagColor === 'tertiary'
                        ? 'bg-red-100 text-[#bb0112]'
                        : n.tagColor === 'secondary'
                        ? 'bg-emerald-100 text-[#006c4e]'
                        : 'bg-green-100 text-[#1c7a42]'
                    }`}>
                      {n.tag}
                    </span>
                    {n.isUrgent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                        Khẩn cấp
                      </span>
                    )}
                    <span className="text-xs text-gray-400">• Ngày ban hành: {n.date}</span>
                    <span className="text-xs text-gray-400 hidden md:inline">• Đơn vị: {n.issuedBy}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#121c2a] hover:text-[#1c7a42] transition-colors">
                    {n.title}
                  </h3>
                  <p className="text-xs text-[#414755] line-clamp-2">
                    {n.summary}
                  </p>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 bg-[#f7faf8] text-[#1c7a42] font-bold text-xs rounded-xl border border-green-100 hover:bg-green-50 transition-colors shrink-0 flex items-center gap-1"
                >
                  <span>Xem toàn văn</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
