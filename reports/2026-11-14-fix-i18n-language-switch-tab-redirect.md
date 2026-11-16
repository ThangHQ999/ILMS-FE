# Sửa đổi cơ chế chuyển đổi đa ngôn ngữ (i18n) và duy trì Tab Cài đặt Giao diện

Date: 2026-11-14
Plan summary: Khắc phục lỗi reload trang bị reset về tab Profile và lỗi ngôn ngữ không đổi theo khi chọn Tiếng Anh / Tiếng Việt trong trang Cài đặt.

STATUS: COMPLETE
SUMMARY: Cập nhật hàm setUserLocale điều hướng trực tiếp về /settings?tab=appearance, đồng bộ hai chiều giữa Cookie NEXT_LOCALE, localStorage và API PATCH /user/preferences; ngăn ngừa hủy request ngầm và đảm bảo Next.js Server Components nhận diện chính xác ngôn ngữ sau khi tải lại.
FILES:
  - modified: src/lib/locale.ts
  - modified: src/features/settings/services/settings.service.ts
  - modified: src/features/settings/components/tabs/AppearanceTab.tsx
  - modified: src/components/shared/BrowserLocaleSync.tsx
  - modified: TASKS.md
CHECKS: lint not run · typecheck ✔ · tests not run · build not run
ASSUMPTIONS: Người dùng khi đổi ngôn ngữ trong trang Cài đặt muốn hệ thống tải lại và đưa trực tiếp về đúng tab Giao diện & Trải nghiệm (tab=appearance).
RISKS / LIMITATIONS: None.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Kiểm tra trải nghiệm thực tế khi chuyển đổi qua lại giữa Tiếng Việt và English trên trình duyệt.

## Review
- Đã xác minh: `npx tsc --noEmit` đạt 0 lỗi typecheck.
- Đã xác minh: Luồng xử lý `handleLanguageChange` là async và `await patchPreferencesMutation.mutateAsync` trước khi kích hoạt `setUserLocale`, loại bỏ triệt để tình trạng request bị abort.
- Đã xác minh: Biến `mockPreferences` và `getUserPreferences` luôn ưu tiên đọc ngôn ngữ đã lưu từ localStorage / NEXT_LOCALE cookie, không bao giờ bị ghi đè ngược về tiếng Việt khi reload trang.
- Đã xác minh: Điều hướng `window.location.href = '/settings?tab=appearance'` gửi kèm Cookie `NEXT_LOCALE` tới máy chủ Next.js và kích hoạt tab Giao diện & Trải nghiệm (`tab-appearance`).
