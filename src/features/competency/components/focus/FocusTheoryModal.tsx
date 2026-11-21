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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1E1F20] border-none rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-none relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">style</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">{data.title}</h3>
              <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">{data.subTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#444746] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] p-1.5 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-4 text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3]">
          {/* Card 1: State definition */}
          <div className="bg-[#F0F4F9] dark:bg-[#282A2C] p-5 rounded-3xl border-none shadow-none">
            <h4 className="font-bold text-[#0B57D0] dark:text-[#A8C7FA] mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">key</span>
              1. Định nghĩa trạng thái {data.stateDefinition.term}:
            </h4>
            <p className="text-[#444746] dark:text-[#C4C7C5] leading-relaxed text-xs sm:text-sm">
              {data.stateDefinition.desc}
            </p>
          </div>

          {/* Card 2: Recurrence formula */}
          <div className="bg-[#F0F4F9] dark:bg-[#282A2C] p-5 rounded-3xl border-none shadow-none">
            <h4 className="font-bold text-[#725200] dark:text-[#FFB784] mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">calculate</span>
              2. Công thức chuyển trạng thái (Cực kỳ quan trọng):
            </h4>
            <div className="bg-slate-900 p-4 rounded-2xl font-mono text-xs text-cyan-200 overflow-x-auto my-2 border-none shadow-none">
              <pre>{data.recurrenceFormula.code}</pre>
            </div>
            <div className="space-y-1 mt-2 text-xs text-[#444746] dark:text-[#C4C7C5]">
              {data.recurrenceFormula.explanationPoints.map((pt, idx) => (
                <p key={idx} className="leading-relaxed">
                  👉 <strong>{pt.split(':')[0]}:</strong> {pt.split(':')[1]}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-none">
          <span className="text-xs text-[#0D652D] dark:text-[#81C995] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Đã ghi nhớ bản chất
          </span>
          <button
            type="button"
            onClick={onProceedToQuiz}
            className="px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap font-medium text-xs flex items-center gap-1.5 transition-colors border-none shadow-none cursor-pointer"
          >
            <span>Chuyển sang Bước 2: Làm Quiz ngay</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
