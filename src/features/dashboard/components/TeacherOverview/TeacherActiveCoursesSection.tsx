'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useClasses } from '@/features/classes/hooks/useClasses';

export function TeacherActiveCoursesSection() {
  const t = useTranslations('dashboard.teacher');
  const { data: classesData, isLoading } = useClasses({ role: 'TEACHER', page: 0, size: 12 });
  const realClasses = classesData?.items ?? [];

  return (
    <div>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] tracking-tight font-sans">
            {t('assignedClassesSection')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] mt-0.5 font-sans">
            {t('assignedClassesSub')}
          </p>
        </div>

        <Link
          href="/classes"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 border-none shadow-none ring-0 outline-none whitespace-nowrap self-start sm:self-auto font-sans"
        >
          <span>{t('viewAllClasses')}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>

      {/* Skeletons while loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-64 rounded-3xl bg-slate-200/70 dark:bg-[#1E1F20]" />
          <div className="h-64 rounded-3xl bg-slate-200/70 dark:bg-[#1E1F20]" />
          <div className="h-64 rounded-3xl bg-slate-200/70 dark:bg-[#1E1F20]" />
        </div>
      )}

      {/* Empty State when zero real classes */}
      {!isLoading && realClasses.length === 0 && (
        <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-8 border-none shadow-sm dark:shadow-none text-center flex flex-col items-center justify-center gap-4 py-12">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-[#162B4D] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px]">class</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-[#E3E3E3]">
              Bạn chưa có lớp học nào đang phụ trách
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8E918F] mt-1 max-w-md mx-auto">
              Hãy tạo lớp học mới hoặc nhận phân công giảng dạy để theo dõi sinh viên và lịch dạy.
            </p>
          </div>
          <Link
            href="/classes/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-semibold shadow-md transition-colors font-sans"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Tạo lớp học mới</span>
          </Link>
        </div>
      )}

      {/* Real Course Cards Grid */}
      {!isLoading && realClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {realClasses.slice(0, 6).map((cls, idx) => {
            const classCode = cls.code || cls.enrollmentKey || `LOP-${idx + 1}`;
            const location = `${cls.schedule?.room || 'Phòng B1-204'} • ${cls.enrolledCount || 0} Sinh viên`;
            const semesterText = `${cls.semester || 'HK1'} • ${cls.academicYear || '2026-2027'}`;
            const pendingGrading = cls.stats?.ungradedAssignmentsCount ?? 0;
            const progressPercent =
              typeof cls.stats?.attendanceRate === 'number' ? Math.round(cls.stats.attendanceRate) : 75;

            const colorPalettes = [
              { codeColor: 'text-[#0B57D0] dark:text-[#A8C7FA]', barColor: 'bg-[#0B57D0] dark:bg-[#A8C7FA]' },
              { codeColor: 'text-[#0288D1] dark:text-[#7FCFFF]', barColor: 'bg-[#0288D1] dark:bg-[#7FCFFF]' },
              { codeColor: 'text-[#7F70FB] dark:text-[#D0BCFF]', barColor: 'bg-[#7F70FB] dark:bg-[#D0BCFF]' },
            ];
            const palette = colorPalettes[idx % colorPalettes.length];

            return (
              <div
                key={cls.id}
                className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 md:p-7 flex flex-col justify-between border-none shadow-sm dark:shadow-none ring-0 outline-none transition-transform hover:-translate-y-1 duration-200"
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`bg-gray-100 dark:bg-[#282A2C] px-3 py-1 rounded-full text-xs font-mono font-bold border-none shadow-none ring-0 outline-none ${palette.codeColor}`}
                    >
                      {classCode}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-[#8E918F] font-medium font-sans">
                      {semesterText}
                    </span>
                  </div>

                  {/* Title & Location */}
                  <Link href={`/classes/${cls.id}`} className="group">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3] leading-snug font-sans group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors line-clamp-1">
                      {cls.name}
                    </h3>
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] mt-1.5 font-medium font-sans">
                    {location}
                  </p>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="bg-gray-100 text-gray-700 dark:bg-[#282A2C] dark:text-[#C4C7C5] px-3 py-1 rounded-full text-xs font-medium border-none shadow-none ring-0 outline-none font-sans">
                      {cls.academicYear || '2026-2027'}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border-none shadow-none ring-0 outline-none font-sans ${
                        pendingGrading > 0
                          ? 'bg-[#FFF4E5] text-[#B06000] dark:bg-[#3C2A1E] dark:text-[#FFB784]'
                          : 'bg-gray-100 text-gray-700 dark:bg-[#282A2C] dark:text-[#C4C7C5]'
                      }`}
                    >
                      {pendingGrading > 0 ? `${pendingGrading} Bài chờ chấm` : 'Đã chấm hết'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
                      <span className="text-gray-500 dark:text-[#8E918F] font-medium">
                        {t('semesterProgress')}
                      </span>
                      <span className="text-gray-900 dark:text-[#E3E3E3] font-bold font-mono">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-[#282A2C] rounded-full overflow-hidden border-none shadow-none ring-0 outline-none">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${palette.barColor}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-8 pt-4 flex items-center justify-between border-t border-gray-100 dark:border-[#282A2C]">
                  <Link
                    href={`/lesson-sessions?classId=${cls.id}`}
                    className="text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA] hover:underline flex items-center gap-1 font-sans"
                  >
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>Lịch ca học</span>
                  </Link>

                  <Link
                    href={`/classes/${cls.id}`}
                    className="text-[#0B57D0] hover:bg-gray-100 dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1 border-none shadow-none ring-0 outline-none font-sans"
                  >
                    <span>{t('manageClass')}</span>
                    <span>➔</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}