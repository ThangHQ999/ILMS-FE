import { headers, cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

  let locale = 'vi';

  if (cookieLocale && ['vi', 'en'].includes(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const acceptLanguage = headerStore.get('accept-language') || '';
    const preferredLanguages = acceptLanguage
      .split(',')
      .map((item) => item.split(';')[0].trim().toLowerCase());

    const viIndex = preferredLanguages.findIndex((lang) => lang.startsWith('vi'));
    const enIndex = preferredLanguages.findIndex((lang) => lang.startsWith('en'));

    if (viIndex !== -1 && (enIndex === -1 || viIndex < enIndex)) {
      locale = 'vi';
    } else if (enIndex !== -1) {
      locale = 'en';
    } else {
      locale = 'vi';
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
