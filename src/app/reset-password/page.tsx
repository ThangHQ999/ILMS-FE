import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordPageView } from '@/features/auth';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Đặt lại mật khẩu',
  description: 'Tạo mật khẩu mới cho tài khoản ILMS của bạn.',
  path: '/reset-password',
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314]" />}>
      <ResetPasswordPageView />
    </Suspense>
  );
}
