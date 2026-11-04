'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { register } from '../services/auth.service';
import { authKeys } from '../constants';
import { RegisterInput, UserProfile } from '../schemas/auth.schema';

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, RegisterInput>({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}
