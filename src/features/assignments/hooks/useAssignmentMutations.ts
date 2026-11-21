'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type {
  AssignmentItem,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from '../schemas/assignment.schema';

// ==========================================
// 1. useCreateAssignment
// ==========================================

export function useCreateAssignment(classId: string) {
  const queryClient = useQueryClient();

  return useMutation<AssignmentItem, Error, CreateAssignmentPayload>({
    mutationFn: (payload: CreateAssignmentPayload) => createAssignment(classId, payload),
    onSuccess: (newAssignment) => {
      // Invalidate all assignment list queries for this class and app-wide
      queryClient.invalidateQueries({ queryKey: [...assignmentKeys.lists(), classId] });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      if (newAssignment?.id) {
        queryClient.setQueryData(assignmentKeys.detail(newAssignment.id), newAssignment);
      }
    },
  });
}

// ==========================================
// 2. useUpdateAssignment
// ==========================================

export function useUpdateAssignment(classId: string, assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<AssignmentItem, Error, Partial<UpdateAssignmentPayload>>({
    mutationFn: (dirtyPayload: Partial<UpdateAssignmentPayload>) =>
      updateAssignment(assignmentId, dirtyPayload, classId),
    onSuccess: (updatedAssignment) => {
      queryClient.setQueryData(assignmentKeys.detail(assignmentId), updatedAssignment);
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) });
      queryClient.invalidateQueries({ queryKey: [...assignmentKeys.lists(), classId] });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}

// ==========================================
// 3. useDeleteAssignment
// ==========================================

export function useDeleteAssignment(classId?: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { assignmentId: string; classId?: string }>({
    mutationFn: ({ assignmentId, classId: itemClassId }) =>
      deleteAssignment(assignmentId, itemClassId || classId),
    onSuccess: (_, variables) => {
      // 1. Invalidate single detail query if cached
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(variables.assignmentId) });

      // 2. Invalidate class paged assignments and list queries
      const targetClassId = variables.classId || classId;
      if (targetClassId) {
        queryClient.invalidateQueries({ queryKey: [...assignmentKeys.lists(), targetClassId] });
      }
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
}
