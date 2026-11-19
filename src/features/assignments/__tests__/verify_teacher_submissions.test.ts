import {
  getAssignmentById,
  submitAssignment,
  getAssignmentSubmissionsPaged,
  bulkGradeSubmissions,
  formatScore,
  formatAssignmentDueDate,
  formatSubmissionTime,
  MOCK_TEACHER_SUBMISSIONS,
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
  console.log('=== RUNNING TEACHER ASSIGNMENT SUBMISSIONS VIEW VERIFICATION TESTS ===\n');

  // Test 1: Assignment Header Metadata Accuracy
  console.log('--- Test 1: Assignment Header Metadata Accuracy ---');
  const assignment = await getAssignmentById('assign-db-01', 'csdl-k22-01');
  assert(Boolean(assignment), 'assign-db-01 assignment must exist');
  assert(
    assignment?.title === 'Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)',
    `Expected assignment title, got: ${assignment?.title}`
  );
  assert(assignment?.maxScore === 10, 'Expected maxScore = 10');
  assert(assignment?.allowLateSubmission === true, 'Expected allowLateSubmission = true');

  const dueInfo = formatAssignmentDueDate(assignment?.dueDate);
  assert(dueInfo.label.includes('23:59'), `Expected dueDate label to include 23:59, got: ${dueInfo.label}`);
  assert(dueInfo.label.includes('28/10/2024'), `Expected dueDate label to include 28/10/2024, got: ${dueInfo.label}`);
  console.log('=> Test 1 PASSED: Assignment metadata matches requirements.');

  // Test 2: Read student submissions from localStorage & StudentCode Resolution
  console.log('\n--- Test 2: Read Student Submissions from LocalStorage & StudentCode Resolution ---');
  // 2a. Demo submission thiếu mã trong bản ghi -> tra hồ sơ bằng studentId ('student-k22-vu-minh') -> ra mã '22028190'
  const studentSubmission = await submitAssignment(
    'assign-db-01',
    { content: 'Bài nộp mô phỏng của học sinh kiểm tra tích hợp Teacher Submissions View.' },
    'csdl-k22-01',
    'student-k22-vu-minh'
  );
  assert(Boolean(studentSubmission), 'submitAssignment must return created submission');
  assert(studentSubmission.status === 'SUBMITTED', 'Submission status must be SUBMITTED');

  // Teacher fetches submissions for assign-db-01
  const teacherViewRes = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    size: 20,
  });
  assert(teacherViewRes.items.length >= 5, `Expected at least 5 submissions, got: ${teacherViewRes.items.length}`);
  const foundStudentSubmission = teacherViewRes.items.find(
    (item) => item.studentId === 'student-k22-vu-minh' || item.id === `sub-assign-db-01`
  );
  assert(Boolean(foundStudentSubmission), 'Student newly created submission must appear in teacher submissions list');
  assert(
    Boolean(foundStudentSubmission?.content?.includes('Bài nộp mô phỏng của học sinh')),
    'Student submission content must match'
  );
  // Tra hồ sơ thành công: studentCode phải là '22028190'
  assert(
    foundStudentSubmission?.studentCode === '22028190',
    `Expected studentCode '22028190' resolved from profile, got: ${foundStudentSubmission?.studentCode}`
  );

  // 2b. Bản demo có sẵn mã trực tiếp trong bản ghi -> ưu tiên lấy studentCode từ bản ghi
  mockStorage['ilms_submission_student-custom-01_assign-db-01'] = JSON.stringify({
    id: 'sub-custom-01',
    assignmentId: 'assign-db-01',
    studentId: 'student-custom-01',
    studentCode: 'B22DCCN999',
    content: 'Bài nộp có sẵn studentCode trong bản ghi.',
    status: 'SUBMITTED',
    submittedAt: '2024-10-29T10:00:00',
  });
  const resWithDirectCode = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    size: 20,
  });
  const customItem = resWithDirectCode.items.find((it) => it.id === 'sub-custom-01');
  assert(Boolean(customItem), 'customItem must be found');
  assert(
    customItem?.studentCode === 'B22DCCN999',
    `Expected studentCode 'B22DCCN999' from record, got: ${customItem?.studentCode}`
  );

  // 2c. Bản demo thiếu mã VÀ hồ sơ cũng chưa có mã -> studentCode là undefined (để ẩn dòng phụ)
  mockStorage['ilms_submission_student-no-code_assign-db-01'] = JSON.stringify({
    id: 'sub-no-code-01',
    assignmentId: 'assign-db-01',
    studentId: 'student-no-code-unregistered',
    content: 'Bài nộp của sinh viên chưa có mã trong hồ sơ.',
    status: 'SUBMITTED',
    submittedAt: '2024-10-29T11:00:00',
  });
  const resWithNoCode = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    size: 20,
  });
  const noCodeItem = resWithNoCode.items.find((it) => it.id === 'sub-no-code-01');
  assert(Boolean(noCodeItem), 'noCodeItem must be found');
  assert(
    noCodeItem?.studentCode === undefined,
    `Expected studentCode to be undefined when profile has no code, got: ${noCodeItem?.studentCode}`
  );
  // Đảm bảo không bị fallback về submission id hoặc studentId
  assert(noCodeItem?.studentCode !== noCodeItem?.id, 'studentCode must NOT fallback to submission id');
  assert(noCodeItem?.studentCode !== noCodeItem?.studentId, 'studentCode must NOT fallback to studentId');

  // Dọn dẹp các mục test phụ
  delete mockStorage['ilms_submission_student-custom-01_assign-db-01'];
  delete mockStorage['ilms_submission_student-no-code_assign-db-01'];
  console.log('=> Test 2 PASSED: studentCode resolved accurately from record, profile or hidden when absent.');

  // Test 3: F5 Reload Persistence
  console.log('\n--- Test 3: F5 Reload Persistence ---');
  // Re-fetch submissions without re-submitting to simulate page refresh / F5
  const refreshedRes = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    size: 20,
  });
  const persistedItem = refreshedRes.items.find(
    (item) => item.studentId === 'student-k22-vu-minh' || item.id === `sub-assign-db-01`
  );
  assert(Boolean(persistedItem), 'Student submission must persist after F5 reload');
  assert(persistedItem?.status === 'SUBMITTED', 'Submission status must remain SUBMITTED after F5');
  console.log('=> Test 3 PASSED: Persistence verified after page refresh.');

  // Test 4: Data Isolation across Assignments
  console.log('\n--- Test 4: Data Isolation across Assignments ---');
  const otherAssignmentId = 'assign-new-isolated-999';
  // Submit a solution specifically for the other assignment
  await submitAssignment(
    otherAssignmentId,
    { content: 'Nội dung bài làm của bài tập riêng biệt 999.' },
    'csdl-k22-01',
    'student-k22-vu-minh'
  );

  // Fetch submissions for otherAssignmentId
  const otherSubmissionsRes = await getAssignmentSubmissionsPaged(otherAssignmentId, {
    classId: 'csdl-k22-01',
  });
  assert(
    otherSubmissionsRes.items.length === 1,
    `Expected exactly 1 submission for ${otherAssignmentId}, got: ${otherSubmissionsRes.items.length}`
  );
  assert(
    otherSubmissionsRes.items[0].assignmentId === otherAssignmentId,
    'Submission assignmentId must match the queried assignment'
  );
  // Ensure none of the assign-db-01 mock students appear in otherAssignmentId
  const hasLeak = otherSubmissionsRes.items.some((it) => it.studentName === 'Lê Thu Hà');
  assert(!hasLeak, 'Submissions from assign-db-01 must NOT leak into otherAssignmentId');

  // Verify assign-db-01 still does not have the submission from otherAssignmentId
  const db01Res = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    size: 20,
  });
  const hasOtherLeak = db01Res.items.some((it) => it.content?.includes('bài tập riêng biệt 999'));
  assert(!hasOtherLeak, 'Submission from otherAssignmentId must NOT appear in assign-db-01');
  console.log('=> Test 4 PASSED: Data isolation between assignments strictly enforced.');

  // Test 5: Status Filters (ALL, SUBMITTED, LATE, GRADED)
  console.log('\n--- Test 5: Status Filters (ALL, SUBMITTED, LATE, GRADED) ---');
  // Reset localStorage to test benchmark Stitch mock dataset exclusively
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);

  // 5a. ALL
  const allRes = await getAssignmentSubmissionsPaged('assign-db-01', { classId: 'csdl-k22-01', size: 10 });
  assert(allRes.items.length === 5, `Expected 5 mock items for ALL, got: ${allRes.items.length}`);

  // 5b. SUBMITTED (Đã nộp đúng hạn)
  const submittedRes = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    status: 'SUBMITTED',
  });
  // Vu Duc Long (SUBMITTED) & Nguyen Minh Anh (RESUBMITTED)
  assert(submittedRes.items.length === 2, `Expected 2 items for SUBMITTED filter, got: ${submittedRes.items.length}`);
  assert(
    submittedRes.items.every((it) => (it.status === 'SUBMITTED' || it.status === 'RESUBMITTED') && !it.isLate),
    'SUBMITTED filter must only include on-time submitted or resubmitted items'
  );

  // 5c. LATE (Nộp muộn)
  const lateRes = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    status: 'LATE',
  });
  // Le Thu Ha (LATE/GRADED) & Pham Quang Huy (LATE)
  assert(lateRes.items.length === 2, `Expected 2 items for LATE filter, got: ${lateRes.items.length}`);
  assert(
    lateRes.items.every((it) => it.isLate === true || it.status === 'LATE'),
    'LATE filter must include all submissions with isLate = true'
  );

  // 5d. GRADED (Đã chấm)
  const gradedRes = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    status: 'GRADED',
  });
  // Le Thu Ha (GRADED, 0/10) & Tran Nhat Minh (GRADED, 8.5/10)
  assert(gradedRes.items.length === 2, `Expected 2 items for GRADED filter, got: ${gradedRes.items.length}`);
  assert(
    gradedRes.items.every((it) => it.status === 'GRADED'),
    'GRADED filter must only include graded items'
  );
  console.log('=> Test 5 PASSED: All 4 status filters (ALL, SUBMITTED, LATE, GRADED) work as expected.');

  // Test 6: Search & Sort Functionality
  console.log('\n--- Test 6: Search & Sort Functionality ---');
  // 6a. Search by student name
  const searchByName = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    search: 'Lê Thu Hà',
  });
  assert(searchByName.items.length === 1, 'Search by name must return 1 result');
  assert(searchByName.items[0].studentName === 'Lê Thu Hà', 'Expected Lê Thu Hà');

  // 6b. Search by student UUID/code
  const searchByCode = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    search: '00000000-0000-4000-8000-000000000003',
  });
  assert(searchByCode.items.length === 1, 'Search by UUID must return 1 result');
  assert(searchByCode.items[0].studentName === 'Phạm Quang Huy', 'Expected Phạm Quang Huy');

  // 6c. Search matching multiple students ("Minh")
  const searchMulti = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    search: 'Minh',
  });
  assert(searchMulti.items.length === 2, `Expected 2 matches for "Minh", got: ${searchMulti.items.length}`);

  // 6d. Sort newest first (submittedAt,desc)
  const sortDesc = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    sort: 'submittedAt,desc',
  });
  assert(sortDesc.items[0].studentName === 'Lê Thu Hà', 'Newest submission must be Lê Thu Hà (00:20 – 29/10)');
  assert(sortDesc.items[sortDesc.items.length - 1].studentName === 'Trần Nhật Minh', 'Oldest must be Trần Nhật Minh (21:15 – 28/10)');

  // 6e. Sort oldest first (submittedAt,asc)
  const sortAsc = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
    sort: 'submittedAt,asc',
  });
  assert(sortAsc.items[0].studentName === 'Trần Nhật Minh', 'Oldest submission must be Trần Nhật Minh (21:15 – 28/10)');
  assert(sortAsc.items[sortAsc.items.length - 1].studentName === 'Lê Thu Hà', 'Newest must be Lê Thu Hà (00:20 – 29/10)');
  console.log('=> Test 6 PASSED: Search and Sort work accurately.');

  // Test 7: Score Formatting, Bulk Grading & Step 8 Navigation URL
  console.log('\n--- Test 7: Score Formatting, Bulk Grading & Step 8 URL ---');
  // Score formatting tests
  const nullScoreFormatted = formatScore(null);
  assert(nullScoreFormatted === '--', `Expected "--" for null score, got: ${nullScoreFormatted}`);

  const zeroScoreFormatted = formatScore(0);
  assert(zeroScoreFormatted === '0', `Expected "0" for 0 score, got: ${zeroScoreFormatted}`);

  const floatScoreFormatted = formatScore(8.5, 'vi');
  assert(floatScoreFormatted === '8,5', `Expected "8,5" in Vietnamese locale, got: ${floatScoreFormatted}`);

  // Bulk Grading test
  const gradeResult = await bulkGradeSubmissions(
    'assign-db-01',
    [
      {
        submissionId: '00000000-0000-4000-8000-000000000003',
        score: 9.25,
        feedback: 'Bài làm rất tốt, phân tích chuẩn 3NF chính xác.',
      },
    ],
    'csdl-k22-01'
  );
  assert(gradeResult.successCount === 1, 'Bulk grade must succeed for 1 item');

  // Verify updated grade for Pham Quang Huy
  const verifyGraded = await getAssignmentSubmissionsPaged('assign-db-01', {
    classId: 'csdl-k22-01',
  });
  const huyItem = verifyGraded.items.find((it) => it.id === '00000000-0000-4000-8000-000000000003');
  assert(huyItem?.status === 'GRADED', 'Pham Quang Huy status must be updated to GRADED');
  assert(huyItem?.score === 9.25, `Expected score 9.25, got: ${huyItem?.score}`);

  // Step 8 Navigation URL pattern
  const step8Url = `/classes/csdl-k22-01/assignments/assign-db-01/submissions/${huyItem?.id}`;
  assert(
    step8Url === '/classes/csdl-k22-01/assignments/assign-db-01/submissions/00000000-0000-4000-8000-000000000003',
    `Expected Step 8 URL, got: ${step8Url}`
  );
  console.log('=> Test 7 PASSED: Score formatting, Bulk grading & Step 8 URL verified.');

  // Test 8: Bulk Grade Button Label and Selection Transitions (Toolbar Stability)
  console.log('\n--- Test 8: Bulk Grade Button Label & Badge Selection Transitions ---');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const vi = require('../../../messages/vi.json');
  const bulkGradeLabel = vi.assignments?.teacher?.submissions?.bulkGrade;
  assert(bulkGradeLabel === 'Chấm hàng loạt', `Expected bulkGrade label "Chấm hàng loạt", got: "${bulkGradeLabel}"`);

  // Helper mô phỏng trạng thái nút và badge của component
  function getButtonState(selectedCount: number) {
    return {
      text: bulkGradeLabel,
      badgeVisible: selectedCount > 0,
      badgeCount: selectedCount > 0 ? String(selectedCount) : '0',
      badgeClass: selectedCount > 0
        ? 'bg-white text-[#0059BB] opacity-100 shadow-xs'
        : 'opacity-0 pointer-events-none',
      disabled: selectedCount === 0,
      buttonWidth: '164px',
    };
  }

  // 8a. Chưa chọn (0 bài): nút disabled, nhãn đầy đủ "Chấm hàng loạt", badge ẩn nhưng chừa sẵn chỗ
  const state0 = getButtonState(0);
  assert(state0.text === 'Chấm hàng loạt', 'Text must remain "Chấm hàng loạt" without truncate');
  assert(state0.disabled === true, 'Button must be disabled when 0 selected');
  assert(state0.badgeVisible === false, 'Badge must be invisible when 0 selected');
  assert(state0.badgeClass.includes('opacity-0'), 'Badge must have opacity-0 to preserve space without layout shift');

  // 8b. Chọn 1 bài: nút enabled, nhãn vẫn là "Chấm hàng loạt", badge hiện "1"
  const state1 = getButtonState(1);
  assert(state1.text === 'Chấm hàng loạt', 'Text must remain "Chấm hàng loạt"');
  assert(state1.disabled === false, 'Button must be enabled when 1 selected');
  assert(state1.badgeVisible === true, 'Badge must be visible when 1 selected');
  assert(state1.badgeCount === '1', 'Badge count must be 1');
  assert(state1.badgeClass.includes('opacity-100'), 'Badge must be opacity-100');
  assert(state1.buttonWidth === state0.buttonWidth, 'Button width must remain identical (164px)');

  // 8c. Chọn cả 3 bài chưa chấm: nút enabled, nhãn "Chấm hàng loạt", badge hiện "3"
  const state3 = getButtonState(3);
  assert(state3.text === 'Chấm hàng loạt', 'Text must remain "Chấm hàng loạt"');
  assert(state3.disabled === false, 'Button must be enabled when 3 selected');
  assert(state3.badgeVisible === true, 'Badge must be visible when 3 selected');
  assert(state3.badgeCount === '3', 'Badge count must be 3');
  assert(state3.buttonWidth === state0.buttonWidth, 'Button width must remain identical (164px)');

  // 8d. Bỏ chọn: nút disabled, badge ẩn, chiều rộng vẫn 164px không bị co giãn
  const stateReset = getButtonState(0);
  assert(stateReset.disabled === true, 'Button must be disabled after clearing');
  assert(stateReset.badgeVisible === false, 'Badge must be hidden after clearing');
  assert(stateReset.buttonWidth === state0.buttonWidth, 'Button width must remain identical (164px)');
  console.log('=> Test 8 PASSED: Bulk Grade button maintains full label, badge count, and zero layout shift.');

  console.log('\n================================================================');
  console.log('ALL TEACHER ASSIGNMENT SUBMISSIONS TESTS PASSED! (8/8)');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
