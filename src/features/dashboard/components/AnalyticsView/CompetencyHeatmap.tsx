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
        return `bg-[#6CC38D] dark:bg-[#81C995] ${
          isCurrent
            ? 'ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA] ring-offset-1 ring-offset-white dark:ring-offset-[#131314]'
            : ''
        }`;
      case 'good':
        return 'bg-[#A8C7FA] dark:bg-[#162B4D]';
      case 'medium':
        return 'bg-[#FCEBA4] dark:bg-[#3C2A1E]';
      case 'weak':
        return 'bg-[#C4EED0] dark:bg-[#142E20]';
      default:
        return 'bg-[#E1E5EA] dark:bg-[#282A2C]';
    }
  };

  return (
    <div className="lg:col-span-8 bg-white dark:bg-[#1E1F20] rounded-3xl p-7 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between">
      <div>
        {/* Header & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {t('heatmapTitle')}
            </h2>
            <p className="text-xs text-[#444746] dark:text-[#C4C7C5] mt-0.5">
              {t('heatmapSubtitle')}
            </p>
          </div>
          {/* Legend - Soft Muted Pastel Scale */}
          <div className="flex items-center gap-3 text-xs text-[#444746] dark:text-[#C4C7C5]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C4EED0] dark:bg-[#142E20]" />
              {t('levelWeak')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FCEBA4] dark:bg-[#3C2A1E]" />
              {t('levelMedium')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A8C7FA] dark:bg-[#162B4D]" />
              {t('levelGood')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6CC38D] dark:bg-[#81C995]" />
              {t('levelMaster')}
            </span>
          </div>
        </div>

        {/* Heatmap Grid (7 days x 12 weeks) - Inset box */}
        <div className="p-4 bg-[#F0F4F9] dark:bg-[#282A2C]/40 rounded-2xl my-6 overflow-x-auto scrollbar-none border-none">
          <div className="min-w-[500px]">
            <div className="flex justify-between text-[11px] font-mono text-[#444746] dark:text-[#8E918F] mb-3 px-6">
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
            <div className="flex gap-2.5">
              <div className="flex flex-col justify-between text-[10px] font-mono text-[#444746] dark:text-[#8E918F] py-0.5">
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
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#444746] dark:text-[#8E918F] uppercase tracking-wider mb-2">
            <span>{t('ploTitle')}</span>
            <span>{t('ploIndex')}</span>
          </div>

          <div className="flex flex-col gap-6">
            {pillars.map((pillar) => {
              const isWeak = pillar.level === 'weak';
              const isGood = pillar.level === 'good';
              return (
                <div key={pillar.id}>
                  <div className="flex justify-between items-center text-xs mb-2.5">
                    <span className="font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                      {pillar.title}
                    </span>
                    <span
                      className={`font-semibold ${
                        isWeak
                          ? 'text-[#B3261E] dark:text-[#F28B82]'
                          : isGood
                          ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                          : 'text-[#1EA85A] dark:text-[#81C995]'
                      }`}
                    >
                      {pillar.statusText}
                    </span>
                  </div>
                  <div className="w-full bg-[#F0F4F9] dark:bg-[#282A2C] h-2 rounded-full overflow-hidden border-none">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isWeak
                          ? 'bg-[#B3261E] dark:bg-[#F28B82]'
                          : isGood
                          ? 'bg-[#0B57D0] dark:bg-[#A8C7FA]'
                          : 'bg-[#1EA85A] dark:bg-[#81C995]'
                      }`}
                      style={{ width: `${pillar.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action link */}
      <div className="pt-4 mt-6 flex justify-end">
        <a
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B57D0] hover:bg-[#F0F4F9] dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] px-4 py-2 rounded-full transition-colors whitespace-nowrap border-none"
          href="#"
        >
          <span>{t('viewMatrixDetails')}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </a>
      </div>
    </div>
  );
}
