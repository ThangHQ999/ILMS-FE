# Thiết kế lại tab Bài tập trong Chi tiết Lớp học (`/classes/[id]?tab=assignments`)

- **Ngày:** 2026-11-25
- **Tóm tắt kế hoạch:** Khắc phục màn hình trống `"Chọn lớp và môn để xem nội dung."` và nâng cấp toàn bộ giao diện `ClassworkWorkspace` & `ClassworkPanel` theo chuẩn Gemini Material Design 3.

```text
STATUS: COMPLETE
SUMMARY: Thiết kế lại tab `?tab=assignments` (và header `?tab=gradebook`) trong Chi tiết Lớp học tại `ClassworkWorkspace.tsx` và `ClassworkPanel.tsx`. Tự động chọn môn học đầu tiên khi lớp đã có môn (thay vì đứng ở màn hình trống), hiển thị EmptyState dẫn sang tab Môn học khi lớp chưa có môn nào, thay `<select>` thô bằng `CustomSelect` trong thẻ Gemini MD3, bổ sung bộ lọc theo loại nội dung (`Lời nhắn`, `Bài tập`, `Quiz`, `Bài kiểm tra`), tìm kiếm, menu `+ Tạo` 4 loại và thẻ hiển thị tonal badges chuẩn Material Design 3.
FILES:
  modified:
    - src/features/assignments/components/classwork/ClassworkWorkspace.tsx
    - src/features/assignments/components/classwork/ClassworkPanel.tsx
CHECKS: lint ✘ (package.json không có script lint) · typecheck ✔ (npx tsc --noEmit) · tests not run · build not run
ASSUMPTIONS:
  - Khi lớp học có từ 1 môn học trở lên đang hoạt động (`ACTIVE`), tab Bài tập tự động chọn môn đầu tiên (`courses[0]`) nếu URL chưa truyền `courseId`.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm thử runtime trên trình duyệt với Backend thật và chưa chạy `npm run build`.
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Mở lại `http://localhost:3000/classes/9f793420-f43d-4eac-8e89-7cc146359733?tab=assignments` để kiểm tra giao diện mới.
```
