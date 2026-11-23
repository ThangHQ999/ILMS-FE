'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { DaySchedule, TimetableSession } from '../types';
import { ACADEMIC_SHIFTS } from '../constants';

interface TimetableGridMatrixProps {
  days: DaySchedule[];
  onSelectSession: (session: TimetableSession) => void;
}

export function TimetableGridMatrix({
  days,
  onSelectSession,
}: TimetableGridMatrixProps) {
  const tDays = useTranslations('timetable.days');

  // Mobile selected day state
  const initialMobileDate = days.find((d) => d.isToday)?.fullDate || days[0]?.fullDate || '';
  const [activeMobileDate, setActiveMobileDate] = useState<string>(initialMobileDate);

  useEffect(() => {
    if (!days.some((d) => d.fullDate === activeMobileDate)) {
      setActiveMobileDate(days.find((d) => d.isToday)?.fullDate || days[0]?.fullDate || '');
    }
  }, [days, activeMobileDate]);

  const activeMobileDay = days.find((d) => d.fullDate === activeMobileDate) || days[0];

  // Map dayOfWeek (1: Mon..6: Sat, 0: Sun) to Grid Column Index (2..8)
  const getColIndex = (dayOfWeek: number): number => {
    return dayOfWeek === 0 ? 8 : dayOfWeek + 1;
  };

  const allSessions: TimetableSession[] = days.flatMap((d) => d.sessions);

  return (
    <div className="w-full space-y-4">
      {/* ========================================================= */}
      {/* A. MOBILE RESPONSIVE TIMELINE VIEW (md:hidden)            */}
      {/* ========================================================= */}
      <div className="md:hidden flex flex-col gap-3">
        {/* 7 Days Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xs border-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {days.map((day) => {
            const isSelected = day.fullDate === activeMobileDate;
            const hasSessions = day.sessions.length > 0;
            const dayName = tDays(day.dayNameKey as any);
            return (
              <button
                key={day.fullDate}
                type="button"
                onClick={() => setActiveMobileDate(day.fullDate)}
                className={`flex-1 min-w-[50px] py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all border-none cursor-pointer ${
                  isSelected
                    ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] font-bold shadow-xs'
                    : 'text-slate-600 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider leading-tight">
                  {dayName.slice(0, 5)}
                </span>
                <span className="text-xs font-mono font-bold mt-0.5 leading-tight">
                  {day.dateString.split('/')[0]}
                </span>
                {day.isToday && (
                  <span className="text-[8px] font-bold text-[#0B57D0] dark:text-[#A8C7FA] mt-0.5">
                    Hôm nay
                  </span>
                )}
                {hasSessions && !day.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Timeline Sessions List */}
        <div className="flex flex-col gap-2.5">
          {activeMobileDay && activeMobileDay.sessions.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-8 text-center border-none shadow-xs flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-3xl text-[#8E918F]">event_available</span>
              <p className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Không có ca học nào trong {tDays(activeMobileDay.dayNameKey as any)} ({activeMobileDay.dateString})
              </p>
              <span className="text-[11px] text-[#747775] dark:text-[#8E918F]">
                Lớp học được nghỉ hoặc chưa xếp ca cho ngày này.
              </span>
            </div>
          ) : (
            activeMobileDay?.sessions.map((session) => {
              const timeStr = `${session.startTime.substring(0, 5)} - ${session.endTime.substring(0, 5)}`;
              return (
                <div
                  key={session.lessonSessionId}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectSession(session)}
                  className="bg-white dark:bg-[#1E1F20] rounded-2xl p-4 shadow-xs border border-blue-400/30 border-l-4 border-l-[#0B57D0] dark:border-l-[#A8C7FA] cursor-pointer hover:brightness-95 transition-all text-left flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] text-[11px] font-bold font-mono">
                      Tiết {session.startShift}-{session.endShift} ({timeStr})
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                      arrow_forward_ios
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-[#E3E3E3] leading-snug">
                    {session.className}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-[#C4C7C5] pt-1 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#0B57D0] dark:text-[#A8C7FA]">
                        meeting_room
                      </span>
                      <span>{session.roomName}</span>
                    </div>
                    {session.status && (
                      <span className="ml-auto font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#282A2C]">
                        {session.status === 'COMPLETED' ? '✓ Đã hoàn thành' : 'Đang lên lịch'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* B. DESKTOP 7-DAY MATRIX GRID VIEW (hidden md:block)       */}
      {/* ========================================================= */}
      <div className="hidden md:block w-full rounded-3xl bg-white dark:bg-[#1E1F20] border-2 border-gray-400 dark:border-[#444746] shadow-sm dark:shadow-none ring-0 outline-none overflow-hidden transition-colors">
        <div className="overflow-x-auto overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-[#444746]">
          <div
            className="grid min-w-[960px] w-full"
            style={{
              gridTemplateColumns: '88px repeat(7, minmax(124px, 1fr))',
              gridTemplateRows: '56px repeat(12, 74px)',
            }}
          >
            {/* Top Header Row */}
            <div
              className="sticky top-0 left-0 z-30 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md border-b-2 border-r-2 border-gray-400 dark:border-[#444746] flex items-center justify-center p-2"
              style={{ gridColumn: 1, gridRow: 1 }}
            >
              <span className="text-[11px] font-bold text-gray-900 dark:text-[#E3E3E3] uppercase tracking-wider font-sans">
                Tiết / Giờ
              </span>
            </div>

            {/* 7 Days Header Cells */}
            {days.map((day, idx) => {
              const dayName = tDays(day.dayNameKey as any);
              const col = idx + 2;

              if (day.isToday) {
                return (
                  <div
                    key={day.fullDate}
                    className="sticky top-0 z-20 bg-blue-100/90 dark:bg-[#162B4D]/90 backdrop-blur-md border-b-2 border-r border-gray-400 dark:border-[#444746] px-3 py-2 flex flex-col items-center justify-center text-center transition-colors"
                    style={{ gridColumn: col, gridRow: 1 }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-blue-950 dark:text-[#A8C7FA] font-sans">
                        {dayName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-200 dark:bg-[#004A77] text-blue-950 dark:text-[#C2E7FF] text-[10px] font-bold font-sans">
                        {tDays('today')}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold text-blue-950 dark:text-[#A8C7FA] font-sans">
                      {day.dateString}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={day.fullDate}
                  className="sticky top-0 z-20 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md border-b-2 border-r border-gray-400 dark:border-[#444746] px-3 py-2 flex flex-col items-center justify-center text-center transition-colors"
                  style={{ gridColumn: col, gridRow: 1 }}
                >
                  <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3] font-sans">
                    {dayName}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-[#E3E3E3] font-sans">
                    {day.dateString}
                  </span>
                </div>
              );
            })}

            {/* Matrix Cells */}
            {ACADEMIC_SHIFTS.map((shiftInfo) => {
              const rowNumber = shiftInfo.shift + 1;

              return (
                <React.Fragment key={`row-shift-${shiftInfo.shift}`}>
                  <div
                    className="sticky left-0 z-20 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md border-b border-r-2 border-gray-400 dark:border-[#444746] flex flex-col items-center justify-center p-1 text-center transition-colors select-none"
                    style={{ gridColumn: 1, gridRow: rowNumber }}
                  >
                    <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3] font-sans">
                      Tiết {shiftInfo.shift}
                    </span>
                    <span className="text-[10px] text-gray-600 dark:text-[#8E918F] font-mono mt-0.5 leading-none font-medium">
                      {shiftInfo.timeRange.replace(' - ', '-')}
                    </span>
                  </div>

                  {days.map((day, idx) => {
                    const col = idx + 2;
                    const isTodayCol = day.isToday;

                    return (
                      <div
                        key={`cell-${shiftInfo.shift}-${day.fullDate}`}
                        className={`border-b border-r border-gray-400 dark:border-[#444746] transition-colors ${
                          isTodayCol ? 'bg-blue-50/40 dark:bg-[#162B4D]/10' : ''
                        }`}
                        style={{ gridColumn: col, gridRow: rowNumber }}
                      />
                    );
                  })}
                </React.Fragment>
              );
            })}

            {/* Desktop Class Blocks */}
            {allSessions.map((session) => {
              const col = getColIndex(session.dayOfWeek);
              const rowStart = (session.startShift || 1) + 1;
              const rowEnd = (session.endShift || 3) + 2;
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
                  className="z-10 rounded-xl p-3 m-1 cursor-pointer transition-all hover:brightness-95 select-none text-left bg-blue-50/90 dark:bg-[#162B4D]/75 border-2 border-blue-400/70 dark:border-blue-400/50 border-l-[5px] border-l-[#0B57D0] dark:border-l-[#A8C7FA] shadow-md dark:shadow-none"
                >
                  <div className="flex flex-col h-full font-sans">
                    <div className="text-[11px] font-medium text-blue-900/80 dark:text-[#A8C7FA]/90 mb-1.5 flex items-center gap-1.5">
                      <span className="font-semibold">Tiết {session.startShift}-{session.endShift}</span>
                      <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                      <span>{timeStr}</span>
                    </div>

                    <h4 className="text-sm font-bold leading-snug line-clamp-2 text-gray-900 dark:text-[#E3E3E3]">
                      {session.className}
                    </h4>

                    <div className="text-xs font-medium text-gray-700 dark:text-[#C4C7C5] mt-auto pt-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] shrink-0 text-gray-500 dark:text-[#8E918F]">
                        location_on
                      </span>
                      <span className="truncate font-medium">{session.roomName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
