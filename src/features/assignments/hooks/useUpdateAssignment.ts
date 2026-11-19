'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAssignment } from '../services/assignment.service';
import { assignmentKeys } from '../constants';
import type { AssignmentItem, UpdateAssignmentPayload } from '../schemas/assignment.schema';

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
