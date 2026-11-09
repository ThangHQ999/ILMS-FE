/**
 * Sets user locale in NEXT_LOCALE cookie and reloads to synchronize
 * both Server Components, RootLayout messages and Client caches.
 */
export function setUserLocale(locale: 'vi' | 'en') {
  if (typeof document === 'undefined') return;
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  window.location.reload();
}

