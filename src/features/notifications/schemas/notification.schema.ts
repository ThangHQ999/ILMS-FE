import { z } from 'zod';

export const notificationTypeEnum = z.enum([
  'SYSTEM',
  'CLASS_ANNOUNCEMENT',
  'ASSIGNMENT_DUE',
  'GRADE_RELEASED',
  'ATTENDANCE_WARNING',
  'AI_RECOMMENDATION',
]);
export type NotificationType = z.infer<typeof notificationTypeEnum>;

export const notificationPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type NotificationPriority = z.infer<typeof notificationPriorityEnum>;

export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'Vừa xong';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek} tuần trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function resolveNotificationVisuals(
  type?: string | null,
  priority?: string | null
): {
  icon: string;
  colorType: 'secondary' | 'amber' | 'emerald' | 'neutral';
  category: 'all' | 'ai' | 'quiz' | 'plo' | 'announcement' | 'system';
} {
  const normType = (type ?? '').toUpperCase();
  const normPriority = (priority ?? '').toUpperCase();

  let icon = 'notifications';
  let colorType: 'secondary' | 'amber' | 'emerald' | 'neutral' = 'secondary';
  let category: 'all' | 'ai' | 'quiz' | 'plo' | 'announcement' | 'system' = 'system';

  if (normType === 'SYSTEM') {
    icon = 'campaign';
    colorType = normPriority === 'HIGH' || normPriority === 'CRITICAL' ? 'amber' : 'neutral';
    category = 'system';
  } else if (normType === 'CLASS_ANNOUNCEMENT') {
    icon = 'school';
    colorType = 'secondary';
    category = 'announcement';
  } else if (normType === 'ASSIGNMENT_DUE') {
    icon = 'schedule';
    colorType = 'amber';
    category = 'quiz';
  } else if (normType === 'GRADE_RELEASED') {
    icon = 'grade';
    colorType = 'emerald';
    category = 'quiz';
  } else if (normType === 'ATTENDANCE_WARNING') {
    icon = 'warning';
    colorType = 'amber';
    category = 'announcement';
  } else if (normType === 'AI_RECOMMENDATION') {
    icon = 'psychology';
    colorType = 'secondary';
    category = 'ai';
  }

  return { icon, colorType, category };
}

export const notificationResponseDtoSchema = z
  .object({
    id: z.string(),
    userId: z.string().nullable().optional(),
    title: z.string(),
    content: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    type: z.string().default('SYSTEM'),
    priority: z.string().default('MEDIUM'),
    isRead: z.boolean().default(false),
    readAt: z.string().nullable().optional(),
    actionUrl: z.string().nullable().optional(),
    referenceType: z.string().nullable().optional(),
    referenceId: z.string().nullable().optional(),
    metadata: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    expiresAt: z.string().nullable().optional(),
    icon: z.string().optional(),
    colorType: z.enum(['secondary', 'amber', 'emerald', 'neutral']).optional(),
    category: z.enum(['all', 'ai', 'quiz', 'plo', 'announcement', 'system']).optional(),
    timeAgo: z.string().optional(),
    actionText: z.string().optional(),
  })
  .transform((raw) => {
    const content = raw.content || raw.description || '';
    const description = raw.description || content;
    const createdAt = raw.createdAt || new Date().toISOString();
    const timeAgo = raw.timeAgo || formatRelativeTime(createdAt);
    const visuals = resolveNotificationVisuals(raw.type, raw.priority);

    return {
      id: raw.id,
      userId: raw.userId ?? undefined,
      title: raw.title,
      content,
      description,
      type: raw.type,
      priority: raw.priority,
      isRead: raw.isRead,
      readAt: raw.readAt ?? null,
      actionUrl: raw.actionUrl ?? null,
      actionText: raw.actionText || (raw.actionUrl ? 'Xem ngay' : undefined),
      referenceType: raw.referenceType ?? null,
      referenceId: raw.referenceId ?? null,
      metadata: raw.metadata ?? null,
      createdAt,
      timeAgo,
      expiresAt: raw.expiresAt ?? null,
      icon: raw.icon || visuals.icon,
      colorType: raw.colorType || visuals.colorType,
      category: raw.category || visuals.category,
    };
  });

export type NotificationItem = z.infer<typeof notificationResponseDtoSchema>;

export const notificationPageResponseSchema = z.object({
  items: z.array(notificationResponseDtoSchema).default([]),
  pageNumber: z.number().default(0),
  pageSize: z.number().default(10),
  totalElements: z.number().default(0),
  totalPages: z.number().default(1),
  last: z.boolean().default(true),
});

export type NotificationPageResponse = z.infer<typeof notificationPageResponseSchema>;

export const unreadCountResponseSchema = z.object({
  unreadCount: z.number().default(0),
});
export type UnreadCountResponse = z.infer<typeof unreadCountResponseSchema>;
