'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { DaySchedule, TimetableSession } from '../types';
import { ACADEMIC_SHIFTS } from '../constants';

interface TimetableGridMatrixProps {
  days: DaySchedule[];
  onSelectSession: (session: TimetableSession) => void;
  onTakeAttendance?: (session: TimetableSession) => void;
}

export function TimetableGridMatrix({
  days,
  onSelectSession,
  onTakeAttendance,
}: TimetableGridMatrixProps) {
  const tDays = useTranslations('timetable.days');

  // Map dayOfWeek (1: Mon..6: Sat, 0: Sun) to Grid Column Index (2..8)
  const getColIndex = (dayOfWeek: number): number => {
    return dayOfWeek === 0 ? 8 : dayOfWeek + 1;
  };

  // Flatten all filtered sessions across all 7 days
  const allSessions: TimetableSession[] = days.flatMap((d) => d.sessions);

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none ring-0 outline-none overflow-hidden transition-colors">
      <div className="overflow-x-auto overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#282A2C]">
        <div
          className="grid min-w-[960px] w-full"
          style={{
            gridTemplateColumns: '88px repeat(7, minmax(124px, 1fr))',
            gridTemplateRows: '56px repeat(12, 68px)',
          }}
        >
          {/* ========================================================= */}
          {/* 1. TOP HEADER ROW (Row 1)                                */}
          {/* ========================================================= */}

          {/* Top-Left Corner Cell: Time / Shift Header */}
          <div
            className="sticky top-0 left-0 z-30 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md border-b border-r border-gray-200 dark:border-[#282A2C] flex items-center justify-center p-2"
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            <span className="text-[11px] font-bold text-gray-400 dark:text-[#8E918F] uppercase tracking-wider font-sans">
              Tiết / Giờ
            </span>
          </div>

          {/* 7 Days Header Cells (Columns 2 to 8) */}
          {days.map((day, idx) => {
            const dayName = tDays(day.dayNameKey as any);
            const col = idx + 2;

            if (day.isToday) {
              return (
                <div
                  key={day.fullDate}
                  className="sticky top-0 z-20 bg-blue-100/90 dark:bg-[#162B4D]/90 backdrop-blur-md border-b border-r border-gray-200 dark:border-[#282A2C] px-3 py-2 flex flex-col items-center justify-center text-center transition-colors"
                  style={{ gridColumn: col, gridRow: 1 }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-blue-900 dark:text-[#A8C7FA] font-sans">
                      {dayName}
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-blue-200 dark:bg-[#004A77] text-blue-900 dark:text-[#C2E7FF] text-[10px] font-bold font-sans">
                      {tDays('today')}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-blue-900 dark:text-[#A8C7FA] font-sans">
                    {day.dateString}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={day.fullDate}
                className="sticky top-0 z-20 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md border-b border-r border-gray-200 dark:border-[#282A2C] px-3 py-2 flex flex-col items-center justify-center text-center transition-colors"
                style={{ gridColumn: col, gridRow: 1 }}
              >
                <span className="text-xs font-medium text-gray-500 dark:text-[#8E918F] font-sans">
                  {dayName}
                </span>
                <span className="text-sm font-bold text-gray-800 dark:text-[#E3E3E3] font-sans">
                  {day.dateString}
                </span>
              </div>
            );
          })}

          {/* ========================================================= */}
          {/* 2. BACKGROUND MATRIX CELLS (Rows 2 to 13)                 */}
          {/* ========================================================= */}
          {ACADEMIC_SHIFTS.map((shiftInfo) => {
            const rowNumber = shiftInfo.shift + 1; // Shifts 1..12 correspond to Grid Rows 2..13

            return (
              <React.Fragment key={`row-shift-${shiftInfo.shift}`}>
                {/* Y-axis: Leftmost Column Header for Shift */}
                <div
                  className="sticky left-0 z-20 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md border-b border-r border-gray-200 dark:border-[#282A2C] flex flex-col items-center justify-center p-1 text-center transition-colors select-none"
                  style={{ gridColumn: 1, gridRow: rowNumber }}
                >
                  <span className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] font-sans">
                    Tiết {shiftInfo.shift}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-[#8E918F] font-mono mt-0.5 leading-none">
                    {shiftInfo.timeRange.replace(' - ', '-')}
                  </span>
                </div>

                {/* 7 Daily Empty Grid Cells */}
                {days.map((day, idx) => {
                  const col = idx + 2;
                  const isTodayCol = day.isToday;

                  return (
                    <div
                      key={`cell-${shiftInfo.shift}-${day.fullDate}`}
                      className={`border-b border-r border-gray-200/70 dark:border-[#282A2C]/70 transition-colors ${
                        isTodayCol ? 'bg-blue-50/20 dark:bg-[#162B4D]/10' : ''
                      }`}
                      style={{ gridColumn: col, gridRow: rowNumber }}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* ========================================================= */}
          {/* 3. CLASS BLOCKS (SESSION CARDS SPANNING MULTIPLE SHIFTS)  */}
          {/* ========================================================= */}
          {allSessions.map((session) => {
            const col = getColIndex(session.dayOfWeek);
            const rowStart = (session.startShift || 1) + 1;
            const rowEnd = (session.endShift || 3) + 2;
            const isToday = session.dayOfWeek === 3; // Wednesday in mock data is today

            const cardTonalClass =
              session.sessionType === 'lab'
                ? 'bg-[#C4EED0] text-[#072711] dark:bg-[#0f5223] dark:text-[#C4EED0]'
                : session.sessionType === 'exam'
                ? 'bg-[#FEEFC3] text-[#7A4100] dark:bg-[#433100] dark:text-[#FFD579]'
                : 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]';

            const timeStr = `${session.startTime.substring(0, 5)} - ${session.endTime.substring(0, 5)}`;

            return (
              <div
                key={session.lessonSessionId}
                role="button"
                tabIndex={0}
                onClick={() => onSelectSession(session)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSession(session);
                  }
                }}
                style={{
                  gridColumn: col,
                  gridRow: `${rowStart} / ${rowEnd}`,
                }}
                className={`z-10 rounded-xl p-3 border-none shadow-sm dark:shadow-none m-1 hover:brightness-95 transition-all cursor-pointer flex flex-col justify-between overflow-hidden select-none text-left ${cardTonalClass}`}
              >
                {/* Top Section: Subject Name & Room */}
                <div className="flex flex-col gap-1 min-w-0">
                  {/* Line 1: Subject Name */}
                  <h4 className="font-semibold text-sm leading-tight line-clamp-2 font-sans">
                    {session.className}
                  </h4>

                  {/* Line 2: Room */}
                  <div className="text-xs opacity-85 flex items-center gap-1 font-sans">
                    <span className="material-symbols-outlined text-[13px] shrink-0">location_on</span>
                    <span className="truncate">{session.roomName}</span>
                  </div>
                </div>

                {/* Bottom Section: Shifts & Time, plus Today attendance pill */}
                <div className="mt-2 pt-1 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs opacity-90 font-sans">
                  <span className="font-medium">
                    Tiết {session.startShift}-{session.endShift}
                  </span>
                  <span className="font-mono text-[11px] opacity-80">
                    {timeStr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
