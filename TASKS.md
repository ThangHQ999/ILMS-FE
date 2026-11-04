# TASKS.md — PROJECT WORKING MEMORY

> Agent: read at the start of every session; update at the end of every meaningful task.
> Write for a reader with zero context (including yourself next session). Keep it short.

## Current goal
- Xây dựng tính năng Xác thực người dùng (Authentication - Đăng ký, Quên mật khẩu).

## In progress
- [ ] 2026-10-15 — Triển khai hoàn chỉnh tính năng Đăng nhập & Đăng ký qua OAuth2 (Google & GitHub): kết nối backend Spring Boot (/api/v1/auth/oauth/*), hook useOAuthLogin, loading spinner từng nút bấm, trang callback /auth/callback, auto-redirect và đa ngôn ngữ đối xứng.

## Next (priority order)
1. Tích hợp xác thực phiên người dùng với cookie và router guard.
2. Xây dựng trang Đặt lại mật khẩu (Reset Password) với token (`/reset-password`).

## Done
- [x] 2026-11-03 — Khắc phục lỗi crash MouseEvent.trim() khi gửi tin nhắn AI Tutor và khôi phục hiển thị đầy đủ công thức toán học LaTeX (preprocessLatex, KaTeX display scroll, throwOnError: false) — chi tiết xem `reports/2026-11-03-fix-ai-tutor-latex-and-send-error.md`
- [x] 2026-11-02 — Backend-confirmed exercise step display; no inferred concept-chat steps (runtime not verified): `reports/2026-11-02-confirmed-step-display.md`
- [x] 2026-11-02 — Socratic protocol 2 live SSE/status integration (runtime not verified): `reports/2026-11-02-socratic-live-sse-integration.md`
- [x] 2026-10-24 — Tích hợp tự động render sơ đồ 2D (Mermaid) và mô hình 3D (vis-3d) trực tiếp vào khung chat SSE của Socratic AI Tutor, xử lý streaming dang dở an toàn và thích ứng Dark/Light theme — chi tiết xem `reports/2026-10-24-mermaid-vis3d-chat-integration.md`
- [x] 2026-10-22 — Tích hợp trọn vẹn API Chat Streaming SSE, Quản lý phiên chat Sidebar và Feedback đánh giá Socratic AI Tutor, phân định đường dẫn động `/ai-tutor` (phiên mới) và `/ai-tutor/[sessionId]` (chi tiết phiên), loại bỏ lỗi nhảy phiên cũ khi tạo chat mới — chi tiết xem `reports/2026-10-22-socratic-chat-api-integration.md`
- [x] 2026-10-13 — Tổng hợp toàn diện danh mục API kèm DTO còn thiếu trên toàn bộ hệ thống ILMS (Dashboard, Competency Radar, Knowledge Graph, AI Tutor, Settings, Multi-account, Onboarding, Permission Elevation 403) và lập báo cáo chi tiết — chi tiết xem `reports/2026-10-13-api-and-dto-gap-analysis.md`
- [x] 2026-10-13 — Xây dựng trang 404 Not Found & 403 Forbidden chuẩn Modern SaaS, header thích ứng nhận diện phiên đăng nhập (hiện nút Đăng nhập nếu chưa login, hiện UserMenuDropdown nếu đã login), Cube 3D tương tác cảm biến radar, phím tắt Ctrl+K, Socratic AI modal, Role Audit Matrix, Modal xin cấp quyền & chuyển đổi phiên, Dark/Light mode và đa ngôn ngữ đối xứng — chi tiết xem `reports/2026-10-13-error-pages-404-403.md`
- [x] 2026-10-13 — Nâng cấp Avatar góc trên bên phải thành Menu Người dùng & Trình chuyển đổi tài khoản (UserMenuDropdown) 380px ở cả 2 chế độ Analytics và Focus Mode, hỗ trợ Quản lý tài khoản (/settings), danh sách tài khoản phụ (Phiên hết hạn, Đăng nhập, Xóa), Đăng xuất, Dark Mode và đa ngôn ngữ i18n.
- [x] 2026-10-13 — Xây dựng trang Đồ thị tri thức (/knowledge-graph) hỗ trợ 2 chế độ (Analytics & Focus Mode), @xyflow/react, d3-force physics layout, Smart Dimming, Dijkstra shortest path modal, Inspector Panel, Sketch drawing canvas, Table Matrix fallback, Dark/Light mode và đa ngôn ngữ đối xứng — chi tiết xem `reports/2026-10-13-knowledge-graph-studio.md`

- [x] 2026-10-13 — Xây dựng trang Bản đồ Năng lực & Cây Kỹ năng (/competency) chuẩn Feature-Driven: hỗ trợ 2 chế độ (Analytics Mode sử dụng layout có sẵn và Zen Focus Mode), 3 sub-views (Cá nhân với Radar SVG 6 chiều, Cây Kỹ năng DAG, Bản đồ nhiệt Cả lớp), Modal Flashcard & Diagnostic Quiz, con AI chat nhỏ Gia sư Socratic AI Coach ở cả 2 chế độ và Auth Guard bảo vệ — chi tiết xem `reports/2026-10-13-competency-radar-map.md`
- [x] 2026-10-13 — Xây dựng trang Cài đặt & Tùy chọn hệ thống (/settings) hỗ trợ cả 2 chế độ Focus & Analytics, Dark Mode (next-themes), đa ngôn ngữ i18n đối xứng, phím tắt Ctrl+K và Mock DTOs — chi tiết xem `reports/2026-10-13-settings-page.md`

- [x] 2026-10-13 — Xây dựng trang Gia sư AI Socratic (/ai-tutor) chuẩn Feature-Driven: render Markdown, code block C++ với copy, bảng độ phức tạp, thẻ câu hỏi gợi mở, 2 trạng thái màn hình (Welcome New Chat Capsule & Active Chat Canvas), phím tắt ⌘K, ProtectedRoute và đa ngôn ngữ i18n — chi tiết xem `reports/2026-10-13-ai-tutor-page.md`
- [x] 2026-10-13 — Điều chỉnh logic điều hướng toàn hệ thống: người dùng chưa đăng nhập vào thẳng Landing Page (/), người dùng đã đăng nhập tự động đá về Dashboard (/dashboard); hoàn tất Onboarding (/onboarding) chuyển hướng thẳng vào Dashboard — chi tiết xem `reports/2026-10-13-auth-routing-logic.md`
- [x] 2026-10-13 — Triển khai đa ngôn ngữ (i18n qua next-intl) toàn diện cho trang Dashboard (/dashboard) ở cả 2 chế độ Analytics và Focus View, đảm bảo đối xứng 100% giữa vi.json và en.json (ngoại trừ tin nhắn chat AI theo yêu cầu) — chi tiết xem `reports/2026-10-13-dashboard-i18n.md`
- [x] 2026-10-13 — Rà soát & kết nối đồng bộ thời gian thực màu sắc và phông chữ từ Onboarding (/onboarding) sang toàn hệ thống (Dashboard); cập nhật 4 màu mặc định Light Mode theo thiết kế ảnh (#0A192F, #007BFF, #6C5CE7, #F0F4F8) — chi tiết xem `reports/2026-10-13-color-font-onboarding-sync.md`
- [x] 2026-10-13 — Xây dựng trang Dashboard người dùng hỗ trợ 2 chế độ (Analytics & Focus Mode qua localStorage), Flyout thông báo, Socratic AI Coach hiển thị Markdown và thanh kéo resize tối đa 2/5 màn hình — chi tiết xem `reports/2026-10-13-user-dashboard-dual-mode.md`
- [x] 2026-10-12 — Xây dựng trang Quên mật khẩu (Forgot Password) chuẩn Feature-Driven, gồm 2 trạng thái Form & Success, kết nối API POST /auth/forgot-password, hỗ trợ countdown timer 60s và đa ngôn ngữ i18n — chi tiết xem `reports/2026-10-12-auth-forgot-password.md`
- [x] 2026-10-12 — Xây dựng Trang chủ vãng lai (Landing Page) chuẩn Feature-Driven, kiểm tra phiên đăng nhập với API /auth/me, hỗ trợ 2 chế độ Sáng/Tối, SVG Knowledge Graph, Heatmap và đa ngôn ngữ i18n — chi tiết xem `reports/2026-10-12-landing-page.md`
- [x] 2026-10-12 — Chuyển đổi 100% hardcode text trang Cài đặt Onboarding (/onboarding) sang hệ thống i18n (next-intl) tự động bắt theo ngôn ngữ trình duyệt — chi tiết xem `reports/2026-10-12-onboarding-i18n.md`
- [x] 2026-10-12 — Chuyển đổi 100% hardcode text trang Đăng ký (Register) sang hệ thống i18n (next-intl) tự động bắt theo ngôn ngữ trình duyệt — chi tiết xem `reports/2026-10-12-auth-register-i18n.md`
- [x] 2026-10-12 — Tự động nhận diện ngôn ngữ trình duyệt (Browser Locale - Accept-Language / navigator.language) và xóa bỏ 100% hardcode tiếng Việt ở trang Login sang next-intl — chi tiết xem `reports/2026-10-12-browser-locale-auto-detect.md`
- [x] 2026-10-12 — Triển khai trang Onboarding (Cá nhân hóa không gian học tập) lưu toàn bộ cấu hình vào localStorage và kết nối điều hướng tự động sau khi đăng ký — chi tiết xem `reports/2026-10-12-onboarding-feature.md`
- [x] 2026-10-12 — Xây dựng trang Đăng ký (Register) chuẩn Desktop 16:9 Split + Bento 3D Showcase, kết nối API `POST /auth/register` và hỗ trợ đầy đủ 2 chế độ Sáng / Tối — chi tiết xem `reports/2026-10-12-auth-register-feature.md`
- [x] 2026-10-12 — Sửa lỗi và tối ưu nút Theme Toggle Sáng / Tối đồng bộ trực tiếp hai chiều
- [x] 2026-10-12 — Triển khai giao diện trang Đăng nhập phiên bản 2 (Desktop 16:9 Split, Bento 3D Showcase, kết nối API và Logo mới) — chi tiết xem `reports/2026-10-12-auth-login-v2.md`
- [x] 2026-10-11 — Xây dựng tính năng Auth (Đăng nhập) chuẩn Feature-Driven — chi tiết xem `reports/2026-10-11-auth-login-feature.md`

## Decisions & assumptions
| Date | Decision / assumption | Reason | Needs user confirmation? |
|---|---|---|---|

## Open questions for the user
- `...`

## Known issues / tech debt
- `[area]` — `[description]` — severity: low/medium/high

## Environment notes
- Package manager: `npm`
- How to run: see `README.md`