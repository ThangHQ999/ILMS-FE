'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useUserRole } from '@/hooks/useUserRole';
import { useAssessmentHub } from '../../hooks/useAssessmentHub';
import type { AssessmentKind } from '../../schemas/assessment-hub.schema';
import { AssessmentHubHeader } from './AssessmentHubHeader';
import { AssessmentHubKpiBar } from './AssessmentHubKpiBar';
import {
  AssessmentHubFilterBar,
  type StudentStatusTab,
  type TeacherStatusTab,
} from './AssessmentHubFilterBar';
import { AssessmentGroupList } from './AssessmentGroupList';

interface AssessmentHubPageViewProps {
  userFullName?: string;
}

export function AssessmentHubPageView({
  userFullName = '',
}: AssessmentHubPageViewProps) {
  const { isTeacher: roleIsTeacher } = useUserRole();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();

  const [mode, setMode] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const hasAutoInitializedModeRef = useRef(false);

  const [studentTab, setStudentTab] = useState<StudentStatusTab>('TODO');
  const [teacherTab, setTeacherTab] = useState<TeacherStatusTab>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [selectedKind, setSelectedKind] = useState<AssessmentKind | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const {
    teachingClasses,
    enrolledClasses,
    modeClasses,
    courses,
    isLoadingCourses,
    items,
    kpi,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    publishMutation,
  } = useAssessmentHub(mode, selectedClassId);

  // Smart default: auto-select TEACHER mode if user teaches classes and has no enrolled classes
  useEffect(() => {
    if (hasAutoInitializedModeRef.current) return;
    if (teachingClasses.length > 0 || enrolledClasses.length > 0 || roleIsTeacher) {
      hasAutoInitializedModeRef.current = true;
      if (teachingClasses.length > 0 && enrolledClasses.length === 0) {
        setMode('TEACHER');
      } else if (roleIsTeacher && enrolledClasses.length === 0) {
        setMode('TEACHER');
      } else {
        setMode('STUDENT');
      }
    }
  }, [teachingClasses.length, enrolledClasses.length, roleIsTeacher]);

  const handleModeChange = (nextMode: 'STUDENT' | 'TEACHER') => {
    setMode(nextMode);
    setSelectedClassId('ALL');
    setSelectedCourseId('ALL');
    setSelectedKind('ALL');
    setSearch('');
  };

  const handleClassChange = (nextClassId: string) => {
    setSelectedClassId(nextClassId);
    setSelectedCourseId('ALL');
  };

  const handleResetFilters = () => {
    setSelectedClassId('ALL');
    setSelectedCourseId('ALL');
    setSelectedKind('ALL');
    setSearch('');
    if (mode === 'STUDENT') setStudentTab('ALL');
    else setTeacherTab('ALL');
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Status Tab filter
      if (mode === 'STUDENT') {
        if (studentTab === 'TODO' && item.status !== 'TODO') return false;
        if (studentTab === 'OVERDUE' && item.status !== 'OVERDUE') return false;
        if (
          studentTab === 'COMPLETED' &&
          item.status !== 'SUBMITTED' &&
          item.status !== 'GRADED'
        ) {
          return false;
        }
      } else {
        if (teacherTab === 'NEEDS_GRADING' && item.status !== 'NEEDS_GRADING') return false;
        if (teacherTab === 'OPEN' && item.status !== 'OPEN') return false;
        if (teacherTab === 'DRAFT' && item.status !== 'DRAFT') return false;
        if (teacherTab === 'CLOSED' && item.status !== 'CLOSED') return false;
      }

      // 2. Cascading Course filter (when a specific class & course are selected)
      if (selectedClassId !== 'ALL' && selectedCourseId !== 'ALL') {
        if (item.courseId !== selectedCourseId) return false;
      }

      // 3. Kind filter
      if (selectedKind !== 'ALL' && item.kind !== selectedKind) return false;

      // 4. Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchClass = item.className.toLowerCase().includes(q);
        if (!matchTitle && !matchClass) return false;
      }

      return true;
    });
  }, [
    items,
    mode,
    studentTab,
    teacherTab,
    selectedClassId,
    selectedCourseId,
    selectedKind,
    search,
  ]);

  const hasFilters =
    selectedClassId !== 'ALL' ||
    selectedCourseId !== 'ALL' ||
    selectedKind !== 'ALL' ||
    search.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] flex flex-col font-sans transition-colors">
      <DashboardSidebar
        isFocus={false}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        workspaceMode={mode === 'TEACHER' ? 'faculty' : 'student'}
      />

      <DashboardHeader
        isFocus={false}
        showFocusMode={false}
        showRoleSwitcher={false}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => {}}
        userFullName={userFullName}
        workspaceMode={mode === 'TEACHER' ? 'faculty' : 'student'}
      />

      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 px-4 sm:px-8 max-w-7xl w-full mx-auto space-y-6 ${
          isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'
        }`}
      >
        <AssessmentHubHeader
          mode={mode}
          onModeChange={handleModeChange}
          teachingClasses={teachingClasses}
          enrolledClasses={enrolledClasses}
          selectedClassId={selectedClassId}
        />

        <AssessmentHubKpiBar mode={mode} kpi={kpi} />

        <AssessmentHubFilterBar
          mode={mode}
          studentTab={studentTab}
          onStudentTabChange={setStudentTab}
          teacherTab={teacherTab}
          onTeacherTabChange={setTeacherTab}
          kpi={kpi}
          classes={modeClasses}
          selectedClassId={selectedClassId}
          onClassChange={handleClassChange}
          courses={courses}
          isLoadingCourses={isLoadingCourses}
          selectedCourseId={selectedCourseId}
          onCourseChange={setSelectedCourseId}
          selectedKind={selectedKind}
          onKindChange={setSelectedKind}
          search={search}
          onSearchChange={setSearch}
          onResetFilters={handleResetFilters}
        />

        <AssessmentGroupList
          mode={mode}
          items={filteredItems}
          totalBeforeFilter={items.length}
          hasFilters={hasFilters}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error}
          onRetry={refetch}
          onResetFilters={handleResetFilters}
          isPublishing={publishMutation.isPending}
          onPublish={(kind, id) => {
            publishMutation.mutate(
              { kind, id },
              {
                onSuccess: () => toast.success('Đã công bố cho học viên!'),
                onError: () => toast.error('Không thể công bố lúc này.'),
              }
            );
          }}
        />
      </main>
    </div>
  );
}
