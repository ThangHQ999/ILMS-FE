import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PricingPageView } from '@/features/pricing';
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  buildMetadata,
  serializeJsonLd,
} from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('seo'),
  ]);

  return buildMetadata({
    title: t('pricingTitle'),
    description: t('pricingDescription'),
    path: '/pricing',
    locale,
  });
}

export default async function PricingPage() {
  const t = await getTranslations('seo');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${SITE_NAME} Plans`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description: t('pricingDescription'),
    url: `${SITE_URL}/pricing`,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter (Free)',
        price: '0',
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Plus',
        price: '99000',
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '199000',
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/pricing`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <PricingPageView />
    </>
  );
}
