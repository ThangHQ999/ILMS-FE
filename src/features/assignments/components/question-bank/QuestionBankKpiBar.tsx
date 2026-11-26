'use client';

import React from 'react';
import type { BankQuestionItem } from '../../schemas/question-bank.schema';

interface QuestionBankKpiBarProps {
  totalItems: number;
  items: BankQuestionItem[];
  conceptCount: number;
  isLoading: boolean;
}

export function QuestionBankKpiBar({
  totalItems,
  items,
  conceptCount,
  isLoading,
}: QuestionBankKpiBarProps) {
  const easyCount = items.filter((q) => q.difficultyLevel === 'EASY').length;
  const mediumCount = items.filter((q) => q.difficultyLevel === 'MEDIUM').length;
  const hardCount = items.filter((q) => q.difficultyLevel === 'HARD').length;

  const cards = [
    {
      label: 'Tổng câu hỏi (theo bộ lọc)',
      value: isLoading ? '--' : String(totalItems),
      icon: 'quiz',
      tone: 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#004A77] dark:text-[#C2E7FF]',
    },
    {
      label: 'Mức Dễ / Trung bình (trang này)',
      value: isLoading ? '--' : `${easyCount} / ${mediumCount}`,
      icon: 'tune',
      tone: 'bg-[#C4EED0] text-[#072711] dark:bg-[#0F5223] dark:text-[#C4EED0]',
    },
    {
      label: 'Mức Khó (trang này)',
      value: isLoading ? '--' : String(hardCount),
      icon: 'psychology',
      tone: 'bg-[#F9DEDC] text-[#410E0B] dark:bg-[#8C1D18] dark:text-[#F9DEDC]',
    },
    {
      label: 'Khái niệm tri thức',
      value: String(conceptCount),
      icon: 'hub',
      tone: 'bg-[#E9EEF6] text-[#1F1F1F] dark:bg-[#282A2C] dark:text-[#E3E3E3]',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 shadow-sm dark:shadow-none border-none flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5] truncate">
              {card.label}
            </p>
            <p className="mt-1.5 text-2xl font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              {card.value}
            </p>
          </div>
          <div
            className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center ${card.tone}`}
          >
            <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
