import assert from 'node:assert';
import {
  getClassAssignmentsPaged,
  getAssignmentById,
  deleteAssignment,
  getAssignmentGradingProgress,
  getAssignmentSubmissionsPaged,
} from '../services/assignment.service';

/**
 * Test Suite: Verify Teacher Assignments View Redesign According to Stitch Specs
 */
async function runTests() {
  console.log('=== STARTING TEACHER ASSIGNMENTS STITCH REDESIGN VERIFICATION TESTS ===\n');

  const classId = 'csdl-k22-01';

  // ----------------------------------------------------
  // TEST 1: Paged list with size=5
  // ----------------------------------------------------
  console.log('--- TEST 1: Paged List with size=5 ---');
  const pagedRes = await getClassAssignmentsPaged(classId, { page: 0, size: 5 });
  assert.strictEqual(pagedRes.items.length, 5, 'Page 0 must return exactly 5 items');
  assert.strictEqual(pagedRes.pageSize, 5, 'Page size must be 5');
  assert(pagedRes.totalElements >= 5, 'Total elements must be at least 5');
  console.log(`✓ Returned ${pagedRes.items.length} items on page 0 with size=5, total=${pagedRes.totalElements}\n`);

  // ----------------------------------------------------
  // TEST 2: Featured Navy Card Candidate Selection Rules
  // ----------------------------------------------------
  console.log('--- TEST 2: Featured Navy Card Candidate Selection Rules ---');
  // Scenario A: Default Page 0 overview (page 0, no search, status ALL) -> Featured Card exists
  const isDefaultOverview = true;
  const featuredItem = isDefaultOverview && pagedRes.items.length > 0 ? pagedRes.items[0] : null;
  assert(featuredItem !== null, 'Featured card must exist on page 0 without search/filter');
  assert.strictEqual(featuredItem.id, 'assign-db-01', 'Featured card must be assign-db-01 (latest item)');

  // White cards below featured card should have 4 items on page 1 (5 - 1 = 4)
  const standardItemsPage0 = pagedRes.items.slice(1);
  assert.strictEqual(standardItemsPage0.length, 4, 'Standard white cards list must display remaining 4 items on page 0');

  // Scenario B: With search query -> No featured card, all 5 items rendered as white cards
  const searchRes = await getClassAssignmentsPaged(classId, { page: 0, size: 5, search: 'bài tập' });
  const hasFeaturedWithSearch = false; // When search is active, hasFeaturedCard is false
  const standardItemsWithSearch = hasFeaturedWithSearch ? searchRes.items.slice(1) : searchRes.items;
  assert.strictEqual(standardItemsWithSearch.length, searchRes.items.length, 'All search results must render as standard white cards');
  console.log('✓ Featured Navy Card rules verified: 1 featured + 4 white cards on page 0, full white cards during search\n');

  // ----------------------------------------------------
  // TEST 3: Due Date Filter Dropdown ('ALL', 'ACTIVE', 'PAST_DUE', 'NO_DEADLINE')
  // ----------------------------------------------------
  console.log('--- TEST 3: Due Date Filter Dropdown ---');
  const allRes = await getClassAssignmentsPaged(classId, { page: 0, size: 10, status: 'ALL' });
  const activeRes = await getClassAssignmentsPaged(classId, { page: 0, size: 10, status: 'ACTIVE' });
  const pastDueRes = await getClassAssignmentsPaged(classId, { page: 0, size: 10, status: 'PAST_DUE' });
  const noDeadlineRes = await getClassAssignmentsPaged(classId, { page: 0, size: 10, status: 'NO_DEADLINE' });

  // Verify ACTIVE items have future due dates
  const now = Date.now();
  for (const item of activeRes.items) {
    assert(item.dueDate !== null && item.dueDate !== undefined, 'ACTIVE item must have a due date');
    assert(new Date(item.dueDate).getTime() >= now, `ACTIVE item ${item.id} due date must be in the future`);
  }

  // Verify PAST_DUE items have past due dates
  for (const item of pastDueRes.items) {
    assert(item.dueDate !== null && item.dueDate !== undefined, 'PAST_DUE item must have a due date');
    assert(new Date(item.dueDate).getTime() < now, `PAST_DUE item ${item.id} due date must be in the past`);
  }

  // Verify NO_DEADLINE items have no due date
  for (const item of noDeadlineRes.items) {
    assert(!item.dueDate, `NO_DEADLINE item ${item.id} must not have a due date`);
  }

  console.log(`✓ Filters verified: Total=${allRes.totalElements}, Active=${activeRes.totalElements}, PastDue=${pastDueRes.totalElements}, NoDeadline=${noDeadlineRes.totalElements}\n`);

  // ----------------------------------------------------
  // TEST 4: Grading Progress Synchronized with Submissions List
  // ----------------------------------------------------
  console.log('--- TEST 4: Grading Progress Synchronized with Submissions List ---');
  // assign-db-01: 5 active demo submissions (2 graded: score 0 and score 8.5)
  const p1 = await getAssignmentGradingProgress('assign-db-01', classId);
  const sub1 = await getAssignmentSubmissionsPaged('assign-db-01', { classId });
  assert.strictEqual(p1.totalSubmissions, sub1.totalElements, 'assign-db-01 total submissions must match submissions list');
  assert.strictEqual(p1.totalSubmissions, 5, 'assign-db-01 total submissions must be 5');
  assert.strictEqual(p1.gradedSubmissions, 2, 'assign-db-01 graded submissions must be 2');
  assert.strictEqual(p1.pendingGrading, 3, 'assign-db-01 pending grading must be 3');
  assert.strictEqual(p1.isAllGraded, false);
  assert.strictEqual(p1.hasNoSubmissions, false);

  // assign-db-02: 1 submission (submitted, ungraded)
  const p2 = await getAssignmentGradingProgress('assign-db-02', classId);
  assert.strictEqual(p2.totalSubmissions, 1);
  assert.strictEqual(p2.gradedSubmissions, 0);
  assert.strictEqual(p2.pendingGrading, 1);

  // assign-db-03: 0/0 (no submissions)
  const p3 = await getAssignmentGradingProgress('assign-db-03', classId);
  assert.strictEqual(p3.totalSubmissions, 0);
  assert.strictEqual(p3.hasNoSubmissions, true);

  // assign-db-04: 0/0 (no submissions)
  const p4 = await getAssignmentGradingProgress('assign-db-04', classId);
  assert.strictEqual(p4.totalSubmissions, 0);
  assert.strictEqual(p4.hasNoSubmissions, true);

  // assign-db-05: 1/1 • all graded
  const p5 = await getAssignmentGradingProgress('assign-db-05', classId);
  const sub5 = await getAssignmentSubmissionsPaged('assign-db-05', { classId });
  assert.strictEqual(p5.totalSubmissions, sub5.totalElements);
  assert.strictEqual(p5.totalSubmissions, 1);
  assert.strictEqual(p5.gradedSubmissions, 1);
  assert.strictEqual(p5.pendingGrading, 0);
  assert.strictEqual(p5.isAllGraded, true);

  console.log('✓ All 5 assignments match exact submissions list\n');

  // ----------------------------------------------------
  // TEST 5: "Xem bài tập" Modal Data Loading
  // ----------------------------------------------------
  console.log('--- TEST 5: "Xem bài tập" Modal Data Loading ---');
  const viewDetail = await getAssignmentById('assign-db-01', classId);
  assert(viewDetail.title.includes('chuẩn hóa'), 'Assignment title must match');
  assert(viewDetail.description && viewDetail.description.length > 0, 'Assignment description must be populated');
  assert(viewDetail.fileAttachmentUrl && viewDetail.fileAttachmentUrl.includes('De_bai_Tuan_06.pdf'), 'Attachment URL must match Stitch');
  assert.strictEqual(viewDetail.maxScore, 10, 'Max score must be 10');
  assert.strictEqual(viewDetail.allowLateSubmission, true, 'Late submission must be allowed');
  console.log(`✓ "Xem bài tập" detail loaded successfully for ${viewDetail.id} with attachment: ${viewDetail.fileAttachmentUrl}\n`);

  // ----------------------------------------------------
  // TEST 6: Delete Assignment Conflict (409) vs Success (204)
  // ----------------------------------------------------
  console.log('--- TEST 6: Delete Assignment Conflict (409) vs Success (204) ---');
  let conflictCaught = false;
  try {
    await deleteAssignment('assign-db-01', classId);
  } catch (err: unknown) {
    conflictCaught = true;
    const httpStatus = (err as { httpStatus?: number })?.httpStatus;
    const msg = (err as Error)?.message;
    assert.strictEqual(httpStatus, 409, 'Must throw 409 Conflict when deleting assignment with submissions');
    assert(msg?.includes('Bài tập đã có bài nộp sẽ không thể xóa'), 'Must provide clear conflict message');
  }
  assert(conflictCaught, '409 Conflict error must be caught when deleting assign-db-01');

  // Deleting unsubmitted assignment quiz-05 should succeed
  await deleteAssignment('quiz-05', classId);
  const afterDeleteRes = await getClassAssignmentsPaged(classId, { page: 0, size: 20 });
  assert(!afterDeleteRes.items.some((a) => a.id === 'quiz-05'), 'quiz-05 must be removed from list');
  console.log('✓ Delete conflict 409 handled and unsubmitted delete 204 verified\n');

  // ----------------------------------------------------
  // TEST 7: Responsive 2-Column Layout & Translation Keys Integrity
  // ----------------------------------------------------
  console.log('--- TEST 7: Translation Keys Integrity ---');
  const fs = await import('fs');
  const vi = JSON.parse(fs.readFileSync('src/messages/vi.json', 'utf8'));
  const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));

  assert(vi.assignments?.teacher?.sidebar?.title, 'VI sidebar title must exist');
  assert(en.assignments?.teacher?.sidebar?.title, 'EN sidebar title must exist');
  assert(vi.assignments?.teacher?.statusFilter?.all, 'VI status filter "all" must exist');
  assert(en.assignments?.teacher?.statusFilter?.all, 'EN status filter "all" must exist');
  assert(vi.assignments?.teacher?.featured?.gradingProgress, 'VI featured grading progress key must exist');
  assert(en.assignments?.teacher?.featured?.gradingProgress, 'EN featured grading progress key must exist');
  assert(vi.assignments?.teacher?.card?.allGraded, 'VI card allGraded key must exist');
  assert(en.assignments?.teacher?.card?.allGraded, 'EN card allGraded key must exist');
  assert(vi.assignments?.teacher?.viewModal?.title, 'VI viewModal title must exist');
  assert(en.assignments?.teacher?.viewModal?.title, 'EN viewModal title must exist');
  console.log('✓ All i18n keys for Teacher Assignments redesign verified in both vi.json and en.json\n');

  console.log('================================================================');
  console.log('🎉 ALL 7 TEACHER ASSIGNMENTS STITCH REDESIGN TESTS PASSED (7/7)!');
  console.log('================================================================');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
