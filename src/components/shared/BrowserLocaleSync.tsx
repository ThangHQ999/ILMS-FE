'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BrowserLocaleSyncProps {
  currentLocale: string;
}

export function BrowserLocaleSync({ currentLocale }: BrowserLocaleSyncProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const queryLang = urlParams.get('lang') || urlParams.get('locale');
    if (queryLang && ['vi', 'en'].includes(queryLang)) {
      document.cookie = `NEXT_LOCALE=${queryLang}; path=/; max-age=31536000; SameSite=Lax`;
      if (queryLang !== currentLocale) {
        router.refresh();
      }
      return;
    }

    const cookieMatch = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='));
    const existingCookie = cookieMatch ? cookieMatch.split('=')[1] : null;

    const browserLang = (navigator.language || '').toLowerCase();
    const detectedLocale = browserLang.startsWith('vi') ? 'vi' : 'en';

    if (!existingCookie) {
      document.cookie = `NEXT_LOCALE=${detectedLocale}; path=/; max-age=31536000; SameSite=Lax`;
      if (detectedLocale !== currentLocale) {
        router.refresh();
      }
    }
  }, [currentLocale, router]);

  return null;
}
