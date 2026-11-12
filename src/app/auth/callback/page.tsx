'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { exchangeOAuthCode, getMe, OAuthProvider } from '@/features/auth';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tAuth = useTranslations('auth');
  const [statusText, setStatusText] = useState('Đang khởi tạo phiên làm việc...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    async function handleCallback() {
      const errorParam = searchParams.get('error') || searchParams.get('error_description');
      if (errorParam) {
        if (isSubscribed) {
          setErrorMessage(errorParam);
          setTimeout(() => {
            router.replace(`/login?error=${encodeURIComponent(errorParam)}`);
          }, 2000);
        }
        return;
      }

      const code = searchParams.get('code');
      const provider = (searchParams.get('provider') || 'google') as OAuthProvider;

      try {
        if (code) {
          if (isSubscribed) setStatusText('Đang xác thực mã ủy quyền OAuth...');
          await exchangeOAuthCode(provider, code);
        } else {
          // If no code, check if session cookie is already valid
          if (isSubscribed) setStatusText('Đang xác nhận phiên người dùng...');
          await getMe();
        }

        if (isSubscribed) {
          setStatusText('Đăng nhập thành công! Đang chuyển hướng...');
          setTimeout(() => {
            router.replace('/dashboard');
          }, 600);
        }
      } catch (err: unknown) {
        console.error('[OAuthCallback] Auth failed:', err);
        if (isSubscribed) {
          setErrorMessage('Xác thực tài khoản không thành công. Vui lòng thử lại.');
          setTimeout(() => {
            router.replace('/login?error=oauth_failed');
          }, 2500);
        }
      }
    }

    handleCallback();

    return () => {
      isSubscribed = false;
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] px-4">
      <div className="max-w-md w-full bg-white dark:bg-[#1E1F20] rounded-3xl p-8 border-none shadow-none flex flex-col items-center text-center">
        {errorMessage ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[#FAD2CF] dark:bg-[#3C1919] text-[#B3261E] dark:text-[#F28B82] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">error</span>
            </div>
            <h2 className="text-lg font-bold mb-2">Đăng nhập thất bại</h2>
            <p className="text-xs text-[#444746] dark:text-[#C4C7C5] leading-relaxed mb-4">
              {errorMessage}
            </p>
            <p className="text-[11px] text-[#747775] dark:text-[#8E918F]">Đang chuyển hướng về trang đăng nhập...</p>
          </>
        ) : (
          <>
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-[#D3E3FD] dark:border-[#162B4D] border-t-[#0B57D0] dark:border-t-[#A8C7FA] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-[24px] animate-pulse">
                  lock_open
                </span>
              </div>
            </div>
            <h2 className="text-base font-bold mb-1.5">{statusText}</h2>
            <p className="text-xs text-slate-500 dark:text-[#C4C7C5] leading-relaxed">
              Hệ thống ILMS đang thiết lập kênh bảo mật và tài nguyên học tập của bạn.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#E1E5EA] dark:bg-[#131314]">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-cyan-400 dark:border-t-transparent" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
