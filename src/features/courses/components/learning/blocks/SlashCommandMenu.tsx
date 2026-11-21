'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { LessonBlockType } from '../../../schemas/lesson-block.schema';
import { BLOCK_TYPE_DEFINITIONS } from './block-registry';

interface SlashCommandMenuProps {
  isOpen: boolean;
  initialQuery?: string;
  onSelect: (type: LessonBlockType) => void;
  onClose: () => void;
}

export function SlashCommandMenu({
  isOpen,
  initialQuery = '',
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setQuery(initialQuery);
    setActiveIndex(0);
  }, [initialQuery, isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BLOCK_TYPE_DEFINITIONS;
    return BLOCK_TYPE_DEFINITIONS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.includes(q))
    );
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) =>
          filtered.length > 0 ? (prev + 1) % filtered.length : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) =>
          filtered.length > 0
            ? (prev - 1 + filtered.length) % filtered.length
            : 0
        );
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        onSelect(filtered[activeIndex].type);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, activeIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#1E1F20] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
          bolt
        </span>
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          placeholder="Tìm khối (vd: video, code, quiz, slide)..."
          className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none border-none"
        />
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-none bg-transparent cursor-pointer px-1"
        >
          ESC
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Không tìm thấy loại khối phù hợp.
          </div>
        ) : (
          filtered.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={item.type}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => onSelect(item.type)}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer border-none ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100'
                    : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {item.icon}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">{item.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
