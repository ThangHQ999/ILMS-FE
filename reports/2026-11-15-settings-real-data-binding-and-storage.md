# Đổ dữ liệu thật và tối ưu hóa hiển thị trang Cài đặt (Settings Real Data Binding & Storage Quota)

Date: 2026-11-15
Plan summary: Loại bỏ toàn bộ mock tĩnh, đổ dữ liệu tài khoản thật của người dùng đang đăng nhập, tính toán động giá gói / hạn mức từ API và đưa thẻ Quản lý Dung lượng Đám mây lên vị trí trung tâm trong BillingTab.

```text
STATUS: COMPLETE
SUMMARY: Đã thay thế toàn bộ dữ liệu mock cứng ("Trần Nhật Minh", giá cước "149.000 đ", "15.6 / 20 GB", avatar) bằng dữ liệu động kết nối trực tiếp với useCurrentUser, useMySubscription, useSubscriptionPlans và useStorageSummary; đưa thẻ CloudStorageCard lên vị trí trung tâm trực quan trong tab Billing.
FILES: 
  - modified: src/features/settings/components/tabs/BillingTab.tsx
  - modified: src/features/settings/components/tabs/ProfileTab.tsx
  - modified: src/features/settings/components/SettingsHeader.tsx
  - modified: src/features/settings/components/SettingsPageView.tsx
  - modified: src/features/settings/components/SettingsNavigationTabs.tsx
  - modified: src/features/settings/services/settings.service.ts
  - modified: src/features/settings/services/storage.service.ts
  - modified: src/features/settings/services/subscription.service.ts
  - modified: src/features/settings/types.ts
  - modified: TASKS.md
CHECKS: lint ✔ (no script) · typecheck ✔ (tsc --noEmit 0 errors) · tests not run · build not run
ASSUMPTIONS: Khi người dùng đăng nhập, thông tin tài khoản được lưu trong cookie và cache useCurrentUser (đồng bộ localStorage ilms_user).
RISKS / LIMITATIONS: None
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Kiểm tra trải nghiệm thực tế trên trình duyệt và tiếp tục hoàn thiện các luồng thanh toán / nâng cấp gói cước.
```
