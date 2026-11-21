import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import {
  paymentOrderResponseSchema,
  type PaymentOrderResponse,
  type CreatePaymentOrderRequest,
} from '../schemas/payment.schema';

/**
 * POST /api/v1/payments/orders
 * Tạo đơn thanh toán gói dịch vụ & sinh link VietQR động SePay
 */
export async function createPaymentOrder(
  data: CreatePaymentOrderRequest
): Promise<PaymentOrderResponse> {
  const { data: res } = await api.post<ApiResponse<PaymentOrderResponse> | PaymentOrderResponse>(
    '/payments/orders',
    data
  );
  const rawData =
    res && typeof res === 'object' && 'data' in res && res.data ? res.data : res;
  return paymentOrderResponseSchema.parse(rawData);
}

/**
 * GET /api/v1/payments/orders/{orderCode}
 * Tra cứu trạng thái đơn hàng (PENDING, PAID, EXPIRED)
 */
export async function getPaymentOrder(
  orderCode: string
): Promise<PaymentOrderResponse> {
  const { data: res } = await api.get<ApiResponse<PaymentOrderResponse> | PaymentOrderResponse>(
    `/payments/orders/${orderCode}`
  );
  const rawData =
    res && typeof res === 'object' && 'data' in res && res.data ? res.data : res;
  return paymentOrderResponseSchema.parse(rawData);
}
