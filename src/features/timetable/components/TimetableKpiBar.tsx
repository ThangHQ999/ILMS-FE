'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TimetableKpis } from '../types';

interface TimetableKpiBarProps {
  kpis: TimetableKpis;
}

export function TimetableKpiBar({ kpis }: TimetableKpiBarProps) {
  const t = useTranslations('timetable.kpis');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Tổng ca dạy */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-none transition-colors border-none ring-0 outline-none">
        <div>
          <p className="text-xs text-gray-500 dark:text-[#C4C7C5] font-medium font-sans">
            {t('totalSessionsTitle')}
          </p>
          <h4 className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3] mt-0.5 font-sans">
            {t('totalSessionsValue', { sessions: kpis.totalSessions })}{' '}
            <span className="text-xs font-normal text-gray-500 dark:text-[#C4C7C5]">
              {t('totalSessionsSub', { periods: kpis.totalPeriods })}
            </span>
          </h4>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#004A77] text-[#0B57D0] dark:text-[#C2E7FF] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">calendar_today</span>
        </div>
      </div>

      {/* 2. Phòng Lab thực hành */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-none transition-colors border-none ring-0 outline-none">
        <div>
          <p className="text-xs text-gray-500 dark:text-[#C4C7C5] font-medium font-sans">
            {t('labRoomsTitle')}
          </p>
          <h4 className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3] mt-0.5 font-sans">
            {t('labRoomsValue', { count: kpis.labSessions })}{' '}
            <span className="text-xs font-normal text-[#137333] dark:text-[#81C995]">
              {t('labRoomsSub')}
            </span>
          </h4>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#C4EED0] dark:bg-[#0f5223] text-[#0f5223] dark:text-[#C4EED0] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">terminal</span>
        </div>
      </div>

      {/* 3. Giờ cao điểm */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-none transition-colors border-none ring-0 outline-none">
        <div>
          <p className="text-xs text-gray-500 dark:text-[#C4C7C5] font-medium font-sans">
            {t('peakHourTitle')}
          </p>
          <h4 className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3] mt-0.5 font-sans">
            {kpis.peakDay}{' '}
            <span className="text-xs font-normal text-[#B06000] dark:text-[#FFBA60]">
              {t('peakHourSub')}
            </span>
          </h4>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#FEEFC3] dark:bg-[#5C3B00] text-[#7A4100] dark:text-[#FFBA60] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">schedule</span>
        </div>
      </div>

      {/* 4. Trạng thái đồng bộ */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-none transition-colors border-none ring-0 outline-none">
        <div>
          <p className="text-xs text-gray-500 dark:text-[#C4C7C5] font-medium font-sans">
            {t('syncStatusTitle')}
          </p>
          <h4 className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3] mt-1 leading-snug font-sans">
            {t('syncStatusValue')}
          </h4>
          <span className="text-[11px] text-[#137333] dark:text-[#81C995] font-medium flex items-center gap-1 mt-0.5 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-[#137333] dark:bg-[#81C995] animate-pulse" />
            {t('syncStatusSub')}
          </span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">sync</span>
        </div>
      </div>
    </div>
  );
}

