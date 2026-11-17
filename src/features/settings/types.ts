export type SettingsTabId =
  | 'tab-profile'
  | 'tab-appearance'
  | 'tab-notifications'
  | 'tab-security'
  | 'tab-billing'
  | 'tab-support';

export interface UserProfileDto {
  id: string;
  displayName: string;
  username: string;
  email: string;
  isEmailVerified: boolean;
  phone: string;
  isPhoneVerified: boolean;
  birthDate: string;
  role: string;
  bio: string;
  avatarUrl?: string;
  socialAccounts: {
    google?: { email: string; isLinked: boolean };
    github?: { username: string; isLinked: boolean };
    apple?: { isLinked: boolean };
  };
}

export interface UserPreferencesDto {
  themeMode?: 'light' | 'dark' | 'system';
  theme?: 'light' | 'dark' | 'system';
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  neutralColor?: string;
  fontFamily?: string;
  fontSize?: '100%' | '115%' | '125%' | string;
  highContrast?: boolean;
  defaultDashboardMode?: 'analytics' | 'focus';
  sidebarCollapsed?: boolean;
  language?: 'vi' | 'en';
  timezone?: string;
  dateFormat?: string;
  aiPersona?: string;
  aiResponseDepth?: string;
  targetWeeklyStudyHours?: number;
  dailyStreakGoal?: number;
  notificationSettings?: {
    channels?: { push?: boolean; email?: boolean; sms?: boolean };
    categories?: {
      tutorAndAiMessages?: boolean;
      deadlineReminders?: boolean;
      streaksAndRankings?: boolean;
      webinarsAndPromotions?: boolean;
    };
  };
  privacySettings?: {
    scoreVisibility?: 'classmates_only' | 'public' | 'private';
    searchableByEmail?: boolean;
  };
  updatedAt?: string;
}

export interface NotificationSettingsDto {
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  categories: {
    tutorAndAiMessages: boolean;
    deadlineReminders: boolean;
    streaksAndRankings: boolean;
    webinarsAndPromotions: boolean;
  };
}

export interface ActiveSessionDto {
  id: string;
  device: string;
  location: string;
  ip: string;
  isCurrent: boolean;
  lastActive: string;
}

export interface SecuritySettingsDto {
  twoFactorEnabled: boolean;
  twoFactorMethod: string;
  sessions: ActiveSessionDto[];
  privacy: {
    scoreVisibility: 'classmates_only' | 'public' | 'private';
    searchableByEmail: boolean;
  };
}

export interface BillingInfoDto {
  currentPlan: {
    name: string;
    badge: string;
    description: string;
    price: number;
    currency: string;
    billingCycle: string;
    expiresAt: string;
    autoRenew: boolean;
  };
  cloudLabQuota: {
    usedGb: number;
    totalGb: number;
    percentage: number;
  };
  paymentMethods: Array<{
    id: string;
    brand: 'visa' | 'mastercard';
    last4: string;
    expiry: string;
    holderName: string;
    isDefault: boolean;
  }>;
  invoices: Array<{
    id: string;
    date: string;
    service: string;
    amount: number;
    status: 'paid' | 'pending';
    downloadUrl: string;
  }>;
}

export interface SystemInfoDto {
  appVersion: string;
  status: string;
  uptime: string;
}

export interface UpdateProfileInput {
  displayName: string;
  phone?: string;
  birthDate?: string;
  bio?: string;
  username?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
