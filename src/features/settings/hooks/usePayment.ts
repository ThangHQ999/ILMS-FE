'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPaymentOrder, getPaymentOrder } from '../services/payment.service';
import type { CreatePaymentOrderRequest } from '../schemas/payment.schema';
import { subscriptionKeys } from './useSubscriptions';

export const paymentKeys = {
  all: ['payments'] as const,
  order: (orderCode: string) => [...paymentKeys.all, 'order', orderCode] as const,
};

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (data: CreatePaymentOrderRequest) => createPaymentOrder(data),
  });
}

export function usePaymentOrderStatus(orderCode: string | null, enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: paymentKeys.order(orderCode ?? ''),
    queryFn: () => getPaymentOrder(orderCode!),
    enabled: Boolean(orderCode) && enabled,
    refetchInterval: (queryState) => {
      const status = queryState.state.data?.status;
      if (status === 'PAID' || status === 'EXPIRED') return false;
      return 3000;
    },
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!orderCode || !enabled || query.data?.status === 'PAID') return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const streamUrl = `${apiUrl}/payments/stream/${orderCode}`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(streamUrl, { withCredentials: true });

      eventSource.addEventListener('PAYMENT_SUCCESS', () => {
        queryClient.invalidateQueries({ queryKey: paymentKeys.order(orderCode) });
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
        queryClient.invalidateQueries({ queryKey: ['storage'] });
        eventSource?.close();
      });

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      // Fall back to polling
    }

    return () => {
      eventSource?.close();
    };
  }, [orderCode, enabled, query.data?.status, queryClient]);

  return query;
}
