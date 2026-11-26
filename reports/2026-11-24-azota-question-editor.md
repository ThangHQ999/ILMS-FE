# Trình soạn bộ câu hỏi kiểu Azota (`/assignments/question-bank/azota-editor`)

- **Ngày:** 2026-11-24
- **Tóm tắt kế hoạch:** Xây dựng giao diện 2 cột kiểu Azota cho phép copy-paste hoặc gõ hàng loạt câu hỏi, xem trước và chọn đáp án đúng trực tiếp theo thời gian thực, hỗ trợ bảng đáp án nhanh (`1A 2BC 3D`) và lưu một lượt vào Ngân hàng câu hỏi / Quiz / Bài kiểm tra.

```text
STATUS: COMPLETE
SUMMARY: Triển khai trình soạn bộ câu hỏi kiểu Azota tại `/assignments/question-bank/azota-editor` và gắn nút "Soạn kiểu Azota" trên header Ngân hàng câu hỏi. Hỗ trợ Live Parser real-time (`Câu 1:`, `1.`, `*A.`, `Đáp án: ...`, `Giải thích: ...`), Bảng đáp án nhanh (`1B 2AB 3C`), click chọn đáp án trực tiếp trên thẻ Preview, cảnh báo câu hỏi lỗi, lưu hàng loạt qua `POST /api/v1/questions/batch` và đẩy thẳng vào Quiz/Bài kiểm tra.
FILES:
  created:
    - src/features/assignments/utils/azota-question-parser.ts
    - src/features/assignments/components/question-bank/AzotaPreviewCard.tsx
    - src/features/assignments/components/question-bank/AzotaEditorSplitView.tsx
    - src/app/assignments/question-bank/azota-editor/page.tsx
    - src/features/assignments/__tests__/azota-parser.test.ts
  modified:
    - src/features/assignments/components/question-bank/QuestionBankHeader.tsx
    - src/features/assignments/index.ts
CHECKS: lint ✘ (package.json không có script lint) · typecheck ✔ (npx tsc --noEmit) · tests ✔ (npx tsx --test src/features/assignments/__tests__/azota-parser.test.ts — 2/2 pass) · build not run
ASSUMPTIONS:
  - Mỗi câu trắc nghiệm hỗ trợ tối đa 4 phương án (A–D) tương ứng các cột `option_a..option_d` của bảng `questions` ở Backend.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm thử runtime trên trình duyệt với Backend thật và chưa chạy `npm run build`.
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Mở `http://localhost:3000/assignments/question-bank/azota-editor`, dán thử đề thi mẫu và bấm lưu hàng loạt vào Ngân hàng câu hỏi.
```
