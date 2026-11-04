'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../services/auth.service';
import { authKeys } from '../constants';
import { LoginInput, UserProfile } from '../schemas/auth.schema';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, LoginInput>({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}
