// Cờ tính năng của website công khai.

/**
 * Đặt lịch khám trực tuyến. Hiện Trạm CHƯA nhận đăng ký khám trực tuyến — người dân đến trực tiếp cơ sở.
 * false: mọi nút "Đặt lịch khám"/"Hẹn khám" chỉ hiển thị (không mở BookingModal, không gọi /api/appointments).
 * Backend, BookingModal và trang quản trị vẫn giữ nguyên để có thể bật lại bằng cách đổi cờ này.
 */
export const ONLINE_BOOKING_ENABLED = false;

export const BOOKING_UNAVAILABLE_MESSAGE = 'Hiện chưa hỗ trợ đăng ký khám trực tuyến. Vui lòng đến trực tiếp cơ sở.';
