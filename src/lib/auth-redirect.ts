const AUTH_REDIRECT_STORAGE_KEY = 'ilms_post_login_redirect';

/**
 * Validates that a redirect path is a safe relative internal route
 * to prevent open-redirect vulnerabilities.
 */
export function getSafeRedirectPath(
  rawPath: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!rawPath) return fallback;
  const trimmed = rawPath.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }
  return trimmed;
}

/**
 * Builds a `/login?redirect=...` URL preserving the intended destination.
 */
export function buildLoginRedirectUrl(targetPath: string): string {
  const safeTarget = getSafeRedirectPath(targetPath, '/dashboard');
  return `/login?redirect=${encodeURIComponent(safeTarget)}`;
}

/**
 * Persists a post-login redirect path across external OAuth round-trips.
 */
export function savePostLoginRedirect(rawPath: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  const safePath = getSafeRedirectPath(rawPath, '');
  if (!safePath) return;
  try {
    sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, safePath);
  } catch {
    // Ignore storage quota / private mode errors
  }
}

/**
 * Reads and clears any stored post-login redirect path.
 */
export function consumePostLoginRedirect(fallback = '/dashboard'): string {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY);
    if (stored) {
      sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
      return getSafeRedirectPath(stored, fallback);
    }
  } catch {
    // Ignore storage access errors
  }
  return fallback;
}
