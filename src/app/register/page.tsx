import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { RegisterPageView } from '@/features/auth';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('seo'),
  ]);

  return buildMetadata({
    title: t('registerTitle'),
    description: t('registerDescription'),
    path: '/register',
    locale,
  });
}

export default function RegisterPage() {
  return <RegisterPageView />;
}
