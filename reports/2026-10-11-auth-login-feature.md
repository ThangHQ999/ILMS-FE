# Xây dựng Tính năng Auth (Login) Chuẩn Feature-Driven

- **Date:** 2026-10-11
- **Plan Summary:** Thiết kế Zod Schema, Service API, Query Hooks, tách sub-components <= 150 dòng, tích hợp đa ngôn ngữ i18n & semantic theme tokens.

## Báo cáo thực hiện

STATUS: COMPLETE
SUMMARY: Triển khai toàn diện feature `auth` (Login) theo đúng Feature-Driven Architecture, tài liệu `docs/api-spec.md`, quy chuẩn `10-code.md` và `20-i18n-theme.md`. Toàn bộ các component đều tuân thủ độ dài <= 150 dòng.
FILES: 
- Created: `src/types/common.ts`, `src/lib/axios.ts`, `src/lib/utils.ts`
- Created: `src/messages/vi.json`, `src/messages/en.json`, `src/i18n/request.ts`
- Created: `src/features/auth/schemas/auth.schema.ts`, `src/features/auth/constants.ts`, `src/features/auth/types.ts`
- Created: `src/features/auth/services/auth.service.ts`, `src/features/auth/hooks/useLogin.ts`, `src/features/auth/hooks/useLoginForm.ts`
- Created: `src/features/auth/components/LoginHeader.tsx`, `src/features/auth/components/IdentifierInput.tsx`, `src/features/auth/components/PasswordInput.tsx`, `src/features/auth/components/LoginForm.tsx`, `src/features/auth/components/LoginSocialButtons.tsx`, `src/features/auth/components/LoginSecurityBadge.tsx`, `src/features/auth/components/LoginFooter.tsx`, `src/features/auth/components/LoginPageView.tsx`
- Created: `src/features/auth/index.ts`
- Created: `src/providers/ThemeProvider.tsx`, `src/providers/QueryProvider.tsx`, `src/providers/index.tsx`
- Created: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/login/page.tsx`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.js`
- Modified: `package.json`, `tsconfig.json`, `TASKS.md`
CHECKS: lint ✔ · typecheck ✔ · tests ✔ (schema validated) · build ✔ (Next.js build succeeded 100%)
ASSUMPTIONS: API endpoint `POST /auth/login` trả cookie HttpOnly (`withCredentials: true`); semantic tokens tự động hỗ trợ Light & Dark theme qua `next-themes`.
RISKS / LIMITATIONS: Cần kết nối với backend server thật đang chạy ở URL cấu hình `NEXT_PUBLIC_API_URL` để thực hiện authentication trực tiếp.
DOCS: updated `TASKS.md`
DEPLOYMENT: not applicable
NEXT: Chạy `npm run dev` trên terminal để xem giao diện tại `http://localhost:3000` (hoặc `http://localhost:3000/login`).

## Review
- **Arch Review:** Đã tách triệt để các sub-component: `IdentifierInput` (55 dòng), `PasswordInput` (95 dòng), `LoginForm` (85 dòng), `LoginHeader` (115 dòng), `LoginPageView` (85 dòng). Tất cả đều dưới ngưỡng 150 dòng.
- **Theme & i18n Review:** Không chứa bất kỳ mã màu hardcode nào (`#hex` hay class thô). 100% text giao diện nằm trong `vi.json` và `en.json` với keys khớp nhau hoàn toàn.
