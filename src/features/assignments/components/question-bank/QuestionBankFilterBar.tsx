'use client';

import React from 'react';
import { CustomSelect } from '@/components/shared';
import type {
  BankClassOption,
  BankCourseOption,
  QuestionBankFilterParams,
  QuestionConcept,
} from '../../schemas/question-bank.schema';

interface QuestionBankFilterBarProps {
  filters: QuestionBankFilterParams;
  onUpdateFilters: (patch: Partial<QuestionBankFilterParams>) => void;
  onResetFilters: () => void;
  classes: BankClassOption[];
  courses: BankCourseOption[];
  isLoadingCourses: boolean;
  concepts: QuestionConcept[];
  viewMode: 'CARD' | 'TABLE';
  onViewModeChange: (mode: 'CARD' | 'TABLE') => void;
}

export function QuestionBankFilterBar({
  filters,
  onUpdateFilters,
  onResetFilters,
  classes,
  courses,
  isLoadingCourses,
  concepts,
  viewMode,
  onViewModeChange,
}: QuestionBankFilterBarProps) {
  const hasFilters = Boolean(
    filters.search?.trim() ||
      (filters.classId && filters.classId !== 'ALL') ||
      (filters.courseId && filters.courseId !== 'ALL') ||
      (filters.conceptId && filters.conceptId !== 'ALL') ||
      (filters.questionType && filters.questionType !== 'ALL') ||
      (filters.difficultyLevel && filters.difficultyLevel !== 'ALL') ||
      (filters.bloomLevel && filters.bloomLevel !== 'ALL') ||
      (filters.sourceType && filters.sourceType !== 'ALL')
  );

  return (
    <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 shadow-sm dark:shadow-none border-none space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined text-[20px] text-[#444746] dark:text-[#C4C7C5] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={filters.search ?? ''}
            onChange={(e) => onUpdateFilters({ search: e.target.value, page: 1 })}
            placeholder="Tìm nội dung câu hỏi, giải thích, thẻ..."
            className="w-full rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] pl-11 pr-4 py-2.5 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
          />
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <div className="inline-flex rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] p-1">
            <button
              type="button"
              onClick={() => onViewModeChange('CARD')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'CARD'
                  ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-sm'
                  : 'text-[#444746] dark:text-[#C4C7C5]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_agenda</span>
              Thẻ
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('TABLE')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'TABLE'
                  ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-sm'
                  : 'text-[#444746] dark:text-[#C4C7C5]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
              Bảng
            </button>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-2 text-xs font-medium text-[#444746] dark:text-[#C4C7C5] hover:bg-[#E9EEF6] dark:hover:bg-[#333537]"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Đặt lại
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <CustomSelect
          value={filters.classId || 'ALL'}
          onChange={(val) => onUpdateFilters({ classId: val, courseId: 'ALL', page: 1 })}
          options={[
            { value: 'ALL', label: 'Tất cả lớp học' },
            ...classes.map((c) => ({
              value: c.id,
              label: c.code ? `${c.code} · ${c.name}` : c.name,
            })),
          ]}
        />

        <CustomSelect
          value={filters.courseId || 'ALL'}
          disabled={!filters.classId || filters.classId === 'ALL' || isLoadingCourses}
          onChange={(val) => onUpdateFilters({ courseId: val, page: 1 })}
          options={[
            {
              value: 'ALL',
              label:
                !filters.classId || filters.classId === 'ALL'
                  ? 'Chọn lớp để lọc môn'
                  : isLoadingCourses
                    ? 'Đang tải môn học...'
                    : 'Tất cả môn học',
            },
            ...courses.map((c) => ({
              value: c.id,
              label: c.code ? `${c.code} · ${c.title}` : c.title,
            })),
          ]}
        />

        <CustomSelect
          value={filters.conceptId || 'ALL'}
          onChange={(val) => onUpdateFilters({ conceptId: val, page: 1 })}
          options={[
            { value: 'ALL', label: 'Tất cả khái niệm' },
            ...concepts.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />

        <CustomSelect
          value={filters.questionType || 'ALL'}
          onChange={(val) => onUpdateFilters({ questionType: val, page: 1 })}
          options={[
            { value: 'ALL', label: 'Tất cả loại câu hỏi' },
            { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm 1 đáp án' },
            { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm nhiều đáp án' },
            { value: 'TRUE_FALSE', label: 'Đúng / Sai' },
            { value: 'ESSAY', label: 'Tự luận' },
          ]}
        />

        <CustomSelect
          value={filters.difficultyLevel || 'ALL'}
          onChange={(val) => onUpdateFilters({ difficultyLevel: val, page: 1 })}
          options={[
            { value: 'ALL', label: 'Tất cả độ khó' },
            { value: 'EASY', label: 'Dễ (EASY)' },
            { value: 'MEDIUM', label: 'Trung bình (MEDIUM)' },
            { value: 'HARD', label: 'Khó (HARD)' },
          ]}
        />

        <CustomSelect
          value={filters.bloomLevel || 'ALL'}
          onChange={(val) => onUpdateFilters({ bloomLevel: val, page: 1 })}
          options={[
            { value: 'ALL', label: 'Mức Bloom: Tất cả' },
            { value: 'REMEMBER', label: 'Nhớ (Remember)' },
            { value: 'UNDERSTAND', label: 'Hiểu (Understand)' },
            { value: 'APPLY', label: 'Vận dụng (Apply)' },
            { value: 'ANALYZE', label: 'Phân tích (Analyze)' },
            { value: 'EVALUATE', label: 'Đánh giá (Evaluate)' },
            { value: 'CREATE', label: 'Sáng tạo (Create)' },
          ]}
        />
      </div>
    </section>
  );
}
