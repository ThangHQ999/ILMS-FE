export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  OAUTH_URL: (provider: string) => `/auth/oauth/${provider}/url`,
  OAUTH_LOGIN: (provider: string) => `/auth/oauth/${provider}/login`,
  OAUTH_EXCHANGE: (provider: string) => `/auth/oauth/${provider}`,
} as const;

