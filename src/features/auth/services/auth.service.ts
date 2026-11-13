import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import { AUTH_ENDPOINTS } from '../constants';
import {
  userProfileSchema,
  UserProfile,
  LoginInput,
  RegisterInput,
  oauthUrlResponseSchema,
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
    } catch {}
  }
  await api.post<ApiResponse<unknown>>(AUTH_ENDPOINTS.LOGOUT);
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post<ApiResponse<unknown>>(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
}

export async function getOAuthUrl(provider: OAuthProvider): Promise<string> {
  const { data } = await api.get<ApiResponse<{ provider: string; url: string }>>(
    AUTH_ENDPOINTS.OAUTH_URL(provider)
  );
  const parsed = oauthUrlResponseSchema.parse(data.data);
  return parsed.url;
}

/**
 * Fetches the OAuth authorization URL without sending credentials (cookies).
 * This avoids Spring Security rejecting the request due to stale access-token cookies.
 */
export async function getOAuthUrlPublic(provider: OAuthProvider): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  const response = await fetch(`${baseUrl}${AUTH_ENDPOINTS.OAUTH_URL(provider)}`, {
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

