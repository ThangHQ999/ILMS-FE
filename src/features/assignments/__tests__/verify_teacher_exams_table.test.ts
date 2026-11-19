import fs from 'fs';
import path from 'path';
import {
  getClassExamsPaged,
  filterAndPaginateMockExams,
  type ExamNetworkLog,
} from '../services/exam.service';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

// Mock window for Node test environment
(globalThis as unknown as { window: unknown }).window = {};

async function runExamTests() {
  console.log('=== VERIFYING TEACHER EXAMS TABLE VIEW & NETWORK INTEGRATION ===\n');

  // -------------------------------------------------------------
  // Test 1: Network call on real UUID test class
  // -------------------------------------------------------------
  console.log('Test 1: Call GET /api/v1/classes/{classId}/exams with UUID test class...');
  const testUuidClassId = '00000000-0000-4000-8000-000000000001';

  let networkErrorCaught: unknown = null;
  try {
    await getClassExamsPaged(testUuidClassId, {
      page: 0,
      size: 10,
      examType: 'MIDTERM',
      status: 'UPCOMING',
      sort: 'latest',
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
    Boolean(
      lastLog?.fullUrl.includes('examType=MIDTERM') &&
        lastLog?.fullUrl.includes('status=UPCOMING')
    ),
    'Query params must include filtered examType and status'
  );
  assert(
    lastLog?.httpStatus === 401 || lastLog?.httpStatus === 200,
    `HTTP Status should be 401 (unauthenticated) or 200, got ${lastLog?.httpStatus}`
  );
  console.log('  -> PASSED Test 1: Real Network call verified with proper query params & error handling.\n');

  // -------------------------------------------------------------
  // Test 2: Filter, Sort and Pagination on Demo Class
  // -------------------------------------------------------------
  console.log('Test 2: Verify filtering, sorting, and pagination on demo class csdl-k22-01...');
  const allExams = await getClassExamsPaged('csdl-k22-01', { page: 0, size: 10 });
  assert(allExams.totalElements === 3, `Expected 3 demo exams, got ${allExams.totalElements}`);
  assert(allExams.items.length === 3, `Expected 3 items on page 0, got ${allExams.items.length}`);
  console.log('  -> All exams count: 3');

  // Filter by Type = QUIZ
  const quizExams = await getClassExamsPaged('csdl-k22-01', {
    page: 0,
    size: 10,
    examType: 'QUIZ',
  });
  assert(quizExams.totalElements === 2, `Expected 2 QUIZ exams, got ${quizExams.totalElements}`);
  assert(
    quizExams.items.every((e) => e.examType === 'QUIZ'),
    'All returned items must have examType = QUIZ'
  );
  console.log('  -> Filter by QUIZ: 2 exams matched');

  // Filter by Type = MIDTERM
  const midtermExams = await getClassExamsPaged('csdl-k22-01', {
    page: 0,
    size: 10,
    examType: 'MIDTERM',
  });
  assert(midtermExams.totalElements === 1, `Expected 1 MIDTERM exam, got ${midtermExams.totalElements}`);
  assert(midtermExams.items[0].id === 'EXAM_001', 'EXAM_001 should be the MIDTERM exam');
  console.log('  -> Filter by MIDTERM: 1 exam matched');

  // Filter by Status = OPENING
  const openingExams = await getClassExamsPaged('csdl-k22-01', {
    page: 0,
    size: 10,
    status: 'OPENING',
  });
  assert(openingExams.totalElements === 1, `Expected 1 OPENING exam, got ${openingExams.totalElements}`);
  assert(openingExams.items[0].id === 'EXAM_002', 'EXAM_002 should be the OPENING exam');
  console.log('  -> Filter by OPENING: 1 exam matched');

  // Filter with no match
  const noMatchExams = await getClassExamsPaged('csdl-k22-01', {
    page: 0,
    size: 10,
    examType: 'COMPETITION',
  });
  assert(noMatchExams.totalElements === 0, 'Expected 0 matching exams for COMPETITION');
  assert(noMatchExams.items.length === 0, 'Items should be empty');
  console.log('  -> Filter without match: 0 exams (triggers Empty Filter State)');

  // Sorting
  const latestExams = await getClassExamsPaged('csdl-k22-01', { sort: 'latest' });
  const earliestExams = await getClassExamsPaged('csdl-k22-01', { sort: 'earliest' });
  assert(
    new Date(latestExams.items[0].startTime).getTime() >=
      new Date(latestExams.items[latestExams.items.length - 1].startTime).getTime(),
    'Latest sort should order descending by startTime'
  );
  assert(
    new Date(earliestExams.items[0].startTime).getTime() <=
      new Date(earliestExams.items[earliestExams.items.length - 1].startTime).getTime(),
    'Earliest sort should order ascending by startTime'
  );
  console.log('  -> Sorting (latest vs earliest): Verified');

  // Pagination slice (size = 1)
  const page0 = await getClassExamsPaged('csdl-k22-01', { page: 0, size: 1 });
  const page1 = await getClassExamsPaged('csdl-k22-01', { page: 1, size: 1 });
  assert(page0.items.length === 1, 'Page 0 should have 1 item');
  assert(page1.items.length === 1, 'Page 1 should have 1 item');
  assert(page0.items[0].id !== page1.items[0].id, 'Items across pages should differ');
  assert(page0.totalPages === 3, 'Total pages for 3 items with size 1 should be 3');
  assert(page0.last === false, 'Page 0 should not be last');
  assert(page1.last === false, 'Page 1 should not be last');
  console.log('  -> Pagination slicing: Verified');

  console.log('  -> PASSED Test 2: Filter, sort and pagination verified.\n');

  // -------------------------------------------------------------
  // Test 3: Inspect TeacherExamsTableView V2 Design & API Integration
  // -------------------------------------------------------------
  console.log('Test 3: Inspect TeacherExamsTableView V2 component...');
  const viewPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherExamsTableView.tsx'
  );
  const viewContent = fs.readFileSync(viewPath, 'utf8');

  // Bố cục 2 cột thống nhất (minmax(0,1fr) + 320px) qua AssessmentListPrimitives
  const primitivesPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/AssessmentListPrimitives.tsx'
  );
  const primitivesContent = fs.readFileSync(primitivesPath, 'utf8');
  assert(
    viewContent.includes('AssessmentTwoColumnLayout') &&
      primitivesContent.includes('lg:grid-cols-[minmax(0,1fr)_260px]'),
    'Main layout must use unified 2-column desktop grid (minmax(0,1fr) + 260px aside)'
  );
  assert(viewContent.includes("t('pageTitle')"), 'Must render i18n title');
  assert(viewContent.includes("t('createExamBtn')"), 'Must have i18n "Tạo bài thi" button');
  assert(viewContent.includes('id="totalExamsBadge"'), 'Must have total exams count in footer pagination');

  // Bộ lọc: Chip Loại & Trạng thái + Sắp xếp thống nhất
  assert(
    viewContent.includes('filter-type-btn') && viewContent.includes('filter-status-btn'),
    'Must have filter buttons for Type and Status'
  );
  assert(
    viewContent.includes('id="selectTeacherExamSort"'),
    'Must have sort dropdown in unified toolbar'
  );
  assert(
    !viewContent.includes("'COMPETITION'") && !viewContent.includes("'OPENING'"),
    'Must normalize legacy COMPETITION/OPENING to CONTEST/OPEN'
  );

  // Thẻ nổi bật Navy + thẻ trắng + 2 badge độc lập + 4 chỉ số + lịch Mở/Đóng
  assert(
    viewContent.includes('ASSESSMENT_UI.featuredCard') &&
      viewContent.includes('ASSESSMENT_UI.surfaceCard') &&
      primitivesContent.includes('from-[#0D1C32]') &&
      primitivesContent.includes('border-2 border-[#E2E8F0]'),
    'Must render Featured Navy Card and 2px-bordered White Cards via shared tokens'
  );
  assert(
    (viewContent.includes('dataStatus="published"') ||
      viewContent.includes('data-publish-status="published"')) &&
      (viewContent.includes('dataStatus="unpublished"') ||
        viewContent.includes('data-publish-status="unpublished"')) &&
      primitivesContent.includes('data-publish-status={dataStatus}'),
    'Must render independent publish status badge'
  );
  assert(
    viewContent.includes('formatExamLocalDateTime') && viewContent.includes('formatExamLocalDate'),
    'Must format schedule and created/updated dates using LocalDateTime helpers'
  );

  // Async states (strict: no mock fallback button)
  assert(viewContent.includes('animate-pulse'), 'Must have Loading skeleton state');
  assert(viewContent.includes("t('errorGenericTitle')"), 'Must have Error state');
  assert(viewContent.includes("t('retryBtn')"), 'Error state must have Retry button');
  assert(!viewContent.includes('Xem dữ liệu mẫu'), 'Must NOT have fallback demo mode button');
  assert(viewContent.includes('id="emptyFilterState"'), 'Must have Empty state');
  assert(viewContent.includes('id="btnResetFilters"'), 'Empty filter state must have Reset filters button');

  // Thao tác thật: Xem chi tiết + Menu ... truy cập + Modal xác nhận
  assert(viewContent.includes("t('viewDetailBtn')"), 'Must have "Xem chi tiết" button');
  assert(viewContent.includes('more_horiz'), 'Must have more_horiz action menu icon');
  assert(
    viewContent.includes('bottom-full mb-1.5'),
    'Action menu must open upwards on bottom cards to prevent overflow cutoff'
  );
  assert(
    viewContent.includes('usePublishExam') &&
      viewContent.includes('useUnpublishExam') &&
      viewContent.includes('useDeleteExam'),
    'Must wire real publish/unpublish/delete mutations'
  );
  assert(!viewContent.includes('Đang phát triển'), 'Must NOT contain placeholder actions');

  // Panel Quy chế công bố bài thi & Phân trang
  assert(viewContent.includes("t('policyPanelTitle')"), 'Must render policy aside panel');
  assert(
    viewContent.includes('id="btnPrevPage"') && viewContent.includes('id="btnNextPage"'),
    'Must have pagination prev/next controls'
  );

  console.log('  -> PASSED Test 3: TeacherExamsTableView V2 component matches specifications.\n');

  // -------------------------------------------------------------
  // Test 4: Verify integration in TeacherAssignmentsTableView
  // -------------------------------------------------------------
  console.log('Test 4: Inspect tab integration in TeacherAssignmentsTableView.tsx...');
  const teacherTablePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherAssignmentsTableView.tsx'
  );
  const teacherTableContent = fs.readFileSync(teacherTablePath, 'utf8');

  assert(
    teacherTableContent.includes("import { TeacherExamsTableView } from './TeacherExamsTableView';"),
    'TeacherAssignmentsTableView must import TeacherExamsTableView'
  );
  assert(
    teacherTableContent.includes("activeTypeTab === 'assignments' ? ("),
    'Must conditionally render assignments vs exams based on activeTypeTab'
  );
  assert(
    teacherTableContent.includes('<TeacherExamsTableView'),
    'Must render TeacherExamsTableView when activeTypeTab is exams'
  );
  assert(
    teacherTableContent.includes('toggleAssignments') && teacherTableContent.includes('toggleExams'),
    'Must maintain sub-tab toggle buttons [Bài tập] vs [Bài thi]'
  );

  console.log('  -> PASSED Test 4: Tab switching between Assignments and Exams verified.\n');

  console.log('================================================================');
  console.log('ALL TESTS PASSED: TEACHER EXAMS TABLE VIEW SUCCESSFULLY VERIFIED!');
  console.log('================================================================');
}

runExamTests();
