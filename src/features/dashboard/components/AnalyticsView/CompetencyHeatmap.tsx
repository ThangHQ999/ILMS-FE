'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { HeatmapCell, CompetencyPillar } from '../../types';

interface CompetencyHeatmapProps {
  heatmap: HeatmapCell[];
  pillars: CompetencyPillar[];
}

export function CompetencyHeatmap({ heatmap, pillars }: CompetencyHeatmapProps) {
  const t = useTranslations('dashboard');

  const getCellColor = (level: HeatmapCell['level'], isCurrent?: boolean) => {
    switch (level) {
      case 'master':
        return `bg-emerald-500 ${isCurrent ? 'ring-2 ring-secondary ring-offset-1 dark:ring-offset-slate-900' : ''}`;
      case 'good':
        return 'bg-secondary/70';
      case 'medium':
        return 'bg-amber-500';
      case 'weak':
        return 'bg-red-500';
      default:
        return 'bg-slate-200 dark:bg-slate-800';
    }
  };

  return (
    <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-slate-100 dark:border-slate-800">
      <div>
        {/* Header & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('heatmapTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('heatmapSubtitle')}
            </p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              {t('levelWeak')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              {t('levelMedium')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-secondary/70" />
              {t('levelGood')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              {t('levelMaster')}
            </span>
          </div>
        </div>

        {/* Heatmap Grid (7 days x 12 weeks) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-6 overflow-x-auto scrollbar-none border border-slate-100 dark:border-slate-800/60">
          <div className="min-w-[500px]">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5 px-6">
              <span>T1</span>
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>T8</span>
              <span>T9</span>
              <span>T10</span>
              <span>T11</span>
              <span>{t('weekLabel', { week: 12 })}</span>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col justify-between text-[10px] font-mono text-slate-400 py-0.5">
                <span>T2</span>
                <span>T4</span>
                <span>T6</span>
                <span>CN</span>
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 flex-1">
                {heatmap.map((cell, idx) => {
                  const isCurrent = cell.week === 12 && cell.day === 4;
                  return (
                    <div
                      key={`hm-${cell.week}-${cell.day}-${idx}`}
                      className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 ${getCellColor(
                        cell.level,
                        isCurrent
                      )}`}
                      title={`${t('weekLabel', { week: cell.week })} - ${cell.day + 2 > 7 ? 'CN' : `T${cell.day + 2}`}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 5 Key Competency Pillars (PLO Framework) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            <span>{t('ploTitle')}</span>
            <span>{t('ploIndex')}</span>
          </div>

          {pillars.map((pillar) => {
            const isWeak = pillar.level === 'weak';
            const isGood = pillar.level === 'good';
            return (
              <div key={pillar.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {pillar.title}
                  </span>
                  <span
                    className={`font-semibold ${
                      isWeak
                        ? 'text-red-600 dark:text-red-400'
                        : isGood
                        ? 'text-secondary'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {pillar.statusText}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWeak ? 'bg-red-500' : isGood ? 'bg-secondary' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pillar.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action link */}
      <div className="pt-4 mt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
        <a
          className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors"
          href="#"
        >
          <span>{t('viewMatrixDetails')}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </a>
      </div>
    </div>
  );
}
