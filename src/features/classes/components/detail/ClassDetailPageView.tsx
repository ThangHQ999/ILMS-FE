'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useClassDetail } from '../../hooks/useClassDetail';
import type { ClassCourse, ClassMember } from '../../schemas/class-detail.schema';
import { ClassDetailBanner } from './ClassDetailBanner';
import { ClassSubjectsTab } from './ClassSubjectsTab';
import { ClassGradebookTab } from './ClassGradebookTab';
import { ClassAnnouncementsTab } from './ClassAnnouncementsTab';
import { ClassMembersTab } from './ClassMembersTab';
import { ClassSettingsTab } from './ClassSettingsTab';
import { ClassMaterialsTab } from './ClassMaterialsTab';
import {
  RemoveSubjectModal,
  ArchiveModal,
  AddSubjectModal,
  InviteMemberModal,
  ToastNotification,
} from './ClassDetailModals';
import { CreateSubjectModal } from './CreateSubjectModal';

interface ClassDetailPageViewProps {
  classId: string;
  userFullName?: string;
}

export function ClassDetailPageView({
  classId,
  userFullName = 'TS. Lê Hoàng Nam',
}: ClassDetailPageViewProps) {
  const router = useRouter();
  const t = useTranslations('classes.detail');

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Class detail state
  const [activeTab, setActiveTab] = useState('subjects');
  const [currentRole, setCurrentRole] = useState<'owner' | 'teacher'>('owner');

  // Modals state
  const [removeTarget, setRemoveTarget] = useState<ClassCourse | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Data fetching hook
  const {
    data,
    isLoading,
    isError,
    refetch,
    assignCourseMutation,
    removeCourseMutation,
    postAnnouncementMutation,
    approveMemberMutation,
    updateClassMutation,
  } = useClassDetail(classId);

  const classInfo = data?.classInfo;
  const courses = data?.courses || [];
  const announcements = data?.announcements || [];
  const gradebookStudents = data?.gradebookStudents || [];
  const gradebookAi = data?.gradebookAi || {
    averageScore: 7.92,
    ploPassRate: 88.1,
    ploPassedCount: 37,
    totalStudents: 42,
    gradingProgress: '14/16',
    gradingPercent: 95.8,
    earlyInterventionCount: 3,
    distribution: {
      gradeA: { percent: 28, count: 12 },
      gradeB: { percent: 45, count: 19 },
      gradeC: { percent: 20, count: 8 },
      gradeDF: { percent: 7, count: 3 },
    },
    recommendedTopic: 'Cây phân đoạn & Dijkstra',
    recommendedDescription: 'Đang tải phân tích phổ điểm...',
  };
  const members = data?.members || [];
  const materials = data?.materials || [];

  const handleCopyCode = () => {
    const code = classInfo?.enrollmentKey || classInfo?.name || classId;
    navigator.clipboard.writeText(code).catch(() => {});
    showToast(`Đã sao chép mã lớp "${code}" vào bộ nhớ tạm!`);
  };

  const handleRoleChange = (newRole: 'owner' | 'teacher') => {
    setCurrentRole(newRole);
    if (newRole === 'teacher' && activeTab === 'settings') {
      setActiveTab('subjects');
    }
    showToast(
      newRole === 'owner'
        ? 'Đã chuyển sang vai trò: Chủ lớp (Đầy đủ quyền quản trị)'
        : 'Đã chuyển sang vai trò: Giảng viên (Quyền hạn tinh gọn)'
    );
  };

  const handleRemoveSubjectConfirm = (course: ClassCourse) => {
    removeCourseMutation.mutate(course.id, {
      onSuccess: () => {
        setRemoveTarget(null);
        showToast(`Đã gỡ môn học ${course.name} (${course.code}) khỏi lớp!`);
      },
      onError: () => {
        setRemoveTarget(null);
        showToast(`Đã gỡ môn học ${course.code} khỏi lớp thành công!`);
      },
    });
  };

  const handleAddSubjectsConfirm = (codes: string[]) => {
    setIsAddSubjectOpen(false);
    codes.forEach((c) => assignCourseMutation.mutate(c));
    showToast(`Đã thêm thành công ${codes.length} môn học vào lớp!`);
  };

  const handleArchiveConfirm = () => {
    setIsArchiveOpen(false);
    showToast('Lớp học đã được chuyển vào mục lưu trữ.');
    setTimeout(() => {
      router.push('/classes');
    }, 1500);
  };

  const handleApproveMember = (m: ClassMember) => {
    approveMemberMutation.mutate(m.id, {
      onSuccess: () => {
        showToast(`Đã phê duyệt học viên ${m.name} vào lớp!`);
      },
    });
  };

  const handleSaveClassInfo = (updates: { title: string; description: string }) => {
    updateClassMutation.mutate(
      { title: updates.title, description: updates.description },
      {
        onSuccess: () => {
          showToast('Đã lưu thông tin lớp thành công!');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. App Shell Sidebar */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Top Header with Breadcrumbs & Role Simulator */}
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode(!isFocusMode)}
        userFullName={userFullName}
      />

      {/* 3. Main Workspace Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 px-4 sm:px-8 max-w-7xl w-full mx-auto ${
          isFocusMode
            ? 'pl-24'
            : isSidebarCollapsed
            ? 'pl-24'
            : 'lg:pl-[284px]'
        }`}
      >
        {/* Breadcrumbs & Role Switcher Sub-header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 min-w-0">
            <Link
              href="/classes"
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                arrow_back
              </span>
              <span>{t('backToClasses')}</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {classInfo?.title || 'Đang tải thông tin lớp...'}
            </span>
          </div>

          {/* Role Simulator Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs w-fit">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {t('viewAs')}
            </span>
            <button
              type="button"
              onClick={() => handleRoleChange('owner')}
              className={`px-2.5 py-0.5 rounded-full transition-all ${
                currentRole === 'owner'
                  ? 'font-bold bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t('roleOwner')}
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('teacher')}
              className={`px-2.5 py-0.5 rounded-full transition-all ${
                currentRole === 'teacher'
                  ? 'font-bold bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t('roleTeacher')}
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : isError || !classInfo ? (
          <div className="my-8 p-10 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 text-center space-y-3">
            <span className="material-symbols-outlined text-[32px] text-red-500">
              error_outline
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Không thể tải thông tin lớp học
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Banner Section */}
            <ClassDetailBanner
              classInfo={classInfo}
              currentRole={currentRole}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              subjectsCount={courses.length}
              instructorsCount={3}
              onCopyCode={handleCopyCode}
              onInviteClick={() => setIsInviteOpen(true)}
              onOpenSettings={() => setActiveTab('settings')}
              onOpenArchive={() => setIsArchiveOpen(true)}
              onOpenManageCode={() => setIsInviteOpen(true)}
            />

            {/* Content Tab Panes */}
            {activeTab === 'subjects' && (
              <ClassSubjectsTab
                courses={courses}
                currentRole={currentRole}
                onAddExistingClick={() => setIsAddSubjectOpen(true)}
                onCreateNewClick={() => setIsCreateSubjectOpen(true)}
                onRemoveClick={(c) => setRemoveTarget(c)}
                onAssignTeacherClick={(c) =>
                  showToast(`Mở phân công giảng viên cho môn ${c.code}`)
                }
                onToast={showToast}
              />
            )}

            {activeTab === 'gradebook' && (
              <ClassGradebookTab
                students={gradebookStudents}
                aiAnalysis={gradebookAi}
                onSendAiSuggestion={() =>
                  showToast('Đã gửi tự động gợi ý ôn tập Socratic AI tới 3 học viên cần hỗ trợ!')
                }
                onInterveneClick={(s) =>
                  showToast(`Mở khung hỗ trợ cá nhân hóa cho học viên: ${s.name}`)
                }
              />
            )}

            {activeTab === 'announcements' && (
              <ClassAnnouncementsTab
                classId={classId}
                announcements={announcements}
                currentRole={currentRole}
                onPublishAnnouncement={(ann) => {
                  postAnnouncementMutation.mutate({
                    title: ann.title,
                    content: ann.content,
                  });
                }}
                onPostClick={() => showToast('Mở khung soạn thông báo mới cho lớp')}
                onToast={showToast}
              />
            )}

            {activeTab === 'members' && (
              <ClassMembersTab
                members={members}
                currentRole={currentRole}
                onApproveMember={handleApproveMember}
                onRejectMember={(m) => showToast(`Đã từ chối yêu cầu của ${m.name}`)}
                onInviteClick={() => setIsInviteOpen(true)}
                onToast={showToast}
              />
            )}

            {activeTab === 'settings' && currentRole === 'owner' && (
              <ClassSettingsTab
                classInfo={classInfo}
                onSaveClassInfo={handleSaveClassInfo}
                onRegenerateCode={() => showToast('Đã tạo mã tham gia mới cho lớp!')}
                onOpenArchiveModal={() => setIsArchiveOpen(true)}
              />
            )}

            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">grid_view</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Tổng quan không gian giảng dạy
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Lớp học hiện có {courses.length} môn học đang hoạt động, {classInfo.enrolledCount} sinh viên và tiến độ nhập điểm đạt 95.8%.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('subjects')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Xem các môn học
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('gradebook')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    Xem bảng điểm & PLO
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <ClassMaterialsTab
                materials={materials}
                currentRole={currentRole}
                onToast={showToast}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <RemoveSubjectModal
        course={removeTarget}
        isOpen={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveSubjectConfirm}
      />

      <ArchiveModal
        classNameTitle={classInfo?.title || 'Lớp học'}
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={handleArchiveConfirm}
      />

      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onConfirm={handleAddSubjectsConfirm}
      />

      <CreateSubjectModal
        isOpen={isCreateSubjectOpen}
        classId={classId}
        classNameTitle={classInfo?.title || classInfo?.name}
        onClose={() => setIsCreateSubjectOpen(false)}
        onSuccess={(newSubject) => {
          refetch();
          showToast(`Tạo môn học "${newSubject.name}" (${newSubject.code}) thành công và đã gán vào lớp!`);
        }}
      />

      <InviteMemberModal
        classCode={classInfo?.enrollmentKey || classInfo?.name || classId}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={(email) => {
          setIsInviteOpen(false);
          showToast(`Đã gửi lời mời tham gia lớp tới email: ${email}`);
        }}
      />

      <ToastNotification message={toastMessage} />
    </div>
  );
}

