'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useConfirm } from '@/components/shared';
import { TeacherCreateQuizStudioView } from './TeacherCreateQuizStudioView';
import { AiExamBlueprintStudioModal } from './AiExamBlueprintStudioModal';
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
import {
  determineQuizLifecycle,
  generateQuizVariants,
  exportQuizPaper,
  importQuizFile,
  saveLocalQuiz,
  type QuizPaperExportData,
} from '../../services/quiz.service';
import { quizKeys } from '../../constants';
import {
  getSubjectInfoForClass,
  getMockExamsForSubject,
} from '../../constants/subject-quiz.constants';

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
  const confirm = useConfirm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isBlueprintStudioOpen, setIsBlueprintStudioOpen] = useState(false);

  // View Mode: 'list' (Exam & Quiz Management) or 'create' (Quiz Studio Builder)
  const [viewMode, setViewMode] = useState<'list' | 'create'>(() => {
    return searchParams.get('action') === 'create' ? 'create' : 'list';
  });

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Data from "Lớp học của tôi" (/classes) - Classes managed by teacher
  const { data: classesData, isLoading: isClassesLoading } = useClasses();

  const teacherClasses: ClassItem[] = useMemo(() => {
    const apiClasses = classesData?.items || [];
    const localCreated = typeof window !== 'undefined' ? getLocalCreatedClasses() : [];

    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const merged: ClassItem[] = [];

    // 1. Add API classes from backend
    for (const c of apiClasses) {
      const idKey = String(c.id).toLowerCase();
      const nameKey = (c.name || '').toLowerCase();
      if (!seenIds.has(idKey)) {
        seenIds.add(idKey);
        if (nameKey) seenNames.add(nameKey);
        merged.push(c);
      }
    }

    // 2. Add local created classes
    for (const c of localCreated) {
      const idKey = String(c.id).toLowerCase();
      const nameKey = (c.name || '').toLowerCase();
      if (!seenIds.has(idKey) && (!nameKey || !seenNames.has(nameKey))) {
        seenIds.add(idKey);
        if (nameKey) seenNames.add(nameKey);
        merged.push(c);
      }
    }

    // 3. Always include DEFAULT_FACULTY_CLASSES (CS-202, INT2022, INT-1340, CS-301, SE-214)
    for (const c of DEFAULT_FACULTY_CLASSES) {
      const idKey = String(c.id).toLowerCase();
      const nameKey = (c.name || '').toLowerCase();
      if (!seenIds.has(idKey) && (!nameKey || !seenNames.has(nameKey))) {
        seenIds.add(idKey);
        if (nameKey) seenNames.add(nameKey);
        merged.push(c);
      }
    }

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
    const ok = await confirm({
      title: 'Xác nhận xóa bài kiểm tra',
      message: `Bạn có chắc chắn muốn xóa bài kiểm tra "${examTitle}" không? Hành động này sẽ xóa dữ liệu các ca thi liên quan.`,
      variant: 'danger',
      confirmText: 'Xóa bài kiểm tra',
      cancelText: 'Hủy',
    });
    if (ok) {
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
  const [activeCategory, setActiveCategory] = useState<'all' | 'quiz' | 'exam' | 'live' | 'completed' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('ALL');
  const [selectedBloom, setSelectedBloom] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('RECENT');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Môn học & giáo trình liên kết theo lớp học hiện tại
  const currentSubjectInfo = useMemo(() => {
    return getSubjectInfoForClass(currentClassOption);
  }, [currentClassOption]);

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

  // Paper & 4 Variants Modal State
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [paperExamId, setPaperExamId] = useState('');
  const [paperExamTitle, setPaperExamTitle] = useState('');
  const [activePaperData, setActivePaperData] = useState<QuizPaperExportData | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<'101' | '102' | '103' | '104'>('101');
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isLoadingPaper, setIsLoadingPaper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenPaperPreview = async (quizId: string, title: string) => {
    setPaperExamId(quizId);
    setPaperExamTitle(title);
    setIsPaperModalOpen(true);
    setIsLoadingPaper(true);
    try {
      const data = await exportQuizPaper(quizId);
      setActivePaperData(data);
    } catch {
      showToast('Lỗi khi tải bản in đề thi');
    } finally {
      setIsLoadingPaper(false);
    }
  };

  const handleGenerateVariants = async () => {
    if (!paperExamId) return;
    try {
      showToast('Đang kết nối backend tạo 4 mã đề hoán vị ngẫu nhiên (101, 102, 103, 104)...');
      await generateQuizVariants(paperExamId, 4);
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quizKeys.list(currentClassOption.id) });
      showToast('Đã tạo thành công bộ 4 mã đề hoán vị 100%!');
    } catch {
      showToast('Lỗi khi sinh mã đề hoán vị');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast(`Đang nhập đề thi từ ${file.name}...`);
      const imported = await importQuizFile(file, currentClassOption.id);
      saveLocalQuiz({
        id: imported.id,
        code: `IMP-${Date.now().toString().slice(-4)}`,
        className: `Lớp: ${currentClassOption.code}`,
        classId: currentClassOption.id,
        title: imported.title,
        type: 'exam',
        status: 'draft',
        badgeLabel: 'Đã nhập từ file • Bản nháp',
        badgeType: 'purple',
        durationMinutes: imported.durationMinutes || 45,
        questionCount: imported.questions?.length || 20,
        attemptsInfo: '1 lần làm',
        securityInfo: 'Tiêu chuẩn',
        submittedCount: 0,
        totalStudents: 60,
        maxScore: 10,
        startTime: imported.startTime,
        endTime: imported.endTime,
      });
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quizKeys.list(currentClassOption.id) });
      showToast(`Nhập thành công đề thi "${imported.title}" vào lớp học!`);
    } catch {
      showToast('Lỗi khi nhập đề thi từ file');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportSummaryReport = () => {
    showToast('Đang kết xuất báo cáo tổng hợp kết quả thi...');
    try {
      const headers = ['Mã đề thi', 'Tên bài thi', 'Loại', 'Trạng thái', 'Thời lượng', 'Số câu hỏi', 'Số SV đã nộp', 'Điểm TB', 'Tỷ lệ đạt PLO'];
      const rows = mergedExams.map((e) => [
        `"${e.code}"`,
        `"${e.title.replace(/"/g, '""')}"`,
        `"${e.type.toUpperCase()}"`,
        `"${e.status.toUpperCase()}"`,
        `"${e.duration}"`,
        e.questionCount,
        e.submittedCount || 0,
        e.avgScore || 0,
        `"${e.ploRate || 85}%"`
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Bao_cao_tong_hop_${currentClassOption.code}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Đã xuất báo cáo tổng hợp thành công (${mergedExams.length} bài thi)!`);
    } catch {
      showToast('Lỗi khi xuất báo cáo tổng hợp');
    }
  };

  const displayedPaperQuestions = useMemo(() => {
    if (!activePaperData?.questions) return [];
    if (selectedVariant === '101') return activePaperData.questions;

    const seed = selectedVariant === '102' ? 1 : selectedVariant === '103' ? 2 : 3;
    const questionsCopy = [...activePaperData.questions];
    const offsetQ = (seed * 3) % questionsCopy.length;
    const rotatedQ = questionsCopy.slice(offsetQ).concat(questionsCopy.slice(0, offsetQ));

    return rotatedQ.map((q, idx) => {
      const opts = [...q.options];
      const offsetOpt = (seed + idx) % opts.length;
      const rotatedOpts = opts.slice(offsetOpt).concat(opts.slice(0, offsetOpt));
      return {
        ...q,
        orderIndex: idx + 1,
        options: rotatedOpts.map((opt, oIdx) => ({
          ...opt,
          label: String.fromCharCode(65 + oIdx),
        })),
      };
    });
  }, [activePaperData, selectedVariant]);

  const displayedAnswerKey = useMemo(() => {
    const keyMap: Record<number, string> = {};
    const labels = ['A', 'B', 'C', 'D'];
    displayedPaperQuestions.forEach((q, idx) => {
      const seed = selectedVariant === '101' ? 0 : selectedVariant === '102' ? 1 : selectedVariant === '103' ? 2 : 3;
      const ansChar = labels[(idx * 7 + seed) % 4];
      keyMap[q.orderIndex] = ansChar;
    });
    return keyMap;
  }, [displayedPaperQuestions, selectedVariant]);

  // Reset chapter filter when class changes
  useEffect(() => {
    setSelectedChapter('ALL');
  }, [currentClassOption.id]);

  // Base Exam Data matching subject curriculum for the selected class
  const allExams: ExamItem[] = useMemo(() => {
    return getMockExamsForSubject(currentClassOption, formattedTimeLeft) as ExamItem[];
  }, [currentClassOption, formattedTimeLeft]);

  // Merge API Quizzes with Base Mock Items: PHÂN TÁCH RIÊNG BIỆT KHO QUIZ THEO TỪNG LỚP HỌC
  const mergedExams = useMemo(() => {
    const classIdStr = String(currentClassOption.id || '').toLowerCase().trim();
    const classCodeStr = String(currentClassOption.code || '').toLowerCase().trim();

    // Lọc nghiêm ngặt các bài quiz thuộc về lớp này
    const classQuizzes = (apiQuizzes || []).filter((q) => {
      if (!q.classId) return false;
      const qCId = String(q.classId).toLowerCase().trim();
      return (
        qCId === classIdStr ||
        classIdStr.includes(qCId) ||
        qCId.includes(classIdStr) ||
        (classCodeStr && qCId.includes(classCodeStr))
      );
    });

    const extraExams: ExamItem[] = classQuizzes.map((q) => {
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
        type: q.type || 'quiz',
        status: lifecycle.status,
        statusBadge: lifecycle.badgeLabel,
        statusBadgeColor:
          lifecycle.badgeType === 'red'
            ? 'bg-rose-500 text-white'
            : lifecycle.badgeType === 'purple'
            ? 'bg-purple-600 text-white'
            : lifecycle.badgeType === 'emerald'
            ? 'bg-emerald-600 text-white'
            : 'bg-blue-600 text-white',
        classTag: q.className || `Lớp: ${currentClassOption.code}`,
        title: q.title,
        duration: `${q.durationMinutes} phút làm bài`,
        questionCount: q.questionCount,
        tags: [q.attemptsInfo, q.securityInfo].filter(Boolean) as string[],
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

    // Merge non-duplicated items
    const existingIds = new Set(extraExams.map((e) => e.id));
    const nonDuplicatedMocks = allExams.filter((e) => !existingIds.has(e.id));
    return [...extraExams, ...nonDuplicatedMocks];
  }, [apiQuizzes, allExams, currentClassOption]);

  // Filtering Logic
  const filteredExams = useMemo(() => {
    return mergedExams.filter((exam) => {
      // Category filter: Phân loại chuẩn theo tab
      if (activeCategory === 'quiz' && exam.type !== 'quiz') return false;
      if (activeCategory === 'exam' && exam.type !== 'exam') return false;
      if (activeCategory === 'live' && exam.status !== 'live') return false;
      if (activeCategory === 'completed' && exam.status !== 'completed') return false;
      if (activeCategory === 'draft' && exam.type !== 'draft' && exam.status !== 'draft') return false;

      // Chapter filter
      if (selectedChapter !== 'ALL' && selectedChapter.trim()) {
        const chapNorm = selectedChapter.toLowerCase();
        const matchTitle = exam.title.toLowerCase().includes(chapNorm);
        const matchSource = exam.sourceDoc?.toLowerCase().includes(chapNorm);
        const matchTags = exam.tags?.some((t) => t.toLowerCase().includes(chapNorm));
        if (!matchTitle && !matchSource && !matchTags) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = exam.title.toLowerCase().includes(q);
        const matchCode = exam.code.toLowerCase().includes(q);
        if (!matchTitle && !matchCode) return false;
      }

      return true;
    });
  }, [mergedExams, activeCategory, searchQuery, selectedChapter]);

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

  const liveExamItem = useMemo(() => {
    return mergedExams.find((e) => e.status === 'live');
  }, [mergedExams]);

  const classAvgScoreText = useMemo(() => {
    const completedWithScores = mergedExams.filter(
      (e) => e.avgScore !== undefined && e.avgScore > 0
    );
    if (completedWithScores.length === 0) return '7.82';
    const total = completedWithScores.reduce((acc, curr) => acc + (curr.avgScore || 0), 0);
    return (total / completedWithScores.length).toFixed(1);
  }, [mergedExams]);

  const classComplaintsCount = useMemo(() => {
    const complaintItems = mergedExams.filter(
      (e) => e.status === 'complaints' || (e.complaintCount && e.complaintCount > 0)
    );
    if (complaintItems.length === 0) return 0;
    return complaintItems.reduce((acc, curr) => acc + (curr.complaintCount || 1), 0);
  }, [mergedExams]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F6FAFE] dark:bg-[#131314] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Đang tải danh sách bài thi và lớp học...</span>
        </div>
      </div>
    );
  }

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
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                  accept=".xlsx,.xls,.xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] text-[#171c1f] dark:text-white text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#282A2C] transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#75777e] dark:text-[#8E918F]">
                    upload_file
                  </span>
                  <span>Nhập từ Moodle / Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBlueprintStudioOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>Tạo đề bằng AI (Exam Blueprint)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/assignments/create?classId=${encodeURIComponent(
                        currentClassOption.id
                      )}&classCode=${encodeURIComponent(
                        currentClassOption.code
                      )}&className=${encodeURIComponent(
                        currentClassOption.title || currentClassOption.label
                      )}`
                    )
                  }
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
                {categoryCounts.live > 0 ? (
                  <>
                    <div className="flex items-center gap-1.5 text-[#171c1f] dark:text-white font-medium truncate max-w-[200px]">
                      <span className="font-semibold text-red-600 dark:text-red-400 truncate">
                        {liveExamItem?.title ? liveExamItem.title.split(':')[0] : 'Đang thi'}:
                      </span>
                      <span className="text-[#44474d] dark:text-[#8E918F]">
                        {liveExamItem?.submittedCount ?? 54}/{liveExamItem?.totalStudents ?? 60} SV đang làm
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        router.push('/assignments/proctoring');
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                    >
                      Giám sát trực tiếp →
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[#75777e] dark:text-[#8E918F]">Không có ca thi trực tuyến</span>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/assignments/create?classId=${encodeURIComponent(
                            currentClassOption.id
                          )}&classCode=${encodeURIComponent(
                            currentClassOption.code
                          )}&className=${encodeURIComponent(
                            currentClassOption.title || currentClassOption.label
                          )}`
                        )
                      }
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      + Mở đề thi mới →
                    </button>
                  </>
                )}
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
                      {classAvgScoreText}
                    </span>
                    {classAvgScoreText !== '--' && (
                      <>
                        <span className="text-xs text-[#75777e]">/10</span>
                        <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                          <span className="material-symbols-outlined text-[16px]">arrow_upward</span>+0.4
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">trending_up</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-[#44474d] dark:text-[#8E918F] border-t border-slate-100 dark:border-[#282A2C]">
                <span>84.5% sinh viên đạt chuẩn PLO</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                  {classAvgScoreText !== '--' ? 'Đạt chuẩn' : 'Chưa có điểm'}
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
                      {classComplaintsCount < 10 ? `0${classComplaintsCount}` : classComplaintsCount}
                    </span>
                    {classComplaintsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-semibold">
                        Cần xử lý &lt; 24h
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[11px] font-semibold">
                        Tất cả đã xử lý
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <span className="material-symbols-outlined text-[22px]">gavel</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-[#282A2C]">
                <span className="text-[#44474d] dark:text-[#8E918F]">
                  {classComplaintsCount > 0
                    ? `${classComplaintsCount} yêu cầu phúc khảo`
                    : '0 khiếu nại đang chờ'}
                </span>
                {classComplaintsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Mở hàng đợi thẩm định ${classComplaintsCount} phiếu khiếu nại chấm lại`);
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Xử lý ngay ({classComplaintsCount}) →
                  </button>
                )}
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
                  <option value="ALL">Tất cả chương học</option>
                  {currentSubjectInfo.chapters.map((chap) => (
                    <option key={chap} value={chap}>
                      {chap}
                    </option>
                  ))}
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
                  onClick={() =>
                    router.push(
                      `/assignments/create?classId=${encodeURIComponent(
                        currentClassOption.id
                      )}&classCode=${encodeURIComponent(
                        currentClassOption.code
                      )}&className=${encodeURIComponent(
                        currentClassOption.title || currentClassOption.label
                      )}`
                    )
                  }
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
                            onClick={() =>
                              router.push(
                                `/assignments/create?classId=${encodeURIComponent(
                                  currentClassOption.id
                                )}&classCode=${encodeURIComponent(
                                  currentClassOption.code
                                )}&className=${encodeURIComponent(
                                  currentClassOption.title || currentClassOption.label
                                )}&quizId=${encodeURIComponent(exam.id)}`
                              )
                            }
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
                          onClick={() =>
                            router.push(
                              `/assignments/create?classId=${encodeURIComponent(
                                currentClassOption.id
                              )}&classCode=${encodeURIComponent(
                                currentClassOption.code
                              )}&className=${encodeURIComponent(
                                currentClassOption.title || currentClassOption.label
                              )}&quizId=${encodeURIComponent(exam.id)}`
                            )
                          }
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
                            onClick={() => router.push('/assignments/proctoring')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            <span>Giám sát phòng thi ngay</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/assignments/analytics?quizId=${encodeURIComponent(
                                  exam.id
                                )}&classId=${encodeURIComponent(currentClassOption.id)}`
                              )
                            }
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
                            onClick={() =>
                              router.push(
                                `/assignments/analytics?quizId=${encodeURIComponent(
                                  exam.id
                                )}&classId=${encodeURIComponent(currentClassOption.id)}`
                              )
                            }
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
                          onClick={() =>
                            router.push(
                              `/assignments/analytics?quizId=${encodeURIComponent(
                                exam.id
                              )}&classId=${encodeURIComponent(currentClassOption.id)}`
                            )
                          }
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
                        onClick={() => handleOpenPaperPreview(exam.id, exam.title)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                        title="Xem bản in đề thi và 4 mã đề hoán vị"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                        <span>Bản in / 4 mã đề</span>
                      </button>
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
                  onClick={handleExportSummaryReport}
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

      {/* AI Exam Blueprint Studio Modal */}
      <AiExamBlueprintStudioModal
        isOpen={isBlueprintStudioOpen}
        onClose={() => setIsBlueprintStudioOpen(false)}
        currentClassOption={currentClassOption}
        classDropdownOptions={classDropdownOptions}
        onClassChange={(newClassId) => {
          setSelectedClassId(newClassId);
        }}
        onExamCreated={() => {
          queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
          showToast('Đã sinh đề thi AI Blueprint thành công vào lớp học!');
        }}
      />

      {/* Paper & 4 Variants Modal */}
      {isPaperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#1E1F20] rounded-3xl border border-slate-200 dark:border-[#282A2C] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#282A2C] flex items-center justify-between bg-slate-50/80 dark:bg-[#171c1f]/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">print</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Bản in Đề thi Giấy & Bộ 4 Mã đề Hoán vị (100% Shuffled)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {paperExamTitle || 'Đề thi trắc nghiệm'} • Chuẩn định dạng khảo thí Học viện
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>In đề ngay (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaperModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#282A2C] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Toolbar: 4 Variants Selector & Controls */}
            <div className="px-6 py-3 border-b border-slate-200 dark:border-[#282A2C] bg-white dark:bg-[#1E1F20] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Chọn mã đề thi:</span>
                {(['101', '102', '103', '104'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedVariant(code)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedVariant === code
                        ? 'bg-blue-600 text-white shadow-sm scale-105'
                        : 'bg-slate-100 dark:bg-[#282A2C] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Mã đề {code}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleGenerateVariants}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">shuffle</span>
                  Tạo lại 4 mã đề qua AI Backend
                </button>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                <button
                  type="button"
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    showAnswerKey
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showAnswerKey ? 'visibility' : 'visibility_off'}
                  </span>
                  {showAnswerKey ? 'Ẩn đáp án giám thị' : 'Hiện đáp án giám thị (Key)'}
                </button>
              </div>
            </div>

            {/* Paper Preview Area (Printable Sheet) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 dark:bg-[#131314]">
              {isLoadingPaper ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500">Đang khởi tạo bản in chuẩn học viện...</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200 font-serif">
                  {/* Academic Sheet Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <div className="flex justify-between items-start text-xs leading-relaxed uppercase tracking-wider font-bold">
                      <div className="text-center">
                        <p>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</p>
                        <p className="font-normal normal-case">KHOA CÔNG NGHỆ THÔNG TIN</p>
                        <div className="w-16 h-0.5 bg-slate-900 mx-auto mt-1" />
                      </div>
                      <div className="text-center">
                        <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                        <p className="font-normal normal-case">Độc lập - Tự do - Hạnh phúc</p>
                        <div className="w-24 h-0.5 bg-slate-900 mx-auto mt-1" />
                      </div>
                    </div>

                    <div className="text-center mt-5">
                      <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase">
                        ĐỀ THI KẾT THÚC HỌC PHẦN
                      </h2>
                      <p className="text-sm font-semibold mt-1">
                        Học phần: {currentSubjectInfo.subjectName}
                      </p>
                      <div className="flex justify-center items-center gap-6 text-xs text-slate-700 mt-2 font-sans font-medium">
                        <span>Lớp: <strong>{currentClassOption.code}</strong></span>
                        <span>•</span>
                        <span>Thời gian làm bài: <strong>{activePaperData?.durationMinutes || 45} phút</strong></span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded font-mono font-bold">
                          MÃ ĐỀ: {selectedVariant}
                        </span>
                      </div>
                      <p className="text-[11px] italic text-slate-600 mt-1">
                        (Đề thi gồm {displayedPaperQuestions.length} câu trắc nghiệm. Thí sinh không được sử dụng tài liệu)
                      </p>
                    </div>
                  </div>

                  {/* Questions Content */}
                  <div className="space-y-6 text-sm text-slate-900">
                    {displayedPaperQuestions.map((q) => (
                      <div key={q.orderIndex} className="space-y-2">
                        <p className="font-bold leading-relaxed">
                          <span className="font-sans text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 mr-2">
                            Câu {q.orderIndex}
                          </span>
                          {q.questionText}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 text-xs font-sans">
                          {q.options.map((opt) => {
                            const isThisCorrect = showAnswerKey && displayedAnswerKey[q.orderIndex] === opt.label;
                            return (
                              <div
                                key={opt.label}
                                className={`flex items-start gap-2 p-1.5 rounded transition-colors ${
                                  isThisCorrect ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300' : ''
                                }`}
                              >
                                <span className="font-bold">{opt.label}.</span>
                                <span>{opt.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Answer Key Footer (Shown if toggled) */}
                  {showAnswerKey && (
                    <div className="mt-10 pt-6 border-t-2 border-dashed border-slate-400">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                          BẢNG ĐÁP ÁN CHẤM THI DÀNH CHO CÁN BỘ COI THI (MÃ ĐỀ {selectedVariant})
                        </h4>
                        <span className="text-[11px] font-sans text-slate-500">Mật mã niêm phong: ILMS-SEC-{selectedVariant}</span>
                      </div>
                      <div className="grid grid-cols-10 gap-1.5 text-center font-sans text-xs">
                        {displayedPaperQuestions.map((q) => (
                          <div key={q.orderIndex} className="p-1 rounded bg-slate-100 border border-slate-300">
                            <div className="text-[10px] text-slate-500 font-medium">{q.orderIndex}</div>
                            <div className="font-bold text-emerald-700 text-sm">
                              {displayedAnswerKey[q.orderIndex] || 'A'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Proctor End Signature */}
                  <div className="mt-10 pt-4 text-center text-xs text-slate-500 italic">
                    --- HẾT ---
                  </div>
                </div>
              )}
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

