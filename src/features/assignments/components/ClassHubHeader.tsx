'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ClassHubInfo } from '../types';

interface ClassHubHeaderProps {
  info: ClassHubInfo;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onCreateQuizAI?: () => void;
  onCreateAssignment?: () => void;
}

export function ClassHubHeader({
  info,
  activeTab = 'assignments',
  onTabChange,
  onCreateQuizAI,
  onCreateAssignment,
}: ClassHubHeaderProps) {
  const t = useTranslations('assignments');
  const tHub = useTranslations('classHub');

  const tabs = [
    { id: 'overview', label: tHub('tabs.overview'), icon: 'space_dashboard' },
    { id: 'modules', label: tHub('tabs.modules'), icon: 'library_books' },
    { id: 'curriculum', label: tHub('tabs.curriculum'), icon: 'calendar_view_week' },
    {
      id: 'assignments',
      label: tHub('tabs.assignments'),
      icon: 'assignment',
      badge: info.assignmentsCount,
    },
    { id: 'materials', label: tHub('tabs.materials'), icon: 'folder_open' },
    { id: 'students', label: tHub('tabs.students'), icon: 'group' },
    { id: 'grades', label: tHub('tabs.grades'), icon: 'grade' },
    { id: 'announcements', label: tHub('tabs.announcements'), icon: 'campaign' },
    { id: 'settings', label: tHub('tabs.settings'), icon: 'settings' },
  ];

  return (
    <div className="w-full bg-card text-card-foreground rounded-2xl p-6 shadow-sm border border-border mb-6 relative overflow-hidden">
      {/* Decorative gradient accents */}
      <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl pointer-events-none" />
      <div className="absolute right-48 -bottom-20 w-60 h-60 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-2xl pointer-events-none" />

      {/* Main Course Info Block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-semibold">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-mono tracking-wider">
              {info.courseCode}
            </span>
            <span>•</span>
            <span className="font-medium text-secondary">{info.semester}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-muted-foreground">
                meeting_room
              </span>
              {info.room}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight mt-0.5">
            {info.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-secondary">badge</span>
              <span>
                {tHub('instructor')}:{' '}
                <strong className="text-foreground font-semibold">{info.instructorName}</strong>
              </span>
            </div>
            <span className="text-muted-foreground/50">•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-muted-foreground">
                verified_user
              </span>
              <span>{info.department}</span>
            </div>
          </div>
        </div>

        {/* Counter Badges Group */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border">
            <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-secondary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">groups</span>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground leading-none">{info.studentsCount}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{tHub('students')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border">
            <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-secondary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">task_alt</span>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground leading-none">{info.assignmentsCount}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{tHub('assignments')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/10 border border-secondary/20">
            <div className="w-10 h-10 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">donut_large</span>
            </div>
            <div>
              <p className="text-xl font-bold text-secondary leading-none">{info.completionRate}%</p>
              <p className="text-xs text-secondary/80 mt-1 font-medium">{tHub('avgCompletion')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-6 pt-3 bg-muted/30 -mx-6 -mb-6 px-6 pb-0 rounded-b-2xl overflow-x-auto border-t border-border">
        <nav className="flex items-center gap-1 sm:gap-2 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={`px-3.5 py-3 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 relative ${
                  isActive
                    ? 'font-bold text-secondary bg-card rounded-t-lg shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isActive ? 'text-secondary' : 'text-muted-foreground'
                  }`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 pb-2.5 shrink-0">
          <button
            type="button"
            onClick={onCreateQuizAI}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400 animate-pulse">
              auto_awesome
            </span>
            <span>{t('actions.createQuizAi')}</span>
          </button>
          <button
            type="button"
            onClick={onCreateAssignment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs sm:text-sm font-semibold hover:bg-secondary/90 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>{t('actions.createAssignment')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

