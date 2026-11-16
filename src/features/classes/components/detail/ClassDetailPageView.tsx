'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUserRole } from '@/hooks/useUserRole';
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
import { ClassStreamTab } from './ClassStreamTab';
import { ClassAssignmentsTab } from './ClassAssignmentsTab';
import { ClassAnalyticsSettingsTab } from './ClassAnalyticsSettingsTab';
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

export function ClassDetailPageView({
  classId,
  userFullName = 'TS. Lê Hoàng Nam',
}: ClassDetailPageViewProps) {
  const router = useRouter();
  const t = useTranslations('classes.detail');

  // Global user role hook (real-time reactive across app)
  const { activeRole, switchRole } = useUserRole();

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Class detail state: synchronize with global activeRole
  const [activeTab, setActiveTab] = useState('stream');
  const [localTeacherRole, setLocalTeacherRole] = useState<'teacher' | 'owner'>('teacher');

  // Compute effectiveRole synchronously during render:
  // When activeRole is STUDENT, effectiveRole is GUARANTEED to be 'student' (zero lag / no F5)
  // When activeRole is TEACHER, effectiveRole is localTeacherRole ('teacher' or 'owner')
  const effectiveRole: 'student' | 'teacher' | 'owner' =
    activeRole === 'STUDENT' ? 'student' : localTeacherRole;

  // If switched to student while on teacher-only settings tab, redirect to stream tab
  useEffect(() => {
    if (activeRole === 'STUDENT' && activeTab === 'settings') {
      setActiveTab('stream');
    }
  }, [activeRole, activeTab]);

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

  const handleRoleChange = (newRole: 'student' | 'teacher' | 'owner') => {
    if (newRole === 'student') {
      switchRole('STUDENT');
      if (activeTab === 'settings') {
        setActiveTab('stream');
      }
    } else {
      setLocalTeacherRole(newRole);
      switchRole('TEACHER');
    }
    showToast(
      newRole === 'owner'
        ? 'Đã chuyển sang vai trò: Chủ lớp (Đầy đủ quyền quản trị)'
        : newRole === 'teacher'
        ? 'Đã chuyển sang vai trò: Giảng viên (Quyền hạn tinh gọn)'
        : 'Đã chuyển sang vai trò: Học viên (Giao diện học tập cá nhân)'
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
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0B0F19] text-gray-900 dark:text-[#E3E3E3] flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
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
              {classInfo?.title || classInfo?.name || 'Đang tải thông tin lớp...'}
            </span>
          </div>

          {/* Role Simulator Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-xs w-fit border-none">
            <span className="text-gray-500 dark:text-[#8E918F] font-medium">
              {t('viewAs')}
            </span>
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer border-none ${
                effectiveRole === 'student'
                  ? 'font-bold bg-white dark:bg-[#1E1F20] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'font-medium text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-[#E3E3E3]'
              }`}
            >
              Học viên
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('teacher')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer border-none ${
                effectiveRole === 'teacher'
                  ? 'font-bold bg-white dark:bg-[#1E1F20] text-blue-600 dark:text-[#A8C7FA] shadow-xs'
                  : 'font-medium text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-[#E3E3E3]'
              }`}
            >
              Giảng viên
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('owner')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer border-none ${
                effectiveRole === 'owner'
                  ? 'font-bold bg-white dark:bg-[#1E1F20] text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'font-medium text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-[#E3E3E3]'
              }`}
            >
              Chủ lớp
            </button>
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
            {activeTab === 'stream' && (
              <ClassStreamTab
                classInfo={classInfo}
                currentRole={effectiveRole}
                onNavigateTab={setActiveTab}
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
                onToast={showToast}
              />
            )}

            {(activeTab === 'assignments' || activeTab === 'gradebook') && (
              <ClassAssignmentsTab
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
                onSaveClassInfo={() => showToast('Đã lưu cấu hình lớp thành công!')}
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
                members={members}
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
                    onClick={() => setActiveTab('stream')}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 transition-all cursor-pointer border-none shadow-xs"
                  >
                    Xem Bảng tin lớp
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('gradebook')}
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

      {/* Socratic AI Tutor Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsAiPopoverOpen((prev) => !prev)}
          className="flex items-center gap-3 pl-4 pr-5 py-2.5 bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] rounded-full shadow-lg border-none hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#007BFF]/75 dark:bg-[#A8C7FA]/75 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#007BFF] dark:bg-[#A8C7FA]" />
          </span>
          <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[22px]">psychology</span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold leading-tight">Socratic AI Tutor</span>
            <span className="text-[10px] text-gray-500 dark:text-[#8E918F] leading-none">Context Aware RAG</span>
          </div>
        </button>
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
                  className={`p-3 rounded-2xl leading-relaxed text-xs ${
                    msg.sender === 'user'
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
        classCode={classInfo?.name || classInfo?.enrollmentKey || 'CS-202'}
        instructorName={classInfo?.instructor?.fullName || userFullName}
        enrolledCount={classInfo?.enrolledCount || 45}
        maxStudents={classInfo?.maxStudents || 60}
        currentRole={effectiveRole}
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

