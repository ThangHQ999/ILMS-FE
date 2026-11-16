import type { Metadata } from 'next';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://ilms.page'
).replace(/\/+$/, '');

export const SITE_NAME = 'ILMS';
export const DEFAULT_OG_IMAGE = '/og-image.png';

export interface BuildMetadataOptions {
  title: string;
  description: string;
  path?: string;
  locale?: string;
  noIndex?: boolean;
  keywords?: string[];
  image?: string;
}

/**
 * Builds consistent Next.js Metadata including OpenGraph (Facebook/Zalo/LinkedIn/TikTok),
 * Twitter large summary card, canonical URL, and optional noindex rules.
 */
export function buildMetadata({
  title,
  description,
  path = '/',
  locale = 'vi',
  noIndex = false,
  keywords,
  image = DEFAULT_OG_IMAGE,
}: BuildMetadataOptions): Metadata {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${SITE_URL}${normalizedPath === '/' ? '' : normalizedPath}`;
  const ogLocale = locale === 'en' ? 'en_US' : 'vi_VN';

  return {
    title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: canonicalUrl,
      locale: ogLocale,
      alternateLocale: locale === 'en' ? ['vi_VN'] : ['en_US'],
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: {
              index: false,
              follow: false,
            },
          },
        }
      : {
          robots: {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              'max-image-preview': 'large',
              'max-snippet': -1,
              'max-video-preview': -1,
            },
          },
        }),
  };
}

/**
 * Safely serializes JSON-LD payloads inside Server Component `<script>` tags,
 * escaping `<` characters to prevent script injection per Next.js docs.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
