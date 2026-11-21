# Báo cáo: Triển khai Giao diện Quản lý Ca học & Điểm danh chuẩn EduPulse LMS Suite

- **Date:** 2026-11-05
- **Plan Summary:** Thiết kế và chuyển đổi toàn bộ 4 màn hình HTML nguyên bản sang React/Next.js TypeScript và Tailwind CSS, tích hợp liền mạch vào hệ thống ILMS (Sidebar, Header, Semantic Theme Tokens Light/Dark).

## Báo cáo thực hiện

STATUS: COMPLETE
SUMMARY: Tái hiện đầy đủ và nâng cấp toàn diện các màn hình theo đúng thiết kế mẫu:
1. Màn hình Kế hoạch ca học chi tiết (Lesson Sessions & Timetable): Tab bar điều hướng lớp học, Quick telemetry chips (Tiến độ 5/15, Chuyên cần 95.6%), Bộ lọc Date range, Lọc trạng thái, Ô tìm kiếm, Data Table đầy đủ trạng thái (Chưa điểm danh ping, Đã điểm danh, Sắp diễn ra), Sticky banner ca học hôm nay sẵn sàng điểm danh.
2. Màn hình Modal Tạo ca học mới (Create Lesson Session): Date picker, Time picker có validation thời gian thực (Giờ kết thúc > Giờ bắt đầu), Tiết học, Phòng học, Checkbox gửi email, Live Conflict Indicator.
3. Màn hình Modal Cảnh báo Xung đột Phòng học (409 Conflict): Khung cảnh báo đỏ `ROOM_SCHEDULE_CONFLICT`, Lớp học trùng, Giảng viên, Thời gian chiếm, Cụm Gợi ý thông minh (Smart Suggestions: Lab 401, Hội trường B2, Đổi khung giờ kế tiếp) với nút 1-click chọn phòng thay thế.
4. Màn hình Điểm danh chuyên sâu (High Precision Attendance Roster): Hero Banner lớp học, 4 thẻ KPI real-time (Tổng số, Có mặt, Đi muộn, Vắng mặt), Thanh tìm kiếm ⌘F, Segmented category filter tabs, Bảng điểm danh 4 nút 1-click (Có mặt - Xanh, Đi muộn - Vàng, Vắng - Đỏ, Phép - Tím), Ô ghi chú cá nhân, Nút lịch sử điểm danh, Sticky Cockpit Action Bar (Tiến độ 100%, Tỷ lệ hiện diện thực tế, Nút Lưu nháp, Nút Lưu & Chốt bảng điểm danh).

FILES:
- Created: `src/features/lesson-sessions/types.ts`
- Created: `src/features/lesson-sessions/constants.ts`
- Created: `src/features/lesson-sessions/schemas/lesson-session.schema.ts`
- Created: `src/features/lesson-sessions/services/lesson-session.service.ts`
- Created: `src/features/lesson-sessions/hooks/useLessonSessions.ts`
- Created: `src/features/lesson-sessions/components/LessonSessionHeader.tsx`
- Created: `src/features/lesson-sessions/components/LessonSessionTable.tsx`
- Created: `src/features/lesson-sessions/components/CreateSessionModal.tsx`
- Created: `src/features/lesson-sessions/components/ConflictWarningModal.tsx`
- Created: `src/features/lesson-sessions/components/AttendanceHeroBanner.tsx`
- Created: `src/features/lesson-sessions/components/AttendanceTableRow.tsx`
- Created: `src/features/lesson-sessions/components/AttendanceTable.tsx`
- Created: `src/features/lesson-sessions/components/AttendanceCockpitBar.tsx`
- Created: `src/features/lesson-sessions/components/LessonSessionsPageView.tsx`
- Created: `src/features/lesson-sessions/index.ts`
- Created: `src/app/lesson-sessions/page.tsx`
- Created: `src/app/classes/[classId]/sessions/page.tsx`
- Modified: `src/features/dashboard/components/DashboardSidebar.tsx`
- Modified: `src/messages/vi.json`, `src/messages/en.json`, `TASKS.md`

CHECKS: typecheck ✔ (TypeScript 0 errors)
NEXT: Mở `http://localhost:3000/lesson-sessions` để trải nghiệm trực tiếp.

