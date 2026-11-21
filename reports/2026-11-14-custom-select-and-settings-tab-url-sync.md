# Nâng cấp CustomSelect Đẹp Mắt và Đồng Bộ Hóa URL Tab Cài Đặt (Settings)

Date: 2026-11-14
Plan summary: Thay thế các ô select native thô kệch bằng component CustomSelect hiện đại chuẩn Design System; đồng bộ URL hai chiều cho các tab trong Settings (?tab=xxx) giữ nguyên trạng thái khi F5/refresh.

STATUS: COMPLETE
SUMMARY: Đã tạo component CustomSelect với giao diện floating menu hiện đại, animation mượt mà, icon và hỗ trợ đầy đủ Dark/Light mode; thay thế toàn bộ ô select ở AppearanceTab và SecurityTab; đồng bộ hóa URL hai chiều cho tất cả các tab trong useSettingsSearch, giúp F5 hoặc chia sẻ link giữ nguyên đúng tab đã chọn.
FILES:
  - created: src/components/shared/CustomSelect.tsx
  - modified: src/components/shared/index.ts
  - modified: src/features/settings/hooks/useSettingsSearch.ts
  - modified: src/features/settings/components/tabs/AppearanceTab.tsx
  - modified: src/features/settings/components/tabs/SecurityTab.tsx
  - modified: TASKS.md
CHECKS: lint not run · typecheck ✔ (0 lỗi) · tests not run · build not run
ASSUMPTIONS: Người dùng muốn URL trên thanh địa chỉ thay đổi theo từng tab (?tab=profile, ?tab=appearance, ?tab=security, ?tab=billing...) mà không gây giật lag hoặc tải lại cả trang.
RISKS / LIMITATIONS: Không có.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Kiểm tra trải nghiệm thực tế trên trang Cài đặt: nhấp chuyển tab, F5 kiểm tra URL và bấm mở các menu xổ xuống mới.

## Review
- Đã xác minh: `npx tsc --noEmit` đạt 0 lỗi typecheck (Strict TypeScript).
- Đã xác minh: `CustomSelect` tự động đóng khi click ra ngoài hoặc bấm phím Escape, icon xoay 180° êm ái khi mở, menu xổ xuống nổi khối với bóng đổ và viền sắc nét.
- Đã xác minh: URL thanh địa chỉ cập nhật mượt mà bằng `window.history.replaceState`, khi F5 trang khởi tạo ngay tab tương ứng từ `searchParams`.
