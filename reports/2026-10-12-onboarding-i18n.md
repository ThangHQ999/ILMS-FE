# Onboarding Page i18n Standardization & Browser Locale Auto-Detection

Date: 2026-10-12
Plan summary: Loại bỏ 100% hardcoded tiếng Việt trên trang Onboarding (/onboarding), chuẩn hóa toàn bộ bố cục, tính cách AI, màu sắc, phông chữ, preview và footer sang next-intl.

STATUS: COMPLETE
SUMMARY: Đã chuyển đổi toàn bộ trang Onboarding (/onboarding) từ hardcoded tiếng Việt sang hệ thống i18n chuẩn hóa (vi.json và en.json). Toàn bộ 4 bước thiết lập cá nhân hóa (Bố cục hiển thị, Tính cách AI, Màu sắc & Giao diện, Phông chữ hệ thống) cùng khung Live Preview và Footer đều tự động nhận diện ngôn ngữ theo Browser Locale.
FILES:
- Modified: src/messages/vi.json, src/messages/en.json, src/features/onboarding/constants.ts, src/features/onboarding/hooks/useOnboarding.ts, src/features/onboarding/components/OnboardingHeader.tsx, src/features/onboarding/components/OnboardingLayoutSection.tsx, src/features/onboarding/components/OnboardingPersonaSection.tsx, src/features/onboarding/components/OnboardingColorSection.tsx, src/features/onboarding/components/OnboardingFontSection.tsx, src/features/onboarding/components/OnboardingLivePreview.tsx, src/features/onboarding/components/OnboardingFooter.tsx, TASKS.md
CHECKS: lint not run · typecheck ✔ · tests not run · build ✔ (exit code 0, 10 static/dynamic routes compiled)
ASSUMPTIONS: Trình duyệt hỗ trợ header Accept-Language tiêu chuẩn; fallback mặc định là 'vi' nếu không nhận diện được ngôn ngữ hỗ trợ.
RISKS / LIMITATIONS: Không có. Đã xác thực trực tiếp qua browser subagent hiển thị chuẩn 100% trên môi trường trình duyệt.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Tiếp tục triển khai trang Quên mật khẩu (/forgot-password) hoặc tích hợp router guards.
