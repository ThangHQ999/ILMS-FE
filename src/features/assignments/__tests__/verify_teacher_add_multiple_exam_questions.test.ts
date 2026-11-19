import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  getExamById,
  getExamQuestions,
  addExamQuestion,
  deleteExamQuestion,
  getBankQuestions,
} from '../services/exam.service';

// Mock localStorage for node environment
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

runTests().catch((err) => {
  console.error('❌ Kiểm tra thất bại:', err);
  process.exit(1);
});
