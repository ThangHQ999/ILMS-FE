'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMySubscription,
  getSubscriptionPlans,
  subscribePlan,
  cancelAutoRenew,
  cancelScheduledSubscription,
  getSubscriptionHistory,
} from '../services/subscription.service';
import type { SubscribeRequest } from '../schemas/subscription.schema';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  mySubscription: () => [...subscriptionKeys.all, 'my-subscription'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  history: () => [...subscriptionKeys.all, 'history'] as const,
};

export function useMySubscription(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionKeys.mySubscription(),
    queryFn: getMySubscription,
    enabled: options?.enabled ?? true,
    placeholderData: () => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('ilms_active_subscription');
          if (stored) {
            return JSON.parse(stored);
          }
        } catch {
          return undefined;
        }
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: getSubscriptionPlans,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useSubscribePlan(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubscribeRequest) => subscribePlan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['storage'] });
      onSuccessCallback?.();
    },
  });
}

export function useCancelAutoRenew(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelAutoRenew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.mySubscription() });
      onSuccessCallback?.();
    },
  });
}

export function useCancelScheduledSubscription(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelScheduledSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.mySubscription() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      onSuccessCallback?.();
    },
  });
}

export function useSubscriptionHistory() {
  return useQuery({
    queryKey: subscriptionKeys.history(),
    queryFn: getSubscriptionHistory,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
