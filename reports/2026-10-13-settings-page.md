# Xây dựng trang Cài đặt & Tùy chọn Hệ thống (Settings & Preferences)

- **Ngày thực hiện:** 2026-10-13
- **Tóm tắt kế hoạch:** Xây dựng module Cài đặt hoàn chỉnh chuẩn Feature-Driven, kế thừa layout điều hướng 2 chế độ Focus & Analytics, hỗ trợ Dark Mode, đa ngôn ngữ i18n đối xứng, phím tắt Ctrl+K và mock API DTOs.

```text
STATUS: COMPLETE
SUMMARY: Xây dựng trang Cài đặt & Tùy chọn hệ thống (/settings) với đầy đủ 6 tab chức năng (Hồ sơ, Giao diện Sáng/Tối, Thông báo đa kênh, Bảo mật 2FA & phiên, Gói Pro & Thanh toán, Trợ giúp & Thông tin), hỗ trợ tìm kiếm Ctrl+K, đồng bộ Dark mode qua next-themes, đa ngôn ngữ i18n 100% đối xứng và tương thích hoàn hảo cả 2 chế độ Focus Mode (80px) và Analytics Mode (260px/80px).
FILES:
  Created:
    - src/features/settings/types.ts
    - src/features/settings/schemas/settings.schema.ts
    - src/features/settings/services/settings.service.ts
    - src/features/settings/hooks/useSettings.ts
    - src/features/settings/hooks/useSettingsSearch.ts
    - src/features/settings/components/SaveToast.tsx
    - src/features/settings/components/modals/DeleteAccountModal.tsx
    - src/features/settings/components/modals/ChangePasswordModal.tsx
    - src/features/settings/components/tabs/ProfileTab.tsx
    - src/features/settings/components/tabs/AppearanceTab.tsx
    - src/features/settings/components/tabs/NotificationsTab.tsx
    - src/features/settings/components/tabs/SecurityTab.tsx
    - src/features/settings/components/tabs/BillingTab.tsx
    - src/features/settings/components/tabs/SupportTab.tsx
    - src/features/settings/components/SettingsNavigationTabs.tsx
    - src/features/settings/components/SettingsHeader.tsx
    - src/features/settings/components/SettingsPageView.tsx
    - src/features/settings/index.ts
    - src/app/settings/page.tsx
  Modified:
    - src/features/dashboard/components/DashboardSidebar.tsx
    - src/messages/vi.json
    - src/messages/en.json
    - TASKS.md
CHECKS: lint ✔ · typecheck ✔ (tsc --noEmit passed) · tests (browser manual verify passed) · build ✔
ASSUMPTIONS: Backend chưa có các API chi tiết cho Settings nên frontend sử dụng mock service với delay 150-200ms và schema ApiResponse<T> chuẩn, sẵn sàng cắm backend thật khi hoàn thành.
RISKS / LIMITATIONS: Không có.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Sẵn sàng kết nối API thật khi Backend cung cấp endpoint /user/profile, /user/preferences, /user/billing.
```

## Review
- **Kiến trúc:** Tuân thủ Feature-Driven Architecture (`src/features/settings`), `src/app/settings/page.tsx` là thin route được bảo vệ với Auth guard.
- **Layout:** Tương thích trực tiếp với cả 2 chế độ hiển thị Focus (80px) và Analytics (260px hoặc thu gọn 80px), tự động co giãn main content qua padding `pl-20` / `pl-[260px]`.
- **Dark Mode:** Tích hợp trực tiếp với `next-themes` thông qua `useTheme()`, các thẻ card và text đều áp dụng đầy đủ tokens `dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-slate-100`.
- **i18n:** Toàn bộ văn bản hiển thị giao diện được đưa vào `vi.json` và `en.json` dưới namespace `settings`.
- **Kiểm thử trình duyệt:** Đã kiểm thử thực tế trên `http://localhost:3000/settings`, chuyển đổi thành công Dark/Light mode, tìm kiếm tự động chuyển tab, chuyển đổi linh hoạt chế độ Focus mode.
