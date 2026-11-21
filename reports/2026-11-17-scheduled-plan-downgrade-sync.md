# Đồng bộ luồng Lên lịch Chuyển gói (Google One / Gemini Style)

- **Ngày:** 2026-11-17
- **Tóm tắt kế hoạch:** Mở rộng `mySubscriptionSchema` với `nextPlanCode`, `nextPlanName`, `nextPlanStartDate`; thêm API `POST /subscriptions/cancel-scheduled` + hook `useCancelScheduledSubscription`; hiển thị Banner thông báo kế hoạch chuyển gói kèm nút hủy trong `BillingTab.tsx`; và cập nhật thông điệp minh bạch *"Lên lịch chuyển gói sau ngày {endDate}"* khi hạ gói trong `SubscriptionPlansModal.tsx`.

```text
STATUS: COMPLETE
SUMMARY: Đồng bộ hoàn chỉnh luồng lên lịch chuyển/hạ gói từ Backend lên Frontend theo phong cách Google One / Gemini, gồm Zod schema mới, API & hook hủy lịch chuyển gói, banner thông báo trực quan trong BillingTab và thông điệp/nút bấm minh bạch khi hạ gói trong SubscriptionPlansModal.
FILES:
  created:
    - src/features/settings/utils/subscription.utils.ts
  modified:
    - src/features/settings/schemas/subscription.schema.ts
    - src/features/settings/services/subscription.service.ts
    - src/features/settings/hooks/useSubscriptions.ts
    - src/features/settings/components/tabs/BillingTab.tsx
    - src/features/settings/components/modals/SubscriptionPlansModal.tsx
    - src/messages/vi.json
    - src/messages/en.json
    - TASKS.md
CHECKS: lint not configured · typecheck ✔ (npx tsc --noEmit) · i18n parity ✔ (1899 keys) · build ✔ (npm run build, 33/33 pages)
ASSUMPTIONS:
  - Backend trả về nextPlanCode, nextPlanName, nextPlanStartDate trong GET /subscriptions/my-subscription và xóa các trường này sau khi gọi POST /subscriptions/cancel-scheduled.
  - Thứ bậc gói mặc định để xác định hạ gói là FREE < PLUS < PRO < ENTERPRISE (hoặc so sánh theo giá gói nếu có mã gói khác).
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm thử end-to-end trực tiếp với Backend đang bật lịch hạ gói thực tế trên trình duyệt.
  - Next.js 16.4.3 hiển thị cảnh báo lỗ hổng bảo mật cần nâng cấp (`next upgrade --agent=security`, hiện đang chờ dọn dung lượng ổ C:/D:).
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Kiểm thử trên /settings?tab=billing khi tài khoản đang ở gói Pro và thử chọn hạ xuống Plus để kiểm tra nút "Lên lịch chuyển gói sau ngày {endDate}", banner thông báo và nút "Hủy kế hoạch chuyển gói".
```

## Review

- **Không trùng lặp logic:** Tách `formatSubscriptionDate` và `isSubscriptionDowngrade` vào `src/features/settings/utils/subscription.utils.ts` để dùng chung cho cả `BillingTab.tsx` và `SubscriptionPlansModal.tsx`.
- **An toàn kiểu dữ liệu & ngày tháng:** `mySubscriptionSchema` dùng `.nullable().optional()` cho 3 trường mới; `formatSubscriptionDate` kiểm tra `Number.isNaN(parsed.getTime())` trước khi format và có chuỗi fallback an toàn nếu ngày trống.
- **i18n & Build:** `vi.json` và `en.json` đối xứng 100% (`1899` khóa), `npx tsc --noEmit` và `npm run build` đều đạt.
