import assert from 'node:assert';
import {
  getExamById,
  updateExam,
  MOCK_EXAMS,
  formatExamPayloadDateTime,
  type ExamNetworkLog,
} from '../services/exam.service';
import type { CreateExamInput } from '../schemas/exam.schema';

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

// Mock window for node environment
if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = globalThis;
}

async function runTests() {
  console.log('--- STARTING TEACHER EDIT EXAM VERIFICATION TESTS ---');

  // Test 1: getExamById retrieves mock / demo exam
  console.log('\n[TEST 1] getExamById with mock exam EXAM_001');
  const exam1 = await getExamById('EXAM_001');
  assert.strictEqual(exam1.id, 'EXAM_001');
  assert.strictEqual(exam1.title, 'Thi giữa kỳ Mạng máy tính');
  assert.strictEqual(exam1.examType, 'MIDTERM');
  assert.strictEqual(exam1.durationMinutes, 60);
  assert.strictEqual(exam1.totalScore, 10);
  assert.strictEqual(exam1.isPublished, true);
  console.log('✓ Successfully retrieved EXAM_001 with correct details.');

  // Test 2: Dirty checking logic simulation
  console.log('\n[TEST 2] Dirty checking & form state toggle');
  const initialValues = {
    examId: 'EXAM_001',
    courseId: exam1.courseId || '',
    examType: exam1.examType || 'MIDTERM',
    title: exam1.title || '',
    description: exam1.description || '',
    durationMinutes: '60',
    totalScore: '10',
    startTime: '2024-11-15T07:30',
    endTime: '2024-11-15T09:00',
  };

  function computeDirty(current: typeof initialValues) {
    const dirty: Record<string, boolean> = {};
    if (current.examType !== initialValues.examType) dirty.examType = true;
    if (current.title.trim() !== initialValues.title.trim()) dirty.title = true;
    if ((current.description || '').trim() !== (initialValues.description || '').trim())
      dirty.description = true;
    if (Number(current.durationMinutes) !== Number(initialValues.durationMinutes))
      dirty.durationMinutes = true;
    if (Number(current.totalScore) !== Number(initialValues.totalScore))
      dirty.totalScore = true;
    if (current.startTime !== initialValues.startTime) dirty.startTime = true;
    if (current.endTime !== initialValues.endTime) dirty.endTime = true;
    return dirty;
  }

  // Initial state -> NOT dirty
  let dirty = computeDirty(initialValues);
  assert.strictEqual(Object.keys(dirty).length, 0, 'Initial state must have 0 dirty fields');
  console.log('✓ Initial state is not dirty (button disabled).');

  // User edits title
  let edited = { ...initialValues, title: 'Thi giữa kỳ Mạng máy tính (Cập nhật 2024)' };
  dirty = computeDirty(edited);
  assert.strictEqual(Object.keys(dirty).length, 1);
  assert.strictEqual(dirty.title, true);
  console.log('✓ Editing title triggers dirty state (button enabled).');

  // User reverts title back to original
  edited = { ...initialValues, title: 'Thi giữa kỳ Mạng máy tính' };
  dirty = computeDirty(edited);
  assert.strictEqual(Object.keys(dirty).length, 0);
  console.log('✓ Reverting title back locks button (dirty reverted to false).');

  // User edits duration and totalScore
  edited = { ...initialValues, durationMinutes: '90', totalScore: '100' };
  dirty = computeDirty(edited);
  assert.strictEqual(Object.keys(dirty).length, 2);
  assert.strictEqual(dirty.durationMinutes, true);
  assert.strictEqual(dirty.totalScore, true);
  console.log('✓ Editing duration & totalScore correctly tracks only those 2 dirty fields.');

  // Test 3: Validation logic (Date range, duration constraint, max score)
  console.log('\n[TEST 3] Validation rules');
  function validate(val: typeof initialValues) {
    const errors: Record<string, string> = {};
    if (!val.title.trim()) errors.title = 'Tên bài thi là bắt buộc';
    const durNum = Number(val.durationMinutes);
    if (!val.durationMinutes || isNaN(durNum) || durNum <= 0)
      errors.durationMinutes = 'Thời lượng phải là số nguyên dương';
    const scoreNum = Number(val.totalScore);
    if (!val.totalScore || isNaN(scoreNum) || scoreNum <= 0 || scoreNum > 100)
      errors.totalScore = 'Tổng điểm phải lớn hơn 0 và tối đa 100';
    if (val.startTime && val.endTime) {
      const s = new Date(val.startTime).getTime();
      const e = new Date(val.endTime).getTime();
      if (e <= s) {
        errors.endTime = 'Giờ đóng phải sau giờ mở';
      } else if (durNum > 0 && e - s < durNum * 60 * 1000) {
        errors.endTime = 'Khoảng thời gian mở phải đủ thời lượng làm bài';
      }
    }
    return errors;
  }

  // Valid inputs
  assert.strictEqual(Object.keys(validate(initialValues)).length, 0);

  // Invalid: endTime before startTime
  const invalidTime = {
    ...initialValues,
    startTime: '2024-11-15T09:00',
    endTime: '2024-11-15T07:30',
  };
  const timeErrors = validate(invalidTime);
  assert.strictEqual(timeErrors.endTime, 'Giờ đóng phải sau giờ mở');
  console.log('✓ Catches endTime before startTime correctly.');

  // Invalid: window duration (30 mins) < exam duration (60 mins)
  const invalidWindow = {
    ...initialValues,
    durationMinutes: '60',
    startTime: '2024-11-15T07:30',
    endTime: '2024-11-15T08:00', // only 30 min window
  };
  const windowErrors = validate(invalidWindow);
  assert.strictEqual(windowErrors.endTime, 'Khoảng thời gian mở phải đủ thời lượng làm bài');
  console.log('✓ Catches insufficient window duration correctly.');

  // Invalid: totalScore > 100
  const invalidScore = { ...initialValues, totalScore: '150' };
  const scoreErrors = validate(invalidScore);
  assert.strictEqual(scoreErrors.totalScore, 'Tổng điểm phải lớn hơn 0 và tối đa 100');
  console.log('✓ Catches totalScore > 100 correctly.');

  // Test 4: formatExamPayloadDateTime converts YYYY-MM-DDTHH:mm to yyyy-MM-ddTHH:mm:ss
  console.log('\n[TEST 4] DateTime payload formatting');
  const formattedStart = formatExamPayloadDateTime('2024-11-15T07:30');
  assert.strictEqual(formattedStart, '2024-11-15T07:30:00');
  console.log('✓ formatExamPayloadDateTime formatted to yyyy-MM-ddTHH:mm:ss:', formattedStart);

  // Test 5: Real backend PATCH call to verify payload and 401 unauthenticated response
  console.log('\n[TEST 5] Backend API call (PATCH /api/v1/exams/{id})');
  const testExamId = '00000000-0000-4000-8000-000000000001';
  const dirtyPayload: Partial<CreateExamInput> = {
    title: 'Thi thử nghiệm API PATCH',
    durationMinutes: 45,
    startTime: '2024-11-20T08:00',
    endTime: '2024-11-20T10:00',
  };

  try {
    await updateExam(testExamId, dirtyPayload);
    console.log('Unexpected success for unauthenticated PATCH call');
  } catch (err: unknown) {
    const lastLog = (
      globalThis as unknown as { window?: { __lastExamUpdateCall?: ExamNetworkLog } }
    ).window?.__lastExamUpdateCall;

    assert.ok(lastLog, 'Network log must be recorded in window.__lastExamUpdateCall');
    assert.strictEqual(lastLog.url, `/exams/${testExamId}`);
    assert.strictEqual(
      lastLog.fullUrl,
      `https://api.ilms.page/api/v1/exams/${testExamId}`
    );
    assert.strictEqual(lastLog.httpStatus, 401);
    assert.strictEqual(lastLog.success, false);
    assert.deepStrictEqual(lastLog.payload, {
      title: 'Thi thử nghiệm API PATCH',
      durationMinutes: 45,
      startTime: '2024-11-20T08:00:00',
      endTime: '2024-11-20T10:00:00',
    });
    console.log('✓ Successfully intercepted PATCH call:');
    console.log('  URL:', lastLog.fullUrl);
    console.log('  HTTP Status:', lastLog.httpStatus);
    console.log('  Payload sent (dirty fields only):', JSON.stringify(lastLog.payload));
  }

  // Test 6: Demo exam update persistence across F5 simulation
  console.log('\n[TEST 6] Demo exam update and persistence across F5');
  const demoClassId = 'csdl-k22-01';
  const updatedDemo = await updateExam(
    'EXAM_001',
    {
      title: 'Thi giữa kỳ Mạng máy tính (Đã chỉnh sửa)',
      durationMinutes: 75,
      totalScore: 10,
    },
    demoClassId
  );
  assert.strictEqual(updatedDemo.title, 'Thi giữa kỳ Mạng máy tính (Đã chỉnh sửa)');
  assert.strictEqual(updatedDemo.durationMinutes, 75);
  assert.strictEqual(updatedDemo.isPublished, true); // Published state preserved!

  // Simulate F5 reload by calling getExamById from fresh cache
  const reloadedExam = await getExamById('EXAM_001', demoClassId);
  assert.strictEqual(
    reloadedExam.title,
    'Thi giữa kỳ Mạng máy tính (Đã chỉnh sửa)',
    'Updated title must be preserved across page reload'
  );
  assert.strictEqual(
    reloadedExam.durationMinutes,
    75,
    'Updated duration must be preserved across page reload'
  );
  assert.strictEqual(
    reloadedExam.isPublished,
    true,
    'Publication state must be preserved'
  );
  console.log('✓ Demo exam successfully updated and preserved in local storage across F5.');

  console.log('\n=== ALL TEACHER EDIT EXAM TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
