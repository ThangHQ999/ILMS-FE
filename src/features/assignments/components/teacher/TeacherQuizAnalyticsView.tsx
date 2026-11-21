'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { getSubjectInfoForClass } from '../../constants/subject-quiz.constants';
import { useClasses } from '@/features/classes/hooks/useClasses';
import { DEFAULT_FACULTY_CLASSES } from '@/features/classes/constants';
import { getLocalCreatedClasses } from '@/features/classes/services/class.service';
import type { ClassItem } from '@/features/classes/schemas/class.schema';

interface StudentSubmission {
  id: string;
  name: string;
  mssv: string;
  classGroup: string;
  avatar: string;
  score: number;
  attemptsCount: number;
  attemptsDetail?: string;
  duration: string;
  ploStatus: 'mastery' | 'proficient' | 'basic' | 'needs_help';
  ploLabel: string;
  submittedAt: string;
  isLate?: boolean;
}

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-1',
    name: 'Phạm Đức Anh',
    mssv: '21120334',
    classGroup: 'Lớp CLC-01',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    score: 9.5,
    attemptsCount: 1,
    duration: '16 phút 24 giây',
    ploStatus: 'mastery',
    ploLabel: 'Xuất sắc (Mastery)',
    submittedAt: 'Hôm qua, 14:20',
  },
  {
    id: 'sub-2',
    name: 'Trần Nhật Minh',
    mssv: '21120456',
    classGroup: 'Lớp CLC-01',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    score: 9.0,
    attemptsCount: 2,
    attemptsDetail: 'Lần 1: 7.5 • Lần 2: 9.0',
    duration: '18 phút 05 giây',
    ploStatus: 'mastery',
    ploLabel: 'Xuất sắc (Mastery)',
    submittedAt: 'Hôm qua, 15:42',
  },
  {
    id: 'sub-3',
    name: 'Nguyễn Quỳnh Nga',
    mssv: '21120789',
    classGroup: 'Lớp CLC-02',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    score: 8.5,
    attemptsCount: 1,
    duration: '22 phút 10 giây',
    ploStatus: 'proficient',
    ploLabel: 'Đạt chuẩn (Proficient)',
    submittedAt: 'Hôm qua, 16:05',
  },
  {
    id: 'sub-4',
    name: 'Hoàng Yến Nhi',
    mssv: '21120678',
    classGroup: 'Lớp CLC-01',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    score: 6.0,
    attemptsCount: 1,
    duration: '25 phút 40 giây',
    ploStatus: 'basic',
    ploLabel: 'Đạt cơ bản (Basic)',
    submittedAt: 'Hôm qua, 15:15',
  },
  {
    id: 'sub-5',
    name: 'Lê Quốc Bảo',
    mssv: '21120112',
    classGroup: 'Lớp CLC-01',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    score: 4.5,
    attemptsCount: 2,
    attemptsDetail: 'Dưới ngưỡng PLO',
    duration: '29 phút 12 giây',
    ploStatus: 'needs_help',
    ploLabel: 'Cần củng cố (Needs Help)',
    submittedAt: 'Hôm qua, 16:58 (Sát giờ)',
    isLate: true,
  },
  {
    id: 'sub-6',
    name: 'Đặng Thanh Hà',
    mssv: '21120512',
    classGroup: 'Lớp CLC-02',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    score: 10.0,
    attemptsCount: 1,
    duration: '14 phút 18 giây',
    ploStatus: 'mastery',
    ploLabel: 'Xuất sắc (Mastery)',
    submittedAt: 'Hôm qua, 14:15',
  },
  {
    id: 'sub-7',
    name: 'Vũ Minh Tuấn',
    mssv: '21120901',
    classGroup: 'Lớp CLC-01',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    score: 5.5,
    attemptsCount: 2,
    duration: '27 phút 50 giây',
    ploStatus: 'needs_help',
    ploLabel: 'Cần củng cố (Needs Help)',
    submittedAt: 'Hôm qua, 17:05 (Nộp muộn)',
    isLate: true,
  },
  {
    id: 'sub-8',
    name: 'Bùi Thị Mai',
    mssv: '21120233',
    classGroup: 'Lớp CLC-02',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    score: 8.0,
    attemptsCount: 1,
    duration: '20 phút 30 giây',
    ploStatus: 'proficient',
    ploLabel: 'Đạt chuẩn (Proficient)',
    submittedAt: 'Hôm qua, 15:30',
  },
];

interface TeacherQuizAnalyticsViewProps {
  onBack?: () => void;
  userFullName?: string;
  initialQuizId?: string;
  initialClassId?: string;
}

export function TeacherQuizAnalyticsView({
  onBack,
  userFullName = 'TS. Lê Hoàng Nam',
  initialQuizId,
  initialClassId,
}: TeacherQuizAnalyticsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query Parameters
  const classIdParam = initialClassId || searchParams.get('classId') || 'cs-202';
  const quizIdParam = initialQuizId || searchParams.get('quizId') || 'quiz-04';

  // Mount Guard to avoid any SSR Hydration Mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Interactivity State
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentSubmission | null>(null);
  const [reopenModalStudent, setReopenModalStudent] = useState<StudentSubmission | null>(null);
  const [isAiInterventionModalOpen, setIsAiInterventionModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  // Roster Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState<'all' | 'needs_help' | 'mastery' | 'late'>('all');
  const [rosterSort, setRosterSort] = useState<'score_desc' | 'score_asc' | 'time'>('score_desc');
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Data from teacher's classes
  const { data: classesData } = useClasses();
  const availableClasses: ClassItem[] = useMemo(() => {
    const baseList =
      classesData?.items && classesData.items.length > 0
        ? classesData.items
        : [...DEFAULT_FACULTY_CLASSES];

    const localCreated = typeof window !== 'undefined' ? getLocalCreatedClasses() : [];
    const baseIds = new Set(baseList.map((c) => String(c.id)));
    const baseNames = new Set(baseList.map((c) => c.name?.toLowerCase()));
    const newCreated = localCreated.filter(
      (c) => !baseIds.has(String(c.id)) && (!c.name || !baseNames.has(c.name.toLowerCase()))
    );

    const merged = [...newCreated, ...baseList];
    const teachingOnly = merged.filter((c) => c.teachingRole !== 'STUDENT');
    return teachingOnly.length > 0 ? teachingOnly : merged;
  }, [classesData]);

  const activeClass = useMemo(() => {
    if (classIdParam) {
      const found = availableClasses.find(
        (c) =>
          String(c.id).toLowerCase() === classIdParam.toLowerCase() ||
          c.name?.toLowerCase() === classIdParam.toLowerCase() ||
          c.code?.toLowerCase() === classIdParam.toLowerCase()
      );
      if (found) return found;

      return {
        id: classIdParam,
        name: classIdParam,
        title: classIdParam === 'cs-202' ? 'Mạng máy tính & Truyền thông' : classIdParam,
        code: classIdParam,
        classCode: classIdParam,
      };
    }
    return availableClasses[0];
  }, [availableClasses, classIdParam]);

  const subjectInfo = useMemo(() => {
    return getSubjectInfoForClass(activeClass);
  }, [activeClass]);

  const activeClassLabel = useMemo(() => {
    const code = activeClass.name || activeClass.classCode || activeClass.code || String(activeClass.id);
    const title = activeClass.title || '';
    if (title && title !== code) {
      return `${code}: ${title}`;
    }
    return code || 'CS-202: Mạng máy tính & Truyền thông';
  }, [activeClass]);

  // Quiz Metadata Calculation
  const isDefaultNetworkingQuiz = useMemo(() => {
    const id = String(quizIdParam || '').toLowerCase();
    const classId = String(classIdParam || '').toLowerCase();
    return (
      id.includes('quiz-04') ||
      id.includes('quiz-03') ||
      classId.includes('cs-202') ||
      classId.includes('cs202')
    );
  }, [quizIdParam, classIdParam]);

  const quizDisplayTitle = useMemo(() => {
    if (isDefaultNetworkingQuiz) {
      return 'Quiz 04: Tầng Mạng & Thuật toán Định tuyến OSPF / BGP';
    }
    return subjectInfo.defaultQuizTitle || `Bài thi đánh giá: ${subjectInfo.subjectName}`;
  }, [isDefaultNetworkingQuiz, subjectInfo]);

  // Filtered & Sorted Submissions Roster
  const filteredSubmissions = useMemo(() => {
    return INITIAL_SUBMISSIONS.filter((sub) => {
      // Search by name or MSSV
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = sub.name.toLowerCase().includes(q);
        const matchMssv = sub.mssv.includes(q);
        if (!matchName && !matchMssv) return false;
      }

      // Filter tags
      if (rosterFilter === 'needs_help' && sub.score >= 6.5) return false;
      if (rosterFilter === 'mastery' && sub.score < 9.0) return false;
      if (rosterFilter === 'late' && !sub.isLate) return false;

      return true;
    }).sort((a, b) => {
      if (rosterSort === 'score_desc') return b.score - a.score;
      if (rosterSort === 'score_asc') return a.score - b.score;
      return a.duration.localeCompare(b.duration);
    });
  }, [searchQuery, rosterFilter, rosterSort]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F6FAFE] dark:bg-[#131314] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Đang tải phân tích phổ điểm và thống kê đề thi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFE] dark:bg-[#131314] text-[#171c1f] dark:text-[#E3E3E3] flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors">
      {/* 1. App Shell Sidebar */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        workspaceMode="faculty"
      />

      {/* 2. Top Header Navigation */}
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode(!isFocusMode)}
        userFullName={userFullName}
        workspaceMode="faculty"
      />

      {/* 3. Main Workspace Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-0 lg:pl-72'
        }`}
      >
        <main className="w-full pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1680px] mx-auto">
          <div className="relative w-full flex flex-col gap-6">
            {/* Subtle Ambient Glow */}
            <div className="absolute -top-12 right-24 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* SECTION 1: TOP BREADCRUMB & PRIMARY ACTION HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2">
              <div className="flex flex-col gap-1.5 min-w-0">
                {/* Clickable Breadcrumbs (Point 3) */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <Link
                    href={`/classes/${encodeURIComponent(activeClass.id)}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px] text-blue-600">school</span>
                    <span>Lớp {activeClass.name || activeClass.code || 'CS-202'}</span>
                  </Link>
                  <span className="material-symbols-outlined text-[13px] text-slate-300 dark:text-slate-600">
                    chevron_right
                  </span>
                  <Link
                    href={`/assignments?classId=${encodeURIComponent(activeClass.id)}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                  >
                    Quản lý Đề thi &amp; Quiz
                  </Link>
                  <span className="material-symbols-outlined text-[13px] text-slate-300 dark:text-slate-600">
                    chevron_right
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                    {quizDisplayTitle.split(':')[0]}
                  </span>
                  <span className="material-symbols-outlined text-[13px] text-slate-300 dark:text-slate-600">
                    chevron_right
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">analytics</span>
                    Thống kê &amp; Phân tích
                  </span>
                </div>

                {/* Title & Status Badge */}
                <div className="flex items-center gap-3 flex-wrap mt-1">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171c1f] dark:text-white leading-tight">
                    {quizDisplayTitle}
                  </h1>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    Đã kết thúc đợt thi (58/60 sinh viên đã nộp • 96.7%)
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Học phần: <strong className="text-slate-700 dark:text-slate-200">{activeClassLabel}</strong> • Giảng viên: <strong className="text-slate-700 dark:text-slate-200">{userFullName}</strong>
                </p>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] text-[#171c1f] dark:text-white hover:bg-slate-50 dark:hover:bg-[#282A2C] transition-colors text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                    file_download
                  </span>
                  <span>Xuất báo cáo Excel / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all text-xs font-semibold shadow-xs cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                  <span>Gửi thông báo &amp; Gợi ý ôn tập</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/assignments/create?classId=${encodeURIComponent(activeClass.id)}&quizId=${encodeURIComponent(quizIdParam)}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-[#282A2C] bg-white dark:bg-[#1E1F20] text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-[#282A2C] transition-all text-xs font-medium cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  <span>Chỉnh sửa đề</span>
                </button>
              </div>
            </div>

            {/* SECTION 2: 4 KPI OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Card 1: Điểm trung bình */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-[#282A2C] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Điểm trung bình lớp
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">equalizer</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#171c1f] dark:text-white tracking-tight">
                      7.82
                    </span>
                    <span className="text-sm font-semibold text-slate-400">/ 10</span>
                    <span className="ml-2 inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/50">
                      +0.6 so với Quiz 03
                    </span>
                  </div>
                  <div className="mt-3 pt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#282A2C]">
                    <span>Trung vị: <strong className="text-slate-800 dark:text-slate-200">8.0</strong></span>
                    <span>Cao nhất: <strong className="text-blue-600 dark:text-blue-400">10.0</strong></span>
                    <span>Thấp nhất: <strong className="text-rose-600 dark:text-rose-400">4.5</strong></span>
                  </div>
                </div>
              </div>

              {/* Card 2: Chuẩn đầu ra PLO */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-[#282A2C] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Đạt chuẩn PLO-03 &amp; 05
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#171c1f] dark:text-white tracking-tight">
                      84.5%
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">(49/58 SV)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '84.5%' }} />
                  </div>
                  <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                    <span>Ngưỡng chuẩn ≥ 6.5</span>
                    <span className="text-rose-600 dark:text-rose-400 font-semibold cursor-pointer hover:underline" onClick={() => setRosterFilter('needs_help')}>
                      9 SV cần bổ trợ
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Thời gian làm bài */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-[#282A2C] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Thời gian trung bình
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#171c1f] dark:text-white tracking-tight">
                      21.4
                    </span>
                    <span className="text-sm font-semibold text-slate-400">/ 30 phút</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: '71.3%' }} />
                  </div>
                  <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                    <span>Nhanh nhất: <strong className="text-slate-700 dark:text-slate-200">12.0m</strong></span>
                    <span>Chậm nhất: <strong className="text-slate-700 dark:text-slate-200">29.5m</strong></span>
                  </div>
                </div>
              </div>

              {/* Card 4: AI Bottleneck Detection */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-[#1E1F20] dark:via-blue-950/40 dark:to-[#1E1F20] text-white shadow-sm flex flex-col justify-between relative overflow-hidden border border-slate-800 dark:border-blue-900/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-blue-300">auto_awesome</span>
                    AI Item Insight
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                    Cảnh báo lỗ hổng
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                    <span>Câu 6 &amp; Câu 14</span>
                    <span className="text-rose-300 text-xs font-semibold">(54% trả lời sai)</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    Điểm nghẽn: "Tính toán bảng định tuyến Dijkstra khi thay đổi trọng số cạnh". Học viên nhầm Link-State với Distance Vector.
                  </p>
                </div>
                <div className="mt-3 pt-2 flex items-center justify-between border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAiInterventionModalOpen(true)}
                    className="text-xs text-blue-300 hover:text-white underline transition-colors cursor-pointer"
                  >
                    Xem đề xuất can thiệp sư phạm
                  </button>
                  <span className="material-symbols-outlined text-[16px] text-blue-300">arrow_forward</span>
                </div>
              </div>
            </div>

            {/* SECTION 3: DEEP VISUALIZATION SECTION (HISTOGRAM & ITEM ANALYSIS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Score Distribution Histogram & Bloom Taxonomies */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-[#282A2C] shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100 dark:border-[#282A2C]">
                      <div>
                        <h2 className="text-base font-bold text-[#171c1f] dark:text-white">
                          Phổ điểm đợt thi (Score Histogram)
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Phân bố điểm số của 58 học viên trên thang điểm 10
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Số lượng SV
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &lt; 5.0 (Cần hỗ trợ)
                        </span>
                      </div>
                    </div>

                    {/* SVG Histogram Visualizer */}
                    <div className="w-full mt-4 overflow-x-auto">
                      <svg className="w-full h-56 min-w-[500px]" fill="none" viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
                        {/* Horizontal Grid lines */}
                        <line stroke="#E2E8F0" strokeDasharray="3 3" x1="40" x2="580" y1="20" y2="20" className="dark:stroke-slate-800" />
                        <line stroke="#E2E8F0" strokeDasharray="3 3" x1="40" x2="580" y1="65" y2="65" className="dark:stroke-slate-800" />
                        <line stroke="#E2E8F0" strokeDasharray="3 3" x1="40" x2="580" y1="110" y2="110" className="dark:stroke-slate-800" />
                        <line stroke="#E2E8F0" strokeDasharray="3 3" x1="40" x2="580" y1="155" y2="155" className="dark:stroke-slate-800" />
                        <line stroke="#94A3B8" strokeWidth="1.5" x1="40" x2="580" y1="190" y2="190" className="dark:stroke-slate-700" />

                        {/* Y-axis labels */}
                        <text fill="#64748B" fontSize="11" fontFamily="Inter" textAnchor="end" x="28" y="24">25 SV</text>
                        <text fill="#64748B" fontSize="11" fontFamily="Inter" textAnchor="end" x="28" y="69">20 SV</text>
                        <text fill="#64748B" fontSize="11" fontFamily="Inter" textAnchor="end" x="28" y="114">15 SV</text>
                        <text fill="#64748B" fontSize="11" fontFamily="Inter" textAnchor="end" x="28" y="159">5 SV</text>

                        {/* Bar 1: < 5.0 (3 SV) */}
                        <rect fill="#EF4444" height="24" rx="6" width="60" x="70" y="166" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setRosterFilter('needs_help')} />
                        <text fill="#EF4444" fontSize="12" fontWeight="700" fontFamily="Inter" textAnchor="middle" x="100" y="158">3 SV</text>
                        <text fill="#64748B" fontSize="12" fontFamily="Inter" textAnchor="middle" x="100" y="206">&lt; 5.0</text>

                        {/* Bar 2: 5.0 - 6.4 (6 SV) */}
                        <rect fill="#475569" height="48" rx="6" width="60" x="175" y="142" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setRosterFilter('needs_help')} />
                        <text fill="#475569" fontSize="12" fontWeight="700" fontFamily="Inter" textAnchor="middle" x="205" y="134" className="dark:fill-slate-300">6 SV</text>
                        <text fill="#64748B" fontSize="12" fontFamily="Inter" textAnchor="middle" x="205" y="206">5.0 - 6.4</text>

                        {/* Bar 3: 6.5 - 7.9 (18 SV) */}
                        <rect fill="#3B82F6" height="144" rx="6" width="60" x="280" y="46" opacity="0.85" className="cursor-pointer hover:opacity-100 transition-opacity" />
                        <text fill="#2563EB" fontSize="12" fontWeight="700" fontFamily="Inter" textAnchor="middle" x="310" y="38" className="dark:fill-blue-400">18 SV</text>
                        <text fill="#64748B" fontSize="12" fontFamily="Inter" textAnchor="middle" x="310" y="206">6.5 - 7.9</text>

                        {/* Bar 4: 8.0 - 8.9 (21 SV) */}
                        <rect fill="#2563EB" height="168" rx="6" width="60" x="385" y="22" className="cursor-pointer hover:opacity-90 transition-opacity" />
                        <text fill="#1D4ED8" fontSize="12" fontWeight="800" fontFamily="Inter" textAnchor="middle" x="415" y="16" className="dark:fill-blue-300">21 SV</text>
                        <text fill="#64748B" fontSize="12" fontFamily="Inter" textAnchor="middle" x="415" y="206">8.0 - 8.9</text>

                        {/* Bar 5: 9.0 - 10.0 (10 SV) */}
                        <rect fill="#0284C7" height="80" rx="6" width="60" x="490" y="110" className="cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setRosterFilter('mastery')} />
                        <text fill="#0284C7" fontSize="12" fontWeight="700" fontFamily="Inter" textAnchor="middle" x="520" y="102">10 SV</text>
                        <text fill="#64748B" fontSize="12" fontFamily="Inter" textAnchor="middle" x="520" y="206">9.0 - 10.0</text>
                      </svg>
                    </div>
                  </div>

                  {/* Bloom Taxonomy Correlation Indicators */}
                  <div className="mt-5 pt-4 bg-slate-50 dark:bg-[#131314] p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        Đánh giá theo thang Bloom Taxonomy
                      </span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Tương quan ma trận đề
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white dark:bg-[#1E1F20] p-3 rounded-lg border border-slate-200/80 dark:border-[#282A2C] flex flex-col gap-1.5 shadow-xs">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                          <span>Nhận biết (Recall)</span>
                          <strong className="text-slate-900 dark:text-white">92%</strong>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: '92%' }} />
                        </div>
                        <span className="text-[10.5px] text-slate-400 truncate">Định nghĩa giao thức, cổng mạng</span>
                      </div>

                      <div className="bg-white dark:bg-[#1E1F20] p-3 rounded-lg border border-slate-200/80 dark:border-[#282A2C] flex flex-col gap-1.5 shadow-xs">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                          <span>Thông hiểu (Understand)</span>
                          <strong className="text-slate-900 dark:text-white">85%</strong>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }} />
                        </div>
                        <span className="text-[10.5px] text-slate-400 truncate">Bản tin Link-State Advertisement</span>
                      </div>

                      <div className="bg-white dark:bg-[#1E1F20] p-3 rounded-lg border border-slate-200/80 dark:border-[#282A2C] flex flex-col gap-1.5 shadow-xs">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                          <span>Vận dụng cao (Apply)</span>
                          <strong className="text-rose-600 dark:text-rose-400 font-bold">61%</strong>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: '61%' }} />
                        </div>
                        <span className="text-[10.5px] text-rose-500 truncate">Tính ma trận OSPF / Dijkstra</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Item Analysis & Question Health */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-[#282A2C] shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#282A2C]">
                      <div>
                        <h2 className="text-base font-bold text-[#171c1f] dark:text-white">
                          Phân tích câu hỏi (Item Analysis)
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Top câu hỏi có độ phân hóa cao &amp; tỉ lệ sai lớn
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-xs font-semibold">
                        3/20 Câu cần lưu ý
                      </span>
                    </div>

                    <div className="flex flex-col gap-3.5 mt-4">
                      {/* Question 1: Câu 6 */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 transition-colors flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Câu 6 (Trắc nghiệm thuật toán)
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-[11px] font-bold">
                            Đúng: 41.4%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          "Thuật toán Dijkstra chọn đường đi ngắn nhất: Trọng số thay đổi tại Node C khi packet đang trung chuyển..."
                        </p>
                        <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-1 text-slate-500">
                            <span>Chỉ số phân hóa D:</span>
                            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">0.45 (Rất tốt)</strong>
                          </div>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">32 SV chọn nhầm DV</span>
                        </div>
                      </div>

                      {/* Question 2: Câu 14 */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 transition-colors flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Câu 14 (Cấu hình OSPF Area)
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-[11px] font-bold">
                            Đúng: 46.5%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          "Xác định router ABR và ASBR trong kịch bản mạng đa vùng (Multi-Area OSPF) nối với external BGP."
                        </p>
                        <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-1 text-slate-500">
                            <span>Chỉ số phân hóa D:</span>
                            <strong className="text-blue-600 dark:text-blue-400 font-bold">0.38 (Tốt)</strong>
                          </div>
                          <span className="text-slate-500 dark:text-slate-400">Sai ở khái niệm ABR</span>
                        </div>
                      </div>

                      {/* Question 3: Câu 19 */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 transition-colors flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Câu 19 (BGP Route Selection)
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 text-[11px] font-bold">
                            Đúng: 53.4%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          "Thứ tự ưu tiên thuộc tính BGP (Weight, Local Pref, AS-Path, MED) khi routing loop xuất hiện."
                        </p>
                        <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-1 text-slate-500">
                            <span>Chỉ số phân hóa D:</span>
                            <strong className="text-blue-600 dark:text-blue-400 font-bold">0.41</strong>
                          </div>
                          <span className="text-slate-500 dark:text-slate-400">Nhầm MED với AS-Path</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Remedial Suggestion Action Box */}
                  <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative overflow-hidden border border-slate-800 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-blue-300 text-[24px] mt-0.5 shrink-0">
                        auto_awesome
                      </span>
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <span className="text-xs font-bold text-white">Đề xuất can thiệp sư phạm AI</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Hệ thống đã tự động soạn <strong>1 Mini-Lab Packet Tracer mô phỏng Dijkstra</strong> kèm 3 bài tập củng cố thuật toán định tuyến để gửi cho 9 sinh viên dưới chuẩn.
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              showToast('Đã phê duyệt và tự động giao bài ôn tập bổ trợ tới 9 sinh viên!');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                          >
                            Phê duyệt &amp; Giao bài ôn tập
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAiInterventionModalOpen(true)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Xem chi tiết giáo trình
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: STUDENT SUBMISSIONS ROSTER */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-[#282A2C] shadow-sm flex flex-col gap-5">
              {/* Roster Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#171c1f] dark:text-white">
                    Danh sách kết quả bài nộp của học viên
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tổng cộng 58 bài thi đã ghi nhận • Xem xét và phê duyệt kết quả đánh giá
                  </p>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Search Field */}
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-slate-400">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm theo tên học viên, MSSV..."
                      className="w-64 h-9 pl-9 pr-3 rounded-lg bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    />
                  </div>

                  {/* Filter Tags */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#131314] p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setRosterFilter('all')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        rosterFilter === 'all'
                          ? 'bg-white dark:bg-[#1E1F20] text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Tất cả (58)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterFilter('needs_help')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        rosterFilter === 'needs_help'
                          ? 'bg-white dark:bg-[#1E1F20] text-rose-600 dark:text-rose-400 shadow-xs'
                          : 'text-rose-600/80 hover:text-rose-600'
                      }`}
                    >
                      Cần chú ý (&lt; 6.5) (9)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterFilter('mastery')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        rosterFilter === 'mastery'
                          ? 'bg-white dark:bg-[#1E1F20] text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Xuất sắc (10)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterFilter('late')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        rosterFilter === 'late'
                          ? 'bg-white dark:bg-[#1E1F20] text-amber-600 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Nộp muộn (2)
                    </button>
                  </div>

                  {/* Sort Select */}
                  <select
                    value={rosterSort}
                    onChange={(e) => setRosterSort(e.target.value as any)}
                    className="h-9 px-3 rounded-lg bg-slate-100 dark:bg-[#131314] text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer outline-none border-none hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
                  >
                    <option value="score_desc">Điểm: Giảm dần</option>
                    <option value="score_asc">Điểm: Tăng dần</option>
                    <option value="time">Thời gian làm bài</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 dark:border-[#282A2C]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#131314] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-[#282A2C]">
                      <th className="py-3.5 px-4 font-semibold">Học viên</th>
                      <th className="py-3.5 px-4 font-semibold">Điểm số / 10</th>
                      <th className="py-3.5 px-4 font-semibold">Số lần làm</th>
                      <th className="py-3.5 px-4 font-semibold">Thời gian làm</th>
                      <th className="py-3.5 px-4 font-semibold">Chuẩn đầu ra PLO</th>
                      <th className="py-3.5 px-4 font-semibold">Thời điểm nộp</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#282A2C] text-xs">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Không tìm thấy bài nộp nào phù hợp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((sub) => {
                        const isUnderThreshold = sub.score < 6.5;

                        return (
                          <tr
                            key={sub.id}
                            className={`transition-colors ${
                              isUnderThreshold
                                ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/30'
                                : 'hover:bg-slate-50/70 dark:hover:bg-[#131314]/50'
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={sub.avatar}
                                  alt={sub.name}
                                  className="w-9 h-9 rounded-full object-cover shadow-xs border border-slate-200 dark:border-slate-700"
                                />
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {sub.name}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    MSSV: {sub.mssv} • {sub.classGroup}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-baseline gap-1">
                                <span
                                  className={`text-base font-bold ${
                                    sub.score >= 9.0
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : sub.score >= 6.5
                                      ? 'text-slate-900 dark:text-white'
                                      : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                >
                                  {sub.score.toFixed(1)}
                                </span>
                                <span className="text-slate-400 text-[11px]">/ 10</span>
                              </div>
                              {sub.attemptsDetail && (
                                <span
                                  className={`text-[10px] block mt-0.5 ${
                                    isUnderThreshold ? 'text-rose-600 font-semibold' : 'text-slate-400'
                                  }`}
                                >
                                  {sub.attemptsDetail}
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                  sub.attemptsCount > 1
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {sub.attemptsCount} lần
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                              {sub.duration}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                  sub.ploStatus === 'mastery'
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                                    : sub.ploStatus === 'proficient'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                    : sub.ploStatus === 'basic'
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    sub.ploStatus === 'mastery' || sub.ploStatus === 'proficient'
                                      ? 'bg-blue-600'
                                      : sub.ploStatus === 'basic'
                                      ? 'bg-slate-400'
                                      : 'bg-rose-500'
                                  }`}
                                />
                                {sub.ploLabel}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                              {sub.submittedAt}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                {isUnderThreshold && (
                                  <button
                                    type="button"
                                    onClick={() => setReopenModalStudent(sub)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-xs"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                                    <span>Mở nộp lại</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedStudentForDetail(sub)}
                                  className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                                  title="Xem bài làm chi tiết"
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => showToast(`Mở kênh chat trực tiếp với học viên ${sub.name}`)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Nhắn phản hồi"
                                >
                                  <span className="material-symbols-outlined text-[18px]">chat</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination & Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Đang hiển thị <strong>1 - {filteredSubmissions.length}</strong> trên tổng số <strong>58</strong> sinh viên
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      currentPage === 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(2)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    2
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(3)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    3
                  </button>
                  <span className="px-1 text-slate-400">…</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(6)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    6
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Chuyển trang tiếp theo')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: Mở nộp lại cho sinh viên */}
      {reopenModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border border-slate-200 dark:border-[#282A2C] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">restart_alt</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Mở quyền nộp lại bài thi
                </h3>
                <span className="text-xs text-slate-500">
                  Cấp lượt thi bổ sung cho sinh viên dưới ngưỡng
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 text-xs">
              <img
                src={reopenModalStudent.avatar}
                alt={reopenModalStudent.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white">
                  {reopenModalStudent.name} ({reopenModalStudent.mssv})
                </span>
                <span className="text-rose-600 font-semibold">
                  Điểm hiện tại: {reopenModalStudent.score} / 10.0 • {reopenModalStudent.attemptsCount} lần làm
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Thời hạn nộp bổ sung:
              </label>
              <select className="h-9 px-3 rounded-lg bg-slate-100 dark:bg-[#131314] border border-slate-300 dark:border-slate-700 text-xs">
                <option>Gia hạn +24 giờ (Đến 23:59 ngày mai)</option>
                <option>Gia hạn +48 giờ</option>
                <option>Gia hạn đến cuối tuần này</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#282A2C]">
              <button
                type="button"
                onClick={() => setReopenModalStudent(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Đã cấp quyền nộp bài lần ${reopenModalStudent.attemptsCount + 1} cho sinh viên ${reopenModalStudent.name} (+24 giờ).`);
                  setReopenModalStudent(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Xác nhận mở nộp lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Chi tiết bài làm của sinh viên */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#282A2C] max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-[#282A2C] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudentForDetail.avatar}
                  alt={selectedStudentForDetail.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Bài làm chi tiết: {selectedStudentForDetail.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    MSSV: {selectedStudentForDetail.mssv} • Điểm: <strong className="text-blue-600">{selectedStudentForDetail.score}/10</strong> ({selectedStudentForDetail.duration})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                <span>Trạng thái đánh giá chuẩn đầu ra:</span>
                <span className="font-bold text-blue-700 dark:text-blue-300">
                  {selectedStudentForDetail.ploLabel}
                </span>
              </div>

              {/* Sample Answers breakdown */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>Câu 1: Phân loại gói tin Hello Packet OSPF (Bloom 1)</span>
                    <span className="text-emerald-600 font-bold">+1.0 Điểm (Đúng)</span>
                  </div>
                  <p className="text-slate-500">Học viên chọn: <strong>B. Hello Packet</strong> (Đáp án chuẩn)</p>
                </div>

                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>Câu 6: Thuật toán Dijkstra khi trọng số Node C thay đổi (Bloom 3)</span>
                    <span className="text-rose-600 font-bold">0.0 Điểm (Sai)</span>
                  </div>
                  <p className="text-slate-500">Học viên chọn: <strong>A. Cập nhật theo Distance Vector</strong> (Đáp án đúng: C. Link State Flooding)</p>
                  <p className="text-slate-400 italic">Nhận định AI: Học viên nhầm lẫn giữa cơ chế hội tụ của OSPF và RIP.</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-[#282A2C] bg-slate-50 dark:bg-[#131314] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
              >
                Đóng xem chi tiết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Chi tiết đề xuất can thiệp Sư phạm AI */}
      {isAiInterventionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border border-slate-200 dark:border-[#282A2C] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[28px] text-blue-600">auto_awesome</span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Kế hoạch can thiệp Sư phạm AI Socratic
                </h3>
                <span className="text-xs text-slate-500">Dành riêng cho 9 sinh viên dưới chuẩn năng lực</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Dựa trên ma trận Item Analysis, hệ thống phát hiện <strong>54% sinh viên trả lời sai câu hỏi liên quan đến thuật toán Dijkstra</strong> khi cấu hình mạng OSPF.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-slate-800 space-y-1.5 font-medium">
                <div>📁 <strong>Gói học liệu bổ trợ:</strong> Mini-Lab Cisco Packet Tracer 4.2</div>
                <div>🎯 <strong>Chuẩn đầu ra:</strong> PLO-03 (Phân tích định tuyến)</div>
                <div>⏱️ <strong>Thời lượng dự kiến:</strong> 45 phút thực hành tự học</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#282A2C]">
              <button
                type="button"
                onClick={() => setIsAiInterventionModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Đã gửi tài liệu và bài tập ôn tập tự động đến 9 sinh viên!');
                  setIsAiInterventionModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Giao bài tập ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Xuất báo cáo */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border border-slate-200 dark:border-[#282A2C] p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Xuất báo cáo Thống kê &amp; Item Analysis
            </h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Bảng điểm chi tiết 58 sinh viên (.xlsx)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Báo cáo phổ điểm &amp; Chuẩn Bloom (.pdf)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Phân tích phân hóa câu hỏi (Item Analysis)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#282A2C]">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Đang tạo và tải xuống file Quiz04_CS202_Report.xlsx...');
                  setIsExportModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                Tải xuống báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Gửi thông báo LMS */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border border-slate-200 dark:border-[#282A2C] p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Gửi thông báo &amp; Gợi ý ôn tập
            </h3>
            <p className="text-xs text-slate-500">
              Gửi email và thông báo đẩy LMS đến toàn bộ 58 học viên đã tham gia đợt thi Quiz 04.
            </p>
            <textarea
              defaultValue="Thông báo kết quả Quiz 04: Điểm trung bình lớp đạt 7.82. Các bạn có điểm dưới 6.5 vui lòng kiểm tra mục Bài tập bổ trợ để làm bài Mini-Lab củng cố thuật toán Dijkstra."
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131314] text-xs leading-relaxed outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#282A2C]">
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Hệ thống đã gửi email và thông báo LMS kèm tài liệu ôn tập định tuyến Dijkstra tới 58 sinh viên.');
                  setIsNoticeModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                Gửi thông báo ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-xl backdrop-blur-md text-xs font-semibold border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-blue-400 dark:text-blue-600 text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
