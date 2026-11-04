import { Metadata } from 'next';
import { OnboardingPageView } from '@/features/onboarding';

export const metadata: Metadata = {
  title: 'Cá nhân hóa không gian học tập - ILMS',
  description: 'Thiết lập giao diện, gia sư AI và phong cách học tập theo cách bạn muốn tại ILMS.',
};

export default function OnboardingPage() {
  return <OnboardingPageView />;
}
