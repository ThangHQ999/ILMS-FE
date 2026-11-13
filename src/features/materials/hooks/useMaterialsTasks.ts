'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBackgroundTasks,
  retryTask,
  uploadTaskFile,
  togglePauseTask,
  boostTaskPriority,
  removeTask,
  getStoredSettings,
  saveStoredSettings,
  saveStoredTasks,
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

  // Initialize settings from localStorage on client
  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const query = useQuery({
    queryKey: materialTasksKeys.list(),
    queryFn: fetchBackgroundTasks,
    staleTime: 1000 * 5,
    refetchOnWindowFocus: false,
  });

  const tasks = query.data || [];

  // Simulated live progress tick (advances active tasks like the mockup)
  useEffect(() => {
    if (isAllPaused) return;

    const interval = setInterval(() => {
      queryClient.setQueryData<MaterialBackgroundTask[]>(
        materialTasksKeys.list(),
        (prev) => {
          if (!prev) return prev;
          let changed = false;

          const updated = prev.map((t) => {
            if (t.status === 'PROCESSING' && t.progressPercent < 99) {
              changed = true;
              const nextPct = Math.min(99, t.progressPercent + 1);
              const nextTokens = t.tokensProcessed
                ? Math.min(t.tokensTotal || 16000, t.tokensProcessed + 80)
                : undefined;
              const nextEta = t.etaSeconds ? Math.max(5, t.etaSeconds - 1) : undefined;
              return {
                ...t,
                progressPercent: nextPct,
                tokensProcessed: nextTokens,
                etaSeconds: nextEta,
              };
            }
            return t;
          });

          if (changed) {
            saveStoredTasks(updated);
            return updated;
          }
          return prev;
        }
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isAllPaused, queryClient]);

  // Mutations
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
    mutationFn: async (taskId: string) => {
      return togglePauseTask(taskId);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(materialTasksKeys.list(), updated);
    },
  });

  const boostPriorityMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return boostTaskPriority(taskId);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(materialTasksKeys.list(), updated);
    },
  });

  const removeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return removeTask(taskId);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(materialTasksKeys.list(), updated);
    },
  });

  const handleTogglePauseAll = useCallback(() => {
    setIsAllPaused((prev) => {
      const next = !prev;
      queryClient.setQueryData<MaterialBackgroundTask[]>(
        materialTasksKeys.list(),
        (current) => {
          if (!current) return current;
          const updated = current.map((t) => {
            if (t.status === 'PROCESSING' || t.status === 'PAUSED') {
              return {
                ...t,
                status: (next ? 'PAUSED' : 'PROCESSING') as typeof t.status,
              };
            }
            return t;
          });
          saveStoredTasks(updated);
          return updated;
        }
      );
      return next;
    });
  }, [queryClient]);

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

  // KPI Calculations
  const activeCount = tasks.filter((t) => t.status === 'PROCESSING').length;
  const queuedCount = tasks.filter((t) => t.status === 'QUEUED').length;
  const completedCount = 28 + tasks.filter((t) => t.status === 'SUCCESS').length;
  const failedCount = tasks.filter((t) => t.status === 'FAILED').length;

  return {
    tasks,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    isAllPaused,
    handleTogglePauseAll,
    settings,
    updateSettings,
    resetSettings,
    clusterMetrics,
    activeCount,
    queuedCount,
    completedCount,
    failedCount,
    retryMutation,
    uploadMutation,
    togglePauseMutation,
    boostPriorityMutation,
    removeTaskMutation,
  };
}

