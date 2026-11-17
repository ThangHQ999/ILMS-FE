import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import { AUTH_ENDPOINTS } from '../constants';
import {
  userProfileSchema,
  UserProfile,
  LoginInput,
  RegisterInput,
  oauthUrlResponseSchema,
  ResetPasswordInput,
} from '../schemas/auth.schema';
import { OAuthProvider } from '../types';

export async function login(input: LoginInput): Promise<UserProfile> {
  const { data } = await api.post<ApiResponse<unknown>>(AUTH_ENDPOINTS.LOGIN, {
    email: input.email,
    password: input.password,
  });
  return userProfileSchema.parse(data.data);
}

export async function register(input: RegisterInput): Promise<UserProfile> {
  const { data } = await api.post<ApiResponse<unknown>>(AUTH_ENDPOINTS.REGISTER, {
    email: input.email,
    password: input.password,
    firstName: input.firstName,
    middleName: input.middleName || '',
    lastName: input.lastName,
  });
  return userProfileSchema.parse(data.data);
}

export async function getMe(): Promise<UserProfile> {
  const { data } = await api.get<ApiResponse<unknown>>(AUTH_ENDPOINTS.ME);
  return userProfileSchema.parse(data.data);
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('ilms_user');
      localStorage.removeItem('ilms_active_role_override');
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch {}
  }
  try {
    await api.post<ApiResponse<unknown>>(AUTH_ENDPOINTS.LOGOUT);
  } catch {
    // Ignore backend error if token is already expired or invalidated
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post<ApiResponse<unknown>>(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
}

export async function getOAuthUrl(provider: OAuthProvider): Promise<string> {
  const originQuery = typeof window !== 'undefined' ? `?origin=${encodeURIComponent(window.location.origin)}` : '';
  const { data } = await api.get<ApiResponse<{ provider: string; url: string }>>(
    `${AUTH_ENDPOINTS.OAUTH_URL(provider)}${originQuery}`
  );
  const parsed = oauthUrlResponseSchema.parse(data.data);
  return parsed.url;
}

/**
 * Fetches the OAuth authorization URL without sending credentials (cookies).
 * This avoids Spring Security rejecting the request due to stale access-token cookies.
 */
export async function getOAuthUrlPublic(provider: OAuthProvider): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ilms.page/api/v1';
  const originQuery = typeof window !== 'undefined' ? `?origin=${encodeURIComponent(window.location.origin)}` : '';
  const response = await fetch(`${baseUrl}${AUTH_ENDPOINTS.OAUTH_URL(provider)}${originQuery}`, {
    method: 'GET',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OAuth URL: ${response.status}`);
  }

  const json = (await response.json()) as ApiResponse<unknown>;
  const parsed = oauthUrlResponseSchema.parse(json.data);
  return parsed.url;
}


export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string
): Promise<UserProfile> {
  const { data } = await api.post<ApiResponse<unknown>>(
    AUTH_ENDPOINTS.OAUTH_EXCHANGE(provider),
    { code }
  );
  return userProfileSchema.parse(data.data);
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  await api.post<ApiResponse<unknown>>(AUTH_ENDPOINTS.RESET_PASSWORD, {
    token: input.token,
    newPassword: input.newPassword,
    confirmPassword: input.confirmPassword,
  });
}

