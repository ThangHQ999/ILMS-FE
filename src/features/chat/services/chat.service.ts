import { api } from '@/lib/axios';
import { uploadFile, uploadImage } from '@/lib/upload';
import type { ApiResponse } from '@/types/common';
import { CHAT_PUSHER_AUTH_ENDPOINT } from '../constants/chat-realtime';
import {
  chatAttachmentMetaSchema,
  chatConversationMemberSchema,
  chatConversationSchema,
  chatMessagePageSchema,
  chatMessageSchema,
  chatPollSchema,
  chatUnreadSummarySchema,
  chatUserSummarySchema,
  markConversationReadResponseSchema,
  pusherAuthResponseSchema,
  shareableResourceItemSchema,
  type ChatAttachmentMeta,
  type ChatConversation,
  type ChatConversationMember,
  type ChatMessage,
  type ChatMessagePage,
  type ChatPoll,
  type ChatUnreadSummary,
  type ChatUserSummary,
  type CreateDirectConversationInput,
  type CreatePollInput,
  type CreateStudyGroupInput,
  type MarkConversationReadResponse,
  type PusherAuthResponse,
  type SendMessageInput,
  type ShareableResourceItem,
} from '../schemas/chat.schema';

function unwrapList<T>(raw: unknown, schema: { parse: (v: unknown) => T }): T[] {
  if (Array.isArray(raw)) return raw.map((item) => schema.parse(item));
  if (raw && typeof raw === 'object' && 'items' in raw && Array.isArray((raw as { items: unknown[] }).items)) {
    return (raw as { items: unknown[] }).items.map((item) => schema.parse(item));
  }
  if (raw && typeof raw === 'object' && 'content' in raw && Array.isArray((raw as { content: unknown[] }).content)) {
    return (raw as { content: unknown[] }).content.map((item) => schema.parse(item));
  }
  return [];
}

export async function getUnreadSummary(): Promise<ChatUnreadSummary> {
  const { data } = await api.get<ApiResponse<unknown>>('/chat/unread-count');
  return chatUnreadSummarySchema.parse(data?.data ?? data);
}

export async function getConversations(params?: {
  type?: string;
  unreadOnly?: boolean;
  q?: string;
  page?: number;
  size?: number;
}): Promise<ChatConversation[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/chat/conversations', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 50,
      ...(params?.type && params.type !== 'ALL' ? { type: params.type } : {}),
      ...(params?.unreadOnly ? { unreadOnly: true } : {}),
      ...(params?.q?.trim() ? { q: params.q.trim() } : {}),
    },
  });
  return unwrapList(data?.data ?? data, chatConversationSchema);
}

export async function getConversationById(id: string): Promise<ChatConversation> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(id)}`
  );
  return chatConversationSchema.parse(data?.data ?? data);
}

export async function createDirectConversation(
  payload: CreateDirectConversationInput
): Promise<ChatConversation> {
  const { data } = await api.post<ApiResponse<unknown>>(
    '/chat/conversations/direct',
    payload
  );
  return chatConversationSchema.parse(data?.data ?? data);
}

export async function createStudyGroup(
  payload: CreateStudyGroupInput
): Promise<ChatConversation> {
  const { data } = await api.post<ApiResponse<unknown>>(
    '/chat/conversations/group',
    payload
  );
  return chatConversationSchema.parse(data?.data ?? data);
}

export async function getClassChannel(classId: string): Promise<ChatConversation> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/classes/${encodeURIComponent(classId)}/channel`
  );
  return chatConversationSchema.parse(data?.data ?? data);
}

export async function getConversationMembers(
  conversationId: string
): Promise<ChatConversationMember[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/members`
  );
  return unwrapList(data?.data ?? data, chatConversationMemberSchema);
}

export async function addGroupMembers(
  conversationId: string,
  userIds: string[]
): Promise<void> {
  await api.post(`/chat/conversations/${encodeURIComponent(conversationId)}/members`, {
    userIds,
  });
}

export async function removeGroupMember(
  conversationId: string,
  userId: string
): Promise<void> {
  await api.delete(
    `/chat/conversations/${encodeURIComponent(conversationId)}/members/${encodeURIComponent(userId)}`
  );
}

export async function leaveConversation(conversationId: string): Promise<void> {
  await api.post(`/chat/conversations/${encodeURIComponent(conversationId)}/leave`);
}

export async function updateConversationSettings(
  conversationId: string,
  payload: { name?: string; avatarUrl?: string; isReadOnly?: boolean }
): Promise<ChatConversation> {
  const { data } = await api.patch<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/settings`,
    payload
  );
  return chatConversationSchema.parse(data?.data ?? data);
}

export async function updateConversationAppearance(
  conversationId: string,
  payload: { themeKey?: string; defaultEmoji?: string }
): Promise<ChatConversation> {
  const { data } = await api.patch<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/appearance`,
    payload
  );
  return chatConversationSchema.parse(data?.data ?? data);
}

export async function muteConversation(
  conversationId: string,
  mutedUntil: string | null
): Promise<void> {
  await api.patch(`/chat/conversations/${encodeURIComponent(conversationId)}/mute`, {
    mutedUntil,
  });
}

export async function updateMemberNickname(
  conversationId: string,
  targetUserId: string,
  nickname: string | null
): Promise<void> {
  await api.patch(
    `/chat/conversations/${encodeURIComponent(conversationId)}/members/${encodeURIComponent(targetUserId)}/nickname`,
    { nickname }
  );
}

export async function getMessages(
  conversationId: string,
  params?: { beforeCreatedAt?: string | null; beforeId?: string | null; limit?: number }
): Promise<ChatMessagePage> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      params: {
        limit: params?.limit ?? 30,
        ...(params?.beforeCreatedAt ? { beforeCreatedAt: params.beforeCreatedAt } : {}),
        ...(params?.beforeId ? { beforeId: params.beforeId } : {}),
      },
    }
  );
  return chatMessagePageSchema.parse(data?.data ?? data);
}

export async function searchMessages(
  conversationId: string,
  q: string
): Promise<ChatMessage[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    { params: { q: q.trim(), limit: 30 } }
  );
  const unwrapped = data?.data ?? data;
  if (unwrapped && typeof unwrapped === 'object' && 'items' in unwrapped) {
    return chatMessagePageSchema.parse(unwrapped).items;
  }
  return unwrapList(unwrapped, chatMessageSchema);
}

export async function getPinnedMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/pinned-messages`
  );
  return unwrapList(data?.data ?? data, chatMessageSchema);
}

export async function getConversationAttachments(
  conversationId: string,
  type?: string
): Promise<ChatMessage[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/attachments`,
    { params: type && type !== 'ALL' ? { type } : undefined }
  );
  return unwrapList(data?.data ?? data, chatMessageSchema);
}

export async function sendMessage(
  conversationId: string,
  payload: SendMessageInput
): Promise<ChatMessage> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    payload
  );
  return chatMessageSchema.parse(data?.data ?? data);
}

export async function editMessage(
  messageId: string,
  payload: { content: string; codeLanguage?: string }
): Promise<ChatMessage> {
  const { data } = await api.patch<ApiResponse<unknown>>(
    `/chat/messages/${encodeURIComponent(messageId)}`,
    payload
  );
  return chatMessageSchema.parse(data?.data ?? data);
}

export async function deleteMessage(messageId: string): Promise<void> {
  await api.delete(`/chat/messages/${encodeURIComponent(messageId)}`);
}

export async function toggleReaction(
  messageId: string,
  emoji: string
): Promise<void> {
  await api.post(`/chat/messages/${encodeURIComponent(messageId)}/reactions`, {
    emoji,
  });
}

export async function togglePinMessage(messageId: string): Promise<void> {
  await api.post(`/chat/messages/${encodeURIComponent(messageId)}/pin`);
}

export async function markConversationRead(
  conversationId: string,
  lastReadMessageId?: string
): Promise<MarkConversationReadResponse> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/read`,
    lastReadMessageId ? { lastReadMessageId } : {}
  );
  return markConversationReadResponseSchema.parse(data?.data ?? data);
}

export async function createPoll(
  conversationId: string,
  payload: CreatePollInput
): Promise<ChatMessage> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/polls`,
    payload
  );
  return chatMessageSchema.parse(data?.data ?? data);
}

export async function votePoll(
  pollId: string,
  optionIds: string[]
): Promise<ChatPoll> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/polls/${encodeURIComponent(pollId)}/vote`,
    { optionIds }
  );
  return chatPollSchema.parse(data?.data ?? data);
}

export async function askChatAi(
  conversationId: string,
  payload: { prompt: string; replyToMessageId?: string }
): Promise<ChatMessage> {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/ask-ai`,
    payload
  );
  return chatMessageSchema.parse(data?.data ?? data);
}

export async function getShareableResources(params?: {
  type?: string;
  classId?: string;
  courseId?: string;
  q?: string;
}): Promise<ShareableResourceItem[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/chat/shareable-resources', {
    params: {
      ...(params?.type && params.type !== 'ALL' ? { type: params.type } : {}),
      ...(params?.classId ? { classId: params.classId } : {}),
      ...(params?.courseId ? { courseId: params.courseId } : {}),
      ...(params?.q?.trim() ? { q: params.q.trim() } : {}),
    },
  });
  return unwrapList(data?.data ?? data, shareableResourceItemSchema);
}

export async function searchChatUsers(q: string): Promise<ChatUserSummary[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/chat/users/search', {
    params: { q: q.trim() },
  });
  return unwrapList(data?.data ?? data, chatUserSummarySchema);
}

export async function authorizePusherChannel(
  socketId: string,
  channelName: string
): Promise<PusherAuthResponse> {
  const { data } = await api.post<ApiResponse<unknown> | PusherAuthResponse>(
    CHAT_PUSHER_AUTH_ENDPOINT,
    {
      socket_id: socketId,
      channel_name: channelName,
    }
  );
  const raw =
    data && typeof data === 'object' && 'data' in data && data.data
      ? data.data
      : data;
  return pusherAuthResponseSchema.parse(raw);
}

export async function uploadChatAttachment(
  file: File,
  signal?: AbortSignal
): Promise<{ messageType: 'IMAGE' | 'FILE'; attachment: ChatAttachmentMeta }> {
  const isImage = file.type.startsWith('image/');
  if (isImage) {
    const uploaded = await uploadImage(file, 'ilms/chat', signal);
    return {
      messageType: 'IMAGE',
      attachment: chatAttachmentMetaSchema.parse({
        fileUrl: uploaded.url,
        directUrl: uploaded.url,
        fileName: uploaded.originalFilename || file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
        publicId: uploaded.publicId ?? null,
      }),
    };
  }
  const uploaded = await uploadFile(file, 'ilms/chat', signal);
  return {
    messageType: 'FILE',
    attachment: chatAttachmentMetaSchema.parse({
      fileUrl: uploaded.url,
      directUrl: uploaded.url,
      fileName: uploaded.originalFilename || file.name,
      mimeType: file.type,
      fileSizeBytes: uploaded.bytes ?? file.size,
      publicId: uploaded.publicId ?? null,
    }),
  };
}
