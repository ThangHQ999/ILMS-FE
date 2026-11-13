'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { GradeProgress } from '../types';

interface GradeWeightsPanelProps {
  gradeProgress?: GradeProgress;
}

export function GradeWeightsPanel({ gradeProgress }: GradeWeightsPanelProps) {
  const t = useTranslations('assignments');

  if (!gradeProgress) return null;

  return (
    <div className="w-full bg-card text-card-foreground rounded-2xl p-5 sm:p-6 shadow-sm border border-border">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">pie_chart</span>
          <h3 className="text-base font-bold text-foreground">
            {t('panels.weightsTitle')}
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold">
          {t('panels.moduleScope')}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        {t('panels.weightsDescription')}
      </p>

      {/* Progress Bars List */}
      <div className="space-y-4">
        {gradeProgress.categories.map((cat) => (
          <div key={cat.id}>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-foreground font-semibold flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    cat.id === 'quiz'
                      ? 'bg-blue-600'
                      : cat.id === 'lab'
                      ? 'bg-indigo-600'
                      : 'bg-muted-foreground/60'
                  }`}
                />
                {cat.name}
              </span>
              <span className="text-foreground font-bold">
                {cat.weight}%{' '}
                <span className="text-secondary font-medium">
                  {cat.achievedScore !== undefined ? `(Đạt: ${cat.achievedScore}%)` : cat.statusLabel.includes('Chưa') ? '(Chưa mở)' : cat.statusLabel.includes('Tuần') ? '(Tuần 16)' : ''}
                </span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  cat.id === 'quiz'
                    ? 'bg-blue-600'
                    : cat.id === 'lab'
                    ? 'bg-indigo-600'
                    : 'bg-muted-foreground/40'
                }`}
                style={{ width: `${cat.progressPercent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total Accumulated Footnote */}
      <div className="mt-5 p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs font-medium">
        <span className="text-muted-foreground">{t('panels.totalAccumulated')}:</span>
        <span className="text-base font-bold text-secondary">
          {gradeProgress.currentAccumulated} / {gradeProgress.maxAccumulated}
        </span>
      </div>
    </div>
  );
}

