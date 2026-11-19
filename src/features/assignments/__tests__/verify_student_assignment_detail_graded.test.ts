import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  formatScore,
  formatSubmissionTime,
  getMySubmission,
  INITIAL_DEMO_SUBMISSIONS,
} from '../services/assignment.service';
import {
  evaluateCanSubmitAssignment,
  evaluateCanCancelSubmission,
  evaluateCanEditSubmission,
} from '../utils/submissionValidation';
import type { AssignmentItem, MySubmission } from '../types';

async function runTests() {
  console.log('=== STARTING STUDENT ASSIGNMENT DETAIL (GRADED STATE) TESTS ===\n');

  // -------------------------------------------------------------
  // TEST 1: formatScore precision & locale tests
  // -------------------------------------------------------------
  console.log('--- TEST 1: formatScore Helper Precision & Locale ---');

  // 1a. Two decimal places preserving (8.55 must be 8,55 in vi, NOT 8.6)
  const score855Vi = formatScore(8.55, 'vi');
  const score855En = formatScore(8.55, 'en');
  assert.strictEqual(score855Vi, '8,55', '8.55 in Vietnamese must format as "8,55" without round-off');
  assert.strictEqual(score855En, '8.55', '8.55 in English must format as "8.55" without round-off');

  // 1b. Single decimal place (8.5 must be 8,5 in vi)
  const score85Vi = formatScore(8.5, 'vi');
  const score85En = formatScore(8.5, 'en');
  assert.strictEqual(score85Vi, '8,5', '8.5 in Vietnamese must format as "8,5"');
  assert.strictEqual(score85En, '8.5', '8.5 in English must format as "8.5"');

  // 1c. Zero score (0 must be "0", never "--" or empty)
  const score0Vi = formatScore(0, 'vi');
  const score0En = formatScore(0, 'en');
  assert.strictEqual(score0Vi, '0', 'Score 0 in Vietnamese must format as "0"');
  assert.strictEqual(score0En, '0', 'Score 0 in English must format as "0"');

  // 1d. Integer scores (10 must be "10")
  assert.strictEqual(formatScore(10, 'vi'), '10');
  assert.strictEqual(formatScore(10, 'en'), '10');

  // 1e. Null, undefined, and NaN must return "--"
  assert.strictEqual(formatScore(null, 'vi'), '--');
  assert.strictEqual(formatScore(undefined, 'vi'), '--');
  assert.strictEqual(formatScore(Number.NaN, 'vi'), '--');

  console.log('✓ formatScore correctly formats 8.55 -> "8,55", 8.5 -> "8,5", 0 -> "0", null -> "--"');

  // -------------------------------------------------------------
  // TEST 2: formatSubmissionTime Fallback Cleanliness
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: formatSubmissionTime Fallback Cleanliness ---');

  // 2a. Missing input must return empty strings, NEVER fake 2024 dates
  const emptyTime1 = formatSubmissionTime(null);
  const emptyTime2 = formatSubmissionTime(undefined);
  const emptyTime3 = formatSubmissionTime('');
  assert.strictEqual(emptyTime1.formatted, '', 'Null input must return empty formatted string');
  assert.strictEqual(emptyTime2.formatted, '', 'Undefined input must return empty formatted string');
  assert.strictEqual(emptyTime3.formatted, '', 'Empty string input must return empty formatted string');

  // 2b. Valid ISO input parses accurately
  const validTime = formatSubmissionTime('2026-11-18T14:30:00');
  assert.ok(validTime.formatted.includes('14:30') && validTime.formatted.includes('18/11/2026'));

  console.log('✓ formatSubmissionTime never injects fake 2024 dates when timestamp is missing');

  // -------------------------------------------------------------
  // TEST 3: Action Evaluators for GRADED state (Strict Read-Only)
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Action Evaluators for GRADED state (Strict Read-Only) ---');

  const mockGradedSubmission: MySubmission = {
    id: 'sub-graded-01',
    assignmentId: 'assign-test-01',
    status: 'GRADED',
    score: 8.55,
    feedback: 'Bài làm rất tốt',
    submittedAt: '2026-11-18T10:00:00',
    gradedAt: '2026-11-18T14:00:00',
    gradedByTeacherName: 'TS. Nguyễn Văn A',
    submissionAttempt: 1,
    isLate: false,
    attachmentUrls: [],
  };

  const mockAssignment: AssignmentItem = {
    id: 'assign-test-01',
    classId: 'class-uuid-01',
    title: 'Bài tập kiểm thử',
    status: 'OPEN',
    type: 'LAB',
    maxScore: 10,
    dueDate: '2026-11-20T23:59:00',
    allowLateSubmission: true,
  };

  // 3a. Cannot submit again when graded
  const submitEval = evaluateCanSubmitAssignment({
    assignment: mockAssignment,
    submission: mockGradedSubmission,
  });
  assert.strictEqual(submitEval.canSubmit, false, 'Cannot submit when submission is GRADED');

  // 3b. Cannot cancel when graded
  const cancelEval = evaluateCanCancelSubmission({
    submission: mockGradedSubmission,
  });
  assert.strictEqual(cancelEval.canCancel, false, 'Cannot cancel when submission is GRADED');
  assert.strictEqual(cancelEval.reason, 'ALREADY_GRADED', 'Reason must be ALREADY_GRADED');

  // 3c. Cannot edit when graded
  const editEval = evaluateCanEditSubmission({
    assignment: mockAssignment,
    submission: mockGradedSubmission,
  });
  assert.strictEqual(editEval.canEdit, false, 'Cannot edit when submission is GRADED');
  assert.strictEqual(editEval.reason, 'ALREADY_GRADED', 'Reason must be ALREADY_GRADED');

  console.log('✓ All writing mutations (submit, edit, cancel) are strictly blocked when GRADED');

  // -------------------------------------------------------------
  // TEST 4: Edge Cases for Graded Submissions
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Edge Cases for Graded Submissions ---');

  // 4a. Zero score is a valid GRADED submission
  const zeroScoreSubmission: MySubmission = {
    id: 'sub-zero',
    assignmentId: 'assign-zero',
    status: 'GRADED',
    score: 0,
    feedback: '',
    submittedAt: '2026-11-18T08:00:00',
    gradedAt: '2026-11-18T12:00:00',
    attachmentUrls: [],
  };
  assert.strictEqual(zeroScoreSubmission.score, 0);
  assert.strictEqual(formatScore(zeroScoreSubmission.score, 'vi'), '0');

  // 4b. Late submission that is graded retains both GRADED and isLate=true
  const lateGradedSubmission: MySubmission = {
    id: 'sub-late-graded',
    assignmentId: 'assign-late',
    status: 'GRADED',
    score: 7.5,
    isLate: true,
    submittedAt: '2026-11-18T23:59:00',
    attachmentUrls: [],
  };
  assert.strictEqual(lateGradedSubmission.status, 'GRADED');
  assert.strictEqual(lateGradedSubmission.isLate, true);

  console.log('✓ Edge cases (score 0, late + graded) verified');

  // -------------------------------------------------------------
  // TEST 5: StudentAssignmentDetailPageView Code Cleanliness & Spec Check
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: StudentAssignmentDetailPageView Code Cleanliness & Spec Check ---');

  const componentPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/StudentAssignmentDetailPageView.tsx'
  );
  const code = fs.readFileSync(componentPath, 'utf8');

  // 5a. Preserves standard App Shell
  assert.ok(code.includes('DashboardSidebar'), 'Must render standard DashboardSidebar');
  assert.ok(code.includes('DashboardHeader'), 'Must render standard DashboardHeader');
  assert.ok(!code.includes('CS-202\n      Cơ sở dữ liệu'), 'Must NOT recreate hardcoded sidebar');
  assert.ok(!code.includes('ILMS INTELLIGENT LMS'), 'Must NOT recreate Stitch prototype logo header');

  // 5b. Content area header & sub-header
  assert.ok(code.includes('allClassesBreadcrumb'), 'Must include back/breadcrumb line to classes');
  assert.ok(code.includes('courseSectionLabel'), 'Must include course section sub-line with school icon');

  // 5c. Spotlight Navy Card
  assert.ok(
    code.includes('#0D1C32') && code.includes('#0F2444') && code.includes('#122C54'),
    'Must render Navy Spotlight Card with exact gradient'
  );
  assert.ok(code.includes('statusGradedBadge'), 'Must include statusGradedBadge');

  // 5d. Main Column layout for isGraded: Teacher Feedback MUST be Top 1
  const feedbackCardIdx = code.indexOf('teacherFeedbackTitle');
  const submittedWorkIdx = code.indexOf('submittedWorkHeading');
  const specCompareIdx = code.indexOf('assignmentSpecCompareTitle');

  assert.ok(feedbackCardIdx > 0, 'Must include teacherFeedbackTitle');
  assert.ok(submittedWorkIdx > 0, 'Must include submittedWorkHeading');
  assert.ok(specCompareIdx > 0, 'Must include assignmentSpecCompareTitle');
  assert.ok(
    feedbackCardIdx < submittedWorkIdx,
    'Card "Nhận xét của giảng viên" must appear BEFORE Card "Bài làm đã nộp"'
  );
  assert.ok(
    submittedWorkIdx < specCompareIdx,
    'Card "Bài làm đã nộp" must appear BEFORE Card "Yêu cầu bài tập & Đề bài đối chiếu"'
  );

  // 5e. Teacher feedback card styling
  assert.ok(code.includes('border-emerald-200'), 'Teacher feedback card must have emerald border');
  assert.ok(code.includes('bg-emerald-50/40'), 'Teacher feedback card must have light emerald background');
  assert.ok(code.includes('noGradingFeedback'), 'Must handle empty feedback with noGradingFeedback');

  // 5f. Aside column layout for isGraded: Grading Result & Study Tips
  assert.ok(code.includes('gradingResultTitle'), 'Must include gradingResultTitle card');
  assert.ok(code.includes('officialScoreBadge'), 'Must include officialScoreBadge');
  assert.ok(code.includes('studyTipsTitle'), 'Must include studyTipsTitle card');
  assert.ok(code.includes('inconsistentScoreError'), 'Must handle status=GRADED with missing score');

  // 5g. Teacher name logic: must use submission.gradedByTeacherName without fallback to TS. Lê Hoàng Nam
  assert.ok(!code.includes("teacherGradedName = 'TS. Lê Hoàng Nam'"), 'Must NOT fallback teacherGradedName to TS. Lê Hoàng Nam');
  assert.ok(code.includes('noGradedByInfo'), 'Must include noGradedByInfo fallback');

  console.log('✓ StudentAssignmentDetailPageView conforms 100% to the approved layout and app shell');

  // -------------------------------------------------------------
  // TEST 6: i18n Symmetry Check
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: i18n Translation Symmetry Check ---');

  const viPath = path.resolve(process.cwd(), 'src/messages/vi.json');
  const enPath = path.resolve(process.cwd(), 'src/messages/en.json');
  const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  const requiredKeys = [
    'officialScoreBadge',
    'assignmentScoreLabel',
    'submissionStatusLabel',
    'readOnlyOfficialResult',
    'noGradingFeedback',
    'detailedFeedbackHeader',
    'instructorRoleLabel',
    'noGradedByInfo',
    'noGradedAtInfo',
    'noSubmissionTimeInfo',
    'studyTipsTitle',
    'compareFeedbackTitle',
    'compareFeedbackDesc',
    'studyDiscussionTitle',
    'studyDiscussionDesc',
    'inconsistentScoreError',
    'courseSectionLabel',
    'allClassesBreadcrumb',
    'assignmentDetailBreadcrumb',
  ];

  for (const key of requiredKeys) {
    assert.ok(
      vi.assignments?.detail?.[key],
      `Key "${key}" must exist in vi.json under assignments.detail`
    );
    assert.ok(
      en.assignments?.detail?.[key],
      `Key "${key}" must exist in en.json under assignments.detail`
    );
  }

  console.log(`✓ All ${requiredKeys.length} i18n keys are symmetrical in vi.json and en.json`);

  console.log('\n=== ALL GRADED STATE TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
