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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm flex flex-col gap-4 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[22px]">
            checklist
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t('aiTasksTitle')}
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          {t('aiTasksCompletedCount', { completed: completedCount, total: tasks.length })}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <label
            key={task.id}
            className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
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
                      ? 'text-slate-400 dark:text-slate-500 line-through'
                      : 'text-slate-800 dark:text-slate-200 group-hover:text-secondary font-medium'
                  }`}
                >
                  {task.title}
                </span>
                {task.badgeText && (
                  <a
                    href={task.badgeUrl || '#'}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:underline px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20"
                  >
                    <span>{task.badgeText}</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {task.subtext}
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-[18px] transition-opacity ${
                task.isDone
                  ? 'text-secondary opacity-80'
                  : 'text-slate-400 opacity-0 group-hover:opacity-100'
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
