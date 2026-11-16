'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface AssignedCourseCardItem {
  code: string;
  codeColor: string;
  title: string;
  location: string;
  badge1: string;
  badge2: string;
  badge2Warning?: boolean;
  progressPercent: number;
  progressColor: string;
  avgGrade: string;
  classId: string;
}

const defaultAssignedCourses: AssignedCourseCardItem[] = [
  {
    code: 'CS-202',
    codeColor: 'text-[#0B57D0] dark:text-[#A8C7FA]',
    title: 'Cấu trúc dữ liệu & Giải thuật',
    location: 'Hội trường H6-302 • 60 Sinh viên',
    badge1: '18/22 Bài giảng',
    badge2: '14 Bài chờ chấm',
    badge2Warning: true,
    progressPercent: 75,
    progressColor: 'bg-[#0B57D0] dark:bg-[#A8C7FA]',
    avgGrade: '8.2',
    classId: 'CNTT-K21A',
  },
  {
    code: 'CS-301',
    codeColor: 'text-[#0288D1] dark:text-[#7FCFFF]',
    title: 'Lập trình Web nâng cao',
    location: 'Phòng Lab 402 • 45 Sinh viên',
    badge1: '12/16 Buổi thực hành',
    badge2: '8 Bài chờ chấm',
    progressPercent: 60,
    progressColor: 'bg-[#0288D1] dark:bg-[#7FCFFF]',
    avgGrade: '7.9',
    classId: 'CNTT-K21A',
  },
  {
    code: 'ICPC-ADV',
    codeColor: 'text-[#7F70FB] dark:text-[#D0BCFF]',
    title: 'Luyện thi thuật toán ICPC',
    location: 'Phòng Lab AI 501 • 30 Sinh viên',
    badge1: 'Chuyên sâu Đồ thị & DP',
    badge2: '12 Bài chờ chấm',
    badge2Warning: true,
    progressPercent: 88,
    progressColor: 'bg-[#7F70FB] dark:bg-[#D0BCFF]',
    avgGrade: '9.1',
    classId: 'CNTT-K21A',
  },
];

export function TeacherActiveCoursesSection() {
  const t = useTranslations('dashboard.teacher');

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

      {/* 3 Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {defaultAssignedCourses.map((course) => (
          <div
            key={course.code}
            className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 md:p-7 flex flex-col justify-between border-none shadow-sm dark:shadow-none ring-0 outline-none transition-transform hover:-translate-y-1 duration-200"
          >
            <div>
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`bg-gray-100 dark:bg-[#282A2C] px-3 py-1 rounded-full text-xs font-mono font-bold border-none shadow-none ring-0 outline-none ${course.codeColor}`}
                >
                  {course.code}
                </span>
                <span className="text-xs text-gray-500 dark:text-[#8E918F] font-medium font-sans">
                  HK1 • 2024
                </span>
              </div>

              {/* Title & Location */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3] leading-snug font-sans">
                {course.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] mt-1.5 font-medium font-sans">
                {course.location}
              </p>

              {/* Metadata Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-gray-100 text-gray-700 dark:bg-[#282A2C] dark:text-[#C4C7C5] px-3 py-1 rounded-full text-xs font-medium border-none shadow-none ring-0 outline-none font-sans">
                  {course.badge1}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border-none shadow-none ring-0 outline-none font-sans ${
                    course.badge2Warning
                      ? 'bg-[#FFF4E5] text-[#B06000] dark:bg-[#3C2A1E] dark:text-[#FFB784]'
                      : 'bg-gray-100 text-gray-700 dark:bg-[#282A2C] dark:text-[#C4C7C5]'
                  }`}
                >
                  {course.badge2}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
                  <span className="text-gray-500 dark:text-[#8E918F] font-medium">
                    {t('semesterProgress')}
                  </span>
                  <span className="text-gray-900 dark:text-[#E3E3E3] font-bold font-mono">
                    {course.progressPercent}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-[#282A2C] rounded-full overflow-hidden border-none shadow-none ring-0 outline-none">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${course.progressColor}`}
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 flex items-center justify-between border-none shadow-none ring-0 outline-none">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] font-sans">
                {t('avgGrade')}:{' '}
                <strong className="text-gray-900 dark:text-[#E3E3E3] font-bold font-mono">
                  {course.avgGrade}
                </strong>
              </span>

              <Link
                href={`/classes`}
                className="text-[#0B57D0] hover:bg-gray-100 dark:text-[#A8C7FA] dark:hover:bg-[#282A2C] rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1 border-none shadow-none ring-0 outline-none font-sans"
              >
                <span>{t('manageClass')}</span>
                <span>➔</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
