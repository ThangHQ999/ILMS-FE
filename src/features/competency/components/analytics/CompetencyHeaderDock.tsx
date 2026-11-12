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
    <header className="relative px-6 lg:px-10 pt-6 pb-8 bg-white dark:bg-[#1E1F20] border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
      {/* Ambient background glow */}
      <div className="absolute -top-16 right-10 w-96 h-96 rounded-full bg-blue-50/50 dark:bg-[#162B4D] blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] border-none text-[11px] font-semibold tracking-wide uppercase font-mono">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Chuẩn đầu ra PLO &amp; ICPC Framework
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5] text-[11px] font-mono border-none">
              <span className="w-2 h-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-pulse" />
              Sync Engine v4.2 • Live Graph
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight mt-1">
            Bản đồ Năng lực &amp; Cây Kỹ năng
          </h1>
          <p className="text-xs sm:text-sm text-[#444746] dark:text-[#C4C7C5] leading-relaxed">
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
              className="appearance-none bg-[#F0F4F9] dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#E3E3E3] text-xs font-medium pl-4 pr-9 py-2.5 rounded-full border-none shadow-none focus:outline-none cursor-pointer"
            >
              <option value="CS-301">Cấu trúc dữ liệu &amp; Giải thuật nâng cao (CS-301)</option>
              <option value="CP-402">Lập trình thi đấu ICPC Master (CP-402)</option>
              <option value="SE-208">Kiến trúc Phần mềm &amp; Hệ thống Phân tán (SE-208)</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 text-[18px] text-[#444746] dark:text-[#8E918F] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Sync Socratic AI CTA */}
          <button
            type="button"
            onClick={handleSyncAI}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-xs font-medium border-none shadow-none transition-colors whitespace-nowrap cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-[17px] text-[#0B57D0] dark:text-[#A8C7FA] ${
                isSyncing ? 'animate-spin' : ''
              } ${syncSuccess ? 'text-[#1EA85A] dark:text-[#81C995]' : ''}`}
            >
              {syncSuccess ? 'done_all' : 'autorenew'}
            </span>
            <span>{isSyncing ? 'Đang đồng bộ...' : syncSuccess ? 'Đã đồng bộ AI' : 'Đồng bộ Socratic AI'}</span>
          </button>

          {/* Switch to Focus Mode Button */}
          <button
            type="button"
            onClick={onSwitchToFocus}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] text-xs font-medium border-none shadow-none transition-colors whitespace-nowrap cursor-pointer"
            title="Chuyển sang Chế độ Tập trung để giải quyết điểm nghẽn"
          >
            <span className="material-symbols-outlined text-[17px]">center_focus_strong</span>
            <span>Chế độ Tập trung</span>
          </button>

          {/* Export PDF CTA */}
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] text-xs font-medium border-none shadow-none transition-colors whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* VIEW TOGGLE & COMPARISON BENCHMARK STRIP */}
      <div className="mt-6 pt-4 border-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Segmented Control Switcher */}
        <div className="inline-flex p-1.5 rounded-full bg-[#F0F4F9] dark:bg-[#1E1F20] border-none shadow-none" role="tablist">
          <button
            type="button"
            onClick={() => onTabChange('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border-none cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#E3E3E3] shadow-none'
                : 'text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-[#0B57D0] dark:text-[#A8C7FA]">radar</span>
            <span>Chế độ xem Cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('tree')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border-none cursor-pointer ${
              activeTab === 'tree'
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#E3E3E3] shadow-none'
                : 'text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">account_tree</span>
            <span>Cây Kỹ năng Môn học</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('heatmap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border-none cursor-pointer ${
              activeTab === 'heatmap'
                ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#E3E3E3] shadow-none'
                : 'text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">grid_view</span>
            <span>Bản đồ nhiệt Toàn lớp</span>
            <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] font-bold font-mono">
              GV
            </span>
          </button>
        </div>

        {/* Benchmark Compare Options */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1F20] border-none shadow-none text-xs">
          <span className="text-[#444746] dark:text-[#8E918F] font-medium">So sánh chuẩn:</span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showClassAvg}
              onChange={(e) => onToggleClassAvg(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#0B57D0] rounded"
            />
            <span className="text-[#1F1F1F] dark:text-[#E3E3E3] font-medium">TB Lớp (71.5%)</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showPloTarget}
              onChange={(e) => onTogglePloTarget(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#0B57D0] rounded"
            />
            <span className="text-[#1F1F1F] dark:text-[#E3E3E3] font-medium">Chuẩn đầu ra PLO (80.0%)</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showPersonalTarget}
              onChange={(e) => onTogglePersonalTarget(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#0B57D0] rounded"
            />
            <span className="text-[#444746] dark:text-[#C4C7C5]">Mục tiêu cá nhân (90.0%)</span>
          </label>
        </div>
      </div>
    </header>
  );
}
