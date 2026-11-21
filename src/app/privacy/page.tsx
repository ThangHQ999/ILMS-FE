import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PrivacyPageView } from '@/features/legal';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('seo'),
  ]);

  return buildMetadata({
    title: t('privacyTitle'),
    description: t('privacyDescription'),
    path: '/privacy',
    locale,
  });
}

export default function PrivacyPage() {
  return <PrivacyPageView />;
}
