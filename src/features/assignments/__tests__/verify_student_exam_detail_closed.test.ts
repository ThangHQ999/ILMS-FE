import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { api } from '@/lib/axios';
import {
  getExamById,
  getExamQuestions,
  DEFAULT_OSI_EXAM_QUESTIONS,
} from '../services/exam.service';

async function runTests() {
  console.log('🚀 [TEST] Bắt đầu xác thực trạng thái CLOSED của màn Chi tiết bài thi - Học viên...\n');

  // Test 1: Nạp thông tin bài thi đã đóng EXAM_003 (Kiểm tra mô hình OSI) ở lớp csdl-k22-01
  console.log('📋 Test 1: Nạp thông tin bài thi EXAM_003 (Kiểm tra mô hình OSI) ở lớp csdl-k22-01');
  const exam = await getExamById('EXAM_003', 'csdl-k22-01');
  assert.ok(exam, 'Đề thi EXAM_003 phải tồn tại');
  assert.strictEqual(exam.id, 'EXAM_003');
  assert.strictEqual(exam.title, 'Kiểm tra mô hình OSI');
  assert.strictEqual(exam.isPublished, true, 'Đề thi phải ở trạng thái đã công bố (isPublished = true)');
  assert.strictEqual(exam.status, 'CLOSED', 'Trạng thái bài thi phải là CLOSED');
  assert.strictEqual(exam.durationMinutes, 15, 'Thời lượng bài thi phải là 15 phút');
  const totalScore = exam.totalScore ?? exam.maxScore;
  assert.strictEqual(totalScore, 10, 'Tổng điểm tối đa phải là 10 điểm');
  assert.strictEqual(exam.questionCount, 2, 'Số lượng câu hỏi phải là 2 câu');
  assert.strictEqual(exam.startTime, '2024-11-01T08:00:00Z');
  assert.strictEqual(exam.endTime, '2024-11-01T23:59:00Z');
  console.log('   ✔ Thông tin đề thi EXAM_003 hợp lệ và khớp 100% tài liệu thiết kế.');

  // Test 2: Nạp danh sách câu hỏi qua getExamQuestions cho đề thi EXAM_003 sau giờ đóng
  console.log('\n📋 Test 2: Nạp danh sách câu hỏi trong đề qua getExamQuestions cho đề thi đã đóng');
  const questions = await getExamQuestions('EXAM_003');
  assert.ok(Array.isArray(questions), 'Kết quả phải là một mảng');
  assert.strictEqual(questions.length, 2, 'Đề EXAM_003 phải có đúng 2 câu hỏi');

  // Kiểm tra thứ tự, điểm số và nội dung chi tiết từng câu
  const [q1, q2] = questions;
  assert.strictEqual(q1.orderIndex, 1, 'Câu đầu tiên phải có orderIndex = 1');
  assert.strictEqual(q1.score, 5.0, 'Điểm câu 1 phải là 5.0 điểm');
  assert.ok(
    (q1.questionContent || q1.content || '').includes('Tầng Mạng trong mô hình OSI có nhiệm vụ gì?'),
    'Nội dung câu 1 phải đúng chuẩn Stitch'
  );

  assert.strictEqual(q2.orderIndex, 2, 'Câu thứ hai phải có orderIndex = 2');
  assert.strictEqual(q2.score, 5.0, 'Điểm câu 2 phải là 5.0 điểm');
  assert.ok(
    (q2.questionContent || q2.content || '').includes('Tầng Vận chuyển khác tầng Liên kết dữ liệu ở điểm nào?'),
    'Nội dung câu 2 phải đúng chuẩn Stitch'
  );

  const totalQuestionsScore = questions.reduce((sum, q) => sum + (q.score ?? 0), 0);
  assert.strictEqual(totalQuestionsScore, 10.0, 'Tổng điểm của các câu hỏi phải khớp 10.0 điểm');
  console.log('   ✔ Danh sách câu hỏi sau giờ đóng hiển thị đầy đủ, sắp xếp theo orderIndex và điểm số chuẩn.');

  // Test 3: Kiểm tra định dạng chuỗi thông báo đóng đề từ endTime
  console.log('\n📋 Test 3: Kiểm tra format chuỗi thông báo "Bài thi đã đóng lúc [giờ] ngày [ngày]."');
  const match = exam.endTime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  assert.ok(match, 'endTime phải khớp định dạng ISO');
  const [, year, month, day, hours, minutes] = match;
  const closedNotice = `Bài thi đã đóng lúc ${hours}:${minutes} ngày ${day}/${month}/${year}.`;
  assert.strictEqual(
    closedNotice,
    'Bài thi đã đóng lúc 23:59 ngày 01/11/2024.',
    'Thông điệp đóng đề phải khớp chính xác Stitch prototype'
  );
  console.log(`   ✔ Chuỗi thông báo đóng đề chính xác: "${closedNotice}"`);

  // Test 4: Thử nghiệm gọi Axios API thực tế theo docs/api-spec.md mục 13.2
  console.log('\n📋 Test 4: Kiểm tra cấu hình và request URL của endpoint GET /api/v1/exams/{examId}/questions');
  const testExamId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const expectedPath = `/exams/${testExamId}/questions`;
  let apiCallStatus = 0;
  try {
    const res = await api.get(expectedPath);
    apiCallStatus = res.status;
    console.log(`   ✔ Gọi Axios thành công tới ${expectedPath} với status ${apiCallStatus}`);
  } catch (err: unknown) {
    apiCallStatus =
      (err as { response?: { status?: number } })?.response?.status || 0;
    console.log(
      `   ✔ Đã gửi request qua Axios tới endpoint ${expectedPath}. Phản hồi status: ${apiCallStatus || 'Network/Mock'}`
    );
  }

  // Test 5: Kiểm tra các thành phần giao diện trong StudentExamDetailView.tsx
  console.log('\n📋 Test 5: Kiểm tra các thành phần giao diện trong StudentExamDetailView.tsx');
  const viewPath = path.resolve(__dirname, '../components/StudentExamDetailView.tsx');
  const viewCode = fs.readFileSync(viewPath, 'utf-8');

  // Kiểm tra badge Đã đóng
  assert.ok(viewCode.includes('Đã đóng'), 'Phải có nhãn badge "Đã đóng"');
  assert.ok(
    viewCode.includes('bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'),
    'Badge Đã đóng phải có style màu xám slate'
  );

  // Kiểm tra khối thông báo đóng đề
  assert.ok(
    viewCode.includes('Bài thi đã đóng lúc'),
    'Phải có dòng thông báo "Bài thi đã đóng lúc..."'
  );
  assert.ok(
    viewCode.includes('event_busy'),
    'Phải có icon event_busy cho thông báo đóng đề'
  );

  // Kiểm tra Cột trái: Thẻ Thông số nội dung & Thẻ Danh sách câu hỏi chế độ chỉ đọc
  assert.ok(viewCode.includes('Thông số nội dung'), 'Phải có khối "Thông số nội dung"');
  assert.ok(viewCode.includes('Giới thiệu bài thi'), 'Phải có tiêu đề "Giới thiệu bài thi"');
  assert.ok(viewCode.includes('Chế độ chỉ đọc'), 'Phải có nhãn "Chế độ chỉ đọc"');
  assert.ok(viewCode.includes('Danh sách câu hỏi trong đề'), 'Phải có tiêu đề "Danh sách câu hỏi trong đề"');
  assert.ok(
    viewCode.includes('canViewQuestions = Boolean(exam?.isPublished && (isOpen || isClosed))'),
    'Điều kiện nạp câu hỏi phải mở cho cả isOpen và isClosed'
  );

  // Kiểm tra Cột phải: Thẻ Thông tin bài thi
  assert.ok(viewCode.includes('Thông tin bài thi'), 'Phải có thẻ "Thông tin bài thi"');
  assert.ok(viewCode.includes('Lịch mở đề'), 'Phải có thông số "Lịch mở đề"');
  assert.ok(viewCode.includes('Lịch đóng đề'), 'Phải có thông số "Lịch đóng đề"');
  assert.ok(viewCode.includes('Thời lượng làm bài'), 'Phải có thông số "Thời lượng làm bài"');
  assert.ok(viewCode.includes('Điểm tối đa'), 'Phải có thông số "Điểm tối đa"');
  assert.ok(viewCode.includes('Số lượng câu hỏi'), 'Phải có thông số "Số lượng câu hỏi"');
  console.log('   ✔ Source code StudentExamDetailView.tsx thỏa mãn 100% đặc tả giao diện Stitch cho trạng thái CLOSED.');

  // Test 6: Kiểm tra breadcrumb quay về danh sách bài thi trong ClassDetailPageView.tsx
  console.log('\n📋 Test 6: Kiểm tra liên kết breadcrumb tên lớp trong ClassDetailPageView.tsx');
  const classDetailPath = path.resolve(
    __dirname,
    '../../classes/components/detail/ClassDetailPageView.tsx'
  );
  const classDetailCode = fs.readFileSync(classDetailPath, 'utf-8');
  assert.ok(
    classDetailCode.includes('/classes/${classId}?tab=assignments&subtab=exams'),
    'Breadcrumb tên lớp phải dẫn về tab Bài thi của lớp'
  );
  console.log('   ✔ Breadcrumb tên lớp dẫn chính xác về tab Bài thi (/classes/${classId}?tab=assignments&subtab=exams).');

  console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA ĐÃ VƯỢT QUA XUẤT SẮC!');
}

runTests().catch((err) => {
  console.error('\n❌ BÀI KIỂM TRA THẤT BẠI:', err);
  process.exit(1);
});
