import fs from 'fs';
import path from 'path';
import {
  createAssignment,
  deleteAssignment,
  deleteSubmission,
  getActiveDemoSubmissions,
  getAssignmentSubmissionsPaged,
  getClassAssignmentsPaged,
  getCreatedAssignments,
  getDeletedAssignmentIds,
  resetCreatedAssignments,
  resetDeletedAssignmentIds,
} from '../services/assignment.service';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

// Mock localStorage for node test environment
const mockStorage: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
  },
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
  get length() {
    return Object.keys(mockStorage).length;
  },
} as unknown as Storage;
(globalThis as unknown as { window: unknown }).window = {};

async function runTests() {
  console.log('=== VERIFYING TEACHER DELETE ASSIGNMENT (4 CASES) & BORDER-2 UPGRADE ===\n');

  // Clear demo storage
  resetCreatedAssignments();
  resetDeletedAssignmentIds();

  // -------------------------------------------------------------
  // Test Case (d): Bài mới tạo chưa có bản nộp -> Xóa thành công & F5 biến mất
  // -------------------------------------------------------------
  console.log('Test Case (d): Create test demo assignment on csdl-k22-01 and delete it...');
  const initialList = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  const initialTotal = initialList.totalElements;

  // Create assignment without submissions
  const newAssign = await createAssignment('csdl-k22-01', {
    courseId: 'course-db-01',
    title: 'Bài tập thử nghiệm xóa demo ' + Date.now(),
    description: 'Mô tả bài tập thử nghiệm',
    maxScore: 10,
    dueDate: '2025-12-31T23:59:00',
    allowLateSubmission: true,
  });
  assert(Boolean(newAssign && newAssign.id), 'Test assignment must be created with an ID');
  console.log(`  -> Created demo assignment: ${newAssign.id} (${newAssign.title})`);

  // Verify it appears in list
  const listAfterCreate = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  assert(
    listAfterCreate.totalElements === initialTotal + 1,
    `Total elements must increase by 1 (expected ${initialTotal + 1}, got ${listAfterCreate.totalElements})`
  );
  assert(
    listAfterCreate.items.some((item) => item.id === newAssign.id),
    'Created assignment must be in the list'
  );

  // Delete the assignment
  await deleteAssignment(newAssign.id, 'csdl-k22-01');
  console.log('  -> deleteAssignment executed cleanly without network errors.');

  // Verify it is removed from list
  const listAfterDelete = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  assert(
    !listAfterDelete.items.some((item) => item.id === newAssign.id),
    'Deleted assignment MUST NOT be in the list'
  );
  assert(
    listAfterDelete.totalElements === initialTotal,
    `Total elements must be back to ${initialTotal} (got ${listAfterDelete.totalElements})`
  );

  // Verify F5 persistence: check storage
  const createdInStorage = getCreatedAssignments('csdl-k22-01');
  assert(
    !createdInStorage.some((a) => a.id === newAssign.id),
    'Deleted assignment MUST be purged from CREATED_ASSIGNMENTS_STORAGE'
  );
  const deletedIds = getDeletedAssignmentIds();
  assert(
    deletedIds.has(newAssign.id),
    'Deleted assignment ID MUST be present in DELETED_ASSIGNMENTS_STORAGE'
  );
  console.log('  -> PASSED Case (d): New demo assignment deletion & F5 persistence verified.\n');

  // -------------------------------------------------------------
  // Test Case (c): Bài có bản nộp còn hiệu lực (assign-db-01) -> Bị chặn 409 Conflict, giữ lại trong bảng
  // Đối chiếu getAssignmentSubmissionsPaged và deleteAssignment dùng chung nguồn dữ liệu
  // -------------------------------------------------------------
  console.log('Test Case (c): Delete assignment with active submissions (assign-db-01, must throw 409 Conflict)...');
  const subsDb01 = await getAssignmentSubmissionsPaged('assign-db-01', { classId: 'csdl-k22-01' });
  console.log(`  -> assign-db-01 totalElements in Submissions view: ${subsDb01.totalElements}`);
  assert(subsDb01.totalElements === 5, `assign-db-01 must have 5 initial submissions, got ${subsDb01.totalElements}`);
  const activeSubsDb01 = getActiveDemoSubmissions('assign-db-01');
  assert(activeSubsDb01.length === subsDb01.totalElements, 'getActiveDemoSubmissions must match getAssignmentSubmissionsPaged totalElements');

  let threwConflict = false;
  try {
    // assign-db-01 has active submissions
    await deleteAssignment('assign-db-01', 'csdl-k22-01');
  } catch (err: unknown) {
    threwConflict = true;
    const status =
      (err as { httpStatus?: number; response?: { status?: number } })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status;
    const msg = (err as Error)?.message;
    assert(status === 409, `Error status must be 409, got ${status}`);
    assert(
      msg.includes('Bài tập đã có bài nộp'),
      `Error message must mention submissions conflict, got "${msg}"`
    );
    console.log(`  -> Correctly blocked with 409: "${msg}"`);
  }
  assert(threwConflict, 'Deleting assignment with submissions MUST throw 409 Conflict');

  // Verify assign-db-01 is still in the list
  const listAfterBlocked = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  assert(
    listAfterBlocked.items.some((item) => item.id === 'assign-db-01'),
    'assign-db-01 must remain in the list after blocked delete'
  );

  // Even if one student cancels their submission, other students still have submissions -> still blocked
  console.log('  -> Current student cancels their own submission on assign-db-01...');
  await deleteSubmission('sub-assign-db-01', 'assign-db-01', 'student-k22-vu-minh');
  const subsDb01AfterCancelOne = await getAssignmentSubmissionsPaged('assign-db-01', { classId: 'csdl-k22-01' });
  console.log(`  -> assign-db-01 totalElements after 1 student cancels: ${subsDb01AfterCancelOne.totalElements}`);
  assert(
    subsDb01AfterCancelOne.totalElements > 0,
    `assign-db-01 must still have other students submissions active (got ${subsDb01AfterCancelOne.totalElements})`
  );

  let threwConflictAfterOneCancel = false;
  try {
    await deleteAssignment('assign-db-01', 'csdl-k22-01');
  } catch (err: unknown) {
    threwConflictAfterOneCancel = true;
    const status = (err as { httpStatus?: number })?.httpStatus;
    assert(status === 409, `Should still be 409 conflict when other students have submissions, got ${status}`);
    console.log('  -> assign-db-01 deletion still blocked with 409 because other students have submissions.');
  }
  assert(threwConflictAfterOneCancel, 'Must still block deletion when other students have active submissions');

  console.log('  -> PASSED Case (c): 409 Conflict handling verified.\n');

  // -------------------------------------------------------------
  // Test Case (a): Bài mẫu có sẵn chưa có bản nộp (assign-db-04) -> Xóa thành công & F5 biến mất
  // -------------------------------------------------------------
  console.log('Test Case (a): Delete pre-existing mock assignment without submissions (assign-db-04)...');
  const subsDb04 = await getAssignmentSubmissionsPaged('assign-db-04', { classId: 'csdl-k22-01' });
  console.log(`  -> assign-db-04 totalElements in Submissions view: ${subsDb04.totalElements}`);
  assert(subsDb04.totalElements === 0, `assign-db-04 must have 0 submissions, got ${subsDb04.totalElements}`);

  const listBeforeA = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  const totalBeforeA = listBeforeA.totalElements;
  assert(
    listBeforeA.items.some((item) => item.id === 'assign-db-04'),
    'assign-db-04 must initially exist in list'
  );

  await deleteAssignment('assign-db-04', 'csdl-k22-01');
  console.log('  -> assign-db-04 deleted cleanly without error.');

  // Verify it is removed and total elements decremented
  const listAfterA = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  assert(
    !listAfterA.items.some((item) => item.id === 'assign-db-04'),
    'assign-db-04 MUST NOT be in the list after delete'
  );
  assert(
    listAfterA.totalElements === totalBeforeA - 1,
    `Total elements must decrement by 1 (expected ${totalBeforeA - 1}, got ${listAfterA.totalElements})`
  );
  assert(
    getDeletedAssignmentIds().has('assign-db-04'),
    'assign-db-04 MUST be recorded in DELETED_ASSIGNMENTS_STORAGE for F5 persistence'
  );
  console.log('  -> PASSED Case (a): Pre-existing assignment without submissions deleted & persisted across F5.\n');

  // -------------------------------------------------------------
  // Test Case (b): Bài chỉ có 1 bản nộp và đã bị hủy (assign-db-02) -> Cho phép xóa khi không còn bản nộp
  // -------------------------------------------------------------
  console.log('Test Case (b): Delete assignment whose only submission was cancelled (assign-db-02)...');
  // First, verify assign-db-02 has 1 submission before cancellation
  const subsDb02Before = await getAssignmentSubmissionsPaged('assign-db-02', { classId: 'csdl-k22-01' });
  console.log(`  -> assign-db-02 totalElements before cancel: ${subsDb02Before.totalElements}`);
  assert(subsDb02Before.totalElements === 1, `assign-db-02 must have 1 initial submission, got ${subsDb02Before.totalElements}`);

  let threwBlockedBeforeCancel = false;
  try {
    await deleteAssignment('assign-db-02', 'csdl-k22-01');
  } catch (err: unknown) {
    threwBlockedBeforeCancel = true;
    const status =
      (err as { httpStatus?: number; response?: { status?: number } })?.httpStatus ||
      (err as { response?: { status?: number } })?.response?.status;
    assert(status === 409, `Should be 409 before cancel, got ${status}`);
    console.log('  -> Before cancel: assign-db-02 delete correctly blocked with 409');
  }
  assert(threwBlockedBeforeCancel, 'assign-db-02 must be blocked before submission is cancelled');

  // Student cancels their submission on assign-db-02
  console.log('  -> Student cancels submission on assign-db-02...');
  await deleteSubmission('sub-assign-db-02', 'assign-db-02');

  // Check submissions view of assign-db-02 after cancel: totalElements must be 0!
  const subsDb02After = await getAssignmentSubmissionsPaged('assign-db-02', { classId: 'csdl-k22-01' });
  console.log(`  -> assign-db-02 totalElements after cancel: ${subsDb02After.totalElements}`);
  assert(subsDb02After.totalElements === 0, `assign-db-02 totalElements must be 0 after cancel, got ${subsDb02After.totalElements}`);

  // Now teacher deletes assign-db-02: must SUCCEED!
  const listBeforeB = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  const totalBeforeB = listBeforeB.totalElements;

  await deleteAssignment('assign-db-02', 'csdl-k22-01');
  console.log('  -> After cancel: assign-db-02 deleted cleanly without error!');

  // Verify assign-db-02 is removed from list
  const listAfterB = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 20 });
  assert(
    !listAfterB.items.some((item) => item.id === 'assign-db-02'),
    'assign-db-02 MUST NOT be in the list after delete'
  );
  assert(
    listAfterB.totalElements === totalBeforeB - 1,
    `Total elements must decrement by 1 (expected ${totalBeforeB - 1}, got ${listAfterB.totalElements})`
  );
  assert(
    getDeletedAssignmentIds().has('assign-db-02'),
    'assign-db-02 MUST be recorded in DELETED_ASSIGNMENTS_STORAGE for F5 persistence'
  );
  console.log('  -> PASSED Case (b): Assignment whose submission was cancelled can now be deleted & persisted across F5.\n');

  // -------------------------------------------------------------
  // Test 3: Verify border-2 in all 9 screens/states
  // -------------------------------------------------------------
  console.log('Test 3: Verify border-2 on all 9 screens/states...');

  // Màn 1: StudentAssignmentsTableView.tsx
  const studentTablePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/StudentAssignmentsTableView.tsx'
  );
  const studentTableContent = fs.readFileSync(studentTablePath, 'utf8');
  assert(
    studentTableContent.includes('border-2 border-slate-200 dark:border-slate-800'),
    'StudentAssignmentsTableView must have border-2 on KPI cards and main container'
  );
  assert(
    studentTableContent.includes('border-2 border-slate-200 dark:border-slate-700'),
    'StudentAssignmentsTableView must have border-2 on search input'
  );
  assert(
    studentTableContent.includes('border-2 border-blue-800/40'),
    'StudentAssignmentsTableView must have border-2 on Socratic AI mentor card'
  );
  console.log('  -> Màn 1 (Danh sách bài tập - Học viên): border-2 OK');

  // Màn 2, 4, 5: StudentAssignmentDetailPageView.tsx (Chưa nộp, Chờ chấm, Đã chấm)
  const studentDetailPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/StudentAssignmentDetailPageView.tsx'
  );
  const studentDetailContent = fs.readFileSync(studentDetailPath, 'utf8');
  assert(
    studentDetailContent.includes('border-2 border-slate-200/80 dark:border-slate-800'),
    'StudentAssignmentDetailPageView must have border-2 on unified main card'
  );
  assert(
    studentDetailContent.includes('border-2 border-slate-200/80 dark:border-slate-700/80'),
    'StudentAssignmentDetailPageView must have border-2 on left rules and right action clusters'
  );
  assert(
    studentDetailContent.includes('border-2 border-slate-200 dark:border-slate-800'),
    'StudentAssignmentDetailPageView must have border-2 on submitted work card'
  );
  assert(
    studentDetailContent.includes('border-2 border-blue-200 dark:border-blue-900/60'),
    'StudentAssignmentDetailPageView must have border-2 on teacher feedback card'
  );
  console.log('  -> Màn 2, 4, 5 (Chi tiết Chưa nộp, Chờ chấm, Đã chấm - Học viên): border-2 OK');

  // Màn 3: StudentAssignmentSubmissionPageView.tsx (Form nộp bài - Học viên)
  const studentSubmitPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/StudentAssignmentSubmissionPageView.tsx'
  );
  const studentSubmitContent = fs.readFileSync(studentSubmitPath, 'utf8');
  assert(
    studentSubmitContent.includes('border-2 border-slate-200 dark:border-slate-800'),
    'StudentAssignmentSubmissionPageView must have border-2 on main form card and info card'
  );
  assert(
    studentSubmitContent.includes('border-2 border-slate-200/80 dark:border-slate-700/80'),
    'StudentAssignmentSubmissionPageView must have border-2 on note box'
  );
  assert(
    studentSubmitContent.includes('rounded-xl border-2 p-4 text-sm'),
    'StudentAssignmentSubmissionPageView must have border-2 on submission textarea'
  );
  console.log('  -> Màn 3 (Form nộp bài - Học viên): border-2 OK');

  // Màn 6: TeacherAssignmentsTableView.tsx (Danh sách bài tập - Giảng viên)
  const teacherTablePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherAssignmentsTableView.tsx'
  );
  const teacherTableContent = fs.readFileSync(teacherTablePath, 'utf8');
  assert(
    teacherTableContent.includes('border-2 border-slate-200/80 dark:border-slate-800'),
    'TeacherAssignmentsTableView must have border-2 on main container and table container'
  );
  assert(
    teacherTableContent.includes('border-2 border-slate-200 dark:border-slate-700/80'),
    'TeacherAssignmentsTableView must have border-2 on search input'
  );
  assert(
    teacherTableContent.includes('border-2 border-slate-200 dark:border-slate-800 space-y-4'),
    'TeacherAssignmentsTableView must have border-2 on delete modal'
  );
  console.log('  -> Màn 6 (Danh sách bài tập - Giảng viên): border-2 OK');

  // Màn 7: TeacherCreateAssignmentFormView.tsx (Tạo bài tập - Giảng viên)
  const teacherCreatePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherCreateAssignmentFormView.tsx'
  );
  const teacherCreateContent = fs.readFileSync(teacherCreatePath, 'utf8');
  assert(
    teacherCreateContent.includes('border-2 border-slate-200/80 dark:border-slate-800 p-6 sm:p-8'),
    'TeacherCreateAssignmentFormView must have border-2 on form card'
  );
  assert(
    teacherCreateContent.includes('border-2 border-slate-200/80 dark:border-slate-800 flex items-center'),
    'TeacherCreateAssignmentFormView must have border-2 on late submission toggle container'
  );
  assert(
    teacherCreateContent.includes('border-2 shadow-xs'),
    'TeacherCreateAssignmentFormView must have border-2 on select/input fields'
  );
  console.log('  -> Màn 7 (Tạo bài tập - Giảng viên): border-2 OK');

  // Màn 8: TeacherAssignmentSubmissionsPageView.tsx (Danh sách bài nộp - Giảng viên)
  const teacherSubmissionsPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherAssignmentSubmissionsPageView.tsx'
  );
  const teacherSubmissionsContent = fs.readFileSync(teacherSubmissionsPath, 'utf8');
  assert(
    teacherSubmissionsContent.includes('border-2 border-slate-800 shadow-sm'),
    'TeacherAssignmentSubmissionsPageView must have border-2 on Hero Navy card'
  );
  assert(
    teacherSubmissionsContent.includes('border-2 border-[#D9E2E8] dark:border-slate-800 p-6 shadow-sm'),
    'TeacherAssignmentSubmissionsPageView must have border-2 on unified toolbar/table card'
  );
  assert(
    teacherSubmissionsContent.includes('border-2 border-[#D9E2E8] dark:border-slate-700 rounded-lg'),
    'TeacherAssignmentSubmissionsPageView must have border-2 on search input'
  );
  assert(
    teacherSubmissionsContent.includes('border-2 border-[#D9E2E8] dark:border-slate-700 rounded-xl overflow-x-auto'),
    'TeacherAssignmentSubmissionsPageView must have border-2 on table wrapper'
  );
  console.log('  -> Màn 8 (Danh sách bài nộp - Giảng viên): border-2 OK');

  // Màn 9: TeacherSubmissionDetailView.tsx (Chi tiết bài nộp & chấm điểm - Giảng viên)
  const teacherDetailPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherSubmissionDetailView.tsx'
  );
  const teacherDetailContent = fs.readFileSync(teacherDetailPath, 'utf8');
  assert(
    teacherDetailContent.includes('border-2 border-[#E0E3E8] shadow-xs'),
    'TeacherSubmissionDetailView must have border-2 on header and cards'
  );
  assert(
    teacherDetailContent.includes('border-2 border-[#E0E3E8] p-6 shadow-xs space-y-5'),
    'TeacherSubmissionDetailView must have border-2 on student submission card'
  );
  assert(
    teacherDetailContent.includes('border-2 border-[#E0E3E8] p-6 shadow-xs space-y-4'),
    'TeacherSubmissionDetailView must have border-2 on assignment specs card'
  );
  assert(
    teacherDetailContent.includes('border-2 border-[#E0E3E8] p-5 shadow-xs space-y-3'),
    'TeacherSubmissionDetailView must have border-2 on rules card'
  );
  assert(
    teacherDetailContent.includes('border-2 border-[#E0E3E8] p-5 shadow-xs space-y-5'),
    'TeacherSubmissionDetailView must have border-2 on grading form card'
  );
  console.log('  -> Màn 9 (Chi tiết bài nộp & chấm điểm - Giảng viên): border-2 OK');

  console.log('\n================================================================');
  console.log('ALL TESTS PASSED: TEACHER DELETE & BORDER-2 VERIFIED ON ALL 9 SCREENS!');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
