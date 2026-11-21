'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPublishedKnowledgeGraphs,
  getPublishedMaterialGraph,
  getCourseKnowledgeGraphData,
  getPublishedConceptDetail,
  getMaterialGraphRevisions,
  getMaterialGraphAuditLogs,
  startMaterialGraphDraft,
  withdrawPublishedGraph,
  retryGraphPublication,
} from '../services/knowledge-graph.service';

export const knowledgeGraphKeys = {
  all: ['knowledge-graph'] as const,
  published: (params?: { courseId?: string; subject?: string; q?: string; after?: string }) =>
    [...knowledgeGraphKeys.all, 'published', params ?? {}] as const,
  course: (courseId: string) => [...knowledgeGraphKeys.all, 'course', courseId] as const,
  material: (materialId: string, params?: { nodeId?: string; depth?: number }) =>
    [...knowledgeGraphKeys.all, 'material', materialId, params ?? {}] as const,
  concept: (canonicalCode: string) =>
    [...knowledgeGraphKeys.all, 'concept', canonicalCode] as const,
  revisions: (materialId: string) =>
    [...knowledgeGraphKeys.all, 'revisions', materialId] as const,
  audit: (materialId: string) => [...knowledgeGraphKeys.all, 'audit', materialId] as const,
};

export function usePublishedKnowledgeGraphs(params?: {
  courseId?: string;
  subject?: string;
  q?: string;
  after?: string;
  limit?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: knowledgeGraphKeys.published({
      courseId: params?.courseId,
      subject: params?.subject,
      q: params?.q,
      after: params?.after,
    }),
    queryFn: () =>
      getPublishedKnowledgeGraphs({
        courseId: params?.courseId,
        subject: params?.subject,
        q: params?.q,
        after: params?.after,
        limit: params?.limit,
      }),
    staleTime: 60_000,
    enabled: params?.enabled ?? true,
  });
}

export function usePublishedMaterialGraph(
  materialId: string | null,
  params?: { nodeId?: string; depth?: number; limit?: number; enabled?: boolean }
) {
  return useQuery({
    queryKey: knowledgeGraphKeys.material(materialId ?? '', {
      nodeId: params?.nodeId,
      depth: params?.depth,
    }),
    queryFn: () =>
      getPublishedMaterialGraph(materialId!, {
        nodeId: params?.nodeId,
        depth: params?.depth,
        limit: params?.limit,
      }),
    staleTime: 60_000,
    enabled: Boolean(materialId) && (params?.enabled ?? true),
  });
}

export function useCourseKnowledgeGraphQuery(courseId: string | null, enabled = true) {
  return useQuery({
    queryKey: knowledgeGraphKeys.course(courseId ?? ''),
    queryFn: () => getCourseKnowledgeGraphData(courseId!),
    staleTime: 60_000,
    enabled: Boolean(courseId) && enabled,
  });
}

export function usePublishedConceptDetail(canonicalCode: string | null, enabled = true) {
  return useQuery({
    queryKey: knowledgeGraphKeys.concept(canonicalCode ?? ''),
    queryFn: () => getPublishedConceptDetail(canonicalCode!),
    staleTime: 5 * 60_000,
    enabled: Boolean(canonicalCode) && enabled,
    retry: 1,
  });
}

export function useMaterialGraphRevisions(materialId: string | null, enabled = true) {
  return useQuery({
    queryKey: knowledgeGraphKeys.revisions(materialId ?? ''),
    queryFn: () => getMaterialGraphRevisions(materialId!),
    staleTime: 60_000,
    enabled: Boolean(materialId) && enabled,
  });
}

export function useMaterialGraphAuditLogs(materialId: string | null, enabled = true) {
  return useQuery({
    queryKey: knowledgeGraphKeys.audit(materialId ?? ''),
    queryFn: () => getMaterialGraphAuditLogs(materialId!),
    staleTime: 60_000,
    enabled: Boolean(materialId) && enabled,
  });
}

export function useStartMaterialGraphDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (materialId: string) => startMaterialGraphDraft(materialId),
    onSuccess: (_data, materialId) => {
      queryClient.invalidateQueries({ queryKey: knowledgeGraphKeys.revisions(materialId) });
      queryClient.invalidateQueries({ queryKey: ['materials-ingestion'] });
    },
  });
}

export function useWithdrawPublishedGraphMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      materialId,
      publicationId,
      reason,
    }: {
      materialId: string;
      publicationId: string;
      reason?: string;
    }) => withdrawPublishedGraph(materialId, publicationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeGraphKeys.all });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useRetryGraphPublicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicationId: string) => retryGraphPublication(publicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeGraphKeys.all });
      queryClient.invalidateQueries({ queryKey: ['materials-ingestion'] });
    },
  });
}
