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

  return (
    <div className="bg-transparent flex flex-col gap-3 border-none ring-0 outline-none">
      {/* Column Header */}
      {day.isToday ? (
        <div className="bg-blue-100 dark:bg-[#162B4D] text-blue-900 dark:text-[#A8C7FA] rounded-2xl p-3 flex items-center justify-between transition-colors border-none ring-0 outline-none">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-sans">
                {dayName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-200 dark:bg-[#004A77] text-blue-900 dark:text-[#C2E7FF] text-[10px] font-bold font-sans whitespace-nowrap">
                {tDays('today')}
              </span>
            </div>
            <span className="text-sm font-extrabold font-sans">
              {day.dateString}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl flex items-center justify-between border-none ring-0 outline-none">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-[#8E918F] block font-sans">
              {dayName}
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-[#E3E3E3] font-sans">
              {day.dateString}
            </span>
          </div>
        </div>
      )}

      {/* Column Sessions List or Empty State */}
      <div className="flex flex-col gap-3 flex-1">
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
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-white/40 dark:bg-[#1E1F20]/40 h-full min-h-[160px] border-none ring-0 outline-none">
            <span className="material-symbols-outlined text-[22px] text-gray-400 dark:text-[#8E918F] mb-1.5">
              weekend
            </span>
            <p className="text-xs font-medium text-gray-500 dark:text-[#8E918F] font-sans">
              {tDays('noSessionsTitle')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
