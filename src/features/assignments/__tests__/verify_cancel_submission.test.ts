import {
  deleteSubmission,
  getMySubmission,
  getMySubmissionsBatch,
  getLocalSubmission,
  saveLocalSubmission,
  MOCK_ASSIGNMENTS,
  INITIAL_DEMO_SUBMISSIONS,
} from '../services/assignment.service';
import {
  evaluateCanCancelSubmission,
  evaluateCanSubmitAssignment,
} from '../utils/submissionValidation';
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
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
  get length() {
    return Object.keys(mockStorage).length;
  },
} as unknown as Storage;
// @ts-expect-error mock window
globalThis.window = {} as unknown as Window;

async function runTests() {
  console.log('=== RUNNING CANCEL SUBMISSION VERIFICATION TESTS ===\n');

  // ---------------------------------------------------------------
  // Test 1: Unit tests for evaluateCanCancelSubmission
  // ---------------------------------------------------------------
  console.log('--- Test 1: evaluateCanCancelSubmission unit tests ---');

  // 1a. SUBMITTED -> canCancel: true
  const subPending: MySubmission = {
    id: 'sub-1',
    assignmentId: 'assign-1',
    status: 'SUBMITTED',
    attachmentUrls: [],
  };
  const res1a = evaluateCanCancelSubmission({ submission: subPending });
  console.log(`1a. SUBMITTED: canCancel=${res1a.canCancel}, reason=${res1a.reason}`);
  if (!res1a.canCancel || res1a.reason !== 'OK') throw new Error('1a failed');

  // 1b. RESUBMITTED -> canCancel: true
  const subResub: MySubmission = {
    id: 'sub-2',
    assignmentId: 'assign-2',
    status: 'RESUBMITTED',
    attachmentUrls: [],
  };
  const res1b = evaluateCanCancelSubmission({ submission: subResub });
  console.log(`1b. RESUBMITTED: canCancel=${res1b.canCancel}, reason=${res1b.reason}`);
  if (!res1b.canCancel || res1b.reason !== 'OK') throw new Error('1b failed');

  // 1c. LATE -> canCancel: true
  const subLate: MySubmission = {
    id: 'sub-3',
    assignmentId: 'assign-3',
    status: 'LATE',
    isLate: true,
    attachmentUrls: [],
  };
  const res1c = evaluateCanCancelSubmission({ submission: subLate });
  console.log(`1c. LATE: canCancel=${res1c.canCancel}, reason=${res1c.reason}`);
  if (!res1c.canCancel || res1c.reason !== 'OK') throw new Error('1c failed');

  // 1d. GRADED -> canCancel: false (locked)
  const subGraded: MySubmission = {
    id: 'sub-4',
    assignmentId: 'assign-4',
    status: 'GRADED',
    score: 8.5,
    attachmentUrls: [],
  };
  const res1d = evaluateCanCancelSubmission({ submission: subGraded });
  console.log(`1d. GRADED: canCancel=${res1d.canCancel}, reason=${res1d.reason}`);
  if (res1d.canCancel || res1d.reason !== 'ALREADY_GRADED') throw new Error('1d failed');

  // 1e. Has score even if status not set to GRADED -> canCancel: false
  const subWithScore: MySubmission = {
    id: 'sub-5',
    assignmentId: 'assign-5',
    status: 'SUBMITTED',
    score: 9.0,
    attachmentUrls: [],
  };
  const res1e = evaluateCanCancelSubmission({ submission: subWithScore });
  console.log(`1e. SUBMITTED with score: canCancel=${res1e.canCancel}`);
  if (res1e.canCancel || res1e.reason !== 'ALREADY_GRADED') throw new Error('1e failed');

  // 1f. NOT_SUBMITTED -> canCancel: false
  const subNotSub: MySubmission = {
    assignmentId: 'assign-6',
    status: 'NOT_SUBMITTED',
    attachmentUrls: [],
  };
  const res1f = evaluateCanCancelSubmission({ submission: subNotSub });
  console.log(`1f. NOT_SUBMITTED: canCancel=${res1f.canCancel}, reason=${res1f.reason}`);
  if (res1f.canCancel || res1f.reason !== 'NO_SUBMISSION') throw new Error('1f failed');

  // ---------------------------------------------------------------
  // Test 2: Ca 1 — BT2 (assign-db-02): Đúng hạn, chưa chấm, allowLateSubmission: false
  // ---------------------------------------------------------------
  console.log('\n--- Test 2: Ca 1 — BT2 (assign-db-02: on-time, un-graded, no late allowed) ---');
  localStorage.clear();

  const assignDb02 = MOCK_ASSIGNMENTS.find((a) => a.id === 'assign-db-02')!;
  console.log(`BT2 dueDate: ${assignDb02.dueDate}, allowLateSubmission: ${assignDb02.allowLateSubmission}`);

  // Step 2a: Initial state from mock
  const initSub02 = await getMySubmission('assign-db-02');
  console.log(`2a. Initial state: status=${initSub02.status}, isLate=${initSub02.isLate}`);
  if (initSub02.status !== 'SUBMITTED' || initSub02.isLate !== false) {
    throw new Error('2a failed: initial BT2 must be SUBMITTED and isLate=false');
  }

  const canCancel02Before = evaluateCanCancelSubmission({ submission: initSub02 });
  if (!canCancel02Before.canCancel) throw new Error('2a failed: BT2 must be cancellable before cancel');

  // Step 2b: Execute cancellation
  await deleteSubmission('sub-assign-db-02', 'assign-db-02');

  // Step 2c: Verify detail page status after cancel
  const sub02AfterCancel = await getMySubmission('assign-db-02');
  console.log(`2b. After cancel: status=${sub02AfterCancel.status}`);
  if (sub02AfterCancel.status !== 'NOT_SUBMITTED') {
    throw new Error('2b failed: BT2 status must be NOT_SUBMITTED after cancel');
  }

  // Step 2d: Verify resubmission permission: past due and allowLateSubmission: false -> BLOCKED
  const canSubmit02After = evaluateCanSubmitAssignment({
    assignment: { ...assignDb02, dueDate: '2024-11-02T23:59:00', allowLateSubmission: false },
    submission: sub02AfterCancel,
  });
  console.log(`2c. Resubmit permission: canSubmit=${canSubmit02After.canSubmit}, reason=${canSubmit02After.reason}`);
  if (canSubmit02After.canSubmit !== false || canSubmit02After.reason !== 'DEADLINE_PASSED') {
    throw new Error('2c failed: BT2 must NOT be allowed to resubmit because deadline has passed and allowLateSubmission is false');
  }

  // Step 2e: Simulate F5 (Page reload)
  const sub02AfterF5 = await getMySubmission('assign-db-02');
  console.log(`2d. After F5 reload: status=${sub02AfterF5.status}`);
  if (sub02AfterF5.status !== 'NOT_SUBMITTED') {
    throw new Error('2d failed: F5 must NOT revive initial mock submission for BT2');
  }

  // ---------------------------------------------------------------
  // Test 3: Ca 2 — BT1 (assign-db-01): Nộp muộn, có cho nộp muộn, chưa chấm
  // ---------------------------------------------------------------
  console.log('\n--- Test 3: Ca 2 — BT1 (assign-db-01: late, un-graded, late allowed) ---');
  const assignDb01 = MOCK_ASSIGNMENTS.find((a) => a.id === 'assign-db-01')!;
  console.log(`BT1 dueDate: ${assignDb01.dueDate}, allowLateSubmission: ${assignDb01.allowLateSubmission}`);

  // Setup late submission for BT1 before testing cancellation
  saveLocalSubmission('assign-db-01', {
    id: 'sub-assign-db-01',
    assignmentId: 'assign-db-01',
    status: 'SUBMITTED',
    submittedAt: '2024-11-16T10:15:00', // Past due 2024-11-15 -> late
    isLate: true,
    submissionAttempt: 1,
    maxAttempts: 3,
    content: 'Bài nộp thử nghiệm kiểm tra hủy nộp muộn...',
    score: null,
    feedback: null,
    attachmentUrls: [],
  });

  // Step 3a: Initial state
  const initSub01 = await getMySubmission('assign-db-01');
  console.log(`3a. Initial state: status=${initSub01.status}, isLate=${initSub01.isLate}`);
  if (initSub01.status !== 'SUBMITTED' || initSub01.isLate !== true) {
    throw new Error('3a failed: initial BT1 must be SUBMITTED and isLate=true');
  }

  const canCancel01Before = evaluateCanCancelSubmission({ submission: initSub01 });
  if (!canCancel01Before.canCancel) throw new Error('3a failed: BT1 must be cancellable before cancel');

  // Step 3b: Execute cancellation
  await deleteSubmission('sub-assign-db-01', 'assign-db-01');

  // Step 3c: Verify detail page status after cancel
  const sub01AfterCancel = await getMySubmission('assign-db-01');
  console.log(`3b. After cancel: status=${sub01AfterCancel.status}`);
  if (sub01AfterCancel.status !== 'NOT_SUBMITTED') {
    throw new Error('3b failed: BT1 status must be NOT_SUBMITTED after cancel');
  }

  // Step 3d: Verify resubmission permission: past due but allowLateSubmission: true -> ALLOWED
  const canSubmit01After = evaluateCanSubmitAssignment({
    assignment: assignDb01,
    submission: sub01AfterCancel,
  });
  console.log(`3c. Resubmit permission: canSubmit=${canSubmit01After.canSubmit}, reason=${canSubmit01After.reason}`);
  if (canSubmit01After.canSubmit !== true) {
    throw new Error('3c failed: BT1 MUST be allowed to submit again because allowLateSubmission is true');
  }

  // Step 3e: Simulate F5 (Page reload)
  const sub01AfterF5 = await getMySubmission('assign-db-01');
  console.log(`3d. After F5 reload: status=${sub01AfterF5.status}`);
  if (sub01AfterF5.status !== 'NOT_SUBMITTED') {
    throw new Error('3d failed: F5 must NOT revive initial mock submission for BT1');
  }

  // ---------------------------------------------------------------
  // Test 4: Ca 3 — GRADED submission (assign-db-05) cannot be cancelled
  // ---------------------------------------------------------------
  console.log('\n--- Test 4: Ca 3 — GRADED submission cannot be cancelled ---');
  let threwError = false;
  try {
    await deleteSubmission('sub-assign-db-05', 'assign-db-05');
  } catch (err: unknown) {
    threwError = true;
    console.log(`4a. Expected error thrown when cancelling GRADED submission: "${(err as Error).message}"`);
  }
  if (!threwError) {
    throw new Error('Test 4 failed: deleting GRADED submission must throw an error');
  }

  // ---------------------------------------------------------------
  // Test 5: Batch submissions synchronization
  // ---------------------------------------------------------------
  console.log('\n--- Test 5: getMySubmissionsBatch reflects cancelled state ---');
  const batch = await getMySubmissionsBatch(['assign-db-01', 'assign-db-02']);
  console.log(`5a. Batch BT1 status: ${batch['assign-db-01'].status}`);
  console.log(`5b. Batch BT2 status: ${batch['assign-db-02'].status}`);
  if (
    batch['assign-db-01'].status !== 'NOT_SUBMITTED' ||
    batch['assign-db-02'].status !== 'NOT_SUBMITTED'
  ) {
    throw new Error('Test 5 failed: batch submissions must both have status NOT_SUBMITTED');
  }

  // ---------------------------------------------------------------
  // Test 6: BT3 (assign-db-03) cancel submission with legacy & initial demo data
  // ---------------------------------------------------------------
  console.log('\n--- Test 6: BT3 (assign-db-03) cancel submission with legacy key & F5 persistence ---');
  // 6a. Ghi dữ liệu bản nộp cũ vào khóa legacy 'ilms_student_submission_assign-db-03'
  const legacySub03: MySubmission = {
    id: 'sub-assign-db-03',
    assignmentId: 'assign-db-03',
    status: 'SUBMITTED',
    submittedAt: '2024-11-04T16:45:00',
    isLate: false,
    submissionAttempt: 1,
    maxAttempts: 3,
    content: 'Kính gửi thầy Nam, em gửi bài làm bài tập Truy vấn SQL nâng cao...',
    score: null,
    feedback: null,
    attachmentUrls: [],
  };
  mockStorage['ilms_student_submission_assign-db-03'] = JSON.stringify(legacySub03);

  // 6b. Đọc lại bài nộp BT3: getLocalSubmission và getMySubmission phải đọc đúng bản nộp cũ
  const readSub03 = await getMySubmission('assign-db-03');
  console.log(`6a. Read BT3 from legacy key: status=${readSub03.status}, id=${readSub03.id}`);
  if (readSub03.status !== 'SUBMITTED' || readSub03.id !== 'sub-assign-db-03') {
    throw new Error('6a failed: BT3 must be read correctly from legacy storage key');
  }

  // 6c. Kiểm tra quyền hủy trên chính bản nộp đang hiển thị
  const evalCancel03 = evaluateCanCancelSubmission({ submission: readSub03 });
  console.log(`6b. Can cancel BT3 evaluation: canCancel=${evalCancel03.canCancel}, reason=${evalCancel03.reason}`);
  if (!evalCancel03.canCancel) {
    throw new Error('6b failed: BT3 must evaluate to canCancel=true');
  }

  // 6d. Thực hiện hủy bài nộp BT3 bằng cùng bản nộp hiện tại
  await deleteSubmission('sub-assign-db-03', 'assign-db-03', undefined, readSub03);

  // 6e. Xác nhận trạng thái sau khi hủy chuyển về NOT_SUBMITTED
  const sub03AfterCancel = await getMySubmission('assign-db-03');
  console.log(`6c. After cancel BT3: status=${sub03AfterCancel.status}`);
  if (sub03AfterCancel.status !== 'NOT_SUBMITTED') {
    throw new Error('6c failed: BT3 status must be NOT_SUBMITTED after cancellation');
  }

  // 6f. Giả lập F5 reload trang: dữ liệu vẫn phải giữ NOT_SUBMITTED, không khôi phục bản nộp cũ
  const sub03AfterF5 = await getMySubmission('assign-db-03');
  console.log(`6d. After F5 reload: status=${sub03AfterF5.status}`);
  if (sub03AfterF5.status !== 'NOT_SUBMITTED') {
    throw new Error('6d failed: BT3 must persist NOT_SUBMITTED across page reloads (F5)');
  }

  // ---------------------------------------------------------------
  // Test 7: Sidebar active conditions verification
  // ---------------------------------------------------------------
  console.log('\n--- Test 7: DashboardSidebar active conditions check ---');
  function checkSidebarActive(pathname: string) {
    const isClassesActive = pathname.startsWith('/classes');
    const isAssignmentsActive =
      pathname === '/assignments' || pathname.startsWith('/assignments/');
    return {
      pathname,
      isClassesActive,
      isAssignmentsActive,
    };
  }

  const route1 = checkSidebarActive('/classes/csdl-k22-01/assignments/assign-db-03');
  console.log(`7a. Route: ${route1.pathname} -> isClassesActive=${route1.isClassesActive}, isAssignmentsActive=${route1.isAssignmentsActive}`);
  if (!route1.isClassesActive || route1.isAssignmentsActive) {
    throw new Error('7a failed: /classes/.../assignments/... must ONLY activate classes menu, NOT assignments');
  }

  const route2 = checkSidebarActive('/classes/csdl-k22-01/assignments/assign-db-03/submit');
  console.log(`7b. Route: ${route2.pathname} -> isClassesActive=${route2.isClassesActive}, isAssignmentsActive=${route2.isAssignmentsActive}`);
  if (!route2.isClassesActive || route2.isAssignmentsActive) {
    throw new Error('7b failed: /classes/.../submit must ONLY activate classes menu, NOT assignments');
  }

  const route3 = checkSidebarActive('/assignments');
  console.log(`7c. Route: ${route3.pathname} -> isClassesActive=${route3.isClassesActive}, isAssignmentsActive=${route3.isAssignmentsActive}`);
  if (route3.isClassesActive || !route3.isAssignmentsActive) {
    throw new Error('7c failed: /assignments must ONLY activate assignments menu');
  }

  const route4 = checkSidebarActive('/assignments/quiz-01');
  console.log(`7d. Route: ${route4.pathname} -> isClassesActive=${route4.isClassesActive}, isAssignmentsActive=${route4.isAssignmentsActive}`);
  if (route4.isClassesActive || !route4.isAssignmentsActive) {
    throw new Error('7d failed: /assignments/... must ONLY activate assignments menu');
  }

  console.log('\nALL CANCEL SUBMISSION & SIDEBAR VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
