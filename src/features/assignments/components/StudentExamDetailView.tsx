'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamDetail } from '../hooks/useExamDetail';
import { useExamQuestions } from '../hooks/useExamQuestions';
import {
  computeExamScheduleStatus,
  isExamUuid,
  isStaticShowcaseExam,
  parseExamLocalTimestamp,
} from '../services/exam.service';
import { normalizeExamStatus, type ExamQuestionItem } from '../schemas/exam.schema';

export interface StudentExamDetailViewProps {
  classId: string;
  examId: string;
  className?: string;
  onBack?: () => void;
}

const MAX_SET_TIMEOUT_MS = 2_147_483_647;
const BOUNDARY_REFRESH_BUFFER_MS = 500;

function parseExamDateTimeParts(isoString?: string | null): { time: string; date: string } {
  if (!isoString) return { time: '--:--', date: '--/--/----' };
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hours, minutes] = match;
    return {
      time: `${hours}:${minutes}`,
      date: `${day}/${month}/${year}`,
    };
  }
  const ts = parseExamLocalTimestamp(isoString);
  if (ts === null) return { time: '--:--', date: '--/--/----' };
  const d = new Date(ts);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return {
    time: `${hours}:${minutes}`,
    date: `${day}/${month}/${year}`,
  };
}

function formatExamTime(isoString?: string | null): string {
  return parseExamDateTimeParts(isoString).time;
}

function formatExamDate(isoString?: string | null): string {
  return parseExamDateTimeParts(isoString).date;
}

function formatExamDateTime(isoString?: string | null): string {
  const parts = parseExamDateTimeParts(isoString);
  return `${parts.time} - ${parts.date}`;
}

function getExamTypeLabel(type?: string): string {
  switch (type) {
    case 'QUIZ':
      return 'Quiz';
    case 'MIDTERM':
      return 'Giữa kỳ';
    case 'FINAL':
      return 'Cuối kỳ';
    case 'COMPETITION':
    case 'CONTEST':
      return 'Cuộc thi';
    default:
      return type || 'Bài thi';
  }
}

function extractHttpStatus(error: unknown): number {
  if (!error || typeof error !== 'object') return 0;
  const errObj = error as {
    httpStatus?: number;
    status?: number;
    response?: { status?: number };
  };
  return errObj.httpStatus || errObj.response?.status || errObj.status || 0;
}

export function StudentExamDetailView({
  classId,
  examId,
  className,
  onBack,
}: StudentExamDetailViewProps) {
  const router = useRouter();
  const [clockNowMs, setClockNowMs] = useState<number>(() => Date.now());

  // 1. Fetch exam detail
  const {
    data: exam,
    isLoading: isLoadingExam,
    isError: isExamError,
    error: examError,
    refetch: refetchExam,
  } = useExamDetail(examId, classId);

  const isRealUuidExam = isExamUuid(exam?.id || examId);
  const isStaticDemo = isStaticShowcaseExam(exam?.id || examId);

  // Schedule status:
  // - Real UUID exam: strictly trust backend status (refetched at exact start/end boundaries & tab focus).
  // - Static showcase fixtures (EXAM_001..003): keep fixed showcase status.
  // - User-created/edited demo exams (exam-demo-*): compute live from startTime/endTime vs clockNowMs.
  const resolvedScheduleStatus = !exam
    ? undefined
    : !isRealUuidExam && !isStaticDemo
      ? (computeExamScheduleStatus(exam.startTime, exam.endTime, clockNowMs) ??
          normalizeExamStatus(exam.status))
      : normalizeExamStatus(exam.status);

  const isOpen = resolvedScheduleStatus === 'OPEN';
  const isUpcoming = resolvedScheduleStatus === 'UPCOMING';
  const isClosed = resolvedScheduleStatus === 'CLOSED';
  const isUnpublished = exam?.isPublished === false;
  const canViewQuestions = Boolean(exam?.isPublished && (isOpen || isClosed));

  // Schedule a single one-shot timer at the next upcoming startTime/endTime boundary
  // so status transitions automatically without F5 and without per-second API polling.
  useEffect(() => {
    if (!exam || isStaticDemo) return;

    const startMs = parseExamLocalTimestamp(exam.startTime);
    const endMs = parseExamLocalTimestamp(exam.endTime);
    const now = Date.now();

    let nextBoundary: number | null = null;
    if (startMs !== null && startMs > now) {
      nextBoundary = startMs;
    } else if (endMs !== null && endMs > now) {
      nextBoundary = endMs;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (nextBoundary !== null) {
      const waitMs = Math.max(
        BOUNDARY_REFRESH_BUFFER_MS,
        Math.min(nextBoundary - now + BOUNDARY_REFRESH_BUFFER_MS, MAX_SET_TIMEOUT_MS)
      );
      timeoutId = setTimeout(() => {
        setClockNowMs(Date.now());
        if (isRealUuidExam) {
          void refetchExam();
        }
      }, waitMs);
    }

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'hidden') return;
      const resumedNow = Date.now();
      setClockNowMs(resumedNow);
      if (isRealUuidExam) {
        const crossedStart = startMs !== null && resumedNow >= startMs && exam.status === 'UPCOMING';
        const crossedEnd = endMs !== null && resumedNow >= endMs && exam.status !== 'CLOSED';
        if (crossedStart || crossedEnd) {
          void refetchExam();
        }
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [exam, isRealUuidExam, isStaticDemo, refetchExam, clockNowMs]);

  // 2. When isPublished === true and status === 'OPEN' | 'CLOSED', fetch exam questions
  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    isError: isQuestionsError,
    error: questionsError,
    refetch: refetchQuestions,
  } = useExamQuestions(examId, {
    enabled: canViewQuestions,
  });

  const handleBackToExams = () => {
    if (onBack) {
      onBack();
    } else {
      router.push(`/classes/${classId}?tab=assignments&subtab=exams`);
    }
  };

  if (isLoadingExam) {
    return (
      <div className="space-y-6 w-full min-w-0 animate-pulse">
        <div className="h-6 w-80 max-w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="lg:col-span-4 h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  const httpStatus = extractHttpStatus(examError);

  if (isExamError || !exam) {
    const is403 = httpStatus === 403;
    const is404 = httpStatus === 404;

    const errorTitle = is403
      ? 'Không có quyền truy cập bài thi'
      : is404
        ? 'Bài thi không tồn tại'
        : 'Không thể tải thông tin bài thi';

    const errorDesc = is403
      ? 'Bạn không có quyền xem thông tin bài thi này. Vui lòng liên hệ giảng viên.'
      : is404
        ? 'Bài thi này có thể đã bị xóa hoặc đường dẫn không chính xác.'
        : 'Đã xảy ra lỗi khi kết nối tới máy chủ. Vui lòng thử lại.';

    return (
      <div className="my-8 p-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 text-center space-y-4 max-w-xl mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/50 text-red-500 mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">
            {is403 ? 'lock' : is404 ? 'search_off' : 'error_outline'}
          </span>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {errorTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {errorDesc}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          {!is403 && !is404 && (
            <button
              type="button"
              onClick={() => refetchExam()}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
            >
              Thử lại
            </button>
          )}
          <button
            type="button"
            onClick={handleBackToExams}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Quay lại danh sách bài thi
          </button>
        </div>
      </div>
    );
  }

  const courseDisplayName = exam.courseName?.trim() || className?.trim() || '';
  const courseDisplayCode = exam.courseCode?.trim() || '';
  const courseLabel =
    courseDisplayName && courseDisplayCode
      ? `${courseDisplayName} (${courseDisplayCode})`
      : courseDisplayName || courseDisplayCode;

  const totalScoreVal =
    typeof exam.totalScore === 'number' && !Number.isNaN(exam.totalScore)
      ? exam.totalScore
      : typeof exam.maxScore === 'number' && !Number.isNaN(exam.maxScore)
        ? exam.maxScore
        : null;

  const durationMinutesVal =
    typeof exam.durationMinutes === 'number' && !Number.isNaN(exam.durationMinutes)
      ? exam.durationMinutes
      : null;

  const descriptionText = typeof exam.description === 'string' ? exam.description.trim() : '';

  // Questions array sorted by orderIndex (student-safe display only; never show answer keys)
  const sortedQuestions: ExamQuestionItem[] = (questionsData ?? [])
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const totalQuestionsScore = Number(
    sortedQuestions.reduce((sum, q) => sum + (q.score ?? 0), 0).toFixed(2)
  );

  // Never fabricate fallback counts (20 or 2). 0 is a valid count; null renders '—'.
  const hasExamQuestionCount =
    typeof exam.questionCount === 'number' && !Number.isNaN(exam.questionCount);
  const resolvedQuestionCount: number | null =
    canViewQuestions && !isLoadingQuestions && !isQuestionsError && Array.isArray(questionsData)
      ? sortedQuestions.length
      : hasExamQuestionCount
        ? exam.questionCount!
        : null;

  const questionsHttpStatus = extractHttpStatus(questionsError);
  const isQuestionsForbidden = isQuestionsError && questionsHttpStatus === 403;

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* 1. Header môn học phụ */}
      {courseLabel && (
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs sm:text-sm min-w-0">
          <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-blue-400 shrink-0">
            school
          </span>
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">
            Học phần: {courseLabel}
          </span>
        </div>
      )}

      {/* 2. Thẻ đầu mục thông tin bài thi (Exam Header Card) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border-2 border-slate-200/80 dark:border-slate-800 w-full min-w-0 overflow-hidden">
        {/* Hàng badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3 min-w-0">
          {isUnpublished && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Chưa công bố
            </span>
          )}

          {isOpen ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Đang mở
            </span>
          ) : isUpcoming ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Sắp mở
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Đã đóng
            </span>
          )}

          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
            {getExamTypeLabel(exam.examType)}
          </span>

          {courseLabel && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs max-w-full break-words [overflow-wrap:anywhere]">
              {courseLabel}
            </span>
          )}

          {totalScoreVal !== null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
              Thang điểm: {totalScoreVal} điểm
            </span>
          )}

          {durationMinutesVal !== null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
              Thời lượng: {durationMinutesVal} phút
            </span>
          )}
        </div>

        {/* Tiêu đề bài thi */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2 min-w-0 break-words [overflow-wrap:anywhere]">
          {exam.title}
        </h1>

        {/* Mô tả bài thi (chỉ hiển thị dữ liệu thật, ngắt dòng an toàn không tràn khung) */}
        {descriptionText && (
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-4xl w-full min-w-0 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {descriptionText}
          </p>
        )}
      </div>

      {/* 3. Bố cục 2 cột chính (8 : 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* CỘT TRÁI (8 Cột): Nội dung chi tiết bài thi & Danh sách câu hỏi */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0 w-full">
          {/* Thẻ 1: Thông số nội dung / Giới thiệu bài thi */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border-2 border-slate-200/80 dark:border-slate-800 min-w-0 w-full overflow-hidden">
            <div className="flex items-center gap-3 mb-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">
                  description
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Thông số nội dung
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Giới thiệu bài thi
                </h3>
              </div>
            </div>
            {descriptionText ? (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] min-w-0 max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_code]:break-words">
                {descriptionText}
              </p>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                Chưa có mô tả cho bài thi này.
              </p>
            )}
          </div>

          {/* Thẻ 2: Chế độ chỉ đọc - Danh sách câu hỏi trong đề (chỉ hiển thị khi đã công bố và OPEN / CLOSED) */}
          {canViewQuestions && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border-2 border-slate-200/80 dark:border-slate-800 min-w-0 w-full overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">
                      format_list_numbered
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Chế độ chỉ đọc
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      Danh sách câu hỏi trong đề
                    </h3>
                  </div>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium shrink-0">
                  {isQuestionsError
                    ? 'Không thể tải danh sách'
                    : isLoadingQuestions
                      ? 'Đang tải...'
                      : `${sortedQuestions.length} câu hỏi • ${totalQuestionsScore} điểm`}
                </span>
              </div>

              {/* Trạng thái danh sách câu hỏi */}
              {isLoadingQuestions ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />
                  <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />
                </div>
              ) : isQuestionsForbidden ? (
                <div
                  data-testid="exam-questions-forbidden"
                  className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3 min-w-0"
                >
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[22px] shrink-0 mt-0.5">
                    lock
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      Không có quyền tải danh sách câu hỏi (HTTP 403)
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed break-words [overflow-wrap:anywhere]">
                      Endpoint câu hỏi bài thi trên máy chủ hiện yêu cầu quyền quản lý đánh giá
                      (ASSESSMENT_MANAGE), nên tài khoản học viên chưa thể tải nội dung câu hỏi trực
                      tiếp. Vui lòng liên hệ giảng viên hoặc quản trị viên hệ thống.
                    </p>
                  </div>
                </div>
              ) : isQuestionsError ? (
                <div
                  data-testid="exam-questions-error"
                  className="p-6 text-center text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 space-y-2"
                >
                  <p className="font-semibold">Không thể tải danh sách câu hỏi.</p>
                  <p className="text-rose-500/90 dark:text-rose-300/80">
                    Đã xảy ra lỗi khi kết nối tới máy chủ. Vui lòng thử lại.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchQuestions()}
                    className="mt-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              ) : sortedQuestions.length === 0 ? (
                <div
                  data-testid="exam-questions-empty"
                  className="py-8 px-4 text-center space-y-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700"
                >
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Bài thi này hiện chưa có câu hỏi nào.
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Giảng viên chưa gắn câu hỏi vào đề thi hoặc danh sách câu hỏi đang trống.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 min-w-0">
                  {sortedQuestions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-200/80 dark:border-slate-800/80 min-w-0 overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-4 mb-1.5 min-w-0">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          Câu {q.orderIndex ?? idx + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-xs font-semibold shadow-xs border border-slate-200/60 dark:border-slate-700 shrink-0">
                          {q.score} điểm
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] min-w-0 max-w-full">
                        {q.questionContent || q.content || q.text || 'Nội dung câu hỏi'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CỘT PHẢI (4 Cột): Thẻ Thông tin bài thi */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-w-0 w-full">
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border-2 border-slate-200/80 dark:border-slate-800 flex flex-col min-w-0 w-full">
            {/* Header thẻ */}
            <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 min-w-0">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Thông tin bài thi
              </h3>
              {isOpen ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Đang mở
                </span>
              ) : isUpcoming ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-semibold shrink-0">
                  Sắp mở
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-300 dark:border-slate-700 text-xs font-semibold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Đã đóng
                </span>
              )}
            </div>

            {/* Danh sách 5 thông số */}
            <div className="flex flex-col gap-3 min-w-0">
              {/* Lịch mở đề */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0">
                    calendar_today
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Lịch mở đề
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono shrink-0">
                  {formatExamDateTime(exam.startTime)}
                </span>
              </div>

              {/* Lịch đóng đề */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0">
                    event_busy
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Lịch đóng đề
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono shrink-0">
                  {formatExamDateTime(exam.endTime)}
                </span>
              </div>

              {/* Thời lượng làm bài */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0">
                    timer
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Thời lượng làm bài
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 shrink-0">
                  {durationMinutesVal !== null ? `${durationMinutesVal} phút` : '—'}
                </span>
              </div>

              {/* Điểm tối đa */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0">
                    military_tech
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Điểm tối đa
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                  {totalScoreVal !== null ? `${totalScoreVal} điểm` : '—'}
                </span>
              </div>

              {/* Số lượng câu hỏi */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0">
                    quiz
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Số lượng câu hỏi
                  </span>
                </div>
                <span
                  data-testid="exam-question-count"
                  className="text-xs font-semibold text-slate-900 dark:text-slate-100 shrink-0"
                >
                  {canViewQuestions && isLoadingQuestions && resolvedQuestionCount === null
                    ? 'Đang tải...'
                    : resolvedQuestionCount !== null
                      ? `${resolvedQuestionCount} câu`
                      : '—'}
                </span>
              </div>
            </div>

            {/* Khối thông báo chưa công bố */}
            {isUnpublished && (
              <div
                data-testid="exam-unpublished-notice"
                className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 mt-4 flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[22px] shrink-0 mt-0.5">
                  visibility_off
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Bài thi chưa được công bố.
                  </p>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                    Nội dung câu hỏi chỉ hiển thị khi giảng viên công bố bài thi và đến thời gian mở đề.
                  </p>
                </div>
              </div>
            )}

            {/* Khối thông báo mở đề (Chỉ hiện khi đã công bố và Sắp mở / UPCOMING) */}
            {!isUnpublished && (
              <>
                {isUpcoming && (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 mt-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px] shrink-0 mt-0.5">
                      lock_clock
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-200">
                        Bài thi sẽ mở lúc {formatExamTime(exam.startTime)} ngày {formatExamDate(exam.startTime)}.
                      </p>
                    </div>
                  </div>
                )}

                {/* Khối thông báo đóng đề (Chỉ hiện khi Đã đóng / CLOSED) */}
                {isClosed && (
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 mt-4 flex items-center gap-2.5 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[20px] shrink-0">
                      event_busy
                    </span>
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                      Bài thi đã đóng lúc {formatExamTime(exam.endTime)} ngày {formatExamDate(exam.endTime)}.
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
