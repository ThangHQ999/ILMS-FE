'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MoreVertical as MoreVerticalIcon,
  User as UserIcon,
  ArrowRight as ArrowRightIcon,
} from 'lucide-react';
import type { ClassCourse } from '../../schemas/class-detail.schema';

export interface CourseCardProps {
  course?: ClassCourse;
  code?: string;
  credits?: number;
  title?: string;
  instructorName?: string;
  studentsCount?: number;
  knowledgeNodesCount?: number;
  classAvgScore?: number | string;
  progressPercent?: number;
  courseId?: string;
  onEnter?: () => void;
  onAssignTeacher?: () => void;
  onAiExtract?: () => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

export function CourseCard({
  course,
  code: propCode,
  credits: propCredits,
  title: propTitle,
  instructorName: propInstructor,
  studentsCount: propStudents,
  knowledgeNodesCount: propNodes,
  classAvgScore: propAvg,
  progressPercent: propProgress,
  courseId: propId,
  onEnter,
  onAssignTeacher,
  onAiExtract,
  onRemove,
  canRemove = false,
}: CourseCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const code = propCode || course?.code || 'IT-101';
  const credits = propCredits ?? course?.credits ?? 4;
  const title = propTitle || course?.name || 'Nhập môn Khoa học Máy tính & Tư duy thuật toán';
  const instructorName = propInstructor || course?.instructorName || 'Ban Giảng huấn CNTT';
  const studentsCount = propStudents ?? course?.studentsCount ?? 42;
  const knowledgeNodesCount = propNodes ?? course?.knowledgeNodesCount ?? 115;
  const classAvgScore = propAvg ?? course?.classAvgScore ?? 8.4;
  const progressPercent = propProgress ?? course?.teachingProgress ?? (course?.status === 'COMPLETED' ? 100 : 100);
  const courseId = propId || course?.id;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1E1F20] rounded-3xl p-5 flex flex-col h-full min-h-[280px] border-2 border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm dark:shadow-none relative transition-all hover:-translate-y-0.5 duration-200">
      {/* Header: Badges & Options */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <span className="bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA] px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide">
            {code}
          </span>
          <span className="bg-gray-100 dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5] px-2.5 py-1 rounded-md text-[11px] font-semibold">
            {credits} Tín chỉ
          </span>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Tùy chọn môn học"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-500 hover:bg-gray-100 dark:hover:bg-[#282A2C] rounded-full p-1 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
          >
            <MoreVerticalIcon size={18} />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#282A2C] shadow-xl py-1.5 text-xs font-medium text-gray-700 dark:text-[#E3E3E3] z-50 border-none">
                {onAssignTeacher && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onAssignTeacher();
                    }}
                    className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3] cursor-pointer border-none bg-transparent"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>Phân công giảng viên</span>
                  </button>
                )}
                {onAiExtract && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onAiExtract();
                    }}
                    className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3] cursor-pointer border-none bg-transparent"
                  >
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span>Bóc tách thực thể AI</span>
                  </button>
                )}
                {canRemove && onRemove && (
                  <div className="border-t border-gray-100 dark:border-[#383A3C] my-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onRemove();
                      }}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 cursor-pointer border-none bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>Gỡ khỏi lớp học</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title & Instructor */}
      <div>
        {courseId ? (
          <Link href={`/courses/${courseId}`}>
            <h3 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3] line-clamp-2 leading-snug hover:text-blue-600 dark:hover:text-[#A8C7FA] transition-colors">
              {title}
            </h3>
          </Link>
        ) : (
          <h3 className="text-base font-semibold text-gray-900 dark:text-[#E3E3E3] line-clamp-2 leading-snug">
            {title}
          </h3>
        )}
        <p className="text-[12px] font-medium text-gray-500 dark:text-[#8E918F] mt-2 flex items-center gap-1.5">
          <UserIcon size={14} /> {instructorName}
        </p>
      </div>

      {/* Flat Stats Row (REPLACING THE CRAMPED TABLE) */}
      <div className="flex justify-between items-center mt-5 mb-5 px-4 py-3 bg-[#F0F4F8] dark:bg-[#131314] rounded-2xl border-none">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[15px] font-bold text-gray-900 dark:text-[#E3E3E3]">{studentsCount}</span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-[#8E918F]">Sinh viên</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[15px] font-bold text-gray-900 dark:text-[#E3E3E3]">{knowledgeNodesCount}</span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-[#8E918F]">Node Tri thức</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[15px] font-bold text-green-600 dark:text-[#81C995]">{classAvgScore}</span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-[#8E918F]">ĐTB Lớp</span>
        </div>
      </div>

      {/* Progress & Action */}
      <div className="mt-auto flex flex-col gap-4">
        <div>
          <div className="flex justify-between text-[11px] font-medium mb-1.5 text-gray-600 dark:text-[#C4C7C5]">
            <span>Tiến độ hoàn tất</span>
            <span className="text-blue-600 dark:text-[#A8C7FA]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-[#282A2C] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#007BFF] dark:bg-[#A8C7FA] h-1.5 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {courseId ? (
          <Link
            href={`/courses/${courseId}`}
            className="w-full flex justify-center items-center gap-2 bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] rounded-full py-2.5 text-sm font-semibold hover:brightness-95 transition-all border-none cursor-pointer"
          >
            <span>Vào môn học</span>
            <ArrowRightIcon size={16} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onEnter}
            className="w-full flex justify-center items-center gap-2 bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] rounded-full py-2.5 text-sm font-semibold hover:brightness-95 transition-all border-none cursor-pointer"
          >
            <span>Vào môn học</span>
            <ArrowRightIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// Aliases for compatibility
export { CourseCard as StudentCourseCard };
