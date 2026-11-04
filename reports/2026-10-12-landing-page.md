# Triển khai Trang chủ Vãng lai (Landing Page) & Kiểm tra Phiên đăng nhập (/auth/me)

**Ngày thực hiện:** 2026-10-12  
**Mục tiêu kế hoạch:** Xây dựng trang chủ vãng lai (`/`) dành cho khách chưa đăng nhập (kiểm tra trạng thái xác thực qua API `/auth/me`), bám sát thiết kế mẫu ở cả 2 chế độ Sáng (Light) và Tối (Dark). Tích hợp đồ thị tri thức tương tác, bản đồ nhiệt năng lực cá nhân hóa, hệ sinh thái tính năng, quy trình 3 bước, danh sách công nghệ/đối tác, hỗ trợ đa ngôn ngữ `next-intl` (`vi` / `en`) và các icon từ `lucide-react`.

---

## Báo cáo thực hiện

STATUS: COMPLETE
SUMMARY: Triển khai hoàn chỉnh trang chủ vãng lai (`/`) chuẩn Feature-Driven trong `src/features/landing`. Kiểm tra trạng thái xác thực với hook `useCurrentUser` (API `/auth/me`), hỗ trợ mượt mà cả 2 chế độ Sáng & Tối, canvas đồ thị tri thức SVG, bản đồ nhiệt năng lực cá nhân hóa, hệ sinh thái 5 tính năng dạng Bento grid, quy trình 3 bước và 100% đa ngôn ngữ (vi/en).
FILES: 
- created:
  - `src/features/auth/hooks/useCurrentUser.ts`
  - `src/features/landing/components/LandingHeader.tsx`
  - `src/features/landing/components/LandingKnowledgeGraph.tsx`
  - `src/features/landing/components/LandingHeatmapCard.tsx`
  - `src/features/landing/components/LandingHero.tsx`
  - `src/features/landing/components/LandingFeatures.tsx`
  - `src/features/landing/components/LandingHowItWorks.tsx`
  - `src/features/landing/components/LandingTechStack.tsx`
  - `src/features/landing/components/LandingFooter.tsx`
  - `src/features/landing/components/LandingPageView.tsx`
  - `src/features/landing/index.ts`
  - `reports/2026-10-12-landing-page.md`
- modified:
  - `src/features/auth/index.ts`
  - `src/app/page.tsx`
  - `src/app/globals.css`
  - `src/components/shared/BrowserLocaleSync.tsx`
  - `src/messages/vi.json`
  - `src/messages/en.json`
  - `TASKS.md`
CHECKS: lint ✔ · typecheck ✔ (`tsc --noEmit`) · tests not run · build ✔ (`next build`)
ASSUMPTIONS: Khi API `/auth/me` trả về lỗi (401/unauthorized), người dùng được xem là khách vãng lai và trang chủ hiển thị trọn vẹn Landing Page; nếu phiên đăng nhập hợp lệ, hệ thống tự động điều hướng vào không gian học tập (`/onboarding`).
RISKS / LIMITATIONS: Không có.
DOCS: updated `TASKS.md`
DEPLOYMENT: not applicable
NEXT: Xây dựng trang Quên mật khẩu (Forgot Password) kết nối API `/auth/forgot-password`.

---

## Chi tiết kết quả kiểm tra trực quan
1. **Chế độ Sáng (Light Mode)**: Màu nền chuẩn `#f6fafe`, hiệu ứng phát quang bán kính lớn, thẻ trắng tương phản cao, SVG đồ thị tri thức và bản đồ nhiệt hiển thị sắc nét.
2. **Chế độ Tối (Dark Mode)**: Màu nền `#0B0F19`, thẻ nền `#161B26` và `#131826`, viền công nghệ xám đậm, điểm nhấn màu Tech Cyan `#38BDF8` và Deep Blue `#2563EB`, SVG đồ thị nền tối chuyển đổi mượt mà.
3. **Đa ngôn ngữ (i18n)**: Tự động phát hiện ngôn ngữ trình duyệt và hỗ trợ ghi đè qua `?lang=vi` / `?lang=en` bằng `BrowserLocaleSync`.
4. **Hiệu ứng cuộn (Scroll Reveal)**: Tích hợp `IntersectionObserver` tự động kích hoạt hiệu ứng trượt xuất hiện theo từng hàng/thẻ, có nút phát lại hiệu ứng xem thử.
