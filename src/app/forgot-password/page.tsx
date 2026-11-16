import type { Metadata } from 'next';
import { ForgotPasswordPageView } from '@/features/auth';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Quên mật khẩu',
  description: 'Khôi phục quyền truy cập tài khoản ILMS của bạn.',
  path: '/forgot-password',
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageView />;
}
