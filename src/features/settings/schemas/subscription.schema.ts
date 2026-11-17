import { z } from 'zod';

export const subscriptionLimitsSchema = z.object({
  maxStorageBytes: z.number(),
  maxStorageFormatted: z.string(),
  usedStorageBytes: z.number(),
  usedStorageFormatted: z.string(),
  storageRemainingBytes: z.number().optional(),
  storageRemainingFormatted: z.string().optional(),
  storageUsagePercentage: z.number().optional(),
  maxUploadFileSizeBytes: z.number(),
  maxUploadFileSizeFormatted: z.string(),
  maxCoursesCreated: z.number().default(5),
  currentCoursesCreated: z.number().default(0),
  maxClassesCreated: z.number().default(5),
  currentClassesCreated: z.number().default(0),
  maxStudentsPerClass: z.number().default(50),
  aiDailyRequests: z.number().default(20),
  knowledgeGraphMonthlyQuota: z.number().default(10),
  allowCustomThemes: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),
});

export const mySubscriptionSchema = z.object({
  subscriptionId: z.string(),
  planId: z.string(),
  planCode: z.string(),
  planName: z.string(),
  status: z.string().default('ACTIVE'),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  daysRemaining: z.number().nullable().optional(),
  autoRenew: z.boolean().default(false),
  limits: subscriptionLimitsSchema,
});

export type MySubscription = z.infer<typeof mySubscriptionSchema>;

export const subscriptionPlanSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  yearlyPrice: z.number().optional(),
  currency: z.string().default('VND'),
  billingCycle: z.string().default('Tháng'),
  badge: z.string().optional(),
  isPopular: z.boolean().default(false),
  features: z.array(z.string()),
  maxStorageFormatted: z.string(),
  aiDailyRequests: z.number(),
});

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;

export const subscribeRequestSchema = z.object({
  planId: z.string().min(1, 'Vui lòng chọn gói dịch vụ'),
  paymentMethod: z.enum(['VNPAY', 'MOMO', 'BANK_TRANSFER', 'CREDIT_CARD']).default('VNPAY'),
  autoRenew: z.boolean().default(true),
  notes: z.string().optional(),
});

export type SubscribeRequest = z.infer<typeof subscribeRequestSchema>;

export const subscriptionHistoryItemSchema = z.object({
  id: z.string(),
  invoiceCode: z.string(),
  planName: z.string(),
  amount: z.number(),
  currency: z.string().default('VND'),
  paymentMethod: z.string(),
  status: z.string().default('SUCCESS'),
  paymentDate: z.string(),
  invoicePdfUrl: z.string().optional(),
});

export type SubscriptionHistoryItem = z.infer<typeof subscriptionHistoryItemSchema>;
