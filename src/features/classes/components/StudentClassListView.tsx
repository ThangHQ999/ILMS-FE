'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

  // Dynamic Tech Gradient, Diagram & Accent Tag (synchronized with ClassCardItem)
  const getTechDetails = (major: string = '', title: string = '', name: string = '') => {
    const text = `${major} ${title} ${name}`.toLowerCase();

    // 1. AI & Machine Learning
    if (text.includes('trí tuệ') || text.includes('ai') || text.includes('mining') || text.includes('khai phá')) {
      return {
        type: 'ai',
        gradient: 'from-slate-900 via-purple-950 to-indigo-800',
        tag: 'AI • KNOWLEDGE GRAPHS & MINING',
        icon: 'psychology',
        textColor: 'text-purple-200',
        progressGradient: 'from-purple-500 to-indigo-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
            <circle cx="100" cy="75" r="25" strokeDasharray="2 2" strokeWidth="1.5" />
            <circle cx="200" cy="75" r="35" strokeWidth="1.5" />
            <circle cx="300" cy="75" r="25" strokeDasharray="2 2" strokeWidth="1.5" />
            <line strokeWidth="2" x1="125" x2="165" y1="75" y2="75" />
            <line strokeWidth="2" x1="235" x2="275" y1="75" y2="75" />
          </svg>
        ),
      };
    }

    // 2. Kỹ thuật lập trình (C++)
    if (text.includes('kỹ thuật lập trình') || text.includes('ktlt') || text.includes('c++')) {
      return {
        type: 'cpp',
        gradient: 'from-slate-900 via-cyan-950 to-blue-800',
        tag: 'C++ • MODERN CODING',
        icon: 'terminal',
        textColor: 'text-cyan-200',
        progressGradient: 'from-cyan-500 to-blue-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
            <path d="M30,75 L120,30 L220,110 L310,40 L380,80" strokeWidth="2" />
            <circle cx="120" cy="30" fill="currentColor" r="4" />
            <circle cx="220" cy="110" fill="currentColor" r="4" />
            <circle cx="310" cy="40" fill="currentColor" r="4" />
          </svg>
        ),
      };
    }

    // 3. Algorithms & Data Structures (CTDL / THTT)
    if (text.includes('cấu trúc dữ liệu') || text.includes('ctdl') || text.includes('thuật nâng cao')) {
      return {
        type: 'algorithms',
        gradient: 'from-slate-900 via-indigo-950 to-indigo-700',
        tag: 'ADVANCED DSA • TREE & GRAPH',
        icon: 'account_tree',
        textColor: 'text-indigo-200',
        progressGradient: 'from-indigo-500 to-purple-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
            <circle cx="200" cy="30" r="10" strokeWidth="2" />
            <circle cx="120" cy="90" r="8" strokeWidth="2" />
            <circle cx="280" cy="90" r="8" strokeWidth="2" />
            <circle cx="80" cy="130" r="6" strokeWidth="1.5" />
            <circle cx="160" cy="130" r="6" strokeWidth="1.5" />
            <line strokeWidth="1.5" x1="195" x2="125" y1="38" y2="82" />
            <line strokeWidth="1.5" x1="205" x2="275" y1="38" y2="82" />
            <line strokeWidth="1.5" x1="115" x2="85" y1="98" y2="125" />
            <line strokeWidth="1.5" x1="125" x2="155" y1="98" y2="125" />
          </svg>
        ),
      };
    }

    // 4. Algorithms & Graph Theory (THTT)
    if (text.includes('thông minh') || text.includes('thiet ke') || text.includes('thtt') || text.includes('graph theory')) {
      return {
        type: 'graph',
        gradient: 'from-slate-900 via-sky-950 to-blue-800',
        tag: 'ALGORITHMS • GRAPH THEORY',
        icon: 'schema',
        textColor: 'text-sky-200',
        progressGradient: 'from-blue-600 to-indigo-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
            <path d="M0,75 C100,20 150,130 250,75 C350,20 400,100 400,100" strokeDasharray="4 4" strokeWidth="2" />
            <circle cx="80" cy="55" fill="currentColor" r="4" />
            <circle cx="200" cy="95" fill="currentColor" r="5" />
            <circle cx="320" cy="50" fill="currentColor" r="4" />
            <line strokeWidth="1.5" x1="80" x2="200" y1="55" y2="95" />
            <line strokeWidth="1.5" x1="200" x2="320" y1="95" y2="50" />
          </svg>
        ),
      };
    }

    // 5. Object Oriented Programming (OOP)
    if (text.includes('hướng đối tượng') || text.includes('oop') || text.includes('java')) {
      return {
        type: 'oop',
        gradient: 'from-slate-900 via-sky-950 to-blue-700',
        tag: 'JAVA • OOP ARCHITECTURE',
        icon: 'code_blocks',
        textColor: 'text-sky-200',
        progressGradient: 'from-sky-500 to-blue-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
            <rect height="70" rx="6" strokeWidth="1.5" width="80" x="50" y="30" />
            <rect height="70" rx="6" strokeWidth="1.5" width="80" x="220" y="30" />
            <path d="M130,65 L220,65" strokeDasharray="3 3" strokeWidth="2" />
            <polygon fill="currentColor" points="215,60 225,65 215,70" />
          </svg>
        ),
      };
    }

    // Default Tech
    return {
      type: 'default',
      gradient: 'from-slate-900 via-slate-800 to-blue-900',
      tag: 'COMPUTER SCIENCE • CORE',
      icon: 'school',
      textColor: 'text-blue-200',
      progressGradient: 'from-blue-500 to-indigo-600',
      diagram: (
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
          <circle cx="200" cy="75" r="40" strokeWidth="1.5" />
          <path d="M100,75 L300,75" strokeDasharray="3 3" strokeWidth="1" />
        </svg>
      ),
    };
  };

  // Student specific metrics helper
  const getStudentMetrics = (item: ClassItem) => {
    const textLower = (item.name + item.title).toLowerCase();

    // 1. CTDL
    if (textLower.includes('ctdl') || textLower.includes('thuật nâng cao')) {
      return {
grade: '8.8',
        gradeColor: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
        teacher: 'TS. Lê Hoàng Nam (Chủ nhiệm môn) • ThS. Trần Phương Thảo',
        progressPercent: 84,
        nodesUnlocked: '42/50',
        schedule: 'Thứ 5 (Tiết 4-6) • Phòng H6-302',

        alert: {
          type: 'danger',
          icon: 'alarm',
          text: 'Bài tập Lab 05 (Segment Tree) hết hạn lúc 23:59 hôm nay',
          action: 'Nộp ngay',
          actionClass: 'bg-rose-600 hover:bg-rose-700 text-white',
          containerClass: 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200',
        },
      };
    }

    // 2. THTT
    if (textLower.includes('thtt') || textLower.includes('thông minh')) {
      return {
        grade: '7.5',
        gradeColor: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300',
        teacher: 'PGS.TS. Vũ Đình Thành',
        progressPercent: 65,
        nodesUnlocked: '28/40',
        schedule: 'Thứ 3 (Tiết 1-3) • Phòng Online MS Teams',
        alert: {
          type: 'warning',
          icon: 'edit_note',
          text: 'Quiz 04 (Dijkstra & DSU) mở đến Chủ nhật tuần này',
          action: 'Làm Quiz',
          actionClass: 'bg-amber-600 hover:bg-amber-700 text-white',
          containerClass: 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200',
        },
      };
    }

    // 3. OOP
    if (textLower.includes('oop') || textLower.includes('đối tượng')) {
      return {
        grade: '9.2',
        gradeColor: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
        teacher: 'ThS. Hoàng Minh Tuấn',
        progressPercent: 92,
        nodesUnlocked: '36/40',
        schedule: 'Thứ 2 (Tiết 7-9) • Phòng Lab B2-104',
        alert: {
          type: 'success',
          icon: 'check_circle',
          text: 'Đã nộp toàn bộ bài tập tuần này • Điểm Lab gần nhất: Xuất sắc',
          action: '',
          actionClass: '',
          containerClass: 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200',
        },
      };
    }

    // 4. AI
    if (textLower.includes('ai') || textLower.includes('trí tuệ')) {
      return {
        grade: '8.0',
        gradeColor: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
        teacher: 'TS. Nguyễn Bảo Anh • Trợ giảng AI Socratic 24/7',
        progressPercent: 48,
        nodesUnlocked: '20/45',
        schedule: 'Thứ 7 (Tiết 4-6) • Hội trường C1',
        alert: {
          type: 'purple',
          icon: 'smart_toy',
          text: 'Socratic AI gợi ý: Ôn tập 5 câu hỏi Flashcard thuật toán A*',
          action: 'Ôn ngay',
          actionClass: 'bg-purple-600 hover:bg-purple-700 text-white',
          containerClass: 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900 text-purple-800 dark:text-purple-200',
        },
      };
    }

    // Default
    return {
      grade: '8.5',
      gradeColor: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
      teacher: item.instructor?.fullName || 'TS. Lê Hoàng Nam',
      progressPercent: 75,
      nodesUnlocked: '30/40',
      schedule: item.schedule?.dayOfWeek ? `${item.schedule.dayOfWeek} (${item.schedule.timeSlot || 'Tiết 1-3'})` : 'Thứ 4 (Tiết 1-3)',
      alert: {
        type: 'info',
        icon: 'info',
        text: 'Tuần học 09: Chuẩn bị nội dung tổng kết giữa kỳ',
        action: 'Xem ngay',
        actionClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        containerClass: 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200',
      },
    };
  };

  return (
    <div className="flex flex-col gap-6 pt-2" id="classes-list-container">
      {items.map((item) => {
        const tech = getTechDetails(item.major, item.title, item.name);
        const student = getStudentMetrics(item);
        const isCopied = copiedCode === (item.enrollmentKey || item.name);
        const isMenuOpen = activeMenuId === item.id;

        return (
          <article
            key={item.id}
            className="group bg-white dark:bg-slate-900 rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative"
          >
            {/* MAIN HORIZONTAL CONTENT ROW */}
            <div className="p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4.5">
              {/* LEFT BLOCK: THUMBNAIL & COURSE INFO */}
              <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                {/* Tech Thumbnail Graphic */}
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-tr ${tech.gradient} text-white relative overflow-hidden flex flex-col justify-between p-2.5 shrink-0 shadow-inner border border-white/10`}
                >
                  {tech.diagram}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <span className="material-symbols-outlined text-[18px]">
                      {tech.icon}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="relative z-10 text-[9px] font-mono font-bold tracking-wider uppercase text-slate-200 truncate">
                    {item.name}
                  </span>
                </div>

                {/* Course Details Block */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wide">
                      Học viên
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Đang diễn ra
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                      {tech.tag}
                    </span>
                  </div>

                  {/* Course Title Link */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    <Link
                      href={`/classes/${item.id}`}
                      prefetch={true}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                    >
                      {item.title || item.name}
                    </Link>
                  </h3>

                  {/* Meta Details: Code, Instructor & Schedule */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {/* Class Code & Copy */}
                    <button
                      type="button"
                      onClick={() => onCopyCode(item.enrollmentKey || item.name)}
                      className="inline-flex items-center gap-1.5 font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Sao chép mã lớp"
                    >
                      <span>{item.name}</span>
                      <span className="material-symbols-outlined text-[13px] text-blue-600 dark:text-blue-400">
                        {isCopied ? 'check' : 'content_copy'}
                      </span>
                    </button>

                    {/* Instructor */}
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[15px] text-slate-400 shrink-0">
                        person
                      </span>
                      <span className="truncate">{student.teacher}</span>
                    </span>

                    {/* Schedule & Room */}
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <span className="material-symbols-outlined text-[15px] text-blue-600 dark:text-blue-400 shrink-0">
                        schedule
                      </span>
                      <span>{student.schedule}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* MIDDLE BLOCK: ACADEMIC METRICS & KNOWLEDGE PROGRESS */}
              <div className="flex items-center justify-between sm:justify-start xl:justify-center gap-4 sm:gap-6 pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                {/* GPA / Process Grade Badge */}
                <div
                  className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl border ${student.gradeColor} min-w-[95px] text-center shadow-2xs`}
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
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-blue-600 dark:text-blue-400">
                        account_tree
                      </span>
                      <span>Tiến độ</span>
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {student.progressPercent}%
                    </span>
                  </div>

                  {/* Progress bar line */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${tech.progressGradient} transition-all duration-500`}
                      style={{ width: `${student.progressPercent}%` }}
                    />
                  </div>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block text-right font-medium">
                    {student.nodesUnlocked} Node tri thức
                  </span>
                </div>
              </div>

              {/* RIGHT BLOCK: ACTIONS & MENU */}
              <div className="flex items-center justify-end gap-2.5 pt-2 xl:pt-0 shrink-0 ml-4 sm:ml-6 lg:ml-8 xl:ml-10">
                <Link
                  href={`/classes/${item.id}`}
                  prefetch={true}
                  className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs hover:shadow transition-all"
                >
                  <span>Vào lớp học</span>
                  <span className="material-symbols-outlined text-[17px]">
                    arrow_forward
                  </span>
                </Link>

                {/* Dropdown Menu Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Tác vụ lớp học"
                    onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                    className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveMenuId(null)}
                      />
                      <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <Link
                          href={`/classes/${item.id}`}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-blue-600">
                            login
                          </span>
                          <span>Vào lớp học</span>
                        </Link>
                        <Link
                          href={`/classes/${item.id}?tab=assignments`}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            assignment
                          </span>
                          <span>Xem bài tập &amp; Lab</span>
                        </Link>
                        <Link
                          href={`/classes/${item.id}?tab=people`}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            group
                          </span>
                          <span>Danh sách bạn cùng lớp</span>
                        </Link>
                        <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onCopyCode(item.enrollmentKey || item.name);
                          }}
                          className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
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
              <div
                className={`px-4 sm:px-5 py-2.5 border-t flex flex-wrap items-center justify-between gap-2.5 text-xs font-medium ${student.alert.containerClass}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] shrink-0">
                    {student.alert.icon}
                  </span>
                  <span className="truncate">{student.alert.text}</span>
                </div>

                {student.alert.action && (
                  <Link
                    href={`/classes/${item.id}?tab=assignments`}
                    prefetch={true}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0 ${student.alert.actionClass}`}
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

