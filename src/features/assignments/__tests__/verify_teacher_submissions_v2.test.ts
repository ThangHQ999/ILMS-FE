import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { api } from '@/lib/axios';
import { assignmentKeys } from '../constants';
import {
  bulkGradeSubmissions,
  evaluateCanManageClassSubmissions,
  getAssignmentSubmissionsPaged,
} from '../services/assignment.service';
import { validateBatchGradeScore } from '../components/TeacherBulkGradeModal';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...flattenKeys(v as Record<string, unknown>, key));
    } else {
      out.push(key);
    }
  }
  return out.sort();
}

async function runTests() {
  console.log('=== VERIFYING TEACHER SUBMISSIONS LIST V2 ===\n');

  // ------------------------------------------------------------------
  // TEST 1: Score validation rules (0..min(maxScore,100), <=2 significant decimals, empty != 0)
  // ------------------------------------------------------------------
  console.log('Test 1: validateBatchGradeScore...');
  assert.deepStrictEqual(validateBatchGradeScore('0', 10), { valid: true, numericValue: 0 });
  assert.deepStrictEqual(validateBatchGradeScore('10', 10), { valid: true, numericValue: 10 });
  assert.deepStrictEqual(validateBatchGradeScore('8.5', 10), { valid: true, numericValue: 8.5 });
  assert.deepStrictEqual(validateBatchGradeScore('8.25', 10), { valid: true, numericValue: 8.25 });
  assert.deepStrictEqual(validateBatchGradeScore('8.50', 10), { valid: true, numericValue: 8.5 });
  assert.deepStrictEqual(validateBatchGradeScore('7,75', 10), { valid: true, numericValue: 7.75 });
  assert.strictEqual(validateBatchGradeScore('', 10).valid, false);
  assert.strictEqual(validateBatchGradeScore('   ', 10).valid, false);
  assert.strictEqual(validateBatchGradeScore('-0.5', 10).valid, false);
  assert.strictEqual(validateBatchGradeScore('10.01', 10).valid, false);
  assert.strictEqual(validateBatchGradeScore('100.5', 120).valid, false); // capped at 100
  assert.strictEqual(validateBatchGradeScore('8.555', 10).valid, false);
  assert.strictEqual(validateBatchGradeScore('1e1', 10).valid, false);
  console.log('  ✔ PASSED Test 1\n');

  // ------------------------------------------------------------------
  // TEST 2: getAssignmentSubmissionsPaged real UUID contract & multi-page LATE adapter
  // ------------------------------------------------------------------
  console.log('Test 2: getAssignmentSubmissionsPaged real UUID contract & LATE adapter...');
  const realClassId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const realAssignId = '11111111-2222-3333-4444-555555555555';
  const origGet = api.get.bind(api);
  const origPost = api.post.bind(api);

  try {
    // 2a: 200 empty list must return [] cleanly (never fall through to demo!)
    let capturedParams: Record<string, unknown> | undefined;
    (api as unknown as { get: typeof api.get }).get = (async (_url: string, cfg?: { params?: Record<string, unknown> }) => {
      capturedParams = cfg?.params;
      return {
        data: {
          success: true,
          data: {
            items: [],
            pageNumber: 0,
            pageSize: 5,
            totalElements: 0,
            totalPages: 1,
            last: true,
          },
        },
      };
    }) as unknown as typeof api.get;

    const emptyRes = await getAssignmentSubmissionsPaged(realAssignId, {
      classId: realClassId,
      page: 0,
      size: 5,
      sort: 'submittedAt,desc',
    });
    assert.strictEqual(emptyRes.items.length, 0, '200 [] must return 0 items');
    assert.strictEqual(capturedParams?.status, undefined, 'ALL filter must NOT send status param');
    assert.strictEqual(capturedParams?.sort, 'submittedAt,desc');

    // 2b: SUBMITTED filter sends status=SUBMITTED strictly
    await getAssignmentSubmissionsPaged(realAssignId, {
      classId: realClassId,
      status: 'SUBMITTED',
      search: 'Minh',
      page: 0,
      size: 5,
    });
    assert.strictEqual(capturedParams?.status, 'SUBMITTED');
    assert.strictEqual(capturedParams?.search, 'Minh');

    // 2c: LATE adapter fetches across multiple pages & includes GRADED with isLate=true
    const page0Items = [
      { id: 's1', assignmentId: realAssignId, studentName: 'A', status: 'GRADED', isLate: true, score: 0, submittedAt: '2026-11-18T10:00:00' },
      { id: 's2', assignmentId: realAssignId, studentName: 'B', status: 'SUBMITTED', isLate: false, score: null, submittedAt: '2026-11-18T09:00:00' },
      { id: 's3', assignmentId: realAssignId, studentName: 'C', status: 'LATE', isLate: true, score: null, submittedAt: '2026-11-18T08:00:00' },
    ];
    const page1Items = [
      { id: 's4', assignmentId: realAssignId, studentName: 'D', status: 'GRADED', isLate: true, score: 8.5, submittedAt: '2026-11-18T07:00:00' },
      { id: 's5', assignmentId: realAssignId, studentName: 'E', status: 'LATE', isLate: true, score: null, submittedAt: '2026-11-18T06:00:00' },
      { id: 's6', assignmentId: realAssignId, studentName: 'F', status: 'LATE', isLate: true, score: null, submittedAt: '2026-11-18T05:00:00' },
      { id: 's7', assignmentId: realAssignId, studentName: 'G', status: 'LATE', isLate: true, score: null, submittedAt: '2026-11-18T04:00:00' },
    ];

    const fetchedPages: number[] = [];
    (api as unknown as { get: typeof api.get }).get = (async (_url: string, cfg?: { params?: { page?: number; status?: string } }) => {
      assert.strictEqual(cfg?.params?.status, undefined, 'LATE adapter must query unfiltered pages to include GRADED late rows');
      const p = cfg?.params?.page ?? 0;
      fetchedPages.push(p);
      return {
        data: {
          success: true,
          data: {
            items: p === 0 ? page0Items : page1Items,
            pageNumber: p,
            pageSize: 100,
            totalElements: 7,
            totalPages: 2,
            last: p >= 1,
          },
        },
      };
    }) as unknown as typeof api.get;

    const latePage0 = await getAssignmentSubmissionsPaged(realAssignId, {
      classId: realClassId,
      status: 'LATE',
      page: 0,
      size: 5,
    });
    assert.deepStrictEqual(fetchedPages, [0, 1], 'LATE adapter must aggregate all source pages');
    assert.strictEqual(latePage0.totalElements, 6, 'Must include all 6 late items (2 GRADED + 4 LATE)');
    assert.strictEqual(latePage0.items.length, 5);
    assert.strictEqual(latePage0.items[0].id, 's1');
    assert.strictEqual(latePage0.items[0].score, 0);
    assert.strictEqual(latePage0.totalPages, 2);

    const latePage1 = await getAssignmentSubmissionsPaged(realAssignId, {
      classId: realClassId,
      status: 'LATE',
      page: 1,
      size: 5,
    });
    assert.strictEqual(latePage1.items.length, 1);
    assert.strictEqual(latePage1.items[0].id, 's7');
    assert.strictEqual(latePage1.last, true);

    // 2d: HTTP 403 error must propagate cleanly
    (api as unknown as { get: typeof api.get }).get = (async () => {
      const err = new Error('Forbidden') as Error & { response?: { status: number } };
      err.response = { status: 403 };
      throw err;
    }) as unknown as typeof api.get;

    let caught403 = false;
    try {
      await getAssignmentSubmissionsPaged(realAssignId, { classId: realClassId });
    } catch (err: unknown) {
      caught403 = (err as { response?: { status?: number } })?.response?.status === 403;
    }
    assert.strictEqual(caught403, true, '403 must propagate without mock fallback');

    // ------------------------------------------------------------------
    // TEST 3: bulkGradeSubmissions (dedupe, { grades }, 207 partial, incomplete SCHEMA_ERROR)
    // ------------------------------------------------------------------
    console.log('Test 3: bulkGradeSubmissions contract (dedupe, 200/207, strict schema)...');
    let capturedPostUrl = '';
    let capturedPostBody: unknown = null;
    (api as unknown as { post: typeof api.post }).post = (async (url: string, body: unknown) => {
      capturedPostUrl = url;
      capturedPostBody = body;
      return {
        status: 207,
        data: {
          success: true,
          data: {
            totalRequested: 2,
            successCount: 1,
            failedCount: 1,
            successIds: ['sub-1'],
            failedItems: [{ id: 'sub-2', reason: 'Bài nộp đã được chấm bởi giảng viên khác.' }],
          },
        },
      };
    }) as unknown as typeof api.post;

    const batchRes = await bulkGradeSubmissions(
      realAssignId,
      [
        { submissionId: 'sub-1', score: 8.5, feedback: 'Tốt' },
        { submissionId: 'sub-1', score: 9.0 }, // duplicate must be stripped
        { submissionId: 'sub-2', score: 0, feedback: '   ' },
      ],
      realClassId
    );
    assert.strictEqual(capturedPostUrl, `/assignments/${realAssignId}/submissions/grade/batch`);
    const sent = capturedPostBody as { grades: Array<Record<string, unknown>> };
    assert.ok(Array.isArray(sent.grades) && !('items' in sent), 'Body must use { grades: [...] }');
    assert.strictEqual(sent.grades.length, 2, 'Duplicate submissionId must be deduplicated');
    assert.strictEqual(sent.grades[1].score, 0);
    assert.strictEqual(sent.grades[1].feedback, undefined);
    assert.strictEqual(batchRes.successCount, 1);
    assert.strictEqual(batchRes.failedCount, 1);
    assert.deepStrictEqual(batchRes.successIds, ['sub-1']);
    assert.strictEqual(batchRes.failedItems[0].id, 'sub-2');

    // Incomplete response must throw SCHEMA_ERROR (never assume all succeeded!)
    (api as unknown as { post: typeof api.post }).post = (async () => ({
      status: 200,
      data: { success: true, data: { message: 'ok' } },
    })) as unknown as typeof api.post;

    let caughtSchemaErr = false;
    try {
      await bulkGradeSubmissions(realAssignId, [{ submissionId: 'sub-1', score: 8 }], realClassId);
    } catch (err: unknown) {
      caughtSchemaErr = (err as { code?: string })?.code === 'SCHEMA_ERROR';
    }
    assert.strictEqual(caughtSchemaErr, true, 'Missing batch result fields must throw SCHEMA_ERROR');
  } finally {
    (api as unknown as { get: typeof api.get }).get = origGet;
    (api as unknown as { post: typeof api.post }).post = origPost;
  }
  console.log('  ✔ PASSED Tests 2 & 3\n');

  // ------------------------------------------------------------------
  // TEST 4: Permission evaluation (evaluateCanManageClassSubmissions)
  // ------------------------------------------------------------------
  console.log('Test 4: evaluateCanManageClassSubmissions...');
  assert.strictEqual(
    evaluateCanManageClassSubmissions({
      classId: realClassId,
      isDemoTeacherView: true, // role switcher alone MUST NOT grant access!
      isClassInfoLive: true,
      isMembersLive: true,
      user: { id: 'u-student', roleName: 'STUDENT' },
      classInfo: { ownerId: 'u-owner' },
      members: [{ id: 'u-student', role: 'STUDENT', status: 'APPROVED' }],
    }),
    false,
    'Student with role switcher must be denied'
  );
  assert.strictEqual(
    evaluateCanManageClassSubmissions({
      classId: realClassId,
      isClassInfoLive: true,
      isMembersLive: true,
      user: { id: 'u-pending-t', roleName: 'USER' },
      classInfo: { ownerId: 'u-owner' },
      members: [{ id: 'u-pending-t', role: 'TEACHER', status: 'PENDING' }],
    }),
    false,
    'Pending teacher must be denied'
  );
  assert.strictEqual(
    evaluateCanManageClassSubmissions({
      classId: realClassId,
      isClassInfoLive: true,
      isMembersLive: true,
      user: { id: 'u-active-t', roleName: 'USER' },
      classInfo: { ownerId: 'u-owner' },
      members: [{ id: 'u-active-t', role: 'TEACHER', status: 'APPROVED' }],
    }),
    true,
    'Approved class teacher must be allowed'
  );
  assert.strictEqual(
    evaluateCanManageClassSubmissions({
      classId: realClassId,
      isClassInfoLive: false,
      user: { id: 'u-admin', roleName: 'ADMIN' },
    }),
    true,
    'System ADMIN must be allowed'
  );
  assert.strictEqual(
    evaluateCanManageClassSubmissions({
      classId: realClassId,
      isAuthLoading: true,
      user: { id: 'u-owner', roleName: 'USER' },
      classInfo: { ownerId: 'u-owner' },
      isClassInfoLive: true,
    }),
    false,
    'Must deny while auth/class loading'
  );
  console.log('  ✔ PASSED Test 4\n');

  // ------------------------------------------------------------------
  // TEST 5: Query Key Partitioning + i18n Symmetry + Cleanliness Audit
  // ------------------------------------------------------------------
  console.log('Test 5: Query key partitioning, i18n symmetry & component cleanliness...');
  const k1 = JSON.stringify(assignmentKeys.teacherSubmissions(realAssignId, { page: 0 }, 'u1', realClassId));
  const k2 = JSON.stringify(assignmentKeys.teacherSubmissions(realAssignId, { page: 0 }, 'u2', realClassId));
  const k3 = JSON.stringify(assignmentKeys.teacherSubmissions(realAssignId, { page: 1 }, 'u1', realClassId));
  assert.notStrictEqual(k1, k2, 'Query key must partition by userId');
  assert.notStrictEqual(k1, k3, 'Query key must partition by page');

  const viJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../messages/vi.json'), 'utf8'));
  const enJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../messages/en.json'), 'utf8'));
  const viKeys = flattenKeys(viJson.assignments.teacher.submissions);
  const enKeys = flattenKeys(enJson.assignments.teacher.submissions);
  assert.deepStrictEqual(viKeys, enKeys, 'vi.json and en.json teacher.submissions keys must match 100%');

  const pageSrc = fs.readFileSync(
    path.resolve(__dirname, '../components/TeacherAssignmentSubmissionsPageView.tsx'),
    'utf8'
  );
  const modalSrc = fs.readFileSync(
    path.resolve(__dirname, '../components/TeacherBulkGradeModal.tsx'),
    'utf8'
  );

  for (const m of pageSrc.matchAll(/\bt\('([^']+)'/g)) {
    assert.ok(viKeys.includes(m[1]), `Missing i18n key assignments.teacher.submissions.${m[1]}`);
  }
  for (const m of modalSrc.matchAll(/\bt\('([^']+)'/g)) {
    assert.ok(
      viKeys.includes(`modal.${m[1]}`),
      `Missing i18n key assignments.teacher.submissions.modal.${m[1]}`
    );
  }

  assert.ok(!pageSrc.includes('Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)'), 'Must NOT hardcode Stitch assignment title');
  assert.ok(!pageSrc.includes('23:59 – 28/10/2024'), 'Must NOT hardcode Stitch due date');
  assert.ok(!pageSrc.includes('Socratic AI Tutor'), 'Must NOT copy Stitch floating Socratic AI button');
  assert.ok(!pageSrc.includes('Lê Thu Hà'), 'Must NOT contain Stitch mock students');
  assert.ok(pageSrc.includes('data-submissions-hero="navy"'), 'Must render Hero Navy banner');
  console.log(`  ✔ PASSED Test 5 (${viKeys.length} symmetrical i18n keys verified)\n`);

  console.log('=== ALL 5 TEACHER SUBMISSIONS V2 TESTS PASSED 100%! ===');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
