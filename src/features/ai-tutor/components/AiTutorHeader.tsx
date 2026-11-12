'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CourseSubject } from '../types';
import { DEFAULT_SUBJECTS } from '../constants';

interface AiTutorHeaderProps {
  currentSubject: CourseSubject;
  onSelectSubject: (subject: CourseSubject) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onExportSession: () => void;
  onToggleSidebar?: () => void;
}

export function AiTutorHeader({
  currentSubject,
  onSelectSubject,
  isFullscreen,
  onToggleFullscreen,
  onExportSession,
  onToggleSidebar,
}: AiTutorHeaderProps) {
  const t = useTranslations('aiTutor');
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <header className="h-[52px] shrink-0 px-3 sm:px-6 flex items-center justify-between border-none bg-white dark:bg-[#1E1F20] z-20 select-none">
      {/* Trái: Mobile Menu Toggle & Status Indicator */}
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            type="button"
            className="lg:hidden p-1.5 -ml-1 rounded-full text-slate-600 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors"
            title={t('collapseSidebar')}
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="hidden sm:inline text-[13px] font-medium text-slate-600 dark:text-[#C4C7C5]">
          {t('socraticMode')}
        </span>
      </div>

      {/* Trung tâm: Dropdown Môn học Pill thanh lịch */}
      <div className="relative">
        <button
          onClick={() => setShowSubjectMenu((prev) => !prev)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-[13px] font-medium transition-colors border-none shadow-none cursor-pointer"
          title={t('subjectPrefix', { subject: currentSubject.name })}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
            terminal
          </span>
          <span className="truncate max-w-[200px] sm:max-w-[320px]">
            {t('subjectPrefix', { subject: currentSubject.name })}
          </span>
          <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
        </button>

        {showSubjectMenu && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border-none py-2 z-50 animate-in fade-in">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-[#8E918F] uppercase tracking-wider">
              Chọn môn học
            </div>
            {DEFAULT_SUBJECTS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  onSelectSubject(sub);
                  setShowSubjectMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors ${
                  sub.id === currentSubject.id
                    ? 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-semibold'
                    : 'text-slate-700 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
                }`}
                type="button"
              >
                <span>{sub.name}</span>
                <span className="font-mono text-[10px] text-slate-400">{sub.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phải: Tools & Actions */}
      <div className="flex items-center gap-1">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5] text-xs mr-1 border-none">
          <span className="material-symbols-outlined text-[15px] text-[#0B57D0] dark:text-[#A8C7FA]">
            school
          </span>
          <span className="font-medium">{currentSubject.plo}</span>
        </div>

        <button
          onClick={onExportSession}
          className="p-2 rounded-full text-slate-500 dark:text-[#C4C7C5] hover:text-slate-800 dark:hover:text-slate-200 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors"
          title={t('exportSession')}
          type="button"
        >
          <span className="material-symbols-outlined text-[19px]">download</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-full text-slate-500 dark:text-[#C4C7C5] hover:text-slate-800 dark:hover:text-slate-200 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors"
          title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
          type="button"
        >
          <span className="material-symbols-outlined text-[19px]">
            {isFullscreen ? 'close_fullscreen' : 'fullscreen'}
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className="p-2 rounded-full text-slate-500 dark:text-[#C4C7C5] hover:text-slate-800 dark:hover:text-slate-200 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors"
            title={t('moreOptions')}
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">more_vert</span>
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border-none py-1.5 z-50">
              <button
                onClick={() => {
                  onExportSession();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                <span>Xuất file Markdown / Transcript</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
