'use client';

import React, { useMemo, useState } from 'react';
import { EmptyState, ErrorState, useConfirm } from '@/components/shared';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import type {
  BankQuestionItem,
  QuestionBankFilterParams,
  QuestionConcept,
} from '../../schemas/question-bank.schema';
import type { QuestionRequestDTO } from '../../schemas/quiz.schema';
import {
  useBatchDeleteBankQuestions,
  useClassCoursesForBank,
  useCreateBankQuestion,
  useDeleteBankQuestion,
  useQuestionBankList,
  useQuestionConcepts,
  useTeacherBankClasses,
  useUpdateBankQuestion,
} from '../../hooks/useQuestionBankManager';
import { QuestionBankHeader } from './QuestionBankHeader';
import { QuestionBankKpiBar } from './QuestionBankKpiBar';
import { QuestionBankFilterBar } from './QuestionBankFilterBar';
import { QuestionBankCard } from './QuestionBankCard';
import { QuestionEditorModal } from './QuestionEditorModal';
import { PushToAssessmentModal } from './PushToAssessmentModal';
import {
  AiGenerateQuestionsModal,
  ConceptManagerModal,
  ImportQuestionsModal,
} from './QuestionAiImportConceptModals';

interface QuestionBankPageViewProps {
  userFullName?: string;
  initialClassId?: string;
}

const INITIAL_FILTERS: QuestionBankFilterParams = {
  search: '',
  classId: 'ALL',
  courseId: 'ALL',
  conceptId: 'ALL',
  questionType: 'ALL',
  difficultyLevel: 'ALL',
  bloomLevel: 'ALL',
  sourceType: 'ALL',
  page: 1,
  size: 12,
  sort: 'createdAt,desc',
};

export function QuestionBankPageView({
  userFullName = '',
  initialClassId,
}: QuestionBankPageViewProps) {
  const confirm = useConfirm();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();

  const [filters, setFilters] = useState<QuestionBankFilterParams>({
    ...INITIAL_FILTERS,
    classId: initialClassId || 'ALL',
  });
  const [viewMode, setViewMode] = useState<'CARD' | 'TABLE'>('CARD');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<BankQuestionItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConceptsModalOpen, setIsConceptsModalOpen] = useState(false);
  const [pushQuestionIds, setPushQuestionIds] = useState<string[]>([]);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);

  const { data: pageData, isLoading, isFetching, isError, error, refetch } =
    useQuestionBankList(filters);
  const { data: concepts = [] } = useQuestionConcepts();
  const { data: classes = [] } = useTeacherBankClasses();
  const { data: courses = [], isLoading: isLoadingCourses } = useClassCoursesForBank(
    filters.classId || 'ALL'
  );

  const createMutation = useCreateBankQuestion();
  const updateMutation = useUpdateBankQuestion();
  const deleteMutation = useDeleteBankQuestion();
  const batchDeleteMutation = useBatchDeleteBankQuestions();

  const items = pageData?.items ?? [];
  const totalItems = pageData?.totalItems ?? 0;
  const totalPages = pageData?.totalPages ?? 1;
  const currentPage = filters.page ?? 1;

  const conceptMap = useMemo(() => {
    const map = new Map<string, QuestionConcept>();
    for (const c of concepts) map.set(c.id, c);
    return map;
  }, [concepts]);

  const hasFilters = Boolean(
    filters.search?.trim() ||
      (filters.classId && filters.classId !== 'ALL') ||
      (filters.courseId && filters.courseId !== 'ALL') ||
      (filters.conceptId && filters.conceptId !== 'ALL') ||
      (filters.questionType && filters.questionType !== 'ALL') ||
      (filters.difficultyLevel && filters.difficultyLevel !== 'ALL') ||
      (filters.bloomLevel && filters.bloomLevel !== 'ALL')
  );

  const updateFilters = (patch: Partial<QuestionBankFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (question: BankQuestionItem) => {
    setEditingQuestion(question);
    setIsEditorOpen(true);
  };

  const handleDeleteSingle = async (question: BankQuestionItem) => {
    const ok = await confirm({
      title: 'Xóa câu hỏi khỏi ngân hàng?',
      message: 'Câu hỏi này sẽ bị xóa khỏi danh sách ngân hàng câu hỏi.',
      confirmText: 'Xóa câu hỏi',
      cancelText: 'Hủy',
      variant: 'danger',
    });
    if (!ok) return;
    await deleteMutation.mutateAsync(question.id);
    setSelectedIds((prev) => prev.filter((id) => id !== question.id));
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: `Xóa ${selectedIds.length} câu hỏi đã chọn?`,
      message: 'Các câu hỏi được chọn sẽ bị xóa khỏi ngân hàng câu hỏi.',
      confirmText: 'Xóa tất cả',
      cancelText: 'Hủy',
      variant: 'danger',
    });
    if (!ok) return;
    await batchDeleteMutation.mutateAsync(selectedIds);
    setSelectedIds([]);
  };

  const handleSubmitEditor = async (
    payload: QuestionRequestDTO & { courseId?: string; tags?: string[] }
  ) => {
    if (editingQuestion) {
      await updateMutation.mutateAsync({ id: editingQuestion.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] flex flex-col font-sans transition-colors">
      <DashboardSidebar
        isFocus={false}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        workspaceMode="faculty"
      />

      <DashboardHeader
        isFocus={false}
        showFocusMode={false}
        showRoleSwitcher={false}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => {}}
        userFullName={userFullName}
        workspaceMode="faculty"
      />

      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-28 px-4 sm:px-8 max-w-7xl w-full mx-auto space-y-6 ${
          isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'
        }`}
      >
          <QuestionBankHeader
            onOpenCreate={handleOpenCreate}
            onOpenAiGenerate={() => setIsAiModalOpen(true)}
            onOpenImport={() => setIsImportModalOpen(true)}
            onOpenConcepts={() => setIsConceptsModalOpen(true)}
          />

          <QuestionBankKpiBar
            totalItems={totalItems}
            items={items}
            conceptCount={concepts.length}
            isLoading={isLoading}
          />

          <QuestionBankFilterBar
            filters={filters}
            onUpdateFilters={updateFilters}
            onResetFilters={resetFilters}
            classes={classes}
            courses={courses}
            isLoadingCourses={isLoadingCourses}
            concepts={concepts}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-3xl bg-white dark:bg-[#1E1F20] animate-pulse p-5"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-8">
              <ErrorState error={error} onRetry={() => refetch()} />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-10">
              {hasFilters ? (
                <EmptyState
                  icon="filter_alt_off"
                  title="Không tìm thấy câu hỏi phù hợp"
                  description="Thử thay đổi từ khóa tìm kiếm, lớp học hoặc bộ lọc khái niệm."
                  action={
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-5 py-2.5 text-sm font-medium text-[#041E49] dark:text-[#C2E7FF]"
                    >
                      Đặt lại bộ lọc
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon="quiz"
                  title="Ngân hàng câu hỏi đang trống"
                  description="Tạo câu hỏi đầu tiên, nhập từ tệp Word/Excel hoặc dùng AI để sinh bộ câu hỏi."
                  action={
                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      className="rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2.5 text-sm font-medium text-white dark:text-[#062E6F]"
                    >
                      + Tạo câu hỏi đầu tiên
                    </button>
                  }
                />
              )}
            </div>
          ) : (
            <div
              className={`space-y-4 transition-opacity ${
                isFetching ? 'opacity-70' : 'opacity-100'
              }`}
            >
              {viewMode === 'CARD' ? (
                <div className="space-y-3.5">
                  {items.map((question) => (
                    <QuestionBankCard
                      key={question.id}
                      question={question}
                      conceptMap={conceptMap}
                      isSelected={selectedIds.includes(question.id)}
                      onToggleSelect={toggleSelect}
                      onEdit={handleOpenEdit}
                      onDelete={handleDeleteSingle}
                      onPushSingle={(q) => {
                        setPushQuestionIds([q.id]);
                        setIsPushModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F0F4F9] dark:bg-[#282A2C] text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                      <tr>
                        <th className="px-4 py-3.5 w-10" />
                        <th className="px-4 py-3.5">Nội dung câu hỏi</th>
                        <th className="px-4 py-3.5">Loại</th>
                        <th className="px-4 py-3.5">Độ khó</th>
                        <th className="px-4 py-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9EEF6] dark:divide-[#282A2C]">
                      {items.map((q) => (
                        <tr key={q.id} className="hover:bg-[#F0F4F9]/50 dark:hover:bg-[#282A2C]/40">
                          <td className="px-4 py-3.5">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(q.id)}
                              onChange={() => toggleSelect(q.id)}
                              aria-label="Chọn câu hỏi"
                              className="h-4 w-4 accent-[#0B57D0] dark:accent-[#A8C7FA]"
                            />
                          </td>
                          <td className="px-4 py-3.5 max-w-md">
                            <p className="line-clamp-2 font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                              {q.content}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-[#444746] dark:text-[#C4C7C5]">
                            {q.questionType}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-medium">{q.difficultyLevel}</td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                setPushQuestionIds([q.id]);
                                setIsPushModalOpen(true);
                              }}
                              className="rounded-full px-3 py-1 text-xs font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#D3E3FD]/50"
                            >
                              Đưa vào đề
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(q)}
                              className="rounded-full px-3 py-1 text-xs font-medium text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9]"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(q)}
                              className="rounded-full px-3 py-1 text-xs font-medium text-[#B3261E] dark:text-[#F2B8B5] hover:bg-[#F9DEDC]/50"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between rounded-3xl bg-white dark:bg-[#1E1F20] px-5 py-3.5">
                  <span className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                    Trang {currentPage} / {totalPages} · Tổng {totalItems} câu hỏi
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => updateFilters({ page: currentPage - 1 })}
                      className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-4 py-1.5 text-xs font-medium disabled:opacity-40"
                    >
                      Trước
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => updateFilters({ page: currentPage + 1 })}
                      className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-4 py-1.5 text-xs font-medium disabled:opacity-40"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full bg-[#1F1F1F] dark:bg-[#E3E3E3] px-5 py-3 text-white dark:text-[#1F1F1F] shadow-xl">
          <span className="text-sm font-medium">Đã chọn {selectedIds.length} câu hỏi</span>
          <button
            type="button"
            onClick={() => {
              setPushQuestionIds(selectedIds);
              setIsPushModalOpen(true);
            }}
            className="rounded-full bg-[#A8C7FA] dark:bg-[#0B57D0] px-4 py-1.5 text-xs font-medium text-[#062E6F] dark:text-white"
          >
            Đưa vào Quiz / Bài kiểm tra
          </button>
          <button
            type="button"
            disabled={batchDeleteMutation.isPending}
            onClick={handleBatchDelete}
            className="rounded-full bg-[#F2B8B5] dark:bg-[#B3261E] px-4 py-1.5 text-xs font-medium text-[#410E0B] dark:text-white"
          >
            Xóa
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="rounded-full p-1 hover:opacity-75"
            aria-label="Bỏ chọn"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      <QuestionEditorModal
        isOpen={isEditorOpen}
        editingQuestion={editingQuestion}
        concepts={concepts}
        courses={courses}
        defaultCourseId={filters.courseId}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => setIsEditorOpen(false)}
        onSubmitQuestion={handleSubmitEditor}
      />

      <PushToAssessmentModal
        isOpen={isPushModalOpen}
        questionIds={pushQuestionIds}
        classes={classes}
        defaultClassId={filters.classId}
        onClose={() => setIsPushModalOpen(false)}
        onSuccess={() => setSelectedIds([])}
      />

      <AiGenerateQuestionsModal
        isOpen={isAiModalOpen}
        concepts={concepts}
        courses={courses}
        defaultCourseId={filters.courseId}
        defaultClassId={filters.classId}
        onClose={() => setIsAiModalOpen(false)}
      />

      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        courses={courses}
        defaultCourseId={filters.courseId}
        onClose={() => setIsImportModalOpen(false)}
      />

      <ConceptManagerModal
        isOpen={isConceptsModalOpen}
        concepts={concepts}
        onClose={() => setIsConceptsModalOpen(false)}
      />
    </div>
  );
}
