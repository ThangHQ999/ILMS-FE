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
    { id: 'ds', label: 'Cấu trúc DL', count: 8, color: 'bg-blue-600' },
    { id: 'algo', label: 'Thuật toán', count: 6, color: 'bg-purple-600' },
    { id: 'icpc', label: 'ICPC Lab', count: 6, color: 'bg-emerald-600' },
    { id: 'plo', label: 'Chuẩn PLO', count: 4, color: 'bg-amber-600' },
  ];

  return (
    <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Search Input with Auto-complete Dropdown */}
      <div className="relative w-full lg:w-72">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus-within:border-blue-500 transition-all">
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
            className="bg-transparent border-0 outline-none w-full text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
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
          <div className="absolute left-0 right-0 top-12 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-30 flex flex-col gap-1">
            {filteredDropdownNodes.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  onSelectNode(n.id);
                  onSearchChange(n.label);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                type="button"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                    {n.label}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {n.sublabel}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
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
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              type="button"
            >
              {cat.color && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-white' : cat.color
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
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bậc:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg gap-2">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              F{depth}
            </span>
            <input
              type="range"
              min="1"
              max="4"
              value={depth}
              onChange={(e) => onDepthChange(Number(e.target.value))}
              className="w-16 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Smart Dimming Toggle */}
        <button
          onClick={onToggleSmartDim}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
            isSmartDimActive
              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
