import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/pricing', '/login', '/register', '/terms', '/privacy'],
        disallow: [
          '/dashboard',
          '/classes',
          '/courses',
          '/ai-tutor',
          '/assignments',
          '/competency',
          '/knowledge-graph',
          '/lesson-sessions',
          '/materials',
          '/settings',
          '/tasks',
          '/timetable',
          '/onboarding',
          '/auth/',
          '/forgot-password',
          '/reset-password',
          '/design-system',
          '/403',
          '/404',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
