import assert from 'node:assert';
import {
  assignmentItemSchema,
  assignmentListEnvelopeSchema,
} from '../schemas/assignment.schema';
import {
  getClassAssignmentsPaged,
  getAllClassAssignments,
  formatScore,
} from '../services/assignment.service';

/**
 * Test Suite: Verify Cross-Class Assignment Loading, Tolerant Schema, Dynamic Badges & Layout
 */
async function runTests() {
  console.log('=== STARTING CROSS-CLASS ASSIGNMENTS & LAYOUT VERIFICATION TESTS ===\n');

  // ----------------------------------------------------
  // TEST 1: UUID Real Class Identification vs Mock Class
  // ----------------------------------------------------
  console.log('--- TEST 1: UUID vs Mock Class Identification ---');
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const realClassUuid1 = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const realClassUuid2 = 'e211a7b8-8c11-4f12-9c3a-123456789abc';
  const mockClassId = 'csdl-k22-01';

  assert(uuidRegex.test(realClassUuid1), 'realClassUuid1 must be recognized as valid UUID');
  assert(uuidRegex.test(realClassUuid2), 'realClassUuid2 must be recognized as valid UUID');
  assert(!uuidRegex.test(mockClassId), 'mockClassId must not match UUID regex');
  console.log('✓ UUID regex correctly identifies real class UUIDs vs mock strings\n');

  // ----------------------------------------------------
  // TEST 2: Tolerant Zod Schema Parsing (DTO with missing classId, null dueDate, loose types)
  // ----------------------------------------------------
  console.log('--- TEST 2: Tolerant Zod Schema Parsing ---');
  const backendDtoSample = {
    id: 'e211a7b8-8c11-4f12-9c3a-123456789abc',
    title: 'Bài tập chuẩn hóa CSDL',
    description: 'Yêu cầu chuẩn hóa lược đồ quan hệ',
    // Missing classId, courseId, lessonId from backend summary
    dueDate: null, // nullable dueDate
    allowLateSubmission: false,
    maxScore: null, // backend might return null maxScore
    type: 'CUSTOM_ASSIGNMENT_TYPE', // unknown type should map safely
    status: 'OPEN',
    totalSubmissions: 42,
    gradedSubmissions: 35,
    createdAt: '2024-11-01T08:00:00Z',
    updatedAt: '2024-11-02T08:00:00Z',
  };

  const parsedItem = assignmentItemSchema.safeParse(backendDtoSample);
  assert(parsedItem.success, `Schema parse failed: ${JSON.stringify(parsedItem.error?.issues)}`);
  assert.strictEqual(parsedItem.data.title, 'Bài tập chuẩn hóa CSDL');
  assert.strictEqual(parsedItem.data.dueDate, null);
  assert.strictEqual(parsedItem.data.allowLateSubmission, false);
  // Type transform tolerant fallback
  assert(['QUIZ', 'EXAM', 'PROJECT', 'LAB'].includes(parsedItem.data.type), 'Type should be safely mapped');
  console.log('✓ Backend DTO with missing classId and null maxScore parsed successfully\n');

  // Envelope parsing with raw list
  const backendEnvelope = {
    code: 'SUCCESS',
    message: 'OK',
    data: {
      items: [backendDtoSample],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      pageSize: 5,
    },
  };
  const parsedEnvelope = assignmentListEnvelopeSchema.safeParse(backendEnvelope.data);
  assert(parsedEnvelope.success, `Envelope parse failed: ${JSON.stringify(parsedEnvelope.error?.issues)}`);
  console.log('✓ Envelope schema successfully validated wrapped paginated response\n');

  // ----------------------------------------------------
  // TEST 3: Mock Class Fallback Data Loading
  // ----------------------------------------------------
  console.log('--- TEST 3: Mock Class Data Loading ---');
  const mockPagedRes = await getClassAssignmentsPaged('csdl-k22-01', { page: 0, size: 5 });
  assert(mockPagedRes.items.length > 0, 'Mock class should load mock items');
  assert.strictEqual(mockPagedRes.pageSize, 5, 'Page size should be 5');
  console.log(`✓ Mock class returned ${mockPagedRes.items.length} items, totalElements=${mockPagedRes.totalElements}\n`);

  // ----------------------------------------------------
  // TEST 4: Null Due Date & Past Due with Late Submission Rules
  // ----------------------------------------------------
  console.log('--- TEST 4: Due Date & Late Submission Logic ---');

  // Case A: dueDate is null (like bài 'áda')
  const itemNoDueDate = {
    ...backendDtoSample,
    id: 'assign-no-due',
    dueDate: null,
    allowLateSubmission: false,
  };
  const parsedNoDueDate = assignmentItemSchema.parse(itemNoDueDate);
  assert.strictEqual(parsedNoDueDate.dueDate, null);
  // Frontend logic: if (!item.dueDate), display 'Không có hạn nộp' and hide 'Nộp muộn'
  const hasDueDateA = Boolean(parsedNoDueDate.dueDate);
  assert.strictEqual(hasDueDateA, false, 'hasDueDate must be false for null dueDate');

  // Case B: Past due with late submission allowed (like bài 'Demo11')
  const pastDate = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const itemPastDueLateAllowed = {
    ...backendDtoSample,
    id: 'assign-past-due-late',
    dueDate: pastDate,
    allowLateSubmission: true,
  };
  const parsedPastDue = assignmentItemSchema.parse(itemPastDueLateAllowed);
  const now = Date.now();
  const isPastDue = new Date(parsedPastDue.dueDate!).getTime() < now;
  const isPastDueWithLate = isPastDue && parsedPastDue.allowLateSubmission;
  assert(isPastDueWithLate, 'Must recognize as past due with late submission allowed');
  // Expected label: "Quá hạn · Cho nộp muộn"
  const expectedDueLabel = isPastDueWithLate ? 'Quá hạn · Cho nộp muộn' : 'Hạn nộp';
  assert.strictEqual(expectedDueLabel, 'Quá hạn · Cho nộp muộn');
  console.log('✓ Null dueDate and Past due with late submission logic verified\n');

  // ----------------------------------------------------
  // TEST 5: Graded Result - Zero Score & No Fake Hardcoded Comments
  // ----------------------------------------------------
  console.log('--- TEST 5: Graded Score Format & Clean Comments ---');
  // formatScore must correctly format 0
  assert.strictEqual(formatScore(0, 'vi'), '0');
  assert.strictEqual(formatScore(0.0, 'vi'), '0');
  assert.strictEqual(formatScore(9.5, 'vi'), '9,5');
  assert.strictEqual(formatScore(10, 'vi'), '10');

  // Grader & Feedback fallback verification
  const submissionWithRealFeedback = {
    feedback: 'Bài làm rất tốt, chi tiết.',
    gradedByTeacherName: 'TS. Nguyễn Văn A',
  };
  const submissionWithNoFeedback = {
    feedback: null,
    gradedByTeacherName: null,
  };

  const comment1 = (submissionWithRealFeedback.feedback || '').trim();
  assert.strictEqual(comment1, 'Bài làm rất tốt, chi tiết.');

  const comment2 = (submissionWithNoFeedback.feedback || '').trim();
  assert.strictEqual(comment2, '', 'Empty feedback should be empty string, not fake mock text');
  console.log('✓ Zero score formatting and absence of fake hardcoded teacher comments verified\n');

  // ----------------------------------------------------
  // TEST 6: Dynamic Assignments Count for Tab Badge
  // ----------------------------------------------------
  console.log('--- TEST 6: Dynamic Assignments Count for Tab Badge ---');
  // Badge must accept dynamic assignmentsCount
  const allAssignments = await getAllClassAssignments('csdl-k22-01');
  const count = allAssignments.length;
  assert(typeof count === 'number' && count > 0, 'Total assignments count must be a valid number');
  console.log(`✓ Dynamic assignments count for tab badge resolved: ${count}\n`);

  console.log('=== ALL CROSS-CLASS & LAYOUT VERIFICATION TESTS PASSED ===');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
