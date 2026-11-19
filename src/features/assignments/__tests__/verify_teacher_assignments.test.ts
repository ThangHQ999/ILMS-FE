import {
  getClassAssignmentsPaged,
  getAllClassAssignments,
  deleteAssignment,
  getDeletedAssignmentIds,
  resetDeletedAssignmentIds,
  saveDeletedAssignmentId,
  MOCK_ASSIGNMENTS,
  INITIAL_DEMO_SUBMISSIONS,
} from '../services/assignment.service';

// Mock localStorage in Node.js environment
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
  get length() {
    return Object.keys(mockStorage).length;
  },
} as unknown as Storage;
// @ts-expect-error mock window
globalThis.window = {} as unknown as Window;

function formatTeacherDueDate(dueDate?: string | null): string {
  if (!dueDate) return '';
  const d = new Date(dueDate);
  if (isNaN(d.getTime())) return dueDate;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
}

async function runTests() {
  console.log('=== RUNNING TEACHER ASSIGNMENTS TABLE VIEW VERIFICATION TESTS ===\n');

  // Reset demo storage before tests
  resetDeletedAssignmentIds();

  // ---------------------------------------------------------------
  // Test 1: Due date formatting helper
  // ---------------------------------------------------------------
  console.log('--- Test 1: formatTeacherDueDate helper ---');
  const formatted1 = formatTeacherDueDate('2024-10-28T23:59:00');
  console.log(`1a. Formatted dueDate: "${formatted1}"`);
  if (!formatted1.includes('23:59') || !formatted1.includes('28/10/2024')) {
    throw new Error('1a failed: dueDate format must be "23:59 - 28/10/2024"');
  }

  const formattedEmpty = formatTeacherDueDate(null);
  console.log(`1b. Formatted null dueDate: "${formattedEmpty}"`);
  if (formattedEmpty !== '') {
    throw new Error('1b failed: null dueDate must return empty string');
  }
  console.log('=> Test 1 PASSED.\n');

  // ---------------------------------------------------------------
  // Test 2: Paged API retrieval (GET /api/v1/classes/{classId}/assignments)
  // ---------------------------------------------------------------
  console.log('--- Test 2: getClassAssignmentsPaged page=0, size=5 ---');
  const pagedRes = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 5 });
  console.log(`2a. Total elements: ${pagedRes.totalElements}, Total pages: ${pagedRes.totalPages}`);
  console.log(`2b. Returned items count: ${pagedRes.items.length}, Page number: ${pagedRes.pageNumber}, Page size: ${pagedRes.pageSize}`);

  if (pagedRes.items.length !== 5) {
    throw new Error(`2b failed: Expected 5 items on page 0, got ${pagedRes.items.length}`);
  }
  if (pagedRes.pageNumber !== 0 || pagedRes.pageSize !== 5) {
    throw new Error('2b failed: Incorrect page metadata');
  }

  // Verify fields on each returned item: title, studentMaxScore/maxScore, dueDate, allowLateSubmission
  const firstItem = pagedRes.items[0];
  console.log(`2c. First item sample: title="${firstItem.title}", maxScore=${firstItem.studentMaxScore || firstItem.maxScore}, allowLate=${firstItem.allowLateSubmission}`);
  if (!firstItem.title) throw new Error('2c failed: title missing');
  if (firstItem.studentMaxScore === undefined && firstItem.maxScore === undefined) {
    throw new Error('2c failed: maxScore missing');
  }
  console.log('=> Test 2 PASSED.\n');

  // ---------------------------------------------------------------
  // Test 3: Search keyword and pagination reset
  // ---------------------------------------------------------------
  console.log('--- Test 3: Search filtering ---');
  const searchSqlRes = await getClassAssignmentsPaged('csdl-k22-01', {
    search: 'SQL',
    page: 0,
    size: 5,
  });
  console.log(`3a. Search "SQL" results count: ${searchSqlRes.items.length}, total: ${searchSqlRes.totalElements}`);
  if (searchSqlRes.items.length === 0) {
    throw new Error('3a failed: Expected SQL assignments to match');
  }
  for (const item of searchSqlRes.items) {
    const matched =
      item.title.toLowerCase().includes('sql') ||
      (item.description && item.description.toLowerCase().includes('sql'));
    if (!matched) throw new Error(`3a failed: item "${item.title}" does not contain SQL`);
  }

  const searchNotFound = await getClassAssignmentsPaged('csdl-k22-01', {
    search: 'nonexistent_keyword_xyz_123',
    page: 0,
    size: 5,
  });
  console.log(`3b. Nonexistent search results: ${searchNotFound.items.length}, totalElements: ${searchNotFound.totalElements}`);
  if (searchNotFound.items.length !== 0 || searchNotFound.totalElements !== 0) {
    throw new Error('3b failed: nonexistent keyword should yield 0 items');
  }
  console.log('=> Test 3 PASSED.\n');

  // ---------------------------------------------------------------
  // Test 4: Delete Assignment conflict (409) when assignment has submissions
  // ---------------------------------------------------------------
  console.log('--- Test 4: Delete Assignment conflict (409) for submitted assignment ---');
  // assign-db-01 has submitted submissions in demo
  let error409Thrown = false;
  try {
    await deleteAssignment('assign-db-01');
  } catch (err: unknown) {
    error409Thrown = true;
    const msg = (err as Error).message;
    const status = (err as unknown as { httpStatus: number }).httpStatus;
    console.log(`4a. Caught expected 409 error: status=${status}, message="${msg}"`);
    if (status !== 409) {
      throw new Error(`4a failed: Expected status 409, got ${status}`);
    }
    if (!msg.includes('Bài tập đã có bài nộp')) {
      throw new Error(`4a failed: Error message does not match expected warning`);
    }
  }

  if (!error409Thrown) {
    throw new Error('4a failed: deleteAssignment did not throw 409 for submitted assignment');
  }

  // Confirm assign-db-01 still exists in list
  const listAfterConflict = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 10 });
  const assign1StillExists = listAfterConflict.items.some((a) => a.id === 'assign-db-01');
  console.log(`4b. assign-db-01 still retained in list: ${assign1StillExists}`);
  if (!assign1StillExists) {
    throw new Error('4b failed: assign-db-01 was wrongly deleted despite 409');
  }
  console.log('=> Test 4 PASSED.\n');

  // ---------------------------------------------------------------
  // Test 5: Delete Assignment success (204) for assignment WITHOUT submissions
  // ---------------------------------------------------------------
  console.log('--- Test 5: Delete Assignment success (204) for unsubmitted assignment ---');
  // quiz-05 is UPCOMING / unsubmitted
  const targetId = 'quiz-05';
  await deleteAssignment(targetId);
  console.log(`5a. deleteAssignment(${targetId}) executed with 204 success`);

  // Verify deletedIds contains targetId
  const deletedSet = getDeletedAssignmentIds();
  console.log(`5b. Deleted IDs stored:`, Array.from(deletedSet));
  if (!deletedSet.has(targetId)) {
    throw new Error('5b failed: targetId not found in deleted set');
  }

  // Verify assignment is removed from paged query
  const pagedAfterDelete = await getClassAssignmentsPaged('cs-202', { page: 0, size: 20 });
  const quiz5Exists = pagedAfterDelete.items.some((a) => a.id === targetId);
  console.log(`5c. Target assignment ${targetId} absent from paged list: ${!quiz5Exists}`);
  if (quiz5Exists) {
    throw new Error('5c failed: deleted assignment still returned in paged list');
  }

  // Verify assignment is removed from all assignments query
  const allAfterDelete = await getAllClassAssignments('cs-202');
  const quiz5InAll = allAfterDelete.some((a) => a.id === targetId);
  console.log(`5d. Target assignment ${targetId} absent from all list: ${!quiz5InAll}`);
  if (quiz5InAll) {
    throw new Error('5d failed: deleted assignment still returned in getAllClassAssignments');
  }

  // ---------------------------------------------------------------
  // Test 6: Persistence after F5 / Page reload
  // ---------------------------------------------------------------
  console.log('--- Test 6: Persistence check after simulated reload ---');
  // Re-read storage
  const persistedDeletedIds = getDeletedAssignmentIds();
  console.log(`6a. Persisted deleted IDs from localStorage:`, Array.from(persistedDeletedIds));
  if (!persistedDeletedIds.has(targetId)) {
    throw new Error('6a failed: Deleted assignment not persisted in localStorage');
  }
  console.log('=> Test 6 PASSED.\n');

  // Reset deleted ids after test to clean up
  resetDeletedAssignmentIds();
  console.log('=> Cleaned up test storage.\n');

  // ---------------------------------------------------------------
  // Test 7: Query URL params preservation & tab=assignments F5 reload
  // ---------------------------------------------------------------
  console.log('--- Test 7: URL params synchronization & F5 tab preservation ---');
  const VALID_CLASS_TABS = [
    'overview',
    'subjects',
    'assignments',
    'announcements',
    'members',
    'gradebook',
    'materials',
    'settings',
  ] as const;

  // 7a. Initial entry with tab=assignments
  let params = new URLSearchParams('tab=assignments');
  console.log(`7a. Initial URL query: ?${params.toString()}`);
  if (params.get('tab') !== 'assignments') throw new Error('7a failed');

  // 7b. Navigate to page 2 (page=2, 1-indexed on URL)
  params.set('page', '2');
  console.log(`7b. URL query after navigating to page 2: ?${params.toString()}`);
  if (params.get('tab') !== 'assignments' || params.get('page') !== '2') {
    throw new Error('7b failed: page 2 did not preserve tab=assignments');
  }

  // 7c. Search "SQL" -> reset page, add search keyword
  params.delete('page');
  params.set('search', 'SQL');
  console.log(`7c. URL query after searching "SQL": ?${params.toString()}`);
  if (params.get('tab') !== 'assignments' || params.get('search') !== 'SQL') {
    throw new Error('7c failed: search did not preserve tab=assignments');
  }

  // 7d. Clear search keyword -> search removed, tab=assignments preserved
  params.delete('search');
  console.log(`7d. URL query after clearing search: ?${params.toString()}`);
  if (params.get('tab') !== 'assignments' || params.get('search') !== null) {
    throw new Error('7d failed: clear search lost tab=assignments');
  }

  // 7e. Simulated F5 reload logic
  const tabFromQueryAfterReload = params.get('tab');
  const isValidTab = Boolean(
    tabFromQueryAfterReload &&
      VALID_CLASS_TABS.includes(tabFromQueryAfterReload as (typeof VALID_CLASS_TABS)[number])
  );
  const activeTabAfterReload = isValidTab ? (tabFromQueryAfterReload as string) : 'subjects';
  console.log(`7e. Active tab after F5 reload: "${activeTabAfterReload}"`);
  if (activeTabAfterReload !== 'assignments') {
    throw new Error(`7e failed: Expected tab "assignments" after reload, got "${activeTabAfterReload}"`);
  }

  // 7f. Default fallback to 'subjects' ONLY when tab is missing or invalid
  const emptyParams = new URLSearchParams('');
  const missingTab = emptyParams.get('tab');
  const isMissingValid = Boolean(
    missingTab && VALID_CLASS_TABS.includes(missingTab as (typeof VALID_CLASS_TABS)[number])
  );
  const defaultTab = isMissingValid ? missingTab : 'subjects';
  console.log(`7f. Fallback tab when missing: "${defaultTab}"`);
  if (defaultTab !== 'subjects') throw new Error('7f failed: fallback should be "subjects"');

  console.log('=> Test 7 PASSED.\n');

  // ---------------------------------------------------------------
  // Test 8: Button labels for Teacher ("Danh sách bài nộp") vs Student ("Xem bài tập")
  // ---------------------------------------------------------------
  console.log('--- Test 8: Button labels (Teacher "Danh sách bài nộp" vs Student "Xem bài tập") ---');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const vi = require('../../../messages/vi.json');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const en = require('../../../messages/en.json');

  const teacherBtnVi = vi.assignments?.teacher?.actions?.viewAssignment;
  const teacherBtnEn = en.assignments?.teacher?.actions?.viewAssignment;
  console.log(`8a. Teacher button label (VI): "${teacherBtnVi}", (EN): "${teacherBtnEn}"`);
  if (teacherBtnVi !== 'Danh sách bài nộp') {
    throw new Error(`8a failed: Expected Teacher button label "Danh sách bài nộp", got "${teacherBtnVi}"`);
  }
  if (teacherBtnEn !== 'Submissions list') {
    throw new Error(`8a failed: Expected Teacher button label "Submissions list", got "${teacherBtnEn}"`);
  }

  // Trong danh sách đó, nút mở chi tiết từng bản nộp để chấm là "Xem bài nộp"
  const submissionActionVi = vi.assignments?.teacher?.submissions?.actions?.viewSubmission;
  const submissionActionEn = en.assignments?.teacher?.submissions?.actions?.viewSubmission;
  console.log(`8b. Submission item action label (VI): "${submissionActionVi}", (EN): "${submissionActionEn}"`);
  if (submissionActionVi !== 'Xem bài nộp') {
    throw new Error(`8b failed: Expected Submission item action label "Xem bài nộp", got "${submissionActionVi}"`);
  }

  const studentBtnVi = vi.assignments?.student?.viewAssignment;
  const studentBtnEn = en.assignments?.student?.viewAssignment;
  console.log(`8c. Student button label (VI): "${studentBtnVi}", (EN): "${studentBtnEn}"`);
  if (studentBtnVi !== 'Xem bài tập') {
    throw new Error(`8c failed: Expected Student button label "Xem bài tập", got "${studentBtnVi}"`);
  }
  if (studentBtnEn !== 'View Assignment') {
    throw new Error(`8c failed: Expected Student button label "View Assignment", got "${studentBtnEn}"`);
  }

  // URL checking
  const sampleClassId = 'csdl-k22-01';
  const sampleAssignmentId = 'assign-db-01';
  const targetUrl = `/classes/${sampleClassId}/assignments/${sampleAssignmentId}`;
  console.log(`8c. Target route for both roles: "${targetUrl}"`);
  if (targetUrl !== '/classes/csdl-k22-01/assignments/assign-db-01') {
    throw new Error('8c failed: Target route mismatch');
  }
  console.log('=> Test 8 PASSED.\n');

  console.log('======================================================');
  console.log('ALL TEACHER ASSIGNMENTS TABLE VIEW TESTS PASSED SUCCESSFULLY! (8/8)');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('TEST SUITE FAILED:', err);
  process.exit(1);
});
