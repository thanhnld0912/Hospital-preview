import { MedicalService, Announcement, NewsArticle, HealthGuide, StaffMember, StaffProfile, DutyShift, VaccineItem } from '../types';

export const STATION_INFO = {
  name: 'TRẠM Y TẾ PHƯỜNG AN HẢI',
  city: 'TP. ĐÀ NẴNG',
  district: 'UBND PHƯỜNG AN HẢI',
  parentAgency: 'Trực thuộc Ủy ban Nhân dân phường An Hải',
  managingUnit: 'Ủy ban Nhân dân phường An Hải',
  fullAddress: 'Số 127 Nguyễn Trung Trực, phường An Hải',
  locations: [
    { name: 'Cơ sở chính', address: 'Số 127 Nguyễn Trung Trực, phường An Hải' },
    { name: 'Điểm trạm An Hải 1', address: 'Số 231A Nguyễn Công Trứ, phường An Hải' },
    { name: 'Điểm trạm An Hải 2', address: 'Số 25 Nguyễn Thông, phường An Hải' },
    { name: 'Điểm trạm An Hải 3', address: 'Số 90 Nguyễn Duy Hiệu, phường An Hải' },
    { name: 'Cơ sở phòng Dân số', address: 'Số 88 Lý Đạo Thành, phường An Hải' }
  ],
  hotline: '02363 844075',
  emergency115: '115',
  vaccineHotline: '02363 844075',
  email: 'tyt.anhai@danang.gov.vn',
  portalUrl: 'suckhoe.anhai.danang.vn',
  logoUrl: '/logo.jpg',
  // Tiêu đề section "Nhân sự chuyên môn" (trang Giới thiệu) — quản trị sửa trong Thông tin website
  staffSection: {
    label: 'Nhân sự chuyên môn',
    title: 'Đội ngũ y bác sĩ & Nhân viên y tế',
    description: 'Cán bộ tận tâm, y đức trong sáng, được đào tạo chính quy' as string | null,
  },
  workingHours: {
    morning: '07:30 - 11:30',
    afternoon: '13:30 - 17:00',
    days: 'Thứ Hai đến Thứ Sáu',
    emergency: 'Trực cấp cứu ban đầu 24/7 (Cả Thứ Bảy, Chủ Nhật và Ngày Lễ)'
  },
  images: {
    hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9jJHCAC-ul2wGo9Hk6h91zP2pksd_BnYKU8dAc-PlME-UTO_u5Hq4AVjrN5qQeLF8uFVVmxrTauWnrtnUBGyeNowEsHYtGq_0V_v_1MDVlll1jL_raAxwx_dwXKqdx4go9UPFW_gkUqNrs9ww-N1IhXjkdWKphgdfxKsOPncj6njHwe-CIXxhft1uPVhxepni18kQ7OqsbHVBGP7WZIhEjmV8GK4N0JDSHWcc0V7pn1YhrlguSy3NNg',
    map: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqzA0JBPF9Fx2OClMVZP101Jx0dPg6SShD_0swD4VaAmKBSMvTMXbktK1IcBFfZMxOEIQO_CeAbIfqdoOBD7LZZ9tUD95s2w7-IbarGI68whwMRsDM8uisuAq7NtSazwLiB9Ozr-ggby2hLAc18fcw0IuLoOvavlOT4TsXkFjhoja8tnmtkukkfkFVyaGkiJCQ16-4EsiIVL312-52CIMmEXTR61stde0bpW70YXgQ0BN6rhSQa17xZw',
    news1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFY9wyGu1hMNXDRheCfADM2qxdd_37x1sX4BqZhJ5VNwKdB9sBfH4aGv08Xt6TytNffc57MySNfA47ec39ZKULlJ1xF6r3hXLNfrtNW5bqpIXZJMeMYG8tw90on5otKQFUJAbyRQUwyTgrixRE68QBDPhBbjZKPhKnmgopyTNFW57tDzGTnf--Amad4_k6I1A2d0P0wlkjb58wDp6u-dpkB967ca1AMh0xsXO1CdvJMQszkC5PW-TBnQ',
    news2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOOsXa7m4i5f6rgTQavrb4hmN-NkmuUFH5Qzxp-NhJbHL7751wWiiYmCl7-RqBfAO3T2xsYJ--GQ1LOdOw9pJiGj4d-o2z895dWQ4c_25tZzLwvK1BkDcTWjDcArVOH_BCjDU8S8yyf7itJe3PoqGhly8nbfDdc9-JveLnFCjY5LUIS03FEtEesFVgzGZ-mzOse7PbPEr0rGIepOVsfGtikcfUn-dWJZ1DztmhVEA8nmrJunLfzHp9iA',
    news3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcEzbzvLuuAFrkd9GphQlxEuX3cdN4UUWct_udbRIDUTgVgNEutuAPrEByiIwSkhjlGWqXwywarPl_ZW5drGsWc8NRlJgrpQ6RiZBrSsZVENE061nOHBZ-nm3A9gOE1a-yDg02qpQ3-XC_HMK-OyrUtGC9fJsyR3G8ODbkaiJfhiQqlpe9yTSQNqcnuQPKUjfgCwbF2cVRKM7KEsG6tfIG16T6eq2o7A_RL1ijPoEsvo-SpJgLapmCPA',
  }
};

export const MEDICAL_SERVICES: MedicalService[] = [
  {
    id: 'kham-chua-benh-ban-dau',
    title: 'Khám & Chăm sóc sức khỏe ban đầu',
    icon: 'clinical_notes',
    colorScheme: 'primary',
    shortDesc: 'Khám chữa bệnh thông thường theo phân tuyến BHYT, xử lý sơ cứu ban đầu các trường hợp tai nạn thương tích trước khi chuyển tuyến chuyên khoa.',
    fullDesc: 'Trạm Y tế tiếp nhận khám bệnh, chẩn đoán và điều trị các chứng bệnh nội khoa thông thường, xử lý vết thương phần mềm, rửa vết thương, thay băng, cắt chỉ, khí dung cắt cơn hen suyễn phế quản, đo điện tim cơ bản và chuyển tuyến an toàn khi vượt khả năng kỹ thuật.',
    schedule: 'Thứ 2 - Thứ 6 (07:30 - 11:30 & 13:30 - 17:00)',
    feeInfo: 'Khám BHYT / Thu phí quy định',
    targetAudience: 'Toàn bộ nhân dân có thẻ BHYT đăng ký tại cơ sở hoặc người dân cư trú trên địa bàn',
    procedure: [
      'Xuất trình CCCD gắn chip hoặc ứng dụng VNeID / VssID tại quầy tiếp đón',
      'Đo dấu hiệu sinh tồn (huyết áp, mạch, nhiệt độ, chiều cao, cân nặng)',
      'Bác sĩ thăm khám lâm sàng, chỉ định xét nghiệm nhanh nếu cần',
      'Kê đơn thuốc điện tử và hướng dẫn chăm sóc',
      'Cấp phát thuốc BHYT tại quầy dược của trạm'
    ]
  },
  {
    id: 'tiem-chung-mo-rong',
    title: 'Tiêm chủng mở rộng quốc gia',
    icon: 'child_care',
    colorScheme: 'secondary',
    shortDesc: 'Tổ chức tiêm vắc xin trong chương trình TCMR định kỳ hàng tháng cho trẻ em và phụ nữ có thai theo đúng quy chuẩn an toàn tiêm chủng của Bộ Y tế.',
    fullDesc: 'Triển khai đầy đủ 10 loại vắc xin phòng bệnh truyền nhiễm nguy hiểm: Lao, Viêm gan B, Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm phổi/Viêm màng não mủ do Hib, Sởi, Rubella, Viêm não Nhật Bản. Vắc xin được bảo quản nghiêm ngặt trong tủ lạnh chuyên dụng theo chuẩn Thực hành tốt bảo quản thuốc (GSP).',
    schedule: 'Ngày 05 và ngày 20 hàng tháng (Buổi sáng 07:30 - 11:00)',
    feeInfo: 'Miễn phí hoàn toàn',
    targetAudience: 'Trẻ sơ sinh, trẻ nhỏ dưới 2 tuổi và phụ nữ mang thai trên địa bàn phường',
    procedure: [
      'Phụ huynh mang theo sổ tiêm chủng hoặc mã số định danh cá nhân của trẻ',
      'Khám sàng lọc trước tiêm (nghe tim phổi, đo thân nhiệt, khai thác tiền sử dị ứng)',
      'Tư vấn chỉ định loại vắc xin phù hợp với độ tuổi',
      'Thực hiện tiêm chủng đúng kỹ thuật',
      'Theo dõi phản ứng sau tiêm tại phòng lưu theo dõi tối thiểu 30 phút'
    ]
  },
  {
    id: 'cham-soc-ba-me-tre-em',
    title: 'Chăm sóc bà mẹ & Trẻ em',
    icon: 'pregnant_woman',
    colorScheme: 'tertiary',
    shortDesc: 'Quản lý thai nghén, khám thai định kỳ, tư vấn nuôi con bằng sữa mẹ, theo dõi biểu đồ tăng trưởng và phòng chống suy dinh dưỡng trẻ em.',
    fullDesc: 'Cán bộ nữ hộ sinh của trạm theo dõi quản lý sổ thai nghén toàn diện cho sản phụ trên địa bàn; cung cấp viên sắt/acid folic phòng thiếu máu; đo vòng bụng, bề cao tử cung, nghe tim thai; tư vấn chế độ dinh dưỡng trong thai kỳ và hướng dẫn các mốc sàng lọc dị tật thai nhi tại bệnh viện tuyến trên.',
    schedule: 'Thường trực các ngày làm việc trong tuần',
    feeInfo: 'Tư vấn tận tâm / BHYT',
    targetAudience: 'Phụ nữ mang thai, bà mẹ đang nuôi con nhỏ dưới 5 tuổi',
    procedure: [
      'Lập hồ sơ quản lý thai phụ ngay từ tam cá nguyệt đầu tiên',
      'Khám thai định kỳ theo lịch hẹn của cán bộ y tế',
      'Tiêm phòng uốn ván cho mẹ bầu',
      'Định kỳ cân đo chiều cao, cân nặng cho trẻ dưới 5 tuổi vào ngày 1-2 hàng quý để chấm biểu đồ tăng trưởng'
    ]
  },
  {
    id: 'phong-chong-dich-benh',
    title: 'Phòng chống dịch bệnh truyền nhiễm',
    icon: 'sanitizer',
    colorScheme: 'primary',
    shortDesc: 'Giám sát ca bệnh, khoanh vùng xử lý ổ dịch sốt xuất huyết, tay chân miệng, sởi, cúm gia cầm và các dịch bệnh mới nổi trên địa bàn phường.',
    fullDesc: 'Đội cơ động phản ứng nhanh của trạm phối hợp cùng UBND phường An Hải thực hiện giám sát dịch tễ tại từng tổ dân phố. Tiến hành phun hóa chất diệt muỗi, xử lý ổ bọ gậy, điều tra dịch tễ ca nhiễm sốt xuất huyết, sốt phát ban nghi sởi, ngăn ngừa lây lan diện rộng trong cộng đồng.',
    schedule: 'Giám sát 24/7 – Trực cơ động sẵn sàng',
    feeInfo: 'Đội cơ động trạm phục vụ miễn phí',
    targetAudience: 'Toàn thể hộ dân, trường học, cơ sở sản xuất kinh doanh tại địa bàn phường',
    procedure: [
      'Tiếp nhận thông tin báo dịch từ người dân, bệnh viện hoặc tổ dân phố',
      'Cán bộ y tế xuống hiện trường trong vòng 24 giờ điều tra dịch tễ',
      'Đánh giá chỉ số mật độ muỗi (BI) và bọ gậy',
      'Tổ chức chiến dịch diệt lăng quăng và phun sương ULV diệt muỗi trưởng thành',
      'Tuyên truyền phát tờ rơi hướng dẫn cho các hộ dân lân cận'
    ]
  },
  {
    id: 'quan-ly-benh-khong-lay-nhiem',
    title: 'Quản lý bệnh không lây nhiễm',
    icon: 'cardiology',
    colorScheme: 'secondary',
    shortDesc: 'Lập hồ sơ quản lý và cấp phát thuốc điều trị duy trì đối với bệnh Tăng huyết áp và Đái tháo đường cho bệnh nhân có thẻ BHYT đăng ký tại cơ sở.',
    fullDesc: 'Thực hiện chương trình quốc gia quản lý bệnh không lây nhiễm tại y tế cơ sở. Bệnh nhân tăng huyết áp và đái tháo đường tuýp 2 được lập bệnh án điện tử, khám định kỳ mỗi tháng một lần, theo dõi chỉ số huyết áp, thử đường huyết mao mạch nhanh, cấp phát thuốc điều trị ổn định ngay tại trạm mà không cần lên tuyến trên chen chúc.',
    schedule: 'Cấp thuốc định kỳ hàng tháng theo hẹn của bác sĩ',
    feeInfo: 'BHYT chi trả theo quy định',
    targetAudience: 'Người cao tuổi, người mắc bệnh tăng huyết áp, đái tháo đường ổn định',
    procedure: [
      'Đăng ký tham gia chương trình quản lý bệnh mạn tính tại quầy tiếp đón',
      'Đo huyết áp, cân nặng, chỉ số BMI và xét nghiệm đường huyết mao mạch',
      'Bác sĩ đánh giá đáp ứng điều trị và tư vấn lối sống, giảm muối',
      'Cấp phát thuốc duy trì theo tháng (30 ngày)'
    ]
  },
  {
    id: 'tu-van-dinh-duong-giao-duc',
    title: 'Tư vấn dinh dưỡng & Giáo dục',
    icon: 'nutrition',
    colorScheme: 'primary',
    shortDesc: 'Truyền thông giáo dục sức khỏe tại cộng đồng, hướng dẫn chế độ ăn khoa học cho người cao tuổi, an toàn vệ sinh thực phẩm cho hộ kinh doanh.',
    fullDesc: 'Tổ chức các buổi nói chuyện chuyên đề sức khỏe tại các nhà sinh hoạt cộng đồng, trường mầm non, trường tiểu học; phối hợp kiểm tra định kỳ các cơ sở kinh doanh thức ăn đường phố, nhà hàng ven biển trên địa bàn phường An Hải; hướng dẫn thực hành 10 lời khuyên vàng về an toàn thực phẩm.',
    schedule: 'Theo kế hoạch truyền thông tháng và quý',
    feeInfo: 'Tuyên truyền rộng rãi miễn phí',
    targetAudience: 'Học sinh, phụ huynh, người cao tuổi, các hộ chế biến ẩm thực và kinh doanh ăn uống',
    procedure: [
      'Cung cấp tờ rơi, cẩm nang sức khỏe trực tiếp tại trạm',
      'Tư vấn trực tiếp 1-1 cho các đối tượng nguy cơ',
      'Tổ chức hội thảo tư vấn sức khỏe tại các tổ dân phố'
    ]
  }
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'tb-tiem-chung-thang-10',
    title: 'Thông báo lịch tiêm chủng mở rộng định kỳ tháng 10/2026',
    tag: 'Lịch tiêm chủng',
    tagColor: 'secondary',
    date: '28/09/2026',
    isUrgent: false,
    issuedBy: 'Bộ phận Y tế Dự phòng - Trạm Y tế phường An Hải',
    summary: 'Kính gửi quý phụ huynh trên địa bàn phường An Hải về thời gian, địa điểm và danh mục các mũi tiêm trong tháng 10/2026.',
    content: `Trạm Y tế phường An Hải xin thông báo lịch tổ chức tiêm chủng mở rộng tháng 10/2026 như sau:
- Đợt 1: Ngày 05/10/2026 (Thứ Hai), từ 07:30 đến 11:00 (Ưu tiên trẻ từ 2 tháng đến dưới 1 tuổi tiêm vắc xin 5 trong 1, Bại liệt OPV/IPV).
- Đợt 2: Ngày 20/10/2026 (Thứ Ba), từ 07:30 đến 11:00 (Tiêm vắc xin Sởi, Sởi-Rubella, Viêm não Nhật Bản và tiêm vét các trường hợp hoãn đợt 1).
- Địa điểm: Phòng tiêm chủng Trạm Y tế phường An Hải, số 127 Nguyễn Trung Trực.
Lưu ý cho phụ huynh:
1. Đem theo Sổ tiêm chủng của trẻ hoặc xuất trình thông tin trên ứng dụng VNeID / VssID.
2. Kiểm tra sức khỏe của trẻ trước khi đi tiêm (không đưa trẻ đi tiêm nếu đang sốt cao hoặc mắc bệnh cấp tính nặng).
3. Đảm bảo ở lại theo dõi tại trạm ít nhất 30 phút sau khi tiêm.`
  },
  {
    id: 'tb-phong-dich-mua-mua',
    title: 'Chiến dịch ra quân tổng vệ sinh môi trường, diệt lăng quăng phòng sốt xuất huyết',
    tag: 'Phòng dịch mùa mưa',
    tagColor: 'tertiary',
    date: '25/09/2026',
    isUrgent: true,
    issuedBy: 'Ban Chỉ đạo Chăm sóc Sức khỏe Nhân dân phường An Hải',
    summary: 'Kế hoạch phối hợp với các tổ dân phố tổng vệ sinh môi trường, lật úp dụng cụ chứa nước đọng tại các khu dân cư ven biển và chân cầu Rồng.',
    content: `Thực hiện chỉ đạo của UBND phường An Hải, Trạm Y tế phường An Hải phối hợp cùng Mặt trận Tổ quốc và các đoàn thể địa phương tổ chức chiến dịch ra quân:
1. Thời gian: Từ 07:00 ngày Chủ Nhật (ngày 04/10/2026).
2. Nội dung thực hiện:
- Từng hộ gia đình chủ động kiểm tra bồn hoa, chum vại, xô chậu, lật úp các đồ phế thải chứa nước mưa.
- Thả cá bảy màu vào các bể chứa nước ăn, hòn non bộ, chậu cây cảnh.
- Cán bộ trạm y tế và cộng tác viên dân số sẽ trực tiếp đến từng tổ dân phố để kiểm tra chỉ số bọ gậy (BI) và hỗ trợ thả hóa chất diệt ấu trùng Abate tại các điểm trũng đọng.
"Không có lăng quăng, bọ gậy – Không có sốt xuất huyết!"`
  },
  {
    id: 'tb-kham-suc-khoe-nguoi-cao-tuoi',
    title: 'Kế hoạch khám sức khỏe định kỳ và tầm soát bệnh mạn tính cho Người cao tuổi',
    tag: 'Chăm sóc NCT',
    tagColor: 'primary',
    date: '22/09/2026',
    isUrgent: false,
    issuedBy: 'Tổ Khám chữa bệnh & Quản lý bệnh không lây nhiễm',
    summary: 'Chương trình khám sức khỏe định kỳ miễn phí, sàng lọc bệnh mãn tính cho công dân từ 60 tuổi trở lên đang cư trú tại phường An Hải.',
    content: `Nhằm nâng cao chất lượng cuộc sống cho người cao tuổi trên địa bàn, Trạm Y tế phối hợp với Hội Người cao tuổi phường tổ chức tuần lễ khám sức khỏe:
- Đối tượng: Toàn bộ công dân từ 60 tuổi trở lên (ưu tiên người có thẻ BHYT đăng ký tại y tế cơ sở).
- Nội dung khám: Khám nội tổng quát, đo huyết áp, đo điện tim cơ bản, thử đường huyết mao mạch tầm soát đái tháo đường, tư vấn dinh dưỡng và phòng ngừa té ngã.
- Lịch theo tổ dân phố:
  + Ngày 12/10: Tổ dân phố số 1, 2, 3, 4
  + Ngày 13/10: Tổ dân phố số 5, 6, 7, 8
  + Ngày 14/10: Tổ dân phố số 9, 10, 11, 12
- Thời gian: Sáng từ 07:30 - 11:00.
Kính mời các cụ, các bác đến tham gia đầy đủ để được chăm sóc chu đáo.`
  }
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'tin-tuyen-truyen-dinh-duong',
    title: 'Tuyên truyền dinh dưỡng hợp lý và phòng chống bệnh mạn tính tại Nhà văn hóa cộng đồng',
    category: 'Truyền thông y tế',
    categoryColor: 'primary',
    date: '27/09/2026',
    imageUrl: STATION_INFO.images.news1,
    imageAlt: 'Bác sĩ trạm y tế phường An Hải tư vấn sức khỏe dinh dưỡng cho người cao tuổi',
    author: 'Bs. Tuấn Thọ Sinh',
    summary: 'Hoạt động hướng dẫn người dân đo huyết áp, xây dựng khẩu phần giảm muối bảo vệ sức khỏe tim mạch và quản lý bệnh không lây nhiễm.',
    content: [
      'Sáng ngày 26/09/2026, tại Nhà sinh hoạt cộng đồng phường An Hải, Trạm Y tế phường đã phối hợp cùng Hội Người cao tuổi tổ chức buổi truyền thông chuyên đề "Chế độ dinh dưỡng khoa học và lối sống lành mạnh phòng ngừa tăng huyết áp, đột quỵ".',
      'Tại buổi sinh hoạt, bác sĩ của trạm đã trực tiếp hướng dẫn hơn 80 hội viên cách theo dõi huyết áp đúng kỹ thuật tại nhà, phân tích tác hại của việc ăn mặn đối với thành mạch máu, và cách nhận biết sớm các dấu hiệu cảnh báo tai biến mạch máu não theo quy tắc F.A.S.T.',
      'Cũng tại chương trình, các y bác sĩ đã thực hiện đo huyết áp và test nhanh đường huyết miễn phí cho toàn bộ người dân tham dự, phát hiện 6 trường hợp có chỉ số huyết áp tăng cao chưa từng được chẩn đoán và hướng dẫn lập hồ sơ quản lý tại trạm.'
    ]
  },
  {
    id: 'tin-buoi-tiem-chung-thanh-cong',
    title: 'Hoàn thành buổi tiêm chủng thường kỳ cho trẻ nhỏ đạt tỷ lệ cao và an toàn tuyệt đối',
    category: 'Tiêm chủng mở rộng',
    categoryColor: 'secondary',
    date: '21/09/2026',
    imageUrl: STATION_INFO.images.news2,
    imageAlt: 'Cán bộ y tế trạm thực hiện tiêm chủng an toàn cho trẻ nhỏ',
    author: 'Ys. Nguyễn Thị Lan',
    summary: 'Hơn 120 lượt trẻ em được tiêm chủng an toàn theo đúng quy trình 4 bước nghiêm ngặt, không ghi nhận phản ứng phụ nặng sau tiêm.',
    content: [
      'Trong ngày 20/09/2026, Trạm Y tế phường An Hải đã tổ chức buổi tiêm chủng định kỳ đợt 2 cho trẻ nhỏ và phụ nữ mang thai trên địa bàn.',
      'Công tác tiếp đón, phân luồng được tổ chức khoa học ngay từ sảnh trước. Cán bộ y tế tiến hành kiểm tra thân nhiệt, khám sàng lọc kỹ lưỡng từng trường hợp trước khi ra chỉ định tiêm.',
      'Kết quả trong ngày đã thực hiện tiêm chủng an toàn cho 128 cháu, trong đó có 45 cháu tiêm vắc xin Sởi - Rubella và 32 mũi vắc xin 5 trong 1. Tất cả các trường hợp đều được theo dõi sát sao tại phòng lưu bệnh nhân 30 phút sau tiêm và được bàn giao phiếu hướng dẫn theo dõi phản ứng tại nhà cho gia đình.'
    ]
  },
  {
    id: 'tin-kiem-tra-ve-sinh-thuc-pham',
    title: 'Kiểm tra an toàn vệ sinh thực phẩm và xử lý môi trường tại các khu dân cư ven biển',
    category: 'Vệ sinh phòng dịch',
    categoryColor: 'tertiary',
    date: '18/09/2026',
    imageUrl: STATION_INFO.images.news3,
    imageAlt: 'Đội y tế trạm kiểm tra vệ sinh phòng dịch và môi trường tại các điểm dân cư',
    author: 'Cộng tác viên y tế An Hải',
    summary: 'Đội cơ động trạm phối hợp cùng lực lượng địa phương rà soát các điểm có nguy cơ phát sinh lăng quăng và cơ sở dịch vụ ăn uống.',
    content: [
      'Thực hiện tháng cao điểm phòng chống ngộ độc thực phẩm và phòng chống dịch bệnh mùa mưa, đoàn kiểm tra liên ngành phường An Hải gồm cán bộ Trạm Y tế và Công an phường đã tiến hành kiểm tra thực tế tại 24 cơ sở chế biến thực phẩm và nhà hàng ăn uống trên trục đường ven biển.',
      'Qua kiểm tra, đa số các cơ sở chấp hành nghiêm túc quy định về nguồn gốc xuất xứ thực phẩm, bảo quản nguyên liệu tươi sống và lưu mẫu thức ăn 24 giờ. Đoàn đã nhắc nhở và hướng dẫn khắc phục tại chỗ đối với 2 cơ sở về việc che chắn khu vực chế biến.',
      'Đồng thời, lực lượng cơ động cũng tiến hành kiểm tra các điểm công trình xây dựng, khu đất trống có vật chứa nước mưa để xử lý triệt để bọ gậy, kiên quyết không để bùng phát ổ dịch sốt xuất huyết trên địa bàn.'
    ]
  }
];

export const HEALTH_GUIDES: HealthGuide[] = [
  {
    id: 'huong-dan-nguoi-cao-tuoi',
    title: 'Sức khỏe người cao tuổi & Quản lý huyết áp',
    category: 'Bệnh mạn tính',
    icon: 'elderly',
    colorScheme: 'primary',
    summary: 'Theo dõi huyết áp hàng ngày, duy trì vận động nhẹ nhàng, khám định kỳ và tuân thủ đơn thuốc của bác sĩ cơ sở.',
    fullArticle: {
      overview: 'Tăng huyết áp được mệnh danh là "kẻ giết người thầm lặng" vì thường không có triệu chứng rõ ràng nhưng có thể dẫn đến đột quỵ, nhồi máu cơ tim và suy thận nếu không được kiểm soát tốt.',
      symptoms: [
        'Đau đầu vùng sau gáy, chóng mặt, hoa mắt khi thay đổi tư thế',
        'Cảm giác hồi hộp, đánh trống ngực, mệt mỏi không rõ nguyên nhân',
        'Nóng bừng mặt, chảy máu cam bất thường',
        'Nhiều trường hợp không có bất kỳ triệu chứng nào dù huyết áp rất cao'
      ],
      preventiveSteps: [
        'Đo huyết áp mỗi ngày vào cùng một thời điểm (buổi sáng sau khi thức dậy và nghỉ ngơi 5 phút)',
        'Ăn giảm muối: không quá 5g muối/ngày (tương đương 1 thìa cà phê gạt ngang)',
        'Tập thể dục đi bộ nhẹ nhàng 30 phút mỗi ngày, 5 ngày mỗi tuần',
        'Uống thuốc hạ áp đều đặn mỗi ngày theo chỉ định của bác sĩ, tuyệt đối không tự ý ngừng thuốc khi thấy huyết áp đã về bình thường'
      ],
      whenToSeeDoctor: 'Nếu huyết áp đo được từ 180/120 mmHg trở lên, hoặc xuất hiện đau tức ngực dữ dội, khó thở, méo miệng, yếu liệt nửa người, cần liên hệ trạm y tế hoặc gọi cấp cứu 115 ngay lập tức.'
    }
  },
  {
    id: 'phong-benh-mua-mua-bao',
    title: 'Phòng bệnh mùa mưa bão & Ngập úng',
    category: 'Y tế dự phòng',
    icon: 'thunderstorm',
    colorScheme: 'secondary',
    summary: 'Các biện pháp vệ sinh nguồn nước sinh hoạt, xử lý nấm da, phòng sốt xuất huyết và bệnh đường tiêu hóa khi thời tiết mưa nhiều tại Đà Nẵng.',
    fullArticle: {
      overview: 'Đặc thù thời tiết miền Trung và TP. Đà Nẵng trong các tháng mùa mưa bão dễ phát sinh các bệnh truyền nhiễm qua nguồn nước, nấm chân nước ăn chân, tiêu chảy cấp và sốt xuất huyết do nước tù đọng sinh sôi muỗi vằn.',
      symptoms: [
        'Sốt cao đột ngột, đau nhức hai hốc mắt, đau cơ khớp (dấu hiệu sốt xuất huyết)',
        'Đau quặn bụng, đi ngoài phân lỏng nhiều lần, nôn ói (rối loạn tiêu hóa / ngộ độc nước bẩn)',
        'Da kẽ ngón chân ngứa rát, đỏ, tróc vảy hoặc lở loét (nấm da do ngâm nước bẩn)'
      ],
      preventiveSteps: [
        'Thực hiện "Ăn chín, uống sôi", khử trùng nước sinh hoạt bằng viên Cloramin B được trạm y tế cấp phát',
        'Lau khô chân sau khi tiếp xúc với nước ngập; không ngâm chân lâu trong nước bẩn',
        'Dọn dẹp xô chậu, lật úp tất cả vật dụng đọng nước xung quanh vườn nhà ngay sau mỗi trận mưa',
        'Mắc màn khi ngủ kể cả ban ngày để tránh muỗi Aedes đốt'
      ],
      whenToSeeDoctor: 'Đến trạm y tế ngay khi xuất hiện sốt từ ngày thứ 2, có hiện tượng li bì, nôn ói nhiều hoặc chảy máu chân răng.'
    }
  },
  {
    id: 'dinh-duong-hop-ly',
    title: 'Dinh dưỡng hợp lý & An toàn thực phẩm',
    category: 'Dinh dưỡng cộng đồng',
    icon: 'restaurant',
    colorScheme: 'primary',
    summary: 'Thực đơn cân đối bốn nhóm chất, kiểm soát lượng muối và đường, bổ sung rau xanh và vi chất cho trẻ nhỏ và phụ nữ mang thai.',
    fullArticle: {
      overview: 'Dinh dưỡng hợp lý là nền tảng của hệ miễn dịch khỏe mạnh. Một bữa ăn cân đối cần có đủ 4 nhóm thực phẩm: chất bột đường, chất đạm, chất béo, cùng vitamin và khoáng chất.',
      symptoms: [
        'Trẻ chậm tăng cân, biếng ăn, xanh xao (nguy cơ thiếu máu, thiếu kẽm)',
        'Người lớn tăng cân nhanh, mỡ bụng nhiều, cảm giác uể oải sau ăn (nguy cơ hội chứng chuyển hóa)'
      ],
      preventiveSteps: [
        'Ăn đa dạng ít nhất 15-20 loại thực phẩm mỗi ngày từ các nguồn tự nhiên',
        'Tăng cường ăn rau củ quả tươi (tối thiểu 400g rau xanh/ngày)',
        'Hạn chế đồ uống có ga, nước ngọt đóng chai, thức ăn nhanh chiên xào nhiều dầu mỡ',
        'Chọn thực phẩm tươi sạch, có tem kiểm định an toàn vệ sinh thực phẩm'
      ],
      whenToSeeDoctor: 'Khi gia đình có người bị tiêu chảy liên tục kèm mất nước, sốt sau khi ăn đồ hải sản hoặc thức ăn đường phố, hãy đưa ngay đến trạm y tế để bù điện giải Oresol kịp thời.'
    }
  },
  {
    id: 'khi-nao-den-tram-vs-115',
    title: 'Khi nào cần đến Trạm Y tế vs Khi nào gọi 115?',
    category: 'Phân loại cấp cứu (Triage)',
    icon: 'help_center',
    colorScheme: 'tertiary',
    summary: 'Đến Trạm: Sốt nhẹ, cảm cúm, vết thương nhỏ, cấp thuốc BHYT định kỳ. Gọi 115: Khó thở dữ dội, đau thắt ngực, tai nạn nặng, hôn mê.',
    fullArticle: {
      overview: 'Phân loại đúng tình trạng bệnh giúp người dân tiếp cận điều trị kịp thời nhất, tránh chậm trễ trong các "giờ vàng" cấp cứu đột quỵ hoặc nhồi máu cơ tim, đồng thời giảm quá tải không cần thiết cho các bệnh viện tuyến trên.',
      symptoms: [
        'CẦN ĐẾN TRẠM Y TẾ: Sốt thông thường, viêm họng, ho nhẹ, tiêu chảy nhẹ, vết rách da nông cần khâu/rửa thay băng, tiêm phòng vắc xin, kiểm tra huyết áp định kỳ, nhận thuốc BHYT hàng tháng.',
        'CẦN GỌI 115 HOẶC ĐẾN BỆNH VIỆN LỚN: Đau thắt ngực kéo dài trên 15 phút lan lên vai hoặc hàm; Khó thở dữ dội, thở khò khè tím tái; Méo miệng, nói đớ, yếu liệt tay chân đột ngột; Co giật liên tục, hôn mê sâu; Tai nạn giao thông va đập vùng đầu, gãy xương lớn, mất máu nhiều.'
      ],
      preventiveSteps: [
        'Lưu số điện thoại Trực ban Trạm Y tế phường An Hải: 02363 844075 vào danh bạ người thân',
        'Lưu số Cấp cứu 115 trên phím gọi nhanh của điện thoại người cao tuổi',
        'Chuẩn bị sẵn túi hồ sơ y tế gia đình gồm CCCD, thẻ BHYT và đơn thuốc đang dùng'
      ],
      whenToSeeDoctor: 'Nếu không chắc chắn về mức độ nghiêm trọng, hãy gọi ngay đường dây nóng 02363 844075 để được bác sĩ trực ban hướng dẫn xử trí từ xa.'
    }
  }
];

export const STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Bs.CKI. Tuấn Thọ Sinh',
    role: 'Trưởng Trạm Y tế',
    title: 'Bác sĩ Chuyên khoa I Nội khoa',
    department: 'Ban Điều hành & Khám chữa bệnh',
    phone: '0905.xxx.112',
    experience: 'Hơn 18 năm công tác trong ngành y tế công lập TP. Đà Nẵng, chuyên sâu về quản lý bệnh mạn tính và hồi sức sơ cấp cứu cơ sở.'
  },
  {
    id: 'staff-2',
    name: 'Ys. Nguyễn Thị Lan',
    role: 'Phó Trưởng trạm',
    title: 'Y sĩ Đa khoa - Phụ trách Tiêm chủng',
    department: 'Y tế Dự phòng & Tiêm chủng mở rộng',
    phone: '0905.xxx.334',
    experience: '12 năm kinh nghiệm phụ trách tiêm chủng an toàn, quản lý giám sát dịch tễ sốt xuất huyết và bệnh truyền nhiễm học đường.'
  },
  {
    id: 'staff-3',
    name: 'NHS. Trần Thị Thu Thảo',
    role: 'Nữ Hộ sinh Trưởng',
    title: 'Cử nhân Hộ sinh',
    department: 'Chăm sóc Sức khỏe Sinh sản & KHHGĐ',
    phone: '0905.xxx.556',
    experience: '10 năm đồng hành cùng sản phụ và chăm sóc dinh dưỡng trẻ em dưới 5 tuổi trên địa bàn phường An Hải.'
  },
  {
    id: 'staff-4',
    name: 'Ds. Lê Hoàng Nam',
    role: 'Dược sĩ Phụ trách',
    title: 'Dược sĩ Đại học',
    department: 'Quản lý Dược & Kho thuốc BHYT',
    phone: '0905.xxx.778',
    experience: 'Chịu trách nhiệm bảo quản tủ thuốc GSP, vắc xin dây chuyền lạnh và cấp phát thuốc BHYT cho nhân dân.'
  },
  {
    id: 'staff-5',
    name: 'Đd. Phan Văn Hùng',
    role: 'Điều dưỡng Tiếp đón',
    title: 'Cử nhân Điều dưỡng',
    department: 'Tiếp đón công dân & Sơ cấp cứu',
    phone: '0905.xxx.990',
    experience: 'Phụ trách đo dấu hiệu sinh tồn, hỗ trợ thủ tục BHYT điện tử VNeID và trực cấp cứu 24/7.'
  }
];

/**
 * STAFF_MEMBERS theo cấu trúc bảng professional_staff (dùng cho seed và dữ liệu dự phòng khi API lỗi).
 * Tên hiển thị "Bs.CKI. Tuấn Thọ Sinh" được tách thành chức danh "Bs.CKI." + họ tên "Tuấn Thọ Sinh";
 * website ghép lại đúng như cũ. Trường `title` cũ (hiển thị ở mục "Trình độ") là qualification.
 */
export const STAFF_PROFILES: StaffProfile[] = STAFF_MEMBERS.map((member) => {
  const match = /^(\S+\.)\s+(.+)$/.exec(member.name);
  return {
    id: member.id,
    fullName: match ? match[2] : member.name,
    title: match ? match[1] : null,
    position: member.role,
    department: member.department,
    bio: member.experience,
    qualification: member.title,
    avatarUrl: member.avatarUrl ?? null,
  };
});

export const WEEKLY_DUTY: DutyShift[] = [
  {
    day: 'Thứ Hai',
    date: '30/09/2026',
    leaderOnDuty: 'Bs.CKI. Tuấn Thọ Sinh',
    assistantOnDuty: 'Ys. Nguyễn Thị Lan',
    nurseOnDuty: 'Đd. Phan Văn Hùng',
    phone: '02363 844075',
    status: 'Đang trực'
  },
  {
    day: 'Thứ Ba',
    date: '01/10/2026',
    leaderOnDuty: 'Ys. Nguyễn Thị Lan',
    assistantOnDuty: 'NHS. Trần Thị Thu Thảo',
    nurseOnDuty: 'Đd. Phan Văn Hùng',
    phone: '02363 844075',
    status: 'Kế hoạch'
  },
  {
    day: 'Thứ Tư',
    date: '02/10/2026',
    leaderOnDuty: 'Bs.CKI. Tuấn Thọ Sinh',
    assistantOnDuty: 'Ds. Lê Hoàng Nam',
    nurseOnDuty: 'Đd. Phan Văn Hùng',
    phone: '02363 844075',
    status: 'Kế hoạch'
  },
  {
    day: 'Thứ Năm',
    date: '03/10/2026',
    leaderOnDuty: 'Ys. Nguyễn Thị Lan',
    assistantOnDuty: 'NHS. Trần Thị Thu Thảo',
    nurseOnDuty: 'Đd. Phan Văn Hùng',
    phone: '02363 844075',
    status: 'Kế hoạch'
  },
  {
    day: 'Thứ Sáu',
    date: '04/10/2026',
    leaderOnDuty: 'Bs.CKI. Tuấn Thọ Sinh',
    assistantOnDuty: 'Ds. Lê Hoàng Nam',
    nurseOnDuty: 'Đd. Phan Văn Hùng',
    phone: '02363 844075',
    status: 'Kế hoạch'
  },
  {
    day: 'Thứ Bảy',
    date: '05/10/2026',
    leaderOnDuty: 'Ys. Nguyễn Thị Lan (Trực 24/24)',
    assistantOnDuty: 'Đd. Phan Văn Hùng',
    nurseOnDuty: 'Kíp cấp cứu trực ban 24/7',
    phone: '02363 844075',
    status: 'Kế hoạch'
  },
  {
    day: 'Chủ Nhật',
    date: '06/10/2026',
    leaderOnDuty: 'Bs.CKI. Tuấn Thọ Sinh (Trực 24/24)',
    assistantOnDuty: 'NHS. Trần Thị Thu Thảo',
    nurseOnDuty: 'Kíp cấp cứu trực ban 24/7',
    phone: '02363 844075',
    status: 'Kế hoạch'
  }
];

export const VACCINE_CATALOG: VaccineItem[] = [
  {
    id: 'bcg',
    name: 'Vắc xin BCG',
    diseaseTarget: 'Phòng bệnh Lao phổi và Lao màng não',
    recommendedAge: 'Trẻ sơ sinh trong tháng đầu tiên',
    dosage: '1 mũi duy nhất (tiêm trong da cánh tay trái)',
    notes: 'Vết tiêm thường xuất hiện mụn đỏ rồi tạo sẹo sau 4-6 tuần, là phản ứng miễn dịch bình thường.',
    isNationalProgram: true
  },
  {
    id: 'hep-b-birth',
    name: 'Vắc xin Viêm gan B sơ sinh',
    diseaseTarget: 'Phòng bệnh Viêm gan B lây truyền từ mẹ sang con',
    recommendedAge: 'Trong vòng 24 giờ đầu sau sinh',
    dosage: '1 mũi sơ sinh',
    notes: 'Tiêm càng sớm càng hiệu quả ngăn ngừa virus viêm gan B từ mẹ.',
    isNationalProgram: true
  },
  {
    id: '5-in-1',
    name: 'Vắc xin 5 trong 1 (DPT-VGB-Hib)',
    diseaseTarget: 'Bạch hầu, Ho gà, Uốn ván, Viêm gan B, Viêm phổi/Viêm màng não do vi khuẩn Hib',
    recommendedAge: 'Trẻ đủ 2, 3, 4 tháng tuổi',
    dosage: '3 mũi cách nhau tối thiểu 1 tháng',
    notes: 'Trẻ có thể sốt nhẹ dưới 38.5°C sau tiêm, chườm ấm và cho bú nhiều hơn.',
    isNationalProgram: true
  },
  {
    id: 'polio-opv-ipv',
    name: 'Vắc xin Bại liệt (OPV / IPV)',
    diseaseTarget: 'Phòng bệnh Bại liệt do virus Polio gây tàn tật vận động',
    recommendedAge: 'Uống OPV lúc 2, 3, 4 tháng; Tiêm IPV lúc 5 tháng và 9 tháng',
    dosage: '3 liều uống + 2 mũi tiêm',
    notes: 'An toàn cao, bảo vệ trẻ khỏi biến chứng liệt cơ bắp.',
    isNationalProgram: true
  },
  {
    id: 'measles-single',
    name: 'Vắc xin Sởi đơn',
    diseaseTarget: 'Phòng bệnh Sởi và biến chứng viêm phổi, viêm não',
    recommendedAge: 'Trẻ đủ 9 tháng tuổi',
    dosage: 'Mũi 1 tiêm dưới da',
    notes: 'Không được bỏ qua vì sởi có tốc độ lây lan cực kỳ nhanh qua đường hô hấp.',
    isNationalProgram: true
  },
  {
    id: 'mr-combined',
    name: 'Vắc xin Sởi - Rubella (MR)',
    diseaseTarget: 'Phòng bệnh Sởi và Rubella',
    recommendedAge: 'Trẻ đủ 18 tháng tuổi',
    dosage: 'Mũi 2 củng cố miễn dịch',
    notes: 'Được tiêm nhắc lại để đảm bảo miễn dịch cộng đồng trên 95%.',
    isNationalProgram: true
  },
  {
    id: 'dpt-booster',
    name: 'Vắc xin Bạch hầu - Ho gà - Uốn ván (DPT 4)',
    diseaseTarget: 'Nhắc lại phòng 3 bệnh Bạch hầu, Ho gà, Uốn ván',
    recommendedAge: 'Trẻ từ 18 - 24 tháng tuổi',
    dosage: '1 mũi tiêm bắp',
    notes: 'Củng cố kháng thể chống trực khuẩn bạch hầu cho trẻ chuẩn bị đi mẫu giáo.',
    isNationalProgram: true
  },
  {
    id: 'je-encephalitis',
    name: 'Vắc xin Viêm não Nhật Bản',
    diseaseTarget: 'Phòng tổn thương thần kinh trung ương do virus Viêm não Nhật Bản',
    recommendedAge: 'Trẻ từ 12 tháng tuổi trở lên',
    dosage: 'Mũi 1 lúc 1 tuổi, Mũi 2 sau mũi 1 từ 1-2 tuần, Mũi 3 sau 1 năm',
    notes: 'Bệnh do muỗi Culex truyền, có tỷ lệ di chứng thần kinh cao nếu không phòng bệnh.',
    isNationalProgram: true
  },
  {
    id: 'tetanus-pregnant',
    name: 'Vắc xin Uốn ván (VAT)',
    diseaseTarget: 'Phòng Uốn ván rốn sơ sinh và uốn ván cho mẹ khi sinh nở',
    recommendedAge: 'Phụ nữ mang thai từ tuần thứ 20 trở đi',
    dosage: '2 mũi trong lần mang thai đầu (cách nhau tối thiểu 1 tháng)',
    notes: 'Tạo kháng thể truyền qua nhau thai để bảo vệ bé yêu ngay từ lúc lọt lòng.',
    isNationalProgram: true
  }
];
