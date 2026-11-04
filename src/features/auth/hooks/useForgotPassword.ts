'use client';

import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../services/auth.service';

export function useForgotPassword() {
  return useMutation<void, Error, string>({
    mutationFn: (email: string) => forgotPassword(email),
  });
}
