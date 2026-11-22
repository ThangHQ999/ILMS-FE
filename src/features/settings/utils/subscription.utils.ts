const PLAN_TIER_RANK: Record<string, number> = {
  FREE: 0,
  PLUS: 1,
  PRO: 2,
  ENTERPRISE: 3,
};

/**
 * Formats an ISO date string into a localized DD/MM/YYYY (or MM/DD/YYYY) string.
 */
export function formatSubscriptionDate(
  rawDate: string | null | undefined,
  locale: string
): string | null {
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

/**
 * Formats an ISO date string into a localized HH:mm, DD/MM/YYYY string.
 */
export function formatPaymentDateTime(
  rawDate: string | null | undefined,
  locale = 'vi'
): string {
  if (!rawDate) return '--';
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;

  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

/**
 * Returns user-friendly label for payment method codes.
 */
export function getPaymentMethodDisplay(method: string | null | undefined): string {
  if (!method) return 'Chuyển khoản';
  const upper = method.toUpperCase();
  if (upper.includes('VIETQR') || upper.includes('SEPAY')) return 'VietQR (SePay)';
  if (upper.includes('VNPAY')) return 'VNPay';
  if (upper.includes('MOMO')) return 'Ví MoMo';
  if (upper.includes('CREDIT') || upper.includes('CARD') || upper.includes('STRIPE'))
    return 'Thẻ Visa/Master';
  if (upper.includes('BANK')) return 'Chuyển khoản';
  return method;
}

/**
 * Returns true when switching from the current plan to a lower-tier plan.
 */
export function isSubscriptionDowngrade(
  currentPlanCode: string | null | undefined,
  targetPlanCode: string | null | undefined,
  currentPrice?: number,
  targetPrice?: number
): boolean {
  if (!currentPlanCode || !targetPlanCode) return false;
  const currentNorm = currentPlanCode.toUpperCase();
  const targetNorm = targetPlanCode.toUpperCase();
  if (currentNorm === targetNorm) return false;

  const currentRank = PLAN_TIER_RANK[currentNorm];
  const targetRank = PLAN_TIER_RANK[targetNorm];
  if (currentRank !== undefined && targetRank !== undefined) {
    return targetRank < currentRank;
  }

  if (typeof currentPrice === 'number' && typeof targetPrice === 'number') {
    return targetPrice < currentPrice;
  }

  return false;
}
