# Thiết kế lại 2 Trạng Thái Trống của ILMS Chat (Messenger × Gemini MD3)

- **Ngày:** 2026-11-27
- **Tóm tắt kế hoạch:** Bổ sung khóa i18n `chat.emptySelection` và `chat.emptyConversation` đối xứng trong `vi.json`/`en.json`, tạo `ChatEmptySelectionState.tsx` với biểu tượng bong bóng thoại soft-3D SVG + CTA `Tin nhắn mới` / `Tìm bạn học`, và nâng cấp empty state của `ChatMessageList.tsx` thành màn chào đầu Messenger hiển thị Avatar lớn + Tên + trạng thái kết nối/thành viên (thích ứng Light/Dark và 6 chủ đề nền).

```text
STATUS: COMPLETE
SUMMARY: Thiết kế lại hoàn chỉnh 2 trạng thái trống trong `/chat`: màn hình chưa chọn đoạn chat nào (ChatEmptySelectionState) và màn hình chào đầu cuộc trò chuyện chưa có tin nhắn (Avatar lớn + Tên + ngữ cảnh phòng) hỗ trợ đa ngôn ngữ vi/en, Light/Dark và mọi wallpaper chủ đề.
FILES:
  - created src/features/chat/components/thread/ChatEmptySelectionState.tsx
  - created reports/2026-11-27-chat-messenger-empty-states.md
  - modified src/messages/vi.json
  - modified src/messages/en.json
  - modified src/features/chat/components/ChatPageView.tsx
  - modified src/features/chat/components/thread/ChatMessageList.tsx
  - modified src/features/chat/__tests__/chat-message.utils.test.ts
  - modified TASKS.md
CHECKS: lint not run (project không có script "lint" trong package.json) · typecheck ✔ (npx tsc --noEmit) · tests ✔ (12/12 pass via npx tsx --test) · build not run
ASSUMPTIONS: Không có.
RISKS / LIMITATIONS: Chưa chạy lại `npm run build` và chưa kiểm tra trực tiếp hiển thị Light/Dark mode trên trình duyệt.
DOCS: updated TASKS.md, reports/2026-11-27-chat-messenger-empty-states.md
DEPLOYMENT: not applicable
NEXT: Mở `/chat` ở trạng thái chưa chọn hội thoại và mở một cuộc trò chuyện mới chưa có tin nhắn để kiểm tra giao diện.
```
