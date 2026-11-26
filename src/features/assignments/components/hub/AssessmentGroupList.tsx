'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EmptyState, ErrorState } from '@/components/shared';
import type { UnifiedAssessmentItem } from '../../schemas/assessment-hub.schema';
import { AssessmentRowCard } from './AssessmentRowCard';

interface AssessmentGroupListProps {
  mode: 'STUDENT' | 'TEACHER';
  items: UnifiedAssessmentItem[];
  totalBeforeFilter: number;
  hasFilters: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onResetFilters: () => void;
  onPublish?: (kind: 'QUIZ' | 'EXAM', id: string) => void;
  isPublishing?: boolean;
}

interface GroupBucket {
  key: string;
  title: string;
  items: UnifiedAssessmentItem[];
}

function groupItemsByUrgency(
  items: UnifiedAssessmentItem[],
  mode: 'STUDENT' | 'TEACHER'
): GroupBucket[] {
  if (mode === 'TEACHER') {
    const needsGrading = items.filter((i) => i.status === 'NEEDS_GRADING');
    const open = items.filter((i) => i.status === 'OPEN');
    const draft = items.filter((i) => i.status === 'DRAFT');
    const closed = items.filter((i) => i.status === 'CLOSED');
    return [
      { key: 'needs-grading', title: 'Cần chấm điểm ngay', items: needsGrading },
      { key: 'open', title: 'Đang mở', items: open },
      { key: 'draft', title: 'Bản nháp', items: draft },
      { key: 'closed', title: 'Đã kết thúc', items: closed },
    ].filter((g) => g.items.length > 0);
  }

  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

  const overdue: UnifiedAssessmentItem[] = [];
  const thisWeek: UnifiedAssessmentItem[] = [];
  const upcoming: UnifiedAssessmentItem[] = [];
  const noDue: UnifiedAssessmentItem[] = [];

  for (const item of items) {
    if (item.status === 'OVERDUE') {
      overdue.push(item);
      continue;
    }
    if (!item.dueDate) {
      noDue.push(item);
      continue;
    }
    const dueTs = new Date(item.dueDate).getTime();
    if (Number.isNaN(dueTs)) {
      noDue.push(item);
    } else if (dueTs - now <= oneWeekMs) {
      thisWeek.push(item);
    } else {
      upcoming.push(item);
    }
  }

  return [
    { key: 'overdue', title: 'Quá hạn', items: overdue },
    { key: 'this-week', title: 'Hạn trong tuần này', items: thisWeek },
    { key: 'upcoming', title: 'Sắp tới', items: upcoming },
    { key: 'no-due', title: 'Không có hạn chót / Đã xong', items: noDue },
  ].filter((g) => g.items.length > 0);
}

export function AssessmentGroupList({
  mode,
  items,
  totalBeforeFilter,
  hasFilters,
  isLoading,
  isFetching,
  isError,
  error,
  onRetry,
  onResetFilters,
  onPublish,
  isPublishing = false,
}: AssessmentGroupListProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // State 2: Skeleton Loading
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 animate-pulse flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C] shrink-0" />
              <div className="space-y-2 flex-1 max-w-md">
                <div className="h-4 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] w-1/3" />
                <div className="h-5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] w-2/3" />
              </div>
            </div>
            <div className="h-9 w-24 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C]" />
          </div>
        ))}
      </div>
    );
  }

  // State 6: Error
  if (isError) {
    return (
      <ErrorState
        title="Không thể tải danh sách bài tập & đánh giá"
        description="Đã xảy ra sự cố khi đồng bộ dữ liệu từ lớp học. Vui lòng thử lại."
        error={error}
        onRetry={onRetry}
      />
    );
  }

  // State 4: Empty Filter / Search mismatch
  if (items.length === 0 && (hasFilters || totalBeforeFilter > 0)) {
    return (
      <EmptyState
        variant="not-found"
        title="Không tìm thấy bài tập phù hợp"
        description="Thử thay đổi bộ lọc lớp học, môn học, loại bài hoặc từ khóa tìm kiếm."
        onReset={onResetFilters}
        resetLabel="Đặt lại bộ lọc"
      />
    );
  }

  // State 3: Empty Zero-Data
  if (items.length === 0) {
    return (
      <EmptyState
        variant="zero-data"
        title={
          mode === 'STUDENT'
            ? 'Bạn chưa có bài tập nào cần làm'
            : 'Chưa có bài tập hay đề kiểm tra nào'
        }
        description={
          mode === 'STUDENT'
            ? 'Khi giảng viên giao bài tập, Quiz hoặc đề kiểm tra trong các lớp bạn tham gia, chúng sẽ xuất hiện tại đây.'
            : 'Hãy vào lớp học hoặc bấm nút "Giao bài" ở góc trên để tạo bài tập, Quiz hoặc đề kiểm tra đầu tiên.'
        }
        action={
          <Link
            href="/classes"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] text-xs font-semibold hover:brightness-95 transition-all"
          >
            <span>Đi tới Lớp học của tôi</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        }
      />
    );
  }

  const groups = groupItemsByUrgency(items, mode);

  // State 1 & 7: Normal + Background Fetching opacity
  return (
    <div
      className={`space-y-6 transition-opacity duration-200 ${
        isFetching ? 'opacity-70' : 'opacity-100'
      }`}
    >
      {groups.map((group) => {
        const isCollapsed = Boolean(collapsedGroups[group.key]);
        return (
          <section key={group.key} className="space-y-3">
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] border-none bg-transparent cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isCollapsed ? 'chevron_right' : 'expand_more'}
              </span>
              <span>
                {group.title} ({group.items.length})
              </span>
            </button>

            {!isCollapsed && (
              <div className="space-y-3">
                {group.items.map((item) => (
                  <AssessmentRowCard
                    key={`${item.kind}-${item.classId}-${item.id}`}
                    item={item}
                    mode={mode}
                    onPublish={onPublish}
                    isPublishing={isPublishing}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
