'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ClassItem, WorkspaceRoleMode } from '../types';

interface ClassCardItemProps {
  item: ClassItem;
  workspaceMode?: WorkspaceRoleMode;
  onArchiveClick: (item: ClassItem) => void;
  onRestoreClick?: (item: ClassItem) => void;
  isCopied: boolean;
  onCopyCode: (code: string) => void;
}

export function ClassCardItem({
  item,
  workspaceMode = 'faculty',
  onArchiveClick,
  onRestoreClick,
  isCopied,
  onCopyCode,
}: ClassCardItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dynamic Tech Gradient, Diagram & Accent Tag
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
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
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
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
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
        tag: workspaceMode === 'student' ? 'ADVANCED DSA • TREE & GRAPH' : 'ALGORITHMS • TREE / GRAPH',
        icon: 'account_tree',
        textColor: 'text-indigo-200',
        progressGradient: 'from-indigo-500 to-purple-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
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
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
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
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
            <rect height="70" rx="6" strokeWidth="1.5" width="80" x="50" y="30" />
            <rect height="70" rx="6" strokeWidth="1.5" width="80" x="220" y="30" />
            <path d="M130,65 L220,65" strokeDasharray="3 3" strokeWidth="2" />
            <polygon fill="currentColor" points="215,60 225,65 215,70" />
          </svg>
        ),
      };
    }

    // 6. Networking (MMT)
    if (text.includes('mạng') || text.includes('mmt') || text.includes('networking') || text.includes('tcp')) {
      return {
        type: 'networking',
        gradient: 'from-slate-900 via-teal-950 to-teal-700',
        tag: 'NETWORKING • TCP / IP',
        icon: 'router',
        textColor: 'text-teal-200',
        progressGradient: 'from-teal-500 to-emerald-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
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

    // 7. Database (CSDL)
    if (text.includes('dữ liệu') || text.includes('csdl') || text.includes('database') || text.includes('sql')) {
      return {
        type: 'database',
        gradient: 'from-slate-900 via-blue-950 to-blue-800',
        tag: 'DATABASE • SQL / NOSQL',
        icon: 'database',
        textColor: 'text-blue-200',
        progressGradient: 'from-blue-600 to-indigo-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
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

    // Default
    return {
      type: 'default',
      gradient: 'from-slate-900 via-slate-800 to-indigo-800',
      tag: 'COMPUTER SCIENCE • CORE',
      icon: 'terminal',
      textColor: 'text-slate-200',
      progressGradient: 'from-blue-600 to-indigo-600',
      diagram: (
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
          <circle cx="200" cy="75" r="40" strokeDasharray="3 3" strokeWidth="1.5" />
        </svg>
      ),
    };
  };

  const tech = getTechDetails(item.major, item.title, item.name);
  const isArchived = item.status === 'ARCHIVED' || Boolean(item.deletedAt);
  const isOwner =
    item.teachingRole === 'PRIMARY_INSTRUCTOR' ||
    (!item.teachingRole && (item.name.includes('CSDL') || item.name.includes('OOP')));

  // Student mode specific metrics
  const getStudentMetrics = () => {
    const textLower = (item.name + item.title).toLowerCase();

    // 1. CTDL
    if (textLower.includes('ctdl') || textLower.includes('thuật nâng cao')) {
      return {
        grade: '8.8',
        gradeColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
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
          containerClass: 'bg-rose-50 border-rose-200/60 text-rose-700',
        },
      };
    }

    // 2. THTT (Thiết kế thuật toán)
    if (textLower.includes('thtt') || textLower.includes('thông minh')) {
      return {
        grade: '7.5',
        gradeColor: 'bg-amber-50 border-amber-200 text-amber-800',
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
          containerClass: 'bg-amber-50 border-amber-200/60 text-amber-800',
        },
      };
    }

    // 3. OOP
    if (textLower.includes('oop') || textLower.includes('đối tượng')) {
      return {
        grade: '9.2',
        gradeColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
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
          containerClass: 'bg-emerald-50 border-emerald-200/60 text-emerald-800',
        },
      };
    }

    // 4. AI
    if (textLower.includes('ai') || textLower.includes('trí tuệ')) {
      return {
        grade: '8.0',
        gradeColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
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
          containerClass: 'bg-purple-50 border-purple-200/60 text-purple-800',
        },
      };
    }

    // Default student metrics
    return {
      grade: '8.5',
      gradeColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      teacher: item.instructor?.fullName || 'TS. Lê Hoàng Nam',
      progressPercent: 75,
      nodesUnlocked: '30/40',
      schedule: item.schedule?.dayOfWeek ? `${item.schedule.dayOfWeek} (${item.schedule.timeSlot})` : 'Thứ 4 (Tiết 1-3)',
      alert: {
        type: 'info',
        icon: 'info',
        text: 'Học liệu tuần mới đã được tải lên không gian học tập',
        action: 'Xem ngay',
        actionClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        containerClass: 'bg-blue-50 border-blue-200/60 text-blue-800',
      },
    };
  };

  const studentData = getStudentMetrics();

  // Schedule display for Faculty mode
  const getFacultySchedule = () => {
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

  // Status / Alert Strip for Faculty mode
  const renderFacultyStatusStrip = () => {
    const textLower = (item.name + item.title).toLowerCase();

    // 1. CSDL: 3 yêu cầu tham gia đang chờ duyệt
    if (textLower.includes('csdl') || textLower.includes('dữ liệu')) {
      return (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="font-semibold truncate">3 yêu cầu tham gia đang chờ duyệt</span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-amber-600 dark:text-amber-400 shrink-0">arrow_forward</span>
        </div>
      );
    }

    // 2. CTDL: Hoạt động gần nhất 2 giờ trước • Tuần 8
    if (textLower.includes('ctdl') || textLower.includes('thuật')) {
      return (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 truncate">
            <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0">history</span>
            <span className="truncate">Hoạt động gần nhất 2 giờ trước</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Tuần 8</span>
        </div>
      );
    }

    // 3. OOP: 1 yêu cầu tham gia đang chờ duyệt
    if (textLower.includes('oop') || textLower.includes('đối tượng')) {
      return (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="font-semibold truncate">1 yêu cầu tham gia đang chờ duyệt</span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-amber-600 dark:text-amber-400 shrink-0">arrow_forward</span>
        </div>
      );
    }

    // 4. MMT: Bài thực hành Lab 3 sắp đến hạn vào ngày mai • 23:59
    if (textLower.includes('mmt') || textLower.includes('mạng')) {
      return (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="material-symbols-outlined text-[16px] text-rose-600 shrink-0">alarm</span>
            <span className="font-semibold truncate">Bài thực hành Lab 3 sắp đến hạn vào ngày mai</span>
          </div>
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 shrink-0">23:59</span>
        </div>
      );
    }

    // 5. KTLT: Hoạt động gần nhất hôm nay • 98% nộp bài
    if (textLower.includes('ktlt') || textLower.includes('kỹ thuật') || textLower.includes('c++')) {
      return (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 truncate">
            <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0">update</span>
            <span className="truncate">Hoạt động gần nhất hôm nay</span>
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 shrink-0">98% nộp bài</span>
        </div>
      );
    }

    // 6. AI: Hoạt động gần nhất hôm qua • Tích hợp AI Tutor
    if (textLower.includes('ai') || textLower.includes('trí tuệ')) {
      return (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 truncate">
            <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0">schedule</span>
            <span className="truncate">Hoạt động gần nhất hôm qua</span>
          </span>
          <span className="text-[11px] font-semibold text-blue-600 shrink-0">Tích hợp AI Tutor</span>
        </div>
      );
    }

    // Default faculty strip
    return (
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-between">
        <span className="flex items-center gap-2 truncate">
          <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0">schedule</span>
          <span className="truncate">Hoạt động gần nhất hôm nay</span>
        </span>
        <span className="text-[11px] font-semibold text-emerald-600 shrink-0">100% tiến độ</span>
      </div>
    );
  };

  return (
    <article className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between relative shadow-2xs">
      {/* 1. GRAPHIC HEADER BANNER */}
      <div className={`h-36 w-full relative p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-tr ${tech.gradient} text-white select-none rounded-t-2xl`}>
        {/* Dynamic Vector Topology Overlay */}
        {tech.diagram}

        {/* Top Badges & Actions inside banner */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            {/* Role Badge */}
            <span
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase shadow-2xs backdrop-blur-md ${
                workspaceMode === 'student'
                  ? 'bg-blue-600/90 text-white'
                  : isOwner
                  ? 'bg-blue-600/90 text-white'
                  : 'bg-indigo-600/90 text-white'
              }`}
            >
              {workspaceMode === 'student' ? 'Học viên' : isOwner ? 'Chủ lớp' : 'Giảng viên'}
            </span>

            {/* Status Indicator */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/60 backdrop-blur-md text-slate-100 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {workspaceMode === 'student' ? 'Đang diễn ra' : isArchived ? 'Đã lưu trữ' : 'Hoạt động'}
              </span>
            </span>
          </div>

          {/* More Actions Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              aria-label="Tác vụ"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-lg bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 z-50">
                  <Link
                    href={`/classes/${item.id}`}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[16px] text-blue-600">login</span>
                    <span>Vào lớp học</span>
                  </Link>

                  <Link
                    href={`/classes/${item.id}?tab=members`}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-400">group</span>
                    <span>Xem thành viên ({item.enrolledCount || 42})</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onCopyCode(item.enrollmentKey || item.name);
                    }}
                    className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-400">content_copy</span>
                    <span>Sao chép mã lớp</span>
                  </button>

                  {isOwner && (
                    <Link
                      href={`/classes/${item.id}?tab=settings`}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[16px] text-slate-400">settings</span>
                      <span>Cấu hình lớp</span>
                    </Link>
                  )}

                  {isOwner && (
                    <>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onArchiveClick(item);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">archive</span>
                        <span>Lưu trữ lớp học</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Banner Footer Info */}
        <div className="flex items-center justify-between relative z-10 text-slate-200">
          <span className={`font-mono text-[11px] tracking-wider font-semibold ${tech.textColor} truncate max-w-[80%]`}>
            {tech.tag}
          </span>
          <span className="material-symbols-outlined text-[26px] opacity-80 shrink-0">
            {tech.icon}
          </span>
        </div>
      </div>

      {/* 2. CARD CONTENT BODY */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          {/* Class Title & Code */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <Link href={`/classes/${item.id}`} className="flex-1">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer">
                  {item.title || item.name}
                </h3>
              </Link>

              {/* Student Grade Badge */}
              {workspaceMode === 'student' && (
                <div className={`flex items-center gap-1 shrink-0 px-2.5 py-0.5 rounded border text-[11px] font-semibold ${studentData.gradeColor}`}>
                  <span className="text-[10px] font-medium opacity-70">Điểm QT:</span>
                  <strong className="font-display font-extrabold">{studentData.grade}</strong>
                  <span className="text-[10px] opacity-60">/10</span>
                </div>
              )}
            </div>

            {/* Class Code with Copy Action */}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {item.name}
              </span>
              <button
                type="button"
                onClick={() => onCopyCode(item.enrollmentKey || item.name)}
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Sao chép mã lớp"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isCopied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          </div>

          {/* Meta specs: Student Mode vs Faculty Mode */}
          {workspaceMode === 'student' ? (
            <>
              {/* Teacher Info */}
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">person</span>
                <span className="truncate">
                  <strong>Giảng viên:</strong> {studentData.teacher}
                </span>
              </div>

              {/* Knowledge Graph Progress Bar */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Tiến độ học tập: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{studentData.progressPercent}% hoàn thành</strong>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Đã mở <strong className="text-blue-600 dark:text-blue-400 font-semibold">{studentData.nodesUnlocked}</strong> Node tri thức
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${studentData.progressPercent}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Faculty Students & Teachers count */}
              <div className="flex items-center gap-5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">group</span>
                  <span><strong className="text-slate-800 dark:text-slate-200 font-bold">{item.enrolledCount || 42}</strong> học viên</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                  <span><strong className="text-slate-800 dark:text-slate-200 font-bold">{item.name.includes('OOP') ? 1 : 2}</strong> giảng viên</span>
                </span>
              </div>

              {/* Status / Alert Strip for Faculty Mode */}
              {renderFacultyStatusStrip()}
            </>
          )}
        </div>

        {/* Student Alert Strip with contextual Action Button */}
        {workspaceMode === 'student' && (
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${studentData.alert.containerClass}`}>
            <div className="flex items-center gap-2 truncate">
              <span className="material-symbols-outlined text-[17px] shrink-0">
                {studentData.alert.icon}
              </span>
              <span className="font-semibold truncate">
                {studentData.alert.text}
              </span>
            </div>
            {studentData.alert.action ? (
              <Link
                href={`/classes/${item.id}`}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${studentData.alert.actionClass}`}
              >
                {studentData.alert.action}
              </Link>
            ) : (
              studentData.alert.type === 'success' && (
                <span className="text-[11px] font-bold text-emerald-600 shrink-0">
                  Xuất sắc
                </span>
              )
            )}
          </div>
        )}

        {/* 3. CARD BOTTOM BAR: Schedule & Action Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[60%]">
            <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">calendar_today</span>
            <span className="truncate">
              {workspaceMode === 'student' ? studentData.schedule : getFacultySchedule()}
            </span>
          </span>

          <Link
            href={`/classes/${item.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-2xs shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
          >
            <span>{workspaceMode === 'student' ? 'Vào lớp học ngay' : 'Vào không gian lớp'}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
