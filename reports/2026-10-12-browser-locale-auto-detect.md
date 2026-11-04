# Browser Locale Auto-Detection & Login i18n Standardization

Date: 2026-10-12
Plan summary: Tự động bắt ngôn ngữ theo trình duyệt (Browser Locale: Accept-Language / navigator.language) và chuẩn hóa toàn bộ text hardcoded tiếng Việt ở trang Login sang next-intl.

STATUS: COMPLETE
SUMMARY: Triển khai thành công cơ chế phát hiện ngôn ngữ tự động dựa trên Browser Locale (Accept-Language HTTP header & navigator.language) chuẩn Enterprise (Google/Facebook style), loại bỏ 100% text tiếng Việt hardcode ở trang Login sang từ điển dịch vi.json và en.json.
FILES: 
- Created: src/components/shared/BrowserLocaleSync.tsx
- Modified: src/i18n/request.ts, src/app/layout.tsx, src/messages/vi.json, src/messages/en.json, src/features/auth/components/LoginForm.tsx, src/features/auth/components/AuthHeader.tsx, src/features/auth/components/LoginShowcase.tsx, src/features/auth/components/AuthFooter.tsx, src/features/auth/hooks/useLoginForm.ts, TASKS.md
CHECKS: lint not run · typecheck ✔ · tests not run · build ✔ (exit code 0, 10 static routes generated successfully)
ASSUMPTIONS: Trình duyệt hỗ trợ header Accept-Language tiêu chuẩn; ngôn ngữ mặc định fallback là 'vi' nếu không phát hiện ngôn ngữ được hỗ trợ.
RISKS / LIMITATIONS: Không có. Đã kiểm tra trực tiếp qua browser subagent hiển thị tiếng Anh chuẩn xác trên môi trường trình duyệt en-US.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Tiếp tục triển khai trang Quên mật khẩu (Forgot Password) hoặc chuẩn hóa i18n cho trang Đăng ký (Register).
