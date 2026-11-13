'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function TeacherOverviewTopMetrics() {
  const t = useTranslations('dashboard.teacher');

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Card 1: Lớp đang phụ trách */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none flex flex-col justify-between h-[160px] transition-transform hover:-translate-y-0.5 duration-200">
        {/* Top part: Title and Icon */}
        <div className="flex justify-between items-start">
          <h3 className="text-base font-medium text-gray-900 dark:text-[#E3E3E3] font-sans">
            {t('kpiTeachingClasses')}
          </h3>
          <div className="bg-gray-100 dark:bg-[#282A2C] p-2.5 rounded-2xl flex items-center justify-center text-[#0B57D0] dark:text-[#A8C7FA] shrink-0 border-none shadow-none">
            <span className="material-symbols-outlined text-[20px]">class</span>
          </div>
        </div>

        {/* Bottom part: Pushed to bottom for strict horizontal baseline alignment */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 font-sans">
            <span className="text-4xl font-semibold text-gray-900 dark:text-[#E3E3E3] tracking-tight">
              4
            </span>
            <span className="text-lg font-medium text-gray-500 dark:text-[#8E918F]">
              {t('kpiClassesUnit')}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-[#8E918F] mt-2 leading-snug font-sans truncate">
            {t('kpiTeachingClassesSub')}
          </p>
        </div>
      </div>

      {/* Card 2: Tổng sinh viên */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none flex flex-col justify-between h-[160px] transition-transform hover:-translate-y-0.5 duration-200">
        {/* Top part: Title and Icon */}
        <div className="flex justify-between items-start">
          <h3 className="text-base font-medium text-gray-900 dark:text-[#E3E3E3] font-sans">
            {t('kpiTotalLearners')}
          </h3>
          <div className="bg-gray-100 dark:bg-[#282A2C] p-2.5 rounded-2xl flex items-center justify-center text-[#0288D1] dark:text-[#7FCFFF] shrink-0 border-none shadow-none">
            <span className="material-symbols-outlined text-[20px]">groups</span>
          </div>
        </div>

        {/* Bottom part: Pushed to bottom for strict horizontal baseline alignment */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 font-sans">
            <span className="text-4xl font-semibold text-gray-900 dark:text-[#E3E3E3] tracking-tight">
              185
            </span>
            <span className="text-lg font-medium text-gray-500 dark:text-[#8E918F]">
              {t('kpiStudentsUnit')}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-[#8E918F] mt-2 leading-snug font-sans truncate">
            {t('kpiTotalLearnersSub')}
          </p>
        </div>
      </div>

      {/* Card 3: Bài tập chờ chấm (Warning Tonal Background) */}
      <div className="bg-orange-50 dark:bg-[#3C2A1E] rounded-3xl p-6 border-none shadow-sm dark:shadow-none flex flex-col justify-between h-[160px] transition-transform hover:-translate-y-0.5 duration-200">
        {/* Top part: Title and Icon */}
        <div className="flex justify-between items-start">
          <h3 className="text-base font-medium text-orange-800 dark:text-[#FFB784] font-sans">
            {t('kpiPendingGrading')}
          </h3>
          <div className="bg-orange-100 dark:bg-[#4E3728] p-2.5 rounded-2xl flex items-center justify-center text-orange-800 dark:text-[#FFB784] shrink-0 border-none shadow-none">
            <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
          </div>
        </div>

        {/* Bottom part: Pushed to bottom for strict horizontal baseline alignment */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 font-sans">
            <span className="text-4xl font-semibold text-orange-800 dark:text-[#FFB784] tracking-tight">
              34
            </span>
            <span className="text-lg font-medium text-orange-800/80 dark:text-[#FFB784]/80">
              {t('kpiSubmissionsUnit')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-[#FFB784] animate-pulse shrink-0" />
            <p className="text-sm text-orange-800/80 dark:text-[#FFB784]/80 leading-snug font-medium font-sans truncate">
              {t('kpiPendingGradingSub')}
            </p>
          </div>
        </div>
      </div>

      {/* Card 4: Chuyên cần trung bình */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none flex flex-col justify-between h-[160px] transition-transform hover:-translate-y-0.5 duration-200">
        {/* Top part: Title and Icon */}
        <div className="flex justify-between items-start">
          <h3 className="text-base font-medium text-gray-900 dark:text-[#E3E3E3] font-sans">
            {t('kpiAvgAttendance')}
          </h3>
          <div className="bg-gray-100 dark:bg-[#282A2C] p-2.5 rounded-2xl flex items-center justify-center text-[#137333] dark:text-[#6DD58C] shrink-0 border-none shadow-none">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
        </div>

        {/* Bottom part: Pushed to bottom for strict horizontal baseline alignment */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 font-sans">
            <span className="text-4xl font-semibold text-gray-900 dark:text-[#E3E3E3] tracking-tight">
              94.5%
            </span>
          </div>
          <p className="text-sm text-emerald-700 dark:text-[#81C995] font-medium mt-2 leading-snug flex items-center gap-1 font-sans truncate">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            {t('kpiAvgAttendanceSub')}
          </p>
        </div>
      </div>
    </div>
  );
}
