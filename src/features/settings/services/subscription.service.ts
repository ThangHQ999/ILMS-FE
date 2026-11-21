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

/**
 * GET /api/v1/subscriptions/my-subscription
 * Thông tin gói thuê bao hiện tại, hạn sử dụng, % dung lượng, hạn mức AI, môn học, lớp
 */
export async function getMySubscription(): Promise<MySubscription> {
  const { data } = await api.get<ApiResponse<unknown>>('/subscriptions/my-subscription');
  const parsed = mySubscriptionSchema.parse(data?.data ?? data);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('ilms_active_subscription', JSON.stringify(parsed));
    } catch {
      // Ignore localStorage errors
    }
  }
  return parsed;
}

/**
 * GET /api/v1/subscriptions/plans
 * Lấy danh sách các gói dịch vụ đang hoạt động công khai trên hệ thống
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/subscriptions/plans');
  const rawList = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];

  return rawList.map((p) => subscriptionPlanSchema.parse(p));
}

/**
 * POST /api/v1/subscriptions/subscribe
 * Đăng ký hoặc nâng cấp gói dịch vụ mới (mô hình Gemini: nâng cấp ngay, gia hạn cộng dồn, hạ cấp lên lịch)
 */
export async function subscribePlan(
  input: SubscribeRequest
): Promise<{ success: boolean; message: string; paymentUrl?: string }> {
  const { data } = await api.post<ApiResponse<{ paymentUrl?: string }>>(
    '/subscriptions/subscribe',
    input
  );

  return {
    success: true,
    message: data?.message || 'Đăng ký gói dịch vụ thành công',
    paymentUrl: data?.data?.paymentUrl,
  };
}

/**
 * POST /api/v1/subscriptions/cancel-auto-renew
 * Hủy tính năng tự động gia hạn gói khi hết chu kỳ
 */
export async function cancelAutoRenew(): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<ApiResponse<{ message?: string }>>(
    '/subscriptions/cancel-auto-renew'
  );

  return {
    success: true,
    message: data?.message || 'Đã hủy tính năng tự động gia hạn gói cước',
  };
}

/**
 * POST /api/v1/subscriptions/cancel-scheduled
 * Hủy kế hoạch hạ cấp / gói dịch vụ đang được lên lịch
 */
export async function cancelScheduledSubscription(): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<ApiResponse<{ message?: string }>>(
    '/subscriptions/cancel-scheduled'
  );

  return {
    success: true,
    message: data?.message || 'Đã hủy kế hoạch chuyển gói thành công',
  };
}

/**
 * GET /api/v1/subscriptions/history
 * Lịch sử giao dịch và thanh toán gói dịch vụ của tài khoản
 */
export async function getSubscriptionHistory(): Promise<SubscriptionHistoryItem[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/subscriptions/history');
  const rawList = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];

  return rawList.map((inv) => subscriptionHistoryItemSchema.parse(inv));
}
