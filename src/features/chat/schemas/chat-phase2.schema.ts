import { z } from 'zod';
import {
  chatMessageSchema,
  chatMessageTypeSchema,
  chatUserSummarySchema,
  sharedResourceMetaSchema,
  type SharedResourceType,
} from './chat.schema';

// Module 2.1: Threaded Replies
export const threadPageResponseSchema = z.object({
  rootMessage: chatMessageSchema,
  replies: z.array(chatMessageSchema).default([]),
  hasMore: z.boolean().nullish().transform((v) => Boolean(v)),
  nextCursorCreatedAt: z.string().nullish(),
  nextCursorId: z.string().nullish(),
});
export type ThreadPageResponse = z.infer<typeof threadPageResponseSchema>;

export const threadSummaryEventSchema = z.object({
  rootMessageId: z.string(),
  threadReplyCount: z.coerce.number().default(0),
  threadLastReplyAt: z.string().nullish(),
  lastReplier: chatUserSummarySchema.nullish(),
  lastReplyPreview: z.string().nullish(),
});
export type ThreadSummaryEvent = z.infer<typeof threadSummaryEventSchema>;

export interface SendThreadReplyInput {
  messageType: z.infer<typeof chatMessageTypeSchema>;
  content?: string;
  codeLanguage?: string;
  replyToMessageId?: string;
  alsoSendToChannel?: boolean;
  isAnonymous?: boolean;
  mentionedUserIds?: string[];
  attachment?: {
    fileUrl: string;
    directUrl?: string | null;
    fileName: string;
    mimeType?: string | null;
    fileSizeBytes?: number | null;
    publicId?: string | null;
  };
  sharedResource?: { resourceType: SharedResourceType; resourceId: string };
  clientTempId?: string;
}

// Module 2.2: Smart Study Group Matching
export const preferredStudyModeSchema = z.enum(['PAIR_1_1', 'SMALL_GROUP', 'ANY']);
export type PreferredStudyMode = z.infer<typeof preferredStudyModeSchema>;

export const studyPreferencesSchema = z.object({
  userId: z.string().nullish(),
  allowPeerMatching: z.boolean().nullish().transform((v) => Boolean(v)),
  willingToMentor: z.boolean().nullish().transform((v) => Boolean(v)),
  preferredStudyMode: preferredStudyModeSchema.nullish().transform((v) => v ?? 'ANY'),
  availabilityNote: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export type StudyPreferences = z.infer<typeof studyPreferencesSchema>;

export const studyRecommendationSchema = z.object({
  candidateUserId: z.string(),
  fullName: z.string().nullish().transform((v) => v || ''),
  avatarUrl: z.string().nullish(),
  matchMode: z.enum(['MENTOR', 'PEER_CIRCLE']).nullish().transform((v) => v ?? 'MENTOR'),
  matchScore: z.coerce.number().default(0),
  matchingConceptCodes: z.array(z.string()).nullish().transform((v) => v ?? []),
  matchingConceptTitles: z.array(z.string()).nullish().transform((v) => v ?? []),
  availabilityNote: z.string().nullish(),
});
export type StudyRecommendation = z.infer<typeof studyRecommendationSchema>;

export interface CreateSmartGroupInput {
  name: string;
  classId: string;
  courseId?: string;
  memberIds: string[];
  targetConceptCodes?: string[];
  triggerAiIntro?: boolean;
}

// Module 2.3: AI Companion, Summarizer & FAQ
export const chatSummarySchema = z.object({
  conversationId: z.string().nullish(),
  threadRootId: z.string().nullish(),
  cached: z.boolean().nullish().transform((v) => Boolean(v)),
  summarizedMessageCount: z.coerce.number().default(0),
  mainTopics: z.array(z.string()).nullish().transform((v) => v ?? []),
  keyConclusions: z.array(z.string()).nullish().transform((v) => v ?? []),
  openQuestions: z.array(z.string()).nullish().transform((v) => v ?? []),
  sharedResources: z.array(sharedResourceMetaSchema).nullish().transform((v) => v ?? []),
  generatedAt: z.string().nullish(),
});
export type ChatSummary = z.infer<typeof chatSummarySchema>;

export const aiReplyDraftSchema = z.object({
  targetMessageId: z.string(),
  draftContent: z.string(),
  citedSources: z.array(z.string()).nullish().transform((v) => v ?? []),
});
export type AiReplyDraft = z.infer<typeof aiReplyDraftSchema>;

export const channelFaqSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  sourceThreadRootId: z.string().nullish(),
  questionText: z.string(),
  answerText: z.string(),
  conceptCode: z.string().nullish(),
  createdBy: chatUserSummarySchema.nullish(),
  createdAt: z.string().nullish(),
});
export type ChannelFaq = z.infer<typeof channelFaqSchema>;

// Module 2.4: Study Session Scheduler & Sync Pomodoro
export const studyTimerPhaseSchema = z.enum(['IDLE', 'FOCUS', 'SHORT_BREAK', 'PAUSED']);
export type StudyTimerPhase = z.infer<typeof studyTimerPhaseSchema>;

export const studyTimerActionSchema = z.enum([
  'START_FOCUS',
  'START_BREAK',
  'PAUSE',
  'RESET',
]);
export type StudyTimerAction = z.infer<typeof studyTimerActionSchema>;

export const studySessionRsvpStatusSchema = z.enum(['GOING', 'MAYBE', 'DECLINED']);
export type StudySessionRsvpStatus = z.infer<typeof studySessionRsvpStatusSchema>;

export const studyTimerEventSchema = z.object({
  sessionId: z.string(),
  phase: studyTimerPhaseSchema.nullish().transform((v) => v ?? 'IDLE'),
  startedAt: z.string().nullish(),
  serverNow: z.string().nullish(),
  durationSeconds: z.coerce.number().nullish(),
  triggeredBy: chatUserSummarySchema.nullish(),
});
export type StudyTimerEvent = z.infer<typeof studyTimerEventSchema>;

export const studySessionSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  conceptCode: z.string().nullish(),
  scheduledStartAt: z.string(),
  durationMinutes: z.coerce.number().default(60),
  meetingUrl: z.string().nullish(),
  status: z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  timerState: studyTimerEventSchema.nullish(),
  myRsvp: studySessionRsvpStatusSchema.nullish(),
  goingCount: z.coerce.number().default(0),
  maybeCount: z.coerce.number().default(0),
  createdBy: chatUserSummarySchema.nullish(),
  createdAt: z.string().nullish(),
});
export type StudySession = z.infer<typeof studySessionSchema>;

// Module 2.5: Read Receipts, Bookmarks, Scheduled Messages
export const readReceiptEventSchema = z.object({
  conversationId: z.string(),
  userId: z.string().nullish(),
  fullName: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  lastReadMessageId: z.string(),
  readAt: z.string().nullish(),
  seenCount: z.coerce.number().nullish(),
});
export type ReadReceiptEvent = z.infer<typeof readReceiptEventSchema>;

export const bookmarkItemSchema = z.object({
  id: z.string(),
  note: z.string().nullish(),
  message: chatMessageSchema,
  createdAt: z.string().nullish(),
});
export type BookmarkItem = z.infer<typeof bookmarkItemSchema>;

export const scheduledMessageItemSchema = z.object({
  id: z.string(),
  conversationId: z.string().nullish(),
  messageType: chatMessageTypeSchema.nullish().transform((v) => v ?? 'TEXT'),
  content: z.string(),
  scheduledAt: z.string(),
  status: z.enum(['SCHEDULED', 'SENT', 'CANCELLED']).default('SCHEDULED'),
  sharedResource: sharedResourceMetaSchema.nullish(),
  createdAt: z.string().nullish(),
});
export type ScheduledMessageItem = z.infer<typeof scheduledMessageItemSchema>;

// Module 2.6: Safety, Moderation & Exam Lock
export const chatReportReasonSchema = z.enum([
  'SPAM',
  'HARASSMENT',
  'CHEATING',
  'INAPPROPRIATE',
  'OTHER',
]);
export type ChatReportReason = z.infer<typeof chatReportReasonSchema>;

export const chatMessageReportSchema = z.object({
  id: z.string(),
  message: chatMessageSchema,
  reporter: chatUserSummarySchema.nullish(),
  reason: chatReportReasonSchema,
  description: z.string().nullish(),
  status: z.enum(['PENDING', 'RESOLVED', 'DISMISSED']).default('PENDING'),
  reviewedBy: chatUserSummarySchema.nullish(),
  reviewedAt: z.string().nullish(),
  createdAt: z.string().nullish(),
});
export type ChatMessageReport = z.infer<typeof chatMessageReportSchema>;
