# Thiết kế lại trang tạo Quiz theo phong cách Azota & Tự động chia điểm

- **Date:** 2026-11-26
- **Plan summary:** Nâng cấp trang tạo Quiz/Exam (`/classes/[classId]/assignments/new?type=QUIZ`) theo giao diện Azota gồm thẻ câu hỏi đầy đủ đáp án A/B/C/D, tab dán văn bản nhanh chuẩn Azota, bảng điều hướng câu hỏi 5 cột bên phải và tùy chọn tự động chia đều điểm theo thang điểm tối đa.

STATUS: COMPLETE
SUMMARY: Đã thiết kế lại giao diện tạo Quiz/Exam theo phong cách Azota với thẻ câu hỏi hiển thị đầy đủ nội dung và đáp án A/B/C/D (tô xanh đáp án đúng), nút đổi thứ tự lên/xuống, tab "Soạn nhanh Azota" dán văn bản hàng loạt + bảng đáp án nhanh ngay trong trang, bảng lưới số câu hỏi 5 cột (`01`, `02`, ...) cố định ở cột phải để cuộn nhanh, và checkbox "Tự động chia đều điểm" tự động tính lại điểm mỗi câu theo `maxScore` (làm tròn 2 chữ số thập phân, dồn phần dư vào câu cuối).
FILES:
- Created: `src/features/classes/utils/distribute-points.ts`
- Created: `src/features/classes/__tests__/distribute-points.test.ts`
- Created: `src/features/classes/components/detail/AzotaQuizQuestionList.tsx`
- Created: `src/features/classes/components/detail/AzotaInlinePasteTab.tsx`
- Modified: `src/features/assignments/index.ts`
- Modified: `src/features/classes/components/detail/QuizQuestionPickerPanel.tsx`
- Modified: `src/features/classes/components/detail/CreateClassworkPageView.tsx`
- Modified: `TASKS.md`
CHECKS: lint ✘ (package.json không có script lint) · typecheck ✔ (`npx tsc --noEmit`) · tests ✔ (`npx tsx --test src/features/classes/__tests__/distribute-points.test.ts`, 3/3 pass) · build not run
ASSUMPTIONS:
- Tùy chọn "Tự động chia đều điểm" mặc định bật (`true`) khi tạo đề mới, và tự tắt (`false`) khi mở chỉnh sửa bản nháp cũ để không ghi đè điểm thủ công đã lưu.
- Phần dư làm tròn (ví dụ 10 điểm / 3 câu -> `3.33, 3.33, 3.34`) được cộng vào câu cuối để tổng điểm luôn khớp chính xác `maxScore`.
RISKS / LIMITATIONS:
- `[NOT VERIFIED]` Chưa kiểm thử trực quan trên trình duyệt thực tế với dữ liệu backend thật; cần mở trang tạo Quiz để kiểm tra lại khoảng cách hiển thị ở chế độ sáng/tối và thao tác lưu đề thật.
- Khi tải lại bản nháp `EXAM` cũ, API `getExamQuestions` không trả danh sách đáp án chi tiết nên thẻ câu hỏi chỉ hiển thị nội dung câu hỏi và điểm; khi thêm mới từ Ngân hàng câu hỏi, Soạn nhanh Azota hoặc Soạn lẻ thì hiển thị đầy đủ các phương án A/B/C/D.
DOCS: updated `TASKS.md`
DEPLOYMENT: not deployed
NEXT: Mở trang tạo Quiz trên trình duyệt để kiểm tra thực tế thao tác dán đề Azota, bật/tắt tự động chia điểm và lưu bài.
