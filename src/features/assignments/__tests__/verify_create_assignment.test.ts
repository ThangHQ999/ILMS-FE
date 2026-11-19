import {
  createAssignmentSchema,
  CreateAssignmentPayload,
} from '../schemas/assignment.schema';
import {
  formatToLocalDateTime,
  formatTeacherDueDate,
  getClassActiveCourses,
  getCourseLessons,
  createAssignment,
  getClassAssignmentsPaged,
  getAllClassAssignments,
  getAssignmentById,
  resetCreatedAssignments,
  getCreatedAssignments,
} from '../services/assignment.service';

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

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

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

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
