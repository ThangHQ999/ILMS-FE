import { z } from 'zod';

export const examTypeSchema = z.enum([
  'QUIZ',
  'MIDTERM',
  'FINAL',
  'CONTEST',
  'COMPETITION',
]);
export type ExamType = z.infer<typeof examTypeSchema>;

export const examScheduleStatusSchema = z.enum(['UPCOMING', 'OPEN', 'OPENING', 'CLOSED']);
export type ExamScheduleStatus = z.infer<typeof examScheduleStatusSchema>;

export function normalizeExamType(raw?: string | null): string {
  const upper = String(raw || '').trim().toUpperCase();
  if (upper === 'COMPETITION') return 'CONTEST';
  return upper;
}

export function normalizeExamStatus(raw?: string | null): 'UPCOMING' | 'OPEN' | 'CLOSED' | string {
  const upper = String(raw || '').trim().toUpperCase();
  if (upper === 'OPENING') return 'OPEN';
  if (upper === 'UPCOMING' || upper === 'OPEN' || upper === 'CLOSED') {
    return upper;
  }
  return upper || 'UPCOMING';
}

export const studentExamAttemptSchema = z.object({
  id: z.string(),
  status: z.enum(['IN_PROGRESS', 'SUBMITTED', 'GRADED']).or(z.string()),
  score: z.number().optional().nullable(),
  startedAt: z.string().optional().nullable(),
  submittedAt: z.string().optional().nullable(),
});
export type StudentExamAttempt = z.infer<typeof studentExamAttemptSchema>;

export const examItemSchema = z.object({
  id: z.union([z.string(), z.number().transform(String)]),
  courseId: z.string().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable(),
  examType: examTypeSchema
    .or(z.string())
    .transform((v) => normalizeExamType(v)),
  durationMinutes: z.coerce.number().optional().nullable(),
  maxScore: z.coerce.number().optional().nullable(),
  totalScore: z.coerce.number().optional().nullable(),
  startTime: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? ''),
  endTime: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? ''),
  status: examScheduleStatusSchema
    .or(z.string())
    .optional()
    .nullable()
    .transform((v) => normalizeExamStatus(v)),
  isPublished: z.boolean().optional().nullable(),
  questionCount: z.coerce.number().optional().nullable(),
  courseName: z.string().optional().nullable(),
  courseCode: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  studentAttempt: studentExamAttemptSchema.optional().nullable(),
});

export type ExamItem = z.infer<typeof examItemSchema>;

export const examListEnvelopeSchema = z.object({
  items: z.array(examItemSchema),
  pageNumber: z.coerce.number().default(0),
  pageSize: z.coerce.number().default(10),
  totalElements: z.coerce.number().default(0),
  totalPages: z.coerce.number().default(1),
  last: z.boolean().default(true),
});

export type ExamListResponse = z.infer<typeof examListEnvelopeSchema>;

/**
 * Validation schema for creating a new Exam (Giảng viên - Tạo bài thi)
 */
export const createExamFormSchema = z
  .object({
    courseId: z
      .string()
      .trim()
      .min(1, 'Vui lòng chọn môn học'),
    examType: z.enum(['QUIZ', 'MIDTERM', 'FINAL', 'CONTEST'] as const, {
      message: 'Vui lòng chọn loại bài thi',
    }),
    title: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên bài thi')
      .max(255, 'Tên bài thi tối đa 255 ký tự'),
    description: z.string().optional().default(''),
    durationMinutes: z.coerce
      .number()
      .int('Thời lượng phải là số nguyên')
      .positive('Thời lượng phải là số nguyên dương'),
    totalScore: z.coerce
      .number()
      .positive('Tổng điểm phải lớn hơn 0')
      .max(100, 'Tổng điểm tối đa là 100')
      .refine(
        (val) => {
          const s = val.toString();
          const decimalPart = s.split('.')[1];
          return !decimalPart || decimalPart.length <= 2;
        },
        { message: 'Tổng điểm có tối đa 2 chữ số thập phân' }
      ),
    startTime: z
      .string()
      .trim()
      .min(1, 'Vui lòng chọn ngày giờ mở'),
    endTime: z
      .string()
      .trim()
      .min(1, 'Vui lòng chọn ngày giờ đóng'),
  })
  .superRefine((data, ctx) => {
    if (!data.startTime || !data.endTime) return;

    const start = new Date(data.startTime).getTime();
    const end = new Date(data.endTime).getTime();

    if (isNaN(start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày giờ mở không hợp lệ',
        path: ['startTime'],
      });
      return;
    }

    if (isNaN(end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày giờ đóng không hợp lệ',
        path: ['endTime'],
      });
      return;
    }

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Giờ đóng phải sau giờ mở',
        path: ['endTime'],
      });
      return;
    }

    const diffMinutes = (end - start) / (60 * 1000);
    if (diffMinutes < data.durationMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Khoảng thời gian mở phải đủ thời lượng làm bài',
        path: ['endTime'],
      });
    }
  });

export type CreateExamInput = z.infer<typeof createExamFormSchema>;

/**
 * Exam Question Item Schema (GET /api/v1/exams/{examId}/questions)
 */
export const examQuestionItemSchema = z.object({
  id: z.string().or(z.number()).transform(String),
  examId: z.string().optional().nullable(),
  questionId: z.string().or(z.number()).transform(String),
  content: z.string().optional().default(''),
  questionContent: z.string().optional(),
  text: z.string().optional().default(''),
  questionType: z.string().optional().default('SINGLE_CHOICE'),
  type: z.string().optional(),
  difficultyLevel: z.string().optional().default('MEDIUM'),
  level: z.string().optional(),
  levelClass: z.string().optional(),
  score: z.coerce.number().default(0.5),
  orderIndex: z.coerce.number().default(1),
  explanation: z.string().optional().nullable(),
  answers: z.array(z.any()).optional(),
});

export type ExamQuestionItem = z.infer<typeof examQuestionItemSchema>;

/**
 * Add Question to Exam Schema (POST /api/v1/exams/{examId}/questions)
 */
export const addExamQuestionSchema = z.object({
  questionId: z.string().min(1, 'Vui lòng chọn câu hỏi'),
  score: z.coerce
    .number()
    .positive('Điểm phải lớn hơn 0')
    .max(999.99, 'Điểm tối đa là 999.99')
    .refine(
      (val) => {
        const parts = val.toString().split('.');
        return !parts[1] || parts[1].length <= 2;
      },
      { message: 'Điểm tối đa 2 chữ số thập phân' }
    ),
  orderIndex: z.coerce.number().int().positive().optional(),
});

export type AddExamQuestionInput = z.infer<typeof addExamQuestionSchema>;

/**
 * Update Question in Exam Schema (PATCH /api/v1/exams/{examId}/questions/{id})
 */
export const updateExamQuestionSchema = z.object({
  score: z.coerce
    .number()
    .positive('Điểm phải lớn hơn 0')
    .max(999.99, 'Điểm tối đa là 999.99')
    .refine(
      (val) => {
        const parts = val.toString().split('.');
        return !parts[1] || parts[1].length <= 2;
      },
      { message: 'Điểm tối đa 2 chữ số thập phân' }
    )
    .optional(),
  orderIndex: z.coerce.number().int().positive('Thứ tự phải là số nguyên dương').optional(),
});

export type UpdateExamQuestionInput = z.infer<typeof updateExamQuestionSchema>;

/**
 * Question Bank Item Schema (GET /api/v1/questions)
 */
export const bankQuestionItemSchema = z.object({
  id: z.string().or(z.number()).transform(String),
  content: z.string().optional().default(''),
  text: z.string().optional().default(''),
  questionType: z.string().optional().default('SINGLE_CHOICE'),
  type: z.string().optional(),
  difficultyLevel: z.string().optional().default('MEDIUM'),
  level: z.string().optional(),
  levelClass: z.string().optional(),
  courseId: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  answers: z.array(z.any()).optional(),
});

export type BankQuestionItem = z.infer<typeof bankQuestionItemSchema>;

