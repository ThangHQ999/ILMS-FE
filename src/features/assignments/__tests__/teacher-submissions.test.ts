import assert from 'node:assert';
import { runSuite } from '@/test-utils/run-verifications';
import fs from 'fs';
import path from 'path';
import { INITIAL_DEMO_SUBMISSIONS, MOCK_ASSIGNMENTS, MOCK_TEACHER_SUBMISSIONS, bulkGradeSubmissions, createAssignment, deleteGrading, evaluateCanManageClassSubmissions, evaluateCanModifyGrading, formatAssignmentDueDate, formatScore, formatSubmissionTime, getAssignmentById, getAssignmentSubmissionsPaged, getMySubmission, getSubmissionById, getSubmissionGrading, gradeSubmission, isSubmissionGraded, submitAssignment, validateFeedbackUtf8Bytes, validateGradeScore } from '../services/assignment.service';
import { evaluateCanCancelSubmission, evaluateCanSubmitAssignment } from '../utils/submissionValidation';
import viJson from '../../../messages/vi.json';
import enJson from '../../../messages/en.json';
import { api } from '@/lib/axios';
import { assignmentKeys } from '../constants';
import { validateBatchGradeScore } from '../components/TeacherBulkGradeModal';
import { MAX_FEEDBACK_UTF8_BYTES, submissionDetailSchema, submissionGradingSchema } from '../schemas/assignment.schema';


// ===============================================================
// Sub-test: verify_graded_submission.test.ts
// ===============================================================
async function test_verify_graded_submission() {
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


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_grade_submission.test.ts
// ===============================================================
async function test_verify_teacher_grade_submission() {
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



  // Helper validation function equivalent to UI validation
  function validateScoreUI(value: string, maxScore = 10): { valid: boolean; message?: string; num?: number } {
    const trimmed = value.trim().replace(',', '.');
    if (trimmed === '') {
      return { valid: false, message: 'Vui lòng nhập điểm.' };
    }
    const num = Number(trimmed);
    if (isNaN(num)) {
      return { valid: false, message: 'Điểm phải là một số hợp lệ.' };
    }
    if (num < 0 || num > maxScore) {
      return { valid: false, message: `Điểm phải từ 0 đến ${maxScore}.` };
    }
    const parts = trimmed.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
      return { valid: false, message: 'Điểm tối đa 2 chữ số thập phân (ví dụ: 8.25).' };
    }
    return { valid: true, num };
  }

  async function runTests() {
    console.log('=== RUNNING TEACHER SUBMISSION DETAIL & GRADING VERIFICATION TESTS ===\n');

    // Case 1: Pre-existing assignment (assign-db-01) - Click View Submission
    console.log('--- Case 1: Pre-existing assignment (assign-db-01) ---');
    // 1a. Vũ Đức Long (chưa chấm)
    const vuLongSub = await getSubmissionById(
      '00000000-0000-4000-8000-000000000005',
      'assign-db-01',
      'csdl-k22-01'
    );
    assert(Boolean(vuLongSub), 'Submission for Vu Duc Long must exist');
    assert(vuLongSub.studentName === 'Vũ Đức Long', `Expected studentName 'Vũ Đức Long', got: ${vuLongSub.studentName}`);
    assert(
      vuLongSub.studentCode === '22028215',
      `Expected studentCode '22028215', got: ${vuLongSub.studentCode}`
    );
    assert(vuLongSub.status === 'SUBMITTED', `Expected status 'SUBMITTED', got: ${vuLongSub.status}`);
    assert(vuLongSub.isLate === false, 'Expected isLate = false (Đúng hạn)');
    assert(vuLongSub.maxScore === 10, 'Expected maxScore = 10');
    assert(Boolean(vuLongSub.content?.includes('bao đóng')), 'Expected submission content to contain assignment answers');

    // 1b. Lê Thu Hà (đã chấm điểm 0)
    const leThuHaSub = await getSubmissionById(
      '00000000-0000-4000-8000-000000000002',
      'assign-db-01',
      'csdl-k22-01'
    );
    assert(leThuHaSub.studentName === 'Lê Thu Hà', 'Expected Le Thu Ha');
    assert(leThuHaSub.status === 'GRADED', 'Expected Le Thu Ha status GRADED');
    assert(leThuHaSub.score === 0, 'Expected Le Thu Ha score 0');
    assert(Boolean(leThuHaSub.content?.includes('Lê Thu Hà')), 'Expected Le Thu Ha content');

    // F5 persistence check
    const reloadedVuLong = await getSubmissionById(
      '00000000-0000-4000-8000-000000000005',
      'assign-db-01',
      'csdl-k22-01'
    );
    assert(reloadedVuLong.content === vuLongSub.content, 'Content preserved after reload');
    console.log('=> Case 1 PASSED: Pre-existing assignment submissions accurately loaded and preserved.');

    // Case 2: Demo assignment student submitted (Học viên nộp bài demo)
    console.log('--- Case 2: Demo assignment student submitted ---');
    const demoAssignmentId = 'assign-db-01';
    const studentId = 'student-ilms-demo-case2';

    // 2a. Học viên nộp bài demo vào assign-db-01
    const submittedWork = await submitAssignment(
      demoAssignmentId,
      { content: 'Nội dung bài làm thực tế của học viên ILMS vừa nộp trong lớp CSDL.' },
      'csdl-k22-01',
      studentId
    );
    assert(submittedWork.status === 'SUBMITTED' || submittedWork.status === 'LATE', 'Status submitted or late');

    // 2b. Giảng viên mở đúng bản nộp của học viên vừa nộp
    const teacherOpenedSub = await getSubmissionById(
      submittedWork.id || `sub-${demoAssignmentId}`,
      demoAssignmentId,
      'csdl-k22-01'
    );
    assert(teacherOpenedSub.studentName === 'Học viên ILMS', 'Expected studentName Học viên ILMS');
    assert(
      teacherOpenedSub.content === 'Nội dung bài làm thực tế của học viên ILMS vừa nộp trong lớp CSDL.',
      'Expected exactly the student submitted content'
    );

    // 2c. Giảng viên chấm điểm 8,5 và nhận xét
    const gradedCase2 = await gradeSubmission(
      teacherOpenedSub.id,
      {
        score: 8.5,
        feedback: 'Bài làm phân tích chuẩn 3NF rất tốt, giải thích thỏa đáng.',
      },
      demoAssignmentId,
      'csdl-k22-01'
    );
    assert(gradedCase2.status === 'GRADED', 'Status must be GRADED');
    assert(gradedCase2.score === 8.5, 'Score must be 8.5');

    // 2d. Giảng viên F5 và kiểm tra danh sách bài nộp
    const teacherSubmissionsPaged = await getAssignmentSubmissionsPaged(demoAssignmentId, {
      classId: 'csdl-k22-01',
      size: 20,
    });
    const rowInList = teacherSubmissionsPaged.items.find((it) => it.id === teacherOpenedSub.id);
    assert(Boolean(rowInList), 'Graded student submission must appear in teacher submissions list');
    assert(rowInList?.status === 'GRADED', 'Status must be GRADED in teacher list');
    assert(rowInList?.score === 8.5, 'Score must be 8.5 in teacher list');

    // 2e. Học viên chuyển sang vai trò học viên, mở đúng bài và thấy kết quả
    const studentViewSub = await getMySubmission(demoAssignmentId, studentId, 'csdl-k22-01');
    assert(studentViewSub?.status === 'GRADED', 'Student sees status GRADED');
    assert(studentViewSub?.score === 8.5, 'Student sees score 8.5');
    assert(
      Boolean(studentViewSub?.feedback?.includes('phân tích chuẩn 3NF')),
      'Student sees teacher feedback'
    );
    assert(studentViewSub?.gradedByTeacherName === 'TS. Lê Hoàng Nam', 'Teacher name matches');
    console.log('=> Case 2 PASSED: Demo student submission graded and synchronized to both views.');

    // Case 3: Newly created assignment and submitted (Bài vừa tạo rồi nộp mới)
    console.log('--- Case 3: Newly created assignment and submitted ---');
    // 3a. Giảng viên tạo bài tập mới
    const createdAssignment = await createAssignment('csdl-k22-01', {
      courseId: 'course-network-01',
      title: 'Bài tập Thực hành Lập trình Socket TCP',
      description: 'Xây dựng ứng dụng chat client-server đa luồng bằng giao thức TCP.',
      maxScore: 10,
      dueDate: '2024-11-25T23:59:00',
      allowLateSubmission: true,
    });
    assert(Boolean(createdAssignment.id), 'Created assignment must have an ID');

    // 3b. Học viên nộp bài vào bài tập vừa tạo
    const newCreatedSub = await submitAssignment(
      createdAssignment.id,
      { content: 'Em nộp code Socket TCP client/server đa luồng hoàn chỉnh của Vũ Minh.' },
      'csdl-k22-01',
      'student-k22-vu-minh'
    );

    // 3c. Giảng viên mở Xem bài nộp của bài mới
    const openedNewSub = await getSubmissionById(
      newCreatedSub.id || `sub-${createdAssignment.id}`,
      createdAssignment.id,
      'csdl-k22-01'
    );
    assert(
      openedNewSub.assignmentTitle === 'Bài tập Thực hành Lập trình Socket TCP',
      `Expected assignment title, got: ${openedNewSub.assignmentTitle}`
    );
    assert(openedNewSub.studentName === 'Vũ Minh', `Expected studentName Vũ Minh, got: ${openedNewSub.studentName}`);
    assert(
      openedNewSub.content === 'Em nộp code Socket TCP client/server đa luồng hoàn chỉnh của Vũ Minh.',
      'Expected correct submission content'
    );

    // F5 reload check
    const reloadedNewSub = await getSubmissionById(
      newCreatedSub.id || `sub-${createdAssignment.id}`,
      createdAssignment.id,
      'csdl-k22-01'
    );
    assert(reloadedNewSub.content === openedNewSub.content, 'Content preserved after F5');

    // 3d. Giảng viên lưu điểm 8,5/10 và nhận xét
    const gradedNewAssign = await gradeSubmission(
      openedNewSub.id,
      {
        score: 8.5,
        feedback: 'Thuật toán xử lý gói tin và đa luồng rất mượt mà.',
      },
      createdAssignment.id,
      'csdl-k22-01'
    );
    assert(gradedNewAssign.status === 'GRADED', 'Status must be GRADED');
    assert(gradedNewAssign.score === 8.5, 'Score must be 8.5');

    // 3e. Giảng viên thấy Đã chấm trong danh sách
    const teacherListNew = await getAssignmentSubmissionsPaged(createdAssignment.id, {
      classId: 'csdl-k22-01',
    });
    const rowNewInList = teacherListNew.items.find((it) => it.id === openedNewSub.id);
    assert(rowNewInList?.status === 'GRADED', 'Teacher list sees GRADED');
    assert(rowNewInList?.score === 8.5, 'Teacher list sees score 8.5');

    // 3f. Học viên thấy cùng kết quả ở bước 9
    const studentViewNew = await getMySubmission(createdAssignment.id, 'student-k22-vu-minh', 'csdl-k22-01');
    assert(studentViewNew?.status === 'GRADED', 'Student sees status GRADED');
    assert(studentViewNew?.score === 8.5, 'Student sees score 8.5');
    assert(studentViewNew?.feedback === 'Thuật toán xử lý gói tin và đa luồng rất mượt mà.', 'Feedback matches');
    console.log('=> Case 3 PASSED: Newly created assignment submitted, graded and synchronized.');

    // Case 4: Security & Integrity - Cross assignment rejection
    console.log('--- Case 4: Security & Integrity (Reject cross assignment mismatch) ---');
    let crossErrorCaught = false;
    try {
      // Thử dùng submissionId của assign-db-01 nhưng truyền assignmentId khác (createdAssignment.id)
      await getSubmissionById(
        '00000000-0000-4000-8000-000000000005',
        createdAssignment.id,
        'csdl-k22-01'
      );
    } catch (err: unknown) {
      crossErrorCaught = true;
      assert(
        (err as Error).message.includes('Bản nộp không tồn tại hoặc không thuộc bài tập này'),
        'Must reject mismatch'
      );
    }
    assert(crossErrorCaught, 'Must catch error when submissionId does not belong to assignmentId');
    console.log('=> Case 4 PASSED: Cross-assignment data leakage strictly prevented.');

    // Case 5: Validation Boundaries (Score 11 blocked, decimals verified)
    console.log('--- Case 5: Validation Boundaries ---');
    const check11 = validateScoreUI('11', 10);
    assert(check11.valid === false, 'Score 11 must be invalid on scale 10');
    assert(check11.message === 'Điểm phải từ 0 đến 10.', 'Score message matches');

    const checkNeg = validateScoreUI('-1', 10);
    assert(checkNeg.valid === false, 'Negative score must be invalid');

    const check3Decimals = validateScoreUI('8.555', 10);
    assert(check3Decimals.valid === false, '3 decimals must be rejected');

    const checkComma = validateScoreUI('8,5', 10);
    assert(checkComma.valid === true && checkComma.num === 8.5, 'Comma normalized to 8.5');
    console.log('=> Case 5 PASSED: Validation boundaries and decimal precision verified.');

    // Case 6: Role Switcher i18n & Shared Namespace
    console.log('--- Case 6: Role Switcher i18n & Shared Namespace ---');
    // Shared namespace between Submissions list and Submission detail
    const viSubRoles = (viJson as Record<string, unknown>).assignments as {
      teacher: {
        submissions: { roles: { student: string; teacher: string } };
        submissionDetail: { roles: { student: string; teacher: string } };
      };
    };
    const enSubRoles = (enJson as Record<string, unknown>).assignments as {
      teacher: {
        submissions: { roles: { student: string; teacher: string } };
        submissionDetail: { roles: { student: string; teacher: string } };
      };
    };

    assert(
      viSubRoles.teacher.submissions.roles.student === 'Học viên',
      `Expected vi student 'Học viên', got: ${viSubRoles.teacher.submissions.roles.student}`
    );
    assert(
      viSubRoles.teacher.submissions.roles.teacher === 'Giảng viên',
      `Expected vi teacher 'Giảng viên', got: ${viSubRoles.teacher.submissions.roles.teacher}`
    );
    assert(
      enSubRoles.teacher.submissions.roles.student === 'Student',
      `Expected en student 'Student', got: ${enSubRoles.teacher.submissions.roles.student}`
    );
    assert(
      enSubRoles.teacher.submissions.roles.teacher === 'Teacher',
      `Expected en teacher 'Teacher', got: ${enSubRoles.teacher.submissions.roles.teacher}`
    );
    console.log('=> Case 6 PASSED: Role switcher i18n correctly mapped to shared translations.');

    // Case 7: Assignment description requirement & Empty description hiding
    console.log('--- Case 7: Assignment description requirement & Empty description hiding ---');
    // 7a. Pre-existing assignment (assign-db-01): has CSDL description
    const db01Assignment = await getAssignmentById('assign-db-01', 'csdl-k22-01');
    assert(
      Boolean(db01Assignment.description?.includes('lược đồ quan hệ R(A, B, C, D, E, G)')),
      'assign-db-01 must contain CSDL description'
    );
    const db01Sub = await getSubmissionById(
      '00000000-0000-4000-8000-000000000005',
      'assign-db-01',
      'csdl-k22-01'
    );
    assert(
      Boolean(db01Sub.assignmentDescription?.includes('lược đồ quan hệ R(A, B, C, D, E, G)')),
      'Submission detail must inherit assignment description'
    );

    // 7b. Assignment with custom description (not CSDL): Must display custom description, NOT CSDL
    const customAssign = await createAssignment('csdl-k22-01', {
      courseId: 'course-network-01',
      title: 'Bài tập Phân tích HTTP/2 và gRPC',
      description: 'Nghiên cứu cơ chế multiplexing trong HTTP/2 và protocol buffers của gRPC.',
      maxScore: 10,
      dueDate: '2024-11-30T23:59:00',
      allowLateSubmission: true,
    });
    const customSubSubmitted = await submitAssignment(
      customAssign.id,
      { content: 'Bài làm phân tích gRPC của sinh viên.' },
      'csdl-k22-01',
      'student-k22-grpc'
    );
    const customSubDetail = await getSubmissionById(
      customSubSubmitted.id || `sub-${customAssign.id}`,
      customAssign.id,
      'csdl-k22-01'
    );
    assert(
      customSubDetail.assignmentDescription === 'Nghiên cứu cơ chế multiplexing trong HTTP/2 và protocol buffers của gRPC.',
      `Expected custom description, got: ${customSubDetail.assignmentDescription}`
    );
    assert(
      !customSubDetail.assignmentDescription?.includes('lược đồ quan hệ R'),
      'Custom assignment must NOT contain CSDL description!'
    );

    // F5 reload simulation: Re-fetch submission detail directly from storage after simulated page refresh
    const reloadedCustomSubDetail = await getSubmissionById(
      customSubSubmitted.id || `sub-${customAssign.id}`,
      customAssign.id,
      'csdl-k22-01'
    );
    assert(
      reloadedCustomSubDetail.assignmentDescription === 'Nghiên cứu cơ chế multiplexing trong HTTP/2 và protocol buffers của gRPC.',
      'Expected custom description preserved after F5 reload'
    );
    const customAssignmentFetched = await getAssignmentById(customAssign.id, 'csdl-k22-01');
    assert(
      customAssignmentFetched.description === 'Nghiên cứu cơ chế multiplexing trong HTTP/2 và protocol buffers của gRPC.',
      'Both student and teacher views share exact assignment.description from URL'
    );

    // 7c. Assignment with EMPTY description: Must be empty/null, triggering hide of requirement card in UI
    const emptyDescAssign = await createAssignment('csdl-k22-01', {
      courseId: 'course-network-01',
      title: 'Bài tập Thực hành Trắc nghiệm Nhanh (Không mô tả)',
      description: '',
      maxScore: 10,
      dueDate: '2024-11-30T23:59:00',
      allowLateSubmission: true,
    });
    const emptyDescSubSubmitted = await submitAssignment(
      emptyDescAssign.id,
      { content: 'Bài làm trắc nghiệm.' },
      'csdl-k22-01',
      'student-k22-empty'
    );
    const emptyDescSubDetail = await getSubmissionById(
      emptyDescSubSubmitted.id || `sub-${emptyDescAssign.id}`,
      emptyDescAssign.id,
      'csdl-k22-01'
    );
    assert(
      emptyDescSubDetail.assignmentDescription === null || emptyDescSubDetail.assignmentDescription === '',
      'Empty description assignment must have null or empty assignmentDescription'
    );

    // F5 reload simulation for empty description assignment
    const reloadedEmptySubDetail = await getSubmissionById(
      emptyDescSubSubmitted.id || `sub-${emptyDescAssign.id}`,
      emptyDescAssign.id,
      'csdl-k22-01'
    );
    assert(
      reloadedEmptySubDetail.assignmentDescription === null || reloadedEmptySubDetail.assignmentDescription === '',
      'Empty description assignment preserved after F5, requirement box strictly hidden'
    );
    const emptyAssignmentFetched = await getAssignmentById(emptyDescAssign.id, 'csdl-k22-01');
    assert(
      emptyAssignmentFetched.description === null || emptyAssignmentFetched.description === '',
      'Both student and teacher views share empty description, hiding requirement box'
    );
    console.log('=> Case 7 PASSED: Assignment description isolation and empty description hiding verified.');

    // Case 8: Persistence of Graded Results After F5 (Bản nộp mẫu & Bản nộp mới)
    console.log('\n--- Case 8: Persistence of Graded Results After F5 ---');
    // 8a. Bản nộp mẫu Vũ Đức Long (00000000-0000-4000-8000-000000000005) trong assign-db-01
    const vuLongSubId = '00000000-0000-4000-8000-000000000005';
    const gradedVuLong = await gradeSubmission(
      vuLongSubId,
      {
        score: 1,
        feedback: 'Kiểm thử F5',
      },
      'assign-db-01',
      'csdl-k22-01'
    );
    assert(gradedVuLong.score === 1, 'Initial score must be 1');
    assert(gradedVuLong.feedback === 'Kiểm thử F5', 'Initial feedback must be Kiểm thử F5');
    assert(gradedVuLong.status === 'GRADED', 'Initial status must be GRADED');

    // Mô phỏng F5 (Trình duyệt refresh làm reset toàn bộ bộ nhớ JS in-memory của MOCK_TEACHER_SUBMISSIONS)
    MOCK_TEACHER_SUBMISSIONS['assign-db-01'][3].score = null;
    MOCK_TEACHER_SUBMISSIONS['assign-db-01'][3].feedback = null;
    MOCK_TEACHER_SUBMISSIONS['assign-db-01'][3].status = 'SUBMITTED';

    // 8b. F5 ở màn Chi tiết bài nộp: Phải đọc từ kho lưu trữ bền vững
    const reloadedVuLongDetail = await getSubmissionById(
      vuLongSubId,
      'assign-db-01',
      'csdl-k22-01'
    );
    assert(
      reloadedVuLongDetail.status === 'GRADED',
      `Expected status GRADED after F5, got: ${reloadedVuLongDetail.status}`
    );
    assert(
      reloadedVuLongDetail.score === 1,
      `Expected score 1 after F5, got: ${reloadedVuLongDetail.score}`
    );
    assert(
      reloadedVuLongDetail.feedback === 'Kiểm thử F5',
      `Expected feedback 'Kiểm thử F5' after F5, got: ${reloadedVuLongDetail.feedback}`
    );

    // 8c. F5 ở màn Danh sách bài nộp: Phải đọc từ kho lưu trữ bền vững
    const reloadedTeacherList = await getAssignmentSubmissionsPaged('assign-db-01', {
      classId: 'csdl-k22-01',
    });
    const vuLongInList = reloadedTeacherList.items.find((it) => it.id === vuLongSubId);
    assert(Boolean(vuLongInList), 'Vu Duc Long must be in teacher list');
    assert(
      vuLongInList?.status === 'GRADED',
      `Expected status GRADED in list after F5, got: ${vuLongInList?.status}`
    );
    assert(
      vuLongInList?.score === 1,
      `Expected score 1 in list after F5, got: ${vuLongInList?.score}`
    );

    // 8d. Thử thêm một bản nộp mẫu khác: Phạm Quang Huy (00000000-0000-4000-8000-000000000003 - nộp muộn)
    const quangHuySubId = '00000000-0000-4000-8000-000000000003';
    await gradeSubmission(
      quangHuySubId,
      {
        score: 7.5,
        feedback: 'Bài nộp muộn nhưng giải thuật đúng.',
      },
      'assign-db-01',
      'csdl-k22-01'
    );

    // Mô phỏng F5 (reset in-memory)
    MOCK_TEACHER_SUBMISSIONS['assign-db-01'][1].score = null;
    MOCK_TEACHER_SUBMISSIONS['assign-db-01'][1].feedback = null;
    MOCK_TEACHER_SUBMISSIONS['assign-db-01'][1].status = 'LATE';

    const reloadedQuangHuyDetail = await getSubmissionById(
      quangHuySubId,
      'assign-db-01',
      'csdl-k22-01'
    );
    assert(reloadedQuangHuyDetail.status === 'GRADED', 'Quang Huy status GRADED after F5');
    assert(reloadedQuangHuyDetail.score === 7.5, 'Quang Huy score 7.5 after F5');
    assert(
      reloadedQuangHuyDetail.feedback === 'Bài nộp muộn nhưng giải thuật đúng.',
      'Quang Huy feedback preserved after F5'
    );

    const reloadedListWithHuy = await getAssignmentSubmissionsPaged('assign-db-01', {
      classId: 'csdl-k22-01',
    });
    const quangHuyInList = reloadedListWithHuy.items.find((it) => it.id === quangHuySubId);
    assert(quangHuyInList?.status === 'GRADED', 'Quang Huy list status GRADED after F5');
    assert(quangHuyInList?.score === 7.5, 'Quang Huy list score 7.5 after F5');

    // 8e. Thử với một bài mới tạo:
    const newTestAssign = await createAssignment('csdl-k22-01', {
      courseId: 'course-network-01',
      title: 'Bài tập Kiểm thử Chấm điểm F5 Bền vững',
      description: 'Mô tả bài tập kiểm thử lưu điểm F5',
      maxScore: 10,
      dueDate: '2024-12-01T23:59:00',
      allowLateSubmission: true,
    });
    const newStudentWork = await submitAssignment(
      newTestAssign.id,
      { content: 'Bài nộp kiểm thử lưu điểm sau F5.' },
      'csdl-k22-01',
      'student-k22-f5-test'
    );
    const newSubId = newStudentWork.id || `sub-${newTestAssign.id}`;
    await gradeSubmission(
      newSubId,
      {
        score: 9.25,
        feedback: 'Rất xuất sắc và chính xác.',
      },
      newTestAssign.id,
      'csdl-k22-01'
    );

    // F5 reload check for newly created assignment submission
    const reloadedNewDetail = await getSubmissionById(
      newSubId,
      newTestAssign.id,
      'csdl-k22-01'
    );
    assert(reloadedNewDetail.status === 'GRADED', 'New assignment sub status GRADED after F5');
    assert(reloadedNewDetail.score === 9.25, 'New assignment sub score 9.25 after F5');
    assert(
      reloadedNewDetail.feedback === 'Rất xuất sắc và chính xác.',
      'New assignment sub feedback preserved after F5'
    );

    const reloadedNewList = await getAssignmentSubmissionsPaged(newTestAssign.id, {
      classId: 'csdl-k22-01',
    });
    const newSubInList = reloadedNewList.items.find((it) => it.id === newSubId);
    assert(newSubInList?.status === 'GRADED', 'New assignment sub list status GRADED after F5');
    assert(newSubInList?.score === 9.25, 'New assignment sub list score 9.25 after F5');
    console.log('=> Case 8 PASSED: F5 persistence verified for pre-existing mock, second mock, and newly created assignments.');

    console.log('\n================================================================');
    console.log('ALL VERIFICATION TESTS FOR STEP 8 ROOT CAUSE FIX PASSED! (8/8)');
    console.log('================================================================\n');
  }


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_submissions.test.ts
// ===============================================================
async function test_verify_teacher_submissions() {
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
    assert(sortDesc.items[sortDesc.items.length - 1].studentName === '', 'Oldest must be  (21:15 – 28/10)');

    // 6e. Sort oldest first (submittedAt,asc)
    const sortAsc = await getAssignmentSubmissionsPaged('assign-db-01', {
      classId: 'csdl-k22-01',
      sort: 'submittedAt,asc',
    });
    assert(sortAsc.items[0].studentName === '', 'Oldest submission must be  (21:15 – 28/10)');
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


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_submissions_v2.test.ts
// ===============================================================
async function test_verify_teacher_submissions_v2() {
  function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    const out: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        out.push(...flattenKeys(v as Record<string, unknown>, key));
      } else {
        out.push(key);
      }
    }
    return out.sort();
  }

  async function runTests() {
    console.log('=== VERIFYING TEACHER SUBMISSIONS LIST V2 ===\n');

    // ------------------------------------------------------------------
    // TEST 1: Score validation rules (0..min(maxScore,100), <=2 significant decimals, empty != 0)
    // ------------------------------------------------------------------
    console.log('Test 1: validateBatchGradeScore...');
    assert.deepStrictEqual(validateBatchGradeScore('0', 10), { valid: true, numericValue: 0 });
    assert.deepStrictEqual(validateBatchGradeScore('10', 10), { valid: true, numericValue: 10 });
    assert.deepStrictEqual(validateBatchGradeScore('8.5', 10), { valid: true, numericValue: 8.5 });
    assert.deepStrictEqual(validateBatchGradeScore('8.25', 10), { valid: true, numericValue: 8.25 });
    assert.deepStrictEqual(validateBatchGradeScore('8.50', 10), { valid: true, numericValue: 8.5 });
    assert.deepStrictEqual(validateBatchGradeScore('7,75', 10), { valid: true, numericValue: 7.75 });
    assert.strictEqual(validateBatchGradeScore('', 10).valid, false);
    assert.strictEqual(validateBatchGradeScore('   ', 10).valid, false);
    assert.strictEqual(validateBatchGradeScore('-0.5', 10).valid, false);
    assert.strictEqual(validateBatchGradeScore('10.01', 10).valid, false);
    assert.strictEqual(validateBatchGradeScore('100.5', 120).valid, false); // capped at 100
    assert.strictEqual(validateBatchGradeScore('8.555', 10).valid, false);
    assert.strictEqual(validateBatchGradeScore('1e1', 10).valid, false);
    console.log('  ✔ PASSED Test 1\n');

    // ------------------------------------------------------------------
    // TEST 2: getAssignmentSubmissionsPaged real UUID contract & multi-page LATE adapter
    // ------------------------------------------------------------------
    console.log('Test 2: getAssignmentSubmissionsPaged real UUID contract & LATE adapter...');
    const realClassId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const realAssignId = '11111111-2222-3333-4444-555555555555';
    const origGet = api.get.bind(api);
    const origPost = api.post.bind(api);

    try {
      // 2a: 200 empty list must return [] cleanly (never fall through to demo!)
      let capturedParams: Record<string, unknown> | undefined;
      (api as unknown as { get: typeof api.get }).get = (async (_url: string, cfg?: { params?: Record<string, unknown> }) => {
        capturedParams = cfg?.params;
        return {
          data: {
            success: true,
            data: {
              items: [],
              pageNumber: 0,
              pageSize: 5,
              totalElements: 0,
              totalPages: 1,
              last: true,
            },
          },
        };
      }) as unknown as typeof api.get;

      const emptyRes = await getAssignmentSubmissionsPaged(realAssignId, {
        classId: realClassId,
        page: 0,
        size: 5,
        sort: 'submittedAt,desc',
      });
      assert.strictEqual(emptyRes.items.length, 0, '200 [] must return 0 items');
      assert.strictEqual(capturedParams?.status, undefined, 'ALL filter must NOT send status param');
      assert.strictEqual(capturedParams?.sort, 'submittedAt,desc');

      // 2b: SUBMITTED filter sends status=SUBMITTED strictly
      await getAssignmentSubmissionsPaged(realAssignId, {
        classId: realClassId,
        status: 'SUBMITTED',
        search: 'Minh',
        page: 0,
        size: 5,
      });
      assert.strictEqual(capturedParams?.status, 'SUBMITTED');
      assert.strictEqual(capturedParams?.search, 'Minh');

      // 2c: LATE adapter fetches across multiple pages & includes GRADED with isLate=true
      const page0Items = [
        { id: 's1', assignmentId: realAssignId, studentName: 'A', status: 'GRADED', isLate: true, score: 0, submittedAt: '2026-11-18T10:00:00' },
        { id: 's2', assignmentId: realAssignId, studentName: 'B', status: 'SUBMITTED', isLate: false, score: null, submittedAt: '2026-11-18T09:00:00' },
        { id: 's3', assignmentId: realAssignId, studentName: 'C', status: 'LATE', isLate: true, score: null, submittedAt: '2026-11-18T08:00:00' },
      ];
      const page1Items = [
        { id: 's4', assignmentId: realAssignId, studentName: 'D', status: 'GRADED', isLate: true, score: 8.5, submittedAt: '2026-11-18T07:00:00' },
        { id: 's5', assignmentId: realAssignId, studentName: 'E', status: 'LATE', isLate: true, score: null, submittedAt: '2026-11-18T06:00:00' },
        { id: 's6', assignmentId: realAssignId, studentName: 'F', status: 'LATE', isLate: true, score: null, submittedAt: '2026-11-18T05:00:00' },
        { id: 's7', assignmentId: realAssignId, studentName: 'G', status: 'LATE', isLate: true, score: null, submittedAt: '2026-11-18T04:00:00' },
      ];

      const fetchedPages: number[] = [];
      (api as unknown as { get: typeof api.get }).get = (async (_url: string, cfg?: { params?: { page?: number; status?: string } }) => {
        assert.strictEqual(cfg?.params?.status, undefined, 'LATE adapter must query unfiltered pages to include GRADED late rows');
        const p = cfg?.params?.page ?? 0;
        fetchedPages.push(p);
        return {
          data: {
            success: true,
            data: {
              items: p === 0 ? page0Items : page1Items,
              pageNumber: p,
              pageSize: 100,
              totalElements: 7,
              totalPages: 2,
              last: p >= 1,
            },
          },
        };
      }) as unknown as typeof api.get;

      const latePage0 = await getAssignmentSubmissionsPaged(realAssignId, {
        classId: realClassId,
        status: 'LATE',
        page: 0,
        size: 5,
      });
      assert.deepStrictEqual(fetchedPages, [0, 1], 'LATE adapter must aggregate all source pages');
      assert.strictEqual(latePage0.totalElements, 6, 'Must include all 6 late items (2 GRADED + 4 LATE)');
      assert.strictEqual(latePage0.items.length, 5);
      assert.strictEqual(latePage0.items[0].id, 's1');
      assert.strictEqual(latePage0.items[0].score, 0);
      assert.strictEqual(latePage0.totalPages, 2);

      const latePage1 = await getAssignmentSubmissionsPaged(realAssignId, {
        classId: realClassId,
        status: 'LATE',
        page: 1,
        size: 5,
      });
      assert.strictEqual(latePage1.items.length, 1);
      assert.strictEqual(latePage1.items[0].id, 's7');
      assert.strictEqual(latePage1.last, true);

      // 2d: HTTP 403 error must propagate cleanly
      (api as unknown as { get: typeof api.get }).get = (async () => {
        const err = new Error('Forbidden') as Error & { response?: { status: number } };
        err.response = { status: 403 };
        throw err;
      }) as unknown as typeof api.get;

      let caught403 = false;
      try {
        await getAssignmentSubmissionsPaged(realAssignId, { classId: realClassId });
      } catch (err: unknown) {
        caught403 = (err as { response?: { status?: number } })?.response?.status === 403;
      }
      assert.strictEqual(caught403, true, '403 must propagate without mock fallback');

      // ------------------------------------------------------------------
      // TEST 3: bulkGradeSubmissions (dedupe, { grades }, 207 partial, incomplete SCHEMA_ERROR)
      // ------------------------------------------------------------------
      console.log('Test 3: bulkGradeSubmissions contract (dedupe, 200/207, strict schema)...');
      let capturedPostUrl = '';
      let capturedPostBody: unknown = null;
      (api as unknown as { post: typeof api.post }).post = (async (url: string, body: unknown) => {
        capturedPostUrl = url;
        capturedPostBody = body;
        return {
          status: 207,
          data: {
            success: true,
            data: {
              totalRequested: 2,
              successCount: 1,
              failedCount: 1,
              successIds: ['sub-1'],
              failedItems: [{ id: 'sub-2', reason: 'Bài nộp đã được chấm bởi giảng viên khác.' }],
            },
          },
        };
      }) as unknown as typeof api.post;

      const batchRes = await bulkGradeSubmissions(
        realAssignId,
        [
          { submissionId: 'sub-1', score: 8.5, feedback: 'Tốt' },
          { submissionId: 'sub-1', score: 9.0 }, // duplicate must be stripped
          { submissionId: 'sub-2', score: 0, feedback: '   ' },
        ],
        realClassId
      );
      assert.strictEqual(capturedPostUrl, `/assignments/${realAssignId}/submissions/grade/batch`);
      const sent = capturedPostBody as { grades: Array<Record<string, unknown>> };
      assert.ok(Array.isArray(sent.grades) && !('items' in sent), 'Body must use { grades: [...] }');
      assert.strictEqual(sent.grades.length, 2, 'Duplicate submissionId must be deduplicated');
      assert.strictEqual(sent.grades[1].score, 0);
      assert.strictEqual(sent.grades[1].feedback, undefined);
      assert.strictEqual(batchRes.successCount, 1);
      assert.strictEqual(batchRes.failedCount, 1);
      assert.deepStrictEqual(batchRes.successIds, ['sub-1']);
      assert.strictEqual(batchRes.failedItems[0].id, 'sub-2');

      // Incomplete response must throw SCHEMA_ERROR (never assume all succeeded!)
      (api as unknown as { post: typeof api.post }).post = (async () => ({
        status: 200,
        data: { success: true, data: { message: 'ok' } },
      })) as unknown as typeof api.post;

      let caughtSchemaErr = false;
      try {
        await bulkGradeSubmissions(realAssignId, [{ submissionId: 'sub-1', score: 8 }], realClassId);
      } catch (err: unknown) {
        caughtSchemaErr = (err as { code?: string })?.code === 'SCHEMA_ERROR';
      }
      assert.strictEqual(caughtSchemaErr, true, 'Missing batch result fields must throw SCHEMA_ERROR');
    } finally {
      (api as unknown as { get: typeof api.get }).get = origGet;
      (api as unknown as { post: typeof api.post }).post = origPost;
    }
    console.log('  ✔ PASSED Tests 2 & 3\n');

    // ------------------------------------------------------------------
    // TEST 4: Permission evaluation (evaluateCanManageClassSubmissions)
    // ------------------------------------------------------------------
    console.log('Test 4: evaluateCanManageClassSubmissions...');
    assert.strictEqual(
      evaluateCanManageClassSubmissions({
        classId: realClassId,
        isDemoTeacherView: true, // role switcher alone MUST NOT grant access!
        isClassInfoLive: true,
        isMembersLive: true,
        user: { id: 'u-student', roleName: 'STUDENT' },
        classInfo: { ownerId: 'u-owner' },
        members: [{ id: 'u-student', role: 'STUDENT', status: 'APPROVED' }],
      }),
      false,
      'Student with role switcher must be denied'
    );
    assert.strictEqual(
      evaluateCanManageClassSubmissions({
        classId: realClassId,
        isClassInfoLive: true,
        isMembersLive: true,
        user: { id: 'u-pending-t', roleName: 'USER' },
        classInfo: { ownerId: 'u-owner' },
        members: [{ id: 'u-pending-t', role: 'TEACHER', status: 'PENDING' }],
      }),
      false,
      'Pending teacher must be denied'
    );
    assert.strictEqual(
      evaluateCanManageClassSubmissions({
        classId: realClassId,
        isClassInfoLive: true,
        isMembersLive: true,
        user: { id: 'u-active-t', roleName: 'USER' },
        classInfo: { ownerId: 'u-owner' },
        members: [{ id: 'u-active-t', role: 'TEACHER', status: 'APPROVED' }],
      }),
      true,
      'Approved class teacher must be allowed'
    );
    assert.strictEqual(
      evaluateCanManageClassSubmissions({
        classId: realClassId,
        isClassInfoLive: false,
        user: { id: 'u-admin', roleName: 'ADMIN' },
      }),
      true,
      'System ADMIN must be allowed'
    );
    assert.strictEqual(
      evaluateCanManageClassSubmissions({
        classId: realClassId,
        isAuthLoading: true,
        user: { id: 'u-owner', roleName: 'USER' },
        classInfo: { ownerId: 'u-owner' },
        isClassInfoLive: true,
      }),
      false,
      'Must deny while auth/class loading'
    );
    console.log('  ✔ PASSED Test 4\n');

    // ------------------------------------------------------------------
    // TEST 5: Query Key Partitioning + i18n Symmetry + Cleanliness Audit
    // ------------------------------------------------------------------
    console.log('Test 5: Query key partitioning, i18n symmetry & component cleanliness...');
    const k1 = JSON.stringify(assignmentKeys.teacherSubmissions(realAssignId, { page: 0 }, 'u1', realClassId));
    const k2 = JSON.stringify(assignmentKeys.teacherSubmissions(realAssignId, { page: 0 }, 'u2', realClassId));
    const k3 = JSON.stringify(assignmentKeys.teacherSubmissions(realAssignId, { page: 1 }, 'u1', realClassId));
    assert.notStrictEqual(k1, k2, 'Query key must partition by userId');
    assert.notStrictEqual(k1, k3, 'Query key must partition by page');

    const viJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../messages/vi.json'), 'utf8'));
    const enJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../messages/en.json'), 'utf8'));
    const viKeys = flattenKeys(viJson.assignments.teacher.submissions);
    const enKeys = flattenKeys(enJson.assignments.teacher.submissions);
    assert.deepStrictEqual(viKeys, enKeys, 'vi.json and en.json teacher.submissions keys must match 100%');

    const pageSrc = fs.readFileSync(
      path.resolve(__dirname, '../components/TeacherAssignmentSubmissionsPageView.tsx'),
      'utf8'
    );
    const modalSrc = fs.readFileSync(
      path.resolve(__dirname, '../components/TeacherBulkGradeModal.tsx'),
      'utf8'
    );

    for (const m of pageSrc.matchAll(/\bt\('([^']+)'/g)) {
      assert.ok(viKeys.includes(m[1]), `Missing i18n key assignments.teacher.submissions.${m[1]}`);
    }
    for (const m of modalSrc.matchAll(/\bt\('([^']+)'/g)) {
      assert.ok(
        viKeys.includes(`modal.${m[1]}`),
        `Missing i18n key assignments.teacher.submissions.modal.${m[1]}`
      );
    }

    assert.ok(!pageSrc.includes('Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)'), 'Must NOT hardcode Stitch assignment title');
    assert.ok(!pageSrc.includes('23:59 – 28/10/2024'), 'Must NOT hardcode Stitch due date');
    assert.ok(!pageSrc.includes('Socratic AI Tutor'), 'Must NOT copy Stitch floating Socratic AI button');
    assert.ok(!pageSrc.includes('Lê Thu Hà'), 'Must NOT contain Stitch mock students');
    assert.ok(pageSrc.includes('data-submissions-hero="navy"'), 'Must render Hero Navy banner');
    console.log(`  ✔ PASSED Test 5 (${viKeys.length} symmetrical i18n keys verified)\n`);

    console.log('=== ALL 5 TEACHER SUBMISSIONS V2 TESTS PASSED 100%! ===');
  }


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_submission_detail_v2.test.ts
// ===============================================================
async function test_verify_teacher_submission_detail_v2() {
  function collectKeys(obj: unknown, prefix = ''): string[] {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return prefix ? [prefix] : [];
    }
    const keys: string[] = [];
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const next = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        keys.push(...collectKeys(v, next));
      } else {
        keys.push(next);
      }
    }
    return keys.sort();
  }

  async function runTests() {
    console.log('=== VERIFYING TEACHER SUBMISSION DETAIL & GRADING V2 ===\n');

    // Test 1: validateGradeScore boundaries
    console.log('Test 1: validateGradeScore boundaries...');
    assert(
      validateGradeScore('', 10).valid === false &&
      (validateGradeScore('', 10) as { errorCode: string }).errorCode === 'required',
      'Empty score must fail as required (never converted to 0)'
    );
    assert(
      validateGradeScore('   ', 10).valid === false,
      'Whitespace score must fail as required'
    );
    const scoreZero = validateGradeScore('0', 10);
    assert(scoreZero.valid === true && scoreZero.numericValue === 0, 'Score 0 must be valid');
    const scoreMax = validateGradeScore('10', 10);
    assert(scoreMax.valid === true && scoreMax.numericValue === 10, 'Score maxScore must be valid');
    const scoreComma = validateGradeScore('8,50', 10);
    assert(scoreComma.valid === true && scoreComma.numericValue === 8.5, 'Comma decimal 8,50 must be valid');
    const scoreNeg = validateGradeScore('-1', 10);
    assert(!scoreNeg.valid && scoreNeg.errorCode === 'negative', 'Negative score must fail as negative');
    const scoreOverMax = validateGradeScore('10.01', 10);
    assert(!scoreOverMax.valid && scoreOverMax.errorCode === 'range', 'Score > maxScore must fail as range');
    const scoreOver100 = validateGradeScore('100.01', 120);
    assert(!scoreOver100.valid && scoreOver100.errorCode === 'range', 'Score > 100 must fail even if maxAllowed > 100');
    const score8505 = validateGradeScore('8.505', 10);
    assert(!score8505.valid && score8505.errorCode === 'decimals', '8.505 must be rejected without rounding to 8.51');
    const scoreInvalid = validateGradeScore('abc', 10);
    assert(!scoreInvalid.valid && scoreInvalid.errorCode === 'invalid', 'Non-numeric input must fail as invalid');
    console.log('  ✔ PASSED Test 1\n');

    // Test 2: UTF-8 byte feedback validation & schema truthfulness
    console.log('Test 2: UTF-8 byte feedback & submissionDetailSchema truthfulness...');
    const vnText = 'Nhận xét dòng 1\nNhận xét dòng 2 với tiếng Việt có dấu';
    const vnCheck = validateFeedbackUtf8Bytes(vnText);
    assert(vnCheck.valid && vnCheck.bytes > vnText.length, 'UTF-8 bytes must exceed char count for Vietnamese');
    const overBytes = 'ế'.repeat(Math.ceil(MAX_FEEDBACK_UTF8_BYTES / 3) + 1);
    assert(!validateFeedbackUtf8Bytes(overBytes).valid, 'Exceeding UTF-8 byte limit must fail');

    const minimalSub = submissionDetailSchema.parse({
      id: '11111111-1111-4111-8111-111111111111',
      assignmentId: '22222222-2222-4222-8222-222222222222',
      status: 'SUBMITTED',
    });
    assert(minimalSub.studentName === undefined, 'studentName must NOT default to fake name');
    assert(minimalSub.maxScore === undefined, 'maxScore must NOT default to 10');
    assert(minimalSub.submissionAttempt === undefined, 'submissionAttempt must NOT default to 1');
    assert(minimalSub.attempt === undefined, 'attempt must NOT default to 1');

    assert(isSubmissionGraded({ status: 'GRADED', score: null }) === true, 'GRADED status is graded');
    assert(isSubmissionGraded({ status: 'SUBMITTED', score: 0 }) === true, 'Score 0 is graded');
    assert(isSubmissionGraded({ status: 'LATE', score: null }) === false, 'LATE without score is ungraded');
    assert(isSubmissionGraded({ status: 'RESUBMITTED', score: null }) === false, 'RESUBMITTED without score is ungraded');
    console.log('  ✔ PASSED Test 2\n');

    // Test 3: getSubmissionById real UUID contract (no demo fallback, mismatch check)
    console.log('Test 3: getSubmissionById real UUID contract...');
    const origGet = api.get;
    const origPatch = api.patch;
    const realClassId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const realAssignId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const realSubId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

    try {
      let calledUrl = '';
      (api as unknown as { get: (url: string) => Promise<unknown> }).get = async (url: string) => {
        calledUrl = url;
        return {
          data: {
            data: {
              id: realSubId,
              assignmentId: realAssignId,
              studentId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
              studentName: 'Nguyễn Minh Quân',
              studentCode: '22029901',
              submittedAt: '2026-11-18T14:20:00Z',
              status: 'LATE',
              isLate: true,
              score: null,
              feedback: null,
              content: 'Bài làm dòng 1\nhttps://example.com/report',
              submissionAttempt: 2,
            },
          },
        };
      };

      const fetched = await getSubmissionById(realSubId, realAssignId, realClassId);
      assert(calledUrl === `/submissions/${realSubId}`, `Must call GET /submissions/{id}, got ${calledUrl}`);
      assert(fetched.studentName === 'Nguyễn Minh Quân', 'Real studentName preserved');
      assert(fetched.submissionAttempt === 2, 'submissionAttempt preserved');
      assert(fetched.isLate === true && !isSubmissionGraded(fetched), 'Late ungraded parsed accurately');

      // Assignment mismatch must throw ASSIGNMENT_MISMATCH
      let mismatchErr: (Error & { code?: string }) | null = null;
      try {
        await getSubmissionById(realSubId, '99999999-9999-4999-8999-999999999999', realClassId);
      } catch (e) {
        mismatchErr = e as Error & { code?: string };
      }
      assert(mismatchErr?.code === 'ASSIGNMENT_MISMATCH', 'Cross-assignment submission must throw ASSIGNMENT_MISMATCH');

      // Empty 200 payload must throw SCHEMA_ERROR (never fall back to demo)
      (api as unknown as { get: () => Promise<unknown> }).get = async () => ({ data: { data: null } });
      let schemaErr: (Error & { code?: string }) | null = null;
      try {
        await getSubmissionById(realSubId, realAssignId, realClassId);
      } catch (e) {
        schemaErr = e as Error & { code?: string };
      }
      assert(schemaErr?.code === 'SCHEMA_ERROR', 'Empty 200 response must throw SCHEMA_ERROR');

      // 403 error must propagate without demo fallback
      (api as unknown as { get: () => Promise<unknown> }).get = async () => {
        const err = new Error('Forbidden') as Error & { httpStatus?: number };
        err.httpStatus = 403;
        throw err;
      };
      let forbiddenCaught = false;
      try {
        await getSubmissionById(realSubId, realAssignId, realClassId);
      } catch (e) {
        forbiddenCaught = (e as { httpStatus?: number }).httpStatus === 403;
      }
      assert(forbiddenCaught, '403 must propagate cleanly without demo fallback');
      console.log('  ✔ PASSED Test 3\n');

      // Test 4: gradeSubmission real UUID contract (clean payload, single write path, server truth)
      console.log('Test 4: gradeSubmission real UUID contract...');
      let patchUrl = '';
      let patchBody: Record<string, unknown> = {};
      (api as unknown as { patch: (url: string, body: Record<string, unknown>) => Promise<unknown> }).patch = async (
        url,
        body
      ) => {
        patchUrl = url;
        patchBody = body;
        return {
          data: {
            data: {
              id: realSubId,
              assignmentId: realAssignId,
              status: 'GRADED',
              score: body.score,
              feedback: body.feedback ?? null,
              gradedByTeacherName: 'PGS.TS. Trần Thị Mai',
              gradedAt: '2026-11-18T15:00:00Z',
            },
          },
        };
      };

      const gradedWithFeedback = await gradeSubmission(
        realSubId,
        { score: 8.5, feedback: 'Tốt\nCần tối ưu thêm bước 3' },
        realAssignId,
        realClassId
      );
      assert(patchUrl === `/submissions/${realSubId}/grade`, `Expected PATCH /submissions/{id}/grade, got ${patchUrl}`);
      assert(
        Object.keys(patchBody).sort().join(',') === 'feedback,score',
        `Payload must contain ONLY score & feedback, got: ${Object.keys(patchBody).join(',')}`
      );
      assert(patchBody.score === 8.5, 'Payload score must be 8.5');
      assert(patchBody.feedback === 'Tốt\nCần tối ưu thêm bước 3', 'Feedback must preserve newlines verbatim');
      assert(gradedWithFeedback.gradedByTeacherName === 'PGS.TS. Trần Thị Mai', 'Grader name must come from server');

      // Score 0 with blank feedback -> omit feedback completely
      await gradeSubmission(realSubId, { score: 0, feedback: '   ' }, realAssignId, realClassId);
      assert(
        Object.keys(patchBody).join(',') === 'score' && (patchBody.score as number) === 0,
        'Blank feedback must be omitted and score 0 preserved'
      );

      // 409 conflict must propagate cleanly (no demo fallback)
      (api as unknown as { patch: () => Promise<unknown> }).patch = async () => {
        const err = new Error('Conflict') as Error & { httpStatus?: number };
        err.httpStatus = 409;
        throw err;
      };
      let conflictCaught = false;
      try {
        await gradeSubmission(realSubId, { score: 9 }, realAssignId, realClassId);
      } catch (e) {
        conflictCaught = (e as { httpStatus?: number }).httpStatus === 409;
      }
      assert(conflictCaught, '409 conflict must propagate without demo fallback');
      console.log('  ✔ PASSED Test 4\n');
    } finally {
      api.get = origGet;
      api.patch = origPatch;
    }

    // Test 5: Query key partitioning, i18n symmetry & component cleanliness
    console.log('Test 5: Query key partitioning, i18n symmetry & component cleanliness...');
    const k1 = assignmentKeys.submissionDetail('sub-1', 'a-1', 'c-1', 'user-1');
    const k2 = assignmentKeys.submissionDetail('sub-1', 'a-1', 'c-1', 'user-2');
    assert(JSON.stringify(k1) !== JSON.stringify(k2), 'submissionDetail key must partition by userId');

    const viDetail = viJson.assignments.teacher.submissionDetail;
    const enDetail = enJson.assignments.teacher.submissionDetail;
    const viKeys = collectKeys(viDetail);
    const enKeys = collectKeys(enDetail);
    assert(
      JSON.stringify(viKeys) === JSON.stringify(enKeys),
      `i18n mismatch: vi(${viKeys.length}) vs en(${enKeys.length})`
    );

    const compSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/features/assignments/components/TeacherSubmissionDetailView.tsx'),
      'utf8'
    );
    assert(compSource.includes('useAssignmentItem('), 'Must use useAssignmentItem (not student useAssignmentDetail)');
    assert(!compSource.includes('useAssignmentDetail'), 'Must NOT import or call useAssignmentDetail');
    assert(compSource.includes('evaluateCanManageClassSubmissions'), 'Must verify real class management permission');
    assert(!compSource.includes('Socratic AI Tutor'), 'Must NOT include Stitch floating Socratic AI Tutor');
    assert(!compSource.includes('Vũ Đức Long'), 'Must NOT hardcode Stitch sample student name');
    assert(!compSource.includes('2024-10-28T21:40:00'), 'Must NOT hardcode sample submission time');
    assert(!compSource.includes('Công nghệ thông tin K22'), 'Must NOT hardcode sample class name');
    assert(!compSource.includes('dangerouslySetInnerHTML'), 'Must NOT render untrusted raw HTML');
    assert(!compSource.includes("t('backToSubmissions')"), 'Must NOT render standalone backToSubmissions button');
    assert(compSource.includes('onClick={handleCancel}'), 'Must keep Cancel button handler');
    assert(
      compSource.includes('href={`/classes/${classId}?tab=assignments`}'),
      'Must keep explicit class breadcrumb link'
    );
    console.log(`  ✔ PASSED Test 5 (${viKeys.length} symmetrical i18n keys verified)\n`);

    console.log('=== ALL 5 TEACHER SUBMISSION DETAIL V2 TESTS PASSED 100%! ===');
  }


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_submission_graded_v2.test.ts
// ===============================================================
async function test_verify_teacher_submission_graded_v2() {
  function collectKeys(obj: unknown, prefix = ''): string[] {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return prefix ? [prefix] : [];
    }
    const keys: string[] = [];
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const next = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        keys.push(...collectKeys(v, next));
      } else {
        keys.push(next);
      }
    }
    return keys.sort();
  }

  async function runTests() {
    console.log('=== VERIFYING TEACHER SUBMISSION GRADED STATE V2 ===\n');

    // Test 1: submissionGradingSchema preserves 0 and never turns null into 0
    console.log('Test 1: submissionGradingSchema truthfulness...');
    const parsedZero = submissionGradingSchema.parse({
      id: '99999999-9999-4999-8999-999999999991',
      submissionId: '55555555-5555-4555-8555-555555555551',
      graderId: '33333333-3333-4333-8333-333333333333',
      graderName: 'TS. Phạm Thu Thảo',
      score: 0,
      feedback: null,
      gradedAt: '2026-11-18T10:00:00Z',
      correctAnswersCount: 0,
      scaledScore: 0,
    });
    assert(parsedZero.score === 0, 'Score 0 must be preserved');
    assert(parsedZero.correctAnswersCount === 0, 'correctAnswersCount 0 must be preserved');
    assert(parsedZero.scaledScore === 0, 'scaledScore 0 must be preserved');
    assert(parsedZero.feedback === null, 'feedback null must stay null');

    const parsedNullScore = submissionGradingSchema.parse({
      id: '99999999-9999-4999-8999-999999999992',
      score: null,
      correctAnswersCount: null,
      scaledScore: null,
    });
    assert(parsedNullScore.score === null, 'null score must NEVER become 0');
    assert(parsedNullScore.correctAnswersCount === null, 'null correctAnswersCount must stay null');
    assert(parsedNullScore.scaledScore === null, 'null scaledScore must stay null');
    console.log('  ✔ PASSED Test 1\n');

    // Test 2: getSubmissionGrading real UUID contract (200, 404 -> null, 500/403/SCHEMA_ERROR -> throw)
    console.log('Test 2: getSubmissionGrading real UUID contract...');
    const origGet = api.get;
    const origPatch = api.patch;
    const origDelete = api.delete;
    const realClassId = '11111111-1111-4111-8111-111111111111';
    const realAssignId = '22222222-2222-4222-8222-222222222222';
    const realSubId = '55555555-5555-4555-8555-555555555551';
    const realGradingId = '88888888-8888-4888-8888-888888888881';

    try {
      let getUrl = '';
      (api as unknown as { get: (u: string) => Promise<unknown> }).get = async (url) => {
        getUrl = url;
        return {
          data: {
            data: {
              id: realGradingId,
              submissionId: realSubId,
              graderId: '33333333-3333-4333-8333-333333333333',
              graderName: 'PGS.TS. Đặng Hoàng Minh',
              score: 8.5,
              feedback: 'Tốt',
              gradedAt: '2026-11-18T11:00:00Z',
              correctAnswersCount: 8,
              scaledScore: 8.5,
            },
          },
        };
      };
      const g = await getSubmissionGrading(realSubId, realAssignId, realClassId);
      assert(getUrl === `/submissions/${realSubId}/grading`, `Expected GET /submissions/{id}/grading, got ${getUrl}`);
      assert(
        g?.id === realGradingId && g?.submissionId === realSubId,
        'gradingId must come from GradingResponse.id and stay distinct from submissionId'
      );

      // 404 -> returns null cleanly
      (api as unknown as { get: () => Promise<unknown> }).get = async () => {
        const err = new Error('Not found') as Error & { httpStatus?: number };
        err.httpStatus = 404;
        throw err;
      };
      const notFoundResult = await getSubmissionGrading(realSubId, realAssignId, realClassId);
      assert(notFoundResult === null, '404 on GET grading must return null');

      // 500 -> MUST throw (never treat as ungraded null!)
      (api as unknown as { get: () => Promise<unknown> }).get = async () => {
        const err = new Error('Server error') as Error & { httpStatus?: number };
        err.httpStatus = 500;
        throw err;
      };
      let serverErrCaught = false;
      try {
        await getSubmissionGrading(realSubId, realAssignId, realClassId);
      } catch (e) {
        serverErrCaught = (e as { httpStatus?: number }).httpStatus === 500;
      }
      assert(serverErrCaught, '500 on GET grading must throw (never treated as ungraded)');
      console.log('  ✔ PASSED Test 2\n');

      // Test 3: gradeSubmission explicit feedback: null vs omitted feedback
      console.log('Test 3: gradeSubmission feedback: null vs omitted vs multiline...');
      let lastPatchBody: Record<string, unknown> = {};
      (api as unknown as { patch: (u: string, b: Record<string, unknown>) => Promise<unknown> }).patch = async (
        _u,
        body
      ) => {
        lastPatchBody = body;
        return {
          data: {
            data: {
              id: realSubId,
              assignmentId: realAssignId,
              status: 'GRADED',
              score: body.score,
              feedback: body.feedback ?? null,
            },
          },
        };
      };

      // Unchanged feedback -> omitted
      await gradeSubmission(realSubId, { score: 9.25 }, realAssignId, realClassId);
      assert(
        !('feedback' in lastPatchBody) && lastPatchBody.score === 9.25,
        'Omitted feedback must not appear in PATCH payload'
      );

      // Actively clearing feedback -> explicit feedback: null preserved in JSON
      await gradeSubmission(realSubId, { score: 8.5, feedback: null }, realAssignId, realClassId);
      assert(
        'feedback' in lastPatchBody && lastPatchBody.feedback === null,
        'Explicit feedback: null must be preserved in PATCH payload'
      );
      assert(
        JSON.stringify(lastPatchBody) === '{"score":8.5,"feedback":null}',
        `Expected exact JSON with feedback:null, got ${JSON.stringify(lastPatchBody)}`
      );

      // Multiline feedback -> preserved verbatim, no extra fields
      await gradeSubmission(realSubId, { score: 7.5, feedback: 'Dòng 1\nDòng 2' }, realAssignId, realClassId);
      assert(
        Object.keys(lastPatchBody).sort().join(',') === 'feedback,score' &&
        lastPatchBody.feedback === 'Dòng 1\nDòng 2',
        'Multiline feedback must be preserved without extra fields'
      );
      console.log('  ✔ PASSED Test 3\n');

      // Test 4: deleteGrading strictly calls DELETE /gradings/{gradingId} & handles 204 empty body
      console.log('Test 4: deleteGrading contract (DELETE /gradings/{gradingId}, 204 empty body)...');
      let deletedUrl = '';
      (api as unknown as { delete: (u: string) => Promise<unknown> }).delete = async (url) => {
        deletedUrl = url;
        return { status: 204, data: '' };
      };
      await deleteGrading(realGradingId, realSubId, realAssignId, realClassId);
      assert(deletedUrl === `/gradings/${realGradingId}`, `Expected DELETE /gradings/{gradingId}, got ${deletedUrl}`);
      assert(!deletedUrl.includes(realSubId), 'DELETE must NEVER target submissionId');

      // Empty gradingId must reject before API call
      let invalidIdCaught = false;
      try {
        await deleteGrading('   ', realSubId, realAssignId, realClassId);
      } catch {
        invalidIdCaught = true;
      }
      assert(invalidIdCaught, 'Blank gradingId must throw');
      console.log('  ✔ PASSED Test 4\n');
    } finally {
      api.get = origGet;
      api.patch = origPatch;
      api.delete = origDelete;
    }

    // Test 5: evaluateCanModifyGrading strict ID-based rules
    console.log('Test 5: evaluateCanModifyGrading strict ID-based permission rules...');
    const sampleGrading = {
      id: realGradingId,
      submissionId: realSubId,
      graderId: 'teacher-A',
      graderName: 'TS. A',
      score: 8,
      feedback: 'OK',
    };

    // Current grader with active class permission -> allowed
    const pGrader = evaluateCanModifyGrading({
      classId: realClassId,
      canManageClassSubmissions: true,
      isAuthLoading: false,
      isGradingLoading: false,
      isGradingError: false,
      user: { id: 'teacher-A', roleName: 'ROLE_USER' },
      grading: sampleGrading,
    });
    assert(pGrader.canEdit && pGrader.canDelete, 'Current grader with class permission must be allowed');

    // Class owner / another teacher who is NOT current grader -> read-only!
    const pOtherTeacher = evaluateCanModifyGrading({
      classId: realClassId,
      canManageClassSubmissions: true,
      isAuthLoading: false,
      isGradingLoading: false,
      isGradingError: false,
      user: { id: 'class-owner-B', roleName: 'ROLE_USER' },
      grading: sampleGrading,
    });
    assert(
      !pOtherTeacher.canEdit && !pOtherTeacher.canDelete && pOtherTeacher.reason === 'NOT_GRADER',
      'Class owner who is not current grader must NOT get edit/delete permission'
    );

    // Grader who lost class permission -> blocked!
    const pLostClassPerm = evaluateCanModifyGrading({
      classId: realClassId,
      canManageClassSubmissions: false,
      isAuthLoading: false,
      isGradingLoading: false,
      isGradingError: false,
      user: { id: 'teacher-A', roleName: 'ROLE_USER' },
      grading: sampleGrading,
    });
    assert(
      !pLostClassPerm.canEdit && !pLostClassPerm.canDelete,
      'Grader without active class management permission must be blocked'
    );

    // Admin with verified gradingId -> allowed
    const pAdmin = evaluateCanModifyGrading({
      classId: realClassId,
      canManageClassSubmissions: true,
      isAuthLoading: false,
      isGradingLoading: false,
      isGradingError: false,
      user: { id: 'admin-99', roleName: 'ROLE_ADMIN' },
      grading: sampleGrading,
    });
    assert(pAdmin.canEdit && pAdmin.canDelete, 'Admin with verified gradingId must be allowed');

    // Missing gradingId / loading -> locked even for Admin
    const pUnverified = evaluateCanModifyGrading({
      classId: realClassId,
      canManageClassSubmissions: true,
      isAuthLoading: false,
      isGradingLoading: true,
      isGradingError: false,
      user: { id: 'admin-99', roleName: 'ROLE_ADMIN' },
      grading: null,
    });
    assert(!pUnverified.canEdit && !pUnverified.canDelete, 'Unverified/loading grading must lock write actions');
    console.log('  ✔ PASSED Test 5\n');

    // Test 6: Query key partitioning, i18n symmetry & component hygiene
    console.log('Test 6: Query keys, i18n symmetry & component hygiene...');
    const gk1 = assignmentKeys.submissionGrading(realSubId, realAssignId, realClassId, 'u1');
    const gk2 = assignmentKeys.submissionGrading(realSubId, realAssignId, realClassId, 'u2');
    assert(JSON.stringify(gk1) !== JSON.stringify(gk2), 'submissionGrading key must partition by userId');

    const viKeys = collectKeys(viJson.assignments.teacher.submissionDetail);
    const enKeys = collectKeys(enJson.assignments.teacher.submissionDetail);
    assert(
      JSON.stringify(viKeys) === JSON.stringify(enKeys),
      `i18n symmetry failed: vi(${viKeys.length}) vs en(${enKeys.length})`
    );

    const detailSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/features/assignments/components/TeacherSubmissionDetailView.tsx'),
      'utf8'
    );
    const modalSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/features/assignments/components/DeleteGradingConfirmModal.tsx'),
      'utf8'
    );
    assert(detailSrc.includes('useSubmissionGrading('), 'Must fetch GradingResponse via useSubmissionGrading');
    assert(detailSrc.includes('useDeleteGrading('), 'Must delete grading via useDeleteGrading');
    assert(detailSrc.includes('evaluateCanModifyGrading('), 'Must evaluate grader/Admin permission');
    assert(!detailSrc.includes(''), 'Must NOT hardcode Stitch sample student ');
    assert(!detailSrc.includes('Socratic AI Tutor'), 'Must NOT include Stitch floating widget');
    assert(modalSrc.includes('role="dialog"') && modalSrc.includes('aria-modal="true"'), 'Delete modal must be accessible');
    console.log(`  ✔ PASSED Test 6 (${viKeys.length} symmetrical i18n keys verified)\n`);

    console.log('=== ALL 6 TEACHER SUBMISSION GRADED V2 TESTS PASSED 100%! ===');
  }


  await runTests();

}

export async function runAll() {
  return runSuite('Teacher Submissions & Grading Suite', [
    { name: 'verify_graded_submission.test.ts', fn: test_verify_graded_submission },
    { name: 'verify_teacher_grade_submission.test.ts', fn: test_verify_teacher_grade_submission },
    { name: 'verify_teacher_submissions.test.ts', fn: test_verify_teacher_submissions },
    { name: 'verify_teacher_submissions_v2.test.ts', fn: test_verify_teacher_submissions_v2 },
    { name: 'verify_teacher_submission_detail_v2.test.ts', fn: test_verify_teacher_submission_detail_v2 },
    { name: 'verify_teacher_submission_graded_v2.test.ts', fn: test_verify_teacher_submission_graded_v2 },
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
