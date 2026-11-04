import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import { DASHBOARD_ENDPOINTS } from '../constants';
import {
  statOverviewSchema,
  aiInsightSchema,
  courseProgressSchema,
  notificationItemSchema,
  aiTaskItemSchema,
  competencyPillarSchema,
} from '../schemas/dashboard.schema';
import {
  StatOverview,
  HeatmapCell,
  CompetencyPillar,
  AIInsight,
  CourseProgress,
  NotificationItem,
  AITaskItem,
} from '../types';

// Mock data fallback matching the HTML specification
export const MOCK_STAT_OVERVIEW: StatOverview = {
  streakDays: 5,
  streakChangeText: '+1 ngày so với tuần trước (Kỷ lục: 14 ngày)',
  streakRecordDays: 14,
  studyHoursThisWeek: 24.5,
  studyHoursGoal: 20,
  studyHoursGoalPercent: 115,
  knowledgeNodesUnlocked: 150,
  knowledgeNodesTotal: 220,
  knowledgeGraphPercent: 68.2,
  knowledgeGraphTopic: 'Đồ thị ICPC & Cấu trúc dữ liệu',
  approachingDeadlinesCount: 2,
  nearestDeadlineDescription: 'Hạn chót: 23:59 hôm nay (Quiz 06)',
};

export const MOCK_HEATMAP_CELLS: HeatmapCell[] = [
  // 12 weeks x 7 days (days 0..6)
  // Week 1
  { week: 1, day: 0, level: 'empty' },
  { week: 1, day: 1, level: 'master' },
  { week: 1, day: 2, level: 'good' },
  { week: 1, day: 3, level: 'master' },
  { week: 1, day: 4, level: 'empty' },
  { week: 1, day: 5, level: 'good' },
  { week: 1, day: 6, level: 'empty' },
  // Week 2
  { week: 2, day: 0, level: 'master' },
  { week: 2, day: 1, level: 'master' },
  { week: 2, day: 2, level: 'good' },
  { week: 2, day: 3, level: 'medium' },
  { week: 2, day: 4, level: 'master' },
  { week: 2, day: 5, level: 'good' },
  { week: 2, day: 6, level: 'empty' },
  // Week 3
  { week: 3, day: 0, level: 'empty' },
  { week: 3, day: 1, level: 'good' },
  { week: 3, day: 2, level: 'master' },
  { week: 3, day: 3, level: 'master' },
  { week: 3, day: 4, level: 'good' },
  { week: 3, day: 5, level: 'master' },
  { week: 3, day: 6, level: 'medium' },
  // Week 4
  { week: 4, day: 0, level: 'master' },
  { week: 4, day: 1, level: 'master' },
  { week: 4, day: 2, level: 'empty' },
  { week: 4, day: 3, level: 'good' },
  { week: 4, day: 4, level: 'good' },
  { week: 4, day: 5, level: 'master' },
  { week: 4, day: 6, level: 'empty' },
  // Week 5
  { week: 5, day: 0, level: 'good' },
  { week: 5, day: 1, level: 'medium' },
  { week: 5, day: 2, level: 'master' },
  { week: 5, day: 3, level: 'master' },
  { week: 5, day: 4, level: 'master' },
  { week: 5, day: 5, level: 'empty' },
  { week: 5, day: 6, level: 'good' },
  // Week 6
  { week: 6, day: 0, level: 'master' },
  { week: 6, day: 1, level: 'empty' },
  { week: 6, day: 2, level: 'weak' },
  { week: 6, day: 3, level: 'good' },
  { week: 6, day: 4, level: 'master' },
  { week: 6, day: 5, level: 'good' },
  { week: 6, day: 6, level: 'master' },
  // Week 7
  { week: 7, day: 0, level: 'empty' },
  { week: 7, day: 1, level: 'good' },
  { week: 7, day: 2, level: 'master' },
  { week: 7, day: 3, level: 'master' },
  { week: 7, day: 4, level: 'medium' },
  { week: 7, day: 5, level: 'master' },
  { week: 7, day: 6, level: 'good' },
  // Week 8
  { week: 8, day: 0, level: 'master' },
  { week: 8, day: 1, level: 'master' },
  { week: 8, day: 2, level: 'good' },
  { week: 8, day: 3, level: 'good' },
  { week: 8, day: 4, level: 'empty' },
  { week: 8, day: 5, level: 'master' },
  { week: 8, day: 6, level: 'empty' },
  // Week 9
  { week: 9, day: 0, level: 'good' },
  { week: 9, day: 1, level: 'master' },
  { week: 9, day: 2, level: 'master' },
  { week: 9, day: 3, level: 'medium' },
  { week: 9, day: 4, level: 'weak' },
  { week: 9, day: 5, level: 'good' },
  { week: 9, day: 6, level: 'master' },
  // Week 10
  { week: 10, day: 0, level: 'master' },
  { week: 10, day: 1, level: 'empty' },
  { week: 10, day: 2, level: 'master' },
  { week: 10, day: 3, level: 'master' },
  { week: 10, day: 4, level: 'good' },
  { week: 10, day: 5, level: 'empty' },
  { week: 10, day: 6, level: 'good' },
  // Week 11
  { week: 11, day: 0, level: 'master' },
  { week: 11, day: 1, level: 'good' },
  { week: 11, day: 2, level: 'master' },
  { week: 11, day: 3, level: 'medium' },
  { week: 11, day: 4, level: 'master' },
  { week: 11, day: 5, level: 'master' },
  { week: 11, day: 6, level: 'empty' },
  // Week 12
  { week: 12, day: 0, level: 'master' },
  { week: 12, day: 1, level: 'master' },
  { week: 12, day: 2, level: 'master' },
  { week: 12, day: 3, level: 'good' },
  { week: 12, day: 4, level: 'master' },
  { week: 12, day: 5, level: 'empty' },
  { week: 12, day: 6, level: 'empty' },
];

export const MOCK_COMPETENCY_PILLARS: CompetencyPillar[] = [
  {
    id: 'p1',
    title: 'Cấu trúc dữ liệu nâng cao (Segment Tree, Trie)',
    percentage: 88,
    statusText: '88% • Thành thạo',
    level: 'master',
  },
  {
    id: 'p2',
    title: 'Thuật toán Đồ thị (Dijkstra, DSU, LCA)',
    percentage: 76,
    statusText: '76% • Khá',
    level: 'good',
  },
  {
    id: 'p3',
    title: 'Quy hoạch động (DP / Memoization / Bitmask)',
    percentage: 42,
    statusText: '42% • Cần củng cố',
    level: 'weak',
  },
  {
    id: 'p4',
    title: 'Toán rời rạc & Lý thuyết Số học',
    percentage: 85,
    statusText: '85% • Thành thạo',
    level: 'master',
  },
  {
    id: 'p5',
    title: 'Độ phức tạp tính toán & Tối ưu hóa I/O',
    percentage: 91,
    statusText: '91% • Xuất sắc',
    level: 'master',
  },
];

export const MOCK_AI_INSIGHT: AIInsight = {
  accuracyPercent: 98,
  gapDetectedTitle: 'Phát hiện lỗ hổng kiến thức',
  warningNarrative:
    'Hệ thống phân tích các bài nộp gần đây và phát hiện bạn đang hổng kiến thức phần Quy hoạch động (Dynamic Programming - Knapsack & Bitmask).',
  subNarrative:
    'Đây là bài test 5 phút được Socratic AI tạo riêng cho bạn với 4 câu hỏi trắc nghiệm thích ứng để phục hồi năng lực nhanh chóng.',
  durationMinutes: 5,
  questionCount: 4,
  difficultyText: 'Trung bình - Khó',
  xpReward: 120,
  ploRecoveryPercent: 15,
};

export const MOCK_COURSES: CourseProgress[] = [
  {
    id: 'c1',
    title: 'Cấu trúc dữ liệu & Giải thuật nâng cao (ICPC Track)',
    codeOrClass: 'Lớp: ICPC-2024A',
    instructor: 'TS. Lê Hoàng Nam',
    icon: 'terminal',
    colorType: 'secondary',
    nodesCompleted: 42,
    nodesTotal: 50,
    progressPercent: 84,
    avgScore: 8.8,
    maxScore: 10,
    status: 'in_progress',
    statusBadgeText: 'Đang học dở',
    actionText: 'Tiếp tục học',
    actionIcon: 'play_arrow',
  },
  {
    id: 'c2',
    title: 'Thiết kế Thuật toán & Đồ thị thông minh',
    codeOrClass: 'Lớp: CS-301',
    instructor: 'ThS. Trần Phương Thảo',
    icon: 'hub',
    colorType: 'tertiary',
    nodesCompleted: 28,
    nodesTotal: 40,
    progressPercent: 65,
    avgScore: 7.5,
    maxScore: 10,
    status: 'approaching_exam',
    statusBadgeText: 'Đến kỳ thi',
    actionText: 'Ôn luyện',
    actionIcon: 'menu_book',
  },
  {
    id: 'c3',
    title: 'Lập trình C++ Tối ưu & Kỹ thuật Thi đấu',
    codeOrClass: 'Khóa mở rộng • Đơn vị: CLB ICPC Academy',
    instructor: 'CLB ICPC Academy',
    icon: 'code',
    colorType: 'emerald',
    nodesCompleted: 50,
    nodesTotal: 50,
    progressPercent: 100,
    avgScore: 9.6,
    maxScore: 10,
    status: 'completed',
    statusBadgeText: 'Đã cấp chứng chỉ',
    actionText: 'Xem báo cáo',
    actionIcon: 'description',
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Gia sư AI Socratic đã hoàn tất gợi ý',
    description:
      'Đã phân tích xong bài tập Cây nhị phân và chuẩn bị sẵn 3 câu hỏi trắc nghiệm ôn tập cho bạn.',
    timeAgo: '5 phút trước',
    isRead: false,
    category: 'ai',
    icon: 'auto_awesome',
    colorType: 'secondary',
    actionText: 'Xem ngay',
    actionUrl: '#',
  },
  {
    id: 'notif-2',
    title: 'Nhắc nhở hạn nộp Quiz 05',
    description:
      'Hạn chót nộp bài trắc nghiệm Segment Tree & Thuật toán Đồ thị sẽ kết thúc vào 23:59 hôm nay.',
    timeAgo: '45 phút trước',
    isRead: false,
    category: 'quiz',
    icon: 'timer',
    colorType: 'amber',
  },
  {
    id: 'notif-3',
    title: 'Đã cập nhật chuẩn đầu ra (PLO)',
    description:
      'Bạn đã phục hồi +15% chỉ số PLO Đồ thị sau phiên luyện tập Flash Practice.',
    timeAgo: '2 giờ trước',
    isRead: false,
    category: 'plo',
    icon: 'upgrade',
    colorType: 'emerald',
  },
  {
    id: 'notif-4',
    title: 'Lớp học ICPC-2024A',
    description:
      'Giảng viên TS. Lê Hoàng Nam đã đăng tài liệu mới cho Lab 05.',
    timeAgo: 'Hôm qua',
    isRead: true,
    category: 'announcement',
    icon: 'school',
    colorType: 'neutral',
  },
  {
    id: 'notif-5',
    title: 'Bảo trì hệ thống CodeLab',
    description:
      'Nâng cấp máy chủ biên dịch C++20 hoàn tất, độ trễ thực thi giảm 30%.',
    timeAgo: '2 ngày trước',
    isRead: true,
    category: 'system',
    icon: 'terminal',
    colorType: 'neutral',
  },
];

export const MOCK_AI_TASKS: AITaskItem[] = [
  {
    id: 'task-1',
    title: 'Ôn tập 4 trường hợp xoay nút khi mất cân bằng cây AVL (15 phút)',
    subtext: 'Đã hoàn thành lúc 08:30 sáng',
    isDone: true,
    doneAt: '08:30',
    type: 'review',
    icon: 'check_circle',
  },
  {
    id: 'task-2',
    title:
      'Hoàn thành 3 câu trắc nghiệm Quick-Quiz về độ phức tạp cây tìm kiếm (10 phút)',
    subtext: 'Ưu tiên trung bình • Giúp củng cố định lý O(log N)',
    isDone: false,
    type: 'quiz',
    icon: 'quiz',
  },
  {
    id: 'task-3',
    title:
      'Thực hành bài tập tìm kiếm tiền thứ tự (Pre-order traversal) trên CodeLab Studio',
    subtext: 'Sandbox C++ / Python3 • Chấm điểm tự động qua 12 testcases',
    isDone: false,
    type: 'codelab',
    badgeText: 'CodeLab IDE',
    badgeUrl: '#',
    icon: 'code',
  },
];

// Service functions
export async function getDashboardAnalytics(): Promise<StatOverview> {
  try {
    const { data } = await api.get<ApiResponse<unknown>>(
      DASHBOARD_ENDPOINTS.ANALYTICS
    );
    return statOverviewSchema.parse(data.data);
  } catch {
    return MOCK_STAT_OVERVIEW;
  }
}

export async function getCompetencyData(): Promise<{
  heatmap: HeatmapCell[];
  pillars: CompetencyPillar[];
}> {
  try {
    const { data } = await api.get<ApiResponse<{ heatmap: unknown[]; pillars: unknown[] }>>(
      DASHBOARD_ENDPOINTS.COMPETENCY
    );
    return {
      heatmap: (data.data.heatmap || []).map((h) => h as HeatmapCell),
      pillars: (data.data.pillars || []).map((p) => competencyPillarSchema.parse(p)),
    };
  } catch {
    return {
      heatmap: MOCK_HEATMAP_CELLS,
      pillars: MOCK_COMPETENCY_PILLARS,
    };
  }
}

export async function getAIInsight(): Promise<AIInsight> {
  try {
    const { data } = await api.get<ApiResponse<unknown>>(
      DASHBOARD_ENDPOINTS.AI_INSIGHT
    );
    return aiInsightSchema.parse(data.data);
  } catch {
    return MOCK_AI_INSIGHT;
  }
}

export async function getEnrolledCourses(): Promise<CourseProgress[]> {
  try {
    const { data } = await api.get<ApiResponse<unknown[]>>(
      DASHBOARD_ENDPOINTS.COURSES
    );
    return (data.data || []).map((c) => courseProgressSchema.parse(c));
  } catch {
    return MOCK_COURSES;
  }
}

export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const { data } = await api.get<ApiResponse<unknown[]>>(
      DASHBOARD_ENDPOINTS.NOTIFICATIONS
    );
    return (data.data || []).map((n) => notificationItemSchema.parse(n));
  } catch {
    return MOCK_NOTIFICATIONS;
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await api.patch(DASHBOARD_ENDPOINTS.NOTIFICATION_READ(id));
  } catch {
    // Optimistic fallback
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await api.post(DASHBOARD_ENDPOINTS.NOTIFICATIONS_READ_ALL);
  } catch {
    // Optimistic fallback
  }
}

export async function getAITasks(): Promise<AITaskItem[]> {
  return MOCK_AI_TASKS;
}
