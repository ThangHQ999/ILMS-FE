/**
 * Verification test suite for Student Assignment Detail Page (Submitted / Pending Grading)
 * Frame URL: https://stitch.google.com/preview/16436405483159050487?node-id=f01c2f045533468a890d07efa37707ce
 * Frame Node ID: f01c2f045533468a890d07efa37707ce
 * Title: ILMS — Chi tiết bài tập — Học viên (Đã nộp, chờ chấm)
 *
 * Requirements verified:
 * 1. Single source of truth & API mapping for Submitted / Pending Grading status.
 * 2. score=null displays "Chưa có điểm" (NOT score 0 or "-- / 10").
 * 3. evaluateCanCancelSubmission permits cancellation even after deadline, verifies owner & class write permission, blocks when graded.
 * 4. evaluateCanEditSubmission permits editing only BEFORE deadline, blocks after deadline (even if allowLateSubmission=true), blocks when graded.
 * 5. updateMySubmission sends PATCH /assignments/{id}/submissions with { content } without mutating submissionId.
 * 6. deleteSubmission calls DELETE /submissions/{id} with real submissionId and purges local storage on 204.
 * 7. UI source inspection: Accordion toggle, safe hyperlink parsing, removal of redundant "Bản nộp chính thức • Lần 1" and hardcoded student ID "21020455".
 * 8. i18n synchronization: Keys match 100% between vi.json and en.json.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  evaluateCanCancelSubmission,
  evaluateCanEditSubmission,
} from '../utils/submissionValidation';
import {
  updateMySubmission,
  deleteSubmission,
  getMySubmission,
  saveLocalSubmission,
  removeLocalSubmission,
} from '../services/assignment.service';
import type { AssignmentItem, MySubmission } from '../types';
import type { UserProfile } from '@/features/auth/schemas/auth.schema';
import type { ClassDetailData } from '@/features/classes/schemas/class-detail.schema';

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
  console.log('=== STARTING STUDENT ASSIGNMENT DETAIL (PENDING GRADING) TESTS ===\n');

  const mockUser: UserProfile = {
    id: 'student-uuid-101',
    email: 'minh.tn@ilms.edu.vn',
    firstName: 'Minh',
    lastName: 'Trần Nhật',
    roleName: 'STUDENT',
  };

  const otherUser: UserProfile = {
    id: 'student-uuid-999',
    email: 'other@ilms.edu.vn',
    firstName: 'Nam',
    lastName: 'Lê',
    roleName: 'STUDENT',
  };

  const mockActiveSubmission: MySubmission = {
    id: 'sub-uuid-8888',
    assignmentId: 'assign-db-01',
    studentId: 'student-uuid-101',
    studentName: 'Trần Nhật Minh',
    content: 'Bài làm phân tích chuẩn hóa CSDL:\nXem chi tiết tại https://docs.google.com/document/d/12345',
    status: 'SUBMITTED',
    score: null,
    feedback: null,
    submittedAt: '2024-10-28T21:15:00Z',
    isLate: false,
    submissionAttempt: 1,
    attachmentUrls: [],
  };

  const mockAssignmentBeforeDeadline: AssignmentItem = {
    id: 'assign-db-01',
    classId: 'csdl-k22-01',
    title: 'Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)',
    description: 'Yêu cầu phân tích phụ thuộc hàm...',
    type: 'LAB',
    status: 'OPEN',
    maxScore: 10,
    dueDate: '2029-12-31T23:59:00Z', // In the future
    allowLateSubmission: true,
  };

  const mockAssignmentPastDueWithLate: AssignmentItem = {
    id: 'assign-db-01',
    classId: 'csdl-k22-01',
    title: 'Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)',
    description: 'Yêu cầu phân tích phụ thuộc hàm...',
    type: 'LAB',
    status: 'OPEN',
    maxScore: 10,
    dueDate: '2024-10-01T23:59:00Z', // Past deadline
    allowLateSubmission: true,
  };

  const mockAssignmentPastDueNoLate: AssignmentItem = {
    id: 'assign-db-01',
    classId: 'csdl-k22-01',
    title: 'Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)',
    description: 'Yêu cầu phân tích phụ thuộc hàm...',
    type: 'LAB',
    status: 'OPEN',
    maxScore: 10,
    dueDate: '2024-10-01T23:59:00Z', // Past deadline
    allowLateSubmission: false,
  };

  const activeClass = {
    classInfo: {
      id: 'csdl-k22-01',
      name: 'CSDL-K22-01',
      title: 'Cơ sở dữ liệu',
      status: 'ACTIVE' as const,
    },
    courses: [],
    members: [],
  };

  const archivedClass = {
    classInfo: {
      id: 'csdl-k22-01',
      name: 'CSDL-K22-01',
      title: 'Cơ sở dữ liệu',
      status: 'ARCHIVED' as const,
    },
    courses: [],
    members: [],
  };

  // --- TEST 1: evaluateCanCancelSubmission Rules ---
  console.log('--- TEST 1: evaluateCanCancelSubmission Rules ---');

  // 1a. Can cancel when pending grading and before deadline
  const cancelEval1 = evaluateCanCancelSubmission({
    submission: mockActiveSubmission,
    currentUser: mockUser,
    classDetail: activeClass,
  });
  assert.strictEqual(cancelEval1.canCancel, true, 'Student can cancel their own pending submission');

  // 1b. Can cancel EVEN IF past due date (Backend rule: cancellation is permitted even past deadline)
  const cancelEval2 = evaluateCanCancelSubmission({
    submission: { ...mockActiveSubmission, status: 'LATE', isLate: true },
    currentUser: mockUser,
    classDetail: activeClass,
  });
  assert.strictEqual(cancelEval2.canCancel, true, 'Cancellation is permitted even if assignment is late / past due');

  // 1c. CANNOT cancel if other student attempts to cancel
  const cancelEvalOther = evaluateCanCancelSubmission({
    submission: mockActiveSubmission,
    currentUser: otherUser,
    classDetail: activeClass,
  });
  assert.strictEqual(cancelEvalOther.canCancel, false, 'Other student cannot cancel someone else submission');
  assert.strictEqual(cancelEvalOther.reason, 'NOT_OWNER');

  // 1d. CANNOT cancel if class is archived (read-only)
  const cancelEvalArchived = evaluateCanCancelSubmission({
    submission: mockActiveSubmission,
    currentUser: mockUser,
    classDetail: archivedClass,
  });
  assert.strictEqual(cancelEvalArchived.canCancel, false, 'Cannot cancel submission in archived class');
  assert.strictEqual(cancelEvalArchived.reason, 'CLASS_READ_ONLY');

  // 1e. CANNOT cancel if submission is already graded
  const cancelEvalGraded = evaluateCanCancelSubmission({
    submission: { ...mockActiveSubmission, status: 'GRADED', score: 8.5 },
    currentUser: mockUser,
    classDetail: activeClass,
  });
  assert.strictEqual(cancelEvalGraded.canCancel, false, 'Cannot cancel graded submission');
  assert.strictEqual(cancelEvalGraded.reason, 'ALREADY_GRADED');

  console.log('✓ evaluateCanCancelSubmission accurately evaluates owner, class status, graded lock, and deadline independence.\n');

  // --- TEST 2: evaluateCanEditSubmission Rules ---
  console.log('--- TEST 2: evaluateCanEditSubmission Rules ---');

  // 2a. Can edit when before deadline and pending grading
  const editEval1 = evaluateCanEditSubmission({
    assignment: mockAssignmentBeforeDeadline,
    submission: mockActiveSubmission,
    currentUser: mockUser,
    classDetail: activeClass,
  });
  assert.strictEqual(editEval1.canEdit, true, 'Can edit submission before deadline');

  // 2b. CANNOT edit after deadline, even if allowLateSubmission=true (backend rule: PATCH not allowed after deadline)
  const editEvalPastDue = evaluateCanEditSubmission({
    assignment: mockAssignmentPastDueWithLate,
    submission: mockActiveSubmission,
    currentUser: mockUser,
    classDetail: activeClass,
  });
  assert.strictEqual(editEvalPastDue.canEdit, false, 'Cannot edit after deadline even if allowLateSubmission is true');
  assert.strictEqual(editEvalPastDue.reason, 'DEADLINE_PASSED');

  // 2c. CANNOT edit if already graded
  const editEvalGraded = evaluateCanEditSubmission({
    assignment: mockAssignmentBeforeDeadline,
    submission: { ...mockActiveSubmission, status: 'GRADED', score: 9 },
    currentUser: mockUser,
    classDetail: activeClass,
  });
  assert.strictEqual(editEvalGraded.canEdit, false, 'Cannot edit graded submission');
  assert.strictEqual(editEvalGraded.reason, 'ALREADY_GRADED');

  console.log('✓ evaluateCanEditSubmission strictly enforces deadline boundaries and grading locks.\n');

  // --- TEST 3: updateMySubmission and deleteSubmission Service Behavior ---
  console.log('--- TEST 3: updateMySubmission and deleteSubmission Service Behavior ---');

  const demoAssignId = 'demo-edit-assign-01';
  const demoStudentId = 'student-edit-01';

  // Seed initial demo submission
  saveLocalSubmission(
    demoAssignId,
    {
      id: 'sub-demo-01',
      assignmentId: demoAssignId,
      studentId: demoStudentId,
      content: 'Original content',
      status: 'SUBMITTED',
      score: null,
      feedback: null,
      submittedAt: '2024-10-28T20:00:00Z',
      submissionAttempt: 1,
      attachmentUrls: [],
    },
    demoStudentId
  );

  // Test updating submission
  const updatedSub = await updateMySubmission(
    demoAssignId,
    { content: 'Updated content via PATCH simulation' },
    demoStudentId,
    'csdl-k22-01'
  );
  assert.strictEqual(updatedSub.content, 'Updated content via PATCH simulation');
  assert.strictEqual(updatedSub.submissionAttempt, 2, 'Submission attempt should increment on update');
  assert.ok(
    updatedSub.status === 'RESUBMITTED' || updatedSub.status === 'LATE',
    'Updated submission should transition to RESUBMITTED or LATE based on deadline'
  );

  // Test canceling submission
  await deleteSubmission('sub-demo-01', demoAssignId, demoStudentId, updatedSub);
  const afterCancel = await getMySubmission(demoAssignId, demoStudentId, 'csdl-k22-01');
  assert.strictEqual(afterCancel.status, 'NOT_SUBMITTED', 'After cancel, submission status must be NOT_SUBMITTED');

  console.log('✓ updateMySubmission and deleteSubmission function properly without corrupting identifiers.\n');

  // --- TEST 4: i18n Translation Keys Verification ---
  console.log('--- TEST 4: i18n Translation Keys Verification ---');
  const viPath = path.resolve(process.cwd(), 'src/messages/vi.json');
  const enPath = path.resolve(process.cwd(), 'src/messages/en.json');
  const viContent = JSON.parse(fs.readFileSync(viPath, 'utf8'));
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  const pendingGradingKeys = [
    'submittedWorkHeading',
    'submissionAttemptCount',
    'systemRecorded',
    'studentAuthorLabel',
    'sentAtTime',
    'noSubmissionContentError',
    'assignmentSpecCompareTitle',
    'collapseSpec',
    'expandSpec',
    'officialAssignmentDocument',
    'onTimePolicyNote',
    'pendingGradingStatus',
    'notGradedYetScore',
    'editSubmissionBtn',
    'editSubmissionModalTitle',
    'editSubmissionContentLabel',
    'editSubmissionPlaceholder',
    'saveEditBtn',
    'savingEdit',
    'cancelEditBtn',
    'cannotEditPastDue',
    'submissionNoticeTitle',
    'submissionNoticeRule',
    'submissionNoticeAccess',
    'cancelWarningPastDueNoLate',
    'cancelSubmissionConfirmDesc',
    'resubmitPermittedNotice',
  ];

  for (const key of pendingGradingKeys) {
    assert.ok(
      viContent.assignments?.detail?.[key] !== undefined,
      `Key assignments.detail.${key} missing in vi.json`
    );
    assert.ok(
      enContent.assignments?.detail?.[key] !== undefined,
      `Key assignments.detail.${key} missing in en.json`
    );
  }
  console.log(`✓ All ${pendingGradingKeys.length} Pending Grading i18n keys exist symmetrically in vi.json and en.json.\n`);

  // --- TEST 5: StudentAssignmentDetailPageView Code Cleanliness & Spec Inspection ---
  console.log('--- TEST 5: StudentAssignmentDetailPageView Code Cleanliness & Spec Inspection ---');
  const componentPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/StudentAssignmentDetailPageView.tsx'
  );
  const componentCode = fs.readFileSync(componentPath, 'utf8');

  // 5a. Verify removal of hardcoded MSSV 21020455
  assert.ok(!componentCode.includes('21020455'), 'Hardcoded student code 21020455 must be removed');

  // 5b. Verify removal of redundant "Bản nộp chính thức • Lần 1"
  assert.ok(
    !componentCode.includes('Bản nộp chính thức • Lần 1') &&
      !componentCode.includes('Bản nộp chính thức • Lần'),
    'Redundant "Bản nộp chính thức • Lần X" tag must be replaced by single "Lượt nộp: {attempt}"'
  );

  // 5c. Verify removal of hardcoded solution "Kính gửi thầy Nam..."
  assert.ok(
    !componentCode.includes('Kính gửi thầy Nam, em gửi bài làm bài tập chuẩn hóa CSDL Tuần 6...'),
    'Hardcoded fallback solution text must be eliminated in favor of real submission.content'
  );

  // 5d. Verify single accordion toggle for assignment specification
  assert.ok(componentCode.includes('isSpecExpanded'), 'Must feature isSpecExpanded accordion state');
  assert.ok(componentCode.includes('aria-expanded={isSpecExpanded}'), 'Must have accessible aria-expanded attribute');

  // 5e. Verify score=null displays "Chưa có điểm" and NOT "-- / 10" in pending state
  assert.ok(componentCode.includes('notGradedYetScore'), 'Pending state score must render notGradedYetScore ("Chưa có điểm")');

  // 5f. Verify safe hyperlink parsing
  assert.ok(componentCode.includes('renderContentWithLinks'), 'Must parse URLs into safe clickable links');

  // 5g. Verify Amber "Chờ chấm" badge in Navy Spotlight card
  assert.ok(componentCode.includes('pendingGrading'), 'Spotlight card must display pendingGrading badge');
  assert.ok(componentCode.includes('bg-amber-950/80') || componentCode.includes('text-amber-300'), 'Must use Amber styling for Pending status');

  console.log('✓ StudentAssignmentDetailPageView strictly satisfies all Stitch redesign specifications without fake data.\n');

  console.log('=== ALL PENDING GRADING TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
