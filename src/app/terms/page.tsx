import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { TermsPageView } from '@/features/legal';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('seo'),
  ]);

  return buildMetadata({
    title: t('termsTitle'),
    description: t('termsDescription'),
    path: '/terms',
    locale,
  });
}

export default function TermsPage() {
  return <TermsPageView />;
}
