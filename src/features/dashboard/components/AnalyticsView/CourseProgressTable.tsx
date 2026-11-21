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
    <section className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 lg:p-7 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
      {/* Table Header / Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('coursesTitle')}
          </h2>
          <p className="text-xs text-[#747775] dark:text-[#C4C7C5] mt-0.5">
            {t('coursesSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-[#747775] dark:text-[#8E918F]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-4 text-xs bg-[#F0F4F9] dark:bg-[#1E1F20] hover:bg-[#E9EEF6] dark:hover:bg-[#282A2C] focus:bg-white dark:focus:bg-[#282A2C] rounded-full focus:outline-none focus:ring-2 focus:ring-[#0B57D0]/40 dark:focus:ring-[#A8C7FA]/40 w-48 text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] dark:placeholder:text-[#8E918F] transition-all border-none"
              placeholder={t('searchCourses')}
              type="text"
            />
          </div>

          {/* Filter Tabs */}
          <div className="bg-[#F0F4F9] dark:bg-[#1E1F20] p-1.5 rounded-full inline-flex items-center gap-1 border-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full text-xs transition-colors whitespace-nowrap border-none cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#E3E3E3] font-semibold'
                  : 'text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
              }`}
              type="button"
            >
              {t('filterAllCourses')}
            </button>
            <button
              onClick={() => setActiveFilter('in_progress')}
              className={`px-4 py-2 rounded-full text-xs transition-colors whitespace-nowrap border-none cursor-pointer ${
                activeFilter === 'in_progress'
                  ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#E3E3E3] font-semibold'
                  : 'text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
              }`}
              type="button"
            >
              {t('filterInProgress')}
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-2 rounded-full text-xs transition-colors whitespace-nowrap border-none cursor-pointer ${
                activeFilter === 'completed'
                  ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#282A2C] dark:text-[#E3E3E3] font-semibold'
                  : 'text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
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
            <tr className="bg-[#F0F4F9] dark:bg-[#282A2C]/60 text-[#747775] dark:text-[#8E918F] text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 rounded-l-xl">{t('thCourse')}</th>
              <th className="py-3 px-4">{t('thNodes')}</th>
              <th className="py-3 px-4 w-44">{t('thProgress')}</th>
              <th className="py-3 px-4">{t('thScore')}</th>
              <th className="py-3 px-4">{t('thStatus')}</th>
              <th className="py-3 px-4 rounded-r-xl text-right">{t('thActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9EEF6] dark:divide-[#282A2C]/50">
            {filteredCourses.map((course) => {
              const isSecondary = course.colorType === 'secondary';
              const isTertiary = course.colorType === 'tertiary';
              return (
                <tr
                  key={course.id}
                  className="hover:bg-[#F0F4F9]/60 dark:hover:bg-[#282A2C]/40 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-none ${
                          isSecondary
                            ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                            : isTertiary
                            ? 'bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784]'
                            : 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">{course.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                          {course.title}
                        </div>
                        <div className="text-xs text-[#747775] dark:text-[#8E918F]">
                          {course.codeOrClass} • {course.instructor}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-mono text-xs text-[#1F1F1F] dark:text-[#E3E3E3]">
                    {course.nodesCompleted} / {course.nodesTotal}{' '}
                    <span className="text-[11px] text-[#747775] dark:text-[#8E918F] font-sans">{t('nodesUnit')}</span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span
                          className={
                            isSecondary
                              ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                              : isTertiary
                              ? 'text-[#B3261E] dark:text-[#F28B82]'
                              : 'text-[#1EA85A] dark:text-[#81C995]'
                          }
                        >
                          {course.progressPercent}%{' '}
                          {course.status === 'completed' ? t('courseCompleted') : ''}
                        </span>
                      </div>
                      <div className="w-full bg-[#F0F4F9] dark:bg-[#282A2C] h-2 rounded-full overflow-hidden border-none">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isSecondary
                              ? 'bg-[#0B57D0] dark:bg-[#A8C7FA]'
                              : isTertiary
                              ? 'bg-[#B3261E] dark:bg-[#F28B82]'
                              : 'bg-[#1EA85A] dark:bg-[#81C995]'
                          }`}
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                      {course.avgScore}
                    </span>
                    <span className="text-xs text-[#747775] dark:text-[#8E918F]"> / {course.maxScore}</span>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border-none ${
                        isSecondary
                          ? 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]'
                          : isTertiary
                          ? 'bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784]'
                          : 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSecondary
                            ? 'bg-[#041E49] dark:bg-[#A8C7FA]'
                            : isTertiary
                            ? 'bg-[#725200] dark:bg-[#FFB784]'
                            : 'bg-[#0D652D] dark:bg-[#81C995]'
                        }`}
                      />
                      {course.statusBadgeText}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      className={`px-5 py-2.5 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap border-none shadow-none ${
                        isSecondary
                          ? 'bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F]'
                          : 'bg-transparent hover:bg-[#F0F4F9] text-[#0B57D0] dark:hover:bg-[#282A2C] dark:text-[#A8C7FA]'
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
