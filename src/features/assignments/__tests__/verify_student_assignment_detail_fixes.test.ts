import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  getAssignmentById,
  formatAssignmentDueDate,
  formatSubmissionTime,
  formatScore,
  toLocalDateTimeString,
} from '../services/assignment.service';

async function runFixesVerification() {
  console.log('=== VERIFYING STUDENT ASSIGNMENT DETAIL FIXES (ALL 8 AREAS) ===\n');

  const viewPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/StudentAssignmentDetailPageView.tsx'
  );
  const viewCode = fs.readFileSync(viewPath, 'utf8');
  const vi = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'src/messages/vi.json'), 'utf8')
  );
  const en = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'src/messages/en.json'), 'utf8')
  );

  // 1. i18n zero missing keys across vi.json and en.json
  console.log('--- TEST 1: Zero missing i18n keys in StudentAssignmentDetailPageView ---');
  const checkNamespace = (fnName: string, viNs: Record<string, unknown>, enNs: Record<string, unknown>) => {
    const regex = new RegExp(`\\b${fnName}\\('([a-zA-Z0-9_]+)'`, 'g');
    let m: RegExpExecArray | null;
    while ((m = regex.exec(viewCode)) !== null) {
      const key = m[1];
      assert.ok(viNs[key] !== undefined, `Missing key ${fnName}('${key}') in vi.json`);
      assert.ok(enNs[key] !== undefined, `Missing key ${fnName}('${key}') in en.json`);
    }
  };
  checkNamespace('t', vi.assignments.student, en.assignments.student);
  checkNamespace('tDetail', vi.assignments.detail, en.assignments.detail);
  checkNamespace('tClass', vi.classes.detail, en.classes.detail);
  assert.strictEqual(vi.assignments.detail.noGradingFeedback, 'Chưa có nhận xét');
  assert.strictEqual(vi.assignments.detail.viewAssignmentDocument, 'Xem tài liệu đề bài');
  console.log('✓ Zero missing i18n keys and exact required labels verified.');

  // 2. Absence of fabricated fallback literals in component
  console.log('\n--- TEST 2: No fabricated fixture fallbacks in StudentAssignmentDetailPageView ---');
  assert.ok(!viewCode.includes('Phân tích phụ thuộc hàm'), 'Hero must not fallback to CSDL description fixture');
  assert.ok(!viewCode.includes('Bài tập chuẩn hóa cơ sở dữ liệu (Tuần 6)'), 'Title must not fallback to fixture title');
  assert.ok(!viewCode.includes('Học kỳ 1 (2024–2025)'), 'Semester must not be hardcoded');
  assert.ok(!viewCode.includes("'CS-202'"), 'Course code must not fallback to CS-202');
  assert.ok(!viewCode.includes('TS. Lê Hoàng Nam'), 'Grader must not fallback to sample instructor name');
  console.log('✓ All hardcoded fixture fallbacks removed.');

  // 3. No duplicate submission timestamps / timeliness badges in Submitted Work card
  console.log('\n--- TEST 3: Submission metadata deduplication & Accordion a11y ---');
  assert.ok(!viewCode.includes("tDetail('systemRecorded'"), 'Must not duplicate systemRecorded timestamp');
  assert.ok(!viewCode.includes("tDetail('sentAtTime'"), 'Must not duplicate sentAtTime timestamp');
  assert.ok(
    viewCode.includes('<button\n                      type="button"\n                      id="accordion-header"') ||
      (viewCode.includes('id="accordion-header"') && viewCode.includes('aria-expanded={isSpecExpanded}')),
    'Accordion must use real <button type="button"> with aria-expanded'
  );
  assert.ok(viewCode.includes('hasSpecContent'), 'Must hide accordion toggle when assignment has no spec content');
  console.log('✓ Submission metadata deduplicated and Accordion accessibility verified.');

  // 4. LocalDateTime convention & score formatting
  console.log('\n--- TEST 4: LocalDateTime parsing & score precision ---');
  const localStr = toLocalDateTimeString(new Date(2026, 10, 18, 9, 5, 0));
  assert.strictEqual(localStr, '2026-11-18T09:05:00');
  assert.ok(!localStr.endsWith('Z'), 'toLocalDateTimeString must not append Z');

  const due = formatAssignmentDueDate('2026-11-25T23:59:00');
  assert.strictEqual(due.label, '23:59 - 25/11/2026');
  assert.strictEqual(due.isNoDeadline, false);

  const noDue = formatAssignmentDueDate(null);
  assert.strictEqual(noDue.isNoDeadline, true);

  const subTime = formatSubmissionTime('2026-11-18T08:15:00');
  assert.strictEqual(subTime.formatted, '08:15 - 18/11/2026');

  assert.strictEqual(formatScore(0, 'vi'), '0');
  assert.strictEqual(formatScore(8.55, 'vi'), '8,55');
  assert.strictEqual(formatScore(8.5, 'vi'), '8,5');
  assert.strictEqual(formatScore(100, 'vi'), '100');
  assert.strictEqual(formatScore(null, 'vi'), '--');
  console.log('✓ LocalDateTime formatting and score precision verified.');

  // 5. Missing local demo ID throws structured LOCAL_DEMO_NOT_FOUND (no fake assignment)
  console.log('\n--- TEST 5: Missing local demo ID handling ---');
  let caughtCode = '';
  try {
    await getAssignmentById('assign-new-1794745742874', 'csdl-k22-01');
  } catch (err: unknown) {
    caughtCode = (err as { code?: string })?.code || '';
  }
  assert.strictEqual(
    caughtCode,
    'LOCAL_DEMO_NOT_FOUND',
    `Expected LOCAL_DEMO_NOT_FOUND for missing assign-new-*, got "${caughtCode}"`
  );
  console.log('✓ Missing local demo ID returns LOCAL_DEMO_NOT_FOUND without fabricating sample data.');

  // 6. Route error.tsx and loading.tsx preserve DashboardSidebar and DashboardHeader
  console.log('\n--- TEST 6: Error & Loading boundaries preserve app shell ---');
  const errorCode = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/classes/[id]/assignments/[assignmentId]/error.tsx'),
    'utf8'
  );
  const loadingCode = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/classes/[id]/assignments/[assignmentId]/loading.tsx'),
    'utf8'
  );
  assert.ok(errorCode.includes('DashboardSidebar') && errorCode.includes('DashboardHeader'), 'error.tsx must preserve shell');
  assert.ok(loadingCode.includes('DashboardSidebar') && loadingCode.includes('DashboardHeader'), 'loading.tsx must preserve shell');
  console.log('✓ error.tsx and loading.tsx preserve DashboardSidebar & DashboardHeader.');

  console.log('\n=== ALL 6 FIX VERIFICATION TESTS PASSED 100%! ===');
}

runFixesVerification().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
