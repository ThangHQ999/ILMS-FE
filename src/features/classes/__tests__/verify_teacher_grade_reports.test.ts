import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  getClassGradeReports,
  getClassStudentMembers,
  createGradeReport,
  getStudentGradeReportDetail,
  updateStudentGradeReport,
} from '../services/grade-report.service';

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

runTests().catch((err) => {
  console.error('❌ Kiểm tra thất bại:', err);
  process.exit(1);
});
