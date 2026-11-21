import type {
  NotificationItem,
  NotificationPageResponse,
  UnreadCountResponse,
  NotificationType,
  NotificationPriority,
} from './schemas/notification.schema';

export type {
  NotificationItem,
  NotificationPageResponse,
  UnreadCountResponse,
  NotificationType,
  NotificationPriority,
};

export type NotificationTab = 'all' | 'unread' | 'courses' | 'ai';

export interface NotificationQueryParams {
  isRead?: boolean;
  type?: string;
  search?: string;
  page?: number;
  size?: number;
}
