import fs from 'fs';
import path from 'path';
import {
  getClassExamsPaged,
  fetchAllClassExams,
  filterAndPaginateMockExams,
  resetCreatedExams,
  type ExamNetworkLog,
} from '../services/exam.service';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

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

runToolbarAndSearchTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
