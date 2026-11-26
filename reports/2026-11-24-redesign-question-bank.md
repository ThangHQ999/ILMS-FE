# Thiết kế lại trang `/assignments/question-bank` (Ngân hàng Câu hỏi chuẩn Gemini MD3)

- **Ngày:** 2026-11-24
- **Tóm tắt kế hoạch:** Xây dựng lại hoàn toàn trang `/assignments/question-bank` theo hệ thống thiết kế Gemini Material Design 3, thay thế toàn bộ dữ liệu giả trong `TeacherQuestionBankView` bằng các API thật ở mục 9 của `docs/api-spec.md`.

```text
STATUS: COMPLETE
SUMMARY: Thiết kế lại trang `/assignments/question-bank` bằng bộ component mới `QuestionBankPageView` chuẩn Gemini MD3 (`#F0F4F9`/`#FFFFFF`, `#131314`/`#1E1F20`, `rounded-3xl`, `rounded-full`, `border-none`). Kết nối đầy đủ API thật: CRUD `/api/v1/questions`, lọc đa chiều (tìm kiếm, lớp học → môn học, khái niệm, loại câu hỏi, độ khó, Bloom), `/api/v1/questions/batch`, `/api/v1/questions/import`, `/api/v1/questions/generate-ai`, quản lý `/api/v1/question-concepts`, và đẩy hàng loạt câu hỏi vào Quiz/Bài kiểm tra.
FILES:
  created:
    - src/features/assignments/schemas/question-bank.schema.ts
    - src/features/assignments/services/question-bank.service.ts
    - src/features/assignments/hooks/useQuestionBankManager.ts
    - src/features/assignments/components/question-bank/QuestionBankHeader.tsx
    - src/features/assignments/components/question-bank/QuestionBankKpiBar.tsx
    - src/features/assignments/components/question-bank/QuestionBankFilterBar.tsx
    - src/features/assignments/components/question-bank/QuestionBankCard.tsx
    - src/features/assignments/components/question-bank/QuestionEditorModal.tsx
    - src/features/assignments/components/question-bank/PushToAssessmentModal.tsx
    - src/features/assignments/components/question-bank/QuestionAiImportConceptModals.tsx
    - src/features/assignments/components/question-bank/QuestionBankPageView.tsx
  modified:
    - src/features/assignments/index.ts
    - src/app/assignments/question-bank/page.tsx
CHECKS: lint ✘ (package.json không có script lint) · typecheck ✔ (npx tsc --noEmit) · tests not run · build not run
ASSUMPTIONS:
  - Các endpoint mới trong `docs/api-spec.md` §9 (`/questions/batch`, `/questions/import`, `/questions/generate-ai`, filter `courseId`/`classId`/`bloomLevel`, quyền `QUESTION_BANK_MANAGE` cho `/question-concepts`) đã sẵn sàng trên Backend như người dùng xác nhận.
  - Khi Backend chưa trả về `stats.correctRate` hoặc `stats.discriminationIndex`, UI hiển thị trung tính `--` thay vì số giả.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm thử runtime trên trình duyệt với Backend thật và chưa chạy `npm run build`.
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Mở `http://localhost:3000/assignments/question-bank` để kiểm tra luồng tạo/sửa/xóa câu hỏi, lọc theo lớp/môn/khái niệm, AI sinh câu hỏi, import tệp và đẩy câu hỏi vào Quiz/Bài kiểm tra.
```
