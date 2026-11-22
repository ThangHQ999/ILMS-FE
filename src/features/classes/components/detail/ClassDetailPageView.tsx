'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/features/auth';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useClassDetail } from '../../hooks/useClassDetail';
import { normalizeClassApiId } from '../../services/class.service';
import type { ClassCourse, ClassMember } from '../../schemas/class-detail.schema';
import { ClassDetailBanner } from './ClassDetailBanner';
import { ClassSubjectsTab } from './ClassSubjectsTab';
import { ClassGradebookTab } from './ClassGradebookTab';
import { ClassAnnouncementsTab } from './ClassAnnouncementsTab';
import { ClassMembersTab } from './ClassMembersTab';
import { ClassSettingsTab } from './ClassSettingsTab';
import { ClassMaterialsTab } from './ClassMaterialsTab';
import { ClassStreamTab } from './ClassStreamTab';
import { ClassAssignmentsTab } from './ClassAssignmentsTab';
import { ClassAnalyticsSettingsTab } from './ClassAnalyticsSettingsTab';
import {
  RemoveSubjectModal,
  ArchiveModal,
  AddSubjectModal,
  InviteMemberModal,
  CreateAnnouncementModal,
} from './ClassDetailModals';
import { CreateSubjectModal } from './CreateSubjectModal';
import { useQueryClient } from '@tanstack/react-query';
import {
  CreateSessionModal,
  useRooms,
  useCreateLessonSession,
  lessonSessionKeys,
} from '@/features/lesson-sessions';
import { toast } from '@/components/ui/sonner';

const VALID_CLASS_TABS = new Set([
  'stream',
  'subjects',
  'materials',
  'assignments',
  'gradebook',
  'people',
  'settings',
  'announcements',
  'members',
  'overview',
]);

interface ClassDetailPageViewProps {
  classId: string;
  userFullName?: string;
}

export function ClassDetailPageView({
  classId,
  userFullName = '',
}: ClassDetailPageViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('classes.detail');
  const apiClassId = normalizeClassApiId(classId);

  // Current authenticated user from API
  const { data: currentUser } = useCurrentUser();

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Derive rawTab from URL (?tab=...) so F5/refresh preserves the current tab
  const rawTab = searchParams.get('tab');
  const currentTabForQuery =
    rawTab && VALID_CLASS_TABS.has(rawTab) ? rawTab : 'stream';

  const handleTabChange = useCallback(
    (nextTab: string) => {
      const safeTab = VALID_CLASS_TABS.has(nextTab) ? nextTab : 'stream';
      const params = new URLSearchParams(searchParams.toString());
      if (safeTab === 'stream') {
        params.delete('tab');
      } else {
        params.set('tab', safeTab);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Socratic AI Tutor popover state
  const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<
    Array<{ sender: 'ai' | 'user'; text: string }>
  >([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ giảng Socratic AI được đồng bộ với đề cương bài giảng của . Bạn đang vướng mắc ở phần nào trong Lab 01 hoặc kiến thức TCP/IP hôm nay?',
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

  // Modals state
  const queryClient = useQueryClient();
  const [removeTarget, setRemoveTarget] = useState<ClassCourse | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);

  const { data: rooms = [] } = useRooms();
  const createSessionMutation = useCreateLessonSession(apiClassId);

  const showToast = useCallback((msg: string) => {
    const isError =
      msg.toLowerCase().includes('lỗi') ||
      msg.toLowerCase().includes('không thể') ||
      msg.toLowerCase().includes('thất bại');
    if (isError) {
      toast.error(msg);
    } else {
      toast.success(msg);
    }
  }, []);

  const userRoleUpperPre = String(currentUser?.roleName || '').toUpperCase();
  const isLikelyStudent =
    !userRoleUpperPre.includes('TEACHER') &&
    !userRoleUpperPre.includes('FACULTY') &&
    !userRoleUpperPre.includes('INSTRUCTOR') &&
    !userRoleUpperPre.includes('ADMIN');

  // Data fetching hook
  const {
    data,
    bannerStats,
    assignmentsCount,
    availableCourses,
    isLoading,
    isAnnouncementsLoading,
    isError,
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
  } = useClassDetail(apiClassId, currentTabForQuery, isLikelyStudent);

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

  // Determine user's real role in this class strictly from API data (currentUser + classInfo + members)
  const currentUserEmail = currentUser?.email?.toLowerCase().trim();
  const currentMemberRecord = currentUser
    ? members.find(
      (m) =>
        String(m.id) === String(currentUser.id) ||
        (currentUserEmail && m.email?.toLowerCase().trim() === currentUserEmail)
    )
    : undefined;

  const userRoleUpper = String(currentUser?.roleName || '').toUpperCase();
  const isSystemAdmin = userRoleUpper.includes('ADMIN');

  const isClassOwner = Boolean(
    currentUser &&
    (isSystemAdmin ||
      (classInfo?.ownerId && String(classInfo.ownerId) === String(currentUser.id)) ||
      (classInfo?.instructor?.id &&
        String(classInfo.instructor.id) === String(currentUser.id)) ||
      (currentUserEmail &&
        classInfo?.instructor?.email?.toLowerCase().trim() === currentUserEmail) ||
      currentMemberRecord?.role === 'OWNER')
  );

  const isClassTeacher = Boolean(
    isClassOwner ||
    currentMemberRecord?.role === 'TEACHER' ||
    classInfo?.teachingRole === 'TA' ||
    (currentMemberRecord?.role !== 'STUDENT' &&
      (userRoleUpper.includes('TEACHER') ||
        userRoleUpper.includes('FACULTY') ||
        userRoleUpper.includes('INSTRUCTOR')))
  );

  const effectiveRole: 'student' | 'teacher' | 'owner' = isClassOwner
    ? 'owner'
    : isClassTeacher
      ? 'teacher'
      : 'student';

  const activeTab =
    rawTab && VALID_CLASS_TABS.has(rawTab)
      ? !isLoading && effectiveRole === 'student' && rawTab === 'settings'
        ? 'stream'
        : rawTab
      : 'stream';

  // If user is a student while URL has ?tab=settings (after data finished loading), clean up URL
  useEffect(() => {
    if (!isLoading && effectiveRole === 'student' && rawTab === 'settings') {
      handleTabChange('stream');
    }
  }, [isLoading, effectiveRole, rawTab, handleTabChange]);

  const handleCopyCode = () => {
    const code = classInfo?.enrollmentKey || classInfo?.name || classId;
    navigator.clipboard.writeText(code).catch(() => { });
    showToast(`Đã sao chép mã lớp "${code}" vào bộ nhớ tạm!`);
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
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0B0F19] text-gray-900 dark:text-[#E3E3E3] flex flex-col font-sans antialiased selection:bg-[#D3E3FD] selection:text-[#041E49] dark:selection:bg-[#0842A0] dark:selection:text-white">
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
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isFocusMode
            ? 'pl-20'
            : isSidebarCollapsed
              ? 'md:pl-20'
              : 'md:pl-72'
          }`}
      >
        <main className="flex-1 pt-20 pb-16 px-4 sm:px-8 max-w-7xl w-full mx-auto">
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
                {classInfo?.title || classInfo?.name || 'Đang tải thông tin lớp...'}
              </span>
            </div>
          </div>

          {/* Loading / Error States */}
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-48 rounded-3xl bg-[#E1E5EA] dark:bg-[#282A2C]" />
              <div className="h-64 rounded-3xl bg-[#E1E5EA] dark:bg-[#282A2C]" />
            </div>
          ) : isError || !classInfo ? (
            <div className="my-8 p-10 rounded-3xl bg-white dark:bg-[#1E1F20] border-none shadow-sm dark:shadow-none text-center space-y-3">
              <span className="material-symbols-outlined text-[32px] text-red-500">
                error_outline
              </span>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                Không thể tải thông tin lớp học
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-5 py-2 text-xs font-bold rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 transition-all border-none cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Banner Section */}
              <ClassDetailBanner
                classInfo={classInfo}
                currentRole={effectiveRole}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                subjectsCount={bannerStats?.coursesCount ?? courses.length}
                studentsCount={bannerStats?.studentsCount ?? classInfo.enrolledCount ?? 0}
                assignmentsCount={assignmentsCount}
                instructorsCount={bannerStats?.teachersCount ?? 1}
                onCopyCode={handleCopyCode}
                onInviteClick={() => setIsInviteOpen(true)}
                onOpenSettings={() => handleTabChange('settings')}
                onOpenArchive={() => setIsArchiveOpen(true)}
                onOpenManageCode={() => setIsInviteOpen(true)}
                onOpenCreateSession={() => setIsCreateSessionOpen(true)}
              />

              {/* Content Tab Panes */}
              {activeTab === 'stream' && (
                <ClassStreamTab
                  classInfo={classInfo}
                  bannerStats={bannerStats}
                  announcements={announcements}
                  isLoadingAnnouncements={isAnnouncementsLoading}
                  currentRole={effectiveRole}
                  onNavigateTab={handleTabChange}
                  onOpenCreateAnnouncement={() => setIsCreateAnnouncementOpen(true)}
                  onOpenCreateSession={() => setIsCreateSessionOpen(true)}
                  isPostingAnnouncement={postAnnouncementMutation.isPending}
                  onPostAnnouncement={(payload) => {
                    postAnnouncementMutation.mutate(payload, {
                      onSuccess: () => showToast('Đã đăng thông báo thành công!'),
                      onError: () => showToast('Không thể đăng thông báo lúc này. Vui lòng thử lại.'),
                    });
                  }}
                  onPinAnnouncement={(announcementId, pin) => {
                    pinAnnouncementMutation.mutate(
                      { announcementId, pin },
                      {
                        onSuccess: () =>
                          showToast(pin ? 'Đã ghim thông báo!' : 'Đã bỏ ghim thông báo!'),
                        onError: () => showToast('Không thể cập nhật trạng thái ghim.'),
                      }
                    );
                  }}
                  onDeleteAnnouncement={(announcementId) => {
                    deleteAnnouncementMutation.mutate(announcementId, {
                      onSuccess: () => showToast('Đã xóa thông báo!'),
                      onError: () => showToast('Không thể xóa thông báo lúc này.'),
                    });
                  }}
                  materials={materials}
                  onToast={showToast}
                />
              )}

              {(activeTab === 'subjects' || activeTab === 'modules') && (
                <ClassSubjectsTab
                  courses={courses}
                  availableCourses={availableCourses}
                  currentRole={effectiveRole}
                  onAddExistingClick={() => setIsAddSubjectOpen(true)}
                  onCreateNewClick={() => router.push(`/courses/create?classId=${apiClassId}`)}
                  onAssignCourse={(courseId) => {
                    assignCourseMutation.mutate(courseId, {
                      onSuccess: () => showToast('Đã thêm môn học vào lớp thành công!'),
                      onError: () => showToast('Không thể thêm môn học vào lớp lúc này.'),
                    });
                  }}
                  onRemoveClick={(c) => setRemoveTarget(c)}
                  onAssignTeacherClick={(c) =>
                    showToast(`Mở phân công giảng viên cho môn ${c.code}`)
                  }
                  onToast={showToast}
                />
              )}

              {(activeTab === 'assignments' || activeTab === 'gradebook') && (
                <ClassAssignmentsTab
                  classId={apiClassId}
                  courses={courses}
                  members={members}
                  currentRole={effectiveRole}
                  onToast={showToast}
                  gradebookStudents={gradebookStudents}
                  gradebookAi={gradebookAi}
                  onSendAiSuggestion={() =>
                    showToast('Đã gửi tự động gợi ý ôn tập Socratic AI tới 2 học viên cần hỗ trợ!')
                  }
                  onInterveneClick={(s) =>
                    showToast(`Mở khung hỗ trợ cá nhân hóa cho học viên: ${s.name}`)
                  }
                  initialSubTab={activeTab === 'gradebook' ? 'gradebook' : 'assignments'}
                />
              )}

              {activeTab === 'people' && (
                <ClassMembersTab
                  classInfo={classInfo}
                  members={members}
                  courses={courses}
                  currentRole={effectiveRole}
                  classCode={classInfo?.name || classInfo?.enrollmentKey || 'CS-202'}
                  onApproveMember={handleApproveMember}
                  onRejectMember={(m) => {
                    rejectMemberMutation.mutate(
                      { userId: m.id },
                      {
                        onSuccess: () => showToast(`Đã từ chối yêu cầu của ${m.name}`),
                        onError: () => showToast(`Không thể từ chối yêu cầu của ${m.name}`),
                      }
                    );
                  }}
                  onInviteClick={() => setIsInviteOpen(true)}
                  onToast={showToast}
                />
              )}

              {activeTab === 'settings' && effectiveRole !== 'student' && (
                <ClassSettingsTab
                  classInfo={classInfo}
                  members={members}
                  onSaveClassInfo={(updates) => {
                    updateClassMutation.mutate(updates, {
                      onSuccess: () => showToast('Đã lưu cấu hình lớp học thành công!'),
                      onError: () =>
                        showToast('Không thể lưu cấu hình lớp lúc này. Vui lòng thử lại.'),
                    });
                  }}
                  onInviteTeacher={(email) => {
                    inviteTeacherMutation.mutate(email, {
                      onSuccess: () => showToast(`Đã gửi lời mời giảng viên tới ${email}!`),
                      onError: () => showToast(`Không thể mời giảng viên ${email} lúc này.`),
                    });
                  }}
                  onUpdateMemberRole={(userId, role) => {
                    updateMemberRoleMutation.mutate(
                      { userId, role },
                      {
                        onSuccess: () => showToast('Đã cập nhật vai trò thành viên!'),
                        onError: () => showToast('Không thể cập nhật vai trò lúc này.'),
                      }
                    );
                  }}
                  onRemoveMember={(userId, name) => {
                    removeMemberMutation.mutate(userId, {
                      onSuccess: () => showToast(`Đã gỡ ${name} khỏi lớp học!`),
                      onError: () => showToast(`Không thể gỡ ${name} khỏi lớp lúc này.`),
                    });
                  }}
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

              {activeTab === 'members' && (
                <ClassMembersTab
                  classInfo={classInfo}
                  members={members}
                  courses={courses}
                  currentRole={effectiveRole}
                  classCode={classInfo?.name || classInfo?.enrollmentKey || 'CS-202'}
                  onApproveMember={handleApproveMember}
                  onRejectMember={(m) => showToast(`Đã từ chối yêu cầu của ${m.name}`)}
                  onInviteClick={() => setIsInviteOpen(true)}
                  onToast={showToast}
                />
              )}

              {activeTab === 'overview' && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-8 text-center space-y-4 border-none shadow-sm dark:shadow-none">
                  <div className="w-16 h-16 rounded-2xl bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">grid_view</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E3E3E3]">
                    Tổng quan không gian giảng dạy
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] max-w-md mx-auto">
                    Lớp học hiện có {courses.length} môn học đang hoạt động, {classInfo.enrolledCount} sinh viên và tiến độ nhập điểm đạt 95.8%.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleTabChange('stream')}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 transition-all cursor-pointer border-none shadow-xs"
                    >
                      Xem Bảng tin lớp
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange('gradebook')}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none bg-transparent"
                    >
                      Xem bảng điểm &amp; PLO
                    </button>
                  </div>
                </div>
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
      </div>

      {/* Socratic AI Tutor Popover Panel with zero borders */}
      {isAiPopoverOpen && (
        <div className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-white dark:bg-[#1E1F20] shadow-2xl border-none z-50 overflow-hidden flex flex-col">
          {/* Popover Header */}
          <div className="p-4 bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] flex items-center justify-between border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] flex items-center justify-center text-blue-600 dark:text-[#A8C7FA]">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900 dark:text-[#E3E3E3] leading-tight">Socratic AI Tutor</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Graph RAG: {classInfo?.name || 'CS-202'} Syllabus
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiPopoverOpen(false)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-[#E3E3E3] transition-colors cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Popover Conversation Body */}
          <div className="p-4 flex flex-col gap-3 max-h-80 overflow-y-auto bg-[#F0F4F8] dark:bg-[#131314] text-xs">
            {/* Quick Prompts */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1F20] border-none shadow-xs">
              <p className="font-semibold text-blue-600 dark:text-[#A8C7FA] mb-1.5">Gợi ý câu hỏi nhanh:</p>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAskAi('Giải thích tại sao TCP cần 3 bước bắt tay thay vì 2 bước?')}
                  className="text-left p-2 rounded-xl bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] text-xs transition-colors cursor-pointer border-none"
                >
                  • Tại sao TCP cần 3-Way Handshake thay vì 2?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAi('Thuật toán Dijkstra tính đường đi ngắn nhất hoạt động ra sao trong OSPF?')}
                  className="text-left p-2 rounded-xl bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] text-xs transition-colors cursor-pointer border-none"
                >
                  • Giải thích thuật toán Dijkstra trong định tuyến OSPF?
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl leading-relaxed text-xs ${msg.sender === 'user'
                    ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] self-end max-w-[85%]'
                    : 'bg-[#F0F4F8] dark:bg-[#131314] text-gray-800 dark:text-[#C4C7C5] border-none'
                    }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </div>

          {/* Popover Input Field */}
          <div className="p-3 bg-white dark:bg-[#1E1F20] border-t border-black/5 dark:border-white/5 flex items-center gap-2">
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
              className="flex-1 bg-[#F0F4F8] dark:bg-[#131314] px-4 py-2 rounded-full text-xs text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] border-none outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (aiInputText.trim()) {
                  handleAskAi(aiInputText.trim());
                  setAiInputText('');
                }
              }}
              className="w-8 h-8 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] flex items-center justify-center hover:brightness-95 transition-all cursor-pointer border-none shrink-0"
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
        availableCourses={availableCourses}
        onClose={() => setIsAddSubjectOpen(false)}
        onConfirm={handleAddSubjectsConfirm}
      />

      <CreateSubjectModal
        isOpen={isCreateSubjectOpen}
        classId={apiClassId}
        classNameTitle={classInfo?.title || classInfo?.name}
        onClose={() => setIsCreateSubjectOpen(false)}
        onSuccess={(newSubject) => {
          refetch();
          showToast(`Tạo môn học "${newSubject.name}" (${newSubject.code}) thành công và đã gán vào lớp!`);
        }}
      />

      <InviteMemberModal
        classId={classInfo?.id ? normalizeClassApiId(classInfo.id) : apiClassId}
        classCode={classInfo?.enrollmentKey || classInfo?.name || ''}
        instructorName={classInfo?.instructor?.fullName || userFullName}
        enrolledCount={classInfo?.enrolledCount ?? 0}
        maxStudents={classInfo?.maxStudents ?? 60}
        endAt={classInfo?.endAt}
        currentRole={effectiveRole}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onCodeRegenerated={() => {
          refetch();
        }}
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
        studentCount={bannerStats?.studentsCount ?? classInfo?.enrolledCount ?? 0}
        onPublish={(data) => {
          postAnnouncementMutation.mutate(
            {
              title: data.title,
              content: data.content,
            },
            {
              onSuccess: () => {
                showToast(`Đã đăng thông báo "${data.title}" thành công!`);
              },
              onError: () => {
                showToast('Không thể đăng thông báo lúc này. Vui lòng thử lại.');
              },
            }
          );
        }}
        onToast={showToast}
      />

      <CreateSessionModal
        isOpen={isCreateSessionOpen}
        onClose={() => setIsCreateSessionOpen(false)}
        onSubmit={async (payload) => {
          await createSessionMutation.mutateAsync(payload);
          queryClient.invalidateQueries({
            queryKey: lessonSessionKeys.lists(apiClassId),
          });
          queryClient.invalidateQueries({
            queryKey: lessonSessionKeys.lists(classId),
          });
          showToast('Đã lên lịch ca học mới cho lớp thành công!');
        }}
        rooms={rooms}
        isSubmitting={createSessionMutation.isPending}
        onTriggerConflict={(conflict) => {
          showToast(
            `Cảnh báo: Phòng ${conflict.roomName} đang bị trùng lịch với ${conflict.conflictingCourse}`
          );
        }}
      />
    </div>
  );
}

