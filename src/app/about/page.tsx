import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { AboutPageView } from '@/features/about';
import {
  SITE_NAME,
  SITE_URL,
  buildMetadata,
  serializeJsonLd,
} from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('seo'),
  ]);

  return buildMetadata({
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    path: '/about',
    locale,
  });
}

export default async function AboutPage() {
  const t = await getTranslations('seo');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: t('aboutTitle'),
    description: t('aboutDescription'),
    url: `${SITE_URL}/about`,
    mainEntity: {
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      url: SITE_URL,
      email: 'support@ilms.page',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <AboutPageView />
    </>
  );
}
