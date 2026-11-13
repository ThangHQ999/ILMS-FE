'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface TeacherHeroBannerProps {
  classNameTitle?: string;
  classCode?: string;
  semester?: string;
  advisorName?: string;
  studentsCount?: number;
  onInvite?: () => void;
  onOpenMeeting?: () => void;
  onOpenSettings?: () => void;
}

export function TeacherHeroBanner({
  classNameTitle,
  classCode,
  semester,
  advisorName,
  studentsCount = 42,
  onInvite,
  onOpenMeeting,
  onOpenSettings,
}: TeacherHeroBannerProps) {
  const t = useTranslations('dashboard.teacher');
  const [copied, setCopied] = useState(false);

  const title = classNameTitle || t('defaultClassName');
  const code = classCode || t('defaultClassCode');
  const term = semester || t('defaultSemester');
  const advisor = advisorName || t('defaultAdvisor');

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <section className="relative w-full rounded-3xl overflow-hidden bg-surface shadow-md3-1 dark:shadow-none border-none p-6 sm:p-8">
      {/* Decorative ambient background accents */}
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 -bottom-20 w-72 h-72 rounded-full bg-surface-variant/30 blur-3xl pointer-events-none" />

      {/* Subtle tech circuit grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5 dark:opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="circuit-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.75" />
            <circle cx="40" cy="40" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-grid)" />
      </svg>

      <div className="relative z-10 flex flex-col gap-6">
        {/* Upper Section: Title, Metadata Chips & Action Buttons */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-3xl">
            {/* Title & Code */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground font-sans">
                {title}
              </h1>

              {/* Class Code Pill with 1-click copy */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-variant text-on-surface text-sm font-mono font-semibold border-none">
                <span>{code}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent p-0 flex items-center"
                  title={copied ? t('codeCopied') : t('copyCode')}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-medium whitespace-nowrap border-none">
                {term}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-medium whitespace-nowrap border-none">
                <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                  school
                </span>
                <span>
                  {t('advisorLabel')}: <strong className="text-foreground font-semibold">{advisor}</strong>
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-container text-on-primary-container font-semibold whitespace-nowrap border-none">
                <span className="material-symbols-outlined text-[16px]">group</span>
                <span>{t('studentsCount', { count: studentsCount })}</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons Cluster */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start xl:self-auto">
            <button
              type="button"
              onClick={onInvite}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-container hover:bg-primary-container/85 text-on-primary-container font-medium text-sm whitespace-nowrap transition-colors border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>{t('inviteStudents')}</span>
            </button>

            <button
              type="button"
              onClick={onOpenMeeting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-variant hover:bg-surface-hover text-on-surface font-medium text-sm whitespace-nowrap transition-colors border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                videocam
              </span>
              <span>{t('openMeeting')}</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-variant hover:bg-surface-hover text-on-surface font-medium text-sm whitespace-nowrap transition-colors border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              <span>{t('settings')}</span>
            </button>
          </div>
        </div>

        {/* Lower Section: 4 Cohort Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Metric 1: Môn học đang mở */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/70 border border-[#E1E5EA] dark:border-[#282A2C] flex items-center gap-3.5 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-[#0B57D0] dark:text-[#A8C7FA] shadow-sm dark:shadow-none shrink-0">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground leading-tight">
                04
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
                {t('kpiActiveCourses')}
              </span>
            </div>
          </div>

          {/* Metric 2: Học viên chính thức */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/70 border border-[#E1E5EA] dark:border-[#282A2C] flex items-center gap-3.5 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-[#0B57D0] dark:text-[#A8C7FA] shadow-sm dark:shadow-none shrink-0">
              <span className="material-symbols-outlined text-[24px]">group</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground leading-tight">
                42
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
                {t('kpiOfficialStudents')}
              </span>
            </div>
          </div>

          {/* Metric 3: GV & Trợ giảng */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/70 border border-[#E1E5EA] dark:border-[#282A2C] flex items-center gap-3.5 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-[#0B57D0] dark:text-[#A8C7FA] shadow-sm dark:shadow-none shrink-0">
              <span className="material-symbols-outlined text-[24px]">co_present</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground leading-tight">
                03
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
                {t('kpiTeachingStaff')}
              </span>
            </div>
          </div>

          {/* Metric 4: Tỷ lệ chuyên cần */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/70 border border-[#E1E5EA] dark:border-[#282A2C] flex items-center gap-3.5 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-[#137333] dark:text-[#81C995] shadow-sm dark:shadow-none shrink-0">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground leading-tight">
                  96.5
                </span>
                <span className="text-base font-bold text-[#137333] dark:text-[#81C995]">%</span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
                {t('kpiAttendanceRate')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

