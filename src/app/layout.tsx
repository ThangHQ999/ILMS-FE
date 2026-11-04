import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, Montserrat, Be_Vietnam_Pro } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { Providers } from '@/providers';
import { BrowserLocaleSync } from '@/components/shared/BrowserLocaleSync';
import { DesignSystemSync } from '@/components/shared/DesignSystemSync';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-montserrat',
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ILMS - Hệ thống quản lý học tập thông minh tích hợp AI',
  description: 'Design System Customizer & Settings',
  icons: {
    icon: [
      { url: '/logo-short.png', type: 'image/png' },
    ],
    shortcut: '/logo-short.png',
    apple: '/logo-short.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${inter.variable} ${montserrat.variable} ${beVietnamPro.variable}`}
    >
      <head>
        <link rel="icon" href="/logo-short.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo-short.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var c = localStorage.getItem('ilms_color_tokens');
                if (c) {
                  var p = JSON.parse(c);
                  var r = document.documentElement;
                  if (p.primary) r.style.setProperty('--color-primary', p.primary);
                  if (p.secondary) r.style.setProperty('--color-secondary', p.secondary);
                  if (p.tertiary) r.style.setProperty('--color-tertiary', p.tertiary);
                  if (p.neutral) r.style.setProperty('--color-neutral', p.neutral);
                }
                var f = localStorage.getItem('ilms_font_family');
                var fontMap = {
                  'Plus Jakarta Sans': "var(--font-plus-jakarta-sans, 'Plus Jakarta Sans'), sans-serif",
                  'Inter': "var(--font-inter, 'Inter'), sans-serif",
                  'Montserrat': "var(--font-montserrat, 'Montserrat'), sans-serif",
                  'Be Vietnam Pro': "var(--font-be-vietnam-pro, 'Be Vietnam Pro'), sans-serif"
                };
                if (f && fontMap[f]) {
                  document.documentElement.style.setProperty('--font-sans', fontMap[f]);
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <BrowserLocaleSync currentLocale={locale} />
          <DesignSystemSync />
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
