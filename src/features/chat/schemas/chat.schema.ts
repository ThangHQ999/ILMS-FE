import { z } from 'zod';

export const chatConversationTypeSchema = z.enum([
  'DIRECT',
  'STUDY_GROUP',
  'CLASS_CHANNEL',
]);
export type ChatConversationType = z.infer<typeof chatConversationTypeSchema>;

export const chatMemberRoleSchema = z.enum(['ADMIN', 'MEMBER']);
export type ChatMemberRole = z.infer<typeof chatMemberRoleSchema>;

export const chatSenderTypeSchema = z.enum(['USER', 'AI', 'SYSTEM']);
export type ChatSenderType = z.infer<typeof chatSenderTypeSchema>;

export const chatMessageTypeSchema = z.enum([
  'TEXT',
  'CODE',
  'IMAGE',
  'FILE',
  'RESOURCE_SHARE',
  'POLL',
  'AI_REPLY',
  'SYSTEM',
]);
export type ChatMessageType = z.infer<typeof chatMessageTypeSchema>;

export const sharedResourceTypeSchema = z.enum([
  'MATERIAL',
  'COURSE',
  'LESSON',
  'QUIZ',
  'ASSIGNMENT',
  'EXAM',
  'CONCEPT',
  'FILE',
]);
export type SharedResourceType = z.infer<typeof sharedResourceTypeSchema>;

export const chatUserSummarySchema = z.object({
  id: z.string(),
  fullName: z.string().nullish().transform((v) => v || ''),
  email: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  isOnline: z.boolean().nullish().transform((v) => Boolean(v)),
  lastSeenAt: z.string().nullish(),
});
export type ChatUserSummary = z.infer<typeof chatUserSummarySchema>;

export const chatConversationMemberSchema = z.object({
  userId: z.string(),
  fullName: z.string().nullish().transform((v) => v || ''),
  email: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  nickname: z.string().nullish(),
  role: chatMemberRoleSchema.nullish().transform((v) => v ?? 'MEMBER'),
  isOnline: z.boolean().nullish().transform((v) => Boolean(v)),
  lastSeenAt: z.string().nullish(),
  joinedAt: z.string().nullish(),
  restrictedUntil: z.string().nullish(),
});
export type ChatConversationMember = z.infer<typeof chatConversationMemberSchema>;

export const chatAttachmentMetaSchema = z.object({
  fileUrl: z.string(),
  directUrl: z.string().nullish(),
  fileName: z.string().nullish().transform((v) => v || ''),
  mimeType: z.string().nullish(),
  fileSizeBytes: z.coerce.number().nullish(),
  publicId: z.string().nullish(),
});
export type ChatAttachmentMeta = z.infer<typeof chatAttachmentMetaSchema>;

export const sharedResourceMetaSchema = z.object({
  resourceType: sharedResourceTypeSchema,
  resourceId: z.string(),
  title: z.string(),
  subtitle: z.string().nullish(),
  fileType: z.string().nullish(),
  url: z.string().nullish(),
  courseId: z.string().nullish(),
  classId: z.string().nullish(),
  conceptCode: z.string().nullish(),
  thumbnailUrl: z.string().nullish(),
});
export type SharedResourceMeta = z.infer<typeof sharedResourceMetaSchema>;

export const shareableResourceItemSchema = z.object({
  resourceType: sharedResourceTypeSchema,
  resourceId: z.string(),
  title: z.string(),
  subtitle: z.string().nullish(),
  fileType: z.string().nullish(),
  url: z.string().nullish(),
  courseId: z.string().nullish(),
  courseTitle: z.string().nullish(),
  classId: z.string().nullish(),
  className: z.string().nullish(),
  conceptCode: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export type ShareableResourceItem = z.infer<typeof shareableResourceItemSchema>;

export const chatPollOptionResultSchema = z.object({
  optionId: z.string(),
  text: z.string(),
  voteCount: z.coerce.number().default(0),
  percentage: z.coerce.number().default(0),
  votedByMe: z.boolean().nullish().transform((v) => Boolean(v)),
});
export type ChatPollOptionResult = z.infer<typeof chatPollOptionResultSchema>;

export const chatPollSchema = z.object({
  id: z.string(),
  question: z.string(),
  allowMultiple: z.boolean().nullish().transform((v) => Boolean(v)),
  closesAt: z.string().nullish(),
  isClosed: z.boolean().nullish().transform((v) => Boolean(v)),
  totalVotes: z.coerce.number().default(0),
  options: z.array(chatPollOptionResultSchema).default([]),
});
export type ChatPoll = z.infer<typeof chatPollSchema>;

export const chatReactionSummarySchema = z.object({
  emoji: z.string(),
  count: z.coerce.number().default(1),
  reactedByMe: z.boolean().nullish().transform((v) => Boolean(v)),
});
export type ChatReactionSummary = z.infer<typeof chatReactionSummarySchema>;

export const chatMessageReplyPreviewSchema = z.object({
  id: z.string(),
  senderType: chatSenderTypeSchema.nullish().transform((v) => v ?? 'USER'),
  senderDisplayName: z.string().nullish().transform((v) => v || ''),
  messageType: chatMessageTypeSchema.nullish().transform((v) => v ?? 'TEXT'),
  contentPreview: z.string().nullish().transform((v) => v ?? ''),
  isDeleted: z.boolean().nullish().transform((v) => Boolean(v)),
  isAnonymous: z.boolean().nullish().transform((v) => Boolean(v)),
});
export type ChatMessageReplyPreview = z.infer<typeof chatMessageReplyPreviewSchema>;

export const chatMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  clientTempId: z.string().nullish(),
  senderType: chatSenderTypeSchema.nullish().transform((v) => v ?? 'USER'),
  sender: chatUserSummarySchema.nullish(),
  senderDisplayName: z.string().nullish().transform((v) => v || ''),
  isMine: z.boolean().nullish(),
  isAnonymous: z.boolean().nullish().transform((v) => Boolean(v)),
  messageType: chatMessageTypeSchema.nullish().transform((v) => v ?? 'TEXT'),
  content: z.string().nullish(),
  codeLanguage: z.string().nullish(),
  replyTo: chatMessageReplyPreviewSchema.nullish(),
  attachment: chatAttachmentMetaSchema.nullish(),
  sharedResource: sharedResourceMetaSchema.nullish(),
  poll: chatPollSchema.nullish(),
  mentionedUserIds: z.array(z.string()).nullish().transform((v) => v ?? []),
  reactions: z.array(chatReactionSummarySchema).nullish().transform((v) => v ?? []),
  isPinned: z.boolean().nullish().transform((v) => Boolean(v)),
  isDeleted: z.boolean().nullish().transform((v) => Boolean(v)),
  editedAt: z.string().nullish(),
  createdAt: z.string(),
  // Phase 2 Thread fields on root messages
  threadRootId: z.string().nullish(),
  threadReplyCount: z.coerce.number().nullish().transform((v) => v ?? 0),
  threadLastReplyAt: z.string().nullish(),
  // Optional AI cited sources when returned from group-assist
  citedSources: z.array(z.string()).nullish().transform((v) => v ?? []),
  // Local UI optimistic status
  optimisticStatus: z.enum(['sending', 'failed']).optional(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatMessagePageSchema = z.object({
  items: z.array(chatMessageSchema).default([]),
  hasMore: z.boolean().nullish().transform((v) => Boolean(v)),
  nextCursorCreatedAt: z.string().nullish(),
  nextCursorId: z.string().nullish(),
});
export type ChatMessagePage = z.infer<typeof chatMessagePageSchema>;

export const chatConversationSchema = z.object({
  id: z.string(),
  type: chatConversationTypeSchema,
  name: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  themeKey: z.string().nullish().transform((v) => v || 'DEFAULT'),
  defaultEmoji: z.string().nullish().transform((v) => v || '👍'),
  classId: z.string().nullish(),
  className: z.string().nullish(),
  courseId: z.string().nullish(),
  courseTitle: z.string().nullish(),
  isReadOnly: z.boolean().nullish().transform((v) => Boolean(v)),
  myRole: chatMemberRoleSchema.nullish().transform((v) => v ?? 'MEMBER'),
  mutedUntil: z.string().nullish(),
  unreadCount: z.coerce.number().nullish().transform((v) => v ?? 0),
  memberCount: z.coerce.number().nullish().transform((v) => v ?? 0),
  pinnedCount: z.coerce.number().nullish().transform((v) => v ?? 0),
  latestPinnedMessage: chatMessageReplyPreviewSchema.nullish(),
  lockedUntil: z.string().nullish(),
  lockedReason: z.string().nullish(),
  myRestrictedUntil: z.string().nullish(),
  peerUser: chatUserSummarySchema.nullish(),
  lastMessage: chatMessageSchema.nullish(),
  lastMessageAt: z.string().nullish(),
  createdAt: z.string().nullish(),
});
export type ChatConversation = z.infer<typeof chatConversationSchema>;

export const chatUnreadSummarySchema = z.object({
  totalUnreadMessages: z.coerce.number().default(0),
  unreadConversationCount: z.coerce.number().default(0),
});
export type ChatUnreadSummary = z.infer<typeof chatUnreadSummarySchema>;

export const markConversationReadResponseSchema = z.object({
  conversationId: z.string(),
  lastReadMessageId: z.string().nullish(),
  lastReadAt: z.string().nullish(),
  unreadCount: z.coerce.number().default(0),
});
export type MarkConversationReadResponse = z.infer<typeof markConversationReadResponseSchema>;

export const pusherAuthResponseSchema = z.object({
  auth: z.string(),
  channel_data: z.string().nullish(),
});
export type PusherAuthResponse = z.infer<typeof pusherAuthResponseSchema>;

export const reactionBroadcastPayloadSchema = z.object({
  messageId: z.string(),
  actorUserId: z.string().nullish(),
  emoji: z.string().nullish(),
  action: z.enum(['ADDED', 'REMOVED']).nullish(),
  reactions: z.array(chatReactionSummarySchema).default([]),
});
export type ReactionBroadcastPayload = z.infer<typeof reactionBroadcastPayloadSchema>;

export const pollBroadcastPayloadSchema = z.object({
  messageId: z.string(),
  actorUserId: z.string().nullish(),
  actorSelectedOptionIds: z.array(z.string()).nullish(),
  poll: chatPollSchema,
});
export type PollBroadcastPayload = z.infer<typeof pollBroadcastPayloadSchema>;

export const chatWsEventEnvelopeSchema = z.object({
  eventType: z.string(),
  conversationId: z.string().nullish(),
  timestamp: z.string().nullish(),
  payload: z.unknown(),
});
export type ChatWsEventEnvelope = z.infer<typeof chatWsEventEnvelopeSchema>;

// Request payloads
export interface SendMessageInput {
  messageType: ChatMessageType;
  content?: string;
  codeLanguage?: string;
  replyToMessageId?: string;
  isAnonymous?: boolean;
  mentionedUserIds?: string[];
  attachment?: ChatAttachmentMeta;
  sharedResource?: { resourceType: SharedResourceType; resourceId: string };
  clientTempId?: string;
}

export interface CreateDirectConversationInput {
  targetUserId: string;
}

export interface CreateStudyGroupInput {
  name: string;
  avatarUrl?: string;
  classId?: string;
  courseId?: string;
  themeKey?: string;
  defaultEmoji?: string;
  memberIds: string[];
}

export interface CreatePollInput {
  question: string;
  options: string[];
  allowMultiple?: boolean;
  closesAt?: string;
}
