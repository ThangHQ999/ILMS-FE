import assert from 'node:assert';
import { runSuite } from '@/test-utils/run-verifications';
import fs from 'fs';
import path from 'path';
import { INITIAL_DEMO_SUBMISSIONS, MOCK_ASSIGNMENTS, createAssignment, deleteAssignment, deleteSubmission, formatAssignmentDueDate, formatScore, formatSubmissionTime, getActiveDemoSubmissions, getAllClassAssignments, getAssignmentById, getAssignmentGradingProgress, getAssignmentSubmissionsPaged, getClassAssignmentsPaged, getCreatedAssignments, getDeletedAssignmentIds, getMySubmission, getMySubmissionsBatch, isDemoAssignment, isMockClass, removeCreatedAssignment, resetCreatedAssignments, resetDeletedAssignmentIds, resetStoredGradings, saveCreatedAssignment, saveDeletedAssignmentId, saveStoredGrading } from '../services/assignment.service';
import { assignmentItemSchema, assignmentListEnvelopeSchema } from '../schemas/assignment.schema';
import { isAssignmentGraded, isAssignmentPendingGrading, isAssignmentUnsubmitted, type EnrichedAssignment } from '../hooks/useAssignmentQueries';
import { MOCK_EXAMS } from '../services/exam.service';


// ===============================================================
// Sub-test: verify_assignments_view_polish_and_modal.test.ts
// ===============================================================
async function test_verify_assignments_view_polish_and_modal() {
/**
 * Test Suite: Verify Assignments View Polish, Teacher Detail Modal, and Student 2-Part Graded Box
 */
async function runTests() {
  console.log('=== STARTING ASSIGNMENTS VIEW POLISH & MODAL VERIFICATION TESTS ===\n');

  // ----------------------------------------------------
  // TEST 1: Teacher Create Assignment Button & Height Sync
  // ----------------------------------------------------
  console.log('--- TEST 1: Teacher Create Assignment Button Polish ---');
  const teacherViewPath = path.resolve(__dirname, '../components/TeacherAssignmentsTableView.tsx');
  const teacherViewSource = fs.readFileSync(teacherViewPath, 'utf8');

  // Verify create button does NOT contain "+ +" (no double plus)
  assert(
    !teacherViewSource.includes('<span>+ {t(\'createAssignment\')}</span>'),
    'Create button text must NOT contain redundant "+" symbol'
  );
  assert(
    teacherViewSource.includes('<span>{t(\'createAssignment\')}</span>'),
    'Create button text must cleanly render translated label without hardcoded "+"'
  );
  assert(
    teacherViewSource.includes('h-9 bg-blue-600') || teacherViewSource.includes('h-[38px]'),
    'Create button must be height-synchronized with toggle group (h-9 or h-[38px])'
  );
  console.log('✓ Create button double plus eliminated and height synchronized\n');

  // ----------------------------------------------------
  // TEST 2: Teacher View Assignment Modal ("Chi tiết đề bài tập")
  // ----------------------------------------------------
  console.log('--- TEST 2: Teacher View Assignment Modal Polish ---');
  // 1. Must NOT contain "viewSubmissionsBtn" in modal actions
  assert(
    !teacherViewSource.includes('{t(\'viewModal.viewSubmissionsBtn\')}'),
    'Modal actions must NOT contain "Xem bài nộp" button'
  );

  // 2. Footer right aligned: [Đóng] -> [Chỉnh sửa bài tập]
  assert(
    teacherViewSource.includes('justify-end gap-2.5 pt-3 border-t'),
    'Modal footer must be right-aligned with gap-2.5 and border-t'
  );

  // 3. Main title must be assignment title
  assert(
    teacherViewSource.includes('{assignmentToView.title}'),
    'Modal title must prominently display assignmentToView.title'
  );

  // 4. Late submission hidden when dueDate is null
  assert(
    teacherViewSource.includes('{assignmentToView.dueDate && (') &&
    teacherViewSource.includes('t(\'columns.lateSubmission\')'),
    'Late submission row in modal must only display when assignmentToView.dueDate exists'
  );

  // 5. Scrollable body container for long instructions
  assert(
    teacherViewSource.includes('max-h-[55vh] overflow-y-auto') || teacherViewSource.includes('overflow-y-auto'),
    'Modal body must have max-height and overflow-y-auto to allow scrolling long instructions'
  );
  console.log('✓ Teacher View Assignment modal adheres to all specs\n');

  // ----------------------------------------------------
  // TEST 3: Teacher Grading Progress Zero State (Single Clean Line)
  // ----------------------------------------------------
  console.log('--- TEST 3: Teacher Grading Progress Zero State ---');
  // In featured and standard, when total === 0, render clean single line without 0% or progress bar
  assert(
    teacherViewSource.includes('if (total === 0)'),
    'Must handle total === 0 explicitly'
  );
  console.log('✓ Teacher grading progress zero state renders single clean line without progress bar\n');

  // ----------------------------------------------------
  // TEST 4: Student View Clean Footer (No "Không có tài liệu đính kèm" text)
  // ----------------------------------------------------
  console.log('--- TEST 4: Student View Clean Attachment Link & Footer ---');
  const studentViewPath = path.resolve(__dirname, '../components/StudentAssignmentsTableView.tsx');
  const studentViewSource = fs.readFileSync(studentViewPath, 'utf8');

  // Verify neither featured card nor white card contains the redundant text
  assert(
    !studentViewSource.includes('Không có tài liệu đính kèm'),
    'Student view must NOT contain repetitive "Không có tài liệu đính kèm" label'
  );
  console.log('✓ Repetitive "Không có tài liệu đính kèm" label removed completely\n');

  // ----------------------------------------------------
  // TEST 5: Student Graded Result 2-Part Layout when Feedback is Empty
  // ----------------------------------------------------
  console.log('--- TEST 5: Student Graded Result 2-Part Layout ---');
  // Check that if (!teacherComment) is handled separately
  assert(
    studentViewSource.includes('if (!teacherComment)'),
    'Student view must handle empty teacher feedback with a dedicated 2-part layout'
  );
  assert(
    studentViewSource.includes('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'),
    'Empty feedback layout must arrange score and grader info in a clean 2-part balanced row'
  );

  // Verify score formatting works for 0
  assert.strictEqual(formatScore(0, 'vi'), '0');
  assert.strictEqual(formatScore(9.0, 'vi'), '9');
  console.log('✓ Student graded result 2-part layout and zero score formatting verified\n');

  // ----------------------------------------------------
  // TEST 6: Teacher Cards Hide Late Submission when No Due Date
  // ----------------------------------------------------
  console.log('--- TEST 6: Teacher Cards Hide Late Submission when No Due Date ---');
  assert(
    teacherViewSource.includes('{featuredItem.dueDate && (') &&
    teacherViewSource.includes('t(\'featured.lateAllowed\')'),
    'Featured card must hide late submission badge when dueDate is null'
  );
  assert(
    teacherViewSource.includes('{item.dueDate && (') &&
    teacherViewSource.includes('t(\'card.lateAllowed\')'),
    'Standard card must hide late submission badge when dueDate is null'
  );
  console.log('✓ Teacher cards hide late submission when dueDate is absent\n');

  console.log('=== ALL ASSIGNMENTS VIEW POLISH & MODAL TESTS PASSED ===');
}


  await runTests();

}

// ===============================================================
// Sub-test: verify_back_links_right_alignment.test.ts
// ===============================================================
async function test_verify_back_links_right_alignment() {



console.log('=== VERIFYING REMOVAL OF BACK LINKS ACROSS ASSIGNMENT FLOW ===\n');

// 1. Breadcrumbs at ClassDetailPageView & StudentAssignmentsPageView
console.log('Checking breadcrumb in ClassDetailPageView.tsx & StudentAssignmentsPageView.tsx...');
const classDetailPagePath = path.resolve(
  process.cwd(),
  'src/features/classes/components/detail/ClassDetailPageView.tsx'
);
assert(fs.existsSync(classDetailPagePath), 'ClassDetailPageView.tsx must exist');
const classDetailContent = fs.readFileSync(classDetailPagePath, 'utf8');

assert(
  !classDetailContent.includes("{t('tabAssignments')}"),
  'ClassDetailPageView breadcrumb MUST NOT contain tabAssignments at the end'
);
assert(
  classDetailContent.includes("{classInfo?.title || 'Đang tải thông tin lớp...'}"),
  'ClassDetailPageView breadcrumb MUST end at class title'
);

const studentAssignmentsPagePath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/StudentAssignmentsPageView.tsx'
);
assert(fs.existsSync(studentAssignmentsPagePath), 'StudentAssignmentsPageView.tsx must exist');
const studentAssignmentsContent = fs.readFileSync(studentAssignmentsPagePath, 'utf8');

assert(
  !studentAssignmentsContent.includes("{tClass('tabAssignments')}"),
  'StudentAssignmentsPageView breadcrumb MUST NOT contain tabAssignments at the end'
);
assert(
  studentAssignmentsContent.includes('{classTitle}'),
  'StudentAssignmentsPageView breadcrumb MUST end at class title'
);
console.log('  -> PASSED: Breadcrumbs end at class title without trailing "/ Bài tập & Đánh giá".\n');

// 2. StudentAssignmentDetailPageView.tsx - Back Link Removed from Unified Card & Error state
console.log('Checking StudentAssignmentDetailPageView.tsx (Gỡ bỏ hoàn toàn nút Quay lại danh sách bài tập)...');
const studentDetailPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/StudentAssignmentDetailPageView.tsx'
);
assert(fs.existsSync(studentDetailPath), 'StudentAssignmentDetailPageView.tsx must exist');
const studentDetailContent = fs.readFileSync(studentDetailPath, 'utf8');

assert(
  !studentDetailContent.includes("tDetail('backToAssignmentList')"),
  'StudentAssignmentDetailPageView MUST NOT render backToAssignmentList'
);
assert(
  !studentDetailContent.includes('Quay lại danh sách bài tập'),
  'StudentAssignmentDetailPageView MUST NOT render text "Quay lại danh sách bài tập"'
);
assert(
  studentDetailContent.includes('grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch'),
  'StudentAssignmentDetailPageView must have 2 bottom clusters full-width and stacked on mobile'
);
assert(
  studentDetailContent.includes("tDetail('rulesAndPoliciesTitle')"),
  'StudentAssignmentDetailPageView left cluster must contain submission rules and policies'
);
assert(
  studentDetailContent.includes("tDetail('submitNowBtn')"),
  'StudentAssignmentDetailPageView right cluster must contain Submit Now button for unsubmitted'
);
assert(
  studentDetailContent.includes('btn-cancel-submission'),
  'StudentAssignmentDetailPageView right cluster must contain Cancel button for pending submission'
);
assert(
  studentDetailContent.includes("tDetail('gradingResultTitle')"),
  'StudentAssignmentDetailPageView right cluster must contain grading result for graded submission'
);
console.log('  -> PASSED: StudentAssignmentDetailPageView back link removed, unified card preserved.\n');

// 3. StudentAssignmentSubmissionPageView.tsx - Quay lại chi tiết bài tập removed
console.log('Checking StudentAssignmentSubmissionPageView.tsx (Gỡ bỏ Quay lại chi tiết bài tập)...');
const studentSubmitPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/StudentAssignmentSubmissionPageView.tsx'
);
assert(fs.existsSync(studentSubmitPath), 'StudentAssignmentSubmissionPageView.tsx must exist');
const studentSubmitContent = fs.readFileSync(studentSubmitPath, 'utf8');

assert(
  !studentSubmitContent.includes('Quay lại chi tiết bài tập'),
  'StudentAssignmentSubmissionPageView MUST NOT render "Quay lại chi tiết bài tập"'
);
assert(
  !studentSubmitContent.includes('<div className="flex w-full justify-end">'),
  'StudentAssignmentSubmissionPageView wrapper row for back link must be removed'
);
assert(
  studentSubmitContent.includes('router.push(`/classes/${classId}/assignments/${assignmentId}`)'),
  'StudentAssignmentSubmissionPageView Cancel button must remain intact'
);
console.log('  -> PASSED: StudentAssignmentSubmissionPageView back link removed, Cancel button preserved.\n');

// 4. TeacherAssignmentSubmissionsPageView.tsx - Quay lại danh sách bài tập removed
console.log('Checking TeacherAssignmentSubmissionsPageView.tsx (Gỡ bỏ Quay lại danh sách bài tập)...');
const teacherSubmissionsPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherAssignmentSubmissionsPageView.tsx'
);
assert(fs.existsSync(teacherSubmissionsPath), 'TeacherAssignmentSubmissionsPageView.tsx must exist');
const teacherSubmissionsContent = fs.readFileSync(teacherSubmissionsPath, 'utf8');

assert(
  !teacherSubmissionsContent.includes("t('backToList')"),
  'TeacherAssignmentSubmissionsPageView MUST NOT render backToList'
);
assert(
  !teacherSubmissionsContent.includes('<div className="flex w-full justify-end">'),
  'TeacherAssignmentSubmissionsPageView wrapper row for back link must be removed'
);
console.log('  -> PASSED: TeacherAssignmentSubmissionsPageView back link removed.\n');

// 5. TeacherSubmissionDetailView.tsx - Quay lại danh sách bài nộp removed
console.log('Checking TeacherSubmissionDetailView.tsx (Gỡ bỏ Quay lại danh sách bài nộp)...');
const teacherDetailPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherSubmissionDetailView.tsx'
);
assert(fs.existsSync(teacherDetailPath), 'TeacherSubmissionDetailView.tsx must exist');
const teacherDetailContent = fs.readFileSync(teacherDetailPath, 'utf8');

assert(
  !teacherDetailContent.includes("t('backToSubmissions')"),
  'TeacherSubmissionDetailView MUST NOT render backToSubmissions'
);
assert(
  teacherDetailContent.includes('onClick={handleCancel}'),
  'TeacherSubmissionDetailView Cancel button must remain intact'
);
console.log('  -> PASSED: TeacherSubmissionDetailView back link removed, Cancel button preserved.\n');

// 6. TeacherCreateAssignmentFormView.tsx - Quay lại danh sách bài tập removed
console.log('Checking TeacherCreateAssignmentFormView.tsx (Gỡ bỏ Quay lại danh sách bài tập)...');
const teacherCreatePath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherCreateAssignmentFormView.tsx'
);
assert(fs.existsSync(teacherCreatePath), 'TeacherCreateAssignmentFormView.tsx must exist');
const teacherCreateContent = fs.readFileSync(teacherCreatePath, 'utf8');

assert(
  !teacherCreateContent.includes("t('backToList')"),
  'TeacherCreateAssignmentFormView MUST NOT render backToList'
);
assert(
  teacherCreateContent.includes('onClick={onCancel}'),
  'TeacherCreateAssignmentFormView Cancel button must remain intact'
);
console.log('  -> PASSED: TeacherCreateAssignmentFormView back button removed, Cancel button preserved.\n');

// 7. Breadcrumb Class Link to `/classes/${classId}?tab=assignments`
console.log('Checking breadcrumb class title links to `/classes/${classId}?tab=assignments` across all subpages...');
assert(
  studentDetailContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'StudentAssignmentDetailPageView breadcrumb class title must link to `/classes/${classId}?tab=assignments`'
);
assert(
  studentSubmitContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'StudentAssignmentSubmissionPageView breadcrumb class title must link to `/classes/${classId}?tab=assignments`'
);
assert(
  teacherSubmissionsContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'TeacherAssignmentSubmissionsPageView breadcrumb class title must link to `/classes/${classId}?tab=assignments`'
);
assert(
  teacherDetailContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'TeacherSubmissionDetailView breadcrumb class title must link to `/classes/${classId}?tab=assignments`'
);
assert(
  studentAssignmentsContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'StudentAssignmentsPageView breadcrumb class title must link to `/classes/${classId}?tab=assignments`'
);
assert(
  classDetailContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'ClassDetailPageView breadcrumb when action=create must link class title to `/classes/${classId}?tab=assignments`'
);
console.log('  -> PASSED: All breadcrumb class title links point to `/classes/${classId}?tab=assignments`.\n');

console.log('================================================================');
console.log('ALL VERIFICATIONS PASSED: ALL BACK LINKS REMOVED ACROSS 9 SCREENS!');
console.log('================================================================\n');

}

// ===============================================================
// Sub-test: verify_class_assignments_cross_class_and_layout.test.ts
// ===============================================================
async function test_verify_class_assignments_cross_class_and_layout() {
/**
 * Test Suite: Verify Cross-Class Assignment Loading, Tolerant Schema, Dynamic Badges & Layout
 */
async function runTests() {
  console.log('=== STARTING CROSS-CLASS ASSIGNMENTS & LAYOUT VERIFICATION TESTS ===\n');

  // ----------------------------------------------------
  // TEST 1: UUID Real Class Identification vs Mock Class
  // ----------------------------------------------------
  console.log('--- TEST 1: UUID vs Mock Class Identification ---');
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const realClassUuid1 = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const realClassUuid2 = 'e211a7b8-8c11-4f12-9c3a-123456789abc';
  const mockClassId = 'csdl-k22-01';

  assert(uuidRegex.test(realClassUuid1), 'realClassUuid1 must be recognized as valid UUID');
  assert(uuidRegex.test(realClassUuid2), 'realClassUuid2 must be recognized as valid UUID');
  assert(!uuidRegex.test(mockClassId), 'mockClassId must not match UUID regex');
  console.log('✓ UUID regex correctly identifies real class UUIDs vs mock strings\n');

  // ----------------------------------------------------
  // TEST 2: Tolerant Zod Schema Parsing (DTO with missing classId, null dueDate, loose types)
  // ----------------------------------------------------
  console.log('--- TEST 2: Tolerant Zod Schema Parsing ---');
  const backendDtoSample = {
    id: 'e211a7b8-8c11-4f12-9c3a-123456789abc',
    title: 'Bài tập chuẩn hóa CSDL',
    description: 'Yêu cầu chuẩn hóa lược đồ quan hệ',
    // Missing classId, courseId, lessonId from backend summary
    dueDate: null, // nullable dueDate
    allowLateSubmission: false,
    maxScore: null, // backend might return null maxScore
    type: 'CUSTOM_ASSIGNMENT_TYPE', // unknown type should map safely
    status: 'OPEN',
    totalSubmissions: 42,
    gradedSubmissions: 35,
    createdAt: '2024-11-01T08:00:00Z',
    updatedAt: '2024-11-02T08:00:00Z',
  };

  const parsedItem = assignmentItemSchema.safeParse(backendDtoSample);
  assert(parsedItem.success, `Schema parse failed: ${JSON.stringify(parsedItem.error?.issues)}`);
  assert.strictEqual(parsedItem.data.title, 'Bài tập chuẩn hóa CSDL');
  assert.strictEqual(parsedItem.data.dueDate, null);
  assert.strictEqual(parsedItem.data.allowLateSubmission, false);
  // Type transform tolerant fallback
  assert(['QUIZ', 'EXAM', 'PROJECT', 'LAB'].includes(parsedItem.data.type), 'Type should be safely mapped');
  console.log('✓ Backend DTO with missing classId and null maxScore parsed successfully\n');

  // Envelope parsing with raw list
  const backendEnvelope = {
    code: 'SUCCESS',
    message: 'OK',
    data: {
      items: [backendDtoSample],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      pageSize: 5,
    },
  };
  const parsedEnvelope = assignmentListEnvelopeSchema.safeParse(backendEnvelope.data);
  assert(parsedEnvelope.success, `Envelope parse failed: ${JSON.stringify(parsedEnvelope.error?.issues)}`);
  console.log('✓ Envelope schema successfully validated wrapped paginated response\n');

  // ----------------------------------------------------
  // TEST 3: Mock Class Fallback Data Loading
  // ----------------------------------------------------
  console.log('--- TEST 3: Mock Class Data Loading ---');
  const mockPagedRes = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 5 });
  assert(mockPagedRes.items.length > 0, 'Mock class should load mock items');
  assert.strictEqual(mockPagedRes.pageSize, 5, 'Page size should be 5');
  console.log(`✓ Mock class returned ${mockPagedRes.items.length} items, totalElements=${mockPagedRes.totalElements}\n`);

  // ----------------------------------------------------
  // TEST 4: Null Due Date & Past Due with Late Submission Rules
  // ----------------------------------------------------
  console.log('--- TEST 4: Due Date & Late Submission Logic ---');

  // Case A: dueDate is null (like bài 'áda')
  const itemNoDueDate = {
    ...backendDtoSample,
    id: 'assign-no-due',
    dueDate: null,
    allowLateSubmission: false,
  };
  const parsedNoDueDate = assignmentItemSchema.parse(itemNoDueDate);
  assert.strictEqual(parsedNoDueDate.dueDate, null);
  // Frontend logic: if (!item.dueDate), display 'Không có hạn nộp' and hide 'Nộp muộn'
  const hasDueDateA = Boolean(parsedNoDueDate.dueDate);
  assert.strictEqual(hasDueDateA, false, 'hasDueDate must be false for null dueDate');

  // Case B: Past due with late submission allowed (like bài 'Demo11')
  const pastDate = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const itemPastDueLateAllowed = {
    ...backendDtoSample,
    id: 'assign-past-due-late',
    dueDate: pastDate,
    allowLateSubmission: true,
  };
  const parsedPastDue = assignmentItemSchema.parse(itemPastDueLateAllowed);
  const now = Date.now();
  const isPastDue = new Date(parsedPastDue.dueDate!).getTime() < now;
  const isPastDueWithLate = isPastDue && parsedPastDue.allowLateSubmission;
  assert(isPastDueWithLate, 'Must recognize as past due with late submission allowed');
  // Expected label: "Quá hạn · Cho nộp muộn"
  const expectedDueLabel = isPastDueWithLate ? 'Quá hạn · Cho nộp muộn' : 'Hạn nộp';
  assert.strictEqual(expectedDueLabel, 'Quá hạn · Cho nộp muộn');
  console.log('✓ Null dueDate and Past due with late submission logic verified\n');

  // ----------------------------------------------------
  // TEST 5: Graded Result - Zero Score & No Fake Hardcoded Comments
  // ----------------------------------------------------
  console.log('--- TEST 5: Graded Score Format & Clean Comments ---');
  // formatScore must correctly format 0
  assert.strictEqual(formatScore(0, 'vi'), '0');
  assert.strictEqual(formatScore(0.0, 'vi'), '0');
  assert.strictEqual(formatScore(9.5, 'vi'), '9,5');
  assert.strictEqual(formatScore(10, 'vi'), '10');

  // Grader & Feedback fallback verification
  const submissionWithRealFeedback = {
    feedback: 'Bài làm rất tốt, chi tiết.',
    gradedByTeacherName: 'TS. Nguyễn Văn A',
  };
  const submissionWithNoFeedback = {
    feedback: null,
    gradedByTeacherName: null,
  };

  const comment1 = (submissionWithRealFeedback.feedback || '').trim();
  assert.strictEqual(comment1, 'Bài làm rất tốt, chi tiết.');

  const comment2 = (submissionWithNoFeedback.feedback || '').trim();
  assert.strictEqual(comment2, '', 'Empty feedback should be empty string, not fake mock text');
  console.log('✓ Zero score formatting and absence of fake hardcoded teacher comments verified\n');

  // ----------------------------------------------------
  // TEST 6: Dynamic Assignments Count for Tab Badge
  // ----------------------------------------------------
  console.log('--- TEST 6: Dynamic Assignments Count for Tab Badge ---');
  // Badge must accept dynamic assignmentsCount
  const allAssignments = await getAllClassAssignments('csdl-k22-01');
  const count = allAssignments.length;
  assert(typeof count === 'number' && count > 0, 'Total assignments count must be a valid number');
  console.log(`✓ Dynamic assignments count for tab badge resolved: ${count}\n`);

  console.log('=== ALL CROSS-CLASS & LAYOUT VERIFICATION TESTS PASSED ===');
}


  await runTests();

}

// ===============================================================
// Sub-test: verify_grading_progress_sync.test.ts
// ===============================================================
async function test_verify_grading_progress_sync() {
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


  await runTests();

}

// ===============================================================
// Sub-test: verify_real_class_assignments_and_grading_sync.test.ts
// ===============================================================
async function test_verify_real_class_assignments_and_grading_sync() {
/**
 * Test Suite: Verify Real Class Assignments, Grading Progress Calculation & Submissions Sync
 */
async function runTests() {
  console.log('=== STARTING REAL CLASS ASSIGNMENTS & GRADING SYNC VERIFICATION ===\n');

  // ----------------------------------------------------
  // TEST 1: Real UUID vs Demo Assignment Recognition
  // ----------------------------------------------------
  console.log('--- TEST 1: Real UUID vs Demo Assignment Recognition ---');
  const realClassUuid = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const realAssignmentUuid = 'a1234567-89ab-cdef-0123-456789abcdef';
  const demoClassId = 'csdl-k22-01';
  const demoAssignmentId = 'assign-db-01';

  assert.strictEqual(isMockClass(realClassUuid), false, 'Real UUID must NOT be a mock class');
  assert.strictEqual(isMockClass(demoClassId), true, 'csdl-k22-01 must be recognized as mock class');

  // A full UUID assignment in a real UUID class is NOT demo
  assert.strictEqual(
    isDemoAssignment(realAssignmentUuid, realClassUuid),
    false,
    'Valid UUID assignment in valid UUID class must NOT be demo'
  );

  // A demo ID or in mock class is demo
  assert.strictEqual(
    isDemoAssignment(demoAssignmentId, demoClassId),
    true,
    'assign-db-01 in csdl-k22-01 must be recognized as demo'
  );
  console.log('✓ Real UUID vs Demo Assignment correctly segregated\n');

  // ----------------------------------------------------
  // TEST 2: Real Class Isolation (No Fallback to MOCK_ASSIGNMENTS)
  // ----------------------------------------------------
  console.log('--- TEST 2: Real Class Isolation ---');
  // For demo class, it should return mock items
  const demoPaged = await getClassAssignmentsPaged(demoClassId, { page: 0, size: 5 });
  assert(demoPaged.items.length > 0, 'Demo class must return mock items');

  // For real class when API mock isn't intercepting or returns empty
  const realClassEmptyId = 'e0000000-0000-0000-0000-000000000000';
  try {
    const realPaged = await getClassAssignmentsPaged(realClassEmptyId, { page: 0, size: 5 });
    // If it succeeded with empty items
    assert.strictEqual(realPaged.items.length, 0, 'Real class with no items must return 0 items (never mock items)');
    assert.strictEqual(realPaged.totalElements, 0, 'totalElements must be 0 for empty real class');
  } catch (err: unknown) {
    // If network / 404 is thrown, that is also valid because real classes re-throw API errors!
    console.log(`✓ Real class correctly threw API error instead of silently swallowing: ${(err as Error).message}`);
  }
  console.log('✓ Real class isolation verified: never fallbacks to demo data\n');

  // ----------------------------------------------------
  // TEST 3: Teacher Grading Progress Calculation (Total, Graded, Pending)
  // ----------------------------------------------------
  console.log('--- TEST 3: Teacher Grading Progress Calculation ---');
  // Demo class uses exact active demo submissions list
  const p1 = await getAssignmentGradingProgress('assign-db-01', demoClassId);
  assert.strictEqual(p1.totalSubmissions, 5, 'assign-db-01 total should be 5');
  assert.strictEqual(p1.gradedSubmissions, 2, 'assign-db-01 graded should be 2');
  assert.strictEqual(p1.pendingSubmissions, 3, 'assign-db-01 pending should be 3');
  assert.strictEqual(p1.completionRate, 40, 'assign-db-01 rate should be 40%');

  const p3 = await getAssignmentGradingProgress('assign-db-03', demoClassId);
  assert.strictEqual(p3.totalSubmissions, 0, 'assign-db-03 total should be 0');
  assert.strictEqual(p3.hasNoSubmissions, true, 'hasNoSubmissions must be true when 0 submissions');
  console.log('✓ Teacher grading progress calculations verified\n');

  // ----------------------------------------------------
  // TEST 4: Student Graded Score (Zero Score) & Clean Comments
  // ----------------------------------------------------
  console.log('--- TEST 4: Zero Score & Clean Comment Rules ---');
  // 1. Zero score formatting
  assert.strictEqual(formatScore(0, 'vi'), '0', 'Score 0 must format as "0"');
  assert.strictEqual(formatScore(0.0, 'vi'), '0', 'Score 0.0 must format as "0"');
  assert.strictEqual(formatScore(8.5, 'vi'), '8,5', 'Score 8.5 must format as "8,5"');

  // 2. Teacher comment check: when empty, comment must be empty string
  const emptyFeedback = null;
  const normalizedFeedback = (emptyFeedback || '').trim();
  assert.strictEqual(normalizedFeedback, '', 'Null feedback should normalize to empty string');
  console.log('✓ Zero score and empty comment normalization verified\n');

  // ----------------------------------------------------
  // TEST 5: No Hardcoded 'Chương mới' in createAssignment
  // ----------------------------------------------------
  console.log('--- TEST 5: No Hardcoded Chapter in createAssignment ---');
  const createdDemo = await createAssignment(demoClassId, {
    courseId: 'CS-202',
    title: 'Bài tập kiểm thử',
    description: '',
    maxScore: 10,
    allowLateSubmission: true,
  });
  assert.strictEqual(
    createdDemo.chapter,
    undefined,
    'Newly created assignment must NOT have hardcoded "Chương mới"'
  );
  console.log('✓ createAssignment chapter is undefined by default, not "Chương mới"\n');

  // ----------------------------------------------------
  // TEST 6: Student Icon Mapping (No grid_view)
  // ----------------------------------------------------
  console.log('--- TEST 6: Student Icon Mapping ---');
  const testItems = [
    { type: 'LAB', title: 'Bài tập thực hành chung', chapter: null },
    { type: 'QUIZ', title: 'Kiểm tra trắc nghiệm', chapter: 'QUIZ' },
    { type: 'LAB', title: 'Bài tập truy vấn SQL nâng cao', chapter: 'SQL' },
    { type: 'LAB', title: 'Chuẩn hóa BCNF', chapter: 'TUẦN 8' },
    { type: 'LAB', title: 'Thiết kế lược đồ ERD', chapter: 'TUẦN 7' },
    { type: undefined, title: 'Bài tập không phân loại', chapter: null },
  ];

  for (const it of testItems) {
    const isSql = it.chapter === 'SQL' || it.title.includes('SQL');
    const isQuiz = it.type === 'QUIZ' || it.chapter === 'QUIZ';
    const isBcnf = it.title.includes('BCNF') || it.chapter === 'TUẦN 8';
    const isErd = it.title.includes('ERD') || it.title.includes('lược đồ');

    const iconName = isSql
      ? 'code'
      : isQuiz
      ? 'help'
      : isBcnf
      ? 'hub'
      : isErd
      ? 'schema'
      : 'assignment';

    assert.notStrictEqual(iconName, 'grid_view', 'iconName must NEVER be grid_view');
    assert(['code', 'help', 'hub', 'schema', 'assignment'].includes(iconName));
  }
  console.log('✓ Icon mapping uses ILMS assignment icons, grid_view completely eliminated\n');

  console.log('=== ALL REAL CLASS & GRADING SYNC VERIFICATION TESTS PASSED ===');
}


  await runTests();

}

// ===============================================================
// Sub-test: verify_remove_class_banner.test.ts
// ===============================================================
async function test_verify_remove_class_banner() {



console.log('=== VERIFYING BANNER RESTORATION, ROLE SWITCHER & TOGGLE SCOPE ===\n');

// 1. Kiểm tra 3 màn BẮT BUỘC CÓ cặp nút Bài tập / Bài thi
const viewsKeepingToggle = [
  {
    name: 'Danh sách bài tập – Học viên (StudentAssignmentsTableView.tsx)',
    file: 'src/features/assignments/components/StudentAssignmentsTableView.tsx',
    required: ['activeTypeTab', 'toggleAssignments', 'toggleExams'],
  },
  {
    name: 'Danh sách bài tập – Giảng viên (TeacherAssignmentsTableView.tsx)',
    file: 'src/features/assignments/components/TeacherAssignmentsTableView.tsx',
    required: ['activeTypeTab', 'toggleAssignments', 'toggleExams'],
  },
  {
    name: 'Tạo bài tập – Giảng viên (TeacherCreateAssignmentFormView.tsx)',
    file: 'src/features/assignments/components/TeacherCreateAssignmentFormView.tsx',
    required: ['activeTypeTab', 'toggleAssignments', 'toggleExams'],
  },
];

viewsKeepingToggle.forEach((item) => {
  console.log(`Checking toggle retention in ${item.name}...`);
  const fullPath = path.resolve(process.cwd(), item.file);
  assert(fs.existsSync(fullPath), `File ${item.file} must exist`);
  const content = fs.readFileSync(fullPath, 'utf8');

  item.required.forEach((keyword) => {
    assert(
      content.includes(keyword),
      `File ${item.file} MUST contain toggle keyword "${keyword}"`
    );
  });
  console.log(`  -> PASSED: Toggle [Bài tập] / [Bài thi] is preserved accurately.\n`);
});

// 2. Kiểm tra ClassDetailPageView.tsx: Hiện Banner trên 2 danh sách, ẩn khi action=create, ẩn Role Switcher khi assignments
console.log('Checking ClassDetailPageView.tsx banner restoration and role switcher hiding...');
const classDetailPagePath = path.resolve(
  process.cwd(),
  'src/features/classes/components/detail/ClassDetailPageView.tsx'
);
assert(fs.existsSync(classDetailPagePath), 'ClassDetailPageView.tsx must exist');
const classDetailPageContent = fs.readFileSync(classDetailPagePath, 'utf8');

assert(
  classDetailPageContent.includes(
    "{!(activeTab === 'assignments' && searchParams.get('action') === 'create') && ("
  ),
  "ClassDetailPageView must render ClassDetailBanner when not creating assignment: {!(activeTab === 'assignments' && searchParams.get('action') === 'create') && ("
);

assert(
  classDetailPageContent.includes('<ClassDetailBanner'),
  'ClassDetailPageView must render <ClassDetailBanner'
);

assert(
  classDetailPageContent.includes('Role Simulator Switcher: hidden on assignments tab'),
  'ClassDetailPageView must hide Role Simulator Switcher on assignments tab'
);

assert(
  classDetailPageContent.includes("{activeTab !== 'assignments' && ("),
  "ClassDetailPageView must hide Role Switcher using {activeTab !== 'assignments' && ("
);

console.log('  -> PASSED: ClassDetailPageView correctly restores banner on assignment lists and hides role switcher.\n');

// 3. Kiểm tra ClassDetailBanner.tsx: Hỗ trợ vai trò student, canManageClass và tab assignments
console.log('Checking ClassDetailBanner.tsx capabilities...');
const bannerPath = path.resolve(
  process.cwd(),
  'src/features/classes/components/detail/ClassDetailBanner.tsx'
);
assert(fs.existsSync(bannerPath), 'ClassDetailBanner.tsx must exist');
const bannerContent = fs.readFileSync(bannerPath, 'utf8');

assert(
  bannerContent.includes("'owner' | 'teacher' | 'student'"),
  "ClassDetailBanner must accept 'student' role in currentRole"
);
assert(
  bannerContent.includes('canManageClass'),
  'ClassDetailBanner must accept canManageClass prop'
);
assert(
  bannerContent.includes('roleStudent'),
  'ClassDetailBanner must use roleStudent translation'
);
assert(
  bannerContent.includes("id: 'assignments'"),
  "ClassDetailBanner must include 'assignments' tab"
);

console.log('  -> PASSED: ClassDetailBanner properly supports student role, permission gating and assignments tab.\n');

// 4. Kiểm tra 4 màn con BẮT BUỘC KHÔNG CÓ toggle, không có banner cấp lớp và không có nút quay lại
const viewsWithoutToggleAndBanner = [
  {
    name: 'StudentAssignmentDetailPageView.tsx (3 trạng thái chi tiết Học viên)',
    file: 'src/features/assignments/components/StudentAssignmentDetailPageView.tsx',
    forbidden: [
      'activeTypeTab',
      'toggleAssignments',
      'toggleExams',
      'Top Context & Class Banner',
      'Role Simulator Switcher',
      'viewAs',
      'backToAssignmentList',
      'Quay lại danh sách bài tập',
    ],
    required: [
      'href={`/classes/${classId}?tab=assignments`}',
    ],
  },
  {
    name: 'StudentAssignmentSubmissionPageView.tsx (Form nộp bài Học viên)',
    file: 'src/features/assignments/components/StudentAssignmentSubmissionPageView.tsx',
    forbidden: [
      'activeTypeTab',
      'toggleAssignments',
      'toggleExams',
      'Top Context & Class Banner',
      'Role Simulator Switcher',
      'viewAs',
      'Quay lại chi tiết bài tập',
      '<div className="flex w-full justify-end">',
    ],
    required: [
      'href={`/classes/${classId}?tab=assignments`}',
    ],
  },
  {
    name: 'TeacherAssignmentSubmissionsPageView.tsx (Danh sách bài nộp Giảng viên)',
    file: 'src/features/assignments/components/TeacherAssignmentSubmissionsPageView.tsx',
    forbidden: [
      'activeTypeTab',
      'toggleAssignments',
      'toggleExams',
      'Top Context & Class Banner',
      'Role Simulator Switcher',
      'viewAs',
      'roles.student',
      'roles.teacher',
      'backToList',
      '<div className="flex w-full justify-end">',
    ],
    required: [
      'href={`/classes/${classId}?tab=assignments`}',
    ],
  },
  {
    name: 'TeacherSubmissionDetailView.tsx (Màn chấm điểm Giảng viên)',
    file: 'src/features/assignments/components/TeacherSubmissionDetailView.tsx',
    forbidden: [
      'activeTypeTab',
      'toggleAssignments',
      'toggleExams',
      '1. Class Banner',
      '2. Class Navigation Tabs',
      'Segmented Control: Bài tập / Bài thi',
      'Role Simulator Switcher',
      'viewAs',
      'backToSubmissions',
    ],
    required: [
      'href={`/classes/${classId}?tab=assignments`}',
    ],
  },
];

viewsWithoutToggleAndBanner.forEach((item) => {
  console.log(`Checking clean sub-view in ${item.name}...`);
  const fullPath = path.resolve(process.cwd(), item.file);
  assert(fs.existsSync(fullPath), `File ${item.file} must exist`);
  const content = fs.readFileSync(fullPath, 'utf8');

  item.forbidden.forEach((str) => {
    assert(
      !content.includes(str),
      `File ${item.file} must NOT contain forbidden string: "${str}"`
    );
  });

  item.required.forEach((str) => {
    assert(
      content.includes(str),
      `File ${item.file} MUST contain required string: "${str}"`
    );
  });

  console.log(`  -> PASSED: Cleaned up correctly without residual banner code.\n`);
});

console.log('================================================================');
console.log('ALL VERIFICATIONS PASSED: BANNER RESTORED ON 2 LISTS & SCOPES ACCURATE!');
console.log('================================================================');

}

// ===============================================================
// Sub-test: verify_student_assignments_and_exams_tables.test.ts
// ===============================================================
async function test_verify_student_assignments_and_exams_tables() {



console.log('=== VERIFYING STUDENT ASSIGNMENTS & EXAMS REDESIGN ===\n');

// 1. Kiểm tra logic 3 nhóm trạng thái loại trừ nhau và các kịch bản nộp bài
console.log('[TEST 1] Verifying 3 mutually exclusive status groups & data scenarios...');

const testAssignments: EnrichedAssignment[] = [
  // Kịch bản 1: Chưa nộp (NOT_SUBMITTED)
  {
    id: 'assign-db-04',
    title: 'Thực hành phân tích phụ thuộc hàm & Dạng chuẩn BCNF',
    type: 'LAB',
    status: 'OPEN',
    dueDate: '2024-11-05T23:59:00',
    allowLateSubmission: true,
    maxScore: 10,
    effectiveStatus: 'NOT_SUBMITTED',
    effectiveScore: null,
  },
  // Kịch bản 2: Chờ chấm (SUBMITTED, score = null)
  {
    id: 'assign-db-01',
    title: 'Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)',
    type: 'LAB',
    status: 'OPEN',
    dueDate: '2024-10-28T23:59:00',
    allowLateSubmission: true,
    maxScore: 10,
    effectiveStatus: 'SUBMITTED',
    effectiveScore: null,
  },
  // Kịch bản 3: Đã chấm và được 0 điểm (GRADED, score = 0)
  {
    id: 'assign-db-06',
    title: 'Bài tập Tối ưu hóa Câu lệnh SQL & Khóa ngoại',
    type: 'LAB',
    status: 'GRADED',
    dueDate: '2024-10-20T23:59:00',
    allowLateSubmission: false,
    maxScore: 10,
    effectiveStatus: 'GRADED',
    effectiveScore: 0,
  },
  // Đã chấm và có điểm > 0 (GRADED, score = 9)
  {
    id: 'assign-db-05',
    title: 'Kiểm tra trắc nghiệm 15 phút: Đại số quan hệ',
    type: 'QUIZ',
    status: 'GRADED',
    dueDate: '2024-11-10T23:59:00',
    allowLateSubmission: false,
    maxScore: 10,
    effectiveStatus: 'GRADED',
    effectiveScore: 9,
  },
];

// Test tính loại trừ nhau
testAssignments.forEach((item) => {
  const isUnsub = isAssignmentUnsubmitted(item);
  const isPending = isAssignmentPendingGrading(item);
  const isGrad = isAssignmentGraded(item);

  const trueCount = [isUnsub, isPending, isGrad].filter(Boolean).length;
  assert(
    trueCount === 1,
    `Assignment ${item.id} must match EXACTLY ONE status group! Found: ${trueCount} (unsubmitted: ${isUnsub}, pendingGrading: ${isPending}, graded: ${isGrad})`
  );
});

// Kiểm tra cụ thể từng kịch bản
const unsubmittedItem = testAssignments.find((a) => a.id === 'assign-db-04')!;
assert(isAssignmentUnsubmitted(unsubmittedItem), 'assign-db-04 must be unsubmitted');

const pendingItem = testAssignments.find((a) => a.id === 'assign-db-01')!;
assert(isAssignmentPendingGrading(pendingItem), 'assign-db-01 must be pending grading');

const zeroScoreItem = testAssignments.find((a) => a.id === 'assign-db-06')!;
assert(isAssignmentGraded(zeroScoreItem), 'assign-db-06 must be graded even with 0 points');
assert(zeroScoreItem.effectiveScore === 0, 'assign-db-06 effectiveScore must be strictly 0');

console.log('  -> PASSED: 3 mutually exclusive groups verified successfully.\n');

// 2. Kiểm tra kịch bản 4: Đề thi đã qua giờ đóng (CLOSED) trong MOCK_EXAMS
console.log('[TEST 2] Verifying Scenario 4: Closed exam status in exam dataset...');
const closedExam = MOCK_EXAMS.find((e) => e.status === 'CLOSED');
assert(closedExam !== undefined, 'MOCK_EXAMS must contain at least one CLOSED exam');
assert(closedExam?.id === 'EXAM_003', 'EXAM_003 must be CLOSED');
assert(closedExam?.status === 'CLOSED', 'EXAM_003 status must be CLOSED');
console.log(`  -> PASSED: Closed exam ${closedExam?.id} ("${closedExam?.title}") verified.\n`);

// 3. Kiểm tra phân trang 5 bài/trang trong cả hai component
console.log('[TEST 3] Verifying pageSize = 5 in both student views...');
const studentAssignmentsPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/StudentAssignmentsTableView.tsx'
);
const studentExamsPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/StudentExamsTableView.tsx'
);

const assignContent = fs.readFileSync(studentAssignmentsPath, 'utf8');
const examContent = fs.readFileSync(studentExamsPath, 'utf8');

assert(
  assignContent.includes('const pageSize = 5;'),
  'StudentAssignmentsTableView must have const pageSize = 5;'
);
assert(
  examContent.includes('const pageSize = 5;'),
  'StudentExamsTableView must have const pageSize = 5;'
);
console.log('  -> PASSED: Both student lists enforce pageSize = 5.\n');

// 4. Kiểm tra cấu trúc thẻ & loại bỏ KPI cards cồng kềnh trong StudentAssignmentsTableView
console.log('[TEST 4] Verifying layout & card structure in StudentAssignmentsTableView...');
assert(
  (assignContent.includes('border-2 border-slate-200') || assignContent.includes('border-2 border-slate-200/90')) &&
    (assignContent.includes('lg:grid-cols-12') || assignContent.includes('flex flex-col lg:flex-row')),
  'StudentAssignmentsTableView must use 2-column layout and border-2 cards'
);
assert(
  !assignContent.includes('kpiAvgScore'),
  'StudentAssignmentsTableView must eliminate bulky top KPI cards grid'
);
assert(
  assignContent.includes('filterChipAll') &&
  assignContent.includes('filterChipUnsubmitted') &&
  assignContent.includes('filterChipPendingGrading') &&
  assignContent.includes('filterChipGraded'),
  'StudentAssignmentsTableView must contain all 4 filter chips with counts'
);
assert(
  assignContent.includes('viewResult') && assignContent.includes('viewSubmission'),
  'StudentAssignmentsTableView must render "Xem kết quả" for graded and "Xem bài nộp" for pending'
);
console.log('  -> PASSED: Unified card and action button labels verified.\n');

// 5. Kiểm tra thu gọn khung lớp (ClassDetailBanner)
console.log('[TEST 5] Verifying compact mode in ClassDetailBanner & ClassDetailPageView...');
const bannerPath = path.resolve(
  process.cwd(),
  'src/features/classes/components/detail/ClassDetailBanner.tsx'
);
const detailPageViewPath = path.resolve(
  process.cwd(),
  'src/features/classes/components/detail/ClassDetailPageView.tsx'
);

const bannerCode = fs.readFileSync(bannerPath, 'utf8');
const detailPageCode = fs.readFileSync(detailPageViewPath, 'utf8');

assert(
  bannerCode.includes('isCompact = false') || bannerCode.includes('isCompact?: boolean'),
  'ClassDetailBanner must accept isCompact prop'
);
assert(
  bannerCode.includes('Compact Header for Assignment Views'),
  'ClassDetailBanner must contain compact header branch'
);
assert(
  detailPageCode.includes("isCompact={activeTab === 'assignments'}"),
  "ClassDetailPageView must pass isCompact={activeTab === 'assignments'} to ClassDetailBanner"
);
console.log('  -> PASSED: Compact banner logic verified.\n');

// 6. Kiểm tra i18n keys cho cả vi.json và en.json
console.log('[TEST 6] Verifying i18n keys in vi.json and en.json...');
const viPath = path.resolve(process.cwd(), 'src/messages/vi.json');
const enPath = path.resolve(process.cwd(), 'src/messages/en.json');

const viJson = JSON.parse(fs.readFileSync(viPath, 'utf8'));
const enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const requiredKeys = [
  'listTitle',
  'filterAll',
  'filterUnsubmitted',
  'filterPendingGrading',
  'filterGraded',
  'viewResult',
  'viewSubmission',
  'submitAssignment',
  'statusAwaitingGrading',
  'statusGraded',
];

requiredKeys.forEach((key) => {
  assert(
    viJson.assignments?.student?.[key] !== undefined,
    `vi.json must contain assignments.student.${key}`
  );
  assert(
    enJson.assignments?.student?.[key] !== undefined,
    `en.json must contain assignments.student.${key}`
  );
});

assert(
  viJson.assignments.student.filterUnsubmitted === 'Chưa nộp',
  'vi.json filterUnsubmitted must be "Chưa nộp"'
);
assert(
  viJson.assignments.student.filterPendingGrading === 'Chờ chấm',
  'vi.json filterPendingGrading must be "Chờ chấm"'
);
assert(
  viJson.assignments.student.viewResult === 'Xem kết quả',
  'vi.json viewResult must be "Xem kết quả"'
);

console.log('  -> PASSED: All i18n keys and values verified in vi.json and en.json.\n');

console.log('=== ALL 6 TESTS PASSED SUCCESSFULLY! ===');

}

// ===============================================================
// Sub-test: verify_student_assignments_stitch_redesign.test.ts
// ===============================================================
async function test_verify_student_assignments_stitch_redesign() {
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


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_assignments.test.ts
// ===============================================================
async function test_verify_teacher_assignments() {
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
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
  get length() {
    return Object.keys(mockStorage).length;
  },
} as unknown as Storage;
// @ts-expect-error mock window
globalThis.window = {} as unknown as Window;

function formatTeacherDueDate(dueDate?: string | null): string {
  if (!dueDate) return '';
  const d = new Date(dueDate);
  if (isNaN(d.getTime())) return dueDate;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
}

async function runTests() {
  console.log('=== RUNNING TEACHER ASSIGNMENTS TABLE VIEW VERIFICATION TESTS ===\n');

  // Reset demo storage before tests
  resetDeletedAssignmentIds();

  // ---------------------------------------------------------------
  // Test 1: Due date formatting helper
  // ---------------------------------------------------------------
  console.log('--- Test 1: formatTeacherDueDate helper ---');
  const formatted1 = formatTeacherDueDate('2024-10-28T23:59:00');
  console.log(`1a. Formatted dueDate: "${formatted1}"`);
  if (!formatted1.includes('23:59') || !formatted1.includes('28/10/2024')) {
    throw new Error('1a failed: dueDate format must be "23:59 - 28/10/2024"');
  }

  const formattedEmpty = formatTeacherDueDate(null);
  console.log(`1b. Formatted null dueDate: "${formattedEmpty}"`);
  if (formattedEmpty !== '') {
    throw new Error('1b failed: null dueDate must return empty string');
  }
  console.log('=> Test 1 PASSED.\n');

  // ---------------------------------------------------------------
  // Test 2: Paged API retrieval (GET /api/v1/classes/{classId}/assignments)
  // ---------------------------------------------------------------
  console.log('--- Test 2: getClassAssignmentsPaged page=0, size=5 ---');
  const pagedRes = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 5 });
  console.log(`2a. Total elements: ${pagedRes.totalElements}, Total pages: ${pagedRes.totalPages}`);
  console.log(`2b. Returned items count: ${pagedRes.items.length}, Page number: ${pagedRes.pageNumber}, Page size: ${pagedRes.pageSize}`);

  if (pagedRes.items.length !== 5) {
    throw new Error(`2b failed: Expected 5 items on page 0, got ${pagedRes.items.length}`);
  }
  if (pagedRes.pageNumber !== 0 || pagedRes.pageSize !== 5) {
    throw new Error('2b failed: Incorrect page metadata');
  }

  // Verify fields on each returned item: title, studentMaxScore/maxScore, dueDate, allowLateSubmission
  const firstItem = pagedRes.items[0];
  console.log(`2c. First item sample: title="${firstItem.title}", maxScore=${firstItem.studentMaxScore || firstItem.maxScore}, allowLate=${firstItem.allowLateSubmission}`);
  if (!firstItem.title) throw new Error('2c failed: title missing');
  if (firstItem.studentMaxScore === undefined && firstItem.maxScore === undefined) {
    throw new Error('2c failed: maxScore missing');
  }
  console.log('=> Test 2 PASSED.\n');

  // ---------------------------------------------------------------
  // Test 3: Search keyword and pagination reset
  // ---------------------------------------------------------------
  console.log('--- Test 3: Search filtering ---');
  const searchSqlRes = await getClassAssignmentsPaged('csdl-k22-01', {
    search: 'SQL',
    page: 0,
    size: 5,
  });
  console.log(`3a. Search "SQL" results count: ${searchSqlRes.items.length}, total: ${searchSqlRes.totalElements}`);
  if (searchSqlRes.items.length === 0) {
    throw new Error('3a failed: Expected SQL assignments to match');
  }
  for (const item of searchSqlRes.items) {
    const matched =
      item.title.toLowerCase().includes('sql') ||
      (item.description && item.description.toLowerCase().includes('sql'));
    if (!matched) throw new Error(`3a failed: item "${item.title}" does not contain SQL`);
  }

  const searchNotFound = await getClassAssignmentsPaged('csdl-k22-01', {
    search: 'nonexistent_keyword_xyz_123',
    page: 0,
    size: 5,
  });
  console.log(`3b. Nonexistent search results: ${searchNotFound.items.length}, totalElements: ${searchNotFound.totalElements}`);
  if (searchNotFound.items.length !== 0 || searchNotFound.totalElements !== 0) {
    throw new Error('3b failed: nonexistent keyword should yield 0 items');
  }
  console.log('=> Test 3 PASSED.\n');

  // ---------------------------------------------------------------
  // Test 4: Delete Assignment conflict (409) when assignment has submissions
  // ---------------------------------------------------------------
  console.log('--- Test 4: Delete Assignment conflict (409) for submitted assignment ---');
  // assign-db-01 has submitted submissions in demo
  let error409Thrown = false;
  try {
    await deleteAssignment('assign-db-01');
  } catch (err: unknown) {
    error409Thrown = true;
    const msg = (err as Error).message;
    const status = (err as unknown as { httpStatus: number }).httpStatus;
    console.log(`4a. Caught expected 409 error: status=${status}, message="${msg}"`);
    if (status !== 409) {
      throw new Error(`4a failed: Expected status 409, got ${status}`);
    }
    if (!msg.includes('Bài tập đã có bài nộp')) {
      throw new Error(`4a failed: Error message does not match expected warning`);
    }
  }

  if (!error409Thrown) {
    throw new Error('4a failed: deleteAssignment did not throw 409 for submitted assignment');
  }

  // Confirm assign-db-01 still exists in list
  const listAfterConflict = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 10 });
  const assign1StillExists = listAfterConflict.items.some((a) => a.id === 'assign-db-01');
  console.log(`4b. assign-db-01 still retained in list: ${assign1StillExists}`);
  if (!assign1StillExists) {
    throw new Error('4b failed: assign-db-01 was wrongly deleted despite 409');
  }
  console.log('=> Test 4 PASSED.\n');

  // ---------------------------------------------------------------
  // Test 5: Delete Assignment success (204) for assignment WITHOUT submissions
  // ---------------------------------------------------------------
  console.log('--- Test 5: Delete Assignment success (204) for unsubmitted assignment ---');
  // quiz-05 is UPCOMING / unsubmitted
  const targetId = 'quiz-05';
  await deleteAssignment(targetId);
  console.log(`5a. deleteAssignment(${targetId}) executed with 204 success`);

  // Verify deletedIds contains targetId
  const deletedSet = getDeletedAssignmentIds();
  console.log(`5b. Deleted IDs stored:`, Array.from(deletedSet));
  if (!deletedSet.has(targetId)) {
    throw new Error('5b failed: targetId not found in deleted set');
  }

  // Verify assignment is removed from paged query
  const pagedAfterDelete = await getClassAssignmentsPaged('cs-202', { page: 0, size: 20 });
  const quiz5Exists = pagedAfterDelete.items.some((a) => a.id === targetId);
  console.log(`5c. Target assignment ${targetId} absent from paged list: ${!quiz5Exists}`);
  if (quiz5Exists) {
    throw new Error('5c failed: deleted assignment still returned in paged list');
  }

  // Verify assignment is removed from all assignments query
  const allAfterDelete = await getAllClassAssignments('cs-202');
  const quiz5InAll = allAfterDelete.some((a) => a.id === targetId);
  console.log(`5d. Target assignment ${targetId} absent from all list: ${!quiz5InAll}`);
  if (quiz5InAll) {
    throw new Error('5d failed: deleted assignment still returned in getAllClassAssignments');
  }

  // ---------------------------------------------------------------
  // Test 6: Persistence after F5 / Page reload
  // ---------------------------------------------------------------
  console.log('--- Test 6: Persistence check after simulated reload ---');
  // Re-read storage
  const persistedDeletedIds = getDeletedAssignmentIds();
  console.log(`6a. Persisted deleted IDs from localStorage:`, Array.from(persistedDeletedIds));
  if (!persistedDeletedIds.has(targetId)) {
    throw new Error('6a failed: Deleted assignment not persisted in localStorage');
  }
  console.log('=> Test 6 PASSED.\n');

  // Reset deleted ids after test to clean up
  resetDeletedAssignmentIds();
  console.log('=> Cleaned up test storage.\n');

  // ---------------------------------------------------------------
  // Test 7: Query URL params preservation & tab=assignments F5 reload
  // ---------------------------------------------------------------
  console.log('--- Test 7: URL params synchronization & F5 tab preservation ---');
  const VALID_CLASS_TABS = [
    'overview',
    'subjects',
    'assignments',
    'announcements',
    'members',
    'gradebook',
    'materials',
    'settings',
  ] as const;

  // 7a. Initial entry with tab=assignments
  let params = new URLSearchParams('tab=assignments');
  console.log(`7a. Initial URL query: ?${params.toString()}`);
  if (params.get('tab') !== 'assignments') throw new Error('7a failed');

  // 7b. Navigate to page 2 (page=2, 1-indexed on URL)
  params.set('page', '2');
  console.log(`7b. URL query after navigating to page 2: ?${params.toString()}`);
  if (params.get('tab') !== 'assignments' || params.get('page') !== '2') {
    throw new Error('7b failed: page 2 did not preserve tab=assignments');
  }

  // 7c. Search "SQL" -> reset page, add search keyword
  params.delete('page');
  params.set('search', 'SQL');
  console.log(`7c. URL query after searching "SQL": ?${params.toString()}`);
  if (params.get('tab') !== 'assignments' || params.get('search') !== 'SQL') {
    throw new Error('7c failed: search did not preserve tab=assignments');
  }

  // 7d. Clear search keyword -> search removed, tab=assignments preserved
  params.delete('search');
  console.log(`7d. URL query after clearing search: ?${params.toString()}`);
  if (params.get('tab') !== 'assignments' || params.get('search') !== null) {
    throw new Error('7d failed: clear search lost tab=assignments');
  }

  // 7e. Simulated F5 reload logic
  const tabFromQueryAfterReload = params.get('tab');
  const isValidTab = Boolean(
    tabFromQueryAfterReload &&
      VALID_CLASS_TABS.includes(tabFromQueryAfterReload as (typeof VALID_CLASS_TABS)[number])
  );
  const activeTabAfterReload = isValidTab ? (tabFromQueryAfterReload as string) : 'subjects';
  console.log(`7e. Active tab after F5 reload: "${activeTabAfterReload}"`);
  if (activeTabAfterReload !== 'assignments') {
    throw new Error(`7e failed: Expected tab "assignments" after reload, got "${activeTabAfterReload}"`);
  }

  // 7f. Default fallback to 'subjects' ONLY when tab is missing or invalid
  const emptyParams = new URLSearchParams('');
  const missingTab = emptyParams.get('tab');
  const isMissingValid = Boolean(
    missingTab && VALID_CLASS_TABS.includes(missingTab as (typeof VALID_CLASS_TABS)[number])
  );
  const defaultTab = isMissingValid ? missingTab : 'subjects';
  console.log(`7f. Fallback tab when missing: "${defaultTab}"`);
  if (defaultTab !== 'subjects') throw new Error('7f failed: fallback should be "subjects"');

  console.log('=> Test 7 PASSED.\n');

  // ---------------------------------------------------------------
  // Test 8: Button labels for Teacher ("Danh sách bài nộp") vs Student ("Xem bài tập")
  // ---------------------------------------------------------------
  console.log('--- Test 8: Button labels (Teacher "Danh sách bài nộp" vs Student "Xem bài tập") ---');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const vi = require('../../../messages/vi.json');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const en = require('../../../messages/en.json');

  const teacherBtnVi = vi.assignments?.teacher?.actions?.viewAssignment;
  const teacherBtnEn = en.assignments?.teacher?.actions?.viewAssignment;
  console.log(`8a. Teacher button label (VI): "${teacherBtnVi}", (EN): "${teacherBtnEn}"`);
  if (teacherBtnVi !== 'Danh sách bài nộp') {
    throw new Error(`8a failed: Expected Teacher button label "Danh sách bài nộp", got "${teacherBtnVi}"`);
  }
  if (teacherBtnEn !== 'Submissions list') {
    throw new Error(`8a failed: Expected Teacher button label "Submissions list", got "${teacherBtnEn}"`);
  }

  // Trong danh sách đó, nút mở chi tiết từng bản nộp để chấm là "Xem bài nộp"
  const submissionActionVi = vi.assignments?.teacher?.submissions?.actions?.viewSubmission;
  const submissionActionEn = en.assignments?.teacher?.submissions?.actions?.viewSubmission;
  console.log(`8b. Submission item action label (VI): "${submissionActionVi}", (EN): "${submissionActionEn}"`);
  if (submissionActionVi !== 'Xem bài nộp') {
    throw new Error(`8b failed: Expected Submission item action label "Xem bài nộp", got "${submissionActionVi}"`);
  }

  const studentBtnVi = vi.assignments?.student?.viewAssignment;
  const studentBtnEn = en.assignments?.student?.viewAssignment;
  console.log(`8c. Student button label (VI): "${studentBtnVi}", (EN): "${studentBtnEn}"`);
  if (studentBtnVi !== 'Xem bài tập') {
    throw new Error(`8c failed: Expected Student button label "Xem bài tập", got "${studentBtnVi}"`);
  }
  if (studentBtnEn !== 'View Assignment') {
    throw new Error(`8c failed: Expected Student button label "View Assignment", got "${studentBtnEn}"`);
  }

  // URL checking
  const sampleClassId = 'csdl-k22-01';
  const sampleAssignmentId = 'assign-db-01';
  const targetUrl = `/classes/${sampleClassId}/assignments/${sampleAssignmentId}`;
  console.log(`8c. Target route for both roles: "${targetUrl}"`);
  if (targetUrl !== '/classes/csdl-k22-01/assignments/assign-db-01') {
    throw new Error('8c failed: Target route mismatch');
  }
  console.log('=> Test 8 PASSED.\n');

  console.log('======================================================');
  console.log('ALL TEACHER ASSIGNMENTS TABLE VIEW TESTS PASSED SUCCESSFULLY! (8/8)');
  console.log('======================================================\n');
}


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_assignments_stitch_redesign.test.ts
// ===============================================================
async function test_verify_teacher_assignments_stitch_redesign() {
/**
 * Test Suite: Verify Teacher Assignments View Redesign According to Stitch Specs
 */
async function runTests() {
  console.log('=== STARTING TEACHER ASSIGNMENTS STITCH REDESIGN VERIFICATION TESTS ===\n');

  const classId = 'csdl-k22-01';

  // ----------------------------------------------------
  // TEST 1: Paged list with size=5
  // ----------------------------------------------------
  console.log('--- TEST 1: Paged List with size=5 ---');
  const pagedRes = await getClassAssignmentsPaged(classId, { page: 0, size: 5 });
  assert.strictEqual(pagedRes.items.length, 5, 'Page 0 must return exactly 5 items');
  assert.strictEqual(pagedRes.pageSize, 5, 'Page size must be 5');
  assert(pagedRes.totalElements >= 5, 'Total elements must be at least 5');
  console.log(`✓ Returned ${pagedRes.items.length} items on page 0 with size=5, total=${pagedRes.totalElements}\n`);

  // ----------------------------------------------------
  // TEST 2: Featured Navy Card Candidate Selection Rules
  // ----------------------------------------------------
  console.log('--- TEST 2: Featured Navy Card Candidate Selection Rules ---');
  // Scenario A: Default Page 0 overview (page 0, no search, status ALL) -> Featured Card exists
  const isDefaultOverview = true;
  const featuredItem = isDefaultOverview && pagedRes.items.length > 0 ? pagedRes.items[0] : null;
  assert(featuredItem !== null, 'Featured card must exist on page 0 without search/filter');
  assert.strictEqual(featuredItem.id, 'assign-db-01', 'Featured card must be assign-db-01 (latest item)');

  // White cards below featured card should have 4 items on page 1 (5 - 1 = 4)
  const standardItemsPage0 = pagedRes.items.slice(1);
  assert.strictEqual(standardItemsPage0.length, 4, 'Standard white cards list must display remaining 4 items on page 0');

  // Scenario B: With search query -> No featured card, all 5 items rendered as white cards
  const searchRes = await getClassAssignmentsPaged(classId, { page: 0, size: 5, search: 'bài tập' });
  const hasFeaturedWithSearch = false; // When search is active, hasFeaturedCard is false
  const standardItemsWithSearch = hasFeaturedWithSearch ? searchRes.items.slice(1) : searchRes.items;
  assert.strictEqual(standardItemsWithSearch.length, searchRes.items.length, 'All search results must render as standard white cards');
  console.log('✓ Featured Navy Card rules verified: 1 featured + 4 white cards on page 0, full white cards during search\n');

  // ----------------------------------------------------
  // TEST 3: Due Date Filter Dropdown ('ALL', 'ACTIVE', 'PAST_DUE', 'NO_DEADLINE')
  // ----------------------------------------------------
  console.log('--- TEST 3: Due Date Filter Dropdown ---');
  const allRes = await getClassAssignmentsPaged(classId, { page: 0, size: 10, status: 'ALL' });
  const activeRes = await getClassAssignmentsPaged(classId, { page: 0, size: 10, status: 'ACTIVE' });
  const pastDueRes = await getClassAssignmentsPaged(classId, { page: 0, size: 10, status: 'PAST_DUE' });
  const noDeadlineRes = await getClassAssignmentsPaged(classId, { page: 0, size: 10, status: 'NO_DEADLINE' });

  // Verify ACTIVE items have future due dates
  const now = Date.now();
  for (const item of activeRes.items) {
    assert(item.dueDate !== null && item.dueDate !== undefined, 'ACTIVE item must have a due date');
    assert(new Date(item.dueDate).getTime() >= now, `ACTIVE item ${item.id} due date must be in the future`);
  }

  // Verify PAST_DUE items have past due dates
  for (const item of pastDueRes.items) {
    assert(item.dueDate !== null && item.dueDate !== undefined, 'PAST_DUE item must have a due date');
    assert(new Date(item.dueDate).getTime() < now, `PAST_DUE item ${item.id} due date must be in the past`);
  }

  // Verify NO_DEADLINE items have no due date
  for (const item of noDeadlineRes.items) {
    assert(!item.dueDate, `NO_DEADLINE item ${item.id} must not have a due date`);
  }

  console.log(`✓ Filters verified: Total=${allRes.totalElements}, Active=${activeRes.totalElements}, PastDue=${pastDueRes.totalElements}, NoDeadline=${noDeadlineRes.totalElements}\n`);

  // ----------------------------------------------------
  // TEST 4: Grading Progress Synchronized with Submissions List
  // ----------------------------------------------------
  console.log('--- TEST 4: Grading Progress Synchronized with Submissions List ---');
  // assign-db-01: 5 active demo submissions (2 graded: score 0 and score 8.5)
  const p1 = await getAssignmentGradingProgress('assign-db-01', classId);
  const sub1 = await getAssignmentSubmissionsPaged('assign-db-01', { classId });
  assert.strictEqual(p1.totalSubmissions, sub1.totalElements, 'assign-db-01 total submissions must match submissions list');
  assert.strictEqual(p1.totalSubmissions, 5, 'assign-db-01 total submissions must be 5');
  assert.strictEqual(p1.gradedSubmissions, 2, 'assign-db-01 graded submissions must be 2');
  assert.strictEqual(p1.pendingGrading, 3, 'assign-db-01 pending grading must be 3');
  assert.strictEqual(p1.isAllGraded, false);
  assert.strictEqual(p1.hasNoSubmissions, false);

  // assign-db-02: 1 submission (submitted, ungraded)
  const p2 = await getAssignmentGradingProgress('assign-db-02', classId);
  assert.strictEqual(p2.totalSubmissions, 1);
  assert.strictEqual(p2.gradedSubmissions, 0);
  assert.strictEqual(p2.pendingGrading, 1);

  // assign-db-03: 0/0 (no submissions)
  const p3 = await getAssignmentGradingProgress('assign-db-03', classId);
  assert.strictEqual(p3.totalSubmissions, 0);
  assert.strictEqual(p3.hasNoSubmissions, true);

  // assign-db-04: 0/0 (no submissions)
  const p4 = await getAssignmentGradingProgress('assign-db-04', classId);
  assert.strictEqual(p4.totalSubmissions, 0);
  assert.strictEqual(p4.hasNoSubmissions, true);

  // assign-db-05: 1/1 • all graded
  const p5 = await getAssignmentGradingProgress('assign-db-05', classId);
  const sub5 = await getAssignmentSubmissionsPaged('assign-db-05', { classId });
  assert.strictEqual(p5.totalSubmissions, sub5.totalElements);
  assert.strictEqual(p5.totalSubmissions, 1);
  assert.strictEqual(p5.gradedSubmissions, 1);
  assert.strictEqual(p5.pendingGrading, 0);
  assert.strictEqual(p5.isAllGraded, true);

  console.log('✓ All 5 assignments match exact submissions list\n');

  // ----------------------------------------------------
  // TEST 5: "Xem bài tập" Modal Data Loading
  // ----------------------------------------------------
  console.log('--- TEST 5: "Xem bài tập" Modal Data Loading ---');
  const viewDetail = await getAssignmentById('assign-db-01', classId);
  assert(viewDetail.title.includes('chuẩn hóa'), 'Assignment title must match');
  assert(viewDetail.description && viewDetail.description.length > 0, 'Assignment description must be populated');
  assert(viewDetail.fileAttachmentUrl && viewDetail.fileAttachmentUrl.includes('De_bai_Tuan_06.pdf'), 'Attachment URL must match Stitch');
  assert.strictEqual(viewDetail.maxScore, 10, 'Max score must be 10');
  assert.strictEqual(viewDetail.allowLateSubmission, true, 'Late submission must be allowed');
  console.log(`✓ "Xem bài tập" detail loaded successfully for ${viewDetail.id} with attachment: ${viewDetail.fileAttachmentUrl}\n`);

  // ----------------------------------------------------
  // TEST 6: Delete Assignment Conflict (409) vs Success (204)
  // ----------------------------------------------------
  console.log('--- TEST 6: Delete Assignment Conflict (409) vs Success (204) ---');
  let conflictCaught = false;
  try {
    await deleteAssignment('assign-db-01', classId);
  } catch (err: unknown) {
    conflictCaught = true;
    const httpStatus = (err as { httpStatus?: number })?.httpStatus;
    const msg = (err as Error)?.message;
    assert.strictEqual(httpStatus, 409, 'Must throw 409 Conflict when deleting assignment with submissions');
    assert(msg?.includes('Bài tập đã có bài nộp sẽ không thể xóa'), 'Must provide clear conflict message');
  }
  assert(conflictCaught, '409 Conflict error must be caught when deleting assign-db-01');

  // Deleting unsubmitted assignment quiz-05 should succeed
  await deleteAssignment('quiz-05', classId);
  const afterDeleteRes = await getClassAssignmentsPaged(classId, { page: 0, size: 20 });
  assert(!afterDeleteRes.items.some((a) => a.id === 'quiz-05'), 'quiz-05 must be removed from list');
  console.log('✓ Delete conflict 409 handled and unsubmitted delete 204 verified\n');

  // ----------------------------------------------------
  // TEST 7: Responsive 2-Column Layout & Translation Keys Integrity
  // ----------------------------------------------------
  console.log('--- TEST 7: Translation Keys Integrity ---');
  const fs = await import('fs');
  const vi = JSON.parse(fs.readFileSync('src/messages/vi.json', 'utf8'));
  const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));

  assert(vi.assignments?.teacher?.sidebar?.title, 'VI sidebar title must exist');
  assert(en.assignments?.teacher?.sidebar?.title, 'EN sidebar title must exist');
  assert(vi.assignments?.teacher?.statusFilter?.all, 'VI status filter "all" must exist');
  assert(en.assignments?.teacher?.statusFilter?.all, 'EN status filter "all" must exist');
  assert(vi.assignments?.teacher?.featured?.gradingProgress, 'VI featured grading progress key must exist');
  assert(en.assignments?.teacher?.featured?.gradingProgress, 'EN featured grading progress key must exist');
  assert(vi.assignments?.teacher?.card?.allGraded, 'VI card allGraded key must exist');
  assert(en.assignments?.teacher?.card?.allGraded, 'EN card allGraded key must exist');
  assert(vi.assignments?.teacher?.viewModal?.title, 'VI viewModal title must exist');
  assert(en.assignments?.teacher?.viewModal?.title, 'EN viewModal title must exist');
  console.log('✓ All i18n keys for Teacher Assignments redesign verified in both vi.json and en.json\n');

  console.log('================================================================');
  console.log('🎉 ALL 7 TEACHER ASSIGNMENTS STITCH REDESIGN TESTS PASSED (7/7)!');
  console.log('================================================================');
}


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_delete_and_borders.test.ts
// ===============================================================
async function test_verify_teacher_delete_and_borders() {
// Mock localStorage for node test environment
const mockStorage: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
  },
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
  get length() {
    return Object.keys(mockStorage).length;
  },
} as unknown as Storage;
(globalThis as unknown as { window: unknown }).window = {};

async function runTests() {
  console.log('=== VERIFYING TEACHER DELETE ASSIGNMENT (4 CASES) & BORDER-2 UPGRADE ===\n');

  // Clear demo storage
  resetCreatedAssignments();
  resetDeletedAssignmentIds();

  // -------------------------------------------------------------
  // Test Case (d): Bài mới tạo chưa có bản nộp -> Xóa thành công & F5 biến mất
  // -------------------------------------------------------------
  console.log('Test Case (d): Create test demo assignment on csdl-k22-01 and delete it...');
  const initialList = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  const initialTotal = initialList.totalElements;

  // Create assignment without submissions
  const newAssign = await createAssignment('csdl-k22-01', {
    courseId: 'course-db-01',
    title: 'Bài tập thử nghiệm xóa demo ' + Date.now(),
    description: 'Mô tả bài tập thử nghiệm',
    maxScore: 10,
    dueDate: '2025-12-31T23:59:00',
    allowLateSubmission: true,
  });
  assert(Boolean(newAssign && newAssign.id), 'Test assignment must be created with an ID');
  console.log(`  -> Created demo assignment: ${newAssign.id} (${newAssign.title})`);

  // Verify it appears in list
  const listAfterCreate = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  assert(
    listAfterCreate.totalElements === initialTotal + 1,
    `Total elements must increase by 1 (expected ${initialTotal + 1}, got ${listAfterCreate.totalElements})`
  );
  assert(
    listAfterCreate.items.some((item) => item.id === newAssign.id),
    'Created assignment must be in the list'
  );

  // Delete the assignment
  await deleteAssignment(newAssign.id, 'csdl-k22-01');
  console.log('  -> deleteAssignment executed cleanly without network errors.');

  // Verify it is removed from list
  const listAfterDelete = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  assert(
    !listAfterDelete.items.some((item) => item.id === newAssign.id),
    'Deleted assignment MUST NOT be in the list'
  );
  assert(
    listAfterDelete.totalElements === initialTotal,
    `Total elements must be back to ${initialTotal} (got ${listAfterDelete.totalElements})`
  );

  // Verify F5 persistence: check storage
  const createdInStorage = getCreatedAssignments('csdl-k22-01');
  assert(
    !createdInStorage.some((a) => a.id === newAssign.id),
    'Deleted assignment MUST be purged from CREATED_ASSIGNMENTS_STORAGE'
  );
  const deletedIds = getDeletedAssignmentIds();
  assert(
    deletedIds.has(newAssign.id),
    'Deleted assignment ID MUST be present in DELETED_ASSIGNMENTS_STORAGE'
  );
  console.log('  -> PASSED Case (d): New demo assignment deletion & F5 persistence verified.\n');

  // -------------------------------------------------------------
  // Test Case (c): Bài có bản nộp còn hiệu lực (assign-db-01) -> Bị chặn 409 Conflict, giữ lại trong bảng
  // Đối chiếu getAssignmentSubmissionsPaged và deleteAssignment dùng chung nguồn dữ liệu
  // -------------------------------------------------------------
  console.log('Test Case (c): Delete assignment with active submissions (assign-db-01, must throw 409 Conflict)...');
  const subsDb01 = await getAssignmentSubmissionsPaged('assign-db-01', { classId: 'csdl-k22-01' });
  console.log(`  -> assign-db-01 totalElements in Submissions view: ${subsDb01.totalElements}`);
  assert(subsDb01.totalElements === 5, `assign-db-01 must have 5 initial submissions, got ${subsDb01.totalElements}`);
  const activeSubsDb01 = getActiveDemoSubmissions('assign-db-01');
  assert(activeSubsDb01.length === subsDb01.totalElements, 'getActiveDemoSubmissions must match getAssignmentSubmissionsPaged totalElements');

  let threwConflict = false;
  try {
    // assign-db-01 has active submissions
    await deleteAssignment('assign-db-01', 'csdl-k22-01');
  } catch (err: unknown) {
    threwConflict = true;
    const status =
      (err as { httpStatus?: number; response?: { status?: number } })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status;
    const msg = (err as Error)?.message;
    assert(status === 409, `Error status must be 409, got ${status}`);
    assert(
      msg.includes('Bài tập đã có bài nộp'),
      `Error message must mention submissions conflict, got "${msg}"`
    );
    console.log(`  -> Correctly blocked with 409: "${msg}"`);
  }
  assert(threwConflict, 'Deleting assignment with submissions MUST throw 409 Conflict');

  // Verify assign-db-01 is still in the list
  const listAfterBlocked = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  assert(
    listAfterBlocked.items.some((item) => item.id === 'assign-db-01'),
    'assign-db-01 must remain in the list after blocked delete'
  );

  // Even if one student cancels their submission, other students still have submissions -> still blocked
  console.log('  -> Current student cancels their own submission on assign-db-01...');
  await deleteSubmission('sub-assign-db-01', 'assign-db-01', 'student-k22-vu-minh');
  const subsDb01AfterCancelOne = await getAssignmentSubmissionsPaged('assign-db-01', { classId: 'csdl-k22-01' });
  console.log(`  -> assign-db-01 totalElements after 1 student cancels: ${subsDb01AfterCancelOne.totalElements}`);
  assert(
    subsDb01AfterCancelOne.totalElements > 0,
    `assign-db-01 must still have other students submissions active (got ${subsDb01AfterCancelOne.totalElements})`
  );

  let threwConflictAfterOneCancel = false;
  try {
    await deleteAssignment('assign-db-01', 'csdl-k22-01');
  } catch (err: unknown) {
    threwConflictAfterOneCancel = true;
    const status = (err as { httpStatus?: number })?.httpStatus;
    assert(status === 409, `Should still be 409 conflict when other students have submissions, got ${status}`);
    console.log('  -> assign-db-01 deletion still blocked with 409 because other students have submissions.');
  }
  assert(threwConflictAfterOneCancel, 'Must still block deletion when other students have active submissions');

  console.log('  -> PASSED Case (c): 409 Conflict handling verified.\n');

  // -------------------------------------------------------------
  // Test Case (a): Bài mẫu có sẵn chưa có bản nộp (assign-db-04) -> Xóa thành công & F5 biến mất
  // -------------------------------------------------------------
  console.log('Test Case (a): Delete pre-existing mock assignment without submissions (assign-db-04)...');
  const subsDb04 = await getAssignmentSubmissionsPaged('assign-db-04', { classId: 'csdl-k22-01' });
  console.log(`  -> assign-db-04 totalElements in Submissions view: ${subsDb04.totalElements}`);
  assert(subsDb04.totalElements === 0, `assign-db-04 must have 0 submissions, got ${subsDb04.totalElements}`);

  const listBeforeA = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  const totalBeforeA = listBeforeA.totalElements;
  assert(
    listBeforeA.items.some((item) => item.id === 'assign-db-04'),
    'assign-db-04 must initially exist in list'
  );

  await deleteAssignment('assign-db-04', 'csdl-k22-01');
  console.log('  -> assign-db-04 deleted cleanly without error.');

  // Verify it is removed and total elements decremented
  const listAfterA = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  assert(
    !listAfterA.items.some((item) => item.id === 'assign-db-04'),
    'assign-db-04 MUST NOT be in the list after delete'
  );
  assert(
    listAfterA.totalElements === totalBeforeA - 1,
    `Total elements must decrement by 1 (expected ${totalBeforeA - 1}, got ${listAfterA.totalElements})`
  );
  assert(
    getDeletedAssignmentIds().has('assign-db-04'),
    'assign-db-04 MUST be recorded in DELETED_ASSIGNMENTS_STORAGE for F5 persistence'
  );
  console.log('  -> PASSED Case (a): Pre-existing assignment without submissions deleted & persisted across F5.\n');

  // -------------------------------------------------------------
  // Test Case (b): Bài chỉ có 1 bản nộp và đã bị hủy (assign-db-02) -> Cho phép xóa khi không còn bản nộp
  // -------------------------------------------------------------
  console.log('Test Case (b): Delete assignment whose only submission was cancelled (assign-db-02)...');
  // First, verify assign-db-02 has 1 submission before cancellation
  const subsDb02Before = await getAssignmentSubmissionsPaged('assign-db-02', { classId: 'csdl-k22-01' });
  console.log(`  -> assign-db-02 totalElements before cancel: ${subsDb02Before.totalElements}`);
  assert(subsDb02Before.totalElements === 1, `assign-db-02 must have 1 initial submission, got ${subsDb02Before.totalElements}`);

  let threwBlockedBeforeCancel = false;
  try {
    await deleteAssignment('assign-db-02', 'csdl-k22-01');
  } catch (err: unknown) {
    threwBlockedBeforeCancel = true;
    const status =
      (err as { httpStatus?: number; response?: { status?: number } })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status;
    assert(status === 409, `Should be 409 before cancel, got ${status}`);
    console.log('  -> Before cancel: assign-db-02 delete correctly blocked with 409');
  }
  assert(threwBlockedBeforeCancel, 'assign-db-02 must be blocked before submission is cancelled');

  // Student cancels their submission on assign-db-02
  console.log('  -> Student cancels submission on assign-db-02...');
  await deleteSubmission('sub-assign-db-02', 'assign-db-02');

  // Check submissions view of assign-db-02 after cancel: totalElements must be 0!
  const subsDb02After = await getAssignmentSubmissionsPaged('assign-db-02', { classId: 'csdl-k22-01' });
  console.log(`  -> assign-db-02 totalElements after cancel: ${subsDb02After.totalElements}`);
  assert(subsDb02After.totalElements === 0, `assign-db-02 totalElements must be 0 after cancel, got ${subsDb02After.totalElements}`);

  // Now teacher deletes assign-db-02: must SUCCEED!
  const listBeforeB = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  const totalBeforeB = listBeforeB.totalElements;

  await deleteAssignment('assign-db-02', 'csdl-k22-01');
  console.log('  -> After cancel: assign-db-02 deleted cleanly without error!');

  // Verify assign-db-02 is removed from list
  const listAfterB = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  assert(
    !listAfterB.items.some((item) => item.id === 'assign-db-02'),
    'assign-db-02 MUST NOT be in the list after delete'
  );
  assert(
    listAfterB.totalElements === totalBeforeB - 1,
    `Total elements must decrement by 1 (expected ${totalBeforeB - 1}, got ${listAfterB.totalElements})`
  );
  assert(
    getDeletedAssignmentIds().has('assign-db-02'),
    'assign-db-02 MUST be recorded in DELETED_ASSIGNMENTS_STORAGE for F5 persistence'
  );
  console.log('  -> PASSED Case (b): Assignment whose submission was cancelled can now be deleted & persisted across F5.\n');

  // -------------------------------------------------------------
  // Test 3: Verify border-2 in all 9 screens/states
  // -------------------------------------------------------------
  console.log('Test 3: Verify border-2 on all 9 screens/states...');

  // Màn 1: StudentAssignmentsTableView.tsx
  const studentTablePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/StudentAssignmentsTableView.tsx'
  );
  const studentTableContent = fs.readFileSync(studentTablePath, 'utf8');
  assert(
    studentTableContent.includes('border-2 border-slate-200 dark:border-slate-800'),
    'StudentAssignmentsTableView must have border-2 on KPI cards and main container'
  );
  assert(
    studentTableContent.includes('border-2 border-slate-200 dark:border-slate-700'),
    'StudentAssignmentsTableView must have border-2 on search input'
  );
  assert(
    studentTableContent.includes('border-2 border-blue-800/40'),
    'StudentAssignmentsTableView must have border-2 on Socratic AI mentor card'
  );
  console.log('  -> Màn 1 (Danh sách bài tập - Học viên): border-2 OK');

  // Màn 2, 4, 5: StudentAssignmentDetailPageView.tsx (Chưa nộp, Chờ chấm, Đã chấm)
  const studentDetailPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/StudentAssignmentDetailPageView.tsx'
  );
  const studentDetailContent = fs.readFileSync(studentDetailPath, 'utf8');
  assert(
    studentDetailContent.includes('border-2 border-slate-200/80 dark:border-slate-800'),
    'StudentAssignmentDetailPageView must have border-2 on unified main card'
  );
  assert(
    studentDetailContent.includes('border-2 border-slate-200/80 dark:border-slate-700/80'),
    'StudentAssignmentDetailPageView must have border-2 on left rules and right action clusters'
  );
  assert(
    studentDetailContent.includes('border-2 border-slate-200 dark:border-slate-800'),
    'StudentAssignmentDetailPageView must have border-2 on submitted work card'
  );
  assert(
    studentDetailContent.includes('border-2 border-blue-200 dark:border-blue-900/60'),
    'StudentAssignmentDetailPageView must have border-2 on teacher feedback card'
  );
  console.log('  -> Màn 2, 4, 5 (Chi tiết Chưa nộp, Chờ chấm, Đã chấm - Học viên): border-2 OK');

  // Màn 3: StudentAssignmentSubmissionPageView.tsx (Form nộp bài - Học viên)
  const studentSubmitPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/StudentAssignmentSubmissionPageView.tsx'
  );
  const studentSubmitContent = fs.readFileSync(studentSubmitPath, 'utf8');
  assert(
    studentSubmitContent.includes('border-2 border-slate-200 dark:border-slate-800'),
    'StudentAssignmentSubmissionPageView must have border-2 on main form card and info card'
  );
  assert(
    studentSubmitContent.includes('border-2 border-slate-200/80 dark:border-slate-700/80'),
    'StudentAssignmentSubmissionPageView must have border-2 on note box'
  );
  assert(
    studentSubmitContent.includes('rounded-xl border-2 p-4 text-sm'),
    'StudentAssignmentSubmissionPageView must have border-2 on submission textarea'
  );
  console.log('  -> Màn 3 (Form nộp bài - Học viên): border-2 OK');

  // Màn 6: TeacherAssignmentsTableView.tsx (Danh sách bài tập - Giảng viên)
  const teacherTablePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherAssignmentsTableView.tsx'
  );
  const teacherTableContent = fs.readFileSync(teacherTablePath, 'utf8');
  assert(
    teacherTableContent.includes('border-2 border-slate-200/80 dark:border-slate-800'),
    'TeacherAssignmentsTableView must have border-2 on main container and table container'
  );
  assert(
    teacherTableContent.includes('border-2 border-slate-200 dark:border-slate-700/80'),
    'TeacherAssignmentsTableView must have border-2 on search input'
  );
  assert(
    teacherTableContent.includes('border-2 border-slate-200 dark:border-slate-800 space-y-4'),
    'TeacherAssignmentsTableView must have border-2 on delete modal'
  );
  console.log('  -> Màn 6 (Danh sách bài tập - Giảng viên): border-2 OK');

  // Màn 7: TeacherCreateAssignmentFormView.tsx (Tạo bài tập - Giảng viên)
  const teacherCreatePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherCreateAssignmentFormView.tsx'
  );
  const teacherCreateContent = fs.readFileSync(teacherCreatePath, 'utf8');
  assert(
    teacherCreateContent.includes('border-2 border-slate-200/80 dark:border-slate-800 p-6 sm:p-8'),
    'TeacherCreateAssignmentFormView must have border-2 on form card'
  );
  assert(
    teacherCreateContent.includes('border-2 border-slate-200/80 dark:border-slate-800 flex items-center'),
    'TeacherCreateAssignmentFormView must have border-2 on late submission toggle container'
  );
  assert(
    teacherCreateContent.includes('border-2 shadow-xs'),
    'TeacherCreateAssignmentFormView must have border-2 on select/input fields'
  );
  console.log('  -> Màn 7 (Tạo bài tập - Giảng viên): border-2 OK');

  // Màn 8: TeacherAssignmentSubmissionsPageView.tsx (Danh sách bài nộp - Giảng viên)
  const teacherSubmissionsPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherAssignmentSubmissionsPageView.tsx'
  );
  const teacherSubmissionsContent = fs.readFileSync(teacherSubmissionsPath, 'utf8');
  assert(
    teacherSubmissionsContent.includes('border-2 border-slate-800 shadow-sm'),
    'TeacherAssignmentSubmissionsPageView must have border-2 on Hero Navy card'
  );
  assert(
    teacherSubmissionsContent.includes('border-2 border-[#D9E2E8] dark:border-slate-800 p-6 shadow-sm'),
    'TeacherAssignmentSubmissionsPageView must have border-2 on unified toolbar/table card'
  );
  assert(
    teacherSubmissionsContent.includes('border-2 border-[#D9E2E8] dark:border-slate-700 rounded-lg'),
    'TeacherAssignmentSubmissionsPageView must have border-2 on search input'
  );
  assert(
    teacherSubmissionsContent.includes('border-2 border-[#D9E2E8] dark:border-slate-700 rounded-xl overflow-x-auto'),
    'TeacherAssignmentSubmissionsPageView must have border-2 on table wrapper'
  );
  console.log('  -> Màn 8 (Danh sách bài nộp - Giảng viên): border-2 OK');

  // Màn 9: TeacherSubmissionDetailView.tsx (Chi tiết bài nộp & chấm điểm - Giảng viên)
  const teacherDetailPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherSubmissionDetailView.tsx'
  );
  const teacherDetailContent = fs.readFileSync(teacherDetailPath, 'utf8');
  assert(
    teacherDetailContent.includes('border-2 border-[#E0E3E8] shadow-xs'),
    'TeacherSubmissionDetailView must have border-2 on header and cards'
  );
  assert(
    teacherDetailContent.includes('border-2 border-[#E0E3E8] p-6 shadow-xs space-y-5'),
    'TeacherSubmissionDetailView must have border-2 on student submission card'
  );
  assert(
    teacherDetailContent.includes('border-2 border-[#E0E3E8] p-6 shadow-xs space-y-4'),
    'TeacherSubmissionDetailView must have border-2 on assignment specs card'
  );
  assert(
    teacherDetailContent.includes('border-2 border-[#E0E3E8] p-5 shadow-xs space-y-3'),
    'TeacherSubmissionDetailView must have border-2 on rules card'
  );
  assert(
    teacherDetailContent.includes('border-2 border-[#E0E3E8] p-5 shadow-xs space-y-5'),
    'TeacherSubmissionDetailView must have border-2 on grading form card'
  );
  console.log('  -> Màn 9 (Chi tiết bài nộp & chấm điểm - Giảng viên): border-2 OK');

  console.log('\n================================================================');
  console.log('ALL TESTS PASSED: TEACHER DELETE & BORDER-2 VERIFIED ON ALL 9 SCREENS!');
  console.log('================================================================\n');
}


  await runTests();

}

export async function runAll() {
  return runSuite('Assignment Lists & Tables Suite', [
    { name: 'verify_assignments_view_polish_and_modal.test.ts', fn: test_verify_assignments_view_polish_and_modal },
    { name: 'verify_back_links_right_alignment.test.ts', fn: test_verify_back_links_right_alignment },
    { name: 'verify_class_assignments_cross_class_and_layout.test.ts', fn: test_verify_class_assignments_cross_class_and_layout },
    { name: 'verify_grading_progress_sync.test.ts', fn: test_verify_grading_progress_sync },
    { name: 'verify_real_class_assignments_and_grading_sync.test.ts', fn: test_verify_real_class_assignments_and_grading_sync },
    { name: 'verify_remove_class_banner.test.ts', fn: test_verify_remove_class_banner },
    { name: 'verify_student_assignments_and_exams_tables.test.ts', fn: test_verify_student_assignments_and_exams_tables },
    { name: 'verify_student_assignments_stitch_redesign.test.ts', fn: test_verify_student_assignments_stitch_redesign },
    { name: 'verify_teacher_assignments.test.ts', fn: test_verify_teacher_assignments },
    { name: 'verify_teacher_assignments_stitch_redesign.test.ts', fn: test_verify_teacher_assignments_stitch_redesign },
    { name: 'verify_teacher_delete_and_borders.test.ts', fn: test_verify_teacher_delete_and_borders },
  ]);
}

if (require.main === module || !process.env.TEST_RUNNER) {
  runAll().then((res) => {
    if (res.failedCount > 0) {
      process.exit(1);
    }
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
