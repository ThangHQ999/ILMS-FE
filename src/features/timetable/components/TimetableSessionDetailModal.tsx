'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TimetableSession } from '../types';

interface TimetableSessionDetailModalProps {
  isOpen: boolean;
  session: TimetableSession | null;
  onClose: () => void;
  onTriggerAttendance?: (session: TimetableSession) => void;
}

export function TimetableSessionDetailModal({
  isOpen,
  session,
  onClose,
  onTriggerAttendance,
}: TimetableSessionDetailModalProps) {
  const t = useTranslations('timetable.modal');

  if (!isOpen || !session) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1E1F20] w-full max-w-lg rounded-3xl p-6 shadow-2xl border-none ring-0 outline-none transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA]">
              event_available
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3] font-sans">
              {t('detailTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] flex items-center justify-center text-gray-600 dark:text-[#C4C7C5] transition-colors border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 text-sm">
          {/* Class Header Banner */}
          <div className="p-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA] font-mono">
                {session.classId}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border-none font-sans ${
                  session.status === 'COMPLETED'
                    ? 'bg-[#C4EED0] text-[#072711] dark:bg-[#0f5223] dark:text-[#C4EED0]'
                    : session.status === 'IN_PROGRESS'
                    ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#004A77] dark:text-[#C2E7FF]'
                    : 'bg-gray-200 text-gray-700 dark:bg-[#333538] dark:text-[#C4C7C5]'
                }`}
              >
                {session.status}
              </span>
            </div>
            <h4 className="text-base font-bold text-gray-900 dark:text-[#E3E3E3] font-sans">
              {session.className}
            </h4>
          </div>

          {/* Time & Room Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C]">
              <span className="text-xs text-gray-500 dark:text-[#C4C7C5] block font-sans">
                {t('timeLabel')}
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3] mt-0.5 flex items-center gap-1 font-sans">
                <span className="material-symbols-outlined text-[15px]">schedule</span>
                {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C]">
              <span className="text-xs text-gray-500 dark:text-[#C4C7C5] block font-sans">
                {t('roomLabel')}
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3] mt-0.5 flex items-center gap-1 font-sans">
                <span className="material-symbols-outlined text-[15px]">location_on</span>
                {session.roomName}
              </span>
            </div>
          </div>

          {/* Students Count */}
          <div className="p-3.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C]">
            <span className="text-xs text-gray-500 dark:text-[#C4C7C5] block font-medium font-sans">
              {t('enrolledStudents')}
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3] font-sans">
              {t('studentsUnit', { count: session.studentsCount })}
            </span>
          </div>

          {/* Note Box */}
          {session.note && (
            <div className="p-3.5 rounded-2xl bg-[#FEEFC3]/50 dark:bg-[#5C3B00]/30 text-[#7A4100] dark:text-[#FFBA60]">
              <div className="flex items-center gap-1.5 font-bold text-xs mb-1 font-sans">
                <span className="material-symbols-outlined text-[16px]">notes</span>
                {t('notesTitle')}
              </div>
              <p className="text-xs leading-relaxed font-normal font-sans">
                {session.note}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] text-xs font-semibold text-gray-800 dark:text-[#E3E3E3] transition-colors border-none cursor-pointer font-sans"
          >
            {t('closeBtn')}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onTriggerAttendance) {
                onTriggerAttendance(session);
              }
            }}
            className="px-5 py-2 rounded-full bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F] hover:bg-[#0842a0] dark:hover:bg-[#8ab4f8] text-xs font-semibold flex items-center gap-1.5 shadow-sm dark:shadow-none transition-colors border-none cursor-pointer font-sans"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
            <span>{t('openQrAttendance')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

