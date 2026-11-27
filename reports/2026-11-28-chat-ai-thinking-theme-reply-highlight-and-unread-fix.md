# Nâng cấp trải nghiệm AI Chat, Chủ đề bong bóng AI, Đa ngôn ngữ, Highlight tin nhắn cha & Đồng bộ trạng thái đã đọc

- **Ngày:** 2026-11-28
- **Tóm tắt kế hoạch:** Bổ sung chỉ báo AI đang suy nghĩ/phân tích với hiệu ứng nảy 3 chấm, đồng bộ `AiReplyBubble`/`AiThinkingBubble` theo bảng màu 6 chủ đề Chat (Light/Dark), đa ngôn ngữ hóa tên người gửi AI trên mọi thành phần Chat, kích hoạt viền highlight đậm khi bấm vào tin nhắn trích dẫn, và khắc phục lỗi phòng chat đang mở vẫn hiện chưa đọc khi có tin nhắn mới.

```text
STATUS: COMPLETE
SUMMARY: Implemented 5 Chat UX & realtime fixes: animated AI thinking bubble when @AI is triggered, theme-aware AI reply/thinking bubbles across all 6 chat themes (light & dark), full vi/en localization for AI sender names ("Trợ giảng AI" / "AI Teaching Assistant"), bold reply-target highlight ring on parent quote click, and immediate read/cache sync so the active conversation no longer shows unread badges on incoming messages.
FILES:
- created: src/features/chat/components/thread/cards/AiThinkingBubble.tsx
- created: reports/2026-11-28-chat-ai-thinking-theme-reply-highlight-and-unread-fix.md
- modified: src/features/chat/utils/chat-message.utils.ts
- modified: src/features/chat/store/useChatStore.ts
- modified: src/features/chat/constants/chat-themes.ts
- modified: src/features/chat/components/thread/cards/AiReplyBubble.tsx
- modified: src/features/chat/components/thread/ChatMessageList.tsx
- modified: src/features/chat/components/thread/ChatMessageItem.tsx
- modified: src/features/chat/components/thread/ChatThreadHeader.tsx
- modified: src/features/chat/components/thread/ChatComposer.tsx
- modified: src/features/chat/components/sidebar/ConversationListItem.tsx
- modified: src/features/chat/components/sidebar/BookmarksPanel.tsx
- modified: src/features/chat/components/drawer/ThreadDrawer.tsx
- modified: src/features/chat/components/ChatPageView.tsx
- modified: src/features/chat/hooks/useChatMessages.ts
- modified: src/features/chat/hooks/useChatRealtime.ts
- modified: src/messages/vi.json
- modified: src/messages/en.json
- modified: src/features/chat/__tests__/chat-message.utils.test.ts
- modified: src/features/chat/__tests__/chat-themes.test.ts
- modified: TASKS.md
CHECKS: lint not configured (no lint script / eslint.config.* in workspace) · typecheck ✔ (`npx tsc --noEmit`) · tests ✔ (18/18 in `chat-message.utils.test.ts`, `chat-themes.test.ts`, `chat-i18n.test.ts`) · build not run
ASSUMPTIONS: Backend creates AI replies via `@AI` asynchronously and broadcasts via Soketi `MESSAGE_CREATED` (a 45s safety timeout also clears the AI thinking indicator if a reply fails). Active conversation read sync assumes user is viewing the active room when incoming messages arrive via Soketi.
RISKS / LIMITATIONS: E2E browser verification against live Soketi/BE and `npm run build` were not run (`[NOT VERIFIED]` in live browser session). ESLint is not configured in `package.json` or via `eslint.config.*`.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Test sending `@AI ...`, switching chat themes/locales, clicking quoted replies, and receiving a peer message in an active room in the running dev environment.
```
