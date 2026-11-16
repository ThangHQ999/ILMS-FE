import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { HomeClientGate } from '@/features/landing';
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

  const base = buildMetadata({
    title: t('homeTitle'),
    description: t('homeDescription'),
    path: '/',
    locale,
  });

  return {
    ...base,
    title: {
      absolute: t('homeTitle'),
    },
  };
}

export default async function HomePage() {
  const [tSeo, tFaq] = await Promise.all([
    getTranslations('seo'),
    getTranslations('landing.story.conversion.faqs'),
  ]);

  const faqKeys = ['q1', 'q2', 'q3', 'q4'] as const;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: tSeo('homeDescription'),
        inLanguage: ['vi-VN', 'en-US'],
      },
      {
        '@type': 'EducationalOrganization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo-short.png`,
        image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
        description: tSeo('siteDescription'),
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#app`,
        name: `${SITE_NAME} — Intelligent Learning Management System`,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        url: SITE_URL,
        image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
        description: tSeo('homeDescription'),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'VND',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: faqKeys.map((key) => ({
          '@type': 'Question',
          name: tFaq(`${key}.q`),
          acceptedAnswer: {
            '@type': 'Answer',
            text: tFaq(`${key}.a`),
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <HomeClientGate />
    </>
  );
}
