'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from '../constants';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../services/notification.service';
import type { NotificationTab, NotificationItem, NotificationPageResponse } from '../types';

export function useNotifications() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [isOpen, setIsOpen] = useState(false);

  // 1. Fetch paged notifications (first page size 20 for dropdown)
  const notificationsQuery = useQuery({
    queryKey: notificationKeys.list({ page: 0, size: 20 }),
    queryFn: () => getNotifications({ page: 0, size: 20 }),
    staleTime: 30 * 1000,
  });

  // 2. Dedicated Unread Count query for Header Bell Badge
  const unreadCountQuery = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    staleTime: 15 * 1000,
  });

  const rawItems: NotificationItem[] = notificationsQuery.data?.items ?? [];

  // 3. Mark one notification as read with optimistic update
  const markOneMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const prevList = queryClient.getQueryData<NotificationPageResponse>(
        notificationKeys.list({ page: 0, size: 20 })
      );
      const prevUnread = queryClient.getQueryData<number>(notificationKeys.unreadCount());

      if (prevList) {
        queryClient.setQueryData<NotificationPageResponse>(
          notificationKeys.list({ page: 0, size: 20 }),
          {
            ...prevList,
            items: prevList.items.map((n) =>
              n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            ),
          }
        );
      }

      if (typeof prevUnread === 'number' && prevUnread > 0) {
        queryClient.setQueryData<number>(notificationKeys.unreadCount(), Math.max(0, prevUnread - 1));
      }

      return { prevList, prevUnread };
    },
    onError: (_err, _id, context) => {
      if (context?.prevList) {
        queryClient.setQueryData(
          notificationKeys.list({ page: 0, size: 20 }),
          context.prevList
        );
      }
      if (typeof context?.prevUnread === 'number') {
        queryClient.setQueryData(notificationKeys.unreadCount(), context.prevUnread);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  // 4. Mark all as read with optimistic update
  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const prevList = queryClient.getQueryData<NotificationPageResponse>(
        notificationKeys.list({ page: 0, size: 20 })
      );
      const prevUnread = queryClient.getQueryData<number>(notificationKeys.unreadCount());

      if (prevList) {
        queryClient.setQueryData<NotificationPageResponse>(
          notificationKeys.list({ page: 0, size: 20 }),
          {
            ...prevList,
            items: prevList.items.map((n) => ({
              ...n,
              isRead: true,
              readAt: new Date().toISOString(),
            })),
          }
        );
      }

      queryClient.setQueryData<number>(notificationKeys.unreadCount(), 0);

      return { prevList, prevUnread };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevList) {
        queryClient.setQueryData(
          notificationKeys.list({ page: 0, size: 20 }),
          context.prevList
        );
      }
      if (typeof context?.prevUnread === 'number') {
        queryClient.setQueryData(notificationKeys.unreadCount(), context.prevUnread);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  // 5. Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const prevList = queryClient.getQueryData<NotificationPageResponse>(
        notificationKeys.list({ page: 0, size: 20 })
      );
      const prevUnread = queryClient.getQueryData<number>(notificationKeys.unreadCount());

      if (prevList) {
        const target = prevList.items.find((item) => item.id === id);
        queryClient.setQueryData<NotificationPageResponse>(
          notificationKeys.list({ page: 0, size: 20 }),
          {
            ...prevList,
            items: prevList.items.filter((n) => n.id !== id),
            totalElements: Math.max(0, prevList.totalElements - 1),
          }
        );

        if (target && !target.isRead && typeof prevUnread === 'number') {
          queryClient.setQueryData<number>(
            notificationKeys.unreadCount(),
            Math.max(0, prevUnread - 1)
          );
        }
      }

      return { prevList, prevUnread };
    },
    onError: (_err, _id, context) => {
      if (context?.prevList) {
        queryClient.setQueryData(
          notificationKeys.list({ page: 0, size: 20 }),
          context.prevList
        );
      }
      if (typeof context?.prevUnread === 'number') {
        queryClient.setQueryData(notificationKeys.unreadCount(), context.prevUnread);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  // 6. Filter by active Tab
  const filteredNotifications = useMemo(() => {
    return rawItems.filter((item) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'unread') return !item.isRead;
      if (activeTab === 'courses') {
        return (
          item.type === 'CLASS_ANNOUNCEMENT' ||
          item.type === 'ASSIGNMENT_DUE' ||
          item.type === 'GRADE_RELEASED' ||
          item.type === 'ATTENDANCE_WARNING' ||
          item.category === 'announcement' ||
          item.category === 'quiz'
        );
      }
      if (activeTab === 'ai') {
        return item.type === 'AI_RECOMMENDATION' || item.category === 'ai';
      }
      return true;
    });
  }, [rawItems, activeTab]);

  const effectiveUnreadCount =
    typeof unreadCountQuery.data === 'number'
      ? unreadCountQuery.data
      : rawItems.filter((n) => !n.isRead).length;

  return {
    isOpen,
    setIsOpen,
    toggleOpen: () => setIsOpen((prev) => !prev),
    activeTab,
    setActiveTab,
    notifications: filteredNotifications,
    totalCount: rawItems.length,
    unreadCount: effectiveUnreadCount,
    isLoading: notificationsQuery.isLoading,
    isFetching: notificationsQuery.isFetching,
    markAsRead: (id: string) => markOneMutation.mutate(id),
    markAllAsRead: () => markAllMutation.mutate(),
    deleteNotification: (id: string) => deleteMutation.mutate(id),
    refetch: () => {
      notificationsQuery.refetch();
      unreadCountQuery.refetch();
    },
  };
}
