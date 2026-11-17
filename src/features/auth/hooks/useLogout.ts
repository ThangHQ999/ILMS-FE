'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../services/auth.service';
import { authKeys } from '../constants';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      // 1. Reset user query data to null and clear cache
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();

      // 2. Clear client storage & cookies
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('ilms_user');
          localStorage.removeItem('ilms_active_role_override');
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        } catch {
          // ignore
        }

        // 3. Hard redirect to /login to cleanly reset state and sessions
        window.location.href = '/login';
      }
    },
  });
}
