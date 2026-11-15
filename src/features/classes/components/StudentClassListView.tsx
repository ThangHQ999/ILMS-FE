'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, User, ArrowRight } from 'lucide-react';
import type { ClassItem } from '../types';

interface StudentClassListViewProps {
  items: ClassItem[];
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export function StudentClassListView({
  items,
  copiedCode,
  onCopyCode,
}: StudentClassListViewProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Dynamic Tech Icon & Accent Tag
  const getTechDetails = (major: string = '', title: string = '', name: string = '') => {
    const text = `${major} ${title} ${name}`.toLowerCase();

    // 1. AI & Machine Learning
    if (text.includes('trí tuệ') || text.includes('ai') || text.includes('mining') || text.includes('khai phá')) {
      return {
        type: 'ai',
        tag: 'AI • KNOWLEDGE GRAPHS & MINING',
        icon: 'psychology',
      };
    }

    // 2. Kỹ thuật lập trình (C++)
    if (text.includes('kỹ thuật lập trình') || text.includes('ktlt') || text.includes('c++')) {
      return {
        type: 'cpp',
        tag: 'C++ • MODERN CODING',
        icon: 'terminal',
      };
    }

    // 3. Algorithms & Data Structures (CTDL / THTT)
    if (text.includes('cấu trúc dữ liệu') || text.includes('ctdl') || text.includes('thuật nâng cao')) {
      return {
        type: 'algorithms',
        tag: 'ADVANCED DSA • TREE & GRAPH',
        icon: 'account_tree',
      };
    }

    // 4. Algorithms & Graph Theory (THTT)
    if (text.includes('thông minh') || text.includes('thiet ke') || text.includes('thtt') || text.includes('graph theory')) {
      return {
        type: 'graph',
        tag: 'ALGORITHMS • GRAPH THEORY',
        icon: 'schema',
      };
    }

    // 5. Database Systems (CSDL)
    if (text.includes('cơ sở dữ liệu') || text.includes('csdl') || text.includes('database') || text.includes('sql')) {
      return {
        type: 'db',
        tag: 'DATABASE • SQL & NORMALIZATION',
        icon: 'database',
      };
    }

    // Default Tech
    return {
      type: 'default',
      tag: 'COMPUTER SCIENCE & IT',
      icon: 'school',
    };
  };

  // Student specific mock metrics
  const getStudentMetrics = (item: ClassItem) => {
    const textLower = (item.name + (item.title || '')).toLowerCase();

    // 1. CSDL
    if (textLower.includes('csdl') || textLower.includes('dữ liệu')) {
      return {
        grade: '8.4',
        gradeColor: 'bg-emerald-50 dark:bg-[#142E20] text-emerald-700 dark:text-[#81C995]',
        teacher: 'TS. Lê Hoàng Nam',
        progressPercent: 28,
        nodesUnlocked: '110 Node tri thức',
        schedule: 'Thứ 4 (Tiết 1-3) • Phòng Lab A3-201',
        alert: {
          type: 'warning',
          icon: 'warning',
          text: 'Lab 03 (SQL Stored Procedures) còn 2 ngày đến hạn nộp',
          action: 'Nộp Lab ngay',
          actionClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
        },
      };
    }

    // 2. CTDL / Thuật toán
    if (textLower.includes('ctdl') || textLower.includes('thuật')) {
      return {
        grade: '8.2',
        gradeColor: 'bg-emerald-50 dark:bg-[#142E20] text-emerald-700 dark:text-[#81C995]',
        teacher: 'PGS. TS. Trần Đức Trung',
        progressPercent: 45,
        nodesUnlocked: '95 Node tri thức',
        schedule: 'Thứ 3 (Tiết 1-3) • Phòng Online MS Teams',
        alert: {
          type: 'warning',
          icon: 'edit_note',
          text: 'Quiz 04 (Dijkstra & DSU) mở đến Chủ nhật tuần này',
          action: 'Làm Quiz',
          actionClass: 'bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA]',
        },
      };
    }

    // 3. OOP
    if (textLower.includes('oop') || textLower.includes('đối tượng')) {
      return {
        grade: '9.0',
        gradeColor: 'bg-emerald-50 dark:bg-[#142E20] text-emerald-700 dark:text-[#81C995]',
        teacher: 'ThS. Hoàng Minh Tuấn',
        progressPercent: 75,
        nodesUnlocked: '120 Node tri thức',
        schedule: 'Thứ 2 (Tiết 7-9) • Phòng Lab B2-104',
        alert: {
          type: 'success',
          icon: 'check_circle',
          text: 'Đã nộp toàn bộ bài tập tuần này • Điểm Lab gần nhất: Xuất sắc',
          action: '',
          actionClass: '',
        },
      };
    }

    // 4. AI
    if (textLower.includes('ai') || textLower.includes('trí tuệ')) {
      return {
        grade: '8.6',
        gradeColor: 'bg-emerald-50 dark:bg-[#142E20] text-emerald-700 dark:text-[#81C995]',
        teacher: 'TS. Nguyễn Bảo Anh • Trợ giảng AI Socratic 24/7',
        progressPercent: 35,
        nodesUnlocked: '120 Node tri thức',
        schedule: 'Thứ 7 (Tiết 4-6) • Hội trường C1',
        alert: {
          type: 'purple',
          icon: 'smart_toy',
          text: 'Socratic AI gợi ý: Ôn tập 5 câu hỏi Flashcard thuật toán A*',
          action: 'Ôn ngay',
          actionClass: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300',
        },
      };
    }

    // Default
    return {
      grade: '8.4',
      gradeColor: 'bg-emerald-50 dark:bg-[#142E20] text-emerald-700 dark:text-[#81C995]',
      teacher: item.instructor?.fullName || 'Ban Giảng huấn CNTT',
      progressPercent: 28,
      nodesUnlocked: '110 Node tri thức',
      schedule: item.schedule?.dayOfWeek ? `${item.schedule.dayOfWeek} (${item.schedule.timeSlot || 'Tiết 1-3'})` : 'Thứ 4 (Tiết 1-3)',
      alert: {
        type: 'info',
        icon: 'info',
        text: 'Tuần học 09: Chuẩn bị nội dung tổng kết giữa kỳ',
        action: 'Xem ngay',
        actionClass: 'bg-blue-100 dark:bg-[#162B4D] text-blue-800 dark:text-[#A8C7FA]',
      },
    };
  };

  return (
    <div className="flex flex-col gap-4.5 pt-1" id="classes-list-container">
      {items.map((item) => {
        const tech = getTechDetails(item.major, item.title, item.name);
        const student = getStudentMetrics(item);
        const isCopied = copiedCode === (item.enrollmentKey || item.name);
        const isMenuOpen = activeMenuId === item.id;

        return (
          <article
            key={item.id}
            className="group bg-white dark:bg-[#1E1F20] rounded-3xl shadow-sm dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative border-none"
          >
            {/* MAIN HORIZONTAL CONTENT ROW */}
            <div className="p-5 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4.5">
              {/* LEFT BLOCK: THUMBNAIL & COURSE INFO */}
              <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                {/* Tonal Icon Box (Zero rainbow gradients, MD3 clean) */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">
                    {tech.icon}
                  </span>
                </div>

                {/* Course Details Block */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#142E20] text-[#81C995] text-[10px] font-bold uppercase tracking-wide">
                      Học viên
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] text-[11px] font-medium border-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Đang diễn ra
                    </span>
                    <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-[#8E918F] uppercase tracking-wider truncate">
                      {tech.tag}
                    </span>
                  </div>

                  {/* Course Title Link */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-[#E3E3E3] leading-snug">
                    <Link
                      href={`/classes/${item.id}`}
                      prefetch={true}
                      className="hover:text-blue-600 dark:hover:text-[#A8C7FA] transition-colors line-clamp-1"
                    >
                      {item.title || item.name}
                    </Link>
                  </h3>

                  {/* Meta Details: Code, Instructor & Schedule */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-[#C4C7C5]">
                    {/* Class Code & Copy */}
                    <button
                      type="button"
                      onClick={() => onCopyCode(item.enrollmentKey || item.name)}
                      className="inline-flex items-center gap-1.5 font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-80 text-gray-800 dark:text-[#C4C7C5] transition-colors cursor-pointer border-none"
                      title="Sao chép mã lớp"
                    >
                      <span>{item.name}</span>
                      <span className="material-symbols-outlined text-[13px] text-blue-600 dark:text-[#A8C7FA]">
                        {isCopied ? 'check' : 'content_copy'}
                      </span>
                    </button>

                    {/* Instructor */}
                    <span className="flex items-center gap-1.5 truncate">
                      <User size={13} className="text-gray-400 dark:text-[#8E918F] shrink-0" />
                      <span className="truncate">{student.teacher}</span>
                    </span>

                    {/* Schedule & Room */}
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-[#8E918F] whitespace-nowrap">
                      <span className="material-symbols-outlined text-[15px] text-blue-600 dark:text-[#A8C7FA] shrink-0">
                        schedule
                      </span>
                      <span>{student.schedule}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* MIDDLE BLOCK: ACADEMIC METRICS & KNOWLEDGE PROGRESS */}
              <div className="flex items-center justify-between sm:justify-start xl:justify-center gap-4 sm:gap-6 pt-3 xl:pt-0 shrink-0">
                {/* GPA / Process Grade Badge */}
                <div
                  className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-2xl ${student.gradeColor} min-w-[95px] text-center border-none`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Điểm QT
                  </span>
                  <span className="font-mono text-base sm:text-lg font-black tracking-tight">
                    {student.grade}
                    <span className="text-[11px] font-normal opacity-70"> / 10</span>
                  </span>
                </div>

                {/* Knowledge Graph Progress Bar */}
                <div className="w-36 sm:w-44 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 dark:text-[#C4C7C5] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-blue-600 dark:text-[#A8C7FA]">
                        account_tree
                      </span>
                      <span>Tiến độ</span>
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-[#A8C7FA]">
                      {student.progressPercent}%
                    </span>
                  </div>

                  {/* Progress bar line */}
                  <div className="w-full h-2 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#007BFF] dark:bg-[#A8C7FA] transition-all duration-500"
                      style={{ width: `${student.progressPercent}%` }}
                    />
                  </div>

                  <span className="text-[11px] text-gray-500 dark:text-[#8E918F] block text-right font-medium">
                    {student.nodesUnlocked}
                  </span>
                </div>
              </div>

              {/* RIGHT BLOCK: ACTIONS & MENU */}
              <div className="flex items-center justify-end gap-2.5 pt-2 xl:pt-0 shrink-0">
                <Link
                  href={`/classes/${item.id}`}
                  prefetch={true}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-blue-100 dark:bg-[#A8C7FA] hover:opacity-90 text-blue-900 dark:text-[#062E6F] font-semibold text-xs transition-all border-none cursor-pointer"
                >
                  <span>Vào môn học</span>
                  <ArrowRight size={15} />
                </Link>

                {/* Dropdown Menu Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Tác vụ lớp học"
                    onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                    className="w-9 h-9 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-80 text-gray-700 dark:text-[#C4C7C5] flex items-center justify-center transition-colors cursor-pointer border-none"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveMenuId(null)}
                      />
                      <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#282A2C] shadow-xl py-1.5 text-xs font-medium text-gray-700 dark:text-[#E3E3E3] z-50 border-none animate-in fade-in zoom-in-95 duration-150">
                        <Link
                          href={`/classes/${item.id}`}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3]"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#A8C7FA]">
                            login
                          </span>
                          <span>Vào môn học</span>
                        </Link>
                        <Link
                          href={`/classes/${item.id}?tab=assignments`}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3]"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-gray-400 dark:text-[#8E918F]">
                            assignment
                          </span>
                          <span>Xem bài tập &amp; Lab</span>
                        </Link>
                        <Link
                          href={`/classes/${item.id}?tab=people`}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3]"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-gray-400 dark:text-[#8E918F]">
                            group
                          </span>
                          <span>Danh sách bạn cùng lớp</span>
                        </Link>
                        <div className="my-1 border-t border-gray-100 dark:border-[#383A3C]" />
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onCopyCode(item.enrollmentKey || item.name);
                          }}
                          className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-[#333537] text-gray-800 dark:text-[#E3E3E3] cursor-pointer border-none bg-transparent"
                        >
                          <span className="material-symbols-outlined text-[16px] text-gray-400 dark:text-[#8E918F]">
                            content_copy
                          </span>
                          <span>Sao chép mã lớp</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTOM URGENT ALERT STRIP (Nhiệm vụ sắp tới / Cảnh báo deadline) */}
            {student.alert && (
              <div className="px-5 py-2.5 bg-gray-50 dark:bg-[#131314] flex flex-wrap items-center justify-between gap-2.5 text-xs font-medium text-gray-700 dark:text-[#C4C7C5] border-none">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-[#A8C7FA] shrink-0">
                    {student.alert.icon}
                  </span>
                  <span className="truncate">{student.alert.text}</span>
                </div>

                {student.alert.action && (
                  <Link
                    href={`/classes/${item.id}?tab=assignments`}
                    prefetch={true}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border-none ${student.alert.actionClass}`}
                  >
                    {student.alert.action}
                  </Link>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
