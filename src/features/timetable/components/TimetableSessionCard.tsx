'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TimetableSession } from '../types';

interface TimetableSessionCardProps {
  session: TimetableSession;
  isTodayColumn?: boolean;
  onSelectSession: (session: TimetableSession) => void;
  onTakeAttendance?: (session: TimetableSession) => void;
}

export function TimetableSessionCard({
  session,
  isTodayColumn = false,
  onSelectSession,
  onTakeAttendance,
}: TimetableSessionCardProps) {
  const t = useTranslations('timetable.session');

  const timeFormatted = `${session.startTime.substring(0, 5)} - ${session.endTime.substring(0, 5)}`;
  const isCompleted = session.status === 'COMPLETED';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectSession(session)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectSession(session);
        }
      }}
      className="bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none rounded-2xl p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282A2C] transition-colors border-none flex flex-col gap-2 ring-0 outline-none text-left"
    >
      {/* 1. Time */}
      <div className="text-sm font-medium text-gray-500 dark:text-[#8E918F] font-sans">
        {timeFormatted}
      </div>

      {/* 2. Subject Name (Big & Readable) */}
      <h4 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3] leading-snug font-sans">
        {session.className}
      </h4>

      {/* 3. Room */}
      <div className="text-sm font-medium text-gray-600 dark:text-[#C4C7C5] mt-1 font-sans">
        {session.roomName}
      </div>

      {/* 4. Action Button (RENDER THIS ONLY IF THE SESSION IS "TODAY") */}
      {isTodayColumn && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onTakeAttendance) {
              onTakeAttendance(session);
            } else {
              onSelectSession(session);
            }
          }}
          className={`mt-3 w-full rounded-full py-2 text-sm font-semibold border-none hover:opacity-90 transition-opacity cursor-pointer font-sans whitespace-nowrap ${
            isCompleted
              ? 'bg-green-100 dark:bg-[#0f5223] text-green-900 dark:text-[#C4EED0]'
              : 'bg-blue-100 dark:bg-[#A8C7FA] text-blue-900 dark:text-[#062E6F]'
          }`}
        >
          {isCompleted ? t('completed') : t('takeAttendanceNow')}
        </button>
      )}
    </div>
  );
}
