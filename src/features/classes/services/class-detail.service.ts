import { api } from '@/lib/axios';
import { ApiError, type ApiResponse, type PaginatedResponse } from '@/types/common';
import { getClassById, normalizeClassApiId, type ClassLookupResult } from './class.service';
import type { ClassItem } from '../schemas/class.schema';
import { classOverviewResponseSchema } from '../schemas/class-detail.schema';
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
  enrolledCount: 0,
  enrollmentKey: 'CNTT-K22-01',
  isCodeClosed: false,
  status: 'ACTIVE',
  teachingRole: 'PRIMARY_INSTRUCTOR',
  instructor: {
    id: 'inst-01',
    fullName: '',
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
    instructorColor: 'bg-[#007BFF]',
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
    title: 'Lịch kiểm tra giữa kỳ Quiz 05 & Thực hành Cây Cân Bằng AVL',
    content:
      'Nhắc nhở toàn thể 42 sinh viên lớp CNTT-K22-01: Bài thi kiểm tra thực hành giải thuật giữa kỳ sẽ diễn ra vào tiết 3-5 thứ Sáu tuần này tại phòng Lab 402. Sinh viên cần chủ động rà soát toàn bộ kỹ thuật xoay cây LL, RR, LR, RL và cài đặt mã nguồn trực tiếp trên hệ thống Sandbox ILMS. Đề cương chi tiết và bộ test case mẫu được đính kèm bên dưới.',
    authorName: 'TS. Nguyễn Văn An',
    authorRole: 'Giảng viên Chủ nhiệm',
    authorInitials: 'AN',
    authorColor: 'bg-primary text-on-primary',
    createdAt: 'Đăng 2 giờ trước • Ngày 24/03/2025',
    isPinned: true,
    pinBadge: 'ĐÃ GHIM - QUAN TRỌNG',
    badgeType: 'error',
    attachments: [
      {
        name: 'De_Cuong_On_Tap_AVL_Tree_Quiz05_2025.pdf',
        size: '1.2 MB',
        desc: 'Tài liệu chính thức bộ môn Cấu trúc dữ liệu',
        type: 'pdf',
      },
    ],
    readCount: 40,
    totalStudents: 42,
    readPercent: 95,
    commentsCount: 8,
  },
  {
    id: 'ann-02',
    title: 'Mở đợt bổ sung nộp lại bài tập Lab 04 cho các bạn bị trừ điểm',
    content:
      'Hệ thống đã mở cổng nộp bổ sung cho 6 bạn sinh viên gặp lỗi biên dịch ở bài Lab 04 (Binary Search Tree). Lưu ý: Điểm nộp bổ sung được tính tối đa 80% thang điểm bài gốc. Cổng nộp tự động đóng chuẩn xác không gia hạn.',
    authorName: 'TS. Nguyễn Văn An',
    authorRole: 'Giảng viên Chủ nhiệm',
    authorInitials: 'AN',
    authorColor: 'bg-primary text-on-primary',
    createdAt: 'Đăng hôm qua lúc 16:30',
    isPinned: true,
    pinBadge: 'ĐÃ GHIM',
    badgeType: 'secondary',
    dueText: 'Thời hạn nộp lại: 23:59 ngày mai (25/03/2025)',
    tag: 'Lab_04_BST_Resubmit',
    readCount: 36,
    totalStudents: 42,
    readPercent: 86,
    commentsCount: 3,
  },
  {
    id: 'ann-03',
    title: 'Cập nhật tài liệu tham khảo bài giảng Tuần 09 - Segment Tree & Fenwick Tree',
    content:
      'Chào cả lớp, thầy đã đăng tải toàn bộ Slide bài giảng và mã nguồn Starter Code C++ cho dạng bài toán Range Minimum Query (RMQ). Các bạn tải về để chuẩn bị trước câu hỏi cho buổi seminar lý thuyết tuần tới nhé.',
    authorName: 'ThS. Lê Hoàng Nam',
    authorRole: 'Giảng viên Thực hành',
    authorInitials: 'HN',
    authorColor: 'bg-secondary text-on-secondary',
    createdAt: 'Đăng 3 ngày trước • 21/03/2025',
    isPinned: false,
    attachments: [
      {
        name: 'Slide_Week09_Fenwick.pptx',
        size: '3.4 MB',
        desc: 'Bài giảng lý thuyết RMQ & Fenwick Tree',
        type: 'pptx',
      },
      {
        name: 'RMQ_StarterCode.cpp',
        size: '12 KB',
        desc: 'Mã nguồn C++ mẫu chuẩn O(log N)',
        type: 'cpp',
      },
    ],
    readCount: 42,
    totalStudents: 42,
    readPercent: 100,
    commentsCount: 5,
  },
  {
    id: 'ann-04',
    title: 'Khảo sát ý kiến sinh viên về buổi phụ đạo AI Socratic cuối tuần',
    content:
      'Thầy tổ chức một buổi Live Coding giải đáp thắc mắc cùng trợ giảng AI Mentor. Mời các em vote khung thời gian phù hợp nhất:',
    authorName: 'TS. Nguyễn Văn An',
    authorRole: 'Bình chọn lớp',
    authorInitials: 'AN',
    authorColor: 'bg-primary text-on-primary',
    createdAt: 'Đăng 5 ngày trước',
    isPinned: false,
    badgeType: 'poll',
    poll: {
      totalVotes: 35,
      options: [
        {
          id: 'opt-a',
          label: 'A. Tối Thứ Bảy (19:30 - 21:00)',
          votes: 24,
          percent: 68.5,
        },
        {
          id: 'opt-b',
          label: 'B. Sáng Chủ Nhật (09:00 - 10:30)',
          votes: 8,
          percent: 22.8,
        },
        {
          id: 'opt-c',
          label: 'C. Chiều Chủ Nhật (15:00 - 16:30)',
          votes: 3,
          percent: 8.7,
        },
      ],
      deadlineText: 'Bình chọn sẽ khóa vào 18:00 Thứ Sáu',
    },
  },
  {
    id: 'ann-05',
    title: 'Thông báo nghỉ học bù môn Cơ sở dữ liệu sang thứ Bảy',
    content:
      'Do giảng viên bận tham gia hội nghị Khoa học Công nghệ tại Hà Nội, buổi học thứ Năm được dời sang tiết 1-3 sáng thứ Bảy tại Giảng đường B201.',
    authorName: 'TS. Nguyễn Văn An',
    authorRole: 'Giảng viên Chủ nhiệm',
    authorInitials: 'AN',
    authorColor: 'bg-slate-700 text-white',
    createdAt: 'Đăng tuần trước • 14/03/2025',
    isPinned: false,
    isArchived: true,
    readCount: 41,
    totalStudents: 42,
    readPercent: 98,
    commentsCount: 0,
  },
];

export const MOCK_GRADEBOOK_STUDENTS: GradebookStudent[] = [
  {
    id: 'stu-01',
    stt: '01',
    name: '',
    studentCode: '22028192',
    email: 'minh.tn22@vnu.edu.vn',
    avatar: 'TM',
    avatarColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    attendanceScore: 10.0,
    quizScore: 9.6,
    labScore: 9.8,
    midtermScore: 9.5,
    finalScore: 9.2,
    totalGpa: 9.45,
    letterGrade: 'A+ (4.0)',
    ploPercent: 95,
    ploStatus: 'EXCELLENT',
    plo1: { percent: 98, status: '98% Đạt' },
    plo2: { percent: 95, status: '95% Đạt' },
    plo3: { percent: 92, status: '92% Đạt' },
    plo4: { percent: 94, status: '94% Đạt' },
  },
  {
    id: 'stu-02',
    stt: '02',
    name: 'Lê Hoàng Yến',
    studentCode: '22028198',
    email: 'yen.lh22@vnu.edu.vn',
    avatar: 'HY',
    avatarColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    attendanceScore: 9.5,
    quizScore: 9.0,
    labScore: 9.2,
    midtermScore: 8.8,
    finalScore: 8.5,
    totalGpa: 8.87,
    letterGrade: 'A (3.8)',
    ploPercent: 89,
    ploStatus: 'EXCELLENT',
    plo1: { percent: 92, status: '92% Đạt' },
    plo2: { percent: 90, status: '90% Đạt' },
    plo3: { percent: 86, status: '86% Đạt' },
    plo4: { percent: 88, status: '88% Đạt' },
  },
  {
    id: 'stu-03',
    stt: '03',
    name: 'Nguyễn Tuấn Anh',
    studentCode: '22028195',
    email: 'anh.nt22@vnu.edu.vn',
    avatar: 'TA',
    avatarColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    attendanceScore: 9.0,
    quizScore: 8.2,
    labScore: 8.0,
    midtermScore: 7.8,
    finalScore: 7.5,
    totalGpa: 7.92,
    letterGrade: 'B+ (3.2)',
    ploPercent: 79,
    ploStatus: 'PASSED',
    plo1: { percent: 82, status: '82% Đạt' },
    plo2: { percent: 80, status: '80% Đạt' },
    plo3: { percent: 75, status: '75% Đạt' },
    plo4: { percent: 78, status: '78% Đạt' },
  },
  {
    id: 'stu-04',
    stt: '04',
    name: 'Đỗ Minh Châu',
    studentCode: '22028210',
    email: 'chau.dm22@vnu.edu.vn',
    avatar: 'MC',
    avatarColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    attendanceScore: 10.0,
    quizScore: 8.6,
    labScore: 8.4,
    midtermScore: 8.0,
    finalScore: 8.2,
    totalGpa: 8.34,
    letterGrade: 'B+ (3.5)',
    ploPercent: 83,
    ploStatus: 'PASSED',
    plo1: { percent: 85, status: '85% Đạt' },
    plo2: { percent: 84, status: '84% Đạt' },
    plo3: { percent: 80, status: '80% Đạt' },
    plo4: { percent: 83, status: '83% Đạt' },
  },
  {
    id: 'stu-05',
    stt: '05',
    name: 'Phạm Văn Hùng',
    studentCode: '22028204',
    email: 'hung.pv22@vnu.edu.vn',
    avatar: 'VH',
    avatarColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    attendanceScore: 6.0,
    quizScore: 4.5,
    labScore: 4.8,
    midtermScore: 4.2,
    finalScore: 4.0,
    totalGpa: 4.39,
    letterGrade: 'F (0.0)',
    ploPercent: 43,
    ploStatus: 'NEEDS_SUPPORT',
    warning: 'Cảnh báo hổng PLO-03',
    plo1: { percent: 52, status: '52% Đạt' },
    plo2: { percent: 48, status: '48% Cần rèn' },
    plo3: { percent: 32, status: '32% Hổng', isHole: true },
    plo4: { percent: 41, status: '41% Cần rèn' },
  },
  {
    id: 'stu-06',
    stt: '06',
    name: 'Vũ Đức Long',
    studentCode: '22028215',
    email: 'long.vd22@vnu.edu.vn',
    avatar: 'DL',
    avatarColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    attendanceScore: 7.0,
    quizScore: 5.0,
    labScore: 4.5,
    midtermScore: 4.0,
    finalScore: 4.5,
    totalGpa: 4.68,
    letterGrade: 'D (1.0)',
    ploPercent: 46,
    ploStatus: 'NEEDS_SUPPORT',
    warning: 'Cảnh báo hổng PLO-03',
    plo1: { percent: 55, status: '55% Đạt' },
    plo2: { percent: 50, status: '50% Cần rèn' },
    plo3: { percent: 35, status: '35% Hổng', isHole: true },
    plo4: { percent: 44, status: '44% Cần rèn' },
  },
  {
    id: 'stu-07',
    stt: '07',
    name: 'Trịnh Mai Lan',
    studentCode: '22028220',
    email: 'lan.tm22@vnu.edu.vn',
    avatar: 'ML',
    avatarColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    attendanceScore: 10.0,
    quizScore: 9.2,
    labScore: 9.0,
    midtermScore: 9.0,
    finalScore: 8.8,
    totalGpa: 9.06,
    letterGrade: 'A (3.9)',
    ploPercent: 91,
    ploStatus: 'EXCELLENT',
    plo1: { percent: 94, status: '94% Đạt' },
    plo2: { percent: 92, status: '92% Đạt' },
    plo3: { percent: 88, status: '88% Đạt' },
    plo4: { percent: 90, status: '90% Đạt' },
  },
  {
    id: 'stu-08',
    stt: '08',
    name: 'Hoàng Gia Bảo',
    studentCode: '22028225',
    email: 'bao.hg22@vnu.edu.vn',
    avatar: 'GB',
    avatarColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
    attendanceScore: 10.0,
    quizScore: 9.4,
    labScore: 9.6,
    midtermScore: 9.2,
    finalScore: 9.0,
    totalGpa: 9.28,
    letterGrade: 'A+ (4.0)',
    ploPercent: 93,
    ploStatus: 'EXCELLENT',
    plo1: { percent: 96, status: '96% Đạt' },
    plo2: { percent: 95, status: '95% Đạt' },
    plo3: { percent: 91, status: '91% Đạt' },
    plo4: { percent: 93, status: '93% Đạt' },
  },
];

export const MOCK_GRADEBOOK_AI: GradebookAiAnalysis = {
  averageScore: 8.24,
  ploPassRate: 88.1,
  ploPassedCount: 37,
  totalStudents: 42,
  gradingProgress: '14/16',
  gradingPercent: 95.8,
  earlyInterventionCount: 2,
  distribution: {
    gradeA: { percent: 52.4, count: 22 },
    gradeB: { percent: 28.6, count: 12 },
    gradeC: { percent: 14.3, count: 6 },
    gradeDF: { percent: 4.7, count: 2 },
  },
  recommendedTopic: 'Cây AVL & Cây Đỏ - Đen (PLO-03)',
  recommendedDescription:
    'Phát hiện 2 SV (Phạm Văn Hùng, Vũ Đức Long) bị hổng nặng chuẩn PLO-03, cần kích hoạt bài test phục hồi điểm và mô hình Đôi bạn cùng tiến.',
};

export const MOCK_MEMBERS: ClassMember[] = [
  {
    id: 'mem-01',
    name: '',
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
    name: '',
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
    subDetail: ' • 2 ngày trước',
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

const ANNOUNCEMENT_STORAGE_KEY = (classId: string) => `ilms_announcements_${classId}`;

export function getLocalAnnouncements(classId: string): ClassAnnouncement[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY(classId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalAnnouncement(classId: string, item: ClassAnnouncement): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalAnnouncements(classId);
    const updated = [item, ...existing.filter((x) => x.id !== item.id)];
    localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY(classId), JSON.stringify(updated));
  } catch {
    // quota exceeded or storage disabled
  }
}

const CLASS_COURSE_STORAGE_KEY = (classId: string) => `ilms_class_courses_${classId}`;

export function getLocalClassCourses(classId: string): ClassCourse[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CLASS_COURSE_STORAGE_KEY(classId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalClassCourse(classId: string, item: ClassCourse): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalClassCourses(classId);
    const updated = [item, ...existing.filter((x) => x.id !== item.id)];
    localStorage.setItem(CLASS_COURSE_STORAGE_KEY(classId), JSON.stringify(updated));
  } catch {
    // quota exceeded or storage disabled
  }
}

export async function getClassInfoDetail(classId: string): Promise<ClassLookupResult> {
  const apiId = normalizeClassApiId(classId);
  const isRawUuid = (str?: string | null) =>
    Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim()));
  const fallbackTitle = isRawUuid(apiId) ? 'Lớp học' : apiId;
  const fallbackName = isRawUuid(apiId) ? 'Lớp học' : apiId;

  try {
    const fetched = await getClassById(apiId);
    if (fetched && fetched.id) {
      const bestTitle =
        fetched.title && !isRawUuid(fetched.title)
          ? fetched.title
          : fetched.name && !isRawUuid(fetched.name)
          ? fetched.name
          : fallbackTitle;

      const bestName =
        fetched.name && !isRawUuid(fetched.name)
          ? fetched.name
          : fallbackName;

      return {
        ...fetched,
        id: normalizeClassApiId(fetched.id),
        title: bestTitle,
        name: bestName,
      };
    }
  } catch {
    // Fallback below
  }
  return {
    id: apiId,
    name: fallbackName,
    title: fallbackTitle,
    description: '',
    academicYear: '2026-2027',
    semester: '2026-2027',
    major: 'Khoa học Máy tính',
    maxStudents: 60,
    enrolledCount: 0,
    enrollmentKey: fallbackName,
    isCodeClosed: false,
    status: 'ACTIVE',
    teachingRole: 'STUDENT',
    instructor: {
      fullName: 'Chưa phân công',
    },
    schedule: {
      room: 'Chưa xếp phòng',
      dayOfWeek: 'Chưa xếp lịch',
      timeSlot: 'Linh hoạt',
    },
  };
}

export async function getClassCourses(classId: string): Promise<ClassCourse[]> {
  const apiId = normalizeClassApiId(classId);
  let courses: ClassCourse[] = [];
  try {
    const { data: coursesRes } = await api.get<ApiResponse<unknown>>(
      `/classes/${apiId}/courses`
    );
    const list = extractArrayPayload(coursesRes?.data ?? coursesRes);
    courses = list.map((entry) => {
      const rec = entry as Record<string, unknown>;
      const teacher =
        rec.assignedTeacher && typeof rec.assignedTeacher === 'object'
          ? (rec.assignedTeacher as Record<string, unknown>)
          : undefined;
      const nestedCourse =
        rec.course && typeof rec.course === 'object'
          ? (rec.course as Record<string, unknown>)
          : undefined;
      return {
        id: String(rec.courseId ?? rec.id ?? nestedCourse?.id ?? ''),
        code: String(rec.courseCode ?? rec.code ?? nestedCourse?.courseCode ?? ''),
        name: String(
          rec.courseTitle ??
          rec.courseName ??
          rec.name ??
          rec.title ??
          nestedCourse?.title ??
          nestedCourse?.name ??
          ''
        ),
        status: (rec.status === 'PENDING' || rec.status === 'COMPLETED' ? rec.status : 'ACTIVE') as ClassCourse['status'],
        credits:
          rec.credits !== undefined
            ? Number(rec.credits)
            : nestedCourse?.credits !== undefined
              ? Number(nestedCourse.credits)
              : undefined,
        description: rec.description
          ? String(rec.description)
          : nestedCourse?.description
            ? String(nestedCourse.description)
            : undefined,
        instructorName: teacher?.fullName
          ? String(teacher.fullName)
          : rec.teacherName
            ? String(rec.teacherName)
            : rec.instructorName
              ? String(rec.instructorName)
              : undefined,
        studentsCount:
          rec.studentsCount !== undefined ? Number(rec.studentsCount) : undefined,
        knowledgeNodesCount:
          rec.knowledgeNodesCount !== undefined
            ? Number(rec.knowledgeNodesCount)
            : undefined,
        classAvgScore:
          rec.classAvgScore !== undefined ? Number(rec.classAvgScore) : undefined,
        teachingProgress:
          rec.teachingProgress !== undefined
            ? Number(rec.teachingProgress)
            : undefined,
        backgroundUrl: rec.backgroundUrl
          ? String(rec.backgroundUrl)
          : rec.courseBackgroundUrl
            ? String(rec.courseBackgroundUrl)
            : nestedCourse?.backgroundUrl
              ? String(nestedCourse.backgroundUrl)
              : rec.thumbnailUrl
                ? String(rec.thumbnailUrl)
                : undefined,
        thumbnailUrl: rec.thumbnailUrl ? String(rec.thumbnailUrl) : undefined,
      };
    });
  } catch {
    courses = [];
  }
  const localSubjects = getLocalClassCourses(apiId);
  if (localSubjects.length > 0) {
    const existingCourseIds = new Set(courses.map((c) => c.id));
    const newCourses = localSubjects.filter((c) => !existingCourseIds.has(c.id));
    courses = [...newCourses, ...courses];
  }
  return courses;
}

function mapAnnouncementRecord(entry: unknown, fallbackIdx = 0): ClassAnnouncement {
  const rec = (entry && typeof entry === 'object' ? entry : {}) as Record<string, unknown>;
  const authorObj =
    rec.author && typeof rec.author === 'object'
      ? (rec.author as Record<string, unknown>)
      : undefined;
  const authorName = String(
    rec.authorName ?? authorObj?.fullName ?? authorObj?.name ?? 'Giảng viên'
  );
  const initials =
    authorName
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || 'GV';

  return {
    id: String(rec.id ?? fallbackIdx + 1),
    title: String(rec.title ?? ''),
    content: String(rec.content ?? ''),
    authorName,
    authorRole: String(rec.authorRole ?? 'Giảng viên'),
    authorInitials: String(rec.authorInitials ?? initials),
    authorColor: String(rec.authorColor ?? 'bg-blue-700'),
    createdAt: String(rec.createdAt ?? rec.createTime ?? ''),
    isPinned: Boolean(rec.isPinned ?? rec.pinned ?? false),
    tag: rec.tag ? String(rec.tag) : undefined,
    commentsCount:
      rec.commentsCount !== undefined ? Number(rec.commentsCount) : undefined,
  };
}

function extractArrayPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const obj = payload as Record<string, unknown>;
  const candidates = [
    obj.content,
    obj.items,
    obj.members,
    obj.announcements,
    obj.records,
    obj.results,
    obj.data,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.content)) return nested.content;
      if (Array.isArray(nested.items)) return nested.items;
    }
  }
  return [];
}

export async function getClassAnnouncements(classId: string): Promise<ClassAnnouncement[]> {
  const apiId = normalizeClassApiId(classId);
  const { data } = await api.get<ApiResponse<unknown>>(`/classes/${apiId}/announcements`).catch(error => {
    if (!(error instanceof ApiError) || error.httpStatus !== 404) throw error;
    return api.get<ApiResponse<unknown>>(`/classes/class/${apiId}/Announcements`);
  });
  return extractArrayPayload(data?.data ?? data).map(mapAnnouncementRecord);
}

export async function getClassOverview(classId: string, signal?: AbortSignal) {
  const id = normalizeClassApiId(classId);
  const { data } = await api.get<ApiResponse<unknown>>(`/classes/${encodeURIComponent(id)}/overview`, { signal });
  const overview = classOverviewResponseSchema.parse(data.data);
  if (overview.classInfo.id.toLowerCase() !== id.toLowerCase()) {
    throw new ApiError('Class overview scope mismatch', 404);
  }
  const classInfo: ClassLookupResult = {
    ...overview.classInfo,
    isClassInfoLive: true,
    callerRole: overview.viewer.role === overview.classInfo.teachingRole ? overview.classInfo.teachingRole : undefined,
  };
  return { ...overview, classInfo, announcements: overview.announcements.map(mapAnnouncementRecord) };
}

function mapClassMemberRecord(raw: unknown): ClassMember | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  const userObj =
    rec.user && typeof rec.user === 'object' ? (rec.user as Record<string, unknown>) : undefined;
  const id = String(rec.userId ?? userObj?.id ?? rec.id ?? '').trim();
  if (!id) return null;

  const fullName =
    String(
      rec.fullName ?? rec.name ?? rec.studentName ?? userObj?.fullName ?? userObj?.name ?? 'Thành viên'
    ).trim() || 'Thành viên';
  const rawRole = String(rec.role ?? 'STUDENT').toUpperCase();
  const role: ClassMember['role'] =
    rawRole === 'OWNER' ? 'OWNER' : rawRole === 'TEACHER' || rawRole === 'TA' ? 'TEACHER' : 'STUDENT';

  const rawStatus = String(rec.status ?? 'APPROVED').toUpperCase();
  const status: ClassMember['status'] = rawStatus === 'PENDING' ? 'PENDING' : 'APPROVED';

  const initials =
    fullName
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || 'SV';

  const resolvedAvatarUrl = rec.avatarUrl
    ? String(rec.avatarUrl)
    : userObj?.avatarUrl
      ? String(userObj.avatarUrl)
      : undefined;

  return {
    id,
    name: fullName,
    studentCode: rec.studentCode
      ? String(rec.studentCode)
      : userObj?.studentCode
        ? String(userObj.studentCode)
        : undefined,
    email: rec.email ? String(rec.email) : userObj?.email ? String(userObj.email) : '',
    role,
    status,
    avatar: rec.avatar ? String(rec.avatar) : initials,
    avatarUrl: resolvedAvatarUrl,
    isClassLeader: Boolean(rec.isClassLeader),
    leaderBadge: rec.leaderBadge ? String(rec.leaderBadge) : undefined,
    attendanceRate: typeof rec.attendanceRate === 'number' ? rec.attendanceRate : undefined,
    knowledgeNodesUnlocked:
      typeof rec.knowledgeNodesUnlocked === 'number' ? rec.knowledgeNodesUnlocked : undefined,
    knowledgeNodesTotal:
      typeof rec.knowledgeNodesTotal === 'number' ? rec.knowledgeNodesTotal : undefined,
    knowledgePercent: typeof rec.knowledgePercent === 'number' ? rec.knowledgePercent : undefined,
    gpa: typeof rec.gpa === 'number' ? rec.gpa : undefined,
    learningStatus: rec.learningStatus as ClassMember['learningStatus'],
    statusBadge: rec.statusBadge ? String(rec.statusBadge) : undefined,
    statusDetail: rec.statusDetail ? String(rec.statusDetail) : undefined,
    joinedAt: rec.joinedAt ? String(rec.joinedAt) : rec.createdAt ? String(rec.createdAt) : undefined,
  };
}

export async function getClassMembers(classId: string): Promise<ClassMember[]> {
  const apiId = normalizeClassApiId(classId);
  const [allRes, pendingRes] = await Promise.allSettled([
    api.get<ApiResponse<unknown>>(`/classes/${apiId}/members`, {
      params: { page: 0, size: 100 },
    }),
    api.get<ApiResponse<unknown>>(`/classes/${apiId}/members`, {
      params: { status: 'PENDING', page: 0, size: 100 },
    }),
  ]);

  const merged = new Map<string, ClassMember>();

  if (allRes.status === 'fulfilled') {
    const rawAll = allRes.value.data?.data ?? allRes.value.data;
    const list = extractArrayPayload(rawAll);
    for (const item of list) {
      const mapped = mapClassMemberRecord(item);
      if (mapped) merged.set(mapped.id, mapped);
    }
  }

  if (pendingRes.status === 'fulfilled') {
    const rawPending = pendingRes.value.data?.data ?? pendingRes.value.data;
    const pendingList = extractArrayPayload(rawPending);
    for (const item of pendingList) {
      const mapped = mapClassMemberRecord(item);
      if (mapped) {
        merged.set(mapped.id, { ...mapped, status: 'PENDING' });
      }
    }
  }

  return Array.from(merged.values());
}

function mapMaterialFormat(
  rawType?: unknown
): ClassMaterial['format'] {
  const upper = String(rawType ?? '').toUpperCase();
  if (upper.includes('PPT')) return 'PPTX';
  if (upper.includes('QUIZ')) return 'QUIZ';
  if (upper.includes('CODE') || upper.includes('ZIP') || upper.includes('PY') || upper.includes('CPP')) {
    return 'CODE';
  }
  return 'PDF';
}

function mapMaterialCategoryType(
  format: ClassMaterial['format']
): ClassMaterial['categoryType'] {
  if (format === 'PPTX') return 'slide';
  if (format === 'QUIZ') return 'quiz';
  if (format === 'CODE') return 'code';
  return 'syllabus';
}

export interface ClassMaterialsParams {
  page?: number;
  size?: number;
  courseId?: string;
  category?: string;
  search?: string;
}

export async function getClassMaterials(
  classId: string, params: ClassMaterialsParams = {}, signal?: AbortSignal,
): Promise<PaginatedResponse<ClassMaterial>> {
  const id = encodeURIComponent(normalizeClassApiId(classId));
  const { data: { data: page } } = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    `/classes/${id}/materials`, { params, signal },
  );
  if (!Array.isArray(page?.items) || !Number.isSafeInteger(page.pageNumber) || !Number.isSafeInteger(page.pageSize)
      || !Number.isSafeInteger(page.totalElements) || !Number.isSafeInteger(page.totalPages)) {
    throw new Error('Invalid class materials response');
  }

  const items = page.items.map((entry, index): ClassMaterial => {
    const rec = entry as Record<string, unknown>;
    if (typeof rec?.id !== 'string' || !rec.id) throw new Error('Invalid class material ID');
    const format = mapMaterialFormat(rec.fileType ?? rec.mimeType);
    const aiStatus = String(rec.aiIngestionStatus ?? '').toUpperCase();
    const conceptsCount = Number(rec.conceptsCount ?? 0);
    return {
      id: rec.id,
      courseId: typeof rec.courseId === 'string' ? rec.courseId : undefined,
      stt: String(page.pageNumber * page.pageSize + index + 1).padStart(2, '0'),
      title: String(rec.title ?? rec.originalFileName ?? 'Tài liệu học tập'),
      filename: String(rec.originalFileName ?? rec.title ?? 'material'),
      subjectName: String(rec.courseTitle ?? 'Môn học'),
      subjectCode: String(rec.courseCode ?? ''),
      category: String(rec.chapterTitle ?? rec.lessonTitle ?? 'Học liệu môn học'),
      categoryType: mapMaterialCategoryType(format),
      format,
      size: String(rec.fileSizeFormatted ?? '--'),
      updatedAt: String(rec.updatedAt ?? rec.createdAt ?? ''),
      aiStatus: aiStatus === 'SUCCESS' ? conceptsCount > 0 ? `Đã đồng bộ (${conceptsCount} khái niệm)` : 'Đã kết nối Đồ thị'
        : aiStatus === 'PROCESSING' || aiStatus === 'QUEUED' ? 'Đang xử lý AI' : 'Tài liệu chuẩn',
      aiStatusType: aiStatus === 'SUCCESS' ? 'synced' : 'ready',
      conceptsCount: Number.isFinite(conceptsCount) ? conceptsCount : 0,
      viewsCount: Number(rec.viewsCount ?? 0),
      isPinned: Boolean(rec.isPinned),
      url: typeof rec.url === 'string' ? rec.url : undefined,
      fileUrl: typeof rec.url === 'string' ? rec.url : undefined,
      downloadUrl: typeof rec.downloadUrl === 'string' ? rec.downloadUrl : undefined,
    };
  });
  return { ...page, items, isLast: page.pageNumber + 1 >= page.totalPages };
}

/**
 * Fetch full class detail bundle with graceful API connect & fallback.
 */
export async function getClassDetailData(classId: string): Promise<ClassDetailData> {
  const [classInfo, courses, announcements, members, materials] = await Promise.all([
    getClassInfoDetail(classId),
    getClassCourses(classId),
    getClassAnnouncements(classId).catch(() => []),
    getClassMembers(classId),
    getClassMaterials(classId).then(page => page.items).catch(() => []),
  ]);

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
  courseId: string,
  semester = 'Học kỳ 1',
  academicYear = '2026-2027'
): Promise<void> {
  const apiId = normalizeClassApiId(classId);
  await api.post<ApiResponse<unknown>>(`/classes/${apiId}/courses`, {
    courseId,
    semester,
    academicYear,
  });
}

/**
 * Remove a course from class.
 */
export async function removeCourseFromClass(
  classId: string,
  courseId: string
): Promise<void> {
  const apiId = normalizeClassApiId(classId);
  try {
    await api.delete<ApiResponse<unknown>>(`/classes/${apiId}/courses/${courseId}`);
  } catch {
    // Local simulation fallback
  }
}

/**
 * Post a new announcement.
 * Endpoint: POST /api/v1/classes/{classId}/announcements
 */
export async function postClassAnnouncement(
  classId: string,
  payload: { title: string; content: string }
): Promise<ClassAnnouncement | null> {
  const apiId = normalizeClassApiId(classId);
  const { data } = await api.post<ApiResponse<unknown>>(
    `/classes/${apiId}/announcements`,
    payload
  );
  const created = data?.data ?? data;
  if (created && typeof created === 'object' && 'id' in created && typeof created.id === 'string' && created.id) {
    return mapAnnouncementRecord(created);
  }
  return null;
}

/**
 * Approve a pending member request.
 * Endpoint: POST /api/v1/classes/{classId}/approve
 */
export async function approveMember(classId: string, userId: string): Promise<void> {
  const apiId = normalizeClassApiId(classId);
  await api.post<ApiResponse<unknown>>(`/classes/${apiId}/approve`, { userId });
}

/**
 * Reject a pending member request.
 * Endpoint: POST /api/v1/classes/{classId}/reject
 */
export async function rejectMember(
  classId: string,
  userId: string,
  reason?: string
): Promise<void> {
  const apiId = normalizeClassApiId(classId);
  await api.post<ApiResponse<unknown>>(`/classes/${apiId}/reject`, {
    userId,
    ...(reason ? { reason } : {}),
  });
}

/**
 * Remove a member from class.
 * Endpoint: DELETE /api/v1/classes/{classId}/members/{userId}
 */
export async function removeMember(classId: string, userId: string): Promise<void> {
  const apiId = normalizeClassApiId(classId);
  await api.delete<ApiResponse<unknown>>(`/classes/${apiId}/members/${userId}`);
}

/**
 * Update a member's role (only TEACHER or STUDENT supported by backend).
 * Endpoint: PATCH /api/v1/classes/{classId}/members/{userId}/role
 */
export async function updateMemberRole(
  classId: string,
  userId: string,
  role: 'TEACHER' | 'STUDENT'
): Promise<void> {
  const apiId = normalizeClassApiId(classId);
  await api.patch<ApiResponse<unknown>>(`/classes/${apiId}/members/${userId}/role`, {
    role,
  });
}

/**
 * Transfer class ownership.
 * Endpoint: PATCH /api/v1/classes/{classId}/owner
 */
export async function changeClassOwner(classId: string, newOwnerId: string): Promise<void> {
  const apiId = normalizeClassApiId(classId);
  await api.patch<ApiResponse<unknown>>(`/classes/${apiId}/owner`, {
    newOwnerId,
  });
}

/**
 * Pin or unpin an announcement.
 * Endpoint: PATCH /api/v1/classes/{classId}/announcements/{announcementId}/pin?pin=true|false
 */
export async function pinClassAnnouncement(
  classId: string,
  announcementId: string,
  pin: boolean
): Promise<void> {
  const apiId = normalizeClassApiId(classId);
  await api.patch<ApiResponse<unknown>>(
    `/classes/${apiId}/announcements/${announcementId}/pin`,
    null,
    { params: { pin } }
  );
}

/**
 * Delete an announcement.
 * Endpoint: DELETE /api/v1/classes/{classId}/announcements/{announcementId}
 */
export async function deleteClassAnnouncement(
  classId: string,
  announcementId: string
): Promise<void> {
  const apiId = normalizeClassApiId(classId);
  await api.delete<ApiResponse<unknown>>(
    `/classes/${apiId}/announcements/${announcementId}`
  );
}

export interface ClassBannerStats {
  sessionsCount?: number;
  coursesCount: number;
  studentsCount: number;
  teachersCount: number;
  pendingAssignmentsCount?: number;
}

/**
 * Fetch real banner statistics for a class.
 * Endpoint: GET /api/v1/classes/{id}/stats
 */
export async function getClassStats(classId: string): Promise<ClassBannerStats> {
  const apiId = normalizeClassApiId(classId);
  try {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
      `/classes/${apiId}/stats`,
      { timeout: 3500 }
    );
    const resData = (data?.data ?? data) as Record<string, unknown> | undefined;
    if (resData && typeof resData === 'object') {
      return {
        coursesCount: Number(resData.coursesCount ?? 0),
        studentsCount: Number(resData.studentsCount ?? 0),
        teachersCount: Number(resData.teachersCount ?? 0),
        pendingAssignmentsCount:
          resData.pendingAssignmentsCount !== undefined
            ? Number(resData.pendingAssignmentsCount)
            : undefined,
      };
    }
  } catch {
    // Fallback
  }
  return { coursesCount: 0, studentsCount: 0, teachersCount: 0 };
}

export interface AvailableClassCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  description?: string;
  backgroundUrl?: string;
  thumbnailUrl?: string;
  instructorName?: string;
}

/**
 * Fetch available courses that can be assigned to a class.
 * Endpoint: GET /api/v1/classes/{classId}/courses/available
 */
export async function getAvailableClassCourses(
  classId: string
): Promise<AvailableClassCourse[]> {
  const apiId = normalizeClassApiId(classId);
  try {
    const { data } = await api.get<ApiResponse<unknown>>(
      `/classes/${apiId}/courses/available`,
      { params: { page: 0, size: 20 } }
    );
    const items = extractArrayPayload(data?.data ?? data);
    return items.map((item) => {
      const rec = item as Record<string, unknown>;
      const bg = rec.backgroundUrl
        ? String(rec.backgroundUrl)
        : rec.thumbnailUrl
          ? String(rec.thumbnailUrl)
          : undefined;
      return {
        id: String(rec.id ?? rec.courseId ?? ''),
        code: String(rec.code ?? rec.courseCode ?? rec.id ?? ''),
        name: String(rec.name ?? rec.title ?? ''),
        credits: Number(rec.credits ?? 3),
        description: rec.description ? String(rec.description) : undefined,
        backgroundUrl: bg,
        thumbnailUrl: rec.thumbnailUrl ? String(rec.thumbnailUrl) : bg,
        instructorName: rec.instructorName ? String(rec.instructorName) : undefined,
      };
    });
  } catch {
    return [];
  }
}

export interface ClassAssignmentItem {
  id: string;
  title: string;
  description?: string;
  dueAt?: string;
  maxScore?: number;
  status?: string;
  type?: string;
  courseName?: string;
  courseCode?: string;
}

/**
 * Fetch assignments for a class.
 * Endpoint: GET /api/v1/classes/{classId}/assignments
 */
export async function getClassAssignments(
  classId: string
): Promise<ClassAssignmentItem[]> {
  const apiId = normalizeClassApiId(classId);
  try {
    const { data } = await api.get<ApiResponse<unknown>>(
      `/classes/${apiId}/assignments`
    );
    const raw = data?.data ?? data;
    const items = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && Array.isArray((raw as { content?: unknown[] }).content)
        ? (raw as { content: unknown[] }).content
        : [];
    return items.map((item) => {
      const rec = item as Record<string, unknown>;
      return {
        id: String(rec.id ?? ''),
        title: String(rec.title ?? rec.name ?? 'Bài tập'),
        description: rec.description ? String(rec.description) : undefined,
        dueAt: rec.dueAt ? String(rec.dueAt) : rec.deadline ? String(rec.deadline) : undefined,
        maxScore: rec.maxScore !== undefined ? Number(rec.maxScore) : 10,
        status: rec.status ? String(rec.status) : undefined,
        type: rec.type ? String(rec.type) : 'ASSIGNMENT',
        courseName: rec.courseName ? String(rec.courseName) : undefined,
        courseCode: rec.courseCode ? String(rec.courseCode) : undefined,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Fetch exams for a class.
 * Endpoint: GET /api/v1/classes/{classId}/exams
 */
export async function getClassExams(classId: string): Promise<ClassAssignmentItem[]> {
  const apiId = normalizeClassApiId(classId);
  try {
    const { data } = await api.get<ApiResponse<unknown>>(`/classes/${apiId}/exams`);
    const raw = data?.data ?? data;
    const items = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && Array.isArray((raw as { content?: unknown[] }).content)
        ? (raw as { content: unknown[] }).content
        : [];
    return items.map((item) => {
      const rec = item as Record<string, unknown>;
      return {
        id: String(rec.id ?? ''),
        title: String(rec.title ?? rec.name ?? 'Kỳ thi'),
        description: rec.description ? String(rec.description) : undefined,
        dueAt: rec.endAt ? String(rec.endAt) : rec.startAt ? String(rec.startAt) : undefined,
        maxScore: rec.maxScore !== undefined ? Number(rec.maxScore) : 10,
        status: rec.status ? String(rec.status) : undefined,
        type: rec.examType ? String(rec.examType) : 'EXAM',
        courseName: rec.courseName ? String(rec.courseName) : undefined,
        courseCode: rec.courseCode ? String(rec.courseCode) : undefined,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Fetch real grade reports for a class (teacher: all students, student: /me).
 * Endpoints:
 * - GET /api/v1/classes/{classId}/grade-reports
 * - GET /api/v1/classes/{classId}/grade-reports/me
 */
export async function getClassGradeReports(
  classId: string,
  isStudent: boolean
): Promise<GradebookStudent[]> {
  const apiId = normalizeClassApiId(classId);
  const endpoint = isStudent
    ? `/classes/${apiId}/grade-reports/me`
    : `/classes/${apiId}/grade-reports`;

  try {
    const { data } = await api.get<ApiResponse<unknown>>(endpoint);
    const raw = data?.data ?? data;
    const list = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && Array.isArray((raw as { content?: unknown[] }).content)
        ? (raw as { content: unknown[] }).content
        : raw && typeof raw === 'object'
          ? [raw]
          : [];

    return list.map((entry, idx) => {
      const rec = entry as Record<string, unknown>;
      const attendance = Number(rec.attendanceScore ?? rec.attendance_score ?? 0);
      const midterm = Number(rec.midtermScore ?? rec.midterm_score ?? 0);
      const finalScore = Number(rec.finalScore ?? rec.final_score ?? 0);
      const avg = Number(
        rec.totalScore ?? rec.averageScore ?? ((attendance + midterm + finalScore) / 3 || 0)
      );
      const name = String(rec.studentName ?? rec.fullName ?? rec.name ?? 'Học viên');
      const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((p) => p[0]?.toUpperCase() || '')
        .join('') || 'SV';

      return {
        id: String(rec.studentId ?? rec.userId ?? rec.id ?? idx + 1),
        stt: String(idx + 1),
        name,
        studentCode: String(rec.studentCode ?? rec.code ?? ''),
        email: String(rec.email ?? ''),
        avatar: initials,
        avatarColor: 'bg-blue-100 text-blue-700',
        attendanceScore: attendance,
        quizScore: Number(rec.quizScore ?? 0),
        labScore: Number(rec.labScore ?? 0),
        midtermScore: midterm,
        finalScore,
        letterGrade: String(
          rec.letterGrade ??
          (avg >= 8.5 ? 'A' : avg >= 7.0 ? 'B' : avg >= 5.5 ? 'C' : avg >= 4.0 ? 'D' : 'F')
        ),
        ploPercent: Number(rec.ploPercent ?? Math.round(avg * 10)),
        ploStatus: avg >= 8.0 ? 'EXCELLENT' : avg >= 5.5 ? 'PASSED' : 'NEEDS_SUPPORT',
        totalGpa: Number(rec.totalGpa ?? Number((avg * 0.4).toFixed(2))),
      };
    });
  } catch {
    return [];
  }
}

