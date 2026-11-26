'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { ClassworkType } from './CreateClassworkPageView';
import type {
  GradebookStudent,
  GradebookAiAnalysis,
  ClassMember,
  ClassCourse,
} from '../../schemas/class-detail.schema';
import { ClassGradebookTab } from './ClassGradebookTab';
import {
  useClassAssignmentsWithSubmissions,
  useAssignmentSubmissions,
  useGradeSubmission,
  useSubmitAssignment,
  useAllClassExams,
  getQuizzes,
  isAssignmentUnsubmitted,
  isAssignmentPendingGrading,
  isAssignmentGraded,
  formatTeacherDueDate,
  formatSubmissionTime,
  type TeacherSubmissionItem,
  type EnrichedAssignment,
} from '@/features/assignments';

interface ClassAssignmentsTabProps {
  classId?: string;
  courses?: ClassCourse[];
  members?: ClassMember[];
  currentRole: 'student' | 'teacher' | 'owner';
  onToast: (msg: string) => void;
  gradebookStudents?: GradebookStudent[];
  gradebookAi?: GradebookAiAnalysis;
  onSendAiSuggestion?: () => void;
  onInterveneClick?: (student: GradebookStudent) => void;
  initialSubTab?: 'assignments' | 'gradebook';
}

export function ClassAssignmentsTab({
  classId = '',
  courses = [],
  members = [],
  currentRole,
  onToast,
  gradebookStudents = [],
  gradebookAi = {
    averageScore: 8.4,
    ploPassRate: 88,
    ploPassedCount: 42,
    totalStudents: 48,
    gradingProgress: '48/48',
    gradingPercent: 100,
    earlyInterventionCount: 3,
    distribution: {
      gradeA: { percent: 28, count: 12 },
      gradeB: { percent: 45, count: 19 },
      gradeC: { percent: 20, count: 8 },
      gradeDF: { percent: 7, count: 3 },
    },
    recommendedTopic: 'Cây phân đoạn & Dijkstra',
    recommendedDescription: 'Phổ điểm lớp tập trung ở dải Giỏi/Khá.',
  },
  onSendAiSuggestion = () => {},
  onInterveneClick = () => {},
  initialSubTab = 'assignments',
}: ClassAssignmentsTabProps) {
  const router = useRouter();
  const [subView, setSubView] = useState<'assignments' | 'gradebook'>(initialSubTab);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'submitted' | 'graded'>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitTargetAssignment, setSubmitTargetAssignment] = useState<EnrichedAssignment | null>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  const openCreatePage = (type: ClassworkType) => {
    setIsCreateMenuOpen(false);
    router.push(`/classes/${classId}/assignments/new?type=${type}`);
  };

  // 1. Fetch real assignments, quizzes & exams from API
  const {
    assignments = [],
    kpi,
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments,
  } = useClassAssignmentsWithSubmissions(classId);

  const { data: classExams = [], refetch: refetchExams } = useAllClassExams(classId);
  const { data: classQuizzes = [], refetch: refetchQuizzes } = useQuery({
    queryKey: ['class-quizzes', classId],
    queryFn: () => getQuizzes({ classId }),
    enabled: Boolean(classId),
    staleTime: 60_000,
  });

  // Filter assignments according to filterStatus
  const filteredAssignments = useMemo(() => {
    if (filterStatus === 'open') return assignments.filter(isAssignmentUnsubmitted);
    if (filterStatus === 'submitted') return assignments.filter(isAssignmentPendingGrading);
    if (filterStatus === 'graded') return assignments.filter(isAssignmentGraded);
    return assignments;
  }, [assignments, filterStatus]);

  // Selected assignment for teacher grading view
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const activeAssignment = useMemo(() => {
    if (selectedAssignmentId) {
      return (
        assignments.find((a: EnrichedAssignment) => a.id === selectedAssignmentId) ||
        assignments[0] ||
        null
      );
    }
    return assignments[0] || null;
  }, [assignments, selectedAssignmentId]);

  // 2. Fetch real submissions for the active assignment (teacher)
  const isTeacher = currentRole === 'teacher' || currentRole === 'owner';
  const { data: submissionsData, isLoading: isLoadingSubmissions } = useAssignmentSubmissions(
    activeAssignment?.id || '',
    {
      classId,
      enabled: isTeacher && Boolean(activeAssignment?.id),
      size: 50,
    }
  );
  const submissions: TeacherSubmissionItem[] = submissionsData?.items ?? [];

  // Mutations
  const gradeMutation = useGradeSubmission(activeAssignment?.id, classId);
  const submitAssignmentMutation = useSubmitAssignment(
    submitTargetAssignment?.id || '',
    classId
  );

  // Teacher grading input score state
  const [studentGrades, setStudentGrades] = useState<{ [key: string]: string }>({});

  const handleGradeChange = (submissionId: string, val: string) => {
    setStudentGrades((prev) => ({ ...prev, [submissionId]: val }));
  };

  const handleSaveGrade = async (studentName: string, submissionId: string) => {
    const scoreStr = studentGrades[submissionId];
    if (scoreStr === undefined || scoreStr.trim() === '') {
      onToast(`Vui lòng nhập điểm số cho sinh viên ${studentName}!`);
      return;
    }
    const numScore = parseFloat(scoreStr);
    const max = activeAssignment?.studentMaxScore || 10;
    if (isNaN(numScore) || numScore < 0 || numScore > max) {
      onToast(`Điểm số không hợp lệ (từ 0 đến ${max})!`);
      return;
    }

    try {
      await gradeMutation.mutateAsync({
        submissionId,
        payload: { score: numScore },
      });
      onToast(`Đã lưu điểm ${numScore}/${max} cho sinh viên ${studentName}!`);
    } catch {
      onToast('Không thể lưu điểm lúc này. Vui lòng thử lại.');
    }
  };

  const handleSubmitAssignmentSubmit = async () => {
    if (!submitTargetAssignment) return;
    if (!submitContent.trim()) {
      onToast('Vui lòng nhập nội dung hoặc link bài nộp!');
      return;
    }

    try {
      await submitAssignmentMutation.mutateAsync({
        content: submitContent.trim(),
      });
      setIsSubmitModalOpen(false);
      setSubmitContent('');
      setSubmitTargetAssignment(null);
      onToast(`Đã nộp bài tập "${submitTargetAssignment.title}" thành công!`);
      void refetchAssignments();
    } catch {
      onToast('Không thể nộp bài tập lúc này.');
    }
  };

  // Student members list
  const studentMembers = useMemo(
    () => members.filter((m) => m.role === 'STUDENT'),
    [members]
  );
  const totalClassStudents =
    studentMembers.length > 0
      ? studentMembers.length
      : activeAssignment?.totalStudents || submissions.length || 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. SUB-VIEW SWITCHER: BÀI TẬP & LAB vs BẢNG ĐIỂM & PLO */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] overflow-x-auto flex-nowrap max-w-full [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
          <button
            type="button"
            onClick={() => setSubView('assignments')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border-none shrink-0 whitespace-nowrap ${
              subView === 'assignments'
                ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-[#E3E3E3]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">assignment</span>
            <span>Danh sách Bài tập &amp; Lab</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                subView === 'assignments'
                  ? 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5]'
                  : 'bg-black/5 dark:bg-white/10 text-gray-600 dark:text-[#C4C7C5]'
              }`}
            >
              {kpi?.total ?? assignments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('gradebook')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border-none shrink-0 whitespace-nowrap ${
              subView === 'gradebook'
                ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-[#E3E3E3]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">fact_check</span>
            <span>Bảng điểm &amp; Ma trận PLO</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                subView === 'gradebook'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-black/5 dark:bg-white/10 text-gray-600 dark:text-[#C4C7C5]'
              }`}
            >
              ABET
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/assignments"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] text-xs font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none"
            title="Mở toàn màn hình Ma trận Phân bổ Đề thi & Bài tập Lớp - Môn (N : N)"
          >
            <span className="material-symbols-outlined text-[17px]">table_chart</span>
            <span>Ma trận Lớp - Môn (N:N)</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </Link>
          <div className="text-xs text-gray-500 dark:text-[#8E918F] hidden lg:flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Đánh giá Chuẩn đầu ra tự động</span>
          </div>
        </div>
      </div>

      {/* 2. SUB-VIEW: GRADEBOOK & PLO MATRIX */}
      {subView === 'gradebook' ? (
        <ClassGradebookTab
          students={gradebookStudents}
          aiAnalysis={gradebookAi}
          onSendAiSuggestion={onSendAiSuggestion}
          onInterveneClick={onInterveneClick}
          onToast={onToast}
          classId={classId}
          courses={courses}
        />
      ) : (
        /* 3. SUB-VIEW: ASSIGNMENTS & LAB WORKSPACE */
        <div className="flex flex-col gap-6">
          {/* Top Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] mr-2">
                Danh sách Bài tập &amp; Lab
              </h2>
              <div className="flex items-center gap-1 bg-[#E1E5EA] dark:bg-[#282A2C] p-1 rounded-full">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${
                    filterStatus === 'all'
                      ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                      : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900'
                  }`}
                >
                  Tất cả ({kpi?.total ?? assignments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('open')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${
                    filterStatus === 'open'
                      ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                      : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900'
                  }`}
                >
                  Đang mở ({kpi?.unsubmitted ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('submitted')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${
                    filterStatus === 'submitted'
                      ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                      : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900'
                  }`}
                >
                  Đã nộp ({kpi?.pendingGrading ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('graded')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${
                    filterStatus === 'graded'
                      ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                      : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900'
                  }`}
                >
                  Đã chấm điểm ({kpi?.graded ?? 0})
                </button>
              </div>
            </div>

            {/* Right actions */}
            {isTeacher && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToast('Đang tạo và xuất bảng điểm CSV tổng hợp...')}
                  className="px-4 py-2 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  <span>Xuất bảng điểm CSV</span>
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCreateMenuOpen((prev) => !prev)}
                    className="px-5 py-2 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span>Tạo</span>
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>

                  {isCreateMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsCreateMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#1E1F20] shadow-xl py-2 z-40 border border-black/5 dark:border-white/5 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => openCreatePage('ASSIGNMENT')}
                          className="w-full px-4 py-2.5 text-left hover:bg-[#F0F4F8] dark:hover:bg-[#282A2C] flex items-center gap-3 border-none bg-transparent cursor-pointer"
                        >
                          <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-[#162B4D] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px]">assignment</span>
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                              Bài tập tự luận / Nộp tệp
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                              Giao đề, hạn nộp và chấm điểm
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => openCreatePage('QUIZ')}
                          className="w-full px-4 py-2.5 text-left hover:bg-[#F0F4F8] dark:hover:bg-[#282A2C] flex items-center gap-3 border-none bg-transparent cursor-pointer"
                        >
                          <span className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px]">quiz</span>
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                              Bài tập Trắc nghiệm (Quiz)
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                              Thiết kế bộ câu hỏi &amp; tự chấm
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => openCreatePage('EXAM')}
                          className="w-full px-4 py-2.5 text-left hover:bg-[#F0F4F8] dark:hover:bg-[#282A2C] flex items-center gap-3 border-none bg-transparent cursor-pointer"
                        >
                          <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px]">school</span>
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                              Bài kiểm tra / Đề thi
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                              Giới hạn giờ thi &amp; công bố điểm
                            </div>
                          </div>
                        </button>

                        <div className="my-1 border-t border-black/5 dark:border-white/5" />

                        <button
                          type="button"
                          onClick={() => openCreatePage('NOTICE')}
                          className="w-full px-4 py-2.5 text-left hover:bg-[#F0F4F8] dark:hover:bg-[#282A2C] flex items-center gap-3 border-none bg-transparent cursor-pointer"
                        >
                          <span className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px]">campaign</span>
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                              Lời nhắn / Nhắc nhở
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                              Thông báo nhanh, không chấm điểm
                            </div>
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {isLoadingAssignments && (
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none animate-pulse flex flex-col gap-3"
                >
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoadingAssignments && assignments.length === 0 && classQuizzes.length === 0 && classExams.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1E1F20] rounded-3xl shadow-sm dark:shadow-none">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px]">assignment</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-[#E3E3E3]">
                Chưa có bài tập hoặc Lab nào
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8E918F] max-w-sm">
                {currentRole === 'student'
                  ? 'Hiện tại lớp học chưa có bài tập nào được giao. Hãy quay lại sau khi giảng viên thông báo.'
                  : 'Lớp học chưa có bài tập nào. Bấm nút bên dưới để tạo lời nhắn, bài tập, Quiz hoặc bài kiểm tra.'}
              </p>
              {isTeacher && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => openCreatePage('ASSIGNMENT')}
                    className="px-4 py-2 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-none transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">assignment</span>
                    <span>Tạo bài tập</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openCreatePage('QUIZ')}
                    className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-none transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">quiz</span>
                    <span>Tạo Quiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openCreatePage('EXAM')}
                    className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-none transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">school</span>
                    <span>Tạo Bài kiểm tra</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* [STUDENT VIEW] Assignments Cards */}
          {!isLoadingAssignments && currentRole === 'student' && assignments.length > 0 && (
            <div className="flex flex-col gap-4">
              {filteredAssignments.map((a: EnrichedAssignment) => {
                const isGraded = a.effectiveStatus === 'GRADED';
                const isSubmitted =
                  a.effectiveStatus === 'SUBMITTED' ||
                  a.effectiveStatus === 'RESUBMITTED' ||
                  a.effectiveStatus === 'LATE';

                return (
                  <div
                    key={a.id}
                    className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          isGraded
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                            : isSubmitted
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[28px]">
                          {isGraded ? 'task_alt' : isSubmitted ? 'outgoing_mail' : 'assignment_late'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-3 py-0.5 rounded-full text-[11px] uppercase font-bold ${
                              isGraded
                                ? 'bg-emerald-600 text-white'
                                : isSubmitted
                                ? 'bg-blue-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {isGraded ? 'Đã hoàn thành' : isSubmitted ? 'Đã nộp (Chờ chấm)' : 'Chưa nộp'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-[#8E918F] font-semibold">
                            {a.typeLabel || 'Bài tập'} • Tối đa {a.studentMaxScore || 10} điểm
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] mt-1">
                          {a.title}
                        </h3>
                        {a.description && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-[#C4C7C5] mt-1 leading-relaxed">
                            {a.description}
                          </p>
                        )}
                        {isGraded && a.submission?.feedback && (
                          <div className="mt-3 p-3 rounded-xl bg-[#F0F4F8] dark:bg-[#131314] text-xs text-gray-700 dark:text-[#C4C7C5] italic">
                            &ldquo;{a.submission.feedback}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                      {isGraded ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            {a.effectiveScore}
                          </span>
                          <span className="text-base font-semibold text-gray-400 dark:text-[#8E918F]">
                            / {a.studentMaxScore || 10}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-[#8E918F]">
                          Hạn chót: <strong className="text-gray-900 dark:text-[#E3E3E3]">{a.dueDate ? formatTeacherDueDate(a.dueDate) : 'Không có hạn'}</strong>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSubmitTargetAssignment(a);
                          setIsSubmitModalOpen(true);
                        }}
                        className={`w-full md:w-auto px-6 py-2.5 rounded-full font-semibold text-xs transition-all cursor-pointer border-none shadow-xs ${
                          isGraded
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95'
                        }`}
                      >
                        {isGraded ? 'Xem lại bài nộp' : isSubmitted ? 'Nộp lại bài tập' : 'Nộp bài tập'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* [TEACHER VIEW] Grading Center Table */}
          {!isLoadingAssignments && isTeacher && assignments.length > 0 && activeAssignment && (
            <div className="flex flex-col gap-5">
              {/* Assignment Switcher Pills if multiple */}
              {assignments.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-[#8E918F] shrink-0">
                    Chọn bài tập để chấm:
                  </span>
                  {assignments.map((a: EnrichedAssignment) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedAssignmentId(a.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer border-none ${
                        activeAssignment.id === a.id
                          ? 'bg-[#0059bb] text-white shadow-xs'
                          : 'bg-white dark:bg-[#1E1F20] text-gray-700 dark:text-[#C4C7C5] hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {a.title}
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-black/5 dark:border-white/5 flex-wrap gap-2">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-[#E3E3E3]">
                    Trung tâm chấm bài: {activeAssignment.title} ({totalClassStudents} Học viên)
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-[#8E918F]">
                    Đã nộp:{' '}
                    <strong className="text-gray-900 dark:text-[#E3E3E3] font-bold">
                      {submissions.length}/{totalClassStudents}
                    </strong>{' '}
                    • Chờ chấm:{' '}
                    <strong className="text-amber-600 font-bold">
                      {
                        submissions.filter(
                          (s) =>
                            s.status === 'SUBMITTED' ||
                            s.status === 'RESUBMITTED' ||
                            s.status === 'LATE'
                        ).length
                      }
                    </strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead className="bg-[#F0F4F8] dark:bg-[#131314] text-[11px] font-semibold text-gray-500 dark:text-[#8E918F] uppercase tracking-wider border-none select-none">
                      <tr>
                        <th className="py-4 px-6 min-w-[260px] align-middle">Sinh viên</th>
                        <th className="py-4 px-6 w-[170px] min-w-[140px] align-middle whitespace-nowrap">
                          Thời gian nộp
                        </th>
                        <th className="py-4 px-6 w-[160px] min-w-[130px] align-middle whitespace-nowrap">
                          Trạng thái
                        </th>
                        <th className="py-4 px-6 w-[130px] min-w-[100px] align-middle whitespace-nowrap">
                          Điểm
                        </th>
                        <th className="py-4 px-6 w-[150px] text-right align-middle whitespace-nowrap">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="font-medium border-none">
                      {isLoadingSubmissions ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-xs text-gray-400">
                            Đang tải danh sách bài nộp từ hệ thống...
                          </td>
                        </tr>
                      ) : submissions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-xs text-gray-500 dark:text-[#8E918F]">
                            Chưa có sinh viên nào nộp bài tập này.
                          </td>
                        </tr>
                      ) : (
                        submissions.map((sub) => {
                          const isGraded = sub.status === 'GRADED';
                          const isLate = sub.isLate || sub.status === 'LATE';
                          const displayName = sub.studentName || 'Sinh viên';
                          const initials = displayName
                            .split(' ')
                            .map((p) => p[0])
                            .slice(-2)
                            .join('')
                            .toUpperCase();
                          const currentScore = studentGrades[sub.id] ?? (sub.score !== null ? String(sub.score) : '');

                          return (
                            <tr
                              key={sub.id}
                              className="hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors border-none"
                            >
                              <td className="py-5 px-6 align-middle">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] flex items-center justify-center font-bold text-xs shrink-0">
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-gray-900 dark:text-[#E3E3E3] text-sm">
                                      {displayName}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-[#8E918F] font-mono truncate">
                                      {sub.studentCode ? `${sub.studentCode}@student.edu.vn` : (sub.studentId || '')}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-5 px-6 text-gray-700 dark:text-[#C4C7C5] align-middle whitespace-nowrap">
                                {sub.submittedAt ? formatSubmissionTime(sub.submittedAt).formatted : 'Chưa nộp'}
                              </td>
                              <td className="py-5 px-6 align-middle whitespace-nowrap">
                                {isGraded ? (
                                  <span className="whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] text-xs font-semibold">
                                    Đã chấm
                                  </span>
                                ) : isLate ? (
                                  <span className="whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full bg-rose-100 dark:bg-[#3C1919] text-rose-800 dark:text-[#F28B82] text-xs font-semibold">
                                    Nộp muộn
                                  </span>
                                ) : (
                                  <span className="whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-[#2E1F00] text-amber-800 dark:text-[#FFB784] text-xs font-semibold">
                                    Chờ chấm điểm
                                  </span>
                                )}
                              </td>
                              <td className="py-5 px-6 align-middle whitespace-nowrap">
                                {isGraded ? (
                                  <span className="font-bold text-emerald-600 dark:text-[#81C995]">
                                    {sub.score} / {sub.maxScore || 10}
                                  </span>
                                ) : (
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max={sub.maxScore || 10}
                                    placeholder="--"
                                    value={currentScore}
                                    onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                                    className="w-16 p-2 bg-[#F0F4F8] dark:bg-[#131314] rounded-xl text-center font-semibold text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                                  />
                                )}
                              </td>
                              <td className="py-5 px-6 text-right align-middle whitespace-nowrap">
                                {isGraded ? (
                                  <button
                                    type="button"
                                    onClick={() => onToast(`Mở bài thi của ${displayName} để xem lại`)}
                                    className="px-4 py-2 rounded-full bg-transparent text-gray-700 dark:text-[#C4C7C5] hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-xs cursor-pointer border-none transition-colors whitespace-nowrap"
                                  >
                                    Xem lại
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={gradeMutation.isPending}
                                    onClick={() => handleSaveGrade(displayName, sub.id)}
                                    className="px-5 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs transition-all cursor-pointer border-none shadow-xs whitespace-nowrap disabled:opacity-50"
                                  >
                                    {gradeMutation.isPending ? 'Đang lưu...' : 'Chấm bài'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* Unified Classwork Section: Quizzes & Exams in Class */}
          {(classQuizzes.length > 0 || classExams.length > 0) && (
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-sm dark:shadow-none space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[22px] text-purple-600 dark:text-purple-400">
                    quiz
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3]">
                    Bài tập Trắc nghiệm (Quiz) &amp; Đề kiểm tra ({classQuizzes.length + classExams.length})
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {classQuizzes.map((qz) => (
                  <div
                    key={qz.id}
                    className="p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase">
                          Quiz
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                          {qz.durationMinutes} phút • {qz.questionCount ?? 0} câu
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] truncate">
                        {qz.title}
                      </h4>
                    </div>
                    <Link
                      href={isTeacher ? `/assignments/quizzes/${qz.id}/analytics` : `/assignments/quizzes/${qz.id}/play`}
                      className="px-3.5 py-1.5 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] text-xs font-semibold shrink-0 hover:brightness-95 transition-all"
                    >
                      {isTeacher ? 'Xem kết quả' : 'Làm Quiz'}
                    </Link>
                  </div>
                ))}

                {classExams.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase">
                          Kiểm tra
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                          {ex.durationMinutes} phút • {ex.totalScore ?? 10} điểm
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] truncate">
                        {ex.title}
                      </h4>
                    </div>
                    <Link
                      href={`/classes/${classId}/exams/${ex.id}`}
                      className="px-3.5 py-1.5 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] text-xs font-semibold shrink-0 hover:brightness-95 transition-all"
                    >
                      {isTeacher ? 'Quản lý đề' : 'Vào thi'}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Assignment Modal */}
      {isSubmitModalOpen && submitTargetAssignment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-3xl shadow-xl p-6 space-y-4 border-none">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <h3 className="font-semibold text-base text-gray-900 dark:text-[#E3E3E3]">
                Nộp bài: {submitTargetAssignment.title}
              </h3>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 dark:text-[#C4C7C5]">
              <label className="font-medium block">Nội dung bài làm / Link GitHub / Ghi chú *</label>
              <textarea
                rows={4}
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
                placeholder="Dán link GitHub repo, Google Drive hoặc mô tả chi tiết bài làm..."
                className="w-full p-3.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] border-none outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={submitAssignmentMutation.isPending}
                className="text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] px-5 py-2 rounded-full text-xs font-semibold cursor-pointer border-none bg-transparent transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={submitAssignmentMutation.isPending}
                onClick={handleSubmitAssignmentSubmit}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 cursor-pointer border-none shadow-xs transition-all disabled:opacity-50"
              >
                {submitAssignmentMutation.isPending ? 'Đang gửi...' : 'Xác nhận nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
