'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { TodaySessionItem } from './TeacherAttendanceModal';

interface TeacherTodaySessionsCardProps {
  sessions: TodaySessionItem[];
  onTakeAttendance: (session: TodaySessionItem) => void;
  onViewWeeklyTimetable?: () => void;
}

export function TeacherTodaySessionsCard({
  sessions,
  onTakeAttendance,
  onViewWeeklyTimetable,
}: TeacherTodaySessionsCardProps) {
  const t = useTranslations('dashboard.teacher');

  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 md:p-8 flex flex-col justify-between border-none shadow-sm dark:shadow-none ring-0 outline-none">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-[#282A2C] flex items-center justify-center text-[#0B57D0] dark:text-[#A8C7FA] shrink-0 border-none shadow-none ring-0 outline-none">
              <span className="material-symbols-outlined text-[24px]">event_available</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] tracking-tight font-sans">
                {t('todayScheduleTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] mt-0.5 font-sans">
                {t('todayScheduleSub')}
              </p>
            </div>
          </div>
          <span className="bg-gray-100 text-gray-700 dark:bg-[#282A2C] dark:text-[#C4C7C5] px-3.5 py-1 rounded-full text-xs font-semibold border-none shadow-none ring-0 outline-none font-sans">
            {t('todayTag')}
          </span>
        </div>

        {/* Classes List */}
        <div className="space-y-3.5">
          {sessions.map((session, index) => {
            const total = session.studentsCount || 45;
            const attended = session.attendedCount ?? 0;
            // Attendance strictly requires ALL students to be attended (attended >= total)
            const isFullyAttended = attended >= total && total > 0;
            const isInProgress = !isFullyAttended && attended > 0;

            return (
              <div
                key={session.id}
                className={`p-4 sm:p-5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-none shadow-none ring-0 outline-none ${
                  index === 0
                    ? 'bg-gray-100/70 hover:bg-gray-100 dark:bg-[#282A2C]/80 dark:hover:bg-[#282A2C]'
                    : 'bg-gray-50 hover:bg-gray-100/70 dark:bg-[#282A2C]/50 dark:hover:bg-[#282A2C]/70'
                }`}
              >
                {/* Left Details */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="bg-white text-[#0B57D0] dark:bg-[#1E1F20] dark:text-[#A8C7FA] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap border-none shadow-sm dark:shadow-none ring-0 outline-none font-sans">
                    {session.timeSlot}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-[#E3E3E3] truncate font-sans">
                        {session.subjectTitle}
                      </h3>
                      <span className="bg-white text-[#0B57D0] dark:bg-[#1E1F20] dark:text-[#A8C7FA] text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold border-none shadow-sm dark:shadow-none ring-0 outline-none">
                        {session.subjectCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] font-sans">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                        {session.roomName}
                      </span>
                      <span>•</span>
                      <span>{total} Sinh viên</span>
                    </div>
                  </div>
                </div>

                {/* Right Action: Button based on strict Attendance State */}
                {isFullyAttended ? (
                  <div className="flex flex-col items-end sm:items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => onTakeAttendance(session)}
                      className="bg-[#C4EED0] hover:bg-[#A8E2B9] text-[#072711] dark:bg-[#0F5223] dark:hover:bg-[#156B30] dark:text-[#C4EED0] px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center gap-2 border-none shadow-none ring-0 outline-none cursor-pointer font-sans"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>{t('attendanceCompleted')}</span>
                    </button>
                  </div>
                ) : isInProgress ? (
                  <div className="flex flex-col items-end sm:items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => onTakeAttendance(session)}
                      className="bg-[#FFE7A5] hover:bg-[#FDD663] text-[#3E2D00] dark:bg-[#3C2A1E] dark:hover:bg-[#4E3728] dark:text-[#FFB784] px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center gap-2 border-none shadow-none ring-0 outline-none cursor-pointer font-sans"
                    >
                      <span className="material-symbols-outlined text-[18px]">pending</span>
                      <span>{t('attendanceInProgress')}</span>
                    </button>
                    <span className="text-xs text-gray-500 dark:text-[#8E918F] font-mono font-medium">
                      {t('attendanceStudentsRatio', {
                        checked: attended,
                        total,
                      })}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end sm:items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => onTakeAttendance(session)}
                      className="bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center gap-2 border-none shadow-none ring-0 outline-none cursor-pointer font-sans"
                    >
                      <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                      <span>{t('takeAttendanceNow')}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-6 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] border-none shadow-none ring-0 outline-none">
        <span className="flex items-center gap-2 font-medium font-sans">
          <span className="w-2.5 h-2.5 rounded-full bg-[#137333] dark:bg-[#6DD58C] shrink-0 animate-pulse" />
          {t('wifiSyncNote')}
        </span>
        <Link
          href="/timetable"
          onClick={(e) => {
            if (onViewWeeklyTimetable) {
              e.preventDefault();
              onViewWeeklyTimetable();
            }
          }}
          className="text-[#0B57D0] dark:text-[#A8C7FA] hover:underline font-medium border-none shadow-none ring-0 outline-none bg-transparent cursor-pointer p-0 font-sans flex items-center gap-1.5 transition-colors"
        >
          <span>{t('viewWeeklyScheduleLink')}</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
