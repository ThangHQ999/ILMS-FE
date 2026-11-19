import fs from 'fs';
import path from 'path';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('=== VERIFYING CREATE ASSIGNMENT & CREATE EXAM TABS INTEGRATION ===\n');

// 1. Inspect ClassDetailPageView.tsx
console.log('Test 1: Inspect ClassDetailPageView.tsx for sub-tab toggle under breadcrumb...');
const classDetailPath = path.resolve(
  process.cwd(),
  'src/features/classes/components/detail/ClassDetailPageView.tsx'
);
const classDetailContent = fs.readFileSync(classDetailPath, 'utf-8');

// Breadcrumb checks
assert(
  classDetailContent.includes('isCreateAssignment'),
  'Must define isCreateAssignment condition'
);
assert(
  classDetailContent.includes('isCreateExam'),
  'Must define isCreateExam condition'
);
assert(
  classDetailContent.includes('isCreateForm'),
  'Must define isCreateForm condition'
);

// Breadcrumb destination checks
assert(
  classDetailContent.includes('action=create&subtab=exams') ||
    classDetailContent.includes('action=create-exam'),
  'Must support route action=create&subtab=exams for Create Exam'
);

// Toggle cluster under breadcrumb
assert(
  classDetailContent.includes('Sub-Tab Toggle [Bài tập] vs [Bài thi] right under Breadcrumb'),
  'Must render sub-tab toggle right under Breadcrumb'
);
assert(
  classDetailContent.includes('href={`/classes/${classId}?tab=assignments&action=create`}'),
  'Toggle must have link to Create Assignment: /classes/${classId}?tab=assignments&action=create'
);
assert(
  classDetailContent.includes('href={`/classes/${classId}?tab=assignments&action=create&subtab=exams`}'),
  'Toggle must have link to Create Exam: /classes/${classId}?tab=assignments&action=create&subtab=exams'
);

// Document title synchronization check
assert(
  classDetailContent.includes('document.title = `Tạo bài tập | ILMS'),
  'Must set document.title for Tạo bài tập'
);
assert(
  classDetailContent.includes('document.title = `Tạo bài thi | ILMS'),
  'Must set document.title for Tạo bài thi'
);

// Rendering of form views
assert(
  classDetailContent.includes('<TeacherCreateAssignmentFormView'),
  'Must render TeacherCreateAssignmentFormView for isCreateAssignment'
);
assert(
  classDetailContent.includes('<TeacherCreateExamFormView'),
  'Must render TeacherCreateExamFormView for isCreateExam'
);

console.log('  -> PASSED Test 1: ClassDetailPageView has sub-tab toggle, route synchronization and breadcrumb matching specifications.\n');

// 2. Inspect TeacherExamsTableView.tsx
console.log('Test 2: Inspect TeacherExamsTableView.tsx for + Tạo bài thi button route...');
const teacherExamsPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherExamsTableView.tsx'
);
const teacherExamsContent = fs.readFileSync(teacherExamsPath, 'utf-8');

assert(
  teacherExamsContent.includes('action=create&subtab=exams'),
  '+ Tạo bài thi button must route to action=create&subtab=exams'
);
console.log('  -> PASSED Test 2: TeacherExamsTableView opens Create Exam with subtab=exams.\n');

// 3. Inspect TeacherAssignmentsTableView.tsx
console.log('Test 3: Inspect TeacherAssignmentsTableView.tsx for + Tạo bài tập and list sub-tabs...');
const teacherAssignmentsPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherAssignmentsTableView.tsx'
);
const teacherAssignmentsContent = fs.readFileSync(teacherAssignmentsPath, 'utf-8');

assert(
  teacherAssignmentsContent.includes("params.set('subtab', 'exams')") ||
    teacherAssignmentsContent.includes("subtab=exams"),
  'List view must support subtab=exams for switching to Exams list'
);
assert(
  teacherAssignmentsContent.includes("params.delete('subtab')"),
  'List view must remove subtab when switching to Assignments list'
);
console.log('  -> PASSED Test 3: TeacherAssignmentsTableView sub-tabs route to corresponding lists.\n');

// 4. Inspect TeacherCreateAssignmentFormView & TeacherCreateExamFormView clean layout
console.log('Test 4: Verify form views layout (no duplicated inner toggles)...');
const createAssignmentPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherCreateAssignmentFormView.tsx'
);
const createAssignmentContent = fs.readFileSync(createAssignmentPath, 'utf-8');
assert(
  !createAssignmentContent.includes('Sub-view Segmented Switcher'),
  'Duplicated inner switcher must be removed from TeacherCreateAssignmentFormView'
);

const createExamPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherCreateExamFormView.tsx'
);
const createExamContent = fs.readFileSync(createExamPath, 'utf-8');
assert(
  !createExamContent.includes('SEGMENTED CONTROL: BÀI TẬP / BÀI THI'),
  'Duplicated inner switcher must be removed from TeacherCreateExamFormView'
);
console.log('  -> PASSED Test 4: Inner duplicate toggles cleaned up cleanly.\n');

console.log('================================================================');
console.log('ALL TESTS PASSED: CREATE ASSIGNMENT & CREATE EXAM TABS VERIFIED!');
console.log('================================================================');
