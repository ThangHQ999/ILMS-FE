'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import type { PlayerAnswer, PlayerQuestion } from './AzotaInProgressPlayer';

export interface AssessmentViewSummary {
  assessmentId: string;
  title: string;
  description?: string | null;
  kind: 'QUIZ' | 'EXAM';
  maxScore: number;
  durationMinutes?: number | null;
  questionCount?: number | null;
  maxAttempts?: number | null;
  attemptsUsed?: number | null;
  remainingAttempts?: number | null;
  canRetry?: boolean | null;
  opensAt?: string | null;
  closesAt?: string | null;
  status:
    | 'READY'
    | 'UPCOMING'
    | 'CLOSED'
    | 'IN_PROGRESS'
    | 'WAITING_FOR_RESULTS'
    | 'SUBMITTED'
    | 'EXPIRED';
  score?: number | null;
  questions: PlayerQuestion[];
  answers: PlayerAnswer[];
}

interface AssessmentStatusShellViewProps {
  classId: string;
  courseId?: string | null;
  userFullName: string;
  backHref: string;
  view?: AssessmentViewSummary;
  isLoading: boolean;
  isError: boolean;
  isStarting: boolean;
  startError?: string | null;
  onRetry: () => void;
  onStart: () => void;
  onRefresh: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function AssessmentStatusShellView({
  classId,
  courseId,
  userFullName,
  backHref,
  view,
  isLoading,
  isError,
  isStarting,
  startError,
  onRetry,
  onStart,
  onRefresh,
}: AssessmentStatusShellViewProps) {
  const t = useTranslations('assessmentPlayer');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();

  const gradebookHref = `/classes/${classId}?tab=gradebook${
    courseId ? `&courseId=${encodeURIComponent(courseId)}` : ''
  }`;

  const scorePct =
    view && view.score != null && view.maxScore > 0
      ? Math.min(100, Math.round((view.score / view.maxScore) * 100))
      : null;

  const answeredCount = view
    ? view.answers.filter((a) => Boolean(a.selectedOptionId)).length
    : 0;

  const isNotClosed = !view?.closesAt || Date.parse(view.closesAt) > Date.now();
  const isSubmittedOrExpired =
    view?.status === 'SUBMITTED' || view?.status === 'EXPIRED';
  const canRetake = Boolean(
    view &&
      isSubmittedOrExpired &&
      isNotClosed &&
      (view.canRetry === true ||
        (view.canRetry !== false &&
          (view.remainingAttempts != null
            ? view.remainingAttempts > 0
            : view.maxAttempts != null &&
              view.maxAttempts > 1 &&
              (view.attemptsUsed == null || view.attemptsUsed < view.maxAttempts))))
  );

  return (
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] flex flex-col font-sans transition-colors">
      <DashboardSidebar
        isFocus={false}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        workspaceMode="student"
      />

      <DashboardHeader
        isFocus={false}
        showFocusMode={false}
        showRoleSwitcher={false}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => {}}
        userFullName={userFullName}
        workspaceMode="student"
        title={view?.status === 'SUBMITTED' ? 'Kết quả bài làm' : view?.title || 'Làm bài kiểm tra'}
      />

      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-16 px-4 sm:px-8 max-w-5xl w-full mx-auto space-y-6 ${
          isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#1E1F20] px-4 py-2 text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#E9EEF6] dark:hover:bg-[#282A2C] shadow-xs dark:shadow-none transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            <span>{t('back')}</span>
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-4" role="status">
            <div className="h-44 rounded-3xl bg-white dark:bg-[#1E1F20] animate-pulse" />
            <div className="h-28 rounded-3xl bg-white dark:bg-[#1E1F20] animate-pulse" />
            <span className="sr-only">{t('loading')}</span>
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className="rounded-3xl bg-white dark:bg-[#1E1F20] p-10 text-center space-y-4 shadow-sm dark:shadow-none"
          >
            <span className="material-symbols-outlined text-[42px] text-[#B3261E] dark:text-[#F2B8B5]">
              error
            </span>
            <p className="text-sm font-medium">{t('loadError')}</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2.5 text-sm font-medium text-white dark:text-[#062E6F] cursor-pointer"
            >
              {t('retry')}
            </button>
          </div>
        )}

        {/* READY TO START */}
        {view && view.status === 'READY' && (
          <section className="rounded-3xl bg-white dark:bg-[#1E1F20] p-6 sm:p-8 shadow-sm dark:shadow-none space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">quiz</span>
              </div>
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-1 text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                    {t(view.kind)}
                  </span>
                  {view.maxAttempts != null && view.maxAttempts > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-1 text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                      <span className="material-symbols-outlined text-[14px]">repeat</span>
                      Tối đa {view.maxAttempts} lượt
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-medium break-words">{view.title}</h1>
                {view.description && (
                  <p className="text-sm text-[#444746] dark:text-[#C4C7C5] whitespace-pre-wrap">
                    {view.description}
                  </p>
                )}
              </div>
            </div>

            {/* Primary Assessment Metrics (3 equal columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-4 flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">format_list_numbered</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">Số câu hỏi</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums">
                    {view.questionCount != null
                      ? `${view.questionCount} câu`
                      : view.questions.length > 0
                        ? `${view.questions.length} câu`
                        : '--'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-4 flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">timer</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">Thời gian làm bài</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums">
                    {view.durationMinutes != null && view.durationMinutes > 0
                      ? `${view.durationMinutes} phút`
                      : 'Không giới hạn'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-4 flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">Thang điểm tối đa</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums">
                    {view.maxScore} điểm
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Window (2 balanced columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#F0F4F9]/70 dark:bg-[#282A2C]/60 px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-[19px] text-[#444746] dark:text-[#C4C7C5]">
                  schedule
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">Mở lúc</p>
                  <p className="text-xs font-medium mt-0.5">
                    {view.opensAt ? new Date(view.opensAt).toLocaleString() : 'Đang mở'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#F0F4F9]/70 dark:bg-[#282A2C]/60 px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-[19px] text-[#444746] dark:text-[#C4C7C5]">
                  event_busy
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#444746] dark:text-[#C4C7C5]">Hạn đóng</p>
                  <p className="text-xs font-medium mt-0.5">
                    {view.closesAt ? new Date(view.closesAt).toLocaleString() : 'Không giới hạn'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-2 border-t border-[#E1E5EA] dark:border-[#333537] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[#444746] dark:text-[#C4C7C5] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>
                  {view.durationMinutes != null && view.durationMinutes > 0
                    ? `Đồng hồ đếm ngược ${view.durationMinutes} phút sẽ bắt đầu ngay khi bạn nhấn Bắt đầu.`
                    : 'Bài làm sẽ được tự động lưu liên tục trong quá trình bạn chọn đáp án.'}
                </span>
              </p>
              <button
                type="button"
                disabled={isStarting}
                onClick={onStart}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-7 py-3 text-sm font-medium text-white dark:text-[#062E6F] hover:opacity-90 disabled:opacity-50 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                {isStarting ? 'Đang bắt đầu...' : t('start')}
              </button>
            </div>
          </section>
        )}

        {/* RESULT / WAITING / CLOSED / UPCOMING / EXPIRED */}
        {view && view.status !== 'READY' && view.status !== 'IN_PROGRESS' && (
          <>
            <section className="rounded-3xl bg-white dark:bg-[#1E1F20] p-6 sm:p-8 shadow-sm dark:shadow-none space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center ${
                      view.status === 'SUBMITTED'
                        ? 'bg-[#C4EED0] text-[#072711] dark:bg-[#0F5223] dark:text-[#C4EED0]'
                        : view.status === 'WAITING_FOR_RESULTS'
                          ? 'bg-[#FEEFC3] text-[#4D3800] dark:bg-[#5C4300] dark:text-[#FEEFC3]'
                          : 'bg-[#E9EEF6] text-[#444746] dark:bg-[#282A2C] dark:text-[#C4C7C5]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[30px]">
                      {view.status === 'SUBMITTED'
                        ? 'task_alt'
                        : view.status === 'WAITING_FOR_RESULTS'
                          ? 'hourglass_top'
                          : 'event_busy'}
                    </span>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-3 py-0.5 text-xs font-medium text-[#041E49] dark:text-[#C2E7FF]">
                        {t(view.kind)}
                      </span>
                      <span
                        role="status"
                        className="rounded-full bg-[#C4EED0] dark:bg-[#0F5223] px-3 py-0.5 text-xs font-medium text-[#072711] dark:text-[#C4EED0]"
                      >
                        {t(view.status)}
                      </span>
                      {view.maxAttempts != null && view.maxAttempts > 1 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-0.5 text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                          <span className="material-symbols-outlined text-[13px]">repeat</span>
                          {view.remainingAttempts != null
                            ? `Còn ${view.remainingAttempts}/${view.maxAttempts} lượt`
                            : view.attemptsUsed != null
                              ? `Đã làm ${view.attemptsUsed}/${view.maxAttempts} lượt`
                              : `Tối đa ${view.maxAttempts} lượt`}
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-medium break-words">
                      {view.title}
                    </h1>
                    {view.description && (
                      <p className="text-sm text-[#444746] dark:text-[#C4C7C5]">
                        {view.description}
                      </p>
                    )}
                  </div>
                </div>

                {view.score != null && (
                  <div className="rounded-3xl bg-[#F0F4F9] dark:bg-[#282A2C] px-7 py-5 text-center shrink-0 min-w-[180px]">
                    <p className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                      Điểm số đạt được
                    </p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-[#0B57D0] dark:text-[#A8C7FA]">
                      {view.score}
                      <span className="text-base font-medium text-[#444746] dark:text-[#C4C7C5]">
                        /{view.maxScore}
                      </span>
                    </p>
                    {scorePct !== null && (
                      <p className="mt-1 text-xs font-medium text-[#146C2E] dark:text-[#6DD58C]">
                        Hoàn thành {scorePct}%
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-4">
                  <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">Thí sinh</p>
                  <p className="mt-1 text-sm font-semibold">
                    {userFullName || 'Học viên'}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-4">
                  <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">Số câu đã trả lời</p>
                  <p className="mt-1 text-sm font-semibold">
                    {view.questions.length > 0
                      ? `${answeredCount} / ${view.questions.length} câu`
                      : '--'}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-4">
                  <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">Trạng thái</p>
                  <p className="mt-1 text-sm font-semibold">{t(view.status)}</p>
                </div>
              </div>

              {startError && (
                <div
                  role="alert"
                  className="rounded-2xl bg-[#F9DEDC] dark:bg-[#8C1D18] text-[#410E0B] dark:text-[#F9DEDC] px-4 py-3 text-xs font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{startError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                {view.status === 'WAITING_FOR_RESULTS' && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-5 py-2.5 text-sm font-medium text-[#041E49] dark:text-[#C2E7FF] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    {t('refresh')}
                  </button>
                )}
                <Link
                  href={gradebookHref}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-5 py-2.5 text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]"
                >
                  <span className="material-symbols-outlined text-[18px]">grading</span>
                  Xem bảng điểm
                </Link>
                <Link
                  href={backHref}
                  className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium ${
                    canRetake
                      ? 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
                      : 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F]'
                  }`}
                >
                  {t('back')}
                </Link>
                {canRetake && (
                  <button
                    type="button"
                    disabled={isStarting}
                    onClick={onStart}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2.5 text-sm font-semibold text-white dark:text-[#062E6F] hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">replay</span>
                    {isStarting ? 'Đang tạo lượt mới...' : 'Làm lại bài'}
                  </button>
                )}
              </div>
            </section>

            {/* Submitted Answers Review (when questions are returned) */}
            {view.questions.length > 0 && (
              <section className="rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-sm dark:shadow-none space-y-4">
                <h2 className="text-base font-medium">Bài làm đã nộp</h2>
                <div className="space-y-3">
                  {view.questions.map((q, idx) => {
                    const chosenId = view.answers.find(
                      (a) => a.questionId === q.id
                    )?.selectedOptionId;
                    return (
                      <div
                        key={q.id}
                        className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-4 space-y-2.5"
                      >
                        <p className="text-sm font-medium">
                          Câu {idx + 1}: {q.content}
                        </p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = chosenId === opt.id;
                            const letter = OPTION_LETTERS[optIdx] ?? String(optIdx + 1);
                            return (
                              <div
                                key={opt.id}
                                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm ${
                                  isSelected
                                    ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#004A77] dark:text-[#C2E7FF] font-medium'
                                    : 'text-[#444746] dark:text-[#C4C7C5]'
                                }`}
                              >
                                <span className="font-bold">{letter}.</span>
                                <span className="flex-1">{opt.content}</span>
                                {isSelected && (
                                  <span className="text-[11px] font-semibold">Đã chọn</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
