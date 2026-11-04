import { z } from 'zod';
import {
  socraticChatMessageItemSchema,
  socraticSessionSidebarItemSchema,
  paginatedSessionsSchema,
  socraticSessionDetailSchema,
  socraticStreamPayloadSchema,
  sessionUpdateRequestSchema,
  messageFeedbackRequestSchema,
  sessionDeleteResultSchema,
  sseSessionInitDataSchema,
  sseStepUpdateDataSchema,
  sseContextRefDataSchema,
  sseTokenDataSchema,
  sseDoneDataSchema,
  sseErrorDataSchema,
  sseStatusDataSchema,
  stepProgressSchema,
  sseContentReplaceDataSchema,
} from './schemas/socratic-chat.schema';

/** Envelope phản hồi chuẩn từ Backend */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

/** Cấu trúc phân trang */
export type PaginatedSessions = z.infer<typeof paginatedSessionsSchema>;

/** Payload gửi mở luồng SSE stream */
export type SocraticStreamPayload = z.infer<typeof socraticStreamPayloadSchema>;

/** Tóm tắt phiên chat ở Sidebar */
export type SocraticSessionSidebarItem = z.infer<typeof socraticSessionSidebarItemSchema>;

/** Tin nhắn trong cuộc trò chuyện */
export type SocraticChatMessageItem = z.infer<typeof socraticChatMessageItemSchema>;

/** Chi tiết phiên chat kèm lịch sử tin nhắn */
export type SocraticSessionDetail = z.infer<typeof socraticSessionDetailSchema>;

/** Dữ liệu từng sự kiện SSE */
export type SSESessionInitData = z.infer<typeof sseSessionInitDataSchema>;
export type SSEStepUpdateData = z.infer<typeof sseStepUpdateDataSchema>;
export type SSEContextRefData = z.infer<typeof sseContextRefDataSchema>;
export type SSETokenData = z.infer<typeof sseTokenDataSchema>;
export type SSEDoneData = z.infer<typeof sseDoneDataSchema>;
export type SocraticStepProgress = z.infer<typeof stepProgressSchema>;
export type SSEStatusData = z.infer<typeof sseStatusDataSchema>;
export type SSEContentReplaceData = z.infer<typeof sseContentReplaceDataSchema>;
export type SSEErrorData = z.infer<typeof sseErrorDataSchema>;

/** Request cập nhật phiên */
export type SessionUpdateRequest = z.infer<typeof sessionUpdateRequestSchema>;

/** Request gửi đánh giá feedback */
export type MessageFeedbackRequest = z.infer<typeof messageFeedbackRequestSchema>;

/** Kết quả xóa phiên */
export type SessionDeleteResult = z.infer<typeof sessionDeleteResultSchema>;

/** Trạng thái tiến trình Socratic (UI Stepper) */
export interface SocraticProgressState {
  stepId: string;
  exerciseId: string;
  currentStepNumber: number;
  totalSteps?: number | null;
  currentStepAction?: string | null;
  isCompleted: boolean;
  activeCanonicalCode?: string | null;
  activeProcessId?: string | null;
}

/** Trạng thái tri thức tham chiếu (UI Context Reference) */
export interface SocraticKnowledgeContext {
  referencedChunkIds: string[];
  referencedNodeIds: string[];
  matchedCanonicalCodes: string[];
}

/** Types tương thích UI */
export interface SuggestionTopic {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
  colorClass: string;
}

export interface CourseSubject {
  id: string;
  name: string;
  code: string;
  plo: string;
}

/** Alias cho tin nhắn giao diện */
export interface ChatMessage {
  id: string;
  session_id?: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  step_number_at_turn?: number | null;
  step_progress?: SocraticStepProgress | null;
  referenced_chunk_ids?: string[];
  referenced_node_ids?: string[];
  user_feedback?: string | null;
  feedback_rating?: 'LIKE' | 'DISLIKE' | '1' | '2' | '3' | '4' | '5' | null;
  isStreaming?: boolean;
  streamStatus?: SSEStatusData | null;
  isIncomplete?: boolean;
  codeSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
  complexityTable?: {
    headers: string[];
    rows: Array<{
      caseName: string;
      time: string;
      space: string;
      condition: string;
      isWorst?: boolean;
    }>;
  };
  socraticQuestion?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  group: 'today' | 'past7days';
  subjectId?: string;
  messages: ChatMessage[];
  current_step_number?: number;
  is_completed?: boolean;
  active_canonical_code?: string | null;
  active_process_id?: string | null;
}
