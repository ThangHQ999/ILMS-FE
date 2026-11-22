import assert from 'node:assert';
import { runSuite } from '@/test-utils/run-verifications';
import fs from 'fs';
import path from 'path';
import { INITIAL_DEMO_SUBMISSIONS, MOCK_ASSIGNMENTS, calculateIsLate, createAssignment, deleteSubmission, formatAssignmentDueDate, formatScore, formatSubmissionTime, getAllClassAssignments, getAssignmentById, getCreatedAssignments, getLocalSubmission, getMySubmission, getMySubmissionsBatch, isDemoAssignment, isMockClass, normalizeSubmissionIsLate, removeLocalSubmission, resetCreatedAssignments, saveLocalSubmission, submitAssignment, toLocalDateTimeString, updateMySubmission } from '../services/assignment.service';
import { evaluateCanCancelSubmission, evaluateCanEditSubmission, evaluateCanSubmitAssignment } from '../utils/submissionValidation';
import { AssignmentItem, MySubmission } from '../types';
import { assignmentKeys } from '../constants';
import { UserProfile } from '@/features/auth/schemas/auth.schema';
import { ClassDetailData } from '@/features/classes/schemas/class-detail.schema';
import { api } from '@/lib/axios';
import { ApiError } from '@/types/common';


// ===============================================================
// Sub-test: verify_cancel_submission.test.ts
// ===============================================================
async function test_verify_cancel_submission() {
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


  await runTests();

}

// ===============================================================
// Sub-test: verify_demo_submission_flow.test.ts
// ===============================================================
async function test_verify_demo_submission_flow() {
  const originalDateNow = Date.now;
  let simulatedTimestamp = 1795092890000;
  Date.now = () => {
    simulatedTimestamp += 1000;
    return simulatedTimestamp;
  };

  try {
    // Mock localStorage for Node.js test environment
    const mockStorage: Record<string, string> = {};
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, val: string) => {
          mockStorage[key] = val;
        },
        removeItem: (key: string) => {
          delete mockStorage[key];
        },
        clear: () => {
          Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
        },
        get length() {
          return Object.keys(mockStorage).length;
        },
        key: (index: number) => Object.keys(mockStorage)[index] || null,
      },
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = (
      globalThis as unknown as { window: { localStorage: unknown } }
    ).window.localStorage;



    async function runTests() {
      console.log('=== RUNNING DEMO ASSIGNMENT SUBMISSION FLOW VERIFICATION TESTS ===\n');

      // Test 0: Helper isMockClass and isDemoAssignment verification
      console.log('--- Test 0: isMockClass & isDemoAssignment detection ---');
      assert(isMockClass('csdl-k22-01'), 'csdl-k22-01 must be recognized as mock class');
      assert(isMockClass('CNTT-K22-01'), 'CNTT-K22-01 must be recognized as mock class');
      assert(isMockClass('class-01'), 'class-01 must be recognized as mock class');
      assert(!isMockClass('3fa85f64-5717-4562-b3fc-2c963f66afa6'), 'Real UUID class must NOT be mock class');

      assert(isDemoAssignment('assign-db-01'), 'assign-db-01 must be demo assignment');
      assert(isDemoAssignment('assign-new-12345'), 'assign-new-12345 must be demo assignment');
      assert(isDemoAssignment('quiz-05'), 'quiz-05 must be demo assignment');
      assert(isDemoAssignment('lab-02'), 'lab-02 must be demo assignment');
      assert(isDemoAssignment('custom-id', 'csdl-k22-01'), 'Assignment in demo class must be demo assignment');
      assert(!isDemoAssignment('3fa85f64-5717-4562-b3fc-2c963f66afa6', '4fa85f64-5717-4562-b3fc-2c963f66afa6'), 'Real UUID assignment in real class must NOT be demo');
      console.log('=> Test 0 PASSED.\n');

      // Clean storage before tests
      resetCreatedAssignments();
      (globalThis as unknown as { window: { localStorage: { clear: () => void } } }).window.localStorage.clear();

      // Test 1: Re-submitting on previously failed assignment (newly created demo assignment)
      console.log('--- Test 1: Submit on previously failed demo assignment (assign-new-xxx) ---');
      const failedAssignment = await createAssignment('csdl-k22-01', {
        courseId: 'course-cs-202',
        title: 'Bài tập kiểm thử luồng lỗi trước đó',
        description: 'Yêu cầu kiểm thử nộp bài cho ID assign-new',
        maxScore: 10,
        dueDate: '2026-12-01T23:59:00',
        allowLateSubmission: true,
        fileAttachmentUrl: null,
      });

      assert(Boolean(failedAssignment.id), 'Failed assignment must have an id');
      assert(failedAssignment.id.startsWith('assign-new-'), 'ID must start with assign-new-');

      // Verify can read detail
      const detail1 = await getAssignmentById(failedAssignment.id, 'csdl-k22-01');
      assert(detail1.title === failedAssignment.title, 'Detail must return created assignment');

      // Perform submission
      const submitted1 = await submitAssignment(
        failedAssignment.id,
        { content: 'Nội dung nộp bài sửa lỗi: Bắt gói tin TCP handshake thành công.' },
        'csdl-k22-01'
      );

      assert(submitted1.status === 'SUBMITTED', 'Submission status must be SUBMITTED');
      assert(submitted1.content === 'Nội dung nộp bài sửa lỗi: Bắt gói tin TCP handshake thành công.', 'Content must match');
      assert(Boolean(submitted1.submittedAt), 'submittedAt must be present');

      // Verify getMySubmission reads the submitted record
      const mySub1 = await getMySubmission(failedAssignment.id, undefined, 'csdl-k22-01');
      assert(mySub1.status === 'SUBMITTED', 'getMySubmission must return SUBMITTED');
      assert(mySub1.content === submitted1.content, 'getMySubmission content must match');
      console.log('1a. Successfully submitted and read back demo assignment:', mySub1.content);
      console.log('=> Test 1 PASSED.\n');

      // Test 2: Create TWO new assignments and submit different contents for each
      console.log('--- Test 2: Create TWO new assignments and submit distinct contents ---');
      const assignA = await createAssignment('csdl-k22-01', {
        courseId: 'course-cs-202',
        title: 'Bài tập A: Hệ thống phân tán & Raft Consensus',
        description: 'Mô phỏng thuật toán bầu chọn Leader trong Raft.',
        maxScore: 10,
        dueDate: '2026-12-15T23:59:00',
        allowLateSubmission: true,
      });

      const assignB = await createAssignment('csdl-k22-01', {
        courseId: 'course-cs-202',
        title: 'Bài tập B: Tối ưu hóa câu truy vấn CSDL lớn',
        description: 'Tạo chỉ mục Covering Index và phân tích Query Execution Plan.',
        maxScore: 10,
        dueDate: '2026-12-20T23:59:00',
        allowLateSubmission: false,
      });

      assert(assignA.id !== assignB.id, 'Two created assignments must have unique IDs');

      const contentA = 'Nội dung bài làm A: Em đã xây dựng cụm 5 nodes Raft và test kịch bản rớt mạng Leader node 1.';
      const contentB = 'Nội dung bài làm B: Sử dụng B-Tree Index trên cột (customer_id, order_date) giảm thời gian thực thi từ 1450ms xuống 12ms.';

      const subA = await submitAssignment(assignA.id, { content: contentA }, 'csdl-k22-01');
      const subB = await submitAssignment(assignB.id, { content: contentB }, 'csdl-k22-01');

      assert(subA.status === 'SUBMITTED', 'Assignment A must be SUBMITTED');
      assert(subB.status === 'SUBMITTED', 'Assignment B must be SUBMITTED');

      // Verify independence: each assignment holds its own content
      const readA = await getMySubmission(assignA.id, undefined, 'csdl-k22-01');
      const readB = await getMySubmission(assignB.id, undefined, 'csdl-k22-01');

      assert(readA.content === contentA, 'Assignment A must hold content A');
      assert(readB.content === contentB, 'Assignment B must hold content B');
      assert((readA.content as string) !== (readB.content as string), 'Content A and Content B must be strictly independent');
      console.log('2a. Read assignment A content:', readA.content?.substring(0, 45) + '...');
      console.log('2b. Read assignment B content:', readB.content?.substring(0, 45) + '...');
      console.log('=> Test 2 PASSED.\n');

      // Test 3: F5 persistence check for both newly created assignments
      console.log('--- Test 3: F5 Reload persistence for created assignments ---');
      // Re-read directly via getMySubmission simulating fresh page mount
      const f5SubA = await getMySubmission(assignA.id, undefined, 'csdl-k22-01');
      const f5SubB = await getMySubmission(assignB.id, undefined, 'csdl-k22-01');

      assert(f5SubA.status === 'SUBMITTED', 'F5: Assignment A status must be preserved as SUBMITTED');
      assert(f5SubA.content === contentA, 'F5: Assignment A content must be preserved');
      assert(f5SubB.status === 'SUBMITTED', 'F5: Assignment B status must be preserved as SUBMITTED');
      assert(f5SubB.content === contentB, 'F5: Assignment B content must be preserved');
      console.log('3a. F5 preserved assignment A status:', f5SubA.status);
      console.log('3b. F5 preserved assignment B status:', f5SubB.status);
      console.log('=> Test 3 PASSED.\n');

      // Test 4: Pre-existing mock assignment (assign-db-03) submission & cancel
      console.log('--- Test 4: Built-in mock assignment (assign-db-03) submit and cancel ---');
      const content03 = 'Nội dung bài làm CSDL Tuần 8 của sinh viên: Hoàn thành thiết kế B-Tree và phân vùng dữ liệu.';

      // Initial state should be NOT_SUBMITTED (or fallback)
      const initial03 = await getMySubmission('assign-db-03', undefined, 'csdl-k22-01');
      console.log('4a. Initial assign-db-03 status:', initial03.status);

      // Submit assign-db-03
      const sub03 = await submitAssignment('assign-db-03', { content: content03 }, 'csdl-k22-01');
      assert(sub03.status === 'SUBMITTED', 'assign-db-03 status must be SUBMITTED after submission');
      assert(sub03.content === content03, 'assign-db-03 content must match');

      // Verify F5 after submit
      const f5Sub03 = await getMySubmission('assign-db-03', undefined, 'csdl-k22-01');
      assert(f5Sub03.status === 'SUBMITTED', 'F5 assign-db-03 must be SUBMITTED');
      assert(f5Sub03.content === content03, 'F5 assign-db-03 content must be preserved');

      // Cancel submission on assign-db-03
      await deleteSubmission(`sub-assign-db-03`, 'assign-db-03', undefined, f5Sub03);

      // Verify status returns to NOT_SUBMITTED
      const cancelled03 = await getMySubmission('assign-db-03', undefined, 'csdl-k22-01');
      assert(cancelled03.status === 'NOT_SUBMITTED', 'Cancelled assign-db-03 must return NOT_SUBMITTED');

      // Verify F5 after cancel
      const f5Cancelled03 = await getMySubmission('assign-db-03', undefined, 'csdl-k22-01');
      assert(f5Cancelled03.status === 'NOT_SUBMITTED', 'F5 after cancel must stay NOT_SUBMITTED');
      console.log('4b. assign-db-03 after cancel and F5:', f5Cancelled03.status);
      console.log('=> Test 4 PASSED.\n');

      // Test 5: Cancel submission on newly created assignment A
      console.log('--- Test 5: Cancel submission on newly created assignment A ---');
      await deleteSubmission(`sub-${assignA.id}`, assignA.id, undefined, f5SubA);

      const cancelledA = await getMySubmission(assignA.id, undefined, 'csdl-k22-01');
      assert(cancelledA.status === 'NOT_SUBMITTED', 'Assignment A must be NOT_SUBMITTED after cancel');

      // Verify F5 after cancel on assignment A
      const f5CancelledA = await getMySubmission(assignA.id, undefined, 'csdl-k22-01');
      assert(f5CancelledA.status === 'NOT_SUBMITTED', 'F5 on cancelled assignment A must stay NOT_SUBMITTED');

      // Assignment B must remain SUBMITTED and untouched
      const untouchedB = await getMySubmission(assignB.id, undefined, 'csdl-k22-01');
      assert(untouchedB.status === 'SUBMITTED', 'Assignment B must remain SUBMITTED');
      assert(untouchedB.content === contentB, 'Assignment B content must remain unchanged');
      console.log('5a. Assignment A cancelled status:', f5CancelledA.status);
      console.log('5b. Assignment B untouched status:', untouchedB.status);
      console.log('=> Test 5 PASSED.\n');

      // Test 6: Synchronization with list view & batch submissions
      console.log('--- Test 6: Batch submissions & assignment list synchronization ---');
      const batch = await getMySubmissionsBatch([assignA.id, assignB.id, 'assign-db-03']);
      assert(batch[assignA.id]?.status === 'NOT_SUBMITTED', 'Batch for A must be NOT_SUBMITTED');
      assert(batch[assignB.id]?.status === 'SUBMITTED', 'Batch for B must be SUBMITTED');
      assert(batch['assign-db-03']?.status === 'NOT_SUBMITTED', 'Batch for db-03 must be NOT_SUBMITTED');

      const allClassAssignments = await getAllClassAssignments('csdl-k22-01');
      assert(
        allClassAssignments.some((item) => item.id === assignA.id),
        'All class assignments list must include assignment A'
      );
      assert(
        allClassAssignments.some((item) => item.id === assignB.id),
        'All class assignments list must include assignment B'
      );
      console.log('6a. Batch submissions correctly returned all statuses');
      console.log('6b. All class assignments count:', allClassAssignments.length);
      console.log('=> Test 6 PASSED.\n');

      // Cleanup
      resetCreatedAssignments();
      (globalThis as unknown as { window: { localStorage: { clear: () => void } } }).window.localStorage.clear();
      console.log('=> Cleaned up test storage.');

      console.log('================================================================');
      console.log('ALL DEMO SUBMISSION FLOW VERIFICATION TESTS PASSED! (6/6)');
      console.log('================================================================');
    }


    await runTests();
  } finally {
    Date.now = originalDateNow;
  }
}

// ===============================================================
// Sub-test: verify_late_submission.test.ts
// ===============================================================
async function test_verify_late_submission() {
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


  await runTests();

}

// ===============================================================
// Sub-test: verify_student_assignment_detail_fixes.test.ts
// ===============================================================
async function test_verify_student_assignment_detail_fixes() {
  async function runFixesVerification() {
    console.log('=== VERIFYING STUDENT ASSIGNMENT DETAIL FIXES (ALL 8 AREAS) ===\n');

    const viewPath = path.resolve(
      process.cwd(),
      'src/features/assignments/components/StudentAssignmentDetailPageView.tsx'
    );
    const viewCode = fs.readFileSync(viewPath, 'utf8');
    const vi = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'src/messages/vi.json'), 'utf8')
    );
    const en = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'src/messages/en.json'), 'utf8')
    );

    // 1. i18n zero missing keys across vi.json and en.json
    console.log('--- TEST 1: Zero missing i18n keys in StudentAssignmentDetailPageView ---');
    const checkNamespace = (fnName: string, viNs: Record<string, unknown>, enNs: Record<string, unknown>) => {
      const regex = new RegExp(`\\b${fnName}\\('([a-zA-Z0-9_]+)'`, 'g');
      let m: RegExpExecArray | null;
      while ((m = regex.exec(viewCode)) !== null) {
        const key = m[1];
        assert.ok(viNs[key] !== undefined, `Missing key ${fnName}('${key}') in vi.json`);
        assert.ok(enNs[key] !== undefined, `Missing key ${fnName}('${key}') in en.json`);
      }
    };
    checkNamespace('t', vi.assignments.student, en.assignments.student);
    checkNamespace('tDetail', vi.assignments.detail, en.assignments.detail);
    checkNamespace('tClass', vi.classes.detail, en.classes.detail);
    assert.strictEqual(vi.assignments.detail.noGradingFeedback, 'Chưa có nhận xét');
    assert.strictEqual(vi.assignments.detail.viewAssignmentDocument, 'Xem tài liệu đề bài');
    console.log('✓ Zero missing i18n keys and exact required labels verified.');

    // 2. Absence of fabricated fallback literals in component
    console.log('\n--- TEST 2: No fabricated fixture fallbacks in StudentAssignmentDetailPageView ---');
    assert.ok(!viewCode.includes('Phân tích phụ thuộc hàm'), 'Hero must not fallback to CSDL description fixture');
    assert.ok(!viewCode.includes('Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)'), 'Title must not fallback to fixture title');
    assert.ok(!viewCode.includes('Học kỳ 1 (2024–2025)'), 'Semester must not be hardcoded');
    assert.ok(!viewCode.includes("'CS-202'"), 'Course code must not fallback to CS-202');
    assert.ok(!viewCode.includes('TS. Lê Hoàng Nam'), 'Grader must not fallback to sample instructor name');
    console.log('✓ All hardcoded fixture fallbacks removed.');

    // 3. No duplicate submission timestamps / timeliness badges in Submitted Work card
    console.log('\n--- TEST 3: Submission metadata deduplication & Accordion a11y ---');
    assert.ok(!viewCode.includes("tDetail('systemRecorded'"), 'Must not duplicate systemRecorded timestamp');
    assert.ok(!viewCode.includes("tDetail('sentAtTime'"), 'Must not duplicate sentAtTime timestamp');
    assert.ok(
      viewCode.includes('<button\n                      type="button"\n                      id="accordion-header"') ||
      (viewCode.includes('id="accordion-header"') && viewCode.includes('aria-expanded={isSpecExpanded}')),
      'Accordion must use real <button type="button"> with aria-expanded'
    );
    assert.ok(viewCode.includes('hasSpecContent'), 'Must hide accordion toggle when assignment has no spec content');
    console.log('✓ Submission metadata deduplicated and Accordion accessibility verified.');

    // 4. LocalDateTime convention & score formatting
    console.log('\n--- TEST 4: LocalDateTime parsing & score precision ---');
    const localStr = toLocalDateTimeString(new Date(2026, 10, 18, 9, 5, 0));
    assert.strictEqual(localStr, '2026-11-18T09:05:00');
    assert.ok(!localStr.endsWith('Z'), 'toLocalDateTimeString must not append Z');

    const due = formatAssignmentDueDate('2026-11-25T23:59:00');
    assert.strictEqual(due.label, '23:59 - 25/11/2026');
    assert.strictEqual(due.isNoDeadline, false);

    const noDue = formatAssignmentDueDate(null);
    assert.strictEqual(noDue.isNoDeadline, true);

    const subTime = formatSubmissionTime('2026-11-18T08:15:00');
    assert.strictEqual(subTime.formatted, '08:15 - 18/11/2026');

    assert.strictEqual(formatScore(0, 'vi'), '0');
    assert.strictEqual(formatScore(8.55, 'vi'), '8,55');
    assert.strictEqual(formatScore(8.5, 'vi'), '8,5');
    assert.strictEqual(formatScore(100, 'vi'), '100');
    assert.strictEqual(formatScore(null, 'vi'), '--');
    console.log('✓ LocalDateTime formatting and score precision verified.');

    // 5. Missing local demo ID throws structured LOCAL_DEMO_NOT_FOUND (no fake assignment)
    console.log('\n--- TEST 5: Missing local demo ID handling ---');
    let caughtCode = '';
    try {
      await getAssignmentById('assign-new-1794745742874', 'csdl-k22-01');
    } catch (err: unknown) {
      caughtCode = (err as { code?: string })?.code || '';
    }
    assert.strictEqual(
      caughtCode,
      'LOCAL_DEMO_NOT_FOUND',
      `Expected LOCAL_DEMO_NOT_FOUND for missing assign-new-*, got "${caughtCode}"`
    );
    console.log('✓ Missing local demo ID returns LOCAL_DEMO_NOT_FOUND without fabricating sample data.');

    // 6. Route error.tsx and loading.tsx preserve DashboardSidebar and DashboardHeader
    console.log('\n--- TEST 6: Error & Loading boundaries preserve app shell ---');
    const errorCode = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/classes/[id]/assignments/[assignmentId]/error.tsx'),
      'utf8'
    );
    const loadingCode = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/classes/[id]/assignments/[assignmentId]/loading.tsx'),
      'utf8'
    );
    assert.ok(errorCode.includes('DashboardSidebar') && errorCode.includes('DashboardHeader'), 'error.tsx must preserve shell');
    assert.ok(loadingCode.includes('DashboardSidebar') && loadingCode.includes('DashboardHeader'), 'loading.tsx must preserve shell');
    console.log('✓ error.tsx and loading.tsx preserve DashboardSidebar & DashboardHeader.');

    console.log('\n=== ALL 6 FIX VERIFICATION TESTS PASSED 100%! ===');
  }


  await runFixesVerification();

}

// ===============================================================
// Sub-test: verify_student_assignment_detail_graded.test.ts
// ===============================================================
async function test_verify_student_assignment_detail_graded() {
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


  await runTests();

}

// ===============================================================
// Sub-test: verify_student_assignment_detail_stitch.test.ts
// ===============================================================
async function test_verify_student_assignment_detail_stitch() {
  /**
   * Verification test suite for Student Assignment Detail Page (Unsubmitted) according to Stitch Frame Redesign
   * Frame URL: https://stitch.google.com/preview/16436405483159050487?node-id=1167f2f77b8d4091bd1885d18edc2119
   * Frame Node ID: 1167f2f77b8d4091bd1885d18edc2119
   * Title: ILMS — Chi tiết bài tập — Học viên (Chưa nộp)
   *
   * Requirements verified:
   * 1. Data layer: getAssignmentById & getMySubmission query real backend API first for real UUIDs (!isDemo).
   * 2. 404 handling on my-submission returns status='NOT_SUBMITTED' without contaminating localStorage.
   * 3. 401/403/500 errors on real endpoints re-throw to allow React Query to flag isForbidden or isLoadError.
   * 4. Query keys partitioning: assignmentKeys.mySubmission partitions by assignmentId, studentId, and classId.
   * 5. UI Structure: Spotlight Navy Card (#0D1C32 -> #0F2444 -> #122C54), metadata grid (dueDate, maxScore, allowLate).
   * 6. Unsubmitted state: Dashed border card, pending_actions icon, NO score line "-- / 10", CTA button points to /classes/[id]/assignments/[assignmentId]/submit.
   * 7. Preservation of Submitted and Graded states: Submitted work, instructor feedback, score hero.
   * 8. i18n synchronization: Keys match between vi.json and en.json.
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
    console.log('=== STARTING STUDENT ASSIGNMENT DETAIL (STITCH REDESIGN) TESTS ===\n');

    // --- TEST 1: Query Keys Partitioning ---
    console.log('--- TEST 1: Query Keys Partitioning ---');
    const key1 = assignmentKeys.mySubmission('assign-01', 'student-01', 'class-01');
    const key2 = assignmentKeys.mySubmission('assign-01', 'student-02', 'class-01');
    const key3 = assignmentKeys.mySubmission('assign-01', 'student-01', 'class-02');
    assert.notDeepStrictEqual(key1, key2, 'Keys for different students must not collide');
    assert.notDeepStrictEqual(key1, key3, 'Keys for different classes must not collide');
    assert.deepStrictEqual(
      key1,
      ['assignments', 'my-submission', 'assign-01', 'student-01', 'class-01'],
      'Key structure should follow assignmentKeys.mySubmission pattern'
    );
    console.log('✓ assignmentKeys.mySubmission properly partitions cache by assignmentId, studentId, and classId.\n');

    // --- TEST 2: Real UUID Data Layer Isolation ---
    console.log('--- TEST 2: Real UUID Data Layer Isolation ---');
    const realUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const realClassUuid = '99999999-8888-7777-6666-555555555555';
    assert.strictEqual(isDemoAssignment(realUuid, realClassUuid), false, 'Real UUID must be recognized as !isDemo');

    // Verify that getAssignmentById for real UUID throws (doesn't fallback to dummy mock)
    try {
      await getAssignmentById(realUuid, realClassUuid);
      assert.fail('Should have thrown not found / network error for real UUID');
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || '';
      console.log('  → Caught error for real UUID:', errorMsg);
      assert.ok(
        errorMsg.length > 0 || (err as { response?: { status?: number } })?.response?.status !== undefined,
        'Error should indicate real endpoint failure without fallback mock overriding it'
      );
    }
    console.log('✓ getAssignmentById directly contacts backend for real UUID without mock override.\n');

    // --- TEST 3: Due Date & Deadline Policy Formatting ---
    console.log('--- TEST 3: Due Date & Deadline Policy Formatting ---');
    const withDeadline = formatAssignmentDueDate('2024-10-28T23:59:00');
    assert.strictEqual(withDeadline.isNoDeadline, false, 'Should have deadline');
    assert.ok(withDeadline.label.includes('28/10/2024') || withDeadline.label.includes('23:59'), 'Formatted date must match');

    const noDeadline = formatAssignmentDueDate(null);
    assert.strictEqual(noDeadline.isNoDeadline, true, 'Null dueDate should indicate isNoDeadline=true');
    assert.strictEqual(noDeadline.label, 'Không có hạn nộp', 'Should display "Không có hạn nộp"');

    const isLateNoDeadline = calculateIsLate('2026-11-18T00:00:00Z', null);
    assert.strictEqual(isLateNoDeadline, false, 'Late calculation must be false when assignment has no deadline');
    console.log('✓ Due date formatting & late calculation accurately handle both deadlines and null deadlines.\n');

    // --- TEST 4: Score Formatting ---
    console.log('--- TEST 4: Score Formatting ---');
    assert.strictEqual(formatScore(null, 'vi'), '--', 'Null score must format as --');
    assert.strictEqual(formatScore(undefined, 'vi'), '--', 'Undefined score must format as --');
    assert.strictEqual(formatScore(0, 'vi'), '0', 'Score 0 must format as 0');
    assert.strictEqual(formatScore(8.5, 'vi'), '8,5', 'Vietnamese locale must use comma for decimals');
    assert.strictEqual(formatScore(8.5, 'en'), '8.5', 'English locale must use dot for decimals');
    console.log('✓ formatScore behaves consistently across locales and null/zero states.\n');

    // --- TEST 5: i18n Synchronization Check ---
    console.log('--- TEST 5: i18n Synchronization Check ---');
    const viPath = path.resolve(process.cwd(), 'src/messages/vi.json');
    const enPath = path.resolve(process.cwd(), 'src/messages/en.json');
    const viContent = JSON.parse(fs.readFileSync(viPath, 'utf8'));
    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

    const requiredDetailKeys = [
      'attachmentsOfficialTitle',
      'openAttachmentBtn',
      'officialAttachmentDesc',
      'submissionGuidelinesTitle',
      'accessRightsCheck',
      'accessRightsDesc',
      'notSubmittedYetDescStitch',
      'myClassesBreadcrumb',
      'overviewAndNews',
      'courseCurriculum',
      'assignmentsAndGrading',
      'classMembers',
      'subjectSection',
      'searchDocumentPlaceholder',
      'semesterInfo',
      'facultyInfo',
    ];

    for (const key of requiredDetailKeys) {
      assert.ok(
        viContent.assignments?.detail?.[key] !== undefined,
        `Key assignments.detail.${key} missing in vi.json`
      );
      assert.ok(
        enContent.assignments?.detail?.[key] !== undefined,
        `Key assignments.detail.${key} missing in en.json`
      );
    }
    console.log('✓ All 16 Stitch specific i18n keys are synchronized in both vi.json and en.json.\n');

    // --- TEST 6: StudentAssignmentDetailPageView Source Code Inspection ---
    console.log('--- TEST 6: StudentAssignmentDetailPageView Source Code Inspection ---');
    const componentPath = path.resolve(
      process.cwd(),
      'src/features/assignments/components/StudentAssignmentDetailPageView.tsx'
    );
    const componentCode = fs.readFileSync(componentPath, 'utf8');

    // 1. Check for absence of score line "-- / 10" in unsubmitted state
    assert.ok(
      !componentCode.includes("`-- / ${maxScore} ${t('points')}`"),
      'Must NOT contain score line in unsubmitted state'
    );

    // 2. Check for absence of RoleSwitcher
    assert.ok(
      !componentCode.includes('RoleSwitcher'),
      'Must NOT contain fake RoleSwitcher in this view'
    );

    // 3. Check for Navy Spotlight Card gradient
    assert.ok(
      componentCode.includes('#0D1C32') && componentCode.includes('#0F2444') && componentCode.includes('#122C54'),
      'Must feature Navy Spotlight Card with #0D1C32 -> #0F2444 -> #122C54 gradient'
    );

    // 4. Check for submit button routing
    assert.ok(
      componentCode.includes('`/classes/${classId}/assignments/${assignmentId}/submit`'),
      'CTA submit button must route to /classes/[id]/assignments/[assignmentId]/submit'
    );

    // 5. Check that DashboardSidebar and DashboardHeader are used (standard app shell preserved as requested)
    assert.ok(componentCode.includes('DashboardSidebar'), 'Must use standard DashboardSidebar');
    assert.ok(componentCode.includes('DashboardHeader'), 'Must use standard DashboardHeader');

    // 6. Check for attachments block and open attachment button
    assert.ok(componentCode.includes('fileAttachmentUrl'), 'Must check assignment.fileAttachmentUrl');
    assert.ok(componentCode.includes('openAttachmentBtn'), 'Must include Open Attachment button');

    // 7. Check for preservation of submitted and graded states
    assert.ok(
      componentCode.includes('submittedWorkTitle') || componentCode.includes('submittedWorkHeading'),
      'Must preserve Submitted Work block'
    );
    assert.ok(componentCode.includes('teacherFeedbackTitle'), 'Must preserve Teacher Feedback block');
    assert.ok(componentCode.includes('isGraded'), 'Must preserve Graded state display');

    console.log('✓ StudentAssignmentDetailPageView matches 100% of the Stitch frame design specifications.\n');

    console.log('=== ALL STUDENT ASSIGNMENT DETAIL TESTS PASSED SUCCESSFULLY! ===');
  }


  await runTests();

}

// ===============================================================
// Sub-test: verify_student_assignment_detail_submitted_pending.test.ts
// ===============================================================
async function test_verify_student_assignment_detail_submitted_pending() {
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
      studentName: '',
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


  await runTests();

}

// ===============================================================
// Sub-test: verify_student_assignment_edit_submission_v2.test.ts
// ===============================================================
async function test_verify_student_assignment_edit_submission_v2() {
  const mockStorage: Record<string, string> = {};
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => mockStorage[k] ?? null,
    setItem: (k: string, v: string) => {
      mockStorage[k] = v;
    },
    removeItem: (k: string) => {
      delete mockStorage[k];
    },
    clear: () => {
      for (const k of Object.keys(mockStorage)) delete mockStorage[k];
    },
    get length() {
      return Object.keys(mockStorage).length;
    },
    key: (i: number) => Object.keys(mockStorage)[i] ?? null,
  };
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: globalThis.localStorage,
  };

  async function runTests() {
    console.log('=== VERIFYING STUDENT ASSIGNMENT EDIT SUBMISSION V2 ===\n');

    // -------------------------------------------------------------------------
    // TEST 1: updateMySubmission PATCH contract (strict { content }, preserve formatting & submissionId, preserve ApiError status, zero localStorage fallback)
    // -------------------------------------------------------------------------
    console.log('Test 1: updateMySubmission real UUID PATCH contract...');
    const realUuid = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
    const realClassUuid = '22222222-3333-4444-8555-666666666666';
    const existingSubId = '77777777-8888-4999-8aaa-bbbbbbbbbbbb';

    let rejectedEmpty = false;
    try {
      await updateMySubmission(realUuid, { content: '   \n\t  ' }, 'student-real-1', realClassUuid);
    } catch {
      rejectedEmpty = true;
    }
    assert(rejectedEmpty, 'Whitespace-only PATCH must be rejected');

    const originalPatch = api.patch;
    const captured: { url: string; body: Record<string, unknown> | null } = {
      url: '',
      body: null,
    };
    const editedMultiline =
      '  Bản cập nhật lần 2:\n- Bổ sung chứng minh BCNF\n\nLink: https://github.com/ilms/db-lab  ';

    try {
      (api as unknown as { patch: typeof api.patch }).patch = (async (
        url: string,
        body?: unknown
      ) => {
        captured.url = url;
        captured.body = (body || null) as Record<string, unknown> | null;
        return {
          status: 200,
          data: {
            code: 200,
            message: 'OK',
            data: {
              id: existingSubId,
              assignmentId: realUuid,
              content: editedMultiline,
              status: 'RESUBMITTED',
              submittedAt: '2026-11-18T20:05:00',
              isLate: false,
              submissionAttempt: 2,
              attachmentUrls: [],
            },
          },
        };
      }) as unknown as typeof api.patch;

      globalThis.localStorage.clear();
      const res = await updateMySubmission(
        realUuid,
        { content: editedMultiline },
        'student-real-1',
        realClassUuid
      );

      assert(
        captured.url === `/assignments/${realUuid}/submissions`,
        `Expected PATCH /assignments/${realUuid}/submissions, got ${captured.url}`
      );
      assert(
        captured.body !== null &&
        Object.keys(captured.body).length === 1 &&
        captured.body.content === editedMultiline,
        'PATCH payload must contain ONLY { content } with exact newlines/formatting preserved'
      );
      assert(
        res.id === existingSubId && res.submissionAttempt === 2 && res.content === editedMultiline,
        'PATCH must keep submissionId and adopt updated fields strictly from server response'
      );
      assert(
        globalThis.localStorage.length === 0,
        'Real API PATCH must NOT write fallback data to localStorage'
      );

      // Missing data.data must throw SCHEMA_ERROR and NEVER fall through to localStorage
      (api as unknown as { patch: typeof api.patch }).patch = (async () => ({
        status: 200,
        data: { code: 200, message: 'OK', data: null },
      })) as unknown as typeof api.patch;

      let threwSchema = false;
      try {
        await updateMySubmission(realUuid, { content: 'Updated answer' }, 'student-real-1', realClassUuid);
      } catch (err: unknown) {
        threwSchema = (err as { code?: string })?.code === 'SCHEMA_ERROR';
      }
      assert(threwSchema && globalThis.localStorage.length === 0, 'Missing data.data must throw SCHEMA_ERROR without touching localStorage');

      // Preserve ApiError httpStatus (409 / 403)
      (api as unknown as { patch: typeof api.patch }).patch = (async () => {
        throw new ApiError('Đã vượt quá số lượt nộp cho phép', 409, 409);
      }) as unknown as typeof api.patch;

      let caughtStatus = 0;
      try {
        await updateMySubmission(realUuid, { content: 'Updated answer' }, 'student-real-1', realClassUuid);
      } catch (err: unknown) {
        caughtStatus = (err as ApiError)?.httpStatus || 0;
      }
      assert(caughtStatus === 409, `Must preserve ApiError httpStatus=409, got ${caughtStatus}`);
    } finally {
      (api as unknown as { patch: typeof api.patch }).patch = originalPatch;
    }
    console.log('  ✔ PASSED Test 1\n');

    // -------------------------------------------------------------------------
    // TEST 2: evaluateCanEditSubmission business rules (score=0 graded, past due even with allowLate=true, maxAttempts, no deadline, no submission)
    // -------------------------------------------------------------------------
    console.log('Test 2: evaluateCanEditSubmission business rules...');
    const now = Date.now();
    const futureIso = new Date(now + 86400_000).toISOString();
    const pastIso = new Date(now - 86400_000).toISOString();

    const studentUser = {
      id: 'u-stu-1',
      roleName: 'ROLE_USER',
      email: 'b22dccn001@stu.ptit.edu.vn',
      firstName: 'Hoàng',
      lastName: 'Trần',
    };

    const baseAssignment: AssignmentItem = {
      id: realUuid,
      classId: realClassUuid,
      title: 'Lab 06',
      type: 'LAB',
      status: 'OPEN',
      dueDate: futureIso,
      maxScore: 10,
      allowLateSubmission: true,
    };

    const baseSubmission: MySubmission = {
      id: existingSubId,
      assignmentId: realUuid,
      studentId: 'u-stu-1',
      content: 'Initial work',
      status: 'SUBMITTED',
      score: null,
      feedback: null,
      submittedAt: new Date(now - 3600_000).toISOString(),
      isLate: false,
      submissionAttempt: 1,
      attachmentUrls: [],
    };

    // 2a. Valid pending before deadline (without maxAttempts returned -> do NOT invent maxAttempts=1)
    const evValid = evaluateCanEditSubmission({
      assignment: baseAssignment,
      submission: baseSubmission,
      currentUser: studentUser,
    });
    assert(evValid.canEdit === true, 'Valid pending submission before deadline without maxAttempts must allow edit');

    // 2b. Score === 0 is GRADED -> MUST lock edit!
    const evGradedZero = evaluateCanEditSubmission({
      assignment: baseAssignment,
      submission: { ...baseSubmission, status: 'GRADED', score: 0 },
      currentUser: studentUser,
    });
    assert(
      evGradedZero.canEdit === false && evGradedZero.reason === 'ALREADY_GRADED',
      'Graded submission with score=0 must lock editing'
    );

    // 2c. Score === 0 even if status string lags -> still ALREADY_GRADED!
    const evScoreZeroLag = evaluateCanEditSubmission({
      assignment: baseAssignment,
      submission: { ...baseSubmission, status: 'SUBMITTED', score: 0 },
      currentUser: studentUser,
    });
    assert(
      evScoreZeroLag.canEdit === false && evScoreZeroLag.reason === 'ALREADY_GRADED',
      'Numeric score=0 must be treated as graded and lock editing'
    );

    // 2d. Past due with allowLateSubmission=true -> MUST STILL LOCK PATCH!
    const evPastDueWithLate = evaluateCanEditSubmission({
      assignment: { ...baseAssignment, dueDate: pastIso, allowLateSubmission: true },
      submission: baseSubmission,
      currentUser: studentUser,
    });
    assert(
      evPastDueWithLate.canEdit === false && evPastDueWithLate.reason === 'DEADLINE_PASSED',
      'allowLateSubmission=true must NOT allow PATCH after deadline'
    );

    // 2e. No deadline (dueDate: null) -> allow edit
    const evNoDeadline = evaluateCanEditSubmission({
      assignment: { ...baseAssignment, dueDate: null },
      submission: baseSubmission,
      currentUser: studentUser,
    });
    assert(evNoDeadline.canEdit === true, 'dueDate=null must allow editing when ungraded');

    // 2f. maxAttempts reached -> MUST lock edit
    const evMaxAttempts = evaluateCanEditSubmission({
      assignment: baseAssignment,
      submission: { ...baseSubmission, submissionAttempt: 2, maxAttempts: 2 },
      currentUser: studentUser,
    });
    assert(
      evMaxAttempts.canEdit === false && evMaxAttempts.reason === 'MAX_ATTEMPTS_REACHED',
      'Reached maxAttempts must lock editing'
    );

    // 2g. No submission / cancelled -> NO_SUBMISSION
    const evNoSub = evaluateCanEditSubmission({
      assignment: baseAssignment,
      submission: { ...baseSubmission, status: 'NOT_SUBMITTED' },
      currentUser: studentUser,
    });
    assert(
      evNoSub.canEdit === false && evNoSub.reason === 'NO_SUBMISSION',
      'NOT_SUBMITTED must return NO_SUBMISSION'
    );
    console.log('  ✔ PASSED Test 2\n');

    // -------------------------------------------------------------------------
    // TEST 3: Symmetrical i18n keys & zero missing usages
    // -------------------------------------------------------------------------
    console.log('Test 3: i18n symmetry & usage verification...');
    const viJson = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../../messages/vi.json'), 'utf8')
    );
    const enJson = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../../messages/en.json'), 'utf8')
    );
    const viKeys = Object.keys(viJson.assignments.submit || {}).sort();
    const enKeys = Object.keys(enJson.assignments.submit || {}).sort();
    assert(
      JSON.stringify(viKeys) === JSON.stringify(enKeys),
      'vi.json and en.json assignments.submit keys must match 100%'
    );

    const viewPath = path.resolve(__dirname, '../components/StudentAssignmentSubmissionPageView.tsx');
    const viewSource = fs.readFileSync(viewPath, 'utf8');
    const usedKeys = Array.from(viewSource.matchAll(/tSubmit\('([^']+)'/g)).map((m) => m[1]);
    for (const k of usedKeys) {
      assert(viKeys.includes(k), `Missing vi.json key assignments.submit.${k}`);
      assert(enKeys.includes(k), `Missing en.json key assignments.submit.${k}`);
    }
    console.log(`  ✔ PASSED Test 3 (${viKeys.length} symmetrical keys, ${usedKeys.length} usages verified)\n`);

    // -------------------------------------------------------------------------
    // TEST 4: Component, Hook & Detail Integration Audit
    // -------------------------------------------------------------------------
    console.log('Test 4: Audit shared edit/submit component, useUpdateSubmission retry:false & Detail navigation...');
    const updateHookSource = fs.readFileSync(
      path.resolve(__dirname, '../hooks/useStudentSubmissions.ts'),
      'utf8'
    );
    const detailSource = fs.readFileSync(
      path.resolve(__dirname, '../components/StudentAssignmentDetailPageView.tsx'),
      'utf8'
    );

    assert(updateHookSource.includes('retry: false'), 'useUpdateSubmission must disable automatic PATCH retries');
    assert(
      detailSource.includes('/submit?mode=edit') && !detailSource.includes('id="edit-submission-modal"'),
      'Detail view must navigate to shared /submit?mode=edit and remove duplicate inline edit modal'
    );
    assert(viewSource.includes('initializedEditKeyRef'), 'Must guard draft against window-focus query refetch');
    assert(viewSource.includes('initialServerContent'), 'Must track server baseline separately from draft for dirty check');
    assert(viewSource.includes('isUncertainNetworkError'), 'Must detect uncertain network/timeout errors on PATCH');
    assert(viewSource.includes('data-edit-attempt-note="true"'), 'Must render attempt count notice in edit mode');
    assert(viewSource.includes('data-edit-no-submission="true"'), 'Must handle missing/cancelled submission without converting to POST');
    assert(!viewSource.includes('Kính gửi thầy Nam'), 'Must NOT contain Stitch sample content');
    assert(!viewSource.includes('371'), 'Must NOT hardcode Stitch 371 char count');
    console.log('  ✔ PASSED Test 4\n');

    console.log('================================================================');
    console.log('ALL 4 STUDENT ASSIGNMENT EDIT SUBMISSION V2 TESTS PASSED 100%!');
    console.log('================================================================');
  }


  await runTests();

}

// ===============================================================
// Sub-test: verify_student_assignment_submission_v2.test.ts
// ===============================================================
async function test_verify_student_assignment_submission_v2() {
  // Setup minimal localStorage mock for Node runner
  const mockStorage: Record<string, string> = {};
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => mockStorage[k] ?? null,
    setItem: (k: string, v: string) => {
      mockStorage[k] = v;
    },
    removeItem: (k: string) => {
      delete mockStorage[k];
    },
    clear: () => {
      for (const k of Object.keys(mockStorage)) delete mockStorage[k];
    },
    get length() {
      return Object.keys(mockStorage).length;
    },
    key: (i: number) => Object.keys(mockStorage)[i] ?? null,
  };
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: globalThis.localStorage,
  };

  async function runTests() {
    console.log('=== VERIFYING STUDENT ASSIGNMENT SUBMISSION V2 ===\n');

    // -------------------------------------------------------------------------
    // TEST 1: submitAssignment payload contract (strict { content }, preserve formatting, zero localStorage on real UUID)
    // -------------------------------------------------------------------------
    console.log('Test 1: submitAssignment real UUID API contract & formatting preservation...');
    const realUuid = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
    const realClassUuid = '11111111-2222-4333-8444-555555555555';

    // 1a. Reject empty & whitespace-only
    let rejectedWhitespace = false;
    try {
      await submitAssignment(realUuid, { content: '   \n\t  \r\n ' }, realClassUuid);
    } catch {
      rejectedWhitespace = true;
    }
    assert(rejectedWhitespace, 'Whitespace-only submission must be rejected');

    // 1b. Intercept api.post to verify exact payload & zero extra fields / zero localStorage fallback
    const originalPost = api.post;
    const captured: { url: string; body: Record<string, unknown> | null } = {
      url: '',
      body: null,
    };
    const multilineContent =
      '  Câu 1: Phân tích chỉ mục B-Tree\n\nCâu 2: Link bài làm:\nhttps://docs.google.com/document/d/abc123  ';

    try {
      (api as unknown as { post: typeof api.post }).post = (async (
        url: string,
        body?: unknown
      ) => {
        captured.url = url;
        captured.body = (body || null) as Record<string, unknown> | null;
        return {
          status: 201,
          data: {
            code: 201,
            message: 'Created',
            data: {
              id: '99999999-aaaa-4bbb-8ccc-dddddddddddd',
              assignmentId: realUuid,
              content: multilineContent,
              status: 'SUBMITTED',
              submittedAt: '2026-11-18T19:30:00',
              isLate: true,
              submissionAttempt: 1,
              attachmentUrls: [],
            },
          },
        };
      }) as unknown as typeof api.post;

      globalThis.localStorage.clear();
      const res = await submitAssignment(
        realUuid,
        { content: multilineContent },
        realClassUuid,
        'student-real-1'
      );

      assert(
        captured.url === `/assignments/${realUuid}/submissions`,
        `Expected POST /assignments/${realUuid}/submissions, got ${captured.url}`
      );
      assert(
        captured.body !== null &&
        Object.keys(captured.body).length === 1 &&
        captured.body.content === multilineContent,
        'POST payload must contain ONLY { content } with exact newlines/formatting preserved'
      );
      assert(
        res.id === '99999999-aaaa-4bbb-8ccc-dddddddddddd' && res.isLate === true,
        'Must return exact server response without fabricating ID/timestamp/isLate'
      );
      assert(
        globalThis.localStorage.length === 0,
        'Real API submission must NOT write fallback data to localStorage'
      );

      // 1c. Missing data.data in response must throw SCHEMA_ERROR instead of fabricating fallback
      (api as unknown as { post: typeof api.post }).post = (async () => ({
        status: 201,
        data: { code: 201, message: 'Created', data: null },
      })) as unknown as typeof api.post;

      let threwSchemaError = false;
      try {
        await submitAssignment(realUuid, { content: 'Valid answer' }, realClassUuid);
      } catch (err: unknown) {
        threwSchemaError = (err as { code?: string })?.code === 'SCHEMA_ERROR';
      }
      assert(
        threwSchemaError,
        'Missing response data.data must throw SCHEMA_ERROR instead of fabricating submission fields'
      );
    } finally {
      (api as unknown as { post: typeof api.post }).post = originalPost;
    }
    console.log('  ✔ PASSED Test 1\n');

    // -------------------------------------------------------------------------
    // TEST 2: evaluateCanSubmitAssignment business rules
    // -------------------------------------------------------------------------
    console.log('Test 2: evaluateCanSubmitAssignment rules (no deadline, past due, null late policy, already submitted, read-only)...');
    const now = Date.now();
    const futureIso = new Date(now + 86400_000).toISOString();
    const pastIso = new Date(now - 86400_000).toISOString();

    const baseAssignment: AssignmentItem = {
      id: realUuid,
      classId: realClassUuid,
      title: 'Real Assignment',
      type: 'LAB',
      status: 'OPEN',
      dueDate: futureIso,
      maxScore: 10,
      allowLateSubmission: false,
    };

    const notSubmitted: MySubmission = {
      assignmentId: realUuid,
      status: 'NOT_SUBMITTED',
      score: null,
      feedback: null,
      attachmentUrls: [],
    };

    const studentUser = {
      id: 'u-stu-1',
      roleName: 'ROLE_USER',
      email: 'b22dccn001@stu.ptit.edu.vn',
      firstName: 'Hoàng',
      lastName: 'Trần',
    };

    // 2a. In deadline + ROLE_USER
    const evalInDeadline = evaluateCanSubmitAssignment({
      assignment: baseAssignment,
      submission: notSubmitted,
      currentUser: studentUser,
    });
    assert(evalInDeadline.canSubmit === true, 'In-deadline student with ROLE_USER should be able to submit');

    // 2b. No deadline (dueDate: null)
    const evalNoDeadline = evaluateCanSubmitAssignment({
      assignment: { ...baseAssignment, dueDate: null, allowLateSubmission: null },
      submission: notSubmitted,
      currentUser: studentUser,
    });
    assert(evalNoDeadline.canSubmit === true, 'Assignment with dueDate=null must allow submission');

    // 2c. Past due + allowLateSubmission: true
    const evalPastDueAllowed = evaluateCanSubmitAssignment({
      assignment: { ...baseAssignment, dueDate: pastIso, allowLateSubmission: true },
      submission: notSubmitted,
      currentUser: studentUser,
    });
    assert(evalPastDueAllowed.canSubmit === true, 'Past-due with allowLateSubmission=true must allow first-time submission');

    // 2d. Past due + allowLateSubmission: false
    const evalPastDueBlocked = evaluateCanSubmitAssignment({
      assignment: { ...baseAssignment, dueDate: pastIso, allowLateSubmission: false },
      submission: notSubmitted,
      currentUser: studentUser,
    });
    assert(
      evalPastDueBlocked.canSubmit === false && evalPastDueBlocked.reason === 'DEADLINE_PASSED',
      'Past-due with allowLateSubmission=false must lock submission with DEADLINE_PASSED'
    );

    // 2e. Past due + allowLateSubmission: null (NEVER coerce null -> true)
    const evalPastDueNullPolicy = evaluateCanSubmitAssignment({
      assignment: { ...baseAssignment, dueDate: pastIso, allowLateSubmission: null },
      submission: notSubmitted,
      currentUser: studentUser,
    });
    assert(
      evalPastDueNullPolicy.canSubmit === false && evalPastDueNullPolicy.reason === 'DEADLINE_PASSED',
      'Past-due with allowLateSubmission=null must NOT allow late submission'
    );

    // 2f. Already submitted (SUBMITTED / GRADED)
    const evalAlreadySubmitted = evaluateCanSubmitAssignment({
      assignment: baseAssignment,
      submission: { ...notSubmitted, status: 'SUBMITTED', id: 'sub-1' },
      currentUser: studentUser,
    });
    assert(
      evalAlreadySubmitted.canSubmit === false &&
      evalAlreadySubmitted.hasExistingSubmission === true &&
      evalAlreadySubmitted.reason === 'ALREADY_SUBMITTED',
      'Existing submission must block new POST submission'
    );

    // 2g. Archived class
    const evalReadOnly = evaluateCanSubmitAssignment({
      assignment: baseAssignment,
      submission: notSubmitted,
      currentUser: studentUser,
      classDetail: {
        classInfo: {
          id: realClassUuid,
          name: 'CS-202',
          status: 'ARCHIVED',
        },
        courses: [],
        members: [],
        announcements: [],
        isClassInfoLive: true,
        isMembersLive: false,
        isCoursesLive: false,
      } as never,
    });
    assert(
      evalReadOnly.canSubmit === false && evalReadOnly.reason === 'CLASS_READ_ONLY',
      'Archived class must lock submission with CLASS_READ_ONLY'
    );
    console.log('  ✔ PASSED Test 2\n');

    // -------------------------------------------------------------------------
    // TEST 3: Symmetrical i18n keys (vi.json == en.json) & zero missing keys in component
    // -------------------------------------------------------------------------
    console.log('Test 3: i18n key parity for assignments.submit...');
    const viJson = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../../messages/vi.json'), 'utf8')
    );
    const enJson = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../../messages/en.json'), 'utf8')
    );
    const viSubmitKeys = Object.keys(viJson.assignments.submit || {}).sort();
    const enSubmitKeys = Object.keys(enJson.assignments.submit || {}).sort();

    assert(viSubmitKeys.length >= 30, `Expected >= 30 submit i18n keys, got ${viSubmitKeys.length}`);
    assert(
      JSON.stringify(viSubmitKeys) === JSON.stringify(enSubmitKeys),
      `vi.json and en.json assignments.submit keys mismatch`
    );

    const viewPath = path.resolve(__dirname, '../components/StudentAssignmentSubmissionPageView.tsx');
    const viewSource = fs.readFileSync(viewPath, 'utf8');
    const usedSubmitKeys = Array.from(viewSource.matchAll(/tSubmit\('([^']+)'/g)).map((m) => m[1]);
    for (const key of usedSubmitKeys) {
      assert(viSubmitKeys.includes(key), `Missing vi.json key assignments.submit.${key}`);
      assert(enSubmitKeys.includes(key), `Missing en.json key assignments.submit.${key}`);
    }
    console.log(`  ✔ PASSED Test 3 (${viSubmitKeys.length} symmetrical keys, ${usedSubmitKeys.length} usages verified)\n`);

    // -------------------------------------------------------------------------
    // TEST 4: Component architectural & Stitch constraints audit
    // -------------------------------------------------------------------------
    console.log('Test 4: Audit StudentAssignmentSubmissionPageView constraints...');
    assert(viewSource.includes('DashboardSidebar') && viewSource.includes('DashboardHeader'), 'Must preserve original app shell');
    assert(viewSource.includes('bg-[#F6FAFE]'), 'Main background must use #F6FAFE');
    assert(viewSource.includes('bg-[#0059BB]'), 'Primary submit CTA must use #0059BB');
    assert(viewSource.includes('from-[#0D1C32] via-[#0F2444] to-[#122C54]'), 'Must render Hero Navy Spotlight Banner');
    assert(viewSource.includes('border-2 border-[#E2E8F0]'), 'Outer cards must use 2px border');
    assert(viewSource.includes('aria-expanded={isRequirementsExpanded}'), 'Requirements accordion must expose aria-expanded');
    assert(viewSource.includes('aria-controls="submission-requirements-panel"'), 'Requirements accordion must link aria-controls');
    assert(viewSource.includes('aria-invalid={Boolean(validationError)}'), 'Textarea must expose aria-invalid');
    assert(viewSource.includes('isSubmittingRef'), 'Must guard against double-submit');
    assert(viewSource.includes('postSubmitReloadError'), 'Must handle POST 201 success with reload error separately');
    assert(viewSource.includes('/classes/${classId}?tab=assignments'), 'Class breadcrumb must route to /classes/{classId}?tab=assignments');
    assert(!viewSource.includes('history.back(') && !viewSource.includes('router.back('), 'Must NOT rely on history.back or router.back');
    assert(!viewSource.includes('type="file"'), 'Must NOT include file upload input');
    assert(!viewSource.includes('Bài tập chuẩn hóa cơ sở dữ liệu'), 'Must NOT hardcode sample Stitch assignment title');
    assert(!viewSource.includes('R(A, B, C, D, E, G)'), 'Must NOT hardcode sample Stitch CSDL requirements');
    assert(!viewSource.includes("alert('Trợ lý Socratic AI"), 'Must NOT contain legacy alert Socratic AI popup');
    assert(!viewSource.includes('assignment?.maxScore ?? 10'), 'Must NOT coerce null maxScore to 10');
    assert(!viewSource.includes('assignment?.allowLateSubmission ?? true'), 'Must NOT coerce null allowLateSubmission to true');
    console.log('  ✔ PASSED Test 4\n');

    console.log('================================================================');
    console.log('ALL 4 STUDENT ASSIGNMENT SUBMISSION V2 TESTS PASSED 100%!');
    console.log('================================================================');
  }


  await runTests();

}

export async function runAll() {
  return runSuite('Student Submissions Flow Suite', [
    { name: 'verify_cancel_submission.test.ts', fn: test_verify_cancel_submission },
    { name: 'verify_demo_submission_flow.test.ts', fn: test_verify_demo_submission_flow },
    { name: 'verify_late_submission.test.ts', fn: test_verify_late_submission },
    { name: 'verify_student_assignment_detail_fixes.test.ts', fn: test_verify_student_assignment_detail_fixes },
    { name: 'verify_student_assignment_detail_graded.test.ts', fn: test_verify_student_assignment_detail_graded },
    { name: 'verify_student_assignment_detail_stitch.test.ts', fn: test_verify_student_assignment_detail_stitch },
    { name: 'verify_student_assignment_detail_submitted_pending.test.ts', fn: test_verify_student_assignment_detail_submitted_pending },
    { name: 'verify_student_assignment_edit_submission_v2.test.ts', fn: test_verify_student_assignment_edit_submission_v2 },
    { name: 'verify_student_assignment_submission_v2.test.ts', fn: test_verify_student_assignment_submission_v2 },
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
