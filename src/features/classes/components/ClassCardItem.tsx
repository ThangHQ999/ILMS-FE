'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ClassItem, ClassViewMode, WorkspaceRoleMode } from '../types';

export interface ClassCardItemProps {
  item: ClassItem;
  workspaceMode?: WorkspaceRoleMode;
  viewMode?: ClassViewMode;
  onArchiveClick: (item: ClassItem) => void;
  onRestoreClick?: (item: ClassItem) => void;
  onLeaveClick?: (item: ClassItem) => void;
  isCopied: boolean;
  onCopyCode: (code: string) => void;
}

export const ClassCardItem = React.memo(function ClassCardItem({
  item,
  workspaceMode = 'faculty',
  viewMode = 'grid',
  onArchiveClick,
  onRestoreClick,
  onLeaveClick,
  isCopied,
  onCopyCode,
}: ClassCardItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isPendingMember = item.memberStatus === 'PENDING';

  // Dynamic Tech Gradient, Diagram & Accent Tag (with smart fallback hashing for short/custom names like 'd1')
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
        tag: workspaceMode === 'student' ? 'ADVANCED DSA • TREE & GRAPH' : 'ALGORITHMS • TREE / GRAPH',
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
        gradient: 'from-slate-950 via-sky-950 to-blue-800',
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

    // 6. Networking (MMT)
    if (text.includes('mạng') || text.includes('mmt') || text.includes('networking') || text.includes('tcp')) {
      return {
        type: 'networking',
        gradient: 'from-slate-950 via-teal-950 to-teal-800',
        tag: 'NETWORKING • TCP / IP',
        icon: 'router',
        textColor: 'text-teal-200',
        progressGradient: 'from-teal-500 to-emerald-600',
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

    // 7. Database (CSDL)
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

    // 8. Smart Hash-Based Fallback for Custom/Short names (such as "d1")
    // Ensures freshly created classes have high-tech vibrancy and modern topology visuals
    const seed = (name || title || 'default')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const fallbackVariants = [
      {
        type: 'cloud',
        gradient: 'from-slate-950 via-sky-950 to-blue-900',
        tag: 'CLOUD NATIVE & CYBER ARCHITECTURE',
        icon: 'cloud_sync',
        textColor: 'text-sky-200',
        progressGradient: 'from-sky-500 to-blue-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
            <circle cx="100" cy="75" r="25" strokeDasharray="3 3" strokeWidth="1.5" />
            <circle cx="200" cy="55" r="32" strokeWidth="2" />
            <circle cx="300" cy="85" r="22" strokeWidth="1.5" />
            <line strokeWidth="1.5" x1="125" x2="168" y1="75" y2="55" />
            <line strokeWidth="1.5" x1="232" x2="278" y1="55" y2="85" />
          </svg>
        ),
      },
      {
        type: 'software',
        gradient: 'from-slate-950 via-teal-950 to-emerald-900',
        tag: 'SOFTWARE ENGINEERING & ARCHITECTURE',
        icon: 'developer_board',
        textColor: 'text-teal-200',
        progressGradient: 'from-teal-500 to-emerald-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
            <path d="M40,75 L120,35 L200,105 L280,45 L360,75" strokeWidth="2" />
            <circle cx="120" cy="35" fill="currentColor" r="4" />
            <circle cx="200" cy="105" fill="currentColor" r="5" />
            <circle cx="280" cy="45" fill="currentColor" r="4" />
          </svg>
        ),
      },
      {
        type: 'ai-core',
        gradient: 'from-slate-950 via-purple-950 to-indigo-900',
        tag: 'INTELLIGENT SYSTEMS & DATA MODELING',
        icon: 'psychology',
        textColor: 'text-purple-200',
        progressGradient: 'from-purple-500 to-indigo-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
            <circle cx="80" cy="75" r="22" strokeDasharray="3 3" strokeWidth="1.5" />
            <circle cx="200" cy="45" r="28" strokeWidth="2" />
            <circle cx="320" cy="75" r="22" strokeDasharray="3 3" strokeWidth="1.5" />
            <line strokeWidth="1.5" x1="102" x2="172" y1="75" y2="45" />
            <line strokeWidth="1.5" x1="228" x2="298" y1="45" y2="75" />
          </svg>
        ),
      },
      {
        type: 'distributed',
        gradient: 'from-slate-950 via-indigo-950 to-blue-900',
        tag: 'DISTRIBUTED SYSTEMS & KNOWLEDGE GRAPH',
        icon: 'hub',
        textColor: 'text-indigo-200',
        progressGradient: 'from-blue-600 to-indigo-600',
        diagram: (
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 400 150">
            <rect height="50" rx="8" strokeWidth="1.5" width="70" x="50" y="50" />
            <rect height="50" rx="8" strokeWidth="1.5" width="70" x="165" y="50" />
            <rect height="50" rx="8" strokeWidth="1.5" width="70" x="280" y="50" />
            <line strokeWidth="2" x1="120" x2="165" y1="75" y2="75" />
            <line strokeWidth="2" x1="235" x2="280" y1="75" y2="75" />
          </svg>
        ),
      },
    ];

    return fallbackVariants[seed % fallbackVariants.length];
  };

  const tech = getTechDetails(item.major, item.title, item.name);
  const isArchived = item.status === 'ARCHIVED' || Boolean(item.deletedAt);
  const isOwner =
    item.teachingRole === 'PRIMARY_INSTRUCTOR' ||
    (!item.teachingRole && (item.name.includes('CSDL') || item.name.includes('OOP')));

  // Student mode specific metrics from real class item data
  const getStudentMetrics = () => {
    const rawStats = item.stats as Record<string, unknown> | undefined;
    const rawGrade =
      (item as { studentGrade?: number | string; grade?: number | string }).studentGrade ??
      (item as { grade?: number | string }).grade ??
      rawStats?.grade;

    const hasRealGrade = rawGrade !== undefined && rawGrade !== null && rawGrade !== '';
    const numericGrade = hasRealGrade ? Number(rawGrade) : null;
    const gradeDisplay =
      hasRealGrade && !isNaN(numericGrade!)
        ? numericGrade!.toFixed(1)
        : typeof rawGrade === 'string' && rawGrade.trim()
        ? rawGrade.trim()
        : null;

    const gradeColor = gradeDisplay
      ? Number(gradeDisplay) >= 8.5
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
        : Number(gradeDisplay) >= 7.0
        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300'
        : Number(gradeDisplay) >= 5.0
        ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
        : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/60 dark:border-rose-900/60 dark:text-rose-300'
      : '';

    const teacherName = item.instructor?.fullName || 'Chưa phân công';
    const scheduleText =
      item.schedule?.dayOfWeek && item.schedule?.dayOfWeek !== 'Chưa xếp lịch'
        ? `${item.schedule.dayOfWeek} (${item.schedule.timeSlot || 'Linh hoạt'}) • ${item.schedule.room || 'Phòng học'}`
        : 'Chưa xếp lịch học';

    const upcomingAssignments = item.stats?.ungradedAssignmentsCount ?? 0;

    return {
      grade: gradeDisplay,
      gradeColor,
      teacher: teacherName,
      progressPercent: item.stats?.attendanceRate ?? 0,
      nodesUnlocked: null,
      schedule: scheduleText,
      alert:
        upcomingAssignments > 0
          ? {
              type: 'danger',
              icon: 'alarm',
              text: `${upcomingAssignments} bài tập cần hoàn thành`,
              action: 'Nộp bài',
              actionHref: `/classes/${item.id}?tab=assignments`,
              actionClass: 'bg-rose-600 hover:bg-rose-700 text-white',
              containerClass:
                'bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/60 text-rose-700 dark:text-rose-300',
            }
          : null,
    };
  };

  // Faculty mode specific metrics from real class item data
  const getFacultyMetrics = () => {
    const rawStats = item.stats as Record<string, unknown> | undefined;
    const rawPlo = rawStats?.ploPassRate ?? (item as { ploPassRate?: number }).ploPassRate;
    const ploPassRate = typeof rawPlo === 'number' && !isNaN(rawPlo) ? rawPlo : null;

    const enrolled = item.enrolledCount ?? 0;
    const maxStudents = item.maxStudents || 60;
    const pendingRequests = item.stats?.pendingRequestsCount ?? 0;
    const ungradedAssignments = item.stats?.ungradedAssignmentsCount ?? 0;
    const teacherName = item.instructor?.fullName || 'Giảng viên';

    return {
      ploPassRate,
      attendanceRate: item.stats?.attendanceRate ?? 100,
      teachingProgress: Math.min(100, Math.round((enrolled / maxStudents) * 100)),
      curriculumWeek: item.semester || 'Học kỳ hiện tại',
      completedLessons: null,
      instructorInfo: teacherName,
      capacityText: `${enrolled}/${maxStudents} học viên`,
      capacityPercent: Math.round((enrolled / maxStudents) * 100),
      alert:
        pendingRequests > 0
          ? {
              type: 'warning',
              icon: 'pending_actions',
              text: `${pendingRequests} yêu cầu tham gia lớp đang chờ giảng viên duyệt`,
              action: 'Duyệt ngay',
              actionHref: `/classes/${item.id}?tab=people`,
              actionClass: 'bg-amber-600 hover:bg-amber-700 text-white',
              containerClass:
                'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300',
            }
          : ungradedAssignments > 0
          ? {
              type: 'info',
              icon: 'assignment_turned_in',
              text: `${ungradedAssignments} bài nộp cần chấm điểm`,
              action: 'Chấm bài',
              actionHref: `/classes/${item.id}?tab=assignments`,
              actionClass: 'bg-blue-600 hover:bg-blue-700 text-white',
              containerClass:
                'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/60 text-blue-800 dark:text-blue-300',
            }
          : null,
    };
  };

  const studentData = getStudentMetrics();
  const facultyData = getFacultyMetrics();

  // Schedule display for Faculty mode
  const getFacultySchedule = () => {
    if (item.schedule?.dayOfWeek && item.schedule.dayOfWeek !== 'Chưa xếp lịch') {
      return `${item.schedule.dayOfWeek} (${item.schedule.timeSlot || 'Tiết 1-3'})`;
    }
    return 'Lịch học linh hoạt';
  };

  return (
    <article className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between relative shadow-2xs">
      {/* 1. GRAPHIC HEADER BANNER */}
      <div className={`h-36 w-full relative overflow-hidden p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-tr ${tech.gradient} text-white select-none rounded-t-2xl`}>
        {(item.backgroundUrl || item.thumbnailUrl) ? (
          <>
            <img
              src={item.backgroundUrl || item.thumbnailUrl}
              alt={item.title || item.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/40 pointer-events-none" />
          </>
        ) : (
          tech.diagram
        )}

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

                  {!isPendingMember && (
                    <Link
                      href={`/classes/${item.id}?tab=members`}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[16px] text-slate-400">group</span>
                      <span>Xem thành viên ({item.enrolledCount ?? 0})</span>
                    </Link>
                  )}

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

                  {!isOwner && !isPendingMember && onLeaveClick && (
                    <>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onLeaveClick(item);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>Rời khỏi lớp học</span>
                      </button>
                    </>
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
          {/* Class Title & Dynamic Badge (Grade for Student vs PLO for Faculty) */}
          <div>
            <div className="flex items-start justify-between gap-3">
              {isPendingMember ? (
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                    {item.title || item.name}
                  </h3>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Chờ duyệt
                  </span>
                </div>
              ) : (
                <Link href={`/classes/${item.id}`} className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer">
                    {item.title || item.name}
                  </h3>
                </Link>
              )}

              {/* Student Mode: Grade Badge - ONLY when real grade exists */}
              {workspaceMode === 'student' && studentData.grade && (
                <div className={`flex items-center gap-1 shrink-0 px-2.5 py-0.5 rounded border text-[11px] font-semibold ${studentData.gradeColor}`}>
                  <span className="text-[10px] font-medium opacity-70">Điểm QT:</span>
                  <strong className="font-display font-extrabold">{studentData.grade}</strong>
                  <span className="text-[10px] opacity-60">/10</span>
                </div>
              )}

              {/* Faculty Mode: PLO Pass Rate Badge - ONLY when real PLO rate exists */}
              {workspaceMode === 'faculty' && facultyData.ploPassRate !== null && (
                <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold shadow-2xs">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span className="text-[10px] font-medium opacity-80">Đạt chuẩn PLO:</span>
                  <strong className="font-display font-extrabold">{facultyData.ploPassRate}%</strong>
                </div>
              )}
            </div>

            {/* Class Code with Copy Action */}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {item.classCode || item.enrollmentKey || item.name}
              </span>
              <button
                type="button"
                onClick={() => onCopyCode(item.classCode || item.enrollmentKey || item.name)}
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
              {/* Faculty Instructor & Capacity & Attendance stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[17px] text-slate-400 shrink-0">co_present</span>
                    <span className="truncate">
                      <strong>Phụ trách:</strong> {facultyData.instructorInfo}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="material-symbols-outlined text-[15px]">done_all</span>
                    <span>Chuyên cần: {facultyData.attendanceRate}%</span>
                  </div>
                </div>

                {/* Curriculum Progress Bar (Mirroring student node progress for faculty) */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Tiến độ đề cương: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{facultyData.curriculumWeek} ({facultyData.teachingProgress}%)</strong>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Sĩ số: <strong className="text-blue-600 dark:text-blue-400 font-semibold">{facultyData.capacityText}</strong>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${tech.progressGradient || 'from-blue-600 to-indigo-600'}`}
                      style={{ width: `${facultyData.teachingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Strip with contextual Action Button (Both Student & Faculty Mode) */}
        {workspaceMode === 'student' ? (
          studentData.alert ? (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${studentData.alert.containerClass}`}
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <span className="material-symbols-outlined text-[17px] shrink-0">
                  {studentData.alert.icon}
                </span>
                <span className="font-semibold truncate">{studentData.alert.text}</span>
              </div>
              {studentData.alert.action ? (
                <Link
                  href={studentData.alert.actionHref || `/classes/${item.id}`}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors shadow-2xs ${studentData.alert.actionClass}`}
                >
                  {studentData.alert.action}
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400">
              {isPendingMember ? (
                <>
                  <div className="flex items-center gap-2 truncate min-w-0 text-amber-700 dark:text-amber-300">
                    <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                    <span className="truncate text-[11px] font-medium">
                      Yêu cầu tham gia đang chờ giảng viên phê duyệt
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                    Chờ duyệt
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">school</span>
                    <span className="truncate text-[11px]">Không gian học tập &amp; bài giảng</span>
                  </div>
                  <Link
                    href={`/classes/${item.id}`}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  >
                    Vào lớp →
                  </Link>
                </>
              )}
            </div>
          )
        ) : facultyData.alert ? (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${facultyData.alert.containerClass}`}
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              <span className="material-symbols-outlined text-[17px] shrink-0">
                {facultyData.alert.icon}
              </span>
              <span className="font-semibold truncate">{facultyData.alert.text}</span>
            </div>
            {facultyData.alert.action && (
              <Link
                href={facultyData.alert.actionHref}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors shadow-2xs ${facultyData.alert.actionClass}`}
              >
                {facultyData.alert.action}
              </Link>
            )}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 truncate min-w-0">
              <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
              <span className="truncate text-[11px]">Lớp học đang hoạt động ổn định</span>
            </div>
            <Link
              href={`/classes/${item.id}`}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              Quản lý →
            </Link>
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
});
