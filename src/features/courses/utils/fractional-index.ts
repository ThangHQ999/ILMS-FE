const DEFAULT_STEP = 1000.0;
const MIN_GAP = 1e-6;

/**
 * Computes a new fractional orderIndex between two neighboring blocks.
 */
export function computeOrderIndexBetween(
  prevOrder?: number | null,
  nextOrder?: number | null
): number {
  if (prevOrder != null && nextOrder != null) {
    return (prevOrder + nextOrder) / 2;
  }
  if (prevOrder != null) {
    return prevOrder + DEFAULT_STEP;
  }
  if (nextOrder != null) {
    return nextOrder / 2;
  }
  return DEFAULT_STEP;
}

/**
 * Checks if two adjacent blocks are too close to keep dividing floating-point order indices.
 */
export function needsRebalance(
  prevOrder?: number | null,
  nextOrder?: number | null
): boolean {
  if (prevOrder == null || nextOrder == null) return false;
  return Math.abs(nextOrder - prevOrder) < MIN_GAP;
}

/**
 * Re-spaces blocks cleanly to multiples of 1000.0.
 */
export function rebalanceBlockIndices<T extends { orderIndex: number }>(
  blocks: T[]
): T[] {
  return blocks.map((block, idx) => ({
    ...block,
    orderIndex: (idx + 1) * DEFAULT_STEP,
  }));
}
