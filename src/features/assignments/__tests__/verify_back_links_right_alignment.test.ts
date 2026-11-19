import fs from 'fs';
import path from 'path';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('=== VERIFYING REMOVAL OF BACK LINKS ACROSS ASSIGNMENT FLOW ===\n');

// 1. Breadcrumbs at ClassDetailPageView & StudentAssignmentsPageView
console.log('Checking breadcrumb in ClassDetailPageView.tsx & StudentAssignmentsPageView.tsx...');
const classDetailPagePath = path.resolve(
  process.cwd(),
  'src/features/classes/components/detail/ClassDetailPageView.tsx'
);
assert(fs.existsSync(classDetailPagePath), 'ClassDetailPageView.tsx must exist');
const classDetailContent = fs.readFileSync(classDetailPagePath, 'utf8');

assert(
  !classDetailContent.includes("{t('tabAssignments')}"),
  'ClassDetailPageView breadcrumb MUST NOT contain tabAssignments at the end'
);
assert(
  classDetailContent.includes("{classInfo?.title || 'Đang tải thông tin lớp...'}"),
  'ClassDetailPageView breadcrumb MUST end at class title'
);

const studentAssignmentsPagePath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/StudentAssignmentsPageView.tsx'
);
assert(fs.existsSync(studentAssignmentsPagePath), 'StudentAssignmentsPageView.tsx must exist');
const studentAssignmentsContent = fs.readFileSync(studentAssignmentsPagePath, 'utf8');

assert(
  !studentAssignmentsContent.includes("{tClass('tabAssignments')}"),
  'StudentAssignmentsPageView breadcrumb MUST NOT contain tabAssignments at the end'
);
assert(
  studentAssignmentsContent.includes('{classTitle}'),
  'StudentAssignmentsPageView breadcrumb MUST end at class title'
);
console.log('  -> PASSED: Breadcrumbs end at class title without trailing "/ Bài tập & Đánh giá".\n');

// 2. StudentAssignmentDetailPageView.tsx - Back Link Removed from Unified Card & Error state
console.log('Checking StudentAssignmentDetailPageView.tsx (Gỡ bỏ hoàn toàn nút Quay lại danh sách bài tập)...');
const studentDetailPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/StudentAssignmentDetailPageView.tsx'
);
assert(fs.existsSync(studentDetailPath), 'StudentAssignmentDetailPageView.tsx must exist');
const studentDetailContent = fs.readFileSync(studentDetailPath, 'utf8');

assert(
  !studentDetailContent.includes("tDetail('backToAssignmentList')"),
  'StudentAssignmentDetailPageView MUST NOT render backToAssignmentList'
);
assert(
  !studentDetailContent.includes('Quay lại danh sách bài tập'),
  'StudentAssignmentDetailPageView MUST NOT render text "Quay lại danh sách bài tập"'
);
assert(
  studentDetailContent.includes('grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch'),
  'StudentAssignmentDetailPageView must have 2 bottom clusters full-width and stacked on mobile'
);
assert(
  studentDetailContent.includes("tDetail('rulesAndPoliciesTitle')"),
  'StudentAssignmentDetailPageView left cluster must contain submission rules and policies'
);
assert(
  studentDetailContent.includes("tDetail('submitNowBtn')"),
  'StudentAssignmentDetailPageView right cluster must contain Submit Now button for unsubmitted'
);
assert(
  studentDetailContent.includes('btn-cancel-submission'),
  'StudentAssignmentDetailPageView right cluster must contain Cancel button for pending submission'
);
assert(
  studentDetailContent.includes("tDetail('gradingResultTitle')"),
  'StudentAssignmentDetailPageView right cluster must contain grading result for graded submission'
);
console.log('  -> PASSED: StudentAssignmentDetailPageView back link removed, unified card preserved.\n');

// 3. StudentAssignmentSubmissionPageView.tsx - Quay lại chi tiết bài tập removed
console.log('Checking StudentAssignmentSubmissionPageView.tsx (Gỡ bỏ Quay lại chi tiết bài tập)...');
const studentSubmitPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/StudentAssignmentSubmissionPageView.tsx'
);
assert(fs.existsSync(studentSubmitPath), 'StudentAssignmentSubmissionPageView.tsx must exist');
const studentSubmitContent = fs.readFileSync(studentSubmitPath, 'utf8');

assert(
  !studentSubmitContent.includes('Quay lại chi tiết bài tập'),
  'StudentAssignmentSubmissionPageView MUST NOT render "Quay lại chi tiết bài tập"'
);
assert(
  !studentSubmitContent.includes('<div className="flex w-full justify-end">'),
  'StudentAssignmentSubmissionPageView wrapper row for back link must be removed'
);
assert(
  studentSubmitContent.includes('router.push(`/classes/${classId}/assignments/${assignmentId}`)'),
  'StudentAssignmentSubmissionPageView Cancel button must remain intact'
);
console.log('  -> PASSED: StudentAssignmentSubmissionPageView back link removed, Cancel button preserved.\n');

// 4. TeacherAssignmentSubmissionsPageView.tsx - Quay lại danh sách bài tập removed
console.log('Checking TeacherAssignmentSubmissionsPageView.tsx (Gỡ bỏ Quay lại danh sách bài tập)...');
const teacherSubmissionsPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherAssignmentSubmissionsPageView.tsx'
);
assert(fs.existsSync(teacherSubmissionsPath), 'TeacherAssignmentSubmissionsPageView.tsx must exist');
const teacherSubmissionsContent = fs.readFileSync(teacherSubmissionsPath, 'utf8');

assert(
  !teacherSubmissionsContent.includes("t('backToList')"),
  'TeacherAssignmentSubmissionsPageView MUST NOT render backToList'
);
assert(
  !teacherSubmissionsContent.includes('<div className="flex w-full justify-end">'),
  'TeacherAssignmentSubmissionsPageView wrapper row for back link must be removed'
);
console.log('  -> PASSED: TeacherAssignmentSubmissionsPageView back link removed.\n');

// 5. TeacherSubmissionDetailView.tsx - Quay lại danh sách bài nộp removed
console.log('Checking TeacherSubmissionDetailView.tsx (Gỡ bỏ Quay lại danh sách bài nộp)...');
const teacherDetailPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherSubmissionDetailView.tsx'
);
assert(fs.existsSync(teacherDetailPath), 'TeacherSubmissionDetailView.tsx must exist');
const teacherDetailContent = fs.readFileSync(teacherDetailPath, 'utf8');

assert(
  !teacherDetailContent.includes("t('backToSubmissions')"),
  'TeacherSubmissionDetailView MUST NOT render backToSubmissions'
);
assert(
  teacherDetailContent.includes('onClick={handleCancel}'),
  'TeacherSubmissionDetailView Cancel button must remain intact'
);
console.log('  -> PASSED: TeacherSubmissionDetailView back link removed, Cancel button preserved.\n');

// 6. TeacherCreateAssignmentFormView.tsx - Quay lại danh sách bài tập removed
console.log('Checking TeacherCreateAssignmentFormView.tsx (Gỡ bỏ Quay lại danh sách bài tập)...');
const teacherCreatePath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherCreateAssignmentFormView.tsx'
);
assert(fs.existsSync(teacherCreatePath), 'TeacherCreateAssignmentFormView.tsx must exist');
const teacherCreateContent = fs.readFileSync(teacherCreatePath, 'utf8');

assert(
  !teacherCreateContent.includes("t('backToList')"),
  'TeacherCreateAssignmentFormView MUST NOT render backToList'
);
assert(
  teacherCreateContent.includes('onClick={onCancel}'),
  'TeacherCreateAssignmentFormView Cancel button must remain intact'
);
console.log('  -> PASSED: TeacherCreateAssignmentFormView back button removed, Cancel button preserved.\n');

// 7. Breadcrumb Class Link to `/classes/${classId}?tab=assignments`
console.log('Checking breadcrumb class title links to `/classes/${classId}?tab=assignments` across all subpages...');
assert(
  studentDetailContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'StudentAssignmentDetailPageView breadcrumb class title must link to `/classes/${classId}?tab=assignments`'
);
assert(
  studentSubmitContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'StudentAssignmentSubmissionPageView breadcrumb class title must link to `/classes/${classId}?tab=assignments`'
);
assert(
  teacherSubmissionsContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'TeacherAssignmentSubmissionsPageView breadcrumb class title must link to `/classes/${classId}?tab=assignments`'
);
assert(
  teacherDetailContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'TeacherSubmissionDetailView breadcrumb class title must link to `/classes/${classId}?tab=assignments`'
);
assert(
  studentAssignmentsContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'StudentAssignmentsPageView breadcrumb class title must link to `/classes/${classId}?tab=assignments`'
);
assert(
  classDetailContent.includes('href={`/classes/${classId}?tab=assignments`}'),
  'ClassDetailPageView breadcrumb when action=create must link class title to `/classes/${classId}?tab=assignments`'
);
console.log('  -> PASSED: All breadcrumb class title links point to `/classes/${classId}?tab=assignments`.\n');

console.log('================================================================');
console.log('ALL VERIFICATIONS PASSED: ALL BACK LINKS REMOVED ACROSS 9 SCREENS!');
console.log('================================================================\n');
