'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { DaySchedule, TimetableSession } from '../types';
import { TimetableSessionCard } from './TimetableSessionCard';

interface TimetableDayColumnProps {
  day: DaySchedule;
  onSelectSession: (session: TimetableSession) => void;
  onTakeAttendance?: (session: TimetableSession) => void;
}

export function TimetableDayColumn({
  day,
  onSelectSession,
  onTakeAttendance,
}: TimetableDayColumnProps) {
  const tDays = useTranslations('timetable.days');

  const dayName = tDays(day.dayNameKey as any);
  const sessionCountText =
    day.sessions.length > 0
      ? tDays('sessionCount', { count: day.sessions.length })
      : tDays('dayOff');

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl p-3 transition-colors border-none ring-0 outline-none ${
        day.isToday
          ? 'bg-[#D3E3FD]/30 dark:bg-[#1A385C]/35 relative'
          : 'bg-white/70 dark:bg-[#1E1F20]/70 backdrop-blur-sm shadow-sm dark:shadow-none'
      }`}
    >
      {/* Column Header */}
      <div
        className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
          day.isToday
            ? 'bg-[#D3E3FD] dark:bg-[#004A77]'
            : 'bg-[#F0F4F9] dark:bg-[#282A2C]'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-semibold block font-sans ${
                day.isToday
                  ? 'text-[#041E49] dark:text-[#C2E7FF] font-bold'
                  : 'text-gray-600 dark:text-[#C4C7C5]'
              }`}
            >
              {dayName}
            </span>
            {day.isToday && (
              <span className="px-2 py-0.2 rounded-full bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F] text-[10px] font-bold font-sans">
                {tDays('today')}
              </span>
            )}
          </div>
          <span
            className={`text-sm font-bold font-sans ${
              day.isToday
                ? 'text-[#041E49] dark:text-[#C2E7FF] font-extrabold'
                : 'text-gray-900 dark:text-[#E3E3E3]'
            }`}
          >
            {day.dateString}
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-medium font-sans ${
            day.isToday
              ? 'bg-[#0B57D0]/20 dark:bg-[#C2E7FF]/20 text-[#041E49] dark:text-[#C2E7FF] font-bold'
              : 'bg-gray-200/80 dark:bg-[#333538] text-gray-600 dark:text-[#C4C7C5]'
          }`}
        >
          {sessionCountText}
        </span>
      </div>

      {/* Column Sessions List or Empty State */}
      <div className="flex flex-col gap-2.5 flex-1">
        {day.sessions.length > 0 ? (
          day.sessions.map((session) => (
            <TimetableSessionCard
              key={session.lessonSessionId}
              session={session}
              isTodayColumn={day.isToday}
              onSelectSession={onSelectSession}
              onTakeAttendance={onTakeAttendance}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-[#F0F4F9]/60 dark:bg-[#282A2C]/60 h-full min-h-[220px]">
            <div className="w-12 h-12 rounded-full bg-gray-200/70 dark:bg-[#333538] flex items-center justify-center text-gray-500 dark:text-[#C4C7C5] mb-2.5">
              <span className="material-symbols-outlined text-[24px]">local_cafe</span>
            </div>
            <p className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3] font-sans">
              {tDays('noSessionsTitle')}
            </p>
            <span className="text-[11px] text-gray-500 dark:text-[#C4C7C5] mt-1 leading-snug font-sans">
              {tDays('noSessionsDesc')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

