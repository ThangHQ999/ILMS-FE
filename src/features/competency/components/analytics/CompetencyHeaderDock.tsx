'use client';

import React, { useState } from 'react';

export type MainTabType = 'profile' | 'tree' | 'heatmap';

interface CompetencyHeaderDockProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  onSwitchToFocus: () => void;
  showClassAvg: boolean;
  onToggleClassAvg: (val: boolean) => void;
  showPloTarget: boolean;
  onTogglePloTarget: (val: boolean) => void;
  showPersonalTarget: boolean;
  onTogglePersonalTarget: (val: boolean) => void;
}

export function CompetencyHeaderDock({
  activeTab,
  onTabChange,
  onSwitchToFocus,
  showClassAvg,
  onToggleClassAvg,
  showPloTarget,
  onTogglePloTarget,
  showPersonalTarget,
  onTogglePersonalTarget,
}: CompetencyHeaderDockProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('CS-301');

  const handleSyncAI = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => {
        setSyncSuccess(false);
      }, 2500);
    }, 1200);
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <header className="relative px-6 lg:px-10 pt-6 pb-8 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* Ambient background glow */}
      <div className="absolute -top-16 right-10 w-96 h-96 rounded-full bg-blue-100/50 dark:bg-blue-900/20 blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 text-[11px] font-semibold tracking-wide uppercase font-mono">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Chuẩn đầu ra PLO &amp; ICPC Framework
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Sync Engine v4.2 • Live Graph
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Bản đồ Năng lực &amp; Cây Kỹ năng
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Theo dõi mức độ thông thạo, phát hiện lỗ hổng tri thức và khai phóng lộ trình học tập cá nhân hóa được kiểm định theo chuẩn kỹ sư phần mềm.
          </p>
        </div>

        {/* Controls & Quick Actions Dock */}
        <div className="flex flex-wrap items-center gap-2.5 xl:justify-end">
          {/* Course Selector Pill */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold pl-3.5 pr-8 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="CS-301">Cấu trúc dữ liệu &amp; Giải thuật nâng cao (CS-301)</option>
              <option value="CP-402">Lập trình thi đấu ICPC Master (CP-402)</option>
              <option value="SE-208">Kiến trúc Phần mềm &amp; Hệ thống Phân tán (SE-208)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 text-[18px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Sync Socratic AI CTA */}
          <button
            type="button"
            onClick={handleSyncAI}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:bg-blue-50/70 dark:hover:bg-slate-700/60 shadow-sm transition active:scale-95"
          >
            <span
              className={`material-symbols-outlined text-[17px] text-blue-600 ${
                isSyncing ? 'animate-spin' : ''
              } ${syncSuccess ? 'text-emerald-600' : ''}`}
            >
              {syncSuccess ? 'done_all' : 'autorenew'}
            </span>
            <span>{isSyncing ? 'Đang đồng bộ...' : syncSuccess ? 'Đã đồng bộ AI' : 'Đồng bộ Socratic AI'}</span>
          </button>

          {/* Switch to Focus Mode Button */}
          <button
            type="button"
            onClick={onSwitchToFocus}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition active:scale-95"
            title="Chuyển sang Chế độ Tập trung để giải quyết điểm nghẽn"
          >
            <span className="material-symbols-outlined text-[17px]">center_focus_strong</span>
            <span>Chế độ Tập trung</span>
          </button>

          {/* Export PDF CTA */}
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* VIEW TOGGLE & COMPARISON BENCHMARK STRIP */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Segmented Control Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/90 shadow-inner" role="tablist">
          <button
            type="button"
            onClick={() => onTabChange('profile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-blue-600">radar</span>
            <span>Chế độ xem Cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('tree')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tree'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">account_tree</span>
            <span>Cây Kỹ năng Môn học</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('heatmap')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'heatmap'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">grid_view</span>
            <span>Bản đồ nhiệt Toàn lớp</span>
            <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold font-mono">
              GV
            </span>
          </button>
        </div>

        {/* Benchmark Compare Options */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm text-xs">
          <span className="text-slate-500 font-medium">So sánh chuẩn:</span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showClassAvg}
              onChange={(e) => onToggleClassAvg(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-600 rounded"
            />
            <span className="text-slate-700 dark:text-slate-200 font-medium">TB Lớp (71.5%)</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showPloTarget}
              onChange={(e) => onTogglePloTarget(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-600 rounded"
            />
            <span className="text-slate-700 dark:text-slate-200 font-medium">Chuẩn đầu ra PLO (80.0%)</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showPersonalTarget}
              onChange={(e) => onTogglePersonalTarget(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-600 rounded"
            />
            <span className="text-slate-500 dark:text-slate-400">Mục tiêu cá nhân (90.0%)</span>
          </label>
        </div>
      </div>
    </header>
  );
}
