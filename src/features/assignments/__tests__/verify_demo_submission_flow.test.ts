import {
  createAssignment,
  getCreatedAssignments,
  resetCreatedAssignments,
  getAssignmentById,
  submitAssignment,
  getMySubmission,
  getMySubmissionsBatch,
  deleteSubmission,
  getAllClassAssignments,
  isDemoAssignment,
  isMockClass,
} from '../services/assignment.service';

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

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

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
  assert(readA.content !== readB.content, 'Content A and Content B must be strictly independent');
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

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
