'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classKeys } from '../constants';
import { createClass } from '../services/class.service';
import type { CreateClassRequest, ClassItem } from '../types';

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation<ClassItem, Error, CreateClassRequest>({
    mutationFn: (payload: CreateClassRequest) => createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

