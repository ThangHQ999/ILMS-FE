'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import katex from 'katex';
import { LATEX_FORMULA_CATEGORIES } from '../constants';

interface LatexFormulaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormula: (formulaLatex: string) => void;
}

export function LatexFormulaPicker({
  isOpen,
  onClose,
  onSelectFormula,
}: LatexFormulaPickerProps) {
  const [activeTab, setActiveTab] = useState<string>('complexity');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Đóng bảng khi click ra ngoài hoặc nhấn phím ESC
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const activeCategory = useMemo(() => {
    return (
      LATEX_FORMULA_CATEGORIES.find((cat) => cat.key === activeTab) ||
      LATEX_FORMULA_CATEGORIES[0]
    );
  }, [activeTab]);

  const renderFormulaHtml = (latex: string) => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: false });
    } catch {
      return latex;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-11 left-0 sm:-left-4 z-40 w-[340px] max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.18)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)] p-3 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header nhỏ */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-cyan-400">
            functions
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Công thức toán LaTeX
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Tabs danh mục */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-2 no-scrollbar text-[11.5px]">
        {LATEX_FORMULA_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveTab(cat.key)}
            className={`px-2 py-1 rounded-lg shrink-0 font-medium transition-colors ${
              activeTab === cat.key
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-cyan-400 border border-blue-200/80 dark:border-blue-900/60'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid danh sách công thức */}
      <div className="grid grid-cols-4 gap-1.5 max-h-[170px] overflow-y-auto pr-0.5 custom-scrollbar">
        {activeCategory.items.map((item) => (
          <button
            key={item.id}
            type="button"
            title={`${item.title} ($${item.latex}$)`}
            onClick={() => onSelectFormula(item.latex)}
            className="group flex flex-col items-center justify-center min-h-[42px] px-1 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/40 dark:hover:border-blue-700/60 transition-all text-[13px] overflow-hidden"
          >
            <span
              className="pointer-events-none group-hover:scale-105 transition-transform"
              dangerouslySetInnerHTML={{ __html: renderFormulaHtml(item.latex) }}
            />
          </button>
        ))}
      </div>

      {/* Footer gợi ý */}
      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10.5px] text-slate-400">
        <span>
          Click để chèn định dạng <code className="font-mono text-blue-600 dark:text-cyan-400">$công_thức$</code>
        </span>
      </div>
    </div>
  );
}
