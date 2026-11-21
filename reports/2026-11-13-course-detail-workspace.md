# Course Workspace Feature & Fix 404 on Subject Open

- **Date:** 2026-11-13
- **Branch:** `tung_anh_branch`
- **Goal:** Xây dựng màn hình Không gian Môn học (Course Detail Workspace) tại `/courses/[id]` khắc phục hoàn toàn lỗi 404 khi người dùng bấm "Open Subject" từ màn hình lớp học, đồng thời cung cấp đầy đủ 4 phân hệ chính: Đề cương & Bài học, Kho tài liệu học phần, Đồ thị tri thức, và Trợ lý ảo AI Socratic.

## Final Report
```text
STATUS: COMPLETE
SUMMARY: Triển khai trọn vẹn Không gian Môn học /courses/[id] chuẩn Feature-Driven Architecture kết nối backend IntelliJ và mock fallback, xóa bỏ hoàn toàn lỗi 404 khi mở môn từ tab Môn học của lớp; tích hợp 4 Tab chi tiết (Đề cương & Bài học, Tài liệu & Học liệu, Đồ thị tri thức, Trợ lý AI Socratic 24/7) kèm 2 modal thêm chương và thêm bài học.
FILES: 
  - Created: src/app/courses/[id]/page.tsx
  - Created: src/app/courses/[id]/loading.tsx
  - Created: src/features/courses/schemas/course.schema.ts
  - Created: src/features/courses/constants.ts
  - Created: src/features/courses/services/course.service.ts
  - Created: src/features/courses/hooks/useCourse.ts
  - Created: src/features/courses/components/detail/CourseDetailPageView.tsx
  - Created: src/features/courses/components/detail/CourseBanner.tsx
  - Created: src/features/courses/components/detail/CourseSyllabusTab.tsx
  - Created: src/features/courses/components/detail/CourseMaterialsTab.tsx
  - Created: src/features/courses/components/detail/CourseKnowledgeGraphTab.tsx
  - Created: src/features/courses/components/detail/CourseAiTutorTab.tsx
  - Created: src/features/courses/components/detail/CreateChapterModal.tsx
  - Created: src/features/courses/components/detail/CreateLessonModal.tsx
  - Created: src/features/courses/index.ts
  - Modified: src/features/dashboard/components/DashboardSidebar.tsx
  - Modified: src/messages/vi.json
  - Modified: src/messages/en.json
CHECKS: lint not run (missing npm script) · typecheck ✔ (0 errors) · tests not run · build not run (dev server active 200 OK)
ASSUMPTIONS: Sử dụng dữ liệu backend có sẵn (/api/v1/courses/{id}, /api/v1/courses/{id}/content) kết hợp fallback mock data khi mở các môn mock từ giao diện lớp (course-cs-202, course-cs-301, v.v.).
RISKS / LIMITATIONS: Nút tạo bài học và thêm chương lưu trữ đồng bộ local storage cho các ID mock và gọi API tương ứng khi có backend UUID.
DOCS: updated TASKS.md | created reports/2026-11-13-course-detail-workspace.md
DEPLOYMENT: not deployed | not applicable (local only, do not push to remote)
NEXT: Cho phép người dùng xem trước và yêu cầu chỉnh sửa/bổ sung các tính năng con theo mong muốn.
```

## Review
- Tuân thủ Feature-Driven Architecture: Toàn bộ domain logic nằm trong `src/features/courses/`, `src/app/courses/[id]/page.tsx` là thin route được bảo vệ bởi phiên người dùng.
- Chuẩn MD3 & Gemini Aesthetic: Tonal surfaces không viền cứng, bo góc `rounded-3xl` và các nút bấm / chip dạng `rounded-full`.
- Hỗ trợ đầy đủ Dark / Light theme.
- Đa ngôn ngữ đối xứng 100% giữa `vi.json` và `en.json`.

