import fs from 'fs';
import path from 'path';
import { api } from '@/lib/axios';
import { ApiError } from '@/types/common';
import { updateMySubmission } from '../services/assignment.service';
import { evaluateCanEditSubmission } from '../utils/submissionValidation';
import type { AssignmentItem, MySubmission } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

const mockStorage: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => mockStorage[k] ?? null,
  setItem: (k: string, v: string) => {
    mockStorage[k] = v;
  },
  removeItem: (k: string) => {
    delete mockStorage[k];
  },
  clear: () => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
  },
  get length() {
    return Object.keys(mockStorage).length;
  },
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
};
(globalThis as unknown as { window: unknown }).window = {
  localStorage: globalThis.localStorage,
};

async function runTests() {
  console.log('=== VERIFYING STUDENT ASSIGNMENT EDIT SUBMISSION V2 ===\n');

  // -------------------------------------------------------------------------
  // TEST 1: updateMySubmission PATCH contract (strict { content }, preserve formatting & submissionId, preserve ApiError status, zero localStorage fallback)
  // -------------------------------------------------------------------------
  console.log('Test 1: updateMySubmission real UUID PATCH contract...');
  const realUuid = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
  const realClassUuid = '22222222-3333-4444-8555-666666666666';
  const existingSubId = '77777777-8888-4999-8aaa-bbbbbbbbbbbb';

  let rejectedEmpty = false;
  try {
    await updateMySubmission(realUuid, { content: '   \n\t  ' }, 'student-real-1', realClassUuid);
  } catch {
    rejectedEmpty = true;
  }
  assert(rejectedEmpty, 'Whitespace-only PATCH must be rejected');

  const originalPatch = api.patch;
  const captured: { url: string; body: Record<string, unknown> | null } = {
    url: '',
    body: null,
  };
  const editedMultiline =
    '  Bản cập nhật lần 2:\n- Bổ sung chứng minh BCNF\n\nLink: https://github.com/ilms/db-lab  ';

  try {
    (api as unknown as { patch: typeof api.patch }).patch = (async (
      url: string,
      body?: unknown
    ) => {
      captured.url = url;
      captured.body = (body || null) as Record<string, unknown> | null;
      return {
        status: 200,
        data: {
          code: 200,
          message: 'OK',
          data: {
            id: existingSubId,
            assignmentId: realUuid,
            content: editedMultiline,
            status: 'RESUBMITTED',
            submittedAt: '2026-11-18T20:05:00',
            isLate: false,
            submissionAttempt: 2,
            attachmentUrls: [],
          },
        },
      };
    }) as unknown as typeof api.patch;

    globalThis.localStorage.clear();
    const res = await updateMySubmission(
      realUuid,
      { content: editedMultiline },
      'student-real-1',
      realClassUuid
    );

    assert(
      captured.url === `/assignments/${realUuid}/submissions`,
      `Expected PATCH /assignments/${realUuid}/submissions, got ${captured.url}`
    );
    assert(
      captured.body !== null &&
        Object.keys(captured.body).length === 1 &&
        captured.body.content === editedMultiline,
      'PATCH payload must contain ONLY { content } with exact newlines/formatting preserved'
    );
    assert(
      res.id === existingSubId && res.submissionAttempt === 2 && res.content === editedMultiline,
      'PATCH must keep submissionId and adopt updated fields strictly from server response'
    );
    assert(
      globalThis.localStorage.length === 0,
      'Real API PATCH must NOT write fallback data to localStorage'
    );

    // Missing data.data must throw SCHEMA_ERROR and NEVER fall through to localStorage
    (api as unknown as { patch: typeof api.patch }).patch = (async () => ({
      status: 200,
      data: { code: 200, message: 'OK', data: null },
    })) as unknown as typeof api.patch;

    let threwSchema = false;
    try {
      await updateMySubmission(realUuid, { content: 'Updated answer' }, 'student-real-1', realClassUuid);
    } catch (err: unknown) {
      threwSchema = (err as { code?: string })?.code === 'SCHEMA_ERROR';
    }
    assert(threwSchema && globalThis.localStorage.length === 0, 'Missing data.data must throw SCHEMA_ERROR without touching localStorage');

    // Preserve ApiError httpStatus (409 / 403)
    (api as unknown as { patch: typeof api.patch }).patch = (async () => {
      throw new ApiError('Đã vượt quá số lượt nộp cho phép', 409, 409);
    }) as unknown as typeof api.patch;

    let caughtStatus = 0;
    try {
      await updateMySubmission(realUuid, { content: 'Updated answer' }, 'student-real-1', realClassUuid);
    } catch (err: unknown) {
      caughtStatus = (err as ApiError)?.httpStatus || 0;
    }
    assert(caughtStatus === 409, `Must preserve ApiError httpStatus=409, got ${caughtStatus}`);
  } finally {
    (api as unknown as { patch: typeof api.patch }).patch = originalPatch;
  }
  console.log('  ✔ PASSED Test 1\n');

  // -------------------------------------------------------------------------
  // TEST 2: evaluateCanEditSubmission business rules (score=0 graded, past due even with allowLate=true, maxAttempts, no deadline, no submission)
  // -------------------------------------------------------------------------
  console.log('Test 2: evaluateCanEditSubmission business rules...');
  const now = Date.now();
  const futureIso = new Date(now + 86400_000).toISOString();
  const pastIso = new Date(now - 86400_000).toISOString();

  const studentUser = {
    id: 'u-stu-1',
    roleName: 'ROLE_USER',
    email: 'b22dccn001@stu.ptit.edu.vn',
    firstName: 'Hoàng',
    lastName: 'Trần',
  };

  const baseAssignment: AssignmentItem = {
    id: realUuid,
    classId: realClassUuid,
    title: 'Lab 06',
    type: 'LAB',
    status: 'OPEN',
    dueDate: futureIso,
    maxScore: 10,
    allowLateSubmission: true,
  };

  const baseSubmission: MySubmission = {
    id: existingSubId,
    assignmentId: realUuid,
    studentId: 'u-stu-1',
    content: 'Initial work',
    status: 'SUBMITTED',
    score: null,
    feedback: null,
    submittedAt: new Date(now - 3600_000).toISOString(),
    isLate: false,
    submissionAttempt: 1,
    attachmentUrls: [],
  };

  // 2a. Valid pending before deadline (without maxAttempts returned -> do NOT invent maxAttempts=1)
  const evValid = evaluateCanEditSubmission({
    assignment: baseAssignment,
    submission: baseSubmission,
    currentUser: studentUser,
  });
  assert(evValid.canEdit === true, 'Valid pending submission before deadline without maxAttempts must allow edit');

  // 2b. Score === 0 is GRADED -> MUST lock edit!
  const evGradedZero = evaluateCanEditSubmission({
    assignment: baseAssignment,
    submission: { ...baseSubmission, status: 'GRADED', score: 0 },
    currentUser: studentUser,
  });
  assert(
    evGradedZero.canEdit === false && evGradedZero.reason === 'ALREADY_GRADED',
    'Graded submission with score=0 must lock editing'
  );

  // 2c. Score === 0 even if status string lags -> still ALREADY_GRADED!
  const evScoreZeroLag = evaluateCanEditSubmission({
    assignment: baseAssignment,
    submission: { ...baseSubmission, status: 'SUBMITTED', score: 0 },
    currentUser: studentUser,
  });
  assert(
    evScoreZeroLag.canEdit === false && evScoreZeroLag.reason === 'ALREADY_GRADED',
    'Numeric score=0 must be treated as graded and lock editing'
  );

  // 2d. Past due with allowLateSubmission=true -> MUST STILL LOCK PATCH!
  const evPastDueWithLate = evaluateCanEditSubmission({
    assignment: { ...baseAssignment, dueDate: pastIso, allowLateSubmission: true },
    submission: baseSubmission,
    currentUser: studentUser,
  });
  assert(
    evPastDueWithLate.canEdit === false && evPastDueWithLate.reason === 'DEADLINE_PASSED',
    'allowLateSubmission=true must NOT allow PATCH after deadline'
  );

  // 2e. No deadline (dueDate: null) -> allow edit
  const evNoDeadline = evaluateCanEditSubmission({
    assignment: { ...baseAssignment, dueDate: null },
    submission: baseSubmission,
    currentUser: studentUser,
  });
  assert(evNoDeadline.canEdit === true, 'dueDate=null must allow editing when ungraded');

  // 2f. maxAttempts reached -> MUST lock edit
  const evMaxAttempts = evaluateCanEditSubmission({
    assignment: baseAssignment,
    submission: { ...baseSubmission, submissionAttempt: 2, maxAttempts: 2 },
    currentUser: studentUser,
  });
  assert(
    evMaxAttempts.canEdit === false && evMaxAttempts.reason === 'MAX_ATTEMPTS_REACHED',
    'Reached maxAttempts must lock editing'
  );

  // 2g. No submission / cancelled -> NO_SUBMISSION
  const evNoSub = evaluateCanEditSubmission({
    assignment: baseAssignment,
    submission: { ...baseSubmission, status: 'NOT_SUBMITTED' },
    currentUser: studentUser,
  });
  assert(
    evNoSub.canEdit === false && evNoSub.reason === 'NO_SUBMISSION',
    'NOT_SUBMITTED must return NO_SUBMISSION'
  );
  console.log('  ✔ PASSED Test 2\n');

  // -------------------------------------------------------------------------
  // TEST 3: Symmetrical i18n keys & zero missing usages
  // -------------------------------------------------------------------------
  console.log('Test 3: i18n symmetry & usage verification...');
  const viJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../../messages/vi.json'), 'utf8')
  );
  const enJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../../messages/en.json'), 'utf8')
  );
  const viKeys = Object.keys(viJson.assignments.submit || {}).sort();
  const enKeys = Object.keys(enJson.assignments.submit || {}).sort();
  assert(
    JSON.stringify(viKeys) === JSON.stringify(enKeys),
    'vi.json and en.json assignments.submit keys must match 100%'
  );

  const viewPath = path.resolve(__dirname, '../components/StudentAssignmentSubmissionPageView.tsx');
  const viewSource = fs.readFileSync(viewPath, 'utf8');
  const usedKeys = Array.from(viewSource.matchAll(/tSubmit\('([^']+)'/g)).map((m) => m[1]);
  for (const k of usedKeys) {
    assert(viKeys.includes(k), `Missing vi.json key assignments.submit.${k}`);
    assert(enKeys.includes(k), `Missing en.json key assignments.submit.${k}`);
  }
  console.log(`  ✔ PASSED Test 3 (${viKeys.length} symmetrical keys, ${usedKeys.length} usages verified)\n`);

  // -------------------------------------------------------------------------
  // TEST 4: Component, Hook & Detail Integration Audit
  // -------------------------------------------------------------------------
  console.log('Test 4: Audit shared edit/submit component, useUpdateSubmission retry:false & Detail navigation...');
  const updateHookSource = fs.readFileSync(
    path.resolve(__dirname, '../hooks/useUpdateSubmission.ts'),
    'utf8'
  );
  const detailSource = fs.readFileSync(
    path.resolve(__dirname, '../components/StudentAssignmentDetailPageView.tsx'),
    'utf8'
  );

  assert(updateHookSource.includes('retry: false'), 'useUpdateSubmission must disable automatic PATCH retries');
  assert(
    detailSource.includes('/submit?mode=edit') && !detailSource.includes('id="edit-submission-modal"'),
    'Detail view must navigate to shared /submit?mode=edit and remove duplicate inline edit modal'
  );
  assert(viewSource.includes('initializedEditKeyRef'), 'Must guard draft against window-focus query refetch');
  assert(viewSource.includes('initialServerContent'), 'Must track server baseline separately from draft for dirty check');
  assert(viewSource.includes('isUncertainNetworkError'), 'Must detect uncertain network/timeout errors on PATCH');
  assert(viewSource.includes('data-edit-attempt-note="true"'), 'Must render attempt count notice in edit mode');
  assert(viewSource.includes('data-edit-no-submission="true"'), 'Must handle missing/cancelled submission without converting to POST');
  assert(!viewSource.includes('Kính gửi thầy Nam'), 'Must NOT contain Stitch sample content');
  assert(!viewSource.includes('371'), 'Must NOT hardcode Stitch 371 char count');
  console.log('  ✔ PASSED Test 4\n');

  console.log('================================================================');
  console.log('ALL 4 STUDENT ASSIGNMENT EDIT SUBMISSION V2 TESTS PASSED 100%!');
  console.log('================================================================');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
