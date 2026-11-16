'use client';

import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../services/auth.service';
import type { ResetPasswordInput } from '../schemas/auth.schema';

export function useResetPassword(options?: {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) {
  return useMutation<void, Error, ResetPasswordInput>({
    mutationFn: (input: ResetPasswordInput) => resetPassword(input),
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
