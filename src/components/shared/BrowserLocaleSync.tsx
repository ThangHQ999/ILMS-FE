'use client';

import { useEffect } from 'react';

interface BrowserLocaleSyncProps {
  currentLocale: string;
}

export function BrowserLocaleSync({ currentLocale }: BrowserLocaleSyncProps) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // 1. Explicit query param ?lang=vi or ?locale=en
    const urlParams = new URLSearchParams(window.location.search);
    const queryLang = urlParams.get('lang') || urlParams.get('locale');
    if (queryLang && ['vi', 'en'].includes(queryLang)) {
      document.cookie = `NEXT_LOCALE=${queryLang}; path=/; max-age=31536000; SameSite=Lax`;
      if (queryLang !== currentLocale) {
        window.location.reload();
      }
      return;
    }

    // 2. Check existing cookie
    const cookieMatch = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='));
    const existingCookie = cookieMatch ? cookieMatch.split('=')[1] : null;

    // 3. Persist current server locale silently without triggering a duplicate background refresh
    if (!existingCookie) {
      document.cookie = `NEXT_LOCALE=${currentLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [currentLocale]);

  return null;
}
