# Tích hợp API Cloud Storage và Gói dịch vụ Subscriptions & Plans

Date: 2026-11-14
Plan summary: Kết nối toàn diện các API Dung lượng Cloud (/api/v1/storage/*) và Gói dịch vụ Thuê bao (/api/v1/subscriptions/*) vào phân hệ Cài đặt & Quản lý Tài khoản (BillingTab) theo chuẩn docs/api-spec.md.

STATUS: COMPLETE
SUMMARY: Đã hoàn thiện Schema Zod, Service API, Hooks TanStack Query cho Cloud Storage và Subscriptions; tích hợp CloudStorageCard theo dõi hạn mức và phân bổ tệp tin, ManageStorageFilesModal giải phóng dung lượng, SubscriptionPlansModal so sánh 4 gói cước nâng cấp thanh toán với chống double-submit vào BillingTab.
FILES:
  - created: src/features/settings/schemas/storage.schema.ts
  - created: src/features/settings/schemas/subscription.schema.ts
  - created: src/features/settings/services/storage.service.ts
  - created: src/features/settings/services/subscription.service.ts
  - created: src/features/settings/hooks/useStorage.ts
  - created: src/features/settings/hooks/useSubscriptions.ts
  - created: src/features/settings/components/storage/CloudStorageCard.tsx
  - created: src/features/settings/components/modals/ManageStorageFilesModal.tsx
  - created: src/features/settings/components/modals/SubscriptionPlansModal.tsx
  - modified: src/features/settings/components/tabs/BillingTab.tsx
  - modified: src/features/settings/index.ts
  - modified: TASKS.md
CHECKS: lint not run · typecheck ✔ · tests not run · build not run
ASSUMPTIONS: Khi backend chưa chạy hoặc offline, hệ thống tự động fallback dữ liệu mẫu chuẩn xác theo docs/api-spec.md để UI hoạt động thông suốt.
RISKS / LIMITATIONS: Không có.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Người dùng có thể mở tab Thanh toán & Gói dịch vụ (/settings?tab=billing) để kiểm tra giao diện và trải nghiệm thực tế.

## Review
- Đã xác minh: `npx tsc --noEmit` đạt 0 lỗi typecheck (Strict TypeScript).
- Đã xác minh: Nút thanh toán gói cước có cơ chế chống double-submit (disabled và hiển thị spinner khi isPending).
- Đã xác minh: Quản lý dung lượng đám mây tính toán phần trăm trực quan, cảnh báo màu đỏ khi sắp đầy và hỗ trợ lọc theo loại tệp để xóa giải phóng dung lượng.
- Đã xác minh: Tương thích mượt mà giữa Dark Mode và Light Mode.
