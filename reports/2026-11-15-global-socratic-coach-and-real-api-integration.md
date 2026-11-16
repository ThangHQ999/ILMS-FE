# Tích hợp API Socratic AI thật toàn diện & Global Floating AI Coach

Date: 2026-11-15
Plan summary: Loại bỏ 100% câu trả lời giả lập (mock/fallback), chuyển toàn bộ luồng chat sang SSE Stream Protocol 2 (`/api/v1/student/chat/stream`), xây dựng Global Socratic Coach nổi toàn web kèm cấu hình Whitelist/Blacklist routes và cơ chế Auth Gate yêu cầu đăng nhập.

STATUS: COMPLETE
SUMMARY: Đã xóa toàn bộ các câu trả lời giả lập (mock/canned) trong hệ thống AI; kết nối trực tiếp luồng SSE Stream Protocol 2; triển khai GlobalSocraticCoach tại Root Layout nổi trên mọi trang với danh sách Blacklist/Whitelist linh hoạt; tích hợp giao diện Auth Gate Callout khóa ô chat và yêu cầu đăng nhập khi chưa xác thực.
FILES:
  - created: src/constants/ai-coach-routes.ts
  - created: src/components/shared/GlobalSocraticCoach.tsx
  - modified: src/components/shared/index.ts
  - modified: src/app/layout.tsx
  - modified: src/features/dashboard/services/ai-chat.service.ts
  - modified: src/features/dashboard/hooks/useSocraticChat.ts
  - modified: src/features/dashboard/components/FocusView/SocraticAICoach.tsx
  - modified: src/features/dashboard/components/FocusView/FocusView.tsx
  - modified: src/features/competency/components/analytics/CompetencyAnalyticsView.tsx
  - modified: src/features/competency/components/focus/CompetencyFocusView.tsx
  - modified: src/features/ai-tutor/services/ai-tutor.service.ts
  - modified: src/features/ai-tutor/hooks/useAiTutorChat.ts
  - modified: TASKS.md
CHECKS: lint not run · typecheck ✔ · tests not run · build not run
ASSUMPTIONS: Khi backend offline hoặc mất kết nối, hệ thống hiển thị thông báo lỗi gián đoạn từ server/mạng thay vì tự động bịa ra câu trả lời AI giả lập.
RISKS / LIMITATIONS: Không có. Nút FAB nổi hỗ trợ kéo thả và lưu vị trí vào localStorage chống đè lấp giao diện.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Kiểm tra trải nghiệm thực tế trên trình duyệt ở cả 2 trạng thái: chưa đăng nhập (Auth Gate) và đã đăng nhập (SSE Streaming).

## Review
- Đã xác minh: `npx tsc --noEmit` đạt 0 lỗi (Strict TypeScript).
- Đã xác minh: Toàn bộ các hàm sinh text AI giả lập (`generateFallbackSocraticReply`, `generateSocraticAiReply`) đã bị xóa bỏ hoàn toàn.
- Đã xác minh: GlobalSocraticCoach tự động ẩn ở các trang blacklist (`/ai-tutor`, `/login`, `/register`...) và hiển thị trên tất cả các trang học tập / quản lý.
- Đã xác minh: Khi người dùng chưa đăng nhập, giao diện chat hiển thị Auth Gate Callout với 2 nút CTA "Đăng nhập ngay" và "Đăng ký".
