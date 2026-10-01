export type NavTab = 
  | 'trang-chu' 
  | 'gioi-thieu' 
  | 'dich-vu-y-te' 
  | 'thong-bao' 
  | 'tiem-chung' 
  | 'tin-tuc-va-hoat-dong' 
  | 'huong-dan-suc-khoe' 
  | 'lien-he';

export interface StationLocation {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  // Chỉ có giá trị khi tọa độ đã được xác minh; nếu null, bản đồ tìm theo địa chỉ
  latitude: number | null;
  longitude: number | null;
  mapUrl: string;
}

export interface MedicalService {
  id: string;
  title: string;
  icon: string;
  colorScheme: 'primary' | 'secondary' | 'tertiary';
  shortDesc: string;
  fullDesc: string;
  schedule: string;
  feeInfo: string;
  targetAudience: string;
  procedure: string[];
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  tag: string;
  tagColor: 'primary' | 'secondary' | 'tertiary';
  date: string;
  isUrgent?: boolean;
  summary: string;
  content: string;
  issuedBy: string;
  attachments?: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  categoryColor: 'primary' | 'secondary' | 'tertiary';
  date: string;
  imageUrl: string;
  imageAlt: string;
  summary: string;
  content: string[];
  author: string;
}

export interface HealthGuide {
  id: string;
  title: string;
  category: string;
  icon: string;
  colorScheme: 'primary' | 'secondary' | 'tertiary';
  summary: string;
  fullArticle: {
    overview: string;
    symptoms?: string[];
    preventiveSteps: string[];
    whenToSeeDoctor: string;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  title: string;
  department: string;
  phone?: string;
  experience: string;
  avatarUrl?: string;
}

/** Nhân sự hiển thị trên trang Giới thiệu (dữ liệu từ API /staff, dự phòng từ STAFF_MEMBERS) */
export interface StaffProfile {
  id: string;
  fullName: string;
  /** Chức danh viết tắt hiển thị trước tên, ví dụ "Bs.CKI." */
  title: string | null;
  position: string;
  department: string | null;
  bio: string | null;
  qualification: string | null;
  avatarUrl: string | null;
}

export interface DutyShift {
  day: string;
  date: string;
  leaderOnDuty: string;
  assistantOnDuty: string;
  nurseOnDuty: string;
  phone: string;
  status: 'Đang trực' | 'Kế hoạch';
}

export interface VaccineItem {
  id: string;
  name: string;
  diseaseTarget: string;
  recommendedAge: string;
  dosage: string;
  notes: string;
  isNationalProgram: boolean; // Miễn phí
}

export interface AppointmentRecord {
  id: string;
  citizenName: string;
  citizenId: string; // CCCD
  phone: string;
  serviceType: string;
  preferredDate: string;
  timeSlot: string;
  symptomsOrNotes: string;
  status: 'Chờ tiếp nhận' | 'Đã xác nhận' | 'Hoàn thành';
  createdAt: string;
}

export interface OutbreakReport {
  id: string;
  reporterName: string;
  phone: string;
  address: string;
  neighborhood: string;
  type: 'Sốt xuất huyết' | 'Tay chân miệng' | 'Nước đọng / lăng quăng' | 'Vệ sinh an toàn thực phẩm' | 'Khác';
  description: string;
  createdAt: string;
}
