import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

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

testCompactGradeReportsView();
