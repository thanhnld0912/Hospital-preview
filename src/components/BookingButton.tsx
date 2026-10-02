import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { BOOKING_UNAVAILABLE_MESSAGE, ONLINE_BOOKING_ENABLED } from '../config/features';

interface BookingButtonProps {
  /** Mở BookingModal — chỉ được gọi khi ONLINE_BOOKING_ENABLED = true */
  onOpen: () => void;
  /** Class chung (kích thước, màu, typography) — giữ nguyên thiết kế */
  className: string;
  /** Class chỉ áp dụng khi nút hoạt động (hover...) để nút không trông như bấm được khi bị tắt */
  activeClassName?: string;
  children: React.ReactNode;
}

const HINT_WIDTH = 240;
const VIEWPORT_GUTTER = 8;

/**
 * Nút "Đặt lịch khám"/"Hẹn khám" dùng chung cho mọi vị trí trên website công khai.
 * Khi chưa hỗ trợ đặt lịch trực tuyến: nút vẫn hiển thị nhưng aria-disabled, không có hành động đặt lịch;
 * hover / focus / chạm chỉ hiện gợi ý lý do (không modal, không gọi API, không đổi URL).
 */
export const BookingButton: React.FC<BookingButtonProps> = ({ onOpen, className, activeClassName = '', children }) => {
  if (ONLINE_BOOKING_ENABLED) {
    return (
      <button type="button" onClick={onOpen} className={`${className} ${activeClassName}`}>
        {children}
      </button>
    );
  }
  return <UnavailableBookingButton className={className}>{children}</UnavailableBookingButton>;
};

const UnavailableBookingButton: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => {
  const hintId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [hint, setHint] = useState<{ top: number; left: number; width: number } | null>(null);

  const hide = useCallback(() => {
    clearTimeout(hideTimer.current);
    setHint(null);
  }, []);

  // Gợi ý đặt cố định (fixed) ngay dưới nút, luôn nằm trong khung nhìn — không làm tràn ngang trang trên mobile
  const place = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const width = Math.min(HINT_WIDTH, window.innerWidth - VIEWPORT_GUTTER * 2);
    const centered = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(Math.max(centered, VIEWPORT_GUTTER), window.innerWidth - width - VIEWPORT_GUTTER);
    setHint({ top: rect.bottom + 6, left, width });
  }, []);

  const show = useCallback(
    (autoHideMs?: number) => {
      place();
      clearTimeout(hideTimer.current);
      if (autoHideMs) hideTimer.current = setTimeout(() => setHint(null), autoHideMs);
    },
    [place],
  );

  // Khi cuộn / đổi kích thước (kể cả trình duyệt tự cuộn tới nút vừa focus): gợi ý bám theo vị trí nút
  const visible = hint !== null;
  useEffect(() => {
    if (!visible) return;
    window.addEventListener('scroll', place, { passive: true, capture: true });
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, { capture: true });
      window.removeEventListener('resize', place);
    };
  }, [visible, place]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-disabled="true"
        aria-describedby={hintId}
        data-booking-disabled=""
        // Không có hành động đặt lịch: chạm/Enter/Space chỉ hiện gợi ý trong 4 giây
        onClick={() => show(4000)}
        onMouseEnter={() => show()}
        onMouseLeave={hide}
        onFocus={() => show()}
        onBlur={hide}
        className={`${className} opacity-60 cursor-not-allowed`}
      >
        {children}
      </button>
      {/* Ngoài <button> để không trở thành tên nút; luôn có trong DOM cho trình đọc màn hình (aria-describedby) */}
      <span
        id={hintId}
        role="tooltip"
        className={
          hint
            ? 'fixed z-[60] rounded-lg bg-[#121c2a] px-3 py-2 text-left text-[11px] font-medium leading-snug text-white shadow-lg pointer-events-none'
            : 'sr-only'
        }
        style={hint ? { top: hint.top, left: hint.left, width: hint.width } : undefined}
      >
        {BOOKING_UNAVAILABLE_MESSAGE}
      </span>
    </>
  );
};
