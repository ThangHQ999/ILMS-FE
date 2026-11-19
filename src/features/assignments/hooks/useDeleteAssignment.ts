'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAssignment } from '../services/assignment.service';
import { assignmentKeys } from '../constants';

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
