import { z } from 'zod';

/** An explicit backend-confirmed step; a numeric counter alone is not progress. */
export const stepProgressSchema = z.object({
  step_id: z.string().min(1),
  exercise_id: z.string().min(1),
  number: z.number().int().positive(),
  total: z.number().int().positive(),
  instruction: z.string().default(''),
  completed: z.boolean(),
}).refine((step) => step.number <= step.total);


/** Schema cho tin nhắn trong phiên chat */
export const socraticChatMessageItemSchema = z.object({
  step_progress: stepProgressSchema.nullable().optional(),
  id: z.string(),
  session_id: z.string(),
  role: z.enum(['USER', 'ASSISTANT', 'SYSTEM']),
  content: z.string(),
  step_number_at_turn: z.number().nullable().optional(),
  referenced_chunk_ids: z.array(z.string()).optional().default([]),
  referenced_node_ids: z.array(z.string()).optional().default([]),
  user_feedback: z.string().nullable().optional(),
  feedback_rating: z.enum(['LIKE', 'DISLIKE', '1', '2', '3', '4', '5']).nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

/** Schema cho tóm tắt phiên chat ở Sidebar */
export const socraticSessionSidebarItemSchema = z.object({
  id: z.string(),
  student_id: z.string().optional(),
  teacher_id: z.string().nullable().optional(),
  title: z.string(),
  subject: z.string().nullable().optional(),
  active_canonical_code: z.string().nullable().optional(),
  current_step_number: z.number().default(1),
  is_completed: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

/** Schema cho phân trang danh sách phiên */
export const paginatedSessionsSchema = z.object({
  items: z.array(socraticSessionSidebarItemSchema),
  pageNumber: z.number(),
  pageSize: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  last: z.boolean(),
});

/** Schema cho chi tiết 1 phiên chat kèm tin nhắn */
export const socraticSessionDetailSchema = socraticSessionSidebarItemSchema.extend({
  active_process_id: z.string().nullable().optional(),
  active_exercise_id: z.string().nullable().optional(),
  messages: z.array(socraticChatMessageItemSchema).default([]),
});

/** Schema cho payload mở luồng SSE stream */
export const socraticStreamPayloadSchema = z.object({
  protocol_version: z.union([z.literal(1), z.literal(2)]).optional(),
  client_request_id: z.string().uuid().optional(),
  expected_state_version: z.number().int().nonnegative().optional(),
  session_id: z.string().nullable().optional(),
  message: z.string().min(1),
  subject: z.string().nullable().optional(),
  teacher_id: z.string().nullable().optional(),
  material_ids: z.array(z.string()).nullable().optional(),
  active_canonical_code: z.string().nullable().optional(),
  active_process_id: z.string().nullable().optional(),
  active_exercise_id: z.string().nullable().optional(),
});

/** Schema cho cập nhật phiên */
export const sessionUpdateRequestSchema = z.object({
  title: z.string().optional(),
  is_completed: z.boolean().optional(),
  current_step_number: z.number().optional(),
  active_canonical_code: z.string().optional(),
  active_process_id: z.string().optional(),
  active_exercise_id: z.string().optional(),
});

/** Schema cho gửi feedback đánh giá tin nhắn */
export const messageFeedbackRequestSchema = z.object({
  feedback_rating: z.enum(['LIKE', 'DISLIKE', '1', '2', '3', '4', '5']),
  user_feedback: z.string().max(2000).optional(),
});

/** Schema kết quả xóa phiên */
export const sessionDeleteResultSchema = z.object({
  deleted: z.boolean(),
});

/** Schemas cho các sự kiện SSE */
export const sseSessionInitDataSchema = z.object({
  step_progress: stepProgressSchema.nullable().optional(),
  session_id: z.string(),
  user_message_id: z.string(),
  assistant_message_id: z.string(),
  title: z.string(),
  active_canonical_code: z.string().nullable().optional(),
  active_process_id: z.string().nullable().optional(),
  active_exercise_id: z.string().nullable().optional(),
  current_step_number: z.number().default(1),
});

export const sseStepUpdateDataSchema = z.object({
  step_progress: stepProgressSchema.nullable().optional(),
  previous_step_number: z.number(),
  current_step_number: z.number(),
  total_steps: z.number().nullable().optional(),
  current_step_action: z.string().nullable().optional(),
  is_completed: z.boolean(),
});

export const sseContextRefDataSchema = z.object({
  referenced_chunk_ids: z.array(z.string()).default([]),
  referenced_node_ids: z.array(z.string()).default([]),
  matched_canonical_codes: z.array(z.string()).default([]),
});

export const sseTokenDataSchema = z.object({
  delta: z.string(),
});

export const sseStatusDataSchema = z.object({
  stage: z.string(),
  state: z.enum(['running', 'completed', 'failed']),
  message: z.string(),
});

export const sseContentReplaceDataSchema = z.object({
  full_content: z.string(),
});

export const sseDoneDataSchema = z.object({
  step_progress: stepProgressSchema.nullable().optional(),
  state_version: z.number().int().nonnegative().optional(),
  session_id: z.string(),
  assistant_message_id: z.string(),
  full_content: z.string(),
  step_number_at_turn: z.number().nullable().optional(),
  is_completed: z.boolean(),
  referenced_chunk_ids: z.array(z.string()).default([]),
  referenced_node_ids: z.array(z.string()).default([]),
});

export const sseErrorDataSchema = z.object({
  partial_response: z.boolean().optional(),
  content_status: z.string().nullable().optional(),
  assistant_message_id: z.string().nullable().optional(),
  code: z.string(),
  message: z.string(),
  recoverable: z.boolean(),
});
