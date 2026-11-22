'use client';

import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClassInfoDetail,
  getClassStats,
  getClassCourses,
  getAvailableClassCourses,
  getClassAnnouncements,
  getClassMembers,
  getClassAssignments,
  getClassExams,
  getClassGradeReports,
  assignCourseToClass,
  removeCourseFromClass,
  postClassAnnouncement,
  pinClassAnnouncement,
  deleteClassAnnouncement,
  approveMember,
  rejectMember,
  removeMember,
  updateMemberRole,
  MOCK_GRADEBOOK_AI,
  MOCK_MATERIALS,
  MOCK_TEMPLATES,
} from '../services/class-detail.service';
import { updateClass, inviteMemberByEmail } from '../services/class.service';
import type { UpdateClassRequest, ClassItem } from '../schemas/class.schema';
import type { ClassAnnouncement, ClassDetailData } from '../schemas/class-detail.schema';

export const classDetailKeys = {
  all: ['class-detail'] as const,
  detail: (id: string) => [...classDetailKeys.all, id] as const,
  info: (id: string) => [...classDetailKeys.detail(id), 'info'] as const,
  stats: (id: string) => [...classDetailKeys.detail(id), 'stats'] as const,
  courses: (id: string) => [...classDetailKeys.detail(id), 'courses'] as const,
  availableCourses: (id: string) => [...classDetailKeys.detail(id), 'available-courses'] as const,
  announcements: (id: string) => [...classDetailKeys.detail(id), 'announcements'] as const,
  members: (id: string) => [...classDetailKeys.detail(id), 'members'] as const,
  assignments: (id: string) => [...classDetailKeys.detail(id), 'assignments'] as const,
  exams: (id: string) => [...classDetailKeys.detail(id), 'exams'] as const,
  gradeReports: (id: string, isStudent: boolean) =>
    [...classDetailKeys.detail(id), 'grade-reports', isStudent ? 'me' : 'all'] as const,
};

export function useClassDetail(
  classId: string,
  activeTab: string = 'stream',
  isStudent: boolean = false
) {
  const queryClient = useQueryClient();

  const shouldLoadCourses =
    activeTab === 'subjects' || activeTab === 'modules' || activeTab === 'overview';
  const shouldLoadAnnouncements =
    activeTab === 'stream' || activeTab === 'announcements';
  const shouldLoadMembers =
    activeTab === 'people' || activeTab === 'members' || activeTab === 'settings';
  const shouldLoadAssessments =
    activeTab === 'assignments' || activeTab === 'gradebook';

  // Core class metadata & banner stats (loaded once & cached)
  const infoQuery = useQuery({
    queryKey: classDetailKeys.info(classId),
    queryFn: () => getClassInfoDetail(classId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: () => {
      // Seed instantly from existing cached class lists (e.g. from /classes)
      const cached = queryClient.getQueriesData<{ items?: ClassItem[] }>({
        queryKey: ['classes'],
      });
      const cleanTargetId = classId.toLowerCase().trim();
      for (const [, cacheData] of cached) {
        if (cacheData?.items && Array.isArray(cacheData.items)) {
          const match = cacheData.items.find(
            (c) =>
              String(c.id).toLowerCase().trim() === cleanTargetId ||
              c.name?.toLowerCase().trim() === cleanTargetId ||
              c.enrollmentKey?.toLowerCase().trim() === cleanTargetId
          );
          if (match) return match;
        }
      }
      return undefined;
    },
  });

  const statsQuery = useQuery({
    queryKey: classDetailKeys.stats(classId),
    queryFn: () => getClassStats(classId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Tab-scoped queries: only fetched when the user enters the corresponding tab
  const coursesQuery = useQuery({
    queryKey: classDetailKeys.courses(classId),
    queryFn: () => getClassCourses(classId),
    enabled: shouldLoadCourses,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const availableCoursesQuery = useQuery({
    queryKey: classDetailKeys.availableCourses(classId),
    queryFn: () => getAvailableClassCourses(classId),
    enabled: shouldLoadCourses,
    staleTime: 1000 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const announcementsQuery = useQuery({
    queryKey: classDetailKeys.announcements(classId),
    queryFn: () => getClassAnnouncements(classId),
    enabled: shouldLoadAnnouncements,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const membersQuery = useQuery({
    queryKey: classDetailKeys.members(classId),
    queryFn: () => getClassMembers(classId),
    enabled: shouldLoadMembers,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const assignmentsQuery = useQuery({
    queryKey: classDetailKeys.assignments(classId),
    queryFn: () => getClassAssignments(classId),
    enabled: shouldLoadAssessments,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const examsQuery = useQuery({
    queryKey: classDetailKeys.exams(classId),
    queryFn: () => getClassExams(classId),
    enabled: shouldLoadAssessments,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const gradeReportsQuery = useQuery({
    queryKey: classDetailKeys.gradeReports(classId, isStudent),
    queryFn: () => getClassGradeReports(classId, isStudent),
    enabled: shouldLoadAssessments,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const data: ClassDetailData | undefined = useMemo(() => {
    if (!infoQuery.data) return undefined;
    return {
      classInfo: infoQuery.data,
      courses: coursesQuery.data ?? [],
      announcements: announcementsQuery.data ?? [],
      gradebookStudents: gradeReportsQuery.data ?? [],
      gradebookAi: MOCK_GRADEBOOK_AI,
      members: membersQuery.data ?? [],
      materials: MOCK_MATERIALS,
      courseTemplates: MOCK_TEMPLATES,
    };
  }, [
    infoQuery.data,
    coursesQuery.data,
    announcementsQuery.data,
    gradeReportsQuery.data,
    membersQuery.data,
  ]);

  const refetch = useCallback(() => {
    return infoQuery.refetch();
  }, [infoQuery]);

  const assignCourseMutation = useMutation({
    mutationFn: (courseId: string) => assignCourseToClass(classId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.courses(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.availableCourses(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
    },
  });

  const removeCourseMutation = useMutation({
    mutationFn: (courseId: string) => removeCourseFromClass(classId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.courses(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.availableCourses(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
    },
  });

  const postAnnouncementMutation = useMutation({
    mutationFn: (payload: { title: string; content: string }) =>
      postClassAnnouncement(classId, payload),
    onSuccess: async (created) => {
      if (created) {
        queryClient.setQueryData<ClassAnnouncement[]>(
          classDetailKeys.announcements(classId),
          (prev = []) => [created, ...prev.filter((a) => a.id !== created.id)]
        );
      }
      await queryClient.invalidateQueries({
        queryKey: classDetailKeys.announcements(classId),
        refetchType: 'all',
      });
    },
  });

  const pinAnnouncementMutation = useMutation({
    mutationFn: ({ announcementId, pin }: { announcementId: string; pin: boolean }) =>
      pinClassAnnouncement(classId, announcementId, pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.announcements(classId) });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (announcementId: string) =>
      deleteClassAnnouncement(classId, announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.announcements(classId) });
    },
  });

  const approveMemberMutation = useMutation({
    mutationFn: (userId: string) => approveMember(classId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.members(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
    },
  });

  const rejectMemberMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      rejectMember(classId, userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.members(classId) });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeMember(classId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.members(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'TEACHER' | 'STUDENT' }) =>
      updateMemberRole(classId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.members(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
    },
  });

  const inviteTeacherMutation = useMutation({
    mutationFn: (email: string) => inviteMemberByEmail(classId, email, 'TEACHER'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.members(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: (payload: Partial<UpdateClassRequest>) => updateClass(classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.info(classId) });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const assignmentsCount =
    statsQuery.data?.pendingAssignmentsCount !== undefined
      ? statsQuery.data.pendingAssignmentsCount
      : assignmentsQuery.isFetched || examsQuery.isFetched
        ? (assignmentsQuery.data?.length ?? 0) + (examsQuery.data?.length ?? 0)
        : undefined;

  return {
    data,
    bannerStats: statsQuery.data,
    assignmentsCount,
    availableCourses: availableCoursesQuery.data ?? [],
    assignments: assignmentsQuery.data ?? [],
    exams: examsQuery.data ?? [],
    isLoading: infoQuery.isLoading,
    isAnnouncementsLoading: announcementsQuery.isLoading,
    isError: infoQuery.isError,
    refetch,
    assignCourseMutation,
    removeCourseMutation,
    postAnnouncementMutation,
    pinAnnouncementMutation,
    deleteAnnouncementMutation,
    approveMemberMutation,
    rejectMemberMutation,
    removeMemberMutation,
    updateMemberRoleMutation,
    inviteTeacherMutation,
    updateClassMutation,
  };
}

