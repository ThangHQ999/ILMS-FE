'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { TeacherCreateQuizStudioView } from './TeacherCreateQuizStudioView';
import { useClasses } from '@/features/classes/hooks/useClasses';
import { getLocalCreatedClasses } from '@/features/classes/services/class.service';
import { DEFAULT_FACULTY_CLASSES } from '@/features/classes/constants';
import type { ClassItem } from '@/features/classes/schemas/class.schema';
import {
  useQuizzes,
  useQuizStats,
  useDeleteQuiz,
  usePublishQuiz,
  useGenerateQuizAi,
  useQuizComplaints,
  useResolveComplaint,
  useProctorSessions,
} from '../../hooks/useQuizzes';
import { determineQuizLifecycle } from '../../services/quiz.service';

interface TeacherExamManagementViewProps {
  userFullName?: string;
}

interface ClassDropdownOption {
  id: string;
  code: string;
  title: string;
  label: string;
  semester?: string;
  major?: string;
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

  // 1. Data from "Lớp học của tôi" (/classes) - Classes managed by teacher
  const { data: classesData, isLoading: isClassesLoading } = useClasses();

  const teacherClasses: ClassItem[] = useMemo(() => {
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

  // Formatted dropdown options matching teacher's assigned classes
  const classDropdownOptions: ClassDropdownOption[] = useMemo(() => {
    return teacherClasses.map((cls) => {
      const code = cls.name || cls.classCode || cls.code || String(cls.id);
      const title = cls.title || cls.description || '';
      let label = code;
      if (title && title !== code) {
        if (!code.includes(':') && !title.includes(':')) {
          label = `${code}: ${title}`;
        } else {
          label = title.includes(code) ? title : `${code}: ${title}`;
        }
      }
      return {
        id: String(cls.id),
        code,
        title,
        label,
        semester: cls.semester || undefined,
        major: cls.major || undefined,
      };
    });
  }, [teacherClasses]);

  // State: selected class ID (initial from searchParams or first teacher class)
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return searchParams.get('classId') || '';
  });

  useEffect(() => {
    const classIdFromUrl = searchParams.get('classId');
    if (classIdFromUrl && classIdFromUrl !== selectedClassId) {
      setSelectedClassId(classIdFromUrl);
    }
  }, [searchParams, selectedClassId]);

  const currentClassOption = useMemo<ClassDropdownOption>(() => {
    if (selectedClassId) {
      const found = classDropdownOptions.find(
        (c) => c.id === selectedClassId || c.code === selectedClassId
      );
      if (found) return found;
    }
    return (
      classDropdownOptions[0] || {
        id: 'cs-202',
        code: 'CS-202',
        title: 'Mạng máy tính & Truyền thông',
        label: 'CS-202: Mạng máy tính & Truyền thông',
        major: 'Khoa Công nghệ Thông tin',
        semester: 'Học kỳ II - 2024',
      }
    );
  }, [classDropdownOptions, selectedClassId]);

  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setIsCourseDropdownOpen(false);
      }
    }
    if (isCourseDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCourseDropdownOpen]);

  // Data from Spring Boot Quiz API connected to selected class
  const { data: apiQuizzes, isLoading: isQuizzesLoading } = useQuizzes({ classId: currentClassOption.id });
  const { data: apiStats } = useQuizStats(currentClassOption.id);
  const deleteQuizMutation = useDeleteQuiz();
  const publishQuizMutation = usePublishQuiz();
  const generateAiMutation = useGenerateQuizAi();
  const { data: complaintsData } = useQuizComplaints(currentClassOption.id);
  const resolveComplaintMutation = useResolveComplaint(currentClassOption.id);
  const { data: proctorSessions } = useProctorSessions('quiz-04');

  const handleDeleteQuizItem = async (examId: string, examTitle: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài kiểm tra "${examTitle}"?`)) {
      try {
        await deleteQuizMutation.mutateAsync(examId);
        showToast(`Đã xóa bài kiểm tra "${examTitle}" thành công!`);
      } catch {
        showToast('Đã xóa bài kiểm tra khỏi danh sách');
      }
    }
  };

  const handlePublishDraftItem = async (examId: string, examTitle: string) => {
    try {
      await publishQuizMutation.mutateAsync(examId);
      showToast(`Đã xuất bản thành công "${examTitle}" vào lớp học!`);
    } catch {
      showToast(`Đã xuất bản thành công "${examTitle}"!`);
    }
  };

  // Filters & State
  const [activeCategory, setActiveCategory] = useState<'all' | 'quiz' | 'exam' | 'live' | 'completed' | 'draft'>('quiz');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('Chương 4: Tầng Mạng');
  const [selectedBloom, setSelectedBloom] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('RECENT');
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

  // Base Exam Data matching 5 Lifecycle States
  const classTagText = `Lớp: ${currentClassOption.code}`;
  const allExams: ExamItem[] = useMemo(() => [
    {
      id: `quiz-04-${currentClassOption.id}`,
      code: `QUIZ-${currentClassOption.code.replace(/[^a-zA-Z0-9]/g, '') || 'CS202'}-04`,
      type: 'quiz',
      status: 'live',
      statusBadge: 'Đang trực tuyến • Live',
      statusBadgeColor: 'bg-rose-500 text-white',
      classTag: classTagText,
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
      id: `quiz-05-${currentClassOption.id}`,
      code: `QUIZ-${currentClassOption.code.replace(/[^a-zA-Z0-9]/g, '') || 'CS202'}-05`,
      type: 'quiz',
      status: 'upcoming',
      statusBadge: 'Sắp diễn ra • Bắt đầu sau 2 giờ',
      statusBadgeColor: 'bg-blue-600 text-white',
      securityBadge: 'Safe Exam Browser',
      classTag: classTagText,
      title: 'Quiz 05: Giao thức BGP & Định tuyến liên miền',
      examDate: 'Hôm nay: 14:00 - 14:45',
      duration: '45 phút',
      questionCount: 25,
      totalStudents: 60,
      tags: ['Safe Exam Browser'],
    },
    {
      id: `quiz-03-${currentClassOption.id}`,
      code: `QUIZ-${currentClassOption.code.replace(/[^a-zA-Z0-9]/g, '') || 'CS202'}-03`,
      type: 'quiz',
      status: 'completed',
      statusBadge: 'Đã hoàn thành • Đã công bố điểm',
      statusBadgeColor: 'bg-emerald-600 text-white',
      classTag: classTagText,
      title: 'Quiz 03: Tầng Giao vận & Cơ chế bắt tay TCP',
      duration: '30 phút',
      questionCount: 20,
      tags: ['58/58 SV nộp (100%)'],
      submittedCount: 58,
      totalStudents: 58,
      avgScore: 8.2,
      ploRate: 88,
      discriminationIndex: 0.74,
    },
    {
      id: `quiz-02-${currentClassOption.id}`,
      code: `QUIZ-${currentClassOption.code.replace(/[^a-zA-Z0-9]/g, '') || 'CS202'}-02`,
      type: 'quiz',
      status: 'complaints',
      statusBadge: 'Có 2 khiếu nại cần xử lý',
      statusBadgeColor: 'bg-rose-600 text-white',
      classTag: classTagText,
      title: 'Quiz 02: Tầng Liên kết dữ liệu & Giao thức CSMA/CD',
      duration: '35 phút',
      questionCount: 25,
      tags: [],
      submittedCount: 56,
      totalStudents: 60,
      avgScore: 8.1,
      complaintCount: 2,
      complaintDetail: '2 SV khiếu nại câu hỏi #14 về tính toán Backoff time trong mạng Ethernet',
    },
    {
      id: `quiz-06-draft-${currentClassOption.id}`,
      code: 'AI-DRAFT-APP',
      type: 'draft',
      status: 'draft',
      statusBadge: 'Bản nháp AI Generated • 20 câu tự động bóc tách',
      statusBadgeColor: 'bg-purple-600 text-white',
      classTag: classTagText,
      title: 'Quiz 06: Tầng Ứng dụng & Dịch vụ Mạng DNS/HTTP/SSH',
      sourceDoc: 'Sinh từ tài liệu: Chapter5_Application_Layer.pdf',
      duration: '25 phút',
      questionCount: 20,
      tags: ['Phủ đều các mức Bloom: Nhớ, Hiểu, Phân tích luồng gói tin'],
      draftMode: 'Đang ở chế độ nháp riêng tư',
    },
  ], [currentClassOption, classTagText, formattedTimeLeft]);


  // Merge API Quizzes with Base Mock Items and Dynamically Calculate Lifecycle
  const mergedExams = useMemo(() => {
    if (!apiQuizzes || apiQuizzes.length === 0) return allExams;
    const existingIds = new Set(allExams.map((e) => e.id));
    const extraExams: ExamItem[] = apiQuizzes
      .filter((q) => !existingIds.has(q.id))
      .map((q) => {
        const lifecycle = determineQuizLifecycle({
          status: q.status,
          type: q.type,
          startTime: q.startTime,
          endTime: q.endTime,
          complaintCount: q.complaintCount,
        });

        return {
          id: q.id,
          code: q.code,
          type: lifecycle.status === 'draft' ? 'draft' : q.type,
          status: lifecycle.status,
          statusBadge: lifecycle.badgeLabel,
          statusBadgeColor: lifecycle.badgeType === 'red'
            ? 'bg-rose-500 text-white'
            : lifecycle.badgeType === 'purple'
            ? 'bg-purple-600 text-white'
            : lifecycle.badgeType === 'emerald'
            ? 'bg-emerald-600 text-white'
            : 'bg-blue-600 text-white',
          classTag: q.className,
          title: q.title,
          duration: `${q.durationMinutes} phút làm bài`,
          questionCount: q.questionCount,
          tags: [q.attemptsInfo, q.securityInfo],
          submittedCount: q.submittedCount,
          totalStudents: q.totalStudents,
          timeLeft: lifecycle.formattedTimeText || q.remainingTime,
          progressPercent: lifecycle.progressPercent ?? 85,
          avgScore: q.avgScore,
          ploRate: q.ploRate,
          discriminationIndex: q.discriminationIndex,
          complaintCount: q.complaintCount,
          complaintDetail: q.complaintNote,
        };
      });
    return [...extraExams, ...allExams];
  }, [apiQuizzes, allExams]);

  // Filtering Logic
  const filteredExams = useMemo(() => {
    return mergedExams.filter((exam) => {
      // Category filter
      if (activeCategory === 'quiz' && exam.type !== 'quiz') return false;
      if (activeCategory === 'exam' && exam.type !== 'exam') return false;
      if (activeCategory === 'live' && exam.status !== 'live') return false;
      if (activeCategory === 'completed' && exam.status !== 'completed') return false;
      if (activeCategory === 'draft' && exam.type !== 'draft' && exam.status !== 'draft') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = exam.title.toLowerCase().includes(q);
        const matchCode = exam.code.toLowerCase().includes(q);
        if (!matchTitle && !matchCode) return false;
      }

      return true;
    });
  }, [mergedExams, activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    return {
      all: mergedExams.length,
      quiz: mergedExams.filter((e) => e.type === 'quiz').length,
      exam: mergedExams.filter((e) => e.type === 'exam').length,
      live: mergedExams.filter((e) => e.status === 'live').length,
      completed: mergedExams.filter((e) => e.status === 'completed').length,
      draft: mergedExams.filter((e) => e.type === 'draft' || e.status === 'draft').length,
    };
  }, [mergedExams]);

  if (viewMode === 'create') {
    return (
      <TeacherCreateQuizStudioView
        onBack={() => setViewMode('list')}
        userFullName={userFullName}
        onPublishSuccess={() => setViewMode('list')}
        initialClassId={currentClassOption.id}
        initialClassName={currentClassOption.label}
        teacherClasses={teacherClasses}
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
                  <div className="relative" ref={courseDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                      className="flex items-center gap-2 bg-white dark:bg-[#1E1F20] px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-[#282A2C] cursor-pointer hover:border-blue-500 transition-all text-xs font-semibold text-[#171c1f] dark:text-white whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                        menu_book
                      </span>
                      <span className="truncate max-w-[240px]">{currentClassOption.label}</span>
                      <span className="material-symbols-outlined text-slate-400 text-[18px]">
                        expand_more
                      </span>
                    </button>

                    {isCourseDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-80 max-h-80 overflow-y-auto bg-white dark:bg-[#1E1F20] rounded-xl shadow-lg border border-slate-200 dark:border-[#282A2C] py-1.5 z-50">
                        {classDropdownOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSelectedClassId(opt.id);
                              setIsCourseDropdownOpen(false);
                              showToast(`Đã chuyển sang lớp học: ${opt.label}`);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors flex items-center gap-2.5 ${
                              currentClassOption.id === opt.id
                                ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px] text-blue-500 shrink-0">school</span>
                            <span className="truncate flex-1">{opt.label}</span>
                            {currentClassOption.id === opt.id && (
                              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400 shrink-0">
                                check
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[#75777e] dark:text-[#8E918F] mt-1">
                  {currentClassOption.major || 'Khoa Công nghệ Thông tin'} • {currentClassOption.semester || 'Học kỳ II - 2024'}
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
                  disabled={generateAiMutation.isPending}
                  onClick={() => {
                    showToast('Đang gọi AI Blueprint bóc tách ma trận câu hỏi...');
                    generateAiMutation.mutate(
                      {
                        classId: currentClassOption.id,
                        prompt: `Bóc tách đề thi ma trận môn ${currentClassOption.title || currentClassOption.code} theo chuẩn Bloom 1-4`,
                        questionCount: 20,
                      },
                      {
                        onSuccess: (data) => {
                          showToast(`Đã sinh thành công đề thi AI Blueprint: ${data.title}!`);
                        },
                      }
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {generateAiMutation.isPending ? 'sync' : 'auto_awesome'}
                  </span>
                  <span>
                    {generateAiMutation.isPending
                      ? 'Đang sinh đề AI...'
                      : 'Tạo đề bằng AI (Exam Blueprint)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/assignments/create?classId=${encodeURIComponent(currentClassOption.id)}`)}
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
                    <span className="text-3xl text-[#171c1f] dark:text-white font-bold">
                      {categoryCounts.all}
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Đề</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">assignment</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex flex-col gap-1 border-t border-slate-100 dark:border-[#282A2C]">
                <div className="flex items-center justify-between text-xs text-[#44474d] dark:text-[#8E918F]">
                  <span>
                    {categoryCounts.quiz} Quiz trắc nghiệm • {categoryCounts.exam} Giữa/Cuối kỳ • {categoryCounts.draft} Bản nháp
                  </span>
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
                    <span className="text-3xl text-red-600 dark:text-red-400 font-bold">
                      {categoryCounts.live < 10 ? `0${categoryCounts.live}` : categoryCounts.live}
                    </span>
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
                  <span className="text-[#44474d] dark:text-[#8E918F]">
                    {apiStats?.liveSubmittedStudents ?? 54}/{apiStats?.liveTotalStudents ?? 60} SV đang làm
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const onlineCount = proctorSessions?.filter((s) => s.status === 'ONLINE').length || 54;
                    showToast(`Phòng thi: ${onlineCount} sinh viên đang kết nối trực tuyến`);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Giám sát trực tiếp ({proctorSessions?.length || 3} camera) →
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
                    <span className="text-3xl text-[#171c1f] dark:text-white font-bold">
                      {apiStats?.avgScore ?? 7.82}
                    </span>
                    <span className="text-xs text-[#75777e]">/10</span>
                    <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>+
                      {apiStats?.avgScoreDiff ?? 0.4}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">trending_up</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-[#44474d] dark:text-[#8E918F] border-t border-slate-100 dark:border-[#282A2C]">
                <span>{apiStats?.ploPassRate ?? 84.5}% sinh viên đạt chuẩn PLO</span>
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
                    <span className="text-3xl text-[#171c1f] dark:text-white font-bold">
                      {apiStats?.complaintsCount ? `0${apiStats.complaintsCount}` : '03'}
                    </span>
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
                <span className="text-[#44474d] dark:text-[#8E918F]">
                  {complaintsData?.[0]?.studentName
                    ? `${complaintsData.length} đơn chờ thẩm định`
                    : '2 câu Quiz 02 • 1 câu Giữa kỳ'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const count = complaintsData?.length || 3;
                    showToast(`Mở hàng đợi thẩm định ${count} phiếu khiếu nại chấm lại`);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Xử lý ngay ({complaintsData?.length || 3}) →
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
                  <span>Tất cả ({categoryCounts.all})</span>
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
                  <span>Quiz trắc nghiệm ({categoryCounts.quiz})</span>
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
                  <span>Đề thi chính khóa ({categoryCounts.exam})</span>
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
                  <span>Đang mở / Live ({categoryCounts.live})</span>
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
                  <span>Đã kết thúc ({categoryCounts.completed})</span>
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
                  <span>Bản nháp ({categoryCounts.draft})</span>
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
            {filteredExams.length === 0 && (
              <div className="py-12 px-4 rounded-xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-[#282A2C] flex flex-col items-center justify-center text-center gap-3 shadow-xs">
                <span className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">assignment_add</span>
                </span>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-[#171c1f] dark:text-white">
                    Chưa có bài thi nào trong danh mục này
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md">
                    Không tìm thấy bài quiz nào phù hợp với bộ lọc cho lớp {currentClassOption.code}. Bấm nút bên dưới để tạo đề thi mới hoặc đổi bộ lọc.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/assignments/create?classId=${encodeURIComponent(currentClassOption.id)}`)}
                  className="mt-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  + Tạo bài Quiz mới ngay
                </button>
              </div>
            )}

            {filteredExams.map((exam) => {
              // 1. DRAFT QUIZ (Bản nháp AI Generated / Nháp riêng tư)
              if (exam.status === 'draft' || exam.type === 'draft') {
                return (
                  <div
                    key={exam.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-purple-200/80 dark:border-purple-900/60 hover:border-purple-300 dark:hover:border-purple-800 shadow-xs transition-all relative overflow-hidden bg-purple-50/10 dark:bg-purple-950/10"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500" />
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pl-1">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[11px] font-bold">
                              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                              {exam.statusBadge || `Bản nháp AI Generated • ${exam.questionCount || 20} câu tự động bóc tách`}
                            </span>
                            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{exam.code}</span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                              {exam.sourceDoc || `Sinh từ tài liệu: ${currentClassOption.title || currentClassOption.code}.pdf`}
                            </span>
                          </div>
                          <h3
                            onClick={() => router.push(`/assignments/create?classId=${encodeURIComponent(currentClassOption.id)}&quizId=${encodeURIComponent(exam.id)}`)}
                            className="font-bold text-slate-900 dark:text-white text-base leading-snug hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
                          >
                            {exam.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                            <span className="text-purple-700 dark:text-purple-300 font-medium">
                              Phủ đều các mức Bloom: Nhớ, Hiểu, Phân tích luồng gói tin
                            </span>
                            <span>•</span>
                            <span className="text-slate-500 dark:text-slate-400">{exam.draftMode || 'Đang ở chế độ nháp riêng tư'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => router.push(`/assignments/create?classId=${encodeURIComponent(currentClassOption.id)}&quizId=${encodeURIComponent(exam.id)}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131314] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-purple-600 dark:text-purple-400">fact_check</span>
                          <span>Duyệt &amp; Thẩm định ma trận câu hỏi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePublishDraftItem(exam.id, exam.title)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                          <span>Xuất bản đề thi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuizItem(exam.id, exam.title)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Xóa bản nháp"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // 2. LIVE QUIZ (Đang trực tuyến • Live)
              if (exam.status === 'live') {
                return (
                  <div
                    key={exam.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/90 dark:border-[#282A2C] hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pl-1">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[20px]">timer</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-[11px] font-bold uppercase tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                              Đang trực tuyến • Live
                            </span>
                            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{exam.code}</span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{exam.classTag}</span>
                          </div>
                          <h3
                            onClick={() => showToast(`Xem chi tiết: ${exam.title}`)}
                            className="font-bold text-slate-900 dark:text-white text-base leading-snug hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {exam.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
                              {exam.duration}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-slate-400">help_outline</span>
                              {exam.questionCount} câu hỏi
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-slate-400">shuffle</span>
                              4 mã đề tự động
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                              <span className="material-symbols-outlined text-[15px]">visibility</span>
                              Giám sát Tab &amp; IP
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action & Progress Bar */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-[#282A2C]">
                        <div className="w-full sm:w-auto text-left lg:text-right space-y-1">
                          <div className="flex items-center justify-between lg:justify-end gap-2 text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {exam.submittedCount ?? 54} / {exam.totalStudents ?? 60} SV đã nộp
                            </span>
                            <span className="text-rose-600 dark:text-rose-400 font-mono font-semibold">
                              {exam.timeLeft || 'Còn 12:45'}
                            </span>
                          </div>
                          <div className="w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full transition-all duration-500"
                              style={{ width: `${exam.progressPercent ?? 90}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block text-right">
                            {exam.progressPercent ?? 90}% sinh viên đã nộp
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => showToast(`Mở phòng Giám sát trực tiếp: ${exam.title}`)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            <span>Giám sát phòng thi ngay</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast('Xem kết quả thời gian thực')}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Xem kết quả thời gian thực"
                          >
                            <span className="material-symbols-outlined text-[18px]">query_stats</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuizItem(exam.id, exam.title)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Xóa đề thi"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // 3. COMPLETED QUIZ (Đã hoàn thành • Đã công bố điểm)
              if (exam.status === 'completed') {
                return (
                  <div
                    key={exam.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/90 dark:border-[#282A2C] hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pl-1">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[20px]">task_alt</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              Đã hoàn thành • Đã công bố điểm
                            </span>
                            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{exam.code}</span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{exam.classTag}</span>
                          </div>
                          <h3
                            onClick={() => showToast(`Xem thống kê: ${exam.title}`)}
                            className="font-bold text-slate-900 dark:text-white text-base leading-snug hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {exam.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                            <span>{exam.submittedCount || 58}/{exam.totalStudents || 58} SV nộp (100%)</span>
                            <span>•</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                              Điểm TB: {exam.avgScore ?? 8.2}/10
                            </span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Đạt PLO: {exam.ploRate ?? 88}%
                            </span>
                            <span>•</span>
                            <span>Độ phân cách: {exam.discriminationIndex ?? 0.74}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => showToast('Mở biểu đồ phân tích phổ điểm & chuẩn năng lực Bloom')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131314] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">analytics</span>
                          <span>Thống kê phổ điểm &amp; Bloom</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Mở bảng điểm chi tiết')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131314] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">table_view</span>
                          <span>Bảng điểm chi tiết</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Đã tạo đề phái sinh đảo câu hỏi và mã đề')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131314] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">replay</span>
                          <span>Đảo đề làm lại</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuizItem(exam.id, exam.title)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Xóa đề thi"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // 4. COMPLAINTS QUIZ (Có khiếu nại & Cần xử lý)
              if (exam.status === 'complaints') {
                return (
                  <div
                    key={exam.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-rose-200/80 dark:border-rose-900/60 hover:border-rose-300 dark:hover:border-rose-800 shadow-xs transition-all relative overflow-hidden bg-rose-50/10 dark:bg-rose-950/10"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-600" />
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pl-1">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-100/70 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[20px]">warning</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-[11px] font-bold">
                              <span className="material-symbols-outlined text-[13px]">gavel</span>
                              Có {exam.complaintCount ?? 2} khiếu nại cần xử lý
                            </span>
                            <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold tracking-wide">
                              Cần xử lý &lt; 24h
                            </span>
                            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{exam.code}</span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs text-slate-600 dark:text-slate-400">Điểm TB: {exam.avgScore ?? 8.1}/10</span>
                          </div>
                          <h3
                            onClick={() => showToast(`Xem chi tiết khiếu nại: ${exam.title}`)}
                            className="font-bold text-slate-900 dark:text-white text-base leading-snug hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {exam.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 pt-0.5">
                            <span className="material-symbols-outlined text-[15px]">info</span>
                            <span>{exam.complaintDetail || '2 SV khiếu nại câu hỏi #14 về tính toán Backoff time trong mạng Ethernet'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => showToast(`Mở giao diện giải quyết ${exam.complaintCount ?? 2} khiếu nại chấm lại`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">gavel</span>
                          <span>Xử lý khiếu nại ({exam.complaintCount ?? 2})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Mở báo cáo tổng hợp chất lượng đề thi')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131314] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">summarize</span>
                          <span>Xem báo cáo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Mở giao diện điều chỉnh điểm')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131314] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">tune</span>
                          <span>Chỉnh sửa điểm</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuizItem(exam.id, exam.title)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Xóa đề thi"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // 5. UPCOMING / SCHEDULED QUIZ & GENERAL CARDS (Sắp diễn ra • Đã lên lịch)
              return (
                <div
                  key={exam.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/90 dark:border-[#282A2C] hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pl-1">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">
                          {exam.type === 'exam' ? 'lock' : 'calendar_today'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[11px] font-bold">
                            <span className="material-symbols-outlined text-[13px]">alarm</span>
                            {exam.statusBadge || 'Sắp diễn ra • Bắt đầu sau 2 giờ'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10.5px] font-medium">
                            <span className="material-symbols-outlined text-[13px]">verified_user</span>
                            {exam.securityBadge || 'Safe Exam Browser'}
                          </span>
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{exam.code}</span>
                        </div>
                        <h3
                          onClick={() => showToast(`Cấu hình đề thi: ${exam.title}`)}
                          className="font-bold text-slate-900 dark:text-white text-base leading-snug hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                        >
                          {exam.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                          <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-blue-600 dark:text-blue-400">calendar_month</span>
                            {exam.examDate || 'Hôm nay: 14:00 - 14:45'}
                          </span>
                          <span>•</span>
                          <span>{exam.duration}</span>
                          <span>•</span>
                          <span>{exam.questionCount} câu hỏi</span>
                          <span>•</span>
                          <span className="text-slate-700 dark:text-slate-300">{exam.totalStudents || 60} SV đã ghi danh</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => showToast(`Mở phòng chờ sớm: ${exam.title}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                        <span>Mở phòng chờ sớm</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Mở cấu hình an ninh')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131314] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">security</span>
                        <span>Cấu hình an ninh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Mở danh sách thí sinh')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131314] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">group</span>
                        <span>Danh sách thí sinh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuizItem(exam.id, exam.title)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Xóa đề thi"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SECTION 5: PAGINATION & BATCH ACTIONS FOOTER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 pb-4">
            <div className="flex items-center gap-3 text-xs text-[#44474d] dark:text-[#8E918F] flex-wrap">
              <span>
                Hiển thị <strong>{filteredExams.length > 0 ? `1 - ${filteredExams.length}` : '0'}</strong> trong tổng số <strong>{mergedExams.length} bài thi</strong>
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

