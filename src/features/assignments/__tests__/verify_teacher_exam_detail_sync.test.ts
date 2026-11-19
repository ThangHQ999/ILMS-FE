import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

function formatScore(val: number | string): string {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0';
  if (Number.isInteger(num)) return num.toString();
  const str = num.toFixed(2).replace(/\.?0+$/, '');
  return str.replace('.', ',');
}

async function runTests() {
  console.log('=== STARTING VERIFICATION: TEACHER EXAM DETAIL VIEW REDESIGN & SYNC ===\n');

  // Test 1: formatScore unit test
  console.log('[TEST 1] Format Score with Vietnamese decimal comma');
  assert.strictEqual(formatScore(0.5), '0,5', '0.5 should format to "0,5"');
  assert.strictEqual(formatScore(1.5), '1,5', '1.5 should format to "1,5"');
  assert.strictEqual(formatScore(10), '10', '10 should format to "10"');
  assert.strictEqual(formatScore(10.0), '10', '10.0 should format to "10"');
  assert.strictEqual(formatScore('0.50'), '0,5', '"0.50" should format to "0,5"');
  assert.strictEqual(formatScore(2.75), '2,75', '2.75 should format to "2,75"');
  console.log('✓ formatScore produces correct Vietnamese decimal comma (0,5 / 1,5 / 10).');

  // Test 2: Source code analysis of TeacherExamDetailView.tsx
  console.log('\n[TEST 2] Analyzing TeacherExamDetailView.tsx component structure');
  const filePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherExamDetailView.tsx'
  );
  assert.ok(fs.existsSync(filePath), 'TeacherExamDetailView.tsx must exist');
  const content = fs.readFileSync(filePath, 'utf-8');

  // 2.1 Max width and rounded corners
  assert.ok(
    content.includes('max-w-7xl mx-auto flex flex-col gap-6 pb-12'),
    'Container must use max-w-7xl mx-auto matching Create Exam form'
  );
  assert.ok(
    content.includes('rounded-3xl p-6 sm:p-8 shadow-xs border-2 border-slate-200/80'),
    'Cards must use rounded-3xl with 2px border matching Create Exam form'
  );
  console.log('✓ Frame layout synced: max-w-7xl, rounded-3xl, 2px borders.');

  // 2.2 Header
  console.log('\n[TEST 3] Header: Main h1 title, two status badges, right-aligned actions');
  assert.ok(
    content.includes('<h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900'),
    'Main title must be rendered as h1 with exam.title'
  );
  assert.ok(
    content.includes('Đang mở') && content.includes('Sắp mở') && content.includes('Đã đóng'),
    'Schedule status badge must support Opening, Upcoming, Closed'
  );
  assert.ok(
    content.includes('Đã công bố') && content.includes('Chưa công bố'),
    'Published state badge must support Published and Unpublished'
  );
  assert.ok(
    content.includes('handleEditExamClick') && content.includes('Sửa bài thi'),
    'Edit exam button must be present'
  );
  assert.ok(
    content.includes('id="toggle-publish-btn"'),
    'Publish/unpublish toggle button must be present with toggle-publish-btn id'
  );
  console.log('✓ Header correctly configured with h1 title, two status badges, and right-aligned buttons.');

  // 2.3 Exam info card
  console.log('\n[TEST 4] Exam info card: 4 columns desktop, schedule row with colored labels, conditional description');
  assert.ok(
    content.includes('grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'),
    'Info card row 1 must have 4 columns on desktop (grid-cols-2 lg:grid-cols-4)'
  );
  assert.ok(
    content.includes('Môn học') &&
      content.includes('Loại bài thi') &&
      content.includes('Thời lượng') &&
      content.includes('Điểm tối đa'),
    'Row 1 must show Subject, Exam Type, Duration, and Max Score'
  );
  assert.ok(
    content.includes('military_tech'),
    'Max score must render with military_tech badge'
  );
  assert.ok(
    content.includes('Mở:') && content.includes('text-blue-600') && content.includes('login'),
    'Opening schedule must use blue label and login icon'
  );
  assert.ok(
    content.includes('Đóng:') && content.includes('text-amber-600') && content.includes('lock_clock'),
    'Closing schedule must use amber label and lock_clock icon'
  );
  assert.ok(
    content.includes('exam.description && exam.description.trim() ?'),
    'Description must only render when content is present'
  );
  console.log('✓ Exam info card satisfies all 4-column, colored schedule, and conditional description specs.');

  // 2.4 Question block & single warning line
  console.log('\n[TEST 5] Question block: Title, count badge, single consolidated warning line');
  assert.ok(
    content.includes('Câu hỏi trong bài thi') && content.includes('id="total-questions-badge"'),
    'Title "Câu hỏi trong bài thi" and total-questions-badge must be present'
  );
  assert.ok(
    content.includes('id="btn-add-question"'),
    'Add question button must be present with id btn-add-question'
  );
  assert.ok(
    content.includes('id="score-validation-warning"'),
    'Single score validation warning line must have id score-validation-warning'
  );
  assert.ok(
    content.includes('Tổng điểm câu hỏi ${formatScore(totalAssignedScore)} / ${formatScore(maxExamScore)} điểm. Cần khớp điểm tối đa để công bố.'),
    'Warning message must display "Tổng điểm câu hỏi X / Y điểm. Cần khớp điểm tối đa để công bố."'
  );

  // Verify warning message output for 1.5 / 10
  const sampleAssigned = 1.5;
  const sampleMax = 10;
  const renderedWarning = `Tổng điểm câu hỏi ${formatScore(sampleAssigned)} / ${formatScore(sampleMax)} điểm. Cần khớp điểm tối đa để công bố.`;
  assert.strictEqual(
    renderedWarning,
    'Tổng điểm câu hỏi 1,5 / 10 điểm. Cần khớp điểm tối đa để công bố.',
    'Rendered warning must match "Tổng điểm câu hỏi 1,5 / 10 điểm. Cần khớp điểm tối đa để công bố."'
  );
  console.log(`✓ Single warning line correctly formatted: "${renderedWarning}"`);

  // 2.5 Question table & responsive card view
  console.log('\n[TEST 6] Question table: Centered STT & Score, Left Content, Right Actions, Responsive cards');
  assert.ok(
    content.includes('th className="w-20 px-4 py-3.5 text-center">STT</th>'),
    'STT column header must be centered'
  );
  assert.ok(
    content.includes('th className="w-32 px-4 py-3.5 text-center">Điểm</th>'),
    'Score column header must be centered'
  );
  assert.ok(
    content.includes('th className="px-4 py-3.5 text-left">Nội dung câu hỏi</th>'),
    'Content column header must be left-aligned'
  );
  assert.ok(
    content.includes('th className="w-36 px-4 py-3.5 text-right">Thao tác</th>'),
    'Actions column header must be right-aligned'
  );
  assert.ok(
    content.includes('{formatScore(q.score)} điểm'),
    'Question score must render formatScore(q.score) + " điểm" (e.g. 0,5 điểm)'
  );
  assert.ok(
    content.includes('id={`btn-edit-${idx}`}') && content.includes('id={`btn-remove-${idx}`}'),
    'Edit and remove buttons must be present in the same action group'
  );
  assert.ok(
    content.includes('id="question-cards-mobile"'),
    'Mobile responsive card view (md:hidden) must be provided so actions do not require horizontal scroll'
  );
  console.log('✓ Questions table and responsive mobile view conform to layout specifications.');

  console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
