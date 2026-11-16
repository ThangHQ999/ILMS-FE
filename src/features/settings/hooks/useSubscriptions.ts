'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMySubscription,
  getSubscriptionPlans,
  subscribePlan,
  cancelAutoRenew,
  getSubscriptionHistory,
} from '../services/subscription.service';
import type { SubscribeRequest } from '../schemas/subscription.schema';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  mySubscription: () => [...subscriptionKeys.all, 'my-subscription'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  history: () => [...subscriptionKeys.all, 'history'] as const,
};

export function useMySubscription() {
  return useQuery({
    queryKey: subscriptionKeys.mySubscription(),
    queryFn: getMySubscription,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
