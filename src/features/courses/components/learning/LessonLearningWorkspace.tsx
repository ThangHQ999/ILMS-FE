'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setSocraticLessonContext } from '@/hooks/useSocraticLessonContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useCourse } from '../../hooks/useCourse';
import { useLessonBlocks } from '../../hooks/useLessonBlocks';
import { LessonWorkspaceHeader } from './LessonWorkspaceHeader';
import { LessonSyllabusSidebar } from './LessonSyllabusSidebar';
import { LessonBottomWorkspaceBar } from './LessonBottomWorkspaceBar';
import { LessonNotesDrawer } from './LessonNotesDrawer';
import { LessonBlockCanvas } from './blocks/LessonBlockCanvas';
import { createDefaultBlockContent } from './blocks/block-registry';

interface LessonLearningWorkspaceProps {
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  classGroup?: string;
  lessonId?: string;
  lessonTitle?: string;
  chapterNumber?: string | number;
  lessonNumber?: string | number;
}

export function LessonLearningWorkspace({
  courseId = '',
  courseCode: propCourseCode,
  courseName: propCourseName,
  classGroup,
  lessonId = '',
  lessonTitle: propLessonTitle,
  chapterNumber: propChapterNumber,
  lessonNumber: propLessonNumber,
}: LessonLearningWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isStudent, isOverridden } = useUserRole();
  const {
    course,
    chapters,
    deleteChapterMutation,
    addLessonMutation,
    updateLessonMutation,
    deleteLessonMutation,
  } = useCourse(courseId);
  const {
    workspace,
    blocks,
    canEdit,
    lessonProgress,
    legacyContent,
    isLoading: isBlocksLoading,
    isError: isBlocksError,
    refetch: refetchBlocks,
    saveStatus,
    flushPendingSave,
    addBlockMutation,
    updateBlockLocal,
    deleteBlockMutation,
    reorderMutation,
    quizAttemptMutation,
    videoProgressMutation,
    completeLessonMutation,
    applyTemplateMutation,
  } = useLessonBlocks(lessonId);

  // Sidebar and layout toggles
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<
    'workspace' | 'syllabus' | 'resources' | 'discussion'
  >('workspace');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  // Student users or Student preview override never see editor/authoring controls
  const effectiveCanEdit = canEdit && !(isOverridden && isStudent);

  // Sync editor mode from URL ?mode=edit when allowed, or force view-only for students
  useEffect(() => {
    if (!effectiveCanEdit) {
      if (isEditorMode) setIsEditorMode(false);
    } else if (searchParams.get('mode') === 'edit') {
      setIsEditorMode(true);
    }
  }, [effectiveCanEdit, isEditorMode, searchParams]);

  // Derive real course / chapter / lesson metadata
  const resolvedCourseCode = course?.courseCode || propCourseCode || 'COURSE';
  const resolvedCourseName = course?.name || propCourseName || 'Không gian học tập';

  const {
    activeChapter,
    activeLesson,
    resolvedChapterNumber,
    resolvedLessonNumber,
    previousLesson,
    nextLesson,
    totalLessonsCount,
    completedLessonsCount,
    courseProgressPercent,
    lessonMaterialIds,
  } = useMemo(() => {
    const allLessons = chapters.flatMap((ch) => ch.lessons);
    const total = allLessons.length;
    const completed = allLessons.filter((l) => l.status === 'COMPLETED').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    let chapIdx = chapters.findIndex((ch) => ch.lessons.some((l) => l.id === lessonId));
    if (chapIdx < 0 && chapters.length > 0) chapIdx = 0;

    const chap = chapIdx >= 0 ? chapters[chapIdx] : undefined;
    let lesIdx = chap ? chap.lessons.findIndex((l) => l.id === lessonId) : -1;
    if (lesIdx < 0 && chap && chap.lessons.length > 0) lesIdx = 0;
    const les = chap && lesIdx >= 0 ? chap.lessons[lesIdx] : undefined;

    const flatIdx = les ? allLessons.findIndex((l) => l.id === les.id) : -1;
    const prev = flatIdx > 0 ? allLessons[flatIdx - 1] : undefined;
    const next = flatIdx >= 0 && flatIdx < allLessons.length - 1 ? allLessons[flatIdx + 1] : undefined;

    const matIds = les?.materials?.map((m) => m.id) ?? [];

    return {
      activeChapter: chap,
      activeLesson: les,
      resolvedChapterNumber: String(chapIdx >= 0 ? chapIdx + 1 : propChapterNumber ?? '01').padStart(2, '0'),
      resolvedLessonNumber: String(lesIdx >= 0 ? lesIdx + 1 : propLessonNumber ?? '01').padStart(2, '0'),
      previousLesson: prev,
      nextLesson: next,
      totalLessonsCount: total,
      completedLessonsCount: completed,
      courseProgressPercent: pct,
      lessonMaterialIds: matIds,
    };
  }, [chapters, lessonId, propChapterNumber, propLessonNumber]);

  const resolvedLessonTitle =
    workspace?.lessonTitle || activeLesson?.title || propLessonTitle || 'Bài học';
  const currentLessonPercent = lessonProgress?.progressPercent ?? 0;
  const isCurrentLessonCompleted = lessonProgress?.status === 'COMPLETED';

  // Feed current Course + Chapter + Lesson context into the floating Socratic Owl AI widget
  useEffect(() => {
    setSocraticLessonContext({
      courseId,
      courseCode: resolvedCourseCode,
      courseName: resolvedCourseName,
      chapterTitle: activeChapter?.title,
      lessonId: activeLesson?.id || lessonId,
      lessonTitle: resolvedLessonTitle,
      materialIds: lessonMaterialIds,
    });
    return () => {
      setSocraticLessonContext(null);
    };
  }, [
    courseId,
    resolvedCourseCode,
    resolvedCourseName,
    activeChapter?.title,
    activeLesson?.id,
    lessonId,
    resolvedLessonTitle,
    lessonMaterialIds,
  ]);

  const handleToggleFocusMode = () => {
    if (!isFocusMode) {
      setIsLeftSidebarOpen(false);
      setIsFocusMode(true);
      showToast('Đã bật Chế độ Tập trung: Ẩn thanh bên để tối ưu diện tích học');
    } else {
      setIsLeftSidebarOpen(true);
      setIsFocusMode(false);
      showToast('Đã thoát Chế độ Tập trung');
    }
  };

  const handleSelectLessonItem = (targetLessonId: string, targetLessonTitle: string) => {
    showToast(`Đang chuyển sang: "${targetLessonTitle}"`);
    router.push(`/courses/${courseId}/lessons/${targetLessonId}`);
  };

  const handleAddLessonInChapter = (targetChapterId: string) => {
    const chapIdx = chapters.findIndex((c) => c.id === targetChapterId);
    const chap = chapIdx >= 0 ? chapters[chapIdx] : undefined;
    const nextNum = (chap?.lessons?.length ?? 0) + 1;
    const defaultTitle = `Bài ${chapIdx >= 0 ? chapIdx + 1 : 1}.${nextNum} - Chưa đặt tên`;
    addLessonMutation.mutate(
      {
        chapterId: targetChapterId,
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
          showToast('Đã tạo trang bài học mới!');
          router.push(`/courses/${courseId}/lessons/${createdLesson.id}?mode=edit`);
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Không thể tạo bài học mới.';
          showToast(msg);
        },
      }
    );
  };

  const handleDeleteChapterInSidebar = (
    targetChapterId: string,
    targetChapterTitle: string
  ) => {
    deleteChapterMutation.mutate(targetChapterId, {
      onSuccess: () => {
        showToast(`Đã xóa chương "${targetChapterTitle}".`);
        const deletedChap = chapters.find((c) => c.id === targetChapterId);
        if (deletedChap?.lessons.some((l) => l.id === lessonId)) {
          router.push(`/courses/${courseId}`);
        }
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Không thể xóa chương học.';
        showToast(msg);
      },
    });
  };

  const handleDeleteLessonInSidebar = (
    targetLessonId: string,
    targetLessonTitle: string
  ) => {
    deleteLessonMutation.mutate(targetLessonId, {
      onSuccess: () => {
        showToast(`Đã xóa bài học "${targetLessonTitle}".`);
        if (targetLessonId === lessonId) {
          const remaining = chapters
            .flatMap((c) => c.lessons)
            .find((l) => l.id !== targetLessonId);
          if (remaining) {
            router.push(`/courses/${courseId}/lessons/${remaining.id}?mode=edit`);
          } else {
            router.push(`/courses/${courseId}`);
          }
        }
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Không thể xóa bài học.';
        showToast(msg);
      },
    });
  };

  const handleToggleComplete = () => {
    const nextCompleted = !isCurrentLessonCompleted;
    completeLessonMutation.mutate(
      {
        isCompleted: nextCompleted,
        lastAccessedBlockId: blocks[blocks.length - 1]?.id ?? null,
      },
      {
        onSuccess: () => {
          showToast(
            nextCompleted
              ? 'Đã đánh dấu hoàn thành bài học!'
              : 'Đã chuyển bài học về trạng thái Đang học.'
          );
        },
        onError: () => {
          showToast('Không thể cập nhật tiến độ bài học.');
        },
      }
    );
  };

  const handleCompleteAndNext = () => {
    completeLessonMutation.mutate(
      {
        isCompleted: true,
        lastAccessedBlockId: blocks[blocks.length - 1]?.id ?? null,
      },
      {
        onSuccess: () => {
          if (nextLesson) {
            handleSelectLessonItem(nextLesson.id, nextLesson.title);
          } else {
            showToast('Chúc mừng! Bạn đã hoàn thành bài học cuối cùng của môn học.');
          }
        },
        onError: () => {
          if (nextLesson) {
            handleSelectLessonItem(nextLesson.id, nextLesson.title);
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs sm:text-sm font-bold flex items-center gap-2 border-[2px] border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-[19px] text-emerald-400 dark:text-emerald-600">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <LessonWorkspaceHeader
        courseId={courseId}
        courseCode={resolvedCourseCode}
        courseName={resolvedCourseName}
        classGroup={classGroup || `${resolvedCourseCode}`}
        chapterNumber={resolvedChapterNumber}
        lessonNumber={resolvedLessonNumber}
        lessonTitle={resolvedLessonTitle}
        activeNavTab={activeNavTab}
        onSelectNavTab={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'syllabus') {
            setIsLeftSidebarOpen(true);
            showToast('Đã mở Cây giáo trình khóa học');
          } else if (tab === 'resources') {
            showToast('Xem các khối Slide / Video / Tài liệu ngay trong bài học');
          } else if (tab === 'discussion') {
            showToast('Bấm nút Hỏi Cú AI trên từng khối hoặc mở Cú AI ở góc phải dưới!');
          }
        }}
        isLeftSidebarOpen={isLeftSidebarOpen}
        onToggleLeftSidebar={() => {
          setIsLeftSidebarOpen((prev) => !prev);
          if (isFocusMode) setIsFocusMode(false);
        }}
        isRightSidebarOpen={false}
        onToggleRightSidebar={() =>
          showToast('Hãy bấm vào biểu tượng Cú AI ở góc dưới bên phải để hỏi đáp theo ngữ cảnh bài học!')
        }
        isFocusMode={isFocusMode}
        onToggleFocusMode={handleToggleFocusMode}
        onOpenNotes={() => setIsNotesDrawerOpen(true)}
        overallProgress={courseProgressPercent}
        lessonProgress={currentLessonPercent}
        onHelpClick={() =>
          showToast(
            'Mẹo: Di chuột vào khối bất kỳ và bấm "Hỏi Cú AI" để hỏi trực tiếp về khối đó!'
          )
        }
      />

      {/* Main 2-Column Learning Body (Left Syllabus + Modular Block Canvas) */}
      <main className="w-full flex-1 flex relative min-h-0">
        {!isFocusMode && (
          <LessonSyllabusSidebar
            courseCode={resolvedCourseCode}
            semester={course?.semester}
            chapters={chapters}
            progressPercent={courseProgressPercent}
            completedLessonsCount={completedLessonsCount}
            totalLessonsCount={totalLessonsCount}
            activeLessonId={activeLesson?.id || lessonId}
            canEdit={effectiveCanEdit}
            isCollapsed={!isLeftSidebarOpen}
            onToggleCollapse={() => {
              setIsLeftSidebarOpen((prev) => !prev);
              if (isFocusMode) setIsFocusMode(false);
            }}
            onAddLessonInChapter={handleAddLessonInChapter}
            onDeleteChapter={handleDeleteChapterInSidebar}
            onDeleteLesson={handleDeleteLessonInSidebar}
            onSelectLessonItem={handleSelectLessonItem}
            onToast={showToast}
          />
        )}

<div className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          <LessonBlockCanvas
            onToast={showToast}
            lessonTitle={resolvedLessonTitle}
            lessonDurationMinutes={activeLesson?.duration ?? 45}
            isPublished={activeLesson?.isPublished ?? true}
            blocks={blocks}
            canEdit={effectiveCanEdit}
            isEditorMode={effectiveCanEdit ? isEditorMode : false}
            onToggleEditorMode={() => setIsEditorMode((p) => !p)}
            legacyContent={legacyContent}
            isLoading={isBlocksLoading}
            isError={isBlocksError}
            onRetry={() => refetchBlocks()}
            saveStatus={saveStatus}
            onFlushSave={() => void flushPendingSave()}
            onUpdateLessonMeta={(patch) =>
              updateLessonMutation.mutate(
                { lessonId, input: patch },
                {
                  onSuccess: () => showToast('Đã lưu thông tin bài học!'),
                  onError: () => showToast('Không thể cập nhật bài học.'),
                }
              )
            }
            onApplyTemplate={(blockTypes) =>
              applyTemplateMutation.mutate(
                { blockTypes, lessonTitle: resolvedLessonTitle },
                {
                  onSuccess: () => showToast('Đã khởi tạo mẫu khối cho bài học!'),
                  onError: () => showToast('Không thể tạo các khối mẫu.'),
                }
              )
            }
            isApplyingTemplate={applyTemplateMutation.isPending}
            onAddBlock={(type, afterBlockId) =>
              addBlockMutation.mutate(
                {
                  type,
                  content: createDefaultBlockContent(type),
                  afterBlockId,
                },
                {
                  onError: () => showToast('Không thể thêm khối mới. Vui lòng thử lại.'),
                }
              )
            }
            onUpdateBlock={updateBlockLocal}
            onReorderBlock={(blockId, targetIndex) =>
              reorderMutation.mutate({ blockId, targetIndex })
            }
            onDeleteBlock={(blockId) =>
              deleteBlockMutation.mutate(blockId, {
                onError: () => showToast('Không thể xóa khối này.'),
              })
            }
            onSubmitQuizAttempt={(blockId, selectedIndex) =>
              quizAttemptMutation.mutate(
                { blockId, selectedIndex },
                {
                  onSuccess: (res) => {
                    showToast(
                      res.isCorrect
                        ? 'Chính xác! Tiến độ bài học đã được cập nhật.'
                        : 'Chưa đúng, hãy xem lại giải thích hoặc thử lại.'
                    );
                  },
                  onError: () => showToast('Không thể nộp đáp án quiz.'),
                }
              )
            }
            isQuizSubmitting={quizAttemptMutation.isPending}
            onVideoProgress={(blockId, watchedSeconds, durationSeconds) =>
              videoProgressMutation.mutate({
                blockId,
                watchedSeconds,
                durationSeconds,
                isCompleted:
                  durationSeconds > 0 && watchedSeconds / durationSeconds >= 0.85,
              })
            }
          />
          <div className="h-10 w-full" />
        </div>
      </main>

      {/* Bottom Sticky Workspace Bar */}
      <LessonBottomWorkspaceBar
        previousLessonTitle={previousLesson?.title || 'Chưa có bài trước'}
        nextLessonTitle={nextLesson?.title || 'Bài học cuối cùng'}
        isCompleted={isCurrentLessonCompleted}
        progressPercent={currentLessonPercent}
        isUpdating={completeLessonMutation.isPending}
        onGoPrevious={() => {
          if (previousLesson) {
            handleSelectLessonItem(previousLesson.id, previousLesson.title);
          } else {
            showToast('Đây là bài học đầu tiên.');
          }
        }}
        onGoNext={() => {
          if (nextLesson) {
            handleSelectLessonItem(nextLesson.id, nextLesson.title);
          } else {
            showToast('Bạn đã đến bài học cuối cùng của môn học.');
          }
        }}
        onToggleComplete={handleToggleComplete}
        onCompleteAndNext={handleCompleteAndNext}
        onToast={showToast}
      />

      {/* Quick Notes Drawer */}
      <LessonNotesDrawer
        isOpen={isNotesDrawerOpen}
        onClose={() => setIsNotesDrawerOpen(false)}
        lessonId={lessonId}
        lessonTitle={`Bài ${resolvedChapterNumber}.${resolvedLessonNumber}: ${resolvedLessonTitle}`}
        onToast={showToast}
      />
    </div>
  );
}
