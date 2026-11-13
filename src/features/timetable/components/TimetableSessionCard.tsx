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

  const cardBg = isTodayColumn
    ? 'bg-white dark:bg-[#1E1F20] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] shadow-sm dark:shadow-none'
    : 'bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333538]';

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
      className={`group cursor-pointer rounded-2xl p-3.5 ${cardBg} transition-all duration-200 transform hover:-translate-y-0.5 border-none ring-0 outline-none text-left`}
    >
      {/* Top Row: Time slot & Room Pill */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-[11px] font-semibold text-[#0B57D0] dark:text-[#A8C7FA] flex items-center gap-1 font-sans">
          <span className="material-symbols-outlined text-[13px]">alarm</span>
          {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E8F0FE] text-[#1967D2] dark:bg-[#1A385C] dark:text-[#A8C7FA] border-none font-sans whitespace-nowrap">
          {session.roomShort}
        </span>
      </div>

      {/* Subject Title */}
      <h5 className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3] line-clamp-2 leading-snug group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors font-sans">
        {session.className}
      </h5>

      {/* Class ID & Students count */}
      <p className="text-[11px] text-gray-500 dark:text-[#C4C7C5] mt-1 font-sans">
        {session.classId} • {t('studentsCount', { count: session.studentsCount })}
      </p>

      {/* Room detail */}
      <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-[#C4C7C5] mt-1 font-sans">
        <span className="material-symbols-outlined text-[13px]">location_on</span>
        <span>{session.roomName}</span>
      </div>

      {/* Optional Tag Chip */}
      {session.tag && (
        <div
          className={`mt-2 text-[10px] p-1.5 rounded-lg font-medium flex items-center gap-1 font-sans ${
            session.tagType === 'exam'
              ? 'bg-[#FEEFC3] text-[#7A4100] dark:bg-[#433100] dark:text-[#FFD579]'
              : session.tagType === 'contest'
              ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#004A77] dark:text-[#C2E7FF]'
              : 'bg-[#E8F0FE] text-[#1967D2] dark:bg-[#1A385C] dark:text-[#A8C7FA]'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">
            {session.tagType === 'exam' ? 'quiz' : session.tagType === 'contest' ? 'leaderboard' : 'notes'}
          </span>
          <span className="line-clamp-1">{session.tag}</span>
        </div>
      )}

      {/* Bottom Action / Status */}
      <div className="mt-2.5">
        {session.status === 'COMPLETED' ? (
          <div className="flex items-center justify-between text-[11px] text-[#137333] dark:text-[#81C995] font-sans font-medium">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#137333] dark:bg-[#81C995]" />
              {t('completed')}
            </span>
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
          </div>
        ) : session.actionType === 'attendance_now' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTakeAttendance ? onTakeAttendance(session) : onSelectSession(session);
            }}
            className="w-full py-1.5 rounded-full bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F] hover:bg-[#0842a0] dark:hover:bg-[#8ab4f8] text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm dark:shadow-none transition-all border-none cursor-pointer font-sans whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
            <span>{t('takeAttendanceNow')}</span>
          </button>
        ) : session.actionType === 'attendance' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTakeAttendance ? onTakeAttendance(session) : onSelectSession(session);
            }}
            className="w-full py-1.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#C2E7FF] hover:bg-[#C2E7FF] dark:hover:bg-[#333538] text-[11px] font-semibold flex items-center justify-center gap-1 transition-all border-none cursor-pointer font-sans whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[14px]">checklist</span>
            <span>{t('takeAttendance')}</span>
          </button>
        ) : session.actionType === 'meet' ? (
          <div className="text-right">
            <a
              href={session.meetingUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline font-sans inline-flex items-center gap-1"
            >
              <span>{t('viewMeetingLink')}</span>
            </a>
          </div>
        ) : session.actionType === 'contest' ? (
          <div className="text-right">
            <span className="text-[11px] font-medium text-[#0B57D0] dark:text-[#A8C7FA] group-hover:underline font-sans">
              {t('trackLeaderboard')}
            </span>
          </div>
        ) : (
          <div className="text-right">
            <span className="text-[11px] font-medium text-[#0B57D0] dark:text-[#A8C7FA] group-hover:underline font-sans">
              {t('viewDetail')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

