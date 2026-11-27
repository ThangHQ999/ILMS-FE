import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';
import { chatMessageSchema, chatConversationSchema, type ChatConversation, type ChatMessage } from '../schemas/chat.schema';
import {
  aiReplyDraftSchema,
  bookmarkItemSchema,
  channelFaqSchema,
  chatMessageReportSchema,
  chatSummarySchema,
  scheduledMessageItemSchema,
  studyPreferencesSchema,
  studyRecommendationSchema,
  studySessionSchema,
  studyTimerEventSchema,
  threadPageResponseSchema,
  type AiReplyDraft,
  type BookmarkItem,
  type ChannelFaq,
  type ChatMessageReport,
  type ChatReportReason,
  type ChatSummary,
  type CreateSmartGroupInput,
  type PreferredStudyMode,
  type ScheduledMessageItem,
  type SendThreadReplyInput,
  type StudyPreferences,
  type StudyRecommendation,
  type StudySession,
  type StudySessionRsvpStatus,
  type StudyTimerAction,
  type StudyTimerEvent,
  type ThreadPageResponse,
} from '../schemas/chat-phase2.schema';

function unwrapArray<T>(raw: unknown, schema: { parse: (v: unknown) => T }): T[] {
  if (Array.isArray(raw)) return raw.map((item) => schema.parse(item));
  if (raw && typeof raw === 'object' && 'items' in raw && Array.isArray((raw as { items: unknown[] }).items)) {
    return (raw as { items: unknown[] }).items.map((item) => schema.parse(item));
  }
  if (raw && typeof raw === 'object' && 'content' in raw && Array.isArray((raw as { content: unknown[] }).content)) {
    return (raw as { content: unknown[] }).content.map((item) => schema.parse(item));
  }
  return [];
}

// Module 2.1: Threaded Replies
export async function getThreadMessages(
  rootId: string,
  params?: { beforeCreatedAt?: string; beforeId?: string; limit?: number }
): Promise<ThreadPageResponse> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/messages/${encodeURIComponent(rootId)}/thread`,
    {
      params: {
        limit: params?.limit ?? 30,
        ...(params?.beforeCreatedAt ? { beforeCreatedAt: params.beforeCreatedAt } : {}),
        ...(params?.beforeId ? { beforeId: params.beforeId } : {}),
      },
    }
  );
  return threadPageResponseSchema.parse(data?.data ?? data);
}

export async function sendThreadReply(
  rootId: string,
  payload: SendThreadReplyInput
): Promise<ChatMessage> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/messages/${encodeURIComponent(rootId)}/thread`,
    payload
  );
  return chatMessageSchema.parse(data?.data ?? data);
}

// Module 2.2: Smart Study Group Matching
export async function getStudyPreferences(): Promise<StudyPreferences> {
  const { data } = await api.get<ApiResponse<unknown>>('/chat/preferences');
  return studyPreferencesSchema.parse(data?.data ?? data);
}

export async function updateStudyPreferences(payload: {
  allowPeerMatching: boolean;
  willingToMentor: boolean;
  preferredStudyMode: PreferredStudyMode;
  availabilityNote?: string;
}): Promise<StudyPreferences> {
  const { data } = await api.put<ApiResponse<unknown>>('/chat/preferences', payload);
  return studyPreferencesSchema.parse(data?.data ?? data);
}

export async function getStudyRecommendations(
  classId: string,
  params?: { courseId?: string; mode?: 'MENTOR' | 'PEER_CIRCLE' }
): Promise<StudyRecommendation[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/classes/${encodeURIComponent(classId)}/study-recommendations`,
    {
      params: {
        mode: params?.mode ?? 'MENTOR',
        ...(params?.courseId ? { courseId: params.courseId } : {}),
      },
    }
  );
  return unwrapArray(data?.data ?? data, studyRecommendationSchema);
}

export async function createSmartStudyGroup(
  payload: CreateSmartGroupInput
): Promise<ChatConversation> {
  const { data } = await api.post<ApiResponse<unknown>>(
    '/chat/conversations/smart-group',
    payload
  );
  return chatConversationSchema.parse(data?.data ?? data);
}

// Module 2.3: AI Proactive Companion, Summarizer & FAQ
export async function summarizeConversation(conversationId: string): Promise<ChatSummary> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/summarize`
  );
  return chatSummarySchema.parse(data?.data ?? data);
}

export async function summarizeThread(rootId: string): Promise<ChatSummary> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/messages/${encodeURIComponent(rootId)}/summarize`
  );
  return chatSummarySchema.parse(data?.data ?? data);
}

export async function generateInstructorAiDraft(
  messageId: string
): Promise<AiReplyDraft> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/messages/${encodeURIComponent(messageId)}/ai-draft`
  );
  return aiReplyDraftSchema.parse(data?.data ?? data);
}

export async function promoteThreadToFaq(
  rootId: string,
  payload: { questionText: string; answerText: string; conceptCode?: string }
): Promise<ChannelFaq> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/messages/${encodeURIComponent(rootId)}/promote-faq`,
    payload
  );
  return channelFaqSchema.parse(data?.data ?? data);
}

export async function getChannelFaqs(conversationId: string): Promise<ChannelFaq[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/faqs`
  );
  return unwrapArray(data?.data ?? data, channelFaqSchema);
}

// Module 2.4: Study Sessions & Sync Pomodoro
export async function getStudySessions(conversationId: string): Promise<StudySession[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/study-sessions`
  );
  return unwrapArray(data?.data ?? data, studySessionSchema);
}

export async function createStudySession(
  conversationId: string,
  payload: {
    title: string;
    description?: string;
    conceptCode?: string;
    scheduledStartAt: string;
    durationMinutes?: number;
    meetingUrl?: string;
  }
): Promise<StudySession> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/study-sessions`,
    payload
  );
  return studySessionSchema.parse(data?.data ?? data);
}

export async function rsvpStudySession(
  sessionId: string,
  status: StudySessionRsvpStatus
): Promise<StudySession> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/study-sessions/${encodeURIComponent(sessionId)}/rsvp`,
    { status }
  );
  return studySessionSchema.parse(data?.data ?? data);
}

export async function controlStudyTimer(
  sessionId: string,
  payload: { action: StudyTimerAction; durationSeconds?: number }
): Promise<StudyTimerEvent> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/study-sessions/${encodeURIComponent(sessionId)}/timer`,
    payload
  );
  return studyTimerEventSchema.parse(data?.data ?? data);
}

// Module 2.5: Bookmarks & Scheduled Messages
export async function getBookmarks(conversationId?: string): Promise<BookmarkItem[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/chat/bookmarks', {
    params: {
      page: 0,
      size: 50,
      ...(conversationId ? { conversationId } : {}),
    },
  });
  return unwrapArray(data?.data ?? data, bookmarkItemSchema);
}

export async function saveMessageBookmark(
  messageId: string,
  note?: string
): Promise<BookmarkItem> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/messages/${encodeURIComponent(messageId)}/bookmark`,
    note?.trim() ? { note: note.trim() } : {}
  );
  return bookmarkItemSchema.parse(data?.data ?? data);
}

export async function removeMessageBookmark(messageId: string): Promise<void> {
  await api.delete(`/chat/messages/${encodeURIComponent(messageId)}/bookmark`);
}

export async function getScheduledMessages(
  conversationId: string
): Promise<ScheduledMessageItem[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/scheduled-messages`
  );
  return unwrapArray(data?.data ?? data, scheduledMessageItemSchema);
}

export async function createScheduledMessage(
  conversationId: string,
  payload: {
    messageType: 'TEXT' | 'CODE' | 'RESOURCE_SHARE';
    content: string;
    scheduledAt: string;
  }
): Promise<ScheduledMessageItem> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/scheduled-messages`,
    payload
  );
  return scheduledMessageItemSchema.parse(data?.data ?? data);
}

export async function cancelScheduledMessage(messageId: string): Promise<void> {
  await api.delete(`/chat/scheduled-messages/${encodeURIComponent(messageId)}`);
}

// Module 2.6: Safety, Moderation & Exam Lock
export async function reportMessage(
  messageId: string,
  payload: { reason: ChatReportReason; description?: string }
): Promise<void> {
  await api.post(`/chat/messages/${encodeURIComponent(messageId)}/report`, payload);
}

export async function getConversationReports(
  conversationId: string,
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED' = 'PENDING'
): Promise<ChatMessageReport[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/reports`,
    { params: { status } }
  );
  return unwrapArray(data?.data ?? data, chatMessageReportSchema);
}

export async function reviewReport(
  reportId: string,
  payload: {
    status: 'RESOLVED' | 'DISMISSED';
    deleteMessage?: boolean;
    restrictSenderMinutes?: number;
  }
): Promise<void> {
  await api.patch(`/chat/reports/${encodeURIComponent(reportId)}`, payload);
}

export async function restrictMember(
  conversationId: string,
  userId: string,
  payload: { restrictedUntil: string | null; reason?: string }
): Promise<void> {
  await api.post(
    `/chat/conversations/${encodeURIComponent(conversationId)}/members/${encodeURIComponent(userId)}/restrict`,
    payload
  );
}

export async function setExamLock(
  conversationId: string,
  payload: { locked: boolean; lockedUntil?: string | null; reason?: string }
): Promise<void> {
  await api.post(
    `/chat/conversations/${encodeURIComponent(conversationId)}/exam-lock`,
    payload
  );
}
