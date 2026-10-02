import { useEffect, useState } from 'react';
import { apiGet, PublicDutySchedulesResponse } from './api';

// "Realtime" cho lịch trực: polling nhẹ (backend Express trên Vercel serverless không giữ kết nối
// WebSocket; Supabase Realtime cần đưa anon key + policy đọc bảng ra trình duyệt — không dùng).
// Chỉ poll khi tab đang hiển thị; quay lại tab thì tải ngay.
export const DUTY_POLL_INTERVAL_MS = 20_000;

export interface DutyScheduleState {
  data: PublicDutySchedulesResponse | null;
  error: boolean;
}

export function useDutySchedules(intervalMs = DUTY_POLL_INTERVAL_MS): DutyScheduleState {
  const [state, setState] = useState<DutyScheduleState>({ data: null, error: false });

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      clearTimeout(timer);
      try {
        const data = await apiGet<PublicDutySchedulesResponse>('/duty-schedules');
        if (active) setState({ data, error: false });
      } catch {
        // Giữ dữ liệu lần trước nếu đã có; chỉ báo lỗi khi chưa tải được lần nào
        if (active) setState((current) => ({ data: current.data, error: current.data === null }));
      }
      if (active && document.visibilityState === 'visible') timer = setTimeout(load, intervalMs);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') load();
      else clearTimeout(timer);
    };

    load();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      active = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs]);

  return state;
}
