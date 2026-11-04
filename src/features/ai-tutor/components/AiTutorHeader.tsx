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
    <header className="h-[52px] shrink-0 px-3 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-20 select-none">
      {/* Trái: Mobile Menu Toggle & Status Indicator */}
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            type="button"
            className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('collapseSidebar')}
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="hidden sm:inline text-[13px] font-medium text-slate-600 dark:text-slate-300">
          {t('socraticMode')}
        </span>
      </div>

      {/* Trung tâm: Dropdown Môn học Pill thanh lịch */}
      <div className="relative">
        <button
          onClick={() => setShowSubjectMenu((prev) => !prev)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-[13px] font-medium transition-colors border border-slate-200/60 dark:border-slate-700/60 shadow-xs cursor-pointer"
          title={t('subjectPrefix', { subject: currentSubject.name })}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-cyan-400">
            terminal
          </span>
          <span className="truncate max-w-[200px] sm:max-w-[320px]">
            {t('subjectPrefix', { subject: currentSubject.name })}
          </span>
          <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
        </button>

        {showSubjectMenu && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Chọn môn học
            </div>
            {DEFAULT_SUBJECTS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  onSelectSubject(sub);
                  setShowSubjectMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                  sub.id === currentSubject.id
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
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
        <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs mr-1">
          <span className="material-symbols-outlined text-[15px] text-blue-600 dark:text-cyan-400">
            school
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{currentSubject.plo}</span>
        </div>

        <button
          onClick={onExportSession}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={t('exportSession')}
          type="button"
        >
          <span className="material-symbols-outlined text-[19px]">download</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('moreOptions')}
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">more_vert</span>
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
              <button
                onClick={() => {
                  onExportSession();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
