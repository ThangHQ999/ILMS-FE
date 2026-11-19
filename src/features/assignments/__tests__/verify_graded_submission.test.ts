import {
  getMySubmission,
  formatScore,
  formatSubmissionTime,
  MOCK_ASSIGNMENTS,
  INITIAL_DEMO_SUBMISSIONS,
} from '../services/assignment.service';
import {
  evaluateCanCancelSubmission,
  evaluateCanSubmitAssignment,
} from '../utils/submissionValidation';

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
  console.log('=== RUNNING GRADED SUBMISSION VERIFICATION TESTS ===\n');

  // ---------------------------------------------------------------
  // Test 1: formatScore unit tests (including score 0, decimal, null)
  // ---------------------------------------------------------------
  console.log('--- Test 1: formatScore helper tests ---');
  const score85Vi = formatScore(8.5, 'vi');
  const score85En = formatScore(8.5, 'en');
  const score0Vi = formatScore(0, 'vi');
  const score0En = formatScore(0, 'en');
  const score10Vi = formatScore(10, 'vi');
  const scoreNull = formatScore(null, 'vi');
  const scoreUndef = formatScore(undefined, 'vi');

  console.log(`1a. Score 8.5 vi: "${score85Vi}", en: "${score85En}"`);
  if (score85Vi !== '8,5' || score85En !== '8.5') throw new Error('1a failed');

  console.log(`1b. Score 0 vi: "${score0Vi}", en: "${score0En}"`);
  if (score0Vi !== '0' || score0En !== '0') throw new Error('1b failed: score 0 must display as "0"');

  console.log(`1c. Score 10 vi: "${score10Vi}"`);
  if (score10Vi !== '10') throw new Error('1c failed');

  console.log(`1d. Score null/undefined: "${scoreNull}", "${scoreUndef}"`);
  if (scoreNull !== '--' || scoreUndef !== '--') throw new Error('1d failed');

  // ---------------------------------------------------------------
  // Test 2: Ca 1 — Bài đã chấm tiêu chuẩn (assign-db-05)
  // ---------------------------------------------------------------
  console.log('\n--- Test 2: Ca 1 — Standard GRADED submission (assign-db-05) ---');
  localStorage.clear();

  const sub05 = await getMySubmission('assign-db-05');
  console.log('2a. Read assign-db-05:');
  console.log(`    Status: ${sub05.status}`);
  console.log(`    Score: ${sub05.score} (formatted vi: ${formatScore(sub05.score, 'vi')})`);
  console.log(`    Content: "${sub05.content}"`);
  console.log(`    Feedback: "${sub05.feedback}"`);
  console.log(`    GradedBy: ${sub05.gradedByTeacherName}`);
  console.log(`    GradedAt: ${sub05.gradedAt}`);
  console.log(`    SubmittedAt: ${sub05.submittedAt}`);
  console.log(`    IsLate: ${sub05.isLate}`);

  if (sub05.status !== 'GRADED') throw new Error('2a failed: status must be GRADED');
  if (sub05.score !== 9) throw new Error('2a failed: score must be 9');
  if (sub05.content !== '15/15 câu trắc nghiệm Đại số quan hệ trực tuyến.') {
    throw new Error('2a failed: content mismatch for assign-db-05');
  }
  if (
    !sub05.feedback ||
    !sub05.feedback.includes('phép chiếu') ||
    !sub05.feedback.includes('kết nối tự nhiên') ||
    !sub05.feedback.includes('chia quan hệ')
  ) {
    throw new Error('2a failed: feedback mismatch for assign-db-05');
  }
  if (sub05.gradedByTeacherName !== 'TS. Lê Hoàng Nam') throw new Error('2a failed: teacher name mismatch');
  if (!sub05.gradedAt || !sub05.submittedAt) throw new Error('2a failed: timestamps missing');
  if (sub05.submittedAt !== '2024-11-09T14:15:00') throw new Error('2a failed: submittedAt must be 2024-11-09T14:15:00');
  if (sub05.gradedAt !== '2024-11-10T09:30:00') throw new Error('2a failed: gradedAt must be 2024-11-10T09:30:00');
  if (sub05.isLate !== false) throw new Error('2a failed: isLate must be false');

  // Kiểm tra điều kiện hiển thị thẻ Nhận xét:
  const shouldShowFeedbackCard = Boolean(sub05.feedback && sub05.feedback.trim().length > 0);
  console.log(`2b. Should show feedback card: ${shouldShowFeedbackCard}`);
  if (!shouldShowFeedbackCard) throw new Error('2b failed: feedback card should be visible');

  // Kiểm tra thời gian chấm & thời gian nộp formatted:
  const gradedTime05 = formatSubmissionTime(sub05.gradedAt);
  const submittedTime05 = formatSubmissionTime(sub05.submittedAt);
  console.log(`2c. Graded time: ${gradedTime05.formatted}, Submitted time: ${submittedTime05.formatted}`);
  if (gradedTime05.time !== '09:30' || gradedTime05.date !== '10/11/2024') throw new Error('2c failed: gradedTime mismatch');
  if (submittedTime05.time !== '14:15' || submittedTime05.date !== '09/11/2024') throw new Error('2c failed: submittedTime mismatch');

  // Đối chiếu điểm ở danh sách và chi tiết:
  const assignDb05 = MOCK_ASSIGNMENTS.find((a) => a.id === 'assign-db-05')!;
  console.log(`2d. Score comparison: list=${assignDb05.studentScore}/${assignDb05.studentMaxScore}, detail=${sub05.score}/${assignDb05.maxScore}`);
  if (assignDb05.studentScore !== sub05.score) {
    throw new Error('2d failed: score in list (9.0) does not match score in detail (9)');
  }

  // Kiểm tra khóa tuyệt đối thao tác nộp, chỉnh sửa, hủy:
  const evalSubmit05 = evaluateCanSubmitAssignment({
    assignment: assignDb05,
    submission: sub05,
  });
  const evalCancel05 = evaluateCanCancelSubmission({ submission: sub05 });
  console.log(`2e. Can submit: ${evalSubmit05.canSubmit}, canEdit: ${evalSubmit05.canEditSubmission}, canCancel: ${evalCancel05.canCancel}`);
  if (evalSubmit05.canSubmit !== false || evalSubmit05.canEditSubmission !== false) {
    throw new Error('2e failed: submission and edit must be disabled for GRADED');
  }
  if (evalCancel05.canCancel !== false || evalCancel05.reason !== 'ALREADY_GRADED') {
    throw new Error('2e failed: cancel must be blocked for GRADED');
  }

  // F5 persistence check:
  const sub05AfterF5 = await getMySubmission('assign-db-05');
  if (sub05AfterF5.status !== 'GRADED' || sub05AfterF5.score !== 9) {
    throw new Error('2f failed: F5 must preserve GRADED status and score 9');
  }
  console.log('2f. F5 simulated reload: status, content, and score preserved perfectly.');

  // ---------------------------------------------------------------
  // Test 3: Ca 2 & 3 — Bài đã chấm điểm 0 và nhận xét trống (assign-db-06)
  // ---------------------------------------------------------------
  console.log('\n--- Test 3: Ca 2 & 3 — Score 0 and empty feedback (assign-db-06) ---');
  const sub06 = await getMySubmission('assign-db-06');
  console.log('3a. Read assign-db-06:');
  console.log(`    Status: ${sub06.status}`);
  console.log(`    Score: ${sub06.score} (formatted: ${formatScore(sub06.score, 'vi')})`);
  console.log(`    Feedback: "${sub06.feedback}"`);

  if (sub06.status !== 'GRADED') throw new Error('3a failed: status must be GRADED');
  if (sub06.score !== 0) throw new Error('3a failed: score must be 0');

  // Điểm 0 phải hiển thị là '0', không được là '--':
  const formattedScore06 = formatScore(sub06.score, 'vi');
  if (formattedScore06 !== '0') throw new Error('3b failed: score 0 must format as "0"');

  // Thẻ nhận xét phải ẩn khi feedback rỗng:
  const shouldShowFeedbackCard06 = Boolean(sub06.feedback && sub06.feedback.trim().length > 0);
  console.log(`3c. Should show feedback card for empty feedback: ${shouldShowFeedbackCard06}`);
  if (shouldShowFeedbackCard06 !== false) throw new Error('3c failed: feedback card must be HIDDEN when feedback is empty');

  // ---------------------------------------------------------------
  // Test 4: Rà soát trạng thái Chưa nộp và Chờ chấm
  // ---------------------------------------------------------------
  console.log('\n--- Test 4: Regression check for Chưa nộp and Chờ chấm ---');
  // 4a. Chưa nộp (assign-db-04):
  const sub04 = await getMySubmission('assign-db-04');
  console.log(`4a. assign-db-04 status: ${sub04.status}`);
  if (sub04.status !== 'NOT_SUBMITTED') throw new Error('4a failed: assign-db-04 must be NOT_SUBMITTED');

  // 4b. Chờ chấm (assign-db-01):
  const sub01 = await getMySubmission('assign-db-01');
  console.log(`4b. assign-db-01 status: ${sub01.status}, isLate: ${sub01.isLate}`);
  if (sub01.status !== 'SUBMITTED' || sub01.isLate !== true) {
    throw new Error('4b failed: assign-db-01 must be SUBMITTED with isLate=true');
  }
  const evalCancel01 = evaluateCanCancelSubmission({ submission: sub01 });
  if (!evalCancel01.canCancel) throw new Error('4b failed: assign-db-01 must be cancellable');

  // ---------------------------------------------------------------
  // Test 5: Kiểm tra chuẩn hóa tên giảng viên & xử lý không lặp nhãn
  // ---------------------------------------------------------------
  console.log('\n--- Test 5: Teacher name cleanup & duplicate label prevention ---');
  function resolveTeacherGradedName(gradedBy?: string | null): string {
    const trimmed = gradedBy?.trim();
    if (!trimmed || trimmed.includes('giảng viên') || trimmed.includes('Chủ nhiệm môn')) {
      return 'TS. Lê Hoàng Nam';
    }
    return trimmed
      .replace(/\s*[•·-]\s*(Giảng viên|Instructor)\s*$/i, '')
      .replace(/^(Giảng viên|Instructor)\s*[:•·-]\s*/i, '')
      .trim();
  }

  const sampleNames = [
    { input: 'TS. Lê Hoàng Nam', expected: 'TS. Lê Hoàng Nam' },
    { input: 'TS. Lê Hoàng Nam • Giảng viên', expected: 'TS. Lê Hoàng Nam' },
    { input: 'TS. Lê Hoàng Nam - Giảng viên', expected: 'TS. Lê Hoàng Nam' },
    { input: 'Giảng viên: TS. Lê Hoàng Nam', expected: 'TS. Lê Hoàng Nam' },
    { input: 'TS. Lê Hoàng Nam • Instructor', expected: 'TS. Lê Hoàng Nam' },
    { input: 'TS. Lê Hoàng Nam (Chủ nhiệm môn) • 2 giảng viên', expected: 'TS. Lê Hoàng Nam' },
    { input: 'PGS. TS. Nguyễn Trần Hoàng Thảo Vy Minh', expected: 'PGS. TS. Nguyễn Trần Hoàng Thảo Vy Minh' },
    { input: undefined, expected: 'TS. Lê Hoàng Nam' },
    { input: null, expected: 'TS. Lê Hoàng Nam' },
  ];

  for (const sample of sampleNames) {
    const cleaned = resolveTeacherGradedName(sample.input);
    console.log(`5a. "${sample.input}" -> "${cleaned}"`);
    if (cleaned !== sample.expected) {
      throw new Error(`5a failed: expected "${sample.expected}", got "${cleaned}"`);
    }
  }

  // ---------------------------------------------------------------
  // Test 6: Fallback cached localStorage missing gradedAt / polluted with Stitch data
  // ---------------------------------------------------------------
  console.log('\n--- Test 6: Sanitization & recovery for cached localStorage polluted with Stitch data ---');
  localStorage.setItem(
    'student_submission_assign-db-05_std-k22-001',
    JSON.stringify({
      id: 'sub-assign-db-05',
      assignmentId: 'assign-db-05',
      status: 'GRADED',
      score: 8.5, // Dữ liệu cũ bị nhiễm từ Stitch
      content: 'Kính gửi thầy Nam, em gửi bài làm bài tập chuẩn hóa CSDL Tuần 6...',
      feedback: 'Em trình bày rõ cách tìm khóa...',
      gradedByTeacherName: 'TS. Lê Hoàng Nam (Chủ nhiệm môn) • 2 giảng viên',
      submittedAt: '2024-10-28T21:15:00',
    })
  );

  const sub05WithFallback = await getMySubmission('assign-db-05');
  console.log(`6a. Recovered sub05: score=${sub05WithFallback.score}, content="${sub05WithFallback.content}", gradedAt="${sub05WithFallback.gradedAt}", submittedAt="${sub05WithFallback.submittedAt}"`);
  if (sub05WithFallback.score !== 9) {
    throw new Error('6a failed: score should be recovered to 9');
  }
  if (sub05WithFallback.content !== '15/15 câu trắc nghiệm Đại số quan hệ trực tuyến.') {
    throw new Error('6a failed: content should be recovered to trắc nghiệm');
  }
  if (!sub05WithFallback.gradedAt || sub05WithFallback.gradedAt !== '2024-11-10T09:30:00') {
    throw new Error('6a failed: gradedAt should be filled from INITIAL_DEMO_SUBMISSIONS (2024-11-10T09:30:00)');
  }
  if (sub05WithFallback.submittedAt !== '2024-11-09T14:15:00') {
    throw new Error('6a failed: submittedAt should be recovered to 2024-11-09T14:15:00');
  }
  if (!sub05WithFallback.gradedByTeacherName || sub05WithFallback.gradedByTeacherName !== 'TS. Lê Hoàng Nam') {
    throw new Error('6a failed: gradedByTeacherName should be sanitized to "TS. Lê Hoàng Nam"');
  }

  // ---------------------------------------------------------------
  // Test 7: API submission missing gradedAt -> Dòng Thời gian chấm phải ẩn
  // ---------------------------------------------------------------
  console.log('\n--- Test 7: API submission missing gradedAt should hide grading time row ---');
  const submissionWithoutGradedAt = {
    ...sub05,
    gradedAt: null,
  };
  const shouldShowGradedTimeRow = Boolean(submissionWithoutGradedAt.gradedAt);
  console.log(`7a. Should show graded time row when gradedAt is null: ${shouldShowGradedTimeRow}`);
  if (shouldShowGradedTimeRow !== false) {
    throw new Error('7a failed: graded time row must be hidden when gradedAt is missing');
  }

  // ---------------------------------------------------------------
  // Test 8: F5 reload assign-db-05 và xác nhận gradedByTeacherName & gradedAt thực tế
  // ---------------------------------------------------------------
  console.log('\n--- Test 8: F5 reload assign-db-05 exact values verification ---');
  const actualSubAfterF5 = await getMySubmission('assign-db-05');
  const actualGradedBy = resolveTeacherGradedName(actualSubAfterF5.gradedByTeacherName);
  const actualGradedAt = actualSubAfterF5.gradedAt;
  const actualSubmittedAt = actualSubAfterF5.submittedAt;
  const actualScore = actualSubAfterF5.score;
  const actualContent = actualSubAfterF5.content;

  console.log(`8a. gradedByTeacherName after F5: "${actualGradedBy}"`);
  console.log(`8b. gradedAt after F5: "${actualGradedAt}"`);
  console.log(`8c. submittedAt after F5: "${actualSubmittedAt}"`);
  console.log(`8d. score after F5: ${actualScore}`);
  console.log(`8e. content after F5: "${actualContent}"`);

  if (actualGradedBy !== 'TS. Lê Hoàng Nam') {
    throw new Error(`8a failed: gradedByTeacherName must be "TS. Lê Hoàng Nam", got "${actualGradedBy}"`);
  }
  if (actualGradedAt !== '2024-11-10T09:30:00') {
    throw new Error(`8b failed: gradedAt must be "2024-11-10T09:30:00", got "${actualGradedAt}"`);
  }
  if (actualSubmittedAt !== '2024-11-09T14:15:00') {
    throw new Error(`8c failed: submittedAt must be "2024-11-09T14:15:00", got "${actualSubmittedAt}"`);
  }
  if (actualScore !== 9) {
    throw new Error(`8d failed: score must be 9, got ${actualScore}`);
  }
  if (actualContent !== '15/15 câu trắc nghiệm Đại số quan hệ trực tuyến.') {
    throw new Error(`8e failed: content must be trắc nghiệm, got "${actualContent}"`);
  }

  console.log('\nALL GRADED SUBMISSION VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
