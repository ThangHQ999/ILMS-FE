# Cancel File Upload in Chat Composer

- **Date:** 2026-11-28
- **Plan Summary:** Bổ sung `AbortSignal` cho `uploadImage` / `uploadChatAttachment` và nút **Hủy** trên thanh tiến trình tải tệp lên của `ChatComposer` dùng `AbortController`.

```text
STATUS: COMPLETE
SUMMARY: Đã truyền AbortSignal xuống uploadImage và uploadChatAttachment (uploadFile đã hỗ trợ sẵn), đồng thời gắn AbortController và nút Hủy trực tiếp trên thanh trạng thái đang tải tệp lên trong ChatComposer (ngắt HTTP request tức thì, không hiện toast lỗi khi chủ động hủy, chống race condition khi tải tệp mới sau khi hủy và tự abort khi chuyển phòng/unmount).
FILES: created reports/2026-11-28-chat-cancel-file-upload.md · modified src/lib/upload.ts, src/features/chat/services/chat.service.ts, src/features/chat/components/thread/ChatComposer.tsx, src/messages/vi.json, src/messages/en.json, TASKS.md
CHECKS: lint not run · typecheck ✔ · tests ✔ (17/17 chat unit tests + 3728 i18n keys symmetry) · build not run
ASSUMPTIONS: Người dùng bấm nút Hủy trong lúc đang tải file sẽ hủy request upload đang chạy trên trình duyệt mà không hiện cảnh báo lỗi.
RISKS / LIMITATIONS: Chưa kiểm thử bấm hủy thực tế giữa chừng với mạng Throttle Slow 3G trên trình duyệt [NOT VERIFIED: live browser network abort].
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Mở /chat, bật Slow 3G trong DevTools Network tab, kéo thả hoặc chọn 1 tệp lớn rồi bấm nút Hủy để xác nhận request bị canceled ngay.
```
