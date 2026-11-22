import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import {
  mySubscriptionSchema,
  subscriptionPlanSchema,
  subscriptionHistoryItemSchema,
  subscriptionHistoryResponseSchema,
  type MySubscription,
  type SubscriptionPlan,
  type SubscribeRequest,
  type SubscriptionHistoryItem,
  type SubscriptionHistoryResponse,
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
 * Helper to parse various response shapes into a unified SubscriptionHistoryResponse
 */
function parseSubscriptionHistoryResponse(rawData: unknown): SubscriptionHistoryResponse {
  const container =
    rawData && typeof rawData === 'object' && 'data' in rawData
      ? (rawData as { data: unknown }).data
      : rawData;

  // Case 1: Direct array of items
  if (Array.isArray(container)) {
    const items = container.map((inv) => subscriptionHistoryItemSchema.parse(inv));
    return {
      items,
      pageNumber: 0,
      pageSize: items.length || 10,
      totalElements: items.length,
      totalPages: 1,
      isLast: true,
    };
  }

  // Case 2: Object with items or content
  if (container && typeof container === 'object') {
    const rawObj = container as Record<string, unknown>;
    const rawList = Array.isArray(rawObj.items)
      ? rawObj.items
      : Array.isArray(rawObj.content)
      ? rawObj.content
      : [];

    const items = rawList.map((inv) => subscriptionHistoryItemSchema.parse(inv));
    const totalElements =
      typeof rawObj.totalElements === 'number'
        ? rawObj.totalElements
        : typeof rawObj.total === 'number'
        ? rawObj.total
        : items.length;

    const pageNumber =
      typeof rawObj.pageNumber === 'number'
        ? rawObj.pageNumber
        : typeof rawObj.number === 'number'
        ? rawObj.number
        : 0;

    const pageSize =
      typeof rawObj.pageSize === 'number'
        ? rawObj.pageSize
        : typeof rawObj.size === 'number'
        ? rawObj.size
        : 10;

    const totalPages =
      typeof rawObj.totalPages === 'number'
        ? rawObj.totalPages
        : Math.ceil(totalElements / (pageSize || 10)) || 1;

    const isLast =
      typeof rawObj.isLast === 'boolean'
        ? rawObj.isLast
        : typeof rawObj.last === 'boolean'
        ? rawObj.last
        : pageNumber >= totalPages - 1;

    return {
      items,
      pageNumber,
      pageSize,
      totalElements,
      totalPages,
      isLast,
    };
  }

  return {
    items: [],
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    isLast: true,
  };
}

/**
 * GET /api/v1/subscriptions/history (hoặc /api/v1/subscription/history)
 * Lịch sử giao dịch và thanh toán gói dịch vụ của tài khoản (sắp xếp mới nhất lên đầu)
 */
export async function getSubscriptionHistory(params?: {
  page?: number;
  size?: number;
}): Promise<SubscriptionHistoryResponse> {
  const queryParams = {
    page: params?.page ?? 0,
    size: params?.size ?? 10,
  };

  try {
    const { data } = await api.get<ApiResponse<unknown> | unknown>(
      '/subscriptions/history',
      { params: queryParams }
    );
    return parseSubscriptionHistoryResponse(data);
  } catch (err: unknown) {
    const axiosError = err as { response?: { status?: number } };
    // Fallback to /subscription/history if /subscriptions/history returns 404
    if (axiosError?.response?.status === 404) {
      const { data } = await api.get<ApiResponse<unknown> | unknown>(
        '/subscription/history',
        { params: queryParams }
      );
      return parseSubscriptionHistoryResponse(data);
    }
    throw err;
  }
}
