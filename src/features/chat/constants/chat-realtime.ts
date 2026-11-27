/**
 * Soketi (Pusher-compatible) real-time constants for ILMS Messenger Chat.
 * Centralized here so channel naming or event names can be adjusted in one place.
 */

export const CHAT_PUSHER_AUTH_ENDPOINT = '/chat/pusher/auth';

export const PRESENCE_CHAT_CHANNEL = 'presence-ilms-chat';

export function conversationChannel(conversationId: string): string {
  return `private-conversation-${conversationId}`;
}

export function userChannel(userId: string): string {
  return `private-user-${userId}`;
}

export function threadChannel(rootMessageId: string): string {
  return `private-thread-${rootMessageId}`;
}

export const CHAT_WS_EVENTS = {
  MESSAGE_CREATED: 'MESSAGE_CREATED',
  MESSAGE_UPDATED: 'MESSAGE_UPDATED',
  MESSAGE_DELETED: 'MESSAGE_DELETED',
  MESSAGE_PINNED: 'MESSAGE_PINNED',
  REACTION_UPDATED: 'REACTION_UPDATED',
  POLL_UPDATED: 'POLL_UPDATED',
  CONVERSATION_UPDATED: 'CONVERSATION_UPDATED',
  CONVERSATION_CREATED: 'CONVERSATION_CREATED',
  UNREAD_UPDATED: 'UNREAD_UPDATED',
  REMOVED_FROM_CONVERSATION: 'REMOVED_FROM_CONVERSATION',
  MEMBER_JOINED: 'MEMBER_JOINED',
  MEMBER_LEFT: 'MEMBER_LEFT',
  THREAD_REPLY_CREATED: 'THREAD_REPLY_CREATED',
  THREAD_SUMMARY_UPDATED: 'THREAD_SUMMARY_UPDATED',
  STUDY_TIMER_UPDATED: 'STUDY_TIMER_UPDATED',
  READ_RECEIPT: 'READ_RECEIPT',
  CLIENT_TYPING: 'client-typing',
} as const;

export const SOKETI_CONFIG = {
  key: process.env.NEXT_PUBLIC_SOKETI_KEY || '',
  host: process.env.NEXT_PUBLIC_SOKETI_HOST || '127.0.0.1',
  port: Number(process.env.NEXT_PUBLIC_SOKETI_PORT || '6001'),
  forceTLS: process.env.NEXT_PUBLIC_SOKETI_FORCE_TLS === 'true',
} as const;
