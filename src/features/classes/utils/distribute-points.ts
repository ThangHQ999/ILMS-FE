/**
 * Evenly distribute `totalScore` across `questions` rounded to 2 decimal places,
 * placing any rounding remainder on the last question so the sum matches `totalScore` exactly.
 */
export function distributeQuestionPoints<T extends { point: number }>(
  questions: T[],
  totalScore: number
): T[] {
  const count = questions.length;
  if (count === 0) return questions;

  const safeTotal = Number.isFinite(totalScore) && totalScore > 0 ? totalScore : count;
  const totalCents = Math.round(safeTotal * 100);
  const baseCents = Math.floor(totalCents / count);
  const remainderCents = totalCents - baseCents * count;

  return questions.map((question, index) => {
    const cents = index === count - 1 ? baseCents + remainderCents : baseCents;
    return {
      ...question,
      point: Number((cents / 100).toFixed(2)),
    };
  });
}
