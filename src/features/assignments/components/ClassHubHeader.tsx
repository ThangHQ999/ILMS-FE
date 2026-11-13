'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { ClassHubInfo } from '../types';

interface ClassHubHeaderProps {
  info: ClassHubInfo;
}

export function ClassHubHeader({ info }: ClassHubHeaderProps) {
  const tHub = useTranslations('classHub');

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
    </div>
  );
}
