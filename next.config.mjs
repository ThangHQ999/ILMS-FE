import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    agentUpgrade: 'security',
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      'clsx',
      'tailwind-merge',
      'zod',
    ],
  },
};

export default withNextIntl(nextConfig);
