import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { api } from '@/lib/axios';
import {
  addExamQuestion,
  computeExamScheduleStatus,
  deleteExamQuestion,
  filterAndPaginateMockExams,
  getExamById,
  getExamQuestions,
  parseExamLocalTimestamp,
  resetCreatedExams,
  saveCreatedExam,
} from '../services/exam.service';

// In-memory localStorage mock for Node test environment
const storageMap: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => (key in storageMap ? storageMap[key] : null),
  setItem: (key: string, value: string) => {
    storageMap[key] = String(value);
  },
  removeItem: (key: string) => {
    delete storageMap[key];
  },
  clear: () => {
    Object.keys(storageMap).forEach((k) => delete storageMap[k]);
  },
};

(globalThis as unknown as { window: unknown }).window = globalThis;
(globalThis as unknown as { localStorage: typeof localStorageMock }).localStorage = localStorageMock;

async function runTests() {
  console.log('=== VERIFYING STUDENT EXAM DETAIL 3 FIXES ===\n');

  // ------------------------------------------------------------------
  // TEST 1: LocalDateTime parsing & computeExamScheduleStatus
  // ------------------------------------------------------------------
  console.log('Test 1: parseExamLocalTimestamp & computeExamScheduleStatus...');
  const localTs = parseExamLocalTimestamp('2026-11-18T08:00:00');
  const expectedLocalTs = new Date(2026, 10, 18, 8, 0, 0, 0).getTime();
  assert.strictEqual(
    localTs,
    expectedLocalTs,
    'LocalDateTime without timezone must be parsed as local wall-clock time (not UTC)'
  );

  const startStr = '2026-11-18T08:00:00';
  const endStr = '2026-11-19T17:00:00';
  const beforeStart = new Date(2026, 10, 18, 7, 59, 59).getTime();
  const atStart = new Date(2026, 10, 18, 8, 0, 0).getTime();
  const duringOpen = new Date(2026, 10, 18, 20, 8, 0).getTime();
  const atEnd = new Date(2026, 10, 19, 17, 0, 0).getTime();
  const afterEnd = new Date(2026, 10, 19, 17, 0, 1).getTime();

  assert.strictEqual(computeExamScheduleStatus(startStr, endStr, beforeStart), 'UPCOMING');
  assert.strictEqual(computeExamScheduleStatus(startStr, endStr, atStart), 'OPEN');
  assert.strictEqual(computeExamScheduleStatus(startStr, endStr, duringOpen), 'OPEN');
  assert.strictEqual(computeExamScheduleStatus(startStr, endStr, atEnd), 'CLOSED');
  assert.strictEqual(computeExamScheduleStatus(startStr, endStr, afterEnd), 'CLOSED');
  assert.strictEqual(computeExamScheduleStatus('', endStr, duringOpen), null);
  console.log('  ✔ LocalDateTime parsing & boundary transitions verified.\n');

  // ------------------------------------------------------------------
  // TEST 2: Stale exam-demo-* in localStorage recomputes live status & real questionCount
  // ------------------------------------------------------------------
  console.log('Test 2: exam-demo-* live status recomputation & real questionCount=0...');
  localStorageMock.clear();
  resetCreatedExams();

  const demoId = 'exam-demo-1795005265944';
  const now = Date.now();
  const pad = (n: number) => String(n).padStart(2, '0');
  const toLocalStr = (ms: number) => {
    const d = new Date(ms);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Seed a stale UPCOMING demo exam whose window is currently OPEN (started 2h ago, closes in 20h)
  saveCreatedExam('csdl-k22-01', {
    id: demoId,
    courseId: 'cs-202',
    courseName: 'Cơ sở dữ liệu',
    courseCode: 'CS-202',
    title: 'Bài thi Demo đang mở',
    description: 'a'.repeat(1200),
    examType: 'MIDTERM',
    durationMinutes: 60,
    maxScore: 10,
    totalScore: 10,
    startTime: toLocalStr(now - 2 * 60 * 60 * 1000),
    endTime: toLocalStr(now + 20 * 60 * 60 * 1000),
    status: 'UPCOMING', // stale status persisted by older code
    isPublished: true,
    // questionCount intentionally omitted
  });

  const detail = await getExamById(demoId, 'csdl-k22-01');
  assert.strictEqual(detail.status, 'OPEN', 'Stale UPCOMING demo exam must resolve to OPEN now');
  assert.strictEqual(detail.questionCount, 0, 'Demo exam with no questions must report questionCount=0 (never 20)');

  const listRes = filterAndPaginateMockExams({ onlyPublished: true }, 'csdl-k22-01');
  const listed = listRes.items.find((e) => e.id === demoId);
  assert.ok(listed, 'Published demo exam must appear in student list');
  assert.strictEqual(listed.status, 'OPEN', 'List item must also report live OPEN status');
  assert.strictEqual(listed.questionCount, 0, 'List item must also report questionCount=0');

  // Verify adding/removing questions syncs questionCount and getExamQuestions
  const q1 = await addExamQuestion(demoId, { questionId: 'b1', score: 5 });
  const q2 = await addExamQuestion(demoId, { questionId: 'b2', score: 5 });
  const qsAfterAdd = await getExamQuestions(demoId);
  assert.strictEqual(qsAfterAdd.length, 2, 'getExamQuestions must return 2 added demo questions');
  const detailAfterAdd = await getExamById(demoId, 'csdl-k22-01');
  assert.strictEqual(detailAfterAdd.questionCount, 2, 'questionCount must sync to 2 after adding questions');

  await deleteExamQuestion(demoId, q1.id);
  const qsAfterDelete = await getExamQuestions(demoId);
  assert.strictEqual(qsAfterDelete.length, 1);
  assert.strictEqual(qsAfterDelete[0].id, q2.id);
  assert.strictEqual(qsAfterDelete[0].orderIndex, 1);
  const detailAfterDelete = await getExamById(demoId, 'csdl-k22-01');
  assert.strictEqual(detailAfterDelete.questionCount, 1, 'questionCount must sync to 1 after deleting question');
  console.log('  ✔ Stale demo exam recomputes OPEN status and syncs questionCount accurately.\n');

  // ------------------------------------------------------------------
  // TEST 3: Real UUID getExamQuestions & addExamQuestion propagate errors (no localStorage fallback)
  // ------------------------------------------------------------------
  console.log('Test 3: Real UUID exam question endpoints propagate 403/500 & accept empty 200 []...');
  const realUuid = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const origGet = api.get.bind(api);
  const origPost = api.post.bind(api);

  try {
    // 3a: 200 with empty array [] must return [] cleanly
    (api as unknown as { get: typeof api.get }).get = (async () => ({
      data: { success: true, data: [] },
    })) as unknown as typeof api.get;
    const emptyQuestions = await getExamQuestions(realUuid);
    assert.deepStrictEqual(emptyQuestions, [], '200 [] must return empty array');

    // 3b: 403 Forbidden must propagate (never swallow into [])
    (api as unknown as { get: typeof api.get }).get = (async () => {
      const err = new Error('Forbidden') as Error & { response?: { status: number } };
      err.response = { status: 403 };
      throw err;
    }) as unknown as typeof api.get;

    let caught403 = false;
    try {
      await getExamQuestions(realUuid);
    } catch (err: unknown) {
      caught403 = (err as { response?: { status?: number } })?.response?.status === 403;
    }
    assert.strictEqual(caught403, true, 'Real UUID getExamQuestions must propagate HTTP 403');

    // 3c: 500 error must propagate
    (api as unknown as { get: typeof api.get }).get = (async () => {
      const err = new Error('Internal Server Error') as Error & { response?: { status: number } };
      err.response = { status: 500 };
      throw err;
    }) as unknown as typeof api.get;

    let caught500 = false;
    try {
      await getExamQuestions(realUuid);
    } catch (err: unknown) {
      caught500 = (err as { response?: { status?: number } })?.response?.status === 500;
    }
    assert.strictEqual(caught500, true, 'Real UUID getExamQuestions must propagate HTTP 500');

    // 3d: Real UUID addExamQuestion 401/403 must propagate (never fake localStorage success)
    (api as unknown as { post: typeof api.post }).post = (async () => {
      const err = new Error('Unauthorized') as Error & { response?: { status: number } };
      err.response = { status: 401 };
      throw err;
    }) as unknown as typeof api.post;

    let caughtPost401 = false;
    try {
      await addExamQuestion(realUuid, { questionId: 'b1', score: 2 });
    } catch (err: unknown) {
      caughtPost401 = (err as { response?: { status?: number } })?.response?.status === 401;
    }
    assert.strictEqual(caughtPost401, true, 'Real UUID addExamQuestion must propagate HTTP 401');
  } finally {
    (api as unknown as { get: typeof api.get }).get = origGet;
    (api as unknown as { post: typeof api.post }).post = origPost;
  }
  console.log('  ✔ Real UUID API propagation verified (200 [], 403, 500, POST 401).\n');

  // ------------------------------------------------------------------
  // TEST 4: Static checks on StudentExamDetailView & ClassDetailPageView
  // ------------------------------------------------------------------
  console.log('Test 4: Overflow safety, no fake counts/copy, 403 & unpublished guards...');
  const viewPath = path.resolve(__dirname, '../components/StudentExamDetailView.tsx');
  const viewCode = fs.readFileSync(viewPath, 'utf-8');

  assert.ok(!viewCode.includes('?? 20'), 'Must NOT hardcode fallback questionCount ?? 20');
  assert.ok(!viewCode.includes('?? 2'), 'Must NOT hardcode fallback questionCount ?? 2');
  assert.ok(!viewCode.includes('Học kỳ 1 (2024-2025)'), 'Must NOT hardcode fake semester string');
  assert.ok(
    !viewCode.includes('Bài thi giữa kỳ kiểm tra kiến thức tổng hợp về mô hình OSI'),
    'Must NOT hardcode fake OSI fallback description'
  );
  assert.ok(viewCode.includes('[overflow-wrap:anywhere]'), 'Must apply [overflow-wrap:anywhere] for unbroken strings');
  assert.ok(viewCode.includes('min-w-0'), 'Must apply min-w-0 to prevent flex/grid horizontal blowouts');
  assert.ok(viewCode.includes('exam-questions-forbidden'), 'Must render dedicated 403 permission notice');
  assert.ok(viewCode.includes('ASSESSMENT_MANAGE'), '403 notice must reference backend permission guard');
  assert.ok(viewCode.includes('exam-unpublished-notice'), 'Must handle unpublished exams explicitly');
  assert.ok(
    !viewCode.includes('correctAnswer') && !viewCode.includes('isCorrect'),
    'Student view must never render answer keys'
  );

  const classDetailPath = path.resolve(
    __dirname,
    '../../classes/components/detail/ClassDetailPageView.tsx'
  );
  const classDetailCode = fs.readFileSync(classDetailPath, 'utf-8');
  assert.ok(
    classDetailCode.includes('flex-1 min-w-0'),
    'ClassDetailPageView <main> must include min-w-0'
  );
  console.log('  ✔ All component structure, overflow, and security guards verified.\n');

  console.log('=== ALL STUDENT EXAM DETAIL 3 FIXES TESTS PASSED ===');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
