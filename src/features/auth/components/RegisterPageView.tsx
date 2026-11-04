'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { RegisterHeader } from './RegisterHeader';
import { RegisterForm } from './RegisterForm';
import { RegisterShowcase } from './RegisterShowcase';
import { RegisterTrustMetrics } from './RegisterTrustMetrics';
import { RegisterFooter } from './RegisterFooter';

function RegisterParamsBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (!error) return null;

  return (
    <div className="w-full max-w-md lg:max-w-7xl mx-auto mb-4 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2.5 animate-fade-in shadow-sm">
      <span className="material-symbols-outlined text-[18px] text-amber-600 dark:text-amber-400 shrink-0">
        warning
      </span>
      <span>
        {error === 'oauth_failed'
          ? 'Đăng ký bằng tài khoản liên kết không thành công hoặc đã bị hủy. Vui lòng thử lại.'
          : `Thông báo xác thực: ${decodeURIComponent(error)}`}
      </span>
    </div>
  );
}

export function RegisterPageView() {
  const router = useRouter();
  const { data: user, isSuccess } = useCurrentUser();

  useEffect(() => {
    if (isSuccess && user) {
      router.replace('/dashboard');
    }
  }, [isSuccess, user, router]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-[#F1F5F9] antialiased selection:bg-blue-600/20 selection:text-blue-600 dark:selection:bg-cyan-400/20 dark:selection:text-cyan-400">
      <RegisterHeader />

      <main className="w-full pt-16 sm:pt-20 flex-grow flex flex-col justify-between relative overflow-hidden">
        <div className="flex flex-col w-full relative py-6 md:py-10 px-4 sm:px-6 lg:px-12 items-center justify-center min-h-[calc(100vh-5rem)]">
          {/* Subtle Decorative Ambient Glows */}
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-[120px] pointer-events-none opacity-60" />
          <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-purple-400/15 dark:bg-cyan-400/10 rounded-full blur-[130px] pointer-events-none opacity-50" />
          <div className="absolute -bottom-24 left-10 w-[480px] h-[480px] bg-indigo-400/15 dark:bg-purple-500/10 rounded-full blur-[140px] pointer-events-none opacity-40" />

          {/* Subtle Decorative Circuit SVG Trace */}
          <div className="absolute inset-0 pointer-events-none opacity-15 flex items-center justify-center overflow-hidden">
            <svg
              className="w-full h-full text-blue-600 dark:text-cyan-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              viewBox="0 0 1200 800"
            >
              <path d="M100,200 H400 L480,280 V450 L520,490 H780" strokeDasharray="4 8" />
              <path d="M850,150 V320 L920,390 H1150" strokeDasharray="6 6" />
              <circle cx="480" cy="280" fill="currentColor" r="4" />
              <circle cx="520" cy="490" fill="currentColor" r="4" />
              <circle cx="920" cy="390" fill="currentColor" r="4" />
            </svg>
          </div>

          <Suspense fallback={null}>
            <RegisterParamsBanner />
          </Suspense>

          {/* Main Container */}
          <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <RegisterForm />
              <RegisterShowcase />
            </div>

            <RegisterTrustMetrics />
          </div>
        </div>
      </main>

      <RegisterFooter />
    </div>
  );
}

