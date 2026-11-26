'use client';

import React from 'react';
import { CustomSelect } from '@/components/shared';
import type {
  AssessmentHubKpi,
  AssessmentKind,
  HubClassSummary,
  HubCourseOption,
} from '../../schemas/assessment-hub.schema';

export type StudentStatusTab = 'TODO' | 'OVERDUE' | 'COMPLETED' | 'ALL';
export type TeacherStatusTab = 'NEEDS_GRADING' | 'OPEN' | 'DRAFT' | 'CLOSED' | 'ALL';

interface AssessmentHubFilterBarProps {
  mode: 'STUDENT' | 'TEACHER';
  studentTab: StudentStatusTab;
  onStudentTabChange: (tab: StudentStatusTab) => void;
  teacherTab: TeacherStatusTab;
  onTeacherTabChange: (tab: TeacherStatusTab) => void;
  kpi: AssessmentHubKpi;
  classes: HubClassSummary[];
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  courses: HubCourseOption[];
  isLoadingCourses: boolean;
  selectedCourseId: string;
  onCourseChange: (courseId: string) => void;
  selectedKind: AssessmentKind | 'ALL';
  onKindChange: (kind: AssessmentKind | 'ALL') => void;
  search: string;
  onSearchChange: (q: string) => void;
  onResetFilters: () => void;
}

export function AssessmentHubFilterBar({
  mode,
  studentTab,
  onStudentTabChange,
  teacherTab,
  onTeacherTabChange,
  kpi,
  classes,
  selectedClassId,
  onClassChange,
  courses,
  isLoadingCourses,
  selectedCourseId,
  onCourseChange,
  selectedKind,
  onKindChange,
  search,
  onSearchChange,
  onResetFilters,
}: AssessmentHubFilterBarProps) {
  const hasFilters =
    selectedClassId !== 'ALL' ||
    selectedCourseId !== 'ALL' ||
    selectedKind !== 'ALL' ||
    search.trim().length > 0;

  const studentTabs: Array<{ id: StudentStatusTab; label: string; count: number }> = [
    { id: 'TODO', label: 'Cần làm', count: kpi.todoCount },
    { id: 'OVERDUE', label: 'Quá hạn', count: kpi.overdueCount },
    { id: 'COMPLETED', label: 'Đã nộp & Có điểm', count: kpi.submittedCount + kpi.gradedCount },
    { id: 'ALL', label: 'Tất cả', count: kpi.totalCount },
  ];

  const teacherTabs: Array<{ id: TeacherStatusTab; label: string; count: number }> = [
    { id: 'NEEDS_GRADING', label: 'Cần chấm', count: kpi.pendingGradingCount },
    { id: 'OPEN', label: 'Đang mở', count: kpi.openCount },
    { id: 'DRAFT', label: 'Bản nháp', count: kpi.draftCount },
    { id: 'ALL', label: 'Tất cả', count: kpi.totalCount },
  ];

  return (
    <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 shadow-sm dark:shadow-none border-none space-y-4">
      {/* Row 1: Status Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex flex-wrap p-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]"
          role="tablist"
        >
          {mode === 'STUDENT'
            ? studentTabs.map((tab) => {
                const active = studentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onStudentTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#E3E3E3] shadow-xs dark:shadow-none'
                        : 'bg-transparent text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-[10px] font-bold">
                      {tab.count}
                    </span>
                  </button>
                );
              })
            : teacherTabs.map((tab) => {
                const active = teacherTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onTeacherTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#E3E3E3] shadow-xs dark:shadow-none'
                        : 'bg-transparent text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-[10px] font-bold">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA] hover:underline border-none bg-transparent cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* Row 2: Cascading Class -> Course Filter + Kind + Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* 1. Class Filter */}
        <div className="lg:col-span-3">
          <CustomSelect<string>
            value={selectedClassId}
            onChange={(val) => onClassChange(val)}
            options={[
              { value: 'ALL', label: `Lớp học: Tất cả (${classes.length})`, icon: 'school' },
              ...classes.map((cls) => ({
                value: cls.id,
                label: cls.classCode ? `${cls.classCode} • ${cls.title || cls.name}` : cls.title || cls.name,
                icon: 'school',
              })),
            ]}
            triggerClassName="h-10 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-xs font-medium"
          />
        </div>

        {/* 2. Cascading Course Filter inside selected Class */}
        <div className="lg:col-span-3">
          {selectedClassId === 'ALL' ? (
            <div
              className="h-10 px-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] opacity-60 flex items-center gap-2 text-xs text-[#444746] dark:text-[#8E918F] cursor-not-allowed select-none"
              title="Chọn một lớp học cụ thể để lọc theo môn học trong lớp đó"
            >
              <span className="material-symbols-outlined text-[17px]">book</span>
              <span className="truncate">Chọn lớp để lọc môn học</span>
            </div>
          ) : (
            <CustomSelect<string>
              value={selectedCourseId}
              onChange={(val) => onCourseChange(val)}
              options={[
                {
                  value: 'ALL',
                  label: isLoadingCourses
                    ? 'Đang tải môn học...'
                    : `Môn học: Tất cả (${courses.length})`,
                  icon: 'book',
                },
                ...courses.map((c) => ({
                  value: c.id,
                  label: c.code ? `${c.code} • ${c.name}` : c.name,
                  icon: 'book',
                })),
              ]}
              triggerClassName="h-10 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-xs font-medium"
            />
          )}
        </div>

        {/* 3. Assessment Kind Filter */}
        <div className="lg:col-span-2">
          <CustomSelect<AssessmentKind | 'ALL'>
            value={selectedKind}
            onChange={(val) => onKindChange(val)}
            options={[
              { value: 'ALL', label: 'Loại: Tất cả', icon: 'category' },
              { value: 'ASSIGNMENT', label: 'Bài tập', icon: 'assignment' },
              { value: 'QUIZ', label: 'Quiz', icon: 'quiz' },
              { value: 'EXAM', label: 'Kiểm tra', icon: 'school' },
            ]}
            triggerClassName="h-10 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-xs font-medium"
          />
        </div>

        {/* 4. Search */}
        <div className="lg:col-span-4 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-[#444746] dark:text-[#8E918F]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên bài tập, Quiz, kiểm tra..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#444746] dark:placeholder:text-[#8E918F] border-none outline-none"
          />
        </div>
      </div>
    </section>
  );
}
