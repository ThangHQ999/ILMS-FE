'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBackgroundTasks,
  retryTask,
  uploadTaskFile,
  getStoredSettings,
  saveStoredSettings,
  DEFAULT_PIPELINE_SETTINGS,
  DEFAULT_CLUSTER_METRICS,
} from '../services/materials-tasks.service';
import type {
  MaterialBackgroundTask,
  PipelineSettings,
  ClusterMetrics,
} from '../schemas/materials-tasks.schema';

export const materialTasksKeys = {
  all: ['materials-tasks'] as const,
  list: () => [...materialTasksKeys.all, 'list'] as const,
};

export function useMaterialsTasks() {
  const queryClient = useQueryClient();
  const [isAllPaused, setIsAllPaused] = useState(false);
  const [settings, setSettings] = useState<PipelineSettings>(DEFAULT_PIPELINE_SETTINGS);
  const [clusterMetrics] = useState<ClusterMetrics>(DEFAULT_CLUSTER_METRICS);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const query = useQuery({
    queryKey: materialTasksKeys.list(),
    queryFn: fetchBackgroundTasks,
    staleTime: 10_000,
    refetchInterval: (q) => {
      if (isAllPaused) return false;
      const items = q.state.data;
      const hasActive = items?.some(
        (t) => t.status === 'PROCESSING' || t.status === 'QUEUED' || t.status === 'PUBLISHING'
      );
      return hasActive ? 4000 : false;
    },
  });

  const tasks = query.data ?? [];

  const retryMutation = useMutation({
    mutationFn: retryTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialTasksKeys.list() });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadTaskFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialTasksKeys.list() });
    },
  });

  const togglePauseMutation = useMutation({
    mutationFn: async (_taskId: string): Promise<MaterialBackgroundTask[]> => tasks,
  });

  const boostPriorityMutation = useMutation({
    mutationFn: async (_taskId: string): Promise<MaterialBackgroundTask[]> => tasks,
  });

  const removeTaskMutation = useMutation({
    mutationFn: async (_taskId: string): Promise<MaterialBackgroundTask[]> => tasks,
  });

  const handleTogglePauseAll = useCallback(() => {
    setIsAllPaused((prev) => !prev);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<PipelineSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveStoredSettings(updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_PIPELINE_SETTINGS);
    saveStoredSettings(DEFAULT_PIPELINE_SETTINGS);
  }, []);

  // Real KPI calculations directly from server jobs (no hardcoded offsets)
  const activeCount = tasks.filter(
    (t) => t.status === 'PROCESSING' || t.status === 'PUBLISHING'
  ).length;
  const queuedCount = tasks.filter((t) => t.status === 'QUEUED').length;
  const awaitingReviewCount = tasks.filter((t) => t.status === 'AWAITING_REVIEW').length;
  const completedCount = tasks.filter((t) => t.status === 'SUCCESS').length;
  const failedCount = tasks.filter((t) => t.status === 'FAILED').length;

  return {
    tasks,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isError: query.isError,
    refetch: query.refetch,
    isAllPaused,
    handleTogglePauseAll,
    settings,
    updateSettings,
    resetSettings,
    clusterMetrics,
    activeCount,
    queuedCount,
    awaitingReviewCount,
    completedCount,
    failedCount,
    retryMutation,
    uploadMutation,
    togglePauseMutation,
    boostPriorityMutation,
    removeTaskMutation,
  };
}
