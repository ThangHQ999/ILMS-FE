'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { AssignmentItem } from '../types';

interface AssignmentUpcomingClusterProps {
  items: AssignmentItem[];
  onViewOutline?: (id: string) => void;
}

export function AssignmentUpcomingCluster({
  items,
  onViewOutline,
}: AssignmentUpcomingClusterProps) {
  const t = useTranslations('assignments');

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Cluster Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-muted-foreground">
            lock_clock
          </span>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            {t('clusters.upcomingTitle')}
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {t('clusters.sprintPlan')}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="w-full bg-muted/30 text-card-foreground rounded-2xl p-4 sm:p-5 border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-semibold">
                    {t('status.upcomingOpen')}
                  </span>
                  {item.unlockDate && (
                    <span className="text-xs text-secondary font-semibold">
                      {item.unlockDate}
                    </span>
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-bold text-foreground truncate mt-1">
                  {item.title}
                </h4>

                {item.unlockCondition && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {item.unlockCondition}
                  </p>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs text-muted-foreground italic">
                {t('status.unannouncedExam')}
              </span>
              <button
                type="button"
                onClick={() => onViewOutline?.(item.id)}
                className="px-3.5 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold border border-border transition-colors cursor-pointer"
              >
                {t('actions.viewOutline')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

