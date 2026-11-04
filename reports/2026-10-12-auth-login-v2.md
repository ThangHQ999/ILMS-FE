# Giao diện Đăng nhập ILMS Phiên bản 2 (Desktop 16:9 Split & Bento 3D Showcase)

- **Date:** 2026-10-12
- **Plan Summary:** Lưu logo dự án vào `public/logo.png`, xây dựng giao diện đăng nhập phiên bản mới với desktop 16:9 split layout, card Bento 3D, floating assistant card, kết nối API đăng nhập và định tuyến liên kết.

## Báo cáo thực hiện

STATUS: COMPLETE
SUMMARY: Đã lưu logo dự án vào `public/logo.png`, chuyển đổi và cấu trúc mã nguồn HTML/CSS giao diện sáng & tối thành các sub-component React chuẩn production (mỗi file <= 150 dòng), kết nối gọi API qua hook `useLoginForm` & `useLogin`, và tích hợp điều hướng sang các trang liên kết (`/register`, `/forgot-password`, `/terms`, `/privacy`).
FILES:
- Created: `public/logo.png`, `public/logo-light.png`, `public/logo-dark.png`
- Created: `src/features/auth/components/AuthHeader.tsx`
- Created: `src/features/auth/components/AuthFooter.tsx`
- Created: `src/features/auth/components/LoginShowcase.tsx`
- Created: `src/features/auth/components/LoginForm.tsx`
- Created: `src/features/auth/components/LoginPageView.tsx`
- Created: `src/features/auth/hooks/useLoginForm.ts`
- Created: `src/app/register/page.tsx`, `src/app/forgot-password/page.tsx`, `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`
- Modified: `src/features/auth/index.ts`, `src/app/login/page.tsx`, `src/app/page.tsx`, `src/app/layout.tsx`, `TASKS.md`
CHECKS: lint ✔ · typecheck ✔ · tests ✔ · build ✔ (Next.js build succeeded 100%, 9 routes generated)
ASSUMPTIONS: API endpoint `POST /auth/login` nhận `{ email, password }` và trả JWT qua cookie; logo dự án dùng chung cho cả theme sáng và tối.
RISKS / LIMITATIONS: Cần kết nối backend thực tế để xác thực đăng nhập live.
DOCS: updated `TASKS.md`
DEPLOYMENT: not applicable
NEXT: Triển khai trang Đăng ký (Register) theo kế hoạch task tiếp theo.

## Review
- **Component Size:** Toàn bộ component đều <= 150 dòng code (`AuthHeader`: 75 dòng, `AuthFooter`: 60 dòng, `LoginShowcase`: 110 dòng, `LoginForm`: 145 dòng, `LoginPageView`: 65 dòng).
- **Navigation & Links:** Tự động kết nối đầy đủ các link: `/`, `/register`, `/forgot-password`, `/terms`, `/privacy`.
