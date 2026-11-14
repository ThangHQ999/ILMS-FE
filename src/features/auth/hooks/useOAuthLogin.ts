'use client';

import { useState } from 'react';
import { OAuthProvider } from '../types';
import { getOAuthUrlPublic } from '../services/auth.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ilms.page/api/v1';

export function useOAuthLogin() {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loginWithOAuth = async (provider: OAuthProvider): Promise<void> => {
    try {
      setLoadingProvider(provider);
      setError(null);

      // Fetch OAuth URL without credentials to avoid stale cookie issues
      const targetUrl = await getOAuthUrlPublic(provider);

      if (targetUrl) {
        window.location.href = targetUrl;
        return;
      }

      // Fallback to direct redirect endpoint if no URL returned
      window.location.href = `${API_BASE_URL}/auth/oauth/${provider}/login`;
    } catch {
      // Fallback to server-side redirect
      window.location.href = `${API_BASE_URL}/auth/oauth/${provider}/login`;
    }
  };

  return {
    loginWithOAuth,
    loadingProvider,
    error,
    setError,
  };
}

