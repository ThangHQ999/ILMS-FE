'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClassGradeReports,
  getMyGradeReport,
  getClassStudentMembers,
  createGradeReport,
  updateStudentGradeReport,
} from '../services/grade-report.service';
import type {
  CreateGradeReportInput,
  UpdateGradeReportInput,
} from '../schemas/grade-report.schema';

// ==========================================
// 1. Query Keys
// ==========================================

export const classGradeReportKeys = {
  all: ['class-grade-reports'] as const,
  list: (classId: string, params: { search?: string; page?: number; size?: number; sort?: string }) =>
    [...classGradeReportKeys.all, classId, params] as const,
  detail: (classId: string, studentId: string) =>
    [...classGradeReportKeys.all, classId, 'users', studentId] as const,
  members: (classId: string) => [...classGradeReportKeys.all, classId, 'student-members'] as const,
};

export const gradeReportKeys = {
  all: ['grade-reports'] as const,
  my: (classId: string) => [...gradeReportKeys.all, 'me', classId] as const,
};

// ==========================================
// 2. useClassGradeReports
// ==========================================

export function useClassGradeReports(
  classId: string,
  params: { search?: string; page?: number; size?: number; sort?: string } = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: classGradeReportKeys.list(classId, params),
    queryFn: () => getClassGradeReports(classId, params),
    enabled: options?.enabled ?? Boolean(classId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ==========================================
// 3. useMyGradeReport
// ==========================================

export function useMyGradeReport(classId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: gradeReportKeys.my(classId),
    queryFn: () => getMyGradeReport(classId),
    enabled: options?.enabled ?? Boolean(classId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Do not retry on 404 or 403
      const status =
        (error as { status?: number; httpStatus?: number })?.status ||
        (error as { status?: number; httpStatus?: number })?.httpStatus;
      if (status === 404 || status === 403) return false;
      return failureCount < 2;
    },
  });
}

// ==========================================
// 4. useClassStudentMembers
// ==========================================

export function useClassStudentMembers(classId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: classGradeReportKeys.members(classId),
    queryFn: () => getClassStudentMembers(classId),
    enabled: options?.enabled ?? Boolean(classId),
    staleTime: 1000 * 60 * 5,
  });
}

// ==========================================
// 5. useCreateGradeReport
// ==========================================

export function useCreateGradeReport(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGradeReportInput) => createGradeReport(classId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classGradeReportKeys.all });
    },
  });
}

// ==========================================
// 6. useUpdateStudentGrade
// ==========================================

export function useUpdateStudentGrade(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      dirtyPayload,
    }: {
      studentId: string;
      dirtyPayload: Partial<UpdateGradeReportInput>;
    }) => updateStudentGradeReport(classId, studentId, dirtyPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classGradeReportKeys.all });
    },
  });
}
