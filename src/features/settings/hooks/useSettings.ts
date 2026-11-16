'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  getUserPreferences,
  updateUserPreferences,
  patchUserPreferences,
  getNotificationSettings,
  updateNotificationSettings,
  getSecuritySettings,
  logoutSession,
  logoutOtherSessions,
  updatePrivacySettings,
  getBillingInfo,
  getSystemInfo,
  deleteUserAccount,
} from '../services/settings.service';
import {
  UpdateProfileInput,
  UserPreferencesDto,
  NotificationSettingsDto,
  SecuritySettingsDto,
} from '../types';

export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  preferences: () => [...settingsKeys.all, 'preferences'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
  security: () => [...settingsKeys.all, 'security'] as const,
  billing: () => [...settingsKeys.all, 'billing'] as const,
  system: () => [...settingsKeys.all, 'system'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: getUserProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUpdateProfile(onSuccessToast?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateUserProfile(input),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.profile(), data);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      onSuccessToast?.();
    },
  });
}

export function useUploadAvatar(options?: {
  onSuccess?: (avatarUrl: string) => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadUserAvatar(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      options?.onSuccess?.(data.avatarUrl);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: settingsKeys.preferences(),
    queryFn: getUserPreferences,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUpdatePreferences(onSuccessToast?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<UserPreferencesDto>) => updateUserPreferences(input),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.preferences(), data);
      onSuccessToast?.();
    },
  });
}

export function usePatchPreferences(onSuccessToast?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<UserPreferencesDto>) => patchUserPreferences(input),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.preferences(), data);
      onSuccessToast?.();
    },
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: getNotificationSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUpdateNotificationSettings(onSuccessToast?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<NotificationSettingsDto>) =>
      updateNotificationSettings(input),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.notifications(), data);
      onSuccessToast?.();
    },
  });
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: settingsKeys.security(),
    queryFn: getSecuritySettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useLogoutSession(onSuccessToast?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => logoutSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() });
      onSuccessToast?.();
    },
  });
}

export function useLogoutOtherSessions(onSuccessToast?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() });
      onSuccessToast?.();
    },
  });
}

export function useUpdatePrivacy(onSuccessToast?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (privacy: Partial<SecuritySettingsDto['privacy']>) =>
      updatePrivacySettings(privacy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() });
      onSuccessToast?.();
    },
  });
}

export function useBillingInfo() {
  return useQuery({
    queryKey: settingsKeys.billing(),
    queryFn: getBillingInfo,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useSystemInfo() {
  return useQuery({
    queryKey: settingsKeys.system(),
    queryFn: getSystemInfo,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteUserAccount,
  });
}
