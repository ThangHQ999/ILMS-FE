export const chatKeys = {
  all: ['chat'] as const,
  unreadCount: () => [...chatKeys.all, 'unread-count'] as const,
  conversations: (params?: { type?: string; unreadOnly?: boolean; q?: string }) =>
    [...chatKeys.all, 'conversations', params ?? {}] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
  messages: (id: string) => [...chatKeys.all, 'messages', id] as const,
  searchMessages: (id: string, q: string) =>
    [...chatKeys.all, 'messages-search', id, q] as const,
  pinnedMessages: (id: string) => [...chatKeys.all, 'pinned', id] as const,
  members: (id: string) => [...chatKeys.all, 'members', id] as const,
  attachments: (id: string, type?: string) =>
    [...chatKeys.all, 'attachments', id, type ?? 'ALL'] as const,
  thread: (rootId: string) => [...chatKeys.all, 'thread', rootId] as const,
  faqs: (id: string) => [...chatKeys.all, 'faqs', id] as const,
  studySessions: (id: string) => [...chatKeys.all, 'study-sessions', id] as const,
  bookmarks: (conversationId?: string) =>
    [...chatKeys.all, 'bookmarks', conversationId ?? 'ALL'] as const,
  scheduledMessages: (id: string) =>
    [...chatKeys.all, 'scheduled-messages', id] as const,
  reports: (id: string, status?: string) =>
    [...chatKeys.all, 'reports', id, status ?? 'PENDING'] as const,
  preferences: () => [...chatKeys.all, 'study-preferences'] as const,
  recommendations: (classId: string, courseId?: string, mode?: string) =>
    [...chatKeys.all, 'recommendations', classId, courseId ?? '', mode ?? 'MENTOR'] as const,
  shareableResources: (params?: {
    type?: string;
    classId?: string;
    courseId?: string;
    q?: string;
  }) => [...chatKeys.all, 'shareable-resources', params ?? {}] as const,
  userSearch: (q: string) => [...chatKeys.all, 'user-search', q] as const,
};
