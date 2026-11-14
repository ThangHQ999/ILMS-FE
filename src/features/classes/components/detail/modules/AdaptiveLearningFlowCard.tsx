'use client';

import React, { useState } from 'react';

export interface AdaptiveLearningFlowCardProps {
  onSendAutoReminder: () => void;
}

export function AdaptiveLearningFlowCard({ onSendAutoReminder }: AdaptiveLearningFlowCardProps) {
  const [learningFlow, setLearningFlow] = useState<'sequential' | 'guided'>('sequential');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
            alt_route
          </span>
          <h4 className="text-sm font-bold">Cấu hình Lộ trình học</h4>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
          Tự động hóa
        </span>
      </div>

      {/* Modes */}
      <div className="flex flex-col gap-2.5">
        <label
          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
            learningFlow === 'sequential'
              ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800'
          }`}
        >
          <input
            type="radio"
            name="learning_flow"
            checked={learningFlow === 'sequential'}
            onChange={() => setLearningFlow('sequential')}
            className="mt-1 text-blue-600 focus:ring-blue-500 accent-blue-600"
          />
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Học theo Tiến độ Tuần tự (Sequential)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Học viên buộc phải hoàn thành bài trước và đạt điểm điều kiện mới mở bài kế tiếp.
            </p>
          </div>
        </label>

        <label
          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
            learningFlow === 'guided'
              ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800'
          }`}
        >
          <input
            type="radio"
            name="learning_flow"
            checked={learningFlow === 'guided'}
            onChange={() => setLearningFlow('guided')}
            className="mt-1 text-blue-600 focus:ring-blue-500 accent-blue-600"
          />
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Mở Tự do có kiểm soát (Guided Open)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Sinh viên được xem trước tài liệu, chỉ khóa đối với các bài Quiz và Bài tập nộp điểm.
            </p>
          </div>
        </label>
      </div>

      {/* Alert for Stalled Students */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px] shrink-0 mt-0.5">
          report_problem
        </span>
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-900 dark:text-amber-200">
            Cảnh báo Trở ngại Nhận thức:
          </p>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            Có <strong className="font-bold text-rose-600 dark:text-rose-400">6 học viên</strong> đang kẹt tại Bài 3.2 hơn 4 ngày do chưa hoàn thành mô phỏng Bắt tay 3 bước.
          </p>
          <button
            type="button"
            onClick={onSendAutoReminder}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px] pt-1 cursor-pointer"
          >
            <span>Gửi nhắc nhở tự động qua Email & Chatbot</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

