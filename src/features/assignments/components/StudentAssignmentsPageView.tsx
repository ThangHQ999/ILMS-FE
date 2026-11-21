'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useClassDetail } from '@/features/classes/hooks/useClassDetail';
import { ClassDetailBanner } from '@/features/classes/components/detail/ClassDetailBanner';
import { useUserRole } from '@/hooks/useUserRole';
import { useClassHubInfo } from '../hooks/useClassHubInfo';
import { StudentAssignmentsTableView } from './StudentAssignmentsTableView';
import { TeacherAssignmentsTableView } from './TeacherAssignmentsTableView';

interface StudentAssignmentsPageViewProps {
  classId: string;
  userFullName?: string;
}

export function StudentAssignmentsPageView({
  classId,
  userFullName = 'Học viên ILMS',
}: StudentAssignmentsPageViewProps) {
  const router = useRouter();
  const t = useTranslations('assignments.student');
  const tClass = useTranslations('classes.detail');

  // Shell Layout States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Fetch Class Info from unified class registry (same source as /classes and /classes/[id])
  const { data: classDetailData } = useClassDetail(classId);
  const { data: hubInfo } = useClassHubInfo(classId);

  const classInfo = classDetailData?.classInfo;
  const classTitle =
    classInfo?.title ||
    hubInfo?.title ||
    (classId === 'csdl-k22-01' ? 'Cơ sở dữ liệu — Nhóm 01' : 'Đang tải thông tin lớp...');
  const classCode =
    classInfo?.name ||
    classInfo?.enrollmentKey ||
    hubInfo?.courseCode ||
    (classId === 'csdl-k22-01' ? 'CSDL-K22-01' : 'CS-202');


  const { isTeacher } = useUserRole();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Left Sidebar */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        workspaceMode="student"
      />

      {/* 2. Top Header */}
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode((prev) => !prev)}
        userFullName={userFullName}
        workspaceMode="student"
      />

      {/* 3. Main Workspace Area: Properly offset from sidebar */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 max-w-7xl w-full mx-auto space-y-6 pr-4 sm:pr-8 ${
          isFocusMode || isSidebarCollapsed ? 'pl-24' : 'pl-4 lg:pl-[296px]'
        }`}
      >
        {/* Top Breadcrumb & Back Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link
              href="/classes"
              className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">arrow_back</span>
              <span>{tClass('backToClasses')}</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Link
              href={`/classes/${classId}?tab=assignments`}
              className="font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {classTitle}
            </Link>
          </div>
        </div>

        {/* Class Banner matching ClassDetailPageView */}
        {classDetailData?.classInfo && (
          <ClassDetailBanner
            classInfo={classDetailData.classInfo}
            currentRole={isTeacher ? 'teacher' : 'student'}
            canManageClass={isTeacher}
            isCompact={true}
            activeTab="assignments"
            onTabChange={(tab) => {
              router.push(`/classes/${classId}?tab=${tab}`);
            }}
            subjectsCount={4}
            instructorsCount={3}
            onCopyCode={() => {
              navigator.clipboard?.writeText(classCode).catch(() => {});
            }}
            onInviteClick={() => {}}
            onOpenSettings={() => {
              router.push(`/classes/${classId}?tab=settings`);
            }}
            onOpenArchive={() => {}}
            onOpenManageCode={() => {}}
          />
        )}

        {/* Assignments Table Workspace: Dynamic by Role */}
        {isTeacher ? (
          <TeacherAssignmentsTableView
            classId={classId}
            className={classCode || classTitle}
          />
        ) : (
          <StudentAssignmentsTableView
            classId={classId}
            onViewAssignment={(id) => {
              router.push(`/classes/${classId}/assignments/${id}`);
            }}
          />
        )}
      </main>
    </div>
  );
}
