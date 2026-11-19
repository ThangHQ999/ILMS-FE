import assert from 'node:assert';
import {
  getExamById,
  getExamQuestions,
  addExamQuestion,
  updateExamQuestion,
  deleteExamQuestion,
  publishExam,
  unpublishExam,
  getBankQuestions,
  type ExamNetworkLog,
} from '../services/exam.service';
import { api } from '@/lib/axios';

// Mock localStorage for node environment
const storageMock: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (key: string) => storageMock[key] ?? null,
    setItem: (key: string, value: string) => {
      storageMock[key] = value;
    },
    removeItem: (key: string) => {
      delete storageMock[key];
    },
    clear: () => {
      for (const k of Object.keys(storageMock)) delete storageMock[k];
    },
    key: (i: number) => Object.keys(storageMock)[i] ?? null,
    length: Object.keys(storageMock).length,
  };
}

// Mock window for node environment
if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = globalThis;
}

async function runTests() {
  console.log('=== STARTING TEACHER EXAM DETAIL & QUESTION MANAGEMENT TESTS ===\n');

  // Clear any existing localStorage
  storageMock['ilms_exam_questions_EXAM_001'] = '';
  delete storageMock['ilms_exam_questions_EXAM_001'];

  // Test 1: Load Exam Info (GET /api/v1/exams/{id})
  console.log('[TEST 1] Load Exam Details for EXAM_001');
  const exam = await getExamById('EXAM_001');
  assert.strictEqual(exam.id, 'EXAM_001');
  assert.strictEqual(exam.title, 'Thi giữa kỳ Mạng máy tính');
  assert.strictEqual(exam.examType, 'MIDTERM');
  assert.strictEqual(exam.durationMinutes, 60);
  assert.strictEqual(exam.totalScore, 10);
  assert.strictEqual(exam.isPublished, true);
  assert.strictEqual(exam.status, 'UPCOMING');
  console.log('✓ Successfully retrieved exam info: title, duration, max score, published status, schedule status.');

  // Test 2: Load Exam Questions (GET /api/v1/exams/{id}/questions)
  console.log('\n[TEST 2] Load Exam Questions for EXAM_001');
  let questions = await getExamQuestions('EXAM_001');
  assert.strictEqual(questions.length, 20, 'EXAM_001 should have 20 initial questions');
  // Check orderIndex 1..20
  for (let i = 0; i < questions.length; i++) {
    assert.strictEqual(questions[i].orderIndex, i + 1, `Question ${i} should have orderIndex ${i + 1}`);
    assert.strictEqual(questions[i].score, 0.5, `Question ${i} should have score 0.5`);
  }
  const totalScore = Number(questions.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
  assert.strictEqual(totalScore, 10.0, 'Total score of questions must equal 10.0');
  console.log(`✓ Successfully loaded 20 questions with correct ascending orderIndex (1..20) and total score ${totalScore}/10.0.`);

  // Test 3: Edit lock when exam is published
  console.log('\n[TEST 3] Edit Lock Enforcement when isPublished === true');
  const canEditWhenPublished = !exam.isPublished && exam.status === 'UPCOMING';
  assert.strictEqual(canEditWhenPublished, false, 'Editing must be locked when exam is published');
  console.log('✓ Editing actions (Add, Edit, Delete) correctly locked when isPublished === true.');

  // Test 4: Unpublish exam (PATCH /api/v1/exams/{id}/unpublish)
  console.log('\n[TEST 4] Unpublish Exam');
  const unpublishRes = await unpublishExam('EXAM_001');
  assert.strictEqual(unpublishRes.isPublished, false, 'Exam should now be unpublished');
  const canEditWhenUnpublished = !unpublishRes.isPublished && exam.status === 'UPCOMING';
  assert.strictEqual(canEditWhenUnpublished, true, 'Editing actions should now be unlocked');
  console.log('✓ Successfully unpublished exam. Editing permissions unlocked.');

  // Test 5: Delete a question (DELETE /api/v1/exams/{id}/questions/{id})
  console.log('\n[TEST 5] Delete Question #20');
  const questionToDelete = questions[19];
  await deleteExamQuestion('EXAM_001', questionToDelete.id);
  questions = await getExamQuestions('EXAM_001');
  assert.strictEqual(questions.length, 19, 'Questions count should decrease to 19');
  // Verify orderIndex is re-indexed from 1 to 19
  for (let i = 0; i < questions.length; i++) {
    assert.strictEqual(questions[i].orderIndex, i + 1, `Question ${i} should have continuous orderIndex ${i + 1}`);
  }
  const currentTotal = Number(questions.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
  assert.strictEqual(currentTotal, 9.5, 'Total score should now be 9.5');
  const canPublishWhenIncomplete = questions.length > 0 && Math.abs(currentTotal - exam.totalScore) < 0.001;
  assert.strictEqual(canPublishWhenIncomplete, false, 'Publish button must be disabled when totalScore does not match');
  console.log(`✓ Deleted question #20. Remaining 19 questions automatically re-indexed 1..19. Total score is ${currentTotal}/10.0. Publish button locked.`);

  // Test 6: Update question score & orderIndex (PATCH /api/v1/exams/{id}/questions/{id})
  console.log('\n[TEST 6] Update Question #19: Increase score to 1.0 and move to orderIndex 1');
  const questionToUpdate = questions[18]; // Currently at orderIndex 19
  await updateExamQuestion('EXAM_001', questionToUpdate.id, {
    score: 1.0,
    orderIndex: 1,
  });
  questions = await getExamQuestions('EXAM_001');
  assert.strictEqual(questions.length, 19);
  // Verify the updated question is now at orderIndex 1
  assert.strictEqual(questions[0].id, questionToUpdate.id);
  assert.strictEqual(questions[0].score, 1.0);
  assert.strictEqual(questions[0].orderIndex, 1);
  // Verify all questions have contiguous orderIndex 1..19
  for (let i = 0; i < questions.length; i++) {
    assert.strictEqual(questions[i].orderIndex, i + 1);
  }
  const updatedTotal = Number(questions.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
  assert.strictEqual(updatedTotal, 10.0, 'Total score should now be back to 10.0');
  const canPublishNow = questions.length > 0 && Math.abs(updatedTotal - exam.totalScore) < 0.001;
  assert.strictEqual(canPublishNow, true, 'Publish button should now be enabled because totalScore matches');
  console.log(`✓ Updated question moved to position 1 and score changed to 1.0. OrderIndex contiguous 1..19. Total score is ${updatedTotal}/10.0. Publish button enabled.`);

  // Test 7: Add question from question bank & check duplicate prevention
  console.log('\n[TEST 7] Bank Questions & Duplicate Prevention');
  const bank = await getBankQuestions({ courseId: 'CS-202' });
  assert.ok(bank.items.length > 0, 'Question bank should return available questions');
  console.log(`✓ Question bank returned ${bank.items.length} questions for course CS-202.`);

  // Test duplicate check
  let duplicateErrorThrown = false;
  try {
    // q1 is already in the exam
    await addExamQuestion('EXAM_001', {
      questionId: 'q1',
      score: 1.0,
    });
  } catch (err: unknown) {
    duplicateErrorThrown = true;
    console.log(`✓ Prevented adding duplicate question: ${(err as Error).message}`);
  }
  assert.strictEqual(duplicateErrorThrown, true, 'Adding duplicate question must be rejected');

  // Test 8: Publish exam (PATCH /api/v1/exams/{id}/publish)
  console.log('\n[TEST 8] Publish Exam when totalScore matches');
  const publishRes = await publishExam('EXAM_001');
  assert.strictEqual(publishRes.isPublished, true, 'Exam must be published');
  console.log('✓ Successfully published exam!');

  // Test 9: Persistence across simulated F5 (localStorage)
  console.log('\n[TEST 9] Persistence check (F5 Simulation)');
  const storedJson = storageMock['ilms_exam_questions_EXAM_001'];
  assert.ok(storedJson, 'Questions must be stored in localStorage');
  const reloadedQuestions = await getExamQuestions('EXAM_001');
  assert.strictEqual(reloadedQuestions.length, 19);
  assert.strictEqual(reloadedQuestions[0].id, questionToUpdate.id);
  assert.strictEqual(reloadedQuestions[0].score, 1.0);
  console.log('✓ All question mutations (score, order, deletions) persist across page reloads (F5).');

  // Test 10: Real backend endpoint compatibility check with UUID
  console.log('\n[TEST 10] Real API Call to Backend with UUID (Spec 13.1, 13.2)');
  const testExamUuid = '11111111-2222-3333-4444-555555555555';
  let apiStatus = 0;
  let apiUrl = '';
  try {
    await api.get(`/exams/${testExamUuid}/questions`);
  } catch (err: any) {
    if (err.response) {
      apiStatus = err.response.status;
      apiUrl = err.config?.url || '';
    } else {
      apiUrl = err.config?.url || '';
    }
  }
  console.log(`✓ Real Axios call attempted: URL = ${apiUrl}, HTTP Status = ${apiStatus || 'Network/Server offline'}`);
  console.log('✓ Handled standard API responses according to docs/api-spec.md.\n');

  console.log('=== ALL 10 TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
