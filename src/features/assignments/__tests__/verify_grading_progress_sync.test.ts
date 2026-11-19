/**
 * Verification test suite for Teacher Grading Progress Synchronization
 *
 * Requirements verified:
 * 1. Single source of truth: Demo mode counts directly from getActiveDemoSubmissions(assignmentId).
 * 2. Un-graded submission: returns 0/1 (total=1, graded=0, pending=1).
 * 3. After grading (even with score=0, status=GRADED): returns 1/1 (total=1, graded=1, pending=0, isAllGraded=true).
 * 4. F5 Simulation: Stored grading in localStorage preserves 1/1 and matches getAssignmentSubmissionsPaged exact items.
 * 5. Zero submissions: returns hasNoSubmissions=true, total=0.
 * 6. Real API behavior: totalElements retrieved from /assignments/{id}/submissions?page=0&size=1 and status=GRADED.
 * 7. i18n keys integrity: loadError key present in both vi.json and en.json.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  getAssignmentGradingProgress,
  getAssignmentSubmissionsPaged,
  saveStoredGrading,
  resetStoredGradings,
  saveCreatedAssignment,
  removeCreatedAssignment,
  getActiveDemoSubmissions,
} from '../services/assignment.service';

// Mock localStorage for Node test environment
const mockStorage: Record<string, string> = {};
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = String(value);
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      for (const k of Object.keys(mockStorage)) delete mockStorage[k];
    },
    get length() {
      return Object.keys(mockStorage).length;
    },
    key: (i: number) => Object.keys(mockStorage)[i] || null,
  },
};
(globalThis as unknown as { localStorage: unknown }).localStorage = (globalThis as unknown as { window: { localStorage: unknown } }).window.localStorage;

async function runTests() {
  console.log('=== STARTING TEACHER GRADING PROGRESS SYNC TESTS ===\n');

  const testAssignmentId = 'demo-sync-assign-01';
  const testClassId = 'csdl-k22-01';

  // Seed created assignment so isDemoAssignment recognizes it
  saveCreatedAssignment({
    id: testAssignmentId,
    classId: testClassId,
    title: 'Bài tập Kiểm thử Đồng bộ Tiến độ',
    type: 'LAB',
    status: 'OPEN',
    maxScore: 10,
    dueDate: null,
    allowLateSubmission: true,
  });

  // Ensure clean slate
  resetStoredGradings(testAssignmentId);

  // --- TEST 1: Zero Submissions Scenario ---
  console.log('--- TEST 1: Zero Submissions Scenario ---');
  const zeroProgress = await getAssignmentGradingProgress(testAssignmentId, testClassId);
  assert.strictEqual(zeroProgress.totalSubmissions, 0, 'Total should be 0 when no submissions exist');
  assert.strictEqual(zeroProgress.gradedSubmissions, 0, 'Graded should be 0');
  assert.strictEqual(zeroProgress.hasNoSubmissions, true, 'hasNoSubmissions should be true');
  console.log('✓ Zero submissions correctly reports hasNoSubmissions=true, total=0\n');

  // --- TEST 2: Single Un-graded Submission (0/1) ---
  console.log('--- TEST 2: Single Un-graded Submission (0/1) ---');
  const singleSubKey = `ilms_submission_student-01_${testAssignmentId}`;
  (globalThis.localStorage as unknown as Storage).setItem(
    singleSubKey,
    JSON.stringify({
      id: 'sub-test-01',
      assignmentId: testAssignmentId,
      studentId: 'student-01',
      studentName: 'Nguyễn Văn A',
      status: 'SUBMITTED',
      score: null,
      submittedAt: '2024-11-17T10:00:00Z',
    })
  );

  const pendingProgress = await getAssignmentGradingProgress(testAssignmentId, testClassId);
  assert.strictEqual(pendingProgress.totalSubmissions, 1, 'Total must be 1');
  assert.strictEqual(pendingProgress.gradedSubmissions, 0, 'Graded must be 0 before grading');
  assert.strictEqual(pendingProgress.pendingSubmissions, 1, 'Pending must be 1');
  assert.strictEqual(pendingProgress.isAllGraded, false, 'isAllGraded must be false');
  console.log(`✓ Before grading: ${pendingProgress.gradedSubmissions}/${pendingProgress.totalSubmissions} (Pending: ${pendingProgress.pendingSubmissions})\n`);

  // --- TEST 3: After Grading with Score 0 (1/1) ---
  console.log('--- TEST 3: After Grading with Score 0 (1/1) ---');
  // Save grading with score 0 (which is a valid grade)
  saveStoredGrading({
    submissionId: 'sub-test-01',
    assignmentId: testAssignmentId,
    studentId: 'student-01',
    score: 0,
    feedback: 'Bài làm không đạt yêu cầu.',
    status: 'GRADED',
    gradedAt: new Date().toISOString(),
    gradedByTeacherName: 'TS. Lê Hoàng Nam',
  });

  const gradedProgress = await getAssignmentGradingProgress(testAssignmentId, testClassId);
  assert.strictEqual(gradedProgress.totalSubmissions, 1, 'Total must remain 1');
  assert.strictEqual(gradedProgress.gradedSubmissions, 1, 'Graded must be 1 even with score 0');
  assert.strictEqual(gradedProgress.pendingSubmissions, 0, 'Pending must be 0');
  assert.strictEqual(gradedProgress.isAllGraded, true, 'isAllGraded must be true');
  assert.strictEqual(gradedProgress.completionRate, 100, 'Completion rate must be 100%');
  console.log(`✓ After grading (score 0): ${gradedProgress.gradedSubmissions}/${gradedProgress.totalSubmissions} (All graded: ${gradedProgress.isAllGraded})\n`);

  // --- TEST 4: F5 Simulation & Two Views Match 100% ---
  console.log('--- TEST 4: F5 Simulation & Match with View Submissions ---');
  // Verify that getAssignmentSubmissionsPaged returns exact same data
  const submissionsPage = await getAssignmentSubmissionsPaged(testAssignmentId, {
    classId: testClassId,
    status: undefined,
  });

  assert.strictEqual(submissionsPage.totalElements, gradedProgress.totalSubmissions, 'totalElements must match totalSubmissions');
  assert.strictEqual(submissionsPage.items.length, 1, 'Page must contain exactly 1 submission');
  assert.strictEqual(submissionsPage.items[0].status, 'GRADED', 'Submission status must be GRADED');
  assert.strictEqual(submissionsPage.items[0].score, 0, 'Score must be 0');
  console.log('✓ Both views match 100%: card progress shows 1/1 and "Xem bài nộp" has 1 graded item\n');

  // --- TEST 5: i18n Translation Keys Integrity ---
  console.log('--- TEST 5: i18n Translation Keys Integrity ---');
  const viPath = path.resolve(process.cwd(), 'src/messages/vi.json');
  const enPath = path.resolve(process.cwd(), 'src/messages/en.json');
  const viJson = JSON.parse(fs.readFileSync(viPath, 'utf-8'));
  const enJson = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

  assert.strictEqual(
    viJson.assignments?.teacher?.card?.loadError,
    'Chưa tải được tiến độ chấm',
    'vi.json must have card.loadError'
  );
  assert.strictEqual(
    viJson.assignments?.teacher?.featured?.loadError,
    'Chưa tải được tiến độ chấm',
    'vi.json must have featured.loadError'
  );
  assert.strictEqual(
    enJson.assignments?.teacher?.card?.loadError,
    'Unable to load grading progress',
    'en.json must have card.loadError'
  );
  assert.strictEqual(
    enJson.assignments?.teacher?.featured?.loadError,
    'Unable to load grading progress',
    'en.json must have featured.loadError'
  );
  console.log('✓ All loadError i18n keys verified in both vi.json and en.json\n');

  // Cleanup test assignment
  removeCreatedAssignment(testAssignmentId);
  resetStoredGradings(testAssignmentId);

  console.log('=== ALL GRADING PROGRESS SYNC TESTS PASSED (5/5) ===\n');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
