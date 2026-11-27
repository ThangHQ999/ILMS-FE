# Chat Conversation Filters, 800ms Debounce Search & Full Flow Audit

- **Date:** 2026-11-27
- **Plan Summary:** Gộp triển khai sửa bộ lọc các tab hội thoại (đồng bộ BE & `filterConversations` client-side), thêm hook `useDebounce` 800ms + `keepPreviousData` cho toàn bộ 5 ô tìm kiếm trong Chat, và khắc phục toàn bộ 10 lỗi luồng/state/realtime/UX phát hiện khi rà soát.

```text
STATUS: COMPLETE
SUMMARY: Đã triển khai gộp: (1) lọc tab hội thoại & tìm kiếm tiếng Việt không dấu (filterConversations + đồng bộ BE + cập nhật api-spec.md + tắt query thừa ở tab BOOKMARKS), (2) hook useDebounce 800ms + keepPreviousData cho cả 5 điểm search Chat (ConversationSidebar, ChatThreadHeader, NewConversationModal, MemberListPanel, ShareResourcePickerModal), và (3) khắc phục các lỗi rò state đổi phòng, deep-link loading/error, đồng bộ URL, auto-scroll/highlight, rollback optimistic reaction, ổn định Soketi, mention filter, Ask AI reply reset và ThreadDrawer.
FILES: created src/hooks/useDebounce.ts, reports/2026-11-27-chat-filters-debounce-800ms-and-flow-audit.md · modified src/features/chat/utils/chat-message.utils.ts, src/features/chat/hooks/useConversations.ts, src/features/chat/hooks/useChatMessages.ts, src/features/chat/services/chat-realtime.service.ts, src/features/chat/hooks/useChatRealtime.ts, src/features/chat/components/sidebar/ConversationSidebar.tsx, src/features/chat/components/sidebar/NewConversationModal.tsx, src/features/chat/components/sidebar/BookmarksPanel.tsx, src/features/chat/components/thread/ChatThreadHeader.tsx, src/features/chat/components/thread/ChatMessageList.tsx, src/features/chat/components/thread/ChatComposer.tsx, src/features/chat/components/drawer/MemberListPanel.tsx, src/features/chat/components/drawer/ThreadDrawer.tsx, src/features/chat/components/modals/ShareResourcePickerModal.tsx, src/features/chat/components/ChatPageView.tsx, src/features/chat/__tests__/chat-message.utils.test.ts, src/messages/vi.json, src/messages/en.json, docs/api-spec.md, TASKS.md
CHECKS: lint not run · typecheck ✔ · tests ✔ (16/16 chat unit tests + 3705 i18n keys symmetry) · build ✔ (next build 44/44 static pages)
ASSUMPTIONS: Xóa sạch ô tìm kiếm về chuỗi rỗng cập nhật debouncedValue ngay lập tức thay vì đợi 800ms; chuyển sang phòng chat khác bằng key={activeConversation.id} sẽ làm mới bản nháp chưa gửi để tránh gửi nhầm tệp/nội dung sang phòng khác.
RISKS / LIMITATIONS: Chưa chạy kiểm thử tương tác trực tiếp trên trình duyệt cùng BE mới cập nhật và Soketi server [NOT VERIFIED: live browser E2E with backend & Soketi]. Lọc client-side bổ sung trên kết quả trang hiện tại của GET /chat/conversations (size=50).
DOCS: updated docs/api-spec.md, TASKS.md
DEPLOYMENT: not applicable
NEXT: Mở /chat cùng backend vừa cập nhật để test chuyển tab (All/Unread/Groups/Classes/Saved), gõ search kiểm tra Network Tab chỉ gọi 1 request sau 800ms, mở Bookmark/nhắn từ MemberList và thử thả reaction / @mention / Ask AI.
```
