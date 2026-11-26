'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getQuestionsPage,
  getQuestionDetail,
  createBankQuestion,
  batchCreateQuestions,
  importQuestionsFile,
  generateQuestionsAi,
  updateBankQuestion,
  deleteBankQuestion,
  getQuestionConcepts,
  createQuestionConcept,
  deleteQuestionConcept,
  getTeacherClassesForBank,
  getClassCoursesForBank,
  getClassTargetAssessments,
  pushQuestionsToTargetAssessment,
} from '../services/question-bank.service';
import type { QuestionRequestDTO } from '../schemas/quiz.schema';
import type {
  AiGenerateQuestionsFormValues,
  QuestionBankFilterParams,
  QuestionConceptRequest,
} from '../schemas/question-bank.schema';

export const questionBankKeys = {
  all: ['question-bank'] as const,
  lists: () => [...questionBankKeys.all, 'list'] as const,
  list: (filters: QuestionBankFilterParams) => [...questionBankKeys.lists(), filters] as const,
  details: () => [...questionBankKeys.all, 'detail'] as const,
  detail: (id: string) => [...questionBankKeys.details(), id] as const,
  concepts: (keyword?: string) => [...questionBankKeys.all, 'concepts', keyword ?? ''] as const,
  classes: () => [...questionBankKeys.all, 'classes'] as const,
  courses: (classId: string) => [...questionBankKeys.all, 'courses', classId] as const,
  assessments: (classId: string) => [...questionBankKeys.all, 'assessments', classId] as const,
};

export function useQuestionBankList(filters: QuestionBankFilterParams) {
  return useQuery({
    queryKey: questionBankKeys.list(filters),
    queryFn: () => getQuestionsPage(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useQuestionDetailQuery(id: string | null) {
  return useQuery({
    queryKey: questionBankKeys.detail(id ?? ''),
    queryFn: () => getQuestionDetail(id ?? ''),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useQuestionConcepts(keyword?: string) {
  return useQuery({
    queryKey: questionBankKeys.concepts(keyword),
    queryFn: () => getQuestionConcepts({ keyword }),
    staleTime: 60_000,
  });
}

export function useTeacherBankClasses() {
  return useQuery({
    queryKey: questionBankKeys.classes(),
    queryFn: getTeacherClassesForBank,
    staleTime: 60_000,
  });
}

export function useClassCoursesForBank(classId: string) {
  return useQuery({
    queryKey: questionBankKeys.courses(classId),
    queryFn: () => getClassCoursesForBank(classId),
    enabled: Boolean(classId && classId !== 'ALL'),
    staleTime: 60_000,
  });
}

export function useClassTargetAssessments(classId: string) {
  return useQuery({
    queryKey: questionBankKeys.assessments(classId),
    queryFn: () => getClassTargetAssessments(classId),
    enabled: Boolean(classId && classId !== 'ALL'),
    staleTime: 30_000,
  });
}

export function useCreateBankQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: QuestionRequestDTO & { courseId?: string; classId?: string; tags?: string[] }
    ) => createBankQuestion(payload),
    onSuccess: () => {
      toast.success('Đã thêm câu hỏi mới vào ngân hàng');
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
    },
    onError: () => {
      toast.error('Không thể tạo câu hỏi. Vui lòng kiểm tra lại dữ liệu.');
    },
  });
}

export function useUpdateBankQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      id: string;
      payload: QuestionRequestDTO & { courseId?: string; classId?: string; tags?: string[] };
    }) => updateBankQuestion(params.id, params.payload),
    onSuccess: (_data, vars) => {
      toast.success('Đã cập nhật câu hỏi');
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionBankKeys.detail(vars.id) });
    },
    onError: () => {
      toast.error('Không thể cập nhật câu hỏi.');
    },
  });
}

export function useDeleteBankQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBankQuestion(id),
    onSuccess: () => {
      toast.success('Đã xóa câu hỏi khỏi ngân hàng');
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
    },
    onError: () => {
      toast.error('Không thể xóa câu hỏi.');
    },
  });
}

export function useBatchDeleteBankQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteBankQuestion(id)));
    },
    onSuccess: (_d, ids) => {
      toast.success(`Đã xóa ${ids.length} câu hỏi khỏi ngân hàng`);
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
    },
    onError: () => {
      toast.error('Một số câu hỏi chưa thể xóa. Vui lòng thử lại.');
    },
  });
}

export function useBatchCreateQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: batchCreateQuestions,
    onSuccess: (created) => {
      toast.success(`Đã lưu ${created.length} câu hỏi vào ngân hàng`);
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
    },
    onError: () => {
      toast.error('Không thể lưu hàng loạt câu hỏi.');
    },
  });
}

export function useImportQuestionsFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importQuestionsFile,
    onSuccess: (res) => {
      toast.success(`Đã nhập ${res.savedCount} câu hỏi từ tệp`);
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() });
    },
    onError: () => {
      toast.error('Nhập tệp thất bại. Kiểm tra định dạng .docx, .xlsx, .csv hoặc .json.');
    },
  });
}

export function useGenerateQuestionsAi() {
  return useMutation({
    mutationFn: (payload: AiGenerateQuestionsFormValues) => generateQuestionsAi(payload),
    onError: () => {
      toast.error('AI chưa thể sinh câu hỏi lúc này. Vui lòng thử lại.');
    },
  });
}

export function useCreateQuestionConcept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: QuestionConceptRequest) => createQuestionConcept(payload),
    onSuccess: () => {
      toast.success('Đã tạo khái niệm kiến thức mới');
      queryClient.invalidateQueries({ queryKey: questionBankKeys.concepts() });
    },
    onError: () => {
      toast.error('Không thể tạo khái niệm kiến thức.');
    },
  });
}

export function useDeleteQuestionConcept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuestionConcept(id),
    onSuccess: () => {
      toast.success('Đã xóa khái niệm kiến thức');
      queryClient.invalidateQueries({ queryKey: questionBankKeys.concepts() });
    },
    onError: () => {
      toast.error('Không thể xóa khái niệm kiến thức.');
    },
  });
}

export function usePushToAssessment() {
  return useMutation({
    mutationFn: pushQuestionsToTargetAssessment,
    onSuccess: (_d, vars) => {
      const label = vars.kind === 'QUIZ' ? 'Quiz' : 'Bài kiểm tra';
      toast.success(`Đã thêm ${vars.questionIds.length} câu hỏi vào ${label}`);
    },
    onError: () => {
      toast.error('Không thể đưa câu hỏi vào đề. Vui lòng thử lại.');
    },
  });
}
