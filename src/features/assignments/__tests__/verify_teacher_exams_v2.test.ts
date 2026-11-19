import fs from 'fs';
import path from 'path';
import { api } from '@/lib/axios';
import {
  examItemSchema,
  normalizeExamStatus,
  normalizeExamType,
} from '../schemas/exam.schema';
import {
  deleteExam,
  evaluateCanManageClassExams,
  filterAndPaginateMockExams,
  formatExamLocalDate,
  formatExamLocalDateTime,
  publishExam,
  resetCreatedExams,
  unpublishExam,
} from '../services/exam.service';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

// Node localStorage mock
const storage: Record<string, string> = {};
(globalThis as unknown as { window: unknown }).window = globalThis;
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => storage[k] ?? null,
    setItem: (k: string, v: string) => {
      storage[k] = v;
    },
    removeItem: (k: string) => {
      delete storage[k];
    },
    clear: () => {
      for (const k of Object.keys(storage)) delete storage[k];
    },
    key: (i: number) => Object.keys(storage)[i] ?? null,
    length: Object.keys(storage).length,
  };
}

async function runTeacherExamsV2Tests() {
  console.log('=== VERIFYING TEACHER EXAMS LIST V2 ===\n');

  // ------------------------------------------------------------------
  // Test 1: Schema strictness (no fabricated defaults, updatedAt, LocalDateTime)
  // ------------------------------------------------------------------
  console.log('Test 1: Schema strictness & LocalDateTime formatting...');
  const parsedMinimal = examItemSchema.parse({
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Đề thi tối giản chưa công bố',
    examType: 'COMPETITION',
    status: 'OPENING',
    isPublished: false,
    questionCount: 0,
    createdAt: '2026-11-10T09:15:00',
    updatedAt: '2026-11-18T14:30:00',
  });
  assert(parsedMinimal.examType === 'CONTEST', 'COMPETITION must normalize to CONTEST');
  assert(parsedMinimal.status === 'OPEN', 'OPENING must normalize to OPEN');
  assert(parsedMinimal.isPublished === false, 'isPublished=false must stay false');
  assert(parsedMinimal.questionCount === 0, 'questionCount=0 must be preserved');
  assert(parsedMinimal.durationMinutes === undefined, 'durationMinutes must not default to 60');
  assert(parsedMinimal.totalScore === undefined, 'totalScore must not default to 10');
  assert(parsedMinimal.updatedAt === '2026-11-18T14:30:00', 'updatedAt must be parsed');

  const parsedMissingPublish = examItemSchema.parse({
    id: '22222222-2222-4222-8222-222222222222',
    title: 'Đề thi thiếu isPublished',
    examType: 'QUIZ',
    status: 'UPCOMING',
  });
  assert(
    parsedMissingPublish.isPublished === undefined,
    'Missing isPublished must NOT default to true'
  );

  assert(
    formatExamLocalDate('2026-11-18T00:05:00') === '18/11/2026',
    'formatExamLocalDate must preserve LocalDateTime day without UTC shift'
  );
  assert(formatExamLocalDate(null) === '--', 'formatExamLocalDate(null) must return --');
  assert(
    formatExamLocalDateTime('2026-11-18T07:30:00') === '07:30 – 18/11/2026',
    'formatExamLocalDateTime must preserve HH:mm – DD/MM/YYYY'
  );
  assert(normalizeExamType('COMPETITION') === 'CONTEST', 'normalizeExamType adapter');
  assert(normalizeExamStatus('OPENING') === 'OPEN', 'normalizeExamStatus adapter');
  console.log('  ✔ PASSED Test 1\n');

  // ------------------------------------------------------------------
  // Test 2: Real API contract for publish, unpublish, delete (empty body, 204, no fake fallback)
  // ------------------------------------------------------------------
  console.log('Test 2: Real UUID API contract for publishExam / unpublishExam / deleteExam...');
  const origPatch = api.patch;
  const origDelete = api.delete;
  const realClassId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const realExamId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  try {
    let lastPatchArgs: unknown[] = [];
    (api as unknown as { patch: (...args: unknown[]) => Promise<unknown> }).patch = async (
      ...args: unknown[]
    ) => {
      lastPatchArgs = args;
      if (String(args[0]).endsWith('/publish')) {
        return {
          data: {
            data: {
              id: realExamId,
              title: 'Kỳ thi CSDL',
              examType: 'MIDTERM',
              status: 'UPCOMING',
              isPublished: true,
              questionCount: 12,
              durationMinutes: 45,
              totalScore: 20,
              startTime: '2026-12-01T08:00:00',
              endTime: '2026-12-01T09:00:00',
              createdAt: '2026-11-10T10:00:00',
              updatedAt: '2026-11-18T15:00:00',
            },
          },
        };
      }
      return {
        data: {
          data: {
            id: realExamId,
            title: 'Kỳ thi CSDL',
            examType: 'MIDTERM',
            status: 'UPCOMING',
            isPublished: false,
            questionCount: 12,
            durationMinutes: 45,
            totalScore: 20,
            startTime: '2026-12-01T08:00:00',
            endTime: '2026-12-01T09:00:00',
          },
        },
      };
    };

    // Publish sends empty body (only 1 arg) and returns parsed ExamDetail
    const published = await publishExam(realExamId, realClassId);
    assert(lastPatchArgs.length === 1, 'publishExam must send empty body (no payload object)');
    assert(lastPatchArgs[0] === `/exams/${realExamId}/publish`, 'publish endpoint path');
    assert(published.isPublished === true, 'publishExam must return isPublished=true');
    assert(published.status === 'UPCOMING', 'publishExam must preserve schedule status');

    // Unpublish sends empty body and keeps schedule status independent
    const unpublished = await unpublishExam(realExamId, realClassId);
    assert(lastPatchArgs.length === 1, 'unpublishExam must send empty body');
    assert(lastPatchArgs[0] === `/exams/${realExamId}/unpublish`, 'unpublish endpoint path');
    assert(unpublished.isPublished === false, 'unpublishExam must return isPublished=false');
    assert(
      unpublished.status === 'UPCOMING',
      'unpublishExam must NOT overwrite schedule status'
    );

    // Publish error (400/409) on real UUID MUST throw and NOT fall back to localStorage
    (api as unknown as { patch: (...args: unknown[]) => Promise<unknown> }).patch = async () => {
      const err = new Error('Tổng điểm câu hỏi chưa khớp totalScore') as Error & {
        httpStatus?: number;
        response?: { status?: number; data?: { message?: string } };
      };
      err.httpStatus = 409;
      err.response = { status: 409, data: { message: 'Tổng điểm câu hỏi chưa khớp totalScore' } };
      throw err;
    };

    let publishConflictCaught = false;
    try {
      await publishExam(realExamId, realClassId);
    } catch (e) {
      publishConflictCaught = true;
      assert(
        (e as { httpStatus?: number }).httpStatus === 409,
        '409 error must be propagated intact'
      );
    }
    assert(publishConflictCaught, 'Real UUID publishExam MUST throw on 409 without local fallback');

    // Delete 204 empty body succeeds cleanly
    let lastDeleteUrl = '';
    (api as unknown as { delete: (url: string) => Promise<unknown> }).delete = async (
      url: string
    ) => {
      lastDeleteUrl = url;
      return { status: 204, data: '' };
    };
    await deleteExam(realExamId, realClassId);
    assert(lastDeleteUrl === `/exams/${realExamId}`, 'deleteExam must call /exams/{examId}');

    // Delete 409 on real UUID MUST throw (never locally delete)
    (api as unknown as { delete: () => Promise<unknown> }).delete = async () => {
      const err = new Error('Bài thi đã có lượt làm bài, không thể xóa') as Error & {
        httpStatus?: number;
        response?: { status?: number; data?: { message?: string } };
      };
      err.httpStatus = 409;
      err.response = {
        status: 409,
        data: { message: 'Bài thi đã có lượt làm bài, không thể xóa' },
      };
      throw err;
    };
    let deleteConflictCaught = false;
    try {
      await deleteExam(realExamId, realClassId);
    } catch (e) {
      deleteConflictCaught = true;
      assert(
        (e as { httpStatus?: number }).httpStatus === 409,
        'Delete 409 must be propagated intact'
      );
    }
    assert(deleteConflictCaught, 'Real UUID deleteExam MUST throw on 409');
  } finally {
    api.patch = origPatch;
    api.delete = origDelete;
  }

  // Demo delete persistence check
  resetCreatedExams();
  const beforeDemoDelete = filterAndPaginateMockExams({ page: 0, size: 10 }, 'csdl-k22-01');
  assert(beforeDemoDelete.totalElements === 3, 'Demo class starts with 3 exams');
  // Simulate demo delete via offline fallback
  (api as unknown as { delete: () => Promise<unknown> }).delete = async () => {
    throw new Error('offline');
  };
  try {
    await deleteExam('EXAM_003', 'csdl-k22-01');
  } finally {
    api.delete = origDelete;
  }
  const afterDemoDelete = filterAndPaginateMockExams({ page: 0, size: 10 }, 'csdl-k22-01');
  assert(afterDemoDelete.totalElements === 2, 'Demo delete removes EXAM_003');
  assert(
    !afterDemoDelete.items.some((e) => e.id === 'EXAM_003'),
    'EXAM_003 must remain deleted on reload'
  );
  resetCreatedExams();
  console.log('  ✔ PASSED Test 2\n');

  // ------------------------------------------------------------------
  // Test 3: Real Class Management Permission Guard
  // ------------------------------------------------------------------
  console.log('Test 3: Strict class permission evaluation (evaluateCanManageClassExams)...');
  const uuidClass = '12345678-1234-4123-8123-123456789abc';

  // Outside teacher with teacher UI view ON, NOT owner/member/admin -> DENIED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isDemoTeacherView: true,
      isClassInfoLive: true,
      isMembersLive: true,
      user: { id: 'teacher-outside-01', roleName: 'ROLE_USER' },
      classInfo: { ownerId: 'owner-other-99', instructor: { id: 'owner-other-99' } },
      members: [{ id: 'owner-other-99', role: 'OWNER', status: 'APPROVED' }],
    }) === false,
    'Outside teacher must NOT get write permission'
  );

  // Fallback mock class info on real UUID -> DENIED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isDemoTeacherView: true,
      isClassInfoLive: false,
      isMembersLive: false,
      user: { id: 'owner-01', roleName: 'ROLE_USER' },
      classInfo: { ownerId: 'owner-01' },
      members: [{ id: 'owner-01', role: 'OWNER', status: 'APPROVED' }],
    }) === false,
    'Non-live/fallback class data must NOT grant write permission on real UUID class'
  );

  // Pending teacher member -> DENIED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isClassInfoLive: true,
      isMembersLive: true,
      user: { id: 'teacher-pending', roleName: 'ROLE_USER' },
      classInfo: { ownerId: 'owner-other-99' },
      members: [{ id: 'teacher-pending', role: 'TEACHER', status: 'PENDING' }],
    }) === false,
    'Pending teacher member must NOT get write permission'
  );

  // Real class owner -> ALLOWED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isClassInfoLive: true,
      isMembersLive: false,
      user: { id: 'owner-01', roleName: 'ROLE_USER' },
      classInfo: { ownerId: 'owner-01' },
      members: [],
    }) === true,
    'Real class owner must get write permission'
  );

  // Approved class teacher member -> ALLOWED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isClassInfoLive: true,
      isMembersLive: true,
      user: { id: 'teacher-in-class', roleName: 'ROLE_USER' },
      classInfo: { ownerId: 'owner-other-99' },
      members: [{ id: 'teacher-in-class', role: 'TEACHER', status: 'APPROVED' }],
    }) === true,
    'Approved teacher in class must get write permission'
  );

  // System Admin -> ALLOWED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isClassInfoLive: true,
      user: { id: 'admin-01', roleName: 'ROLE_ADMIN' },
      classInfo: { ownerId: 'owner-other-99' },
      members: [],
    }) === true,
    'System admin must get write permission'
  );

  // Student view even for owner -> DENIED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: true,
      isClassInfoLive: true,
      user: { id: 'owner-01', roleName: 'ROLE_ADMIN' },
      classInfo: { ownerId: 'owner-01' },
    }) === false,
    'Student view must never grant teacher write permission'
  );

  // Demo class with teacher role -> ALLOWED
  assert(
    evaluateCanManageClassExams({
      classId: 'csdl-k22-01',
      isStudentView: false,
      isDemoTeacherView: true,
    }) === true,
    'Demo class preserves demo teacher workflow'
  );
  console.log('  ✔ PASSED Test 3\n');

  // ------------------------------------------------------------------
  // Test 4: i18n Key Parity (vi.json === en.json)
  // ------------------------------------------------------------------
  console.log('Test 4: Verify i18n key parity for assignments.exams.teacher...');
  const viJson = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'src/messages/vi.json'), 'utf8')
  );
  const enJson = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'src/messages/en.json'), 'utf8')
  );
  const viKeys = Object.keys(viJson.assignments.exams.teacher).sort();
  const enKeys = Object.keys(enJson.assignments.exams.teacher).sort();
  assert(viKeys.length > 50, `Expected >50 i18n keys, got ${viKeys.length}`);
  assert(
    JSON.stringify(viKeys) === JSON.stringify(enKeys),
    'vi.json and en.json assignments.exams.teacher keys must match 100%'
  );
  for (const k of viKeys) {
    assert(
      typeof viJson.assignments.exams.teacher[k] === 'string' &&
        viJson.assignments.exams.teacher[k].trim().length > 0,
      `vi.json key ${k} must be non-empty`
    );
    assert(
      typeof enJson.assignments.exams.teacher[k] === 'string' &&
        enJson.assignments.exams.teacher[k].trim().length > 0,
      `en.json key ${k} must be non-empty`
    );
  }
  console.log(`  ✔ PASSED Test 4 (${viKeys.length} symmetrical keys)\n`);

  // ------------------------------------------------------------------
  // Test 5: Source Code Contract & Scope Audit
  // ------------------------------------------------------------------
  console.log('Test 5: Audit TeacherExamsTableView & integration files...');
  const viewCode = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/assignments/components/TeacherExamsTableView.tsx'),
    'utf8'
  );
  const assignmentsCode = fs.readFileSync(
    path.resolve(
      process.cwd(),
      'src/features/assignments/components/TeacherAssignmentsTableView.tsx'
    ),
    'utf8'
  );
  const classDetailCode = fs.readFileSync(
    path.resolve(
      process.cwd(),
      'src/features/classes/components/detail/ClassDetailPageView.tsx'
    ),
    'utf8'
  );

  const primitivesCode = fs.readFileSync(
    path.resolve(
      process.cwd(),
      'src/features/assignments/components/AssessmentListPrimitives.tsx'
    ),
    'utf8'
  );
  assert(
    viewCode.includes('AssessmentTwoColumnLayout') &&
      primitivesCode.includes('lg:grid-cols-[minmax(0,1fr)_260px]'),
    'Must use unified 2-column desktop layout (minmax(0,1fr) + 260px aside)'
  );
  assert(viewCode.includes('useVisibleExamDetails'), 'Must enrich visible cards via useVisibleExamDetails');
  assert(viewCode.includes('usePublishExam') && viewCode.includes('useUnpublishExam') && viewCode.includes('useDeleteExam'), 'Must wire real publish, unpublish, and delete hooks');
  assert(!viewCode.includes('Đang phát triển'), 'Must NOT contain placeholder "Đang phát triển" actions');
  assert(!viewCode.includes('Xem dữ liệu mẫu'), 'Must NOT contain fallback "Xem dữ liệu mẫu" button');
  assert(!viewCode.includes("'COMPETITION'") && !viewCode.includes("'OPENING'"), 'Must NOT use legacy COMPETITION or OPENING filter values');
  assert(viewCode.includes('more_horiz') && viewCode.includes('aria-haspopup="menu"') && viewCode.includes("e.key === 'Escape'"), 'Must have accessible ... menu with Escape close & focus restore');
  assert(viewCode.includes('unpublishExamModalTitle') && viewCode.includes('deleteExamModalTitle'), 'Must render confirmation modals for unpublish and delete');
  assert(viewCode.includes('policyPanelTitle'), 'Must render "Quy chế công bố bài thi" policy panel');
  assert(viewCode.includes('pageSize = 5'), 'Must enforce 5 exams per page including featured hero');
  assert(assignmentsCode.includes('canManageExams={canManageExams}'), 'TeacherAssignmentsTableView must pass canManageExams');
  assert(classDetailCode.includes('evaluateCanManageClassExams'), 'ClassDetailPageView must evaluate real class exam permissions');
  console.log('  ✔ PASSED Test 5\n');

  console.log('================================================================');
  console.log('ALL 5 TEACHER EXAMS V2 VERIFICATION TESTS PASSED!');
  console.log('================================================================');
}

runTeacherExamsV2Tests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
