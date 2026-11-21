'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Network, Sparkles, Brain } from 'lucide-react';

export function LandingKnowledgeGraph() {
  const t = useTranslations('landing.graph');

  return (
    <div className="relative w-full bg-white dark:bg-[#1E1F20] border-none rounded-3xl shadow-none p-5 sm:p-6 transition-transform hover:-translate-y-1 duration-300 z-20">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] border-none flex items-center justify-center text-[#041E49] dark:text-[#A8C7FA]">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {t('cardTitle')}
            </h3>
            <p className="text-xs text-[#444746] dark:text-[#C4C7C5] -mt-0.5">
              {t('cardSub')}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-[#1F1F1F] dark:text-[#C4C7C5] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-ping" />
          <span>{t('realtimeNodes')}</span>
        </div>
      </div>

      {/* SVG Canvas Topology */}
      <div className="relative w-full h-64 bg-[#F0F4F9] dark:bg-[#131314] border-none rounded-2xl overflow-hidden flex items-center justify-center">
        {/* Background Grid Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20"
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern height="28" id="graph-grid" patternUnits="userSpaceOnUse" width="28">
              <path
                className="text-slate-300 dark:text-[#8E918F]"
                d="M 28 0 L 0 0 0 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
              />
              <circle className="fill-slate-300 dark:fill-slate-600" cx="28" cy="28" r="1" />
            </pattern>
          </defs>
          <rect fill="url(#graph-grid)" height="100%" width="100%" />
        </svg>

        {/* Network Nodes & Paths */}
        <svg
          className="absolute inset-0 w-full h-full"
          fill="none"
          viewBox="0 0 520 250"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Edge Connectors */}
          <path
            className="text-blue-400 dark:text-[#A8C7FA]/80"
            d="M120 70 L250 50"
            stroke="currentColor"
            strokeDasharray="4 2"
            strokeWidth="2.2"
          />
          <path
            className="text-slate-300 dark:text-[#8E918F]"
            d="M120 70 L190 150"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            className="text-blue-500 dark:text-[#A8C7FA]"
            d="M250 50 L390 85"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path
            className="text-blue-400 dark:text-[#A8C7FA]/80"
            d="M250 50 L275 160"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            className="text-slate-300 dark:text-[#8E918F]"
            d="M190 150 L275 160"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            className="text-rose-400 dark:text-rose-500"
            d="M275 160 L410 190"
            stroke="currentColor"
            strokeDasharray="3 3"
            strokeWidth="2"
          />
          <path
            className="text-slate-300 dark:text-[#8E918F]"
            d="M390 85 L410 190"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            className="text-blue-400 dark:text-[#A8C7FA]/80"
            d="M390 85 L480 60"
            stroke="currentColor"
            strokeWidth="2"
          />

          {/* Animated Particles */}
          <circle className="animate-pulse" cx="250" cy="50" fill="#38BDF8" r="3.5" />
          <circle className="animate-ping" cx="390" cy="85" fill="#38BDF8" r="3.5" />

          {/* Node A: Segment Tree */}
          <g className="cursor-pointer" transform="translate(120, 70)">
            <circle className="fill-white dark:fill-slate-900 shadow-sm" r="22" />
            <circle className="fill-emerald-50 dark:fill-emerald-950" r="18" />
            <circle
              className="stroke-emerald-500"
              r="18"
              strokeDasharray="100"
              strokeDashoffset="6"
              strokeWidth="2.5"
            />
            <text
              className="text-[11px] font-bold fill-emerald-700 dark:fill-emerald-200"
              dy="4"
              textAnchor="middle"
            >
              94%
            </text>
            <text
              className="text-[11px] font-semibold fill-slate-700 dark:fill-slate-200"
              dy="34"
              textAnchor="middle"
            >
              {t('nodeSegmentTree')}
            </text>
          </g>

          {/* Node B: Dynamic Programming */}
          <g className="cursor-pointer" transform="translate(250, 50)">
            <circle className="fill-white dark:fill-slate-900 shadow-sm" r="24" />
            <circle className="fill-amber-50 dark:fill-amber-950" r="20" />
            <circle
              className="stroke-amber-500"
              r="20"
              strokeDasharray="125"
              strokeDashoffset="28"
              strokeWidth="3"
            />
            <text
              className="text-[12px] font-bold fill-amber-700 dark:fill-amber-200"
              dy="5"
              textAnchor="middle"
            >
              78%
            </text>
            <text
              className="text-[11px] font-semibold fill-slate-700 dark:fill-slate-200"
              dy="36"
              textAnchor="middle"
            >
              {t('nodeDynamicProgramming')}
            </text>
          </g>

          {/* Node C: Recursion */}
          <g transform="translate(190, 150)">
            <circle className="fill-white dark:fill-slate-900 shadow-sm" r="18" />
            <circle className="fill-blue-50 dark:fill-blue-950" r="15" />
            <circle
              className="stroke-blue-500 dark:stroke-[#38BDF8]"
              r="15"
              strokeDasharray="90"
              strokeDashoffset="12"
              strokeWidth="2.2"
            />
            <text
              className="text-[10px] font-bold fill-blue-700 dark:fill-sky-200"
              dy="4"
              textAnchor="middle"
            >
              86%
            </text>
            <text
              className="text-[10px] font-medium fill-slate-600 dark:fill-slate-300"
              dy="28"
              textAnchor="middle"
            >
              {t('nodeRecursion')}
            </text>
          </g>

          {/* Node D: Pointers */}
          <g transform="translate(275, 160)">
            <circle className="fill-white dark:fill-slate-900 shadow-sm" r="18" />
            <circle className="fill-purple-50 dark:fill-purple-950" r="14" />
            <circle className="stroke-purple-500" r="14" strokeWidth="2" />
            <text
              className="text-[10px] font-bold fill-purple-700 dark:fill-purple-200"
              dy="4"
              textAnchor="middle"
            >
              70%
            </text>
            <text
              className="text-[10px] font-medium fill-slate-600 dark:fill-slate-300"
              dy="28"
              textAnchor="middle"
            >
              {t('nodePointers')}
            </text>
          </g>

          {/* Node E: Dijkstra Graph */}
          <g className="cursor-pointer" transform="translate(410, 190)">
            <circle className="fill-white dark:fill-slate-900 shadow-sm" r="25" />
            <circle className="fill-rose-50 dark:fill-rose-950" r="21" />
            <circle
              className="stroke-rose-500"
              r="21"
              strokeDasharray="130"
              strokeDashoffset="75"
              strokeWidth="3"
            />
            <text
              className="text-[12px] font-bold fill-rose-600 dark:fill-rose-300"
              dy="5"
              textAnchor="middle"
            >
              42%
            </text>
            <text
              className="text-[11px] font-bold fill-rose-600 dark:fill-rose-400"
              dy="37"
              textAnchor="middle"
            >
              {t('nodeDijkstra')}
            </text>
          </g>

          {/* Node F: Fenwick Tree */}
          <g transform="translate(390, 85)">
            <circle className="fill-white dark:fill-slate-900 shadow-sm" r="19" />
            <circle className="fill-emerald-50 dark:fill-emerald-950" r="15" />
            <circle className="stroke-emerald-500" r="15" strokeWidth="2.2" />
            <text
              className="text-[10px] font-bold fill-emerald-700 dark:fill-emerald-200"
              dy="4"
              textAnchor="middle"
            >
              91%
            </text>
            <text
              className="text-[10px] font-medium fill-slate-600 dark:fill-slate-300"
              dy="28"
              textAnchor="middle"
            >
              {t('nodeFenwick')}
            </text>
          </g>
        </svg>

        {/* Dynamic Tooltip */}
        <div className="absolute top-3 left-4 bg-white dark:bg-[#1E1F20] border-none px-3.5 py-1.5 rounded-full shadow-none pointer-events-none flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
          <span className="text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('deficitTooltip')}
          </span>
        </div>

        {/* Mini Pill */}
        <div className="absolute bottom-3 right-3 bg-[#D3E3FD] dark:bg-[#162B4D] border-none text-[#041E49] dark:text-[#A8C7FA] px-3 py-1 rounded-full shadow-none flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#041E49] dark:text-[#A8C7FA]" />
          <span className="text-[11px] font-medium">{t('aiTutorPill')}</span>
        </div>
      </div>
    </div>
  );
}
