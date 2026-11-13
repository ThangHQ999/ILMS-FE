'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCourseDetail,
  getCourseChapters,
  createChapter,
  createLesson,
} from '../services/course.service';
import { courseKeys } from '../constants';
import type { CreateChapterInput, CreateLessonInput } from '../schemas/course.schema';

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
    addLessonMutation,
  };
}
