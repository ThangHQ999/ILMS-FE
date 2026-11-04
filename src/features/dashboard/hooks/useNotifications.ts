'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '../constants';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/dashboard.service';
import { NotificationTab, NotificationItem } from '../types';

export function useNotifications() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: dashboardKeys.notifications(),
    queryFn: getNotifications,
    staleTime: 30 * 1000,
  });

  const markOneMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: dashboardKeys.notifications() });
      const previous = queryClient.getQueryData<NotificationItem[]>(dashboardKeys.notifications());
      queryClient.setQueryData<NotificationItem[]>(dashboardKeys.notifications(), (old) =>
        old ? old.map((n) => (n.id === id ? { ...n, isRead: true } : n)) : []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(dashboardKeys.notifications(), context.previous);
      }
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: dashboardKeys.notifications() });
      const previous = queryClient.getQueryData<NotificationItem[]>(dashboardKeys.notifications());
      queryClient.setQueryData<NotificationItem[]>(dashboardKeys.notifications(), (old) =>
        old ? old.map((n) => ({ ...n, isRead: true })) : []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(dashboardKeys.notifications(), context.previous);
      }
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !item.isRead;
    if (activeTab === 'courses') return item.category === 'quiz' || item.category === 'announcement';
    if (activeTab === 'ai') return item.category === 'ai' || item.category === 'plo';
    return true;
  });

  return {
    isOpen,
    setIsOpen,
    toggleOpen: () => setIsOpen((prev) => !prev),
    activeTab,
    setActiveTab,
    notifications: filteredNotifications,
    totalCount: notifications.length,
    unreadCount,
    markAsRead: (id: string) => markOneMutation.mutate(id),
    markAllAsRead: () => markAllMutation.mutate(),
  };
}
