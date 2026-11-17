# Xây dựng trang Điều khoản dịch vụ (`/terms`) & Chính sách bảo mật (`/privacy`)

- **Ngày:** 2026-11-17
- **Tóm tắt kế hoạch:** Tạo feature `src/features/legal` với component dùng chung `LegalDocumentView` (phong cách tối giản Material 3, dùng `<PublicHeader />` của trang chủ), tách `TermsPageView` và `PrivacyPageView`, kết nối vào `src/app/terms/page.tsx` và `src/app/privacy/page.tsx` giữ nguyên `generateMetadata()`, và bổ sung nội dung đa ngôn ngữ đối xứng (`vi.json` / `en.json`).

```text
STATUS: COMPLETE
SUMMARY: Hoàn thiện trang Điều khoản dịch vụ (/terms) và Chính sách bảo mật (/privacy) theo phong cách tối giản Material 3, dùng chung PublicHeader của trang chủ, có chuyển đổi tab /terms ↔ /privacy, mục lục nhanh 6 điều khoản, Light/Dark mode và đa ngôn ngữ đối xứng vi/en.
FILES:
  created:
    - src/features/legal/components/LegalDocumentView.tsx
    - src/features/legal/components/TermsPageView.tsx
    - src/features/legal/components/PrivacyPageView.tsx
    - src/features/legal/index.ts
  modified:
    - src/app/terms/page.tsx
    - src/app/privacy/page.tsx
    - src/messages/vi.json
    - src/messages/en.json
    - TASKS.md
CHECKS: lint not configured · typecheck ✔ (npx tsc --noEmit) · i18n parity ✔ (1889 keys) · build ✔ (npm run build, 33/33 pages)
ASSUMPTIONS:
  - Nội dung 6 mục của Điều khoản và 6 mục của Chính sách bảo mật dùng mẫu chuẩn mực cho nền tảng học tập AI ILMS (email support@ilms.page).
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm tra trực quan giao diện /terms và /privacy trên trình duyệt sau khi build.
  - Next.js 16.4.3 hiển thị cảnh báo lỗ hổng bảo mật cần nâng cấp (`next upgrade --agent=security`).
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Mở /terms và /privacy trên trình duyệt (thử chuyển đổi VI/EN và Light/Dark mode) để rà soát nội dung và giao diện.
```

## Review

- **Không trùng lặp logic:** Cả `/terms` và `/privacy` dùng chung `LegalDocumentView` với prop `variant: 'terms' | 'privacy'` đọc từ `legal.${variant}` trong i18n.
- **Tách lớp & SEO:** `src/app/terms/page.tsx` và `src/app/privacy/page.tsx` vẫn là Server Component mỏng export `generateMetadata()`, nội dung hiển thị phong phú hơn đáng kể giúp Googlebot tạo snippet mô tả chính xác.
- **i18n & Typecheck:** `vi.json` và `en.json` đối xứng 100% (`1889` khóa), `npx tsc --noEmit` và `npm run build` đạt 0 lỗi.
