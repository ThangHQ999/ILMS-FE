'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { HubClassSummary } from '../../schemas/assessment-hub.schema';

interface AssessmentHubHeaderProps {
  mode: 'STUDENT' | 'TEACHER';
  onModeChange: (mode: 'STUDENT' | 'TEACHER') => void;
  teachingClasses: HubClassSummary[];
  enrolledClasses: HubClassSummary[];
  selectedClassId: string;
}

export function AssessmentHubHeader({
  mode,
  onModeChange,
  teachingClasses,
  enrolledClasses,
  selectedClassId,
}: AssessmentHubHeaderProps) {
  const router = useRouter();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [createClassId, setCreateClassId] = useState<string>('');

  const effectiveCreateClassId =
    createClassId ||
    (selectedClassId !== 'ALL' && teachingClasses.some((c) => c.id === selectedClassId)
      ? selectedClassId
      : teachingClasses[0]?.id || '');

  const handleNavigateCreate = (type: 'ASSIGNMENT' | 'QUIZ' | 'EXAM' | 'NOTICE') => {
    if (!effectiveCreateClassId) return;
    setIsCreateMenuOpen(false);
    router.push(`/classes/${effectiveCreateClassId}/assignments/new?type=${type}`);
  };

  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-sm dark:shadow-none border-none flex flex-col gap-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3]">
            Bài tập &amp; Đánh giá
          </h1>
          <p className="text-xs sm:text-sm text-[#444746] dark:text-[#C4C7C5]">
            Tổng hợp bài tập tự luận, trắc nghiệm (Quiz) và bài kiểm tra trên tất cả lớp học của bạn
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {teachingClasses.length > 0 && (
            <Link
              href="/assignments/question-bank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333538] text-[#1F1F1F] dark:text-[#E3E3E3] text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">library_books</span>
              <span>Ngân hàng câu hỏi</span>
            </Link>
          )}

          {teachingClasses.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCreateMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold transition-all cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Giao bài</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>

              {isCreateMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsCreateMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-xl p-3 z-40 border-none space-y-2">
                    {teachingClasses.length > 1 && (
                      <div className="px-2 pb-2">
                        <label className="text-[11px] font-semibold text-[#444746] dark:text-[#8E918F] block mb-1">
                          Chọn lớp để giao bài
                        </label>
                        <select
                          value={effectiveCreateClassId}
                          onChange={(e) => setCreateClassId(e.target.value)}
                          className="w-full px-3 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] border-none outline-none"
                        >
                          {teachingClasses.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.title || cls.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleNavigateCreate('ASSIGNMENT')}
                      className="w-full px-3 py-2.5 rounded-2xl text-left hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center gap-3 border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">assignment</span>
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                          Bài tập tự luận / Nộp tệp
                        </div>
                        <div className="text-[11px] text-[#444746] dark:text-[#8E918F]">
                          Giao đề, hạn nộp &amp; chấm điểm
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigateCreate('QUIZ')}
                      className="w-full px-3 py-2.5 rounded-2xl text-left hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center gap-3 border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">quiz</span>
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                          Bài tập Trắc nghiệm (Quiz)
                        </div>
                        <div className="text-[11px] text-[#444746] dark:text-[#8E918F]">
                          Soạn bộ câu hỏi &amp; tự chấm
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigateCreate('EXAM')}
                      className="w-full px-3 py-2.5 rounded-2xl text-left hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center gap-3 border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">school</span>
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                          Bài kiểm tra / Đề thi
                        </div>
                        <div className="text-[11px] text-[#444746] dark:text-[#8E918F]">
                          Giới hạn thời gian làm bài
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigateCreate('NOTICE')}
                      className="w-full px-3 py-2.5 rounded-2xl text-left hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center gap-3 border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">campaign</span>
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                          Lời nhắn / Nhắc nhở
                        </div>
                        <div className="text-[11px] text-[#444746] dark:text-[#8E918F]">
                          Thông báo nhanh cho lớp
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dual-Role Switcher Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex p-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'STUDENT'}
            onClick={() => onModeChange('STUDENT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
              mode === 'STUDENT'
                ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F]'
                : 'bg-transparent text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">checklist</span>
            <span>Việc cần làm</span>
            <span className="px-2 py-0.5 rounded-full bg-white/70 dark:bg-[#1E1F20]/70 text-[11px] font-bold">
              {enrolledClasses.length} lớp
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'TEACHER'}
            onClick={() => onModeChange('TEACHER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
              mode === 'TEACHER'
                ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F]'
                : 'bg-transparent text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">rate_review</span>
            <span>Cần chấm &amp; Quản lý</span>
            <span className="px-2 py-0.5 rounded-full bg-white/70 dark:bg-[#1E1F20]/70 text-[11px] font-bold">
              {teachingClasses.length} lớp
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
