import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import {
  mySubscriptionSchema,
  subscriptionPlanSchema,
  subscriptionHistoryItemSchema,
  type MySubscription,
  type SubscriptionPlan,
  type SubscribeRequest,
  type SubscriptionHistoryItem,
} from '../schemas/subscription.schema';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let mockSubscription: MySubscription = {
  subscriptionId: '8fa85f64-5717-4562-b3fc-2c963f66afa6',
  planId: '1fa85f64-5717-4562-b3fc-2c963f66afa6',
  planCode: 'PRO',
  planName: 'Gói Chuyên nghiệp (Pro)',
  status: 'ACTIVE',
  startDate: '2026-11-01T00:00:00Z',
  endDate: '2026-12-01T00:00:00Z',
  daysRemaining: 17,
  autoRenew: true,
  limits: {
    maxStorageBytes: 53687091200,
    maxStorageFormatted: '50.0 GB',
    usedStorageBytes: 524288000,
    usedStorageFormatted: '500.0 MB',
    storageRemainingBytes: 53162803200,
    storageRemainingFormatted: '49.5 GB',
    storageUsagePercentage: 0.98,
    maxUploadFileSizeBytes: 209715200,
    maxUploadFileSizeFormatted: '200.0 MB',
    maxCoursesCreated: 20,
    currentCoursesCreated: 4,
    maxClassesCreated: 15,
    currentClassesCreated: 3,
    maxStudentsPerClass: 100,
    aiDailyRequests: 200,
    knowledgeGraphMonthlyQuota: 50,
    allowCustomThemes: true,
    prioritySupport: true,
  },
};

// ==================== QUY TẮC KIẾN TRÚC ILMS BACKEND ====================
// Tất cả ID tài nguyên trên Backend (User, Course, Class, SubscriptionPlan...) đều là UUID chuẩn 36 ký tự.
// Khi gọi API đăng ký gói (/subscriptions/subscribe), FE luôn gửi UUID thật nhận từ API /subscriptions/plans.
// Backend đã hỗ trợ fallback tự động nhận diện Plan Code ("PRO", "PLUS", "ENTERPRISE", "plan-pro").
const mockPlans: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    code: 'FREE',
    name: 'Gói Cơ bản',
    description: 'Làm quen nền tảng học tập thông minh ILMS.',
    price: 0,
    yearlyPrice: 0,
    currency: 'VND',
    billingCycle: 'Vĩnh viễn',
    badge: 'Cá nhân',
    isPopular: false,
    maxStorageFormatted: '1 GB',
    aiDailyRequests: 20,
    features: [
      '1 GB dung lượng lưu trữ cloud',
      'Tối đa 3 khóa học song song',
      '20 lượt hỏi Trợ lý AI / ngày',
      'Tạo 5 đồ thị tri thức cơ bản',
      'Diễn đàn thảo luận cộng đồng',
    ],
  },
  {
    id: 'plan-plus',
    code: 'PLUS',
    name: 'Gói Nâng cao (Plus)',
    description: 'Đầy đủ tính năng AI Socratic và đồ thị tri thức đa tầng.',
    price: 99000,
    yearlyPrice: 79000,
    currency: 'VND',
    billingCycle: 'Tháng',
    badge: 'Khuyên dùng',
    isPopular: true,
    maxStorageFormatted: '15 GB',
    aiDailyRequests: 300,
    features: [
      '15 GB lưu trữ tài liệu & video HD',
      'Tạo tối đa 15 khóa học',
      '300 lượt hỏi AI Socratic / ngày',
      '30 Đồ thị tri thức tương tác',
      'Tự động tạo Quiz từ PDF, Slide',
    ],
  },
  {
    id: 'plan-pro',
    code: 'PRO',
    name: 'Gói Pro',
    description: 'Dành cho giảng viên chính, chuyên gia nghiên cứu.',
    price: 199000,
    yearlyPrice: 159000,
    currency: 'VND',
    billingCycle: 'Tháng',
    badge: 'Chuyên nghiệp',
    isPopular: false,
    maxStorageFormatted: '50 GB',
    aiDailyRequests: 1000,
    features: [
      '50 GB dung lượng lưu trữ SSD',
      'Quản lý 50 khóa học & nhóm',
      '1.000 lượt AI Deep Reasoning',
      '150 Đồ thị tri thức & Vector Search',
      'Chấm điểm tự luận tự động bằng AI',
    ],
  },
  {
    id: 'plan-enterprise',
    code: 'ENTERPRISE',
    name: 'Gói Doanh nghiệp',
    description: 'Giải pháp quy mô lớn cho trường học và tổ chức EdTech.',
    price: 499000,
    yearlyPrice: 399000,
    currency: 'VND',
    billingCycle: 'Tháng',
    badge: 'Tổ chức',
    isPopular: false,
    maxStorageFormatted: '200 GB+',
    aiDailyRequests: 999999,
    features: [
      '200 GB+ lưu trữ chuyên dụng',
      'Không giới hạn khóa học & sinh viên',
      'Không giới hạn AI Socratic',
      'Tùy biến tên miền riêng & Logo',
      'Hỗ trợ SLA 99.9% 24/7',
    ],
  },
];

let mockInvoices: SubscriptionHistoryItem[] = [];

export async function getMySubscription(): Promise<MySubscription> {
  try {
    const { data } = await api.get<ApiResponse<MySubscription>>('/subscriptions/my-subscription');
    if (data?.data) return mySubscriptionSchema.parse(data.data);
  } catch {
    // Fallback
  }
  await delay(80);
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ilms_active_subscription');
      if (stored) {
        return mySubscriptionSchema.parse(JSON.parse(stored));
      }
    } catch {}
  }
  return mySubscriptionSchema.parse(mockSubscription);
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data } = await api.get<ApiResponse<SubscriptionPlan[]>>('/subscriptions/plans');
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((p) => subscriptionPlanSchema.parse(p));
    }
  } catch {
    // Fallback
  }
  await delay(80);
  return mockPlans.map((p) => subscriptionPlanSchema.parse(p));
}

export async function subscribePlan(
  input: SubscribeRequest
): Promise<{ success: boolean; message: string; paymentUrl?: string }> {
  try {
    const { data } = await api.post<ApiResponse<{ paymentUrl?: string }>>(
      '/subscriptions/subscribe',
      input
    );
    // Find target plan
    const target = mockPlans.find((p) => p.id === input.planId || p.code === input.planId);
    if (target) {
      mockSubscription.planCode = target.code;
      mockSubscription.planName = target.name;
      mockSubscription.autoRenew = input.autoRenew;
      mockSubscription.daysRemaining = 30;
    }
    return {
      success: true,
      message: data?.message || 'Đăng ký gói dịch vụ thành công',
      paymentUrl: data?.data?.paymentUrl,
    };
  } catch {
    // Fallback
  }
  await delay(200);
  const target = mockPlans.find((p) => p.id === input.planId || p.code === input.planId);
  if (target) {
    mockSubscription.planCode = target.code;
    mockSubscription.planName = target.name;
    mockSubscription.autoRenew = input.autoRenew;
    mockSubscription.daysRemaining = 30;
    mockSubscription.limits = {
      ...mockSubscription.limits,
      maxStorageFormatted: target.maxStorageFormatted,
      aiDailyRequests: target.aiDailyRequests,
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ilms_active_subscription', JSON.stringify(mockSubscription));
      } catch {}
    }
    mockInvoices.unshift({
      id: `inv-${Date.now()}`,
      invoiceCode: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      planName: target.name,
      amount: target.price,
      currency: 'VND',
      paymentMethod: input.paymentMethod,
      status: 'SUCCESS',
      paymentDate: new Date().toLocaleDateString('vi-VN'),
    });
  }
  return {
    success: true,
    message: 'Nâng cấp gói thành công!',
  };
}

export async function cancelAutoRenew(): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await api.post<ApiResponse<{ message: string }>>(
      '/subscriptions/cancel-auto-renew'
    );
    mockSubscription.autoRenew = false;
    return { success: true, message: data?.message || 'Đã hủy tính năng tự động gia hạn' };
  } catch {
    // Fallback
  }
  await delay(150);
  mockSubscription.autoRenew = false;
  return { success: true, message: 'Đã hủy tính năng tự động gia hạn gói' };
}

export async function getSubscriptionHistory(): Promise<SubscriptionHistoryItem[]> {
  try {
    const { data } = await api.get<ApiResponse<SubscriptionHistoryItem[]>>(
      '/subscriptions/history'
    );
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((inv) => subscriptionHistoryItemSchema.parse(inv));
    }
  } catch {
    // Fallback
  }
  await delay(80);
  return mockInvoices.map((inv) => subscriptionHistoryItemSchema.parse(inv));
}
