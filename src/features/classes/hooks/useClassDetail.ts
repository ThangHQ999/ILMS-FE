'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClassDetailData,
  assignCourseToClass,
  removeCourseFromClass,
  postClassAnnouncement,
  approveMember,
} from '../services/class-detail.service';
import { updateClass } from '../services/class.service';
import type { UpdateClassRequest } from '../schemas/class.schema';

export const classDetailKeys = {
  all: ['class-detail'] as const,
  detail: (id: string) => [...classDetailKeys.all, id] as const,
};

export function useClassDetail(classId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: classDetailKeys.detail(classId),
    queryFn: () => getClassDetailData(classId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const assignCourseMutation = useMutation({
    mutationFn: (courseId: string) => assignCourseToClass(classId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.detail(classId) });
    },
  });

  const removeCourseMutation = useMutation({
    mutationFn: (courseId: string) => removeCourseFromClass(classId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.detail(classId) });
    },
  });

  const postAnnouncementMutation = useMutation({
    mutationFn: (payload: { title: string; content: string }) =>
      postClassAnnouncement(classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.detail(classId) });
    },
  });

  const approveMemberMutation = useMutation({
    mutationFn: (userId: string) => approveMember(classId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.detail(classId) });
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: (payload: Partial<UpdateClassRequest>) => updateClass(classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.detail(classId) });
    },
  });

  return {
    ...query,
    assignCourseMutation,
    removeCourseMutation,
    postAnnouncementMutation,
    approveMemberMutation,
    updateClassMutation,
  };
}

