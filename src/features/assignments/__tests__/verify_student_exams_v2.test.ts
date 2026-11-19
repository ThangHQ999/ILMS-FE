import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  examItemSchema,
  examListEnvelopeSchema,
  normalizeExamStatus,
  normalizeExamType,
} from '../schemas/exam.schema';
import {
  formatExamLocalDateTime,
  getClassExamsPaged,
  type ExamNetworkLog,
} from '../services/exam.service';
import { examKeys } from '../constants';

(globalThis as unknown as { window: unknown }).window = globalThis;

async function runV2Tests() {
  console.log('=== VERIFYING STUDENT EXAMS LIST V2 ===\n');

  // TEST 1: Schema adapters & zero fabricated defaults
  console.log('--- TEST 1: Schema adapters & no default 60/10/25/40 ---');
  assert.strictEqual(normalizeExamStatus('OPENING'), 'OPEN');
  assert.strictEqual(normalizeExamStatus('OPEN'), 'OPEN');
  assert.strictEqual(normalizeExamStatus('UPCOMING'), 'UPCOMING');
  assert.strictEqual(normalizeExamStatus('CLOSED'), 'CLOSED');
  assert.strictEqual(normalizeExamType('COMPETITION'), 'CONTEST');
  assert.strictEqual(normalizeExamType('CONTEST'), 'CONTEST');

  const minimalParsed = examItemSchema.parse({
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Minimal Exam',
    examType: 'COMPETITION',
    status: 'OPENING',
    questionCount: 0,
  });
  assert.strictEqual(minimalParsed.examType, 'CONTEST');
  assert.strictEqual(minimalParsed.status, 'OPEN');
  assert.strictEqual(minimalParsed.questionCount, 0, 'questionCount=0 must be preserved');
  assert.strictEqual(minimalParsed.durationMinutes, undefined, 'durationMinutes must NOT default to 60');
  assert.strictEqual(minimalParsed.maxScore, undefined, 'maxScore must NOT default to 10');

  let schemaRejected = false;
  try {
    examListEnvelopeSchema.parse({ invalid: true });
  } catch {
    schemaRejected = true;
  }
  assert.strictEqual(schemaRejected, true, 'Invalid envelope must throw ZodError');
  console.log('✓ Schema adapters, questionCount=0, no fabricated defaults, and strict rejection verified.');

  // TEST 2: Query param mapping never sends COMPETITION, OPENING, or search
  console.log('\n--- TEST 2: Backend query params adapt COMPETITION->CONTEST & OPENING->OPEN ---');
  const uuidClass = '00000000-0000-4000-8000-000000000099';
  try {
    await getClassExamsPaged(uuidClass, {
      page: 0,
      size: 5,
      examType: 'COMPETITION',
      status: 'OPENING',
      search: 'should-not-be-sent',
      sort: 'latest',
      onlyPublished: true,
    });
  } catch {
    // Expected 401/network without session
  }
  const win = globalThis as unknown as { __lastExamsNetworkCall?: ExamNetworkLog };
  const log = win.__lastExamsNetworkCall;
  assert.ok(log, 'Must record network log');
  assert.ok(log.fullUrl.includes('examType=CONTEST'), `Expected examType=CONTEST in ${log.fullUrl}`);
  assert.ok(!log.fullUrl.includes('COMPETITION'), `Must never send COMPETITION in ${log.fullUrl}`);
  assert.ok(log.fullUrl.includes('status=OPEN'), `Expected status=OPEN in ${log.fullUrl}`);
  assert.ok(!log.fullUrl.includes('OPENING'), `Must never send OPENING in ${log.fullUrl}`);
  assert.ok(!log.fullUrl.includes('search='), `Must never send unsupported search param in ${log.fullUrl}`);
  console.log('✓ Backend query params verified cleanly.');

  // TEST 3: LocalDateTime formatting without UTC shift
  console.log('\n--- TEST 3: LocalDateTime formatting ---');
  assert.strictEqual(formatExamLocalDateTime('2026-11-18T08:00:00'), '08:00 – 18/11/2026');
  assert.strictEqual(formatExamLocalDateTime('2026-12-01T23:59:00'), '23:59 – 01/12/2026');
  assert.strictEqual(formatExamLocalDateTime(null), '--:--');
  console.log('✓ LocalDateTime wall-clock formatting verified.');

  // TEST 4: Cache keys isolated by userId & classId
  console.log('\n--- TEST 4: Query key partitioning by user & class ---');
  const kA = JSON.stringify(examKeys.list('class-A', { page: 0 }, 'user-1'));
  const kB = JSON.stringify(examKeys.list('class-A', { page: 0 }, 'user-2'));
  const kC = JSON.stringify(examKeys.list('class-B', { page: 0 }, 'user-1'));
  assert.notStrictEqual(kA, kB, 'Different users must have distinct list cache keys');
  assert.notStrictEqual(kA, kC, 'Different classes must have distinct list cache keys');
  const dA = JSON.stringify(examKeys.detail('exam-1', 'class-A', 'user-1'));
  const dB = JSON.stringify(examKeys.detail('exam-1', 'class-A', 'user-2'));
  assert.notStrictEqual(dA, dB, 'Different users must have distinct detail cache keys');
  console.log('✓ Query keys properly partitioned.');

  // TEST 5: Zero missing i18n keys in StudentExamsTableView
  console.log('\n--- TEST 5: Zero missing i18n keys in StudentExamsTableView ---');
  const viewCode = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/assignments/components/StudentExamsTableView.tsx'),
    'utf8'
  );
  const vi = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'src/messages/vi.json'), 'utf8')
  );
  const en = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'src/messages/en.json'), 'utf8')
  );

  const regex = /\bt\('([a-zA-Z0-9_]+)'/g;
  let m: RegExpExecArray | null;
  let checked = 0;
  while ((m = regex.exec(viewCode)) !== null) {
    checked++;
    const key = m[1];
    assert.ok(vi.assignments.exams.student[key] !== undefined, `Missing vi key: ${key}`);
    assert.ok(en.assignments.exams.student[key] !== undefined, `Missing en key: ${key}`);
  }
  assert.ok(checked >= 25, `Expected at least 25 i18n calls, checked ${checked}`);
  console.log(`✓ Checked ${checked} i18n calls; 0 missing in vi.json and en.json.`);

  // TEST 6: Component code constraints check
  console.log('\n--- TEST 6: Component architecture & V2 constraints ---');
  assert.ok(!viewCode.includes('forceDemoMode'), 'Must NOT have forceDemoMode fallback after API error');
  assert.ok(!viewCode.includes('/questions'), 'Must NOT call /questions endpoint from student list');
  const primitivesCode = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/assignments/components/AssessmentListPrimitives.tsx'),
    'utf-8'
  );
  const combinedCode = `${viewCode}\n${primitivesCode}`;
  assert.ok(combinedCode.includes('#0D1C32') && combinedCode.includes('#122C54'), 'Must include Navy Spotlight gradient');
  assert.ok(viewCode.includes('useVisibleExamDetails'), 'Must use useVisibleExamDetails for visible cards only');
  assert.ok(viewCode.includes('statusPanelTitle'), 'Must include Status & Schedule panel');
  assert.ok(viewCode.includes('[overflow-wrap:anywhere]'), 'Must wrap long unbroken text cleanly');
  console.log('✓ All V2 component constraints verified.');

  console.log('\n=== ALL 6 STUDENT EXAMS V2 TESTS PASSED 100%! ===');
}

runV2Tests().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
