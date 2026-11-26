# Thiết kế lại trang `/assignments` thành Assessment Hub kiểu Google Classroom

- **Ngày:** 2026-11-24
- **Tóm tắt kế hoạch:** Xây dựng lại `/assignments` theo mô hình To-do / To-review Hub (Google Classroom) chuẩn Gemini MD3, thay thế toàn bộ mock data bằng dữ liệu thật từ API qua lớp tổng hợp ở Frontend và hỗ trợ lọc 2 cấp Lớp học → Môn học.

```text
STATUS: COMPLETE
SUMMARY: Thiết kế lại hoàn toàn trang `/assignments` thành Assessment Hub kiểu Google Classroom theo hệ thống thiết kế Gemini MD3 (`rounded-3xl`, `rounded-full`, `border-none`, tonal tokens). Loại bỏ mock data, hỗ trợ chuyển đổi vai trò (`Việc cần làm` cho Học viên vs `Cần chấm & Quản lý` cho Giảng viên), lọc 2 cấp (Lớp học → Môn học trong lớp qua `GET /api/v1/classes/{classId}/courses`), lọc theo loại (`ASSIGNMENT | QUIZ | EXAM`) và tìm kiếm. Giữ nguyên các sub-route `?tab=bank` và `?tab=proctoring`.
FILES:
  created:
    - src/features/assignments/schemas/assessment-hub.schema.ts
    - src/features/assignments/services/assessment-hub.service.ts
    - src/features/assignments/hooks/useAssessmentHub.ts
    - src/features/assignments/components/hub/AssessmentHubHeader.tsx
    - src/features/assignments/components/hub/AssessmentHubKpiBar.tsx
    - src/features/assignments/components/hub/AssessmentHubFilterBar.tsx
    - src/features/assignments/components/hub/AssessmentRowCard.tsx
    - src/features/assignments/components/hub/AssessmentGroupList.tsx
    - src/features/assignments/components/hub/AssessmentHubPageView.tsx
  modified:
    - src/features/assignments/index.ts
    - src/app/assignments/page.tsx
CHECKS: lint ✘ (package.json không có script lint) · typecheck ✔ (npx tsc --noEmit) · tests not run · build not run
ASSUMPTIONS:
  - Backend chưa có endpoint tổng hợp `GET /api/v1/users/me/assessments`, nên `assessment-hub.service.ts` tổng hợp dữ liệu trực tiếp trên Frontend từ `/classes`, `/classes/{id}/assignments`, `getMySubmissionsBatch`, `/quizzes`, `/classes/{id}/exams` và `/classes/{classId}/courses` (bỏ qua lớp có `memberStatus === 'PENDING'`).
  - Các Quiz theo `docs/api-spec.md` §10.1 chỉ gắn với `classId` và không bắt buộc có `courseId`.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm thử runtime trên trình duyệt với Backend thật và chưa chạy `npm run build`.
  - Việc tổng hợp nhiều API theo từng lớp học ở Frontend có thể phát sinh nhiều request nếu người dùng tham gia số lượng lớn lớp học; cần nâng cấp lên endpoint tổng hợp phía Backend khi mở rộng quy mô.
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Mở `http://localhost:3000/assignments` để kiểm tra giao diện thực tế (Light/Dark mode), thử chuyển đổi vai trò Student/Teacher và bộ lọc Lớp học → Môn học.
```
