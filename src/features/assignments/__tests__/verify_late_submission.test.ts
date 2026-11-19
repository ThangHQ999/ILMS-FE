import {
  calculateIsLate,
  normalizeSubmissionIsLate,
  formatSubmissionTime,
  getLocalSubmission,
  getMySubmission,
  saveLocalSubmission,
  deleteSubmission,
  MOCK_ASSIGNMENTS,
} from '../services/assignment.service';
import type { MySubmission } from '../types';

// Mock localStorage in Node.js environment
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
  length: 0,
  key: () => null,
} as unknown as Storage;
// @ts-expect-error mock window
globalThis.window = {} as unknown as Window;

async function runTests() {
  console.log('=== RUNNING LATE SUBMISSION VERIFICATION TESTS ===\n');

  // Test 1: calculateIsLate directly
  console.log('--- Test 1: calculateIsLate unit tests ---');
  // 1a. Normal late: 2026-11-14T23:49:00 vs 2024-10-28T23:59:00
  const late1 = calculateIsLate('2026-11-14T23:49:00', '2024-10-28T23:59:00');
  console.log(`1a. 14/11/2026 > 28/10/2024: expected true -> got ${late1}`);
  if (late1 !== true) throw new Error('1a failed');

  // 1b. On time: 2024-10-28T20:00:00 vs 2024-10-28T23:59:00
  const onTime = calculateIsLate('2024-10-28T20:00:00', '2024-10-28T23:59:00');
  console.log(`1b. On time: expected false -> got ${onTime}`);
  if (onTime !== false) throw new Error('1b failed');

  // 1c. No deadline (dueDate == null)
  const noDeadline = calculateIsLate('2026-11-14T23:49:00', null);
  console.log(`1c. No deadline (dueDate == null): expected false -> got ${noDeadline}`);
  if (noDeadline !== false) throw new Error('1c failed');

  // 1d. Invalid dates
  const invalidDate = calculateIsLate('invalid-date', '2024-10-28T23:59:00');
  console.log(`1d. Invalid date: expected false -> got ${invalidDate}`);
  if (invalidDate !== false) throw new Error('1d failed');

  // Test 2: normalizeSubmissionIsLate
  console.log('\n--- Test 2: normalizeSubmissionIsLate unit tests ---');
  const subDb01: MySubmission = {
    id: 'sub-test-01',
    assignmentId: 'assign-db-01',
    status: 'SUBMITTED',
    submittedAt: '2026-11-14T23:49:00',
    attachmentUrls: [],
    // isLate is undefined initially (simulating legacy/unnormalized data)
  };
  const norm1 = normalizeSubmissionIsLate(subDb01, '2024-10-28T23:59:00');
  console.log(`2a. BT1 with unnormalized isLate: isLate=${norm1.isLate}`);
  if (norm1.isLate !== true) throw new Error('2a failed');

  const subDb03: MySubmission = {
    id: 'sub-test-03',
    assignmentId: 'assign-db-03',
    status: 'SUBMITTED',
    submittedAt: '2026-11-14T23:49:00',
    attachmentUrls: [],
  };
  const norm3 = normalizeSubmissionIsLate(subDb03, null);
  console.log(`2b. BT3 (no deadline): isLate=${norm3.isLate}`);
  if (norm3.isLate !== false) throw new Error('2b failed');

  // Test 3: BT1 submitted at 23:49 on 14/11/2026 in localStorage & F5
  console.log('\n--- Test 3: BT1 saved at 23:49 14/11/2026 in localStorage & simulated F5 ---');
  // Store submission in localStorage WITHOUT isLate (representing the existing user submission)
  const userSubmissionRecord = {
    id: 'sub-assign-db-01',
    assignmentId: 'assign-db-01',
    status: 'SUBMITTED',
    submittedAt: '2026-11-14T23:49:00.000Z',
    submissionAttempt: 1,
    content: 'Kính gửi thầy Nam, em gửi bài làm bài tập chuẩn hóa CSDL...',
  };
  mockStorage['ilms_submission_student-k22-vu-minh_assign-db-01'] = JSON.stringify(userSubmissionRecord);

  // Read via getMySubmission
  const readSub1 = await getMySubmission('assign-db-01', 'student-k22-vu-minh');
  console.log('3a. After reading from localStorage:');
  console.log(`    Status: ${readSub1.status}`);
  console.log(`    SubmittedAt: ${readSub1.submittedAt}`);
  console.log(`    isLate: ${readSub1.isLate}`);
  if (readSub1.isLate !== true || readSub1.status !== 'SUBMITTED') {
    throw new Error('3a failed: expected isLate=true, status=SUBMITTED');
  }

  // Simulate F5 (page reload: call getMySubmission again)
  const readSub1Reload = await getMySubmission('assign-db-01', 'student-k22-vu-minh');
  console.log('3b. After simulated F5:');
  console.log(`    Status: ${readSub1Reload.status}`);
  console.log(`    SubmittedAt: ${readSub1Reload.submittedAt}`);
  console.log(`    isLate: ${readSub1Reload.isLate}`);
  if (readSub1Reload.isLate !== true || readSub1Reload.status !== 'SUBMITTED') {
    throw new Error('3b failed: expected isLate=true after F5');
  }

  // Test 4: BT3 assign-db-03 (Luyện tập tự do, dueDate = null)
  console.log('\n--- Test 4: BT3 assign-db-03 without deadline ---');
  const userSub3Record = {
    id: 'sub-assign-db-03',
    assignmentId: 'assign-db-03',
    status: 'SUBMITTED',
    submittedAt: '2026-11-14T23:49:00.000Z',
    content: 'SQL CTE query...',
  };
  mockStorage['ilms_submission_student-k22-vu-minh_assign-db-03'] = JSON.stringify(userSub3Record);
  const readSub3 = await getMySubmission('assign-db-03', 'student-k22-vu-minh');
  console.log(`    BT3 isLate: ${readSub3.isLate} (expected false)`);
  if (readSub3.isLate !== false) {
    throw new Error('Test 4 failed: BT3 must have isLate=false');
  }

  // Test 5: Cancellation check (NOT_SUBMITTED)
  console.log('\n--- Test 5: Cancel submission and verify NOT_SUBMITTED has isLate=false ---');
  await deleteSubmission('sub-assign-db-01', 'assign-db-01', 'student-k22-vu-minh');
  const cancelledSub = await getMySubmission('assign-db-01', 'student-k22-vu-minh');
  console.log(`    Cancelled status: ${cancelledSub.status}, isLate: ${cancelledSub.isLate}`);
  if (cancelledSub.status !== 'NOT_SUBMITTED' || cancelledSub.isLate !== false) {
    throw new Error('Test 5 failed: cancelled submission should be NOT_SUBMITTED with isLate=false');
  }

  // Test 6: formatSubmissionTime formatting
  console.log('\n--- Test 6: formatSubmissionTime tests ---');
  // Construct a known local Date: 2026-11-14 23:49
  const testDate = new Date(2026, 10, 14, 23, 49, 0);
  const formattedObj = formatSubmissionTime(testDate.toISOString());
  console.log(`    time: "${formattedObj.time}", date: "${formattedObj.date}", formatted: "${formattedObj.formatted}"`);
  if (formattedObj.time !== '23:49' || formattedObj.date !== '14/11/2026' || formattedObj.formatted !== '23:49 - 14/11/2026') {
    throw new Error(`Test 6 failed: unexpected formatted output "${formattedObj.formatted}"`);
  }

  console.log('\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
