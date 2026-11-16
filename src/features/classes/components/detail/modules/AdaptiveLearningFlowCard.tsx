'use client';

import React, { useState } from 'react';

export interface AdaptiveLearningFlowCardProps {
  onSendAutoReminder: () => void;
}

export function AdaptiveLearningFlowCard({ onSendAutoReminder }: AdaptiveLearningFlowCardProps) {
  const [learningFlow, setLearningFlow] = useState<'sequential' | 'guided'>('sequential');

  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 border-none shadow-sm dark:shadow-none space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2 text-gray-900 dark:text-[#E3E3E3]">
          <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[20px]">
            alt_route
          </span>
          <h4 className="text-sm font-semibold">Cấu hình Lộ trình học</h4>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] text-[11px] font-semibold border-none">
          Tự động hóa
        </span>
      </div>

      {/* Modes */}
      <div className="flex flex-col gap-2.5">
        <label
          className={`flex items-start gap-3 p-3.5 rounded-2xl border-none transition-all cursor-pointer select-none ${
            learningFlow === 'sequential'
              ? 'bg-[#D3E3FD]/40 dark:bg-[#162B4D]/40'
              : 'bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-90'
          }`}
        >
          <input
            type="radio"
            name="learning_flow"
            checked={learningFlow === 'sequential'}
            onChange={() => setLearningFlow('sequential')}
            className="mt-1 text-blue-600 focus:ring-0 accent-blue-600 cursor-pointer"
          />
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
              Học theo Tiến độ Tuần tự (Sequential)
            </p>
            <p className="text-[11px] text-gray-500 dark:text-[#8E918F] mt-0.5 leading-relaxed">
              Học viên buộc phải hoàn thành bài trước và đạt điểm điều kiện mới mở bài kế tiếp.
            </p>
          </div>
        </label>

        <label
          className={`flex items-start gap-3 p-3.5 rounded-2xl border-none transition-all cursor-pointer select-none ${
            learningFlow === 'guided'
              ? 'bg-[#D3E3FD]/40 dark:bg-[#162B4D]/40'
              : 'bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-90'
          }`}
        >
          <input
            type="radio"
            name="learning_flow"
            checked={learningFlow === 'guided'}
            onChange={() => setLearningFlow('guided')}
            className="mt-1 text-blue-600 focus:ring-0 accent-blue-600 cursor-pointer"
          />
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
              Mở Tự do có kiểm soát (Guided Open)
            </p>
            <p className="text-[11px] text-gray-500 dark:text-[#8E918F] mt-0.5 leading-relaxed">
              Sinh viên được xem trước tài liệu, chỉ khóa đối với các bài Quiz và Bài tập nộp điểm.
            </p>
          </div>
        </label>
      </div>

      {/* Alert for Stalled Students */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#2E1F00] border-none flex items-start gap-2.5">
        <span className="material-symbols-outlined text-amber-600 dark:text-[#FFB784] text-[20px] shrink-0 mt-0.5">
          report_problem
        </span>
        <div className="text-xs space-y-1">
          <p className="font-semibold text-amber-900 dark:text-[#FFB784]">
            Cảnh báo Trở ngại Nhận thức:
          </p>
          <p className="text-[11px] text-amber-800 dark:text-[#FFB784] leading-relaxed">
            Có <strong className="font-semibold text-rose-600 dark:text-[#F28B82]">6 học viên</strong> đang kẹt tại Bài 3.2 hơn 4 ngày do chưa hoàn thành mô phỏng Bắt tay 3 bước.
          </p>
          <button
            type="button"
            onClick={onSendAutoReminder}
            className="text-blue-600 dark:text-[#A8C7FA] font-semibold hover:underline inline-flex items-center gap-1 text-[11px] pt-1 cursor-pointer border-none bg-transparent"
          >
            <span>Gửi nhắc nhở tự động qua Email &amp; Chatbot</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

