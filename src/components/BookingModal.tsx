import React, { useEffect, useState } from 'react';
import { ApiError, apiRequest, AvailabilityDto, BookingOptionsDto, PublicAppointmentDto } from '../services/api';
import { formatIsoDate } from '../services/statuses';

// Phiên bản cũ lưu họ tên/SĐT/CCCD vào localStorage — xóa dữ liệu nhạy cảm còn sót trên trình duyệt người dân
try {
  localStorage.removeItem('anhai_appointments');
} catch {
  // Trình duyệt chặn storage
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

const inputClass =
  'w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1c7a42] bg-white';

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Ngày làm việc gần nhất sau hôm nay (mặc định như form cũ: ngày mai) */
function defaultDate(options: BookingOptionsDto): string {
  let date = addDays(options.minDate, 1);
  while (date <= options.maxDate && !options.workingDays.includes(new Date(`${date}T00:00:00Z`).getUTCDay())) {
    date = addDays(date, 1);
  }
  return date <= options.maxDate ? date : options.minDate;
}

function publicError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'Không kết nối được hệ thống đặt lịch. Vui lòng thử lại hoặc gọi điện cho Trạm.';
    if (error.status >= 500 && error.status !== 503) return 'Hệ thống đang bận. Vui lòng thử lại sau hoặc gọi điện cho Trạm.';
    if (error.status === 400 && error.details.length > 0) return error.details.map((detail) => detail.message).join('; ');
    return error.message;
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

/** 0905123456 -> 09*****456 (chỉ hiển thị trên phiếu hẹn, không gửi đi đâu) */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length > 5 ? `${digits.slice(0, 2)}${'*'.repeat(digits.length - 5)}${digits.slice(-3)}` : digits;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, defaultService }) => {
  const [options, setOptions] = useState<BookingOptionsDto | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityDto | null>(null);

  // Dữ liệu người dân nhập chỉ nằm trong bộ nhớ của form (không lưu storage), xóa khi đóng
  const [citizenName, setCitizenName] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [phone, setPhone] = useState('');
  const [locationId, setLocationId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [symptomsOrNotes, setSymptomsOrNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedBooking, setSubmittedBooking] = useState<{ result: PublicAppointmentDto; name: string; phone: string } | null>(
    null,
  );

  // Tải danh sách cơ sở / dịch vụ / khung giờ từ backend mỗi lần mở
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setOptionsError(null);
    apiRequest<BookingOptionsDto>('/appointments/options')
      .then(({ data }) => {
        if (!active) return;
        setOptions(data);
        setLocationId((current) => current || data.locations[0]?.id || '');
        setPreferredDate((current) => current || defaultDate(data));
        // Dịch vụ được chọn sẵn từ nút "Đặt lịch" ở trang khác (khớp theo tên); không khớp => ghi vào ghi chú
        const wanted = defaultService?.trim().toLowerCase();
        const matched = wanted
          ? data.services.find((s) => s.title.toLowerCase() === wanted) ??
            (wanted.startsWith('tiêm chủng') ? data.services.find((s) => s.title.toLowerCase().includes('tiêm chủng')) : undefined)
          : undefined;
        setServiceId((current) => current || matched?.id || data.services[0]?.id || '');
        if (defaultService && matched?.title.toLowerCase() !== wanted) {
          setSymptomsOrNotes((current) => current || defaultService);
        }
      })
      .catch((error: unknown) => {
        if (active) setOptionsError(publicError(error));
      });
    return () => {
      active = false;
    };
  }, [isOpen, defaultService]);

  // Khung giờ còn nhận theo cơ sở + ngày (backend kiểm tra lại khi gửi)
  useEffect(() => {
    if (!isOpen || !locationId || !preferredDate) return;
    let active = true;
    setAvailability(null);
    const params = new URLSearchParams({ locationId, date: preferredDate });
    apiRequest<AvailabilityDto>(`/appointments/availability?${params.toString()}`)
      .then(({ data }) => {
        if (!active) return;
        setAvailability(data);
        setTimeSlot((current) =>
          data.slots.some((slot) => slot.time === current && slot.available) ? current : data.slots.find((slot) => slot.available)?.time ?? '',
        );
      })
      .catch(() => {
        if (active) setAvailability({ date: preferredDate, reason: 'Không kiểm tra được khung giờ còn trống', slots: [] });
      });
    return () => {
      active = false;
    };
  }, [isOpen, locationId, preferredDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !phone.trim() || !timeSlot || !consent) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data } = await apiRequest<PublicAppointmentDto>('/appointments', {
        method: 'POST',
        body: {
          fullName: citizenName,
          phone,
          citizenId: citizenId.trim() || null,
          locationId,
          serviceId,
          appointmentDate: preferredDate,
          appointmentTime: timeSlot,
          note: symptomsOrNotes.trim() || null,
          consent,
          website: honeypot,
        },
      });
      setSubmittedBooking({ result: data, name: citizenName.trim(), phone: maskPhone(phone) });
      // Không giữ CCCD/SĐT trong state sau khi gửi xong
      setCitizenId('');
      setPhone('');
    } catch (error) {
      setSubmitError(publicError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedBooking(null);
    setCitizenName('');
    setCitizenId('');
    setPhone('');
    setSymptomsOrNotes('');
    setConsent(false);
    setHoneypot('');
    setSubmitError(null);
    setTimeSlot('');
    setPreferredDate('');
    setServiceId('');
    onClose();
  };

  const selectedSlotReason = availability?.slots.find((slot) => slot.time === timeSlot)?.reason ?? null;
  const noSlots = availability !== null && !availability.slots.some((slot) => slot.available);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-green-100 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Đặt lịch khám"
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
            aria-label="Đóng"
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
                  Đã gửi yêu cầu đặt lịch
                </span>
                <h4 className="text-xl font-bold text-[#121c2a] mt-2">Phiếu hẹn khám điện tử</h4>
                <p className="text-xs text-[#414755] mt-1">
                  Vui lòng lưu lại mã đặt lịch hoặc chụp màn hình để xuất trình tại bàn tiếp đón. Trạm sẽ liên hệ xác nhận lịch hẹn.
                </p>
              </div>

              {/* Ticket Card */}
              <div className="p-5 bg-[#eef6f0] border-2 border-dashed border-[#a6d3b4] rounded-xl text-left space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-green-200">
                  <span className="text-xs font-semibold text-[#414755]">Mã đặt lịch:</span>
                  <span className="text-xl font-mono font-bold text-[#1c7a42]" data-booking-code>
                    {submittedBooking.result.bookingCode}
                  </span>
                </div>
                <div className="text-xs text-[#414755] space-y-1">
                  <p><strong>Người khám:</strong> {submittedBooking.name}</p>
                  <p><strong>Số điện thoại:</strong> {submittedBooking.phone}</p>
                  <p><strong>Dịch vụ:</strong> {submittedBooking.result.service.title}</p>
                  <p><strong>Ngày hẹn:</strong> {formatIsoDate(submittedBooking.result.appointmentDate)}</p>
                  <p><strong>Khung giờ:</strong> {submittedBooking.result.slotLabel}</p>
                  <p>
                    <strong>Địa điểm:</strong> {submittedBooking.result.location.name} - {submittedBooking.result.location.address}
                  </p>
                </div>
                <div className="pt-2 border-t border-green-200 flex items-center gap-1.5 text-xs text-[#006c4e] font-semibold">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Đã ghi nhận trên hệ thống tiếp nhận của Trạm — trạng thái: Chờ xác nhận</span>
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
          ) : optionsError ? (
            <div className="text-center py-6 space-y-3" role="alert">
              <span className="material-symbols-outlined text-4xl text-[#bb0112]">error</span>
              <p className="text-sm text-[#121c2a]">{optionsError}</p>
            </div>
          ) : !options ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#414755]" role="status">
              <span className="material-symbols-outlined text-[#1c7a42] animate-spin">progress_activity</span>
              <span>Đang tải thông tin đặt lịch...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5" autoComplete="on">
              <p className="text-xs text-[#414755]">
                Đăng ký trước giúp nhân viên y tế chuẩn bị hồ sơ bệnh án, chuẩn bị vắc xin và giảm thiểu thời gian chờ đợi của bà con.
              </p>

              {submitError && (
                <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-900" role="alert">
                  {submitError}
                </p>
              )}

              <div>
                <label htmlFor="booking-name" className="block text-xs font-bold text-[#121c2a] mb-1">
                  Họ và tên người khám / tiêm chủng <span className="text-red-500">*</span>
                </label>
                <input
                  id="booking-name"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="booking-citizen-id" className="block text-xs font-bold text-[#121c2a] mb-1">
                    Số CCCD / Mã định danh
                  </label>
                  <input
                    id="booking-citizen-id"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={14}
                    placeholder="12 chữ số CCCD (tùy chọn)"
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="booking-phone" className="block text-xs font-bold text-[#121c2a] mb-1">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    maxLength={20}
                    placeholder="0905 xxx xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="booking-location" className="block text-xs font-bold text-[#121c2a] mb-1">
                  Cơ sở khám <span className="text-red-500">*</span>
                </label>
                <select id="booking-location" required value={locationId} onChange={(e) => setLocationId(e.target.value)} className={inputClass}>
                  {options.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} — {location.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="booking-service" className="block text-xs font-bold text-[#121c2a] mb-1">
                  Nhu cầu dịch vụ y tế <span className="text-red-500">*</span>
                </label>
                <select id="booking-service" required value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputClass}>
                  {options.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="booking-date" className="block text-xs font-bold text-[#121c2a] mb-1">
                    Ngày hẹn dự kiến <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    required
                    min={options.minDate}
                    max={options.maxDate}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="booking-slot" className="block text-xs font-bold text-[#121c2a] mb-1">
                    Khung giờ tiếp nhận <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="booking-slot"
                    required
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    disabled={!availability || noSlots}
                    className={inputClass}
                  >
                    {!availability && <option value="">Đang kiểm tra...</option>}
                    {noSlots && <option value="">Không còn khung giờ</option>}
                    {availability?.slots.map((slot) => (
                      <option key={slot.time} value={slot.time} disabled={!slot.available}>
                        {slot.label}
                        {slot.available ? '' : ` — ${slot.reason ?? 'Không nhận'}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(availability?.reason || selectedSlotReason) && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {availability?.reason ?? selectedSlotReason}
                </p>
              )}

              <div>
                <label htmlFor="booking-note" className="block text-xs font-bold text-[#121c2a] mb-1">
                  Triệu chứng hoặc ghi chú cho y bác sĩ
                </label>
                <textarea
                  id="booking-note"
                  rows={2}
                  maxLength={500}
                  placeholder="Ví dụ: Đo huyết áp định kỳ, bé tiêm mũi 5 trong 1 lần thứ 2..."
                  value={symptomsOrNotes}
                  onChange={(e) => setSymptomsOrNotes(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Bẫy spam: ẩn với người dùng và trình đọc màn hình */}
              <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
                <label htmlFor="booking-website">Website</label>
                <input
                  id="booking-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-[#414755] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#1c7a42]"
                />
                <span>
                  Tôi đồng ý để Trạm Y tế phường An Hải sử dụng thông tin trên để tiếp nhận và liên hệ xác nhận lịch hẹn.{' '}
                  <span className="text-red-500">*</span>
                </span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-[#414755] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting || !timeSlot || !consent}
                  className="px-5 py-2 bg-[#1c7a42] hover:bg-[#155f33] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-sm ${submitting ? 'animate-spin' : ''}`}>
                    {submitting ? 'progress_activity' : 'assignment_turned_in'}
                  </span>
                  <span>{submitting ? 'Đang gửi...' : 'Xác nhận đặt lịch hẹn'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
