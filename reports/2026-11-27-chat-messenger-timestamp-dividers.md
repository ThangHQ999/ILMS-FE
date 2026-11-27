# Nâng cấp Mốc Thời Gian Tin Nhắn & Floating Hover Tooltip kiểu Messenger

- **Ngày:** 2026-11-27
- **Tóm tắt kế hoạch:** Bổ sung khóa `chat.timestamp` (`weekdaysShort`, `weekdaysFull`, `months`, `weekdayFormat`, `tooltipWeekdayFormat`, `fullDateFormat`) đối xứng trong `vi.json`/`en.json`, nâng cấp `groupMessagesForDisplay` chèn mốc thời gian khi ngắt quãng ≥ 15 phút hoặc đổi ngày địa phương, và hiển thị floating dark pill tooltip kiểu Messenger khi rê chuột có chủ ý (`200ms`) lên bong bóng tin nhắn.

```text
STATUS: COMPLETE
SUMMARY: Triển khai mốc thời gian tin nhắn kiểu Messenger (ngắt quãng >= 15 phút hoặc đổi ngày địa phương) và floating dark pill tooltip qua portal khi hover bong bóng tin nhắn (delay 200ms, định vị tránh đè thanh action bar), hỗ trợ đầy đủ đa ngôn ngữ vi/en.
FILES:
  - created reports/2026-11-27-chat-messenger-timestamp-dividers.md
  - modified src/messages/vi.json
  - modified src/messages/en.json
  - modified src/features/chat/utils/chat-message.utils.ts
  - modified src/features/chat/components/thread/ChatMessageList.tsx
  - modified src/features/chat/components/thread/ChatMessageItem.tsx
  - modified src/features/chat/__tests__/chat-message.utils.test.ts
  - modified TASKS.md
CHECKS: lint not run (project không có script "lint" trong package.json) · typecheck ✔ (npx tsc --noEmit) · tests ✔ (12/12 pass via npx tsx --test) · build not run
ASSUMPTIONS: Ngưỡng tách mốc thời gian không hoạt động là 15 phút (TIMESTAMP_GAP_MS), độ trễ chủ ý khi hover tooltip là 200ms, và ngưỡng hiển thị thứ trong tuần là trong vòng 7 ngày gần nhất (1 <= dayDiff < 7).
RISKS / LIMITATIONS: Chưa chạy lại `npm run build` và chưa kiểm tra trực tiếp trên trình duyệt với cả 2 ngôn ngữ vi/en.
DOCS: updated TASKS.md, reports/2026-11-27-chat-messenger-timestamp-dividers.md
DEPLOYMENT: not applicable
NEXT: Mở `/chat` và rê chuột giữ ~200ms vào các bong bóng tin nhắn (của mình và của đối phương) ở cả tiếng Việt và tiếng Anh để kiểm tra floating pill tooltip.
```
