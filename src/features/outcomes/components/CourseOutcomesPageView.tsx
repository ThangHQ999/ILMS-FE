'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CloPloMatrixTable } from './CloPloMatrixTable';
import { ClassKnowledgeHeatmapMatrix } from './ClassKnowledgeHeatmapMatrix';
import { OutcomeAttainmentDashboard } from './OutcomeAttainmentDashboard';

interface CourseOutcomesPageViewProps {
  courseId: string;
  courseTitle?: string;
  classId?: string;
}

export function CourseOutcomesPageView({
  courseId,
  courseTitle = 'Cấu trúc dữ liệu & Giải thuật nâng cao (CS-202)',
  classId = 'cls-cs202',
}: CourseOutcomesPageViewProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'heatmap' | 'attainment'>('matrix');

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Link
            href="/courses"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Môn học
          </Link>
          <span>/</span>
          <Link
            href={`/courses/${courseId}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition font-semibold"
          >
            {courseId}
          </Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">
            Chuẩn đầu ra &amp; Ma trận
          </span>
        </div>

        {/* Page Banner / Title */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                Phân hệ Chuẩn đầu ra &amp; Ma trận tri thức
              </span>
              <span className="font-mono text-xs text-gray-400">&bull; {courseId}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {courseTitle}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Quản trị chuẩn đầu ra môn học (CLO), chuẩn chương trình đào tạo (PLO), ma trận ánh xạ 2 chiều và đánh giá mức độ đạt chuẩn.
            </p>
          </div>

          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#282A2C] transition self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            <span>Về chi tiết môn</span>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer border-none ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282A2C]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">grid_on</span>
            <span>Ma trận Ánh xạ CLO - PLO</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attainment')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer border-none ${
              activeTab === 'attainment'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282A2C]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">verified</span>
            <span>Đánh giá Đạt chuẩn (Outcome Attainment)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer border-none ${
              activeTab === 'heatmap'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282A2C]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">analytics</span>
            <span>Bản đồ nhiệt Tri thức Cả lớp</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'matrix' && (
          <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-sm dark:shadow-none">
            <CloPloMatrixTable courseId={courseId} isTeacher={true} />
          </div>
        )}

        {activeTab === 'attainment' && (
          <OutcomeAttainmentDashboard classId={classId} courseId={courseId} isTeacher={true} />
        )}

        {activeTab === 'heatmap' && (
          <ClassKnowledgeHeatmapMatrix classId={classId} courseId={courseId} />
        )}
      </main>
    </div>
  );
}
