# Redesign Course Workspace (Student & Teacher View)

- **Date:** 2026-11-16
- **Plan summary:** Thay thế toàn bộ giao diện Không gian Môn học (`/courses/[id]`) theo 2 mẫu HTML chuẩn của người dùng, tích hợp cơ chế chuyển đổi 2 chiều Học viên ↔ Giảng viên, 5 tab chi tiết và Socratic AI Popover.

## Status
STATUS: COMPLETE

## Summary
- Thay thế hoàn toàn giao diện cũ của Không gian môn học (`/courses/[id]`) bằng thiết kế mới hiện đại, trực quan, hỗ trợ chuyển đổi linh hoạt giữa Chế độ Học viên (Student Workspace) và Chế độ Giảng viên (Teacher Studio).
- Module hóa kiến trúc theo chuẩn Feature-Driven: tách thành các component chuyên trách dưới 150-300 dòng, không phụ thuộc thư viện ngoài chưa cài đặt (`sonner`), sử dụng hệ thống token màu, dark/light theme nhất quán.
- Triển khai đầy đủ 5 tab điều hướng và hệ thống Socratic RAG Popover:
  1. Header & Sidebar điều hướng chuẩn Bento (`CourseWorkspaceHeader.tsx`, `CourseWorkspaceSidebar.tsx`).
  2. Hero Banner đa vai trò (`CourseHeroBanner.tsx`): Học viên hiển thị Dark Hero radial pattern, Giảng viên hiển thị Thanh chỉ số Lab H6-302, tiến độ lớp 64.2%, 5 chương, 22 bài.
  3. Tab 1: Tổng quan & Bảng tin (`CourseStreamTabContent.tsx`): Cảnh báo hạn chót khẩn cấp, điểm GPA 8.6, bảng tin ghim phòng lab, widget lịch học tuần 09.
  4. Tab 2: Chương trình học (`CourseModulesTabContent.tsx`): Học viên hiển thị tiến độ 14/22 bài, tiếp tục bài 3.2, 5 chương accordion, PLO matrix; Giảng viên hiển thị Studio Command Bar (công tắc bật/tắt drag handles, xuất bản bài nháp, panel lộ trình học, AI Copilot, Audit chất lượng 94/100).
  5. Tab 3: Bài tập & Đánh giá (`CourseAssignmentsTabContent.tsx`): Học viên nộp Lab 01, xem điểm 9.5 Lab 00 kèm rubric; Giảng viên quản lý trung tâm chấm bài 48 SV dạng bảng, nhập điểm trực tiếp, xuất CSV.
  6. Tab 4: Thành viên (`CoursePeopleTabContent.tsx`): Đội ngũ TS. Lê Hoàng Nam, ThS. Nguyễn Bảo Anh, Socratic AI Copilot 24/7; lưới 48 thẻ sinh viên kèm lọc nhóm/tìm kiếm; nút chia nhóm tự động và import Excel.
  7. Tab 5: Cài đặt & Thống kê (`CourseSettingsTabContent.tsx` - Chỉ dành cho Giảng viên): 4 thẻ KPI, biểu đồ phổ điểm Gaussian SVG Chart (Đỉnh 8.5 điểm, F: 4%, C: 15%, B: 52%, A: 29%), cấu hình mã tự ghi danh và 3 checkbox phân quyền.
  8. Floating Button & Socratic AI Popover (`CourseSocraticAiPopover.tsx`): Nút nổi với hiệu ứng ping, popover drawer chat phản biện Socratic RAG trực quan.

## Files
- **Created:**
  - `src/features/courses/components/detail/CourseWorkspaceHeader.tsx`
  - `src/features/courses/components/detail/CourseWorkspaceSidebar.tsx`
  - `src/features/courses/components/detail/CourseHeroBanner.tsx`
  - `src/features/courses/components/detail/CourseStreamTabContent.tsx`
  - `src/features/courses/components/detail/CourseModulesTabContent.tsx`
  - `src/features/courses/components/detail/CourseAssignmentsTabContent.tsx`
  - `src/features/courses/components/detail/CoursePeopleTabContent.tsx`
  - `src/features/courses/components/detail/CourseSettingsTabContent.tsx`
  - `src/features/courses/components/detail/CourseSocraticAiPopover.tsx`
- **Modified:**
  - `src/features/courses/components/detail/CourseDetailPageView.tsx`

## Checks
- `lint`: skipped (no script in package.json)
- `typecheck`: ✔ (`npx tsc --noEmit` passed with 0 errors)
- `tests`: not run (no unit tests defined)
- `build`: ✔ (`npm run build` compiled 26/26 routes successfully in 14.4s)

## Assumptions
- Dữ liệu hiển thị kết hợp giữa thông tin thực tế từ `useCourse(courseId)` (mã môn, tên môn, danh sách chương bài giảng) và bộ dữ liệu phong phú theo mẫu HTML mockup người dùng cung cấp (TS. Lê Hoàng Nam, sinh viên 48, bài tập Lab 01, Gaussian distribution) để trải nghiệm thị giác luôn trọn vẹn và không bao giờ bị trống rỗng khi xem bất kỳ môn học nào.

## Risks / Limitations
- Không can thiệp vào các module Điểm danh (Attendance), Quiz (Quizzes) hay Giao/Nộp bài tập độc lập của các thành viên khác trong nhóm.

## Docs
- Updated: `TASKS.md`, `reports/2026-11-16-redesign-course-workspace.md`

## Deployment
- Not deployed (working on local branch `tung_anh_branch`).

## Next
- Chờ người dùng review và kiểm tra trực quan giao diện mới của Không gian môn học, sẵn sàng push lên nhánh `tung_anh_branch` khi có lệnh.

