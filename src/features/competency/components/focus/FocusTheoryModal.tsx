'use client';

import React from 'react';
import { TheoryCardData } from '../../types';

interface FocusTheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToQuiz: () => void;
  data: TheoryCardData;
}

export function FocusTheoryModal({
  isOpen,
  onClose,
  onProceedToQuiz,
  data,
}: FocusTheoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">style</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{data.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{data.subTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
          {/* Card 1: State definition */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">key</span>
              1. Định nghĩa trạng thái {data.stateDefinition.term}:
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
              {data.stateDefinition.desc}
            </p>
          </div>

          {/* Card 2: Recurrence formula */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-600">calculate</span>
              2. Công thức chuyển trạng thái (Cực kỳ quan trọng):
            </h4>
            <div className="bg-slate-900 p-3.5 rounded-xl font-mono text-xs text-cyan-200 overflow-x-auto my-2 border border-slate-800 shadow-inner">
              <pre>{data.recurrenceFormula.code}</pre>
            </div>
            <div className="space-y-1 mt-2 text-xs text-slate-600 dark:text-slate-300">
              {data.recurrenceFormula.explanationPoints.map((pt, idx) => (
                <p key={idx} className="leading-relaxed">
                  👉 <strong>{pt.split(':')[0]}:</strong> {pt.split(':')[1]}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Đã ghi nhớ bản chất
          </span>
          <button
            type="button"
            onClick={onProceedToQuiz}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
          >
            <span>Chuyển sang Bước 2: Làm Quiz ngay</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
