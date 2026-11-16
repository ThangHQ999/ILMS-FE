import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PricingPageView } from '@/features/pricing';
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
    '@type': 'Product',
    name: `${SITE_NAME} Plans`,
    description: t('pricingDescription'),
    url: `${SITE_URL}/pricing`,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'OfferCatalog',
      name: `${SITE_NAME} Membership Plans`,
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Starter',
          price: '0',
          priceCurrency: 'VND',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          priceCurrency: 'VND',
        },
      ],
    },
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
