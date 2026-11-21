import { z } from 'zod';

export const paymentOrderStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'EXPIRED',
  'CANCELLED',
]);

export type PaymentOrderStatus = z.infer<typeof paymentOrderStatusSchema>;

export const paymentOrderResponseSchema = z
  .object({
    id: z.string().optional(),
    orderCode: z.coerce.string(),
    amount: z.coerce.number(),
    currency: z.string().optional(),
    qrUrl: z.string(),
    bankCode: z.string().default('MB'),
    accountNumber: z.coerce.string(),
    accountName: z.string(),
    expiredAt: z.string().optional(),
    status: paymentOrderStatusSchema.default('PENDING'),
    description: z.string().optional(),
    planId: z.string().optional(),
    planCode: z.string().optional(),
    planName: z.string().optional(),
    paidAt: z.string().nullable().optional(),
  })
  .passthrough();

export type PaymentOrderResponse = z.infer<typeof paymentOrderResponseSchema>;

export const createPaymentOrderRequestSchema = z.object({
  planId: z.string().min(1, 'Vui lòng chọn gói cước'),
  amount: z.number().optional(),
  description: z.string().optional(),
});

export type CreatePaymentOrderRequest = z.infer<
  typeof createPaymentOrderRequestSchema
>;
