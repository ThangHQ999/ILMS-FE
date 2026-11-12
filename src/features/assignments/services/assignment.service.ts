import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import {
  assignmentItemSchema,
  gradeProgressSchema,
  aiRecommendationSchema,
  studentPerformanceSchema,
  classHubInfoSchema,
  type AssignmentItem,
  type GradeProgress,
  type AiRecommendation,
  type StudentPerformance,
  type ClassHubInfo,
  type AssignmentFilters,
} from '../schemas/assignment.schema';

// Resilient Mock Data matching the exact design specification
export const MOCK_ASSIGNMENTS: AssignmentItem[] = [
  // --- CLUSTER 1: ACTIVE & DUE ---
  {
    id: 'quiz-03',
    classId: 'cs-202',
    title: 'Quiz 03: Phân tích Header & Giao thức TCP / UDP',
    description: '20 câu hỏi mô phỏng • Thời gian làm bài: 35 phút • Đánh giá theo chuẩn năng lực Bloom bậc 1-3.',
    type: 'QUIZ',
    status: 'OPEN',
    typeLabel: 'Trắc nghiệm khách quan',
    chapter: 'Chương 2: Tầng Giao vận',
    topic: 'Tầng Giao vận & TCP/UDP',
    bloomLevel: 'Bloom 1-3',
    questionsCount: 20,
    durationMinutes: 35,
    plos: [
      { code: 'PLO 02', name: 'Kiến trúc giao thức' },
      { code: 'PLO 04', name: 'Phân tích gói tin' },
    ],
    timeRemainingLabel: 'Còn 2 ngày',
    dueDateLabel: 'Hạn: 23:59 CN, 27/10',
    isDueSoon: true,
    submittedCount: 38,
    totalStudents: 48,
    classAverageScore: 8.2,
  },
  {
    id: 'lab-04',
    classId: 'cs-202',
    title: 'Lab 04: Bắt và phân tích gói tin TCP 3-Way Handshake bằng Wireshark',
    description:
      'Yêu cầu nộp file log .pcapng kèm báo cáo giải thích cờ SYN, ACK, SEQ number và cơ chế đóng kết nối 4 bước FIN. Thang điểm 100.',
    type: 'LAB',
    status: 'DUE_SOON',
    typeLabel: 'Thực hành Lab cá nhân',
    chapter: 'Chương 2: Tầng Giao vận',
    topic: 'Cấu trúc gói tin Wireshark',
    environment: 'Wireshark 4.x / TCPDump',
    sampleFile: {
      name: 'handshake_sample.pcap',
      size: '2.4MB',
    },
    timeRemainingLabel: 'Còn 4 ngày',
    dueDateLabel: 'Hạn: 23:59 T3, 29/10',
    isDueSoon: true,
    submittedCount: 26,
    totalStudents: 48,
    pendingGradingCount: 12,
  },

  // --- CLUSTER 2: COMPLETED & GRADED ---
  {
    id: 'quiz-02',
    classId: 'cs-202',
    title: 'Quiz 02: Các giao thức tầng Ứng dụng (DNS, HTTP/2, SMTP)',
    description: '15 câu hỏi • 20 phút • ĐTB Lớp: 7.8/10 • Xếp hạng: 5 / 48',
    type: 'QUIZ',
    status: 'GRADED',
    typeLabel: 'Trắc nghiệm',
    chapter: 'Chương 1: Tầng Ứng dụng',
    topic: 'Tầng Ứng dụng & DNS/HTTP',
    questionsCount: 15,
    durationMinutes: 20,
    submissionDate: 'Nộp lúc 21:15 • 15/10/2024',
    classAverageScore: 7.8,
    studentRank: '5 / 48',
    studentScore: 9.3,
    studentMaxScore: 10,
    ploAchievedLabel: 'Đạt chuẩn PLO 01',
    scoreClassification: 'Xuất sắc',
  },
  {
    id: 'lab-01',
    classId: 'cs-202',
    title: 'Lab 01: Lập trình Socket Client-Server cơ bản bằng Python',
    description: 'Thực hành lập trình truyền nhận gói tin TCP/IP',
    type: 'LAB',
    status: 'GRADED',
    typeLabel: 'Code Lab',
    chapter: 'Chương 1: Tầng Ứng dụng',
    topic: 'Tầng Ứng dụng & DNS/HTTP',
    submissionDate: 'Đã chấm điểm • 05/10/2024',
    teacherFeedback: 'Lời nhận xét của GV: "Mã nguồn sạch, xử lý exception socket timeout chuẩn xác."',
    studentScore: 10,
    studentMaxScore: 10,
    scoreClassification: 'Xuất sắc',
  },
  {
    id: 'quiz-01',
    classId: 'cs-202',
    title: 'Quiz 01: Tổng quan Mô hình OSI & Kiến trúc TCP/IP',
    description: '10 câu • 15 phút • ĐTB Lớp: 8.0/10',
    type: 'QUIZ',
    status: 'GRADED',
    typeLabel: 'Trắc nghiệm nhận biết',
    chapter: 'Chương 1: Tầng Ứng dụng',
    topic: 'Mô hình OSI',
    questionsCount: 10,
    durationMinutes: 15,
    submissionDate: 'Nộp ngày 28/09/2024',
    classAverageScore: 8.0,
    studentScore: 8.5,
    studentMaxScore: 10,
    scoreClassification: 'Đạt yêu cầu',
  },

  // --- CLUSTER 3: UPCOMING IN NEXT SPRINT ---
  {
    id: 'quiz-05',
    classId: 'cs-202',
    title: 'Quiz 05: Thuật toán định tuyến OSPF & Dijkstra Graph',
    description: 'Thuật toán tìm đường đi ngắn nhất Link-State routing',
    type: 'QUIZ',
    status: 'UPCOMING',
    typeLabel: 'Trắc nghiệm lý thuyết',
    chapter: 'Chương 3: Tầng Mạng',
    topic: 'Tầng Mạng & OSPF/BGP',
    unlockDate: 'Mở vào 04/11/2024',
    unlockCondition: 'Điều kiện mở khóa: Hoàn thành bài giảng video & Lab thực hành Chương 4 (Tầng Mạng).',
    isLocked: true,
  },
];

export const MOCK_GRADE_PROGRESS: GradeProgress = {
  currentAccumulated: 46.5,
  maxAccumulated: 50.0,
  categories: [
    {
      id: 'quiz',
      name: 'Trắc nghiệm Quiz (5 bài)',
      countLabel: '5 bài',
      weight: 20,
      achievedScore: 18.5,
      statusLabel: '20% (Đạt: 18.5%)',
      progressPercent: 92,
      barColor: 'bg-blue-600',
    },
    {
      id: 'lab',
      name: 'Thực hành Lab (4 bài)',
      countLabel: '4 bài',
      weight: 30,
      achievedScore: 28.0,
      statusLabel: '30% (Đạt: 28.0%)',
      progressPercent: 75,
      barColor: 'bg-indigo-600',
    },
    {
      id: 'midterm',
      name: 'Đồ án giữa kỳ',
      countLabel: '1 đồ án',
      weight: 20,
      statusLabel: '20% (Chưa mở)',
      progressPercent: 0,
      barColor: 'bg-slate-400',
    },
    {
      id: 'final',
      name: 'Thi kết thúc học phần',
      countLabel: '1 kỳ thi',
      weight: 30,
      statusLabel: '30% (Tuần 16)',
      progressPercent: 0,
      barColor: 'bg-slate-400',
    },
  ],
};

export const MOCK_AI_RECOMMENDATION: AiRecommendation = {
  id: 'rec-01',
  topic: 'Cơ chế Congestion Control của TCP (Tahoe vs. Reno Fast Recovery)',
  reason:
    'Dựa trên kết quả bài thi Quiz 02, hệ thống nhận diện bạn và 32% sinh viên trong lớp cần ôn tập sâu hơn về:',
  actionLabel: 'Làm 5 câu trắc nghiệm bổ trợ TCP ngay',
};

export const MOCK_STUDENT_PERFORMANCE: StudentPerformance = {
  averageQuizScore: 8.9,
  onTimeRate: 100,
  streakCount: 4,
  streakXp: 120,
  ploBadgeLevel: 'Cấp độ 3 / 4',
};

export const MOCK_CLASS_HUB_INFO: ClassHubInfo = {
  courseCode: 'CS-202',
  semester: 'HK2 2024-2025',
  room: 'Phòng học thông minh H6-302',
  title: 'Mạng máy tính & Truyền thông dữ liệu',
  instructorName: 'TS. Lê Hoàng Nam',
  department: 'Bộ môn: Kỹ thuật Mạng & Truyền thông',
  studentsCount: 48,
  assignmentsCount: 8,
  completionRate: 78.5,
};

/**
 * Fetch assignments and quizzes for a given class.
 * Endpoint: GET /api/v1/classes/{classId}/assignments
 */
export async function getAssignments(
  classId: string,
  filters?: Partial<AssignmentFilters>
): Promise<AssignmentItem[]> {
  try {
    const { data } = await api.get<ApiResponse<AssignmentItem[]>>(
      `/classes/${classId}/assignments`,
      { params: filters }
    );
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data.map((item) => assignmentItemSchema.parse(item));
    }
  } catch {
    // Graceful fallback to resilient mock data
  }

  // Filter local mock data if params provided
  let result = [...MOCK_ASSIGNMENTS];
  if (filters?.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.plos?.some((p) => p.code.toLowerCase().includes(query) || p.name.toLowerCase().includes(query))
    );
  }
  return result;
}

/**
 * Get grade weights and progress for a class.
 */
export async function getGradeProgress(classId: string): Promise<GradeProgress> {
  try {
    const { data } = await api.get<ApiResponse<GradeProgress>>(
      `/classes/${classId}/grade-progress`
    );
    if (data?.data) {
      return gradeProgressSchema.parse(data.data);
    }
  } catch {
    // Fallback
  }
  return gradeProgressSchema.parse(MOCK_GRADE_PROGRESS);
}

/**
 * Get Socratic AI weakness recommendation.
 */
export async function getAiRecommendation(classId: string): Promise<AiRecommendation> {
  try {
    const { data } = await api.get<ApiResponse<AiRecommendation>>(
      `/student/chat/recommendations`,
      { params: { classId } }
    );
    if (data?.data) {
      return aiRecommendationSchema.parse(data.data);
    }
  } catch {
    // Fallback
  }
  return aiRecommendationSchema.parse(MOCK_AI_RECOMMENDATION);
}

/**
 * Get student personal performance stats.
 */
export async function getStudentPerformance(classId: string): Promise<StudentPerformance> {
  try {
    const { data } = await api.get<ApiResponse<StudentPerformance>>(
      `/classes/${classId}/performance`
    );
    if (data?.data) {
      return studentPerformanceSchema.parse(data.data);
    }
  } catch {
    // Fallback
  }
  return studentPerformanceSchema.parse(MOCK_STUDENT_PERFORMANCE);
}

/**
 * Get class hub header information.
 */
export async function getClassHubInfo(classId: string): Promise<ClassHubInfo> {
  try {
    const { data } = await api.get<ApiResponse<ClassHubInfo>>(`/classes/${classId}`);
    if (data?.data) {
      return classHubInfoSchema.parse(data.data);
    }
  } catch {
    // Fallback
  }
  return classHubInfoSchema.parse(MOCK_CLASS_HUB_INFO);
}

