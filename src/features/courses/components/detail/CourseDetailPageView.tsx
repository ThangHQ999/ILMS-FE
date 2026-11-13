'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useCourse } from '../../hooks/useCourse';
import type { Chapter, Lesson, CreateChapterInput, CreateLessonInput } from '../../schemas/course.schema';
import { CourseBanner } from './CourseBanner';
import { CourseSyllabusTab } from './CourseSyllabusTab';
import { CourseMaterialsTab } from './CourseMaterialsTab';
import { CourseKnowledgeGraphTab } from './CourseKnowledgeGraphTab';
import { CourseAiTutorTab } from './CourseAiTutorTab';
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
  const t = useTranslations('courses.detail');

  // Layout shell states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'syllabus' | 'materials' | 'knowledgeGraph' | 'aiTutor'>('syllabus');

  // Modals state
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [addLessonTargetChapterId, setAddLessonTargetChapterId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

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

  // Calculate totals
  const totalLessons = chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);
  const completedLessons = chapters.reduce(
    (acc, ch) => acc + (ch.lessons?.filter((l) => l.status === 'COMPLETED').length || 0),
    0
  );

  const handleCreateChapter = (input: CreateChapterInput) => {
    addChapterMutation.mutate(input, {
      onSuccess: () => {
        setIsAddChapterOpen(false);
        showToast(t('toastChapterCreated'));
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
          showToast(t('toastLessonCreated'));
        },
      }
    );
  };

  const handleSelectLesson = (lesson: Lesson, chapter: Chapter) => {
    showToast(`Đang mở bài học: "${lesson.title}" (${chapter.title})`);
  };

  // Find target chapter title for lesson modal
  const targetChapter = chapters.find((c) => c.id === addLessonTargetChapterId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-sm text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-400 dark:text-emerald-600">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        workspaceMode="faculty"
      />

      {/* Main Body */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isFocusMode
            ? 'pl-20'
            : isSidebarCollapsed
            ? 'md:pl-20'
            : 'md:pl-64'
        }`}
      >
        <DashboardHeader
          isFocus={isFocusMode}
          onToggleMode={() => setIsFocusMode((prev) => !prev)}
          userFullName={userFullName}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-12 w-96 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : isError || !course ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 my-8">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">error</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Không thể tải thông tin môn học
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Đã xảy ra lỗi khi kết nối tới hệ thống hoặc môn học không tồn tại.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/classes"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Quay lại Lớp học
                </Link>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Course Banner */}
              <CourseBanner
                course={course}
                totalLessons={totalLessons}
                completedLessons={completedLessons}
                onOpenAddChapter={() => setIsAddChapterOpen(true)}
                onOpenAddLesson={() => {
                  const firstChapId = chapters[0]?.id;
                  if (firstChapId) {
                    setAddLessonTargetChapterId(firstChapId);
                  } else {
                    setIsAddChapterOpen(true);
                  }
                }}
                onSelectTab={(tab) => setActiveTab(tab as any)}
              />

              {/* Tab Navigation Pill Bar */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('syllabus')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'syllabus'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                  <span>{t('tabSyllabus')}</span>
                  <span
                    className={`text-[11px] px-2 py-0.2 rounded-full font-mono ${
                      activeTab === 'syllabus'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {chapters.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('materials')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'materials'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">folder_open</span>
                  <span>{t('tabMaterials')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('knowledgeGraph')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'knowledgeGraph'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">hub</span>
                  <span>{t('tabKnowledgeGraph')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('aiTutor')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'aiTutor'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-400">smart_toy</span>
                  <span>{t('tabAiTutor')}</span>
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'syllabus' && (
                <CourseSyllabusTab
                  chapters={chapters}
                  onOpenAddChapter={() => setIsAddChapterOpen(true)}
                  onOpenAddLessonForChapter={(chapId) => setAddLessonTargetChapterId(chapId)}
                  onSelectLesson={handleSelectLesson}
                />
              )}

              {activeTab === 'materials' && (
                <CourseMaterialsTab
                  courseName={course.name}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'knowledgeGraph' && (
                <CourseKnowledgeGraphTab
                  courseName={course.name}
                />
              )}

              {activeTab === 'aiTutor' && (
                <CourseAiTutorTab
                  courseName={course.name}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateChapterModal
        isOpen={isAddChapterOpen}
        onClose={() => setIsAddChapterOpen(false)}
        onSubmit={handleCreateChapter}
        isLoading={addChapterMutation.isPending}
      />

      <CreateLessonModal
        isOpen={Boolean(addLessonTargetChapterId)}
        chapterId={addLessonTargetChapterId}
        chapterTitle={targetChapter?.title}
        onClose={() => setAddLessonTargetChapterId(null)}
        onSubmit={handleCreateLesson}
        isLoading={addLessonMutation.isPending}
      />
    </div>
  );
}
