# Feature: Auth Register Page (Đăng ký tài khoản ILMS)

Date: 2026-10-12
Plan summary: Xây dựng trang Đăng ký (Register) chuẩn Desktop 16:9 Split + Bento 3D Showcase từ bản mẫu HTML/CSS của người dùng, hỗ trợ đầy đủ 2 chế độ Sáng / Tối, tích hợp API `POST /auth/register` và Zod validation.

```text
STATUS: COMPLETE
SUMMARY: Triển khai thành công trang Đăng ký tài khoản (Register) chuẩn kiến trúc Feature-Driven, hỗ trợ trọn vẹn cả giao diện Sáng và Tối, thước đo độ an toàn mật khẩu thời gian thực, kết nối API POST /auth/register và định tuyến Next.js App Router.
FILES: 
  - created:
    - src/features/auth/hooks/useRegister.ts
    - src/features/auth/hooks/useRegisterForm.ts
    - src/features/auth/components/RegisterHeader.tsx
    - src/features/auth/components/RegisterForm.tsx
    - src/features/auth/components/PasswordStrengthMeter.tsx
    - src/features/auth/components/RegisterShowcase.tsx
    - src/features/auth/components/RegisterTrustMetrics.tsx
    - src/features/auth/components/RegisterFooter.tsx
    - src/features/auth/components/RegisterPageView.tsx
  - modified:
    - src/features/auth/schemas/auth.schema.ts
    - src/features/auth/services/auth.service.ts
    - src/features/auth/types.ts
    - src/features/auth/index.ts
    - src/app/register/page.tsx
    - TASKS.md
CHECKS: lint ✔ · typecheck ✔ · build ✔ (exit code 0)
ASSUMPTIONS: Endpoint POST /auth/register nhận body gồm { email, password, firstName, middleName, lastName } và trả về envelope ApiResponse<UserProfile>.
RISKS / LIMITATIONS: None. Tất cả component đều < 150 dòng và kiểm tra thực tế trên trình duyệt đạt độ thẩm mỹ cao.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Xây dựng trang Quên mật khẩu (Forgot Password) kết nối API /auth/forgot-password.
```

## Review
- Đã kiểm tra tính đồng bộ giữa hai chế độ Sáng (Light) và Tối (Dark).
- Đã kiểm tra build Next.js (TypeScript typecheck & SSG static generation) hoàn tất thành công 100%.
- Kiểm tra tính bảo mật: không lộ secret, không sử dụng `any`, xử lý đầy đủ các state form.
