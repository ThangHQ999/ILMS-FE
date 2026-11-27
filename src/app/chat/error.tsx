'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ErrorState } from '@/components/shared';

export default function ChatError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const tPage = useTranslations('chat.page');

  return (
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#131314] flex items-center justify-center p-6">
      <ErrorState title={tPage('errorTitle')} onRetry={reset} />
    </div>
  );
}
