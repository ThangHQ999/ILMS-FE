'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ActivityItem {
  id: string;
  actor: string;
  actionText: string;
  subject: string;
  score?: string;
  timeAgo: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const defaultActivities: ActivityItem[] = [
  {
    id: 'a1',
    actor: 'Nguyễn Tuấn Anh',
    actionText: 'vừa nộp',
    subject: 'Quiz 05 (Đồ thị Dijkstra)',
    score: '9.5 / 10.0',
    timeAgo: '12 phút trước',
    icon: 'task_alt',
    iconBg: 'bg-[#D3E3FD] dark:bg-[#004A77]',
    iconColor: 'text-[#041E49] dark:text-[#C2E7FF]',
  },
  {
    id: 'a2',
    actor: 'Trần Thị Bích (Trợ giảng)',
    actionText: 'đã hoàn tất chấm điểm',
    subject: 'Lab 04 (42 bài)',
    timeAgo: '45 phút trước',
    icon: 'rate_review',
    iconBg: 'bg-surface-variant',
    iconColor: 'text-foreground',
  },
  {
    id: 'a3',
    actor: 'AI Socratic Bot',
    actionText: 'đã giải đáp',
    subject: '14 thắc mắc về cân bằng Cây AVL',
    timeAgo: '2 giờ trước',
    icon: 'psychology',
    iconBg: 'bg-[#E8DEF8] dark:bg-[#4A4458]',
    iconColor: 'text-[#1D192B] dark:text-[#E8DEF8]',
  },
];

export function TeacherRecentActivityCard() {
  const t = useTranslations('dashboard.teacher');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <section className="p-6 rounded-3xl bg-surface shadow-md3-1 dark:shadow-none border-none flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[22px]">
            history
          </span>
          <h2 className="text-lg font-bold text-foreground">
            {t('recentActivityTitle')}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-surface-variant border-none cursor-pointer flex items-center justify-center"
          title={t('refresh')}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            refresh
          </span>
        </button>
      </div>

      {/* Activity list with enlarged text */}
      <div className="flex flex-col gap-4">
        {defaultActivities.map((act) => (
          <div key={act.id} className="flex items-start gap-3.5">
            <div
              className={`w-9 h-9 rounded-full ${act.iconBg} ${act.iconColor} flex items-center justify-center shrink-0 border-none mt-0.5`}
            >
              <span className="material-symbols-outlined text-[18px]">{act.icon}</span>
            </div>

            <div className="flex flex-col min-w-0">
              <p className="text-sm leading-relaxed text-foreground">
                <strong className="font-bold text-foreground">{act.actor}</strong>{' '}
                <span className="text-muted-foreground">{act.actionText}</span>{' '}
                <span className="font-semibold text-foreground">{act.subject}</span>
              </p>

              <div className="flex items-center gap-2 mt-1.5">
                {act.score && (
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-variant text-[#0B57D0] dark:text-[#A8C7FA] font-mono text-xs font-bold border-none">
                    {act.score}
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-medium">{act.timeAgo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

