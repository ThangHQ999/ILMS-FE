import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { LoginPageView } from '@/features/auth';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('seo'),
  ]);

  return buildMetadata({
    title: t('loginTitle'),
    description: t('loginDescription'),
    path: '/login',
    locale,
  });
}

export default function LoginPage() {
  return <LoginPageView />;
}
