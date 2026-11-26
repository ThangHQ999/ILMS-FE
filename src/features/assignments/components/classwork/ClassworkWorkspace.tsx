'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CustomSelect, EmptyState, ErrorState } from '@/components/shared';
import { useClassworkContexts } from '../../hooks/useClasswork';
import { ClassworkPanel } from './ClassworkPanel';
import { CourseClassGradebook } from './CourseClassGradebook';

interface ClassworkWorkspaceProps {
  classId?: string;
  courseId?: string;
  courses?: ReadonlyArray<{ id: string; name: string }>;
  view: 'assignments' | 'gradebook';
}

export function ClassworkWorkspace({
  classId,
  courseId,
  courses = [],
  view,
}: ClassworkWorkspaceProps) {
  const t = useTranslations('classworkFlow');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const courseParam = params.get('courseId');

  // Auto-select first available course so the tab never opens on a blank "choose course" wall
  const activeCourseId =
    courseId ??
    (courses.find((course) => course.id === courseParam)?.id || courses[0]?.id || '');

  const context = useClassworkContexts(activeCourseId);
  const availableClasses = context.data?.items ?? [];
  const classParam = params.get('classId');
  const activeClassId =
    classId ??
    (availableClasses.find((item) => item.classId === classParam)?.classId ||
      availableClasses[0]?.classId ||
      '');
  const activeClass = availableClasses.find((item) => item.classId === activeClassId);
  const key = `${activeClassId}:${activeCourseId}`;

  function changeScope(id: string): void {
    const next = new URLSearchParams(params.toString());
    const field = courseId ? 'classId' : 'courseId';
    if (id) next.set(field, id);
    else next.delete(field);
    next.set('tab', view);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  // Empty state when class has no assigned courses yet (from class detail)
  if (!courseId && courses.length === 0) {
    return (
      <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-10 shadow-sm dark:shadow-none">
        <EmptyState
          icon="menu_book"
          title="Lớp học chưa có môn học nào"
          description="Hãy gắn ít nhất một môn học cho lớp để bắt đầu giao bài tập, quiz, bài kiểm tra và theo dõi bảng điểm."
          action={
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(params.toString());
                next.set('tab', 'subjects');
                router.replace(`${pathname}?${next}`, { scroll: false });
              }}
              className="rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2.5 text-sm font-medium text-white dark:text-[#062E6F]"
            >
              Đến tab Môn học
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Scope Switcher Bar (Gemini MD3) */}
      <section className="rounded-3xl bg-white dark:bg-[#1E1F20] p-4 sm:p-5 shadow-sm dark:shadow-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-2xl bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">
              {view === 'gradebook' ? 'grading' : 'assignment'}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              {view === 'gradebook' ? 'Bảng điểm theo môn học' : 'Bài tập & Kiểm tra trên lớp'}
            </h2>
            <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
              {courseId
                ? 'Chọn lớp học đang giảng dạy môn này'
                : 'Chọn môn học trong lớp để xem và giao nội dung'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="min-w-[220px]">
            <CustomSelect
              value={courseId ? activeClassId : activeCourseId}
              onChange={changeScope}
              options={
                courseId
                  ? availableClasses.length > 0
                    ? availableClasses.map((item) => ({
                        value: item.classId,
                        label: item.className,
                      }))
                    : [{ value: '', label: t('chooseClass') }]
                  : courses.map((course) => ({
                      value: course.id,
                      label: course.name,
                    }))
              }
            />
          </div>

          {view === 'gradebook' && activeClass?.canManage && activeCourseId && activeClassId && (
            <Link
              href={`/courses/${activeCourseId}/outcomes?${new URLSearchParams({
                classId: activeClassId,
                tab: 'heatmap',
              })}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-4 py-2.5 text-sm font-medium text-[#041E49] dark:text-[#C2E7FF] hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">grid_on</span>
              {t('heatmap')}
            </Link>
          )}
        </div>
      </section>

      {activeCourseId && context.isPending && (
        <div className="space-y-3" role="status">
          <div className="h-24 animate-pulse rounded-3xl bg-white dark:bg-[#1E1F20]" />
          <div className="h-24 animate-pulse rounded-3xl bg-white dark:bg-[#1E1F20]" />
          <span className="sr-only">{t('loading')}</span>
        </div>
      )}

      {context.isError && (
        <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-8">
          <ErrorState error={context.error} onRetry={() => void context.refetch()} />
        </div>
      )}

      {activeClass && activeCourseId ? (
        view === 'gradebook' ? (
          <CourseClassGradebook
            key={key}
            classId={activeClassId}
            courseId={activeCourseId}
            canManage={activeClass.canManage}
          />
        ) : (
          <ClassworkPanel
            key={key}
            classId={activeClassId}
            courseId={activeCourseId}
            canManage={activeClass.canManage}
            fromCourse={Boolean(courseId)}
          />
        )
      ) : !activeCourseId || (context.isSuccess && !context.isPending) ? (
        <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-8">
          <EmptyState
            icon="school"
            title={t('chooseScope')}
            description="Vui lòng chọn lớp học hoặc môn học hợp lệ ở bộ lọc phía trên."
          />
        </div>
      ) : null}
    </div>
  );
}
