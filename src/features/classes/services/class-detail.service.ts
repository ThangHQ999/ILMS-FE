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

  // Merge locally created courses for this class (offline/refresh persistence)
  const localSubjects = getLocalClassCourses(classId);
  if (localSubjects.length > 0) {
    const existingCourseIds = new Set(courses.map((c) => c.id));
    const newCourses = localSubjects.filter((c) => !existingCourseIds.has(c.id));
    courses = [...newCourses, ...courses];
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

  // Merge locally persisted announcements (offline/mock persistence)
  const localAnnouncements = getLocalAnnouncements(classId);
  if (localAnnouncements.length > 0) {
    const existingIds = new Set(announcements.map((a) => a.id));
    const newItems = localAnnouncements.filter((a) => !existingIds.has(a.id));
    announcements = [...newItems, ...announcements];
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
    // Local simulation fallback: ensure persisted in localStorage for offline/mock mode
    const existing = getLocalAnnouncements(classId);
    const alreadySaved = existing.some(
      (a) => a.title === payload.title && a.content === payload.content
    );
    if (!alreadySaved) {
      saveLocalAnnouncement(classId, {
        id: `ann-${Date.now()}`,
        title: payload.title,
        content: payload.content,
        authorName: 'TS. Lê Hoàng Nam',
        authorRole: 'Giảng viên Chủ nhiệm',
        authorInitials: 'LN',
        authorColor: 'bg-primary text-on-primary',
        createdAt: 'Vừa xong',
        isPinned: false,
        tag: 'Thông báo chung',
        readCount: 1,
        totalStudents: 42,
        readPercent: 2,
        commentsCount: 0,
      });
    }
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

