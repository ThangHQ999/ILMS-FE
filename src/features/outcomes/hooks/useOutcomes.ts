'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import {
  getPlos,
  getPloById,
  createPlo,
  updatePlo,
  deletePlo,
  getClos,
  getCloById,
  createClo,
  updateClo,
  deleteClo,
  getCloPloMatrix,
  updateCloPloMatrix,
  getCloConcepts,
  updateCloConcepts,
  getCourseKnowledgeHeatmap,
  getClassKnowledgeHeatmap,
  getClassKnowledgeGaps,
  getClassOutcomeAttainment,
  getStudentOutcomeAttainment,
  getMyOutcomeAttainment,
  recalculateOutcomeAttainment,
} from '../services/outcome.service';
import type { CreatePloInput, UpdatePloInput } from '../schemas/plo.schema';
import type {
  CreateCloInput,
  UpdateCloInput,
  UpdateCloPloMatrixInput,
  UpdateCloConceptsInput,
} from '../schemas/clo.schema';

export const outcomeKeys = {
  all: ['outcomes'] as const,
  plos: (params?: { search?: string; page?: number; size?: number }) =>
    [...outcomeKeys.all, 'plos', params] as const,
  ploDetail: (id: string) => [...outcomeKeys.all, 'plos', id] as const,
  clos: (courseId: string) => [...outcomeKeys.all, 'courses', courseId, 'clos'] as const,
  cloDetail: (courseId: string, id: string) =>
    [...outcomeKeys.all, 'courses', courseId, 'clos', id] as const,
  cloPloMatrix: (courseId: string) =>
    [...outcomeKeys.all, 'courses', courseId, 'clo-plo-matrix'] as const,
  cloConcepts: (courseId: string, cloId: string) =>
    [...outcomeKeys.all, 'courses', courseId, 'clos', cloId, 'concepts'] as const,
  courseHeatmap: (courseId: string, scope?: string) =>
    [...outcomeKeys.all, 'courses', courseId, 'heatmap', scope] as const,
  classHeatmap: (classId: string, courseId: string, page?: number, size?: number) =>
    [...outcomeKeys.all, 'classes', classId, 'courses', courseId, 'heatmap', page, size] as const,
  classGaps: (classId: string, courseId: string, threshold?: number) =>
    [...outcomeKeys.all, 'classes', classId, 'courses', courseId, 'gaps', threshold] as const,
  classAttainment: (classId: string, courseId: string) =>
    [...outcomeKeys.all, 'classes', classId, 'courses', courseId, 'attainment'] as const,
  studentAttainment: (classId: string, studentId: string, courseId: string) =>
    [...outcomeKeys.all, 'classes', classId, 'students', studentId, 'courses', courseId, 'attainment'] as const,
  myAttainment: (classId: string, courseId: string) =>
    [...outcomeKeys.all, 'me', classId, courseId, 'attainment'] as const,
};

// =========================================================================
// PLO Hooks
// =========================================================================

export function usePlos(params?: { search?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: outcomeKeys.plos(params),
    queryFn: () => getPlos(params),
  });
}

export function usePloDetail(ploId: string) {
  return useQuery({
    queryKey: outcomeKeys.ploDetail(ploId),
    queryFn: () => getPloById(ploId),
    enabled: Boolean(ploId),
  });
}

export function useCreatePlo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePloInput) => createPlo(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...outcomeKeys.all, 'plos'] });
      toast.success('Đã tạo Chuẩn đầu ra PLO thành công!');
    },
    onError: () => {
      toast.error('Không thể tạo PLO lúc này. Vui lòng thử lại.');
    },
  });
}

export function useUpdatePlo(ploId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePloInput) => updatePlo(ploId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...outcomeKeys.all, 'plos'] });
      toast.success('Đã cập nhật PLO thành công!');
    },
    onError: () => {
      toast.error('Không thể cập nhật PLO lúc này.');
    },
  });
}

export function useDeletePlo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ploId: string) => deletePlo(ploId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...outcomeKeys.all, 'plos'] });
      toast.success('Đã xóa Chuẩn đầu ra PLO!');
    },
    onError: () => {
      toast.error('Không thể xóa PLO lúc này.');
    },
  });
}

// =========================================================================
// CLO Hooks
// =========================================================================

export function useClos(courseId: string) {
  return useQuery({
    queryKey: outcomeKeys.clos(courseId),
    queryFn: () => getClos(courseId),
    enabled: Boolean(courseId),
  });
}

export function useCloDetail(courseId: string, cloId: string) {
  return useQuery({
    queryKey: outcomeKeys.cloDetail(courseId, cloId),
    queryFn: () => getCloById(courseId, cloId),
    enabled: Boolean(courseId && cloId),
  });
}

export function useCreateClo(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCloInput) => createClo(courseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outcomeKeys.clos(courseId) });
      toast.success('Đã thêm Chuẩn đầu ra CLO cho môn học!');
    },
    onError: () => {
      toast.error('Không thể tạo CLO lúc này.');
    },
  });
}

export function useUpdateClo(courseId: string, cloId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCloInput) => updateClo(courseId, cloId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outcomeKeys.clos(courseId) });
      queryClient.invalidateQueries({ queryKey: outcomeKeys.cloDetail(courseId, cloId) });
      toast.success('Đã cập nhật CLO thành công!');
    },
    onError: () => {
      toast.error('Không thể cập nhật CLO.');
    },
  });
}

export function useDeleteClo(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cloId: string) => deleteClo(courseId, cloId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outcomeKeys.clos(courseId) });
      toast.success('Đã xóa CLO môn học!');
    },
    onError: () => {
      toast.error('Không thể xóa CLO.');
    },
  });
}

// =========================================================================
// CLO - PLO Matrix Hooks
// =========================================================================

export function useCloPloMatrix(courseId: string) {
  return useQuery({
    queryKey: outcomeKeys.cloPloMatrix(courseId),
    queryFn: () => getCloPloMatrix(courseId),
    enabled: Boolean(courseId),
  });
}

export function useUpdateCloPloMatrix(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCloPloMatrixInput) => updateCloPloMatrix(courseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outcomeKeys.cloPloMatrix(courseId) });
      toast.success('Đã cập nhật Ma trận ánh xạ CLO - PLO thành công!');
    },
    onError: () => {
      toast.error('Không thể lưu ma trận lúc này. Vui lòng thử lại.');
    },
  });
}

// =========================================================================
// CLO - Concept Mapping Hooks
// =========================================================================

export function useCloConcepts(courseId: string, cloId: string) {
  return useQuery({
    queryKey: outcomeKeys.cloConcepts(courseId, cloId),
    queryFn: () => getCloConcepts(courseId, cloId),
    enabled: Boolean(courseId && cloId),
  });
}

export function useUpdateCloConcepts(courseId: string, cloId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCloConceptsInput) => updateCloConcepts(courseId, cloId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outcomeKeys.cloConcepts(courseId, cloId) });
      queryClient.invalidateQueries({ queryKey: outcomeKeys.cloDetail(courseId, cloId) });
      toast.success('Đã cập nhật ánh xạ Khái niệm vào CLO!');
    },
    onError: () => {
      toast.error('Không thể cập nhật danh sách khái niệm.');
    },
  });
}

// =========================================================================
// Knowledge Heatmap & Gaps Hooks
// =========================================================================

export function useCourseKnowledgeHeatmap(
  courseId: string,
  scope: 'PERSONAL' | 'AGGREGATE' = 'PERSONAL'
) {
  return useQuery({
    queryKey: outcomeKeys.courseHeatmap(courseId, scope),
    queryFn: () => getCourseKnowledgeHeatmap(courseId, scope),
    enabled: Boolean(courseId),
  });
}

export function useClassKnowledgeHeatmap(
  classId: string,
  courseId: string,
  page = 0,
  size = 50
) {
  return useQuery({
    queryKey: outcomeKeys.classHeatmap(classId, courseId, page, size),
    queryFn: () => getClassKnowledgeHeatmap(classId, courseId, page, size),
    enabled: Boolean(classId && courseId),
  });
}

export function useClassKnowledgeGaps(
  classId: string,
  courseId: string,
  threshold = 50.0
) {
  return useQuery({
    queryKey: outcomeKeys.classGaps(classId, courseId, threshold),
    queryFn: () => getClassKnowledgeGaps(classId, courseId, threshold),
    enabled: Boolean(classId && courseId),
  });
}

// =========================================================================
// Outcome Attainment Hooks
// =========================================================================

export function useClassOutcomeAttainment(classId: string, courseId: string) {
  return useQuery({
    queryKey: outcomeKeys.classAttainment(classId, courseId),
    queryFn: () => getClassOutcomeAttainment(classId, courseId),
    enabled: Boolean(classId && courseId),
  });
}

export function useStudentOutcomeAttainment(
  classId: string,
  studentId: string,
  courseId: string
) {
  return useQuery({
    queryKey: outcomeKeys.studentAttainment(classId, studentId, courseId),
    queryFn: () => getStudentOutcomeAttainment(classId, studentId, courseId),
    enabled: Boolean(classId && studentId && courseId),
  });
}

export function useMyOutcomeAttainment(classId: string, courseId?: string) {
  return useQuery({
    queryKey: outcomeKeys.myAttainment(classId, courseId || ''),
    queryFn: () => getMyOutcomeAttainment(classId, courseId),
    enabled: Boolean(classId),
  });
}

export function useRecalculateOutcomeAttainment(classId: string, courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => recalculateOutcomeAttainment(classId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: outcomeKeys.classAttainment(classId, courseId),
      });
      toast.success('Đã kích hoạt tính toán lại chuẩn đầu ra thành công!');
    },
    onError: () => {
      toast.error('Không thể kích hoạt tính toán lại lúc này.');
    },
  });
}
