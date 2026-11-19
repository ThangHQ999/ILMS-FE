import fs from 'fs';
import path from 'path';
import { api } from '@/lib/axios';
import { submitAssignment } from '../services/assignment.service';
import { evaluateCanSubmitAssignment } from '../utils/submissionValidation';
import type { AssignmentItem, MySubmission } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

// Setup minimal localStorage mock for Node runner
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
  console.log('=== VERIFYING STUDENT ASSIGNMENT SUBMISSION V2 ===\n');

  // -------------------------------------------------------------------------
  // TEST 1: submitAssignment payload contract (strict { content }, preserve formatting, zero localStorage on real UUID)
  // -------------------------------------------------------------------------
  console.log('Test 1: submitAssignment real UUID API contract & formatting preservation...');
  const realUuid = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
  const realClassUuid = '11111111-2222-4333-8444-555555555555';

  // 1a. Reject empty & whitespace-only
  let rejectedWhitespace = false;
  try {
    await submitAssignment(realUuid, { content: '   \n\t  \r\n ' }, realClassUuid);
  } catch {
    rejectedWhitespace = true;
  }
  assert(rejectedWhitespace, 'Whitespace-only submission must be rejected');

  // 1b. Intercept api.post to verify exact payload & zero extra fields / zero localStorage fallback
  const originalPost = api.post;
  const captured: { url: string; body: Record<string, unknown> | null } = {
    url: '',
    body: null,
  };
  const multilineContent =
    '  Câu 1: Phân tích chỉ mục B-Tree\n\nCâu 2: Link bài làm:\nhttps://docs.google.com/document/d/abc123  ';

  try {
    (api as unknown as { post: typeof api.post }).post = (async (
      url: string,
      body?: unknown
    ) => {
      captured.url = url;
      captured.body = (body || null) as Record<string, unknown> | null;
      return {
        status: 201,
        data: {
          code: 201,
          message: 'Created',
          data: {
            id: '99999999-aaaa-4bbb-8ccc-dddddddddddd',
            assignmentId: realUuid,
            content: multilineContent,
            status: 'SUBMITTED',
            submittedAt: '2026-11-18T19:30:00',
            isLate: true,
            submissionAttempt: 1,
            attachmentUrls: [],
          },
        },
      };
    }) as unknown as typeof api.post;

    globalThis.localStorage.clear();
    const res = await submitAssignment(
      realUuid,
      { content: multilineContent },
      realClassUuid,
      'student-real-1'
    );

    assert(
      captured.url === `/assignments/${realUuid}/submissions`,
      `Expected POST /assignments/${realUuid}/submissions, got ${captured.url}`
    );
    assert(
      captured.body !== null &&
        Object.keys(captured.body).length === 1 &&
        captured.body.content === multilineContent,
      'POST payload must contain ONLY { content } with exact newlines/formatting preserved'
    );
    assert(
      res.id === '99999999-aaaa-4bbb-8ccc-dddddddddddd' && res.isLate === true,
      'Must return exact server response without fabricating ID/timestamp/isLate'
    );
    assert(
      globalThis.localStorage.length === 0,
      'Real API submission must NOT write fallback data to localStorage'
    );

    // 1c. Missing data.data in response must throw SCHEMA_ERROR instead of fabricating fallback
    (api as unknown as { post: typeof api.post }).post = (async () => ({
      status: 201,
      data: { code: 201, message: 'Created', data: null },
    })) as unknown as typeof api.post;

    let threwSchemaError = false;
    try {
      await submitAssignment(realUuid, { content: 'Valid answer' }, realClassUuid);
    } catch (err: unknown) {
      threwSchemaError = (err as { code?: string })?.code === 'SCHEMA_ERROR';
    }
    assert(
      threwSchemaError,
      'Missing response data.data must throw SCHEMA_ERROR instead of fabricating submission fields'
    );
  } finally {
    (api as unknown as { post: typeof api.post }).post = originalPost;
  }
  console.log('  ✔ PASSED Test 1\n');

  // -------------------------------------------------------------------------
  // TEST 2: evaluateCanSubmitAssignment business rules
  // -------------------------------------------------------------------------
  console.log('Test 2: evaluateCanSubmitAssignment rules (no deadline, past due, null late policy, already submitted, read-only)...');
  const now = Date.now();
  const futureIso = new Date(now + 86400_000).toISOString();
  const pastIso = new Date(now - 86400_000).toISOString();

  const baseAssignment: AssignmentItem = {
    id: realUuid,
    classId: realClassUuid,
    title: 'Real Assignment',
    type: 'LAB',
    status: 'OPEN',
    dueDate: futureIso,
    maxScore: 10,
    allowLateSubmission: false,
  };

  const notSubmitted: MySubmission = {
    assignmentId: realUuid,
    status: 'NOT_SUBMITTED',
    score: null,
    feedback: null,
    attachmentUrls: [],
  };

  const studentUser = {
    id: 'u-stu-1',
    roleName: 'ROLE_USER',
    email: 'b22dccn001@stu.ptit.edu.vn',
    firstName: 'Hoàng',
    lastName: 'Trần',
  };

  // 2a. In deadline + ROLE_USER
  const evalInDeadline = evaluateCanSubmitAssignment({
    assignment: baseAssignment,
    submission: notSubmitted,
    currentUser: studentUser,
  });
  assert(evalInDeadline.canSubmit === true, 'In-deadline student with ROLE_USER should be able to submit');

  // 2b. No deadline (dueDate: null)
  const evalNoDeadline = evaluateCanSubmitAssignment({
    assignment: { ...baseAssignment, dueDate: null, allowLateSubmission: null },
    submission: notSubmitted,
    currentUser: studentUser,
  });
  assert(evalNoDeadline.canSubmit === true, 'Assignment with dueDate=null must allow submission');

  // 2c. Past due + allowLateSubmission: true
  const evalPastDueAllowed = evaluateCanSubmitAssignment({
    assignment: { ...baseAssignment, dueDate: pastIso, allowLateSubmission: true },
    submission: notSubmitted,
    currentUser: studentUser,
  });
  assert(evalPastDueAllowed.canSubmit === true, 'Past-due with allowLateSubmission=true must allow first-time submission');

  // 2d. Past due + allowLateSubmission: false
  const evalPastDueBlocked = evaluateCanSubmitAssignment({
    assignment: { ...baseAssignment, dueDate: pastIso, allowLateSubmission: false },
    submission: notSubmitted,
    currentUser: studentUser,
  });
  assert(
    evalPastDueBlocked.canSubmit === false && evalPastDueBlocked.reason === 'DEADLINE_PASSED',
    'Past-due with allowLateSubmission=false must lock submission with DEADLINE_PASSED'
  );

  // 2e. Past due + allowLateSubmission: null (NEVER coerce null -> true)
  const evalPastDueNullPolicy = evaluateCanSubmitAssignment({
    assignment: { ...baseAssignment, dueDate: pastIso, allowLateSubmission: null },
    submission: notSubmitted,
    currentUser: studentUser,
  });
  assert(
    evalPastDueNullPolicy.canSubmit === false && evalPastDueNullPolicy.reason === 'DEADLINE_PASSED',
    'Past-due with allowLateSubmission=null must NOT allow late submission'
  );

  // 2f. Already submitted (SUBMITTED / GRADED)
  const evalAlreadySubmitted = evaluateCanSubmitAssignment({
    assignment: baseAssignment,
    submission: { ...notSubmitted, status: 'SUBMITTED', id: 'sub-1' },
    currentUser: studentUser,
  });
  assert(
    evalAlreadySubmitted.canSubmit === false &&
      evalAlreadySubmitted.hasExistingSubmission === true &&
      evalAlreadySubmitted.reason === 'ALREADY_SUBMITTED',
    'Existing submission must block new POST submission'
  );

  // 2g. Archived class
  const evalReadOnly = evaluateCanSubmitAssignment({
    assignment: baseAssignment,
    submission: notSubmitted,
    currentUser: studentUser,
    classDetail: {
      classInfo: {
        id: realClassUuid,
        name: 'CS-202',
        status: 'ARCHIVED',
      },
      courses: [],
      members: [],
      announcements: [],
      isClassInfoLive: true,
      isMembersLive: false,
      isCoursesLive: false,
    } as never,
  });
  assert(
    evalReadOnly.canSubmit === false && evalReadOnly.reason === 'CLASS_READ_ONLY',
    'Archived class must lock submission with CLASS_READ_ONLY'
  );
  console.log('  ✔ PASSED Test 2\n');

  // -------------------------------------------------------------------------
  // TEST 3: Symmetrical i18n keys (vi.json == en.json) & zero missing keys in component
  // -------------------------------------------------------------------------
  console.log('Test 3: i18n key parity for assignments.submit...');
  const viJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../../messages/vi.json'), 'utf8')
  );
  const enJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../../messages/en.json'), 'utf8')
  );
  const viSubmitKeys = Object.keys(viJson.assignments.submit || {}).sort();
  const enSubmitKeys = Object.keys(enJson.assignments.submit || {}).sort();

  assert(viSubmitKeys.length >= 30, `Expected >= 30 submit i18n keys, got ${viSubmitKeys.length}`);
  assert(
    JSON.stringify(viSubmitKeys) === JSON.stringify(enSubmitKeys),
    `vi.json and en.json assignments.submit keys mismatch`
  );

  const viewPath = path.resolve(__dirname, '../components/StudentAssignmentSubmissionPageView.tsx');
  const viewSource = fs.readFileSync(viewPath, 'utf8');
  const usedSubmitKeys = Array.from(viewSource.matchAll(/tSubmit\('([^']+)'/g)).map((m) => m[1]);
  for (const key of usedSubmitKeys) {
    assert(viSubmitKeys.includes(key), `Missing vi.json key assignments.submit.${key}`);
    assert(enSubmitKeys.includes(key), `Missing en.json key assignments.submit.${key}`);
  }
  console.log(`  ✔ PASSED Test 3 (${viSubmitKeys.length} symmetrical keys, ${usedSubmitKeys.length} usages verified)\n`);

  // -------------------------------------------------------------------------
  // TEST 4: Component architectural & Stitch constraints audit
  // -------------------------------------------------------------------------
  console.log('Test 4: Audit StudentAssignmentSubmissionPageView constraints...');
  assert(viewSource.includes('DashboardSidebar') && viewSource.includes('DashboardHeader'), 'Must preserve original app shell');
  assert(viewSource.includes('bg-[#F6FAFE]'), 'Main background must use #F6FAFE');
  assert(viewSource.includes('bg-[#0059BB]'), 'Primary submit CTA must use #0059BB');
  assert(viewSource.includes('from-[#0D1C32] via-[#0F2444] to-[#122C54]'), 'Must render Hero Navy Spotlight Banner');
  assert(viewSource.includes('border-2 border-[#E2E8F0]'), 'Outer cards must use 2px border');
  assert(viewSource.includes('aria-expanded={isRequirementsExpanded}'), 'Requirements accordion must expose aria-expanded');
  assert(viewSource.includes('aria-controls="submission-requirements-panel"'), 'Requirements accordion must link aria-controls');
  assert(viewSource.includes('aria-invalid={Boolean(validationError)}'), 'Textarea must expose aria-invalid');
  assert(viewSource.includes('isSubmittingRef'), 'Must guard against double-submit');
  assert(viewSource.includes('postSubmitReloadError'), 'Must handle POST 201 success with reload error separately');
  assert(viewSource.includes('/classes/${classId}?tab=assignments'), 'Class breadcrumb must route to /classes/{classId}?tab=assignments');
  assert(!viewSource.includes('history.back(') && !viewSource.includes('router.back('), 'Must NOT rely on history.back or router.back');
  assert(!viewSource.includes('type="file"'), 'Must NOT include file upload input');
  assert(!viewSource.includes('Bài tập chuẩn hóa cơ sở dữ liệu'), 'Must NOT hardcode sample Stitch assignment title');
  assert(!viewSource.includes('R(A, B, C, D, E, G)'), 'Must NOT hardcode sample Stitch CSDL requirements');
  assert(!viewSource.includes("alert('Trợ lý Socratic AI"), 'Must NOT contain legacy alert Socratic AI popup');
  assert(!viewSource.includes('assignment?.maxScore ?? 10'), 'Must NOT coerce null maxScore to 10');
  assert(!viewSource.includes('assignment?.allowLateSubmission ?? true'), 'Must NOT coerce null allowLateSubmission to true');
  console.log('  ✔ PASSED Test 4\n');

  console.log('================================================================');
  console.log('ALL 4 STUDENT ASSIGNMENT SUBMISSION V2 TESTS PASSED 100%!');
  console.log('================================================================');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
