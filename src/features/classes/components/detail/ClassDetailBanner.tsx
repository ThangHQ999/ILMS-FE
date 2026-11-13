'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ClassItem } from '../../schemas/class.schema';

interface ClassDetailBannerProps {
  classInfo: ClassItem;
  currentRole: 'owner' | 'teacher';
  activeTab: string;
  onTabChange: (tab: string) => void;
  subjectsCount: number;
  instructorsCount: number;
  onCopyCode: () => void;
  onInviteClick: () => void;
  onOpenSettings: () => void;
  onOpenArchive: () => void;
  onOpenManageCode: () => void;
}

export function ClassDetailBanner({
  classInfo,
  currentRole,
  activeTab,
  onTabChange,
  subjectsCount,
  instructorsCount,
  onCopyCode,
  onInviteClick,
  onOpenSettings,
  onOpenArchive,
  onOpenManageCode,
}: ClassDetailBannerProps) {
  const t = useTranslations('classes.detail');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: t('tabOverview'), icon: 'grid_view' },
    { id: 'subjects', label: t('tabSubjects'), icon: 'library_books', badge: subjectsCount },
    { id: 'announcements', label: t('tabAnnouncements'), icon: 'campaign' },
    { id: 'members', label: t('tabMembers'), icon: 'school', badge: classInfo.enrolledCount || 42 },
    { id: 'gradebook', label: t('tabGradebook'), icon: 'fact_check', badge: 'Kỳ 1' },
    { id: 'materials', label: t('tabMaterials'), icon: 'folder', badge: 38 },
    ...(currentRole === 'owner'
      ? [{ id: 'settings', label: t('tabSettings'), icon: 'tune' }]
      : []),
  ];

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Decorative Top Pattern Banner */}
      <div className="h-32 sm:h-36 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative overflow-hidden p-6 flex flex-col justify-end">
        {/* Geometric Ambient Graphics */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gridPattern" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#FFFFFF" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPattern)" />
            <circle cx="85%" cy="30%" r="90" fill="#38BDF8" opacity="0.3" filter="blur(30px)" />
            <circle cx="15%" cy="80%" r="80" fill="#6366F1" opacity="0.4" filter="blur(25px)" />
          </svg>
        </div>

        {/* Floating Top Badges inside Banner */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('statusActive')}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-blue-500/20 text-sky-200 border border-sky-400/30 backdrop-blur-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">shield_person</span>
              {t('myRole')}{' '}
              <span className="font-bold">
                {currentRole === 'owner' ? t('roleOwner') : t('roleTeacher')}
              </span>
            </span>
          </div>

          <span className="hidden sm:inline-flex text-xs font-semibold text-slate-300/80 bg-black/25 px-3 py-1 rounded-full backdrop-blur-md">
            {classInfo.semester || t('term')}
          </span>
        </div>
      </div>

      {/* Banner Information Detail Body */}
      <div className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {classInfo.title}
            </h1>

            {/* Class Code with Copy Button */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
              <span className="text-slate-400">{t('codeLabel')}</span>
              <span>{classInfo.enrollmentKey || classInfo.name}</span>
              <button
                type="button"
                onClick={onCopyCode}
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                title={t('copyCodeTooltip')}
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {classInfo.description ||
              'Không gian học tập và trao đổi dành cho sinh viên. Nơi tổ chức học phần chuyên sâu, bài tập lab và tương tác với trợ lý đồ thị tri thức.'}
          </p>

          {/* Short Metadata KPI Pills */}
          <div className="flex flex-wrap items-center gap-5 pt-1 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px]">book</span>
              </div>
              <span>
                <strong className="font-bold text-slate-900 dark:text-slate-100">
                  {subjectsCount}
                </strong>{' '}
                {t('subjectsMetric')}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px]">school</span>
              </div>
              <span>
                <strong className="font-bold text-slate-900 dark:text-slate-100">
                  {classInfo.enrolledCount || 42}
                </strong>{' '}
                {t('studentsMetric')}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px]">person_outline</span>
              </div>
              <span>
                <strong className="font-bold text-slate-900 dark:text-slate-100">
                  {instructorsCount}
                </strong>{' '}
                {t('instructorsMetric')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls (Right side) */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={onInviteClick}
            className="px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow transition-all flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>{t('inviteMembers')}</span>
          </button>

          {/* Three Dots Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-30 text-sm">
                  {currentRole === 'owner' ? (
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                      >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">
                          edit
                        </span>
                        <span>{t('editClassInfo')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenManageCode();
                        }}
                        className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                      >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">
                          vpn_key
                        </span>
                        <span>{t('manageJoinCode')}</span>
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenArchive();
                        }}
                        className="w-full px-3.5 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5"
                      >
                        <span className="material-symbols-outlined text-[18px] text-rose-500">
                          archive
                        </span>
                        <span>{t('archiveClass')}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                      >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">
                          info
                        </span>
                        <span>{t('editClassInfo')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* INNER TAB BAR */}
      <div className="px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center overflow-x-auto no-scrollbar gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 border-b-[3px] text-sm flex items-center gap-2 transition-all whitespace-nowrap rounded-t-xl ${
                isActive
                  ? 'border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-extrabold bg-blue-50/80 dark:bg-blue-950/50 shadow-xs'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 font-medium'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[19px] ${
                  isActive ? 'fill-icon text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-xs font-semibold ${
                    isActive
                      ? 'bg-blue-200/80 dark:bg-blue-900/70 text-blue-900 dark:text-blue-200 font-bold'
                      : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

