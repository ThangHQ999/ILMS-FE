'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCourseDetail,
  getCourseChapters,
  createChapter,
  deleteChapter,
  createLesson,
  updateLessonMetadata,
  deleteLesson,
  getCourseMaterials,
  uploadCourseMaterial,
  extractCourseMaterial,
  updateCourseMaterialDownloadable,
  deleteCourseMaterial,
  getCourseKnowledgeGraph,
  getCourseConceptDetail,
} from '../services/course.service';
import { courseKeys } from '../constants';
import {
  isActiveAiIngestionStatus,
  type CreateChapterInput,
  type CreateLessonInput,
  type UpdateLessonInput,
} from '../schemas/course.schema';

export function useCourse(courseId: string) {
  const queryClient = useQueryClient();

  const courseQuery = useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => getCourseDetail(courseId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(courseId),
  });

  const chaptersQuery = useQuery({
    queryKey: courseKeys.contentTree(courseId),
    queryFn: () => getCourseChapters(courseId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(courseId),
  });

  const addChapterMutation = useMutation({
    mutationFn: (input: CreateChapterInput) => createChapter(courseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.contentTree(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId: string) => deleteChapter(chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.contentTree(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });

  const addLessonMutation = useMutation({
    mutationFn: ({
      chapterId,
      input,
    }: {
      chapterId: string;
      input: CreateLessonInput;
    }) => createLesson(courseId, chapterId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.contentTree(courseId) });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({
      lessonId,
      input,
    }: {
      lessonId: string;
      input: UpdateLessonInput;
    }) => updateLessonMetadata(lessonId, input),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.contentTree(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lessonBlocks(vars.lessonId) });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.contentTree(courseId) });
    },
  });

  return {
    course: courseQuery.data,
    chapters: chaptersQuery.data || [],
    isLoading: courseQuery.isLoading || chaptersQuery.isLoading,
    isError: courseQuery.isError || chaptersQuery.isError,
    refetch: () => {
      courseQuery.refetch();
      chaptersQuery.refetch();
    },
    addChapterMutation,
    deleteChapterMutation,
    addLessonMutation,
    updateLessonMutation,
    deleteLessonMutation,
  };
}

export type ExtractMaterialVariables =
  | string
  | { materialId: string; autoPublish?: boolean };

export interface BatchExtractResult {
  succeeded: string[];
  failed: Array<{ materialId: string; error: string }>;
}

export function useCourseMaterials(courseId: string) {
  const queryClient = useQueryClient();

  const materialsQuery = useQuery({
    queryKey: courseKeys.materials(courseId),
    queryFn: () => getCourseMaterials(courseId),
    staleTime: 30 * 1000,
    enabled: Boolean(courseId),
    refetchInterval: (query) => {
      const items = query.state.data;
      const hasActive = items?.some((item) => isActiveAiIngestionStatus(item.aiIngestionStatus));
      return hasActive ? 4000 : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      title,
      description,
      isDownloadable,
    }: {
      file: File;
      title?: string;
      description?: string;
      isDownloadable?: boolean;
    }) => uploadCourseMaterial(courseId, file, title, description, isDownloadable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.materials(courseId) });
    },
  });

  const extractMutation = useMutation({
    mutationFn: (variables: ExtractMaterialVariables) => {
      if (typeof variables === 'string') {
        return extractCourseMaterial(variables, { autoPublish: false });
      }
      return extractCourseMaterial(variables.materialId, {
        autoPublish: variables.autoPublish ?? false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.materials(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.knowledgeGraph(courseId) });
    },
  });

  const extractBatchMutation = useMutation({
    mutationFn: async ({
      materialIds,
      autoPublish = false,
    }: {
      materialIds: string[];
      autoPublish?: boolean;
    }): Promise<BatchExtractResult> => {
      const succeeded: string[] = [];
      const failed: Array<{ materialId: string; error: string }> = [];

      for (const materialId of materialIds) {
        try {
          await extractCourseMaterial(materialId, { autoPublish });
          succeeded.push(materialId);
        } catch (err) {
          failed.push({
            materialId,
            error: err instanceof Error ? err.message : 'Extraction failed',
          });
        }
      }

      return { succeeded, failed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.materials(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.knowledgeGraph(courseId) });
    },
  });

  const toggleDownloadableMutation = useMutation({
    mutationFn: ({
      materialId,
      isDownloadable,
    }: {
      materialId: string;
      isDownloadable: boolean;
    }) => updateCourseMaterialDownloadable(materialId, isDownloadable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.materials(courseId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (materialId: string) => deleteCourseMaterial(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.materials(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.knowledgeGraph(courseId) });
    },
  });

  const materials = materialsQuery.data ?? [];
  const hasActiveJobs = materials.some((item) =>
    isActiveAiIngestionStatus(item.aiIngestionStatus)
  );

  return {
    materials,
    hasActiveJobs,
    isLoading: materialsQuery.isLoading,
    isFetching: materialsQuery.isFetching,
    isError: materialsQuery.isError,
    refetch: materialsQuery.refetch,
    uploadMutation,
    extractMutation,
    extractBatchMutation,
    toggleDownloadableMutation,
    deleteMutation,
  };
}

export function useCourseKnowledgeGraph(courseId: string) {
  return useQuery({
    queryKey: courseKeys.knowledgeGraph(courseId),
    queryFn: () => getCourseKnowledgeGraph(courseId),
    staleTime: 2 * 60 * 1000,
    enabled: Boolean(courseId),
  });
}

export function useCourseConceptDetail(canonicalCode: string | null) {
  return useQuery({
    queryKey: ['courses', 'concept-detail', canonicalCode ?? ''] as const,
    queryFn: () => getCourseConceptDetail(canonicalCode!),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(canonicalCode),
    retry: 1,
  });
}

