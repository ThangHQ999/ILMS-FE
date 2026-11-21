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
