import fs from 'fs';
import path from 'path';
import { api } from '@/lib/axios';
import {
  getSubmissionGrading,
  gradeSubmission,
  deleteGrading,
  evaluateCanModifyGrading,
} from '../services/assignment.service';
import { submissionGradingSchema } from '../schemas/assignment.schema';
import { assignmentKeys } from '../constants';
import viJson from '../../../messages/vi.json';
import enJson from '../../../messages/en.json';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

function collectKeys(obj: unknown, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return prefix ? [prefix] : [];
  }
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v, next));
    } else {
      keys.push(next);
    }
  }
  return keys.sort();
}

async function runTests() {
  console.log('=== VERIFYING TEACHER SUBMISSION GRADED STATE V2 ===\n');

  // Test 1: submissionGradingSchema preserves 0 and never turns null into 0
  console.log('Test 1: submissionGradingSchema truthfulness...');
  const parsedZero = submissionGradingSchema.parse({
    id: '99999999-9999-4999-8999-999999999991',
    submissionId: '55555555-5555-4555-8555-555555555551',
    graderId: '33333333-3333-4333-8333-333333333333',
    graderName: 'TS. Phạm Thu Thảo',
    score: 0,
    feedback: null,
    gradedAt: '2026-11-18T10:00:00Z',
    correctAnswersCount: 0,
    scaledScore: 0,
  });
  assert(parsedZero.score === 0, 'Score 0 must be preserved');
  assert(parsedZero.correctAnswersCount === 0, 'correctAnswersCount 0 must be preserved');
  assert(parsedZero.scaledScore === 0, 'scaledScore 0 must be preserved');
  assert(parsedZero.feedback === null, 'feedback null must stay null');

  const parsedNullScore = submissionGradingSchema.parse({
    id: '99999999-9999-4999-8999-999999999992',
    score: null,
    correctAnswersCount: null,
    scaledScore: null,
  });
  assert(parsedNullScore.score === null, 'null score must NEVER become 0');
  assert(parsedNullScore.correctAnswersCount === null, 'null correctAnswersCount must stay null');
  assert(parsedNullScore.scaledScore === null, 'null scaledScore must stay null');
  console.log('  ✔ PASSED Test 1\n');

  // Test 2: getSubmissionGrading real UUID contract (200, 404 -> null, 500/403/SCHEMA_ERROR -> throw)
  console.log('Test 2: getSubmissionGrading real UUID contract...');
  const origGet = api.get;
  const origPatch = api.patch;
  const origDelete = api.delete;
  const realClassId = '11111111-1111-4111-8111-111111111111';
  const realAssignId = '22222222-2222-4222-8222-222222222222';
  const realSubId = '55555555-5555-4555-8555-555555555551';
  const realGradingId = '88888888-8888-4888-8888-888888888881';

  try {
    let getUrl = '';
    (api as unknown as { get: (u: string) => Promise<unknown> }).get = async (url) => {
      getUrl = url;
      return {
        data: {
          data: {
            id: realGradingId,
            submissionId: realSubId,
            graderId: '33333333-3333-4333-8333-333333333333',
            graderName: 'PGS.TS. Đặng Hoàng Minh',
            score: 8.5,
            feedback: 'Tốt',
            gradedAt: '2026-11-18T11:00:00Z',
            correctAnswersCount: 8,
            scaledScore: 8.5,
          },
        },
      };
    };
    const g = await getSubmissionGrading(realSubId, realAssignId, realClassId);
    assert(getUrl === `/submissions/${realSubId}/grading`, `Expected GET /submissions/{id}/grading, got ${getUrl}`);
    assert(
      g?.id === realGradingId && g?.submissionId === realSubId,
      'gradingId must come from GradingResponse.id and stay distinct from submissionId'
    );

    // 404 -> returns null cleanly
    (api as unknown as { get: () => Promise<unknown> }).get = async () => {
      const err = new Error('Not found') as Error & { httpStatus?: number };
      err.httpStatus = 404;
      throw err;
    };
    const notFoundResult = await getSubmissionGrading(realSubId, realAssignId, realClassId);
    assert(notFoundResult === null, '404 on GET grading must return null');

    // 500 -> MUST throw (never treat as ungraded null!)
    (api as unknown as { get: () => Promise<unknown> }).get = async () => {
      const err = new Error('Server error') as Error & { httpStatus?: number };
      err.httpStatus = 500;
      throw err;
    };
    let serverErrCaught = false;
    try {
      await getSubmissionGrading(realSubId, realAssignId, realClassId);
    } catch (e) {
      serverErrCaught = (e as { httpStatus?: number }).httpStatus === 500;
    }
    assert(serverErrCaught, '500 on GET grading must throw (never treated as ungraded)');
    console.log('  ✔ PASSED Test 2\n');

    // Test 3: gradeSubmission explicit feedback: null vs omitted feedback
    console.log('Test 3: gradeSubmission feedback: null vs omitted vs multiline...');
    let lastPatchBody: Record<string, unknown> = {};
    (api as unknown as { patch: (u: string, b: Record<string, unknown>) => Promise<unknown> }).patch = async (
      _u,
      body
    ) => {
      lastPatchBody = body;
      return {
        data: {
          data: {
            id: realSubId,
            assignmentId: realAssignId,
            status: 'GRADED',
            score: body.score,
            feedback: body.feedback ?? null,
          },
        },
      };
    };

    // Unchanged feedback -> omitted
    await gradeSubmission(realSubId, { score: 9.25 }, realAssignId, realClassId);
    assert(
      !('feedback' in lastPatchBody) && lastPatchBody.score === 9.25,
      'Omitted feedback must not appear in PATCH payload'
    );

    // Actively clearing feedback -> explicit feedback: null preserved in JSON
    await gradeSubmission(realSubId, { score: 8.5, feedback: null }, realAssignId, realClassId);
    assert(
      'feedback' in lastPatchBody && lastPatchBody.feedback === null,
      'Explicit feedback: null must be preserved in PATCH payload'
    );
    assert(
      JSON.stringify(lastPatchBody) === '{"score":8.5,"feedback":null}',
      `Expected exact JSON with feedback:null, got ${JSON.stringify(lastPatchBody)}`
    );

    // Multiline feedback -> preserved verbatim, no extra fields
    await gradeSubmission(realSubId, { score: 7.5, feedback: 'Dòng 1\nDòng 2' }, realAssignId, realClassId);
    assert(
      Object.keys(lastPatchBody).sort().join(',') === 'feedback,score' &&
        lastPatchBody.feedback === 'Dòng 1\nDòng 2',
      'Multiline feedback must be preserved without extra fields'
    );
    console.log('  ✔ PASSED Test 3\n');

    // Test 4: deleteGrading strictly calls DELETE /gradings/{gradingId} & handles 204 empty body
    console.log('Test 4: deleteGrading contract (DELETE /gradings/{gradingId}, 204 empty body)...');
    let deletedUrl = '';
    (api as unknown as { delete: (u: string) => Promise<unknown> }).delete = async (url) => {
      deletedUrl = url;
      return { status: 204, data: '' };
    };
    await deleteGrading(realGradingId, realSubId, realAssignId, realClassId);
    assert(deletedUrl === `/gradings/${realGradingId}`, `Expected DELETE /gradings/{gradingId}, got ${deletedUrl}`);
    assert(!deletedUrl.includes(realSubId), 'DELETE must NEVER target submissionId');

    // Empty gradingId must reject before API call
    let invalidIdCaught = false;
    try {
      await deleteGrading('   ', realSubId, realAssignId, realClassId);
    } catch {
      invalidIdCaught = true;
    }
    assert(invalidIdCaught, 'Blank gradingId must throw');
    console.log('  ✔ PASSED Test 4\n');
  } finally {
    api.get = origGet;
    api.patch = origPatch;
    api.delete = origDelete;
  }

  // Test 5: evaluateCanModifyGrading strict ID-based rules
  console.log('Test 5: evaluateCanModifyGrading strict ID-based permission rules...');
  const sampleGrading = {
    id: realGradingId,
    submissionId: realSubId,
    graderId: 'teacher-A',
    graderName: 'TS. A',
    score: 8,
    feedback: 'OK',
  };

  // Current grader with active class permission -> allowed
  const pGrader = evaluateCanModifyGrading({
    classId: realClassId,
    canManageClassSubmissions: true,
    isAuthLoading: false,
    isGradingLoading: false,
    isGradingError: false,
    user: { id: 'teacher-A', roleName: 'ROLE_USER' },
    grading: sampleGrading,
  });
  assert(pGrader.canEdit && pGrader.canDelete, 'Current grader with class permission must be allowed');

  // Class owner / another teacher who is NOT current grader -> read-only!
  const pOtherTeacher = evaluateCanModifyGrading({
    classId: realClassId,
    canManageClassSubmissions: true,
    isAuthLoading: false,
    isGradingLoading: false,
    isGradingError: false,
    user: { id: 'class-owner-B', roleName: 'ROLE_USER' },
    grading: sampleGrading,
  });
  assert(
    !pOtherTeacher.canEdit && !pOtherTeacher.canDelete && pOtherTeacher.reason === 'NOT_GRADER',
    'Class owner who is not current grader must NOT get edit/delete permission'
  );

  // Grader who lost class permission -> blocked!
  const pLostClassPerm = evaluateCanModifyGrading({
    classId: realClassId,
    canManageClassSubmissions: false,
    isAuthLoading: false,
    isGradingLoading: false,
    isGradingError: false,
    user: { id: 'teacher-A', roleName: 'ROLE_USER' },
    grading: sampleGrading,
  });
  assert(
    !pLostClassPerm.canEdit && !pLostClassPerm.canDelete,
    'Grader without active class management permission must be blocked'
  );

  // Admin with verified gradingId -> allowed
  const pAdmin = evaluateCanModifyGrading({
    classId: realClassId,
    canManageClassSubmissions: true,
    isAuthLoading: false,
    isGradingLoading: false,
    isGradingError: false,
    user: { id: 'admin-99', roleName: 'ROLE_ADMIN' },
    grading: sampleGrading,
  });
  assert(pAdmin.canEdit && pAdmin.canDelete, 'Admin with verified gradingId must be allowed');

  // Missing gradingId / loading -> locked even for Admin
  const pUnverified = evaluateCanModifyGrading({
    classId: realClassId,
    canManageClassSubmissions: true,
    isAuthLoading: false,
    isGradingLoading: true,
    isGradingError: false,
    user: { id: 'admin-99', roleName: 'ROLE_ADMIN' },
    grading: null,
  });
  assert(!pUnverified.canEdit && !pUnverified.canDelete, 'Unverified/loading grading must lock write actions');
  console.log('  ✔ PASSED Test 5\n');

  // Test 6: Query key partitioning, i18n symmetry & component hygiene
  console.log('Test 6: Query keys, i18n symmetry & component hygiene...');
  const gk1 = assignmentKeys.submissionGrading(realSubId, realAssignId, realClassId, 'u1');
  const gk2 = assignmentKeys.submissionGrading(realSubId, realAssignId, realClassId, 'u2');
  assert(JSON.stringify(gk1) !== JSON.stringify(gk2), 'submissionGrading key must partition by userId');

  const viKeys = collectKeys(viJson.assignments.teacher.submissionDetail);
  const enKeys = collectKeys(enJson.assignments.teacher.submissionDetail);
  assert(
    JSON.stringify(viKeys) === JSON.stringify(enKeys),
    `i18n symmetry failed: vi(${viKeys.length}) vs en(${enKeys.length})`
  );

  const detailSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/assignments/components/TeacherSubmissionDetailView.tsx'),
    'utf8'
  );
  const modalSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/assignments/components/DeleteGradingConfirmModal.tsx'),
    'utf8'
  );
  assert(detailSrc.includes('useSubmissionGrading('), 'Must fetch GradingResponse via useSubmissionGrading');
  assert(detailSrc.includes('useDeleteGrading('), 'Must delete grading via useDeleteGrading');
  assert(detailSrc.includes('evaluateCanModifyGrading('), 'Must evaluate grader/Admin permission');
  assert(!detailSrc.includes('Trần Nhật Minh'), 'Must NOT hardcode Stitch sample student Trần Nhật Minh');
  assert(!detailSrc.includes('Socratic AI Tutor'), 'Must NOT include Stitch floating widget');
  assert(modalSrc.includes('role="dialog"') && modalSrc.includes('aria-modal="true"'), 'Delete modal must be accessible');
  console.log(`  ✔ PASSED Test 6 (${viKeys.length} symmetrical i18n keys verified)\n`);

  console.log('=== ALL 6 TEACHER SUBMISSION GRADED V2 TESTS PASSED 100%! ===');
}

runTests().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
