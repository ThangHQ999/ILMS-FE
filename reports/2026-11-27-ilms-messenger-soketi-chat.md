# Triển Khai Trọn Vẹn Module Chat Học Tập Thông Minh (ILMS Messenger × Soketi — Phase 1 & Phase 2)

- **Date:** 2026-11-27
- **Plan summary:** Xây dựng toàn bộ module `src/features/chat/` kết nối Soketi (`pusher-js`) + REST API theo kiến trúc Feature-Driven (`AGENTS.md` & `docs/design-system.md`), bao phủ trọn vẹn Bước 1A (Core Messenger + Soketi), Bước 1B (Cá nhân hóa Messenger + Rich Cards ILMS + Kênh lớp) và Giai đoạn 2 Wave 2A/2B/2C (Threads, Moderation/Exam Lock, Smart Study Matching, AI Companion/Summarizer/Draft/FAQ, Study Sessions/Sync Pomodoro, Slash Commands, Read Receipts, Bookmarks, Scheduled Messages).

STATUS: COMPLETE
SUMMARY: Đã cài đặt `pusher-js`, xây dựng trọn bộ tầng dữ liệu (`chat.schema.ts`, `chat-phase2.schema.ts`, `chat.service.ts`, `chat-phase2.service.ts`, `chat-realtime.service.ts`, `useChatStore.ts`, `useChatRealtime.ts`, các hooks TanStack Query) và toàn bộ giao diện Messenger 3 cột responsive (Sidebar + Active Now + Bookmarks, Thread Stream + Grouping + Hover Actions + Optimistic `clientTempId`, Composer + `@Mention` + Slash Commands `/` + Anonymous toggle, Info Drawer 6 Theme + Members + Attachments + FAQ + Sessions + Moderation, Thread Drawer + AI Summary/Draft + Study Matching + Sync Pomodoro + Report/Schedule Modals). Đã tích hợp route `/chat`, cập nhật `DashboardSidebar` (mục Tin nhắn kèm `unreadCount`), `DashboardHeader`, blacklist `ai-coach-routes`, `ClassDetailBanner` (nút `Kênh chat lớp`), và bổ sung i18n đối xứng `vi.json`/`en.json`.
FILES:
- Modified: `package.json`, `package-lock.json` (cài `pusher-js`)
- Modified: `src/constants/ai-coach-routes.ts`, `src/features/dashboard/components/DashboardHeader.tsx`, `src/features/dashboard/components/DashboardSidebar.tsx`, `src/features/classes/components/detail/ClassDetailBanner.tsx`, `src/messages/vi.json`, `src/messages/en.json`, `TASKS.md`
- Created: `src/app/chat/page.tsx`, `src/app/chat/loading.tsx`, `src/app/chat/error.tsx`
- Created: `src/features/chat/index.ts`, `src/features/chat/constants/*`, `src/features/chat/schemas/*`, `src/features/chat/services/*`, `src/features/chat/store/useChatStore.ts`, `src/features/chat/hooks/*`, `src/features/chat/utils/chat-message.utils.ts`, `src/features/chat/__tests__/chat-message.utils.test.ts`
- Created: `src/features/chat/components/ChatPageView.tsx`, `src/features/chat/components/sidebar/*`, `src/features/chat/components/thread/*`, `src/features/chat/components/thread/cards/*`, `src/features/chat/components/drawer/*`, `src/features/chat/components/modals/*`
CHECKS: lint ✘ (package.json không có script lint) · typecheck ✔ (`npx tsc --noEmit`) · tests ✔ (`npx tsx --test src/features/chat/__tests__/chat-message.utils.test.ts`, 7/7 pass) · build ✔ (`npm run build` / Next.js 16.4.6 Turbopack pass 44/44 trang) · i18n symmetry check ✔ (`missEn: [], missVi: []`)
ASSUMPTIONS:
- Biến môi trường Soketi trên frontend dùng `NEXT_PUBLIC_SOKETI_KEY`, `NEXT_PUBLIC_SOKETI_HOST`, `NEXT_PUBLIC_SOKETI_PORT`, `NEXT_PUBLIC_SOKETI_FORCE_TLS`; khi chưa cấu hình `NEXT_PUBLIC_SOKETI_KEY`, client tự giữ chế độ REST fallback (`realtimeStatus = 'disabled'`) không gây lỗi runtime.
- `useChatStore` dùng `React.useSyncExternalStore` thay cho `zustand` để không cài thêm dependency ngoài `pusher-js`.
- Chưa thực hiện `git commit` và `git push` theo đúng yêu cầu để người dùng review diff.
RISKS / LIMITATIONS:
- `[NOT VERIFIED]` Chưa kiểm thử End-to-End trực tiếp với backend Spring Boot + Soketi server đang chạy thật (toàn bộ API contract khớp theo 4 tài liệu thiết kế BE & Gap Analysis đã chốt).
- Trên kênh broadcast `private-conversation-{id}`, để tránh lỗi ghi đè trạng thái `reactedByMe` / `votedByMe` giữa các user, payload BE cần gửi kèm `actorUserId` đúng như đã thống nhất trong `phase-1-api-dto-gap-analysis.md`.
DOCS: updated `TASKS.md`
DEPLOYMENT: not deployed
NEXT: Cấu hình biến `NEXT_PUBLIC_SOKETI_*` trong `.env.local`, chạy `ILMS-BE` + Soketi server rồi mở `/chat` kiểm tra thực tế các luồng nhắn tin real-time.
