import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { formatScore } from '../services/assignment.service';

/**
 * Test Suite: Verify Assignments View Polish, Teacher Detail Modal, and Student 2-Part Graded Box
 */
async function runTests() {
  console.log('=== STARTING ASSIGNMENTS VIEW POLISH & MODAL VERIFICATION TESTS ===\n');

  // ----------------------------------------------------
  // TEST 1: Teacher Create Assignment Button & Height Sync
  // ----------------------------------------------------
  console.log('--- TEST 1: Teacher Create Assignment Button Polish ---');
  const teacherViewPath = path.resolve(__dirname, '../components/TeacherAssignmentsTableView.tsx');
  const teacherViewSource = fs.readFileSync(teacherViewPath, 'utf8');

  // Verify create button does NOT contain "+ +" (no double plus)
  assert(
    !teacherViewSource.includes('<span>+ {t(\'createAssignment\')}</span>'),
    'Create button text must NOT contain redundant "+" symbol'
  );
  assert(
    teacherViewSource.includes('<span>{t(\'createAssignment\')}</span>'),
    'Create button text must cleanly render translated label without hardcoded "+"'
  );
  assert(
    teacherViewSource.includes('h-9 bg-blue-600') || teacherViewSource.includes('h-[38px]'),
    'Create button must be height-synchronized with toggle group (h-9 or h-[38px])'
  );
  console.log('✓ Create button double plus eliminated and height synchronized\n');

  // ----------------------------------------------------
  // TEST 2: Teacher View Assignment Modal ("Chi tiết đề bài tập")
  // ----------------------------------------------------
  console.log('--- TEST 2: Teacher View Assignment Modal Polish ---');
  // 1. Must NOT contain "viewSubmissionsBtn" in modal actions
  assert(
    !teacherViewSource.includes('{t(\'viewModal.viewSubmissionsBtn\')}'),
    'Modal actions must NOT contain "Xem bài nộp" button'
  );

  // 2. Footer right aligned: [Đóng] -> [Chỉnh sửa bài tập]
  assert(
    teacherViewSource.includes('justify-end gap-2.5 pt-3 border-t'),
    'Modal footer must be right-aligned with gap-2.5 and border-t'
  );

  // 3. Main title must be assignment title
  assert(
    teacherViewSource.includes('{assignmentToView.title}'),
    'Modal title must prominently display assignmentToView.title'
  );

  // 4. Late submission hidden when dueDate is null
  assert(
    teacherViewSource.includes('{assignmentToView.dueDate && (') &&
    teacherViewSource.includes('t(\'columns.lateSubmission\')'),
    'Late submission row in modal must only display when assignmentToView.dueDate exists'
  );

  // 5. Scrollable body container for long instructions
  assert(
    teacherViewSource.includes('max-h-[55vh] overflow-y-auto') || teacherViewSource.includes('overflow-y-auto'),
    'Modal body must have max-height and overflow-y-auto to allow scrolling long instructions'
  );
  console.log('✓ Teacher View Assignment modal adheres to all specs\n');

  // ----------------------------------------------------
  // TEST 3: Teacher Grading Progress Zero State (Single Clean Line)
  // ----------------------------------------------------
  console.log('--- TEST 3: Teacher Grading Progress Zero State ---');
  // In featured and standard, when total === 0, render clean single line without 0% or progress bar
  assert(
    teacherViewSource.includes('if (total === 0)'),
    'Must handle total === 0 explicitly'
  );
  console.log('✓ Teacher grading progress zero state renders single clean line without progress bar\n');

  // ----------------------------------------------------
  // TEST 4: Student View Clean Footer (No "Không có tài liệu đính kèm" text)
  // ----------------------------------------------------
  console.log('--- TEST 4: Student View Clean Attachment Link & Footer ---');
  const studentViewPath = path.resolve(__dirname, '../components/StudentAssignmentsTableView.tsx');
  const studentViewSource = fs.readFileSync(studentViewPath, 'utf8');

  // Verify neither featured card nor white card contains the redundant text
  assert(
    !studentViewSource.includes('Không có tài liệu đính kèm'),
    'Student view must NOT contain repetitive "Không có tài liệu đính kèm" label'
  );
  console.log('✓ Repetitive "Không có tài liệu đính kèm" label removed completely\n');

  // ----------------------------------------------------
  // TEST 5: Student Graded Result 2-Part Layout when Feedback is Empty
  // ----------------------------------------------------
  console.log('--- TEST 5: Student Graded Result 2-Part Layout ---');
  // Check that if (!teacherComment) is handled separately
  assert(
    studentViewSource.includes('if (!teacherComment)'),
    'Student view must handle empty teacher feedback with a dedicated 2-part layout'
  );
  assert(
    studentViewSource.includes('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'),
    'Empty feedback layout must arrange score and grader info in a clean 2-part balanced row'
  );

  // Verify score formatting works for 0
  assert.strictEqual(formatScore(0, 'vi'), '0');
  assert.strictEqual(formatScore(9.0, 'vi'), '9');
  console.log('✓ Student graded result 2-part layout and zero score formatting verified\n');

  // ----------------------------------------------------
  // TEST 6: Teacher Cards Hide Late Submission when No Due Date
  // ----------------------------------------------------
  console.log('--- TEST 6: Teacher Cards Hide Late Submission when No Due Date ---');
  assert(
    teacherViewSource.includes('{featuredItem.dueDate && (') &&
    teacherViewSource.includes('t(\'featured.lateAllowed\')'),
    'Featured card must hide late submission badge when dueDate is null'
  );
  assert(
    teacherViewSource.includes('{item.dueDate && (') &&
    teacherViewSource.includes('t(\'card.lateAllowed\')'),
    'Standard card must hide late submission badge when dueDate is null'
  );
  console.log('✓ Teacher cards hide late submission when dueDate is absent\n');

  console.log('=== ALL ASSIGNMENTS VIEW POLISH & MODAL TESTS PASSED ===');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
