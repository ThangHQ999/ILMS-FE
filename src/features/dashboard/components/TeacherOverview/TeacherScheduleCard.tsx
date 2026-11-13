'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface ScheduleEvent {
  id: string;
  dayLabel: string;
  dayNumber: string;
  title: string;
  subtitle: string;
  isImportant?: boolean;
}

const defaultEvents: ScheduleEvent[] = [
  {
    id: 'e1',
    dayLabel: 'THỨ 5',
    dayNumber: '24',
    title: 'Thi Lab Trắc nghiệm',
    subtitle: '08:00 - 10:15 • CS-202 Phòng máy 402',
    isImportant: true,
  },
  {
    id: 'e2',
    dayLabel: 'THỨ 7',
    dayNumber: '26',
    title: 'Hạn nộp BTL Assignment 2',
    subtitle: '23:59 • Đồ án Cây AVL & B-Tree',
  },
  {
    id: 'e3',
    dayLabel: 'CN',
    dayNumber: '27',
    title: 'Hướng dẫn đồ án trực tuyến',
    subtitle: '19:30 - 21:00 • Google Meet (TS. An)',
  },
];

export function TeacherScheduleCard() {
  const t = useTranslations('dashboard.teacher');

  return (
    <section className="p-6 rounded-3xl bg-surface shadow-md3-1 dark:shadow-none border-none flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[22px]">
            calendar_today
          </span>
          <h2 className="text-lg font-bold text-foreground">
            {t('weeklyScheduleTitle')}
          </h2>
        </div>
        <span className="px-3.5 py-1 rounded-full bg-primary-container text-on-primary-container font-semibold text-xs sm:text-sm whitespace-nowrap border-none">
          {t('weekNumber', { week: 11 })}
        </span>
      </div>

      {/* Events list with borders and enlarged text */}
      <div className="flex flex-col gap-3">
        {defaultEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-4 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/70 border border-[#E1E5EA] dark:border-[#282A2C] hover:border-[#C5C6CD] dark:hover:border-[#3C4043] transition-all flex items-start gap-3.5"
          >
            {/* Calendar date tile */}
            <div className="flex flex-col items-center justify-center w-12 h-14 rounded-xl bg-surface text-foreground shadow-sm shrink-0 border border-[#E1E5EA] dark:border-[#282A2C]">
              <span className="text-[11px] font-bold text-[#0B57D0] dark:text-[#A8C7FA] leading-none uppercase">
                {evt.dayLabel}
              </span>
              <span className="text-lg font-bold text-foreground leading-none mt-1">
                {evt.dayNumber}
              </span>
            </div>

            {/* Event detail */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-foreground truncate">
                  {evt.title}
                </span>
                {evt.isImportant && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFDAD6] text-[#BA1A1A] dark:bg-[#93000A]/40 dark:text-[#FFB4AB] text-xs font-semibold whitespace-nowrap border-none">
                    Quan trọng
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {evt.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add event button */}
      <button
        type="button"
        className="w-full py-2.5 rounded-full bg-surface-variant hover:bg-surface-variant/80 text-foreground font-medium text-sm transition-colors text-center border-none cursor-pointer whitespace-nowrap"
      >
        {t('addEvent')}
      </button>
    </section>
  );
}

