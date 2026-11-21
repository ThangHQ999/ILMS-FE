import { z } from 'zod';

export const subscriptionLimitsSchema = z
  .object({
    maxStorageBytes: z.number().default(1073741824),
    maxStorageFormatted: z.string().default('1.0 GB'),
    usedStorageBytes: z.number().default(0),
    usedStorageFormatted: z.string().default('0 MB'),
    storageRemainingBytes: z.number().optional(),
    storageRemainingFormatted: z.string().optional(),
    storageUsagePercentage: z.number().optional(),
    maxUploadFileSizeBytes: z.number().default(26214400),
    maxUploadFileSizeFormatted: z.string().default('25.0 MB'),
    maxCoursesCreated: z.number().default(5),
    currentCoursesCreated: z.number().default(0),
    maxClassesCreated: z.number().default(5),
    currentClassesCreated: z.number().default(0),
    maxStudentsPerClass: z.number().default(50),
    aiDailyRequests: z.number().default(20),
    knowledgeGraphMonthlyQuota: z.number().default(10),
    allowCustomThemes: z.boolean().default(false),
    prioritySupport: z.boolean().default(false),
  })
  .passthrough();

export const mySubscriptionSchema = z
  .object({
    subscriptionId: z.string().optional(),
    id: z.string().optional(),
    planId: z.string().optional(),
    planCode: z.string().optional(),
    code: z.string().optional(),
    planName: z.string().optional(),
    name: z.string().optional(),
    status: z.string().default('ACTIVE'),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    daysRemaining: z.number().nullable().optional(),
    autoRenew: z.boolean().default(false),
    nextPlanCode: z.string().nullable().optional(),
    nextPlanName: z.string().nullable().optional(),
    nextPlanStartDate: z.string().nullable().optional(),
    limits: subscriptionLimitsSchema.optional(),
  })
  .passthrough()
  .transform((raw) => ({
    subscriptionId: raw.subscriptionId ?? raw.id ?? '00000000-0000-0000-0000-000000000000',
    planId: raw.planId ?? '',
    planCode: (raw.planCode ?? raw.code ?? 'FREE').toUpperCase(),
    planName: raw.planName ?? raw.name ?? (raw.planCode ? `Gói ${raw.planCode}` : 'Gói Cơ bản'),
    status: raw.status ?? 'ACTIVE',
    startDate: raw.startDate ?? undefined,
    endDate: raw.endDate ?? null,
    daysRemaining: raw.daysRemaining ?? null,
    autoRenew: Boolean(raw.autoRenew),
    nextPlanCode: raw.nextPlanCode ?? null,
    nextPlanName: raw.nextPlanName ?? null,
    nextPlanStartDate: raw.nextPlanStartDate ?? null,
    limits: raw.limits ?? {
      maxStorageBytes: 1073741824,
      maxStorageFormatted: '1.0 GB',
      usedStorageBytes: 0,
      usedStorageFormatted: '0 MB',
      maxUploadFileSizeBytes: 26214400,
      maxUploadFileSizeFormatted: '25.0 MB',
      maxCoursesCreated: 3,
      currentCoursesCreated: 0,
      maxClassesCreated: 2,
      currentClassesCreated: 0,
      maxStudentsPerClass: 50,
      aiDailyRequests: 20,
      knowledgeGraphMonthlyQuota: 10,
      allowCustomThemes: false,
      prioritySupport: false,
    },
  }));

export type MySubscription = z.infer<typeof mySubscriptionSchema>;

export const subscriptionPlanSchema = z
  .object({
    id: z.string().optional(),
    planId: z.string().optional(),
    code: z.string().optional(),
    planCode: z.string().optional(),
    name: z.string().optional(),
    planName: z.string().optional(),
    description: z.string().nullable().optional(),
    price: z.number().nullable().optional(),
    yearlyPrice: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    billingCycle: z.string().nullable().optional(),
    badge: z.string().nullable().optional(),
    isPopular: z.boolean().nullable().optional(),
    features: z.union([z.array(z.string()), z.string()]).nullable().optional(),
    maxStorageFormatted: z.string().nullable().optional(),
    maxStorageBytes: z.number().nullable().optional(),
    aiDailyRequests: z.number().nullable().optional(),
  })
  .passthrough()
  .transform((raw) => {
    const id = raw.id ?? raw.planId ?? '';
    const code = (raw.code ?? raw.planCode ?? 'PRO').toUpperCase();
    const name = raw.name ?? raw.planName ?? `Gói ${code}`;
    const price =
      raw.price ??
      (code === 'FREE' ? 0 : code === 'PLUS' ? 99000 : code === 'PRO' ? 199000 : 499000);
    const yearlyPrice = raw.yearlyPrice ?? Math.round(price * 0.8);
    let features: string[] = [];
    if (Array.isArray(raw.features)) {
      features = raw.features.filter((f): f is string => typeof f === 'string');
    } else if (typeof raw.features === 'string') {
      features = raw.features.split('\n').map((s) => s.trim()).filter(Boolean);
    }
    if (features.length === 0) {
      if (code === 'FREE') {
        features = [
          '1 GB dung lượng lưu trữ cloud',
          'Tối đa 3 khóa học song song',
          '20 lượt hỏi Trợ lý AI / ngày',
          'Tạo 5 đồ thị tri thức cơ bản',
          'Diễn đàn thảo luận cộng đồng',
        ];
      } else if (code === 'PLUS') {
        features = [
          '15 GB lưu trữ tài liệu & video HD',
          'Tạo tối đa 15 khóa học',
          '300 lượt hỏi AI Socratic / ngày',
          '30 Đồ thị tri thức tương tác',
          'Tự động tạo Quiz từ PDF, Slide',
        ];
      } else if (code === 'PRO') {
        features = [
          '50 GB dung lượng lưu trữ SSD',
          'Quản lý 50 khóa học & nhóm',
          '1.000 lượt AI Deep Reasoning',
          '150 Đồ thị tri thức & Vector Search',
          'Chấm điểm tự luận tự động bằng AI',
        ];
      } else {
        features = [
          '200 GB+ lưu trữ chuyên dụng',
          'Không giới hạn khóa học & sinh viên',
          'Không giới hạn AI Socratic',
          'Tùy biến tên miền riêng & Logo',
          'Hỗ trợ SLA 99.9% 24/7',
        ];
      }
    }
    return {
      id: id || `plan-${code.toLowerCase()}`,
      code,
      name,
      description: raw.description ?? '',
      price,
      yearlyPrice,
      currency: raw.currency ?? 'VND',
      billingCycle: raw.billingCycle ?? (code === 'FREE' ? 'Vĩnh viễn' : 'Tháng'),
      badge:
        raw.badge ??
        (code === 'PLUS' ? 'Khuyên dùng' : code === 'PRO' ? 'Chuyên nghiệp' : undefined),
      isPopular: raw.isPopular ?? code === 'PLUS',
      features,
      maxStorageFormatted:
        raw.maxStorageFormatted ??
        (code === 'FREE' ? '1 GB' : code === 'PLUS' ? '15 GB' : code === 'PRO' ? '50 GB' : '200 GB+'),
      aiDailyRequests:
        raw.aiDailyRequests ??
        (code === 'FREE' ? 20 : code === 'PLUS' ? 300 : code === 'PRO' ? 1000 : 999999),
    };
  });

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;

export const subscribeRequestSchema = z.object({
  planId: z.string().min(1, 'Vui lòng chọn gói dịch vụ'),
  paymentMethod: z.enum(['VNPAY', 'MOMO', 'BANK_TRANSFER', 'CREDIT_CARD']).default('VNPAY'),
  autoRenew: z.boolean().default(true),
  notes: z.string().optional(),
});

export type SubscribeRequest = z.infer<typeof subscribeRequestSchema>;

export const subscriptionHistoryItemSchema = z
  .object({
    id: z.string().optional(),
    invoiceCode: z.string().optional(),
    orderCode: z.string().optional(),
    code: z.string().optional(),
    planName: z.string().optional(),
    amount: z.number().default(0),
    currency: z.string().default('VND'),
    paymentMethod: z.string().default('BANK_TRANSFER'),
    status: z.string().default('SUCCESS'),
    paymentDate: z.string().optional(),
    createdAt: z.string().optional(),
    paidAt: z.string().optional(),
    invoicePdfUrl: z.string().optional(),
  })
  .passthrough()
  .transform((raw) => ({
    id: raw.id ?? raw.orderCode ?? raw.invoiceCode ?? `inv-${Date.now()}`,
    invoiceCode: raw.invoiceCode ?? raw.orderCode ?? raw.code ?? 'INV-PAYMENT',
    planName: raw.planName ?? 'Gói cước ILMS',
    amount: raw.amount ?? 0,
    currency: raw.currency ?? 'VND',
    paymentMethod: raw.paymentMethod ?? 'BANK_TRANSFER',
    status: raw.status ?? 'SUCCESS',
    paymentDate: raw.paymentDate ?? raw.paidAt ?? raw.createdAt ?? new Date().toISOString(),
    invoicePdfUrl: raw.invoicePdfUrl,
  }));

export type SubscriptionHistoryItem = z.infer<typeof subscriptionHistoryItemSchema>;
