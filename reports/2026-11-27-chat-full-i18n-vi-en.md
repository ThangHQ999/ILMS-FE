# Chat Module Full i18n Migration (`vi` / `en`)

Date: 2026-11-27  
Plan summary: Audit every file under `src/features/chat/`, `src/app/chat/`, and the chat entry button in `ClassDetailBanner.tsx`; migrate all hardcoded Vietnamese UI text, toast messages, schema/util fallbacks, and date/time formatting to symmetric `next-intl` keys in `vi.json` and `en.json`; verify with `chat-i18n.test.ts`, `tsc --noEmit`, and `npm run build`.

```text
STATUS: COMPLETE
SUMMARY: Migrated the entire Chat module (page shell, error boundary, sidebar, thread, composer, drawers, modals, hooks, schemas, slash commands, time formatting, and ClassDetailBanner chat button) to symmetric next-intl Vietnamese/English translations and added automated i18n verification tests.
FILES:
- Created: src/features/chat/__tests__/chat-i18n.test.ts, reports/2026-11-27-chat-full-i18n-vi-en.md
- Modified: src/messages/vi.json, src/messages/en.json, src/features/chat/constants/chat-slash-commands.ts, src/features/chat/schemas/chat.schema.ts, src/features/chat/schemas/chat-phase2.schema.ts, src/features/chat/utils/chat-message.utils.ts, src/app/chat/error.tsx, src/features/classes/components/detail/ClassDetailBanner.tsx, src/features/chat/hooks/{useConversations.ts,useChatRoomActions.ts,useChatRealtime.ts,useChatMessages.ts,useChatPhase2.ts}, src/features/chat/components/ChatPageView.tsx, Sidebar/List/Banner/Message cards (ConversationSidebar, ConversationListItem, ActiveUsersStrip, BookmarksPanel, NewConversationModal, ExamLockBanner, SyncPomodoroBar, AiReplyBubble, CodeSnippetCard, PollMessageCard, ResourceShareCard), Thread/Composer (ChatThreadHeader, ChatMessageList, ChatMessageItem, ChatComposer), Drawers (ConversationInfoDrawer, AppearanceSettingsPanel, MemberListPanel, SharedAttachmentsPanel, ChannelFaqPanel, StudySessionPanel, ModerationPanel, ThreadDrawer), Modals (ChatThemePreviewModal, ChatSummaryModal, CodeSnippetModal, CreatePollModal, PromoteFaqModal, ReportMessageModal, ScheduleMessageModal, ShareResourcePickerModal, StudyMatchingModal), TASKS.md
CHECKS: lint not configured (no lint script in package.json) · typecheck ✔ (`npx tsc --noEmit`) · tests ✔ (`npx tsx --test src/features/chat/__tests__/chat-message.utils.test.ts src/features/chat/__tests__/chat-themes.test.ts src/features/chat/__tests__/chat-i18n.test.ts` — 14/14 pass) · build ✔ (`npm run build`)
ASSUMPTIONS: `chat-themes.ts` retains default metadata strings for unit-test compatibility while UI (`AppearanceSettingsPanel`, `ChatThemePreviewModal`) reads localized `chat.themes.items.*` translations; `DashboardHeader` route map fallback (`/chat`) is overridden dynamically by `ChatPageView` (`tChat('title')`).
RISKS / LIMITATIONS: [NOT VERIFIED] Runtime visual walkthrough in an authenticated browser session across `vi` and `en` locales was not executed.
DOCS: updated TASKS.md; report saved at reports/2026-11-27-chat-full-i18n-vi-en.md
DEPLOYMENT: not deployed
NEXT: Switch the app locale between `vi` and `en` on `/chat` in dev mode to visually spot-check all drawers and modals.
```

## Review
- `chat-i18n.test.ts` verifies 100% key symmetry, non-empty values, and matching `{placeholder}` sets under `chat` between `src/messages/vi.json` and `src/messages/en.json`, and scans `src/features/chat/components/**/*.tsx`, `src/app/chat/**/*.tsx`, `src/features/chat/hooks/*.ts`, `src/features/chat/schemas/*.ts`, `chat-slash-commands.ts`, and `ClassDetailBanner.tsx` (post comment-stripping) for leftover hardcoded Vietnamese UI strings.
- Date/time displays in `StudySessionPanel.tsx`, `ScheduleMessageModal.tsx`, `ThreadDrawer.tsx`, and relative timestamps use `useLocale()` (`en-US` vs `vi-VN`).
