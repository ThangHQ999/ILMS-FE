import type { Metadata } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import { Outfit, Plus_Jakarta_Sans, Roboto_Mono, Inter, Montserrat, Be_Vietnam_Pro } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale, getTranslations } from 'next-intl/server';
import { SITE_URL, SITE_NAME, buildMetadata } from '@/lib/seo';
import { Providers } from '@/providers';
import { BrowserLocaleSync } from '@/components/shared/BrowserLocaleSync';
import { DesignSystemSync } from '@/components/shared/DesignSystemSync';
import { RouteProgressBar } from '@/components/shared/RouteProgressBar';
import { GlobalSocraticCoach } from '@/components/shared/GlobalSocraticCoach';
import { QuotaUpgradeModal } from '@/components/shared/QuotaUpgradeModal';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  preload: true,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  preload: true,
});

const robotoMono = Roboto_Mono({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-roboto-mono',
  display: 'swap',
  preload: false,
});

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
});

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: false,
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('seo'),
  ]);

  const base = buildMetadata({
    title: t('siteTitle'),
    description: t('siteDescription'),
    path: '/',
    locale,
  });

  return {
    ...base,
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: {
      default: t('siteTitle'),
      template: t('siteTitleTemplate'),
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '512x512' },
        { url: '/logo-short.png', type: 'image/png', sizes: '512x512' },
      ],
      shortcut: '/favicon.ico',
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
  };
}

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
      className={`${outfit.variable} ${plusJakartaSans.variable} ${robotoMono.variable} ${inter.variable} ${montserrat.variable} ${beVietnamPro.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/logo-short.png?v=5" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=5" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=5" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
<body className="antialiased" suppressHydrationWarning>
        <Script
          id="ilms-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // 1. Strip browser extension attributes that cause React hydration mismatches
              try {
                var cleanAttr = function(el) {
                  if (!el || !el.attributes) return;
                  var attrs = el.attributes;
                  for (var i = attrs.length - 1; i >= 0; i--) {
                    var n = attrs[i].name;
                    if (
                      n === 'bis_skin_checked' ||
                      n === 'bis_register' ||
                      (n && n.indexOf('__processed_') === 0) ||
                      n === 'data-gramm' ||
                      n === 'data-lt-installed'
                    ) {
                      el.removeAttribute(n);
                    }
                  }
                };

                var cleanSubtree = function(root) {
                  if (!root) return;
                  cleanAttr(root);
                  var all = root.querySelectorAll ? root.querySelectorAll('*') : [];
                  for (var i = 0; i < all.length; i++) {
                    cleanAttr(all[i]);
                  }
                };

                cleanSubtree(document.documentElement);

                if (typeof MutationObserver !== 'undefined') {
                  var extObserver = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes') {
                        var name = m.attributeName;
                        if (
                          name === 'bis_skin_checked' ||
                          name === 'bis_register' ||
                          (name && name.indexOf('__processed_') === 0)
                        ) {
                          m.target.removeAttribute(name);
                        }
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          cleanSubtree(m.addedNodes[j]);
                        }
                      }
                    }
                  });

                  extObserver.observe(document.documentElement, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                  });
                }

                // Suppress browser extension hydration warnings & third-party extension crashes in console
                var origError = console.error;
                console.error = function() {
                  var args = Array.prototype.slice.call(arguments);
                  var first = args[0] ? String(args[0]) : '';
                  if (
                    first.indexOf('bis_skin_checked') !== -1 ||
                    first.indexOf('bis_register') !== -1 ||
                    first.indexOf('__processed_') !== -1 ||
                    first.indexOf('chrome-extension://') !== -1 ||
                    first.indexOf('moz-extension://') !== -1 ||
                    first.indexOf('eppiocemhmnlbhjplcgkofciiegomcon') !== -1 ||
                    first.indexOf('M_ID') !== -1
                  ) {
                    return;
                  }
                  return origError.apply(console, args);
                };

                // Suppress unhandled runtime errors thrown by browser extensions (e.g. Urban VPN executors/200.js)
                window.addEventListener('error', function(event) {
                  var fn = event.filename || '';
                  var stack = (event.error && event.error.stack) ? String(event.error.stack) : '';
                  if (
                    fn.indexOf('chrome-extension://') !== -1 ||
                    fn.indexOf('moz-extension://') !== -1 ||
                    stack.indexOf('chrome-extension://') !== -1 ||
                    stack.indexOf('moz-extension://') !== -1 ||
                    stack.indexOf('eppiocemhmnlbhjplcgkofciiegomcon') !== -1 ||
                    stack.indexOf('M_ID') !== -1
                  ) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(event) {
                  var stack = '';
                  if (event.reason) {
                    stack = event.reason.stack ? String(event.reason.stack) : String(event.reason);
                  }
                  if (
                    stack.indexOf('chrome-extension://') !== -1 ||
                    stack.indexOf('moz-extension://') !== -1 ||
                    stack.indexOf('eppiocemhmnlbhjplcgkofciiegomcon') !== -1 ||
                    stack.indexOf('M_ID') !== -1
                  ) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
              } catch(e) {}

              // 2. Theme & Font Token Initialization
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
                if (!f || f === 'Google Sans') {
                  f = 'Outfit';
                  localStorage.setItem('ilms_font_family', 'Outfit');
                }
                var fontMap = {
                  'Outfit': "var(--font-outfit), var(--font-plus-jakarta-sans), sans-serif",
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

        <NextIntlClientProvider locale={locale} messages={messages}>
          <Suspense fallback={null}>
            <RouteProgressBar />
          </Suspense>
          <BrowserLocaleSync currentLocale={locale} />
          <Providers>
            <DesignSystemSync />
            {children}
            <GlobalSocraticCoach />
            <QuotaUpgradeModal />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
