# Tái cấu trúc UX Trang Lớp học của tôi (`/classes`)

- **Ngày:** 2026-11-17
- **Tóm tắt kế hoạch:** Dọn Global Header (`DashboardHeader` & `UserMenuDropdown`), đặt sẵn 2 nút hành động chính cạnh nhau kèm menu `⋮` Xuất báo cáo trong `ClassHeroSection`, chuyển sang 3 tab vai trò (`Đang giảng dạy`, `Đang theo học`, `Đã lưu trữ`) với Smart Default & ẩn KPI khi `0` lớp, ẩn dropdown vai trò ở tab Đang theo học, và tách rạch ròi Empty State (`totalInCurrentTab === 0`) với Search Not Found (`totalInCurrentTab > 0 && hasActiveFilters`).

```text
STATUS: COMPLETE
SUMMARY: Hoàn thiện tái cấu trúc trang /classes theo đúng 4 điểm chốt: làm gọn Global Header, đặt sẵn 2 nút Tham gia bằng mã & Tạo lớp học kèm menu ⋮ Xuất báo cáo, tổ chức 3 tab vai trò kèm Smart Default và KPI động (ẩn khi 0 lớp), ẩn lọc vai trò ở tab Đang theo học và tách đúng Empty State theo ngữ cảnh.
FILES:
  modified:
    - src/features/dashboard/components/DashboardHeader.tsx
    - src/features/dashboard/components/UserMenuDropdown.tsx
    - src/features/classes/components/ClassHeroSection.tsx
    - src/features/classes/components/ClassFilterToolbar.tsx
    - src/features/classes/components/ClassListPageView.tsx
    - TASKS.md
CHECKS: lint not configured · typecheck ✔ (npx tsc --noEmit) · build ✔ (npm run build, 33/33 pages)
ASSUMPTIONS:
  - Khi người dùng có 0 lớp giảng dạy nhưng có lớp theo học, tab Đang giảng dạy được ẩn đi và tự động mở thẳng tab Đang theo học (nếu tạo lớp mới thành công, tab Đang giảng dạy tự hiện và chuyển sang đó).
  - Hàng KPI chỉ hiển thị ở tab Đang giảng dạy / Đang theo học khi số lớp > 0.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm thử trực quan trên trình duyệt ở các kịch bản (0 lớp, chỉ có lớp học, có cả lớp dạy & lớp học).
  - Next.js 16.4.3 hiển thị cảnh báo lỗ hổng bảo mật cần nâng cấp (đang chờ dọn dung lượng ổ C:/D:).
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Mở /classes trên trình duyệt để kiểm tra Smart Default, KPI động, bộ lọc theo tab và Empty State.
```

## Review

- **Global Header sạch hơn:** `DashboardHeader` hỗ trợ `showFocusMode` (mặc định `true`, tắt ở `/classes`) và `showRoleSwitcher` (mặc định `false` để bỏ badge vai trò lặp trên thanh trên cùng); `UserMenuDropdown` chỉ giữ Avatar + Tên ở nút trigger.
- **Smart Default & Tab State:** `ClassListPageView` tải song song dữ liệu 3 tab (`TEACHER`, `STUDENT`, `ARCHIVED`) bằng TanStack Query cached, chọn tab thông minh một lần khi tải xong và lưu lựa chọn cuối vào `ilms_classes_last_tab`.
- **Empty State đúng ngữ cảnh:** Chỉ hiển thị `ClassSearchNotFoundState` + nút Xóa bộ lọc khi `totalInCurrentTab > 0 && items.length === 0 && hasActiveFilters`; khi `totalInCurrentTab === 0` luôn hiển thị `ClassEmptyState` tương ứng với tab đang chọn.
