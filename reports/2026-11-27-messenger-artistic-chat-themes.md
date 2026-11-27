# Nâng cấp Hệ thống Chủ đề Chat (Messenger Artistic Themes)

- **Ngày:** 2026-11-27
- **Tóm tắt kế hoạch:** Tạo 5 hình nền nghệ thuật full-bleed, mở rộng design tokens trong `chat-themes.ts` cho cả Light & Dark mode giữ nguyên 6 enum key BE (`DEFAULT`, `OCEAN`, `FOREST`, `LOVE`, `SUNSET`, `MIDNIGHT`), xây dựng `ChatThemePreviewModal` + lưới Visual Theme Cards, và áp dụng đồng bộ lên toàn bộ cột chat.

```text
STATUS: COMPLETE
SUMMARY: Thiết kế lại hệ thống 6 chủ đề chat theo phong cách Messenger Artistic Themes với 5 hình nền nghệ thuật full-bleed, bảng màu Light/Dark riêng cho từng theme, màn hình Xem trước chủ đề (Hủy/Chọn) và thẻ chọn trực quan.
FILES:
  - created public/images/chat-themes/ocean-dreamscape.png
  - created public/images/chat-themes/forest-leaves.png
  - created public/images/chat-themes/love-hearts.png
  - created public/images/chat-themes/sunset-festival.png
  - created public/images/chat-themes/midnight-cosmos.png
  - created src/features/chat/components/modals/ChatThemePreviewModal.tsx
  - created src/features/chat/__tests__/chat-themes.test.ts
  - created reports/2026-11-27-messenger-artistic-chat-themes.md
  - modified src/features/chat/constants/chat-themes.ts
  - modified src/features/chat/components/drawer/AppearanceSettingsPanel.tsx
  - modified src/features/chat/components/ChatPageView.tsx
  - modified src/features/chat/components/thread/ChatThreadHeader.tsx
  - modified src/features/chat/components/thread/ChatMessageList.tsx
  - modified src/features/chat/components/thread/ChatMessageItem.tsx
  - modified src/features/chat/components/thread/ChatComposer.tsx
  - modified TASKS.md
CHECKS: lint not run (project không có script "lint" trong package.json) · typecheck ✔ (npx tsc --noEmit) · tests ✔ (10/10 pass via npx tsx --test) · build ✔ (npm run build, 44/44 routes)
ASSUMPTIONS: Backend tiếp tục sử dụng đúng 6 giá trị themeKey: DEFAULT, OCEAN, FOREST, LOVE, SUNSET, MIDNIGHT tại PATCH /api/v1/chat/conversations/{id}/appearance.
RISKS / LIMITATIONS: Chưa kiểm tra hiển thị thực tế từng chủ đề ở cả Light và Dark mode trực tiếp trên trình duyệt.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Mở `/chat`, vào Thông tin đoạn chat -> Chủ đề cuộc trò chuyện để xem trước và áp dụng từng chủ đề ở cả Light và Dark mode.
```
