'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { TeacherCreateQuizStudioView } from './TeacherCreateQuizStudioView';

interface TeacherExamManagementViewProps {
  userFullName?: string;
}

interface ExamItem {
  id: string;
  code: string;
  type: 'quiz' | 'exam' | 'draft';
  status: 'live' | 'upcoming' | 'completed' | 'complaints' | 'draft';
  statusBadge: string;
  statusBadgeColor: string;
  classTag: string;
  title: string;
  duration: string;
  questionCount: number;
  tags: string[];
  submittedCount?: number;
  totalStudents?: number;
  timeLeft?: string;
  progressPercent?: number;
  examDate?: string;
  securityBadge?: string;
  avgScore?: number;
  ploRate?: number;
  discriminationIndex?: number;
  complaintCount?: number;
  complaintDetail?: string;
  sourceDoc?: string;
  draftMode?: string;
}

export function TeacherExamManagementView({
  userFullName = 'TS. Lê Hoàng Nam',
}: TeacherExamManagementViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // View Mode: 'list' (Exam & Quiz Management) or 'create' (Quiz Studio Builder)
  const [viewMode, setViewMode] = useState<'list' | 'create'>(() => {
    return searchParams.get('action') === 'create' ? 'create' : 'list';
  });

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Filters & State
  const [activeCategory, setActiveCategory] = useState<'all' | 'quiz' | 'exam' | 'live' | 'completed' | 'draft'>('quiz');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('Chương 4: Tầng Mạng');
  const [selectedBloom, setSelectedBloom] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('RECENT');
  const [selectedCourse, setSelectedCourse] = useState('CS-202: Mạng máy tính & Truyền thông');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Timer Countdown simulation
  const [secondsRemaining, setSecondsRemaining] = useState(765); // 12:45
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTimeLeft = useMemo(() => {
    const minutes = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `Còn ${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [secondsRemaining]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const courseList = [
    'CS-202: Mạng máy tính & Truyền thông',
    'INT-1340: Cấu trúc dữ liệu & Giải thuật',
    'CS-301: Hệ quản trị Cơ sở dữ liệu',
    'SE-214: Nhập môn Công nghệ Phần mềm',
  ];

  // Base Exam Data
  const allExams: ExamItem[] = [
    {
      id: 'quiz-04',
      code: 'QUIZ-CS202-04',
      type: 'quiz',
      status: 'live',
      statusBadge: '⚡ QUIZ TRẮC NGHIỆM • ĐANG THI TRỰC TUYẾN',
      statusBadgeColor: 'bg-red-500 text-white',
      classTag: 'Lớp: CS202.CLC01',
      title: 'Quiz 04: Tầng Mạng & Giao thức Định tuyến OSPF/BGP',
      duration: '30 phút làm bài',
      questionCount: 20,
      tags: ['4 mã đề tự động', 'Giám sát Tab & IP'],
      submittedCount: 54,
      totalStudents: 60,
      timeLeft: formattedTimeLeft,
      progressPercent: 90,
    },
    {
      id: 'mid-2024',
      code: 'MID-CS202-2024',
      type: 'exam',
      status: 'upcoming',
      statusBadge: '📝 ĐỀ THI CHÍNH KHÓA • BẢO MẬT CAO',
      statusBadgeColor: 'bg-blue-600 text-white',
      securityBadge: 'Safe Exam Browser',
      classTag: 'Khóa 2022 - CNTT',
      title: 'Kiểm tra Giữa kỳ: Toàn diện 4 Tầng Giao thức Mạng',
      examDate: 'Thứ 6, 25/10 - 08:00 AM',
      duration: '45 phút',
      questionCount: 35,
      tags: ['Trộn 4 mã đề'],
    },
    {
      id: 'quiz-03',
      code: 'QUIZ-CS202-03',
      type: 'quiz',
      status: 'completed',
      statusBadge: '⚡ QUIZ TRẮC NGHIỆM • ĐÃ HOÀN THÀNH',
      statusBadgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      classTag: 'Lớp: CS202.CLC01',
      title: 'Quiz 03: Tầng Giao vận & Cơ chế bắt tay TCP',
      duration: '30 phút',
      questionCount: 20,
      tags: ['58/58 SV nộp (100%)'],
      avgScore: 8.2,
      ploRate: 88,
      discriminationIndex: 0.74,
    },
    {
      id: 'quiz-02',
      code: 'QUIZ-CS202-02',
      type: 'quiz',
      status: 'complaints',
      statusBadge: '⚡ QUIZ TRẮC NGHIỆM • CÓ 2 KHIẾU NẠI ĐANG CHỜ',
      statusBadgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      classTag: 'Điểm TB: 8.1/10',
      title: 'Quiz 02: Tầng Liên kết dữ liệu & Giao thức CSMA/CD',
      duration: '35 phút',
      questionCount: 25,
      tags: [],
      complaintCount: 2,
      complaintDetail: '2 SV khiếu nại câu hỏi #14 về tính toán Backoff time',
    },
    {
      id: 'quiz-05-draft',
      code: 'AI-DRAFT-APP',
      type: 'draft',
      status: 'draft',
      statusBadge: '✨ AI GENERATED DRAFT • 20 CÂU TỰ ĐỘNG BÓC TÁCH',
      statusBadgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      classTag: 'Sinh từ tài liệu: Chapter5_Application_Layer.pdf',
      title: 'Quiz 05: Tầng Ứng dụng & Dịch vụ Mạng DNS/HTTP/SSH',
      duration: '25 phút',
      questionCount: 20,
      tags: ['Phủ đều các mức Bloom: Nhớ, Hiểu, Phân tích luồng gói tin'],
      draftMode: 'Đang ở chế độ nháp riêng tư',
    },
  ];

  // Filtering Logic
  const filteredExams = useMemo(() => {
    return allExams.filter((exam) => {
      // Category filter
      if (activeCategory === 'quiz' && exam.type !== 'quiz') return false;
      if (activeCategory === 'exam' && exam.type !== 'exam') return false;
      if (activeCategory === 'live' && exam.status !== 'live') return false;
      if (activeCategory === 'completed' && exam.status !== 'completed') return false;
      if (activeCategory === 'draft' && exam.type !== 'draft') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = exam.title.toLowerCase().includes(q);
        const matchCode = exam.code.toLowerCase().includes(q);
        if (!matchTitle && !matchCode) return false;
      }

      return true;
    });
  }, [allExams, activeCategory, searchQuery]);

  if (viewMode === 'create') {
    return (
      <TeacherCreateQuizStudioView
        onBack={() => setViewMode('list')}
        userFullName={userFullName}
        onPublishSuccess={() => setViewMode('list')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFE] dark:bg-[#131314] text-[#171c1f] dark:text-[#E3E3E3] flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors">
      {/* 1. App Shell Sidebar (Standard Teacher Sidebar with official logo) */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        workspaceMode="faculty"
      />

      {/* 2. Top Header Navigation (Unified DashboardHeader matching user template) */}
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
            {/* Subtle Ambient Glow Accents */}
            <div className="absolute -top-12 right-24 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-80 left-12 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* SECTION 1: PAGE HEADER & PRIMARY ACTIONS */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171c1f] dark:text-white whitespace-nowrap">
                    Quản lý Đề thi &amp; Quiz trắc nghiệm
                  </h1>
                  {/* Course Selector Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                      className="flex items-center gap-2 bg-white dark:bg-[#1E1F20] px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-[#282A2C] cursor-pointer hover:border-blue-500 transition-all text-xs font-semibold text-[#171c1f] dark:text-white whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                        menu_book
                      </span>
                      <span className="truncate max-w-[220px]">{selectedCourse}</span>
                      <span className="material-symbols-outlined text-slate-400 text-[18px]">
                        expand_more
                      </span>
                    </button>

                    {isCourseDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-72 bg-white dark:bg-[#1E1F20] rounded-xl shadow-lg border border-slate-200 dark:border-[#282A2C] py-1.5 z-50">
                        {courseList.map((course) => (
                          <button
                            key={course}
                            onClick={() => {
                              setSelectedCourse(course);
                              setIsCourseDropdownOpen(false);
                              showToast(`Đã chuyển sang môn học: ${course}`);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors flex items-center gap-2 ${
                              selectedCourse === course
                                ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">school</span>
                            <span className="truncate">{course}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[#75777e] dark:text-[#8E918F] mt-1">
                  Khoa Công nghệ Thông tin • Học kỳ II - 2024
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                <button
                  type="button"
                  onClick={() => showToast('Mở cửa sổ nhập đề thi từ file Moodle XML hoặc Excel (.xlsx)')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] text-[#171c1f] dark:text-white text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#282A2C] transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#75777e] dark:text-[#8E918F]">
                    upload_file
                  </span>
                  <span>Nhập từ Moodle / Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Bắt đầu khởi tạo Exam Blueprint tự động từ Ma trận chuẩn đầu ra Bloom')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>Tạo đề bằng AI (Exam Blueprint)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('create')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-700 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Tạo Quiz mới</span>
                </button>
              </div>
            </div>

          {/* SECTION 2: 4 KPI METRICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Tổng số bài thi */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1E1F20] shadow-sm flex flex-col justify-between transition-all hover:shadow-md border-l-4 border-blue-600 dark:border-blue-500 border border-slate-200/60 dark:border-[#282A2C]">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-[#75777e] dark:text-[#8E918F] font-semibold">
                    TỔNG SỐ BÀI THI
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl text-[#171c1f] dark:text-white font-bold">14</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Đề</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">assignment</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex flex-col gap-1 border-t border-slate-100 dark:border-[#282A2C]">
                <div className="flex items-center justify-between text-xs text-[#44474d] dark:text-[#8E918F]">
                  <span>9 Quiz trắc nghiệm • 3 Giữa/Cuối kỳ • 2 Củng cố</span>
                </div>
              </div>
            </div>

            {/* KPI 2: Đang diễn ra (LIVE) */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1E1F20] shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden border-l-4 border-red-500 border border-slate-200/60 dark:border-[#282A2C]">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-100/40 dark:bg-red-950/20 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#75777e] dark:text-[#8E918F] font-semibold">
                      ĐANG DIỄN RA (LIVE)
                    </span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl text-red-600 dark:text-red-400 font-bold">01</span>
                    <span className="text-xs text-[#44474d] dark:text-[#8E918F]">Phòng thi đang mở</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
                  <span className="material-symbols-outlined text-[22px] animate-pulse">sensors</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-[#282A2C] text-xs">
                <div className="flex items-center gap-1.5 text-[#171c1f] dark:text-white font-medium">
                  <span className="font-semibold text-red-600 dark:text-red-400">Quiz 04:</span>
                  <span className="text-[#44474d] dark:text-[#8E918F]">54/60 SV đang làm</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Mở màn hình Camera & Tab Proctoring Giám sát phòng thi Quiz 04')}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Giám sát trực tiếp →
                </button>
              </div>
            </div>

            {/* KPI 3: Điểm TB toàn khóa */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1E1F20] shadow-sm flex flex-col justify-between transition-all hover:shadow-md border-l-4 border-indigo-600 dark:border-indigo-400 border border-slate-200/60 dark:border-[#282A2C]">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-[#75777e] dark:text-[#8E918F] font-semibold">
                    ĐIỂM TB TOÀN KHÓA
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl text-[#171c1f] dark:text-white font-bold">7.82</span>
                    <span className="text-xs text-[#75777e]">/10</span>
                    <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>+0.4
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">trending_up</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-[#44474d] dark:text-[#8E918F] border-t border-slate-100 dark:border-[#282A2C]">
                <span>84.5% sinh viên đạt chuẩn PLO</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                  Đạt chuẩn
                </span>
              </div>
            </div>

            {/* KPI 4: Khiếu nại & Chấm lại */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1E1F20] shadow-sm flex flex-col justify-between transition-all hover:shadow-md border-l-4 border-amber-500 border border-slate-200/60 dark:border-[#282A2C]">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-[#75777e] dark:text-[#8E918F] font-semibold">
                    KHIẾU NẠI &amp; CHẤM LẠI
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl text-[#171c1f] dark:text-white font-bold">03</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-semibold">
                      Cần xử lý &lt; 24h
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <span className="material-symbols-outlined text-[22px]">gavel</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-[#282A2C]">
                <span className="text-[#44474d] dark:text-[#8E918F]">2 câu Quiz 02 • 1 câu Giữa kỳ</span>
                <button
                  type="button"
                  onClick={() => showToast('Mở hàng đợi thẩm định 3 phiếu khiếu nại chấm lại')}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Xử lý ngay →
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: SEARCH & MULTI-FILTER TOOLBAR */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-[#1E1F20] shadow-sm border border-slate-200/80 dark:border-[#282A2C]">
            {/* Top Category Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#282A2C] gap-3">
              <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-[#eaeef2] dark:bg-[#131314] rounded-lg text-xs font-semibold overflow-x-auto scrollbar-none whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeCategory === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[#44474d] dark:text-[#8E918F] hover:bg-white dark:hover:bg-[#282A2C] hover:text-[#171c1f]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">category</span>
                  <span>Tất cả (14)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('quiz')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeCategory === 'quiz'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[#44474d] dark:text-[#8E918F] hover:bg-white dark:hover:bg-[#282A2C] hover:text-[#171c1f]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Quiz trắc nghiệm (9)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('exam')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeCategory === 'exam'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[#44474d] dark:text-[#8E918F] hover:bg-white dark:hover:bg-[#282A2C] hover:text-[#171c1f]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  <span>Đề thi chính khóa (5)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('live')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeCategory === 'live'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-[#44474d] dark:text-[#8E918F] hover:bg-white dark:hover:bg-[#282A2C] hover:text-[#171c1f]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Đang mở / Live (1)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('completed')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeCategory === 'completed'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[#44474d] dark:text-[#8E918F] hover:bg-white dark:hover:bg-[#282A2C] hover:text-[#171c1f]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                  <span>Đã kết thúc (9)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('draft')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeCategory === 'draft'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-[#44474d] dark:text-[#8E918F] hover:bg-white dark:hover:bg-[#282A2C] hover:text-[#171c1f]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-purple-500">smart_toy</span>
                  <span>Bản nháp AI (2)</span>
                </button>
              </div>

              {/* Advanced Filter Chip */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => showToast('Mở bộ lọc nâng cao')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">filter_alt</span>
                  <span>Bộ lọc nâng cao</span>
                </button>
              </div>
            </div>

            {/* Bottom Search & Select Dropdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
              <div className="lg:col-span-5 relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#75777e] text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm đề thi, quiz theo tên, mã bài..."
                  className="w-full pl-10 pr-16 py-2 rounded-lg bg-[#f0f4f8] dark:bg-[#131314] text-[#171c1f] dark:text-white placeholder:text-[#75777e] text-xs focus:bg-white dark:focus:bg-[#282A2C] focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                />
                <kbd className="absolute right-3 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                  Ctrl+K
                </kbd>
              </div>

              <div className="lg:col-span-3 relative">
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg bg-[#f0f4f8] dark:bg-[#131314] text-[#171c1f] dark:text-white text-xs focus:bg-white dark:focus:bg-[#282A2C] outline-none cursor-pointer"
                >
                  <option>Chương 4: Tầng Mạng</option>
                  <option>Chương 1: Tổng quan</option>
                  <option>Chương 2: Tầng Ứng dụng</option>
                  <option>Chương 3: Tầng Giao vận</option>
                  <option>Tất cả chương học</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#75777e] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>

              <div className="lg:col-span-2 relative">
                <select
                  value={selectedBloom}
                  onChange={(e) => setSelectedBloom(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg bg-[#f0f4f8] dark:bg-[#131314] text-[#171c1f] dark:text-white text-xs focus:bg-white dark:focus:bg-[#282A2C] outline-none cursor-pointer"
                >
                  <option value="ALL">Độ khó / Thang Bloom</option>
                  <option value="L1-L2">Nhớ &amp; Hiểu (L1-L2)</option>
                  <option value="L3">Vận dụng (L3)</option>
                  <option value="L4-L5">Phân tích &amp; Đánh giá (L4-L5)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#75777e] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>

              <div className="lg:col-span-2 relative">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg bg-[#f0f4f8] dark:bg-[#131314] text-[#171c1f] dark:text-white text-xs focus:bg-white dark:focus:bg-[#282A2C] outline-none cursor-pointer"
                >
                  <option value="RECENT">Sắp xếp: Ngày thi gần nhất</option>
                  <option value="NEWEST">Mới nhất / Ngày tạo</option>
                  <option value="NAME">Tên Quiz A-Z</option>
                  <option value="SUBMISSION_RATE">Tỉ lệ nộp bài</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#75777e] text-[18px] pointer-events-none">
                  sort
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: DETAILED QUIZ & EXAM LIST CARDS */}
          <div className="flex flex-col gap-4">
            {filteredExams.map((exam) => {
              if (exam.id === 'quiz-04') {
                // ITEM 1: [ĐANG LIVE] Quiz 04
                return (
                  <div
                    key={exam.id}
                    className="group relative rounded-xl bg-white dark:bg-[#1E1F20] shadow-md hover:shadow-lg transition-all p-5 overflow-hidden bg-gradient-to-r from-blue-50/40 via-white to-white dark:from-blue-950/20 dark:via-[#1E1F20] dark:to-[#1E1F20] border-l-4 border-red-500 border border-slate-200/80 dark:border-[#282A2C]"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
                          <span className="material-symbols-outlined text-[28px] animate-pulse">timer</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500 text-white font-bold tracking-wide text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              ⚡ QUIZ TRẮC NGHIỆM • ĐANG THI TRỰC TUYẾN
                            </span>
                            <span className="font-mono text-xs text-[#75777e] dark:text-[#8E918F] font-semibold">
                              {exam.code}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                              {exam.classTag}
                            </span>
                          </div>
                          <h3
                            onClick={() => showToast(`Xem chi tiết: ${exam.title}`)}
                            className="text-base text-[#171c1f] dark:text-white font-bold hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {exam.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-[#44474d] dark:text-[#8E918F] flex-wrap mt-0.5">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                                schedule
                              </span>
                              {exam.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                                help
                              </span>
                              {exam.questionCount} câu hỏi
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                                shuffle
                              </span>
                              4 mã đề tự động
                            </span>
                            <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                              <span className="material-symbols-outlined text-[15px]">security</span>
                              Giám sát Tab &amp; IP
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 xl:justify-end">
                        <div className="flex flex-col gap-1 min-w-[200px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#171c1f] dark:text-white font-semibold">
                              {exam.submittedCount} / {exam.totalStudents} SV đã nộp
                            </span>
                            <span className="text-red-600 dark:text-red-400 font-bold font-mono">
                              {exam.timeLeft}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 rounded-full transition-all duration-500"
                              style={{ width: `${exam.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#75777e] dark:text-[#8E918F] text-right">
                            {exam.progressPercent}% sinh viên đã nộp
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => showToast('Mở trung tâm Giám sát phòng thi Quiz 04 trực tiếp')}
                            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                            <span>Giám sát phòng thi ngay</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast('Đang tải kết quả thi thời gian thực...')}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">leaderboard</span>
                            <span>Xem kết quả thời gian thực</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast('Tùy chọn khác')}
                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            title="Menu thao tác"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (exam.id === 'mid-2024') {
                // ITEM 2: [SẮP DIỄN RA] Đề thi Giữa kỳ
                return (
                  <div
                    key={exam.id}
                    className="group relative rounded-xl bg-white dark:bg-[#1E1F20] shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-blue-600 dark:border-blue-500 border border-slate-200/80 dark:border-[#282A2C]"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[28px]">lock</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold tracking-wide text-[10px]">
                              📝 ĐỀ THI CHÍNH KHÓA • BẢO MẬT CAO
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">shield</span>
                              Safe Exam Browser
                            </span>
                            <span className="font-mono text-xs text-[#75777e] dark:text-[#8E918F] font-semibold">
                              {exam.code}
                            </span>
                          </div>
                          <h3
                            onClick={() => showToast(`Xem cấu hình: ${exam.title}`)}
                            className="text-base text-[#171c1f] dark:text-white font-bold hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {exam.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-[#44474d] dark:text-[#8E918F] flex-wrap mt-0.5">
                            <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                              Lịch thi: {exam.examDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                              {exam.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">help</span>
                              {exam.questionCount} câu hỏi
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">shuffle</span>
                              Trộn 4 mã đề
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap xl:justify-end">
                        <button
                          type="button"
                          onClick={() => showToast('Mở bảng cấu hình phòng thi bảo mật Safe Exam Browser')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">tune</span>
                          <span>Cấu hình phòng thi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Đang kết xuất đề thi và ma trận đáp án PDF')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#171c1f] dark:text-white text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">print</span>
                          <span>In đề &amp; Đáp án</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Mở trình chỉnh sửa nội dung đề thi')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[#171c1f] dark:text-white text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          <span>Chỉnh sửa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (exam.id === 'quiz-03') {
                // ITEM 3: [ĐÃ KẾT THÚC] Quiz 03
                return (
                  <div
                    key={exam.id}
                    className="group relative rounded-xl bg-white dark:bg-[#1E1F20] shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-indigo-600 dark:border-indigo-400 border border-slate-200/80 dark:border-[#282A2C]"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[28px]">check_circle</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold tracking-wide text-[10px]">
                              ⚡ QUIZ TRẮC NGHIỆM • ĐÃ HOÀN THÀNH
                            </span>
                            <span className="font-mono text-xs text-[#75777e] dark:text-[#8E918F] font-semibold">
                              {exam.code}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                              {exam.classTag}
                            </span>
                          </div>
                          <h3
                            onClick={() => showToast(`Xem thống kê: ${exam.title}`)}
                            className="text-base text-[#171c1f] dark:text-white font-bold hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {exam.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-[#44474d] dark:text-[#8E918F] flex-wrap mt-0.5">
                            <span>58/58 SV nộp (100%)</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                              Điểm TB: {exam.avgScore}/10
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Đạt PLO: {exam.ploRate}%
                            </span>
                            <span className="text-[#75777e]">Độ phân cách: {exam.discriminationIndex}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap xl:justify-end">
                        <button
                          type="button"
                          onClick={() => showToast('Mở biểu đồ phân tích phổ điểm & chuẩn năng lực Bloom')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">query_stats</span>
                          <span>Thống kê phổ điểm &amp; Bloom</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Mở danh sách bảng điểm chi tiết lớp học')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#171c1f] dark:text-white text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">leaderboard</span>
                          <span>Bảng điểm chi tiết</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Đã tạo đề phái sinh đảo câu hỏi và mã đề')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[#171c1f] dark:text-white text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">shuffle</span>
                          <span>Đảo đề làm lại</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (exam.id === 'quiz-02') {
                // ITEM 4: [CÓ KHIẾU NẠI] Quiz 02
                return (
                  <div
                    key={exam.id}
                    className="group relative rounded-xl bg-white dark:bg-[#1E1F20] shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-red-500 border border-slate-200/80 dark:border-[#282A2C]"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[28px]">gavel</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold tracking-wide text-[10px]">
                              <span className="material-symbols-outlined text-[14px]">warning</span>
                              ⚡ QUIZ TRẮC NGHIỆM • CÓ 2 KHIẾU NẠI ĐANG CHỜ
                            </span>
                            <span className="font-mono text-xs text-[#75777e] dark:text-[#8E918F] font-semibold">
                              {exam.code}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                              {exam.classTag}
                            </span>
                          </div>
                          <h3
                            onClick={() => showToast(`Xem chi tiết khiếu nại: ${exam.title}`)}
                            className="text-base text-[#171c1f] dark:text-white font-bold hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {exam.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-[#44474d] dark:text-[#8E918F] flex-wrap mt-0.5">
                            <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">info</span>
                              {exam.complaintDetail}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap xl:justify-end">
                        <button
                          type="button"
                          onClick={() => showToast('Mở giao diện giải quyết 2 khiếu nại chấm lại')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-sm transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                          <span>Xử lý khiếu nại (2)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Mở báo cáo tổng hợp chất lượng đề thi')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#171c1f] dark:text-white text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">assessment</span>
                          <span>Xem báo cáo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Mở form hiệu chỉnh đáp án & điểm')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[#171c1f] dark:text-white text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">tune</span>
                          <span>Chỉnh sửa điểm</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (exam.id === 'quiz-05-draft') {
                // ITEM 5: [BẢN NHÁP AI] Quiz 05
                return (
                  <div
                    key={exam.id}
                    className="group relative rounded-xl bg-white dark:bg-[#1E1F20] shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-purple-600 dark:border-purple-400 border border-slate-200/80 dark:border-[#282A2C]"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[26px]">smart_toy</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold tracking-wide text-[10px]">
                              ✨ AI GENERATED DRAFT • 20 CÂU TỰ ĐỘNG BÓC TÁCH
                            </span>
                            <span className="font-mono text-xs text-[#75777e] dark:text-[#8E918F] font-semibold">
                              {exam.code}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs text-[#44474d] dark:text-[#8E918F]">
                              {exam.classTag}
                            </span>
                          </div>
                          <h3
                            onClick={() => showToast(`Xem bản nháp AI: ${exam.title}`)}
                            className="text-base text-[#171c1f] dark:text-white font-bold hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
                          >
                            {exam.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-[#44474d] dark:text-[#8E918F] flex-wrap mt-0.5">
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                              <span className="material-symbols-outlined text-[16px]">psychology</span>
                              {exam.tags[0]}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-[#75777e]">{exam.draftMode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap xl:justify-end">
                        <button
                          type="button"
                          onClick={() => showToast('Mở trình duyệt thẩm định ma trận câu hỏi bóc tách AI')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#171c1f] dark:text-white text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">fact_check</span>
                          <span>Duyệt &amp; Thẩm định ma trận câu hỏi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Đã xuất bản Quiz 05 thành công vào lớp học!')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold shadow hover:bg-purple-700 active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                          <span>Xuất bản đề thi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* SECTION 5: PAGINATION & BATCH ACTIONS FOOTER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 pb-4">
            <div className="flex items-center gap-3 text-xs text-[#44474d] dark:text-[#8E918F] flex-wrap">
              <span>
                Hiển thị <strong>1 - 5</strong> trong tổng số <strong>14 bài thi</strong>
              </span>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Đang tạo báo cáo tổng hợp định dạng Excel...')}
                  className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Xuất báo cáo tổng hợp (Excel/PDF)
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => showToast('Đã chuyển 2 đề thi cũ vào kho lưu trữ')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">archive</span>
                  Lưu trữ đề thi cũ
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                disabled
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium cursor-not-allowed"
              >
                Trước
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => showToast('Đang chuyển sang trang 2')}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#171c1f] dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => showToast('Đang chuyển sang trang 3')}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#171c1f] dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => showToast('Đang chuyển sang trang tiếp theo')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#171c1f] dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

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

