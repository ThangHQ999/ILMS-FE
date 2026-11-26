import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  AZOTA_SAMPLE_TEXT,
  applyAnswerAndDifficultyOverrides,
  parseAzotaQuestionsText,
  parseQuickAnswerKey,
} from '../utils/azota-question-parser';

test('parses single choice, multiple choice, and answer-line questions accurately', () => {
  const parsed = parseAzotaQuestionsText(AZOTA_SAMPLE_TEXT);
  assert.equal(parsed.length, 3);

  assert.equal(parsed[0].questionType, 'SINGLE_CHOICE');
  assert.equal(parsed[0].isValid, true);
  assert.equal(parsed[0].options[1].isCorrect, true);
  assert.ok(parsed[0].explanation.includes('IP'));

  assert.equal(parsed[1].questionType, 'MULTIPLE_CHOICE');
  assert.equal(parsed[1].isValid, true);
  assert.equal(
    parsed[1].options.filter((o) => o.isCorrect).map((o) => o.letter).join(','),
    'A,B'
  );

  assert.equal(parsed[2].questionType, 'SINGLE_CHOICE');
  assert.equal(parsed[2].isValid, true);
  assert.equal(parsed[2].options[1].isCorrect, true);
});

test('flags missing correct answer and resolves when quick answer key override is applied', () => {
  const raw = `Câu 1: 2 + 2 bằng mấy?
A. 3
B. 4
C. 5
D. 6`;

  const parsed = parseAzotaQuestionsText(raw);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].isValid, false);
  assert.ok(parsed[0].issues.some((i) => i.includes('Chưa chọn đáp án đúng')));

  const keyMap = parseQuickAnswerKey('1B');
  const resolved = applyAnswerAndDifficultyOverrides(parsed, keyMap, {});
  assert.equal(resolved[0].isValid, true);
  assert.equal(resolved[0].options[1].isCorrect, true);
});
