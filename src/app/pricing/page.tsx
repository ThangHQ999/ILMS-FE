import { Metadata } from 'next';
import { PricingPageView } from '@/features/pricing';

export const metadata: Metadata = {
  title: 'Bảng giá & Gói cước | ILMS Platform',
  description:
    'Khai phóng sức mạnh AI Socratic & Đồ thị tri thức cùng các gói thành viên cá nhân và tổ chức trên ILMS.',
};

export default function PricingPage() {
  return <PricingPageView />;
}
