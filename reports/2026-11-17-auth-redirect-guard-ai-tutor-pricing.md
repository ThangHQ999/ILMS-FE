# Triển khai Auth Guard & Post-Login Redirect cho Hỏi Cú AI và Pricing

- **Ngày:** 2026-11-17
- **Tóm tắt kế hoạch:** Tạo helper `src/lib/auth-redirect.ts` chống Open Redirect, nâng cấp luồng đăng nhập (`useLoginForm`, `LoginPageView`, `useOAuthLogin`, `/auth/callback`) hỗ trợ `?redirect=...`, và gắn kiểm tra đăng nhập cho nút **Hỏi Cú AI** ở Trang chủ (`/` → `/ai-tutor`) cùng nút chọn gói ở **Pricing** (`/pricing`).

```text
STATUS: COMPLETE
SUMMARY: Triển khai cơ chế bắt buộc đăng nhập và chuyển hướng đúng trang đích sau khi đăng nhập thành công cho nút Hỏi Cú AI trên trang chủ (đẩy sang /ai-tutor) và chọn gói cước trên trang /pricing (đẩy quay lại /pricing), hỗ trợ cả đăng nhập Email/Mật khẩu lẫn OAuth2.
FILES:
  created:
    - src/lib/auth-redirect.ts
  modified:
    - src/features/auth/hooks/useLoginForm.ts
    - src/features/auth/components/LoginPageView.tsx
    - src/features/auth/hooks/useOAuthLogin.ts
    - src/app/auth/callback/page.tsx
    - src/features/landing/components/sections/LandingHeroSection.tsx
    - src/features/pricing/components/PricingPageView.tsx
    - TASKS.md
CHECKS: lint not configured · typecheck ✔ (npx tsc --noEmit) · build ✔ (npm run build, 32/32 pages)
ASSUMPTIONS:
  - Khi người dùng chưa đăng nhập bấm "Hỏi Cú AI" trên trang chủ, sẽ chuyển tới /login?redirect=/ai-tutor (giữ ?prompt=... nếu có nhập câu hỏi) và sau khi đăng nhập thành công sẽ chuyển thẳng tới /ai-tutor.
  - Khi người dùng chưa đăng nhập bấm chọn gói trả phí trên /pricing, sẽ chuyển tới /login?redirect=/pricing và sau khi đăng nhập thành công sẽ quay lại /pricing.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm thử end-to-end trực tiếp trên trình duyệt với phiên OAuth thật.
  - Next.js 16.4.3 hiển thị cảnh báo lỗ hổng bảo mật cần cân nhắc nâng cấp Next.js (`next upgrade --agent=security`).
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Kiểm thử nhanh 2 luồng trên trình duyệt ở trạng thái chưa đăng nhập (Trang chủ → Hỏi Cú AI → Login → /ai-tutor, và /pricing → Chọn gói → Login → /pricing).
```

## Review

- **Bảo mật Open Redirect:** `getSafeRedirectPath` trong `src/lib/auth-redirect.ts` chỉ chấp nhận đường dẫn tương đối nội bộ bắt đầu bằng `/` và loại trừ `//` hoặc `/\`, tự động fallback về `/dashboard` nếu giá trị không hợp lệ.
- **Tách lớp Feature-Driven:** Các feature (`landing`, `pricing`, `auth`) chỉ import helper dùng chung từ `@/lib/auth-redirect` và public API `@/features/auth`, không import chéo nội bộ giữa các feature.
- **TypeScript & Build:** `npx tsc --noEmit` và `npm run build` đều hoàn tất với exit code `0` (32/32 route).
