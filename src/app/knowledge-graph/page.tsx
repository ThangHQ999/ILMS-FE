'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';

// Dynamic import with { ssr: false } to prevent SSR hydration mismatch and ResizeObserver issues with React Flow & Canvas
const KnowledgeGraphPageView = dynamic(
  () =>
    import('@/features/knowledge-graph').then((mod) => mod.KnowledgeGraphPageView),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#E1E5EA] dark:bg-[#131314]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 dark:text-[#C4C7C5]">
            Đang tải Đồ thị tri thức (Knowledge Graph Canvas)...
          </p>
        </div>
      </div>
    ),
  }
);

export default function KnowledgeGraphPage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    // Protected route check
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E1E5EA] dark:bg-[#131314]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 dark:text-[#C4C7C5]">
            Đang kiểm tra phiên đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return <KnowledgeGraphPageView />;
}
