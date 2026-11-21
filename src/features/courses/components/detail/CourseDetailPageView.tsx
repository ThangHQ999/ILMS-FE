'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { useUserRole } from '@/hooks/useUserRole';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useCourse } from '../../hooks/useCourse';
import type { Chapter, Lesson, CreateChapterInput } from '../../schemas/course.schema';
import { CourseBanner } from './CourseBanner';
import { CourseSyllabusTab } from './CourseSyllabusTab';
import { CourseMaterialsTab } from './CourseMaterialsTab';
import { CourseKnowledgeGraphTab } from './CourseKnowledgeGraphTab';
import { CourseAiTutorTab } from './CourseAiTutorTab';
import { CreateChapterModal } from './CreateChapterModal';

interface CourseDetailPageViewProps {
  courseId: string;
  userFullName?: string;
}

export function CourseDetailPageView({
  courseId,
  userFullName = '',
}: CourseDetailPageViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('courses.detail');

  // Layout shell states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Sync activeTab with URL ?tab=syllabus|materials|knowledgeGraph|aiTutor
  type CourseTabKey = 'syllabus' | 'materials' | 'knowledgeGraph' | 'aiTutor';
  const parseTabParam = (value: string | null): CourseTabKey => {
    if (
      value === 'syllabus' ||
      value === 'materials' ||
      value === 'knowledgeGraph' ||
      value === 'aiTutor'
    ) {
      return value;
    }
    return 'syllabus';
  };

  const [activeTab, setActiveTabState] = useState<CourseTabKey>(() =>
    parseTabParam(searchParams.get('tab'))
  );
  const [focusedMaterialId, setFocusedMaterialId] = useState<string | null>(
    searchParams.get('materialId')
  );
  const [aiPrefillPrompt, setAiPrefillPrompt] = useState<string | null>(null);

  // Mặc định là FALSE (Dừng chờ duyệt tay) theo yêu cầu của Giảng viên.
  // Được lưu giữ xuyên suốt khi chuyển tab trong chi tiết môn học hoặc tải lại trang.
  const [materialsAutoPublish, setMaterialsAutoPublish] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const coursePref = localStorage.getItem(`ilms_course_materials_auto_publish_${courseId}`);
      if (coursePref !== null) return coursePref === 'true';
      const globalPref = localStorage.getItem('ilms_course_materials_auto_publish');
      if (globalPref !== null) return globalPref === 'true';
    } catch {
      // fallback
    }
    return false;
  });

  const handleMaterialsAutoPublishChange = useCallback(
    (nextVal: boolean) => {
      setMaterialsAutoPublish(nextVal);
      try {
        localStorage.setItem(`ilms_course_materials_auto_publish_${courseId}`, String(nextVal));
        localStorage.setItem('ilms_course_materials_auto_publish', String(nextVal));
      } catch {
        // ignore
      }
    },
    [courseId]
  );

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTabState(parseTabParam(tabParam));
    }
    const matParam = searchParams.get('materialId');
    if (matParam) {
      setFocusedMaterialId(matParam);
    }
  }, [searchParams]);

  const setActiveTab = useCallback(
    (nextTab: CourseTabKey, extraParams?: { materialId?: string | null }) => {
      setActiveTabState(nextTab);
      const next = new URLSearchParams(searchParams.toString());
      next.set('tab', nextTab);
      if (extraParams?.materialId) {
        next.set('materialId', extraParams.materialId);
        setFocusedMaterialId(extraParams.materialId);
      } else if (extraParams && 'materialId' in extraParams) {
        next.delete('materialId');
        setFocusedMaterialId(null);
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleOpenKnowledgeGraph = useCallback(
    (materialId?: string) => {
      setActiveTab('knowledgeGraph', { materialId: materialId ?? null });
    },
    [setActiveTab]
  );

  // Modals state
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Fetch course & chapters data
  const { user, isTeacher, isAdmin, isStudent, isOverridden } = useUserRole();
  const {
    course,
    chapters,
    isLoading,
    isError,
    refetch,
    addChapterMutation,
    deleteChapterMutation,
    addLessonMutation,
    deleteLessonMutation,
  } = useCourse(courseId);

  const handleAskAiAboutConcept = useCallback(
    (conceptLabel: string) => {
      setAiPrefillPrompt(
        `Hãy giải thích khái niệm "${conceptLabel}" trong môn ${course?.name || 'này'} theo phương pháp Socratic và cho mình 1 câu hỏi kiểm tra hiểu bài.`
      );
      setActiveTab('aiTutor');
    },
    [course?.name, setActiveTab]
  );

  const canEditCourse = Boolean(
    user &&
      (isAdmin || (course?.ownerId ? user.id === course.ownerId : isTeacher)) &&
      !(isOverridden && isStudent)
  );

  // Calculate totals
  const totalLessons = chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);
  const completedLessons = chapters.reduce(
    (acc, ch) => acc + (ch.lessons?.filter((l) => l.status === 'COMPLETED').length || 0),
    0
  );
  const totalDurationMinutes = chapters.reduce(
    (acc, ch) => acc + (ch.lessons?.reduce((lAcc, l) => lAcc + (l.duration || 45), 0) || 0),
    0
  );
  const totalHours = Math.round(totalDurationMinutes / 60);

  const handleCreateChapter = (input: CreateChapterInput) => {
    addChapterMutation.mutate(
      { ...input, orderIndex: input.orderIndex ?? chapters.length + 1 },
      {
        onSuccess: () => {
          setIsAddChapterOpen(false);
          showToast(t('toastChapterCreated'));
        },
      }
    );
  };

  // 1-Click Notion-style Create & Jump Straight into Canvas Editor
  const handleQuickCreateAndEditLesson = (targetChapId?: string) => {
    const chapId = targetChapId || chapters[0]?.id;
    if (!chapId) {
      setIsAddChapterOpen(true);
      showToast('Hãy tạo chương đầu tiên trước khi thêm bài học.');
      return;
    }
    const chapIdx = chapters.findIndex((c) => c.id === chapId);
    const chap = chapIdx >= 0 ? chapters[chapIdx] : undefined;
    const nextNum = (chap?.lessons?.length ?? 0) + 1;
    const defaultTitle = `Bài ${chapIdx >= 0 ? chapIdx + 1 : 1}.${nextNum} - Chưa đặt tên`;

    addLessonMutation.mutate(
      {
        chapterId: chapId,
        input: {
          title: defaultTitle,
          content: defaultTitle,
          lessonType: 'MODULAR',
          duration: 45,
          orderIndex: nextNum,
        },
      },
      {
        onSuccess: (createdLesson) => {
          showToast('Đang mở Không gian biên soạn khối (Editor Mode)...');
          router.push(`/courses/${courseId}/lessons/${createdLesson.id}?mode=edit`);
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Không thể tạo bài học mới. Vui lòng thử lại.';
          showToast(msg);
        },
      }
    );
  };

  const handleDeleteChapter = (chapter: Chapter) => {
    deleteChapterMutation.mutate(chapter.id, {
      onSuccess: () => showToast(`Đã xóa chương "${chapter.title}".`),
      onError: (err) => {
        const msg = err instanceof Error ? err.message : `Không thể xóa chương "${chapter.title}".`;
        showToast(msg);
      },
    });
  };

  const handleSelectLesson = (lesson: Lesson, chapter: Chapter) => {
    showToast(`Đang mở bài học: "${lesson.title}" (${chapter.title})`);
    router.push(`/courses/${courseId}/lessons/${lesson.id}`);
  };

  const handleEditLesson = (lesson: Lesson) => {
    router.push(`/courses/${courseId}/lessons/${lesson.id}?mode=edit`);
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    deleteLessonMutation.mutate(lesson.id, {
      onSuccess: () => showToast(`Đã xóa bài học "${lesson.title}".`),
      onError: () => showToast(`Không thể xóa bài học "${lesson.title}".`),
    });
  };

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
      />

      {/* Main Body */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isFocusMode
            ? 'pl-20'
            : isSidebarCollapsed
              ? 'md:pl-20'
              : 'md:pl-72'
          }`}
      >
        <DashboardHeader
          isFocus={isFocusMode}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleMode={() => setIsFocusMode((prev) => !prev)}
          userFullName={userFullName}
          title="Không gian môn học"
        />

        <main
          className={`flex-1 px-4 sm:px-6 lg:px-8 pb-8 ${isFocusMode ? 'pt-20' : 'pt-24'
            } max-w-7xl w-full mx-auto flex flex-col gap-6`}
        >
          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-12 w-96 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : isError || !course ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border-[3px] border-slate-300 dark:border-slate-700 my-8">
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
                totalChapters={chapters.length}
                totalHours={totalHours}
                canEdit={canEditCourse}
                onOpenAddChapter={() => setIsAddChapterOpen(true)}
                onOpenAddLesson={() => handleQuickCreateAndEditLesson()}
                onSelectTab={(tab) => setActiveTab(tab as any)}
              />

              {/* TABS NAVIGATION */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('syllabus')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold border-[3px] transition-all cursor-pointer ${activeTab === 'syllabus'
                      ? 'bg-[#0059bb] text-white border-[#0059bb] shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300/60 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 font-semibold'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                  <span>{t('tabSyllabus')}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${activeTab === 'syllabus'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    {chapters.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('materials')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold border-[3px] transition-all cursor-pointer ${activeTab === 'materials'
                      ? 'bg-[#0059bb] text-white border-[#0059bb] shadow-sm font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300/60 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px]">folder_open</span>
                  <span>{t('tabMaterials')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('knowledgeGraph')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold border-[3px] transition-all cursor-pointer ${activeTab === 'knowledgeGraph'
                      ? 'bg-[#0059bb] text-white border-[#0059bb] shadow-sm font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300/60 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px]">hub</span>
                  <span>{t('tabKnowledgeGraph')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('aiTutor')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold border-[3px] transition-all cursor-pointer ${activeTab === 'aiTutor'
                      ? 'bg-[#0059bb] text-white border-[#0059bb] shadow-sm font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300/60 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-amber-500">smart_toy</span>
                  <span>{t('tabAiTutor')}</span>
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'syllabus' && (
                <CourseSyllabusTab
                  chapters={chapters}
                  canEdit={canEditCourse}
                  onOpenAddChapter={() => setIsAddChapterOpen(true)}
                  onOpenAddLessonForChapter={(chapId) =>
                    handleQuickCreateAndEditLesson(chapId)
                  }
                  onDeleteChapter={handleDeleteChapter}
                  onSelectLesson={handleSelectLesson}
                  onEditLesson={handleEditLesson}
                  onDeleteLesson={handleDeleteLesson}
                />
              )}

              {activeTab === 'materials' && (
                <CourseMaterialsTab
                  courseId={courseId}
                  courseName={course.name}
                  canEdit={canEditCourse}
                  onShowToast={showToast}
                  onOpenKnowledgeGraph={handleOpenKnowledgeGraph}
                  autoPublish={materialsAutoPublish}
                  onAutoPublishChange={handleMaterialsAutoPublishChange}
                />
              )}

              {activeTab === 'knowledgeGraph' && (
                <CourseKnowledgeGraphTab
                  courseId={courseId}
                  courseName={course.name}
                  canEdit={canEditCourse}
                  initialMaterialId={focusedMaterialId}
                  onAskAiConcept={handleAskAiAboutConcept}
                />
              )}

              {activeTab === 'aiTutor' && (
                <CourseAiTutorTab
                  courseName={course.name}
                  subjectCode={course.courseCode}
                  initialPrompt={aiPrefillPrompt}
                  onConsumeInitialPrompt={() => setAiPrefillPrompt(null)}
                  materialIds={chapters.flatMap((ch) =>
                    ch.lessons.flatMap((l) => l.materials.map((m) => m.id))
                  )}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateChapterModal
        isOpen={isAddChapterOpen}
        courseCode={course?.courseCode || 'COURSE'}
        courseTitle={course?.name}
        chapters={chapters}
        onClose={() => setIsAddChapterOpen(false)}
        onSubmit={handleCreateChapter}
        isLoading={addChapterMutation.isPending}
        onToast={showToast}
      />
    </div>
  );
}
