# Tối ưu hóa Kiến trúc tải trang Settings & Triệt tiêu Hardcode Gói dịch vụ (Zero Hardcoding & Performance Optimization)

Date: 2026-11-15
Plan summary: Nghiên cứu cấu trúc gọi API trang Settings, khử trùng lặp API (/user/billing), áp dụng chiến lược Caching TanStack Query (5-10 phút, refetchOnWindowFocus: false), chuẩn hóa gói mặc định là FREE (0 đ, 1.0 GB) thay vì gán cứng PRO, và sửa lỗi hiển thị phần trăm dung lượng bên Sidebar.

```text
STATUS: COMPLETE
SUMMARY: Đã tối ưu hóa toàn diện hiệu năng tải trang Settings: loại bỏ hoàn toàn API thừa /user/billing, cấu hình staleTime (5-10 phút) & refetchOnWindowFocus: false cho 100% queries trang Settings; chuyển đổi mặc định sang Gói Cơ bản (FREE - 0 đ, 1.0 GB, 20 AI câu/ngày, vĩnh viễn) thay vì hardcode PRO; lưu trạng thái nâng cấp vào localStorage/backend; sửa lỗi lặp chuỗi "0.98% 78% used" thành "Đã dùng {percent}%".
FILES:
  - modified: src/features/settings/components/tabs/BillingTab.tsx
  - modified: src/features/settings/components/SettingsNavigationTabs.tsx
  - modified: src/features/settings/schemas/subscription.schema.ts
  - modified: src/features/settings/services/subscription.service.ts
  - modified: src/features/settings/services/storage.service.ts
  - modified: src/features/settings/hooks/useSubscriptions.ts
  - modified: src/features/settings/hooks/useStorage.ts
  - modified: src/features/settings/hooks/useSettings.ts
  - modified: src/messages/vi.json
  - modified: src/messages/en.json
  - modified: TASKS.md
CHECKS: lint not run · typecheck ✔ (tsc --noEmit 0 errors) · tests not run · build not run
ASSUMPTIONS: Người dùng chưa thanh toán nâng cấp gói sẽ tự động nằm ở Gói Cơ bản (FREE); khi nâng cấp qua modal, gói mới được cập nhật lập tức và lưu trữ bền vững.
RISKS / LIMITATIONS: None
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Kiểm tra luồng thanh toán VNPay / MoMo thực tế khi người dùng click Nâng cấp gói cước.
```
