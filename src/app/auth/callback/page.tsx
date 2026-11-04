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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white px-4">
      <div className="max-w-md w-full bg-white dark:bg-[#161D2F] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center text-center">
        {errorMessage ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">error</span>
            </div>
            <h2 className="text-lg font-bold mb-2">Đăng nhập thất bại</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {errorMessage}
            </p>
            <p className="text-[11px] text-slate-400">Đang chuyển hướng về trang đăng nhập...</p>
          </>
        ) : (
          <>
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-blue-600/20 dark:border-cyan-400/20 border-t-blue-600 dark:border-t-cyan-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 dark:text-cyan-400 text-[24px] animate-pulse">
                  lock_open
                </span>
              </div>
            </div>
            <h2 className="text-base font-bold mb-1.5">{statusText}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-cyan-400 dark:border-t-transparent" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
