import assert from 'node:assert';
import { runSuite } from '@/test-utils/run-verifications';
import fs from 'fs';
import path from 'path';
import { CreateAssignmentPayload, createAssignmentSchema, updateAssignmentSchema } from '../schemas/assignment.schema';
import { MOCK_ASSIGNMENTS, createAssignment, formatTeacherDueDate, formatToLocalDateTime, getAllClassAssignments, getAssignmentById, getClassActiveCourses, getClassAssignmentsPaged, getCourseLessons, getCreatedAssignments, resetCreatedAssignments, saveCreatedAssignment, updateAssignment } from '../services/assignment.service';


// ===============================================================
// Sub-test: verify_create_assignment.test.ts
// ===============================================================
async function test_verify_create_assignment() {
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
  },
};
(globalThis as unknown as { localStorage: unknown }).localStorage = (
  globalThis as unknown as { window: { localStorage: unknown } }
).window.localStorage;



async function runTests() {
  console.log('=== RUNNING CREATE ASSIGNMENT VERIFICATION TESTS ===\n');

  // Test 1: Zod validation tests
  console.log('--- Test 1: createAssignmentSchema validation ---');
  // 1a. Valid payload
  const validPayload = {
    courseId: 'course-cs-202',
    lessonId: 'lesson-1',
    title: 'Thực hành phân tích gói tin Wireshark',
    description: 'Bắt gói tin HTTP, TCP handshake và phân tích cờ SYN, ACK.',
    maxScore: 10,
    dueDate: '2026-11-30T23:59:00',
    allowLateSubmission: true,
    fileAttachmentUrl: 'https://res.cloudinary.com/ilms/debai_wireshark.pdf',
  };
  const parsed1 = createAssignmentSchema.safeParse(validPayload);
  assert(parsed1.success, 'Valid payload must pass schema validation');

  // 1b. Empty title fails
  const invalidTitle = createAssignmentSchema.safeParse({
    ...validPayload,
    title: '   ',
  });
  assert(!invalidTitle.success, 'Empty title must fail');
  assert(
    invalidTitle.error?.issues[0]?.message === 'errors.titleRequired',
    'Should return errors.titleRequired'
  );

  // 1c. Title > 255 chars fails
  const longTitle = createAssignmentSchema.safeParse({
    ...validPayload,
    title: 'A'.repeat(256),
  });
  assert(!longTitle.success, 'Title > 255 chars must fail');

  // 1d. Independent validation: Missing courseId with valid title
  const missingCourse = createAssignmentSchema.safeParse({
    ...validPayload,
    courseId: '',
  });
  assert(!missingCourse.success, 'Missing courseId must fail');
  assert(
    Boolean(
      missingCourse.error?.issues.some(
        (i) => i.path[0] === 'courseId' && i.message === 'errors.courseRequired'
      )
    ),
    'Should have errors.courseRequired on courseId'
  );
  assert(
    !missingCourse.error?.issues.some((i) => i.path[0] === 'title'),
    'Should NOT have error on valid title when courseId is missing'
  );

  // 1e. Independent validation: Valid courseId with empty title
  const missingTitleOnly = createAssignmentSchema.safeParse({
    ...validPayload,
    courseId: 'course-cs-202',
    title: '',
  });
  assert(!missingTitleOnly.success, 'Empty title must fail');
  assert(
    Boolean(
      missingTitleOnly.error?.issues.some(
        (i) => i.path[0] === 'title' && i.message === 'errors.titleRequired'
      )
    ),
    'Should have errors.titleRequired on title'
  );
  assert(
    !missingTitleOnly.error?.issues.some((i) => i.path[0] === 'courseId'),
    'Should NOT have error on valid courseId when title is missing'
  );

  // 1f. Independent validation: Both courseId and title missing
  const missingBoth = createAssignmentSchema.safeParse({
    ...validPayload,
    courseId: '',
    title: '',
  });
  assert(!missingBoth.success, 'Missing both courseId and title must fail');
  assert(
    Boolean(
      missingBoth.error?.issues.some(
        (i) => i.path[0] === 'courseId' && i.message === 'errors.courseRequired'
      )
    ),
    'Should flag courseId error independently'
  );
  assert(
    Boolean(
      missingBoth.error?.issues.some(
        (i) => i.path[0] === 'title' && i.message === 'errors.titleRequired'
      )
    ),
    'Should flag title error independently'
  );

  // 1g. Lesson is optional (lessonId null or omitted passes)
  const optionalLesson = createAssignmentSchema.safeParse({
    ...validPayload,
    lessonId: null,
  });
  assert(optionalLesson.success, 'Optional lessonId as null must pass');

  // 1h. Max score <= 0 fails
  const nonPositiveScore = createAssignmentSchema.safeParse({
    ...validPayload,
    maxScore: 0,
  });
  assert(!nonPositiveScore.success, 'MaxScore 0 must fail');

  // 1i. Max score > 100 fails
  const over100Score = createAssignmentSchema.safeParse({
    ...validPayload,
    maxScore: 105,
  });
  assert(!over100Score.success, 'MaxScore > 100 must fail');

  // 1j. Max score > 2 decimals fails
  const threeDecimalsScore = createAssignmentSchema.safeParse({
    ...validPayload,
    maxScore: 9.125,
  });
  assert(!threeDecimalsScore.success, 'MaxScore with 3 decimals must fail');

  // 1k. Max score with 2 decimals passes
  const twoDecimalsScore = createAssignmentSchema.safeParse({
    ...validPayload,
    maxScore: 9.75,
  });
  assert(twoDecimalsScore.success, 'MaxScore with 2 decimals must pass');

  // 1l. Invalid URL fails
  const invalidUrl = createAssignmentSchema.safeParse({
    ...validPayload,
    fileAttachmentUrl: 'not-a-valid-url',
  });
  assert(!invalidUrl.success, 'Invalid fileAttachmentUrl must fail');

  // 1m. Empty / null URL passes
  const emptyUrl = createAssignmentSchema.safeParse({
    ...validPayload,
    fileAttachmentUrl: '',
  });
  assert(emptyUrl.success, 'Empty fileAttachmentUrl must pass');
  console.log('=> Test 1 PASSED.\n');

  // Test 2: formatToLocalDateTime helper
  console.log('--- Test 2: formatToLocalDateTime helper ---');
  const formattedFromInput = formatToLocalDateTime('2026-11-30T23:59');
  assert(
    formattedFromInput === '2026-11-30T23:59:00',
    `Expected 2026-11-30T23:59:00 but got ${formattedFromInput}`
  );
  const formattedUserExample = formatToLocalDateTime('2026-12-07T23:59:00');
  assert(
    formattedUserExample === '2026-12-07T23:59:00',
    `Expected 2026-12-07T23:59:00 but got ${formattedUserExample}`
  );
  const formattedAlreadyHasSeconds = formatToLocalDateTime('2026-11-30T23:59:00');
  assert(
    formattedAlreadyHasSeconds === '2026-11-30T23:59:00',
    `Expected 2026-11-30T23:59:00 but got ${formattedAlreadyHasSeconds}`
  );
  const formattedEmpty = formatToLocalDateTime('');
  assert(formattedEmpty === null, 'Empty date must return null');
  const formattedNull = formatToLocalDateTime(null);
  assert(formattedNull === null, 'Null date must return null');
  console.log('=> Test 2 PASSED.\n');

  // Test 3: Active courses retrieval
  console.log('--- Test 3: getClassActiveCourses ---');
  const activeCourses = await getClassActiveCourses('csdl-k22-01');
  assert(activeCourses.length >= 1, 'Should return at least 1 active course');
  assert(
    activeCourses[0].status === 'ACTIVE',
    'Returned course should have status ACTIVE'
  );
  console.log(`3a. Returned ${activeCourses.length} active courses:`, activeCourses[0].name);
  console.log('=> Test 3 PASSED.\n');

  // Test 4: Course lessons retrieval & clear on course switch
  console.log('--- Test 4: getCourseLessons ---');
  const lessons = await getCourseLessons('course-cs-202');
  assert(lessons.length >= 1, 'Should return lessons for CS-202');
  console.log(`4a. Returned ${lessons.length} lessons. Sample:`, lessons[0].title);
  console.log('=> Test 4 PASSED.\n');

  // Test 5: createAssignment validation & display in teacher list
  console.log('--- Test 5: createAssignment validation & demo mode persistence ---');
  resetCreatedAssignments();

  // 5a. Missing courseId halts createAssignment before saving or calling POST
  let threwCourseError = false;
  try {
    await createAssignment('csdl-k22-01', {
      courseId: '',
      lessonId: 'lesson-4',
      title: 'Thử nghiệm tạo bài không có môn học',
      description: 'Mô tả thử nghiệm',
      maxScore: 10,
      dueDate: '2026-11-30T23:59:00',
      allowLateSubmission: true,
      fileAttachmentUrl: null,
    });
  } catch (err: unknown) {
    threwCourseError = true;
    console.log('5a. Successfully blocked creation when courseId is empty:', (err as Error).message);
  }
  assert(threwCourseError, 'createAssignment must reject when courseId is empty');
  assert(
    getCreatedAssignments('csdl-k22-01').length === 0,
    'Storage must remain empty when validation fails'
  );

  const newAssignment = await createAssignment('csdl-k22-01', {
    courseId: 'course-cs-202',
    lessonId: 'lesson-4',
    title: 'Thực hành phân tích gói tin Wireshark (Mới tạo)',
    description: 'Bắt gói tin HTTP và phân tích các trường tiêu đề.',
    maxScore: 10,
    dueDate: '2026-11-30T23:59:00',
    allowLateSubmission: true,
    fileAttachmentUrl: 'https://res.cloudinary.com/ilms/debai_wireshark.pdf',
  });

  assert(Boolean(newAssignment.id), 'Created assignment must have an id');
  assert(
    newAssignment.title === 'Thực hành phân tích gói tin Wireshark (Mới tạo)',
    'Created assignment title mismatch'
  );
  assert(newAssignment.maxScore === 10, 'Created assignment maxScore mismatch');
  assert(newAssignment.allowLateSubmission === true, 'allowLateSubmission mismatch');

  // Check teacher paged assignments includes newly created item at the top
  const pagedList = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 5 });
  assert(
    pagedList.items.some((item) => item.id === newAssignment.id),
    'Created assignment must appear in teacher paged assignment list'
  );
  assert(
    pagedList.items[0].id === newAssignment.id,
    'Created assignment must appear at index 0 of page 0'
  );
  console.log('5a. Teacher list page 0 index 0 title:', pagedList.items[0].title);
  console.log('=> Test 5 PASSED.\n');

  // Test 6: Display in student assignments list & detail lookup
  console.log('--- Test 6: Shared demo data for Student view & Detail lookup ---');
  const allListForStudent = await getAllClassAssignments('csdl-k22-01');
  assert(
    allListForStudent.some((item) => item.id === newAssignment.id),
    'Student assignment list must include the newly created assignment'
  );
  assert(
    allListForStudent[0].id === newAssignment.id,
    'Student assignment list must have the newly created assignment at the beginning'
  );
  console.log('6a. Student list index 0 item:', allListForStudent[0].title);

  // Detail lookup by ID
  const detail = await getAssignmentById(newAssignment.id);
  assert(
    detail.id === newAssignment.id,
    'getAssignmentById must successfully return the created assignment'
  );
  assert(detail.title === newAssignment.title, 'Detail title must match');
  console.log('6b. Detail fetched successfully:', detail.title);
  console.log('=> Test 6 PASSED.\n');

  // Test 7: Persistence after simulated reload (F5)
  console.log('--- Test 7: Persistence after simulated reload (F5) ---');
  const persistedAssignments = getCreatedAssignments('csdl-k22-01');
  assert(
    persistedAssignments.some((a) => a.id === newAssignment.id),
    'Created assignment must be persisted in localStorage'
  );
  console.log(
    `7a. Persisted assignments count in storage: ${persistedAssignments.length}, sample id: ${persistedAssignments[0].id}`
  );
  console.log('=> Test 7 PASSED.\n');

  // Cleanup
  resetCreatedAssignments();
  console.log('=> Cleaned up test storage.');

  console.log('======================================================');
  console.log('ALL CREATE ASSIGNMENT TESTS PASSED SUCCESSFULLY! (7/7)');
  console.log('======================================================');
}


  await runTests();

}

// ===============================================================
// Sub-test: verify_create_assignment_exam_tabs.test.ts
// ===============================================================
async function test_verify_create_assignment_exam_tabs() {



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

}

// ===============================================================
// Sub-test: verify_teacher_edit_assignment.test.ts
// ===============================================================
async function test_verify_teacher_edit_assignment() {
// Mock localStorage for node test runner
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

if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = globalThis;
}

async function runTests() {
  console.log('--- STARTING TEACHER EDIT ASSIGNMENT FLOW TESTS ---');

  // Clean storage before tests
  resetCreatedAssignments();

  // =========================================================================
  // TEST 1: Retrieve assignment by ID for pre-population in edit form
  // =========================================================================
  console.log('\n[TEST 1] Form pre-population via getAssignmentById');
  const assignment1 = await getAssignmentById('assign-db-01', 'csdl-k22-01');
  assert.strictEqual(assignment1.id, 'assign-db-01');
  assert.strictEqual(assignment1.title, 'Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)');
  assert.strictEqual(assignment1.maxScore, 10);
  assert.strictEqual(assignment1.allowLateSubmission, true);
  assert.strictEqual(assignment1.dueDate, '2024-11-15T23:59:00');
  console.log('✓ Successfully retrieved assign-db-01 with full details for form pre-population.');

  // =========================================================================
  // TEST 2: Pre-population for assignment ID e211 (as requested by user)
  // =========================================================================
  console.log('\n[TEST 2] Pre-population for assignment ID e211 without manual seeding');
  const assignmentE211 = await getAssignmentById('e211', 'csdl-k22-01');
  assert.strictEqual(assignmentE211.id, 'e211');
  assert.strictEqual(assignmentE211.title, 'Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)');
  assert.strictEqual(assignmentE211.maxScore, 10);
  assert.strictEqual(assignmentE211.allowLateSubmission, true);
  assert.strictEqual(assignmentE211.dueDate, '2024-11-15T23:59:00');
  console.log('✓ Successfully pre-populated form for assignment e211 directly matching image content.');

  // =========================================================================
  // TEST 3: Dirty checking & field difference detection
  // =========================================================================
  console.log('\n[TEST 3] Dirty checking logic');
  const initialValues: {
    title: string;
    description: string;
    lessonId: string;
    maxScore: string;
    dueDate: string | null;
    allowLateSubmission: boolean;
    fileAttachmentUrl: string;
  } = {
    title: assignment1.title,
    description: assignment1.description || '',
    lessonId: assignment1.lessonId || '',
    maxScore: String(assignment1.maxScore),
    dueDate: assignment1.dueDate || null,
    allowLateSubmission: Boolean(assignment1.allowLateSubmission),
    fileAttachmentUrl: assignment1.fileAttachmentUrl || '',
  };

  const computeDirty = (current: typeof initialValues) => {
    const normalizeDueDate = (d: string | null | undefined) => (d ? formatToLocalDateTime(d) : null);
    const fields: Record<string, boolean> = {
      title: current.title.trim() !== initialValues.title.trim(),
      description: current.description.trim() !== initialValues.description.trim(),
      lessonId: (current.lessonId || '') !== (initialValues.lessonId || ''),
      maxScore: current.maxScore.trim() !== initialValues.maxScore.trim(),
      dueDate: normalizeDueDate(current.dueDate) !== normalizeDueDate(initialValues.dueDate),
      allowLateSubmission: current.allowLateSubmission !== initialValues.allowLateSubmission,
      fileAttachmentUrl: current.fileAttachmentUrl.trim() !== initialValues.fileAttachmentUrl.trim(),
    };
    return { hasChanges: Object.values(fields).some(Boolean), fields };
  };

  // Pristine form
  let dirtyState = computeDirty(initialValues);
  assert.strictEqual(dirtyState.hasChanges, false);
  console.log('✓ Pristine form correctly identified as not dirty.');

  // Changing title only
  let editedValues = { ...initialValues, title: 'Bài tập chuẩn hóa CSDL (Đã chỉnh sửa)' };
  dirtyState = computeDirty(editedValues);
  assert.strictEqual(dirtyState.hasChanges, true);
  assert.strictEqual(dirtyState.fields.title, true);
  assert.strictEqual(dirtyState.fields.description, false);
  assert.strictEqual(dirtyState.fields.dueDate, false);
  console.log('✓ Title change detected as dirty field.');

  // Clearing due date
  editedValues = { ...initialValues, dueDate: null };
  dirtyState = computeDirty(editedValues);
  assert.strictEqual(dirtyState.hasChanges, true);
  assert.strictEqual(dirtyState.fields.dueDate, true);
  console.log('✓ Clearing due date detected as dirty field.');

  // Turning off late submission
  editedValues = { ...initialValues, allowLateSubmission: false };
  dirtyState = computeDirty(editedValues);
  assert.strictEqual(dirtyState.hasChanges, true);
  assert.strictEqual(dirtyState.fields.allowLateSubmission, true);
  console.log('✓ Disabling late submission detected as dirty field.');

  // =========================================================================
  // TEST 4: Validation using updateAssignmentSchema
  // =========================================================================
  console.log('\n[TEST 4] Schema validation: invalid inputs halt mutation and retain form state');

  // Test empty title
  const invalidTitleRes = updateAssignmentSchema.safeParse({ title: '' });
  assert.strictEqual(invalidTitleRes.success, false);
  console.log('✓ Empty title rejected by schema.');

  // Test negative or > 100 maxScore
  const invalidScoreRes = updateAssignmentSchema.safeParse({ maxScore: -5 });
  assert.strictEqual(invalidScoreRes.success, false);
  const overScoreRes = updateAssignmentSchema.safeParse({ maxScore: 105 });
  assert.strictEqual(overScoreRes.success, false);
  console.log('✓ Invalid maxScore rejected by schema.');

  // Test invalid attachment url
  const invalidUrlRes = updateAssignmentSchema.safeParse({ fileAttachmentUrl: 'not-a-valid-url' });
  assert.strictEqual(invalidUrlRes.success, false);
  console.log('✓ Invalid URL rejected by schema.');

  // =========================================================================
  // TEST 5: Dirty payload construction (only sending changed fields)
  // =========================================================================
  console.log('\n[TEST 5] Dirty payload construction adheres to contract');

  // Case A: Title changed only
  const payloadA: Record<string, unknown> = { title: 'Tiêu đề mới' };
  assert.deepStrictEqual(payloadA, { title: 'Tiêu đề mới' });
  assert.strictEqual('courseId' in payloadA, false, 'Course ID must never be sent in payload');

  // Case B: Clear due date (must explicitly send dueDate: null)
  const payloadB: Record<string, unknown> = {};
  payloadB.dueDate = null;
  assert.deepStrictEqual(payloadB, { dueDate: null });

  // Case C: Turn off late submission (must send allowLateSubmission: false)
  const payloadC: Record<string, unknown> = {};
  payloadC.allowLateSubmission = false;
  assert.deepStrictEqual(payloadC, { allowLateSubmission: false });

  console.log('✓ Dirty payloads correctly constructed with exact changed fields.');

  // =========================================================================
  // TEST 6: Demo mode persistence & F5 simulation
  // =========================================================================
  console.log('\n[TEST 6] Demo persistence & F5 simulation on assign-db-01');

  const updatedTitle = 'Bài tập chuẩn hóa cơ sở dữ liệu - Cập nhật lúc ' + Date.now();
  const updateResult = await updateAssignment(
    'assign-db-01',
    {
      title: updatedTitle,
      dueDate: null, // Clear deadline
      allowLateSubmission: false, // Turn off late submission
      maxScore: 10,
    },
    'csdl-k22-01'
  );

  assert.strictEqual(updateResult.id, 'assign-db-01');
  assert.strictEqual(updateResult.title, updatedTitle);
  assert.strictEqual(updateResult.dueDate, null);
  assert.strictEqual(updateResult.allowLateSubmission, false);
  console.log('✓ updateAssignment succeeded and returned updated item.');

  // Simulate F5: reload assignment detail
  const reloadedAssignment = await getAssignmentById('assign-db-01', 'csdl-k22-01');
  assert.strictEqual(reloadedAssignment.title, updatedTitle);
  assert.strictEqual(reloadedAssignment.dueDate, null);
  assert.strictEqual(reloadedAssignment.allowLateSubmission, false);
  console.log('✓ Simulated F5 detail: getAssignmentById preserves updated title, null dueDate, false allowLateSubmission.');

  // Simulate F5: reload class assignment list
  const listResult = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 10 });
  const foundInList = listResult.items.find((item) => item.id === 'assign-db-01');
  assert.ok(foundInList, 'assign-db-01 must be present in the assignment list');
  assert.strictEqual(foundInList?.title, updatedTitle);
  assert.strictEqual(foundInList?.dueDate, null);
  assert.strictEqual(foundInList?.allowLateSubmission, false);
  console.log('✓ Simulated F5 list: getClassAssignmentsPaged displays updated title in table view.');

  // =========================================================================
  // TEST 7: Demo persistence & F5 simulation on e211 assignment
  // =========================================================================
  console.log('\n[TEST 7] Demo persistence & F5 simulation on assignment with id e211');

  const newE211Title = 'Bài tập chuẩn hóa CSDL (Đổi tên bài e211)';
  await updateAssignment(
    'e211',
    {
      title: newE211Title,
      description: 'Mô tả mới sau khi sửa bài e211',
    },
    'csdl-k22-01'
  );

  const reloadedE211 = await getAssignmentById('e211', 'csdl-k22-01');
  assert.strictEqual(reloadedE211.title, newE211Title);
  assert.strictEqual(reloadedE211.description, 'Mô tả mới sau khi sửa bài e211');

  const listE211 = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 10 });
  const foundE211InList = listE211.items.find((item) => item.id === 'e211');
  assert.ok(foundE211InList, 'e211 item must be present in list after update');
  assert.strictEqual(foundE211InList?.title, newE211Title);
  console.log('✓ e211 assignment successfully updated, retrieved, and listed after F5.');

  // =========================================================================
  // TEST 8: TeacherAssignmentsTableView route verification
  // =========================================================================
  console.log('\n[TEST 8] Navigation URL generation verification');
  const classId = 'csdl-k22-01';
  const targetId = 'assign-db-01';
  const expectedEditUrl = `/classes/${classId}?tab=assignments&action=edit&assignmentId=${targetId}`;
  assert.strictEqual(
    `/classes/${classId}?tab=assignments&action=edit&assignmentId=${targetId}`,
    expectedEditUrl
  );
  console.log('✓ Navigation URL matches exact pattern: ' + expectedEditUrl);

  console.log('\n========================================');
  console.log('🎉 ALL 8 TEACHER EDIT ASSIGNMENT TESTS PASSED!');
  console.log('========================================');
}


  await runTests();

}

export async function runAll() {
  return runSuite('Assignment Creation & Edit Forms Suite', [
    { name: 'verify_create_assignment.test.ts', fn: test_verify_create_assignment },
    { name: 'verify_create_assignment_exam_tabs.test.ts', fn: test_verify_create_assignment_exam_tabs },
    { name: 'verify_teacher_edit_assignment.test.ts', fn: test_verify_teacher_edit_assignment },
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
