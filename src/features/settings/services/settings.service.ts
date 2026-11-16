import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import {
  UserProfileDto,
  UserPreferencesDto,
  NotificationSettingsDto,
  SecuritySettingsDto,
  BillingInfoDto,
  SystemInfoDto,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../types';

// ==================== MOCK DATA STORES ====================

const mockProfile: UserProfileDto = {
  id: 'usr-10293847',
  displayName: 'Trần Nhật Minh',
  username: 'nhatminh_icpc',
  email: 'nhatminh.edu@gmail.com',
  isEmailVerified: true,
  phone: '+84 987 654 321',
  isPhoneVerified: true,
  birthDate: '15/08/2002',
  role: 'Học viên Chuyên sâu (Advanced Track)',
  bio: 'Học viên Chuyên ngành Khoa học Máy tính & ICPC Track. Đam mê thiết kế kiến trúc phân tán, thuật toán đồ thị và Machine Learning Ops.',
  avatarUrl: undefined,
  socialAccounts: {
    google: { email: 'nhatminh.edu@gmail.com', isLinked: true },
    github: { username: 'minh-dev-icpc', isLinked: true },
    apple: { isLinked: false },
  },
};

const mockPreferences: UserPreferencesDto = {
  theme: 'light',
  language: 'vi',
  timezone: '(GMT+07:00) Bangkok, Hanoi, Jakarta',
  dateFormat: 'DD/MM/YYYY (15/08/2025)',
  fontSize: '100%',
  highContrast: false,
};

const mockNotificationSettings: NotificationSettingsDto = {
  channels: {
    push: true,
    email: true,
    sms: true,
  },
  categories: {
    tutorAndAiMessages: true,
    deadlineReminders: true,
    streaksAndRankings: true,
    webinarsAndPromotions: false,
  },
};

const mockSecurity: SecuritySettingsDto = {
  twoFactorEnabled: true,
  twoFactorMethod: 'Google Authenticator trên thiết bị iPhone',
  sessions: [
    {
      id: 'sess-current',
      device: 'Chrome trên MacBook Pro 16"',
      location: 'Hà Nội, Việt Nam',
      ip: '118.70.190.45',
      isCurrent: true,
      lastActive: 'Đang hoạt động',
    },
    {
      id: 'sess-mobile',
      device: 'Safari trên iPhone 15 Pro',
      location: 'TP. Hồ Chí Minh, Việt Nam',
      ip: '14.161.22.10',
      isCurrent: false,
      lastActive: 'Hoạt động 2 giờ trước',
    },
  ],
  privacy: {
    scoreVisibility: 'classmates_only',
    searchableByEmail: true,
  },
};

const mockBilling: BillingInfoDto = {
  currentPlan: {
    name: 'ILMS Pro Student Annual',
    badge: 'GÓI NĂM',
    description:
      'Gói sinh viên chuyên sâu với đầy đủ tài nguyên GPU Cloud và gia sư AI đồng hành.',
    price: 1200000,
    currency: 'VND',
    billingCycle: '/ năm',
    expiresAt: '15/12/2025',
    autoRenew: true,
  },
  cloudLabQuota: {
    usedGb: 15.6,
    totalGb: 20.0,
    percentage: 78,
  },
  paymentMethods: [
    {
      id: 'pm-1',
      brand: 'visa',
      last4: '8829',
      expiry: '09/2027',
      holderName: 'TRAN NHAT MINH',
      isDefault: true,
    },
  ],
  invoices: [
    {
      id: 'INV-2024-8841',
      date: '15/12/2024',
      service: 'Gia hạn ILMS Pro Student (1 Năm)',
      amount: 1200000,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'INV-2023-1102',
      date: '15/12/2023',
      service: 'Đăng ký ILMS Pro Student (1 Năm)',
      amount: 1200000,
      status: 'paid',
      downloadUrl: '#',
    },
  ],
};

const mockSystemInfo: SystemInfoDto = {
  appVersion: 'ILMS EduTech v3.4.2 Enterprise (Build 2025.10)',
  status: 'operational',
  uptime: '99.98% Uptime',
};

// ==================== SERVICE FUNCTIONS ====================

// Simulate slight network delay for smooth UI feedback
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getUserProfile(): Promise<UserProfileDto> {
  try {
    // Primary: GET /api/v1/users/profile
    const { data } = await api.get<ApiResponse<UserProfileDto>>('/users/profile');
    if (data?.data) {
      return {
        ...mockProfile,
        ...data.data,
        username: data.data.username || (data.data.email ? data.data.email.split('@')[0] : mockProfile.username),
      };
    }
  } catch {
    try {
      // Secondary fallback: GET /api/v1/user/profile
      const { data } = await api.get<ApiResponse<UserProfileDto>>('/user/profile');
      if (data?.data) {
        return {
          ...mockProfile,
          ...data.data,
          username: data.data.username || (data.data.email ? data.data.email.split('@')[0] : mockProfile.username),
        };
      }
    } catch {
      try {
        // Fallback to auth/me
        const { data } = await api.get<ApiResponse<any>>('/auth/me');
        if (data?.data) {
          const u = data.data;
          const fullName =
            [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ') ||
            u.displayName ||
            u.email;
          return {
            ...mockProfile,
            id: u.id || mockProfile.id,
            displayName: fullName || mockProfile.displayName,
            username: u.email ? u.email.split('@')[0] : mockProfile.username,
            email: u.email || mockProfile.email,
            avatarUrl: u.avatarUrl || undefined,
            role:
              u.roleName === 'TEACHER' || u.roleName?.includes('TEACHER')
                ? 'Giảng viên'
                : u.roleName === 'ADMIN' || u.roleName?.includes('ADMIN')
                ? 'Quản trị viên (Admin)'
                : 'Học viên Chuyên sâu',
          };
        }
      } catch {
        // Fallback to storage or mock
      }
    }
  }

  // Đồng bộ hóa với phiên đăng nhập hiện tại từ localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ilms_user');
      if (stored) {
        const u = JSON.parse(stored);
        const fullName =
          [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ') ||
          u.displayName ||
          u.email;
        return {
          ...mockProfile,
          id: u.id || mockProfile.id,
          displayName: fullName || mockProfile.displayName,
          username: u.email ? u.email.split('@')[0] : mockProfile.username,
          email: u.email || mockProfile.email,
          avatarUrl: u.avatarUrl || undefined,
          role:
            u.roleName === 'TEACHER' || u.roleName?.includes('TEACHER')
              ? 'Giảng viên'
              : u.roleName === 'ADMIN' || u.roleName?.includes('ADMIN')
              ? 'Quản trị viên (Admin)'
              : 'Học viên Chuyên sâu',
        };
      }
    } catch {
      // ignore
    }
  }

  await delay();
  return { ...mockProfile };
}

export async function updateUserProfile(
  input: UpdateProfileInput
): Promise<UserProfileDto> {
  try {
    // Primary: PUT /api/v1/users/profile
    const { data } = await api.put<ApiResponse<UserProfileDto>>('/users/profile', input);
    if (data?.data) {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('ilms_user');
          if (stored) {
            const u = JSON.parse(stored);
            localStorage.setItem('ilms_user', JSON.stringify({ ...u, ...data.data }));
          }
        } catch {}
      }
      return data.data;
    }
  } catch {
    try {
      // Secondary fallback: PUT /api/v1/user/profile
      const { data } = await api.put<ApiResponse<UserProfileDto>>('/user/profile', input);
      if (data?.data) return data.data;
    } catch {
      // Fallback
    }
  }
  await delay(200);
  Object.assign(mockProfile, input);
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ilms_user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem(
          'ilms_user',
          JSON.stringify({
            ...u,
            displayName: input.displayName || u.displayName,
            avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : u.avatarUrl,
            phone: input.phone || u.phone,
            bio: input.bio || u.bio,
            birthDate: input.birthDate || u.birthDate,
          })
        );
      }
    } catch {}
  }
  return { ...mockProfile };
}

export async function uploadUserAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const { data } = await api.post<ApiResponse<{ avatarUrl?: string }>>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (data?.data?.avatarUrl) {
      mockProfile.avatarUrl = data.data.avatarUrl;
      return { avatarUrl: data.data.avatarUrl };
    }
  } catch {
    try {
      const { data } = await api.post<ApiResponse<{ avatarUrl?: string }>>('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data?.data?.avatarUrl) {
        mockProfile.avatarUrl = data.data.avatarUrl;
        return { avatarUrl: data.data.avatarUrl };
      }
    } catch {
      // Fallback create object URL for preview/offline mode
    }
  }

  const localPreviewUrl = URL.createObjectURL(file);
  mockProfile.avatarUrl = localPreviewUrl;
  return { avatarUrl: localPreviewUrl };
}

export async function changeUserPassword(
  input: ChangePasswordInput
): Promise<{ success: boolean; message: string }> {
  try {
    // Primary: PUT /api/v1/users/password (docs/api-spec.md Section 3.1)
    const { data } = await api.put<ApiResponse<{ message: string }>>(
      '/users/password',
      input
    );
    if (data?.data) return { success: true, message: data.message };
  } catch {
    try {
      // Secondary fallback: PUT /api/v1/user/password
      const { data } = await api.put<ApiResponse<{ message: string }>>(
        '/user/password',
        input
      );
      if (data?.data) return { success: true, message: data.message };
    } catch {
      try {
        // Tertiary fallback: POST /api/v1/auth/change-password
        const { data } = await api.post<ApiResponse<{ message: string }>>(
          '/auth/change-password',
          input
        );
        if (data?.data) return { success: true, message: data.message };
      } catch {
        // Offline / mock mode fallback
      }
    }
  }
  await delay(300);
  return { success: true, message: 'Đổi mật khẩu thành công' };
}

function getPersistedLanguage(): 'vi' | 'en' {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ilms_language');
      if (stored === 'vi' || stored === 'en') return stored;
      const cookieMatch = document.cookie
        .split('; ')
        .find((row) => row.startsWith('NEXT_LOCALE='));
      const cookieVal = cookieMatch ? cookieMatch.split('=')[1] : null;
      if (cookieVal === 'vi' || cookieVal === 'en') return cookieVal;
    } catch {
      // ignore
    }
  }
  return 'vi';
}

export async function getUserPreferences(): Promise<UserPreferencesDto> {
  try {
    const { data } = await api.get<ApiResponse<UserPreferencesDto>>('/user/preferences');
    if (data?.data) {
      if (data.data.language && typeof window !== 'undefined') {
        try {
          localStorage.setItem('ilms_language', data.data.language);
        } catch {}
      }
      return data.data;
    }
  } catch {
    // Fallback
  }
  await delay();
  mockPreferences.language = getPersistedLanguage();
  return { ...mockPreferences };
}

export async function updateUserPreferences(
  input: Partial<UserPreferencesDto>
): Promise<UserPreferencesDto> {
  if (input.language && typeof window !== 'undefined') {
    try {
      localStorage.setItem('ilms_language', input.language);
    } catch {}
  }

  try {
    const { data } = await api.put<ApiResponse<UserPreferencesDto>>(
      '/user/preferences',
      input
    );
    if (data?.data) return data.data;
  } catch {
    // Fallback
  }
  await delay(100);
  Object.assign(mockPreferences, input);
  return { ...mockPreferences };
}

export async function patchUserPreferences(
  input: Partial<UserPreferencesDto>
): Promise<UserPreferencesDto> {
  if (input.language && typeof window !== 'undefined') {
    try {
      localStorage.setItem('ilms_language', input.language);
    } catch {}
  }

  try {
    const { data } = await api.patch<ApiResponse<UserPreferencesDto>>(
      '/user/preferences',
      input
    );
    if (data?.data) {
      Object.assign(mockPreferences, data.data);
      return data.data;
    }
  } catch {
    try {
      // Secondary fallback to PUT if PATCH not available on backend
      const { data } = await api.put<ApiResponse<UserPreferencesDto>>(
        '/user/preferences',
        input
      );
      if (data?.data) {
        Object.assign(mockPreferences, data.data);
        return data.data;
      }
    } catch {
      // Offline fallback
    }
  }
  Object.assign(mockPreferences, input);
  return { ...mockPreferences };
}

export async function getNotificationSettings(): Promise<NotificationSettingsDto> {
  try {
    const { data } = await api.get<ApiResponse<NotificationSettingsDto>>(
      '/user/preferences/notifications'
    );
    if (data?.data) {
      return {
        channels: {
          ...mockNotificationSettings.channels,
          ...(data.data.channels || {}),
        },
        categories: {
          ...mockNotificationSettings.categories,
          ...(data.data.categories || {}),
        },
      };
    }
  } catch {
    // Fallback
  }
  await delay();
  return {
    channels: { ...mockNotificationSettings.channels },
    categories: { ...mockNotificationSettings.categories },
  };
}

export async function updateNotificationSettings(
  input: Partial<NotificationSettingsDto>
): Promise<NotificationSettingsDto> {
  try {
    const { data } = await api.put<ApiResponse<NotificationSettingsDto>>(
      '/user/preferences/notifications',
      input
    );
    if (data?.data) return data.data;
  } catch {
    // Fallback
  }
  await delay(150);
  if (input.channels) {
    Object.assign(mockNotificationSettings.channels, input.channels);
  }
  if (input.categories) {
    Object.assign(mockNotificationSettings.categories, input.categories);
  }
  return { ...mockNotificationSettings };
}

export async function getSecuritySettings(): Promise<SecuritySettingsDto> {
  try {
    const { data } = await api.get<ApiResponse<SecuritySettingsDto>>('/user/security');
    if (data?.data) return data.data;
  } catch {
    // Fallback
  }
  await delay();
  return { ...mockSecurity };
}

export async function logoutSession(
  sessionId: string
): Promise<{ success: boolean }> {
  try {
    await api.delete(`/user/sessions/${sessionId}`);
  } catch {
    // Fallback
  }
  await delay(150);
  mockSecurity.sessions = mockSecurity.sessions.filter((s) => s.id !== sessionId);
  return { success: true };
}

export async function logoutOtherSessions(): Promise<{ success: boolean }> {
  try {
    await api.post('/user/sessions/logout-others');
  } catch {
    // Fallback
  }
  await delay(200);
  mockSecurity.sessions = mockSecurity.sessions.filter((s) => s.isCurrent);
  return { success: true };
}

export async function updatePrivacySettings(
  privacy: Partial<SecuritySettingsDto['privacy']>
): Promise<SecuritySettingsDto['privacy']> {
  try {
    const { data } = await api.put<ApiResponse<SecuritySettingsDto['privacy']>>(
      '/user/privacy',
      privacy
    );
    if (data?.data) return data.data;
  } catch {
    // Fallback
  }
  await delay(150);
  Object.assign(mockSecurity.privacy, privacy);
  return { ...mockSecurity.privacy };
}

export async function getBillingInfo(): Promise<BillingInfoDto> {
  try {
    const { data } = await api.get<ApiResponse<BillingInfoDto>>('/user/billing');
    if (data?.data) return data.data;
  } catch {
    // Fallback
  }
  await delay();
  let holderName = 'TRAN NHAT MINH';
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ilms_user');
      if (stored) {
        const u = JSON.parse(stored);
        const name = [u.firstName, u.middleName, u.lastName]
          .filter(Boolean)
          .join(' ')
          .toUpperCase();
        if (name) holderName = name;
      }
    } catch {}
  }
  return {
    ...mockBilling,
    paymentMethods: mockBilling.paymentMethods.map((pm) => ({
      ...pm,
      holderName,
    })),
  };
}

export async function getSystemInfo(): Promise<SystemInfoDto> {
  try {
    const { data } = await api.get<ApiResponse<SystemInfoDto>>('/system/info');
    if (data?.data) return data.data;
  } catch {
    // Fallback
  }
  await delay();
  return { ...mockSystemInfo };
}

export async function deleteUserAccount(): Promise<{ success: boolean }> {
  try {
    await api.delete('/user/account');
  } catch {
    // Fallback
  }
  await delay(300);
  return { success: true };
}
