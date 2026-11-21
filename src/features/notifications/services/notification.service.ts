import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';
import { NOTIFICATION_ENDPOINTS } from '../constants';
import {
  notificationPageResponseSchema,
  unreadCountResponseSchema,
  type NotificationPageResponse,
} from '../schemas/notification.schema';
import type { NotificationQueryParams } from '../types';

export async function getNotifications(
  params?: NotificationQueryParams
): Promise<NotificationPageResponse> {
  try {
    const { data: res } = await api.get<ApiResponse<unknown>>(NOTIFICATION_ENDPOINTS.LIST, {
      params,
    });

    if (!res?.data) {
      return {
        items: [],
        pageNumber: 0,
        pageSize: params?.size ?? 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    }

    // Support both PageResponse { items: [...] } and array fallback [...]
    if (Array.isArray(res.data)) {
      return notificationPageResponseSchema.parse({
        items: res.data,
        pageNumber: params?.page ?? 0,
        pageSize: params?.size ?? res.data.length,
        totalElements: res.data.length,
        totalPages: 1,
        last: true,
      });
    }

    return notificationPageResponseSchema.parse(res.data);
  } catch (error) {
    return {
      items: [],
      pageNumber: 0,
      pageSize: params?.size ?? 10,
      totalElements: 0,
      totalPages: 0,
      last: true,
    };
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const { data: res } = await api.get<ApiResponse<unknown>>(
      NOTIFICATION_ENDPOINTS.UNREAD_COUNT
    );
    if (!res?.data) return 0;

    const parsed = unreadCountResponseSchema.safeParse(res.data);
    if (parsed.success) {
      return parsed.data.unreadCount;
    }

    if (typeof (res.data as Record<string, unknown>).count === 'number') {
      return (res.data as Record<string, unknown>).count as number;
    }

    return 0;
  } catch {
    return 0;
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await api.patch(NOTIFICATION_ENDPOINTS.READ(id));
  } catch {
    // Graceful error ignore on optimistic updates
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await api.patch(NOTIFICATION_ENDPOINTS.READ_ALL);
  } catch {
    // Graceful error ignore on optimistic updates
  }
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(NOTIFICATION_ENDPOINTS.DELETE(id));
}
