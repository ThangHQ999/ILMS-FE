'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface CourseMatrixItem {
  code: string;
  title: string;
  instructor: string;
  progressPercent: number;
  submittedRatio: string;
  submittedPercent: string;
  isCompleted?: boolean;
  sparklineD: string;
}

const defaultCourses: CourseMatrixItem[] = [
  {
    code: 'CS-202',
    title: 'Cấu trúc dữ liệu & Giải thuật',
    instructor: 'TS. Nguyễn Văn An',
    progressPercent: 85,
    submittedRatio: '348 / 378',
    submittedPercent: '92%',
    sparklineD: 'M0,24 Q15,20 28,15 T60,10 T85,4 T100,2',
  },
  {
    code: 'CS-301',
    title: 'Thiết kế & Đánh giá Giải thuật',
    instructor: 'PGS. Lê Quốc Thịnh',
    progressPercent: 65,
    submittedRatio: '220 / 336',
    submittedPercent: '65.4%',
    sparklineD: 'M0,26 Q20,18 40,20 T70,12 T100,10',
  },
  {
    code: 'IT-101',
    title: 'Nhập môn Lập trình Hiện đại',
    instructor: 'ThS. Đỗ Hoàng Long',
    progressPercent: 100,
    submittedRatio: '42 / 42 SV',
    submittedPercent: '100%',
    isCompleted: true,
    sparklineD: 'M0,20 Q30,12 55,8 T80,4 T100,0',
  },
  {
    code: 'CS-205',
    title: 'Hệ thống Cơ sở dữ liệu',
    instructor: 'TS. Vũ Mai Trang',
    progressPercent: 48,
    submittedRatio: '164 / 336',
    submittedPercent: '48.8%',
    sparklineD: 'M0,28 Q25,24 50,18 T75,16 T100,14',
  },
];

export function TeacherCourseMatrixCard() {
  const t = useTranslations('dashboard.teacher');

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-surface shadow-md3-1 dark:shadow-none border-none flex flex-col gap-6">
      {/* Header section with CDIO PLO tag and Link */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-1">
        <div>
          {/* Overline text: sentence case, subtle muted color, flat tonal pill */}
          <div className="flex items-center">
            <span className="text-sm text-[#444746] dark:text-[#C4C7C5] font-medium">
              {t('cdioTag')}
            </span>
            <span className="bg-[#E1E5EA] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 border-none">
              {t('semesterTag')}
            </span>
          </div>

          {/* Main Title: modern MD3 heading, enlarged */}
          <h2 className="text-2xl font-medium text-[#1F1F1F] dark:text-[#E3E3E3] mt-2 mb-6 tracking-tight">
            {t('courseMatrixTitle')}
          </h2>
        </div>

        <Link
          href="/competency"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B57D0] dark:text-[#A8C7FA] hover:underline self-start sm:self-auto mt-1"
        >
          <span>{t('viewCompetencyGraph')}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>

      {/* 4 Courses Grid (2x2) with borders and enlarged legible fonts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {defaultCourses.map((course) => (
          <div
            key={course.code}
            className="p-5 sm:p-6 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/70 border border-[#E1E5EA] dark:border-[#282A2C] hover:border-[#C5C6CD] dark:hover:border-[#3C4043] transition-all flex flex-col justify-between gap-5 shadow-none"
          >
            {/* Top row: Code + Title & Progress Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-xs sm:text-sm font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                  {course.code}
                </span>
                <h3
                  className="text-base sm:text-lg font-bold text-foreground truncate mt-1"
                  title={course.title}
                >
                  {course.title}
                </h3>
                <span className="text-sm text-muted-foreground truncate mt-0.5">
                  {course.instructor}
                </span>
              </div>

              {course.isCompleted ? (
                <span className="px-3.5 py-1.5 rounded-full bg-success-container text-on-success-container text-xs sm:text-sm font-medium whitespace-nowrap border-none">
                  {t('courseCompletedTag')}
                </span>
              ) : (
                <span className="bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium border-none whitespace-nowrap">
                  {t('progressRate')}
                </span>
              )}
            </div>

            {/* Middle row: Submissions Metric + Sparkline SVG */}
            <div className="flex items-end justify-between gap-3 pt-1">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {course.isCompleted ? t('ploAchieved') : t('submittedAssignments')}
                </span>
                <span className="text-base sm:text-lg font-bold text-foreground mt-0.5">
                  {course.submittedRatio}{' '}
                  <span className="text-sm font-medium text-muted-foreground">
                    ({course.submittedPercent})
                  </span>
                </span>
              </div>

              {/* Sparkline Visual */}
              <div className="w-32 h-10 flex items-end">
                <svg
                  className="w-full h-full overflow-visible text-[#0B57D0] dark:text-[#A8C7FA]"
                  viewBox="0 0 100 28"
                >
                  <path
                    d={course.sparklineD}
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                  <circle cx="100" cy="2" fill="currentColor" r="3.5" />
                </svg>
              </div>
            </div>

            {/* Bottom: Tonal Rounded Progress Bar */}
            <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden border-none">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  course.isCompleted
                    ? 'bg-[#137333] dark:bg-[#81C995]'
                    : 'bg-[#0B57D0] dark:bg-[#A8C7FA]'
                }`}
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
