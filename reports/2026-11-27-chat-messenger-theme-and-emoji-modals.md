# Messenger-Style Chat Theme & Emoji Picker Modals

- **Date:** 2026-11-27
- **Plan Summary:** Rút gọn `AppearanceSettingsPanel` thành 2 nút kiểu Messenger ("Đổi chủ đề" & "Thay đổi biểu tượng cảm xúc"), nâng cấp `ChatThemePreviewModal` thành modal 2 cột (danh sách + xem trước), và tạo mới `ChatEmojiPickerModal` có tìm kiếm + 8 nhóm biểu tượng cảm xúc đa ngôn ngữ `vi`/`en`.

```text
STATUS: COMPLETE
SUMMARY: Đã thiết kế lại mục Tùy chỉnh đoạn chat (AppearanceSettingsPanel) thành 2 nút gọn: "Đổi chủ đề" mở ChatThemePreviewModal dạng 2 cột (danh sách 6 chủ đề bên trái + khung xem trước tin nhắn trực quan bên phải) và "Thay đổi biểu tượng cảm xúc" mở ChatEmojiPickerModal có ô tìm kiếm tiếng Việt có/không dấu & tiếng Anh, mục Phổ biến + nút Mặc định, và thanh chọn 8 danh mục emoji bên dưới; toàn bộ text đã được đa ngôn ngữ hóa đối xứng vi/en.
FILES: created src/features/chat/constants/chat-emojis.ts, src/features/chat/components/modals/ChatEmojiPickerModal.tsx, reports/2026-11-27-chat-messenger-theme-and-emoji-modals.md · modified src/features/chat/components/modals/ChatThemePreviewModal.tsx, src/features/chat/components/drawer/AppearanceSettingsPanel.tsx, src/features/chat/__tests__/chat-themes.test.ts, src/messages/vi.json, src/messages/en.json, TASKS.md
CHECKS: lint not run · typecheck ✔ · tests ✔ (17/17 chat unit tests + 3723 i18n keys symmetry) · build not run (after these UI edits)
ASSUMPTIONS: Vẫn giữ nguyên phần cài đặt quản trị nhóm (đổi tên, ảnh bìa, chế độ chỉ đọc) ở phía dưới cho Quản trị viên nhóm/kênh.
RISKS / LIMITATIONS: Chưa kiểm thử tương tác trực quan trực tiếp trên trình duyệt với Light/Dark mode và API PATCH /chat/conversations/{id}/appearance [NOT VERIFIED: live browser visual/E2E].
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Mở /chat → biểu tượng (i) → Tùy chỉnh đoạn chat, bấm thử "Đổi chủ đề" và "Thay đổi biểu tượng cảm xúc" ở cả 2 chế độ Sáng/Tối và ngôn ngữ vi/en.
```
