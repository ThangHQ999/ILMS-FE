'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { AuthHeader } from './AuthHeader';
import { LoginForm } from './LoginForm';
import { LoginShowcase } from './LoginShowcase';
import { AuthFooter } from './AuthFooter';

function LoginParamsBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (!error) return null;

  return (
    <div className="w-full max-w-md lg:max-w-7xl mx-auto mb-4 px-5 py-3 rounded-full bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784] text-xs font-medium flex items-center gap-2.5 animate-fade-in border-none shadow-none">
      <span className="material-symbols-outlined text-[18px] text-[#725200] dark:text-[#FFB784] shrink-0">
        warning
      </span>
      <span>
        {error === 'oauth_failed'
          ? 'Đăng nhập bằng tài khoản liên kết không thành công hoặc đã bị hủy. Vui lòng thử lại.'
          : `Thông báo xác thực: ${decodeURIComponent(error)}`}
      </span>
    </div>
  );
}

export function LoginPageView() {
  const router = useRouter();
  const { data: user, isSuccess } = useCurrentUser();

  useEffect(() => {
    if (isSuccess && user) {
      router.replace('/dashboard');
    }
  }, [isSuccess, user, router]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] antialiased">
      <AuthHeader />

      <main className="w-full pt-16 flex-grow flex flex-col justify-between relative overflow-hidden">
        <div className="flex flex-col w-full relative py-12 px-6 lg:px-12 items-center justify-center min-h-[calc(100vh-4rem)]">
          <Suspense fallback={null}>
            <LoginParamsBanner />
          </Suspense>

          {/* Main 16:9 Desktop Split Grid */}
          <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14">
            <LoginForm />
            <LoginShowcase />
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}

