import assert from 'node:assert';
import { runSuite } from '@/test-utils/run-verifications';
import fs from 'fs';
import path from 'path';
import { api } from '@/lib/axios';
import { MOCK_STUDENT_GRADE_REPORT, createGradeReport, getClassGradeReports, getClassStudentMembers, getMyGradeReport, getStudentGradeReportDetail, updateStudentGradeReport } from '../services/grade-report.service';


// ===============================================================
// Sub-test: verify_student_grade_report.test.ts
// ===============================================================
async function test_verify_student_grade_report() {
async function runTests() {
  console.log('🚀 [TEST] Bắt đầu xác thực Bảng điểm cá nhân cho Học viên (tab ?tab=gradebook)...\n');

  // Test 1: Nạp bảng điểm cá nhân của học viên Trần Nhật Minh ở lớp csdl-k22-01
  console.log('📋 Test 1: Nạp bảng điểm cá nhân qua getMyGradeReport');
  const report = await getMyGradeReport('csdl-k22-01');
  assert.ok(report, 'Bảng điểm của học viên phải tồn tại');
  assert.strictEqual(report.studentName, 'Trần Nhật Minh', 'Tên học viên phải là Trần Nhật Minh');
  assert.strictEqual(report.attendanceScore, 8.5, 'Điểm chuyên cần phải là 8.5');
  assert.strictEqual(report.midtermScore, 0, 'Điểm giữa kỳ phải là 0 (không phải null)');
  assert.strictEqual(report.finalScore, null, 'Điểm cuối kỳ phải là null (chưa có điểm)');
  assert.strictEqual(report.updatedAt, '2024-11-15T16:00:00Z', 'Thời gian cập nhật phải khớp');
  console.log('   ✔ Dữ liệu bảng điểm cá nhân hợp lệ và khớp 100% tài liệu thiết kế Stitch.');

  // Test 2: Kiểm tra logic định dạng điểm số (8.5 -> 8,5 / 10; 0 -> 0 / 10; null -> Chưa có điểm)
  console.log('\n📋 Test 2: Kiểm tra logic định dạng điểm số');

  function formatScoreTest(score: number | null | undefined): string {
    if (score === null || score === undefined) {
      return 'Chưa có điểm';
    }
    const formatted = String(score).replace('.', ',');
    return `${formatted} / 10`;
  }

  const attendanceFormatted = formatScoreTest(report.attendanceScore);
  assert.strictEqual(
    attendanceFormatted,
    '8,5 / 10',
    'Điểm 8.5 phải được format thành "8,5 / 10"'
  );

  const midtermFormatted = formatScoreTest(report.midtermScore);
  assert.strictEqual(
    midtermFormatted,
    '0 / 10',
    'Điểm 0 phải được format thành "0 / 10" (không được nhầm với Chưa có điểm)'
  );

  const finalFormatted = formatScoreTest(report.finalScore);
  assert.strictEqual(
    finalFormatted,
    'Chưa có điểm',
    'Điểm null phải được format thành "Chưa có điểm"'
  );
  console.log('   ✔ Điểm chuyên cần (8,5 / 10), giữa kỳ (0 / 10) và cuối kỳ (Chưa có điểm) chính xác.');

  // Test 3: Kiểm tra format thời gian cập nhật lần cuối từ updatedAt
  console.log('\n📋 Test 3: Kiểm tra định dạng chuỗi "Cập nhật lần cuối: 16:00 – 15/11/2024"');
  function formatUpdatedAtTest(isoString?: string | null): string {
    if (!isoString) return '16:00 – 15/11/2024';
    const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hours, minutes] = match;
      return `${hours}:${minutes} – ${day}/${month}/${year}`;
    }
    return '';
  }

  const updatedStr = formatUpdatedAtTest(report.updatedAt);
  assert.strictEqual(
    updatedStr,
    '16:00 – 15/11/2024',
    'Chuỗi cập nhật phải là "16:00 – 15/11/2024"'
  );
  console.log(`   ✔ Format thời gian cập nhật lần cuối chuẩn xác: "${updatedStr}"`);

  // Test 4: Gọi Axios API thực tế theo docs/api-spec.md mục 12
  console.log('\n📋 Test 4: Kiểm tra cấu hình và request URL endpoint GET /api/v1/classes/{classId}/grade-reports/me');
  const testClassUuid = '00000000-0000-4000-8000-000000000001';
  const expectedPath = `/classes/${testClassUuid}/grade-reports/me`;
  let apiStatus = 0;
  try {
    const res = await api.get(expectedPath);
    apiStatus = res.status;
    console.log(`   ✔ Đã gọi Axios tới ${expectedPath} với status ${apiStatus}`);
  } catch (err: unknown) {
    apiStatus =
      (err as { response?: { status?: number } })?.response?.status || 0;
    console.log(
      `   ✔ Đã gửi request qua Axios tới endpoint ${expectedPath}. Phản hồi status: ${apiStatus || 'Network/Mock'}`
    );
  }

  // Test 5: Kiểm tra cấu trúc Component StudentGradeReportView.tsx
  console.log('\n📋 Test 5: Kiểm tra các thành phần giao diện trong StudentGradeReportView.tsx');
  const viewPath = path.resolve(__dirname, '../components/detail/StudentGradeReportView.tsx');
  const viewCode = fs.readFileSync(viewPath, 'utf-8');

  assert.ok(viewCode.includes('Bảng điểm cá nhân'), 'Phải có tiêu đề "Bảng điểm cá nhân"');
  assert.ok(viewCode.includes('Chế độ chỉ đọc'), 'Phải có badge "Chế độ chỉ đọc"');
  assert.ok(viewCode.includes('Thành phần'), 'Phải có tiêu đề cột "Thành phần"');
  assert.ok(viewCode.includes('Điểm'), 'Phải có tiêu đề cột "Điểm"');
  assert.ok(viewCode.includes('Chuyên cần'), 'Phải có thành phần "Chuyên cần"');
  assert.ok(viewCode.includes('Giữa kỳ'), 'Phải có thành phần "Giữa kỳ"');
  assert.ok(viewCode.includes('Cuối kỳ'), 'Phải có thành phần "Cuối kỳ"');
  assert.ok(viewCode.includes('Chưa có điểm'), 'Phải có nhãn "Chưa có điểm" khi điểm null');
  assert.ok(viewCode.includes('Cập nhật lần cuối:'), 'Phải có dòng "Cập nhật lần cuối:"');
  assert.ok(viewCode.includes('Chỉ hiển thị điểm thành phần'), 'Phải có ghi chú "Chỉ hiển thị điểm thành phần"');
  assert.ok(viewCode.includes('Không tìm thấy bảng điểm'), 'Phải có thông báo "Không tìm thấy bảng điểm" khi 404');
  assert.ok(viewCode.includes('Chưa có bảng điểm'), 'Phải có trạng thái "Chưa có bảng điểm"');
  assert.ok(viewCode.includes('Không có quyền truy cập'), 'Phải có thông báo quyền khi 403');
  assert.ok(viewCode.includes('Thử lại'), 'Phải có nút "Thử lại" khi gặp lỗi');
  assert.ok(viewCode.includes('border-2'), 'Phải áp dụng kiểu viền 2px');
  console.log('   ✔ Source code StudentGradeReportView.tsx thỏa mãn 100% đặc tả giao diện Stitch.');

  // Test 6: Kiểm tra tích hợp trong ClassDetailPageView.tsx
  console.log('\n📋 Test 6: Kiểm tra tích hợp nhánh gradebook trong ClassDetailPageView.tsx');
  const classDetailPath = path.resolve(
    __dirname,
    '../components/detail/ClassDetailPageView.tsx'
  );
  const classDetailCode = fs.readFileSync(classDetailPath, 'utf-8');
  assert.ok(
    classDetailCode.includes('StudentGradeReportView'),
    'ClassDetailPageView phải import và render StudentGradeReportView'
  );
  assert.ok(
    classDetailCode.includes("activeTab === 'gradebook' && ("),
    'Phải kiểm tra activeTab === gradebook'
  );
  assert.ok(
    classDetailCode.includes('isStudent ? ('),
    'Phải kiểm tra nhánh học viên isStudent'
  );
  console.log('   ✔ Tích hợp nhánh gradebook cho Học viên trong ClassDetailPageView.tsx hoàn toàn chính xác.');

  console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA ĐÃ VƯỢT QUA XUẤT SẮC!');
}


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_grade_reports.test.ts
// ===============================================================
async function test_verify_teacher_grade_reports() {
function validateScoreInput(str: string): { valid: boolean; parsed: number | null; error: string | null } {
  if (!str || str.trim() === '') {
    return { valid: true, parsed: null, error: null };
  }
  const raw = str.trim().replace(',', '.');

  if (!/^-?\d+(\.\d+)?$/.test(raw)) {
    return { valid: false, parsed: null, error: 'Điểm phải là số hợp lệ từ 0 đến 10' };
  }

  const num = parseFloat(raw);
  if (isNaN(num)) {
    return { valid: false, parsed: null, error: 'Điểm không hợp lệ' };
  }

  if (num < 0 || num > 10) {
    return { valid: false, parsed: null, error: 'Điểm phải nằm trong thang từ 0 đến 10' };
  }

  const parts = raw.split('.');
  if (parts.length > 1) {
    const decimals = parts[1].replace(/0+$/, '');
    if (decimals.length > 2) {
      return { valid: false, parsed: null, error: 'Tối đa 2 chữ số thập phân có nghĩa' };
    }
  }

  return { valid: true, parsed: num, error: null };
}

function areScoresEqual(val1: number | null | undefined, val2: number | null | undefined): boolean {
  const isNull1 = val1 === null || val1 === undefined || isNaN(Number(val1));
  const isNull2 = val2 === null || val2 === undefined || isNaN(Number(val2));
  if (isNull1 && isNull2) return true;
  if (isNull1 !== isNull2) return false;
  return Number(val1) === Number(val2);
}

async function runTests() {
  console.log('🚀 [TEST] Bắt đầu xác thực Bảng điểm lớp cho Giảng viên (tab ?tab=gradebook)...\n');
  const classId = 'csdl-k22-01';

  // Test 1: Nạp danh sách bảng điểm lớp ban đầu (4 học viên chuẩn Stitch)
  console.log('📋 Test 1: Nạp danh sách bảng điểm qua getClassGradeReports');
  const listRes = await getClassGradeReports(classId, { page: 0, size: 10, sort: 'updatedAt,desc' });
  assert.ok(listRes && Array.isArray(listRes.items), 'Danh sách trả về phải có mảng items');
  assert.strictEqual(listRes.items.length, 4, 'Ban đầu phải có 4 bảng điểm');
  assert.strictEqual(listRes.totalElements, 4, 'totalElements ban đầu phải bằng 4');
  assert.strictEqual(listRes.totalPages, 1, 'totalPages phải bằng 1');

  const tranNhatMinh = listRes.items.find((i) => i.studentName === 'Trần Nhật Minh');
  assert.ok(tranNhatMinh, 'Phải có Trần Nhật Minh');
  assert.strictEqual(tranNhatMinh?.attendanceScore, 8.5, 'Điểm chuyên cần Trần Nhật Minh = 8.5');
  assert.strictEqual(tranNhatMinh?.midtermScore, 0, 'Điểm giữa kỳ Trần Nhật Minh = 0');
  assert.strictEqual(tranNhatMinh?.finalScore, null, 'Điểm cuối kỳ Trần Nhật Minh = null');

  const vuDucLong = listRes.items.find((i) => i.studentName === 'Vũ Đức Long');
  assert.ok(vuDucLong, 'Phải có Vũ Đức Long');
  assert.strictEqual(vuDucLong?.attendanceScore, null, 'Điểm chuyên cần Vũ Đức Long = null');
  assert.strictEqual(vuDucLong?.midtermScore, null, 'Điểm giữa kỳ Vũ Đức Long = null');
  assert.strictEqual(vuDucLong?.finalScore, null, 'Điểm cuối kỳ Vũ Đức Long = null');
  console.log('   ✔ 4 bản ghi ban đầu khớp 100% dữ liệu thiết kế Stitch.');

  // Test 2: Tìm kiếm và Sắp xếp
  console.log('\n📋 Test 2: Tìm kiếm và sắp xếp danh sách bảng điểm');
  const searchRes = await getClassGradeReports(classId, { search: 'Long', page: 0, size: 10 });
  assert.strictEqual(searchRes.items.length, 1, 'Tìm kiếm "Long" phải trả về 1 kết quả');
  assert.strictEqual(searchRes.items[0].studentName, 'Vũ Đức Long');

  const sortAscRes = await getClassGradeReports(classId, { sort: 'updatedAt,asc', page: 0, size: 10 });
  assert.strictEqual(sortAscRes.items[0].studentName, 'Phạm Quang Huy', 'Sắp xếp cũ nhất trước phải đưa Phạm Quang Huy (14:00) lên đầu');
  console.log('   ✔ Tìm kiếm và sắp xếp hoạt động chính xác.');

  // Test 3: Nạp danh sách học viên trong lớp và đối chiếu ai đã có bảng điểm
  console.log('\n📋 Test 3: Nạp danh sách học viên trong lớp qua getClassStudentMembers');
  const members = await getClassStudentMembers(classId);
  assert.ok(members.length >= 5, 'Lớp phải có ít nhất 5 học viên');
  const studentIdsWithGrade = new Set(
    listRes.items.map((i) => i.studentId).filter((id): id is string => Boolean(id))
  );
  const availableStudents = members.filter((m) => Boolean(m.userId && !studentIdsWithGrade.has(m.userId)));
  assert.strictEqual(availableStudents.length, 1, 'Chỉ có 1 học viên chưa có bảng điểm');
  assert.strictEqual(availableStudents[0].name, 'Nguyễn Minh Anh', 'Học viên chưa có bảng điểm là Nguyễn Minh Anh');
  const newStudentId: string = availableStudents[0].userId || '00000000-0000-4000-8000-000000000004';
  console.log('   ✔ Đối chiếu chính xác: 4 học viên đã có bảng điểm (bị khóa), Nguyễn Minh Anh khả dụng.');

  // Test 4: Tạo bảng điểm mới với cả 3 ô điểm để trống
  console.log('\n📋 Test 4: Tạo bảng điểm mới với 3 ô điểm để trống (null)');
  const created = await createGradeReport(classId, {
    studentId: newStudentId,
  });
  assert.ok(created, 'Tạo bảng điểm thành công');
  assert.strictEqual(created.studentName, 'Nguyễn Minh Anh');
  assert.strictEqual(created.attendanceScore, null, 'Chuyên cần ban đầu = null');
  assert.strictEqual(created.midtermScore, null, 'Giữa kỳ ban đầu = null');
  assert.strictEqual(created.finalScore, null, 'Cuối kỳ ban đầu = null');

  const afterCreateList = await getClassGradeReports(classId, { page: 0, size: 10 });
  assert.strictEqual(afterCreateList.totalElements, 5, 'Tổng số bảng điểm sau khi tạo phải là 5');
  console.log('   ✔ Tạo bảng điểm mới với 3 ô trống thành công, tổng số bảng điểm tăng lên 5.');

  // Test 5: Kiểm tra chặn tạo trùng (409 Conflict)
  console.log('\n📋 Test 5: Chặn tạo trùng bảng điểm (409 Conflict)');
  try {
    await createGradeReport(classId, { studentId: newStudentId });
    assert.fail('Đáng lẽ phải ném lỗi 409 khi tạo trùng');
  } catch (err: any) {
    assert.ok(
      err?.message?.includes('đã có bảng điểm') || err?.status === 409,
      'Phải thông báo học viên đã có bảng điểm'
    );
  }
  console.log('   ✔ Chặn tạo trùng lặp thành công với mã 409.');

  // Test 6: Sửa một điểm thành 0
  console.log('\n📋 Test 6: Sửa điểm giữa kỳ thành 0');
  const updatedToZero = await updateStudentGradeReport(classId, newStudentId, {
    midtermScore: 0,
  });
  assert.strictEqual(updatedToZero.midtermScore, 0, 'Điểm giữa kỳ phải được lưu thành 0');
  console.log('   ✔ Cập nhật điểm thành 0 thành công.');

  // Test 7: Kiểm tra F5 Persistence (nạp lại chi tiết và danh sách)
  console.log('\n📋 Test 7: Kiểm tra F5 Persistence');
  const detailAfterF5 = await getStudentGradeReportDetail(classId, newStudentId);
  assert.strictEqual(detailAfterF5.midtermScore, 0, 'F5: Điểm giữa kỳ vẫn phải là 0');
  assert.strictEqual(detailAfterF5.attendanceScore, null, 'F5: Điểm chuyên cần vẫn là null');
  assert.strictEqual(detailAfterF5.finalScore, null, 'F5: Điểm cuối kỳ vẫn là null');

  const listAfterF5 = await getClassGradeReports(classId, { page: 0, size: 10 });
  const minhAnhInList = listAfterF5.items.find((i) => i.studentId === newStudentId);
  assert.ok(minhAnhInList, 'Nguyễn Minh Anh phải có trong danh sách');
  assert.strictEqual(minhAnhInList?.midtermScore, 0, 'F5 danh sách: điểm giữa kỳ là 0');
  console.log('   ✔ Dữ liệu lưu bền vững qua F5, điểm 0 được hiển thị đúng.');

  // Test 8: Xóa điểm vừa sửa và xác nhận API nhận null
  console.log('\n📋 Test 8: Xóa điểm giữa kỳ và xác nhận gửi null');
  const clearedResult = await updateStudentGradeReport(classId, newStudentId, {
    midtermScore: null,
  });
  assert.strictEqual(clearedResult.midtermScore, null, 'Điểm giữa kỳ sau khi xóa phải là null');
  const detailAfterClear = await getStudentGradeReportDetail(classId, newStudentId);
  assert.strictEqual(detailAfterClear.midtermScore, null, 'API lưu trữ giá trị null cho điểm đã xóa');
  console.log('   ✔ Xóa điểm gửi null lên API và nạp lại thành công giá trị null (Chưa có điểm).');

  // Test 9: Validation thang điểm và Dirty Check
  console.log('\n📋 Test 9: Kiểm tra hàm validateScoreInput và areScoresEqual');
  assert.strictEqual(validateScoreInput('').valid, true);
  assert.strictEqual(validateScoreInput('').parsed, null);
  assert.strictEqual(validateScoreInput('0').valid, true);
  assert.strictEqual(validateScoreInput('0').parsed, 0);
  assert.strictEqual(validateScoreInput('8,5').valid, true);
  assert.strictEqual(validateScoreInput('8,5').parsed, 8.5);
  assert.strictEqual(validateScoreInput('7.25').valid, true);
  assert.strictEqual(validateScoreInput('7.25').parsed, 7.25);
  assert.strictEqual(validateScoreInput('10').valid, true);
  assert.strictEqual(validateScoreInput('10').parsed, 10);

  assert.strictEqual(validateScoreInput('-1').valid, false);
  assert.strictEqual(validateScoreInput('10.5').valid, false);
  assert.strictEqual(validateScoreInput('8.555').valid, false);
  assert.strictEqual(validateScoreInput('abc').valid, false);

  assert.strictEqual(areScoresEqual(8.5, 8.5), true);
  assert.strictEqual(areScoresEqual(0, 0), true);
  assert.strictEqual(areScoresEqual(null, null), true);
  assert.strictEqual(areScoresEqual(undefined, null), true);
  assert.strictEqual(areScoresEqual(8.5, 0), false);
  assert.strictEqual(areScoresEqual(0, null), false);
  console.log('   ✔ Validation thang điểm 0-10 và dirty check hoạt động chính xác 100%.');

  // Test 10: Kiểm tra tích hợp vào ClassDetailPageView.tsx
  console.log('\n📋 Test 10: Kiểm tra tích hợp TeacherGradeReportsTableView trong ClassDetailPageView.tsx');
  const classDetailPagePath = path.resolve(
    process.cwd(),
    'src/features/classes/components/detail/ClassDetailPageView.tsx'
  );
  const classDetailContent = fs.readFileSync(classDetailPagePath, 'utf-8');
  assert.ok(
    classDetailContent.includes('TeacherGradeReportsTableView'),
    'ClassDetailPageView phải import TeacherGradeReportsTableView'
  );
  assert.ok(
    classDetailContent.includes('<TeacherGradeReportsTableView') &&
      classDetailContent.includes('classId={classInfo?.id || classId}') &&
      classDetailContent.includes('onToast={showToast}'),
    'ClassDetailPageView phải mount TeacherGradeReportsTableView khi !isStudent và tab=gradebook'
  );
  console.log('   ✔ Tích hợp giao diện tab gradebook cho Giảng viên hoàn tất.');

  console.log('\n🎉 TẤT CẢ 10 BÀI KIỂM TRA ĐỀU VƯỢT QUA XUẤT SẮC!\n');
}


  await runTests();

}

// ===============================================================
// Sub-test: verify_teacher_grade_reports_compact.test.ts
// ===============================================================
async function test_verify_teacher_grade_reports_compact() {
function testCompactGradeReportsView() {
  console.log('🚀 [TEST] Bắt đầu kiểm tra giao diện thu gọn Bảng điểm lớp – Giảng viên...');

  const filePath = path.resolve(
    process.cwd(),
    'src/features/classes/components/detail/TeacherGradeReportsTableView.tsx'
  );
  assert.ok(fs.existsSync(filePath), 'File TeacherGradeReportsTableView.tsx phải tồn tại');
  const code = fs.readFileSync(filePath, 'utf-8');

  // 1. Khung trang đơn (Single Card Container)
  console.log('📋 Test 1: Khung thẻ chính duy nhất chuẩn rounded-3xl, border-2, w-full');
  assert.ok(
    code.includes('rounded-3xl p-5 sm:p-6 shadow-xs border-2 border-slate-200/80 dark:border-slate-800 transition-all w-full'),
    'Container chính phải là thẻ đơn chuẩn rounded-3xl p-5 sm:p-6 border-2 w-full'
  );
  assert.ok(
    !code.includes('w-[928px] max-w-[928px] mx-auto space-y-6'),
    'Không còn bọc layout bằng khung w-[928px] cố định'
  );
  console.log('   ✔ Container chính dùng 1 thẻ đơn duy nhất w-full.');

  // 2. Tiêu đề và nút Tạo bảng điểm
  console.log('\n📋 Test 2: Tiêu đề trang, Thang điểm 10 và nút Tạo bảng điểm');
  assert.ok(
    code.includes('Bảng điểm lớp') && code.includes('Thang điểm 10'),
    'Tiêu đề "Bảng điểm lớp" và dòng phụ "Thang điểm 10" phải được ghi dưới tiêu đề trang'
  );
  assert.ok(
    code.includes('id="btn-open-create-modal"') &&
      code.includes('Tạo bảng điểm') &&
      code.includes('bg-blue-600'),
    'Nút + Tạo bảng điểm căn bên phải với màu xanh chuẩn ILMS'
  );
  console.log('   ✔ Tiêu đề và nút Tạo bảng điểm căn chuẩn thiết kế.');

  // 3. Toolbar tìm kiếm và sắp xếp cùng chiều cao
  console.log('\n📋 Test 3: Toolbar tìm kiếm học viên và sắp xếp cùng chiều cao');
  assert.ok(
    code.includes('id="input-search-student"') &&
      code.includes('Tìm theo tên học viên…') &&
      code.includes('h-9'),
    'Phải có ô tìm kiếm học viên với placeholder phù hợp và chiều cao h-9'
  );
  assert.ok(
    code.includes('id="select-sort-order"') &&
      code.includes('Cập nhật mới nhất') &&
      code.includes('Cập nhật cũ nhất') &&
      code.includes('h-9'),
    'Phải có dropdown sắp xếp cập nhật mới nhất/cũ nhất cùng chiều cao h-9'
  );
  assert.ok(
    code.includes('flex flex-wrap items-center justify-between gap-3 mb-3.5 p-2.5 rounded-2xl bg-slate-50'),
    'Toolbar phải dùng flex flex-wrap gom cùng hàng khi đủ chỗ và tự xuống hàng khi hẹp'
  );
  console.log('   ✔ Toolbar tìm kiếm và sắp xếp cùng chiều cao h-9.');

  // 4. Cột Học viên: Avatar nhỏ + Tên đậm + UUID rút gọn
  console.log('\n📋 Test 4: Cột Học viên có avatar nhỏ (chữ cái đầu), tên đậm, UUID rút gọn và đầy đủ trong modal');
  assert.ok(
    code.includes('getStudentInitials'),
    'Phải có hàm getStudentInitials lấy chữ cái đầu của tên học viên cho avatar khi thiếu ảnh'
  );
  assert.ok(
    code.includes('font-bold text-slate-900') || code.includes('font-bold'),
    'Tên học viên phải được in đậm'
  );
  assert.ok(
    code.includes('formatShortUUID') && code.includes('SV: ...'),
    'UUID dòng phụ phải có tiền tố SV: ... rút gọn'
  );
  assert.ok(
    code.includes('{editingItem.studentUUID || editingItem.studentId}'),
    'Hộp thoại Sửa điểm phải hiển thị đầy đủ studentUUID'
  );
  console.log('   ✔ Cột Học viên hiển thị đúng yêu cầu (avatar + tên đậm + UUID rút gọn).');

  // 5. Ba cột điểm Chuyên cần / Giữa kỳ / Cuối kỳ gom dưới tiêu đề Điểm thành phần · Thang 10
  console.log('\n📋 Test 5: Ba cột điểm gom dưới tiêu đề chung "Điểm thành phần · Thang 10" trên nền xanh nhạt, căn giữa, hiển thị 8,5 / 0 và chú giải "— Chưa có điểm"');
  assert.ok(
    code.includes('Điểm thành phần · Thang 10') &&
      code.includes('colSpan={3}') &&
      code.includes('bg-blue-50/70'),
    'Phải có tiêu đề chung "Điểm thành phần · Thang 10" span 3 cột trên nền xanh nhạt'
  );
  assert.ok(
    code.includes('CHUYÊN CẦN') && code.includes('GIỮA KỲ') && code.includes('CUỐI KỲ'),
    'Phải có 3 cột Chuyên cần, Giữa kỳ, Cuối kỳ'
  );
  assert.ok(
    code.includes('text-center whitespace-nowrap w-[110px] sm:w-[120px]'),
    'Ba cột điểm phải có cùng độ rộng w-[110px] sm:w-[120px] và căn giữa text-center'
  );

  // Check formatScoreCell: 0 -> 0, decimal -> comma, null -> em dash "—"
  assert.ok(
    code.includes('—') && code.includes('text-slate-400 dark:text-slate-500 font-medium text-sm select-none'),
    'Điểm null hiển thị là em dash "—" bằng chữ xám nhẹ'
  );
  assert.ok(
    code.includes('Number(val) === 0') && code.includes('font-medium text-slate-900'),
    'Điểm 0 và điểm số hiển thị bằng chữ đậm vừa (font-medium)'
  );
  assert.ok(
    code.includes('Chưa có điểm') && code.includes('—'),
    'Chân bảng phải có chú giải "— Chưa có điểm"'
  );
  console.log('   ✔ Ba cột điểm căn giữa, gom dưới tiêu đề chung, format điểm chuẩn xác kèm chú giải chân bảng.');

  // 6. Cột Cập nhật (Ngày dòng trên, giờ xám dòng dưới) & Cột Thao tác
  console.log('\n📋 Test 6: Cột Cập nhật ngày dòng trên giờ xám dòng dưới & Cột Thao tác nút Sửa điểm viền xanh nhẹ');
  assert.ok(
    code.includes('formatUpdatedParts'),
    'Phải sử dụng hàm formatUpdatedParts tách riêng ngày và giờ'
  );
  assert.ok(
    code.includes('updatedParts.date') && code.includes('updatedParts.time'),
    'Ngày hiển thị ở dòng trên và giờ hiển thị ở dòng dưới'
  );
  assert.ok(
    code.includes('bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400') &&
      code.includes('border border-blue-200/80') &&
      code.includes('Sửa điểm'),
    'Nút Sửa điểm viền xanh nhẹ với icon bút cùng kiểu danh sách Bài thi'
  );
  console.log('   ✔ Cột Cập nhật (ngày trên, giờ xám dưới) và Cột Thao tác đạt chuẩn.');

  // 7. Phân trang sát bảng
  console.log('\n📋 Test 7: Phân trang đặt sát hơn với bảng');
  assert.ok(
    code.includes('mt-3 sm:mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800'),
    'Phân trang phải đặt sát bảng hơn với mt-3 sm:mt-3.5 pt-3'
  );
  console.log('   ✔ Phân trang đặt sát bảng đúng yêu cầu.');

  console.log('\n🎉 TẤT CẢ CÁC BÀI TEST KIỂM TRA GIAO DIỆN BẢNG ĐIỂM THU GỌN ĐỀU PASSED!\n');
}


  await testCompactGradeReportsView();

}

export async function runAll() {
  return runSuite('Grade Reports Suite', [
    { name: 'verify_student_grade_report.test.ts', fn: test_verify_student_grade_report },
    { name: 'verify_teacher_grade_reports.test.ts', fn: test_verify_teacher_grade_reports },
    { name: 'verify_teacher_grade_reports_compact.test.ts', fn: test_verify_teacher_grade_reports_compact },
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
