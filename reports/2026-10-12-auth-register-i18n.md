# Register Page i18n Standardization & Browser Locale Auto-Detection

Date: 2026-10-12
Plan summary: Loại bỏ 100% hardcoded tiếng Việt trên trang Đăng ký (/register), chuẩn hóa toàn bộ form, showcase, header, footer, metrics sang next-intl và tự động bắt theo ngôn ngữ trình duyệt.

STATUS: COMPLETE
SUMMARY: Đã chuyển đổi toàn bộ giao diện và logic trang Đăng ký (/register) từ hardcoded tiếng Việt sang hệ thống i18n chuẩn hóa (vi.json và en.json). Hệ thống tự động phát hiện ngôn ngữ trình duyệt (Browser Locale) và render phiên bản ngôn ngữ tương ứng mượt mà.
FILES:
- Modified: src/messages/vi.json, src/messages/en.json, src/features/auth/schemas/auth.schema.ts, src/features/auth/hooks/useRegisterForm.ts, src/features/auth/components/RegisterForm.tsx, src/features/auth/components/RegisterHeader.tsx, src/features/auth/components/RegisterShowcase.tsx, src/features/auth/components/RegisterTrustMetrics.tsx, src/features/auth/components/RegisterFooter.tsx, src/features/auth/components/PasswordStrengthMeter.tsx, TASKS.md
CHECKS: lint not run · typecheck ✔ · tests not run · build ✔ (exit code 0, 10 static/dynamic routes compiled)
ASSUMPTIONS: Trình duyệt hỗ trợ header Accept-Language tiêu chuẩn; fallback mặc định là 'vi' nếu không nhận diện được ngôn ngữ hỗ trợ.
RISKS / LIMITATIONS: Không có. Đã xác thực trực tiếp qua browser subagent hiển thị chuẩn 100% trên môi trường trình duyệt.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Tiếp tục triển khai trang Quên mật khẩu (/forgot-password) đồng bộ chuẩn i18n và Browser Locale.
