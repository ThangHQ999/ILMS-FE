'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUserRole } from '@/hooks/useUserRole';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useClassDetail } from '../../hooks/useClassDetail';
import type { ClassCourse, ClassMember } from '../../schemas/class-detail.schema';
import { ClassDetailBanner } from './ClassDetailBanner';
import { ClassSubjectsTab } from './ClassSubjectsTab';
import { TeacherGradeReportsTableView } from './TeacherGradeReportsTableView';
import { ClassAnnouncementsTab } from './ClassAnnouncementsTab';
import { ClassMembersTab } from './ClassMembersTab';
import { ClassSettingsTab } from './ClassSettingsTab';
import { ClassMaterialsTab } from './ClassMaterialsTab';
import { ClassStreamTab } from './ClassStreamTab';
import { StudentGradeReportView } from './StudentGradeReportView';
import {
  StudentAssignmentsTableView,
  StudentExamDetailView,
  TeacherAssignmentsTableView,
  TeacherCreateAssignmentFormView,
  TeacherEditAssignmentFormView,
  TeacherCreateExamFormView,
  TeacherEditExamFormView,
  TeacherExamDetailView,
  useClassAssignmentsWithSubmissions,
  evaluateCanManageClassExams,
} from '@/features/assignments';
import {
  RemoveSubjectModal,
  ArchiveModal,
  AddSubjectModal,
  InviteMemberModal,
  CreateAnnouncementModal,
  ToastNotification,
} from './ClassDetailModals';
import { CreateSubjectModal } from './CreateSubjectModal';

interface ClassDetailPageViewProps {
  classId: string;
  userFullName?: string;
}

const VALID_CLASS_TABS = [
  'stream',
  'overview',
  'subjects',
  'assignments',
  'announcements',
  'people',
  'members',
  'gradebook',
  'materials',
  'settings',
] as const;
type ClassTabId = (typeof VALID_CLASS_TABS)[number];

export function ClassDetailPageView({
  classId,
  userFullName = 'TS. Lê Hoàng Nam',
}: ClassDetailPageViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('classes.detail');

  // Global user role hook (real-time reactive across app)
  const { user: currentUser, activeRole, switchRole, isLoading: isUserRoleLoading } = useUserRole();

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Local teacher sub-role state
  const [localTeacherRole, setLocalTeacherRole] = useState<'teacher' | 'owner'>('owner');

  // Compute effectiveRole synchronously during render:
  // When activeRole is STUDENT, effectiveRole is GUARANTEED to be 'student'
  // When activeRole is TEACHER, effectiveRole is localTeacherRole ('teacher' or 'owner')
  const effectiveRole: 'student' | 'teacher' | 'owner' =
    activeRole === 'STUDENT' ? 'student' : localTeacherRole;

  const isStudent = effectiveRole === 'student';
  const isClassManager = !isStudent;

  // Class detail state: synchronize tab with query param
  const tabFromQuery = searchParams.get('tab');
  const isValidQueryTab = Boolean(
    tabFromQuery && VALID_CLASS_TABS.includes(tabFromQuery as ClassTabId)
  );
  const [activeTab, setActiveTab] = useState<string>(
    isValidQueryTab ? (tabFromQuery as string) : 'stream'
  );

  useEffect(() => {
    if (tabFromQuery && VALID_CLASS_TABS.includes(tabFromQuery as ClassTabId)) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  // If switched to student while on teacher-only settings tab, redirect to stream tab
  useEffect(() => {
    if (effectiveRole === 'student' && activeTab === 'settings') {
      setActiveTab('stream');
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'stream');
      router.replace(`/classes/${classId}?${params.toString()}`, { scroll: false });
    }
  }, [effectiveRole, activeTab, classId, router, searchParams]);

  const handleTabChange = useCallback(
    (newTab: string) => {
      if (!VALID_CLASS_TABS.includes(newTab as ClassTabId)) return;
      setActiveTab(newTab);
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', newTab);
      if (newTab !== 'assignments') {
        params.delete('page');
        params.delete('search');
        params.delete('action');
        params.delete('assignmentId');
        params.delete('examId');
      } else {
        // If clicking assignments tab explicitly, clear action to return to list view
        params.delete('action');
      }
      router.replace(`/classes/${classId}?${params.toString()}`, { scroll: false });
    },
    [classId, router, searchParams]
  );

  const actionParam = searchParams.get('action');
  const subtabParam = searchParams.get('subtab');

  const isCreateAssignment =
    activeTab === 'assignments' && actionParam === 'create' && subtabParam !== 'exams';
  const isCreateExam =
    activeTab === 'assignments' &&
    (actionParam === 'create-exam' || (actionParam === 'create' && subtabParam === 'exams'));
  const isCreateForm = isClassManager && (isCreateAssignment || isCreateExam);

  // Modals state
  const [removeTarget, setRemoveTarget] = useState<ClassCourse | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Fetch Class Detail via TanStack Query
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
  const resolvedClassId = classInfo?.id || classId;
  const { assignments: classAssignmentsList } = useClassAssignmentsWithSubmissions(resolvedClassId);
  const totalClassAssignmentsCount = classAssignmentsList?.length ?? 0;

  const courses = data?.courses || [];
  const announcements = data?.announcements || [];
  const members = data?.members || [];
  const materials = data?.materials || [];

  const handleRemoveSubjectConfirm = (course: ClassCourse) => {
    removeCourseMutation.mutate(course.id, {
      onSuccess: () => {
        setRemoveTarget(null);
        showToast(`Đã gỡ môn học ${course.name} (${course.code}) khỏi lớp!`);
      },
      onError: () => {
        setRemoveTarget(null);
        showToast(`Lỗi khi gỡ môn học ${course.name}!`);
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

  const canManageClassExams = evaluateCanManageClassExams({
    classId: resolvedClassId,
    isStudentView: isStudent,
    isDemoTeacherView: isClassManager,
    isAuthLoading: isUserRoleLoading,
    isClassLoading: isLoading,
    isClassError: isError,
    isClassInfoLive: data?.isClassInfoLive,
    isMembersLive: data?.isMembersLive,
    user: currentUser,
    classInfo,
    members,
  });

  const teacherClassSubtitle =
    classInfo?.title && classInfo?.name && classInfo.title !== classInfo.name
      ? `${classInfo.title} (${classInfo.name})`
      : classInfo?.title || classInfo?.name || '';

  // Synchronize document title with current create form or class view
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isCreateAssignment) {
        document.title = `Tạo bài tập | ILMS - ${classInfo?.title || classId}`;
      } else if (isCreateExam) {
        document.title = `Tạo bài thi | ILMS - ${classInfo?.title || classId}`;
      } else if (classInfo?.title) {
        document.title = `${classInfo.title} | ILMS`;
      }
    }
  }, [isCreateAssignment, isCreateExam, classInfo?.title, classId]);

  const handleCopyCode = () => {
    const code = classInfo?.enrollmentKey || classInfo?.name || classId;
    navigator.clipboard.writeText(code).catch(() => {});
    showToast(`Đã sao chép mã lớp "${code}" vào bộ nhớ tạm!`);
  };

  const handleRoleChange = (newRole: 'student' | 'teacher' | 'owner') => {
    if (newRole === 'student') {
      switchRole('STUDENT');
      if (activeTab === 'settings') {
        handleTabChange('stream');
      }
    } else {
      switchRole('TEACHER');
      setLocalTeacherRole(newRole);
    }
    showToast(
      newRole === 'owner'
        ? 'Đã chuyển sang vai trò: Chủ lớp (Đầy đủ quyền quản trị)'
        : newRole === 'teacher'
        ? 'Đã chuyển sang vai trò: Giảng viên (Quyền hạn tinh gọn)'
        : 'Đã chuyển sang vai trò: Học viên (Giao diện học tập cá nhân)'
    );
  };

  // Socratic AI Tutor popover state
  const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<
    Array<{ sender: 'ai' | 'user'; text: string }>
  >([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ giảng Socratic AI được đồng bộ với đề cương bài giảng của TS. Lê Hoàng Nam. Bạn đang vướng mắc ở phần nào trong Lab 01 hoặc kiến thức TCP/IP hôm nay?',
    },
  ]);
  const [aiInputText, setAiInputText] = useState('');

  const handleAskAi = (question: string) => {
    setAiChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: question },
      {
        sender: 'ai',
        text: question.includes('TCP')
          ? 'TCP cần 3 bước bắt tay (SYN, SYN-ACK, ACK) để cả hai bên Máy khách và Máy chủ cùng xác nhận được khả năng Gửi và Nhận của nhau, đồng thời đồng bộ hóa số thứ tự Sequence Number ngẫu nhiên ban đầu (ISN), ngăn chặn các gói tin trùng lặp cũ từ phiên trước gây nhầm lẫn.'
          : 'Thuật toán Dijkstra tìm cây đường đi ngắn nhất (SPF Tree) từ một router gốc đến toàn bộ mạng. Mỗi router chạy Dijkstra độc lập dựa trên cơ sở dữ liệu trạng thái liên kết (LSDB) nhận được từ các gói LSA trong vùng OSPF.',
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafe] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        workspaceMode={effectiveRole === 'student' ? 'student' : 'faculty'}
      />

      {/* 2. Top Header with Breadcrumbs & Role Simulator */}
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode(!isFocusMode)}
        userFullName={userFullName}
        workspaceMode={effectiveRole === 'student' ? 'student' : 'faculty'}
      />

      {/* 3. Main Workspace Area */}
      <main
        className={`flex-1 min-w-0 transition-all duration-300 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto ${
          isFocusMode
            ? 'pl-24'
            : isSidebarCollapsed
            ? 'pl-24'
            : 'lg:pl-[284px]'
        }`}
      >
        {/* Breadcrumbs & Role Switcher Sub-header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 min-w-0 flex-wrap">
            <Link
              href="/classes"
              className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>{t('backToClasses')}</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            {isCreateAssignment ? (
              <>
                <Link
                  href={`/classes/${classId}?tab=assignments`}
                  className="font-medium hover:text-blue-600 dark:hover:text-blue-400 truncate flex items-center gap-1.5 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {classInfo?.title || 'Đang tải thông tin lớp...'}
                </Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Tạo bài tập
                </span>
              </>
            ) : activeTab === 'assignments' && searchParams.get('action') === 'edit' ? (
              <>
                <Link
                  href={`/classes/${classId}?tab=assignments`}
                  className="font-medium hover:text-blue-600 dark:hover:text-blue-400 truncate flex items-center gap-1.5 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {classInfo?.title || 'Đang tải thông tin lớp...'}
                </Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Sửa bài tập
                </span>
              </>
            ) : isCreateExam ? (
              <>
                <Link
                  href={`/classes/${classId}?tab=assignments&subtab=exams`}
                  className="font-medium hover:text-blue-600 dark:hover:text-blue-400 truncate flex items-center gap-1.5 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {classInfo?.title || 'Đang tải thông tin lớp...'}
                </Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Tạo bài thi
                </span>
              </>
            ) : activeTab === 'assignments' && searchParams.get('action') === 'edit-exam' ? (
              <>
                <Link
                  href={`/classes/${classId}?tab=assignments&subtab=exams`}
                  className="font-medium hover:text-blue-600 dark:hover:text-blue-400 truncate flex items-center gap-1.5 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {classInfo?.title || 'Đang tải thông tin lớp...'}
                </Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Sửa bài thi
                </span>
              </>
            ) : activeTab === 'assignments' && searchParams.get('action') === 'exam-detail' ? (
              <>
                <Link
                  href={`/classes/${classId}?tab=assignments&subtab=exams`}
                  className="font-medium hover:text-blue-600 dark:hover:text-blue-400 truncate flex items-center gap-1.5 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {classInfo?.title || 'Đang tải thông tin lớp...'}
                </Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Chi tiết bài thi
                </span>
              </>
            ) : (
              <span className="font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {classInfo?.title || 'Đang tải thông tin lớp...'}
              </span>
            )}
          </div>

          {/* Role Simulator Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs w-fit">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {t('viewAs')}
            </span>
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                effectiveRole === 'student'
                  ? 'font-bold bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Học viên
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('teacher')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                effectiveRole === 'teacher'
                  ? 'font-bold bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Giảng viên
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('owner')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                effectiveRole === 'owner'
                  ? 'font-bold bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Chủ lớp
            </button>
          </div>
        </div>

        {/* Sub-Tab Toggle [Bài tập] vs [Bài thi] right under Breadcrumb on Create Assignment & Create Exam screens */}
        {isCreateForm && (
          <div className="flex items-center mb-6">
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700/80">
              <Link
                href={`/classes/${classId}?tab=assignments&action=create`}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isCreateExam
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">assignment</span>
                <span>Bài tập</span>
              </Link>
              <Link
                href={`/classes/${classId}?tab=assignments&action=create&subtab=exams`}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCreateExam
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">quiz</span>
                <span>Bài thi</span>
              </Link>
            </div>
          </div>
        )}

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-850 animate-pulse" />
            <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-850 animate-pulse" />
          </div>
        ) : isError || !classInfo ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/40 p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">error</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('errorLoadingClass')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('errorLoadingClassDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {t('retryButton')}
            </button>
          </div>
        ) : (
          <div className="space-y-6 min-w-0 w-full">
            {/* Banner Section: shown on all tabs and assignments list, hidden only when creating or editing an assignment/exam */}
            {!(
              activeTab === 'assignments' &&
              (isCreateAssignment ||
                isCreateExam ||
                actionParam === 'edit' ||
                actionParam === 'edit-exam' ||
                actionParam === 'exam-detail')
            ) && (
              <ClassDetailBanner
                classInfo={classInfo}
                currentRole={effectiveRole}
                canManageClass={isClassManager}
                isCompact={false}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                subjectsCount={courses.length}
                assignmentsCount={totalClassAssignmentsCount}
                instructorsCount={3}
                onCopyCode={handleCopyCode}
                onInviteClick={() => setIsInviteOpen(true)}
                onOpenSettings={() => handleTabChange('settings')}
                onOpenArchive={() => setIsArchiveOpen(true)}
                onOpenManageCode={() => setIsInviteOpen(true)}
              />
            )}

            {/* Content Tab Panes */}
            {(activeTab === 'stream' || activeTab === 'overview') && (
              <ClassStreamTab
                classInfo={classInfo}
                currentRole={effectiveRole}
                onNavigateTab={handleTabChange}
                onOpenCreateAnnouncement={() => setIsCreateAnnouncementOpen(true)}
                onToast={showToast}
              />
            )}

            {(activeTab === 'subjects' || activeTab === 'modules') && (
              <ClassSubjectsTab
                courses={courses}
                currentRole={effectiveRole}
                onAddExistingClick={() => setIsAddSubjectOpen(true)}
                onCreateNewClick={() => setIsCreateSubjectOpen(true)}
                onRemoveClick={(c) => setRemoveTarget(c)}
                onAssignTeacherClick={(c) =>
                  showToast(`Mở phân công giảng viên cho môn ${c.code}`)
                }
              />
            )}

            {activeTab === 'assignments' && (
              isClassManager ? (
                isCreateAssignment ? (
                  <TeacherCreateAssignmentFormView
                    classId={resolvedClassId}
                    className={classInfo?.name || classInfo?.title || 'CNTT-K22-01'}
                    onCancel={() => {
                      router.push(`/classes/${classId}?tab=assignments`);
                    }}
                    onSuccess={() => {
                      router.push(`/classes/${classId}?tab=assignments`);
                    }}
                    onToast={showToast}
                  />
                ) : searchParams.get('action') === 'edit' ? (
                  <TeacherEditAssignmentFormView
                    classId={resolvedClassId}
                    assignmentId={searchParams.get('assignmentId') || ''}
                    className={classInfo?.name || classInfo?.title || 'CNTT-K22-01'}
                    onCancel={() => {
                      router.push(`/classes/${classId}?tab=assignments`);
                    }}
                    onSuccess={() => {
                      router.push(`/classes/${classId}?tab=assignments`);
                    }}
                    onToast={showToast}
                  />
                ) : isCreateExam && canManageClassExams ? (
                  <TeacherCreateExamFormView
                    classId={resolvedClassId}
                    className={teacherClassSubtitle}
                    onCancel={() => {
                      router.push(`/classes/${classId}?tab=assignments&subtab=exams`);
                    }}
                    onSuccess={() => {
                      router.push(`/classes/${classId}?tab=assignments&subtab=exams`);
                    }}
                    onToast={showToast}
                  />
                ) : searchParams.get('action') === 'edit-exam' && canManageClassExams ? (
                  <TeacherEditExamFormView
                    classId={resolvedClassId}
                    examId={searchParams.get('examId') || ''}
                    className={teacherClassSubtitle}
                    onCancel={() => {
                      router.push(`/classes/${classId}?tab=assignments&subtab=exams`);
                    }}
                    onSuccess={() => {
                      router.push(`/classes/${classId}?tab=assignments&subtab=exams`);
                    }}
                    onToast={showToast}
                  />
                ) : searchParams.get('action') === 'exam-detail' ? (
                  <TeacherExamDetailView
                    classId={resolvedClassId}
                    examId={searchParams.get('examId') || ''}
                    className={teacherClassSubtitle}
                    onBack={() => {
                      router.push(`/classes/${classId}?tab=assignments&subtab=exams`);
                    }}
                    onEditExam={(id) => {
                      router.push(`/classes/${classId}?tab=assignments&subtab=exams&action=edit-exam&examId=${id}`);
                    }}
                    onToast={showToast}
                  />
                ) : (
                  <TeacherAssignmentsTableView
                    classId={resolvedClassId}
                    routeClassId={classId}
                    className={teacherClassSubtitle}
                    canManageExams={canManageClassExams}
                    onToast={showToast}
                    onCreateAssignment={() => {
                      router.push(`/classes/${classId}?tab=assignments&action=create`);
                    }}
                    onEditAssignment={(item) => {
                      router.push(`/classes/${classId}?tab=assignments&action=edit&assignmentId=${item.id}`);
                    }}
                    onCreateExam={() => {
                      router.push(`/classes/${classId}?tab=assignments&subtab=exams&action=create`);
                    }}
                    onEditExam={(examId) => {
                      router.push(`/classes/${classId}?tab=assignments&subtab=exams&action=edit-exam&examId=${examId}`);
                    }}
                    onViewExam={(examId) => {
                      router.push(`/classes/${classId}?tab=assignments&subtab=exams&action=exam-detail&examId=${examId}`);
                    }}
                  />
                )
              ) : (
                searchParams.get('action') === 'exam-detail' ? (
                  <StudentExamDetailView
                    classId={resolvedClassId}
                    examId={searchParams.get('examId') || ''}
                    className={classInfo?.name || classInfo?.title || 'CNTT-K22-01'}
                    onBack={() => {
                      router.push(`/classes/${classId}?tab=assignments&subtab=exams`);
                    }}
                  />
                ) : (
                  <StudentAssignmentsTableView
                    classId={resolvedClassId}
                    routeClassId={classId}
                    className={
                      classInfo?.title && classInfo?.name && classInfo.title !== classInfo.name
                        ? `${classInfo.title} (${classInfo.name})`
                        : classInfo?.title || classInfo?.name || ''
                    }
                    onViewAssignment={(assignmentId) => {
                      router.push(`/classes/${classId}/assignments/${assignmentId}`);
                    }}
                    onViewExam={(examId) => {
                      router.push(
                        `/classes/${classId}?tab=assignments&subtab=exams&action=exam-detail&examId=${examId}`
                      );
                    }}
                  />
                )
              )
            )}

            {activeTab === 'gradebook' && (
              isStudent ? (
                <StudentGradeReportView classId={classInfo?.id || classId} />
              ) : (
                <TeacherGradeReportsTableView
                  classId={classInfo?.id || classId}
                  onToast={showToast}
                />
              )
            )}

            {(activeTab === 'people' || activeTab === 'members') && (
              <ClassMembersTab
                members={members}
                currentRole={effectiveRole}
                classCode={classInfo?.name || classInfo?.enrollmentKey || 'CS-202'}
                onApproveMember={handleApproveMember}
                onRejectMember={(m) => showToast(`Đã từ chối yêu cầu của ${m.name}`)}
                onInviteClick={() => setIsInviteOpen(true)}
                onToast={showToast}
              />
            )}

            {activeTab === 'settings' && effectiveRole !== 'student' && (
              <ClassSettingsTab
                classInfo={classInfo}
                onSaveClassInfo={handleSaveClassInfo}
                onRegenerateCode={() => showToast('Đã tạo mã lớp tự ghi danh mới!')}
                onOpenArchiveModal={() => setIsArchiveOpen(true)}
                onDeleteSuccess={() => {
                  showToast('Lớp học đã được xóa vĩnh viễn khỏi hệ thống!');
                  router.push('/classes');
                }}
              />
            )}

            {activeTab === 'announcements' && (
              <ClassAnnouncementsTab
                classId={classId}
                announcements={announcements}
                currentRole={effectiveRole}
                onPublishAnnouncement={(ann) => {
                  postAnnouncementMutation.mutate({
                    title: ann.title,
                    content: ann.content,
                  });
                }}
                onPostClick={() => setIsCreateAnnouncementOpen(true)}
                onToast={showToast}
              />
            )}

            {activeTab === 'materials' && (
              <ClassMaterialsTab
                materials={materials}
                currentRole={effectiveRole}
                onToast={showToast}
              />
            )}
          </div>
        )}
      </main>

      {/* Socratic AI Tutor Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsAiPopoverOpen((prev) => !prev)}
          className="flex items-center gap-3 pl-4 pr-5 py-2.5 bg-slate-900 dark:bg-slate-950 text-white rounded-full shadow-2xl border-[3px] border-blue-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
          </span>
          <span className="material-symbols-outlined text-blue-300 text-[22px]">psychology</span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight">Socratic AI Tutor</span>
            <span className="text-[10px] text-blue-300 leading-none">Context Aware RAG</span>
          </div>
        </button>
      </div>

      {/* Socratic AI Tutor Popover Panel with 3px border */}
      {isAiPopoverOpen && (
        <div className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border-[3px] border-blue-500 z-50 overflow-hidden flex flex-col">
          {/* Popover Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-300">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <div>
                <div className="font-bold text-sm text-white leading-tight">Socratic AI Tutor</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Graph RAG: {classInfo?.name || 'CS-202'} Syllabus
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiPopoverOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Popover Conversation Body */}
          <div className="p-4 flex flex-col gap-3 max-h-80 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-xs">
            {/* Quick Prompts */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-1.5">Gợi ý câu hỏi nhanh:</p>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAskAi('Giải thích tại sao TCP cần 3 bước bắt tay thay vì 2 bước?')}
                  className="text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs transition-colors cursor-pointer"
                >
                  • Tại sao TCP cần 3-Way Handshake thay vì 2?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAi('Thuật toán Dijkstra tính đường đi ngắn nhất hoạt động ra sao trong OSPF?')}
                  className="text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs transition-colors cursor-pointer"
                >
                  • Giải thích thuật toán Dijkstra trong định tuyến OSPF?
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white self-end max-w-[85%]'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </div>

          {/* Popover Input Field */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiInputText.trim()) {
                  handleAskAi(aiInputText.trim());
                  setAiInputText('');
                }
              }}
              placeholder="Hỏi AI về giao thức mạng, RFC..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (aiInputText.trim()) {
                  handleAskAi(aiInputText.trim());
                  setAiInputText('');
                }
              }}
              className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <RemoveSubjectModal
        course={removeTarget}
        isOpen={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveSubjectConfirm}
      />

      <ArchiveModal
        classNameTitle={classInfo?.title || classInfo?.name || 'Lớp học'}
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
        classCode={classInfo?.name || classInfo?.enrollmentKey || classId}
        instructorName={classInfo?.instructor?.fullName || userFullName}
        enrolledCount={classInfo?.enrolledCount || 45}
        maxStudents={classInfo?.maxStudents || 60}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={(emails) => {
          setIsInviteOpen(false);
          showToast(`Đã gửi lời mời tham gia lớp tới: ${emails}`);
        }}
        onToast={showToast}
      />

      <CreateAnnouncementModal
        isOpen={isCreateAnnouncementOpen}
        onClose={() => setIsCreateAnnouncementOpen(false)}
        classId={classId}
        classCode={classInfo?.name || classInfo?.enrollmentKey || 'CS-202'}
        classNameTitle={classInfo?.title || classInfo?.name || 'Cấu trúc dữ liệu & Giải thuật'}
        studentCount={classInfo?.enrolledCount || 45}
        onPublish={(data) => {
          postAnnouncementMutation.mutate({
            title: data.title,
            content: data.content,
          });
          refetch();
          showToast(`Đã đăng thông báo "${data.title}" thành công!`);
        }}
        onToast={showToast}
      />

      <ToastNotification message={toastMessage} />
    </div>
  );
}
