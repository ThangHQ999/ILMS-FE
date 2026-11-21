'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth';
import { notificationKeys } from '../constants';
import { notificationResponseDtoSchema, type NotificationItem } from '../schemas/notification.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ilms.page/api/v1';

export const NOTIFICATION_STREAM_EVENT = 'ilms_notification_received';

export function useNotificationStream() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const [latestNotification, setLatestNotification] = useState<NotificationItem | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only connect when user is authenticated in browser environment
    if (typeof window === 'undefined' || !currentUser) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    let isMounted = true;
    let reconnectDelay = 3000;

    function connectSSE() {
      if (!isMounted) return;

      const streamUrl = `${API_BASE_URL}/notifications/stream`;

      try {
        const es = new EventSource(streamUrl, { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
          reconnectDelay = 3000;
        };

        es.addEventListener('NOTIFICATION', (event: MessageEvent) => {
          try {
            const rawData = JSON.parse(event.data);
            const parsed = notificationResponseDtoSchema.safeParse(rawData);
            if (parsed.success) {
              const item = parsed.data;
              setLatestNotification(item);

              // 1. Instantly increment unread count
              queryClient.setQueryData<number>(
                notificationKeys.unreadCount(),
                (prev = 0) => prev + 1
              );

              // 2. Invalidate lists so fresh notification appears
              queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });

              // 3. Dispatch global browser event for toast listeners
              window.dispatchEvent(
                new CustomEvent(NOTIFICATION_STREAM_EVENT, { detail: item })
              );
            }
          } catch {
            // Ignore parse errors on malformed ping/heartbeat events
          }
        });

        es.onerror = () => {
          es.close();
          eventSourceRef.current = null;

          if (isMounted) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectDelay = Math.min(reconnectDelay * 1.5, 30000);
              connectSSE();
            }, reconnectDelay);
          }
        };
      } catch {
        // SSE not supported or connection error, retry later
        if (isMounted) {
          reconnectTimeoutRef.current = setTimeout(connectSSE, 10000);
        }
      }
    }

    connectSSE();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [currentUser, queryClient]);

  return {
    latestNotification,
    clearLatestNotification: () => setLatestNotification(null),
  };
}
