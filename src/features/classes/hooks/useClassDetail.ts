'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClassInfoDetail,
  getClassOverview,
  getClassStats,
  getClassCourses,
  getAvailableClassCourses,
  getClassAnnouncements,
  getClassMembers,
  getClassMaterials,
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
  MOCK_TEMPLATES,
} from '../services/class-detail.service';
import { updateClass, inviteMemberByEmail, leaveClass } from '../services/class.service';
import type { UpdateClassRequest, ClassItem } from '../schemas/class.schema';
import type { ClassAnnouncement, ClassDetailData } from '../schemas/class-detail.schema';
import { classDetailKeys } from '../constants';

export { classDetailKeys } from '../constants';

export function useClassDetail(
  classId: string,
  activeTab: string = 'stream',
  isStudent: boolean = false,
  { loadAssessmentLists = true, loadAvailableCourses = true, loadOverview = false,
    loadMaterialsPreview = true, enabled = true } = {},
) {
  const queryClient = useQueryClient();
  const isStreamOverview = loadOverview && activeTab === 'stream';
  const overviewKey = classDetailKeys.overview(classId);

  const shouldLoadCourses =
    (activeTab === 'stream' && !isStreamOverview) ||
    activeTab === 'materials' ||
    activeTab === 'subjects' ||
    activeTab === 'modules' ||
    activeTab === 'overview' ||
    activeTab === 'assignments' ||
    activeTab === 'gradebook';
  const shouldLoadAnnouncements =
    (activeTab === 'stream' && !isStreamOverview) || activeTab === 'announcements';
  const shouldLoadMembers =
    activeTab === 'people' || activeTab === 'members' || activeTab === 'settings';
  const shouldLoadAssessments =
    loadAssessmentLists && (activeTab === 'assignments' || activeTab === 'gradebook');

  const overviewQuery = useQuery({
    queryKey: overviewKey,
    queryFn: ({ signal }) => getClassOverview(classId, signal),
    enabled: enabled && isStreamOverview,
    staleTime: 60_000,
    retry: false,
    refetchOnMount: true,
  });
  const overview = isStreamOverview && !overviewQuery.isError ? overviewQuery.data : undefined;
  const overviewTime = overviewQuery.dataUpdatedAt;

  useEffect(() => {
    if (!overview) return;
    const infoKey = classDetailKeys.info(classId);
    const statsKey = classDetailKeys.stats(classId);
    if ((queryClient.getQueryState(infoKey)?.dataUpdatedAt ?? 0) <= overviewTime) {
      queryClient.setQueryData(infoKey, overview.classInfo, { updatedAt: overviewTime });
    }
    if ((queryClient.getQueryState(statsKey)?.dataUpdatedAt ?? 0) <= overviewTime) {
      queryClient.setQueryData(statsKey, { ...overview.stats, sessionsCount: overview.sessionsCount ?? undefined },
        { updatedAt: overviewTime });
    }
  }, [classId, overview, overviewTime, queryClient]);

  // Core class metadata & banner stats (loaded once & cached)
  const infoQuery = useQuery({
    queryKey: classDetailKeys.info(classId),
    queryFn: () => getClassInfoDetail(classId),
    enabled: enabled && !isStreamOverview,
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
    enabled: enabled && !isStreamOverview,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: () => {
      // Seed instant stats from cached class item
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
          if (match) {
            return {
              coursesCount: 0,
              studentsCount: match.enrolledCount || 0,
              teachersCount: 1,
            };
          }
        }
      }
      return undefined;
    },
  });

  // Tab-scoped queries: only fetched when the user enters the corresponding tab
  const coursesQuery = useQuery({
    queryKey: classDetailKeys.courses(classId),
    queryFn: () => getClassCourses(classId),
    enabled: enabled && shouldLoadCourses,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const availableCoursesQuery = useQuery({
    queryKey: classDetailKeys.availableCourses(classId),
    queryFn: () => getAvailableClassCourses(classId),
    enabled: enabled && loadAvailableCourses && (activeTab === 'subjects' || activeTab === 'modules')
      && infoQuery.data?.isClassInfoLive === true && infoQuery.data.callerRole !== 'STUDENT',
    staleTime: 1000 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const announcementsQuery = useQuery({
    queryKey: classDetailKeys.announcements(classId),
    queryFn: () => getClassAnnouncements(classId),
    enabled: enabled && shouldLoadAnnouncements,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const membersQuery = useQuery({
    queryKey: classDetailKeys.members(classId),
    queryFn: () => getClassMembers(classId),
    enabled: enabled && shouldLoadMembers,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const assignmentsQuery = useQuery({
    queryKey: classDetailKeys.assignments(classId),
    queryFn: () => getClassAssignments(classId),
    enabled: enabled && shouldLoadAssessments,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const examsQuery = useQuery({
    queryKey: classDetailKeys.exams(classId),
    queryFn: () => getClassExams(classId),
    enabled: enabled && shouldLoadAssessments,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const gradeReportsQuery = useQuery({
    queryKey: classDetailKeys.gradeReports(classId, isStudent),
    queryFn: () => getClassGradeReports(classId, isStudent),
    enabled: enabled && shouldLoadAssessments,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const materialsQuery = useQuery({
    queryKey: [...classDetailKeys.materials(classId), 'preview'],
    queryFn: ({ signal }) => getClassMaterials(classId, { size: 4 }, signal),
    enabled: enabled && loadMaterialsPreview && activeTab === 'stream'
      && (isStreamOverview ? Boolean(overview) : infoQuery.data?.isClassInfoLive === true && !infoQuery.isPlaceholderData),
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const classInfo = isStreamOverview ? overview?.classInfo : infoQuery.data;
  const isClassInfoLive = classInfo?.isClassInfoLive === true && (isStreamOverview || !infoQuery.isPlaceholderData);
  const announcements = isStreamOverview ? overview?.announcements : announcementsQuery.data;
  const bannerStats = isStreamOverview ? overview?.stats : statsQuery.data;
  const refetchOverview = overviewQuery.refetch;
  const refetchInfo = infoQuery.refetch;
  const data: ClassDetailData | undefined = useMemo(() => {
    if (!classInfo) return undefined;
    return {
      classInfo,
      isClassInfoLive,
      callerRole: isClassInfoLive ? classInfo.callerRole : undefined,
      courses: coursesQuery.data ?? [],
      announcements: announcements ?? [],
      gradebookStudents: gradeReportsQuery.data ?? [],
      gradebookAi: MOCK_GRADEBOOK_AI,
      members: membersQuery.data ?? [],
      materials: materialsQuery.data?.items ?? [],
      courseTemplates: MOCK_TEMPLATES,
    };
  }, [
    classInfo,
    isClassInfoLive,
    coursesQuery.data,
    announcements,
    gradeReportsQuery.data,
    membersQuery.data,
    materialsQuery.data,
  ]);

  const refetch = useCallback(() => isStreamOverview ? refetchOverview() : refetchInfo(),
    [isStreamOverview, refetchOverview, refetchInfo]);
  const invalidateOverview = () => queryClient.invalidateQueries({ queryKey: overviewKey });
  const refreshAnnouncements = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: classDetailKeys.announcements(classId) }),
    invalidateOverview(),
  ]);

  const assignCourseMutation = useMutation({
    mutationFn: (courseId: string) => assignCourseToClass(classId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.courses(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.availableCourses(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.materials(classId) });
      void invalidateOverview();
    },
  });

  const removeCourseMutation = useMutation({
    mutationFn: (courseId: string) => removeCourseFromClass(classId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.courses(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.availableCourses(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.materials(classId) });
      void invalidateOverview();
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
      await refreshAnnouncements();
    },
  });

  const pinAnnouncementMutation = useMutation({
    mutationFn: ({ announcementId, pin }: { announcementId: string; pin: boolean }) =>
      pinClassAnnouncement(classId, announcementId, pin),
    onSuccess: refreshAnnouncements,
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (announcementId: string) =>
      deleteClassAnnouncement(classId, announcementId),
    onSuccess: refreshAnnouncements,
  });

  const approveMemberMutation = useMutation({
    mutationFn: (userId: string) => approveMember(classId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.members(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.info(classId) });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      void invalidateOverview();
    },
  });

  const rejectMemberMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      rejectMember(classId, userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.members(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      void invalidateOverview();
    },
  });

  const leaveClassMutation = useMutation({
    mutationFn: () => leaveClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.detail(classId) });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeMember(classId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.members(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
      void invalidateOverview();
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'TEACHER' | 'STUDENT' }) =>
      updateMemberRole(classId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.members(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
      void invalidateOverview();
    },
  });

  const inviteTeacherMutation = useMutation({
    mutationFn: (email: string) => inviteMemberByEmail(classId, email, 'TEACHER'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.members(classId) });
      queryClient.invalidateQueries({ queryKey: classDetailKeys.stats(classId) });
      void invalidateOverview();
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: (payload: Partial<UpdateClassRequest>) => updateClass(classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classDetailKeys.info(classId) });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      void invalidateOverview();
    },
  });

  const assignmentsCount =
    !isStreamOverview && statsQuery.data?.pendingAssignmentsCount !== undefined
      ? statsQuery.data.pendingAssignmentsCount
      : assignmentsQuery.isFetched || examsQuery.isFetched
        ? (assignmentsQuery.data?.length ?? 0) + (examsQuery.data?.length ?? 0)
        : undefined;

  return {
    data,
    overview,
    bannerStats,
    sessionsCount: isStreamOverview ? overview?.sessionsCount : statsQuery.data?.sessionsCount,
    assignmentsCount,
    availableCourses: availableCoursesQuery.data ?? [],
    assignments: assignmentsQuery.data ?? [],
    exams: examsQuery.data ?? [],
    isLoading: isStreamOverview ? overviewQuery.isPending : infoQuery.isLoading,
    isAnnouncementsLoading: !isStreamOverview && announcementsQuery.isLoading,
    announcementsError: isStreamOverview ? null : announcementsQuery.error,
    refetchAnnouncements: isStreamOverview ? refetchOverview : announcementsQuery.refetch,
    materialsCount: materialsQuery.data?.totalElements ?? 0,
    isMaterialsPreviewLoading: materialsQuery.isLoading || (activeTab === 'stream' && !loadMaterialsPreview),
    isMaterialsPreviewError: materialsQuery.isError,
    isError: isStreamOverview ? overviewQuery.isError : infoQuery.isError,
    classError: isStreamOverview ? overviewQuery.error : infoQuery.error,
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
    leaveClassMutation,
  };
}

