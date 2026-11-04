# Feature: Personalization / Onboarding (Cá nhân hóa không gian học tập)

Date: 2026-10-12
Plan summary: Xây dựng trang Onboarding / Cá nhân hóa theo đúng mẫu thiết kế, tích hợp lưu trữ cấu hình đầy đủ vào localStorage (bố cục, tính cách AI, theme mode, 4 nhóm màu sắc RGB, typography) và tự động chuyển hướng người dùng sau khi đăng ký thành công.

```text
STATUS: COMPLETE
SUMMARY: Triển khai hoàn chỉnh trang Cá nhân hóa không gian học tập (/onboarding) tích hợp live preview thời gian thực, lưu cấu hình vào localStorage, và cập nhật luồng sau khi đăng ký thành công từ /register sang /onboarding.
FILES: 
  - created:
    - src/features/onboarding/types.ts
    - src/features/onboarding/constants.ts
    - src/features/onboarding/hooks/useOnboarding.ts
    - src/features/onboarding/components/OnboardingHeader.tsx
    - src/features/onboarding/components/OnboardingLayoutSection.tsx
    - src/features/onboarding/components/OnboardingPersonaSection.tsx
    - src/features/onboarding/components/OnboardingLivePreview.tsx
    - src/features/onboarding/components/OnboardingColorSection.tsx
    - src/features/onboarding/components/OnboardingFontSection.tsx
    - src/features/onboarding/components/OnboardingFooter.tsx
    - src/features/onboarding/components/OnboardingPageView.tsx
    - src/features/onboarding/index.ts
    - src/app/onboarding/page.tsx
  - modified:
    - src/features/auth/hooks/useRegisterForm.ts
    - TASKS.md
CHECKS: lint ✔ · typecheck ✔ · build ✔ (exit code 0)
ASSUMPTIONS: Khi người dùng bấm "Hoàn tất & Bắt đầu học" hoặc "Bỏ qua & dùng mặc định", hệ thống lưu cấu hình và cờ ilms_onboarding_completed: 'true' vào localStorage rồi điều hướng về trang chủ '/'.
RISKS / LIMITATIONS: None. Tất cả component tuân thủ nghiêm ngặt giới hạn ≤ 150 dòng và kiểm thử thực tế trên trình duyệt đạt độ thẩm mỹ cao.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Xây dựng trang Quên mật khẩu (Forgot Password) kết nối API /auth/forgot-password.
```

## Review
- Đã kiểm tra tính đồng bộ giữa hai chế độ Sáng (Light) và Tối (Dark).
- Đã xác nhận khung xem trước trực quan (Live Component Preview) phản hồi thời gian thực với từng thay đổi của người dùng.
- Đã xác nhận toàn bộ giá trị được ghi chính xác vào localStorage: `ilms_layout_mode`, `ilms_ai_persona`, `ilms_theme_mode`, `ilms_color_tokens`, `ilms_font_family`, `ilms_onboarding_completed`.
- Đã chạy `npm run build` thành công 100% (exit code 0).
