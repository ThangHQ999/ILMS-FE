# Chặn hiển thị lỗi kỹ thuật thô (`ZodError` JSON) & Fix Schema Lớp học

- **Ngày:** 2026-11-25
- **Tóm tắt kế hoạch:** Sửa lỗi `ZodError` khi tạo lớp (`createdAt`/`updatedAt` trả về `null`), xây dựng hàm chuẩn hóa thông báo lỗi `getUserFriendlyErrorMessage` để không bao giờ lộ JSON/stack kỹ thuật lên giao diện người dùng.

```text
STATUS: COMPLETE
SUMMARY: Khắc phục triệt để lỗi hiển thị chuỗi JSON `ZodError` ở màn Tạo lớp học (`createdAt`/`updatedAt`/`deletedAt` từ Backend trả về `null`), đồng thời tạo helper dùng chung `getUserFriendlyErrorMessage` để chặn mọi lỗi `ZodError`, JSON thô hoặc `Network Error` trước khi hiển thị lên UI/Toast tại các màn hình Lớp học, Ca học và Học liệu.
FILES:
  created:
    - src/lib/error-utils.ts
    - src/lib/__tests__/error-utils.test.ts
  modified:
    - src/features/classes/schemas/class.schema.ts
    - src/features/classes/schemas/class-detail.schema.ts
    - src/features/classes/components/CreateClassPageView.tsx
    - src/features/classes/components/CreateClassModal.tsx
    - src/features/classes/components/JoinClassModal.tsx
    - src/features/lesson-sessions/components/SessionFormModal.tsx
    - src/features/materials/DraftGraphEditor.tsx
    - src/features/materials/MaterialsWorkspace.tsx
CHECKS: lint ✘ (package.json không có script lint) · typecheck ✔ (npx tsc --noEmit) · tests ✔ (npx tsx --test src/lib/__tests__/error-utils.test.ts — 3/3 pass) · build not run
ASSUMPTIONS:
  - Các thông báo lỗi nghiệp vụ từ `ApiError` (không chứa JSON hoặc từ khóa kỹ thuật) vẫn được giữ nguyên để người dùng biết đúng lý do (ví dụ mã lớp đã tồn tại).
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm thử lại trực tiếp trên trình duyệt với Backend thật; các file còn lại trong `courses`/`assignments`/`knowledge-graph` nếu cần đồng bộ thêm có thể gọi tiếp `getUserFriendlyErrorMessage`.
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Thử tạo lớp học mới trên giao diện để xác nhận không còn lỗi `createdAt`/`updatedAt` và không còn hiện JSON thô.
```
