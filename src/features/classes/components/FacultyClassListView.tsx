'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ClassItem } from '../types';

interface FacultyClassListViewProps {
  items: ClassItem[];
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  onArchiveClick: (item: ClassItem) => void;
}

export function FacultyClassListView({
  items,
  copiedCode,
  onCopyCode,
  onArchiveClick,
}: FacultyClassListViewProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Dynamic Tech Gradient, Diagram & Accent Tag (synchronized with ClassCardItem)
  const getTechDetails = (major: string = '', title: string = '', name: string = '') => {
    const text = `${major} ${title} ${name}`.toLowerCase();

    // 1. AI & Machine Learning
    if (text.includes('trí tuệ') || text.includes('ai') || text.includes('mining') || text.includes('khai phá')) {
      return {
        type: 'ai',
        gradient: 'from-slate-950 via-purple-950 to-indigo-900',
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
        gradient: 'from-slate-950 via-cyan-950 to-blue-900',
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
        gradient: 'from-slate-950 via-indigo-950 to-indigo-800',
        tag: 'ALGORITHMS • TREE / GRAPH',
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
        gradient: 'from-slate-950 via-sky-950 to-blue-900',
        tag: 'ALGORITHMS • GRAPH THEORY',
        icon: 'schema',
        textColor: 'text-sky-200',
        progressGradient: 'from-blue-600 to-indigo-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
            <circle cx="60" cy="75" r="12" strokeWidth="1.5" />
            <circle cx="200" cy="35" r="10" strokeWidth="1.5" />
            <circle cx="200" cy="115" r="10" strokeWidth="1.5" />
            <circle cx="340" cy="75" r="12" strokeWidth="1.5" />
            <line strokeWidth="1.5" x1="72" x2="190" y1="75" y2="35" />
            <line strokeWidth="1.5" x1="72" x2="190" y1="75" y2="115" />
            <line strokeWidth="1.5" x1="210" x2="328" y1="35" y2="75" />
            <line strokeWidth="1.5" x1="210" x2="328" y1="115" y2="75" />
          </svg>
        ),
      };
    }

    // 5. Database (CSDL)
    if (text.includes('dữ liệu') || text.includes('csdl') || text.includes('database') || text.includes('sql')) {
      return {
        type: 'database',
        gradient: 'from-slate-950 via-blue-950 to-indigo-900',
        tag: 'DATABASE • SQL / NOSQL ARCHITECTURE',
        icon: 'database',
        textColor: 'text-blue-200',
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

    // Default Fallback
    return {
      type: 'core',
      gradient: 'from-slate-950 via-indigo-950 to-blue-900',
      tag: 'COMPUTER SCIENCE • CORE',
      icon: 'hub',
      textColor: 'text-indigo-200',
      progressGradient: 'from-blue-600 to-indigo-600',
      diagram: (
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
          <circle cx="100" cy="75" r="25" strokeDasharray="2 2" strokeWidth="1.5" />
          <circle cx="200" cy="75" r="32" strokeWidth="1.5" />
          <circle cx="300" cy="75" r="25" strokeDasharray="2 2" strokeWidth="1.5" />
          <line strokeWidth="1.5" x1="125" x2="168" y1="75" y2="75" />
          <line strokeWidth="1.5" x1="232" x2="275" y1="75" y2="75" />
        </svg>
      ),
    };
  };

  // Faculty specific metrics helper
  const getFacultyMetrics = (item: ClassItem) => {
    const textLower = (item.name + item.title).toLowerCase();

    // 1. CSDL
    if (textLower.includes('csdl') || textLower.includes('dữ liệu')) {
      return {
        ploPassRate: 88.5,
        attendanceRate: 94,
        teachingProgress: 75,
        curriculumWeek: 'Tuần 11/15',
        instructorInfo: 'TS. Lê Hoàng Nam • 2 GV',
        capacityText: `${item.enrolledCount ?? 0}/60 học viên`,
        alert: {
          type: 'warning',
          icon: 'pending_actions',
          text: '3 yêu cầu tham gia lớp đang chờ giảng viên duyệt',
          action: 'Duyệt ngay',
          actionHref: `/classes/${item.id}?tab=people`,
          actionClass: 'bg-amber-600 hover:bg-amber-700 text-white',
          containerClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300',
        },
      };
    }

    // 2. CTDL / Thuật toán
    if (textLower.includes('ctdl') || textLower.includes('thuật')) {
      return {
        ploPassRate: 91.2,
        attendanceRate: 96,
        teachingProgress: 65,
        curriculumWeek: 'Tuần 9/15',
        instructorInfo: 'TS. Lê Hoàng Nam • 2 GV',
        capacityText: `${item.enrolledCount ?? 0}/60 học viên`,
        alert: {
          type: 'info',
          icon: 'assignment_turned_in',
          text: '5 bài thực hành Lab 04 (Dijkstra) mới nộp cần chấm điểm',
          action: 'Chấm bài',
          actionHref: `/classes/${item.id}?tab=assignments`,
          actionClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          containerClass: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/60 text-blue-800 dark:text-blue-300',
        },
      };
    }

    // 3. OOP
    if (textLower.includes('oop') || textLower.includes('đối tượng')) {
      return {
        ploPassRate: 94.0,
        attendanceRate: 100,
        teachingProgress: 80,
        curriculumWeek: 'Tuần 12/15',
        instructorInfo: 'ThS. Hoàng Minh Tuấn • 1 GV',
        capacityText: `${item.enrolledCount ?? 0}/60 học viên`,
        alert: {
          type: 'success',
          icon: 'check_circle',
          text: '100% sinh viên đã nộp bài tập tuần 12 • Tiến độ đề cương xuất sắc',
          action: 'Xem báo cáo',
          actionHref: `/classes/${item.id}?tab=stream`,
          actionClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          containerClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300',
        },
      };
    }

    // Default / Newly Created Class (e.g. d1)
    const enrolled = item.enrolledCount ?? 0;
    const maxStudents = item.maxStudents || 60;
    return {
      ploPassRate: 88.0,
      attendanceRate: 96,
      teachingProgress: 60,
      curriculumWeek: 'Tuần 8/15',
      instructorInfo: item.instructor?.fullName || 'TS. Lê Hoàng Nam (Chủ nhiệm)',
      capacityText: `${enrolled}/${maxStudents} học viên`,
      alert: {
        type: 'info',
        icon: 'campaign',
        text: 'Lớp học hoạt động tốt • Đã đồng bộ không gian bài giảng & môn học liên kết',
        action: 'Vào quản lý',
        actionHref: `/classes/${item.id}`,
        actionClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        containerClass: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/60 text-blue-800 dark:text-blue-300',
      },
    };
  };

  const getFacultySchedule = (item: ClassItem) => {
    if (item.schedule?.dayOfWeek && item.schedule.dayOfWeek !== 'Chưa xếp lịch') {
      return `${item.schedule.dayOfWeek} (${item.schedule.timeSlot || 'Tiết 1-3'})`;
    }
    const nameLower = (item.name + item.title).toLowerCase();
    if (nameLower.includes('csdl') || nameLower.includes('dữ liệu')) return 'Thứ 3 (Tiết 1-3)';
    if (nameLower.includes('ctdl') || nameLower.includes('thuật')) return 'Thứ 5 (Tiết 4-6)';
    if (nameLower.includes('oop') || nameLower.includes('đối tượng')) return 'Thứ 2 (Tiết 7-9)';
    if (nameLower.includes('mmt') || nameLower.includes('mạng')) return 'Thứ 6 (Tiết 1-3)';
    if (nameLower.includes('ktlt') || nameLower.includes('kỹ thuật')) return 'Thứ 4 (Tiết 1-3)';
    if (nameLower.includes('ai') || nameLower.includes('trí tuệ')) return 'Thứ 7 (Tiết 4-6)';
    return 'Lịch học linh hoạt';
  };

  return (
    <div className="flex flex-col gap-6 pt-2" id="faculty-classes-list-container">
      {items.map((item) => {
        const tech = getTechDetails(item.major, item.title, item.name);
        const faculty = getFacultyMetrics(item);
        const isCopied = copiedCode === (item.enrollmentKey || item.name);
        const isMenuOpen = activeMenuId === item.id;
        const isOwner = item.teachingRole === 'PRIMARY_INSTRUCTOR' || !item.teachingRole;

        return (
          <article
            key={item.id}
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative"
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
                      {isOwner ? 'Chủ lớp' : 'Giảng viên'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Hoạt động
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                      {tech.tag}
                    </span>
                  </div>

                  {/* Title & Code */}
                  <div>
                    <Link
                      href={`/classes/${item.id}`}
                      className="font-display font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-base sm:text-lg transition-colors block truncate"
                    >
                      {item.title || item.name}
                    </Link>

                    {/* Metadata Sub-row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {/* Code button */}
                      <button
                        type="button"
                        onClick={() => onCopyCode(item.enrollmentKey || item.name)}
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                        title="Sao chép mã lớp"
                      >
                        <span>{item.name}</span>
                        <span className="material-symbols-outlined text-[13px]">
                          {isCopied ? 'check' : 'content_copy'}
                        </span>
                      </button>

                      {/* Instructor Info */}
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="material-symbols-outlined text-[15px] text-slate-400 shrink-0">
                          co_present
                        </span>
                        <span className="truncate">
                          <strong>Phụ trách:</strong> {faculty.instructorInfo}
                        </span>
                      </div>

                      {/* Schedule */}
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
                        <span className="material-symbols-outlined text-[15px] text-slate-400 shrink-0">
                          calendar_today
                        </span>
                        <span>{getFacultySchedule(item)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER-RIGHT BLOCK: FACULTY METRICS (PLO & CURRICULUM PROGRESS) */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0 pt-2 xl:pt-0">
                {/* PLO Pass Rate Badge */}
                <div
                  className="flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 min-w-[95px] text-center shadow-2xs"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Chuẩn PLO
                  </span>
                  <span className="font-mono text-base sm:text-lg font-black tracking-tight">
                    {faculty.ploPassRate}%
                  </span>
                </div>

                {/* Curriculum Week & Progress Bar */}
                <div className="w-36 sm:w-44 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-blue-600 dark:text-blue-400">
                        auto_stories
                      </span>
                      <span>Đề cương</span>
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {faculty.curriculumWeek}
                    </span>
                  </div>

                  {/* Progress bar line */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${tech.progressGradient} transition-all duration-500`}
                      style={{ width: `${faculty.teachingProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>Sĩ số: {faculty.capacityText}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {faculty.attendanceRate}% CC
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT BLOCK: ACTIONS & MENU */}
              <div className="flex items-center justify-end gap-2.5 pt-2 xl:pt-0 shrink-0 ml-4 sm:ml-6 lg:ml-8 xl:ml-10">
                <Link
                  href={`/classes/${item.id}`}
                  className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <span>Vào không gian lớp</span>
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
                      <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <Link
                          href={`/classes/${item.id}`}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-blue-600">
                            login
                          </span>
                          <span>Vào không gian lớp</span>
                        </Link>
                        <Link
                          href={`/classes/${item.id}?tab=members`}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            group
                          </span>
                          <span>Danh sách học viên ({item.enrolledCount ?? 0})</span>
                        </Link>
                        <Link
                          href={`/classes/${item.id}?tab=assignments`}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            assignment
                          </span>
                          <span>Quản lý bài tập &amp; Chấm điểm</span>
                        </Link>
                        <Link
                          href={`/classes/${item.id}?tab=settings`}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            settings
                          </span>
                          <span>Cấu hình lớp học</span>
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
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onArchiveClick(item);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              archive
                            </span>
                            <span>Lưu trữ lớp học</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTOM URGENT ALERT STRIP */}
            {faculty.alert && (
              <div
                className={`px-4 sm:px-5 py-2.5 border-t flex flex-wrap items-center justify-between gap-2.5 text-xs font-medium ${faculty.alert.containerClass}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] shrink-0">
                    {faculty.alert.icon}
                  </span>
                  <span className="truncate">{faculty.alert.text}</span>
                </div>
                {faculty.alert.action && (
                  <Link
                    href={faculty.alert.actionHref}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-all shadow-2xs ${faculty.alert.actionClass}`}
                  >
                    {faculty.alert.action}
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

