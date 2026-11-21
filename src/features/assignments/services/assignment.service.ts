import { api } from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types/common';
import { getClassById } from '@/features/classes/services/class.service';
import {
  assignmentItemSchema,
  assignmentListEnvelopeSchema,
  mySubmissionSchema,
  gradeProgressSchema,
  aiRecommendationSchema,
  studentPerformanceSchema,
  classHubInfoSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  teacherSubmissionItemSchema,
  teacherSubmissionListEnvelopeSchema,
  batchGradeResultSchema,
  submissionDetailSchema,
  submissionGradingSchema,
  gradeSubmissionPayloadSchema,
  MAX_FEEDBACK_UTF8_BYTES,
  type AssignmentItem,
  type AssignmentListResponse,
  type MySubmission,
  type TeacherSubmissionItem,
  type TeacherSubmissionListResponse,
  type BatchGradeResult,
  type SubmissionDetail,
  type SubmissionGrading,
  type GradeSubmissionPayload,
  type GradeProgress,
  type AiRecommendation,
  type StudentPerformance,
  type ClassHubInfo,
  type AssignmentFilters,
  type CreateAssignmentPayload,
  type UpdateAssignmentPayload,
  type ActiveCourseItem,
  type CourseLessonItem,
} from '../schemas/assignment.schema';
import { evaluateCanCancelSubmission } from '../utils/submissionValidation';

export interface DueDateStatus {
  label: string;
  isPastDue: boolean;
  isDueSoon: boolean;
  isNoDeadline: boolean;
  rawDate?: Date | null;
}

// Storage key for locally deleted assignments in demo mode
const DELETED_ASSIGNMENTS_STORAGE_KEY = 'ilms_deleted_assignments';
// Storage key for locally created assignments in demo mode
const CREATED_ASSIGNMENTS_STORAGE_KEY = 'ilms_created_assignments';

export function getCreatedAssignments(classId?: string): AssignmentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CREATED_ASSIGNMENTS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        if (!classId) return arr;
        return arr.filter(
          (item: AssignmentItem) => !item.classId || item.classId === classId
        );
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveCreatedAssignment(item: AssignmentItem): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCreatedAssignments();
    const filtered = existing.filter((a) => a.id !== item.id);
    const updated = [item, ...filtered];
    localStorage.setItem(
      CREATED_ASSIGNMENTS_STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch {
    // ignore
  }
}

export function removeCreatedAssignment(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCreatedAssignments();
    const updated = existing.filter((a) => a.id !== id);
    localStorage.setItem(
      CREATED_ASSIGNMENTS_STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch {
    // ignore
  }
}

export function resetCreatedAssignments(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CREATED_ASSIGNMENTS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export interface StoredGrading {
  submissionId: string;
  assignmentId: string;
  studentId?: string;
  score: number;
  feedback: string | null;
  status: 'GRADED';
  gradedAt: string;
  gradedByTeacherName: string;
}

export function saveStoredGrading(grading: StoredGrading): void {
  if (typeof window === 'undefined') return;
  try {
    const singleKey = `ilms_graded_sub_${grading.assignmentId}_${grading.submissionId}`;
    localStorage.setItem(singleKey, JSON.stringify(grading));

    const mapKey = `ilms_graded_submissions_map_${grading.assignmentId}`;
    const raw = localStorage.getItem(mapKey);
    const map: Record<string, StoredGrading> = raw ? JSON.parse(raw) : {};
    map[grading.submissionId] = grading;
    localStorage.setItem(mapKey, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getStoredGrading(
  assignmentId: string,
  submissionId: string
): StoredGrading | null {
  if (typeof window === 'undefined') return null;
  try {
    const singleKey = `ilms_graded_sub_${assignmentId}_${submissionId}`;
    const rawSingle = localStorage.getItem(singleKey);
    if (rawSingle) {
      return JSON.parse(rawSingle) as StoredGrading;
    }

    const mapKey = `ilms_graded_submissions_map_${assignmentId}`;
    const rawMap = localStorage.getItem(mapKey);
    if (rawMap) {
      const map: Record<string, StoredGrading> = JSON.parse(rawMap);
      if (map[submissionId]) {
        return map[submissionId];
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function getAllStoredGradings(assignmentId: string): Record<string, StoredGrading> {
  if (typeof window === 'undefined') return {};
  try {
    const mapKey = `ilms_graded_submissions_map_${assignmentId}`;
    const rawMap = localStorage.getItem(mapKey);
    if (rawMap) {
      return JSON.parse(rawMap);
    }
  } catch {
    // ignore
  }
  return {};
}

export function resetStoredGradings(assignmentId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (assignmentId) {
      const mapKey = `ilms_graded_submissions_map_${assignmentId}`;
      localStorage.removeItem(mapKey);
      const prefix = `ilms_graded_sub_${assignmentId}_`;
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) toRemove.push(k);
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } else {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('ilms_graded_sub_') || k.startsWith('ilms_graded_submissions_map_'))) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    }
  } catch {
    // ignore
  }
}

export function getDeletedAssignmentIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_ASSIGNMENTS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set();
}

export function saveDeletedAssignmentId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getDeletedAssignmentIds();
    current.add(id);
    localStorage.setItem(
      DELETED_ASSIGNMENTS_STORAGE_KEY,
      JSON.stringify(Array.from(current))
    );
  } catch {
    // ignore
  }
}

export function resetDeletedAssignmentIds(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DELETED_ASSIGNMENTS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Check whether a demo assignment has any active valid submissions:
 * Sources checked:
 * 1. Initial demo submissions (INITIAL_DEMO_SUBMISSIONS[assignmentId])
 * 2. Teacher mock submissions list (MOCK_TEACHER_SUBMISSIONS[assignmentId])
 * 3. Student submissions saved in localStorage for this assignment
 *
 * Rules:
 * - If a submission was cancelled by student, its status is stored as NOT_SUBMITTED in localStorage.
 * - Stored NOT_SUBMITTED status overrides the initial submission status for that exact record.
 * - An assignment can be deleted ONLY when NO active submissions remain (all are cancelled or none exist).
 */
export function hasActiveDemoSubmissions(assignmentId: string): boolean {
  return getActiveDemoSubmissions(assignmentId).length > 0;
}

/**
 * Delete an assignment (Teacher operation):
 * Endpoint: DELETE /api/v1/assignments/{id}
 * Rules:
 * - 204 No Content (hoặc 200 OK): Xóa thành công
 * - 409 Conflict: Bài tập đã có bài nộp sẽ không thể xóa
 */
export async function deleteAssignment(
  assignmentId: string,
  classId?: string
): Promise<void> {
  const isMockId = isDemoAssignment(assignmentId, classId);

  // 1. Xử lý demo cục bộ (Mock ID): không gửi request ra backend ngoài
  if (isMockId) {
    // Dùng chung tập bản nộp của đúng assignmentId cho điều kiện xóa
    const activeSubmissions = getActiveDemoSubmissions(assignmentId);
    const hasSubmissions = activeSubmissions.length > 0;

    if (hasSubmissions) {
      const conflictErr = new Error('Bài tập đã có bài nộp sẽ không thể xóa.');
      (conflictErr as unknown as { httpStatus: number; assignmentId: string; responseData: unknown }).httpStatus = 409;
      (conflictErr as unknown as { assignmentId: string }).assignmentId = assignmentId;
      (conflictErr as unknown as { responseData: unknown }).responseData = {
        message: 'Bài tập đã có bài nộp sẽ không thể xóa.',
        activeSubmissionsCount: activeSubmissions.length,
      };
      (conflictErr as unknown as { response: { status: number; data: unknown } }).response = {
        status: 409,
        data: {
          message: 'Bài tập đã có bài nộp sẽ không thể xóa.',
          activeSubmissionsCount: activeSubmissions.length,
        },
      };
      throw conflictErr;
    }

    // Nếu bài tập demo không còn bản nộp còn hiệu lực, dọn khỏi kho bài tạo và ghi nhận xóa
    removeCreatedAssignment(assignmentId);
    saveDeletedAssignmentId(assignmentId);
    return;
  }

  // 2. Thử gọi API thật lên backend đối với bài tập backend
  try {
    const response = await api.delete(`/assignments/${assignmentId}`);
    if (response.status === 204 || response.status === 200) {
      saveDeletedAssignmentId(assignmentId);
      return;
    }
  } catch (err: unknown) {
    const status =
      (err as { httpStatus?: number; response?: { status?: number } })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status;
    const responseData = (err as { response?: { data?: unknown } })?.response?.data;
    const errorMsg =
      (responseData as { message?: string })?.message ||
      (err as Error)?.message;

    // Khi nhận 403 Forbidden: Không có quyền xóa bài tập
    if (status === 403) {
      const forbiddenErr = new Error(errorMsg || 'Bạn không có quyền xóa bài tập này.');
      (forbiddenErr as unknown as { httpStatus: number; assignmentId: string; responseData: unknown }).httpStatus = 403;
      (forbiddenErr as unknown as { assignmentId: string }).assignmentId = assignmentId;
      (forbiddenErr as unknown as { responseData: unknown }).responseData = responseData;
      (forbiddenErr as unknown as { response: { status: number; data: unknown } }).response = {
        status: 403,
        data: responseData,
      };
      throw forbiddenErr;
    }

    // Khi nhận 409 Conflict: Bài tập đã có bài nộp
    if (status === 409) {
      const conflictErr = new Error(errorMsg || 'Bài tập đã có bài nộp sẽ không thể xóa.');
      (conflictErr as unknown as { httpStatus: number; assignmentId: string; responseData: unknown }).httpStatus = 409;
      (conflictErr as unknown as { assignmentId: string }).assignmentId = assignmentId;
      (conflictErr as unknown as { responseData: unknown }).responseData = responseData;
      (conflictErr as unknown as { response: { status: number; data: unknown } }).response = {
        status: 409,
        data: responseData,
      };
      throw conflictErr;
    }

    throw err;
  }
}

/**
 * Format a Date into LocalDateTime string ("YYYY-MM-DDTHH:mm:ss") without UTC 'Z' conversion.
 */
export function toLocalDateTimeString(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Parse a LocalDateTime string ("YYYY-MM-DDTHH:mm(:ss)") preserving exact wall-clock components
 * without forcing UTC timezone shifts. Falls back to Date constructor only for non-matching formats.
 */
function parseLocalDateTimeParts(dateStr: string): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  dateObj: Date;
} | null {
  const trimmed = dateStr.trim();
  const localMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/
  );
  if (localMatch) {
    const year = Number(localMatch[1]);
    const month = Number(localMatch[2]);
    const day = Number(localMatch[3]);
    const hours = Number(localMatch[4]);
    const minutes = Number(localMatch[5]);
    const seconds = Number(localMatch[6] || '0');
    const dateObj = new Date(year, month - 1, day, hours, minutes, seconds);
    if (!isNaN(dateObj.getTime())) {
      return { year, month, day, hours, minutes, seconds, dateObj };
    }
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hours: d.getHours(),
    minutes: d.getMinutes(),
    seconds: d.getSeconds(),
    dateObj: d,
  };
}

export function formatAssignmentDueDate(dueDate?: string | null): DueDateStatus {
  if (!dueDate || !dueDate.trim()) {
    return {
      label: 'Không có hạn nộp',
      isPastDue: false,
      isDueSoon: false,
      isNoDeadline: true,
      rawDate: null,
    };
  }

  const parts = parseLocalDateTimeParts(dueDate);
  if (!parts) {
    return {
      label: dueDate,
      isPastDue: false,
      isDueSoon: false,
      isNoDeadline: false,
      rawDate: null,
    };
  }

  const now = new Date();
  const isPastDue = parts.dateObj.getTime() < now.getTime();
  const diffHours = (parts.dateObj.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isDueSoon = !isPastDue && diffHours <= 48;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = `${pad(parts.hours)}:${pad(parts.minutes)} - ${pad(parts.day)}/${pad(parts.month)}/${parts.year}`;

  return {
    label: formatted,
    isPastDue,
    isDueSoon,
    isNoDeadline: false,
    rawDate: parts.dateObj,
  };
}

export interface FormattedSubmissionTime {
  formatted: string;
  time: string;
  date: string;
}

/**
 * Format submission time from LocalDateTime or ISO string:
 * - Returns structured formatted ("23:49 - 14/11/2026"), time ("23:49"), and date ("14/11/2026")
 */
export function formatSubmissionTime(isoDate?: string | null): FormattedSubmissionTime {
  if (!isoDate || !isoDate.trim()) {
    return {
      formatted: '',
      time: '',
      date: '',
    };
  }

  try {
    const parts = parseLocalDateTimeParts(isoDate);
    if (!parts) {
      return {
        formatted: isoDate,
        time: isoDate,
        date: '',
      };
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = `${pad(parts.hours)}:${pad(parts.minutes)}`;
    const date = `${pad(parts.day)}/${pad(parts.month)}/${parts.year}`;

    return {
      formatted: `${time} - ${date}`,
      time,
      date,
    };
  } catch {
    return {
      formatted: String(isoDate),
      time: String(isoDate),
      date: '',
    };
  }
}

/**
 * Format assignment grade score:
 * - Returns '--' if score is null, undefined, or NaN
 * - Correctly formats 0 as '0' (or '0,0' if decimal)
 * - Preserves up to 2 decimal places (e.g. 8.55 -> '8,55', 8.5 -> '8,5', 0 -> '0')
 * - Adapts decimal point for locale: ',' for 'vi', '.' for 'en'
 */
export function formatScore(score?: number | null, locale: string = 'vi'): string {
  if (score === null || score === undefined || typeof score !== 'number' || isNaN(score)) {
    return '--';
  }
  const rounded = Math.round(score * 100) / 100;
  const formattedNum = String(rounded);

  if (locale === 'vi') {
    return formattedNum.replace('.', ',');
  }
  return formattedNum;
}

// Resilient Mock Data matching the exact design specification
export const MOCK_ASSIGNMENTS: AssignmentItem[] = [
  // --- STITCH SPECIFIC ASSIGNMENTS (Database CSDL-K22-01 & CS-202) ---
  {
    id: 'assign-db-01',
    classId: 'csdl-k22-01',
    title: 'Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)',
    chapter: 'TUẦN 6',
    description:
      'Thực hành phân tích phụ thuộc hàm, xác định các khóa chính và chuẩn hóa lược đồ quan hệ đạt các dạng chuẩn 1NF, 2NF và 3NF nhằm loại bỏ dư thừa dữ liệu.',
    type: 'LAB',
    status: 'OPEN',
    typeLabel: 'Bài tập tài liệu',
    allowLateSubmission: true,
    maxScore: 10,
    dueDate: '2024-11-15T23:59:00',
    timeRemainingLabel: 'Sắp hết hạn',
    isDueSoon: true,
    fileAttachmentUrl: 'https://res.cloudinary.com/ilms/De_bai_Tuan_06.pdf',
  },
  {
    id: 'assign-db-02',
    classId: 'csdl-k22-01',
    title: 'Thiết kế lược đồ ERD mô hình dữ liệu (Tuần 7)',
    chapter: 'TUẦN 7',
    description:
      'Xây dựng mô hình thực thể kết hợp (ERD) hoàn chỉnh cho hệ thống quản lý học tập và chuyển đổi sang mô hình quan hệ logic chuẩn hóa đảm bảo toàn vẹn dữ liệu.',
    type: 'LAB',
    status: 'OPEN',
    typeLabel: 'Thực hành Terminal',
    allowLateSubmission: true,
    maxScore: 10,
    dueDate: '2024-11-22T23:59:00',
    timeRemainingLabel: 'Còn 3 ngày',
    fileAttachmentUrl: 'https://res.cloudinary.com/ilms/Yeu_cau_ERD_Logic.pdf',
  },
  {
    id: 'assign-db-03',
    classId: 'csdl-k22-01',
    title: 'Bài tập truy vấn SQL nâng cao',
    chapter: 'SQL',
    description:
      'Thực hành viết các câu truy vấn phức tạp sử dụng Window functions (ROW_NUMBER, RANK, DENSE_RANK), CTE đệ quy và đánh chỉ mục tối ưu truy vấn cơ sở dữ liệu lớn.',
    type: 'LAB',
    status: 'OPEN',
    typeLabel: 'Code SQL',
    allowLateSubmission: false,
    maxScore: 10,
    dueDate: null, // Luyện tập tự do không có hạn nộp
    fileAttachmentUrl: 'https://res.cloudinary.com/ilms/Huong_dan_SQL.docx',
  },
  {
    id: 'assign-db-04',
    classId: 'csdl-k22-01',
    title: 'Chuẩn hóa dạng chuẩn BCNF & Phân rã bảo toàn phụ thuộc hàm (Tuần 8)',
    chapter: 'TUẦN 8',
    description:
      'Áp dụng thuật toán tìm bao đóng của tập thuộc tính và thuật toán kiểm tra dạng chuẩn Boyce-Codd (BCNF), phân rã lược đồ quan hệ bảo toàn phụ thuộc hàm.',
    type: 'LAB',
    status: 'OPEN',
    typeLabel: 'Phân tích Schema',
    allowLateSubmission: true,
    maxScore: 10,
    dueDate: '2024-11-29T23:59:00',
    fileAttachmentUrl: 'https://res.cloudinary.com/ilms/Huong_dan_BCNF.docx',
  },
  {
    id: 'assign-db-05',
    classId: 'csdl-k22-01',
    title: 'Kiểm tra trắc nghiệm 15 phút lý thuyết quan hệ',
    chapter: 'QUIZ',
    description:
      'Đánh giá khả năng hiểu và ứng dụng các phép toán đại số quan hệ: phép chiếu, phép chọn, tích Descartes, kết nối tự nhiên và phép chia.',
    type: 'QUIZ',
    status: 'GRADED',
    typeLabel: 'Trắc nghiệm ngắn',
    durationMinutes: 15,
    maxScore: 10,
    studentScore: 9.0,
    studentMaxScore: 10,
    dueDate: '2024-11-10T23:59:00',
    teacherFeedback: 'Làm bài rất tốt, nắm vững lý thuyết và các phép toán kết nối tự nhiên.',
  },
  {
    id: 'assign-db-06',
    classId: 'csdl-k22-01',
    title: 'Bài tập Tối ưu hóa Câu lệnh SQL & Khóa ngoại',
    description: 'Bài kiểm tra thực hành viết query tối ưu và xử lý deadlock trong cơ sở dữ liệu quan hệ.',
    type: 'LAB',
    status: 'GRADED',
    typeLabel: 'Code SQL',
    maxScore: 10,
    studentScore: 0,
    studentMaxScore: 10,
    dueDate: '2024-10-20T23:59:00',
    submissionDate: 'Đã chấm điểm • 21/10/2024',
    teacherFeedback: 'Bài làm chưa đạt yêu cầu kiểm tra ràng buộc.',
  },
  // --- CLUSTER 1: ACTIVE & DUE ---
  {
    id: 'quiz-03',
    classId: 'cs-202',
    title: 'Quiz 03: Phân tích Header & Giao thức TCP / UDP',
    description:
      '20 câu hỏi mô phỏng • Thời gian làm bài: 35 phút • Đánh giá theo chuẩn năng lực Bloom bậc 1-3.',
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

/**
 * Detect whether a class is a demo / offline mock class
 */
export function isMockClass(classId?: string | null): boolean {
  if (!classId) return false;
  // Standard UUID format is always a real backend class
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId)) {
    return false;
  }
  return (
    classId === 'csdl-k22-01' ||
    classId === 'CNTT-K22-01' ||
    classId === 'cs-202' ||
    classId.startsWith('class-') ||
    classId.startsWith('mock-') ||
    classId.startsWith('demo-')
  );
}

/**
 * Single source of truth to detect whether an assignment belongs to Demo / Mock data
 * Tra theo classId và assignmentId để tìm được cả bài demo có sẵn và bài tạo sau.
 */
export function isDemoAssignment(assignmentId: string, classId?: string | null): boolean {
  if (!assignmentId) return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // 1. Check if it's in created assignments (demo storage created by teacher)
  try {
    const createdInClass = classId ? getCreatedAssignments(classId) : [];
    const createdAll = getCreatedAssignments();
    if (
      createdInClass.some((a) => a.id === assignmentId) ||
      createdAll.some((a) => a.id === assignmentId)
    ) {
      return true;
    }
  } catch {
    // ignore storage access errors
  }

  // 2. Check if it's in built-in mock assignments (pre-existing demo)
  if (MOCK_ASSIGNMENTS.some((a) => a.id === assignmentId)) {
    return true;
  }

  // 3. If assignmentId is a valid full UUID and classId is a valid full UUID, it is definitely a real assignment
  if (uuidRegex.test(assignmentId) && (!classId || uuidRegex.test(classId))) {
    return false;
  }

  // 4. Check known mock ID prefixes (only for non-UUID strings)
  if (
    assignmentId.startsWith('assign-') ||
    assignmentId.startsWith('quiz-') ||
    assignmentId.startsWith('lab-') ||
    assignmentId.startsWith('csdl-') ||
    assignmentId.startsWith('demo-') ||
    assignmentId === 'e211'
  ) {
    return true;
  }

  // 5. Check if classId is a mock class
  if (isMockClass(classId)) {
    return true;
  }

  return false;
}

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
  instructorName: '',
  department: 'Bộ môn: Kỹ thuật Mạng & Truyền thông',
  studentsCount: 48,
  assignmentsCount: 8,
  completionRate: 78.5,
};

// Interface matching Spring Boot AssignmentSummaryResponseDTO
interface BackendAssignmentDTO {
  id: string;
  lessonId?: string;
  title: string;
  maxScore?: number;
  dueDate?: string;
  allowLateSubmission?: boolean;
  createdAt?: string;
}

// Interface matching Spring Boot QuizResponseDTO
interface BackendQuizDTO {
  id: string;
  classId?: string;
  lessonId?: string;
  courseId?: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  maxAttempts?: number;
  isPublished?: boolean;
  createdAt?: string;
}

// Interface matching Spring Boot GradeReportResponseDTO
interface BackendGradeReportDTO {
  id: string;
  classId?: string;
  studentId?: string;
  studentName?: string;
  studentAvatar?: string;
  attendanceScore?: number;
  midtermScore?: number;
  finalScore?: number;
}

// Interface matching Spring Boot ClassResponseDTO
interface BackendClassDTO {
  id: string;
  classCode?: string;
  name?: string;
  title?: string;
  description?: string;
  academicYear?: string;
  major?: string;
  maxCapacity?: number;
  status?: string;
}

/**
 * Fetch assignments and quizzes from Spring Boot backend endpoints:
 * 1. GET /api/v1/classes/{classId}/assignments (AssignmentController)
 * 2. GET /api/v1/quizzes?classId={classId} (QuizController)
 */
export async function getAssignments(
  classId: string,
  filters?: Partial<AssignmentFilters>
): Promise<AssignmentItem[]> {
  const fetchedItems: AssignmentItem[] = [];

  // 1. Query Assignments API from Spring Boot
  try {
    const res = await api.get<ApiResponse<PaginatedResponse<BackendAssignmentDTO>>>(
      `/classes/${classId}/assignments`,
      {
        params: {
          search: filters?.search || undefined,
          page: 0,
          size: 20,
        },
      }
    );
    const backendAssignments = res.data?.data?.items;
    if (Array.isArray(backendAssignments) && backendAssignments.length > 0) {
      backendAssignments.forEach((b) => {
        const isPastDue = b.dueDate ? new Date(b.dueDate) < new Date() : false;
        fetchedItems.push({
          id: b.id,
          classId,
          title: b.title,
          type: 'LAB',
          status: isPastDue ? 'GRADED' : 'DUE_SOON',
          typeLabel: 'Thực hành Lab',
          dueDate: b.dueDate,
          dueDateLabel: b.dueDate ? `Hạn: ${new Date(b.dueDate).toLocaleDateString('vi-VN')}` : undefined,
          studentMaxScore: b.maxScore || 10,
        });
      });
    }
  } catch {
    // Backend endpoint call failed or not yet reachable
  }

  // 2. Query Quizzes API from Spring Boot
  try {
    const res = await api.get<ApiResponse<PaginatedResponse<BackendQuizDTO>>>(
      `/quizzes`,
      {
        params: {
          classId,
          search: filters?.search || undefined,
          page: 0,
          size: 20,
        },
      }
    );
    const backendQuizzes = res.data?.data?.items;
    if (Array.isArray(backendQuizzes) && backendQuizzes.length > 0) {
      backendQuizzes.forEach((q) => {
        fetchedItems.push({
          id: q.id,
          classId,
          title: q.title,
          description: q.description || '',
          type: 'QUIZ',
          status: q.isPublished ? 'OPEN' : 'UPCOMING',
          typeLabel: 'Trắc nghiệm khách quan',
          durationMinutes: q.durationMinutes || 30,
        });
      });
    }
  } catch {
    // Backend endpoint call failed or not yet reachable
  }

  // If backend returned items, return parsed items
  if (fetchedItems.length > 0) {
    const deletedIds = getDeletedAssignmentIds();
    return fetchedItems
      .filter((item) => !deletedIds.has(item.id))
      .map((item) => assignmentItemSchema.parse(item));
  }

  // Fallback to Resilient Mock Data
  const deletedIds = getDeletedAssignmentIds();
  const createdItems = getCreatedAssignments(classId).filter((a) => !deletedIds.has(a.id));
  let result = [
    ...createdItems,
    ...MOCK_ASSIGNMENTS.filter(
      (a) => !deletedIds.has(a.id) && !createdItems.some((c) => c.id === a.id)
    ),
  ];
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
 * Format date for teacher assignments view (e.g. "23:59 - 28/10/2024")
 */
export function formatTeacherDueDate(dueDate?: string | null): string {
  if (!dueDate) return '';
  const d = new Date(dueDate);
  if (isNaN(d.getTime())) return dueDate;
  const pad = (n: number) => String(n).padStart(2, '0');
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
}

/**
 * Format datetime string into ISO LocalDateTime format ("YYYY-MM-DDTHH:mm:ss")
 * As specified in user requirements: e.g. 2026-11-30T23:59:00, or null when empty.
 */
export function formatToLocalDateTime(datetimeStr?: string | null): string | null {
  if (!datetimeStr || !datetimeStr.trim()) return null;
  const trimmed = datetimeStr.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Fetch active courses of a class:
 * Endpoint: GET /api/v1/classes/{classId}/courses?status=ACTIVE
 */
export async function getClassActiveCourses(classId: string): Promise<ActiveCourseItem[]> {
  try {
    const { data } = await api.get<ApiResponse<unknown>>(`/classes/${classId}/courses`, {
      params: { status: 'ACTIVE' },
    });
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((c: Record<string, unknown>) => ({
        id: String(c.id || c.courseId || ''),
        code: String(c.code || ''),
        name: String(c.name || c.title || 'Môn học'),
        status: String(c.status || 'ACTIVE'),
      }));
    }
  } catch {
    // Backend offline / demo mode fallback
  }

  // Realistic fallback active courses for class
  return [
    {
      id: 'course-cs-202',
      code: 'CS-202',
      name: 'Mạng máy tính (CS-202)',
      status: 'ACTIVE',
    },
    {
      id: 'course-cs-301',
      code: 'CS-301',
      name: 'Thiết kế & Đánh giá Thuật toán Thông minh (CS-301)',
      status: 'ACTIVE',
    },
  ];
}

/**
 * Fetch lessons for a course (via chapters):
 * Endpoints:
 * 1. GET /api/v1/courses/{courseId}/chapters
 * 2. GET /api/v1/chapters/{chapterId}/lessons
 */
export async function getCourseLessons(courseId: string): Promise<CourseLessonItem[]> {
  try {
    const { data: chaptersData } = await api.get<ApiResponse<unknown>>(
      `/courses/${courseId}/chapters`
    );
    const chapters = Array.isArray(chaptersData?.data) ? chaptersData.data : [];

    if (chapters.length > 0) {
      const allLessons: CourseLessonItem[] = [];
      for (const ch of chapters) {
        try {
          const { data: lessonsData } = await api.get<ApiResponse<unknown>>(
            `/chapters/${ch.id}/lessons`
          );
          const lessons = Array.isArray(lessonsData?.data) ? lessonsData.data : [];
          for (const l of lessons) {
            allLessons.push({
              id: String(l.id || ''),
              title: String(l.title || l.name || 'Bài học'),
              chapterId: String(ch.id || ''),
              chapterName: String(ch.title || ch.name || ''),
              orderIndex: Number(l.orderIndex ?? 0),
            });
          }
        } catch {
          // continue with next chapter
        }
      }
      if (allLessons.length > 0) {
        return allLessons;
      }
    }
  } catch {
    // Backend offline / demo mode fallback
  }

  // Realistic mock lessons matching Stitch frame
  if (courseId.includes('cs-202') || courseId.includes('CS-202') || courseId === 'CS-202') {
    return [
      { id: 'lesson-1', title: 'Bài 1: Kiến trúc tầng mạng & Mô hình OSI', orderIndex: 1 },
      { id: 'lesson-2', title: 'Bài 2: Giao thức IP & Phân chia mạng con IPv4', orderIndex: 2 },
      { id: 'lesson-3', title: 'Bài 3: Giao thức TCP/UDP & Bắt tay 3 bước', orderIndex: 3 },
      { id: 'lesson-4', title: 'Bài 4: Phân tích gói tin với Wireshark', orderIndex: 4 },
    ];
  }

  return [
    { id: 'lesson-1', title: 'Bài 1: Tổng quan và kiến trúc căn bản', orderIndex: 1 },
    { id: 'lesson-2', title: 'Bài 2: Phân tích bài toán và mô hình hóa', orderIndex: 2 },
    { id: 'lesson-3', title: 'Bài 3: Cài đặt và thực nghiệm giải thuật', orderIndex: 3 },
  ];
}

/**
 * Create a new assignment for a class:
 * Endpoint: POST /api/v1/classes/{classId}/assignments
 */
export async function createAssignment(
  classId: string,
  payload: CreateAssignmentPayload
): Promise<AssignmentItem> {
  // Shared validation for both demo and real classes: stops execution if courseId, title, etc. are invalid
  const validatedPayload = createAssignmentSchema.parse(payload);
  const isMock = isMockClass(classId);

  const formattedDueDate = formatToLocalDateTime(validatedPayload.dueDate);
  const formattedUrl = validatedPayload.fileAttachmentUrl?.trim() || null;

  const requestBody = {
    courseId: validatedPayload.courseId,
    lessonId: validatedPayload.lessonId || null,
    title: validatedPayload.title.trim(),
    description: validatedPayload.description?.trim() || '',
    maxScore: validatedPayload.maxScore,
    dueDate: formattedDueDate,
    allowLateSubmission: Boolean(validatedPayload.allowLateSubmission),
    fileAttachmentUrl: formattedUrl,
  };

  try {
    const { data } = await api.post<ApiResponse<unknown>>(
      `/classes/${classId}/assignments`,
      requestBody
    );
    if (data?.data) {
      const parsed = assignmentItemSchema.safeParse(data.data);
      if (parsed.success) {
        saveCreatedAssignment(parsed.data);
        return parsed.data;
      }
    }
  } catch (err: unknown) {
    if (!isMock) {
      throw err;
    }
  }

  // Demo / Offline fallback: construct new AssignmentItem and persist to demo storage
  const newAssignment: AssignmentItem = {
    id: `assign-new-${Date.now()}`,
    classId,
    courseId: requestBody.courseId,
    lessonId: requestBody.lessonId || undefined,
    title: requestBody.title,
    description: requestBody.description,
    maxScore: requestBody.maxScore,
    studentMaxScore: requestBody.maxScore,
    dueDate: requestBody.dueDate,
    dueDateLabel: requestBody.dueDate
      ? formatTeacherDueDate(requestBody.dueDate)
      : 'Không có hạn nộp',
    allowLateSubmission: requestBody.allowLateSubmission,
    fileAttachmentUrl: requestBody.fileAttachmentUrl,
    status: 'OPEN',
    type: 'LAB',
    typeLabel: 'Bài tập thực hành',
    submittedCount: 0,
    totalStudents: 48,
    pendingGradingCount: 0,
    chapter: undefined,
    topic: undefined,
  };

  saveCreatedAssignment(newAssignment);
  return newAssignment;
}

/**
 * Update an existing assignment:
 * Endpoint: PATCH /api/v1/assignments/{id}
 * Body: only changed (dirty) fields
 */
export async function updateAssignment(
  assignmentId: string,
  dirtyPayload: Partial<UpdateAssignmentPayload>,
  classId?: string
): Promise<AssignmentItem> {
  const endpointPath = `/assignments/${assignmentId}`;

  // Build formatted dirty payload
  const formattedPayload: Record<string, unknown> = {};

  if (dirtyPayload.title !== undefined) {
    formattedPayload.title = dirtyPayload.title.trim();
  }
  if (dirtyPayload.description !== undefined) {
    formattedPayload.description = dirtyPayload.description.trim();
  }
  if (dirtyPayload.lessonId !== undefined) {
    formattedPayload.lessonId = dirtyPayload.lessonId || null;
  }
  if (dirtyPayload.maxScore !== undefined) {
    formattedPayload.maxScore = Number(dirtyPayload.maxScore);
  }
  if (dirtyPayload.dueDate !== undefined) {
    formattedPayload.dueDate = dirtyPayload.dueDate ? formatToLocalDateTime(dirtyPayload.dueDate) : null;
  }
  if (dirtyPayload.allowLateSubmission !== undefined) {
    formattedPayload.allowLateSubmission = Boolean(dirtyPayload.allowLateSubmission);
  }
  if (dirtyPayload.fileAttachmentUrl !== undefined) {
    formattedPayload.fileAttachmentUrl = dirtyPayload.fileAttachmentUrl?.trim() || null;
  }

  // If no fields changed, return existing
  if (Object.keys(formattedPayload).length === 0) {
    return getAssignmentById(assignmentId, classId);
  }

  try {
    const { data } = await api.patch<ApiResponse<unknown>>(
      endpointPath,
      formattedPayload
    );

    const existing = await getAssignmentById(assignmentId, classId).catch(() => null);
    const updatedItem: AssignmentItem = {
      ...(existing || {
        id: assignmentId,
        classId: classId || 'csdl-k22-01',
        title: String(formattedPayload.title || ''),
        status: 'OPEN',
        type: 'LAB',
        maxScore: 10,
        studentMaxScore: 10,
        submittedCount: 0,
        totalStudents: 48,
        pendingGradingCount: 0,
      }),
      ...((data?.data as Record<string, unknown>) || {}),
      ...formattedPayload,
      id: assignmentId,
    };
    if (formattedPayload.dueDate !== undefined) {
      updatedItem.dueDate = formattedPayload.dueDate as string | null;
      updatedItem.dueDateLabel = updatedItem.dueDate
        ? formatTeacherDueDate(updatedItem.dueDate)
        : 'Không có hạn nộp';
    }
    if (formattedPayload.maxScore !== undefined) {
      updatedItem.maxScore = Number(formattedPayload.maxScore);
      updatedItem.studentMaxScore = Number(formattedPayload.maxScore);
    }
    if (formattedPayload.allowLateSubmission !== undefined) {
      updatedItem.allowLateSubmission = Boolean(formattedPayload.allowLateSubmission);
    }

    saveCreatedAssignment(updatedItem);
    return updatedItem;
  } catch (err: unknown) {
    const isDemo = isDemoAssignment(assignmentId, classId);
    if (isDemo) {
      const existing = await getAssignmentById(assignmentId, classId).catch(() => null);
      const updatedDemo: AssignmentItem = {
        ...(existing || {
          id: assignmentId,
          classId: classId || 'csdl-k22-01',
          title: String(formattedPayload.title || ''),
          status: 'OPEN',
          type: 'LAB',
          maxScore: 10,
          studentMaxScore: 10,
          submittedCount: 0,
          totalStudents: 48,
          pendingGradingCount: 0,
        }),
        ...formattedPayload,
        id: assignmentId,
      };
      if (formattedPayload.dueDate !== undefined) {
        updatedDemo.dueDate = formattedPayload.dueDate as string | null;
        updatedDemo.dueDateLabel = updatedDemo.dueDate
          ? formatTeacherDueDate(updatedDemo.dueDate)
          : 'Không có hạn nộp';
      }
      if (formattedPayload.maxScore !== undefined) {
        updatedDemo.maxScore = Number(formattedPayload.maxScore);
        updatedDemo.studentMaxScore = Number(formattedPayload.maxScore);
      }
      if (formattedPayload.allowLateSubmission !== undefined) {
        updatedDemo.allowLateSubmission = Boolean(formattedPayload.allowLateSubmission);
      }

      saveCreatedAssignment(updatedDemo);
      return updatedDemo;
    }

    throw err;
  }
}

/**
 * Fetch paginated assignments for student table view:
 * Endpoint: GET /api/v1/classes/{classId}/assignments
 */
export async function getClassAssignmentsPaged(
  classId: string,
  options: {
    search?: string;
    page?: number;
    size?: number;
    status?: string;
  } = {}
): Promise<AssignmentListResponse> {
  const page = options.page ?? 0;
  const size = options.size ?? 10;
  const search = options.search?.trim();

  try {
    const { data } = await api.get<ApiResponse<unknown>>(`/classes/${classId}/assignments`, {
      params: {
        search: search || undefined,
        page,
        size,
        status: options.status && options.status !== 'ALL' ? options.status : undefined,
      },
    });

    if (data?.data) {
      let apiItems: AssignmentItem[] = [];
      let totalElements = 0;
      let totalPages = 1;

      const parsed = assignmentListEnvelopeSchema.safeParse(data.data);
      if (parsed.success) {
        apiItems = parsed.data.items.map((it) => ({
          ...it,
          classId: it.classId || classId,
        }));
        totalElements = parsed.data.totalElements;
        totalPages = parsed.data.totalPages;
      } else {
        // Lenient fallback if envelope schema didn't match perfectly
        const rawObj = data.data as { items?: unknown[]; content?: unknown[]; totalElements?: number; totalPages?: number };
        const rawList = Array.isArray(data.data)
          ? data.data
          : rawObj?.items || rawObj?.content || [];
        if (Array.isArray(rawList)) {
          const parsedList: AssignmentItem[] = [];
          for (const raw of rawList) {
            const itemParsed = assignmentItemSchema.safeParse(raw);
            if (itemParsed.success) {
              parsedList.push({
                ...itemParsed.data,
                classId: itemParsed.data.classId || classId,
              });
            }
          }
          apiItems = parsedList;
          totalElements = typeof rawObj?.totalElements === 'number' ? rawObj.totalElements : apiItems.length;
          totalPages = typeof rawObj?.totalPages === 'number' ? rawObj.totalPages : Math.max(1, Math.ceil(totalElements / size));
        }
      }

      const deletedIds = getDeletedAssignmentIds();
      const createdItems = getCreatedAssignments(classId).filter(
        (a) => !deletedIds.has(a.id)
      );
      const deletedCountInParsed = apiItems.filter((a) => deletedIds.has(a.id)).length;
      const validParsedItems = apiItems.filter((a) => !deletedIds.has(a.id));
      let filteredItems = [
        ...createdItems,
        ...validParsedItems.filter((p) => !createdItems.some((c) => c.id === p.id)),
      ];

      if (options.status && options.status !== 'ALL') {
        const now = Date.now();
        filteredItems = filteredItems.filter((a) => {
          if (options.status === 'ACTIVE') return !!a.dueDate && new Date(a.dueDate).getTime() >= now;
          if (options.status === 'PAST_DUE') return !!a.dueDate && new Date(a.dueDate).getTime() < now;
          if (options.status === 'NO_DEADLINE') return !a.dueDate;
          return true;
        });
      }

      const finalTotalElements = Math.max(0, totalElements - deletedCountInParsed + createdItems.length);
      const finalTotalPages = Math.max(1, Math.ceil(finalTotalElements / size));
      return {
        items: filteredItems,
        pageNumber: page,
        pageSize: size,
        totalElements: finalTotalElements,
        totalPages: finalTotalPages,
        last: page >= finalTotalPages - 1,
      };
    }
  } catch (err: unknown) {
    if (!isMockClass(classId)) {
      // Re-throw any real API error (403 forbidden, 404 not found, 500 server error, network failure)
      throw err;
    }
  }

  // Fallback to Resilient Mock Data ONLY for mock classes (csdl-k22-01, cs-202)
  if (!isMockClass(classId)) {
    const deletedIds = getDeletedAssignmentIds();
    let createdItems = getCreatedAssignments(classId).filter((a) => !deletedIds.has(a.id));
    if (search) {
      const q = search.toLowerCase();
      createdItems = createdItems.filter((a) => a.title.toLowerCase().includes(q));
    }
    if (options.status && options.status !== 'ALL') {
      const now = Date.now();
      createdItems = createdItems.filter((a) => {
        if (options.status === 'ACTIVE') return !!a.dueDate && new Date(a.dueDate).getTime() >= now;
        if (options.status === 'PAST_DUE') return !!a.dueDate && new Date(a.dueDate).getTime() < now;
        if (options.status === 'NO_DEADLINE') return !a.dueDate;
        return true;
      });
    }
    const totalElements = createdItems.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const startIndex = page * size;
    const pagedItems = createdItems.slice(startIndex, startIndex + size);
    return {
      items: pagedItems,
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      last: page >= totalPages - 1,
    };
  }

  // Fallback to Resilient Mock Data with client-side pagination
  const deletedIds = getDeletedAssignmentIds();
  const createdItems = getCreatedAssignments(classId).filter((a) => !deletedIds.has(a.id));
  let items = [
    ...createdItems,
    ...MOCK_ASSIGNMENTS.filter(
      (a) => !deletedIds.has(a.id) && !createdItems.some((c) => c.id === a.id)
    ),
  ];

  if (classId === 'csdl-k22-01') {
    items = items.filter(
      (a) =>
        a.classId === 'csdl-k22-01' ||
        a.id.startsWith('assign-db') ||
        a.id.startsWith('assign-new') ||
        a.id.includes('e211')
    );
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.typeLabel?.toLowerCase().includes(q)
    );
  }

  if (options.status && options.status !== 'ALL') {
    const now = Date.now();
    items = items.filter((a) => {
      if (options.status === 'ACTIVE') return !!a.dueDate && new Date(a.dueDate).getTime() >= now;
      if (options.status === 'PAST_DUE') return !!a.dueDate && new Date(a.dueDate).getTime() < now;
      if (options.status === 'NO_DEADLINE') return !a.dueDate;
      return true;
    });
  }

  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const startIndex = page * size;
  const pagedItems = items.slice(startIndex, startIndex + size);

  return {
    items: pagedItems,
    pageNumber: page,
    pageSize: size,
    totalElements,
    totalPages,
    last: page >= totalPages - 1,
  };
}

const ASSIGNMENT_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value?: string | null): boolean {
  if (!value) return false;
  return ASSIGNMENT_UUID_REGEX.test(value.trim());
}

/**
 * Fetch a single assignment detail by ID:
 * Endpoint: GET /api/v1/assignments/{id}
 */
export async function getAssignmentById(id: string, classId?: string): Promise<AssignmentItem> {
  const isUuid = isValidUuid(id);
  const isDemo = isDemoAssignment(id, classId);

  // If assignment was deleted locally, throw structured 404 not found
  const deletedIds = getDeletedAssignmentIds();
  if (deletedIds.has(id)) {
    const err = new Error(`Assignment with id ${id} not found`) as Error & {
      httpStatus?: number;
      code?: string;
    };
    err.httpStatus = 404;
    err.code = 'ASSIGNMENT_NOT_FOUND';
    throw err;
  }

  // 1. For real UUID assignments, fetch directly from backend API without mock fallback
  if (isUuid && !isDemo) {
    const { data } = await api.get<ApiResponse<unknown>>(`/assignments/${id}`);
    if (!data?.data) {
      const schemaErr = new Error('Assignment response payload is missing data') as Error & {
        code?: string;
      };
      schemaErr.code = 'SCHEMA_ERROR';
      throw schemaErr;
    }
    return assignmentItemSchema.parse(data.data);
  }

  // 2. For demo/local assignments: Check created assignments from local storage first
  const createdMatch =
    (classId ? getCreatedAssignments(classId).find((a) => a.id === id) : null) ||
    getCreatedAssignments().find((a) => a.id === id);
  if (createdMatch) {
    return assignmentItemSchema.parse(createdMatch);
  }

  // 3. Fallback check for built-in mock assignments
  const matched = MOCK_ASSIGNMENTS.find((a) => a.id === id);
  if (matched) {
    return assignmentItemSchema.parse(matched);
  }

  if (id === 'e211') {
    const db01 = MOCK_ASSIGNMENTS.find((a) => a.id === 'assign-db-01');
    if (db01) return assignmentItemSchema.parse({ ...db01, id });
  }

  // 4. Only query backend API if the ID is a valid UUID (never send non-UUID local IDs like assign-new-*)
  if (isUuid) {
    const { data } = await api.get<ApiResponse<unknown>>(`/assignments/${id}`);
    if (!data?.data) {
      const schemaErr = new Error('Assignment response payload is missing data') as Error & {
        code?: string;
      };
      schemaErr.code = 'SCHEMA_ERROR';
      throw schemaErr;
    }
    return assignmentItemSchema.parse(data.data);
  }

  // 5. Non-UUID ID not found in local demo storage or fixtures -> structured error (never fabricate sample assignment)
  const localErr = new Error(
    `Local demo assignment with id ${id} was not found in browser storage`
  ) as Error & {
    httpStatus?: number;
    code?: string;
  };
  localErr.httpStatus = 404;
  localErr.code = 'LOCAL_DEMO_NOT_FOUND';
  throw localErr;
}

/**
 * Calculate whether a submission is late compared to official assignment deadline:
 * Rules:
 * - If assignment has no deadline (dueDate == null), isLate is always false.
 * - If submission time > due date, isLate is true.
 * - Otherwise false.
 */
export function calculateIsLate(
  submittedAtIso?: string,
  dueDateIso?: string | null
): boolean {
  if (!dueDateIso || !submittedAtIso) return false;
  try {
    const submittedTime = new Date(submittedAtIso).getTime();
    const dueTime = new Date(dueDateIso).getTime();
    if (isNaN(submittedTime) || isNaN(dueTime)) return false;
    return submittedTime > dueTime;
  } catch {
    return false;
  }
}

/**
 * Normalizes `isLate` for demo/mock submissions when reading from cache or initial data:
 * - If status is NOT_SUBMITTED or submittedAt is missing: isLate is false.
 * - If assignment has no deadline (dueDate == null / undefined / empty): isLate is false.
 * - If both submittedAt and dueDate are valid timestamps: isLate = submittedTime > dueTime.
 * - Otherwise: isLate is false.
 */
export function normalizeSubmissionIsLate(
  submission: MySubmission,
  dueDate?: string | null
): MySubmission {
  if (submission.status === 'NOT_SUBMITTED' || !submission.submittedAt) {
    return { ...submission, isLate: false };
  }
  return {
    ...submission,
    isLate: calculateIsLate(submission.submittedAt, dueDate),
  };
}

/**
 * Initial demo submissions registry: Single shared source of truth for pre-existing mock submissions
 * Aligned with Stitch Module 5 Student assignments state:
 * - assign-db-01 (Tuần 6): Chưa nộp (NOT_SUBMITTED) -> Thẻ nổi bật Navy
 * - assign-db-02 (Tuần 7): Đang chờ chấm (SUBMITTED on-time 21:15 - 02/11/2024) -> White Card 1
 * - assign-db-03 (SQL): Chưa nộp (NOT_SUBMITTED, Không có hạn nộp) -> White Card 2
 * - assign-db-04 (Tuần 8): Chưa nộp (NOT_SUBMITTED) -> White Card 3
 * - assign-db-05 (Quiz 15m): Đã chấm (GRADED, 9.0/10) -> White Card 4
 */
export const INITIAL_DEMO_SUBMISSIONS: Record<string, MySubmission> = {
  'assign-db-02': {
    id: 'sub-assign-db-02',
    assignmentId: 'assign-db-02',
    status: 'SUBMITTED',
    submittedAt: '2024-11-02T21:15:00', // Đã nộp: 21:15 – 02/11/2024 • Lần 1 (Đúng hạn)
    isLate: false,
    submissionAttempt: 1,
    maxAttempts: 3,
    content:
      'Kính gửi thầy Nam, em gửi báo cáo bài làm Thực hành thiết kế lược đồ quan hệ và kịch bản DDL:\n1. Hoàn thành thiết kế lược đồ ERD chuẩn 3NF cho mô hình kinh doanh phân phối gồm 4 thực thể: Categories, Products, Customers, Orders.\n2. Script schema_ddl.sql đã định nghĩa đầy đủ Primary Key, Foreign Key (ON DELETE CASCADE) và Check constraints.\n3. Đã chạy thử nghiệm sinh dữ liệu mẫu kiểm tra ràng buộc toàn vẹn thành công không lỗi.',
    score: null,
    feedback: null,
    attachmentUrls: [],
  },
  'assign-db-05': {
    id: 'sub-assign-db-05',
    assignmentId: 'assign-db-05',
    status: 'GRADED',
    submittedAt: '2024-11-09T14:15:00',
    gradedAt: '2024-11-11T14:30:00', // Lúc 14:30 – 11/11/2024
    gradedByTeacherName: 'TS. Lê Hoàng Nam',
    isLate: false,
    submissionAttempt: 1,
    maxAttempts: 1,
    content: '15/15 câu trắc nghiệm Đại số quan hệ trực tuyến.',
    score: 9.0,
    feedback:
      'Làm bài rất tốt, nắm vững lý thuyết và các phép toán kết nối tự nhiên.',
    attachmentUrls: [],
  },
  'assign-db-06': {
    id: 'sub-assign-db-06',
    assignmentId: 'assign-db-06',
    status: 'GRADED',
    submittedAt: '2024-10-19T22:30:00',
    gradedAt: '2024-10-21T08:15:00',
    gradedByTeacherName: 'TS. Lê Hoàng Nam',
    isLate: false,
    submissionAttempt: 1,
    maxAttempts: 1,
    content:
      'Báo cáo kiểm tra thực hành viết query tối ưu và xử lý deadlock trong cơ sở dữ liệu quan hệ.',
    score: 0,
    feedback: '',
    attachmentUrls: [],
  },
  'quiz-02': {
    id: 'sub-quiz-02',
    assignmentId: 'quiz-02',
    status: 'GRADED',
    submittedAt: '2024-10-15T21:15:00',
    gradedAt: '2024-10-16T10:00:00',
    gradedByTeacherName: 'TS. Lê Hoàng Nam',
    isLate: false,
    score: 9.3,
    feedback: 'Xuất sắc',
    attachmentUrls: [],
  },
  'lab-01': {
    id: 'sub-lab-01',
    assignmentId: 'lab-01',
    status: 'GRADED',
    submittedAt: '2024-10-05T19:00:00',
    gradedAt: '2024-10-06T09:00:00',
    gradedByTeacherName: 'TS. Lê Hoàng Nam',
    isLate: false,
    score: 10,
    feedback: 'Mã nguồn sạch, xử lý exception socket timeout chuẩn xác.',
    attachmentUrls: [],
  },
};

/**
 * Retrieve current student identifier from active user session or default fallback
 */
export function getCurrentStudentId(): string {
  if (typeof window === 'undefined') return 'student-demo';
  try {
    const raw = localStorage.getItem('ilms_user') || localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.id || parsed.userId || parsed.studentId) {
        return String(parsed.id || parsed.userId || parsed.studentId);
      }
    }
  } catch {
    // ignore
  }
  return 'student-k22-vu-minh';
}

const SUBMISSION_STORAGE_PREFIX = 'ilms_submission';

export function getSubmissionStorageKey(
  assignmentId: string,
  studentId: string = getCurrentStudentId()
): string {
  return `${SUBMISSION_STORAGE_PREFIX}_${studentId}_${assignmentId}`;
}

/**
 * Retrieve all potential storage keys for an assignment across student IDs and legacy versions
 */
export function getAllSubmissionStorageKeys(
  assignmentId: string,
  studentId: string = getCurrentStudentId()
): string[] {
  const keys = new Set<string>([
    getSubmissionStorageKey(assignmentId, studentId),
    getSubmissionStorageKey(assignmentId, getCurrentStudentId()),
    getSubmissionStorageKey(assignmentId, 'student-k22-vu-minh'),
    getSubmissionStorageKey(assignmentId, 'student-demo'),
    `ilms_student_submission_${assignmentId}`,
    `ilms_submission_${assignmentId}`,
  ]);

  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k.endsWith(`_${assignmentId}`) ||
            k === `ilms_student_submission_${assignmentId}` ||
            k === `ilms_submission_${assignmentId}`)
        ) {
          keys.add(k);
        }
      }
    } catch {
      // ignore storage access errors
    }
  }

  return Array.from(keys);
}

export function getLocalSubmission(
  assignmentId: string,
  studentId: string = getCurrentStudentId(),
  classId?: string
): MySubmission | null {
  if (typeof window === 'undefined') return null;
  try {
    let activeSubmission: MySubmission | null = null;
    let notSubmittedRecord: MySubmission | null = null;
    let fromStorage = false;

    // 1. Kiểm tra tất cả các khóa tiềm năng trong localStorage (bao gồm cả dữ liệu bản cũ)
    const candidateKeys = getAllSubmissionStorageKeys(assignmentId, studentId);

    for (const key of candidateKeys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as MySubmission;
          if (parsed && typeof parsed === 'object') {
            fromStorage = true;
            if (
              parsed.status === 'SUBMITTED' ||
              parsed.status === 'RESUBMITTED' ||
              parsed.status === 'LATE' ||
              parsed.status === 'GRADED'
            ) {
              activeSubmission = parsed;
              break;
            } else if (parsed.status === 'NOT_SUBMITTED') {
              if (!notSubmittedRecord) {
                notSubmittedRecord = parsed;
              }
            }
          }
        } catch {
          // ignore corrupted JSON
        }
      }
    }

    const item: MySubmission | null = activeSubmission || notSubmittedRecord;

    // 2. Nếu trong storage chưa từng có thao tác lưu/hủy nào (chưa có bản ghi)
    // Đọc từ nguồn bản nộp mẫu ban đầu có sẵn (INITIAL_DEMO_SUBMISSIONS)
    if (!item && INITIAL_DEMO_SUBMISSIONS[assignmentId]) {
      const initItem = INITIAL_DEMO_SUBMISSIONS[assignmentId];
      const matched =
        (classId ? getCreatedAssignments(classId).find((a) => a.id === assignmentId) : null) ||
        getCreatedAssignments().find((a) => a.id === assignmentId) ||
        MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId);
      const normalized = normalizeSubmissionIsLate(initItem, matched?.dueDate);
      saveLocalSubmission(assignmentId, normalized, studentId);
      return normalized;
    }

    if (!item) return null;

    const isMockId = isDemoAssignment(assignmentId, classId);

    if (isMockId) {
      const matched =
        (classId ? getCreatedAssignments(classId).find((a) => a.id === assignmentId) : null) ||
        getCreatedAssignments().find((a) => a.id === assignmentId) ||
        MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId);
      const initialItem = INITIAL_DEMO_SUBMISSIONS[assignmentId];
      let needsResave = false;

      // Phục hồi và làm sạch nếu bản lưu cũ của assign-db-05 bị dính dữ liệu mẫu từ Stitch
      if (assignmentId === 'assign-db-05' && item.status === 'GRADED') {
        const isStitchPolluted =
          item.score === 8.5 ||
          item.submittedAt?.startsWith('2024-10-28') ||
          item.content?.includes('chuẩn hóa CSDL Tuần 6') ||
          item.feedback?.includes('tìm khóa');

        if (isStitchPolluted && initialItem) {
          item.score = initialItem.score;
          item.content = initialItem.content;
          item.feedback = initialItem.feedback;
          item.submittedAt = initialItem.submittedAt;
          item.gradedAt = initialItem.gradedAt;
          item.gradedByTeacherName = initialItem.gradedByTeacherName;
          item.isLate = false;
          needsResave = true;
        }
      }

      // Fallback graded fields if older cached demo submission lacked them
      if (initialItem && item.status === 'GRADED') {
        if (!item.gradedAt && initialItem.gradedAt) {
          item.gradedAt = initialItem.gradedAt;
          needsResave = true;
        }
        if (!item.gradedByTeacherName && initialItem.gradedByTeacherName) {
          item.gradedByTeacherName = initialItem.gradedByTeacherName;
          needsResave = true;
        }
        // Chuẩn hóa nếu bản lưu cũ bị nhiễm chuỗi banner lớp
        if (
          item.gradedByTeacherName &&
          (item.gradedByTeacherName.includes('Chủ nhiệm môn') ||
            item.gradedByTeacherName.includes('giảng viên'))
        ) {
          item.gradedByTeacherName = initialItem.gradedByTeacherName || 'TS. Lê Hoàng Nam';
          needsResave = true;
        }
        if (!item.submittedAt && initialItem.submittedAt) {
          item.submittedAt = initialItem.submittedAt;
          needsResave = true;
        }
      }
      const normalized = normalizeSubmissionIsLate(item, matched?.dueDate);
      if (fromStorage && (needsResave || (activeSubmission && item.isLate !== normalized.isLate))) {
        saveLocalSubmission(assignmentId, normalized, studentId);
      }
      return normalized;
    }

    return item;
  } catch {
    return null;
  }
}

export function saveLocalSubmission(
  assignmentId: string,
  item: MySubmission,
  studentId: string = getCurrentStudentId()
): void {
  if (typeof window === 'undefined') return;
  try {
    const dataStr = JSON.stringify(item);
    const keys = getAllSubmissionStorageKeys(assignmentId, studentId);

    keys.forEach((key) => {
      localStorage.setItem(key, dataStr);
    });
  } catch {
    // quota exceeded or storage disabled
  }
}

export function removeLocalSubmission(
  assignmentId: string,
  studentId: string = getCurrentStudentId()
): void {
  if (typeof window === 'undefined') return;
  try {
    const keys = getAllSubmissionStorageKeys(assignmentId, studentId);
    keys.forEach((k) => {
      localStorage.removeItem(k);
    });
  } catch {
    // ignore
  }
}

/**
 * Delete / cancel a student's submission:
 * Endpoint: DELETE /api/v1/submissions/{id}
 * Quy tắc:
 * - Dùng chung bản nộp hiện tại với giao diện để đánh giá quyền hủy (SUBMITTED, RESUBMITTED, LATE; khóa GRADED).
 * - Với demo / mock ID: đồng bộ ghi đè NOT_SUBMITTED bền vững vào tất cả các khóa lưu trữ (kể cả bản cũ).
 * - Với UUID thật:
 *   - Gọi DELETE /api/v1/submissions/{id} lên backend trước.
 *   - Backend trả về 204 No Content (hoặc 200 OK) là thành công, sau đó cập nhật cache NOT_SUBMITTED.
 *   - Nếu API trả lỗi (400, 403, 404, 500), không ghi đè local và ném lỗi với thông báo thực tế để modal báo lỗi.
 */
export async function deleteSubmission(
  submissionId: string,
  assignmentId?: string,
  studentId: string = getCurrentStudentId(),
  currentSubmission?: MySubmission | null
): Promise<void> {
  const isMockId =
    submissionId.startsWith('sub-') ||
    (assignmentId ? isDemoAssignment(assignmentId) : false);

  const resolvedStudentId =
    studentId ||
    currentSubmission?.studentId ||
    getCurrentStudentId();

  const resolvedSubId =
    submissionId ||
    currentSubmission?.id ||
    (assignmentId ? INITIAL_DEMO_SUBMISSIONS[assignmentId]?.id : undefined);

  const notSubmittedRecord: MySubmission = {
    id: resolvedSubId,
    assignmentId: assignmentId || '',
    studentId: resolvedStudentId,
    status: 'NOT_SUBMITTED',
    score: null,
    feedback: null,
    attachmentUrls: [],
    content: undefined,
    submittedAt: undefined,
    submissionAttempt: undefined,
    isLate: false,
  };

  // 1. Kiểm tra quyền hủy trên bản nộp hiện tại (ưu tiên bản nộp đang hiển thị trên giao diện)
  const subToEvaluate =
    currentSubmission || (assignmentId ? getLocalSubmission(assignmentId, resolvedStudentId) : null);

  if (subToEvaluate) {
    const evaluation = evaluateCanCancelSubmission({ submission: subToEvaluate });
    if (!evaluation.canCancel) {
      throw new Error(evaluation.message || 'Không thể hủy bài nộp ở trạng thái hiện tại.');
    }
  }

  // 2. Xử lý demo / mock ID: lưu NOT_SUBMITTED bền vững vào tất cả các khóa (kể cả bản cũ)
  if (isMockId) {
    if (assignmentId) {
      saveLocalSubmission(assignmentId, notSubmittedRecord, resolvedStudentId);
    }
    return;
  }

  // 3. Xử lý UUID thật trên API backend: DELETE /api/v1/submissions/{id}
  if (!submissionId) {
    throw new Error('Mã bài nộp không hợp lệ để thực hiện hủy.');
  }

  try {
    const response = await api.delete(`/submissions/${submissionId}`);

    // HTTP 204 No Content hoặc 200 OK được coi là thành công (kể cả body rỗng)
    if (response.status === 204 || response.status === 200) {
      if (assignmentId) {
        removeLocalSubmission(assignmentId, resolvedStudentId);
      }
    }
  } catch (err: unknown) {
    const apiMsg =
      (err as { message?: string; response?: { data?: { message?: string } } })?.response?.data
        ?.message ||
      (err as Error)?.message;
    if (apiMsg) {
      throw new Error(apiMsg);
    }
    throw err;
  }
}

/**
 * Fetch current student submission status for an assignment:
 * Endpoint: GET /api/v1/assignments/{assignmentId}/my-submission
 * Rules:
 * - 200: Student has submitted (SUBMITTED, RESUBMITTED, LATE, GRADED)
 * - 404: "Không tìm thấy bài nộp" -> Student has NOT submitted yet (NOT_SUBMITTED)
 * - 403: Student has no permission (CLASS_ACCESS_DENIED)
 * - 500 / Network: Server load error
 */
export async function getMySubmission(
  assignmentId: string,
  studentId: string = getCurrentStudentId(),
  classId?: string
): Promise<MySubmission> {
  const isUuid = isValidUuid(assignmentId);
  const isMockId = isDemoAssignment(assignmentId, classId);

  // 1. For real UUID assignments (!isMockId), query backend API directly without mock fallback
  if (isUuid && !isMockId) {
    try {
      const { data } = await api.get<ApiResponse<unknown>>(
        `/assignments/${assignmentId}/my-submission`
      );
      if (!data?.data) {
        const schemaErr = new Error('Submission response payload is missing data') as Error & {
          code?: string;
        };
        schemaErr.code = 'SCHEMA_ERROR';
        throw schemaErr;
      }
      return mySubmissionSchema.parse(data.data);
    } catch (err: unknown) {
      const errorStatus =
        (err as { httpStatus?: number; response?: { status?: number } })?.httpStatus ||
        (err as { response?: { status?: number } })?.response?.status;

      // 404 means the student hasn't submitted yet (SUBMISSION_NOT_FOUND)
      if (errorStatus === 404) {
        return {
          assignmentId,
          status: 'NOT_SUBMITTED',
          score: null,
          feedback: null,
          attachmentUrls: [],
        };
      }

      // Re-throw permission (403), auth (401), conflict (409), schema error, server error (500), or network error
      throw err;
    }
  }

  // 2. Check unified local storage for demo mode (handles demo submissions and demo cancellations)
  const local = getLocalSubmission(assignmentId, studentId, classId);
  if (local) {
    return local;
  }

  // 3. Only query backend API if assignmentId is a valid UUID (never send assign-new-* / assign-db-* to backend)
  if (isUuid) {
    try {
      const { data } = await api.get<ApiResponse<unknown>>(
        `/assignments/${assignmentId}/my-submission`
      );
      if (data?.data) {
        const parsed = mySubmissionSchema.parse(data.data);
        saveLocalSubmission(assignmentId, parsed, studentId);
        return parsed;
      }
    } catch (err: unknown) {
      const errorStatus =
        (err as { httpStatus?: number; response?: { status?: number } })?.httpStatus ||
        (err as { response?: { status?: number } })?.response?.status;

      if (errorStatus === 404) {
        const notSub: MySubmission = {
          assignmentId,
          status: 'NOT_SUBMITTED',
          score: null,
          feedback: null,
          attachmentUrls: [],
        };
        saveLocalSubmission(assignmentId, notSub, studentId);
        return notSub;
      }

      if (!isMockId) {
        throw err;
      }
    }
  }

  // 4. Resilient fallback based on mock initial items (only for demo items if not in local storage)
  if (INITIAL_DEMO_SUBMISSIONS[assignmentId]) {
    const matched = MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId);
    return normalizeSubmissionIsLate(INITIAL_DEMO_SUBMISSIONS[assignmentId], matched?.dueDate);
  }

  return {
    assignmentId,
    status: 'NOT_SUBMITTED',
    score: null,
    feedback: null,
    attachmentUrls: [],
  };
}

/**
 * Submit student assignment solution:
 * Endpoint: POST /api/v1/assignments/{assignmentId}/submissions
 * Payload: { content: string }
 * Responses:
 * - 201 Created: returns SubmissionDetailResponseDTO
 * - 409 Conflict: SUBMISSION_ALREADY_EXISTS
 */
export async function submitAssignment(
  assignmentId: string,
  payload: { content: string },
  classIdOrStudentId?: string,
  studentIdOption?: string
): Promise<MySubmission> {
  const rawContent = typeof payload.content === 'string' ? payload.content : '';
  if (!rawContent.trim()) {
    throw new Error('Vui lòng nhập nội dung bài làm hoặc đường dẫn.');
  }

  let classId: string | undefined;
  let studentId: string = getCurrentStudentId();

  if (classIdOrStudentId) {
    if (classIdOrStudentId.startsWith('student-') || classIdOrStudentId.startsWith('user-')) {
      studentId = classIdOrStudentId;
    } else {
      classId = classIdOrStudentId;
      if (studentIdOption) {
        studentId = studentIdOption;
      }
    }
  }

  const isDemo = isDemoAssignment(assignmentId, classId);

  // 1. Với bài demo: dùng kho bài nộp hiện có theo đúng bài tập và học viên, không gọi POST ra API
  if (isDemo) {
    const nowLocal = toLocalDateTimeString();
    let isLate = false;
    try {
      const assignment = await getAssignmentById(assignmentId, classId);
      isLate = calculateIsLate(nowLocal, assignment?.dueDate);
    } catch {
      isLate = false;
    }

    const mockSubmission: MySubmission = {
      id: `sub-${assignmentId}`,
      assignmentId,
      content: rawContent,
      status: 'SUBMITTED',
      score: null,
      feedback: null,
      submittedAt: nowLocal,
      isLate,
      attachmentUrls: [],
      submissionAttempt: 1,
    };
    saveLocalSubmission(assignmentId, mockSubmission, studentId);
    return mockSubmission;
  }

  // 2. Với bài từ API thật: chỉ gửi { content } giữ nguyên định dạng/xuống dòng, dùng nguyên bản nộp từ response 201
  const { data } = await api.post<ApiResponse<unknown>>(
    `/assignments/${assignmentId}/submissions`,
    { content: rawContent }
  );

  if (!data?.data || typeof data.data !== 'object') {
    const schemaErr = new Error('Submission response payload is missing data') as Error & {
      code?: string;
    };
    schemaErr.code = 'SCHEMA_ERROR';
    throw schemaErr;
  }

  return mySubmissionSchema.parse(data.data);
}

/**
 * Update student assignment solution:
 * Endpoint: PATCH /api/v1/assignments/{assignmentId}/submissions
 * Payload: { content: string }
 * Responses:
 * - 200 OK: returns SubmissionDetailResponseDTO
 * - 400 Bad Request / 403 Forbidden / 409 Conflict
 */
export async function updateMySubmission(
  assignmentId: string,
  payload: { content: string },
  studentId: string = getCurrentStudentId(),
  classId?: string
): Promise<MySubmission> {
  const rawContent = typeof payload.content === 'string' ? payload.content : '';
  if (!rawContent.trim()) {
    throw new Error('Vui lòng nhập nội dung bài làm hoặc đường dẫn.');
  }

  const isMockId = isDemoAssignment(assignmentId, classId);

  // 1. For real assignments (!isMockId), send PATCH /assignments/{assignmentId}/submissions with { content }
  //    Preserve exact newlines/formatting, never fall through to demo/localStorage, and preserve ApiError status/code
  if (!isMockId) {
    const { data } = await api.patch<ApiResponse<unknown>>(
      `/assignments/${assignmentId}/submissions`,
      { content: rawContent }
    );
    if (!data?.data || typeof data.data !== 'object') {
      const schemaErr = new Error('Updated submission response payload is missing data') as Error & {
        code?: string;
      };
      schemaErr.code = 'SCHEMA_ERROR';
      throw schemaErr;
    }
    return mySubmissionSchema.parse(data.data);
  }

  // 2. For demo assignments: update local submission state while preserving submissionId & formatting
  const existing = await getMySubmission(assignmentId, studentId, classId);
  const updatedAttempt = (existing.submissionAttempt ?? 1) + 1;
  const nowLocal = toLocalDateTimeString();

  let isLate = existing.isLate || false;
  try {
    const assignment = await getAssignmentById(assignmentId, classId);
    isLate = calculateIsLate(nowLocal, assignment?.dueDate);
  } catch {
    // keep existing isLate
  }

  const updatedSub: MySubmission = {
    ...existing,
    id: existing.id || `sub-${assignmentId}`,
    assignmentId,
    studentId,
    content: rawContent,
    status: isLate ? 'LATE' : 'RESUBMITTED',
    submittedAt: nowLocal,
    submissionAttempt: updatedAttempt,
    isLate,
  };

  saveLocalSubmission(assignmentId, updatedSub, studentId);
  return updatedSub;
}

/**
 * Fetch submissions for multiple assignments in parallel:
 */
export async function getMySubmissionsBatch(
  assignmentIds: string[]
): Promise<Record<string, MySubmission>> {
  if (!assignmentIds.length) return {};

  const results = await Promise.all(
    assignmentIds.map(async (id) => {
      try {
        const sub = await getMySubmission(id);
        return { id, sub };
      } catch {
        return {
          id,
          sub: {
            assignmentId: id,
            status: 'NOT_SUBMITTED' as const,
            score: null,
            attachmentUrls: [],
          },
        };
      }
    })
  );

  const map: Record<string, MySubmission> = {};
  results.forEach(({ id, sub }) => {
    map[id] = sub;
  });
  return map;
}

/**
 * Helper to sanitize studentCode:
 * If it is undefined, empty, or a raw UUID string, return undefined (so that UI hides the secondary line).
 */
export function sanitizeStudentCode(code?: string | null): string | undefined {
  if (!code) return undefined;
  const trimmed = code.trim();
  if (!trimmed) return undefined;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

/**
 * Pre-existing mock submissions for Teacher Assignments Submissions view (Stitch HTML benchmark):
 */
export const MOCK_TEACHER_SUBMISSIONS: Record<string, TeacherSubmissionItem[]> = {
  'assign-db-01': [
    {
      id: '00000000-0000-4000-8000-000000000002',
      assignmentId: 'assign-db-01',
      studentId: 'student-le-thu-ha',
      studentName: 'Lê Thu Hà',
      studentCode: undefined,
      submittedAt: '2024-10-29T00:20:00',
      status: 'GRADED',
      isLate: true,
      score: 0,
      maxScore: 10,
      feedback: 'Chưa đạt yêu cầu chuẩn hóa 3NF.',
      content: 'Bài nộp của sinh viên Lê Thu Hà...',
      attachmentUrls: [],
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      assignmentId: 'assign-db-01',
      studentId: 'student-pham-quang-huy',
      studentName: 'Phạm Quang Huy',
      studentCode: undefined,
      submittedAt: '2024-10-29T00:15:00',
      status: 'LATE',
      isLate: true,
      score: null,
      maxScore: 10,
      feedback: null,
      content: 'Bài nộp muộn của sinh viên Phạm Quang Huy...',
      attachmentUrls: [],
    },
    {
      id: '00000000-0000-4000-8000-000000000004',
      assignmentId: 'assign-db-01',
      studentId: 'student-nguyen-minh-anh',
      studentName: 'Nguyễn Minh Anh',
      studentCode: undefined,
      submittedAt: '2024-10-28T22:30:00',
      status: 'RESUBMITTED',
      isLate: false,
      score: null,
      maxScore: 10,
      feedback: null,
      content: 'Bản nộp lại sau khi chỉnh sửa khóa chính của Nguyễn Minh Anh...',
      attachmentUrls: [],
    },
    {
      id: '00000000-0000-4000-8000-000000000005',
      assignmentId: 'assign-db-01',
      studentId: 'student-vu-duc-long',
      studentName: 'Vũ Đức Long',
      studentCode: '22028215',
      submittedAt: '2024-10-28T21:40:00',
      status: 'SUBMITTED',
      isLate: false,
      score: null,
      maxScore: 10,
      feedback: null,
      content:
        'Em nộp bài làm bài tập chuẩn hóa cơ sở dữ liệu Tuần 6.\n1. Tính bao đóng các tập thuộc tính để xác định khóa dự tuyển.\n2. Kiểm tra các phụ thuộc hàm để xác định dạng chuẩn của lược đồ.\n3. Lập phủ tối thiểu và trình bày phép phân rã về 3NF.',
      attachmentUrls: [],
    },
    {
      id: '00000000-0000-4000-8000-000000000001',
      assignmentId: 'assign-db-01',
      studentId: 'student-tran-nhat-minh',
      studentName: 'Trần Nhật Minh',
      studentCode: '22028192',
      submittedAt: '2024-10-28T21:15:00',
      status: 'GRADED',
      isLate: false,
      score: 8.5,
      maxScore: 10,
      feedback: 'Lược đồ quan hệ chuẩn 3NF chính xác, giải thích bao đóng rõ ràng.',
      content: 'Kính gửi thầy Nam, em gửi bài làm bài tập chuẩn hóa CSDL Tuần 6...',
      attachmentUrls: [],
    },
  ],
};

/**
 * Mock profiles registry for student lookup by studentId
 */
export const DEMO_STUDENT_PROFILES: Record<string, { name: string; studentCode?: string }> = {
  'student-le-thu-ha': { name: 'Lê Thu Hà', studentCode: undefined },
  '00000000-0000-4000-8000-000000000002': { name: 'Lê Thu Hà', studentCode: undefined },
  'student-pham-quang-huy': { name: 'Phạm Quang Huy', studentCode: undefined },
  '00000000-0000-4000-8000-000000000003': { name: 'Phạm Quang Huy', studentCode: undefined },
  'student-nguyen-minh-anh': { name: 'Nguyễn Minh Anh', studentCode: undefined },
  '00000000-0000-4000-8000-000000000004': { name: 'Nguyễn Minh Anh', studentCode: undefined },
  'student-vu-duc-long': { name: 'Vũ Đức Long', studentCode: '22028215' },
  '00000000-0000-4000-8000-000000000005': { name: 'Vũ Đức Long', studentCode: '22028215' },
  'student-tran-nhat-minh': { name: 'Trần Nhật Minh', studentCode: '22028192' },
  '00000000-0000-4000-8000-000000000001': { name: 'Trần Nhật Minh', studentCode: '22028192' },
  'student-k22-vu-minh': { name: 'Vũ Minh', studentCode: '22028190' },
  'mem-03': { name: 'Trần Nhật Minh', studentCode: '22028192' },
  'mem-04': { name: 'Nguyễn Tuấn Anh', studentCode: '22028195' },
  'mem-05': { name: 'Lê Hoàng Yến', studentCode: '22028198' },
  'mem-06': { name: 'Phạm Văn Hùng', studentCode: '22028204' },
  'mem-07': { name: 'Đỗ Minh Châu', studentCode: '22028210' },
  'mem-08': { name: 'Vũ Đức Long', studentCode: '22028215' },
  'mem-09': { name: 'Trịnh Mai Lan', studentCode: '22028220' },
  'mem-10': { name: 'Hoàng Gia Bảo', studentCode: '22028225' },
  'student-demo': { name: 'Học viên ILMS', studentCode: 'SV22001' },
};

/**
 * Tra cứu hồ sơ học viên theo studentId để lấy thông tin tên và studentCode.
 * Dùng cho các bản demo đã lưu thiếu mã.
 */
export function lookupStudentProfile(studentId?: string | null): {
  name?: string;
  studentCode?: string;
} | null {
  if (!studentId) return null;

  // 1. Kiểm tra trong registry demo có sẵn
  if (DEMO_STUDENT_PROFILES[studentId]) {
    return DEMO_STUDENT_PROFILES[studentId];
  }

  // 2. Tra cứu trong currentUser / localStorage ilms_user
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('ilms_user') || localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        const uId = String(u.id || u.userId || u.studentId || '');
        if (
          uId === studentId ||
          studentId === 'student-k22-vu-minh' ||
          studentId === 'student-demo'
        ) {
          const code = u.studentCode || u.code || u.mssv;
          const name =
            u.fullName ||
            (u.firstName || u.lastName
              ? `${u.lastName || ''} ${u.firstName || ''}`.trim()
              : undefined);
          if (code || name) {
            return { name, studentCode: code || undefined };
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Tra cứu trong các submissions mẫu của MOCK_TEACHER_SUBMISSIONS
  for (const list of Object.values(MOCK_TEACHER_SUBMISSIONS)) {
    const match = list.find(
      (it) => it.studentId === studentId || it.id === studentId || it.studentCode === studentId
    );
    if (match) {
      return { name: match.studentName, studentCode: match.studentCode ?? undefined };
    }
  }

  return null;
}

/**
 * Shared registry lookup for all active demo submissions for a specific assignment.
 * Single source of truth used by BOTH:
 * 1. getAssignmentSubmissionsPaged (Màn danh sách bài nộp Giảng viên)
 * 2. hasActiveDemoSubmissions / deleteAssignment (Điều kiện xóa bài tập Giảng viên)
 *
 * Rules:
 * - Collects pre-existing benchmark items from MOCK_TEACHER_SUBMISSIONS and INITIAL_DEMO_SUBMISSIONS
 * - Scans localStorage for submissions belonging to this assignmentId
 * - When a student cancels their submission, a record with status === 'NOT_SUBMITTED' is stored
 * - That NOT_SUBMITTED record overrides the initial/previous submission of THAT SAME STUDENT
 * - If other students still have valid submissions, they remain active (blocking deletion)
 * - Stored gradings (scores, feedback, status) are applied
 * - Submissions with status === 'NOT_SUBMITTED' are excluded
 * - Returns only active submissions
 */
export function getActiveDemoSubmissions(assignmentId: string): TeacherSubmissionItem[] {
  const items: TeacherSubmissionItem[] = [];

  // 1. Initial base items from MOCK_TEACHER_SUBMISSIONS
  const mockList = MOCK_TEACHER_SUBMISSIONS[assignmentId];
  if (mockList && mockList.length > 0) {
    mockList.forEach((item) => {
      items.push({ ...item });
    });
  } else if (INITIAL_DEMO_SUBMISSIONS[assignmentId]) {
    // Nếu chưa có danh sách mock riêng trong MOCK_TEACHER_SUBMISSIONS nhưng có bản nộp mẫu ban đầu
    const initSub = INITIAL_DEMO_SUBMISSIONS[assignmentId];
    const defaultStudentId = initSub.studentId || 'student-k22-vu-minh';
    const profile = lookupStudentProfile(defaultStudentId);
    const subId = initSub.id || `sub-${assignmentId}`;
    items.push({
      id: subId,
      assignmentId,
      studentId: defaultStudentId,
      studentName: profile?.name || 'Vũ Minh',
      studentCode: sanitizeStudentCode(profile?.studentCode) || '22028190',
      submittedAt: initSub.submittedAt || new Date().toISOString(),
      status: initSub.status,
      isLate: Boolean(initSub.isLate),
      score: initSub.score ?? null,
      maxScore: 10,
      feedback: initSub.feedback ?? null,
      content: initSub.content ?? null,
      attachmentUrls: initSub.attachmentUrls || [],
    });
  }

  // 2. Scan localStorage for student submissions belonging to this assignment
  if (typeof window !== 'undefined') {
    try {
      const storagePrefix = 'ilms_submission_';
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.endsWith(`_${assignmentId}`) ||
            key === `ilms_student_submission_${assignmentId}` ||
            key === `ilms_submission_${assignmentId}`)
        ) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as MySubmission;
              if (
                parsed &&
                typeof parsed === 'object' &&
                (parsed.assignmentId === assignmentId || !parsed.assignmentId)
              ) {
                let rawStudentId = parsed.studentId;
                if (!rawStudentId && key.startsWith(storagePrefix)) {
                  const parts = key.slice(storagePrefix.length).split(`_${assignmentId}`);
                  if (parts[0] && parts[0] !== assignmentId) {
                    rawStudentId = parts[0];
                  }
                }
                const resolvedStudentId = rawStudentId || getCurrentStudentId();

                // Tìm bản nộp của CÙNG HỌC VIÊN trong items
                const matchIndex = items.findIndex((it) => {
                  if (it.studentId && it.studentId === resolvedStudentId) return true;
                  if (parsed.id && it.id === parsed.id) return true;
                  // Bí danh học viên demo: Trần Nhật Minh
                  const isMinhA =
                    it.studentId === 'student-tran-nhat-minh' ||
                    it.studentId === '00000000-0000-4000-8000-000000000001';
                  const isMinhB =
                    resolvedStudentId === 'student-tran-nhat-minh' ||
                    resolvedStudentId === '00000000-0000-4000-8000-000000000001';
                  if (isMinhA && isMinhB) return true;
                  // Bí danh học viên demo: Vũ Minh / Demo
                  const isVuMinhA =
                    it.studentId === 'student-k22-vu-minh' ||
                    it.studentId === 'student-demo' ||
                    it.id === `sub-${assignmentId}`;
                  const isVuMinhB =
                    resolvedStudentId === 'student-k22-vu-minh' ||
                    resolvedStudentId === 'student-demo';
                  if (isVuMinhA && isVuMinhB) return true;
                  return false;
                });

                if (parsed.status === 'NOT_SUBMITTED') {
                  // Ghi đè bản nộp cũ của CÙNG HỌC VIÊN thành NOT_SUBMITTED
                  if (matchIndex >= 0) {
                    items[matchIndex].status = 'NOT_SUBMITTED';
                  }
                } else if (parsed.status) {
                  // Bản nộp hợp lệ còn hiệu lực của học viên này
                  if (matchIndex >= 0) {
                    items[matchIndex].status = parsed.status;
                    items[matchIndex].submittedAt =
                      parsed.submittedAt || items[matchIndex].submittedAt;
                    items[matchIndex].isLate = Boolean(
                      parsed.isLate ?? items[matchIndex].isLate
                    );
                    if (typeof parsed.score === 'number') {
                      items[matchIndex].score = parsed.score;
                    }
                    if (parsed.feedback) {
                      items[matchIndex].feedback = parsed.feedback;
                    }
                    if (parsed.content) {
                      items[matchIndex].content = parsed.content;
                    }
                    if (parsed.attachmentUrls) {
                      items[matchIndex].attachmentUrls = parsed.attachmentUrls;
                    }
                    if (parsed.studentCode) {
                      items[matchIndex].studentCode = sanitizeStudentCode(
                        parsed.studentCode
                      );
                    }
                  } else {
                    const profile = lookupStudentProfile(resolvedStudentId);
                    const subId =
                      parsed.id || `sub-${assignmentId}-${resolvedStudentId}`;
                    items.push({
                      id: subId,
                      assignmentId,
                      studentId: resolvedStudentId,
                      studentName:
                        profile?.name ||
                        (resolvedStudentId === 'student-k22-vu-minh'
                          ? 'Vũ Minh'
                          : resolvedStudentId ===
                            '00000000-0000-4000-8000-000000000001'
                            ? 'Trần Nhật Minh'
                            : 'Học viên ILMS'),
                      studentCode:
                        sanitizeStudentCode(parsed.studentCode) ||
                        sanitizeStudentCode(profile?.studentCode),
                      submittedAt:
                        parsed.submittedAt || new Date().toISOString(),
                      status: parsed.status,
                      isLate: Boolean(parsed.isLate),
                      score:
                        typeof parsed.score === 'number'
                          ? parsed.score
                          : null,
                      maxScore: 10,
                      feedback: parsed.feedback || null,
                      content: parsed.content || null,
                      attachmentUrls: parsed.attachmentUrls || [],
                    });
                  }
                }
              }
            } catch {
              // ignore parse error
            }
          }
        }
      }
    } catch {
      // ignore storage error
    }
  }

  // 3. Áp dụng kết quả chấm điểm đã lưu cho toàn bộ bản nộp
  const storedGradings = getAllStoredGradings(assignmentId);
  items.forEach((item) => {
    const stored =
      storedGradings[item.id] || getStoredGrading(assignmentId, item.id);
    if (stored) {
      item.score = stored.score;
      item.feedback = stored.feedback;
      item.status = stored.status;
    }
  });

  // 4. Lọc bỏ các bản nộp có trạng thái NOT_SUBMITTED (đã bị hủy)
  return items.filter((item) => item.status && item.status !== 'NOT_SUBMITTED');
}

export const getValidDemoSubmissionsForAssignment = getActiveDemoSubmissions;

export interface ClassSubmissionPermissionContext {
  classId: string;
  isDemoTeacherView?: boolean;
  isAuthLoading?: boolean;
  isClassLoading?: boolean;
  isClassError?: boolean;
  isClassInfoLive?: boolean;
  isMembersLive?: boolean;
  user?: {
    id?: string | null;
    roleName?: string | null;
  } | null;
  classInfo?: {
    ownerId?: string | null;
    instructor?: { id?: string | null } | null;
  } | null;
  members?: Array<{
    id?: string | null;
    userId?: string | null;
    role?: string | null;
    status?: string | null;
  }> | null;
}

/**
 * Evaluate whether the authenticated user has real management permission over
 * assignment submissions in the active class.
 * - Real classes: strictly requires authenticated session + live class/member data
 *   proving ADMIN, class owner/instructor, or approved OWNER/TEACHER/TA class member.
 *   Never grants write permission from role switcher, email domain, or localStorage.
 * - Demo classes (csdl-*): allows local demo teacher view.
 */
export function evaluateCanManageClassSubmissions(
  ctx: ClassSubmissionPermissionContext
): boolean {
  if (isMockClass(ctx.classId)) {
    return Boolean(ctx.isDemoTeacherView);
  }

  if (ctx.isAuthLoading || ctx.isClassLoading || ctx.isClassError) {
    return false;
  }

  const userId = ctx.user?.id?.trim();
  if (!userId) return false;

  const normalizedRole = (ctx.user?.roleName || '').trim().toUpperCase();
  if (normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN') {
    return true;
  }

  if (!ctx.isClassInfoLive || !ctx.classInfo) {
    return false;
  }

  if (ctx.classInfo.ownerId && String(ctx.classInfo.ownerId) === String(userId)) {
    return true;
  }

  if (ctx.classInfo.instructor?.id && String(ctx.classInfo.instructor.id) === String(userId)) {
    return true;
  }

  if (ctx.isMembersLive && Array.isArray(ctx.members)) {
    const isApprovedTeacher = ctx.members.some((m) => {
      const memberUid = m.userId || m.id;
      if (!memberUid || String(memberUid) !== String(userId)) return false;
      const role = (m.role || '').trim().toUpperCase();
      const status = (m.status || '').trim().toUpperCase();
      const isManagerRole =
        role === 'OWNER' ||
        role === 'TEACHER' ||
        role === 'PRIMARY_INSTRUCTOR' ||
        role === 'TA';
      const isActiveStatus = status === 'APPROVED' || status === 'ACTIVE';
      return isManagerRole && isActiveStatus;
    });
    if (isApprovedTeacher) return true;
  }

  return false;
}

/**
 * Fetch paged submissions for an assignment (Teacher operation):
 * Endpoint: GET /api/v1/assignments/{assignmentId}/submissions
 * Query: status, search, sort, page, size
 * - Real UUID assignments: strictly parses PageResponse, returns 200 [] cleanly without demo fallback,
 *   and propagates HTTP/network/schema errors.
 * - For status='LATE' on real API: aggregates all matching pages (up to 20 pages of 100) and filters
 *   by `item.isLate === true || item.status === 'LATE'` before slicing pageSize so graded late submissions
 *   are never missed even when backend filters enum SubmissionStatus.LATE strictly.
 */
export async function getAssignmentSubmissionsPaged(
  assignmentId: string,
  options: {
    classId?: string;
    status?: 'SUBMITTED' | 'LATE' | 'GRADED';
    search?: string;
    sort?: 'submittedAt,desc' | 'submittedAt,asc';
    page?: number;
    size?: number;
  } = {}
): Promise<TeacherSubmissionListResponse> {
  const page = Math.max(0, options.page ?? 0);
  const size = Math.max(1, options.size ?? 5);
  const statusFilter = options.status;
  const rawSearch = options.search?.trim() || '';
  const searchLower = rawSearch.toLowerCase();
  const sort = options.sort ?? 'submittedAt,desc';

  const isDemo = isDemoAssignment(assignmentId, options.classId);

  // 1. Real Backend API Call (never falls back to demo/localStorage on empty or error)
  if (!isDemo) {
    if (statusFilter === 'LATE') {
      const MAX_AGGREGATE_PAGES = 20;
      const AGGREGATE_PAGE_SIZE = 100;
      const collected: TeacherSubmissionItem[] = [];
      let fetchPage = 0;
      let totalSourcePages = 1;

      while (fetchPage < totalSourcePages && fetchPage < MAX_AGGREGATE_PAGES) {
        const params: Record<string, unknown> = {
          page: fetchPage,
          size: AGGREGATE_PAGE_SIZE,
          sort,
        };
        if (rawSearch) params.search = rawSearch;

        const { data } = await api.get<ApiResponse<unknown>>(
          `/assignments/${assignmentId}/submissions`,
          { params }
        );
        if (!data || data.data === undefined || data.data === null) {
          const schemaErr = new Error('Submissions payload is missing data') as Error & {
            code?: string;
          };
          schemaErr.code = 'SCHEMA_ERROR';
          throw schemaErr;
        }
        const parsed = teacherSubmissionListEnvelopeSchema.safeParse(data.data);
        if (!parsed.success) {
          const schemaErr = new Error('Submissions payload does not match schema') as Error & {
            code?: string;
          };
          schemaErr.code = 'SCHEMA_ERROR';
          throw schemaErr;
        }

        collected.push(...parsed.data.items);
        totalSourcePages = parsed.data.totalPages;
        if (parsed.data.last || parsed.data.items.length === 0) {
          break;
        }
        fetchPage++;
      }

      const lateItems = collected.filter((it) => it.isLate === true || it.status === 'LATE');
      const totalElements = lateItems.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / size));
      const start = page * size;
      const pagedItems = lateItems.slice(start, start + size);

      return {
        items: pagedItems,
        pageNumber: page,
        pageSize: size,
        totalElements,
        totalPages,
        last: page >= totalPages - 1,
      };
    }

    const params: Record<string, unknown> = {
      page,
      size,
      sort,
    };
    if (statusFilter === 'SUBMITTED' || statusFilter === 'GRADED') {
      params.status = statusFilter;
    }
    if (rawSearch) {
      params.search = rawSearch;
    }

    const { data } = await api.get<ApiResponse<unknown>>(
      `/assignments/${assignmentId}/submissions`,
      { params }
    );
    if (!data || data.data === undefined || data.data === null) {
      const schemaErr = new Error('Submissions payload is missing data') as Error & {
        code?: string;
      };
      schemaErr.code = 'SCHEMA_ERROR';
      throw schemaErr;
    }
    const parsed = teacherSubmissionListEnvelopeSchema.safeParse(data.data);
    if (!parsed.success) {
      const schemaErr = new Error('Submissions payload does not match schema') as Error & {
        code?: string;
      };
      schemaErr.code = 'SCHEMA_ERROR';
      throw schemaErr;
    }
    return parsed.data;
  }

  // 2. Demo mode: dùng chung tập bản nộp của đúng assignmentId
  let items = getActiveDemoSubmissions(assignmentId);

  if (statusFilter === 'SUBMITTED') {
    items = items.filter((it) => it.status === 'SUBMITTED');
  } else if (statusFilter === 'LATE') {
    items = items.filter((it) => it.status === 'LATE' || it.isLate === true);
  } else if (statusFilter === 'GRADED') {
    items = items.filter((it) => it.status === 'GRADED');
  }

  if (searchLower) {
    items = items.filter(
      (it) =>
        it.studentName.toLowerCase().includes(searchLower) ||
        (it.studentCode && it.studentCode.toLowerCase().includes(searchLower)) ||
        it.id.toLowerCase().includes(searchLower)
    );
  }

  items.sort((a, b) => {
    const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return sort === 'submittedAt,asc' ? timeA - timeB : timeB - timeA;
  });

  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = page * size;
  const pagedItems = items.slice(start, start + size);

  return {
    items: pagedItems,
    pageNumber: page,
    pageSize: size,
    totalElements,
    totalPages,
    last: page >= totalPages - 1,
  };
}

/**
 * Bulk grade submissions:
 * Endpoint: POST /api/v1/assignments/{assignmentId}/submissions/grade/batch
 * Body: { grades: [{ submissionId, score, feedback? }] }
 * Supports HTTP 200 (all succeeded) and HTTP 207 (partial success) with strict schema parsing.
 * Never fabricates success when response fields are missing or request times out.
 */
export async function bulkGradeSubmissions(
  assignmentId: string,
  grades: Array<{ submissionId: string; score: number; feedback?: string }>,
  classId?: string
): Promise<BatchGradeResult> {
  // Deduplicate by submissionId before sending
  const seenIds = new Set<string>();
  const dedupedGrades: Array<{ submissionId: string; score: number; feedback?: string }> = [];
  for (const item of grades) {
    const cleanId = item.submissionId?.trim();
    if (!cleanId || seenIds.has(cleanId)) continue;
    seenIds.add(cleanId);
    const trimmedFeedback = typeof item.feedback === 'string' ? item.feedback.trim() : '';
    dedupedGrades.push({
      submissionId: cleanId,
      score: Number(item.score),
      ...(trimmedFeedback ? { feedback: trimmedFeedback } : {}),
    });
  }

  if (dedupedGrades.length === 0) {
    throw new Error('Không có bài nộp hợp lệ để chấm điểm.');
  }

  const isDemo = isDemoAssignment(assignmentId, classId);

  if (isDemo) {
    const successIds: string[] = [];
    dedupedGrades.forEach(({ submissionId, score, feedback }) => {
      let targetStudentId: string | undefined;
      const mockList = MOCK_TEACHER_SUBMISSIONS[assignmentId];
      if (mockList) {
        const found = mockList.find((it) => it.id === submissionId);
        if (found) {
          found.score = score;
          found.feedback = feedback || null;
          found.status = 'GRADED';
          targetStudentId = found.studentId ?? undefined;
        }
      }

      saveStoredGrading({
        submissionId,
        assignmentId,
        studentId: targetStudentId,
        score,
        feedback: feedback || null,
        status: 'GRADED',
        gradedAt: new Date().toISOString(),
        gradedByTeacherName: 'TS. Lê Hoàng Nam',
      });

      if (typeof window !== 'undefined') {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.endsWith(`_${assignmentId}`) || key.includes(submissionId))) {
              const raw = localStorage.getItem(key);
              if (raw) {
                try {
                  const parsed = JSON.parse(raw);
                  if (parsed && (parsed.id === submissionId || key.endsWith(`_${assignmentId}`))) {
                    parsed.score = score;
                    parsed.status = 'GRADED';
                    parsed.feedback = feedback || null;
                    parsed.gradedAt = new Date().toISOString();
                    localStorage.setItem(key, JSON.stringify(parsed));
                  }
                } catch {
                  // ignore
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }
      successIds.push(submissionId);
    });

    return {
      totalRequested: dedupedGrades.length,
      successCount: successIds.length,
      failedCount: 0,
      successIds,
      failedItems: [],
    };
  }

  // Real backend API POST /api/v1/assignments/{assignmentId}/submissions/grade/batch
  const { data } = await api.post<ApiResponse<unknown>>(
    `/assignments/${assignmentId}/submissions/grade/batch`,
    { grades: dedupedGrades }
  );

  const rawResult = data?.data;
  if (!rawResult || typeof rawResult !== 'object') {
    const schemaErr = new Error('Batch grading response payload is missing required fields') as Error & {
      code?: string;
    };
    schemaErr.code = 'SCHEMA_ERROR';
    throw schemaErr;
  }

  const parsed = batchGradeResultSchema.safeParse(rawResult);
  if (!parsed.success) {
    const schemaErr = new Error('Batch grading response payload does not match contract') as Error & {
      code?: string;
    };
    schemaErr.code = 'SCHEMA_ERROR';
    throw schemaErr;
  }

  return parsed.data;
}

export interface AssignmentGradingProgress {
  totalSubmissions: number; // Y
  gradedSubmissions: number; // X
  pendingGrading: number; // Y - X
  pendingSubmissions: number; // alias for pendingGrading
  completionRate: number; // Math.round((X / Y) * 100) khi Y > 0
  isAllGraded: boolean;
  hasNoSubmissions: boolean;
}

/**
 * Fetch grading progress statistics for an assignment:
 * - Uses GET /api/v1/assignments/{assignmentId}/submissions?page=0&size=1 to get totalElements (Y)
 * - Uses GET /api/v1/assignments/{assignmentId}/submissions?page=0&size=1&status=GRADED to get totalElements (X)
 * - Returns X/Y, Y - X, and percentage completion
 */
export async function getAssignmentGradingProgress(
  assignmentId: string,
  classId?: string
): Promise<AssignmentGradingProgress> {
  const isDemo = isDemoAssignment(assignmentId, classId);

  // 1. Demo Mode: Đọc trực tiếp từ chính danh sách bài nộp mà nút «Xem bài nộp» đang mở
  if (isDemo) {
    const activeSubmissions = getActiveDemoSubmissions(assignmentId);
    const total = activeSubmissions.length;
    const graded = activeSubmissions.filter((s) => s.status === 'GRADED').length;
    const pending = Math.max(0, total - graded);
    const rate = total > 0 ? Math.round((graded / total) * 100) : 0;

    return {
      totalSubmissions: total,
      gradedSubmissions: graded,
      pendingGrading: pending,
      pendingSubmissions: pending,
      completionRate: rate,
      isAllGraded: total > 0 && graded === total,
      hasNoSubmissions: total === 0,
    };
  }

  // 2. Real Backend API Call:
  try {
    const totalRes = await api.get<ApiResponse<{ totalElements?: number }>>(
      `/assignments/${assignmentId}/submissions`,
      { params: { page: 0, size: 1 } }
    );
    const total =
      totalRes.data?.data?.totalElements ??
      (totalRes.data as unknown as { totalElements?: number })?.totalElements ??
      0;

    if (total === 0) {
      return {
        totalSubmissions: 0,
        gradedSubmissions: 0,
        pendingGrading: 0,
        pendingSubmissions: 0,
        completionRate: 0,
        isAllGraded: false,
        hasNoSubmissions: true,
      };
    }

    const gradedRes = await api.get<ApiResponse<{ totalElements?: number }>>(
      `/assignments/${assignmentId}/submissions`,
      { params: { page: 0, size: 1, status: 'GRADED' } }
    );
    const graded =
      gradedRes.data?.data?.totalElements ??
      (gradedRes.data as unknown as { totalElements?: number })?.totalElements ??
      0;
    const pending = Math.max(0, total - graded);
    const rate = Math.round((graded / total) * 100);

    return {
      totalSubmissions: total,
      gradedSubmissions: graded,
      pendingGrading: pending,
      pendingSubmissions: pending,
      completionRate: rate,
      isAllGraded: graded === total,
      hasNoSubmissions: false,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Fetch all assignments of a class for client-side filtering, counting, and pagination:
 * Endpoint: GET /api/v1/classes/{classId}/assignments
 */
export async function getAllClassAssignments(
  classId: string,
  options: { search?: string } = {}
): Promise<AssignmentItem[]> {
  const search = options.search?.trim();

  try {
    const { data } = await api.get<ApiResponse<unknown>>(`/classes/${classId}/assignments`, {
      params: {
        search: search || undefined,
        page: 0,
        size: 100, // Fetch all assignments in class for accurate counting & filter
      },
    });

    if (data?.data) {
      let apiItems: AssignmentItem[] = [];
      const parsed = assignmentListEnvelopeSchema.safeParse(data.data);
      if (parsed.success) {
        apiItems = parsed.data.items.map((it) => ({
          ...it,
          classId: it.classId || classId,
        }));
      } else {
        // Lenient fallback if envelope schema didn't match perfectly
        const rawObj = data.data as { items?: unknown[]; content?: unknown[] };
        const rawList = Array.isArray(data.data)
          ? data.data
          : rawObj?.items || rawObj?.content || [];
        if (Array.isArray(rawList)) {
          const parsedList: AssignmentItem[] = [];
          for (const raw of rawList) {
            const itemParsed = assignmentItemSchema.safeParse(raw);
            if (itemParsed.success) {
              parsedList.push({
                ...itemParsed.data,
                classId: itemParsed.data.classId || classId,
              });
            }
          }
          apiItems = parsedList;
        }
      }

      const deletedIds = getDeletedAssignmentIds();
      const createdItems = getCreatedAssignments(classId).filter(
        (a) => !deletedIds.has(a.id)
      );
      const filteredItems = [
        ...createdItems,
        ...apiItems.filter((a) => !deletedIds.has(a.id) && !createdItems.some((c) => c.id === a.id)),
      ];
      return filteredItems;
    }
  } catch (err: unknown) {
    if (!isMockClass(classId)) {
      // Re-throw any real API error (403 forbidden, 404 not found, 500 server error, network failure)
      throw err;
    }
  }

  // Fallback to Resilient Mock Data ONLY for mock/demo classes (csdl-k22-01, cs-202)
  if (!isMockClass(classId)) {
    const deletedIds = getDeletedAssignmentIds();
    const createdItems = getCreatedAssignments(classId).filter((a) => !deletedIds.has(a.id));
    return createdItems;
  }

  const deletedIds = getDeletedAssignmentIds();
  const createdItems = getCreatedAssignments(classId).filter((a) => !deletedIds.has(a.id));
  let items = [
    ...createdItems,
    ...MOCK_ASSIGNMENTS.filter(
      (a) => !deletedIds.has(a.id) && !createdItems.some((c) => c.id === a.id)
    ),
  ];

  // If specific classId like 'csdl-k22-01', prioritize database assignments
  if (classId === 'csdl-k22-01') {
    items = items.filter(
      (a) =>
        a.classId === 'csdl-k22-01' ||
        a.id.startsWith('assign-db') ||
        a.id.startsWith('assign-new') ||
        a.id.includes('e211')
    );
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.typeLabel?.toLowerCase().includes(q)
    );
  }

  return items;
}

/**
 * Fetch grade weights and progress from Spring Boot:
 * Endpoint: GET /api/v1/classes/{classId}/grade-reports/me (GradeReportController)
 */
export async function getGradeProgress(classId: string): Promise<GradeProgress> {
  try {
    const { data } = await api.get<ApiResponse<BackendGradeReportDTO>>(
      `/classes/${classId}/grade-reports/me`
    );
    if (data?.data) {
      const rep = data.data;
      const categories = [...MOCK_GRADE_PROGRESS.categories];

      if (typeof rep.midtermScore === 'number') {
        const midCat = categories.find((c) => c.id === 'midterm');
        if (midCat) {
          midCat.achievedScore = rep.midtermScore;
          midCat.statusLabel = `20% (Đạt: ${rep.midtermScore}%)`;
          midCat.progressPercent = Math.min(100, Math.round((rep.midtermScore / midCat.weight) * 100));
        }
      }

      if (typeof rep.finalScore === 'number') {
        const finalCat = categories.find((c) => c.id === 'final');
        if (finalCat) {
          finalCat.achievedScore = rep.finalScore;
          finalCat.statusLabel = `30% (Đạt: ${rep.finalScore}%)`;
          finalCat.progressPercent = Math.min(100, Math.round((rep.finalScore / finalCat.weight) * 100));
        }
      }

      const total = categories.reduce((acc, curr) => acc + (curr.achievedScore || 0), 0);

      return gradeProgressSchema.parse({
        categories,
        currentAccumulated: Number(total.toFixed(1)) || 46.5,
        maxAccumulated: 50.0,
      });
    }
  } catch {
    // Fallback
  }
  return gradeProgressSchema.parse(MOCK_GRADE_PROGRESS);
}

/**
 * Fetch Socratic AI weakness recommendation from Spring Boot:
 * Endpoint: GET /api/v1/student/chat/sessions or recommendations
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
 * Fetch student personal performance stats from Spring Boot:
 * Endpoint: GET /api/v1/classes/{classId}/performance
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
 * Fetch class hub header info from the same source as class list and detail views:
 * Endpoint: GET /api/v1/classes/{id} (ClassController) with graceful fallback to class registry
 */
export async function getClassHubInfo(classId: string): Promise<ClassHubInfo> {
  // 1. First attempt to read from the unified class service (matches /classes and /classes/[id])
  try {
    const classItem = await getClassById(classId);
    if (classItem) {
      const roomStr = classItem.schedule?.room
        ? classItem.schedule.room.startsWith('Phòng')
          ? classItem.schedule.room
          : `Phòng: ${classItem.schedule.room}`
        : 'Phòng: A2-301';

      return classHubInfoSchema.parse({
courseCode: classItem.name || classItem.enrollmentKey || (classId === 'csdl-k22-01' ? 'CSDL-K22-01' : 'CS-202'),
        semester: classItem.semester || classItem.academicYear || 'Học kỳ 1 • 2024-2025',
        room: roomStr,
        title: classItem.title || classItem.name || (classId === 'csdl-k22-01' ? 'Cơ sở dữ liệu — Nhóm 01' : 'Công nghệ thông tin K22 — Nhóm 01'),
        instructorName: classItem.instructor?.fullName || 'TS. Lê Hoàng Nam',
        department: classItem.description || (classId === 'csdl-k22-01' ? 'Học phần: Cơ sở dữ liệu (CS-202) — DATABASE • SQL / NOSQL' : 'Bộ môn: Kỹ thuật Mạng & Truyền thông'),
        studentsCount: classItem.enrolledCount || 42,
        assignmentsCount: 6,
        completionRate: 85.0,

      });
    }
  } catch {
    // Backend endpoint or class registry not accessible
  }

  // 2. Specific fallback for csdl-k22-01 class
  if (classId === 'csdl-k22-01') {
    return classHubInfoSchema.parse({
      courseCode: 'CSDL-K22-01',
      semester: 'Học kỳ 1 • 2024-2025',
      room: 'Phòng: A2-301',
      title: 'Cơ sở dữ liệu — Nhóm 01',
      instructorName: 'TS. Lê Hoàng Nam (Chủ nhiệm môn) • 2 giảng viên',
      department: 'Học phần: Cơ sở dữ liệu (CS-202) — DATABASE • SQL / NOSQL',
      studentsCount: 42,
      assignmentsCount: 6,
      completionRate: 85.0,
    });
  }

  return classHubInfoSchema.parse(MOCK_CLASS_HUB_INFO);
}

/**
 * Fetch single submission details (Teacher view / Grading view)
 * Endpoint: GET /api/v1/submissions/{submissionId}
 */
const STRICT_GRADE_SCORE_REGEX = /^\d+(?:[.,]\d+)?$/;

export function getUtf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function isSubmissionGraded(
  submission?: { status?: string | null; score?: number | null } | null
): boolean {
  if (!submission) return false;
  if (submission.status === 'GRADED') return true;
  return typeof submission.score === 'number' && !Number.isNaN(submission.score);
}

export type GradeScoreValidationResult =
  | { valid: true; numericValue: number }
  | {
      valid: false;
      errorCode: 'required' | 'invalid' | 'negative' | 'range' | 'decimals';
    };

/**
 * Validate a teacher score input strictly without rounding:
 * - Required (empty string is never converted to 0)
 * - Finite non-negative number (0 is valid)
 * - <= Math.min(maxAllowedScore, 100)
 * - At most 2 significant decimal places (e.g. 8.50 is valid, 8.505 is rejected)
 */
export function validateGradeScore(
  rawScore: string,
  maxAllowedScore: number
): GradeScoreValidationResult {
  const trimmed = rawScore.trim();
  if (trimmed === '') {
    return { valid: false, errorCode: 'required' };
  }
  if (trimmed.startsWith('-')) {
    const negCheck = Number(trimmed.replace(',', '.'));
    if (!Number.isNaN(negCheck) && Number.isFinite(negCheck)) {
      return { valid: false, errorCode: 'negative' };
    }
    return { valid: false, errorCode: 'invalid' };
  }
  if (!STRICT_GRADE_SCORE_REGEX.test(trimmed)) {
    return { valid: false, errorCode: 'invalid' };
  }
  const normalized = trimmed.replace(',', '.');
  const parts = normalized.split('.');
  if (parts.length > 1) {
    const significantDecimals = parts[1].replace(/0+$/, '');
    if (significantDecimals.length > 2) {
      return { valid: false, errorCode: 'decimals' };
    }
  }
  const num = Number(normalized);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { valid: false, errorCode: 'invalid' };
  }
  const effectiveMax = Math.min(maxAllowedScore, 100);
  if (num < 0 || num > effectiveMax) {
    return { valid: false, errorCode: 'range' };
  }
  return { valid: true, numericValue: num };
}

export function validateFeedbackUtf8Bytes(feedback: string): {
  valid: boolean;
  bytes: number;
  maxBytes: number;
} {
  const bytes = getUtf8ByteLength(feedback);
  return {
    valid: bytes <= MAX_FEEDBACK_UTF8_BYTES,
    bytes,
    maxBytes: MAX_FEEDBACK_UTF8_BYTES,
  };
}

function createCodedError(message: string, code: string, httpStatus?: number): Error {
  const err = new Error(message) as Error & { code?: string; httpStatus?: number };
  err.code = code;
  if (httpStatus !== undefined) {
    err.httpStatus = httpStatus;
  }
  return err;
}

export async function getSubmissionById(
  submissionId: string,
  assignmentId?: string,
  classId?: string
): Promise<SubmissionDetail> {
  const isDemo = assignmentId ? isDemoAssignment(assignmentId, classId) : false;

  // 1. Real API (Non-Demo): strictly fetch GET /api/v1/submissions/{submissionId}
  // Never fall back to demo data or localStorage on real UUIDs.
  if (!isDemo) {
    const { data } = await api.get<ApiResponse<unknown>>(`/submissions/${submissionId}`);
    if (!data || data.data === undefined || data.data === null) {
      throw createCodedError('Máy chủ không trả về dữ liệu bài nộp hợp lệ', 'SCHEMA_ERROR');
    }
    const parsedResult = submissionDetailSchema.safeParse(data.data);
    if (!parsedResult.success) {
      throw createCodedError('Dữ liệu bài nộp từ máy chủ không đúng định dạng', 'SCHEMA_ERROR');
    }
    const parsed = parsedResult.data;
    if (assignmentId && parsed.assignmentId && parsed.assignmentId !== assignmentId) {
      throw createCodedError(
        'Bản nộp không thuộc bài tập đang mở',
        'ASSIGNMENT_MISMATCH',
        404
      );
    }
    return parsed;
  }

  // 2. Demo mode: Kiểm tra bản nộp thuộc đúng assignmentId và lớp trên URL
  const resolvedAssignmentId = assignmentId;
  if (!resolvedAssignmentId) {
    throw new Error('Vui lòng cung cấp mã bài tập');
  }

  // Lấy thông tin bài tập tương ứng để xác thực và lấy metadata
  const assignment = await getAssignmentById(resolvedAssignmentId, classId);
  if (!assignment) {
    throw new Error('Không tìm thấy thông tin bài tập');
  }

  const assignmentTitle = assignment.title || 'Bài tập';
  const maxScore = assignment.maxScore ?? 10;

  let foundItem: TeacherSubmissionItem | undefined;

  // 2a. Tra cứu trong tập bản nộp demo của đúng assignmentId này
  const activeList = getActiveDemoSubmissions(resolvedAssignmentId);
  foundItem = activeList.find(
    (it) =>
      it.id === submissionId ||
      it.studentId === submissionId ||
      (submissionId.startsWith('sub-') && it.id.startsWith('sub-'))
  );

  // 2b. Nếu không tìm thấy bản nộp thuộc đúng assignmentId này
  if (!foundItem) {
    throw new Error('Bản nộp không tồn tại hoặc không thuộc bài tập này');
  }

  // Profile lookup để hoàn thiện thông tin tên và studentCode
  const studentId = foundItem.studentId || submissionId;
  const profile = lookupStudentProfile(studentId);
  const studentName = foundItem.studentName || profile?.name || 'Học viên ILMS';

  let studentCode = sanitizeStudentCode(foundItem.studentCode);
  if (!studentCode && profile?.studentCode) {
    studentCode = sanitizeStudentCode(profile.studentCode);
  }

  // Nạp kết quả chấm điểm bền vững đã lưu (áp dụng cho cả bản nộp mẫu lẫn bản nộp mới)
  const storedGrading =
    getStoredGrading(resolvedAssignmentId, foundItem.id) ||
    getStoredGrading(resolvedAssignmentId, submissionId);

  if (storedGrading) {
    foundItem.score = storedGrading.score;
    foundItem.feedback = storedGrading.feedback;
    foundItem.status = storedGrading.status;
  }

  return submissionDetailSchema.parse({
    id: foundItem.id,
    assignmentId: resolvedAssignmentId,
    assignmentTitle,
    assignmentDescription: assignment.description || null,
    studentId,
    studentName,
    studentCode: studentCode || undefined,
    submittedAt: foundItem.submittedAt,
    status: foundItem.status || 'SUBMITTED',
    isLate: Boolean(foundItem.isLate),
    score: typeof foundItem.score === 'number' ? foundItem.score : null,
    maxScore: foundItem.maxScore || maxScore,
    feedback: foundItem.feedback ?? null,
    content: foundItem.content || '',
    attachmentUrls: foundItem.attachmentUrls || [],
    gradedAt:
      storedGrading?.gradedAt ||
      (foundItem.status === 'GRADED' ? new Date().toISOString() : null),
    gradedByTeacherName:
      storedGrading?.gradedByTeacherName ||
      (foundItem.status === 'GRADED' ? 'TS. Lê Hoàng Nam' : null),
    submissionAttempt: 1,
    attempt: 1,
    maxAttempts: 1,
  });
}

/**
 * Grade or update grade of a single submission:
 * Endpoint: PATCH /api/v1/submissions/{submissionId}/grade
 * Body:
 * - { score } when feedback is unchanged/omitted (undefined)
 * - { score, feedback: null } when actively clearing existing feedback
 * - { score, feedback: "<text>" } when setting/updating feedback (preserving newlines)
 * Single write path; never sends extraneous fields (studentId, graderId, gradedAt,
 * content, submissionAttempt, correctAnswersCount, scaledScore).
 */
export async function gradeSubmission(
  submissionId: string,
  payload: GradeSubmissionPayload,
  assignmentId?: string,
  classId?: string
): Promise<SubmissionDetail> {
  const validatedPayload = gradeSubmissionPayloadSchema.parse(payload);
  const isDemo = assignmentId ? isDemoAssignment(assignmentId, classId) : false;

  // Build strict contract payload: preserve explicit null, omit undefined
  const requestBody: { score: number; feedback?: string | null } = {
    score: validatedPayload.score,
  };
  if (validatedPayload.feedback === null) {
    requestBody.feedback = null;
  } else if (
    typeof validatedPayload.feedback === 'string' &&
    validatedPayload.feedback.trim().length > 0
  ) {
    requestBody.feedback = validatedPayload.feedback;
  }

  // 1. Real API call (Non-Demo): never fall back to demo/localStorage on error
  if (!isDemo) {
    const { data } = await api.patch<ApiResponse<unknown>>(
      `/submissions/${submissionId}/grade`,
      requestBody
    );
    if (!data || data.data === undefined || data.data === null) {
      throw createCodedError('Máy chủ không trả về kết quả chấm điểm hợp lệ', 'SCHEMA_ERROR');
    }
    const parsedResult = submissionDetailSchema.safeParse(data.data);
    if (!parsedResult.success) {
      throw createCodedError('Phản hồi chấm điểm từ máy chủ không đúng định dạng', 'SCHEMA_ERROR');
    }
    return parsedResult.data;
  }

  // 2. Demo mode: update MOCK_TEACHER_SUBMISSIONS and localStorage
  const resolvedAssignmentId = assignmentId;
  if (!resolvedAssignmentId) {
    throw new Error('Vui lòng cung cấp mã bài tập');
  }

  const existingStored = getStoredGrading(resolvedAssignmentId, submissionId);
  const resolveDemoFeedback = (currentFeedback?: string | null): string | null => {
    if (validatedPayload.feedback === null) return null;
    if (typeof validatedPayload.feedback === 'string') {
      return validatedPayload.feedback.trim().length > 0 ? validatedPayload.feedback : null;
    }
    return currentFeedback ?? existingStored?.feedback ?? null;
  };

  // Xác định studentId và cập nhật in-memory MOCK_TEACHER_SUBMISSIONS
  let targetStudentId: string | undefined;
  let resolvedFeedback: string | null = resolveDemoFeedback(null);
  const mockList = MOCK_TEACHER_SUBMISSIONS[resolvedAssignmentId];
  if (mockList) {
    const found = mockList.find((it) => it.id === submissionId || it.studentId === submissionId);
    if (found) {
      resolvedFeedback = resolveDemoFeedback(found.feedback);
      found.score = validatedPayload.score;
      found.feedback = resolvedFeedback;
      found.status = 'GRADED';
      targetStudentId = found.studentId ?? undefined;
    }
  }

  // Lưu bền vững vào kho lưu trữ chấm điểm theo submissionId & assignmentId
  const gradingRecord: StoredGrading = {
    submissionId,
    assignmentId: resolvedAssignmentId,
    studentId: targetStudentId,
    score: validatedPayload.score,
    feedback: resolvedFeedback,
    status: 'GRADED',
    gradedAt: new Date().toISOString(),
    gradedByTeacherName: 'TS. Lê Hoàng Nam',
  };
  saveStoredGrading(gradingRecord);

  // Update in localStorage for this specific assignment
  let studentIdForStorage = targetStudentId || getCurrentStudentId();
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('ilms_submission_') || key.startsWith('ilms_student_submission_')) &&
          (key.endsWith(`_${resolvedAssignmentId}`) || key.includes(submissionId))
        ) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as MySubmission;
              if (
                parsed &&
                (parsed.id === submissionId ||
                  parsed.studentId === submissionId ||
                  (targetStudentId && parsed.studentId === targetStudentId) ||
                  submissionId.startsWith('sub-'))
              ) {
                parsed.score = validatedPayload.score;
                parsed.feedback = resolvedFeedback;
                parsed.status = 'GRADED';
                parsed.gradedAt = gradingRecord.gradedAt;
                parsed.gradedByTeacherName = gradingRecord.gradedByTeacherName;
                if (parsed.studentId) studentIdForStorage = parsed.studentId;
                localStorage.setItem(key, JSON.stringify(parsed));
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // Đồng thời lưu vào unified storage key qua saveLocalSubmission
  const existingSub = await getMySubmission(resolvedAssignmentId, studentIdForStorage, classId);
  const updatedSub: MySubmission = {
    ...(existingSub || {}),
    id: submissionId,
    assignmentId: resolvedAssignmentId,
    studentId: studentIdForStorage,
    status: 'GRADED',
    score: validatedPayload.score,
    feedback: resolvedFeedback,
    gradedAt: gradingRecord.gradedAt,
    gradedByTeacherName: gradingRecord.gradedByTeacherName,
  };
  saveLocalSubmission(resolvedAssignmentId, updatedSub, studentIdForStorage);

  // Return the updated SubmissionDetail
  return getSubmissionById(submissionId, resolvedAssignmentId, classId);
}

export interface ModifyGradingPermissionContext {
  classId?: string;
  isDemoTeacherView?: boolean;
  canManageClassSubmissions: boolean;
  isAuthLoading: boolean;
  isGradingLoading: boolean;
  isGradingError: boolean;
  user?: {
    id?: string | null;
    roleName?: string | null;
  } | null;
  grading?: SubmissionGrading | null;
  submissionGraderId?: string | null;
}

export interface ModifyGradingPermissionResult {
  canEdit: boolean;
  canDelete: boolean;
  reason: 'UNVERIFIED' | 'NO_CLASS_PERMISSION' | 'NOT_GRADER' | null;
}

/**
 * Evaluate whether the authenticated user can edit or delete an existing grading record.
 * Strict contract rules:
 * - System Admin (ADMIN / ROLE_ADMIN): allowed to edit; delete enabled once gradingId is verified.
 * - Non-Admin Teacher: MUST still have real class management permission AND match current graderId
 *   by real user ID (never display name, email, role switcher, or localStorage).
 *   Class owners who are NOT the current grader are read-only viewers.
 * - While auth or grading record is loading/errored or gradingId is missing, write actions stay locked.
 */
export function evaluateCanModifyGrading(
  ctx: ModifyGradingPermissionContext
): ModifyGradingPermissionResult {
  if (ctx.classId && isMockClass(ctx.classId)) {
    const allowed = Boolean(ctx.isDemoTeacherView && ctx.grading?.id);
    return {
      canEdit: allowed,
      canDelete: allowed,
      reason: allowed ? null : 'UNVERIFIED',
    };
  }

  if (ctx.isAuthLoading || ctx.isGradingLoading || ctx.isGradingError) {
    return { canEdit: false, canDelete: false, reason: 'UNVERIFIED' };
  }

  const userId = ctx.user?.id?.trim();
  if (!userId) {
    return { canEdit: false, canDelete: false, reason: 'NO_CLASS_PERMISSION' };
  }

  const normalizedRole = (ctx.user?.roleName || '').trim().toUpperCase();
  const isAdmin = normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN';
  const hasVerifiedGradingId = Boolean(ctx.grading?.id && ctx.grading.id.trim().length > 0);

  if (isAdmin) {
    if (!hasVerifiedGradingId) {
      return { canEdit: false, canDelete: false, reason: 'UNVERIFIED' };
    }
    return { canEdit: true, canDelete: true, reason: null };
  }

  if (!ctx.canManageClassSubmissions) {
    return { canEdit: false, canDelete: false, reason: 'NO_CLASS_PERMISSION' };
  }

  if (!hasVerifiedGradingId) {
    return { canEdit: false, canDelete: false, reason: 'UNVERIFIED' };
  }

  const graderId =
    ctx.grading?.graderId?.trim() ||
    ctx.grading?.gradedByTeacherId?.trim() ||
    ctx.submissionGraderId?.trim() ||
    '';

  if (!graderId) {
    return { canEdit: false, canDelete: false, reason: 'UNVERIFIED' };
  }

  if (String(graderId) === String(userId)) {
    return { canEdit: true, canDelete: true, reason: null };
  }

  return { canEdit: false, canDelete: false, reason: 'NOT_GRADER' };
}

/**
 * Fetch grading record by submissionId:
 * Endpoint: GET /api/v1/submissions/{submissionId}/grading
 * - Returns parsed SubmissionGrading (with authoritative gradingId = data.id) on 200.
 * - Returns null ONLY when server explicitly responds 404 (no grading exists).
 * - Propagates 401/403/500/network/schema errors cleanly (never treats errors as ungraded).
 */
export async function getSubmissionGrading(
  submissionId: string,
  assignmentId?: string,
  classId?: string
): Promise<SubmissionGrading | null> {
  const isDemo = assignmentId ? isDemoAssignment(assignmentId, classId) : false;

  if (!isDemo) {
    try {
      const { data } = await api.get<ApiResponse<unknown>>(
        `/submissions/${submissionId}/grading`
      );
      if (!data || data.data === undefined || data.data === null) {
        throw createCodedError('Máy chủ không trả về dữ liệu phiếu chấm hợp lệ', 'SCHEMA_ERROR');
      }
      const parsed = submissionGradingSchema.safeParse(data.data);
      if (!parsed.success) {
        throw createCodedError('Dữ liệu phiếu chấm từ máy chủ không đúng định dạng', 'SCHEMA_ERROR');
      }
      return parsed.data;
    } catch (err: unknown) {
      const e = err as { httpStatus?: number; status?: number; response?: { status?: number } };
      const status = e?.httpStatus || e?.response?.status || e?.status || 0;
      if (status === 404) {
        return null;
      }
      throw err;
    }
  }

  // Demo mode
  if (!assignmentId) return null;
  const sub = await getSubmissionById(submissionId, assignmentId, classId);
  if (!isSubmissionGraded(sub)) {
    return null;
  }
  return submissionGradingSchema.parse({
    id: `grading-demo-${sub.id}`,
    submissionId: sub.id,
    graderId: sub.gradedByTeacherId || 'demo-teacher-id',
    graderName: sub.gradedByTeacherName || 'TS. Lê Hoàng Nam',
    score: sub.score ?? null,
    feedback: sub.feedback ?? null,
    gradedAt: sub.gradedAt ?? null,
    correctAnswersCount: null,
    scaledScore: null,
  });
}

/**
 * Delete a grading record by gradingId:
 * Endpoint: DELETE /api/v1/gradings/{gradingId}
 * - Strictly requires gradingId from GET /submissions/{submissionId}/grading -> data.id.
 * - Never calls DELETE /submissions/{submissionId} or PATCH score=0.
 * - Handles 204 No Content without parsing an empty response body.
 */
export async function deleteGrading(
  gradingId: string,
  submissionId: string,
  assignmentId?: string,
  classId?: string
): Promise<void> {
  const cleanGradingId = gradingId.trim();
  if (!cleanGradingId) {
    throw createCodedError('Thiếu mã phiếu chấm điểm hợp lệ', 'INVALID_GRADING_ID', 400);
  }

  const isDemo = assignmentId ? isDemoAssignment(assignmentId, classId) : false;

  if (!isDemo) {
    // Expect 204 No Content (or 200); do NOT parse body/envelope
    await api.delete(`/gradings/${cleanGradingId}`);
    return;
  }

  // Demo mode: remove StoredGrading and reset submission status without deleting student work
  const resolvedAssignmentId = assignmentId;
  if (!resolvedAssignmentId) return;

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`ilms_graded_sub_${resolvedAssignmentId}_${submissionId}`);
      const mapKey = `ilms_graded_submissions_map_${resolvedAssignmentId}`;
      const rawMap = localStorage.getItem(mapKey);
      if (rawMap) {
        const map = JSON.parse(rawMap) as Record<string, StoredGrading>;
        delete map[submissionId];
        localStorage.setItem(mapKey, JSON.stringify(map));
      }
    } catch {
      // ignore
    }
  }

  let targetStudentId: string | undefined;
  let wasLate = false;
  const mockList = MOCK_TEACHER_SUBMISSIONS[resolvedAssignmentId];
  if (mockList) {
    const found = mockList.find((it) => it.id === submissionId || it.studentId === submissionId);
    if (found) {
      wasLate = Boolean(found.isLate);
      found.score = null;
      found.feedback = null;
      found.status = wasLate ? 'LATE' : 'SUBMITTED';
      targetStudentId = found.studentId ?? undefined;
    }
  }

  const studentIdForStorage = targetStudentId || getCurrentStudentId();
  const existingSub = await getMySubmission(resolvedAssignmentId, studentIdForStorage, classId);
  if (existingSub) {
    const revertedStatus = existingSub.isLate || wasLate ? 'LATE' : 'SUBMITTED';
    saveLocalSubmission(
      resolvedAssignmentId,
      {
        ...existingSub,
        status: revertedStatus,
        score: null,
        feedback: null,
        gradedAt: null,
        gradedByTeacherName: null,
      },
      studentIdForStorage
    );
  }
}

