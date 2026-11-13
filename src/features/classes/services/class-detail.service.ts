import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import { getClassById } from './class.service';
import type { ClassItem } from '../schemas/class.schema';
import type {
  ClassDetailData,
  ClassCourse,
  ClassAnnouncement,
  GradebookStudent,
  GradebookAiAnalysis,
  ClassMember,
  ClassMaterial,
  CourseTemplate,
} from '../schemas/class-detail.schema';

export const MOCK_CLASS_INFO: ClassItem = {
  id: 'CNTT-K22-01',
  name: 'CNTT-K22-01',
  title: 'Công nghệ thông tin K22 — Nhóm 01',
  description:
    'Không gian học tập và trao đổi dành cho sinh viên Công nghệ thông tin K22. Nơi tổ chức học phần chuyên sâu, bài tập lab và tương tác với trợ lý đồ thị tri thức.',
  academicYear: '2024–2025',
  semester: 'Học kỳ 1 • Niên khóa 2024–2025',
  major: 'Khoa học Máy tính',
  maxStudents: 50,
  enrolledCount: 42,
  enrollmentKey: 'CNTT-K22-01',
  isCodeClosed: false,
  status: 'ACTIVE',
  teachingRole: 'PRIMARY_INSTRUCTOR',
  instructor: {
    id: 'inst-01',
    fullName: 'TS. Lê Hoàng Nam',
    email: 'nam.le@ilms.edu.vn',
  },
  schedule: {
    room: 'Phòng B2-302',
    dayOfWeek: 'Thứ Hai, Thứ Năm',
    timeSlot: 'Ca 2 (09:15 - 11:45)',
  },
};

export const MOCK_COURSES: ClassCourse[] = [
  {
    id: 'course-cs-202',
    code: 'CS-202',
    name: 'Cấu trúc dữ liệu & Giải thuật nâng cao',
    status: 'ACTIVE',
    credits: 3,
    currentWeek: 'Tuần 9/15',
    instructorName: 'TS. Nguyễn Văn An (CN)',
    instructorAvatar: 'NA',
    instructorColor: 'bg-blue-600',
    hasAiTutor: true,
    lecturesCount: 38,
    knowledgeNodesCount: 142,
    quizzesCount: 18,
    teachingProgress: 68,
    specialFeature: 'Đồ thị AVL tự chấm',
    specialFeatureIcon: 'auto_awesome',
    semester: 'Học kỳ II (2024-2025)',
    description: 'Cây nhị phân, Segment Tree, AVL, Dijkstra, quy hoạch động nâng cao.',
  },
  {
    id: 'course-cs-301',
    code: 'CS-301',
    name: 'Thiết kế & Đánh giá Thuật toán Thông minh',
    status: 'ACTIVE',
    credits: 4,
    currentWeek: 'Tuần 7/15',
    instructorName: 'ThS. Lê Hoàng Nam',
    instructorAvatar: 'HN',
    instructorColor: 'bg-indigo-600',
    hasAiTutor: true,
    lecturesCount: 24,
    knowledgeNodesCount: 88,
    quizzesCount: 12,
    teachingProgress: 47,
    specialFeature: 'ABET (Đạt 89% PLO)',
    specialFeatureIcon: 'verified',
    semester: 'Học kỳ II (2024-2025)',
    description: 'Thuật toán xấp xỉ, giải thuật di truyền, tối ưu hóa tổ hợp và chuẩn ABET.',
  },
  {
    id: 'course-it-101',
    code: 'IT-101',
    name: 'Nhập môn Khoa học Máy tính & Tư duy Lập trình',
    status: 'COMPLETED',
    credits: 4,
    currentWeek: 'Đã hoàn thành',
    instructorName: 'Ban Giảng huấn CNTT',
    instructorAvatar: 'IT',
    instructorColor: 'bg-slate-600',
    hasAiTutor: false,
    studentsCount: 42,
    knowledgeNodesCount: 115,
    classAvgScore: 8.4,
    teachingProgress: 100,
    specialFeature: 'Hồ sơ đã lưu trữ',
    specialFeatureIcon: 'lock',
    semester: 'Học kỳ I (2024-2025)',
    description: 'Tư duy tính toán, kiến trúc máy tính cơ bản, thuật toán căn bản với Python.',
  },
  {
    id: 'course-cs-205',
    code: 'CS-205',
    name: 'Cơ sở dữ liệu nâng cao & Đồ thị tri thức',
    status: 'ACTIVE',
    credits: 3,
    currentWeek: 'Tuần 3/15',
    instructorName: 'TS. Đặng Minh Quân',
    instructorAvatar: 'MQ',
    instructorColor: 'bg-emerald-600',
    hasAiTutor: true,
    lecturesCount: 14,
    knowledgeNodesCount: 46,
    chaptersCount: 8,
    teachingProgress: 20,
    specialFeature: 'Bóc tách AI',
    specialFeatureIcon: 'auto_awesome',
    semester: 'Học kỳ II (2024-2025)',
    description: 'Hệ quản trị CSDL phân tán, NoSQL, Neo4j, xây dựng Knowledge Graph.',
  },
];

export const MOCK_TEMPLATES: CourseTemplate[] = [
  {
    id: 'tpl-01',
    title: 'An toàn Không gian Mạng & Phòng thủ Hệ thống',
    badge: 'Khung ABET-CS',
    credits: 4,
    description:
      'Bao gồm 16 Lab mô phỏng tấn công thâm nhập Sandbox, 120 Node tri thức lỗ hổng OWASP Top 10 và 4 bộ đề thi chuẩn hóa.',
    usedCount: 142,
  },
  {
    id: 'tpl-02',
    title: 'Kỹ thuật Phần mềm Chuyên nghiệp (Agile & DevOps)',
    badge: 'Bộ GD&ĐT Chuẩn 2024',
    credits: 3,
    description:
      'Giáo trình tích hợp quy trình CI/CD GitHub Classroom, bộ ma trận PLO tương thích đầu ra đại học và đề thi trắc nghiệm AI.',
    usedCount: 318,
  },
  {
    id: 'tpl-03',
    title: 'Điện toán Đám mây & Kiến trúc Vi dịch vụ (Cloud Native)',
    badge: 'Chứng chỉ Quốc tế',
    credits: 3,
    description:
      'Đầy đủ bài tập thực hành Docker, Kubernetes, đồ thị liên kết dịch vụ AWS/Azure và hệ thống bài kiểm tra thích ứng cá nhân hóa.',
    usedCount: 95,
  },
];

export const MOCK_ANNOUNCEMENTS: ClassAnnouncement[] = [
  {
    id: 'ann-01',
    title: 'Chào mừng các bạn đến với lớp Công nghệ thông tin K22',
    content:
      'Các bạn vui lòng kiểm tra danh sách môn học đã được gắn vào lớp, rà soát lại thông tin cá nhân và cài đặt môi trường lập trình trước buổi học đầu tiên vào thứ Hai tuần tới.',
    authorName: 'TS. Lê Hoàng Nam',
    authorRole: 'Chủ lớp',
    authorInitials: 'LN',
    authorColor: 'bg-blue-700',
    createdAt: '2 ngày trước',
    isPinned: true,
  },
  {
    id: 'ann-02',
    title: 'Lịch thực hành Lab môn Cấu trúc dữ liệu & Giải thuật',
    content:
      'Phòng máy B2-302 đã được bổ sung tài khoản kết nối cụm máy chủ CodeLab. Sinh viên nhóm 01 mang theo laptop cá nhân và thẻ sinh viên khi tham gia.',
    authorName: 'Trần Quốc Huy',
    authorRole: 'Giảng viên',
    authorInitials: 'QH',
    authorColor: 'bg-purple-600',
    createdAt: '5 giờ trước',
    isPinned: false,
  },
];

export const MOCK_GRADEBOOK_STUDENTS: GradebookStudent[] = [
  {
    id: 'stu-01',
    stt: '01',
    name: 'Trần Nhật Minh',
    studentCode: 'SV220101',
    email: 'nhatminh.edu@gmail.com',
    avatar: 'TM',
    avatarColor: 'bg-blue-100 text-blue-700',
    attendanceScore: 10.0,
    quizScore: 9.2,
    labScore: 9.0,
    midtermScore: 8.8,
    finalScore: 9.0,
    letterGrade: 'A',
    ploPercent: 92,
    ploStatus: 'EXCELLENT',
  },
  {
    id: 'stu-02',
    stt: '02',
    name: 'Nguyễn Thu Hương',
    studentCode: 'SV220102',
    email: 'huong.nt@student.edu.vn',
    avatar: 'TH',
    avatarColor: 'bg-purple-100 text-purple-700',
    attendanceScore: 9.5,
    quizScore: 8.5,
    labScore: 8.8,
    midtermScore: 8.2,
    finalScore: 8.6,
    letterGrade: 'A',
    ploPercent: 88,
    ploStatus: 'PASSED',
  },
  {
    id: 'stu-03',
    stt: '03',
    name: 'Lê Hoàng Long',
    studentCode: 'SV220103',
    email: 'long.lh@student.edu.vn',
    avatar: 'HL',
    avatarColor: 'bg-slate-200 text-slate-700',
    attendanceScore: 10.0,
    quizScore: 7.8,
    labScore: 8.0,
    midtermScore: 7.5,
    finalScore: 7.9,
    letterGrade: 'B',
    ploPercent: 81,
    ploStatus: 'PASSED',
  },
  {
    id: 'stu-04',
    stt: '04',
    name: 'Phạm Minh Tuấn',
    studentCode: 'SV220104',
    email: 'tuan.pm@student.edu.vn',
    avatar: 'PT',
    avatarColor: 'bg-rose-100 text-rose-700',
    attendanceScore: 8.0,
    quizScore: 5.2,
    labScore: 5.8,
    midtermScore: 4.8,
    finalScore: 5.6,
    letterGrade: 'C',
    ploPercent: 58,
    ploStatus: 'NEEDS_SUPPORT',
    warning: 'Hổng kiến thức: Cây nhị phân & Segment Tree',
  },
  {
    id: 'stu-05',
    stt: '05',
    name: 'Vũ Thị Lan',
    studentCode: 'SV220105',
    email: 'lan.vt@student.edu.vn',
    avatar: 'VL',
    avatarColor: 'bg-emerald-100 text-emerald-700',
    attendanceScore: 9.0,
    quizScore: 8.0,
    labScore: 8.2,
    midtermScore: 7.8,
    finalScore: 8.0,
    letterGrade: 'B+',
    ploPercent: 83,
    ploStatus: 'PASSED',
  },
];

export const MOCK_GRADEBOOK_AI: GradebookAiAnalysis = {
  averageScore: 7.92,
  ploPassRate: 88.1,
  ploPassedCount: 37,
  totalStudents: 42,
  gradingProgress: '14/16',
  gradingPercent: 95.8,
  earlyInterventionCount: 3,
  distribution: {
    gradeA: { percent: 28, count: 12 },
    gradeB: { percent: 45, count: 19 },
    gradeC: { percent: 20, count: 8 },
    gradeDF: { percent: 7, count: 3 },
  },
  recommendedTopic: 'Cây phân đoạn (Segment Tree) & Tìm đường đi Dijkstra',
  recommendedDescription:
    'Hệ thống nhận diện 3 học viên đang gặp khó khăn ở Quiz 05 (Cây phân đoạn - Segment Tree) và bài thực hành tìm đường đi ngắn nhất trên đồ thị (Dijkstra). Điểm trung bình phần này thấp hơn 32% so với toàn khóa.',
};

export const MOCK_MEMBERS: ClassMember[] = [
  {
    id: 'mem-01',
    name: 'TS. Lê Hoàng Nam',
    email: 'nam.le@ilms.edu.vn',
    role: 'OWNER',
    status: 'APPROVED',
    avatar: 'LN',
    joinedAt: '01/09/2024',
  },
  {
    id: 'mem-02',
    name: 'TS. Nguyễn Văn An',
    email: 'an.nv@ilms.edu.vn',
    role: 'TEACHER',
    status: 'APPROVED',
    avatar: 'NA',
    joinedAt: '01/09/2024',
  },
  {
    id: 'mem-03',
    name: 'Trần Nhật Minh',
    studentCode: '22028192',
    email: 'minh.tn22@sis.edu.vn',
    role: 'STUDENT',
    status: 'APPROVED',
    avatar: 'TM',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBnee4nWlyNVaqQyYH9D-di2Q3z-oTGlDaLOCX1YiBLd38BOb9qgssPI3odkYvDwUVY6HL2v0PhEhoK5LsYO3b3QQSSHIHqwzOV08loHT8spQhzQQl6qvZyumcD34gBQixk_mAoZ9uCL20oIM1dYamydDBzkLSLJh_L7aPGuXOIUGj5lLM2q-FlcwZDQvFMMfo7vKc5uGReBi4-q5MHIqnEZ_LAX2FGqbLpqinGFDuE',
    isClassLeader: true,
    leaderBadge: 'LT',
    attendanceRate: 100,
    knowledgeNodesUnlocked: 79,
    knowledgeNodesTotal: 82,
    knowledgePercent: 96,
    gpa: 9.2,
    learningStatus: 'EXCELLENT',
    statusBadge: 'Top 1 Xuất sắc 🔥',
    joinedAt: '05/09/2024',
  },
  {
    id: 'mem-04',
    name: 'Nguyễn Tuấn Anh',
    studentCode: '22028195',
    email: 'anh.nt22@sis.edu.vn',
    role: 'STUDENT',
    status: 'APPROVED',
    avatar: 'TA',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAM0iyIAtKIVmNk6J_C6zq4m48kjVtG0r3oj2Tv9LdbwIlwJ_o0Gve91ud03OJX_6QZbsbTfG5TOqjhhyP7JKLtZbD3RDWNJtzfbXrcuO2n12LqMRtKfK-R4NyEP_ih2f-rK9eJLKzxiMbmbvJrcDDSo1oX-xjLv_nUyESC3BC7cAZBIqwsk--HfCkU5wSU_r8loxYkpSGgSMAX9DkMZefp3gZ7F4Yr-SmLWNeBll9S',
    attendanceRate: 95,
    knowledgeNodesUnlocked: 70,
    knowledgeNodesTotal: 82,
    knowledgePercent: 85,
    gpa: 8.8,
    learningStatus: 'ACTIVE',
    statusBadge: 'Tích cực',
    joinedAt: '05/09/2024',
  },
  {
    id: 'mem-05',
    name: 'Lê Hoàng Yến',
    studentCode: '22028198',
    email: 'yen.lh22@sis.edu.vn',
    role: 'STUDENT',
    status: 'APPROVED',
    avatar: 'HY',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrxzlCcZXA8_bs74SNDius1dT82_MpI7vzq1etmx--k7pHnCSotNddCkssy-bSEd2lI3luIbwkttrQSBwcTPtMRddXpKs3fveN1OpkVg2jvTSw3ygGcx1DARiFIVbTr5KZhHrH76rhUhA_sWnHjN44tPYV7DXbA4v_VtV1txIabiZJTFFaLwCz0D34yS0GzEqgupCRpC1O6xT42ipr3jrXvJc8ZNTbQxA8Kg7_Ex4Y',
    attendanceRate: 90,
    knowledgeNodesUnlocked: 65,
    knowledgeNodesTotal: 82,
    knowledgePercent: 79,
    gpa: 8.4,
    learningStatus: 'ACTIVE',
    statusBadge: 'Tích cực',
    joinedAt: '05/09/2024',
  },
  {
    id: 'mem-06',
    name: 'Phạm Văn Hùng',
    studentCode: '22028204',
    email: 'hung.pv22@sis.edu.vn',
    role: 'STUDENT',
    status: 'APPROVED',
    avatar: 'PH',
    attendanceRate: 72,
    knowledgeNodesUnlocked: 38,
    knowledgeNodesTotal: 82,
    knowledgePercent: 46,
    gpa: 5.5,
    learningStatus: 'NEED_HELP',
    statusBadge: 'Cần trợ giúp ⚠️',
    statusDetail: '(Hổng cây AVL)',
    joinedAt: '05/09/2024',
  },
  {
    id: 'mem-07',
    name: 'Đỗ Minh Châu',
    studentCode: '22028210',
    email: 'chau.dm22@sis.edu.vn',
    role: 'STUDENT',
    status: 'APPROVED',
    avatar: 'MC',
    attendanceRate: 88,
    knowledgeNodesUnlocked: 62,
    knowledgeNodesTotal: 82,
    knowledgePercent: 75,
    gpa: 7.9,
    learningStatus: 'NORMAL',
    statusBadge: 'Bình thường',
    joinedAt: '05/09/2024',
  },
  {
    id: 'mem-08',
    name: 'Vũ Đức Long',
    studentCode: '22028215',
    email: 'long.vd22@sis.edu.vn',
    role: 'STUDENT',
    status: 'APPROVED',
    avatar: 'DL',
    attendanceRate: 65,
    knowledgeNodesUnlocked: 30,
    knowledgeNodesTotal: 82,
    knowledgePercent: 36,
    gpa: 4.8,
    learningStatus: 'AT_RISK',
    statusBadge: 'Nguy cơ trượt ⚠️',
    statusDetail: '(Vắng 3 buổi)',
    joinedAt: '05/09/2024',
  },
  {
    id: 'mem-09',
    name: 'Trịnh Mai Lan',
    studentCode: '22028220',
    email: 'lan.tm22@sis.edu.vn',
    role: 'STUDENT',
    status: 'APPROVED',
    avatar: 'ML',
    attendanceRate: 98,
    knowledgeNodesUnlocked: 75,
    knowledgeNodesTotal: 82,
    knowledgePercent: 91,
    gpa: 9.0,
    learningStatus: 'ACTIVE',
    statusBadge: 'Tích cực',
    joinedAt: '05/09/2024',
  },
  {
    id: 'mem-10',
    name: 'Hoàng Gia Bảo',
    studentCode: '22028225',
    email: 'bao.hg22@sis.edu.vn',
    role: 'STUDENT',
    status: 'APPROVED',
    avatar: 'GB',
    attendanceRate: 92,
    knowledgeNodesUnlocked: 68,
    knowledgeNodesTotal: 82,
    knowledgePercent: 82,
    gpa: 8.2,
    learningStatus: 'NORMAL',
    statusBadge: 'Bình thường',
    joinedAt: '05/09/2024',
  },
];

export const MOCK_MATERIALS: ClassMaterial[] = [
  {
    id: 'mat-01',
    stt: '01',
    title: 'Giao_trinh_Cau_truc_du_lieu_v2.pdf',
    filename: 'Giao_trinh_Cau_truc_du_lieu_v2.pdf',
    subjectName: 'Cấu trúc DL & GT',
    subjectCode: 'CS-202',
    category: 'Giáo trình chính',
    categoryType: 'syllabus',
    format: 'PDF',
    size: '18.5 MB',
    updatedAt: 'Hôm qua, 14:20',
    aiStatus: '100% Đã kết nối Đồ thị',
    aiStatusType: 'synced',
    viewsCount: 142,
    isPinned: true,
    badge: 'Ghim',
    subDetail: '18 thực thể: Segment Tree, AVL, Fenwick...',
  },
  {
    id: 'mat-02',
    stt: '02',
    title: 'Slide_Chuong05_Cay_phan_doan.pptx',
    filename: 'Slide_Chuong05_Cay_phan_doan.pptx',
    subjectName: 'Cấu trúc DL & GT',
    subjectCode: 'CS-202',
    category: 'Slide bài giảng',
    categoryType: 'slide',
    format: 'PPTX',
    size: '12.4 MB',
    updatedAt: '02/10/2024',
    aiStatus: 'Sẵn sàng AI Tutor',
    aiStatusType: 'ready',
    viewsCount: 42,
    isPinned: false,
    subDetail: 'TS. Lê Hoàng Nam • 2 ngày trước',
  },
  {
    id: 'mat-03',
    stt: '03',
    title: 'De_thi_mau_Giua_ky_Thuat_toan.pdf',
    filename: 'De_thi_mau_Giua_ky_Thuat_toan.pdf',
    subjectName: 'Cấu trúc DL & GT',
    subjectCode: 'CS-202',
    category: 'Đề thi & Quiz',
    categoryType: 'quiz',
    format: 'QUIZ',
    size: '3.2 MB',
    updatedAt: '28/09/2024',
    aiStatus: 'Auto-Quiz Tự động',
    aiStatusType: 'quiz',
    viewsCount: 89,
    isPinned: false,
    badge: 'Bloom 3',
    subDetail: 'Bộ đề thi ôn tập có kèm lời giải chi tiết',
  },
  {
    id: 'mat-04',
    stt: '04',
    title: 'SourceCode_Lab05_SegmentTree.zip',
    filename: 'SourceCode_Lab05_SegmentTree.zip',
    subjectName: 'Cấu trúc DL & GT',
    subjectCode: 'CS-202',
    category: 'Mã nguồn Lab',
    categoryType: 'code',
    format: 'CODE',
    size: '1.8 MB',
    updatedAt: '25/09/2024',
    aiStatus: 'Code Linter OK',
    aiStatusType: 'code',
    viewsCount: 67,
    isPinned: false,
    badge: 'C++ 20',
    subDetail: 'Mã nguồn starter pack & 15 testcase',
  },
  {
    id: 'mat-05',
    stt: '05',
    title: 'De_cuong_chi_tiet_Mon_Hoc.pdf',
    filename: 'De_cuong_chi_tiet_Mon_Hoc.pdf',
    subjectName: 'Cấu trúc DL & GT',
    subjectCode: 'CS-202',
    category: 'Đề cương',
    categoryType: 'curriculum',
    format: 'PDF',
    size: '850 KB',
    updatedAt: '15/09/2024',
    aiStatus: 'Chuẩn hóa PLO',
    aiStatusType: 'standard',
    viewsCount: 180,
    isPinned: false,
    badge: 'Đã duyệt',
    subDetail: 'Khung năng lực PLO & Chuẩn ABET 2024',
  },
];

/**
 * Fetch full class detail bundle with graceful API connect & fallback.
 */
export async function getClassDetailData(classId: string): Promise<ClassDetailData> {
  let classInfo: ClassItem = { ...MOCK_CLASS_INFO, id: classId };
  let courses: ClassCourse[] = MOCK_COURSES;
  let announcements: ClassAnnouncement[] = MOCK_ANNOUNCEMENTS;
  let members: ClassMember[] = MOCK_MEMBERS;
  let materials: ClassMaterial[] = MOCK_MATERIALS;

  try {
    const fetched = await getClassById(classId);
    if (fetched && fetched.id) {
      classInfo = fetched;
    }
  } catch {
    // Backend endpoint not active or mock ID, use mock class info
  }

  try {
    const { data: coursesRes } = await api.get<ApiResponse<ClassCourse[]>>(
      `/classes/${classId}/courses`
    );
    if (coursesRes?.data && Array.isArray(coursesRes.data) && coursesRes.data.length > 0) {
      courses = coursesRes.data;
    }
  } catch {
    // Fallback to mock courses
  }

  try {
    const { data: annRes } = await api.get<ApiResponse<ClassAnnouncement[]>>(
      `/classes/class/${classId}/Announcements`
    );
    if (annRes?.data && Array.isArray(annRes.data) && annRes.data.length > 0) {
      announcements = annRes.data;
    }
  } catch {
    // Fallback to mock announcements
  }

  try {
    const { data: memRes } = await api.get<ApiResponse<ClassMember[]>>(
      `/classes/${classId}/members`
    );
    if (memRes?.data && Array.isArray(memRes.data) && memRes.data.length > 0) {
      members = memRes.data;
    }
  } catch {
    // Fallback to mock members
  }

  return {
    classInfo,
    courses,
    announcements,
    gradebookStudents: MOCK_GRADEBOOK_STUDENTS,
    gradebookAi: MOCK_GRADEBOOK_AI,
    members,
    materials,
    courseTemplates: MOCK_TEMPLATES,
  };
}

/**
 * Assign a course to class.
 * Endpoint: POST /api/v1/classes/{classId}/courses
 */
export async function assignCourseToClass(
  classId: string,
  courseId: string
): Promise<void> {
  try {
    await api.post<ApiResponse<unknown>>(`/classes/${classId}/courses`, { courseId });
  } catch {
    // Local simulation fallback
  }
}

/**
 * Remove a course from class.
 */
export async function removeCourseFromClass(
  classId: string,
  courseId: string
): Promise<void> {
  try {
    await api.delete<ApiResponse<unknown>>(`/classes/${classId}/courses/${courseId}`);
  } catch {
    // Local simulation fallback
  }
}

/**
 * Post a new announcement.
 * Endpoint: POST /api/v1/classes/class/{classId}/Announcements
 */
export async function postClassAnnouncement(
  classId: string,
  payload: { title: string; content: string }
): Promise<void> {
  try {
    await api.post<ApiResponse<unknown>>(`/classes/class/${classId}/Announcements`, payload);
  } catch {
    // Local simulation fallback
  }
}

/**
 * Approve a pending member request.
 * Endpoint: POST /api/v1/classes/{classId}/approve
 */
export async function approveMember(classId: string, userId: string): Promise<void> {
  try {
    await api.post<ApiResponse<unknown>>(`/classes/${classId}/approve`, { userId });
  } catch {
    // Local simulation fallback
  }
}

