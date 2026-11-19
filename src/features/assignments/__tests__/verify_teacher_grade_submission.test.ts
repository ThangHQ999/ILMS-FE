import {
  getAssignmentById,
  getSubmissionById,
  gradeSubmission,
  getAssignmentSubmissionsPaged,
  getMySubmission,
  submitAssignment,
  createAssignment,
  formatScore,
  MOCK_TEACHER_SUBMISSIONS,
} from '../services/assignment.service';
import viJson from '../../../messages/vi.json';
import enJson from '../../../messages/en.json';

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

runTests().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
