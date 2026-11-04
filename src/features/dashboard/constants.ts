export const DASHBOARD_STORAGE_KEY = 'ilms_layout_mode';

export const DASHBOARD_ENDPOINTS = {
  ANALYTICS: '/dashboard/analytics',
  COMPETENCY: '/dashboard/competency',
  AI_INSIGHT: '/dashboard/ai-insight',
  COURSES: '/me/courses',
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  AI_CHAT: '/ai/coach/chat',
} as const;

export const dashboardKeys = {
  all: ['dashboard'] as const,
  analytics: () => [...dashboardKeys.all, 'analytics'] as const,
  competency: () => [...dashboardKeys.all, 'competency'] as const,
  aiInsight: () => [...dashboardKeys.all, 'aiInsight'] as const,
  courses: (filter?: string) => [...dashboardKeys.all, 'courses', { filter }] as const,
  notifications: (tab?: string) => [...dashboardKeys.all, 'notifications', { tab }] as const,
  aiTasks: () => [...dashboardKeys.all, 'aiTasks'] as const,
};
