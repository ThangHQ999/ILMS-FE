import type { Metadata } from 'next';
import { OnboardingPageView } from '@/features/onboarding';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Cá nhân hóa không gian học tập',
  description: 'Thiết lập giao diện, gia sư AI và phong cách học tập theo cách bạn muốn tại ILMS.',
  path: '/onboarding',
  noIndex: true,
});

export default function OnboardingPage() {
  return <OnboardingPageView />;
}
