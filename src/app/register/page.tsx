import { Metadata } from 'next';
import { RegisterPageView } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Đăng ký tài khoản - ILMS',
  description: 'Bắt đầu hành trình học tập và bứt phá kỹ năng công nghệ cùng trợ lý AI tại ILMS.',
};

export default function RegisterPage() {
  return <RegisterPageView />;
}
