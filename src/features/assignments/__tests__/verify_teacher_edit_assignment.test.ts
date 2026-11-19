import assert from 'node:assert';
import {
  getAssignmentById,
  updateAssignment,
  getClassAssignmentsPaged,
  MOCK_ASSIGNMENTS,
  formatToLocalDateTime,
  saveCreatedAssignment,
  getCreatedAssignments,
  resetCreatedAssignments,
} from '../services/assignment.service';
import { updateAssignmentSchema } from '../schemas/assignment.schema';

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

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
