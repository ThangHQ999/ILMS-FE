# Tích hợp Dữ liệu Thực API cho Trang Dashboard & Ca học Lớp học (/lesson-sessions)

**Date:** 2026-11-20  
**Status:** COMPLETE  
**Branch:** test  

## 1. Mục tiêu & Yêu cầu
Loại bỏ hoàn toàn các dữ liệu mẫu (mock data), hardcode cứng trên trang Dashboard (`/dashboard`) và trang Quản lý Ca học & Điểm danh (`/lesson-sessions`), thay thế bằng dữ liệu thật từ các endpoint Spring Boot (`docs/api-spec.md` §3.1, §6.1, §7.1, §7.3):
1. **Trang Ca học & Điểm danh (`/lesson-sessions`)**:
   - Loại bỏ hardcode `classId="CNTT-K21A"` và tiêu đề môn học tĩnh "Lập trình Web nâng cao - Next.js & TypeScript (CNTT-K21A)".
   - Tự động nạp danh sách lớp thật (`useClasses()`), cho phép chuyển đổi lớp học linh hoạt qua dropdown trên header hoặc URL query `?classId=...`.
   - Kết nối dữ liệu ca học thật (`GET /api/v1/classes/{classId}/lesson-sessions` & `GET /api/v1/users/me/timetable`), điểm danh thật (`/attendances`), phòng học thật (`/rooms`).
2. **Trang Dashboard (`/dashboard`)**:
   - **Chế độ Giảng viên (Teacher Overview)**:
     - `TeacherOverviewTopMetrics.tsx`: Thay thế số cứng (4 lớp, 185 sinh viên, 34 bài chờ chấm, 94.5% chuyên cần) bằng dữ liệu động từ `useClassKpiSummary()` và `useClasses()`.
     - `TeacherActiveCoursesSection.tsx`: Xóa bỏ mảng mock `defaultAssignedCourses` (`CS-202`, `CS-301`, `ICPC-ADV`), render danh sách các lớp học thật của giảng viên kèm liên kết trực tiếp tới `/classes/${id}` và `/lesson-sessions?classId=${id}`.
     - `TeacherTodaySessionsCard.tsx`: Tự động nạp ca dạy trong ngày/trong tuần từ `GET /api/v1/users/me/timetable` và xử lý trạng thái Empty state khi hôm nay không có ca dạy.
   - **Chế độ Sinh viên (Student View)**:
     - `getEnrolledCourses`: Nạp các môn học/lớp học đã ghi danh từ `GET /api/v1/classes?role=STUDENT` và `GET /api/v1/courses`.
     - `useDashboardData`: Chuyển từ `initialData` (chặn gọi ngầm) sang `placeholderData` để TanStack Query tự động đồng bộ dữ liệu thật từ server.

## 2. Các thay đổi chi tiết

### 2.1. Phân hệ Ca học (`src/features/lesson-sessions` & `src/app/lesson-sessions`)
- **`lesson-session.service.ts`**:
  - `getLessonSessions`: Hỗ trợ cả 2 chuẩn endpoint `/classes/{classId}/lesson-sessions` và `/classes/{classId}/lessonSessions`, kèm fallback tự động sang `/users/me/timetable`. Ánh xạ toàn bộ trường chuẩn `LessonSessionResponseDTO`.
  - `getTeacherTodaySessions`: Gọi `GET /api/v1/users/me/timetable?startDate=${today}&endDate=${today}` (kèm mở rộng 7 ngày tới nếu hôm nay chưa có ca học nào).
  - `getRooms`: Gọi `GET /api/v1/rooms` lấy danh sách phòng học thật.
  - `getAttendances` & `saveAttendances`: Hỗ trợ cả hyphenated và camelCase endpoint cho điểm danh hàng loạt.
- **`LessonSessionHeader.tsx`**:
  - Nhận props dynamic `activeClass`, `classesList`, `selectedClassId`, `onSelectClassId`.
  - Hiển thị tên lớp thật, mã lớp thật, số lượng sinh viên thật, phòng học và học kỳ thật.
  - Bổ sung Dropdown chọn lớp học trực quan trên thanh điều khiển.
  - Tính toán động tỷ lệ chuyên cần và số ca học đã hoàn thành.
- **`LessonSessionsPageView.tsx`**:
  - Gọi `useClasses()` để nạp danh sách lớp thực tế của người dùng.
  - Tự động fallback sang lớp thật đầu tiên khi người dùng truy cập trực tiếp `/lesson-sessions`.
- **`src/app/lesson-sessions/page.tsx`**:
  - Đọc `searchParams.get('classId')` bọc trong `Suspense` chuẩn Next.js App Router.

### 2.2. Phân hệ Dashboard (`src/features/dashboard`)
- **`TeacherOverviewTopMetrics.tsx`**:
  - Nối `useClassKpiSummary()` & `useClasses({ role: 'TEACHER' })`.
  - Hiển thị chính xác số lớp học đang phụ trách, tổng số sinh viên theo học, số bài tập chờ chấm điểm và tỷ lệ chuyên cần.
- **`TeacherActiveCoursesSection.tsx`**:
  - Thay thế toàn bộ mock data cũ bằng danh sách lớp học thật.
  - Xử lý 7-State Matrix: Skeleton khi đang tải, Empty Zero-Data state có nút CTA `[+ Tạo lớp học mới]` dẫn sang `/classes/create`.
- **`TeacherTodaySessionsCard.tsx`**:
  - Hiển thị ca học thực tế từ API lịch cá nhân.
  - Bổ sung Empty state thân thiện khi không có ca học trong ngày kèm nút điều hướng sang `/timetable`.
- **`dashboard.service.ts`**:
  - Viết lại hàm `getEnrolledCourses()` truy vấn trực tiếp `/classes` (role STUDENT) và `/courses`.
- **`useDashboardData.ts`**:
  - Cập nhật cơ chế `placeholderData` giúp UI hiển thị tức thì không layout shift và tự động cập nhật dữ liệu mới nhất từ server.

## 3. Kiểm thử & Đánh giá (Definition of Done)
- **TypeScript Strict (`npx tsc --noEmit`):** PASS (0 errors).
- **Next.js Production Build (`npm run build`):** PASS (35/35 routes compiled).
- **Dark/Light Mode & Responsive:** Tương thích hoàn chỉnh giao diện Google Material 3 / Gemini.
