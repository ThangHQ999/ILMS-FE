# Tích hợp Dữ liệu Thực API và Tính năng Thêm Ca học cho Thời khóa biểu (Timetable Integration)

**Date:** 2026-11-20  
**Status:** COMPLETE  
**Branch:** test  

## 1. Mục tiêu & Yêu cầu
Triển khai kết nối API thời khóa biểu thật và chức năng thêm ca học mới theo yêu cầu người dùng và đặc tả tại `docs/api-spec.md` (§3.1 và §7.3):
- Lấy lịch cá nhân theo tuần: `GET /api/v1/users/me/timetable?startDate=&endDate=&classId=&courseId=`
- Lấy lịch buổi học theo lớp: `GET /api/v1/classes/{classId}/lesson-sessions`
- Tạo ca học mới (buổi học chính khóa / ca dạy bù): `POST /api/v1/classes/{classId}/lesson-sessions`
- Bắt lỗi trùng lịch phòng học (HTTP 409 `ROOM_SCHEDULE_CONFLICT`) và hiển thị thông báo thân thiện.

## 2. Các thay đổi thực hiện

### 2.1. Schema & Data Types (`timetable.schema.ts`, `types.ts`)
- Định nghĩa `rawLessonSessionResponseSchema`: Bắt trọn vẹn cấu trúc response của Spring Boot DTO (`id`, `lessonSessionId`, `classId`, `className`, `courseId`, `courseName`, `roomName`, `sessionDate`, `startShift`, `endShift`, `startTime`, `endTime`, `status`, `attendedCount`, v.v.).
- Định nghĩa `createLessonSessionSchema`: Kiểm chuẩn payload tạo ca học mới với `classId`, `sessionDate`, `startShift`, `endShift`, `roomId`, `roomName`, `courseId`, `note`.

### 2.2. Service Layer (`timetable.service.ts`)
- `fetchMyTimetable`: Gọi `GET /api/v1/users/me/timetable` với dynamic start/end date của tuần học.
- `fetchClassLessonSessions`: Gọi `GET /api/v1/classes/{classId}/lesson-sessions` (kèm fallback alias `/classes/{classId}/lessonSessions`).
- `createLessonSession`: Gọi `POST /api/v1/classes/{classId}/lesson-sessions`, xử lý lỗi 409 `ROOM_SCHEDULE_CONFLICT` với thông điệp rõ ràng cho giảng viên, đồng thời lưu trữ cache client-side `localStorage`.
- `mapRawSessionToTimetableSession`: Ánh xạ an toàn từ raw DTO sang UI model `TimetableSession`, tự động phân loại `sessionType` (`lab`, `theory`, `exam`) và `tag`.
- `getWeeklyTimetable`: Tích hợp đa nguồn dữ liệu, tính toán KPI tuần thực tế và dự phòng template học thuật chuẩn khi tuần mới chưa có dữ liệu backend.

### 2.3. Query & Mutation Hook (`useWeeklyTimetable.ts`)
- Chuyển đổi toàn diện sang TanStack Query `useQuery` với query key factory chuẩn mực: `timetableKeys.weekly(currentWeek, selectedClassId, selectedCourseId)`.
- Bổ sung `useMutation` cho `createLessonSession`, tự động invalidate query cache khi tạo ca học thành công và kích hoạt toast thông báo.
- Expose đầy đủ trạng thái `selectedClassId`, `setSelectedClassId`, `isCreateModalOpen`, `setIsCreateModalOpen`, `isLoading`, `isFetching`.

### 2.4. UI Components
- **`TimetableCreateSessionModal.tsx`**:
  - Modal tạo ca học mới dành riêng cho Giảng viên.
  - Chọn lớp học từ danh sách thực tế (`useClasses`).
  - Chọn ngày học với datepicker.
  - Chọn tiết học bắt đầu và kết thúc (Tiết 1..12 theo chuẩn ca học Việt Nam), tự động đồng bộ khung giờ.
  - Chọn phòng học từ danh sách phòng thực hành/lý thuyết hoặc nhập tên phòng tùy biến.
  - Banner cảnh báo lỗi xung đột phòng trực quan, nút submit kèm loading spinner.
- **`TimetableHeaderControls.tsx`**:
  - Bổ sung nút CTA `+ Thêm ca học` khi người dùng là Giảng viên.
  - Bổ sung dropdown lọc theo từng Lớp học cụ thể hoặc "Tất cả các lớp".
- **`TeacherWeeklyTimetableView.tsx`**:
  - Kết nối hook `useUserRole` (nhận diện `isTeacher`) và `useClasses`.
  - Gắn kết `selectedClassId`, `isCreateModalOpen`, `createSessionMutation` và mount `<TimetableCreateSessionModal>`.
  - Áp dụng hiệu ứng background fetching `opacity-70` loại bỏ giật lag layout (Layout Thrashing).

## 3. Kiểm thử & Đánh giá (Definition of Done)
- **TypeScript strict (`npx tsc --noEmit`):** PASS (0 errors).
- **Production Build (`npm run build`):** PASS (35/35 routes compiled successfully).
- **Responsive & Dark/Light mode:** Tương thích hoàn chỉnh với theme Google Material 3 / Gemini.
- **Đa ngôn ngữ (i18n):** Tương thích đầy đủ `vi.json` và `en.json`.
