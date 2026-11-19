'use client';

import React from 'react';

/**
 * Shared layout & surface tokens scoped to Module 5 (Assignments & Exams lists).
 * Uses the Assignments list geometry as the canonical template across all 4 screens
 * (Student/Teacher × Assignments/Exams): wide main column minmax(0, 1fr) + compact
 * 260px aside column (gap 24px), 2px outer borders, 12px radius, 44px controls.
 */
export const ASSESSMENT_UI = {
  wrapper: 'w-full flex flex-col gap-6 min-w-0',
  grid: 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-6 items-start w-full',
  mainColumn: 'min-w-0 w-full flex flex-col gap-4',
  asideColumn: 'w-full min-w-0 flex flex-col gap-4',
  cardList: 'flex flex-col gap-4 w-full min-w-0',

  // Primary card surfaces (2px outer border, 12px radius, 24px desktop padding)
  featuredCard:
    'rounded-xl border-2 border-slate-700/60 hover:border-[#0059BB] p-5 sm:p-6 text-white shadow-[0_8px_24px_-4px_rgba(13,28,50,0.28)] bg-gradient-to-br from-[#0D1C32] via-[#0F2444] to-[#122C54] w-full min-w-0 transition-all',
  surfaceCard:
    'rounded-xl bg-white dark:bg-slate-900 border-2 border-[#E2E8F0] dark:border-slate-800 hover:border-[#0059BB]/60 p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(10,25,47,0.04)] w-full min-w-0 transition-all',
  toolbarCard:
    'rounded-xl bg-white dark:bg-slate-900 border-2 border-[#E2E8F0] dark:border-slate-800 p-4 shadow-xs w-full min-w-0',
  asideCard:
    'rounded-xl bg-white dark:bg-slate-900 border-2 border-[#E2E8F0] dark:border-slate-800 p-5 shadow-xs w-full min-w-0',
  paginationCard:
    'rounded-xl bg-white dark:bg-slate-900 border-2 border-[#E2E8F0] dark:border-slate-800 px-5 py-3.5 shadow-xs w-full min-w-0 flex flex-col sm:flex-row items-center justify-between gap-3',
  emptyCard:
    'rounded-xl bg-white dark:bg-slate-900 border-2 border-dashed border-[#E2E8F0] dark:border-slate-800 p-8 sm:p-10 text-center w-full min-w-0',
  errorCard:
    'rounded-xl bg-red-50/70 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/60 p-8 sm:p-10 text-center w-full min-w-0',

  // Controls (unified 44px height, single 1px inner border to avoid double-thick borders)
  inputControl:
    'w-full h-11 pl-10 pr-10 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0059BB]/20 focus:border-[#0059BB] transition-all',
  selectControl:
    'h-11 px-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0059BB]/20 focus:border-[#0059BB] cursor-pointer',

  // Action buttons (unified heights & primary #0059BB)
  createCtaBtn:
    'inline-flex items-center justify-center gap-1.5 h-11 px-4 sm:px-5 rounded-xl bg-[#0059BB] hover:bg-[#004493] text-white text-sm font-semibold shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap active:scale-98',
  primaryBtn:
    'inline-flex items-center justify-center gap-1.5 min-h-[42px] px-4 sm:px-5 py-2 rounded-xl bg-[#0059BB] hover:bg-[#004493] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer shrink-0 whitespace-nowrap active:scale-98',
  featuredPrimaryBtn:
    'inline-flex items-center justify-center gap-1.5 min-h-[42px] px-4 sm:px-5 py-2 rounded-xl bg-[#0070EA] hover:bg-[#0059BB] text-white text-sm font-semibold shadow-md transition-colors cursor-pointer shrink-0 whitespace-nowrap active:scale-98',
  secondaryBtn:
    'inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap',
  featuredSecondaryBtn:
    'inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/15 transition-colors cursor-pointer shrink-0 whitespace-nowrap',

  // Typography
  pageTitle: 'text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight',
  pageSubtitle: 'text-sm text-slate-500 dark:text-slate-400 mt-1 truncate',
  countBadge:
    'px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0',
  cardIconBox: 'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
  cardTitle: 'text-[20px] leading-[28px] font-semibold tracking-tight break-words [overflow-wrap:anywhere]',
} as const;

export interface AssessmentSubtabToggleProps {
  activeTab: 'assignments' | 'exams';
  assignmentsLabel: string;
  examsLabel: string;
  onChange: (tab: 'assignments' | 'exams') => void;
}

export function AssessmentSubtabToggle({
  activeTab,
  assignmentsLabel,
  examsLabel,
  onChange,
}: AssessmentSubtabToggleProps) {
  return (
    <div
      data-assessment-toggle="subtab"
      className="inline-flex items-center p-1 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700 shadow-xs shrink-0"
    >
      <button
        type="button"
        aria-pressed={activeTab === 'assignments'}
        onClick={() => onChange('assignments')}
        className={`h-9 px-4 rounded-lg text-sm transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
          activeTab === 'assignments'
            ? 'bg-[#0059BB] text-white font-semibold shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">assignment</span>
        <span>{assignmentsLabel}</span>
      </button>
      <button
        type="button"
        aria-pressed={activeTab === 'exams'}
        onClick={() => onChange('exams')}
        className={`h-9 px-4 rounded-lg text-sm transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
          activeTab === 'exams'
            ? 'bg-[#0059BB] text-white font-semibold shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">quiz</span>
        <span>{examsLabel}</span>
      </button>
    </div>
  );
}

export interface AssessmentListHeaderProps {
  title: string;
  subtitle?: string;
  countBadgeText?: string | null;
  countBadgeId?: string;
  actions?: React.ReactNode;
}

export function AssessmentListHeader({
  title,
  subtitle,
  countBadgeText,
  countBadgeId,
  actions,
}: AssessmentListHeaderProps) {
  return (
    <div
      data-assessment-header="unified"
      className="flex flex-wrap items-center justify-between gap-4 w-full min-w-0"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className={ASSESSMENT_UI.pageTitle}>{title}</h1>
          {countBadgeText && (
            <span id={countBadgeId} className={ASSESSMENT_UI.countBadge}>
              {countBadgeText}
            </span>
          )}
        </div>
        {subtitle && <p className={ASSESSMENT_UI.pageSubtitle}>{subtitle}</p>}
      </div>

      {actions && (
        <div className="flex items-center gap-3 flex-wrap shrink-0">{actions}</div>
      )}
    </div>
  );
}

export interface AssessmentTwoColumnLayoutProps {
  main: React.ReactNode;
  aside: React.ReactNode;
}

export function AssessmentTwoColumnLayout({
  main,
  aside,
}: AssessmentTwoColumnLayoutProps) {
  return (
    <div className={ASSESSMENT_UI.grid} data-assessment-layout="unified-260">
      <div className={ASSESSMENT_UI.mainColumn} data-assessment-col="main">
        {main}
      </div>
      <aside className={ASSESSMENT_UI.asideColumn} data-assessment-col="aside">
        {aside}
      </aside>
    </div>
  );
}

export interface AssessmentAsidePanelProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AssessmentAsidePanel({
  icon,
  title,
  children,
  footer,
}: AssessmentAsidePanelProps) {
  return (
    <section
      data-assessment-aside-panel="true"
      className={`${ASSESSMENT_UI.asideCard} flex flex-col gap-4`}
    >
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-400 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {title}
        </h2>
      </div>

      <div className="flex flex-col gap-3">{children}</div>

      {footer && (
        <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
          {footer}
        </div>
      )}
    </section>
  );
}

export type AssessmentBadgeVariant =
  | 'neutral'
  | 'type'
  | 'lateAllowed'
  | 'unsubmitted'
  | 'pendingGrading'
  | 'graded'
  | 'overdue'
  | 'late'
  | 'scheduleOpen'
  | 'scheduleUpcoming'
  | 'scheduleClosed'
  | 'published'
  | 'unpublished';

export interface AssessmentBadgeProps {
  variant: AssessmentBadgeVariant;
  surface?: 'light' | 'navy';
  icon?: string;
  spinIcon?: boolean;
  dot?: 'solid' | 'ping';
  dataStatus?: string;
  children: React.ReactNode;
}

const BADGE_STYLES: Record<
  AssessmentBadgeVariant,
  { light: string; navy: string; dotLight?: string; dotNavy?: string }
> = {
  neutral: {
    light:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    navy: 'bg-white/10 text-slate-200 border-white/15',
    dotLight: 'bg-slate-400',
    dotNavy: 'bg-slate-400',
  },
  type: {
    light:
      'bg-blue-50 dark:bg-blue-950/60 text-[#004493] dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80',
    navy: 'bg-[#0059BB]/35 text-sky-200 border-sky-400/35',
  },
  lateAllowed: {
    light:
      'bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80',
    navy: 'bg-blue-500/15 text-blue-200 border-blue-400/30',
  },
  unsubmitted: {
    light:
      'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    navy: 'bg-rose-950/75 text-rose-200 border-rose-500/60',
  },
  pendingGrading: {
    light:
      'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    navy: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
  },
  graded: {
    light:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    navy: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
  },
  overdue: {
    light:
      'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    navy: 'bg-orange-500/20 text-orange-200 border-orange-400/50',
  },
  late: {
    light:
      'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-800',
    navy: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
  },
  scheduleOpen: {
    light:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    navy: 'bg-[#0059BB] text-white border-[#0070EA]',
    dotLight: 'bg-emerald-600 dark:bg-emerald-400',
    dotNavy: 'bg-white',
  },
  scheduleUpcoming: {
    light:
      'bg-blue-50 dark:bg-blue-950/60 text-[#0059BB] dark:text-blue-300 border-blue-200 dark:border-blue-800',
    navy: 'bg-sky-950/80 text-sky-200 border-sky-400/50',
    dotLight: 'bg-[#0059BB] dark:bg-blue-400',
    dotNavy: 'bg-sky-400',
  },
  scheduleClosed: {
    light:
      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    navy: 'bg-slate-800/90 text-slate-300 border-slate-500/50',
    dotLight: 'bg-slate-400',
    dotNavy: 'bg-slate-400',
  },
  published: {
    light:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    navy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    dotLight: 'bg-emerald-600 dark:bg-emerald-400',
    dotNavy: 'bg-emerald-400',
  },
  unpublished: {
    light:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    navy: 'bg-amber-500/20 text-amber-200 border-amber-400/35',
    dotLight: 'bg-amber-500 dark:bg-amber-400',
    dotNavy: 'bg-amber-300',
  },
};

export function AssessmentBadge({
  variant,
  surface = 'light',
  icon,
  spinIcon = false,
  dot,
  dataStatus,
  children,
}: AssessmentBadgeProps) {
  const style = BADGE_STYLES[variant];
  const colorClasses = surface === 'navy' ? style.navy : style.light;
  const dotColor = surface === 'navy' ? style.dotNavy : style.dotLight;

  return (
    <span
      data-badge-variant={variant}
      data-publish-status={dataStatus}
      className={`inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full text-xs font-semibold leading-none border whitespace-nowrap shrink-0 ${colorClasses}`}
    >
      {dot === 'ping' && dotColor && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className={`animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
          />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>
      )}
      {dot === 'solid' && dotColor && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      )}
      {icon && (
        <span
          aria-hidden="true"
          style={{ fontSize: '15px', lineHeight: 1 }}
          className={`material-symbols-outlined shrink-0 ${
            spinIcon ? 'inline-block animate-[spin_2s_linear_infinite] motion-reduce:animate-none' : ''
          }`}
        >
          {icon}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

export interface AssessmentCardHeaderProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badges?: React.ReactNode;
}

/**
 * Unified top header row for all Featured Navy Cards and White Cards across
 * all 4 list screens: Left keeps Icon + Title (+ optional course/date subtitle),
 * Right groups all chips/badges with 8px gap and right alignment even on wrap.
 */
export function AssessmentCardHeader({
  icon,
  title,
  subtitle,
  badges,
}: AssessmentCardHeaderProps) {
  return (
    <div
      data-card-header="unified"
      className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2.5 w-full min-w-0"
    >
      <div
        data-card-identity="left"
        className="flex items-center gap-3 min-w-0 flex-1 basis-[260px]"
      >
        <div className="shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          {title}
          {subtitle}
        </div>
      </div>

      {badges && (
        <div
          data-card-badges="right"
          className="flex flex-wrap items-center justify-end gap-2 ml-auto shrink-0 max-w-full"
        >
          {badges}
        </div>
      )}
    </div>
  );
}
