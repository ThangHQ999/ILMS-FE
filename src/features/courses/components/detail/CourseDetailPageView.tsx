'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCourse } from '../../hooks/useCourse';
import type { CreateChapterInput, CreateLessonInput } from '../../schemas/course.schema';
import { CourseWorkspaceHeader } from './CourseWorkspaceHeader';
import { CourseWorkspaceSidebar, type CourseWorkspaceTab } from './CourseWorkspaceSidebar';
import { CourseHeroBanner } from './CourseHeroBanner';
import { CourseStreamTabContent } from './CourseStreamTabContent';
import { CourseModulesTabContent } from './CourseModulesTabContent';
import { CourseAssignmentsTabContent } from './CourseAssignmentsTabContent';
import { CoursePeopleTabContent } from './CoursePeopleTabContent';
import { CourseSettingsTabContent } from './CourseSettingsTabContent';
import { CourseSocraticAiPopover } from './CourseSocraticAiPopover';
import { CreateChapterModal } from './CreateChapterModal';
import { CreateLessonModal } from './CreateLessonModal';

interface CourseDetailPageViewProps {
  courseId: string;
  userFullName?: string;
}

export function CourseDetailPageView({
  courseId,
  userFullName = 'TS. Lê Hoàng Nam',
}: CourseDetailPageViewProps) {
  const router = useRouter();

  // Role simulator state: student vs teacher
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  // Active tab state: stream | modules | assignments | people | settings
  const [activeTab, setActiveTab] = useState<CourseWorkspaceTab>('stream');

  // Modals state
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [addLessonTargetChapterId, setAddLessonTargetChapterId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Handle role change
  const handleRoleChange = (newRole: 'student' | 'teacher') => {
    setRole(newRole);
    if (newRole === 'student' && activeTab === 'settings') {
      setActiveTab('stream');
    }
    showToast(
      newRole === 'teacher'
        ? 'Đã chuyển sang Chế độ Giảng viên (Teacher Studio)'
        : 'Đã chuyển sang Chế độ Học viên (Student Workspace)'
    );
  };

  // Fetch course & chapters data
  const {
    course,
    chapters,
    isLoading,
    isError,
    refetch,
    addChapterMutation,
    addLessonMutation,
  } = useCourse(courseId);

  const courseCode = course?.courseCode || 'CS-202';
  const courseTitle = course?.name || 'Mạng máy tính & Truyền thông dữ liệu';

  const handleCreateChapter = (input: CreateChapterInput) => {
    addChapterMutation.mutate(input, {
      onSuccess: () => {
        setIsAddChapterOpen(false);
        showToast('Tạo chương mới thành công!');
      },
    });
  };

  const handleCreateLesson = (input: CreateLessonInput) => {
    if (!addLessonTargetChapterId) return;
    addLessonMutation.mutate(
      { chapterId: addLessonTargetChapterId, input },
      {
        onSuccess: () => {
          setAddLessonTargetChapterId(null);
          showToast('Tạo bài học mới thành công!');
        },
      }
    );
  };

  const targetChapter = chapters.find((c) => c.id === addLessonTargetChapterId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#0d1c32]/95 dark:bg-card/95 text-white dark:text-foreground border border-blue-500/40 px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Global Navigation Header */}
      <CourseWorkspaceHeader
        courseCode={courseCode}
        courseTitle={courseTitle}
        role={role}
        onRoleChange={handleRoleChange}
        userFullName={userFullName}
      />

      {/* 2. Left Navigation Sidebar (Hidden on mobile, fixed w-72 on lg) */}
      <CourseWorkspaceSidebar
        courseCode={courseCode}
        courseTitle={courseTitle}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role={role}
      />

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col pt-16 lg:ml-72 transition-all duration-200">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
          {/* Loading state skeleton */}
          {isLoading ? (
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="h-44 rounded-2xl bg-muted/60" />
              <div className="h-12 w-96 rounded-xl bg-muted/60" />
              <div className="h-80 rounded-2xl bg-muted/60" />
            </div>
          ) : isError ? (
            <div className="bg-card rounded-2xl p-10 text-center border border-border my-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">error</span>
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">
                Không thể tải thông tin môn học
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6">
                Đã xảy ra lỗi khi kết nối tới hệ thống hoặc môn học không tồn tại.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/classes"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-muted text-foreground hover:bg-muted/80"
                >
                  Quay lại Lớp học
                </Link>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#0059bb] text-white shadow-xs hover:bg-[#004bb0]"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Course Hero Banner with Tab Switcher */}
              <CourseHeroBanner
                courseCode={courseCode}
                courseTitle={courseTitle}
                instructor="TS. Lê Hoàng Nam"
                role={role}
                onRoleChange={handleRoleChange}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                assignmentsCount={2}
                membersCount={48}
              />

              {/* Tab 1: Tổng quan & Bảng tin */}
              {activeTab === 'stream' && (
                <CourseStreamTabContent
                  role={role}
                  courseCode={courseCode}
                  onGoToAssignments={() => setActiveTab('assignments')}
                  onGoToPeople={() => setActiveTab('people')}
                  showToast={showToast}
                />
              )}

              {/* Tab 2: Chương trình học */}
              {activeTab === 'modules' && (
                <CourseModulesTabContent
                  role={role}
                  courseId={courseId}
                  onOpenAddChapter={() => setIsAddChapterOpen(true)}
                  onOpenAddLesson={() => {
                    const firstChapId = chapters[0]?.id;
                    if (firstChapId) {
                      setAddLessonTargetChapterId(firstChapId);
                    } else {
                      setIsAddChapterOpen(true);
                    }
                  }}
                  onSwitchToStudent={() => handleRoleChange('student')}
                  onGoToAssignments={() => setActiveTab('assignments')}
                  showToast={showToast}
                />
              )}

              {/* Tab 3: Bài tập & Đánh giá */}
              {activeTab === 'assignments' && (
                <CourseAssignmentsTabContent
                  role={role}
                  courseCode={courseCode}
                  showToast={showToast}
                />
              )}

              {/* Tab 4: Thành viên */}
              {activeTab === 'people' && (
                <CoursePeopleTabContent
                  role={role}
                  courseCode={courseCode}
                  membersCount={48}
                  showToast={showToast}
                />
              )}

              {/* Tab 5: Cài đặt & Thống kê (Dành riêng cho Giảng viên) */}
              {activeTab === 'settings' && role === 'teacher' && (
                <CourseSettingsTabContent
                  courseCode={courseCode}
                  courseTitle={courseTitle}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Socratic AI Tutor Copilot Popover */}
      <CourseSocraticAiPopover
        courseCode={courseCode}
        currentLessonTitle="Bài 3.2 TCP Handshake"
      />

      {/* Chapter & Lesson Creation Modals */}
      <CreateChapterModal
        isOpen={isAddChapterOpen}
        courseCode={courseCode}
        courseTitle={courseTitle}
        chapters={chapters}
        onClose={() => setIsAddChapterOpen(false)}
        onSubmit={handleCreateChapter}
        isLoading={addChapterMutation.isPending}
        onToast={showToast}
      />

      <CreateLessonModal
        isOpen={Boolean(addLessonTargetChapterId)}
        courseCode={courseCode}
        courseTitle={courseTitle}
        chapters={chapters}
        chapterId={addLessonTargetChapterId}
        chapterTitle={targetChapter?.title}
        onClose={() => setAddLessonTargetChapterId(null)}
        onSubmit={handleCreateLesson}
        isLoading={addLessonMutation.isPending}
        onToast={showToast}
      />
    </div>
  );
}
