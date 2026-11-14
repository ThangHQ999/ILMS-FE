import { z } from 'zod';

// ============================================================================
// 1. ENUMS & CORE DOMAIN TYPES
// ============================================================================

export const QuizStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'LIVE', 'COMPLETED', 'ARCHIVED']);
export type QuizStatus = z.infer<typeof QuizStatusEnum>;

export const ScoringStrategyEnum = z.enum(['HIGHEST_SCORE', 'LATEST_ATTEMPT', 'AVERAGE_SCORE']);
export type ScoringStrategy = z.infer<typeof ScoringStrategyEnum>;

export const BloomLevelEnum = z.enum([
  'REMEMBER', // Nhớ (Bloom 1)
  'UNDERSTAND', // Hiểu (Bloom 2)
  'APPLY', // Vận dụng (Bloom 3)
  'ANALYZE', // Phân tích (Bloom 4)
  'EVALUATE', // Đánh giá (Bloom 5)
  'CREATE', // Sáng tạo (Bloom 6)
]);
export type BloomLevel = z.infer<typeof BloomLevelEnum>;

export const QuestionTypeEnum = z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY']);
export type QuestionType = z.infer<typeof QuestionTypeEnum>;

export const DifficultyLevelEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);
export type DifficultyLevel = z.infer<typeof DifficultyLevelEnum>;

// ============================================================================
// 2. QUESTION & QUESTION BANK SCHEMAS (docs/api-spec.md Section 9.2)
// ============================================================================

/**
 * Single Answer Option in Quiz Response / Question Response
 */
export const answerOptionSchema = z.object({
  id: z.string().optional(),
  content: z.string(),
  isCorrect: z.boolean().optional(),
});

export type AnswerOptionDTO = z.infer<typeof answerOptionSchema>;

/**
 * Question Detail in Quiz / Question Bank
 * docs/api-spec.md Section 9.2 (Enhanced with Bloom, Code, Image & PLO)
 */
export const questionResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  questionType: QuestionTypeEnum,
  difficultyLevel: DifficultyLevelEnum,
  bloomLevel: BloomLevelEnum.optional(),
  explanation: z.string().optional().nullable(),
  codeSnippet: z.string().optional().nullable(),
  codeLanguage: z.string().optional().nullable(),
  diagramData: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  ploId: z.string().optional().nullable(),
  answers: z.array(answerOptionSchema).default([]),
  conceptIds: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type QuestionResponseDTO = z.infer<typeof questionResponseSchema>;

/**
 * Question Creation Payload in Question Bank
 * Endpoint: POST /api/v1/questions
 * docs/api-spec.md Section 9.2 (Enhanced with Bloom, Code, Image & PLO)
 */
export const questionRequestSchema = z.object({
  content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  questionType: QuestionTypeEnum.default('SINGLE_CHOICE'),
  difficultyLevel: DifficultyLevelEnum.default('MEDIUM'),
  bloomLevel: BloomLevelEnum.optional().default('UNDERSTAND'),
  explanation: z.string().optional().default(''),
  codeSnippet: z.string().optional().nullable(),
  codeLanguage: z.string().optional().nullable(),
  diagramData: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  ploId: z.string().optional().nullable(),
  answers: z
    .array(
      z.object({
        content: z.string().min(1, 'Nội dung đáp án không được để trống'),
        isCorrect: z.boolean().default(false),
      })
    )
    .min(2, 'Cần tối thiểu 2 lựa chọn đáp án'),
  conceptIds: z.array(z.string()).default([]),
});

export type QuestionRequestDTO = z.input<typeof questionRequestSchema>;

// ============================================================================
// 3. QUIZ SCHEMAS (docs/api-spec.md Section 10)
// ============================================================================

/**
 * Quiz Creation / Update Request Payload
 * Endpoint: POST /api/v1/quizzes & PUT /api/v1/quizzes/{id}
 * docs/api-spec.md Section 10.1 (Enhanced with status, chapter, PLOs, security)
 */
export const quizRequestSchema = z.object({
  classId: z.string().min(1, 'Mã lớp học không được để trống'),
  title: z.string().min(1, 'Tiêu đề đề thi không được để trống'),
  description: z.string().optional().default(''),
  status: QuizStatusEnum.optional().default('PUBLISHED'),
  chapter: z.string().optional(),
  durationMinutes: z.number().int().positive('Thời gian làm bài phải lớn hơn 0'),
  maxAttempts: z.number().int().min(1, 'Số lần làm bài tối thiểu là 1').default(1),
  passingScore: z.number().optional().default(5.0),
  scoringStrategy: ScoringStrategyEnum.optional().default('HIGHEST_SCORE'),
  shuffleQuestions: z.boolean().default(true),
  shuffleAnswers: z.boolean().default(true),
  fullscreenLock: z.boolean().optional().default(true),
  tabSwitchLimit: z.number().int().min(0).optional().default(3),
  lockAnswersUntilDeadline: z.boolean().optional().default(true),
  proctoringEnabled: z.boolean().optional().default(false),
  ploIds: z.array(z.string()).optional().default([]),
  startTime: z.string().min(1, 'Thời gian bắt đầu không được để trống'),
  endTime: z.string().min(1, 'Thời gian kết thúc không được để trống'),
});

export type QuizRequestDTO = z.input<typeof quizRequestSchema>;

/**
 * Quiz Response DTO from Backend
 * Endpoint: GET /api/v1/quizzes/{id} & GET /api/v1/quizzes
 * docs/api-spec.md Section 10.1
 */
export const quizResponseSchema = z.object({
  id: z.string(),
  classId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: QuizStatusEnum.optional().default('PUBLISHED'),
  chapter: z.string().optional().nullable(),
  durationMinutes: z.number(),
  maxAttempts: z.number(),
  passingScore: z.number().optional().default(5.0),
  scoringStrategy: ScoringStrategyEnum.optional().default('HIGHEST_SCORE'),
  shuffleQuestions: z.boolean(),
  shuffleAnswers: z.boolean(),
  fullscreenLock: z.boolean().optional().default(true),
  tabSwitchLimit: z.number().optional().default(3),
  lockAnswersUntilDeadline: z.boolean().optional().default(true),
  proctoringEnabled: z.boolean().optional().default(false),
  ploIds: z.array(z.string()).optional().default([]),
  startTime: z.string(),
  endTime: z.string(),
  totalQuestions: z.number().optional(),
  totalPoints: z.number().optional(),
  questions: z.array(questionResponseSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type QuizResponseDTO = z.infer<typeof quizResponseSchema>;

/**
 * Quiz Single Question Addition Payload
 * Endpoint: POST /api/v1/quizzes/{id}/questions
 */
export const addQuizQuestionSchema = z.object({
  questionId: z.string().min(1, 'Mã câu hỏi không được để trống'),
  point: z.number().positive().default(1.0),
  orderIndex: z.number().int().min(0).default(0),
});

export type AddQuizQuestionRequestDTO = z.infer<typeof addQuizQuestionSchema>;

/**
 * Batch Add Questions Payload
 * Endpoint: POST /api/v1/quizzes/{id}/questions/batch
 */
export const batchQuizQuestionSchema = z.object({
  questions: z.array(addQuizQuestionSchema).min(1, 'Cần ít nhất một câu hỏi trong danh sách thêm theo lô'),
});

export type BatchQuizQuestionRequestDTO = z.infer<typeof batchQuizQuestionSchema>;

/**
 * AI Exam Blueprint Generation Request Payload
 * Endpoint: POST /api/v1/quizzes/generate-ai
 */
export const quizGenerateAiSchema = z.object({
  classId: z.string().min(1),
  prompt: z.string().min(1, 'Mô tả yêu cầu sinh đề không được để trống'),
  documentSourceUrl: z.string().optional(),
  questionCount: z.number().int().positive().default(20),
  difficultyDistribution: z
    .object({
      remember: z.number().optional().default(30),
      understand: z.number().optional().default(40),
      apply: z.number().optional().default(20),
      analyze: z.number().optional().default(10),
    })
    .optional(),
});

export type QuizGenerateAiRequestDTO = z.input<typeof quizGenerateAiSchema>;

/**
 * Quiz Play Response (Secure version without answers/scores)
 * Endpoint: GET /api/v1/quizzes/{id}/play
 * docs/api-spec.md Section 10.2
 */
export const quizPlayResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  durationMinutes: z.number(),
  fullscreenLock: z.boolean().optional().default(false),
  tabSwitchLimit: z.number().optional().default(3),
  questions: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      questionType: z.string(),
      bloomLevel: BloomLevelEnum.optional(),
      codeSnippet: z.string().optional().nullable(),
      codeLanguage: z.string().optional().nullable(),
      diagramData: z.string().optional().nullable(),
      imageUrl: z.string().optional().nullable(),
      orderIndex: z.number(),
      answers: z.array(
        z.object({
          id: z.string(),
          content: z.string(),
        })
      ),
    })
  ),
});

export type QuizPlayResponseDTO = z.infer<typeof quizPlayResponseSchema>;

/**
 * Quiz Attempt Initiation Response
 * Endpoint: POST /api/v1/quizzes/{id}/attempts
 * docs/api-spec.md Section 10.2
 */
export const quizAttemptResponseSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  userId: z.string().optional(),
  status: z.enum(['IN_PROGRESS', 'SUBMITTED', 'GRADED', 'EXPIRED']),
  startTime: z.string(),
  endTime: z.string().optional().nullable(),
  remainingSeconds: z.number().optional(),
});

export type QuizAttemptResponseDTO = z.infer<typeof quizAttemptResponseSchema>;

/**
 * Quiz Submit Request Payload
 * Endpoint: POST /api/v1/quizzes/{id}/attempts/{attemptId}/submit
 * docs/api-spec.md Section 10.2
 */
export const quizSubmitRequestSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedAnswerIds: z.array(z.string()),
    })
  ),
});

export type QuizSubmitRequestDTO = z.infer<typeof quizSubmitRequestSchema>;

/**
 * Quiz Result Detail Response
 * Endpoint: GET /api/v1/quizzes/{id}/attempts/{attemptId}/result
 * docs/api-spec.md Section 10.2
 */
export const quizAttemptResultSchema = z.object({
  attemptId: z.string(),
  quizId: z.string(),
  score: z.number(),
  maxScore: z.number(),
  passed: z.boolean(),
  correctCount: z.number(),
  totalQuestions: z.number(),
  submittedAt: z.string(),
  feedback: z.string().optional().nullable(),
  questionResults: z
    .array(
      z.object({
        questionId: z.string(),
        isCorrect: z.boolean(),
        point: z.number(),
        explanation: z.string().optional().nullable(),
      })
    )
    .optional(),
});

export type QuizAttemptResultDTO = z.infer<typeof quizAttemptResultSchema>;

// ============================================================================
// 4. PROCTORING & MONITORING SCHEMAS (docs/api-spec.md Section 10.3)
// ============================================================================

export const proctorViolationEventSchema = z.object({
  attemptId: z.string(),
  eventType: z.enum(['TAB_SWITCH', 'FULLSCREEN_EXIT', 'MULTIPLE_FACES', 'NO_FACE', 'COPY_PASTE']),
  detail: z.string().optional(),
  occurredAt: z.string(),
});

export type ProctorViolationEventDTO = z.infer<typeof proctorViolationEventSchema>;

export const proctorSessionSchema = z.object({
  attemptId: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  studentCode: z.string(),
  ipAddress: z.string().optional(),
  status: z.enum(['ONLINE', 'IDLE', 'WARNING', 'DISCONNECTED', 'SUBMITTED']),
  tabSwitchCount: z.number().default(0),
  answeredQuestions: z.number().default(0),
  totalQuestions: z.number().default(20),
  lastActiveAt: z.string(),
});

export type ProctorSessionDTO = z.infer<typeof proctorSessionSchema>;

// ============================================================================
// 5. COMPLAINTS & REGRADING SCHEMAS (docs/api-spec.md Section 10.4)
// ============================================================================

export const quizComplaintSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  attemptId: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  questionId: z.string(),
  questionContent: z.string(),
  reason: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  currentScore: z.number(),
  adjustedScore: z.number().optional().nullable(),
  instructorNote: z.string().optional().nullable(),
  createdAt: z.string(),
  resolvedAt: z.string().optional().nullable(),
});

export type QuizComplaintDTO = z.infer<typeof quizComplaintSchema>;

export const resolveComplaintSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  adjustedScore: z.number().optional(),
  instructorNote: z.string().min(1, 'Lý do phê duyệt/bác bỏ không được để trống'),
});

export type ResolveComplaintRequestDTO = z.infer<typeof resolveComplaintSchema>;

// ============================================================================
// 6. ANALYTICS & BLOOM SCHEMAS (docs/api-spec.md Section 10.5)
// ============================================================================

export const quizAnalyticsSchema = z.object({
  quizId: z.string(),
  totalParticipants: z.number(),
  averageScore: z.number(),
  highestScore: z.number(),
  lowestScore: z.number(),
  passRate: z.number(),
  scoreDistribution: z.record(z.string(), z.number()),
  bloomDistribution: z.record(z.string(), z.number()),
  discriminationIndex: z.number().optional(),
});

export type QuizAnalyticsDTO = z.infer<typeof quizAnalyticsSchema>;

// ============================================================================
// 7. EXAM DTO SCHEMAS (docs/api-spec.md Section 13)
// ============================================================================

export const examRequestSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1, 'Tiêu đề kỳ thi không được để trống'),
  description: z.string().optional().default(''),
  examType: z.enum(['FINAL', 'MIDTERM', 'REGULAR']).default('REGULAR'),
  durationMinutes: z.number().int().positive(),
  startTime: z.string(),
  endTime: z.string(),
});

export type ExamRequestDTO = z.infer<typeof examRequestSchema>;

export const examResponseSchema = z.object({
  id: z.string(),
  courseId: z.string().optional(),
  classId: z.string().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  examType: z.enum(['FINAL', 'MIDTERM', 'REGULAR']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
  durationMinutes: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  isPublished: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ExamResponseDTO = z.infer<typeof examResponseSchema>;

// ============================================================================
// 8. FRONTEND UI MODELS (For Teacher Views)
// ============================================================================

export type ExamCategoryType = 'all' | 'quiz' | 'exam' | 'live' | 'completed' | 'draft';

export interface QuizItem {
  id: string;
  code: string;
  className: string;
  classId: string;
  title: string;
  type: 'quiz' | 'exam' | 'draft';
  status: 'live' | 'completed' | 'draft' | 'pending';
  badgeLabel: string;
  badgeType: 'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'gray';
  durationMinutes: number;
  questionCount: number;
  attemptsInfo: string;
  securityInfo: string;
  // Live stats
  submittedCount?: number;
  totalStudents?: number;
  remainingTime?: string;
  // Completed stats
  avgScore?: number;
  maxScore?: number;
  ploRate?: number;
  discriminationIndex?: number;
  // Complaint stats
  complaintCount?: number;
  complaintNote?: string;
  // Dates
  startTime: string;
  endTime: string;
}

export interface QuizStatsSummary {
  totalCount: number;
  quizCount: number;
  examCount: number;
  publishedCount: number;
  liveCount: number;
  liveSubmittedStudents: number;
  liveTotalStudents: number;
  avgScore: number;
  avgScoreDiff: number;
  ploPassRate: number;
  complaintsCount: number;
  complaintsUrgentCount: number;
}
