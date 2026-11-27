# Chat Drag & Drop File Upload (Zalo / Messenger Style)

- **Date:** 2026-11-27
- **Plan Summary:** Bổ sung tính năng kéo-thả tệp/ảnh trực tiếp vào khung chat (kèm dán ảnh từ clipboard `Ctrl+V`), overlay kính mờ chỉ dẫn thả file chống nháy, preview thumbnail/dung lượng tệp trong `ChatComposer` và đa ngôn ngữ `vi`/`en`.

```text
STATUS: COMPLETE
SUMMARY: Đã triển khai vùng kéo-thả tệp/ảnh toàn khung hội thoại trong ChatPageView (tự động ẩn khi phòng bị khóa/chỉ đọc, bỏ qua drag text nội bộ, dùng dragDepthRef chống nhấp nháy overlay), đồng thời nâng cấp ChatComposer xử lý drop/paste/file-picker qua hàm uploadSingleFile dùng chung với uploadChatAttachment, hiển thị trạng thái đang tải lên và preview ảnh thu nhỏ / dung lượng tệp đính kèm.
FILES: created reports/2026-11-27-chat-drag-drop-file-upload.md · modified src/features/chat/components/ChatPageView.tsx, src/features/chat/components/thread/ChatComposer.tsx, src/messages/vi.json, src/messages/en.json, TASKS.md
CHECKS: lint not run · typecheck ✔ · tests ✔ (17/17 chat unit tests + 3727 i18n keys symmetry) · build not run
ASSUMPTIONS: Kéo-thả hoặc dán (Ctrl+V) lấy tệp đầu tiên (files[0]) và đính kèm sẵn vào khung soạn tin để người dùng có thể gõ thêm lời nhắn trước khi bấm Gửi (hoặc bấm Enter gửi ngay).
RISKS / LIMITATIONS: Chưa chạy kiểm thử kéo-thả tệp thật trên trình duyệt với endpoint upload backend [NOT VERIFIED: live browser drag-drop upload].
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Mở một cuộc trò chuyện trên /chat, kéo 1 ảnh hoặc tệp PDF/DOCX từ máy tính thả vào khung chat (hoặc Ctrl+V ảnh chụp màn hình) để kiểm tra upload và gửi tin.
```
