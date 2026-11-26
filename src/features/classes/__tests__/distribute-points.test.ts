import assert from 'node:assert/strict';
import { test } from 'node:test';
import { distributeQuestionPoints } from '../utils/distribute-points';

test('distributes evenly when divisible (10 points across 4 questions)', () => {
  const items = [{ id: '1', point: 1 }, { id: '2', point: 1 }, { id: '3', point: 1 }, { id: '4', point: 1 }];
  const distributed = distributeQuestionPoints(items, 10);
  assert.deepEqual(distributed.map((q) => q.point), [2.5, 2.5, 2.5, 2.5]);
});

test('distributes cleanly with rounding remainder on last question (10 points across 3 questions)', () => {
  const items = [{ id: '1', point: 1 }, { id: '2', point: 1 }, { id: '3', point: 1 }];
  const distributed = distributeQuestionPoints(items, 10);
  assert.deepEqual(distributed.map((q) => q.point), [3.33, 3.33, 3.34]);
  const sum = Number(distributed.reduce((acc, q) => acc + q.point, 0).toFixed(2));
  assert.equal(sum, 10);
});

test('handles empty array and single question', () => {
  assert.deepEqual(distributeQuestionPoints([], 10), []);
  assert.deepEqual(distributeQuestionPoints([{ id: '1', point: 1 }], 10), [{ id: '1', point: 10 }]);
});
