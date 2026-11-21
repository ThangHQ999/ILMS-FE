'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ZodError } from 'zod';
import { useClassDetail } from '@/features/classes/hooks/useClassDetail';
import { useUserRole } from '@/hooks/useUserRole';
import {
  useClassExamsPaged,
  useAllClassExams,
  useVisibleExamDetails,
  type VisibleExamDetailEntry,
} from '../hooks/useExamQueries';
import {
  usePublishExam,
  useUnpublishExam,
  useDeleteExam,
} from '../hooks/useExamMutations';
import {
  normalizeExamStatus,
  normalizeExamType,
  type ExamItem,
} from '../schemas/exam.schema';
import {
  evaluateCanManageClassExams,
  formatExamLocalDate,
  formatExamLocalDateTime,
  isDemoExamClass,
} from '../services/exam.service';
import { formatScore } from '../services/assignment.service';
import {
  ASSESSMENT_UI,
  AssessmentAsidePanel,
  AssessmentBadge,
  AssessmentCardHeader,
  AssessmentListHeader,
  AssessmentTwoColumnLayout,
} from './AssessmentListPrimitives';

export type TeacherExamFilterType = 'ALL' | 'QUIZ' | 'MIDTERM' | 'FINAL' | 'CONTEST';
export type TeacherExamFilterStatus = 'ALL' | 'UPCOMING' | 'OPEN' | 'CLOSED';
type PendingExamAction = 'publish' | 'unpublish' | 'delete';

export interface TeacherExamsTableViewProps {
  classId: string;
  routeClassId?: string;
  className?: string;
  hideHeader?: boolean;
  canManageExams?: boolean;
  onTotalCountChange?: (count: number | null) => void;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onCreateExam?: () => void;
  onEditExam?: (examId: string) => void;
  onViewExam?: (examId: string) => void;
}

function getExamTypeVisuals(examType: string) {
  switch (normalizeExamType(examType)) {
    case 'QUIZ':
      return {
        icon: 'quiz',
        whiteBg: 'bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80',
        navyBg: 'bg-blue-500/20 text-sky-300 border border-sky-400/30',
        badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-[#004493] dark:text-blue-300',
      };
    case 'MIDTERM':
      return {
        icon: 'assignment',
        whiteBg: 'bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80',
        navyBg: 'bg-blue-500/20 text-sky-300 border border-sky-400/30',
        badgeClass: 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300',
      };
    case 'FINAL':
      return {
        icon: 'fact_check',
        whiteBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80',
        navyBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
      };
    case 'CONTEST':
      return {
        icon: 'emoji_events',
        whiteBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80',
        navyBg: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
        badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
      };
    default:
      return {
        icon: 'quiz',
        whiteBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
        navyBg: 'bg-white/10 text-sky-300 border border-white/15',
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      };
  }
}

function classifyExamError(error: unknown): 'FORBIDDEN' | 'SCHEMA' | 'GENERIC' {
  if (!error) return 'GENERIC';
  if (error instanceof ZodError) return 'SCHEMA';
  if (typeof error === 'object') {
    const e = error as {
      httpStatus?: number;
      code?: string;
      name?: string;
      response?: { status?: number };
    };
    const status = e.httpStatus || e.response?.status || 0;
    if (status === 403 || status === 401) return 'FORBIDDEN';
    if (e.code === 'SCHEMA_ERROR' || e.name === 'ZodError') return 'SCHEMA';
  }
  return 'GENERIC';
}

function extractMutationError(error: unknown): {
  status: number;
  message: string | null;
  isTimeout: boolean;
} {
  if (!error || typeof error !== 'object') {
    return { status: 0, message: null, isTimeout: false };
  }
  const e = error as {
    httpStatus?: number;
    status?: number;
    code?: string;
    message?: string;
    response?: { status?: number; data?: { message?: string; error?: string } };
  };
  const status = e.httpStatus || e.response?.status || e.status || 0;
  const serverMessage =
    e.response?.data?.message ||
    e.response?.data?.error ||
    (status > 0 && e.message ? e.message : null);
  const rawMsg = (e.message || '').toLowerCase();
  const isTimeout =
    e.code === 'ECONNABORTED' ||
    e.code === 'ETIMEDOUT' ||
    rawMsg.includes('timeout') ||
    status === 408 ||
    status === 504;

  return {
    status,
    message: serverMessage && serverMessage.trim() ? serverMessage.trim() : null,
    isTimeout,
  };
}

interface TeacherExamCardProps {
  exam: ExamItem;
  featured: boolean;
  isBottomCard: boolean;
  courseCode: string | null;
  courseName: string | null;
  detailEntry?: VisibleExamDetailEntry;
  locale: string;
  canManage: boolean;
  isMenuOpen: boolean;
  pendingAction?: PendingExamAction;
  triggerRef: (el: HTMLButtonElement | null) => void;
  onToggleMenu: (examId: string) => void;
  onCloseMenu: (restoreFocus?: boolean) => void;
  onViewExam: (examId: string) => void;
  onEditExam: (examId: string) => void;
  onPublishExam: (exam: ExamItem) => void;
  onRequestUnpublish: (exam: ExamItem) => void;
  onRequestDelete: (exam: ExamItem) => void;
  t: ReturnType<typeof useTranslations<'assignments.exams.teacher'>>;
}

function TeacherExamCard({
  exam,
  featured,
  isBottomCard,
  courseCode,
  courseName,
  detailEntry,
  locale,
  canManage,
  isMenuOpen,
  pendingAction,
  triggerRef,
  onToggleMenu,
  onCloseMenu,
  onViewExam,
  onEditExam,
  onPublishExam,
  onRequestUnpublish,
  onRequestDelete,
  t,
}: TeacherExamCardProps) {
  const normalizedType = normalizeExamType(exam.examType);
  const normalizedStatus = normalizeExamStatus(exam.status);
  const visuals = getExamTypeVisuals(normalizedType);

  const detailData = detailEntry?.data;
  const isDetailLoading = Boolean(detailEntry?.isLoading);
  const isDetailError = Boolean(detailEntry?.isError);

  // Never default isPublished to true; read strictly from detail/summary boolean
  const resolvedIsPublished: boolean | null =
    typeof detailData?.isPublished === 'boolean'
      ? detailData.isPublished
      : typeof exam.isPublished === 'boolean'
        ? exam.isPublished
        : null;

  const typeLabel =
    normalizedType === 'QUIZ'
      ? t('typeQuiz')
      : normalizedType === 'MIDTERM'
        ? t('typeMidterm')
        : normalizedType === 'FINAL'
          ? t('typeFinal')
          : normalizedType === 'CONTEST'
            ? t('typeContest')
            : exam.examType;

  const scheduleLabel =
    normalizedStatus === 'OPEN'
      ? t('statusOpen')
      : normalizedStatus === 'UPCOMING'
        ? t('statusUpcoming')
        : t('statusClosed');

  const rawDescription =
    typeof detailData?.description === 'string'
      ? detailData.description.trim()
      : typeof exam.description === 'string'
        ? exam.description.trim()
        : '';

  // questionCount=0 is valid; never default to 25/40
  const resolvedQuestionCount =
    typeof detailData?.questionCount === 'number' && !isNaN(detailData.questionCount)
      ? detailData.questionCount
      : typeof exam.questionCount === 'number' && !isNaN(exam.questionCount)
        ? exam.questionCount
        : null;

  // durationMinutes & totalScore strictly from API (never default 60 or 10)
  const resolvedDuration =
    typeof exam.durationMinutes === 'number' && !isNaN(exam.durationMinutes)
      ? exam.durationMinutes
      : typeof detailData?.durationMinutes === 'number' && !isNaN(detailData.durationMinutes)
        ? detailData.durationMinutes
        : null;

  const resolvedMaxScore =
    typeof exam.totalScore === 'number' && !isNaN(exam.totalScore)
      ? exam.totalScore
      : typeof detailData?.totalScore === 'number' && !isNaN(detailData.totalScore)
        ? detailData.totalScore
        : typeof exam.maxScore === 'number' && !isNaN(exam.maxScore)
          ? exam.maxScore
          : null;

  // Timestamp metric: "Cập nhật" uses updatedAt, "Ngày tạo" uses createdAt (never 2024 or render time)
  const resolvedCreatedAt = detailData?.createdAt ?? exam.createdAt ?? null;
  const resolvedUpdatedAt = detailData?.updatedAt ?? exam.updatedAt ?? null;
  const showUpdatedTimestamp = Boolean(
    resolvedUpdatedAt && (!resolvedCreatedAt || resolvedUpdatedAt !== resolvedCreatedAt)
  );
  const dateMetricIcon = showUpdatedTimestamp ? 'update' : 'calendar_today';
  const dateMetricLabel = showUpdatedTimestamp ? t('updatedDateLabel') : t('createdDateLabel');
  const dateMetricSource = showUpdatedTimestamp ? resolvedUpdatedAt : resolvedCreatedAt;
  const dateMetricFormatted = dateMetricSource ? formatExamLocalDate(dateMetricSource) : null;

  const surface = featured ? 'navy' : 'light';
  const scheduleBadgeVariant =
    normalizedStatus === 'OPEN'
      ? 'scheduleOpen'
      : normalizedStatus === 'UPCOMING'
        ? 'scheduleUpcoming'
        : 'scheduleClosed';

  const courseLabel =
    courseName && courseCode
      ? `${courseName} (${courseCode})`
      : courseName || courseCode || null;

  const isPending = Boolean(pendingAction);

  return (
    <article
      data-exam-id={exam.id}
      data-featured={featured ? 'true' : 'false'}
      data-exam-type={normalizedType}
      data-exam-status={normalizedStatus}
      data-exam-published={
        resolvedIsPublished === null ? 'unknown' : String(resolvedIsPublished)
      }
      className={
        featured
          ? `${ASSESSMENT_UI.featuredCard} flex flex-col gap-4`
          : `${ASSESSMENT_UI.surfaceCard} flex flex-col gap-4`
      }
    >
      {/* Unified Header: Left (Icon + Title + Course subtitle), Right (Type + Schedule + Publish Badges) */}
      <AssessmentCardHeader
        icon={
          <div
            data-card-icon-box="true"
            className={`${ASSESSMENT_UI.cardIconBox} ${
              featured ? visuals.navyBg : visuals.whiteBg
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '22px', lineHeight: 1 }}
            >
              {visuals.icon}
            </span>
          </div>
        }
        title={
          <h2
            className={`${ASSESSMENT_UI.cardTitle} ${
              featured
                ? 'text-white'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={() => onViewExam(exam.id)}
              className={`block w-full text-left transition-colors cursor-pointer break-words [overflow-wrap:anywhere] ${
                featured
                  ? 'hover:text-sky-300'
                  : 'hover:text-[#0059BB] dark:hover:text-blue-400'
              }`}
            >
              {exam.title}
            </button>
          </h2>
        }
        subtitle={
          courseLabel ? (
            <p
              className={`mt-1 flex items-center gap-1.5 text-xs font-medium min-w-0 ${
                featured ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span
                aria-hidden="true"
                className={`material-symbols-outlined text-[15px] shrink-0 ${
                  featured ? 'text-blue-400' : 'text-[#0059BB] dark:text-blue-400'
                }`}
              >
                school
              </span>
              <span className="truncate">{courseLabel}</span>
            </p>
          ) : undefined
        }
        badges={
          <>
            <AssessmentBadge variant="type" surface={surface}>
              {typeLabel}
            </AssessmentBadge>
            <AssessmentBadge
              variant={scheduleBadgeVariant}
              surface={surface}
              dot={featured && normalizedStatus === 'OPEN' ? 'ping' : 'solid'}
            >
              {scheduleLabel}
            </AssessmentBadge>
            {resolvedIsPublished === true ? (
              <AssessmentBadge
                variant="published"
                surface={surface}
                dot="solid"
                dataStatus="published"
              >
                {t('publishedLabel')}
              </AssessmentBadge>
            ) : resolvedIsPublished === false ? (
              <AssessmentBadge
                variant="unpublished"
                surface={surface}
                dot="solid"
                dataStatus="unpublished"
              >
                {t('unpublishedLabel')}
              </AssessmentBadge>
            ) : (
              <AssessmentBadge
                variant="neutral"
                surface={surface}
                dot="solid"
                dataStatus="unknown"
              >
                {t('publishUnknownLabel')}
              </AssessmentBadge>
            )}
          </>
        }
      />

      {/* Description & Detail Error Notice */}
      {isDetailLoading && !rawDescription ? (
        <div className="space-y-1.5 animate-pulse">
          <div
            className={`h-3.5 w-5/6 rounded ${
              featured ? 'bg-white/15' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
          <div
            className={`h-3.5 w-2/3 rounded ${
              featured ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800/70'
            }`}
          />
        </div>
      ) : rawDescription ? (
        <p
          className={`text-sm leading-relaxed line-clamp-3 break-words [overflow-wrap:anywhere] ${
            featured ? 'text-slate-300/90' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {rawDescription}
        </p>
      ) : null}

      {isDetailError && (
        <div
          className={`inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg border self-start ${
            featured
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">warning</span>
          <span>{t('detailLoadError')}</span>
          <button
            type="button"
            onClick={() => detailEntry?.refetch()}
            className={`font-semibold underline cursor-pointer ${
              featured ? 'text-white hover:text-sky-200' : 'text-[#0059BB] dark:text-blue-400'
            }`}
          >
            {t('retryDetailBtn')}
          </button>
        </div>
      )}

      {/* 4 Key Metrics Grid: Question count, Duration, Max score, Created/Updated date */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl border text-xs ${
          featured
            ? 'bg-white/5 border-white/10'
            : 'bg-[#F8FAFC] dark:bg-slate-800/40 border-[#E2E8F0] dark:border-slate-700/80'
        }`}
      >
        {/* 1. Question Count */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className={`text-[11px] font-medium flex items-center gap-1 ${
              featured ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[14px] shrink-0 ${
                featured ? 'text-blue-400' : 'text-[#0059BB] dark:text-blue-400'
              }`}
            >
              format_list_numbered
            </span>
            <span className="truncate">{t('questionCountLabel')}</span>
          </span>
          {isDetailLoading && resolvedQuestionCount === null ? (
            <span
              className={`inline-block h-4 w-16 rounded animate-pulse mt-0.5 ${
                featured ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ) : resolvedQuestionCount !== null ? (
            <span
              className={`text-sm font-bold truncate ${
                featured ? 'text-white' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {t('questionCountValue', { count: resolvedQuestionCount })}
            </span>
          ) : (
            <span
              className={`text-xs font-medium truncate ${
                featured ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t('questionCountUnloaded')}
            </span>
          )}
        </div>

        {/* 2. Duration */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className={`text-[11px] font-medium flex items-center gap-1 ${
              featured ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[14px] shrink-0 ${
                featured ? 'text-blue-400' : 'text-[#0059BB] dark:text-blue-400'
              }`}
            >
              timer
            </span>
            <span className="truncate">{t('durationLabel')}</span>
          </span>
          <span
            className={`text-sm font-bold truncate ${
              featured ? 'text-white' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {resolvedDuration !== null
              ? t('durationValue', { minutes: resolvedDuration })
              : t('missingMetric')}
          </span>
        </div>

        {/* 3. Max Score */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className={`text-[11px] font-medium flex items-center gap-1 ${
              featured ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[14px] shrink-0 ${
                featured ? 'text-blue-400' : 'text-[#0059BB] dark:text-blue-400'
              }`}
            >
              grade
            </span>
            <span className="truncate">{t('maxScoreLabel')}</span>
          </span>
          <span
            className={`text-sm font-bold truncate ${
              featured ? 'text-white' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {resolvedMaxScore !== null
              ? t('maxScoreValue', { score: formatScore(resolvedMaxScore, locale) })
              : t('missingMetric')}
          </span>
        </div>

        {/* 4. Created / Updated Timestamp */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className={`text-[11px] font-medium flex items-center gap-1 ${
              featured ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[14px] shrink-0 ${
                featured ? 'text-blue-400' : 'text-[#0059BB] dark:text-blue-400'
              }`}
            >
              {dateMetricIcon}
            </span>
            <span className="truncate">{dateMetricLabel}</span>
          </span>
          {isDetailLoading && !dateMetricFormatted ? (
            <span
              className={`inline-block h-4 w-20 rounded animate-pulse mt-0.5 ${
                featured ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ) : (
            <span
              className={`text-sm font-bold truncate ${
                featured ? 'text-white' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {dateMetricFormatted || t('missingMetric')}
            </span>
          )}
        </div>
      </div>

      {/* Schedule: Open & Close (LocalDateTime) */}
      <div
        className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-xs pt-0.5 ${
          featured ? 'text-slate-300/85' : 'text-slate-600 dark:text-slate-400'
        }`}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span
            className={`material-symbols-outlined text-[16px] ${
              featured ? 'text-blue-300' : 'text-[#0059BB] dark:text-blue-400'
            }`}
          >
            login
          </span>
          <span>{t('openTimeLabel')}</span>
          <strong
            className={`font-semibold ${
              featured ? 'text-white' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {formatExamLocalDateTime(exam.startTime)}
          </strong>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span
            className={`material-symbols-outlined text-[16px] ${
              featured ? 'text-blue-300' : 'text-[#0059BB] dark:text-blue-400'
            }`}
          >
            lock_clock
          </span>
          <span>{t('closeTimeLabel')}</span>
          <strong
            className={`font-semibold ${
              featured ? 'text-white' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {formatExamLocalDateTime(exam.endTime)}
          </strong>
        </div>
      </div>

      {/* Footer Actions: More Menu (...) on left (authorized managers only) + View Details on right */}
      <div
        className={`flex items-center ${
          canManage ? 'justify-between' : 'justify-end'
        } pt-3.5 border-t gap-3 ${
          featured ? 'border-white/10' : 'border-[#E2E8F0] dark:border-slate-800'
        }`}
      >
        {canManage && (
          <div className="relative exam-action-menu-container shrink-0">
            <button
              ref={triggerRef}
              type="button"
              disabled={isPending}
              onClick={() => onToggleMenu(exam.id)}
              aria-label={t('moreActionsAria', { title: exam.title })}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              className={`btn-more-menu min-h-[42px] min-w-[42px] px-2.5 rounded-xl border transition-colors flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                featured
                  ? 'text-slate-300 hover:text-white hover:bg-white/10 border-white/15'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isPending ? (
                <span
                  className={`w-4 h-4 border-2 rounded-full animate-spin ${
                    featured
                      ? 'border-white/30 border-t-white'
                      : 'border-slate-300 border-t-[#0059BB]'
                  }`}
                />
              ) : (
                <span className="material-symbols-outlined text-[20px] leading-none">
                  more_horiz
                </span>
              )}
            </button>

            {isMenuOpen && !isPending && (
              <div
                role="menu"
                aria-label={t('moreActionsAria', { title: exam.title })}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    onCloseMenu(true);
                  }
                }}
                className={`row-action-menu absolute left-0 w-52 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-40 text-left ${
                  isBottomCard ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                }`}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onCloseMenu(false);
                    onEditExam(exam.id);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">
                    edit
                  </span>
                  <span>{t('actionEdit')}</span>
                </button>

                {resolvedIsPublished === true ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onCloseMenu(false);
                      onRequestUnpublish(exam);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      visibility_off
                    </span>
                    <span>{t('actionUnpublish')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onCloseMenu(false);
                      onPublishExam(exam);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">
                      visibility
                    </span>
                    <span>{t('actionPublish')}</span>
                  </button>
                )}

                <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onCloseMenu(false);
                    onRequestDelete(exam);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-red-600 dark:text-red-400">
                    delete
                  </span>
                  <span>{t('actionDelete')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => onViewExam(exam.id)}
          className={
            featured
              ? `${ASSESSMENT_UI.featuredPrimaryBtn} flex-1 sm:flex-initial`
              : `${ASSESSMENT_UI.primaryBtn} flex-1 sm:flex-initial`
          }
        >
          <span>{t('viewDetailBtn')}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </article>
  );
}

export function TeacherExamsTableView({
  classId,
  routeClassId,
  className,
  hideHeader = false,
  canManageExams,
  onTotalCountChange,
  onToast,
  onCreateExam,
  onEditExam,
  onViewExam,
}: TeacherExamsTableViewProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('assignments.exams.teacher');

  const [selectedType, setSelectedType] = useState<TeacherExamFilterType>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<TeacherExamFilterStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<'latest' | 'earliest'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 5;

  // Action menu & confirmation modal states
  const [openMenuExamId, setOpenMenuExamId] = useState<string | null>(null);
  const [examToUnpublish, setExamToUnpublish] = useState<ExamItem | null>(null);
  const [examToDelete, setExamToDelete] = useState<ExamItem | null>(null);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);
  const [pendingByExamId, setPendingByExamId] = useState<
    Record<string, PendingExamAction>
  >({});

  const menuTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Reset filters & modal state when switching class
  useEffect(() => {
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSortOrder('latest');
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(0);
    setOpenMenuExamId(null);
    setExamToUnpublish(null);
    setExamToDelete(null);
    setModalErrorMessage(null);
    setPendingByExamId({});
  }, [classId]);

  // Debounce search query by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close action menu on outside click or Escape key (restoring focus to trigger)
  const closeMenu = useCallback(
    (restoreFocus = false) => {
      const prevExamId = openMenuExamId;
      setOpenMenuExamId(null);
      if (restoreFocus && prevExamId) {
        requestAnimationFrame(() => {
          menuTriggerRefs.current[prevExamId]?.focus();
        });
      }
    },
    [openMenuExamId]
  );

  useEffect(() => {
    if (!openMenuExamId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('.exam-action-menu-container')) {
        closeMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuExamId, closeMenu]);

  // Close modals on Escape when not pending
  useEffect(() => {
    if (!examToUnpublish && !examToDelete) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (examToUnpublish && !pendingByExamId[examToUnpublish.id]) {
        setExamToUnpublish(null);
        setModalErrorMessage(null);
      }
      if (examToDelete && !pendingByExamId[examToDelete.id]) {
        setExamToDelete(null);
        setModalErrorMessage(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [examToUnpublish, examToDelete, pendingByExamId]);

  // Fetch class detail & user session for real courseCode lookup and strict permission verification
  const {
    data: classDetailData,
    isLoading: isClassDetailLoading,
    isError: isClassDetailError,
  } = useClassDetail(routeClassId || classId);
  const {
    user: currentUser,
    isStudent,
    isTeacher,
    isLoading: isUserRoleLoading,
  } = useUserRole();

  const effectiveCanManage = useMemo(() => {
    if (typeof canManageExams === 'boolean') return canManageExams;
    return evaluateCanManageClassExams({
      classId,
      isStudentView: isStudent,
      isDemoTeacherView: isTeacher,
      isAuthLoading: isUserRoleLoading,
      isClassLoading: isClassDetailLoading,
      isClassError: isClassDetailError,
      isClassInfoLive: classDetailData?.isClassInfoLive,
      isMembersLive: classDetailData?.isMembersLive,
      user: currentUser,
      classInfo: classDetailData?.classInfo,
      members: classDetailData?.members,
    });
  }, [
    canManageExams,
    classId,
    isStudent,
    isTeacher,
    isUserRoleLoading,
    isClassDetailLoading,
    isClassDetailError,
    classDetailData,
    currentUser,
  ]);

  const courseById = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    const canTrustCourses =
      Boolean(classDetailData?.isCoursesLive) || isDemoExamClass(classId);
    if (!canTrustCourses) return map;
    const list = Array.isArray(classDetailData?.courses)
      ? classDetailData.courses
      : [];
    for (const c of list) {
      if (c.id) {
        map.set(c.id, { code: c.code, name: c.name });
      }
    }
    return map;
  }, [classDetailData, classId]);

  const isSearching = Boolean(debouncedSearch.trim());
  const hasActiveFilters =
    isSearching || selectedType !== 'ALL' || selectedStatus !== 'ALL';

  // Normal server-side paginated query (size=5, enabled when not searching by title)
  const {
    data: pagedData,
    isLoading: isPagedLoading,
    isError: isPagedError,
    error: pagedError,
    refetch: refetchPaged,
  } = useClassExamsPaged(
    classId,
    {
      page,
      size: pageSize,
      examType: selectedType,
      status: selectedStatus,
      sort: sortOrder,
      onlyPublished: false,
    },
    !isSearching
  );

  // Full multi-page aggregation query (enabled ONLY when searching by title)
  const {
    data: allExamsData,
    isLoading: isAllLoading,
    isError: isAllError,
    error: allError,
    refetch: refetchAll,
  } = useAllClassExams(
    classId,
    {
      examType: selectedType,
      status: selectedStatus,
      sort: sortOrder,
      onlyPublished: false,
    },
    isSearching
  );

  // Mutations
  const publishMutation = usePublishExam(classId);
  const unpublishMutation = useUnpublishExam(classId);
  const deleteMutation = useDeleteExam(classId);

  const searchFilteredItems = useMemo(() => {
    if (!isSearching) return [];
    const q = debouncedSearch.trim().toLowerCase();
    return (allExamsData || []).filter((item) =>
      item.title.toLowerCase().includes(q)
    );
  }, [allExamsData, debouncedSearch, isSearching]);

  const isLoading = isSearching ? isAllLoading : isPagedLoading;
  const isError = isSearching ? isAllError : isPagedError;
  const activeError = isSearching ? allError : pagedError;

  const totalElements = isSearching
    ? searchFilteredItems.length
    : (pagedData?.totalElements ?? 0);

  const totalPages = Math.max(
    1,
    isSearching
      ? Math.ceil(totalElements / pageSize)
      : (pagedData?.totalPages ?? 1)
  );

  // Notify parent header of real total count in current scope
  useEffect(() => {
    if (!onTotalCountChange) return;
    if (isLoading || isError) {
      onTotalCountChange(null);
    } else {
      onTotalCountChange(totalElements);
    }
  }, [onTotalCountChange, isLoading, isError, totalElements]);

  // Adjust current page if last page becomes empty after delete/filter change
  useEffect(() => {
    if (!isLoading && page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [isLoading, page, totalPages]);

  const items: ExamItem[] = useMemo(() => {
    if (isSearching) {
      return searchFilteredItems.slice(page * pageSize, (page + 1) * pageSize);
    }
    return (pagedData?.items ?? []).slice(0, pageSize);
  }, [isSearching, searchFilteredItems, page, pageSize, pagedData]);

  // Enrich ONLY visible exams on current page via GET /api/v1/exams/{examId} (max 3 concurrent)
  const visibleExamIds = useMemo(() => items.map((e) => e.id), [items]);
  const detailMap = useVisibleExamDetails(visibleExamIds, classId);

  const featuredExam = items.length > 0 ? items[0] : null;
  const regularExams = items.length > 1 ? items.slice(1) : [];

  const fromRecord = totalElements === 0 ? 0 : page * pageSize + 1;
  const toRecord =
    totalElements === 0
      ? 0
      : Math.min(page * pageSize + items.length, totalElements);

  const handleRefetch = useCallback(() => {
    if (isSearching) {
      refetchAll();
    } else {
      refetchPaged();
    }
  }, [isSearching, refetchAll, refetchPaged]);

  const notify = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      if (onToast) onToast(message, type);
    },
    [onToast]
  );

  const setExamPending = (examId: string, action: PendingExamAction | null) => {
    setPendingByExamId((prev) => {
      if (!action) {
        const next = { ...prev };
        delete next[examId];
        return next;
      }
      return { ...prev, [examId]: action };
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(0);
  };

  const handleTypeChange = (type: TeacherExamFilterType) => {
    setSelectedType(type);
    setPage(0);
  };

  const handleStatusChange = (status: TeacherExamFilterStatus) => {
    setSelectedStatus(status);
    setPage(0);
  };

  const handleSortChange = (order: 'latest' | 'earliest') => {
    setSortOrder(order);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSortOrder('latest');
    setPage(0);
  };

  const targetRouteClass = routeClassId || classId;

  const handleCreateClick = () => {
    if (!effectiveCanManage) {
      notify(t('errorActionForbidden'), 'error');
      return;
    }
    if (onCreateExam) {
      onCreateExam();
    } else {
      router.push(
        `/classes/${targetRouteClass}?tab=assignments&subtab=exams&action=create`
      );
    }
  };

  const handleEditClick = (examId: string) => {
    if (!effectiveCanManage) {
      notify(t('errorActionForbidden'), 'error');
      return;
    }
    if (onEditExam) {
      onEditExam(examId);
    } else {
      router.push(
        `/classes/${targetRouteClass}?tab=assignments&subtab=exams&action=edit-exam&examId=${examId}`
      );
    }
  };

  const handleViewExamClick = (examId: string) => {
    if (onViewExam) {
      onViewExam(examId);
    } else {
      router.push(
        `/classes/${targetRouteClass}?tab=assignments&subtab=exams&action=exam-detail&examId=${examId}`
      );
    }
  };

  // Real Mutation 1: Publish exam (PATCH /api/v1/exams/{examId}/publish, empty body)
  const handlePublishExam = async (exam: ExamItem) => {
    if (!effectiveCanManage) {
      notify(t('errorActionForbidden'), 'error');
      return;
    }
    if (pendingByExamId[exam.id]) return;

    setExamPending(exam.id, 'publish');
    try {
      await publishMutation.mutateAsync(exam.id);
      notify(t('toastPublishSuccess', { title: exam.title }), 'success');
    } catch (err: unknown) {
      const info = extractMutationError(err);
      if (info.isTimeout) {
        handleRefetch();
        detailMap[exam.id]?.refetch();
        notify(t('errorTimeoutSync'), 'error');
      } else if (info.status === 403) {
        notify(info.message || t('errorActionForbidden'), 'error');
      } else {
        notify(info.message || t('errorPublishDefault'), 'error');
      }
    } finally {
      setExamPending(exam.id, null);
    }
  };

  // Real Mutation 2: Unpublish exam (after confirmation modal)
  const handleConfirmUnpublish = async () => {
    if (!examToUnpublish) return;
    if (!effectiveCanManage) {
      setModalErrorMessage(t('errorActionForbidden'));
      notify(t('errorActionForbidden'), 'error');
      return;
    }
    const target = examToUnpublish;
    if (pendingByExamId[target.id]) return;

    setModalErrorMessage(null);
    setExamPending(target.id, 'unpublish');
    try {
      await unpublishMutation.mutateAsync(target.id);
      setExamToUnpublish(null);
      notify(t('toastUnpublishSuccess', { title: target.title }), 'success');
    } catch (err: unknown) {
      const info = extractMutationError(err);
      let errMsg: string;
      if (info.isTimeout) {
        handleRefetch();
        detailMap[target.id]?.refetch();
        errMsg = t('errorTimeoutSync');
      } else if (info.status === 403) {
        errMsg = info.message || t('errorActionForbidden');
      } else {
        errMsg = info.message || t('errorUnpublishDefault');
      }
      setModalErrorMessage(errMsg);
      notify(errMsg, 'error');
    } finally {
      setExamPending(target.id, null);
    }
  };

  // Real Mutation 3: Delete exam (after confirmation modal; 204 removes, 409 preserves)
  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    if (!effectiveCanManage) {
      setModalErrorMessage(t('errorActionForbidden'));
      notify(t('errorActionForbidden'), 'error');
      return;
    }
    const target = examToDelete;
    if (pendingByExamId[target.id]) return;

    setModalErrorMessage(null);
    setExamPending(target.id, 'delete');
    try {
      await deleteMutation.mutateAsync(target.id);
      setExamToDelete(null);
      notify(t('toastDeleteSuccess', { title: target.title }), 'success');
      if (page > 0 && items.length <= 1) {
        setPage((prev) => Math.max(0, prev - 1));
      }
    } catch (err: unknown) {
      const info = extractMutationError(err);
      let errMsg: string;
      if (info.isTimeout) {
        handleRefetch();
        detailMap[target.id]?.refetch();
        errMsg = t('errorTimeoutSync');
      } else if (info.status === 403) {
        errMsg = info.message || t('errorActionForbidden');
      } else if (info.status === 409) {
        errMsg = info.message || t('errorDeleteConflict');
      } else {
        errMsg = info.message || t('errorDeleteDefault');
      }
      setModalErrorMessage(errMsg);
      notify(errMsg, 'error');
    } finally {
      setExamPending(target.id, null);
    }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
    return Array.from({ length: 5 }, (_, i) => start + i);
  }, [page, totalPages]);

  const errorKind = classifyExamError(activeError);

  const renderCard = (exam: ExamItem, featured: boolean, cardIndex: number) => {
    const lookedUp = exam.courseId ? courseById.get(exam.courseId) : undefined;
    const courseCode = exam.courseCode?.trim() || lookedUp?.code || null;
    const courseName = exam.courseName?.trim() || lookedUp?.name || null;
    const isBottomCard = !featured && items.length > 2 && cardIndex >= items.length - 2;

    return (
      <TeacherExamCard
        key={exam.id}
        exam={exam}
        featured={featured}
        isBottomCard={isBottomCard}
        courseCode={courseCode}
        courseName={courseName}
        detailEntry={detailMap[exam.id]}
        locale={locale}
        canManage={effectiveCanManage}
        isMenuOpen={openMenuExamId === exam.id}
        pendingAction={pendingByExamId[exam.id]}
        triggerRef={(el) => {
          menuTriggerRefs.current[exam.id] = el;
        }}
        onToggleMenu={(id) =>
          setOpenMenuExamId((prev) => (prev === id ? null : id))
        }
        onCloseMenu={closeMenu}
        onViewExam={handleViewExamClick}
        onEditExam={handleEditClick}
        onPublishExam={handlePublishExam}
        onRequestUnpublish={(target) => {
          setModalErrorMessage(null);
          setExamToUnpublish(target);
        }}
        onRequestDelete={(target) => {
          setModalErrorMessage(null);
          setExamToDelete(target);
        }}
        t={t}
      />
    );
  };

  const typeOptions: Array<{ id: TeacherExamFilterType; label: string }> = [
    { id: 'ALL', label: t('typeAll') },
    { id: 'QUIZ', label: t('typeQuiz') },
    { id: 'MIDTERM', label: t('typeMidterm') },
    { id: 'FINAL', label: t('typeFinal') },
    { id: 'CONTEST', label: t('typeContest') },
  ];

  const statusOptions: Array<{ id: TeacherExamFilterStatus; label: string }> = [
    { id: 'ALL', label: t('statusAll') },
    { id: 'UPCOMING', label: t('statusUpcoming') },
    { id: 'OPEN', label: t('statusOpen') },
    { id: 'CLOSED', label: t('statusClosed') },
  ];

  const renderFilterToolbar = () => (
    <div className={`${ASSESSMENT_UI.toolbarCard} flex flex-col gap-3.5`}>
      {/* Row 1: Search Input + Sort Selector (unified 44px controls) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="relative flex-1 min-w-0">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
            search
          </span>
          <input
            id="inputSearchExam"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder={t('searchPlaceholder')}
            className={ASSESSMENT_UI.inputControl}
          />
          {searchQuery && (
            <button
              id="btnClearSearch"
              type="button"
              onClick={handleClearSearch}
              aria-label={t('clearSearchAria')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label
            htmlFor="selectTeacherExamSort"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap"
          >
            {t('sortLabel')}
          </label>
          <select
            id="selectTeacherExamSort"
            value={sortOrder}
            onChange={(e) =>
              handleSortChange(e.target.value as 'latest' | 'earliest')
            }
            className={ASSESSMENT_UI.selectControl}
          >
            <option value="latest">{t('sortLatest')}</option>
            <option value="earliest">{t('sortEarliest')}</option>
          </select>
        </div>
      </div>

      {/* Row 2: Type Chips & Schedule Status Chips */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 min-w-0">
        {/* Type Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            {t('filterTypeLabel')}
          </span>
          {typeOptions.map((opt) => {
            const active = selectedType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => handleTypeChange(opt.id)}
                className={`filter-type-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#0059BB] text-white shadow-xs'
                    : 'bg-[#F0F4F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            {t('filterStatusLabel')}
          </span>
          {statusOptions.map((opt) => {
            const active = selectedStatus === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => handleStatusChange(opt.id)}
                className={`filter-status-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#0059BB] text-white shadow-xs'
                    : 'bg-[#F0F4F8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className={ASSESSMENT_UI.wrapper}>
      {/* Standalone Header (hidden when TeacherAssignmentsTableView renders the unified header) */}
      {!hideHeader && (
        <AssessmentListHeader
          title={t('pageTitle')}
          subtitle={className}
          countBadgeId="totalExamsCountBadge"
          countBadgeText={!isLoading && !isError ? t('countBadge', { count: totalElements }) : null}
          actions={
            effectiveCanManage ? (
              <button
                id="btnCreateExam"
                type="button"
                onClick={handleCreateClick}
                className={ASSESSMENT_UI.createCtaBtn}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>{t('createExamBtn')}</span>
              </button>
            ) : undefined
          }
        />
      )}

      {/* Unified 2-Column Desktop Grid: Main minmax(0, 1fr) + Aside 320px, gap 24px */}
      <AssessmentTwoColumnLayout
        main={
          <>
            {/* Loading State */}
            {isLoading && (
              <div className={ASSESSMENT_UI.cardList} aria-busy="true" aria-live="polite">
                <div className="h-64 rounded-xl bg-slate-900/10 dark:bg-slate-800/70 border-2 border-[#E2E8F0] dark:border-slate-800 animate-pulse" />
                <div className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800/60 border-2 border-[#E2E8F0] dark:border-slate-800 animate-pulse" />
                <div className="h-56 rounded-xl bg-slate-100 dark:bg-slate-800/60 border-2 border-[#E2E8F0] dark:border-slate-800 animate-pulse" />
              </div>
            )}

            {/* Error State (Strict — no fallback to demo/mock data) */}
            {!isLoading && isError && (
              <div role="alert" className={`${ASSESSMENT_UI.errorCard} space-y-3`}>
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[26px]">
                    {errorKind === 'FORBIDDEN'
                      ? 'lock'
                      : errorKind === 'SCHEMA'
                        ? 'data_alert'
                        : 'cloud_off'}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {errorKind === 'FORBIDDEN'
                    ? t('errorForbiddenTitle')
                    : errorKind === 'SCHEMA'
                      ? t('errorSchemaTitle')
                      : t('errorGenericTitle')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {errorKind === 'FORBIDDEN'
                    ? t('errorForbiddenDesc')
                    : errorKind === 'SCHEMA'
                      ? t('errorSchemaDesc')
                      : t('errorGenericDesc')}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRefetch}
                    className={ASSESSMENT_UI.primaryBtn}
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    <span>{t('retryBtn')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loaded Content */}
            {!isLoading && !isError && (
              <>
                {/* 1. Featured Navy Card (first record of current page; hidden when empty) */}
                {featuredExam && renderCard(featuredExam, true, 0)}

                {/* 2. Unified Search + Filter + Sort Toolbar */}
                {renderFilterToolbar()}

                {/* 3. Empty State (no fake hero) */}
                {items.length === 0 ? (
                  <div id="emptyFilterState" className={`${ASSESSMENT_UI.emptyCard} space-y-3`}>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-[26px]">
                        {hasActiveFilters ? 'search_off' : 'event_busy'}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {hasActiveFilters
                        ? t('emptyNoMatchTitle')
                        : t('emptyNoExamsTitle')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      {hasActiveFilters
                        ? t('emptyNoMatchDesc')
                        : t('emptyNoExamsDesc')}
                    </p>
                    {hasActiveFilters && (
                      <div className="pt-1">
                        <button
                          id="btnResetFilters"
                          type="button"
                          onClick={handleResetFilters}
                          className={ASSESSMENT_UI.primaryBtn}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            restart_alt
                          </span>
                          <span>{t('resetFiltersBtn')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* 4. Remaining White Cards (never duplicates featuredExam) */}
                    {regularExams.length > 0 && (
                      <div className={ASSESSMENT_UI.cardList}>
                        {regularExams.map((exam, idx) =>
                          renderCard(exam, false, idx + 1)
                        )}
                      </div>
                    )}

                    {/* 5. Pagination Footer */}
                    <div className={ASSESSMENT_UI.paginationCard}>
                      <span
                        id="totalExamsBadge"
                        className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400"
                      >
                        {t('paginationSummary', {
                          from: fromRecord,
                          to: toRecord,
                          total: totalElements,
                        })}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          id="btnPrevPage"
                          type="button"
                          disabled={page <= 0}
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          aria-label={t('prevPageAria')}
                          className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            chevron_left
                          </span>
                        </button>

                        {pageNumbers.map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setPage(num)}
                            aria-current={page === num ? 'page' : undefined}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                              page === num
                                ? 'bg-[#0059BB] text-white shadow-xs'
                                : 'border border-[#E2E8F0] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {num + 1}
                          </button>
                        ))}

                        <button
                          id="btnNextPage"
                          type="button"
                          disabled={page >= totalPages - 1}
                          onClick={() =>
                            setPage((p) => Math.min(totalPages - 1, p + 1))
                          }
                          aria-label={t('nextPageAria')}
                          className="w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            chevron_right
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        }
        aside={
          <AssessmentAsidePanel icon="gavel" title={t('policyPanelTitle')}>
            {/* Item 1: Publishing visibility */}
            <div className="p-3.5 rounded-xl bg-[#F0F4F8] dark:bg-slate-800/50 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 text-xs">
                <span className="material-symbols-outlined text-[#0059BB] dark:text-blue-400 text-[16px] shrink-0">
                  visibility
                </span>
                <span>{t('policyVisibilityTitle')}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {t('policyVisibilityDesc')}
              </p>
            </div>

            {/* Item 2: Question structure edit condition */}
            <div className="p-3.5 rounded-xl bg-[#F0F4F8] dark:bg-slate-800/50 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 text-xs">
                <span className="material-symbols-outlined text-[#0059BB] dark:text-blue-400 text-[16px] shrink-0">
                  lock
                </span>
                <span>{t('policyStructureTitle')}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {t('policyStructureDesc')}
              </p>
            </div>

            {/* Item 3: Question management */}
            <div className="p-3.5 rounded-xl bg-[#F0F4F8] dark:bg-slate-800/50 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 text-xs">
                <span className="material-symbols-outlined text-[#0059BB] dark:text-blue-400 text-[16px] shrink-0">
                  rule
                </span>
                <span>{t('policyQuestionsTitle')}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {t('policyQuestionsDesc')}
              </p>
            </div>
          </AssessmentAsidePanel>
        }
      />

      {/* Confirmation Modal: Unpublish Exam */}
      {examToUnpublish && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="unpublishExamModalTitle"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  visibility_off
                </span>
              </div>
              <h3
                id="unpublishExamModalTitle"
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                {t('unpublishModalTitle')}
              </h3>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 break-words [overflow-wrap:anywhere]">
              {t('unpublishModalMessage', { title: examToUnpublish.title })}
            </p>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
                info
              </span>
              <span>{t('unpublishModalImpact')}</span>
            </div>

            {modalErrorMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2"
              >
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  error
                </span>
                <span className="break-words [overflow-wrap:anywhere]">
                  {modalErrorMessage}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={Boolean(pendingByExamId[examToUnpublish.id])}
                onClick={() => {
                  setExamToUnpublish(null);
                  setModalErrorMessage(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                {t('unpublishModalCancel')}
              </button>
              <button
                id="btnConfirmUnpublishExam"
                type="button"
                disabled={Boolean(pendingByExamId[examToUnpublish.id])}
                onClick={handleConfirmUnpublish}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {pendingByExamId[examToUnpublish.id] && (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>
                  {pendingByExamId[examToUnpublish.id]
                    ? t('unpublishModalPending')
                    : t('unpublishModalConfirm')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Exam */}
      {examToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deleteExamModalTitle"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  delete_forever
                </span>
              </div>
              <h3
                id="deleteExamModalTitle"
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                {t('deleteModalTitle')}
              </h3>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 break-words [overflow-wrap:anywhere]">
              {t('deleteModalMessage', { title: examToDelete.title })}
            </p>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
                warning
              </span>
              <span>{t('deleteModalWarning')}</span>
            </div>

            {modalErrorMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2"
              >
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  error
                </span>
                <span className="break-words [overflow-wrap:anywhere]">
                  {modalErrorMessage}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={Boolean(pendingByExamId[examToDelete.id])}
                onClick={() => {
                  setExamToDelete(null);
                  setModalErrorMessage(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                {t('deleteModalCancel')}
              </button>
              <button
                id="btnConfirmDeleteExam"
                type="button"
                disabled={Boolean(pendingByExamId[examToDelete.id])}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {pendingByExamId[examToDelete.id] && (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>
                  {pendingByExamId[examToDelete.id]
                    ? t('deleteModalPending')
                    : t('deleteModalConfirm')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
