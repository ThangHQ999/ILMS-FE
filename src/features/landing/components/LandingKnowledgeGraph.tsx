'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Network, Sparkles, Brain } from 'lucide-react';

export function LandingKnowledgeGraph() {
  const t = useTranslations('landing.graph');

  return (
    <div className="relative w-full bg-white dark:bg-[#161B26]/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/60 p-5 sm:p-6 transition-transform hover:-translate-y-1 duration-300 z-20">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#38BDF8]/20 border border-blue-200 dark:border-[#38BDF8]/30 flex items-center justify-center text-blue-600 dark:text-[#38BDF8]">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {t('cardTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
              {t('cardSub')}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-[#38BDF8] animate-ping" />
          <span>{t('realtimeNodes')}</span>
        </div>
      </div>

      {/* SVG Canvas Topology */}
      <div className="relative w-full h-64 bg-slate-50 dark:bg-[#0A0E18] border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden flex items-center justify-center">
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
                className="text-slate-300 dark:text-slate-600"
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
            className="text-blue-400 dark:text-[#38BDF8]/80"
            d="M120 70 L250 50"
            stroke="currentColor"
            strokeDasharray="4 2"
            strokeWidth="2.2"
          />
          <path
            className="text-slate-300 dark:text-slate-600"
            d="M120 70 L190 150"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            className="text-blue-500 dark:text-[#38BDF8]"
            d="M250 50 L390 85"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path
            className="text-blue-400 dark:text-[#38BDF8]/80"
            d="M250 50 L275 160"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            className="text-slate-300 dark:text-slate-600"
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
            className="text-slate-300 dark:text-slate-600"
            d="M390 85 L410 190"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            className="text-blue-400 dark:text-[#38BDF8]/80"
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
        <div className="absolute top-3 left-4 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md pointer-events-none flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-blue-600 dark:text-[#38BDF8]" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {t('deficitTooltip')}
          </span>
        </div>

        {/* Mini Pill */}
        <div className="absolute bottom-3 right-3 bg-blue-50 dark:bg-[#38BDF8]/20 border border-blue-200 dark:border-[#38BDF8]/50 text-blue-700 dark:text-sky-200 px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-[#38BDF8]" />
          <span className="text-[11px] font-medium">{t('aiTutorPill')}</span>
        </div>
      </div>
    </div>
  );
}
