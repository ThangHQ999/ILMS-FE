'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useExamDetail } from '../hooks/useExamQueries';
import { usePublishExam, useUnpublishExam } from '../hooks/useExamMutations';
import {
  useExamQuestions,
  useAddExamQuestion,
  useUpdateExamQuestion,
  useDeleteExamQuestion,
  useBankQuestions,
} from '../hooks/useExamQuestions';
import { addExamQuestion } from '../services/exam.service';
import type { ExamQuestionItem, BankQuestionItem } from '../schemas/exam.schema';

export interface TeacherExamDetailViewProps {
  classId: string;
  examId: string;
  className?: string;
  onBack?: () => void;
  onEditExam?: (examId: string) => void;
  onToast?: (message: string) => void;
}

function formatExamDateTime(isoString?: string | null): string {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} – ${day}/${month}/${year}`;
}

function getExamTypeLabel(type?: string): string {
  switch (type) {
    case 'QUIZ':
      return 'Quiz';
    case 'MIDTERM':
      return 'Giữa kỳ';
    case 'FINAL':
      return 'Cuối kỳ';
    case 'CONTEST':
    case 'COMPETITION':
      return 'Cuộc thi';
    default:
      return type || 'Bài thi';
  }
}

function formatScore(val: number | string): string {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0';
  if (Number.isInteger(num)) return num.toString();
  const str = num.toFixed(2).replace(/\.?0+$/, '');
  return str.replace('.', ',');
}

export function TeacherExamDetailView({
  classId,
  examId,
  onEditExam,
  onToast,
}: TeacherExamDetailViewProps) {
  const router = useRouter();

  // Queries
  const {
    data: exam,
    isLoading: isLoadingExam,
    isError: isErrorExam,
    refetch: refetchExam,
  } = useExamDetail(examId, classId);

  const {
    data: questions = [],
    isLoading: isLoadingQuestions,
    refetch: refetchQuestions,
  } = useExamQuestions(examId);

  // Mutations
  const addQuestionMutation = useAddExamQuestion(examId);
  const updateQuestionMutation = useUpdateExamQuestion(examId);
  const deleteQuestionMutation = useDeleteExamQuestion(examId);
  const publishMutation = usePublishExam(classId, examId);
  const unpublishMutation = useUnpublishExam(classId, examId);

  // Pagination for questions table
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);

  // Add Question State (Multiple selection)
  const [bankSearch, setBankSearch] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [addScore, setAddScore] = useState('0.50');
  const [addScoreError, setAddScoreError] = useState<string | null>(null);
  const [isAddingQuestions, setIsAddingQuestions] = useState(false);
  const [addProgressMessage, setAddProgressMessage] = useState<string | null>(null);

  const { data: bankData } = useBankQuestions({
    search: bankSearch,
    courseId: exam?.courseId || undefined,
  });
  const bankQuestions = bankData?.items || [];

  // Edit Question State
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestionItem | null>(null);
  const [editScore, setEditScore] = useState('');
  const [editOrder, setEditOrder] = useState('');
  const [editScoreError, setEditScoreError] = useState<string | null>(null);
  const [editOrderError, setEditOrderError] = useState<string | null>(null);

  // Remove Question State
  const [questionToRemove, setQuestionToRemove] = useState<ExamQuestionItem | null>(null);

  // Computed state
  const isPublished = Boolean(exam?.isPublished);
  const isUpcoming = (exam?.status || 'UPCOMING') === 'UPCOMING';
  const canEditQuestions = !isPublished && isUpcoming;

  const maxExamScore = useMemo(() => {
    return Number(exam?.totalScore ?? exam?.maxScore ?? 10.0);
  }, [exam]);

  const totalAssignedScore = useMemo(() => {
    const sum = questions.reduce((acc, q) => acc + (Number(q.score) || 0), 0);
    return Math.round(sum * 100) / 100;
  }, [questions]);

  const isScoreValid = useMemo(() => {
    return questions.length > 0 && Math.abs(totalAssignedScore - maxExamScore) < 0.001;
  }, [questions.length, totalAssignedScore, maxExamScore]);

  // Pagination calculations
  const totalItems = questions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const pagedQuestions = questions.slice(startIndex, endIndex);

  // Existing question IDs & texts in exam (for duplication check in bank)
  const existingQuestionIds = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.questionId) set.add(q.questionId);
      if (q.id) set.add(q.id);
    });
    return set;
  }, [questions]);

  const existingQuestionContents = useMemo(() => {
    return new Set(questions.map((q) => (q.content || q.text || '').toLowerCase().trim()));
  }, [questions]);

  // Handlers
  const handleEditExamClick = () => {
    if (onEditExam) {
      onEditExam(examId);
    } else {
      router.push(`/classes/${classId}?tab=assignments&action=edit-exam&examId=${examId}`);
    }
  };

  const handlePublishClick = () => {
    if (isPublished) {
      setIsUnpublishModalOpen(true);
    } else {
      if (!isScoreValid) return;
      publishMutation.mutate(undefined, {
        onSuccess: () => {
          onToast?.('Đã công bố bài thi thành công!');
          refetchExam();
          refetchQuestions();
        },
        onError: (err: unknown) => {
          const msg = (err as Error)?.message || 'Không thể công bố bài thi.';
          onToast?.(msg);
        },
      });
    }
  };

  const confirmUnpublish = () => {
    unpublishMutation.mutate(undefined, {
      onSuccess: () => {
        setIsUnpublishModalOpen(false);
        onToast?.('Đã thu hồi công bố bài thi thành công!');
        refetchExam();
        refetchQuestions();
      },
      onError: (err: unknown) => {
        const msg = (err as Error)?.message || 'Không thể thu hồi công bố.';
        onToast?.(msg);
      },
    });
  };

  // Add Question logic
  const openAddModal = () => {
    if (!canEditQuestions) return;
    setSelectedQuestionIds([]);
    setBankSearch('');
    setAddScore('0.50');
    setAddScoreError(null);
    setAddProgressMessage(null);
    setIsAddModalOpen(true);
  };

  const handleToggleQuestion = (questionId: string) => {
    setSelectedQuestionIds((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId]; // preserves selection order!
      }
    });
  };

  const validateAddScore = (val: string): boolean => {
    const num = parseFloat(val);
    if (!val || isNaN(num) || num <= 0) {
      setAddScoreError('Điểm phải lớn hơn 0.');
      return false;
    }
    if (num > 999.99) {
      setAddScoreError('Điểm tối đa là 999.99.');
      return false;
    }
    const parts = val.split('.');
    if (parts[1] && parts[1].length > 2) {
      setAddScoreError('Điểm tối đa 2 chữ số thập phân.');
      return false;
    }
    setAddScoreError(null);
    return true;
  };

  const confirmAddQuestions = async () => {
    if (selectedQuestionIds.length === 0) return;
    if (!validateAddScore(addScore)) return;

    setIsAddingQuestions(true);
    setAddProgressMessage(null);
    const scoreNum = parseFloat(addScore);
    const totalToProcess = selectedQuestionIds.length;
    let successCount = 0;
    const remainingIds: string[] = [];

    // Call POST /api/v1/exams/{examId}/questions sequentially in selection order without orderIndex
    for (let i = 0; i < selectedQuestionIds.length; i++) {
      const qId = selectedQuestionIds[i];
      try {
        await addExamQuestion(examId, {
          questionId: qId,
          score: scoreNum,
        });
        successCount++;
      } catch (err: unknown) {
        console.error(`Failed to add question ${qId}:`, err);
        remainingIds.push(qId);
      }
    }

    // Reload exam and questions
    await Promise.all([refetchQuestions(), refetchExam()]);
    setIsAddingQuestions(false);

    if (successCount === totalToProcess) {
      setSelectedQuestionIds([]);
      setIsAddModalOpen(false);
      onToast?.(`Đã thêm thành công ${successCount} câu hỏi vào đề thi!`);
    } else if (successCount > 0) {
      setSelectedQuestionIds(remainingIds);
      const msg = `Đã thêm ${successCount}/${totalToProcess} câu. Vui lòng thử lại các câu chưa thêm.`;
      setAddProgressMessage(msg);
      onToast?.(msg);
    } else {
      const msg = `Không thể thêm câu hỏi. Vui lòng thử lại.`;
      setAddProgressMessage(msg);
      onToast?.(msg);
    }
  };

  // Edit Question logic
  const openEditModal = (q: ExamQuestionItem) => {
    if (!canEditQuestions) return;
    setEditingQuestion(q);
    setEditScore(Number(q.score).toFixed(2));
    setEditOrder(String(q.orderIndex));
    setEditScoreError(null);
    setEditOrderError(null);
    setIsEditModalOpen(true);
  };

  const isEditDirtyAndValid = useMemo(() => {
    if (!editingQuestion) return false;

    // Check score
    const scoreNum = parseFloat(editScore);
    const isScoreValid =
      Boolean(editScore) &&
      !isNaN(scoreNum) &&
      scoreNum > 0 &&
      scoreNum <= 999.99 &&
      (!editScore.includes('.') || (editScore.split('.')[1]?.length ?? 0) <= 2);

    // Check order
    const isOrderInteger = /^\d+$/.test(editOrder.trim());
    const orderNum = parseInt(editOrder.trim(), 10);
    const isOrderValid =
      Boolean(editOrder) && isOrderInteger && orderNum >= 1 && orderNum <= questions.length;

    if (!isScoreValid || !isOrderValid) return false;

    // Check dirty
    const origScore = Number(editingQuestion.score).toFixed(2);
    const currScore = scoreNum.toFixed(2);
    const origOrder = String(editingQuestion.orderIndex);
    const currOrder = editOrder.trim();

    return origScore !== currScore || origOrder !== currOrder;
  }, [editingQuestion, editScore, editOrder, questions.length]);

  const handleEditScoreChange = (val: string) => {
    setEditScore(val);
    const num = parseFloat(val);
    if (!val || isNaN(num) || num <= 0) {
      setEditScoreError('Điểm phải lớn hơn 0.');
    } else if (num > 999.99) {
      setEditScoreError('Điểm tối đa là 999.99.');
    } else {
      const parts = val.split('.');
      if (parts[1] && parts[1].length > 2) {
        setEditScoreError('Tối đa 2 số thập phân.');
      } else {
        setEditScoreError(null);
      }
    }
  };

  const handleEditOrderChange = (val: string) => {
    setEditOrder(val);
    const trimmed = val.trim();
    const isInt = /^\d+$/.test(trimmed);
    const num = Number(trimmed);
    if (!trimmed || !isInt || num < 1 || num > questions.length) {
      setEditOrderError(`Thứ tự phải là số nguyên từ 1 đến ${questions.length}.`);
    } else {
      setEditOrderError(null);
    }
  };

  const confirmSaveEditQuestion = () => {
    if (!editingQuestion || !isEditDirtyAndValid) return;

    updateQuestionMutation.mutate(
      {
        questionRelationId: editingQuestion.id,
        input: {
          score: parseFloat(editScore),
          orderIndex: parseInt(editOrder.trim(), 10),
        },
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          onToast?.('Đã cập nhật câu hỏi!');
          refetchExam();
          refetchQuestions();
        },
        onError: (err: unknown) => {
          const msg = (err as Error)?.message || 'Không thể cập nhật câu hỏi.';
          onToast?.(msg);
        },
      }
    );
  };

  // Remove Question logic
  const openRemoveModal = (q: ExamQuestionItem) => {
    if (!canEditQuestions) return;
    setQuestionToRemove(q);
    setIsRemoveModalOpen(true);
  };

  const confirmRemoveQuestion = () => {
    if (!questionToRemove) return;
    deleteQuestionMutation.mutate(questionToRemove.id, {
      onSuccess: () => {
        setIsRemoveModalOpen(false);
        setQuestionToRemove(null);
        onToast?.('Đã gỡ câu hỏi khỏi bài thi!');
        refetchExam();
        refetchQuestions();
      },
      onError: (err: unknown) => {
        const msg = (err as Error)?.message || 'Không thể gỡ câu hỏi.';
        onToast?.(msg);
      },
    });
  };

  if (isLoadingExam) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (isErrorExam || !exam) {
    return (
      <div className="w-full max-w-7xl mx-auto pb-12">
        <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-red-600">error</span>
          <h3 className="text-base font-semibold text-red-900 dark:text-red-200">
            Không thể tải thông tin bài thi
          </h3>
          <button
            type="button"
            onClick={() => refetchExam()}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12">
        {/* SECTION 1: TIÊU ĐỀ & NÚT THAO TÁC */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {exam.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Badge trạng thái theo lịch */}
              {exam.status === 'OPENING' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Đang mở
                </span>
              ) : exam.status === 'CLOSED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Đã đóng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                  Sắp mở
                </span>
              )}

              {/* Badge trạng thái công bố */}
              <span
                id="badge-published-state"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isPublished
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                }`}
              >
                <span
                  id="dot-published-state"
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPublished ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                />
                <span id="label-published-state">
                  {isPublished ? 'Đã công bố' : 'Chưa công bố'}
                </span>
              </span>
            </div>
          </div>

          {/* Căn phải: Sửa bài thi & Công bố bài thi */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleEditExamClick}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-all shadow-xs border-2 border-slate-200/80 dark:border-slate-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-slate-400">
                edit
              </span>
              <span>Sửa bài thi</span>
            </button>

            {/* NÚT CHUYỂN TRẠNG THÁI THU HỒI / CÔNG BỐ */}
            <button
              id="toggle-publish-btn"
              type="button"
              disabled={!isPublished && !isScoreValid}
              onClick={handlePublishClick}
              title={
                isPublished
                  ? 'Thu hồi công bố đề thi'
                  : isScoreValid
                  ? 'Công bố bài thi cho học viên'
                  : `Tổng điểm các câu hỏi phải bằng ${formatScore(maxExamScore)} điểm để công bố bài thi`
              }
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-xs border-2 cursor-pointer ${
                isPublished
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                  : isScoreValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 active:scale-98'
                  : 'bg-blue-600 text-white opacity-50 cursor-not-allowed border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" id="toggle-publish-icon">
                {isPublished ? 'unpublished' : 'publish'}
              </span>
              <span id="toggle-publish-text">
                {isPublished ? 'Thu hồi công bố' : 'Công bố bài thi'}
              </span>
            </button>
          </div>
        </section>

        {/* SECTION 2: THẺ THÔNG TIN BÀI THI */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border-2 border-slate-200/80 dark:border-slate-800 space-y-6">
          {/* Hàng 1: 4 thông số chính trên desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Môn học
              </span>
              <p className="text-base text-slate-900 dark:text-slate-100 font-semibold truncate">
                {exam.courseName
                  ? `${exam.courseName}${exam.courseCode ? ` (${exam.courseCode})` : ''}`
                  : 'Mạng máy tính (CS-202)'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Loại bài thi
              </span>
              <p className="text-base text-slate-900 dark:text-slate-100 font-semibold">
                {getExamTypeLabel(exam.examType)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Thời lượng
              </span>
              <p className="text-base text-slate-900 dark:text-slate-100 font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                  timer
                </span>
                <span>{exam.durationMinutes || 60} phút</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Điểm tối đa
              </span>
              <div>
                <span
                  id="max-exam-score-display"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">military_tech</span>
                  <span>{formatScore(maxExamScore)} điểm</span>
                </span>
              </div>
            </div>
          </div>

          {/* Hàng 2: Lịch Mở & Đóng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">login</span>
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Mở:
                </span>
                <p className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">
                  {formatExamDateTime(exam.startTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">lock_clock</span>
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Đóng:
                </span>
                <p className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">
                  {formatExamDateTime(exam.endTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Hàng 3: Mô tả bài thi (Chỉ hiển thị khi có nội dung) */}
          {exam.description && exam.description.trim() ? (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1.5 tracking-wider">
                Mô tả bài thi
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {exam.description}
              </p>
            </div>
          ) : null}
        </section>

        {/* SECTION 3: KHỐI CÂU HỎI TRONG BÀI THI */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 border-2 border-slate-200/80 dark:border-slate-800">
          {/* HEADER KHỐI CÂU HỎI & CẢNH BÁO ĐIỂM DUY NHẤT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl text-slate-900 dark:text-slate-100 font-bold">
                  Câu hỏi trong bài thi
                </h2>
                <span
                  id="total-questions-badge"
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {totalItems} câu hỏi
                </span>
              </div>

              <button
                id="btn-add-question"
                type="button"
                disabled={!canEditQuestions}
                onClick={openAddModal}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all ${
                  canEditQuestions
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-98'
                    : 'bg-blue-600 text-white opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Thêm câu hỏi</span>
              </button>
            </div>

            {/* Dòng cảnh báo điểm duy nhất ngay dưới tiêu đề */}
            <div
              id="score-validation-warning"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium w-fit ${
                isScoreValid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px] shrink-0"
                id="score-validation-icon"
              >
                {isScoreValid ? 'check_circle' : 'warning'}
              </span>
              <span id="score-validation-text">
                {totalItems === 0
                  ? 'Bài thi chưa có câu hỏi nào, không thể công bố.'
                  : isScoreValid
                  ? `Tổng điểm câu hỏi ${formatScore(totalAssignedScore)} / ${formatScore(maxExamScore)} điểm. Đã khớp điểm tối đa để công bố.`
                  : `Tổng điểm câu hỏi ${formatScore(totalAssignedScore)} / ${formatScore(maxExamScore)} điểm. Cần khớp điểm tối đa để công bố.`}
              </span>
            </div>
          </div>

          {/* BANNER CẢNH BÁO KHI BÀI THI ĐÃ CÔNG BỐ */}
          {isPublished && (
            <div
              id="editing-lock-banner"
              className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start gap-3 transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                info
              </span>
              <div className="min-w-0 text-sm">
                <strong className="font-semibold">
                  Thu hồi công bố trước giờ mở để chỉnh sửa câu hỏi.
                </strong>{' '}
                Bài thi đang ở trạng thái công bố, hãy thu hồi để thêm mới, sửa điểm hoặc gỡ câu hỏi.
              </div>
            </div>
          )}

          {/* BẢNG CÂU HỎI (DESKTOP) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border-2 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="w-20 px-4 py-3.5 text-center">STT</th>
                  <th className="px-4 py-3.5 text-left">Nội dung câu hỏi</th>
                  <th className="w-32 px-4 py-3.5 text-center">Điểm</th>
                  <th className="w-36 px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800/80" id="question-table-body">
                {isLoadingQuestions ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Đang tải danh sách câu hỏi...
                    </td>
                  </tr>
                ) : pagedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                      Chưa có câu hỏi nào trong đề thi. Vui lòng bấm <strong>Thêm câu hỏi</strong> để bổ sung.
                    </td>
                  </tr>
                ) : (
                  pagedQuestions.map((q, idx) => {
                    const orderNum = q.orderIndex || startIndex + idx + 1;
                    return (
                      <tr
                        key={q.id || idx}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-500 dark:text-slate-400 text-sm">
                          #{orderNum}
                        </td>
                        <td className="px-4 py-3.5 text-left">
                          <div className="space-y-1.5">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 break-words whitespace-normal leading-relaxed">
                              {q.text || q.content}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[11px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold">
                                {q.type || q.questionType || 'Trắc nghiệm 1 đáp án'}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  q.levelClass ||
                                  (q.level === 'Khó' || q.difficultyLevel === 'HARD'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                    : q.level === 'Trung bình' || q.difficultyLevel === 'MEDIUM'
                                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300')
                                }`}
                              >
                                {q.level ||
                                  (q.difficultyLevel === 'HARD'
                                    ? 'Khó'
                                    : q.difficultyLevel === 'MEDIUM'
                                    ? 'Trung bình'
                                    : 'Dễ')}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {formatScore(q.score)} điểm
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`btn-edit-${idx}`}
                              type="button"
                              disabled={!canEditQuestions}
                              onClick={() => openEditModal(q)}
                              title="Sửa điểm/vị trí"
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                                canEditQuestions
                                  ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-blue-200/80 dark:border-blue-800 cursor-pointer'
                                  : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              <span>Sửa</span>
                            </button>
                            <button
                              id={`btn-remove-${idx}`}
                              type="button"
                              disabled={!canEditQuestions}
                              onClick={() => openRemoveModal(q)}
                              title="Gỡ khỏi đề"
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                                canEditQuestions
                                  ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 cursor-pointer'
                                  : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              <span>Gỡ</span>
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

          {/* DANH SÁCH DẠNG THẺ (MOBILE) */}
          <div className="md:hidden space-y-3" id="question-cards-mobile">
            {isLoadingQuestions ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                Đang tải danh sách câu hỏi...
              </div>
            ) : pagedQuestions.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                Chưa có câu hỏi nào trong đề thi. Vui lòng bấm <strong>Thêm câu hỏi</strong> để bổ sung.
              </div>
            ) : (
              pagedQuestions.map((q, idx) => {
                const orderNum = q.orderIndex || startIndex + idx + 1;
                return (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-2xl border-2 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        #{orderNum}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                        {formatScore(q.score)} điểm
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 break-words leading-relaxed">
                      {q.text || q.content}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold">
                        {q.type || q.questionType || 'Trắc nghiệm 1 đáp án'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          q.levelClass ||
                          (q.level === 'Khó' || q.difficultyLevel === 'HARD'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            : q.level === 'Trung bình' || q.difficultyLevel === 'MEDIUM'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300')
                        }`}
                      >
                        {q.level ||
                          (q.difficultyLevel === 'HARD'
                            ? 'Khó'
                            : q.difficultyLevel === 'MEDIUM'
                            ? 'Trung bình'
                            : 'Dễ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        disabled={!canEditQuestions}
                        onClick={() => openEditModal(q)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                          canEditQuestions
                            ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-blue-200/80 dark:border-blue-800 cursor-pointer'
                            : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        disabled={!canEditQuestions}
                        onClick={() => openRemoveModal(q)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                          canEditQuestions
                            ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 cursor-pointer'
                            : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Gỡ</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* PHÂN TRANG */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-4 text-xs sm:text-sm text-slate-500">
            <p id="pagination-info">
              {totalItems === 0
                ? 'Hiển thị 0 trong số 0 câu hỏi'
                : `Hiển thị ${startIndex + 1}–${endIndex} trong số ${totalItems} câu hỏi`}
            </p>
            <div className="flex items-center gap-1">
              <button
                id="btn-prev-page"
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage(safePage - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Trước
              </button>
              <div className="flex items-center gap-1" id="pagination-numbers">
                {Array.from({ length: totalPages }).map((_, pIdx) => {
                  const pNum = pIdx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        pNum === safePage
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>
              <button
                id="btn-next-page"
                type="button"
                disabled={safePage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(safePage + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ==================== MODAL 1: THÊM CÂU HỎI TỪ NGÂN HÀNG ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="p-0 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl max-w-2xl w-full mx-auto overflow-hidden border-2 border-slate-200 dark:border-slate-800">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                    Thêm câu hỏi từ ngân hàng
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Chọn câu hỏi thuộc môn {exam.courseName || 'Mạng máy tính'} để bổ sung vào đề thi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Ô TÌM KIẾM THEO NỘI DUNG CÂU HỎI */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  id="input-search-bank"
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Tìm theo nội dung câu hỏi"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/30 border-2 border-slate-200 dark:border-slate-700 transition-all"
                />
              </div>

              {/* THANH THỐNG KÊ LỰA CHỌN */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {bankQuestions.length} câu hỏi phù hợp trong ngân hàng
                </span>
                <span
                  id="badge-selected-count"
                  className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/80 dark:border-blue-800/80"
                >
                  {selectedQuestionIds.length > 0
                    ? `Đã chọn ${selectedQuestionIds.length} câu`
                    : 'Chưa chọn câu nào'}
                </span>
              </div>

              {/* DANH SÁCH CÂU HỎI NGÂN HÀNG (Checkbox nhiều câu) */}
              <div
                className="max-h-72 overflow-y-auto space-y-2.5 p-1"
                id="bank-questions-container"
              >
                {bankQuestions.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm italic">
                    Không tìm thấy câu hỏi phù hợp với từ khóa &ldquo;{bankSearch}&rdquo;.
                  </div>
                ) : (
                  bankQuestions.map((bq) => {
                    const contentStr = bq.content || bq.text || '';
                    const alreadyInExam =
                      existingQuestionIds.has(bq.id) ||
                      existingQuestionContents.has(contentStr.toLowerCase().trim());
                    const isSelected = selectedQuestionIds.includes(bq.id);

                    return (
                      <div
                        key={bq.id}
                        id={`bank-card-${bq.id}`}
                        onClick={() => {
                          if (!alreadyInExam && !isAddingQuestions) {
                            handleToggleQuestion(bq.id);
                          }
                        }}
                        className={`p-3.5 rounded-xl transition-all flex items-start gap-3.5 ${
                          alreadyInExam
                            ? 'border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'border-2 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs cursor-pointer'
                            : 'border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="pt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            id={`checkbox-bank-${bq.id}`}
                            checked={isSelected}
                            disabled={alreadyInExam || isAddingQuestions}
                            onChange={() => {
                              if (!alreadyInExam && !isAddingQuestions) {
                                handleToggleQuestion(bq.id);
                              }
                            }}
                            className={`w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 transition-colors ${
                              alreadyInExam
                                ? 'cursor-not-allowed text-slate-400 opacity-50'
                                : 'cursor-pointer accent-blue-600'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                              {bq.type || bq.questionType || 'Trắc nghiệm 1 đáp án'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                bq.levelClass ||
                                (bq.level === 'Khó' || bq.difficultyLevel === 'HARD'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                  : bq.level === 'Trung bình' || bq.difficultyLevel === 'MEDIUM'
                                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300')
                              }`}
                            >
                              {bq.level ||
                                (bq.difficultyLevel === 'HARD'
                                  ? 'Khó'
                                  : bq.difficultyLevel === 'MEDIUM'
                                  ? 'Trung bình'
                                  : 'Dễ')}
                            </span>
                            {alreadyInExam && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                Đã có trong đề
                              </span>
                            )}
                            {isSelected && !alreadyInExam && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                            {contentStr}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* CÀI ĐẶT ĐIỂM & VALIDATION */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <label
                      className="text-xs font-semibold text-slate-800 dark:text-slate-200"
                      htmlFor="modal-add-score"
                    >
                      Điểm mỗi câu:
                    </label>
                    <input
                      id="modal-add-score"
                      type="number"
                      min="0.01"
                      max="999.99"
                      step="0.01"
                      value={addScore}
                      onChange={(e) => {
                        setAddScore(e.target.value);
                        validateAddScore(e.target.value);
                      }}
                      className="w-24 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-center font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                    />
                  </div>

                  {/* Hiển thị tổng điểm sẽ thêm */}
                  {selectedQuestionIds.length > 0 && !addScoreError && (
                    <div
                      id="total-score-preview"
                      className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-200/60 dark:border-blue-900/60 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px]">calculate</span>
                      <span>
                        {selectedQuestionIds.length} câu × {Number(parseFloat(addScore) || 0).toFixed(2).replace('.', ',')} điểm = {(selectedQuestionIds.length * (parseFloat(addScore) || 0)).toFixed(2).replace('.', ',')} điểm
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 italic">
                  <span>Áp dụng cùng mức điểm cho các câu đang chọn (từ 0.01 đến 999.99).</span>
                </div>

                {addScoreError && (
                  <p className="text-xs text-rose-600 font-medium" id="error-add-score">
                    {addScoreError}
                  </p>
                )}

                {/* Thông báo tiến độ / lỗi từng phần nếu có */}
                {addProgressMessage && (
                  <div
                    id="add-progress-message"
                    className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] shrink-0">info</span>
                    <span>{addProgressMessage}</span>
                  </div>
                )}
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isAddingQuestions}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  id="btn-submit-add-question"
                  type="button"
                  disabled={
                    selectedQuestionIds.length === 0 ||
                    Boolean(addScoreError) ||
                    isAddingQuestions
                  }
                  onClick={confirmAddQuestions}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {isAddingQuestions && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>
                    {isAddingQuestions
                      ? 'Đang thêm...'
                      : selectedQuestionIds.length > 0
                      ? `Thêm ${selectedQuestionIds.length} câu hỏi`
                      : 'Thêm câu hỏi'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: SỬA CÂU HỎI TRONG ĐỀ ==================== */}
      {isEditModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="p-0 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl max-w-lg w-full mx-auto overflow-hidden border-2 border-slate-200 dark:border-slate-800">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                  Sửa câu hỏi trong đề
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Nội dung câu hỏi (Chỉ đọc)
                </span>
                <div
                  id="modal-edit-question-content"
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-sm text-slate-900 dark:text-slate-100 leading-relaxed border border-slate-200 dark:border-slate-700"
                >
                  #{editingQuestion.orderIndex}. {editingQuestion.text || editingQuestion.content}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200"
                    htmlFor="modal-edit-score"
                  >
                    Điểm số
                  </label>
                  <input
                    id="modal-edit-score"
                    type="text"
                    value={editScore}
                    onChange={(e) => handleEditScoreChange(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-[#0059BB]/30 ${
                      editScoreError
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {editScoreError && (
                    <p className="text-[11px] text-rose-600 font-medium" id="error-edit-score">
                      {editScoreError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200"
                    htmlFor="modal-edit-order"
                  >
                    Thứ tự hiển thị (STT)
                  </label>
                  <input
                    id="modal-edit-order"
                    type="text"
                    value={editOrder}
                    onChange={(e) => handleEditOrderChange(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-[#0059BB]/30 ${
                      editOrderError
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {editOrderError && (
                    <p className="text-[11px] text-rose-600 font-medium" id="error-edit-order">
                      {editOrderError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  id="btn-save-edit-question"
                  type="button"
                  disabled={!isEditDirtyAndValid || updateQuestionMutation.isPending}
                  onClick={confirmSaveEditQuestion}
                  className="px-5 py-2 rounded-lg bg-[#0059BB] hover:bg-[#004899] text-white font-semibold text-sm shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {updateQuestionMutation.isPending && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>
                    {updateQuestionMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3: GỠ CÂU HỎI KHỎI BÀI THI ==================== */}
      {isRemoveModalOpen && questionToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="p-0 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl max-w-md w-full mx-auto overflow-hidden border-2 border-slate-200 dark:border-slate-800">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">delete_sweep</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                  Gỡ câu hỏi này khỏi bài thi?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Câu hỏi vẫn được lưu giữ an toàn trong ngân hàng đề thi chung của bộ môn và có thể thêm lại bất kỳ lúc nào.
                </p>
              </div>
              <div
                id="modal-remove-preview"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 italic line-clamp-2 border border-slate-200 dark:border-slate-700"
              >
                #{questionToRemove.orderIndex}. {questionToRemove.text || questionToRemove.content}
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRemoveModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={deleteQuestionMutation.isPending}
                  onClick={confirmRemoveQuestion}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  {deleteQuestionMutation.isPending && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>
                    {deleteQuestionMutation.isPending ? 'Đang gỡ...' : 'Gỡ câu hỏi'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 4: THU HỒI CÔNG BỐ BÀI THI ==================== */}
      {isUnpublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="p-0 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl max-w-md w-full mx-auto overflow-hidden border-2 border-slate-200 dark:border-slate-800">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">lock_reset</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                  Thu hồi công bố bài thi
                </h3>
                <p className="text-sm font-semibold text-[#0059BB]">{exam.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Học viên sẽ tạm thời không nhìn thấy bài thi này trong lịch thi và danh sách bài đánh giá cho đến khi bạn công bố lại.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUnpublishModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={unpublishMutation.isPending}
                  onClick={confirmUnpublish}
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  {unpublishMutation.isPending && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>
                    {unpublishMutation.isPending ? 'Đang thu hồi...' : 'Thu hồi công bố'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
