# Nối API Trang Lớp học của tôi, Avatar, Profile & User Preferences

- **Ngày thực hiện:** 2026-11-14
- **Trạng thái:** COMPLETE
- **Mục tiêu:** Nối các API thực tế theo `docs/api-spec.md` cho phân hệ Lớp học của tôi, Upload Avatar, Edit Profile, và hệ thống User Preferences (`GET` & `PATCH /api/v1/user/preferences`).

---

## 1. Tóm tắt công việc đã thực hiện
1. **Trang Lớp học của tôi (`src/features/classes`):**
   - Nối API danh sách lớp `GET /api/v1/classes` phân tách 2 tab theo role: `role=TEACHER` (Đang dạy) và `role=STUDENT` (Đang học), kèm các bộ lọc `status`, `search`, `major`, `page`, `size`.
   - Nối API `GET /api/v1/classes/kpi-summary` lấy 4 chỉ số thống kê thực tế (`activeClassesCount`, `totalStudentsCount`, `pendingRequestsCount`, `ungradedAssignmentsCount`) hiển thị lên 4 thẻ KPI đầu trang.
   - Chuẩn hóa payload `POST /api/v1/classes/join-by-code` (`classCode`) kết nối trực tiếp với modal tham gia lớp bằng mã.
   - Nối `POST /api/v1/classes` tạo lớp học mới và lưu trữ/khôi phục lớp học (`DELETE /classes/{id}/soft`, `PATCH /classes/{id}/restore`).
   - Tích hợp chuẩn **Ma trận 7 trạng thái Async UI** (`Normal`, `Skeleton Loading`, `Empty Zero-Data`, `Empty Filter/Search`, `Archived Tab`, `Error + Retry`, `Background Fetching`) và thanh công cụ `StatePreviewToolbar`.

2. **Hồ sơ cá nhân & Ảnh đại diện (`src/features/settings`):**
   - Bổ sung service & hook `useUploadAvatar()` gọi `POST /api/v1/users/avatar` (hoặc `/api/v1/user/avatar`) với `multipart/form-data` (`file`), cập nhật avatar thực tế và tự động làm mới cache `['currentUser']` và `['userProfile']`.
   - Bổ sung trường Số điện thoại (`phone`) vào Form cá nhân và cập nhật `updateUserProfile` theo đúng `UpdateProfileRequestDTO` (`displayName`, `phone`, `birthDate`, `bio`).

3. **Cấu hình Người dùng (`/api/v1/user/preferences`):**
   - `GET /api/v1/user/preferences`: Tích hợp vào `DesignSystemSync.tsx` (chạy ở Root Layout). Ngay sau khi đăng nhập, hệ thống tự động tải toàn bộ cấu hình người dùng từ DB để đồng bộ màu sắc (`--color-primary`, `--color-secondary`), font chữ (`--font-sans`), theme sáng/tối, chế độ mặc định Focus/Analytics, và trạng thái Sidebar.
   - `PATCH /api/v1/user/preferences`: Tự động gửi request cập nhật cấu hình lên backend mỗi khi:
     - Đổi theme sáng/tối trong `ThemeToggle` hoặc `AppearanceTab`.
     - Đổi font chữ hiển thị trong `AppearanceTab`.
     - Bật/tắt chế độ Focus Mode vs Analytics Mode trong `useDashboardMode`.
     - Thu gọn / mở rộng Sidebar trong `DashboardSidebar`.
     - Đổi định dạng ngày, múi giờ, ngôn ngữ, hoặc độ tương phản cao.

---

## 2. Danh sách file thay đổi & tạo mới

### Files Modified:
- `src/features/classes/schemas/class.schema.ts`: Thêm `classKpiSummarySchema`, mở rộng `classFiltersSchema.role`.
- `src/features/classes/services/class.service.ts`: Thêm `getClassKpiSummary()`, chuẩn hóa `joinClassByCode()`.
- `src/features/classes/constants.ts`: Thêm `classKeys.kpiSummary()`.
- `src/features/classes/hooks/useClasses.ts`: Export `useClasses`, `useClassKpiSummary`, `useJoinClassByCode`.
- `src/features/classes/types.ts`: Export `ClassKpiSummary`.
- `src/features/classes/components/ClassListPageView.tsx`: Nối KPI thật từ backend, áp dụng 7 trạng thái Async UI, `EmptyState`, `ErrorState`, `StatePreviewToolbar`.
- `src/features/settings/types.ts`: Mở rộng `UserPreferencesDto` đầy đủ các trường cấu hình theo `api-spec.md`, cập nhật `UpdateProfileInput` có `phone`.
- `src/features/settings/services/settings.service.ts`: Thêm `uploadUserAvatar()`, `patchUserPreferences()`, chuẩn hóa `getUserProfile()` và `updateUserProfile()`.
- `src/features/settings/hooks/useSettings.ts`: Export `useUploadAvatar()`, `usePatchPreferences()`.
- `src/features/settings/components/tabs/ProfileTab.tsx`: Nối input file picker upload avatar lên API, cập nhật form profile có `phone`.
- `src/features/settings/components/tabs/AppearanceTab.tsx`: Gọi `patchUserPreferences` khi đổi theme, font, cỡ chữ, múi giờ.
- `src/components/shared/ThemeToggle.tsx`: Gọi `patchUserPreferences` lưu theme khi click toggle.
- `src/features/dashboard/hooks/useDashboardMode.ts`: Gọi `patchUserPreferences` lưu `defaultDashboardMode` khi toggle Focus/Analytics.
- `src/features/dashboard/components/DashboardSidebar.tsx`: Gọi `patchUserPreferences` lưu `sidebarCollapsed` khi toggle collapse.
- `src/components/shared/DesignSystemSync.tsx`: Gọi `GET /api/v1/user/preferences` đồng bộ màu sắc, font, mode, theme từ DB về client.

---

## 3. Kết quả kiểm tra (Checks)
- **TypeScript (`npx tsc --noEmit`):** PASS (0 errors).
- **Graceful Degradation:** Tương thích fallback mượt mà nếu backend offline hoặc mock mode.

---

## 4. Next Step
- Sẵn sàng bàn giao và hỗ trợ kiểm thử trải nghiệm người dùng trên môi trường thực tế.
