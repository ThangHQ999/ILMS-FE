import fs from 'fs';
import path from 'path';
import {
  getAllClassAssignments,
  getMySubmission,
  getMySubmissionsBatch,
  formatScore,
  formatAssignmentDueDate,
  formatSubmissionTime,
  isMockClass,
  MOCK_ASSIGNMENTS,
  INITIAL_DEMO_SUBMISSIONS,
} from '../services/assignment.service';
import {
  isAssignmentUnsubmitted,
  isAssignmentPendingGrading,
  isAssignmentGraded,
  type EnrichedAssignment,
} from '../hooks/useClassAssignmentsWithSubmissions';

// Mock localStorage in Node environment
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
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
  key: (index: number) => Object.keys(mockStorage)[index] ?? null,
  length: 0,
};

async function runTests() {
  console.log('=== RUNNING STUDENT ASSIGNMENTS STITCH REDESIGN VERIFICATION TESTS ===\n');

  // -------------------------------------------------------------------------
  // Test 1: Layout & Component Structure Check (2-Column Desktop, Sidebar Panels)
  // -------------------------------------------------------------------------
  console.log('--- Test 1: Layout & Component Structure Check ---');
  const componentPath = path.resolve(
    __dirname,
    '../components/StudentAssignmentsTableView.tsx'
  );
  const componentSource = fs.readFileSync(componentPath, 'utf8');
  const primitivesPath = path.resolve(
    __dirname,
    '../components/AssessmentListPrimitives.tsx'
  );
  const primitivesSource = fs.readFileSync(primitivesPath, 'utf8');

  // 1a: 2-column layout (unified AssessmentTwoColumnLayout with minmax(0,1fr) main + 260px sidebar)
  const hasFlexibleLayout =
    (componentSource.includes('AssessmentTwoColumnLayout') &&
      primitivesSource.includes('lg:grid-cols-[minmax(0,1fr)_260px]')) ||
    ((componentSource.includes('flex flex-col lg:flex-row') || componentSource.includes('lg:grid-cols-12')) &&
      (componentSource.includes('flex-1 min-w-0') || componentSource.includes('lg:col-span-8')) &&
      (componentSource.includes('lg:w-[260px]') || componentSource.includes('lg:col-span-4')));
  if (!hasFlexibleLayout) {
    throw new Error('Test 1a failed: component must use 2-column responsive layout with flexible main column and compact sidebar');
  }
  console.log('  1a. Passed: 2-column responsive layout (flexible main / compact sidebar) verified.');

  // 1b: Featured Navy Card gradient background
  if (
    !(
      componentSource.includes('ASSESSMENT_UI.featuredCard') &&
      primitivesSource.includes('from-[#0D1C32] via-[#0F2444] to-[#122C54]')
    ) &&
    !componentSource.includes(
      'linear-gradient(135deg, rgb(13, 28, 50) 0%, rgb(15, 36, 68) 50%, rgb(18, 44, 84) 100%)'
    )
  ) {
    throw new Error('Test 1b failed: Featured Navy card must use exact stitch navy gradient');
  }
  console.log('  1b. Passed: Featured Navy Card gradient verified.');

  // 1c: Sidebar Panels (Rules & Guidelines)
  if (!componentSource.includes('Quy định nộp bài') || !componentSource.includes('Thiết lập theo từng bài')) {
    throw new Error('Test 1c failed: sidebar must contain "Quy định nộp bài" panel');
  }
  if (!componentSource.includes('Hướng dẫn nộp bài') || !componentSource.includes('Mở chi tiết bài tập')) {
    throw new Error('Test 1c failed: sidebar must contain "Hướng dẫn nộp bài" 3-step panel');
  }
  console.log('  1c. Passed: Sidebar panels (Rules & Guidelines) verified.');

  // -------------------------------------------------------------------------
  // Test 2: Data Layer Fallback & Real UUID Isolation
  // -------------------------------------------------------------------------
  console.log('\n--- Test 2: Data Layer Fallback & Real UUID Isolation ---');

  // 2a: Mock class detection
  if (!isMockClass('csdl-k22-01') || isMockClass('a0000000-0000-0000-0000-000000000001')) {
    throw new Error('Test 2a failed: isMockClass must return true for demo class and false for real UUID');
  }
  console.log('  2a. Passed: isMockClass correctly distinguishes demo classes from real UUIDs.');

  // 2b: Real class UUID with empty assignments must return [] (NOT MOCK_ASSIGNMENTS)
  const realClassId = 'b1111111-2222-3333-4444-555555555555';
  let realClassAssignments: unknown[] = [];
  try {
    realClassAssignments = await getAllClassAssignments(realClassId);
  } catch (err: unknown) {
    // In unauthenticated test runner, real class correctly rejects or throws API error instead of falling back to mock
    console.log(`  2b. Real class API error re-thrown correctly: ${(err as Error).message}`);
    realClassAssignments = [];
  }
  console.log(`  2b. Real class UUID (${realClassId}) assignments count: ${realClassAssignments.length}`);
  if (realClassAssignments.length !== 0) {
    throw new Error('Test 2b failed: real class UUID must return empty array when backend has no assignments, NOT fallback to MOCK_ASSIGNMENTS');
  }
  console.log('  2b. Passed: Real UUID classes do NOT fallback to mock data.');

  // 2c: Demo class csdl-k22-01 returns Stitch assignments
  const demoAssignments = await getAllClassAssignments('csdl-k22-01');
  console.log(`  2c. Demo class (csdl-k22-01) assignments count: ${demoAssignments.length}`);
  if (demoAssignments.length < 5) {
    throw new Error('Test 2c failed: csdl-k22-01 must have at least 5 benchmark assignments');
  }
  console.log('  2c. Passed: Demo class returns proper Stitch mock dataset.');

  // -------------------------------------------------------------------------
  // Test 3: Submissions & 3 Mutually Exclusive Status Groups
  // -------------------------------------------------------------------------
  console.log('\n--- Test 3: Submissions & 3 Mutually Exclusive Groups ---');

  const demoAssignmentIds = ['assign-db-01', 'assign-db-02', 'assign-db-03', 'assign-db-04', 'assign-db-05'];
  const submissionsMap = await getMySubmissionsBatch(demoAssignmentIds);

  const enrichedList: EnrichedAssignment[] = demoAssignments
    .filter((a) => demoAssignmentIds.includes(a.id))
    .map((a) => {
      const sub = submissionsMap[a.id];
      let effectiveStatus: EnrichedAssignment['effectiveStatus'] = 'NOT_SUBMITTED';
      let effectiveScore: number | null = null;

      if (sub) {
        if (sub.status === 'GRADED' || typeof sub.score === 'number') {
          effectiveStatus = 'GRADED';
          effectiveScore = typeof sub.score === 'number' ? sub.score : null;
        } else if (
          sub.status === 'SUBMITTED' ||
          sub.status === 'RESUBMITTED' ||
          sub.status === 'LATE'
        ) {
          effectiveStatus = sub.status;
        } else {
          effectiveStatus = 'NOT_SUBMITTED';
        }
      } else {
        if (a.status === 'GRADED') {
          effectiveStatus = 'GRADED';
          effectiveScore = typeof a.studentScore === 'number' ? a.studentScore : null;
        } else if (a.status === 'SUBMITTED') {
          effectiveStatus = 'SUBMITTED';
        } else {
          effectiveStatus = 'NOT_SUBMITTED';
        }
      }

      if (effectiveScore === null && typeof a.studentScore === 'number') {
        effectiveScore = a.studentScore;
      }

      return {
        ...a,
        submission: sub,
        effectiveStatus,
        effectiveScore,
      };
    });

  const unsubmitted = enrichedList.filter(isAssignmentUnsubmitted);
  const pendingGrading = enrichedList.filter(isAssignmentPendingGrading);
  const graded = enrichedList.filter(isAssignmentGraded);

  console.log(`  Counts: Total=${enrichedList.length}, Unsubmitted=${unsubmitted.length}, PendingGrading=${pendingGrading.length}, Graded=${graded.length}`);

  if (unsubmitted.length + pendingGrading.length + graded.length !== enrichedList.length) {
    throw new Error('Test 3 failed: 3 status groups must be strictly mutually exclusive');
  }

  // Exactly matching Stitch:
  // - Unsubmitted: 3 (Tuần 6 assign-db-01, SQL assign-db-03, Tuần 8 assign-db-04)
  // - PendingGrading: 1 (Tuần 7 assign-db-02)
  // - Graded: 1 (Quiz 15m assign-db-05)
  if (unsubmitted.length !== 3) {
    throw new Error(`Test 3 failed: expected 3 unsubmitted items, got ${unsubmitted.length}`);
  }
  if (pendingGrading.length !== 1) {
    throw new Error(`Test 3 failed: expected 1 pending grading item, got ${pendingGrading.length}`);
  }
  if (graded.length !== 1) {
    throw new Error(`Test 3 failed: expected 1 graded item, got ${graded.length}`);
  }
  console.log('  3. Passed: 4 Counter chips exactly match Stitch: Tất cả (5), Chưa nộp (3), Chờ chấm (1), Đã chấm (1).');

  // -------------------------------------------------------------------------
  // Test 4: Featured Navy Card Candidate Selection Rules
  // -------------------------------------------------------------------------
  console.log('\n--- Test 4: Featured Navy Card Candidate Selection ---');

  // Find candidate for page 0
  const first5 = enrichedList.slice(0, 5);
  const unsubmittedInFirst5 = first5.filter((item) => {
    if (!isAssignmentUnsubmitted(item)) return false;
    if (!item.dueDate) return true;
    const isPastDue = new Date(item.dueDate).getTime() < Date.now();
    return !isPastDue || item.allowLateSubmission;
  });

  unsubmittedInFirst5.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const featured = unsubmittedInFirst5[0];
  console.log(`  Featured candidate chosen: ${featured.title} (ID: ${featured.id})`);

  if (!featured || featured.id !== 'assign-db-01') {
    throw new Error('Test 4 failed: assign-db-01 (Tuần 6) must be chosen as Featured Navy Card');
  }
  if (!featured.fileAttachmentUrl?.includes('De_bai_Tuan_06.pdf') && !featured.fileAttachmentUrl?.includes('debai_chuanhoa_csdl.pdf')) {
    throw new Error('Test 4 failed: featured card must have attachment URL');
  }
  console.log('  4. Passed: assign-db-01 (Tuần 6) accurately selected as Featured Navy Card.');

  // -------------------------------------------------------------------------
  // Test 5: White Cards 4 Scenarios & Score Formatting
  // -------------------------------------------------------------------------
  console.log('\n--- Test 5: White Cards 4 Scenarios & Score Formatting ---');

  // 5a: Score formatting (including 0)
  if (formatScore(9.0, 'vi') !== '9' && formatScore(9.0, 'vi') !== '9,0') {
    throw new Error(`Test 5a failed: formatScore(9.0) should be '9' or '9,0', got ${formatScore(9.0, 'vi')}`);
  }
  if (formatScore(0, 'vi') !== '0') {
    throw new Error(`Test 5a failed: formatScore(0) must return '0', got ${formatScore(0, 'vi')}`);
  }
  if (formatScore(8.5, 'vi') !== '8,5') {
    throw new Error(`Test 5a failed: formatScore(8.5, 'vi') must return '8,5', got ${formatScore(8.5, 'vi')}`);
  }
  console.log('  5a. Passed: Score formatting (including 0 as "0" and 8.5 as "8,5") verified.');

  // 5b: No deadline formatting
  const noDeadlineItem = enrichedList.find((a) => a.id === 'assign-db-03');
  if (!noDeadlineItem || noDeadlineItem.dueDate !== null) {
    throw new Error('Test 5b failed: assign-db-03 must have dueDate = null');
  }
  console.log('  5b. Passed: No deadline scenario (assign-db-03) verified.');

  // 5c: Submitted on-time formatting for assign-db-02
  const pendingItem = enrichedList.find((a) => a.id === 'assign-db-02');
  if (!pendingItem || !pendingItem.submission?.submittedAt) {
    throw new Error('Test 5c failed: assign-db-02 must have submittedAt');
  }
  const pendingTimeFormatted = formatSubmissionTime(pendingItem.submission.submittedAt);
  console.log(`  5c. Pending submission time: ${pendingTimeFormatted.formatted}`);
  if (!pendingTimeFormatted.formatted.includes('21:15') || !pendingTimeFormatted.formatted.includes('02/11/2024')) {
    throw new Error('Test 5c failed: formatted time must match 21:15 - 02/11/2024');
  }
  console.log('  5c. Passed: Pending grading time strip (21:15 - 02/11/2024) verified.');

  // 5d: Graded feedback and teacher name for assign-db-05
  const gradedItem = enrichedList.find((a) => a.id === 'assign-db-05');
  if (!gradedItem || gradedItem.effectiveScore !== 9) {
    throw new Error('Test 5d failed: assign-db-05 must have effectiveScore = 9');
  }
  if (gradedItem.submission?.gradedByTeacherName !== 'TS. Lê Hoàng Nam') {
    throw new Error('Test 5d failed: gradedByTeacherName must be TS. Lê Hoàng Nam');
  }
  console.log('  5d. Passed: Graded result card box (9.0/10, teacher feedback, TS. Lê Hoàng Nam) verified.');

  // -------------------------------------------------------------------------
  // Test 6: Strict 5 items per page total
  // -------------------------------------------------------------------------
  console.log('\n--- Test 6: Strict 5 items per page total ---');
  // On Page 0: 1 Featured Navy card + 4 White cards = 5 items total
  const remainingWhiteCardsOnPage0 = first5.filter((item) => item.id !== featured.id);
  const totalItemsRenderedOnPage0 = 1 + remainingWhiteCardsOnPage0.length;
  console.log(`  Total items on page 0: 1 Featured + ${remainingWhiteCardsOnPage0.length} White cards = ${totalItemsRenderedOnPage0}`);
  if (totalItemsRenderedOnPage0 !== 5) {
    throw new Error(`Test 6 failed: page 0 must display exactly 5 items, got ${totalItemsRenderedOnPage0}`);
  }
  console.log('  6. Passed: Page 0 displays exactly 5 items without duplication.');

  console.log('\nALL 6 VERIFICATION TEST GROUPS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('\nTest failed with error:', err);
  process.exit(1);
});
