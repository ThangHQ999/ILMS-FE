# Hoàn thiện Ảnh Bìa & Ảnh Đại Diện Nhóm Chat (Tạo nhóm → Sau khi tạo)

- **Ngày:** 2026-11-27
- **Tóm tắt kế hoạch:** Nâng cấp màn hình tạo nhóm (`NewConversationModal`) với khung xem trước ảnh bìa + avatar tức thì qua `URL.createObjectURL`, chặn bấm Tạo nhóm khi đang tải ảnh, và render đồng bộ ảnh bìa nhóm trong `ConversationInfoDrawer`, màn chào đầu `ChatMessageList`, `AppearanceSettingsPanel`, kèm `onError` fallback an toàn ở `ConversationListItem` và `ChatThreadHeader`.

```text
STATUS: COMPLETE
SUMMARY: Hoàn thiện luồng ảnh bìa / ảnh đại diện nhóm chat từ lúc tạo nhóm (preview tức thì, đổi/xóa ảnh, khóa submit khi đang upload, avatar kết quả tìm kiếm) đến sau khi đã tạo xong (cover banner trong ConversationInfoDrawer và màn chào đầu ChatMessageList, thumbnail ở AppearanceSettingsPanel, fallback lỗi ảnh ở sidebar & header).
FILES:
  - created reports/2026-11-27-chat-group-cover-and-avatar.md
  - modified src/features/chat/components/sidebar/NewConversationModal.tsx
  - modified src/features/chat/components/drawer/ConversationInfoDrawer.tsx
  - modified src/features/chat/components/thread/ChatMessageList.tsx
  - modified src/features/chat/components/drawer/AppearanceSettingsPanel.tsx
  - modified src/features/chat/components/sidebar/ConversationListItem.tsx
  - modified src/features/chat/components/thread/ChatThreadHeader.tsx
  - modified TASKS.md
CHECKS: lint not run (project không có script "lint" trong package.json) · typecheck ✔ (npx tsc --noEmit) · tests ✔ (12/12 pass via npx tsx --test) · build not run
ASSUMPTIONS: BE trả về và lưu trường `avatarUrl` trên `ChatConversation` qua `POST /api/v1/chat/conversations/group`, `GET /api/v1/chat/conversations`, `GET /api/v1/chat/conversations/{id}` và `PATCH /api/v1/chat/conversations/{id}/settings`.
RISKS / LIMITATIONS: Chưa chạy lại `npm run build` và chưa kiểm tra trực tiếp trên trình duyệt với BE đang chạy.
DOCS: updated TASKS.md, reports/2026-11-27-chat-group-cover-and-avatar.md
DEPLOYMENT: not applicable
NEXT: Thử tạo 1 nhóm mới có tải ảnh bìa, kiểm tra ảnh hiển thị ở sidebar, header, màn chào đầu (khi chưa có tin nhắn) và panel Thông tin đoạn chat (Cột 3).
```
