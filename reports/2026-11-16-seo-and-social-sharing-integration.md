# Tích hợp SEO, Social Share Preview & Structured Data cho ILMS (`ilms.page`)

- **Ngày:** 2026-11-16
- **Tóm tắt kế hoạch:** Xây dựng hạ tầng SEO chuẩn Next.js 16 App Router (`metadataBase`, `robots.ts`, `sitemap.ts`, `manifest.ts`), ảnh chia sẻ mạng xã hội `public/og-image.png` (1200×630), chuyển `src/app/page.tsx` thành Server Component để SSR thẻ meta + JSON-LD Schema.org, và chuẩn hóa metadata đa ngôn ngữ (`vi`/`en`) cho toàn bộ route công khai lẫn `noindex` cho route phụ.

```text
STATUS: COMPLETE
SUMMARY: Tích hợp toàn diện Technical SEO, thẻ OpenGraph/Twitter Card (hiển thị đẹp khi chia sẻ lên Facebook, TikTok, Zalo, X, LinkedIn) và JSON-LD Schema.org (Google Rich Results) cho domain https://ilms.page; chuyển trang chủ sang Server Component bọc HomeClientGate để bot mạng xã hội và công cụ tìm kiếm đọc được đầy đủ metadata ngay từ HTML SSR.
FILES:
  created:
    - public/og-image.png
    - src/lib/seo.ts
    - src/app/robots.ts
    - src/app/sitemap.ts
    - src/app/manifest.ts
    - src/features/landing/components/HomeClientGate.tsx
  modified:
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/app/pricing/page.tsx
    - src/app/login/page.tsx
    - src/app/register/page.tsx
    - src/app/terms/page.tsx
    - src/app/privacy/page.tsx
    - src/app/forgot-password/page.tsx
    - src/app/reset-password/page.tsx
    - src/app/onboarding/page.tsx
    - src/app/design-system/page.tsx
    - src/features/landing/index.ts
    - src/messages/vi.json
    - src/messages/en.json
    - TASKS.md
CHECKS: lint not configured (no lint script in package.json) · typecheck ✔ (npx tsc --noEmit) · i18n parity ✔ (1808 keys) · build ✔ (npm run build, 32/32 pages + /robots.txt, /sitemap.xml, /manifest.webmanifest)
ASSUMPTIONS:
  - Domain production chính thức là https://ilms.page (có thể ghi đè qua biến môi trường NEXT_PUBLIC_SITE_URL).
  - Các route học tập sau đăng nhập (/dashboard, /classes, /ai-tutor, ...) được chặn index trong robots.txt để tránh thin content trên Google.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm thử live trên Facebook Sharing Debugger / Zalo / TikTok / Google Rich Results Test bằng URL public thật vì cần deploy bản build mới lên https://ilms.page.
DOCS: updated TASKS.md
DEPLOYMENT: not deployed (cần rebuild & restart PM2 sau khi push/deploy lên server)
NEXT: Deploy bản build mới lên https://ilms.page và kiểm tra link preview trên Facebook Sharing Debugger (https://developers.facebook.com/tools/debug/) + Google Search Console.
```

## Review

- **TypeScript & Code Quality:** `npx tsc --noEmit` đạt 0 lỗi; không dùng `any`, không `@ts-ignore`, không `console.log`.
- **XSS & Bảo mật:** `serializeJsonLd` trong `src/lib/seo.ts` escape ký tự `<` thành `\u003c` theo chuẩn khuyến nghị của Next.js 16 trước khi nhúng vào `dangerouslySetInnerHTML`.
- **i18n Symmetry:** Namespace `seo` trong `src/messages/vi.json` và `src/messages/en.json` đối xứng 100% (tổng `1808` khóa).
- **App Router & Crawler Compatibility:** `src/app/page.tsx` không còn `'use client'`, giúp HTML trả về từ server có sẵn `<title>`, `<meta property="og:*">`, `<meta name="twitter:*">`, `<link rel="canonical">` và `<script type="application/ld+json">`. Các file `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` đã xuất hiện trong build output của Next.js 16.
