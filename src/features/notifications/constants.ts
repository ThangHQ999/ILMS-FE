export const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  READ: (id: string) => `/notifications/${id}/read`,
  READ_ALL: '/notifications/read-all',
  DELETE: (id: string) => `/notifications/${id}`,
  STREAM: '/notifications/stream',
  BROADCAST: '/notifications/broadcast',
} as const;

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};
