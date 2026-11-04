# Báo cáo: Rà soát & Đồng bộ Hệ thống Màu sắc, Phông chữ và Cập nhật Bảng màu Mặc định Onboarding

**Ngày thực hiện:** 2026-10-13  
**Phạm vi:** Khắc phục lỗi tùy chỉnh màu sắc và phông chữ trong Onboarding không đồng bộ sang Dashboard và toàn hệ thống; cập nhật 4 màu mặc định Light Mode theo thiết kế ảnh cung cấp.

---

## 1. Mục tiêu và Yêu cầu
1. **Rà soát & Khắc phục lỗi đổi màu/phông chữ:** Khi người dùng chọn màu hoặc phông chữ trong Onboarding (`/onboarding`), các thay đổi phải được lưu trữ vào `localStorage` (`ilms_color_tokens`, `ilms_font_family`) và áp dụng tức thời cho toàn bộ ứng dụng (Dashboard, Landing Page, Navigation, v.v.) cũng như giữ nguyên sau khi reload trang.
2. **Cập nhật 4 màu mặc định chế độ Sáng (Light Mode):** Cập nhật chính xác theo ảnh thiết kế cung cấp:
   - **Primary:** `#0A192F` (Midnight Navy / rgb: `10 25 47`)
   - **Secondary:** `#007BFF` (Tech Blue / rgb: `0 123 255`)
   - **Tertiary:** `#6C5CE7` (Electric Indigo / rgb: `108 92 231`)
   - **Neutral:** `#F0F4F8` (Soft Surface / rgb: `240 244 248`)

---

## 2. Nguyên nhân gốc rễ (Root Cause)
1. **Thiếu cơ chế đồng bộ biến CSS toàn cục:** Trước đây chỉ có trang `/design-system` có hook cục bộ, `RootLayout` không có component hay inline script nào đọc `localStorage` để gán các biến CSS `--color-primary`, `--color-secondary`, `--color-tertiary`, `--color-neutral`, và `--font-sans` vào `:root`.
2. **Hardcoded CSS Classes:** Nhiều component trong Dashboard dùng cứng các class `bg-blue-600`, `text-blue-600` thay vì sử dụng semantic tokens `bg-primary`, `bg-secondary`, `bg-tertiary`, `text-secondary`, v.v.

---

## 3. Các thay đổi đã thực hiện

### A. Cấu hình & Biến CSS gốc
- **`src/features/onboarding/constants.ts`:**
  - Cập nhật palette mặc định với phần tử `[0]` là 4 mã màu chuẩn xác: `#0A192F`, `#007BFF`, `#6C5CE7`, `#F0F4F8`.
- **`src/hooks/useDesignSystem.ts`:**
  - Cập nhật `DEFAULT_COLOR_TOKENS_LIGHT` theo chuẩn RGB: `10 25 47`, `0 123 255`, `108 92 231`, `240 244 248`.
- **`src/app/globals.css`:**
  - Cập nhật các biến CSS `:root` mặc định.
  - Khai báo `font-family: var(--font-sans);` cho `body`.

### B. Cơ chế Đồng bộ Real-time & Chống FOUC
- **`src/components/shared/DesignSystemSync.tsx`:**
  - Component client-side gắn vào `RootLayout` lắng nghe sự kiện `storage` và custom event `ilms_design_system_change` để đồng bộ CSS variables ngay lập tức khi người dùng click chọn trong Onboarding mà không cần refresh.
- **`src/app/layout.tsx`:**
  - Thêm inline `<script>` trong `<head>` để đọc `localStorage` và set biến CSS trước khi render trang, loại bỏ hiện tượng giật giao diện (Flash of Unstyled Content - FOUC).
  - Tích hợp `<DesignSystemSync />`.

### C. Refactor Component sang Semantic Tokens
- **`src/features/onboarding/hooks/useOnboarding.ts`:**
  - Tự động lưu `localStorage` và phát custom event `ilms_design_system_change` khi chọn màu (`selectColor`) hoặc phông chữ (`selectFont`).
- **`src/features/dashboard/components/`:**
  - `DashboardPageView.tsx`: Áp dụng `font-sans`, `border-secondary`, `selection:bg-secondary/20`.
  - `DashboardSidebar.tsx`: Chuyển các nút icon active, trạng thái hover sang `bg-secondary`, `text-secondary`.
  - `DashboardHeader.tsx`: Chuyển badge, nút chế độ sang `bg-secondary`, `text-secondary`, `bg-primary`.
  - `NotificationDropdown.tsx`: Chuyển badge số lượng, nút đọc sang `bg-secondary`, `text-secondary`.
  - `HeroLearningCard.tsx`: Chuyển nút CTA "Vào học ngay", thanh tiến độ, watermark, nút lưu bài sang `bg-secondary`, `text-secondary`.
  - `ZenHeaderBanner.tsx`: Chuyển icon và status dot sang `bg-secondary`, `text-secondary`.
  - `AITaskChecklist.tsx`: Chuyển checkbox accent, link badge sang `accent-secondary`, `text-secondary`.
  - `SocraticAICoach.tsx`: Chuyển thanh kéo resizer, nút mở FAB, nút gửi tin nhắn, bong bóng chat sang `bg-secondary`, `bg-primary`.
  - `CompetencyHeatmap.tsx`: Chuyển thanh tiến độ năng lực, liên kết xem chi tiết sang `bg-secondary`, `text-secondary`.
  - `CourseProgressTable.tsx`: Chuyển ô tìm kiếm focus ring, filter tabs sang `focus:ring-secondary`, `text-secondary`.
  - `SocraticMarkdownRenderer.tsx`: Chuyển định dạng tiêu đề, trích dẫn, mã nguồn sang `text-secondary`, `border-secondary`.

---

## 4. Kết quả Kiểm thử & Xác thực

1. **Kiểm tra kiểu dữ liệu & Build:**
   - `npx tsc --noEmit`: 0 lỗi.
   - `npm run build`: Hoàn thành thành công toàn bộ static & dynamic routes.
2. **Kiểm thử trực quan trên Browser Subagent:**
   - Mở `/onboarding`: Xác nhận 4 màu mặc định hiển thị đúng: `#0A192F`, `#007BFF`, `#6C5CE7`, `#F0F4F8`.
   - Thử nghiệm đổi màu Secondary sang **Purple (`#8B5CF6`)** và đổi Font sang **Inter**.
   - Bấm Submit và truy cập `/dashboard`: Toàn bộ các nút CTA, thanh tiến độ, icon, badge và kiểu chữ của Dashboard lập tức chuyển sang màu Purple và font Inter đồng bộ và chuẩn xác.

---

## 5. Báo cáo Tổng kết
```text
STATUS: COMPLETE
SUMMARY: Rà soát và kết nối hệ thống biến CSS toàn cục cho màu sắc & font chữ từ Onboarding sang Dashboard; cập nhật 4 màu mặc định Light Mode theo ảnh (#0A192F, #007BFF, #6C5CE7, #F0F4F8).
FILES:
  - Created: src/components/shared/DesignSystemSync.tsx
  - Modified: src/app/layout.tsx, src/app/globals.css, src/features/onboarding/constants.ts, src/features/onboarding/hooks/useOnboarding.ts, src/hooks/useDesignSystem.ts, src/features/dashboard/components/*
CHECKS: lint (N/A) · typecheck ✔ · build ✔ · browser test ✔
ASSUMPTIONS: None
RISKS / LIMITATIONS: None
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Tiếp tục các hạng mục theo lộ trình PRD (Reset Password / API authentication).
```
