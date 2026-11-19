'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAssignment } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { AssignmentItem, CreateAssignmentPayload } from '../schemas/assignment.schema';

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
