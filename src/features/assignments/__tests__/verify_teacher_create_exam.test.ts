import fs from 'fs';
import path from 'path';
import {
  createExamFormSchema,
  type CreateExamInput,
} from '../schemas/exam.schema';
import {
  createExam,
  getClassExamsPaged,
  resetCreatedExams,
  formatExamPayloadDateTime,
  type ExamNetworkLog,
} from '../services/exam.service';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

// Mock localStorage and window for Node environment
const mockStorage: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
  },
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
  get length() {
    return Object.keys(mockStorage).length;
  },
} as unknown as Storage;

(globalThis as unknown as { window: unknown }).window = {};

async function runTeacherCreateExamTests() {
  console.log('=== VERIFYING TEACHER CREATE EXAM VIEW & API INTEGRATION ===\n');

  resetCreatedExams();

  // -------------------------------------------------------------
  // Ca 1: Kiểm tra ca thiếu trường (Validation)
  // -------------------------------------------------------------
  console.log('Ca 1: Kiểm tra ca thiếu trường dữ liệu...');

  // 1.1 Thiếu courseId
  const missingCourse = createExamFormSchema.safeParse({
    courseId: '',
    examType: 'QUIZ',
    title: 'Kiểm tra 15 phút',
    durationMinutes: 15,
    totalScore: 10,
    startTime: '2026-11-20T08:00',
    endTime: '2026-11-20T09:00',
  });
  assert(!missingCourse.success, 'Thiếu courseId phải bị từ chối');
  const courseIssue = missingCourse.error?.issues.find((i) => i.path.includes('courseId'));
  assert(Boolean(courseIssue), 'Phải có issue cho courseId');
  console.log('  -> Thiếu courseId: Báo lỗi chính xác:', courseIssue?.message);

  // 1.2 Thiếu title hoặc chỉ có space
  const missingTitle = createExamFormSchema.safeParse({
    courseId: 'course-cs-202',
    examType: 'MIDTERM',
    title: '   ',
    durationMinutes: 60,
    totalScore: 10,
    startTime: '2026-11-20T08:00',
    endTime: '2026-11-20T09:30',
  });
  assert(!missingTitle.success, 'Title rỗng phải bị từ chối');
  const titleIssue = missingTitle.error?.issues.find((i) => i.path.includes('title'));
  assert(Boolean(titleIssue), 'Phải có issue cho title');
  console.log('  -> Title rỗng: Báo lỗi chính xác:', titleIssue?.message);

  // 1.3 Title vượt quá 255 ký tự
  const longTitle = createExamFormSchema.safeParse({
    courseId: 'course-cs-202',
    examType: 'MIDTERM',
    title: 'A'.repeat(256),
    durationMinutes: 60,
    totalScore: 10,
    startTime: '2026-11-20T08:00',
    endTime: '2026-11-20T09:30',
  });
  assert(!longTitle.success, 'Title > 255 ký tự phải bị từ chối');
  console.log('  -> Title > 255 ký tự: Báo lỗi chính xác');

  // 1.4 Sai examType
  const invalidType = createExamFormSchema.safeParse({
    courseId: 'course-cs-202',
    examType: 'UNKNOWN_TYPE',
    title: 'Bài thi thử',
    durationMinutes: 45,
    totalScore: 10,
    startTime: '2026-11-20T08:00',
    endTime: '2026-11-20T09:00',
  });
  assert(!invalidType.success, 'Sai examType phải bị từ chối');
  console.log('  -> Sai examType: Báo lỗi chính xác');

  // 1.5 totalScore > 100 hoặc có hơn 2 chữ số thập phân
  const invalidScore = createExamFormSchema.safeParse({
    courseId: 'course-cs-202',
    examType: 'QUIZ',
    title: 'Quiz 1',
    durationMinutes: 15,
    totalScore: 10.125, // 3 chữ số thập phân
    startTime: '2026-11-20T08:00',
    endTime: '2026-11-20T09:00',
  });
  assert(!invalidScore.success, 'Score có 3 chữ số thập phân phải bị từ chối');
  console.log('  -> Score > 2 chữ số thập phân: Báo lỗi chính xác');

  const over100Score = createExamFormSchema.safeParse({
    courseId: 'course-cs-202',
    examType: 'QUIZ',
    title: 'Quiz 1',
    durationMinutes: 15,
    totalScore: 105,
    startTime: '2026-11-20T08:00',
    endTime: '2026-11-20T09:00',
  });
  assert(!over100Score.success, 'Score > 100 phải bị từ chối');
  console.log('  -> Score > 100: Báo lỗi chính xác');

  console.log('  -> PASSED Ca 1: Toàn bộ validation thiếu/sai trường dữ liệu hoạt động chính xác!\n');

  // -------------------------------------------------------------
  // Ca 2: Kiểm tra khung giờ ngắn hơn thời lượng và giờ đóng trước giờ mở
  // -------------------------------------------------------------
  console.log('Ca 2: Kiểm tra ràng buộc khung giờ mở và đóng...');

  // 2.1 Giờ đóng trước giờ mở
  const endBeforeStart = createExamFormSchema.safeParse({
    courseId: 'course-cs-202',
    examType: 'FINAL',
    title: 'Thi cuối kỳ',
    durationMinutes: 90,
    totalScore: 10,
    startTime: '2026-11-20T10:00',
    endTime: '2026-11-20T08:00',
  });
  assert(!endBeforeStart.success, 'Giờ đóng trước giờ mở phải bị từ chối');
  const endBeforeStartIssue = endBeforeStart.error?.issues.find((i) =>
    i.message.includes('Giờ đóng phải sau giờ mở')
  );
  assert(Boolean(endBeforeStartIssue), 'Phải có issue: Giờ đóng phải sau giờ mở');
  console.log('  -> Giờ đóng trước giờ mở: Báo lỗi chính xác:', endBeforeStartIssue?.message);

  // 2.2 Khung giờ ngắn hơn thời lượng (Duration = 60 phút, nhưng khung giờ chỉ có 30 phút)
  const shortWindow = createExamFormSchema.safeParse({
    courseId: 'course-cs-202',
    examType: 'FINAL',
    title: 'Thi cuối kỳ',
    durationMinutes: 60,
    totalScore: 10,
    startTime: '2026-11-20T08:00',
    endTime: '2026-11-20T08:30', // Chỉ có 30 phút
  });
  assert(!shortWindow.success, 'Khung giờ ngắn hơn thời lượng phải bị từ chối');
  const shortWindowIssue = shortWindow.error?.issues.find((i) =>
    i.message.includes('Khoảng thời gian mở phải đủ thời lượng làm bài')
  );
  assert(Boolean(shortWindowIssue), 'Phải có issue: Khoảng thời gian mở phải đủ thời lượng làm bài');
  console.log('  -> Khung giờ ngắn hơn thời lượng: Báo lỗi chính xác:', shortWindowIssue?.message);

  // 2.3 Khung giờ hợp lệ (bằng hoặc lớn hơn thời lượng)
  const validWindow = createExamFormSchema.safeParse({
    courseId: 'course-cs-202',
    examType: 'CONTEST',
    title: 'Olympic Tin học sinh viên',
    durationMinutes: 120,
    totalScore: 100,
    startTime: '2026-11-20T08:00',
    endTime: '2026-11-20T12:00', // 4 tiếng >= 120 phút
  });
  assert(validWindow.success, 'Khung giờ hợp lệ phải pass validation');
  console.log('  -> Khung giờ hợp lệ: Passed validation thành công!');

  console.log('  -> PASSED Ca 2: Ràng buộc khung giờ & thời lượng hoạt động chính xác!\n');

  // -------------------------------------------------------------
  // Ca 3: Kiểm tra gửi request thật tới lớp UUID test (00000000-0000-4000-8000-000000000001)
  // -------------------------------------------------------------
  console.log('Ca 3: Kiểm tra gửi request thật tới lớp UUID test...');
  const testUuidClassId = '00000000-0000-4000-8000-000000000001';

  const testPayload: CreateExamInput = {
    courseId: '00000000-0000-4000-8000-000000000002',
    examType: 'QUIZ',
    title: 'Kiểm tra trắc nghiệm Chương 1',
    description: 'Bài kiểm tra kiến thức tổng quan',
    durationMinutes: 30,
    totalScore: 10,
    startTime: '2026-11-20T08:00',
    endTime: '2026-11-20T10:00',
  };

  let apiErrorCaught: unknown = null;
  try {
    await createExam(testUuidClassId, testPayload);
  } catch (err: unknown) {
    apiErrorCaught = err;
  }

  assert(apiErrorCaught !== null, 'Tạo exam trên UUID không có auth session phải throw error');

  const win = (globalThis as unknown as { window: { __lastExamCreateCall?: ExamNetworkLog } }).window;
  const lastCreateLog = win.__lastExamCreateCall;

  assert(lastCreateLog !== undefined, 'createExam phải ghi nhận __lastExamCreateCall');
  console.log('  -> Request URL:', lastCreateLog?.fullUrl);
  console.log('  -> HTTP Status:', lastCreateLog?.httpStatus);
  console.log('  -> Payload thực tế gửi đi:', JSON.stringify(lastCreateLog?.payload, null, 2));

  assert(
    Boolean(lastCreateLog?.fullUrl.includes(`/classes/${testUuidClassId}/exams`)),
    'Endpoint phải trỏ tới /classes/{uuid}/exams'
  );
  assert(
    lastCreateLog?.payload?.startTime === '2026-11-20T08:00:00',
    'startTime phải có định dạng yyyy-MM-ddTHH:mm:ss'
  );
  assert(
    lastCreateLog?.payload?.endTime === '2026-11-20T10:00:00',
    'endTime phải có định dạng yyyy-MM-ddTHH:mm:ss'
  );
  assert(
    lastCreateLog?.httpStatus === 401 || lastCreateLog?.httpStatus === 201,
    `HTTP status phải là 401 (chưa đăng nhập) hoặc 201, nhận được: ${lastCreateLog?.httpStatus}`
  );

  console.log('  -> PASSED Ca 3: Endpoint và payload thực tế chuẩn xác 100%!\n');

  // -------------------------------------------------------------
  // Ca 4: Kiểm tra ca tạo thành công trên lớp demo csdl-k22-01 & bảo toàn sau F5
  // -------------------------------------------------------------
  console.log('Ca 4: Kiểm tra ca tạo thành công trên lớp demo csdl-k22-01...');
  const initialList = await getClassExamsPaged('csdl-k22-01', { page: 0, size: 10 });
  const initialCount = initialList.totalElements;

  const demoPayload: CreateExamInput = {
    courseId: 'course-cs-202',
    examType: 'MIDTERM',
    title: 'Thi giữa kỳ CSDL Demo ' + Date.now(),
    description: 'Đề thi giữa kỳ môn Cơ sở dữ liệu',
    durationMinutes: 60,
    totalScore: 10,
    startTime: '2026-11-25T07:30',
    endTime: '2026-11-25T09:30',
  };

  const createdExam = await createExam('csdl-k22-01', demoPayload);
  assert(createdExam.id !== undefined, 'Đề thi mới phải có ID');
  assert(createdExam.isPublished === false, 'Đề vừa tạo phải ở trạng thái Chưa công bố (isPublished = false)');
  console.log('  -> Đề thi mới tạo ID:', createdExam.id);
  console.log('  -> Trạng thái công bố:', createdExam.isPublished ? 'Đã công bố' : 'Chưa công bố');

  // Lấy danh sách sau khi tạo
  const listAfterCreate = await getClassExamsPaged('csdl-k22-01', { page: 0, size: 10 });
  assert(
    listAfterCreate.totalElements === initialCount + 1,
    `Tổng số bài thi phải tăng lên 1 (từ ${initialCount} lên ${initialCount + 1})`
  );
  assert(
    listAfterCreate.items[0].id === createdExam.id,
    'Đề thi mới tạo phải xuất hiện ở đầu danh sách'
  );
  assert(
    listAfterCreate.items[0].isPublished === false,
    'Đề thi mới trong danh sách phải có isPublished = false (Chưa công bố)'
  );
  console.log('  -> Đã cập nhật danh sách bài thi: Có mặt đề mới ở vị trí đầu tiên');

  // Giả lập F5 (tải lại danh sách từ storage)
  const listAfterF5 = await getClassExamsPaged('csdl-k22-01', { page: 0, size: 10 });
  assert(
    listAfterF5.totalElements === initialCount + 1,
    'Sau F5, tổng số bài thi vẫn được bảo toàn'
  );
  assert(
    listAfterF5.items[0].id === createdExam.id,
    'Sau F5, bài thi vừa tạo vẫn tồn tại ở đầu danh sách'
  );
  assert(
    listAfterF5.items[0].isPublished === false,
    'Sau F5, bài thi vẫn giữ trạng thái Chưa công bố'
  );
  console.log('  -> Kết quả sau F5: Bài thi bảo toàn 100% trong kho demo storage!\n');

  // -------------------------------------------------------------
  // Ca 5: Kiểm tra cấu trúc form component Stitch & Tích hợp Routing
  // -------------------------------------------------------------
  console.log('Ca 5: Kiểm tra cấu trúc component TeacherCreateExamFormView & Routing...');
  const formPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherCreateExamFormView.tsx'
  );
  const formContent = fs.readFileSync(formPath, 'utf8');

  // Kiểm tra 8 trường dữ liệu trong template
  assert(formContent.includes('id="examCourse"'), 'Phải có trường Môn học id="examCourse"');
  assert(formContent.includes('id="examType"'), 'Phải có trường Loại bài thi id="examType"');
  assert(formContent.includes('id="examName"'), 'Phải có trường Tên bài thi id="examName"');
  assert(formContent.includes('id="examDescription"'), 'Phải có trường Mô tả id="examDescription"');
  assert(formContent.includes('id="examDuration"'), 'Phải có trường Thời lượng id="examDuration"');
  assert(formContent.includes('id="examMaxScore"'), 'Phải có trường Tổng điểm id="examMaxScore"');
  assert(formContent.includes('id="examStartTime"'), 'Phải có trường Ngày giờ mở id="examStartTime"');
  assert(formContent.includes('id="examEndTime"'), 'Phải có trường Ngày giờ đóng id="examEndTime"');

  // Kiểm tra các thành phần đặc trưng theo Stitch
  assert(formContent.includes('border-2 border-slate-200/80 dark:border-slate-800'), 'Card form phải có border-2');
  assert(formContent.includes('id="charCounter"'), 'Phải có counter 0/255 cho tên bài thi');
  assert(formContent.includes('id="btnSubmitExam"'), 'Phải có nút Tạo bài thi id="btnSubmitExam"');
  assert(formContent.includes('id="btnCancelForm"'), 'Phải có nút Hủy id="btnCancelForm"');
  assert(formContent.includes('id="successAlert"'), 'Phải có successAlert banner');
  assert(formContent.includes('Chưa công bố'), 'Phải có thông báo trạng thái Chưa công bố');

  // Kiểm tra tích hợp trong ClassDetailPageView.tsx
  const detailPath = path.resolve(
    process.cwd(),
    'src/features/classes/components/detail/ClassDetailPageView.tsx'
  );
  const detailContent = fs.readFileSync(detailPath, 'utf8');
  assert(
    detailContent.includes("action') === 'create-exam'"),
    'ClassDetailPageView phải xử lý action create-exam'
  );
  assert(
    detailContent.includes('<TeacherCreateExamFormView'),
    'ClassDetailPageView phải render TeacherCreateExamFormView khi action=create-exam'
  );
  assert(
    detailContent.includes('subtab=exams'),
    'Điều hướng hủy và thành công phải dẫn về subtab=exams'
  );

  console.log('  -> PASSED Ca 5: Giao diện form và tích hợp điều hướng chuẩn frame Stitch!\n');

  console.log('================================================================');
  console.log('ALL TESTS PASSED: TEACHER CREATE EXAM VIEW VERIFIED 100%!');
  console.log('================================================================');
}

runTeacherCreateExamTests();
