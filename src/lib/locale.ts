/**
 * Sets user locale in NEXT_LOCALE cookie and localStorage, then navigates or reloads
 * to synchronize Server Components, RootLayout messages, and Client caches.
 */
export function setUserLocale(
  locale: 'vi' | 'en',
  redirectTo: string = '/settings?tab=appearance'
) {
  if (typeof window === 'undefined') return;

  // 1. Set NEXT_LOCALE cookie with 1 year lifespan
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;

  // 2. Persist in localStorage for instant offline/mock synchronization
  try {
    localStorage.setItem('ilms_language', locale);
  } catch {
    // Ignore storage errors in restricted environments
  }

  // 3. Navigate to target URL with the tab intact or reload
  if (redirectTo) {
    window.location.href = redirectTo;
  } else {
    window.location.reload();
  }
}
