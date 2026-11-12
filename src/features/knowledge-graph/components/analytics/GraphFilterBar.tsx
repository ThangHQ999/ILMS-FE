'use client';

import React, { useState } from 'react';
import { KnowledgeCategory, KnowledgeNodeData } from '../../types';

interface GraphFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: KnowledgeCategory;
  onSelectCategory: (category: KnowledgeCategory) => void;
  depth: number;
  onDepthChange: (depth: number) => void;
  isSmartDimActive: boolean;
  onToggleSmartDim: () => void;
  nodes: KnowledgeNodeData[];
  onSelectNode: (id: string) => void;
}

export function GraphFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  depth,
  onDepthChange,
  isSmartDimActive,
  onToggleSmartDim,
  nodes,
  onSelectNode,
}: GraphFilterBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredDropdownNodes = nodes
    .filter(
      (n) =>
        searchQuery.trim() &&
        (n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.sublabel?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .slice(0, 5);

  const categories: Array<{ id: KnowledgeCategory; label: string; count: number; color?: string }> = [
    { id: 'all', label: 'Tất cả', count: 24 },
    { id: 'ds', label: 'Cấu trúc DL', count: 8, color: 'bg-[#0B57D0] dark:bg-[#A8C7FA]' },
    { id: 'algo', label: 'Thuật toán', count: 6, color: 'bg-purple-600' },
    { id: 'icpc', label: 'ICPC Lab', count: 6, color: 'bg-emerald-600' },
    { id: 'plo', label: 'Chuẩn PLO', count: 4, color: 'bg-amber-600' },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#1E1F20] rounded-3xl p-4 shadow-none border-none flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Search Input with Auto-complete Dropdown */}
      <div className="relative w-full lg:w-72">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-[#F0F4F9] dark:bg-[#282A2C] rounded-full border-none transition-all">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Tìm & định vị node..."
            className="bg-transparent border-0 outline-none w-full text-xs text-slate-900 dark:text-[#E3E3E3] placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                setIsDropdownOpen(false);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Floating Auto-complete Box */}
        {isDropdownOpen && filteredDropdownNodes.length > 0 && (
          <div className="absolute left-0 right-0 top-12 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border-none p-2 z-30 flex flex-col gap-1">
            {filteredDropdownNodes.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  onSelectNode(n.id);
                  onSearchChange(n.label);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left p-2.5 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] rounded-xl cursor-pointer flex items-center justify-between transition-colors border-none"
                type="button"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-[#E3E3E3] block">
                    {n.label}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-[#C4C7C5]">
                    {n.sublabel}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] border-none">
                  {n.complexity.time}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Faceted Filter Chips */}
      <div className="flex items-center flex-wrap gap-1.5 w-full lg:w-auto">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium border-none shadow-none transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap'
                  : 'bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3]'
              }`}
              type="button"
            >
              {cat.color && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-[#041E49] dark:bg-[#062E6F]' : cat.color
                  }`}
                />
              )}
              <span>{cat.label}</span>
              <span className="opacity-75 text-[10px]">({cat.count})</span>
            </button>
          );
        })}
      </div>

      {/* Depth Slider & Smart Dimming Controls */}
      <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
        {/* Depth (F1 - F4) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-[#C4C7C5] font-medium">Bậc:</span>
          <div className="flex items-center bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-1.5 rounded-full gap-2 border-none">
            <span className="text-xs font-mono font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
              F{depth}
            </span>
            <input
              type="range"
              min="1"
              max="4"
              value={depth}
              onChange={(e) => onDepthChange(Number(e.target.value))}
              className="w-16 accent-[#0B57D0] cursor-pointer"
            />
          </div>
        </div>

        {/* Smart Dimming Toggle */}
        <button
          onClick={onToggleSmartDim}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border-none shadow-none transition-all cursor-pointer ${
            isSmartDimActive
              ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
              : 'bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3]'
          }`}
          title="Bật/tắt làm mờ thông minh các node không liên đới"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSmartDimActive ? 'blur_on' : 'blur_off'}
          </span>
          <span className="hidden sm:inline">Làm mờ thông minh</span>
        </button>
      </div>
    </div>
  );
}
