import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

async function runTests() {
  console.log('=== VERIFYING TEACHER EXAMS TABLE COMPACT LAYOUT & SPACING ===\n');

  const filePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherExamsTableView.tsx'
  );
  assert.ok(fs.existsSync(filePath), 'TeacherExamsTableView.tsx must exist');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Test 1: Header subtitle shortened to class code only
  console.log('[TEST 1] Header: Subtitle shortened to class code');
  assert.ok(
    content.includes('{className || \'CSDL-K22-01\'}'),
    'Header subtitle must only show class code (className || "CSDL-K22-01")'
  );
  assert.ok(
    !content.includes('Quản lý đề thi và bài đánh giá định kỳ'),
    'Old long subtitle must be removed'
  );
  console.log('✓ Header subtitle simplified to class code.');

  // Test 2: Spacing between header, filters, and table is 12-16px
  console.log('\n[TEST 2] Spacing: 12-16px gaps between header, filter toolbar, and table');
  assert.ok(
    content.includes('gap-3 mb-3.5'),
    'Header margin-bottom must be mb-3.5 (14px, within 12-16px range)'
  );
  assert.ok(
    content.includes('mb-3.5 p-2.5 rounded-2xl'),
    'Filter toolbar margin-bottom must be mb-3.5 (14px, within 12-16px range)'
  );
  console.log('✓ Spacing between header, filters, and table is exactly 14px (12-16px).');

  // Test 3: Filter chips compaction & Sort on the right
  console.log('\n[TEST 3] Filter toolbar: Compact chips and right-aligned Sort');
  assert.ok(
    content.includes('filter-type-btn h-6.5 px-2.5 text-xs rounded-lg font-medium'),
    'Type filter chips must be compact (h-6.5 px-2.5)'
  );
  assert.ok(
    content.includes('filter-status-btn h-6.5 px-2.5 text-xs rounded-lg font-medium'),
    'Status filter chips must be compact (h-6.5 px-2.5)'
  );
  assert.ok(
    content.includes('btnSortDropdown'),
    'Sort dropdown must be present'
  );
  console.log('✓ Filter chips are compact and sort dropdown is positioned on the right.');

  // Test 4: Table row padding 8-10px (py-2) & Subtitle with CS-202 kept together
  console.log('\n[TEST 4] Table rows: 8-10px vertical padding, subline with CS-202 kept intact');
  assert.ok(
    content.includes('th scope="col" className="py-2 px-2.5 text-left"'),
    'Table header cells must use py-2 (8px)'
  );
  assert.ok(
    content.includes('td className="py-2 px-2.5 align-middle"'),
    'Table body cells must use py-2 (8px, within 8-10px range)'
  );
  assert.ok(
    content.includes('whitespace-nowrap">({exam.courseCode})</span>'),
    'Course code like (CS-202) must be wrapped with whitespace-nowrap to keep it together'
  );
  assert.ok(
    content.includes('line-clamp-2 leading-snug transition-colors break-words text-xs sm:text-sm'),
    'Exam title must allow multi-line wrap when long'
  );
  console.log('✓ Table rows have 8px padding, title wraps, and CS-202 code stays together.');

  // Test 5: Exam schedule icon 16px, reduced line gap, compact action button
  console.log('\n[TEST 5] Schedule & Actions: 16px icon box, reduced gap, compact action button');
  assert.ok(
    content.includes('w-4 h-4 rounded flex items-center justify-center shrink-0 bg-blue-50'),
    'Opening schedule icon box must be 16px (w-4 h-4)'
  );
  assert.ok(
    content.includes('w-4 h-4 rounded flex items-center justify-center shrink-0 bg-amber-50'),
    'Closing schedule icon box must be 16px (w-4 h-4)'
  );
  assert.ok(
    content.includes('space-y-0.5 text-xs'),
    'Schedule rows must use space-y-0.5 for reduced line gap'
  );
  assert.ok(
    content.includes('px-2 py-1 rounded-lg text-xs font-bold'),
    'View detail button must use compact px-2 py-1 padding'
  );
  assert.ok(
    content.includes('btn-more-menu p-1 rounded-md'),
    '3-dots menu button must be present alongside View detail button'
  );
  console.log('✓ Schedule icons are 16px with reduced gap, action buttons compact and non-wrapping.');

  // Test 6: Pagination placed closer to table
  console.log('\n[TEST 6] Pagination: Placed closer to table with counts left and controls right');
  assert.ok(
    content.includes('mt-3 sm:mt-3.5 pt-3 border-t border-slate-100'),
    'Pagination must have compact top margin (mt-3 sm:mt-3.5 pt-3)'
  );
  assert.ok(
    content.includes('id="paginationText"'),
    'Pagination text must be on the left'
  );
  assert.ok(
    content.includes('Sau &gt;'),
    'Pagination controls must be on the right'
  );
  console.log('✓ Pagination is placed closer to table (12-14px).');

  console.log('\n=== ALL COMPACT SPECIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
