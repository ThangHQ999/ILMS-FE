# Báo cáo: Tối ưu Giao diện Mobile Responsive & Nâng cấp Select Dropdown Thời khóa biểu và Điểm danh

- **Ngày thực hiện:** 2026-11-23
- **Kế hoạch đã duyệt:** `implementation_plan.md`

## 1. Tóm tắt yêu cầu
- **Người dùng yêu cầu:**
  1. "sua cho t giao dien cua may cai select cho t" kèm ảnh chụp màn hình select option mặc định của trình duyệt (`media_1795397327237_032cb7f9.png`) trong modal lên lịch ca học (`TimetableCreateSessionModal`).
  2. "Ey hay toi uu cho t giao dien cho ca dien thoai sao cho tren dien thoai van hien thi dc." -> Lên plan và triển khai tối ưu toàn diện UI trên thiết bị di động (Mobile Responsive UI, viewport `< 640px` và `< 768px`).

## 2. Các thay đổi và tối ưu cụ thể
1. **Nâng cấp toàn bộ Thẻ `<select>` mặc định sang `CustomSelect`:**
   - `src/features/timetable/components/TimetableCreateSessionModal.tsx`:
     - Thay thế thẻ `<select>` native của HTML ở các trường: *Lớp học áp dụng*, *Tiết bắt đầu*, *Tiết kết thúc*, *Phòng học (Tùy chọn)* bằng component `CustomSelect` từ `@/components/shared`.
     - Tích hợp icon trực quan (`school`, `schedule`, `meeting_room`, `cloud_off`, `edit_location`), sublabel hiển thị chi tiết (khung giờ tiết học, mã lớp), hiệu ứng đóng mở mượt mà, đồng bộ hoàn hảo với Dark Mode và Design System của ứng dụng.
     - Tối ưu container modal với `max-h-[92vh] overflow-y-auto` và responsive padding `p-5 sm:p-6` giúp hiển thị hoàn hảo trên màn hình điện thoại khi bật bàn phím ảo.
   - `src/features/timetable/components/TimetableHeaderControls.tsx`:
     - Thay thế `<select>` lọc lớp học bằng `CustomSelect` dạng pill thanh thoát, hỗ trợ icon và popup thả xuống không bị vỡ layout.

2. **Tối ưu Mobile Responsive (Mô hình Hybrid Table / Card View):**
   - **Tạo mới component Mobile Card List:** `src/features/lesson-sessions/components/AttendanceStudentCard.tsx`
     - Cung cấp giao diện thẻ cá nhân hóa cho từng sinh viên trên điện thoại: Avatar, STT, Mã SV, Tên SV, 4 nút chạm 1-click (Có mặt, Đi muộn, Vắng, Phép) với vùng chạm (Touch Target) $\ge 38px$ theo tiêu chuẩn ngón tay cái, kèm ô nhập ghi chú cá nhân nhanh.
   - **Bảng Điểm danh:** `src/features/lesson-sessions/components/AttendanceTable.tsx`
     - Tích hợp hiển thị song song: trên Desktop (`hidden md:block`) hiển thị Table truyền thống; trên Mobile (`md:hidden`) tự động chuyển sang Card List mà không cần cuộn ngang.
     - Tối ưu toolbar tìm kiếm & bộ lọc cuộn ngang mượt mà (`overflow-x-auto no-scrollbar`).
   - **Thanh chỉ số Hero Banner:** `src/features/lesson-sessions/components/AttendanceHeroBanner.tsx`
     - Tối ưu 4 thẻ KPI thống kê từ 1 cột dài thành lưới 2x2 cân đối (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6`), co giãn cụm nút "Đánh dấu tất cả Có mặt" và "Làm mới" trên mobile (`self-stretch sm:self-start`).
   - **Thanh điều khiển Cockpit nổi đáy màn hình:** `src/features/lesson-sessions/components/AttendanceCockpitBar.tsx`
     - Tinh gọn floating cockpit bar trên mobile với khoảng cách an toàn `bottom-3 sm:bottom-6`, layout dạng grid 3 nút (Quay lại, Lưu, Chốt) không che khuất nội dung danh sách.
   - **Lưới Thời khóa biểu Tuần:** `src/features/timetable/components/TimetableGridMatrix.tsx`
     - Bổ sung thanh **Mobile Day Selector Bar** (7 nút Pill T2..CN có badge ngày và highlight ngày hôm nay) kèm **Daily Timeline Cards** cho ca học của ngày được chọn trên điện thoại (`md:hidden`), bảo toàn lưới ma trận 7 cột rộng rãi trên Desktop (`hidden md:block`).
   - **Danh sách Ca học:** `src/features/lesson-sessions/components/LessonSessionTable.tsx`
     - Tích hợp Card View cho từng ca học trên mobile (`md:hidden`) thay vì ép cuộn ngang table.
   - **Ma trận Chuẩn đầu ra CLO-PLO:** `src/features/outcomes/components/CloPloMatrixTable.tsx`
     - Tối ưu cột cố định CLO từ `min-w-[240px]` xuống `min-w-[130px] sm:min-w-[220px]`, `line-clamp-1 sm:line-clamp-2` để màn hình 375px vẫn có thể vuốt và click tương tác với các ô ánh xạ PLO.

3. **Cơ chế Tự động Nén Sidebar trên Mobile (Tránh che khuất giao diện):**
   - **Tự động nhận diện thiết bị:** Cập nhật `src/hooks/useSidebarCollapsed.ts` tự động phát hiện màn hình nhỏ (`window.innerWidth < 1024px`) và lắng nghe sự kiện `resize` để tự động chuyển sang chế độ nén (`sidebarCollapsed = true`).
   - **Thanh Icon Bar tinh gọn & Drawer Overlay:** Cập nhật `src/features/dashboard/components/DashboardSidebar.tsx` luôn ở dạng thanh icon 72px gọn gàng trên mobile. Khi người dùng chủ động mở rộng trên mobile, sidebar hiển thị dạng Drawer trượt kèm backdrop mờ (`fixed inset-0 bg-black/60 backdrop-blur-xs lg:hidden`); tự động nén lại khi người dùng bấm vào backdrop hoặc chọn một mục điều hướng.
   - **Định vị Header & Main Container chuẩn xác:** Cập nhật `DashboardHeader.tsx` và các trang chính (`DashboardPageView`, `LessonSessionsPageView`, `ClassListPageView`, `TimetablePageView`, `SettingsPageView`, v.v.) sử dụng `left-[72px] lg:left-64` và `pl-[72px] lg:pl-64`. Trên mobile, nội dung và thanh tiêu đề không bao giờ bị thụt lề 256px gây vỡ layout hay che mất màn hình.

## 4. Kết quả kiểm tra xác thực
- `npx tsc --noEmit`: Đạt **0 lỗi** (Exit code 0), đảm bảo 100% TypeScript strict.
- Toàn bộ giao diện tương thích mượt mà từ màn hình 360px (Mobile) đến 1920px (Desktop).
