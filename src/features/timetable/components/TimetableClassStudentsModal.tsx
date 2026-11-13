'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { TimetableSession } from '../types';
import { MOCK_STUDENTS } from '@/features/lesson-sessions/constants';

interface TimetableClassStudentsModalProps {
  isOpen: boolean;
  session: TimetableSession | null;
  onClose: () => void;
}

export function TimetableClassStudentsModal({
  isOpen,
  session,
  onClose,
}: TimetableClassStudentsModalProps) {
  const t = useTranslations('timetable.studentsModal');
  const [searchQuery, setSearchQuery] = useState('');

  // Get students list for this class (simulate roster matching studentCount)
  const students = useMemo(() => {
    if (!session) return [];
    const count = Math.min(session.studentsCount, MOCK_STUDENTS.length);
    return MOCK_STUDENTS.slice(0, count);
  }, [session]);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  if (!isOpen || !session) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1E1F20] w-full max-w-2xl rounded-3xl p-6 shadow-2xl border-none ring-0 outline-none transform animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-[#282A2C]">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[22px]">
                groups
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3] font-sans">
                {t('title')} • {session.className}
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-[#8E918F] mt-1 font-sans">
              {session.classId} • {session.roomName} • Tiết {session.startShift}-{session.endShift} ({session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] flex items-center justify-center text-gray-600 dark:text-[#C4C7C5] transition-colors border-none cursor-pointer shrink-0 ml-3"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Search & Meta Toolbar */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400 dark:text-[#8E918F]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full h-10 pl-10 pr-4 bg-gray-100 dark:bg-[#282A2C] rounded-full text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 transition-all font-sans"
            />
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-[#004A77] text-blue-900 dark:text-[#C2E7FF] text-xs font-semibold whitespace-nowrap self-start sm:self-auto font-sans border-none">
            {t('studentCount', { count: filteredStudents.length })}
          </span>
        </div>

        {/* Students Table / List Container */}
        <div className="flex-1 overflow-y-auto min-h-[260px] max-h-[460px] rounded-2xl bg-gray-50/60 dark:bg-[#131314]/50 p-2 scrollbar-thin">
          {filteredStudents.length > 0 ? (
            <div className="w-full text-left font-sans">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-3 py-2 text-[11px] font-bold text-gray-500 dark:text-[#8E918F] uppercase tracking-wider border-b border-gray-200/60 dark:border-[#282A2C]">
                <div className="col-span-1">{t('colIndex')}</div>
                <div className="col-span-3">{t('colCode')}</div>
                <div className="col-span-4">{t('colName')}</div>
                <div className="col-span-4 hidden sm:block">{t('colEmail')}</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-100 dark:divide-[#282A2C]/40">
                {filteredStudents.map((st, idx) => {
                  const initial = st.studentName.charAt(0);
                  const email = `${st.studentCode.toLowerCase()}@ilms.edu.vn`;

                  return (
                    <div
                      key={st.studentId}
                      className="grid grid-cols-12 items-center px-3 py-2.5 hover:bg-white dark:hover:bg-[#1E1F20] rounded-xl transition-colors text-xs"
                    >
                      <div className="col-span-1 text-gray-400 dark:text-[#8E918F] font-mono">
                        {idx + 1}
                      </div>

                      <div className="col-span-3 font-mono font-semibold text-gray-800 dark:text-[#C4C7C5]">
                        {st.studentCode}
                      </div>

                      <div className="col-span-4 flex items-center gap-2 min-w-0 pr-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-[#004A77] text-blue-900 dark:text-[#C2E7FF] font-bold text-[11px] flex items-center justify-center shrink-0">
                          {initial}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-[#E3E3E3] truncate">
                          {st.studentName}
                        </span>
                      </div>

                      <div className="col-span-4 hidden sm:block text-gray-500 dark:text-[#8E918F] font-mono text-[11px] truncate">
                        {email}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-[#8E918F]">
              <span className="material-symbols-outlined text-[32px] mb-2 opacity-60">
                person_search
              </span>
              <p className="text-xs font-medium font-sans">{t('emptySearch')}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#282A2C] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gray-100 dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] text-xs font-semibold text-gray-800 dark:text-[#E3E3E3] transition-colors border-none cursor-pointer font-sans"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
