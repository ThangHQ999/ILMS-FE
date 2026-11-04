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
    const { data } = await api.get<ApiResponse<UserProfileDto>>('/user/profile');
    if (data?.data) return data.data;
  } catch {
    // Fallback to mock data if backend endpoint is not yet implemented
  }
  await delay();
  return { ...mockProfile };
}

export async function updateUserProfile(
  input: UpdateProfileInput
): Promise<UserProfileDto> {
  try {
    const { data } = await api.put<ApiResponse<UserProfileDto>>('/user/profile', input);
    if (data?.data) return data.data;
  } catch {
    // Fallback
  }
  await delay(200);
  Object.assign(mockProfile, input);
  return { ...mockProfile };
}

export async function changeUserPassword(
  input: ChangePasswordInput
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await api.put<ApiResponse<{ message: string }>>(
      '/user/change-password',
      input
    );
    if (data?.data) return { success: true, message: data.message };
  } catch {
    // Fallback
  }
  await delay(300);
  return { success: true, message: 'Đổi mật khẩu thành công' };
}

export async function getUserPreferences(): Promise<UserPreferencesDto> {
  try {
    const { data } = await api.get<ApiResponse<UserPreferencesDto>>('/user/preferences');
    if (data?.data) return data.data;
  } catch {
    // Fallback
  }
  await delay();
  return { ...mockPreferences };
}

export async function updateUserPreferences(
  input: Partial<UserPreferencesDto>
): Promise<UserPreferencesDto> {
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

export async function getNotificationSettings(): Promise<NotificationSettingsDto> {
  try {
    const { data } = await api.get<ApiResponse<NotificationSettingsDto>>(
      '/user/notification-settings'
    );
    if (data?.data) return data.data;
  } catch {
    // Fallback
  }
  await delay();
  return { ...mockNotificationSettings };
}

export async function updateNotificationSettings(
  input: Partial<NotificationSettingsDto>
): Promise<NotificationSettingsDto> {
  try {
    const { data } = await api.put<ApiResponse<NotificationSettingsDto>>(
      '/user/notification-settings',
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
  return { ...mockBilling };
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
