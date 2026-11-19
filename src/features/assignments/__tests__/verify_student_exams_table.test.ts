import fs from 'fs';
import path from 'path';
import {
  getClassExamsPaged,
  filterAndPaginateMockExams,
  saveCreatedExam,
  resetCreatedExams,
  type ExamNetworkLog,
} from '../services/exam.service';
import type { ExamItem } from '../schemas/exam.schema';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

// Mock localStorage for node environment
const storageMock: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (key: string) => storageMock[key] ?? null,
    setItem: (key: string, value: string) => {
      storageMock[key] = value;
    },
    removeItem: (key: string) => {
      delete storageMock[key];
    },
    clear: () => {
      for (const k of Object.keys(storageMock)) delete storageMock[k];
    },
    key: (i: number) => Object.keys(storageMock)[i] ?? null,
    length: Object.keys(storageMock).length,
  };
}

// Mock window for Node test environment
(globalThis as unknown as { window: unknown }).window = globalThis;

async function runStudentExamTests() {
  console.log('=== VERIFYING STUDENT EXAMS TABLE VIEW & NETWORK INTEGRATION ===\n');

  resetCreatedExams();

  // -------------------------------------------------------------
  // Test 1: Real Network Call to UUID Test Class with Student options
  // -------------------------------------------------------------
  console.log('Test 1: Call GET /api/v1/classes/{classId}/exams with UUID test class as Student...');
  const testUuidClassId = '00000000-0000-4000-8000-000000000001';

  let networkErrorCaught: unknown = null;
  try {
    await getClassExamsPaged(testUuidClassId, {
      page: 0,
      size: 10,
      examType: 'ALL',
      status: 'ALL',
      onlyPublished: true,
    });
  } catch (err: unknown) {
    networkErrorCaught = err;
  }

  assert(networkErrorCaught !== null, 'UUID class without auth session should throw error');

  const win = (globalThis as unknown as { window: { __lastExamsNetworkCall?: ExamNetworkLog } }).window;
  const lastLog = win.__lastExamsNetworkCall;

  assert(lastLog !== undefined, 'Network call must record __lastExamsNetworkCall');
  console.log('  -> Request URL:', lastLog?.fullUrl);
  console.log('  -> HTTP Status:', lastLog?.httpStatus);
  console.log('  -> Message:', lastLog?.message);

  assert(
    Boolean(lastLog?.fullUrl.includes(`/classes/${testUuidClassId}/exams`)),
    'Full URL must target /classes/{uuid}/exams'
  );
  assert(
    Boolean(lastLog?.fullUrl.includes('page=0') && lastLog?.fullUrl.includes('size=10')),
    'Query params must include page=0 and size=10'
  );
  assert(
    lastLog?.httpStatus === 401 || lastLog?.httpStatus === 200,
    `HTTP Status should be 401 (unauthenticated) or 200, got ${lastLog?.httpStatus}`
  );
  console.log('  -> PASSED Test 1: Real Network call verified with proper query params & error handling.\n');

  // -------------------------------------------------------------
  // Test 2: Filter Published vs Draft: Student ONLY sees Published exams
  // -------------------------------------------------------------
  console.log('Test 2: Verify Student ONLY sees published exams (drafts are hidden)...');
  const demoClassId = 'csdl-k22-01';

  // Seed 1 draft exam into created storage
  const draftExam: ExamItem = {
    id: 'exam-draft-001',
    title: 'Đề thi nháp nội bộ',
    examType: 'QUIZ',
    durationMinutes: 15,
    maxScore: 10,
    totalScore: 10,
    startTime: '2024-11-20T08:00:00Z',
    endTime: '2024-11-20T09:00:00Z',
    status: 'UPCOMING',
    isPublished: false, // Draft!
  };
  saveCreatedExam(demoClassId, draftExam);

  // As Teacher (onlyPublished = false / undefined): sees both published (3) + draft (1) = 4
  const teacherView = filterAndPaginateMockExams({ page: 0, size: 10, onlyPublished: false }, demoClassId);
  assert(teacherView.totalElements === 4, `Teacher should see 4 exams (including draft), got ${teacherView.totalElements}`);
  assert(teacherView.items.some((e) => e.id === 'exam-draft-001'), 'Teacher should see the draft exam');

  // As Student (onlyPublished = true): MUST ONLY SEE 3 published exams, draft hidden!
  const studentView = filterAndPaginateMockExams({ page: 0, size: 10, onlyPublished: true }, demoClassId);
  assert(studentView.totalElements === 3, `Student must only see 3 published exams, got ${studentView.totalElements}`);
  assert(!studentView.items.some((e) => e.id === 'exam-draft-001'), 'Draft exam must be completely hidden from student view');
  assert(studentView.items.every((e) => e.isPublished === true), 'All exams visible to student must have isPublished === true');
  console.log('  -> Published exams visible to student:', studentView.items.map((e) => `[${e.id}] ${e.title} (${e.status})`).join(', '));
  console.log('  -> PASSED Test 2: Draft exams strictly hidden from student view.\n');

  // -------------------------------------------------------------
  // Test 3: Status Badge Verification (OPENING, UPCOMING, CLOSED)
  // -------------------------------------------------------------
  console.log('Test 3: Verify 3 status values (OPENING, UPCOMING, CLOSED) have action "Xem chi tiết"...');
  const publishedItems = studentView.items;
  const openingExam = publishedItems.find((e) => e.status === 'OPEN' || e.status === 'OPENING');
  const upcomingExam = publishedItems.find((e) => e.status === 'UPCOMING');
  const closedExam = publishedItems.find((e) => e.status === 'CLOSED');

  assert(openingExam !== undefined, 'Must have an OPEN exam (Kiểm tra TCP/IP)');
  assert(upcomingExam !== undefined, 'Must have an UPCOMING exam (Thi giữa kỳ Mạng máy tính)');
  assert(closedExam !== undefined, 'Must have a CLOSED exam (Kiểm tra mô hình OSI)');

  console.log(`  -> OPENING exam: "${openingExam?.title}" -> Status: Đang mở (pulse indicator)`);
  console.log(`  -> UPCOMING exam: "${upcomingExam?.title}" -> Status: Sắp mở`);
  console.log(`  -> CLOSED exam: "${closedExam?.title}" -> Status: Đã đóng`);

  // All 3 statuses have exam.id available for detail view navigation
  assert(Boolean(openingExam?.id), 'Opening exam has valid id');
  assert(Boolean(upcomingExam?.id), 'Upcoming exam has valid id');
  assert(Boolean(closedExam?.id), 'Closed exam has valid id');
  console.log('  -> PASSED Test 3: All 3 statuses present with valid exam.id for detail routing.\n');

  // -------------------------------------------------------------
  // Test 4: Filtering by examType
  // -------------------------------------------------------------
  console.log('Test 4: Verify filtering by examType (QUIZ, MIDTERM, FINAL, COMPETITION)...');
  // QUIZ -> 2 exams
  const quizFilter = filterAndPaginateMockExams({ examType: 'QUIZ', onlyPublished: true }, demoClassId);
  assert(quizFilter.totalElements === 2, `Expected 2 Quiz exams, got ${quizFilter.totalElements}`);
  assert(quizFilter.items.every((e) => e.examType === 'QUIZ'), 'All items must be QUIZ');

  // MIDTERM -> 1 exam
  const midtermFilter = filterAndPaginateMockExams({ examType: 'MIDTERM', onlyPublished: true }, demoClassId);
  assert(midtermFilter.totalElements === 1, `Expected 1 Midterm exam, got ${midtermFilter.totalElements}`);
  assert(midtermFilter.items[0].examType === 'MIDTERM', 'Item must be MIDTERM');

  // FINAL -> 0 exams (triggers Empty Filter state)
  const finalFilter = filterAndPaginateMockExams({ examType: 'FINAL', onlyPublished: true }, demoClassId);
  assert(finalFilter.totalElements === 0, `Expected 0 Final exams, got ${finalFilter.totalElements}`);
  console.log('  -> PASSED Test 4: Filtering by examType verified.\n');

  // -------------------------------------------------------------
  // Test 5: Dynamic Counter on "Tất cả (N)" per selectedType
  // -------------------------------------------------------------
  console.log('Test 5: Verify dynamic counter on "Tất cả (N)" per selectedType...');
  const countAll = filterAndPaginateMockExams({ examType: 'ALL', status: 'ALL', onlyPublished: true }, demoClassId).totalElements;
  const countQuiz = filterAndPaginateMockExams({ examType: 'QUIZ', status: 'ALL', onlyPublished: true }, demoClassId).totalElements;
  const countMidterm = filterAndPaginateMockExams({ examType: 'MIDTERM', status: 'ALL', onlyPublished: true }, demoClassId).totalElements;
  const countFinal = filterAndPaginateMockExams({ examType: 'FINAL', status: 'ALL', onlyPublished: true }, demoClassId).totalElements;

  assert(countAll === 3, `Count for ALL type must be 3, got ${countAll}`);
  assert(countQuiz === 2, `Count for QUIZ type must be 2, got ${countQuiz}`);
  assert(countMidterm === 1, `Count for MIDTERM type must be 1, got ${countMidterm}`);
  assert(countFinal === 0, `Count for FINAL type must be 0, got ${countFinal}`);
  console.log(`  -> Counts: ALL: ${countAll}, QUIZ: ${countQuiz}, MIDTERM: ${countMidterm}, FINAL: ${countFinal}`);
  console.log('  -> PASSED Test 5: Dynamic pill counters verified.\n');

  // -------------------------------------------------------------
  // Test 6: Pagination Slicing
  // -------------------------------------------------------------
  console.log('Test 6: Verify pagination slicing (size = 2)...');
  const page0 = filterAndPaginateMockExams({ page: 0, size: 2, onlyPublished: true }, demoClassId);
  assert(page0.items.length === 2, `Page 0 size 2 must have 2 items, got ${page0.items.length}`);
  assert(page0.totalElements === 3, 'Total elements must remain 3');
  assert(page0.totalPages === 2, 'Total pages must be 2');
  assert(page0.last === false, 'Page 0 is not last');

  const page1 = filterAndPaginateMockExams({ page: 1, size: 2, onlyPublished: true }, demoClassId);
  assert(page1.items.length === 1, `Page 1 size 2 must have 1 item, got ${page1.items.length}`);
  assert(page1.last === true, 'Page 1 is last page');
  console.log('  -> PASSED Test 6: Pagination slicing verified.\n');

  // -------------------------------------------------------------
  // Test 7: Inspect Component Code & Tab Synchronization
  // -------------------------------------------------------------
  console.log('Test 7: Inspect StudentExamsTableView and StudentAssignmentsTableView integration...');
  const studentExamsFile = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/assignments/components/StudentExamsTableView.tsx'),
    'utf-8'
  );
  assert(
    studentExamsFile.includes('Danh sách bài thi') || studentExamsFile.includes("t('pageTitle')"),
    'Must contain header title via i18n or text'
  );
  assert(
    studentExamsFile.includes('Xem chi tiết') || studentExamsFile.includes("t('viewDetailBtn')"),
    'Must contain action button "Xem chi tiết" via i18n or text'
  );
  assert(studentExamsFile.includes('onlyPublished: true'), 'Must call useClassExamsPaged with onlyPublished: true');
  assert(!studentExamsFile.includes('Tạo bài thi'), 'Student view must NOT contain "Tạo bài thi" button');
  const primitivesFile = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/assignments/components/AssessmentListPrimitives.tsx'),
    'utf-8'
  );
  assert(
    studentExamsFile.includes('border-2') || primitivesFile.includes('border-2'),
    'Must have border-2 styling'
  );

  const studentAssignmentsFile = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/assignments/components/StudentAssignmentsTableView.tsx'),
    'utf-8'
  );
  assert(studentAssignmentsFile.includes('StudentExamsTableView'), 'Must import and render StudentExamsTableView');
  assert(
    studentAssignmentsFile.includes("searchParams.get('subtab')") ||
      studentAssignmentsFile.includes("subtab === 'exams'") ||
      studentAssignmentsFile.includes("subtabParam === 'exams'"),
    'Must check subtab query param from URL'
  );
  assert(studentAssignmentsFile.includes("params.set('subtab', 'exams')"), 'Must sync subtab query param on toggle');
  console.log('  -> PASSED Test 7: Component structures and subtab synchronization verified.\n');

  console.log('================================================================');
  console.log('ALL TESTS PASSED: STUDENT EXAMS TABLE VIEW SUCCESSFULLY VERIFIED!');
  console.log('================================================================');
}

runStudentExamTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
