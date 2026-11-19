import fs from 'fs';
import path from 'path';
import { api } from '@/lib/axios';
import {
  getSubmissionById,
  gradeSubmission,
  validateGradeScore,
  validateFeedbackUtf8Bytes,
  isSubmissionGraded,
} from '../services/assignment.service';
import {
  submissionDetailSchema,
  MAX_FEEDBACK_UTF8_BYTES,
} from '../schemas/assignment.schema';
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
  console.log('=== VERIFYING TEACHER SUBMISSION DETAIL & GRADING V2 ===\n');

  // Test 1: validateGradeScore boundaries
  console.log('Test 1: validateGradeScore boundaries...');
  assert(
    validateGradeScore('', 10).valid === false &&
      (validateGradeScore('', 10) as { errorCode: string }).errorCode === 'required',
    'Empty score must fail as required (never converted to 0)'
  );
  assert(
    validateGradeScore('   ', 10).valid === false,
    'Whitespace score must fail as required'
  );
  const scoreZero = validateGradeScore('0', 10);
  assert(scoreZero.valid === true && scoreZero.numericValue === 0, 'Score 0 must be valid');
  const scoreMax = validateGradeScore('10', 10);
  assert(scoreMax.valid === true && scoreMax.numericValue === 10, 'Score maxScore must be valid');
  const scoreComma = validateGradeScore('8,50', 10);
  assert(scoreComma.valid === true && scoreComma.numericValue === 8.5, 'Comma decimal 8,50 must be valid');
  const scoreNeg = validateGradeScore('-1', 10);
  assert(!scoreNeg.valid && scoreNeg.errorCode === 'negative', 'Negative score must fail as negative');
  const scoreOverMax = validateGradeScore('10.01', 10);
  assert(!scoreOverMax.valid && scoreOverMax.errorCode === 'range', 'Score > maxScore must fail as range');
  const scoreOver100 = validateGradeScore('100.01', 120);
  assert(!scoreOver100.valid && scoreOver100.errorCode === 'range', 'Score > 100 must fail even if maxAllowed > 100');
  const score8505 = validateGradeScore('8.505', 10);
  assert(!score8505.valid && score8505.errorCode === 'decimals', '8.505 must be rejected without rounding to 8.51');
  const scoreInvalid = validateGradeScore('abc', 10);
  assert(!scoreInvalid.valid && scoreInvalid.errorCode === 'invalid', 'Non-numeric input must fail as invalid');
  console.log('  ✔ PASSED Test 1\n');

  // Test 2: UTF-8 byte feedback validation & schema truthfulness
  console.log('Test 2: UTF-8 byte feedback & submissionDetailSchema truthfulness...');
  const vnText = 'Nhận xét dòng 1\nNhận xét dòng 2 với tiếng Việt có dấu';
  const vnCheck = validateFeedbackUtf8Bytes(vnText);
  assert(vnCheck.valid && vnCheck.bytes > vnText.length, 'UTF-8 bytes must exceed char count for Vietnamese');
  const overBytes = 'ế'.repeat(Math.ceil(MAX_FEEDBACK_UTF8_BYTES / 3) + 1);
  assert(!validateFeedbackUtf8Bytes(overBytes).valid, 'Exceeding UTF-8 byte limit must fail');

  const minimalSub = submissionDetailSchema.parse({
    id: '11111111-1111-4111-8111-111111111111',
    assignmentId: '22222222-2222-4222-8222-222222222222',
    status: 'SUBMITTED',
  });
  assert(minimalSub.studentName === undefined, 'studentName must NOT default to fake name');
  assert(minimalSub.maxScore === undefined, 'maxScore must NOT default to 10');
  assert(minimalSub.submissionAttempt === undefined, 'submissionAttempt must NOT default to 1');
  assert(minimalSub.attempt === undefined, 'attempt must NOT default to 1');

  assert(isSubmissionGraded({ status: 'GRADED', score: null }) === true, 'GRADED status is graded');
  assert(isSubmissionGraded({ status: 'SUBMITTED', score: 0 }) === true, 'Score 0 is graded');
  assert(isSubmissionGraded({ status: 'LATE', score: null }) === false, 'LATE without score is ungraded');
  assert(isSubmissionGraded({ status: 'RESUBMITTED', score: null }) === false, 'RESUBMITTED without score is ungraded');
  console.log('  ✔ PASSED Test 2\n');

  // Test 3: getSubmissionById real UUID contract (no demo fallback, mismatch check)
  console.log('Test 3: getSubmissionById real UUID contract...');
  const origGet = api.get;
  const origPatch = api.patch;
  const realClassId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const realAssignId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const realSubId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

  try {
    let calledUrl = '';
    (api as unknown as { get: (url: string) => Promise<unknown> }).get = async (url: string) => {
      calledUrl = url;
      return {
        data: {
          data: {
            id: realSubId,
            assignmentId: realAssignId,
            studentId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            studentName: 'Nguyễn Minh Quân',
            studentCode: '22029901',
            submittedAt: '2026-11-18T14:20:00Z',
            status: 'LATE',
            isLate: true,
            score: null,
            feedback: null,
            content: 'Bài làm dòng 1\nhttps://example.com/report',
            submissionAttempt: 2,
          },
        },
      };
    };

    const fetched = await getSubmissionById(realSubId, realAssignId, realClassId);
    assert(calledUrl === `/submissions/${realSubId}`, `Must call GET /submissions/{id}, got ${calledUrl}`);
    assert(fetched.studentName === 'Nguyễn Minh Quân', 'Real studentName preserved');
    assert(fetched.submissionAttempt === 2, 'submissionAttempt preserved');
    assert(fetched.isLate === true && !isSubmissionGraded(fetched), 'Late ungraded parsed accurately');

    // Assignment mismatch must throw ASSIGNMENT_MISMATCH
    let mismatchErr: (Error & { code?: string }) | null = null;
    try {
      await getSubmissionById(realSubId, '99999999-9999-4999-8999-999999999999', realClassId);
    } catch (e) {
      mismatchErr = e as Error & { code?: string };
    }
    assert(mismatchErr?.code === 'ASSIGNMENT_MISMATCH', 'Cross-assignment submission must throw ASSIGNMENT_MISMATCH');

    // Empty 200 payload must throw SCHEMA_ERROR (never fall back to demo)
    (api as unknown as { get: () => Promise<unknown> }).get = async () => ({ data: { data: null } });
    let schemaErr: (Error & { code?: string }) | null = null;
    try {
      await getSubmissionById(realSubId, realAssignId, realClassId);
    } catch (e) {
      schemaErr = e as Error & { code?: string };
    }
    assert(schemaErr?.code === 'SCHEMA_ERROR', 'Empty 200 response must throw SCHEMA_ERROR');

    // 403 error must propagate without demo fallback
    (api as unknown as { get: () => Promise<unknown> }).get = async () => {
      const err = new Error('Forbidden') as Error & { httpStatus?: number };
      err.httpStatus = 403;
      throw err;
    };
    let forbiddenCaught = false;
    try {
      await getSubmissionById(realSubId, realAssignId, realClassId);
    } catch (e) {
      forbiddenCaught = (e as { httpStatus?: number }).httpStatus === 403;
    }
    assert(forbiddenCaught, '403 must propagate cleanly without demo fallback');
    console.log('  ✔ PASSED Test 3\n');

    // Test 4: gradeSubmission real UUID contract (clean payload, single write path, server truth)
    console.log('Test 4: gradeSubmission real UUID contract...');
    let patchUrl = '';
    let patchBody: Record<string, unknown> = {};
    (api as unknown as { patch: (url: string, body: Record<string, unknown>) => Promise<unknown> }).patch = async (
      url,
      body
    ) => {
      patchUrl = url;
      patchBody = body;
      return {
        data: {
          data: {
            id: realSubId,
            assignmentId: realAssignId,
            status: 'GRADED',
            score: body.score,
            feedback: body.feedback ?? null,
            gradedByTeacherName: 'PGS.TS. Trần Thị Mai',
            gradedAt: '2026-11-18T15:00:00Z',
          },
        },
      };
    };

    const gradedWithFeedback = await gradeSubmission(
      realSubId,
      { score: 8.5, feedback: 'Tốt\nCần tối ưu thêm bước 3' },
      realAssignId,
      realClassId
    );
    assert(patchUrl === `/submissions/${realSubId}/grade`, `Expected PATCH /submissions/{id}/grade, got ${patchUrl}`);
    assert(
      Object.keys(patchBody).sort().join(',') === 'feedback,score',
      `Payload must contain ONLY score & feedback, got: ${Object.keys(patchBody).join(',')}`
    );
    assert(patchBody.score === 8.5, 'Payload score must be 8.5');
    assert(patchBody.feedback === 'Tốt\nCần tối ưu thêm bước 3', 'Feedback must preserve newlines verbatim');
    assert(gradedWithFeedback.gradedByTeacherName === 'PGS.TS. Trần Thị Mai', 'Grader name must come from server');

    // Score 0 with blank feedback -> omit feedback completely
    await gradeSubmission(realSubId, { score: 0, feedback: '   ' }, realAssignId, realClassId);
    assert(
      Object.keys(patchBody).join(',') === 'score' && patchBody.score === 0,
      'Blank feedback must be omitted and score 0 preserved'
    );

    // 409 conflict must propagate cleanly (no demo fallback)
    (api as unknown as { patch: () => Promise<unknown> }).patch = async () => {
      const err = new Error('Conflict') as Error & { httpStatus?: number };
      err.httpStatus = 409;
      throw err;
    };
    let conflictCaught = false;
    try {
      await gradeSubmission(realSubId, { score: 9 }, realAssignId, realClassId);
    } catch (e) {
      conflictCaught = (e as { httpStatus?: number }).httpStatus === 409;
    }
    assert(conflictCaught, '409 conflict must propagate without demo fallback');
    console.log('  ✔ PASSED Test 4\n');
  } finally {
    api.get = origGet;
    api.patch = origPatch;
  }

  // Test 5: Query key partitioning, i18n symmetry & component cleanliness
  console.log('Test 5: Query key partitioning, i18n symmetry & component cleanliness...');
  const k1 = assignmentKeys.submissionDetail('sub-1', 'a-1', 'c-1', 'user-1');
  const k2 = assignmentKeys.submissionDetail('sub-1', 'a-1', 'c-1', 'user-2');
  assert(JSON.stringify(k1) !== JSON.stringify(k2), 'submissionDetail key must partition by userId');

  const viDetail = viJson.assignments.teacher.submissionDetail;
  const enDetail = enJson.assignments.teacher.submissionDetail;
  const viKeys = collectKeys(viDetail);
  const enKeys = collectKeys(enDetail);
  assert(
    JSON.stringify(viKeys) === JSON.stringify(enKeys),
    `i18n mismatch: vi(${viKeys.length}) vs en(${enKeys.length})`
  );

  const compSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/assignments/components/TeacherSubmissionDetailView.tsx'),
    'utf8'
  );
  assert(compSource.includes('useAssignmentItem('), 'Must use useAssignmentItem (not student useAssignmentDetail)');
  assert(!compSource.includes('useAssignmentDetail'), 'Must NOT import or call useAssignmentDetail');
  assert(compSource.includes('evaluateCanManageClassSubmissions'), 'Must verify real class management permission');
  assert(!compSource.includes('Socratic AI Tutor'), 'Must NOT include Stitch floating Socratic AI Tutor');
  assert(!compSource.includes('Vũ Đức Long'), 'Must NOT hardcode Stitch sample student name');
  assert(!compSource.includes('2024-10-28T21:40:00'), 'Must NOT hardcode sample submission time');
  assert(!compSource.includes('Công nghệ thông tin K22'), 'Must NOT hardcode sample class name');
  assert(!compSource.includes('dangerouslySetInnerHTML'), 'Must NOT render untrusted raw HTML');
  assert(!compSource.includes("t('backToSubmissions')"), 'Must NOT render standalone backToSubmissions button');
  assert(compSource.includes('onClick={handleCancel}'), 'Must keep Cancel button handler');
  assert(
    compSource.includes('href={`/classes/${classId}?tab=assignments`}'),
    'Must keep explicit class breadcrumb link'
  );
  console.log(`  ✔ PASSED Test 5 (${viKeys.length} symmetrical i18n keys verified)\n`);

  console.log('=== ALL 5 TEACHER SUBMISSION DETAIL V2 TESTS PASSED 100%! ===');
}

runTests().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
