'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listIngestionJobs,
  getIngestionJob,
  getDraftRevisionGraph,
  uploadMaterialToIngestion,
  saveDraftRevision,
  reviewIngestionDraft,
  retryIngestionJob,
  validateDraftKnowledgeGraph,
  aiRepairDraftKnowledgeGraph,
  applyAiRepairDraftKnowledgeGraph,
} from '../services/ingestion.service';
import {
  isActiveIngestionJobStatus,
  isCompletedIngestionJobStatus,
  type ReviewDecision,
} from '../schemas/ingestion.schema';

export const ingestionKeys = {
  all: ['materials-ingestion'] as const,
  list: () => [...ingestionKeys.all, 'list'] as const,
  detail: (jobId: string) => [...ingestionKeys.all, 'detail', jobId] as const,
  draftGraph: (jobId: string, revisionId: string) =>
    [...ingestionKeys.all, 'draft-graph', jobId, revisionId] as const,
};

export interface IngestionJobsMetrics {
  totalCount: number;
  activeCount: number;
  queuedCount: number;
  processingCount: number;
  publishingCount: number;
  awaitingReviewCount: number;
  completedCount: number;
  failedCount: number;
}

export function useIngestionJobsList() {
  const query = useQuery({
    queryKey: ingestionKeys.list(),
    queryFn: listIngestionJobs,
    staleTime: 10_000,
    refetchInterval: (q) => {
      const jobs = q.state.data;
      const hasActive = jobs?.some((job) => isActiveIngestionJobStatus(job.status));
      return hasActive ? 4000 : false;
    },
  });

  const jobs = query.data ?? [];
  const queuedCount = jobs.filter((j) => j.status === 'QUEUED').length;
  const processingCount = jobs.filter((j) => j.status === 'PROCESSING').length;
  const publishingCount = jobs.filter((j) => j.status === 'PUBLISHING').length;
  const awaitingReviewCount = jobs.filter((j) => j.status === 'AWAITING_REVIEW').length;
  const completedCount = jobs.filter((j) => isCompletedIngestionJobStatus(j.status)).length;
  const failedCount = jobs.filter((j) => j.status === 'FAILED').length;
  const activeCount = queuedCount + processingCount + publishingCount;

  const metrics: IngestionJobsMetrics = {
    totalCount: jobs.length,
    activeCount,
    queuedCount,
    processingCount,
    publishingCount,
    awaitingReviewCount,
    completedCount,
    failedCount,
  };

  return {
    jobs,
    metrics,
    hasActiveJobs: activeCount > 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useIngestionJobDetail(jobId: string | null) {
  return useQuery({
    queryKey: ingestionKeys.detail(jobId ?? ''),
    queryFn: () => getIngestionJob(jobId!),
    enabled: Boolean(jobId),
    staleTime: 5_000,
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      return isActiveIngestionJobStatus(status) ? 2500 : false;
    },
  });
}

export function useDraftRevisionGraph(
  jobId: string | null,
  revisionId: string | null,
  enabled = true
) {
  return useQuery({
    queryKey: ingestionKeys.draftGraph(jobId ?? '', revisionId ?? ''),
    queryFn: () => getDraftRevisionGraph(jobId!, revisionId!),
    enabled: Boolean(jobId && revisionId && enabled),
    staleTime: 30_000,
    // Backend synchronizes draft nodes to Neo4j every 5s; retry briefly if syncing
    retry: 3,
    retryDelay: 2500,
  });
}

export function useUploadIngestionMaterialMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => uploadMaterialToIngestion(form),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ingestionKeys.list() });
      queryClient.setQueryData(ingestionKeys.detail(created.jobId), created);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useSaveDraftRevisionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobId,
      baseRevisionId,
      baseHash,
      graph,
    }: {
      jobId: string;
      baseRevisionId: string;
      baseHash: string;
      graph: Record<string, unknown>;
    }) => saveDraftRevision(jobId, { baseRevisionId, baseHash, graph }),
    onSuccess: (_draft, vars) => {
      queryClient.invalidateQueries({ queryKey: ingestionKeys.detail(vars.jobId) });
    },
  });
}

export function useReviewIngestionDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobId,
      baseRevisionId,
      baseHash,
      decision,
      comment,
    }: {
      jobId: string;
      baseRevisionId: string;
      baseHash: string;
      decision: ReviewDecision;
      comment?: string;
    }) =>
      reviewIngestionDraft(jobId, {
        baseRevisionId,
        baseHash,
        decision,
        comment,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ingestionKeys.list() });
      queryClient.invalidateQueries({ queryKey: ingestionKeys.detail(vars.jobId) });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph'] });
    },
  });
}

export function useRetryIngestionJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => retryIngestionJob(jobId),
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: ingestionKeys.list() });
      queryClient.invalidateQueries({ queryKey: ingestionKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useValidateDraftKnowledgeGraphMutation() {
  return useMutation({
    mutationFn: ({
      courseId,
      snapshot,
    }: {
      courseId: string;
      snapshot: { nodes: unknown[]; edges: unknown[] };
    }) => validateDraftKnowledgeGraph(courseId, snapshot),
  });
}

export function useAiRepairDraftKnowledgeGraphMutation() {
  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: { nodes: unknown[]; edges: unknown[]; instruction?: string };
    }) => aiRepairDraftKnowledgeGraph(courseId, payload),
  });
}

export function useApplyAiRepairDraftKnowledgeGraphMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: { repairSummary?: string; repairedNodes: unknown[]; repairedEdges: unknown[] };
    }) => applyAiRepairDraftKnowledgeGraph(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingestionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph'] });
    },
  });
}

