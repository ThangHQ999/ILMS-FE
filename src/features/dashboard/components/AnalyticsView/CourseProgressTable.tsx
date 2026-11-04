'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CourseProgress, CourseFilterTab } from '../../types';

interface CourseProgressTableProps {
  courses: CourseProgress[];
}

export function CourseProgressTable({ courses }: CourseProgressTableProps) {
  const t = useTranslations('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<CourseFilterTab>('in_progress');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.codeOrClass.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'in_progress') return course.status !== 'completed';
    if (activeFilter === 'completed') return course.status === 'completed';
    return true;
  });

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-800">
      {/* Table Header / Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t('coursesTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('coursesSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-slate-400">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 pr-3 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary w-44 text-slate-900 dark:text-slate-100 border border-transparent focus:border-secondary/30"
              placeholder={t('searchCourses')}
              type="text"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-secondary font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              type="button"
            >
              {t('filterAllCourses')}
            </button>
            <button
              onClick={() => setActiveFilter('in_progress')}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                activeFilter === 'in_progress'
                  ? 'bg-white dark:bg-slate-900 text-secondary font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              type="button"
            >
              {t('filterInProgress')}
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                activeFilter === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-secondary font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              type="button"
            >
              {t('filterCompleted')}
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <th className="py-3 px-4 rounded-l-xl">{t('thCourse')}</th>
              <th className="py-3 px-4">{t('thNodes')}</th>
              <th className="py-3 px-4 w-44">{t('thProgress')}</th>
              <th className="py-3 px-4">{t('thScore')}</th>
              <th className="py-3 px-4">{t('thStatus')}</th>
              <th className="py-3 px-4 rounded-r-xl text-right">{t('thActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCourses.map((course) => {
              const isSecondary = course.colorType === 'secondary';
              const isTertiary = course.colorType === 'tertiary';
              return (
                <tr
                  key={course.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSecondary
                            ? 'bg-secondary/15 text-secondary'
                            : isTertiary
                            ? 'bg-tertiary/15 text-tertiary'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">{course.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {course.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {course.codeOrClass} • {course.instructor}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-mono text-xs text-slate-900 dark:text-slate-100">
                    {course.nodesCompleted} / {course.nodesTotal}{' '}
                    <span className="text-[11px] text-slate-400 font-sans">{t('nodesUnit')}</span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span
                          className={
                            isSecondary
                              ? 'text-secondary'
                              : isTertiary
                              ? 'text-tertiary'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {course.progressPercent}%{' '}
                          {course.status === 'completed' ? t('courseCompleted') : ''}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isSecondary
                              ? 'bg-secondary'
                              : isTertiary
                              ? 'bg-tertiary'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {course.avgScore}
                    </span>
                    <span className="text-xs text-slate-400"> / {course.maxScore}</span>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isSecondary
                          ? 'bg-secondary/15 text-secondary'
                          : isTertiary
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSecondary
                            ? 'bg-secondary'
                            : isTertiary
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      {course.statusBadgeText}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-sm inline-flex items-center gap-1 ${
                        isSecondary
                          ? 'bg-secondary hover:opacity-90 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                      type="button"
                    >
                      <span>{course.actionText}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {course.actionIcon}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
