import fs from 'fs';
import path from 'path';
import {
  isAssignmentUnsubmitted,
  isAssignmentPendingGrading,
  isAssignmentGraded,
  type EnrichedAssignment,
} from '../hooks/useClassAssignmentsWithSubmissions';
import { MOCK_ASSIGNMENTS, INITIAL_DEMO_SUBMISSIONS } from '../services/assignment.service';
import { MOCK_EXAMS } from '../services/exam.service';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

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
