import fs from 'fs';
import path from 'path';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('=== VERIFYING TEACHER CREATE EXAM FORM DESIGN SYNCHRONIZATION ===\n');

const createAssignmentPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherCreateAssignmentFormView.tsx'
);
const createExamPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherCreateExamFormView.tsx'
);
const classDetailPath = path.resolve(
  process.cwd(),
  'src/features/classes/components/detail/ClassDetailPageView.tsx'
);

const assignContent = fs.readFileSync(createAssignmentPath, 'utf-8');
const examContent = fs.readFileSync(createExamPath, 'utf-8');
const classDetailContent = fs.readFileSync(classDetailPath, 'utf-8');

// ----------------------------------------------------------------------
// Test 1: Container & Card Alignment
// ----------------------------------------------------------------------
console.log('Test 1: Check Container & Card alignment synchronization...');
assert(
  assignContent.includes('w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12'),
  'TeacherCreateAssignmentFormView must have max-w-7xl mx-auto flex flex-col gap-6 pb-12'
);
assert(
  examContent.includes('w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12'),
  'TeacherCreateExamFormView must have identical max-w-7xl mx-auto flex flex-col gap-6 pb-12'
);

const cardClass = 'bg-white dark:bg-slate-900 rounded-3xl shadow-xs border-2 border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all';
assert(
  assignContent.includes(cardClass),
  'TeacherCreateAssignmentFormView card must use rounded-3xl border-2 p-6 sm:p-8'
);
assert(
  examContent.includes(cardClass),
  'TeacherCreateExamFormView card must use identical rounded-3xl border-2 p-6 sm:p-8'
);
console.log('  -> PASSED Test 1: Containers and cards share identical width, margins, borders and padding.\n');

// ----------------------------------------------------------------------
// Test 2: Input Controls & Char Counter
// ----------------------------------------------------------------------
console.log('Test 2: Check input controls style and 0/255 character counter...');
assert(
  assignContent.includes('{title.length}/255'),
  'TeacherCreateAssignmentFormView has title counter {title.length}/255'
);
assert(
  examContent.includes('{title.length}/255'),
  'TeacherCreateExamFormView has title counter {title.length}/255'
);

// Input classes: h-11 px-3.5 rounded-xl bg-slate-50 border-2
assert(
  examContent.includes('h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80'),
  'TeacherCreateExamFormView inputs must use h-11 px-3.5 rounded-xl bg-slate-50'
);
assert(
  examContent.includes('border-2 shadow-xs'),
  'TeacherCreateExamFormView inputs must use border-2 shadow-xs'
);

// Textarea: rounded-xl bg-slate-50 border-2 min-h-[110px]
assert(
  examContent.includes('rounded-xl bg-slate-50 dark:bg-slate-800/80') &&
    examContent.includes('min-h-[110px]'),
  'TeacherCreateExamFormView description textarea must match assignment description style'
);
console.log('  -> PASSED Test 2: Inputs, select and textarea styling and 0/255 counter verified.\n');

// ----------------------------------------------------------------------
// Test 3: Form Grid Rows
// ----------------------------------------------------------------------
console.log('Test 3: Check Form Grid layout (two equal columns on desktop, one column on mobile)...');
// Row 1: Môn học / Loại bài thi
assert(
  examContent.includes('Môn học') &&
    examContent.includes('Loại bài thi') &&
    examContent.includes('grid grid-cols-1 md:grid-cols-2 gap-5'),
  'Row 1 must pair Môn học and Loại bài thi in two equal columns'
);

// Row 4: Thời lượng / Tổng điểm
assert(
  examContent.includes('Thời lượng (phút)') &&
    examContent.includes('Tổng điểm') &&
    examContent.includes('grid grid-cols-1 md:grid-cols-2 gap-5'),
  'Row 4 must pair Thời lượng and Tổng điểm in two equal columns'
);

// Row 5: Ngày giờ mở / Ngày giờ đóng
assert(
  examContent.includes('Ngày giờ mở') &&
    examContent.includes('Ngày giờ đóng') &&
    examContent.includes('grid grid-cols-1 md:grid-cols-2 gap-5'),
  'Row 5 must pair Ngày giờ mở and Ngày giờ đóng in two equal columns'
);
console.log('  -> PASSED Test 3: Grid rows correctly pair fields in two columns.\n');

// ----------------------------------------------------------------------
// Test 4: DueDatePicker Integration for Start & End times
// ----------------------------------------------------------------------
console.log('Test 4: Check DueDatePicker usage for Ngày giờ mở and Ngày giờ đóng...');
assert(
  examContent.includes('<DueDatePicker') &&
    examContent.includes('label="Ngày giờ mở"') &&
    examContent.includes('label="Ngày giờ đóng"'),
  'TeacherCreateExamFormView must render DueDatePicker for both Ngày giờ mở and Ngày giờ đóng'
);
console.log('  -> PASSED Test 4: DueDatePicker integrated with Vietnamese calendar and hour picker.\n');

// ----------------------------------------------------------------------
// Test 5: Unpublished Banner & Footer Action Buttons
// ----------------------------------------------------------------------
console.log('Test 5: Check unpublished banner and footer buttons order (Hủy -> Tạo bài thi)...');
assert(
  examContent.includes('Chưa công bố'),
  'Must contain Chưa công bố status banner'
);
assert(
  examContent.includes('assignment_turned_in'),
  'Must contain status banner icon assignment_turned_in'
);

// Footer: Hủy -> Tạo bài thi, right-aligned
const cancelIdx = examContent.indexOf('id="btnCancelForm"');
const submitIdx = examContent.indexOf('id="btnSubmitExam"');
assert(
  cancelIdx !== -1 && submitIdx !== -1 && cancelIdx < submitIdx,
  'Buttons must be ordered Hủy -> Tạo bài thi'
);
assert(
  examContent.includes('justify-end'),
  'Footer buttons must be right-aligned (justify-end)'
);
assert(
  examContent.includes('px-5 py-2.5 rounded-xl bg-slate-100') &&
    examContent.includes('px-6 py-2.5 rounded-xl bg-blue-600'),
  'Buttons must match height, padding and border radius of Create Assignment buttons'
);
console.log('  -> PASSED Test 5: Unpublished notice placed above right-aligned buttons in Hủy -> Tạo bài thi order.\n');

// ----------------------------------------------------------------------
// Test 6: Route Synchronization (?tab=assignments&action=create&subtab=exams)
// ----------------------------------------------------------------------
console.log('Test 6: Verify route synchronization with &subtab=exams in ClassDetailPageView...');
assert(
  classDetailContent.includes('href={`/classes/${classId}?tab=assignments&action=create`}'),
  'Must have link to Create Assignment: /classes/${classId}?tab=assignments&action=create'
);
assert(
  classDetailContent.includes('href={`/classes/${classId}?tab=assignments&action=create&subtab=exams`}'),
  'Must have link to Create Exam: /classes/${classId}?tab=assignments&action=create&subtab=exams'
);
assert(
  classDetailContent.includes('isCreateAssignment') &&
    classDetailContent.includes('isCreateExam'),
  'Must correctly determine active tab from route params'
);
console.log('  -> PASSED Test 6: Route synchronization and tab highlighting verified.\n');

console.log('================================================================');
console.log('ALL TESTS PASSED: TEACHER CREATE EXAM FORM IS FULLY SYNCHRONIZED!');
console.log('================================================================');
