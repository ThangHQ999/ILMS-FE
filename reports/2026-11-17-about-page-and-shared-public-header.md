# Xây dựng trang Về chúng tôi (`/about`) & Đồng bộ Header Công khai

- **Ngày:** 2026-11-17
- **Tóm tắt kế hoạch:** Tạo feature `src/features/about` và route `src/app/about/page.tsx` theo phong cách tối giản Material 3, tách `LandingHeader` thành `src/components/shared/PublicHeader.tsx` để dùng chung cho Trang chủ (`/`), `/about` và `/pricing`, cập nhật SEO (`sitemap.ts`, `robots.ts`, `icons` trong `layout.tsx`) và đa ngôn ngữ đối xứng (`vi.json`, `en.json`).

```text
STATUS: COMPLETE
SUMMARY: Hoàn thiện trang Về chúng tôi (/about) theo phong cách tối giản Material 3 với Light/Dark mode, đa ngôn ngữ đối xứng vi/en, JSON-LD AboutPage, đồng thời dùng chung PublicHeader (header của trang chủ) cho cả /about và /pricing, cập nhật sitemap/robots và tối ưu khai báo favicon trong layout.tsx.
FILES:
  created:
    - src/components/shared/PublicHeader.tsx
    - src/features/about/components/AboutPageView.tsx
    - src/features/about/index.ts
    - src/app/about/page.tsx
  modified:
    - src/components/shared/index.ts
    - src/features/landing/components/LandingHeader.tsx
    - src/features/pricing/components/PricingPageView.tsx
    - src/features/auth/components/RegisterHeader.tsx
    - src/app/sitemap.ts
    - src/app/robots.ts
    - src/app/layout.tsx
    - src/messages/vi.json
    - src/messages/en.json
    - TASKS.md
CHECKS: lint not configured · typecheck ✔ (npx tsc --noEmit) · i18n parity ✔ (1847 keys) · build ✔ (npm run build, 33/33 pages)
ASSUMPTIONS:
  - Mục Đội ngũ dùng tên chung Đội ngũ ILMS / EduTech Innovations và email liên hệ support@ilms.page theo đề xuất mặc định.
  - Các anchor link trong PublicHeader (#tinh-nang-noi-bat, #khong-gian-lop-hoc, #quy-trinh-hoat-dong) chuyển thành /#... để điều hướng về đúng phân cảnh trang chủ khi bấm từ /about hoặc /pricing.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm tra trực quan trang /about trên trình duyệt sau khi build.
  - Next.js 16.4.3 hiển thị cảnh báo lỗ hổng bảo mật cần nâng cấp (`next upgrade --agent=security`).
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Mở /about và /pricing trên trình duyệt (cả Light & Dark mode) để rà soát giao diện và menu điều hướng PublicHeader.
```

## Review

- **Kiến trúc Feature-Driven:** `PublicHeader` được đặt tại `src/components/shared/PublicHeader.tsx`, giúp `landing`, `pricing` và `about` dùng chung một header mà không vi phạm quy tắc không import chéo giữa các feature; `LandingHeader.tsx` re-export lại để giữ tương thích ngược.
- **SEO & i18n:** `/about` có `generateMetadata()` + JSON-LD `AboutPage` (`serializeJsonLd` escape `<`), đã thêm vào `sitemap.ts` và `robots.ts`; `vi.json` và `en.json` khớp 100% (`1847` khóa).
- **Favicon Google Search:** Đã bỏ `?v=5` và khai báo kích thước vuông rõ ràng (`512x512` cho PNG, `any` cho `/favicon.ico`) trong `src/app/layout.tsx`.
