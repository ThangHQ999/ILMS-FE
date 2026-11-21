'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AITaskItem } from '../../types';

interface AITaskChecklistProps {
  initialTasks: AITaskItem[];
}

export function AITaskChecklist({ initialTasks }: AITaskChecklistProps) {
  const t = useTranslations('dashboard');
  const [tasks, setTasks] = useState<AITaskItem[]>(initialTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDone: !t.isDone } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.isDone).length;

  return (
    <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 flex flex-col gap-4 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[22px]">
            checklist
          </span>
          <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('aiTasksTitle')}
          </h3>
        </div>
        <span className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5] bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-1 rounded-full whitespace-nowrap border-none">
          {t('aiTasksCompletedCount', { completed: completedCount, total: tasks.length })}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <label
            key={task.id}
            className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]/60 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={task.isDone}
              onChange={() => toggleTask(task.id)}
              className="mt-1 w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm select-none transition-all ${
                    task.isDone
                      ? 'text-[#747775] dark:text-[#8E918F] line-through'
                      : 'text-[#1F1F1F] dark:text-[#E3E3E3] group-hover:text-secondary font-medium'
                  }`}
                >
                  {task.title}
                </span>
                {task.badgeText && (
                  <a
                    href={task.badgeUrl || '#'}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#041E49] dark:text-[#A8C7FA] hover:underline px-2.5 py-0.5 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] whitespace-nowrap border-none"
                  >
                    <span>{task.badgeText}</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>
                )}
              </div>
              <span className="text-xs text-[#747775] dark:text-[#C4C7C5] mt-0.5">
                {task.subtext}
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-[18px] transition-opacity ${
                task.isDone
                  ? 'text-secondary opacity-80'
                  : 'text-[#8E918F] opacity-0 group-hover:opacity-100'
              }`}
            >
              {task.icon}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
