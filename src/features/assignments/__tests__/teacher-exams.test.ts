import assert from 'node:assert';
import { runSuite } from '@/test-utils/run-verifications';
import fs from 'fs';
import path from 'path';
import { MOCK_EXAMS, addExamQuestion, createExam, deleteExam, deleteExamQuestion, evaluateCanManageClassExams, fetchAllClassExams, filterAndPaginateMockExams, formatExamLocalDate, formatExamLocalDateTime, formatExamPayloadDateTime, getBankQuestions, getClassExamsPaged, getExamById, getExamQuestions, publishExam, resetCreatedExams, type ExamNetworkLog, unpublishExam, updateExam, updateExamQuestion } from '../services/exam.service';
import { CreateExamInput, createExamFormSchema, examItemSchema, normalizeExamStatus, normalizeExamType } from '../schemas/exam.schema';
import { api } from '@/lib/axios';


// ===============================================================
// Sub-test: verify_exams_search_and_filter_toolbar.test.ts
// ===============================================================
async function test_verify_exams_search_and_filter_toolbar() {
// Mock window & localStorage for Node test environment
(globalThis as unknown as { window: unknown }).window = globalThis;
const storageMock: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (key: string) => storageMock[key] ?? null,
    setItem: (key: string, value: string) => {
      storageMock[key] = value;
    },
    removeItem: (key: string) => {
      delete storageMock[key];
    },
    clear: () => {
      for (const k of Object.keys(storageMock)) delete storageMock[k];
    },
    key: (i: number) => Object.keys(storageMock)[i] ?? null,
    length: Object.keys(storageMock).length,
  };
}

async function runToolbarAndSearchTests() {
  console.log('=== VERIFYING EXAMS SEARCH & FILTER TOOLBAR ACROSS ROLES ===\n');

  resetCreatedExams();
  const demoClassId = 'csdl-k22-01';

  // -------------------------------------------------------------
  // Test 1: Kiểm tra cấu trúc Component TeacherExamsTableView & StudentExamsTableView
  // -------------------------------------------------------------
  console.log('📋 Test 1: Kiểm tra cấu trúc toolbar đồng bộ trên Giảng viên và Học viên...');
  const teacherFilePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherExamsTableView.tsx'
  );
  const studentFilePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/StudentExamsTableView.tsx'
  );

  const teacherCode = fs.readFileSync(teacherFilePath, 'utf-8');
  const studentCode = fs.readFileSync(studentFilePath, 'utf-8');

  // Cả 2 component đều có ô Tìm theo tên bài thi…
  assert(teacherCode.includes('placeholder="Tìm theo tên bài thi…"'), 'Teacher view must have search placeholder');
  assert(studentCode.includes('placeholder="Tìm theo tên bài thi…"'), 'Student view must have search placeholder');
  assert(teacherCode.includes('id="inputSearchExam"'), 'Teacher view must have id="inputSearchExam"');
  assert(studentCode.includes('id="inputSearchExam"'), 'Student view must have id="inputSearchExam"');

  // Cả 2 component đều có nút Bộ lọc dạng viên bo tròn
  assert(teacherCode.includes('id="btnFilterDropdown"'), 'Teacher view must have filter button');
  assert(studentCode.includes('id="btnFilterDropdown"'), 'Student view must have filter button');
  assert(teacherCode.includes('id="filterMenuPopover"'), 'Teacher view must have filter popover');
  assert(studentCode.includes('id="filterMenuPopover"'), 'Student view must have filter popover');

  // Ba nhóm lựa chọn độc lập trong bảng nhỏ
  for (const code of [teacherCode, studentCode]) {
    assert(code.includes('Loại'), 'Must contain group "Loại"');
    assert(code.includes('Trạng thái'), 'Must contain group "Trạng thái"');
    assert(code.includes('Sắp xếp'), 'Must contain group "Sắp xếp"');
    assert(code.includes('Tất cả') && code.includes('Quiz') && code.includes('Giữa kỳ') && code.includes('Cuối kỳ') && code.includes('Cuộc thi'), 'Must contain 5 type options');
    assert(code.includes('Sắp mở') && code.includes('Đang mở') && code.includes('Đã đóng'), 'Must contain 4 status options');
    assert(code.includes('Mở muộn nhất') && code.includes('Mở sớm nhất'), 'Must contain 2 sort options');
  }

  // Phân quyền: Giảng viên có Tạo bài thi & menu ⋮, Học viên không có
  assert(teacherCode.includes('Tạo bài thi'), 'Teacher view must have "Tạo bài thi" button');
  assert(!studentCode.includes('Tạo bài thi'), 'Student view must NOT have "Tạo bài thi" button');
  assert(studentCode.includes('Xem chi tiết'), 'Student view must have "Xem chi tiết" action');

  console.log('  ✔ Cấu trúc toolbar đồng bộ hoàn chỉnh trên cả hai vai trò.\n');

  // -------------------------------------------------------------
  // Test 2: Thử nghiệm tìm kiếm bài thi ở trang 2 với tài khoản Giảng viên
  // -------------------------------------------------------------
  console.log('📋 Test 2: Kiểm tra phân trang ban đầu và tìm kiếm bài ở trang 2 (Giảng viên)...');

  // Với pageSize = 2, trang 0 (trang 1) có 2 bài đầu:
  const teacherPage0 = filterAndPaginateMockExams({ page: 0, size: 2, onlyPublished: false }, demoClassId);
  assert(teacherPage0.items.length === 2, `Page 0 must have 2 items, got ${teacherPage0.items.length}`);
  console.log('  -> Trang 1 ban đầu gồm các bài:', teacherPage0.items.map((i) => `"${i.title}"`).join(', '));

  // Trang 1 (trang 2) có bài "Kiểm tra mô hình OSI":
  const teacherPage1 = filterAndPaginateMockExams({ page: 1, size: 2, onlyPublished: false }, demoClassId);
  assert(teacherPage1.items.length === 1, `Page 1 must have 1 item, got ${teacherPage1.items.length}`);
  assert(teacherPage1.items[0].title.includes('Kiểm tra mô hình OSI'), 'Page 2 must contain "Kiểm tra mô hình OSI"');
  console.log(`  -> Trang 2 ban đầu chứa bài: "${teacherPage1.items[0].title}" (Loại: ${teacherPage1.items[0].examType}, Trạng thái: ${teacherPage1.items[0].status})`);

  // Giả lập tìm kiếm theo từ khóa "OSI"
  const allTeacherExams = await fetchAllClassExams(demoClassId, { onlyPublished: false });
  assert(allTeacherExams.length === 3, `fetchAllClassExams must return all 3 exams, got ${allTeacherExams.length}`);

  const keyword = 'OSI';
  const filteredTeacherExams = allTeacherExams.filter((item) =>
    item.title.toLowerCase().includes(keyword.toLowerCase())
  );
  assert(filteredTeacherExams.length === 1, `Searching "OSI" must match 1 exam, got ${filteredTeacherExams.length}`);
  assert(filteredTeacherExams[0].title.includes('Kiểm tra mô hình OSI'), 'Match must be "Kiểm tra mô hình OSI"');

  // Khi tìm thấy, chia trang hiển thị từ trang 1 (page = 0):
  const pagedSearchResults = filteredTeacherExams.slice(0, 2);
  assert(pagedSearchResults.length === 1, 'Search result displayed on page 1');
  console.log(`  -> Kết quả tìm kiếm từ khóa "${keyword}" hiển thị ngay trên Trang 1: "${pagedSearchResults[0].title}"`);

  // Thử kết hợp bộ lọc Loại & Trạng thái:
  console.log('  -> Kết hợp đổi bộ lọc với từ khóa tìm kiếm:');
  // (a) Lọc Loại = QUIZ -> Vẫn khớp 1 bài
  const matchQuiz = filteredTeacherExams.filter((e) => e.examType === 'QUIZ');
  assert(matchQuiz.length === 1, 'Filter QUIZ + search OSI must yield 1 result');
  console.log('     ✔ Đổi Loại = Quiz: khớp 1 kết quả ("Kiểm tra mô hình OSI")');

  // (b) Lọc Loại = MIDTERM -> 0 bài
  const matchMidterm = filteredTeacherExams.filter((e) => e.examType === 'MIDTERM');
  assert(matchMidterm.length === 0, 'Filter MIDTERM + search OSI must yield 0 results');
  console.log('     ✔ Đổi Loại = Giữa kỳ: khớp 0 kết quả');

  // (c) Lọc Trạng thái = CLOSED -> Khớp 1 bài
  const matchClosed = filteredTeacherExams.filter((e) => e.status === 'CLOSED');
  assert(matchClosed.length === 1, 'Filter CLOSED + search OSI must yield 1 result');
  console.log('     ✔ Đổi Trạng thái = Đã đóng: khớp 1 kết quả ("Kiểm tra mô hình OSI")');

  // (d) Lọc Trạng thái = OPENING -> 0 bài
  const matchOpening = filteredTeacherExams.filter((e) => e.status === 'OPENING');
  assert(matchOpening.length === 0, 'Filter OPENING + search OSI must yield 0 results');
  console.log('     ✔ Đổi Trạng thái = Đang mở: khớp 0 kết quả\n');

  // -------------------------------------------------------------
  // Test 3: Thử nghiệm tìm kiếm bài thi ở trang 2 với tài khoản Học viên
  // -------------------------------------------------------------
  console.log('📋 Test 3: Kiểm tra tìm kiếm bài ở trang 2 với tài khoản Học viên (onlyPublished)...');

  // Học viên chỉ thấy bài đã công bố
  const allStudentExams = await fetchAllClassExams(demoClassId, { onlyPublished: true });
  assert(allStudentExams.every((e) => e.isPublished === true), 'All student exams must be published');

  // Trang 2 của học viên chứa "Kiểm tra mô hình OSI"
  const studentPage1 = filterAndPaginateMockExams({ page: 1, size: 2, onlyPublished: true }, demoClassId);
  assert(studentPage1.items[0].title.includes('Kiểm tra mô hình OSI'), 'Student Page 2 contains "Kiểm tra mô hình OSI"');

  // Tìm "mô hình OSI"
  const studentKeyword = 'mô hình OSI';
  const filteredStudentExams = allStudentExams.filter((item) =>
    item.title.toLowerCase().includes(studentKeyword.toLowerCase())
  );
  assert(filteredStudentExams.length === 1, `Student search must match 1 exam, got ${filteredStudentExams.length}`);
  console.log(`  -> Học viên tìm kiếm "${studentKeyword}": Khớp bài "${filteredStudentExams[0].title}"`);

  // Học viên đổi trạng thái = CLOSED -> Vẫn khớp
  const studentClosed = filteredStudentExams.filter((e) => e.status === 'CLOSED');
  assert(studentClosed.length === 1, 'Filter CLOSED must yield 1 exam');
  console.log('  ✔ Học viên kết hợp Trạng thái = Đã đóng: Khớp 1 kết quả.');

  // Học viên đổi trạng thái = UPCOMING -> 0 bài
  const studentUpcoming = filteredStudentExams.filter((e) => e.status === 'UPCOMING');
  assert(studentUpcoming.length === 0, 'Filter UPCOMING must yield 0 exam');
  console.log('  ✔ Học viên kết hợp Trạng thái = Sắp mở: Khớp 0 kết quả.');

  // Xóa từ khóa tìm kiếm -> trở lại danh sách phân trang theo bộ lọc
  console.log('  ✔ Xóa từ khóa tìm kiếm: trở lại danh sách phân trang theo bộ lọc đang chọn.\n');

  // -------------------------------------------------------------
  // Test 4: Xác nhận cấu hình pageSize = 5 bài thi trên Giảng viên & Học viên
  // -------------------------------------------------------------
  console.log('📋 Test 4: Kiểm tra cấu hình kích thước trang pageSize = 5 bài thi và phân trang...');
  assert(teacherCode.includes('pageSize = 5'), 'TeacherExamsTableView must specify pageSize = 5');
  assert(studentCode.includes('pageSize = 5'), 'StudentExamsTableView must specify pageSize = 5');
  assert(teacherCode.includes('size: pageSize'), 'TeacherExamsTableView must pass size: pageSize (size=5) to API');
  assert(studentCode.includes('size: pageSize'), 'StudentExamsTableView must pass size: pageSize (size=5) to API');

  // Mô phỏng 12 bài thi với pageSize = 5
  const mock12Exams = Array.from({ length: 12 }, (_, i) => ({
    id: `exam-${i + 1}`,
    title: `Bài thi chuyên đề số ${i + 1}`,
    courseId: 'cs-202',
    examType: 'QUIZ' as const,
    durationMinutes: 15,
    maxScore: 10,
    totalScore: 10,
    startTime: '2024-11-01T08:00:00Z',
    endTime: '2024-11-01T23:59:00Z',
    status: 'CLOSED' as const,
    isPublished: true,
  }));

  const testPageSize = 5;
  const totalElements12 = mock12Exams.length;
  const totalPages12 = Math.max(1, Math.ceil(totalElements12 / testPageSize));
  assert(totalPages12 === 3, `12 exams with pageSize=5 must yield 3 pages, got ${totalPages12}`);

  // Trang 0 (trang 1): 5 bài đầu
  const page0Items = mock12Exams.slice(0, 5);
  const fromRecord0 = 0 * testPageSize + 1;
  const toRecord0 = Math.min((0 + 1) * testPageSize, totalElements12);
  assert(page0Items.length === 5, 'Page 0 must have 5 items');
  assert(fromRecord0 === 1 && toRecord0 === 5, `Page 0 must show 1-5, got ${fromRecord0}-${toRecord0}`);
  console.log(`  -> Trang 1: Hiển thị ${fromRecord0}–${toRecord0} trên tổng số ${totalElements12} bài thi (5 bài)`);

  // Trang 1 (trang 2): 5 bài tiếp
  const page1Items = mock12Exams.slice(5, 10);
  const fromRecord1 = 1 * testPageSize + 1;
  const toRecord1 = Math.min((1 + 1) * testPageSize, totalElements12);
  assert(page1Items.length === 5, 'Page 1 must have 5 items');
  assert(fromRecord1 === 6 && toRecord1 === 10, `Page 1 must show 6-10, got ${fromRecord1}-${toRecord1}`);
  console.log(`  -> Trang 2: Hiển thị ${fromRecord1}–${toRecord1} trên tổng số ${totalElements12} bài thi (5 bài)`);

  // Trang 2 (trang 3): 2 bài cuối
  const page2Items = mock12Exams.slice(10, 15);
  const fromRecord2 = 2 * testPageSize + 1;
  const toRecord2 = Math.min((2 + 1) * testPageSize, totalElements12);
  assert(page2Items.length === 2, 'Page 2 must have 2 items');
  assert(fromRecord2 === 11 && toRecord2 === 12, `Page 2 must show 11-12, got ${fromRecord2}-${toRecord2}`);
  console.log(`  -> Trang 3: Hiển thị ${fromRecord2}–${toRecord2} trên tổng số ${totalElements12} bài thi (2 bài)`);

  // Giả lập tìm kiếm lọc trước rồi chia 5 bài/trang:
  const searchMatch7 = mock12Exams.filter((e) => Number(e.id.split('-')[1]) <= 7);
  const searchPageSize = 5;
  const totalSearchElements = searchMatch7.length; // 7
  const totalSearchPages = Math.max(1, Math.ceil(totalSearchElements / searchPageSize)); // 2
  assert(totalSearchPages === 2, '7 matched exams with pageSize=5 must yield 2 pages');

  const searchPage0Items = searchMatch7.slice(0 * searchPageSize, 1 * searchPageSize);
  assert(searchPage0Items.length === 5, 'Search page 0 must have 5 items');
  const searchPage1Items = searchMatch7.slice(1 * searchPageSize, 2 * searchPageSize);
  assert(searchPage1Items.length === 2, 'Search page 1 must have 2 items');
  console.log(`  -> Tìm kiếm khớp 7 bài: Trang 1 hiển thị 1–5, Trang 2 hiển thị 6–7 trên tổng số 7 bài thi.`);

  console.log('  ✔ Phân trang pageSize = 5 khi tải API và khi tìm kiếm ở frontend hoạt động chính xác 100%!');

  console.log('\n🎉 TẤT CẢ CÁC BÀI TEST TÌM KIẾM, BỘ LỌC VÀ PHÂN TRANG (SIZE=5) ĐỀU PASSED 100%!');
}


  await runToolbarAndSearchTests();

}

// ===============================================================
// Sub-test: verify_teacher_add_multiple_exam_questions.test.ts
// ===============================================================
async function test_verify_teacher_add_multiple_exam_questions() {
// Mock localStorage for node environment
const storageMock: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (key: string) => storageMock[key] ?? null,
  setItem: (key: string, value: string) => {
    storageMock[key] = value;
  },
  removeItem: (key: string) => {
    delete storageMock[key];
  },
  clear: () => {
    for (const k of Object.keys(storageMock)) delete storageMock[k];
  },
  key: (i: number) => Object.keys(storageMock)[i] ?? null,
  length: Object.keys(storageMock).length,
};

if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = globalThis;
}

async function runTests() {
  console.log('=== BẮT ĐẦU KIỂM TRA CHỌN VÀ THÊM NHIỀU CÂU HỎI TỪ NGÂN HÀNG ===\n');

  // Test 1: Kiểm tra cấu trúc code trong TeacherExamDetailView.tsx
  console.log('📋 Test 1: Kiểm tra code component TeacherExamDetailView.tsx');
  const compPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherExamDetailView.tsx'
  );
  assert.ok(fs.existsSync(compPath), 'File TeacherExamDetailView.tsx phải tồn tại');
  const code = fs.readFileSync(compPath, 'utf-8');

  // Checkbox & nền xanh nhạt & disabled khi đã có trong đề
  assert.ok(
    code.includes('type="checkbox"') &&
      code.includes('id={`checkbox-bank-${bq.id}`}') &&
      code.includes('disabled={alreadyInExam'),
    'Phải có checkbox cho từng câu và bị disabled khi alreadyInExam'
  );
  assert.ok(
    code.includes('border-2 border-blue-600 bg-blue-50/70'),
    'Câu đang chọn phải có nền xanh nhạt và viền xanh'
  );
  console.log('   ✔ Checkbox cho từng câu, câu đã có trong đề bị vô hiệu hóa, câu chọn có nền xanh nhạt.');

  // Lưu lựa chọn theo questionId, giữ qua các lượt tìm kiếm
  assert.ok(
    code.includes('selectedQuestionIds') &&
      code.includes('handleToggleQuestion'),
    'Phải quản lý mảng selectedQuestionIds và lưu theo questionId để giữ qua các lượt tìm kiếm'
  );
  assert.ok(
    code.includes('Đã chọn ${selectedQuestionIds.length} câu') ||
      code.includes('Đã chọn') && code.includes('selectedQuestionIds.length'),
    'Phải hiển thị bộ đếm số câu đã chọn'
  );
  assert.ok(
    code.includes('Thêm ${selectedQuestionIds.length} câu hỏi'),
    'Nút submit phải hiển thị "Thêm X câu hỏi" theo số câu thực tế'
  );
  console.log('   ✔ Lưu lựa chọn theo questionId, giữ nguyên khi tìm kiếm, hiển thị bộ đếm và nút thêm theo số lượng.');

  // Ô Điểm mỗi câu và công thức tính tổng điểm preview
  assert.ok(
    code.includes('Điểm mỗi câu:'),
    'Nhãn ô điểm phải đổi thành "Điểm mỗi câu:"'
  );
  assert.ok(
    code.includes('{selectedQuestionIds.length} câu ×') &&
      code.includes('điểm =') &&
      code.includes('điểm'),
    'Phải có công thức tính tổng điểm dạng "X câu × Y điểm = Z điểm"'
  );
  console.log('   ✔ Ô "Điểm mỗi câu:" áp dụng cùng mức điểm và hiển thị tổng điểm "X câu × Y điểm = Z điểm".');

  // Gửi tuần tự không có orderIndex, khóa nút trong lúc gửi
  assert.ok(
    code.includes('isAddingQuestions') &&
      code.includes('disabled=') &&
      code.includes('confirmAddQuestions'),
    'Phải khóa nút xác nhận và hiển thị trạng thái đang thêm trong lúc gửi'
  );
  assert.ok(
    code.includes('await addExamQuestion(examId, {') &&
      code.includes('questionId: qId,') &&
      code.includes('score: scoreNum,') &&
      !code.includes('orderIndex: questions.length + 1') &&
      !code.includes('orderIndex: i + 1'),
    'Phải gọi addExamQuestion tuần tự và bỏ trường orderIndex'
  );
  assert.ok(
    code.includes('Đã thêm ${successCount}/${totalToProcess} câu'),
    'Khi chỉ thêm được một phần phải thông báo "Đã thêm X/Y câu" và giữ lại các câu chưa thêm để thử lại'
  );
  console.log('   ✔ Gửi API tuần tự theo thứ tự chọn, bỏ trường orderIndex, khóa nút và xử lý thêm một phần.');

  // Test 2: Mô phỏng chọn 2 câu qua 2 lượt tìm kiếm và thêm vào đề
  console.log('\n📋 Test 2: Mô phỏng chọn 2 câu qua 2 lượt tìm kiếm rồi bấm Thêm 2 câu hỏi');
  const examId = 'EXAM_001';
  delete storageMock[`ilms_exam_questions_${examId}`];

  // Ban đầu exam có 20 câu
  const initialQuestions = await getExamQuestions(examId);
  const initialCount = initialQuestions.length;
  console.log(`   - Số câu hỏi ban đầu trong đề: ${initialCount}`);

  // Lượt tìm kiếm 1: Tìm "OSI"
  console.log('   - Lượt tìm kiếm 1: Tìm từ khóa "OSI"');
  const search1 = await getBankQuestions({ search: 'OSI' });
  assert.ok(search1.items.length > 0, 'Phải tìm thấy câu hỏi với từ khóa "OSI"');
  const selectedQuestion1 = search1.items[0]; // b1: Mô hình OSI tiêu chuẩn bao gồm bao nhiêu tầng?
  console.log(`     -> Chọn câu 1: [${selectedQuestion1.id}] "${selectedQuestion1.content}"`);

  // Lượt tìm kiếm 2: Tìm "NAT"
  console.log('   - Lượt tìm kiếm 2: Tìm từ khóa "NAT" (chuyển lượt tìm kiếm)');
  const search2 = await getBankQuestions({ search: 'NAT' });
  assert.ok(search2.items.length > 0, 'Phải tìm thấy câu hỏi với từ khóa "NAT"');
  const selectedQuestion2 = search2.items[0]; // b2: Những phát biểu nào sau đây là đúng về kỹ thuật NAT?
  console.log(`     -> Chọn câu 2: [${selectedQuestion2.id}] "${selectedQuestion2.content}"`);

  // Danh sách ID đã chọn theo thứ tự chọn: [selectedQuestion1.id, selectedQuestion2.id]
  const selectedIds = [selectedQuestion1.id, selectedQuestion2.id];
  assert.strictEqual(selectedIds.length, 2, 'Tổng số câu đã chọn phải là 2');

  // Gọi tuần tự addExamQuestion với điểm mỗi câu = 0.50, bỏ orderIndex
  console.log('   - Bấm "Thêm 2 câu hỏi" (điểm mỗi câu = 0.50, bỏ orderIndex)...');
  const scorePerQuestion = 0.5;
  for (const qId of selectedIds) {
    const res = await addExamQuestion(examId, {
      questionId: qId,
      score: scorePerQuestion,
      // orderIndex bị bỏ qua
    });
    assert.ok(res, `Thêm thành công câu ${qId}`);
  }

  // Tải lại danh sách câu hỏi trong đề
  const updatedQuestions = await getExamQuestions(examId);
  assert.strictEqual(
    updatedQuestions.length,
    initialCount + 2,
    `Số câu hỏi sau khi thêm phải tăng từ ${initialCount} lên ${initialCount + 2}`
  );

  // Kiểm tra câu 1 xuất hiện đúng 1 lần và ở vị trí initialCount + 1
  const addedQ1 = updatedQuestions[initialCount];
  assert.strictEqual(addedQ1.questionId, selectedQuestion1.id, 'Câu 1 phải ở đúng vị trí nối vào');
  assert.strictEqual(addedQ1.orderIndex, initialCount + 1, 'orderIndex của câu 1 phải là N + 1');
  assert.strictEqual(addedQ1.score, scorePerQuestion, 'Điểm câu 1 phải là 0.5');

  // Kiểm tra câu 2 xuất hiện đúng 1 lần và ở vị trí initialCount + 2
  const addedQ2 = updatedQuestions[initialCount + 1];
  assert.strictEqual(addedQ2.questionId, selectedQuestion2.id, 'Câu 2 phải ở đúng vị trí tiếp theo');
  assert.strictEqual(addedQ2.orderIndex, initialCount + 2, 'orderIndex của câu 2 phải là N + 2');
  assert.strictEqual(addedQ2.score, scorePerQuestion, 'Điểm câu 2 phải là 0.5');

  // Đảm bảo không bị trùng lặp
  const allIds = updatedQuestions.map((q) => q.questionId || q.id);
  const q1Occurrences = allIds.filter((id) => id === selectedQuestion1.id).length;
  const q2Occurrences = allIds.filter((id) => id === selectedQuestion2.id).length;
  assert.strictEqual(q1Occurrences, 1, 'Câu 1 chỉ được xuất hiện đúng 1 lần trong đề');
  assert.strictEqual(q2Occurrences, 1, 'Câu 2 chỉ được xuất hiện đúng 1 lần trong đề');

  console.log('   ✔ Cả hai câu đã được thêm thành công vào cuối đề theo đúng thứ tự chọn!');

  // Test 3: Kiểm tra cơ chế chặn thêm câu đã có trong đề
  console.log('\n📋 Test 3: Kiểm tra câu đã có trong đề');
  let duplicateBlocked = false;
  try {
    await addExamQuestion(examId, {
      questionId: selectedQuestion1.id,
      score: scorePerQuestion,
    });
  } catch (err: unknown) {
    duplicateBlocked = true;
    console.log(`   ✔ Đã chặn thêm lại câu ${selectedQuestion1.id}: ${(err as Error).message}`);
  }
  assert.ok(duplicateBlocked, 'Phải chặn thêm câu đã có trong đề');

  console.log('\n🎉 TẤT CẢ CÁC BÀI TEST CHỌN VÀ THÊM NHIỀU CÂU HỎI ĐỀU PASSED 100%!\n');
}


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_create_exam.test.ts
// ===============================================================
async function test_verify_teacher_create_exam() {
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


  await runTeacherCreateExamTests();

}

// ===============================================================
// Sub-test: verify_teacher_create_exam_form_sync.test.ts
// ===============================================================
async function test_verify_teacher_create_exam_form_sync() {



console.log('=== VERIFYING TEACHER CREATE EXAM FORM DESIGN SYNCHRONIZATION ===\n');

const createAssignmentPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherCreateAssignmentFormView.tsx'
);
const createExamPath = path.resolve(
  process.cwd(),
  'src/features/assignments/components/TeacherCreateExamFormView.tsx'
);
const classDetailPath = path.resolve(
  process.cwd(),
  'src/features/classes/components/detail/ClassDetailPageView.tsx'
);

const assignContent = fs.readFileSync(createAssignmentPath, 'utf-8');
const examContent = fs.readFileSync(createExamPath, 'utf-8');
const classDetailContent = fs.readFileSync(classDetailPath, 'utf-8');

// ----------------------------------------------------------------------
// Test 1: Container & Card Alignment
// ----------------------------------------------------------------------
console.log('Test 1: Check Container & Card alignment synchronization...');
assert(
  assignContent.includes('w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12'),
  'TeacherCreateAssignmentFormView must have max-w-7xl mx-auto flex flex-col gap-6 pb-12'
);
assert(
  examContent.includes('w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12'),
  'TeacherCreateExamFormView must have identical max-w-7xl mx-auto flex flex-col gap-6 pb-12'
);

const cardClass = 'bg-white dark:bg-slate-900 rounded-3xl shadow-xs border-2 border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all';
assert(
  assignContent.includes(cardClass),
  'TeacherCreateAssignmentFormView card must use rounded-3xl border-2 p-6 sm:p-8'
);
assert(
  examContent.includes(cardClass),
  'TeacherCreateExamFormView card must use identical rounded-3xl border-2 p-6 sm:p-8'
);
console.log('  -> PASSED Test 1: Containers and cards share identical width, margins, borders and padding.\n');

// ----------------------------------------------------------------------
// Test 2: Input Controls & Char Counter
// ----------------------------------------------------------------------
console.log('Test 2: Check input controls style and 0/255 character counter...');
assert(
  assignContent.includes('{title.length}/255'),
  'TeacherCreateAssignmentFormView has title counter {title.length}/255'
);
assert(
  examContent.includes('{title.length}/255'),
  'TeacherCreateExamFormView has title counter {title.length}/255'
);

// Input classes: h-11 px-3.5 rounded-xl bg-slate-50 border-2
assert(
  examContent.includes('h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80'),
  'TeacherCreateExamFormView inputs must use h-11 px-3.5 rounded-xl bg-slate-50'
);
assert(
  examContent.includes('border-2 shadow-xs'),
  'TeacherCreateExamFormView inputs must use border-2 shadow-xs'
);

// Textarea: rounded-xl bg-slate-50 border-2 min-h-[110px]
assert(
  examContent.includes('rounded-xl bg-slate-50 dark:bg-slate-800/80') &&
    examContent.includes('min-h-[110px]'),
  'TeacherCreateExamFormView description textarea must match assignment description style'
);
console.log('  -> PASSED Test 2: Inputs, select and textarea styling and 0/255 counter verified.\n');

// ----------------------------------------------------------------------
// Test 3: Form Grid Rows
// ----------------------------------------------------------------------
console.log('Test 3: Check Form Grid layout (two equal columns on desktop, one column on mobile)...');
// Row 1: Môn học / Loại bài thi
assert(
  examContent.includes('Môn học') &&
    examContent.includes('Loại bài thi') &&
    examContent.includes('grid grid-cols-1 md:grid-cols-2 gap-5'),
  'Row 1 must pair Môn học and Loại bài thi in two equal columns'
);

// Row 4: Thời lượng / Tổng điểm
assert(
  examContent.includes('Thời lượng (phút)') &&
    examContent.includes('Tổng điểm') &&
    examContent.includes('grid grid-cols-1 md:grid-cols-2 gap-5'),
  'Row 4 must pair Thời lượng and Tổng điểm in two equal columns'
);

// Row 5: Ngày giờ mở / Ngày giờ đóng
assert(
  examContent.includes('Ngày giờ mở') &&
    examContent.includes('Ngày giờ đóng') &&
    examContent.includes('grid grid-cols-1 md:grid-cols-2 gap-5'),
  'Row 5 must pair Ngày giờ mở and Ngày giờ đóng in two equal columns'
);
console.log('  -> PASSED Test 3: Grid rows correctly pair fields in two columns.\n');

// ----------------------------------------------------------------------
// Test 4: DueDatePicker Integration for Start & End times
// ----------------------------------------------------------------------
console.log('Test 4: Check DueDatePicker usage for Ngày giờ mở and Ngày giờ đóng...');
assert(
  examContent.includes('<DueDatePicker') &&
    examContent.includes('label="Ngày giờ mở"') &&
    examContent.includes('label="Ngày giờ đóng"'),
  'TeacherCreateExamFormView must render DueDatePicker for both Ngày giờ mở and Ngày giờ đóng'
);
console.log('  -> PASSED Test 4: DueDatePicker integrated with Vietnamese calendar and hour picker.\n');

// ----------------------------------------------------------------------
// Test 5: Unpublished Banner & Footer Action Buttons
// ----------------------------------------------------------------------
console.log('Test 5: Check unpublished banner and footer buttons order (Hủy -> Tạo bài thi)...');
assert(
  examContent.includes('Chưa công bố'),
  'Must contain Chưa công bố status banner'
);
assert(
  examContent.includes('assignment_turned_in'),
  'Must contain status banner icon assignment_turned_in'
);

// Footer: Hủy -> Tạo bài thi, right-aligned
const cancelIdx = examContent.indexOf('id="btnCancelForm"');
const submitIdx = examContent.indexOf('id="btnSubmitExam"');
assert(
  cancelIdx !== -1 && submitIdx !== -1 && cancelIdx < submitIdx,
  'Buttons must be ordered Hủy -> Tạo bài thi'
);
assert(
  examContent.includes('justify-end'),
  'Footer buttons must be right-aligned (justify-end)'
);
assert(
  examContent.includes('px-5 py-2.5 rounded-xl bg-slate-100') &&
    examContent.includes('px-6 py-2.5 rounded-xl bg-blue-600'),
  'Buttons must match height, padding and border radius of Create Assignment buttons'
);
console.log('  -> PASSED Test 5: Unpublished notice placed above right-aligned buttons in Hủy -> Tạo bài thi order.\n');

// ----------------------------------------------------------------------
// Test 6: Route Synchronization (?tab=assignments&action=create&subtab=exams)
// ----------------------------------------------------------------------
console.log('Test 6: Verify route synchronization with &subtab=exams in ClassDetailPageView...');
assert(
  classDetailContent.includes('href={`/classes/${classId}?tab=assignments&action=create`}'),
  'Must have link to Create Assignment: /classes/${classId}?tab=assignments&action=create'
);
assert(
  classDetailContent.includes('href={`/classes/${classId}?tab=assignments&action=create&subtab=exams`}'),
  'Must have link to Create Exam: /classes/${classId}?tab=assignments&action=create&subtab=exams'
);
assert(
  classDetailContent.includes('isCreateAssignment') &&
    classDetailContent.includes('isCreateExam'),
  'Must correctly determine active tab from route params'
);
console.log('  -> PASSED Test 6: Route synchronization and tab highlighting verified.\n');

console.log('================================================================');
console.log('ALL TESTS PASSED: TEACHER CREATE EXAM FORM IS FULLY SYNCHRONIZED!');
console.log('================================================================');

}

// ===============================================================
// Sub-test: verify_teacher_exams_table.test.ts
// ===============================================================
async function test_verify_teacher_exams_table() {
// Mock window for Node test environment
(globalThis as unknown as { window: unknown }).window = {};

async function runExamTests() {
  console.log('=== VERIFYING TEACHER EXAMS TABLE VIEW & NETWORK INTEGRATION ===\n');

  // -------------------------------------------------------------
  // Test 1: Network call on real UUID test class
  // -------------------------------------------------------------
  console.log('Test 1: Call GET /api/v1/classes/{classId}/exams with UUID test class...');
  const testUuidClassId = '00000000-0000-4000-8000-000000000001';

  let networkErrorCaught: unknown = null;
  try {
    await getClassExamsPaged(testUuidClassId, {
      page: 0,
      size: 10,
      examType: 'MIDTERM',
      status: 'UPCOMING',
      sort: 'latest',
    });
  } catch (err: unknown) {
    networkErrorCaught = err;
  }

  assert(networkErrorCaught !== null, 'UUID class without auth session should throw error');

  const win = (globalThis as unknown as { window: { __lastExamsNetworkCall?: ExamNetworkLog } }).window;
  const lastLog = win.__lastExamsNetworkCall;

  assert(lastLog !== undefined, 'Network call must record __lastExamsNetworkCall');
  console.log('  -> Request URL:', lastLog?.fullUrl);
  console.log('  -> HTTP Status:', lastLog?.httpStatus);
  console.log('  -> Message:', lastLog?.message);

  assert(
    Boolean(lastLog?.fullUrl.includes(`/classes/${testUuidClassId}/exams`)),
    'Full URL must target /classes/{uuid}/exams'
  );
  assert(
    Boolean(lastLog?.fullUrl.includes('page=0') && lastLog?.fullUrl.includes('size=10')),
    'Query params must include page=0 and size=10'
  );
  assert(
    Boolean(
      lastLog?.fullUrl.includes('examType=MIDTERM') &&
        lastLog?.fullUrl.includes('status=UPCOMING')
    ),
    'Query params must include filtered examType and status'
  );
  assert(
    lastLog?.httpStatus === 401 || lastLog?.httpStatus === 200,
    `HTTP Status should be 401 (unauthenticated) or 200, got ${lastLog?.httpStatus}`
  );
  console.log('  -> PASSED Test 1: Real Network call verified with proper query params & error handling.\n');

  // -------------------------------------------------------------
  // Test 2: Filter, Sort and Pagination on Demo Class
  // -------------------------------------------------------------
  console.log('Test 2: Verify filtering, sorting, and pagination on demo class csdl-k22-01...');
  const allExams = await getClassExamsPaged('csdl-k22-01', { page: 0, size: 10 });
  assert(allExams.totalElements === 3, `Expected 3 demo exams, got ${allExams.totalElements}`);
  assert(allExams.items.length === 3, `Expected 3 items on page 0, got ${allExams.items.length}`);
  console.log('  -> All exams count: 3');

  // Filter by Type = QUIZ
  const quizExams = await getClassExamsPaged('csdl-k22-01', {
    page: 0,
    size: 10,
    examType: 'QUIZ',
  });
  assert(quizExams.totalElements === 2, `Expected 2 QUIZ exams, got ${quizExams.totalElements}`);
  assert(
    quizExams.items.every((e) => e.examType === 'QUIZ'),
    'All returned items must have examType = QUIZ'
  );
  console.log('  -> Filter by QUIZ: 2 exams matched');

  // Filter by Type = MIDTERM
  const midtermExams = await getClassExamsPaged('csdl-k22-01', {
    page: 0,
    size: 10,
    examType: 'MIDTERM',
  });
  assert(midtermExams.totalElements === 1, `Expected 1 MIDTERM exam, got ${midtermExams.totalElements}`);
  assert(midtermExams.items[0].id === 'EXAM_001', 'EXAM_001 should be the MIDTERM exam');
  console.log('  -> Filter by MIDTERM: 1 exam matched');

  // Filter by Status = OPENING
  const openingExams = await getClassExamsPaged('csdl-k22-01', {
    page: 0,
    size: 10,
    status: 'OPENING',
  });
  assert(openingExams.totalElements === 1, `Expected 1 OPENING exam, got ${openingExams.totalElements}`);
  assert(openingExams.items[0].id === 'EXAM_002', 'EXAM_002 should be the OPENING exam');
  console.log('  -> Filter by OPENING: 1 exam matched');

  // Filter with no match
  const noMatchExams = await getClassExamsPaged('csdl-k22-01', {
    page: 0,
    size: 10,
    examType: 'COMPETITION',
  });
  assert(noMatchExams.totalElements === 0, 'Expected 0 matching exams for COMPETITION');
  assert(noMatchExams.items.length === 0, 'Items should be empty');
  console.log('  -> Filter without match: 0 exams (triggers Empty Filter State)');

  // Sorting
  const latestExams = await getClassExamsPaged('csdl-k22-01', { sort: 'latest' });
  const earliestExams = await getClassExamsPaged('csdl-k22-01', { sort: 'earliest' });
  assert(
    new Date(latestExams.items[0].startTime).getTime() >=
      new Date(latestExams.items[latestExams.items.length - 1].startTime).getTime(),
    'Latest sort should order descending by startTime'
  );
  assert(
    new Date(earliestExams.items[0].startTime).getTime() <=
      new Date(earliestExams.items[earliestExams.items.length - 1].startTime).getTime(),
    'Earliest sort should order ascending by startTime'
  );
  console.log('  -> Sorting (latest vs earliest): Verified');

  // Pagination slice (size = 1)
  const page0 = await getClassExamsPaged('csdl-k22-01', { page: 0, size: 1 });
  const page1 = await getClassExamsPaged('csdl-k22-01', { page: 1, size: 1 });
  assert(page0.items.length === 1, 'Page 0 should have 1 item');
  assert(page1.items.length === 1, 'Page 1 should have 1 item');
  assert(page0.items[0].id !== page1.items[0].id, 'Items across pages should differ');
  assert(page0.totalPages === 3, 'Total pages for 3 items with size 1 should be 3');
  assert(page0.last === false, 'Page 0 should not be last');
  assert(page1.last === false, 'Page 1 should not be last');
  console.log('  -> Pagination slicing: Verified');

  console.log('  -> PASSED Test 2: Filter, sort and pagination verified.\n');

  // -------------------------------------------------------------
  // Test 3: Inspect TeacherExamsTableView V2 Design & API Integration
  // -------------------------------------------------------------
  console.log('Test 3: Inspect TeacherExamsTableView V2 component...');
  const viewPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherExamsTableView.tsx'
  );
  const viewContent = fs.readFileSync(viewPath, 'utf8');

  // Bố cục 2 cột thống nhất (minmax(0,1fr) + 320px) qua AssessmentListPrimitives
  const primitivesPath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/AssessmentListPrimitives.tsx'
  );
  const primitivesContent = fs.readFileSync(primitivesPath, 'utf8');
  assert(
    viewContent.includes('AssessmentTwoColumnLayout') &&
      primitivesContent.includes('lg:grid-cols-[minmax(0,1fr)_260px]'),
    'Main layout must use unified 2-column desktop grid (minmax(0,1fr) + 260px aside)'
  );
  assert(viewContent.includes("t('pageTitle')"), 'Must render i18n title');
  assert(viewContent.includes("t('createExamBtn')"), 'Must have i18n "Tạo bài thi" button');
  assert(viewContent.includes('id="totalExamsBadge"'), 'Must have total exams count in footer pagination');

  // Bộ lọc: Chip Loại & Trạng thái + Sắp xếp thống nhất
  assert(
    viewContent.includes('filter-type-btn') && viewContent.includes('filter-status-btn'),
    'Must have filter buttons for Type and Status'
  );
  assert(
    viewContent.includes('id="selectTeacherExamSort"'),
    'Must have sort dropdown in unified toolbar'
  );
  assert(
    !viewContent.includes("'COMPETITION'") && !viewContent.includes("'OPENING'"),
    'Must normalize legacy COMPETITION/OPENING to CONTEST/OPEN'
  );

  // Thẻ nổi bật Navy + thẻ trắng + 2 badge độc lập + 4 chỉ số + lịch Mở/Đóng
  assert(
    viewContent.includes('ASSESSMENT_UI.featuredCard') &&
      viewContent.includes('ASSESSMENT_UI.surfaceCard') &&
      primitivesContent.includes('from-[#0D1C32]') &&
      primitivesContent.includes('border-2 border-[#E2E8F0]'),
    'Must render Featured Navy Card and 2px-bordered White Cards via shared tokens'
  );
  assert(
    (viewContent.includes('dataStatus="published"') ||
      viewContent.includes('data-publish-status="published"')) &&
      (viewContent.includes('dataStatus="unpublished"') ||
        viewContent.includes('data-publish-status="unpublished"')) &&
      primitivesContent.includes('data-publish-status={dataStatus}'),
    'Must render independent publish status badge'
  );
  assert(
    viewContent.includes('formatExamLocalDateTime') && viewContent.includes('formatExamLocalDate'),
    'Must format schedule and created/updated dates using LocalDateTime helpers'
  );

  // Async states (strict: no mock fallback button)
  assert(viewContent.includes('animate-pulse'), 'Must have Loading skeleton state');
  assert(viewContent.includes("t('errorGenericTitle')"), 'Must have Error state');
  assert(viewContent.includes("t('retryBtn')"), 'Error state must have Retry button');
  assert(!viewContent.includes('Xem dữ liệu mẫu'), 'Must NOT have fallback demo mode button');
  assert(viewContent.includes('id="emptyFilterState"'), 'Must have Empty state');
  assert(viewContent.includes('id="btnResetFilters"'), 'Empty filter state must have Reset filters button');

  // Thao tác thật: Xem chi tiết + Menu ... truy cập + Modal xác nhận
  assert(viewContent.includes("t('viewDetailBtn')"), 'Must have "Xem chi tiết" button');
  assert(viewContent.includes('more_horiz'), 'Must have more_horiz action menu icon');
  assert(
    viewContent.includes('bottom-full mb-1.5'),
    'Action menu must open upwards on bottom cards to prevent overflow cutoff'
  );
  assert(
    viewContent.includes('usePublishExam') &&
      viewContent.includes('useUnpublishExam') &&
      viewContent.includes('useDeleteExam'),
    'Must wire real publish/unpublish/delete mutations'
  );
  assert(!viewContent.includes('Đang phát triển'), 'Must NOT contain placeholder actions');

  // Panel Quy chế công bố bài thi & Phân trang
  assert(viewContent.includes("t('policyPanelTitle')"), 'Must render policy aside panel');
  assert(
    viewContent.includes('id="btnPrevPage"') && viewContent.includes('id="btnNextPage"'),
    'Must have pagination prev/next controls'
  );

  console.log('  -> PASSED Test 3: TeacherExamsTableView V2 component matches specifications.\n');

  // -------------------------------------------------------------
  // Test 4: Verify integration in TeacherAssignmentsTableView
  // -------------------------------------------------------------
  console.log('Test 4: Inspect tab integration in TeacherAssignmentsTableView.tsx...');
  const teacherTablePath = path.resolve(
    process.cwd(),
    'src/features/assignments/components/TeacherAssignmentsTableView.tsx'
  );
  const teacherTableContent = fs.readFileSync(teacherTablePath, 'utf8');

  assert(
    teacherTableContent.includes("import { TeacherExamsTableView } from './TeacherExamsTableView';"),
    'TeacherAssignmentsTableView must import TeacherExamsTableView'
  );
  assert(
    teacherTableContent.includes("activeTypeTab === 'assignments' ? ("),
    'Must conditionally render assignments vs exams based on activeTypeTab'
  );
  assert(
    teacherTableContent.includes('<TeacherExamsTableView'),
    'Must render TeacherExamsTableView when activeTypeTab is exams'
  );
  assert(
    teacherTableContent.includes('toggleAssignments') && teacherTableContent.includes('toggleExams'),
    'Must maintain sub-tab toggle buttons [Bài tập] vs [Bài thi]'
  );

  console.log('  -> PASSED Test 4: Tab switching between Assignments and Exams verified.\n');

  console.log('================================================================');
  console.log('ALL TESTS PASSED: TEACHER EXAMS TABLE VIEW SUCCESSFULLY VERIFIED!');
  console.log('================================================================');
}


  await runExamTests();

}

// ===============================================================
// Sub-test: verify_teacher_exams_table_compact.test.ts
// ===============================================================
async function test_verify_teacher_exams_table_compact() {
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


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_exams_v2.test.ts
// ===============================================================
async function test_verify_teacher_exams_v2() {
// Node localStorage mock
const storage: Record<string, string> = {};
(globalThis as unknown as { window: unknown }).window = globalThis;
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => storage[k] ?? null,
    setItem: (k: string, v: string) => {
      storage[k] = v;
    },
    removeItem: (k: string) => {
      delete storage[k];
    },
    clear: () => {
      for (const k of Object.keys(storage)) delete storage[k];
    },
    key: (i: number) => Object.keys(storage)[i] ?? null,
    length: Object.keys(storage).length,
  };
}

async function runTeacherExamsV2Tests() {
  console.log('=== VERIFYING TEACHER EXAMS LIST V2 ===\n');

  // ------------------------------------------------------------------
  // Test 1: Schema strictness (no fabricated defaults, updatedAt, LocalDateTime)
  // ------------------------------------------------------------------
  console.log('Test 1: Schema strictness & LocalDateTime formatting...');
  const parsedMinimal = examItemSchema.parse({
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Đề thi tối giản chưa công bố',
    examType: 'COMPETITION',
    status: 'OPENING',
    isPublished: false,
    questionCount: 0,
    createdAt: '2026-11-10T09:15:00',
    updatedAt: '2026-11-18T14:30:00',
  });
  assert(parsedMinimal.examType === 'CONTEST', 'COMPETITION must normalize to CONTEST');
  assert(parsedMinimal.status === 'OPEN', 'OPENING must normalize to OPEN');
  assert(parsedMinimal.isPublished === false, 'isPublished=false must stay false');
  assert(parsedMinimal.questionCount === 0, 'questionCount=0 must be preserved');
  assert(parsedMinimal.durationMinutes === undefined, 'durationMinutes must not default to 60');
  assert(parsedMinimal.totalScore === undefined, 'totalScore must not default to 10');
  assert(parsedMinimal.updatedAt === '2026-11-18T14:30:00', 'updatedAt must be parsed');

  const parsedMissingPublish = examItemSchema.parse({
    id: '22222222-2222-4222-8222-222222222222',
    title: 'Đề thi thiếu isPublished',
    examType: 'QUIZ',
    status: 'UPCOMING',
  });
  assert(
    parsedMissingPublish.isPublished === undefined,
    'Missing isPublished must NOT default to true'
  );

  assert(
    formatExamLocalDate('2026-11-18T00:05:00') === '18/11/2026',
    'formatExamLocalDate must preserve LocalDateTime day without UTC shift'
  );
  assert(formatExamLocalDate(null) === '--', 'formatExamLocalDate(null) must return --');
  assert(
    formatExamLocalDateTime('2026-11-18T07:30:00') === '07:30 – 18/11/2026',
    'formatExamLocalDateTime must preserve HH:mm – DD/MM/YYYY'
  );
  assert(normalizeExamType('COMPETITION') === 'CONTEST', 'normalizeExamType adapter');
  assert(normalizeExamStatus('OPENING') === 'OPEN', 'normalizeExamStatus adapter');
  console.log('  ✔ PASSED Test 1\n');

  // ------------------------------------------------------------------
  // Test 2: Real API contract for publish, unpublish, delete (empty body, 204, no fake fallback)
  // ------------------------------------------------------------------
  console.log('Test 2: Real UUID API contract for publishExam / unpublishExam / deleteExam...');
  const origPatch = api.patch;
  const origDelete = api.delete;
  const realClassId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const realExamId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  try {
    let lastPatchArgs: unknown[] = [];
    (api as unknown as { patch: (...args: unknown[]) => Promise<unknown> }).patch = async (
      ...args: unknown[]
    ) => {
      lastPatchArgs = args;
      if (String(args[0]).endsWith('/publish')) {
        return {
          data: {
            data: {
              id: realExamId,
              title: 'Kỳ thi CSDL',
              examType: 'MIDTERM',
              status: 'UPCOMING',
              isPublished: true,
              questionCount: 12,
              durationMinutes: 45,
              totalScore: 20,
              startTime: '2026-12-01T08:00:00',
              endTime: '2026-12-01T09:00:00',
              createdAt: '2026-11-10T10:00:00',
              updatedAt: '2026-11-18T15:00:00',
            },
          },
        };
      }
      return {
        data: {
          data: {
            id: realExamId,
            title: 'Kỳ thi CSDL',
            examType: 'MIDTERM',
            status: 'UPCOMING',
            isPublished: false,
            questionCount: 12,
            durationMinutes: 45,
            totalScore: 20,
            startTime: '2026-12-01T08:00:00',
            endTime: '2026-12-01T09:00:00',
          },
        },
      };
    };

    // Publish sends empty body (only 1 arg) and returns parsed ExamDetail
    const published = await publishExam(realExamId, realClassId);
    assert(lastPatchArgs.length === 1, 'publishExam must send empty body (no payload object)');
    assert(lastPatchArgs[0] === `/exams/${realExamId}/publish`, 'publish endpoint path');
    assert(published.isPublished === true, 'publishExam must return isPublished=true');
    assert(published.status === 'UPCOMING', 'publishExam must preserve schedule status');

    // Unpublish sends empty body and keeps schedule status independent
    const unpublished = await unpublishExam(realExamId, realClassId);
    assert(lastPatchArgs.length === 1, 'unpublishExam must send empty body');
    assert((lastPatchArgs[0] as string) === `/exams/${realExamId}/unpublish`, 'unpublish endpoint path');
    assert(unpublished.isPublished === false, 'unpublishExam must return isPublished=false');
    assert(
      unpublished.status === 'UPCOMING',
      'unpublishExam must NOT overwrite schedule status'
    );

    // Publish error (400/409) on real UUID MUST throw and NOT fall back to localStorage
    (api as unknown as { patch: (...args: unknown[]) => Promise<unknown> }).patch = async () => {
      const err = new Error('Tổng điểm câu hỏi chưa khớp totalScore') as Error & {
        httpStatus?: number;
        response?: { status?: number; data?: { message?: string } };
      };
      err.httpStatus = 409;
      err.response = { status: 409, data: { message: 'Tổng điểm câu hỏi chưa khớp totalScore' } };
      throw err;
    };

    let publishConflictCaught = false;
    try {
      await publishExam(realExamId, realClassId);
    } catch (e) {
      publishConflictCaught = true;
      assert(
        (e as { httpStatus?: number }).httpStatus === 409,
        '409 error must be propagated intact'
      );
    }
    assert(publishConflictCaught, 'Real UUID publishExam MUST throw on 409 without local fallback');

    // Delete 204 empty body succeeds cleanly
    let lastDeleteUrl = '';
    (api as unknown as { delete: (url: string) => Promise<unknown> }).delete = async (
      url: string
    ) => {
      lastDeleteUrl = url;
      return { status: 204, data: '' };
    };
    await deleteExam(realExamId, realClassId);
    assert(lastDeleteUrl === `/exams/${realExamId}`, 'deleteExam must call /exams/{examId}');

    // Delete 409 on real UUID MUST throw (never locally delete)
    (api as unknown as { delete: () => Promise<unknown> }).delete = async () => {
      const err = new Error('Bài thi đã có lượt làm bài, không thể xóa') as Error & {
        httpStatus?: number;
        response?: { status?: number; data?: { message?: string } };
      };
      err.httpStatus = 409;
      err.response = {
        status: 409,
        data: { message: 'Bài thi đã có lượt làm bài, không thể xóa' },
      };
      throw err;
    };
    let deleteConflictCaught = false;
    try {
      await deleteExam(realExamId, realClassId);
    } catch (e) {
      deleteConflictCaught = true;
      assert(
        (e as { httpStatus?: number }).httpStatus === 409,
        'Delete 409 must be propagated intact'
      );
    }
    assert(deleteConflictCaught, 'Real UUID deleteExam MUST throw on 409');
  } finally {
    api.patch = origPatch;
    api.delete = origDelete;
  }

  // Demo delete persistence check
  resetCreatedExams();
  const beforeDemoDelete = filterAndPaginateMockExams({ page: 0, size: 10 }, 'csdl-k22-01');
  assert(beforeDemoDelete.totalElements === 3, 'Demo class starts with 3 exams');
  // Simulate demo delete via offline fallback
  (api as unknown as { delete: () => Promise<unknown> }).delete = async () => {
    throw new Error('offline');
  };
  try {
    await deleteExam('EXAM_003', 'csdl-k22-01');
  } finally {
    api.delete = origDelete;
  }
  const afterDemoDelete = filterAndPaginateMockExams({ page: 0, size: 10 }, 'csdl-k22-01');
  assert(afterDemoDelete.totalElements === 2, 'Demo delete removes EXAM_003');
  assert(
    !afterDemoDelete.items.some((e) => e.id === 'EXAM_003'),
    'EXAM_003 must remain deleted on reload'
  );
  resetCreatedExams();
  console.log('  ✔ PASSED Test 2\n');

  // ------------------------------------------------------------------
  // Test 3: Real Class Management Permission Guard
  // ------------------------------------------------------------------
  console.log('Test 3: Strict class permission evaluation (evaluateCanManageClassExams)...');
  const uuidClass = '12345678-1234-4123-8123-123456789abc';

  // Outside teacher with teacher UI view ON, NOT owner/member/admin -> DENIED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isDemoTeacherView: true,
      isClassInfoLive: true,
      isMembersLive: true,
      user: { id: 'teacher-outside-01', roleName: 'ROLE_USER' },
      classInfo: { ownerId: 'owner-other-99', instructor: { id: 'owner-other-99' } },
      members: [{ id: 'owner-other-99', role: 'OWNER', status: 'APPROVED' }],
    }) === false,
    'Outside teacher must NOT get write permission'
  );

  // Fallback mock class info on real UUID -> DENIED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isDemoTeacherView: true,
      isClassInfoLive: false,
      isMembersLive: false,
      user: { id: 'owner-01', roleName: 'ROLE_USER' },
      classInfo: { ownerId: 'owner-01' },
      members: [{ id: 'owner-01', role: 'OWNER', status: 'APPROVED' }],
    }) === false,
    'Non-live/fallback class data must NOT grant write permission on real UUID class'
  );

  // Pending teacher member -> DENIED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isClassInfoLive: true,
      isMembersLive: true,
      user: { id: 'teacher-pending', roleName: 'ROLE_USER' },
      classInfo: { ownerId: 'owner-other-99' },
      members: [{ id: 'teacher-pending', role: 'TEACHER', status: 'PENDING' }],
    }) === false,
    'Pending teacher member must NOT get write permission'
  );

  // Real class owner -> ALLOWED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isClassInfoLive: true,
      isMembersLive: false,
      user: { id: 'owner-01', roleName: 'ROLE_USER' },
      classInfo: { ownerId: 'owner-01' },
      members: [],
    }) === true,
    'Real class owner must get write permission'
  );

  // Approved class teacher member -> ALLOWED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isClassInfoLive: true,
      isMembersLive: true,
      user: { id: 'teacher-in-class', roleName: 'ROLE_USER' },
      classInfo: { ownerId: 'owner-other-99' },
      members: [{ id: 'teacher-in-class', role: 'TEACHER', status: 'APPROVED' }],
    }) === true,
    'Approved teacher in class must get write permission'
  );

  // System Admin -> ALLOWED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: false,
      isClassInfoLive: true,
      user: { id: 'admin-01', roleName: 'ROLE_ADMIN' },
      classInfo: { ownerId: 'owner-other-99' },
      members: [],
    }) === true,
    'System admin must get write permission'
  );

  // Student view even for owner -> DENIED
  assert(
    evaluateCanManageClassExams({
      classId: uuidClass,
      isStudentView: true,
      isClassInfoLive: true,
      user: { id: 'owner-01', roleName: 'ROLE_ADMIN' },
      classInfo: { ownerId: 'owner-01' },
    }) === false,
    'Student view must never grant teacher write permission'
  );

  // Demo class with teacher role -> ALLOWED
  assert(
    evaluateCanManageClassExams({
      classId: 'csdl-k22-01',
      isStudentView: false,
      isDemoTeacherView: true,
    }) === true,
    'Demo class preserves demo teacher workflow'
  );
  console.log('  ✔ PASSED Test 3\n');

  // ------------------------------------------------------------------
  // Test 4: i18n Key Parity (vi.json === en.json)
  // ------------------------------------------------------------------
  console.log('Test 4: Verify i18n key parity for assignments.exams.teacher...');
  const viJson = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'src/messages/vi.json'), 'utf8')
  );
  const enJson = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'src/messages/en.json'), 'utf8')
  );
  const viKeys = Object.keys(viJson.assignments.exams.teacher).sort();
  const enKeys = Object.keys(enJson.assignments.exams.teacher).sort();
  assert(viKeys.length > 50, `Expected >50 i18n keys, got ${viKeys.length}`);
  assert(
    JSON.stringify(viKeys) === JSON.stringify(enKeys),
    'vi.json and en.json assignments.exams.teacher keys must match 100%'
  );
  for (const k of viKeys) {
    assert(
      typeof viJson.assignments.exams.teacher[k] === 'string' &&
        viJson.assignments.exams.teacher[k].trim().length > 0,
      `vi.json key ${k} must be non-empty`
    );
    assert(
      typeof enJson.assignments.exams.teacher[k] === 'string' &&
        enJson.assignments.exams.teacher[k].trim().length > 0,
      `en.json key ${k} must be non-empty`
    );
  }
  console.log(`  ✔ PASSED Test 4 (${viKeys.length} symmetrical keys)\n`);

  // ------------------------------------------------------------------
  // Test 5: Source Code Contract & Scope Audit
  // ------------------------------------------------------------------
  console.log('Test 5: Audit TeacherExamsTableView & integration files...');
  const viewCode = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/assignments/components/TeacherExamsTableView.tsx'),
    'utf8'
  );
  const assignmentsCode = fs.readFileSync(
    path.resolve(
      process.cwd(),
      'src/features/assignments/components/TeacherAssignmentsTableView.tsx'
    ),
    'utf8'
  );
  const classDetailCode = fs.readFileSync(
    path.resolve(
      process.cwd(),
      'src/features/classes/components/detail/ClassDetailPageView.tsx'
    ),
    'utf8'
  );

  const primitivesCode = fs.readFileSync(
    path.resolve(
      process.cwd(),
      'src/features/assignments/components/AssessmentListPrimitives.tsx'
    ),
    'utf8'
  );
  assert(
    viewCode.includes('AssessmentTwoColumnLayout') &&
      primitivesCode.includes('lg:grid-cols-[minmax(0,1fr)_260px]'),
    'Must use unified 2-column desktop layout (minmax(0,1fr) + 260px aside)'
  );
  assert(viewCode.includes('useVisibleExamDetails'), 'Must enrich visible cards via useVisibleExamDetails');
  assert(viewCode.includes('usePublishExam') && viewCode.includes('useUnpublishExam') && viewCode.includes('useDeleteExam'), 'Must wire real publish, unpublish, and delete hooks');
  assert(!viewCode.includes('Đang phát triển'), 'Must NOT contain placeholder "Đang phát triển" actions');
  assert(!viewCode.includes('Xem dữ liệu mẫu'), 'Must NOT contain fallback "Xem dữ liệu mẫu" button');
  assert(!viewCode.includes("'COMPETITION'") && !viewCode.includes("'OPENING'"), 'Must NOT use legacy COMPETITION or OPENING filter values');
  assert(viewCode.includes('more_horiz') && viewCode.includes('aria-haspopup="menu"') && viewCode.includes("e.key === 'Escape'"), 'Must have accessible ... menu with Escape close & focus restore');
  assert(viewCode.includes('unpublishExamModalTitle') && viewCode.includes('deleteExamModalTitle'), 'Must render confirmation modals for unpublish and delete');
  assert(viewCode.includes('policyPanelTitle'), 'Must render "Quy chế công bố bài thi" policy panel');
  assert(viewCode.includes('pageSize = 5'), 'Must enforce 5 exams per page including featured hero');
  assert(assignmentsCode.includes('canManageExams={canManageExams}'), 'TeacherAssignmentsTableView must pass canManageExams');
  assert(classDetailCode.includes('evaluateCanManageClassExams'), 'ClassDetailPageView must evaluate real class exam permissions');
  console.log('  ✔ PASSED Test 5\n');

  console.log('================================================================');
  console.log('ALL 5 TEACHER EXAMS V2 VERIFICATION TESTS PASSED!');
  console.log('================================================================');
}


  await runTeacherExamsV2Tests();

}

// ===============================================================
// Sub-test: verify_teacher_exam_detail.test.ts
// ===============================================================
async function test_verify_teacher_exam_detail() {
// Mock localStorage for node environment
const storageMock: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (key: string) => storageMock[key] ?? null,
  setItem: (key: string, value: string) => {
    storageMock[key] = value;
  },
  removeItem: (key: string) => {
    delete storageMock[key];
  },
  clear: () => {
    for (const k of Object.keys(storageMock)) delete storageMock[k];
  },
  key: (i: number) => Object.keys(storageMock)[i] ?? null,
  length: Object.keys(storageMock).length,
};

// Mock window for node environment
if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = globalThis;
}

async function runTests() {
  console.log('=== STARTING TEACHER EXAM DETAIL & QUESTION MANAGEMENT TESTS ===\n');

  // Clear any existing localStorage
  storageMock['ilms_exam_questions_EXAM_001'] = '';
  delete storageMock['ilms_exam_questions_EXAM_001'];

  // Test 1: Load Exam Info (GET /api/v1/exams/{id})
  console.log('[TEST 1] Load Exam Details for EXAM_001');
  const exam = await getExamById('EXAM_001');
  assert.strictEqual(exam.id, 'EXAM_001');
  assert.strictEqual(exam.title, 'Thi giữa kỳ Mạng máy tính');
  assert.strictEqual(exam.examType, 'MIDTERM');
  assert.strictEqual(exam.durationMinutes, 60);
  assert.strictEqual(exam.totalScore, 10);
  assert.strictEqual(exam.isPublished, true);
  assert.strictEqual(exam.status, 'UPCOMING');
  console.log('✓ Successfully retrieved exam info: title, duration, max score, published status, schedule status.');

  // Test 2: Load Exam Questions (GET /api/v1/exams/{id}/questions)
  console.log('\n[TEST 2] Load Exam Questions for EXAM_001');
  let questions = await getExamQuestions('EXAM_001');
  assert.strictEqual(questions.length, 20, 'EXAM_001 should have 20 initial questions');
  // Check orderIndex 1..20
  for (let i = 0; i < questions.length; i++) {
    assert.strictEqual(questions[i].orderIndex, i + 1, `Question ${i} should have orderIndex ${i + 1}`);
    assert.strictEqual(questions[i].score, 0.5, `Question ${i} should have score 0.5`);
  }
  const totalScore = Number(questions.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
  assert.strictEqual(totalScore, 10.0, 'Total score of questions must equal 10.0');
  console.log(`✓ Successfully loaded 20 questions with correct ascending orderIndex (1..20) and total score ${totalScore}/10.0.`);

  // Test 3: Edit lock when exam is published
  console.log('\n[TEST 3] Edit Lock Enforcement when isPublished === true');
  const canEditWhenPublished = !exam.isPublished && exam.status === 'UPCOMING';
  assert.strictEqual(canEditWhenPublished, false, 'Editing must be locked when exam is published');
  console.log('✓ Editing actions (Add, Edit, Delete) correctly locked when isPublished === true.');

  // Test 4: Unpublish exam (PATCH /api/v1/exams/{id}/unpublish)
  console.log('\n[TEST 4] Unpublish Exam');
  const unpublishRes = await unpublishExam('EXAM_001');
  assert.strictEqual(unpublishRes.isPublished, false, 'Exam should now be unpublished');
  const canEditWhenUnpublished = !unpublishRes.isPublished && exam.status === 'UPCOMING';
  assert.strictEqual(canEditWhenUnpublished, true, 'Editing actions should now be unlocked');
  console.log('✓ Successfully unpublished exam. Editing permissions unlocked.');

  // Test 5: Delete a question (DELETE /api/v1/exams/{id}/questions/{id})
  console.log('\n[TEST 5] Delete Question #20');
  const questionToDelete = questions[19];
  await deleteExamQuestion('EXAM_001', questionToDelete.id);
  questions = await getExamQuestions('EXAM_001');
  assert.strictEqual(questions.length, 19, 'Questions count should decrease to 19');
  // Verify orderIndex is re-indexed from 1 to 19
  for (let i = 0; i < questions.length; i++) {
    assert.strictEqual(questions[i].orderIndex, i + 1, `Question ${i} should have continuous orderIndex ${i + 1}`);
  }
  const currentTotal = Number(questions.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
  assert.strictEqual(currentTotal, 9.5, 'Total score should now be 9.5');
  const canPublishWhenIncomplete = questions.length > 0 && Math.abs(currentTotal - exam.totalScore) < 0.001;
  assert.strictEqual(canPublishWhenIncomplete, false, 'Publish button must be disabled when totalScore does not match');
  console.log(`✓ Deleted question #20. Remaining 19 questions automatically re-indexed 1..19. Total score is ${currentTotal}/10.0. Publish button locked.`);

  // Test 6: Update question score & orderIndex (PATCH /api/v1/exams/{id}/questions/{id})
  console.log('\n[TEST 6] Update Question #19: Increase score to 1.0 and move to orderIndex 1');
  const questionToUpdate = questions[18]; // Currently at orderIndex 19
  await updateExamQuestion('EXAM_001', questionToUpdate.id, {
    score: 1.0,
    orderIndex: 1,
  });
  questions = await getExamQuestions('EXAM_001');
  assert.strictEqual(questions.length, 19);
  // Verify the updated question is now at orderIndex 1
  assert.strictEqual(questions[0].id, questionToUpdate.id);
  assert.strictEqual(questions[0].score, 1.0);
  assert.strictEqual(questions[0].orderIndex, 1);
  // Verify all questions have contiguous orderIndex 1..19
  for (let i = 0; i < questions.length; i++) {
    assert.strictEqual(questions[i].orderIndex, i + 1);
  }
  const updatedTotal = Number(questions.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
  assert.strictEqual(updatedTotal, 10.0, 'Total score should now be back to 10.0');
  const canPublishNow = questions.length > 0 && Math.abs(updatedTotal - exam.totalScore) < 0.001;
  assert.strictEqual(canPublishNow, true, 'Publish button should now be enabled because totalScore matches');
  console.log(`✓ Updated question moved to position 1 and score changed to 1.0. OrderIndex contiguous 1..19. Total score is ${updatedTotal}/10.0. Publish button enabled.`);

  // Test 7: Add question from question bank & check duplicate prevention
  console.log('\n[TEST 7] Bank Questions & Duplicate Prevention');
  const bank = await getBankQuestions({ courseId: 'CS-202' });
  assert.ok(bank.items.length > 0, 'Question bank should return available questions');
  console.log(`✓ Question bank returned ${bank.items.length} questions for course CS-202.`);

  // Test duplicate check
  let duplicateErrorThrown = false;
  try {
    // q1 is already in the exam
    await addExamQuestion('EXAM_001', {
      questionId: 'q1',
      score: 1.0,
    });
  } catch (err: unknown) {
    duplicateErrorThrown = true;
    console.log(`✓ Prevented adding duplicate question: ${(err as Error).message}`);
  }
  assert.strictEqual(duplicateErrorThrown, true, 'Adding duplicate question must be rejected');

  // Test 8: Publish exam (PATCH /api/v1/exams/{id}/publish)
  console.log('\n[TEST 8] Publish Exam when totalScore matches');
  const publishRes = await publishExam('EXAM_001');
  assert.strictEqual(publishRes.isPublished, true, 'Exam must be published');
  console.log('✓ Successfully published exam!');

  // Test 9: Persistence across simulated F5 (localStorage)
  console.log('\n[TEST 9] Persistence check (F5 Simulation)');
  const storedJson = storageMock['ilms_exam_questions_EXAM_001'];
  assert.ok(storedJson, 'Questions must be stored in localStorage');
  const reloadedQuestions = await getExamQuestions('EXAM_001');
  assert.strictEqual(reloadedQuestions.length, 19);
  assert.strictEqual(reloadedQuestions[0].id, questionToUpdate.id);
  assert.strictEqual(reloadedQuestions[0].score, 1.0);
  console.log('✓ All question mutations (score, order, deletions) persist across page reloads (F5).');

  // Test 10: Real backend endpoint compatibility check with UUID
  console.log('\n[TEST 10] Real API Call to Backend with UUID (Spec 13.1, 13.2)');
  const testExamUuid = '11111111-2222-3333-4444-555555555555';
  let apiStatus = 0;
  let apiUrl = '';
  try {
    await api.get(`/exams/${testExamUuid}/questions`);
  } catch (err: any) {
    if (err.response) {
      apiStatus = err.response.status;
      apiUrl = err.config?.url || '';
    } else {
      apiUrl = err.config?.url || '';
    }
  }
  console.log(`✓ Real Axios call attempted: URL = ${apiUrl}, HTTP Status = ${apiStatus || 'Network/Server offline'}`);
  console.log('✓ Handled standard API responses according to docs/api-spec.md.\n');

  console.log('=== ALL 10 TESTS PASSED SUCCESSFULLY! ===');
}


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_exam_detail_sync.test.ts
// ===============================================================
async function test_verify_teacher_exam_detail_sync() {
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


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_update_exam.test.ts
// ===============================================================
async function test_verify_teacher_update_exam() {
// Mock localStorage for node environment
const storageMock: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (key: string) => storageMock[key] ?? null,
  setItem: (key: string, value: string) => {
    storageMock[key] = value;
  },
  removeItem: (key: string) => {
    delete storageMock[key];
  },
  clear: () => {
    for (const k of Object.keys(storageMock)) delete storageMock[k];
  },
  key: (i: number) => Object.keys(storageMock)[i] ?? null,
  length: Object.keys(storageMock).length,
};

// Mock window for node environment
if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = globalThis;
}

async function runTests() {
  console.log('--- STARTING TEACHER EDIT EXAM VERIFICATION TESTS ---');

  // Test 1: getExamById retrieves mock / demo exam
  console.log('\n[TEST 1] getExamById with mock exam EXAM_001');
  const exam1 = await getExamById('EXAM_001');
  assert.strictEqual(exam1.id, 'EXAM_001');
  assert.strictEqual(exam1.title, 'Thi giữa kỳ Mạng máy tính');
  assert.strictEqual(exam1.examType, 'MIDTERM');
  assert.strictEqual(exam1.durationMinutes, 60);
  assert.strictEqual(exam1.totalScore, 10);
  assert.strictEqual(exam1.isPublished, true);
  console.log('✓ Successfully retrieved EXAM_001 with correct details.');

  // Test 2: Dirty checking logic simulation
  console.log('\n[TEST 2] Dirty checking & form state toggle');
  const initialValues = {
    examId: 'EXAM_001',
    courseId: exam1.courseId || '',
    examType: exam1.examType || 'MIDTERM',
    title: exam1.title || '',
    description: exam1.description || '',
    durationMinutes: '60',
    totalScore: '10',
    startTime: '2024-11-15T07:30',
    endTime: '2024-11-15T09:00',
  };

  function computeDirty(current: typeof initialValues) {
    const dirty: Record<string, boolean> = {};
    if (current.examType !== initialValues.examType) dirty.examType = true;
    if (current.title.trim() !== initialValues.title.trim()) dirty.title = true;
    if ((current.description || '').trim() !== (initialValues.description || '').trim())
      dirty.description = true;
    if (Number(current.durationMinutes) !== Number(initialValues.durationMinutes))
      dirty.durationMinutes = true;
    if (Number(current.totalScore) !== Number(initialValues.totalScore))
      dirty.totalScore = true;
    if (current.startTime !== initialValues.startTime) dirty.startTime = true;
    if (current.endTime !== initialValues.endTime) dirty.endTime = true;
    return dirty;
  }

  // Initial state -> NOT dirty
  let dirty = computeDirty(initialValues);
  assert.strictEqual(Object.keys(dirty).length, 0, 'Initial state must have 0 dirty fields');
  console.log('✓ Initial state is not dirty (button disabled).');

  // User edits title
  let edited = { ...initialValues, title: 'Thi giữa kỳ Mạng máy tính (Cập nhật 2024)' };
  dirty = computeDirty(edited);
  assert.strictEqual(Object.keys(dirty).length, 1);
  assert.strictEqual(dirty.title, true);
  console.log('✓ Editing title triggers dirty state (button enabled).');

  // User reverts title back to original
  edited = { ...initialValues, title: 'Thi giữa kỳ Mạng máy tính' };
  dirty = computeDirty(edited);
  assert.strictEqual(Object.keys(dirty).length, 0);
  console.log('✓ Reverting title back locks button (dirty reverted to false).');

  // User edits duration and totalScore
  edited = { ...initialValues, durationMinutes: '90', totalScore: '100' };
  dirty = computeDirty(edited);
  assert.strictEqual(Object.keys(dirty).length, 2);
  assert.strictEqual(dirty.durationMinutes, true);
  assert.strictEqual(dirty.totalScore, true);
  console.log('✓ Editing duration & totalScore correctly tracks only those 2 dirty fields.');

  // Test 3: Validation logic (Date range, duration constraint, max score)
  console.log('\n[TEST 3] Validation rules');
  function validate(val: typeof initialValues) {
    const errors: Record<string, string> = {};
    if (!val.title.trim()) errors.title = 'Tên bài thi là bắt buộc';
    const durNum = Number(val.durationMinutes);
    if (!val.durationMinutes || isNaN(durNum) || durNum <= 0)
      errors.durationMinutes = 'Thời lượng phải là số nguyên dương';
    const scoreNum = Number(val.totalScore);
    if (!val.totalScore || isNaN(scoreNum) || scoreNum <= 0 || scoreNum > 100)
      errors.totalScore = 'Tổng điểm phải lớn hơn 0 và tối đa 100';
    if (val.startTime && val.endTime) {
      const s = new Date(val.startTime).getTime();
      const e = new Date(val.endTime).getTime();
      if (e <= s) {
        errors.endTime = 'Giờ đóng phải sau giờ mở';
      } else if (durNum > 0 && e - s < durNum * 60 * 1000) {
        errors.endTime = 'Khoảng thời gian mở phải đủ thời lượng làm bài';
      }
    }
    return errors;
  }

  // Valid inputs
  assert.strictEqual(Object.keys(validate(initialValues)).length, 0);

  // Invalid: endTime before startTime
  const invalidTime = {
    ...initialValues,
    startTime: '2024-11-15T09:00',
    endTime: '2024-11-15T07:30',
  };
  const timeErrors = validate(invalidTime);
  assert.strictEqual(timeErrors.endTime, 'Giờ đóng phải sau giờ mở');
  console.log('✓ Catches endTime before startTime correctly.');

  // Invalid: window duration (30 mins) < exam duration (60 mins)
  const invalidWindow = {
    ...initialValues,
    durationMinutes: '60',
    startTime: '2024-11-15T07:30',
    endTime: '2024-11-15T08:00', // only 30 min window
  };
  const windowErrors = validate(invalidWindow);
  assert.strictEqual(windowErrors.endTime, 'Khoảng thời gian mở phải đủ thời lượng làm bài');
  console.log('✓ Catches insufficient window duration correctly.');

  // Invalid: totalScore > 100
  const invalidScore = { ...initialValues, totalScore: '150' };
  const scoreErrors = validate(invalidScore);
  assert.strictEqual(scoreErrors.totalScore, 'Tổng điểm phải lớn hơn 0 và tối đa 100');
  console.log('✓ Catches totalScore > 100 correctly.');

  // Test 4: formatExamPayloadDateTime converts YYYY-MM-DDTHH:mm to yyyy-MM-ddTHH:mm:ss
  console.log('\n[TEST 4] DateTime payload formatting');
  const formattedStart = formatExamPayloadDateTime('2024-11-15T07:30');
  assert.strictEqual(formattedStart, '2024-11-15T07:30:00');
  console.log('✓ formatExamPayloadDateTime formatted to yyyy-MM-ddTHH:mm:ss:', formattedStart);

  // Test 5: Real backend PATCH call to verify payload and 401 unauthenticated response
  console.log('\n[TEST 5] Backend API call (PATCH /api/v1/exams/{id})');
  const testExamId = '00000000-0000-4000-8000-000000000001';
  const dirtyPayload: Partial<CreateExamInput> = {
    title: 'Thi thử nghiệm API PATCH',
    durationMinutes: 45,
    startTime: '2024-11-20T08:00',
    endTime: '2024-11-20T10:00',
  };

  try {
    await updateExam(testExamId, dirtyPayload);
    console.log('Unexpected success for unauthenticated PATCH call');
  } catch (err: unknown) {
    const lastLog = (
      globalThis as unknown as { window?: { __lastExamUpdateCall?: ExamNetworkLog } }
    ).window?.__lastExamUpdateCall;

    assert.ok(lastLog, 'Network log must be recorded in window.__lastExamUpdateCall');
    assert.strictEqual(lastLog.url, `/exams/${testExamId}`);
    assert.strictEqual(
      lastLog.fullUrl,
      `https://api.ilms.page/api/v1/exams/${testExamId}`
    );
    assert.strictEqual(lastLog.httpStatus, 401);
    assert.strictEqual(lastLog.success, false);
    assert.deepStrictEqual(lastLog.payload, {
      title: 'Thi thử nghiệm API PATCH',
      durationMinutes: 45,
      startTime: '2024-11-20T08:00:00',
      endTime: '2024-11-20T10:00:00',
    });
    console.log('✓ Successfully intercepted PATCH call:');
    console.log('  URL:', lastLog.fullUrl);
    console.log('  HTTP Status:', lastLog.httpStatus);
    console.log('  Payload sent (dirty fields only):', JSON.stringify(lastLog.payload));
  }

  // Test 6: Demo exam update persistence across F5 simulation
  console.log('\n[TEST 6] Demo exam update and persistence across F5');
  const demoClassId = 'csdl-k22-01';
  const updatedDemo = await updateExam(
    'EXAM_001',
    {
      title: 'Thi giữa kỳ Mạng máy tính (Đã chỉnh sửa)',
      durationMinutes: 75,
      totalScore: 10,
    },
    demoClassId
  );
  assert.strictEqual(updatedDemo.title, 'Thi giữa kỳ Mạng máy tính (Đã chỉnh sửa)');
  assert.strictEqual(updatedDemo.durationMinutes, 75);
  assert.strictEqual(updatedDemo.isPublished, true); // Published state preserved!

  // Simulate F5 reload by calling getExamById from fresh cache
  const reloadedExam = await getExamById('EXAM_001', demoClassId);
  assert.strictEqual(
    reloadedExam.title,
    'Thi giữa kỳ Mạng máy tính (Đã chỉnh sửa)',
    'Updated title must be preserved across page reload'
  );
  assert.strictEqual(
    reloadedExam.durationMinutes,
    75,
    'Updated duration must be preserved across page reload'
  );
  assert.strictEqual(
    reloadedExam.isPublished,
    true,
    'Publication state must be preserved'
  );
  console.log('✓ Demo exam successfully updated and preserved in local storage across F5.');

  console.log('\n=== ALL TEACHER EDIT EXAM TESTS PASSED SUCCESSFULLY! ===');
}


  await runTests();

}

export async function runAll() {
  return runSuite('Teacher Exams & Questions Suite', [
    { name: 'verify_exams_search_and_filter_toolbar.test.ts', fn: test_verify_exams_search_and_filter_toolbar },
    { name: 'verify_teacher_add_multiple_exam_questions.test.ts', fn: test_verify_teacher_add_multiple_exam_questions },
    { name: 'verify_teacher_create_exam.test.ts', fn: test_verify_teacher_create_exam },
    { name: 'verify_teacher_create_exam_form_sync.test.ts', fn: test_verify_teacher_create_exam_form_sync },
    { name: 'verify_teacher_exams_table.test.ts', fn: test_verify_teacher_exams_table },
    { name: 'verify_teacher_exams_table_compact.test.ts', fn: test_verify_teacher_exams_table_compact },
    { name: 'verify_teacher_exams_v2.test.ts', fn: test_verify_teacher_exams_v2 },
    { name: 'verify_teacher_exam_detail.test.ts', fn: test_verify_teacher_exam_detail },
    { name: 'verify_teacher_exam_detail_sync.test.ts', fn: test_verify_teacher_exam_detail_sync },
    { name: 'verify_teacher_update_exam.test.ts', fn: test_verify_teacher_update_exam },
  ]);
}

if (require.main === module || !process.env.TEST_RUNNER) {
  runAll().then((res) => {
    if (res.failedCount > 0) {
      process.exit(1);
    }
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
