# Báo cáo Triển khai Trang Bảng giá & Gói cước AI (/pricing) chuẩn Google Material 3 / Gemini Dark & Light UI

**Ngày thực hiện:** 15/11/2026  
**Trạng thái:** COMPLETE  
**Người thực hiện:** Antigravity AI  

---

## 1. Tóm tắt yêu cầu (Summary)
Người dùng cung cấp mã nguồn giao diện HTML mẫu của trang Bảng giá & Gói cước ("Bảng giá & Gói cước | ILMS Platform") và yêu cầu:
1. Hiện thực hóa trang theo thiết kế Google Material 3 / Gemini clean flat design.
2. Tích hợp Header chung của dự án (`PricingHeader` tương thích Dark/Light, đa ngôn ngữ, user dropdown / guest auth, streak, thông báo).
3. Hỗ trợ đầy đủ 2 chế độ Sáng (Light) & Tối (Dark) chuẩn bộ token thiết kế Gemini.
4. Đa ngôn ngữ đối xứng (`vi.json` và `en.json`) qua `next-intl`.
5. Nối toàn diện các API liên quan: `useMySubscription`, `useStorageSummary`, `useSubscribePlan` (Phân hệ 17 Subscriptions & Storage).

---

## 2. Các thành phần đã triển khai (Files Created & Modified)

### 2.1. Feature & UI Components (`src/features/pricing/`)
- `src/features/pricing/components/PricingHeader.tsx`: Header phong cách Google Gemini tích hợp logo dark/light, liên kết điều hướng (`/classes`, `/knowledge-graph`, `/pricing`, `/ai-tutor`), huy hiệu streak 14 ngày, nút thông báo, `LanguageSwitcher`, `ThemeToggle`, và khối profile người dùng (`UserMenuDropdown` khi đã đăng nhập / nút Đăng nhập & Đăng ký khi là khách).
- `src/features/pricing/components/PricingHero.tsx`: Thẻ chip Material 3, tiêu đề và mô tả, kèm **Current Status Card** lấy dữ liệu động từ `useMySubscription` và `useStorageSummary` (hạn mức ổ lưu trữ Cloud, hạn mức câu hỏi AI Socratic hàng ngày, thanh tiến độ % trực quan), cùng công tắc chuyển đổi chu kỳ thanh toán Hàng tháng / Theo năm (chiết khấu -20%).
- `src/features/pricing/components/PricingCards.tsx`: 4 thẻ Bento cước phí (Cơ bản - 0₫ trọn đời, Plus - 99k/79k khuyên dùng với viền nhấn nổi bật, Pro - 199k/159k, Doanh nghiệp - 499k/399k). Tự động vô hiệu hóa và đánh dấu "Gói hiện tại" nếu gói trùng với gói của người dùng, hoặc kích hoạt modal thanh toán.
- `src/features/pricing/components/PricingComparisonTable.tsx`: Bảng ma trận so sánh chi tiết tất cả các thông số kỹ thuật (Dung lượng, Lượt hỏi AI, Đồ thị tri thức, Tự động tạo Quiz AI, Khóa học, Chấm bài tự luận AI, Tên miền riêng, Cấp độ hỗ trợ SLA), hỗ trợ cuộn ngang mượt mà trên mobile.
- `src/features/pricing/components/PricingFaq.tsx`: Khối accordion giải đáp các câu hỏi thường gặp về vai trò Giảng viên/Học viên, chính sách bảo lưu dữ liệu khi hết hạn, cổng thanh toán và hóa đơn điện tử VAT.
- `src/features/pricing/components/VietQrCheckoutModal.tsx`: Modal thanh toán VietQR Napas 24/7 (MB Bank):
  - View 1: Chọn phương thức (VietQR / MoMo) và tóm tắt đơn hàng (Giá niêm yết, Chiết khấu theo năm, Tổng tiền).
  - View 2: Quét mã VietQR tự động với mã QR Vector SVG chuẩn, đồng hồ đếm ngược 15:00, thông tin tài khoản ngân hàng thụ hưởng (MB Bank, CONG TY EDUTECH INNOVATIONS, STK 0123456789, cú pháp chuyển khoản e.g. `ILMS PLUS 8492`), nút sao chép 1 chạm có phản hồi trực quan, và nút xác nhận "Tôi đã chuyển khoản thành công" gọi mutation `useSubscribePlan` cập nhật tài khoản và làm mới cache.
- `src/features/pricing/components/PricingPageView.tsx`: Container orchestrator điều phối toàn bộ state chu kỳ thanh toán, modal checkout, và chân trang (Footer) đạt chứng nhận bảo mật SOC2 Type II & 256-Bit SSL/TLS.
- `src/features/pricing/index.ts`: Xuất khẩu public component `PricingPageView`.

### 2.2. Route & Routing Integration
- `src/app/pricing/page.tsx`: Thin Server Component với metadata chuẩn SEO.
- `src/features/landing/components/LandingHeader.tsx`: Nối liên kết desktop & mobile sang `/pricing`.
- `src/features/settings/components/tabs/BillingTab.tsx`: Bổ sung nút liên kết trực tiếp sang `/pricing` ("Xem Bảng giá & So sánh") cạnh nút nâng cấp.
- `src/constants/ai-coach-routes.ts`: Bổ sung `/pricing` vào danh sách whitelist routes cho Trợ lý AI Socratic.

### 2.3. Schema, Service & i18n
- `src/features/settings/schemas/subscription.schema.ts`: Bổ sung trường `yearlyPrice?: number` vào `subscriptionPlanSchema`.
- `src/features/settings/services/subscription.service.ts`: Cập nhật `mockPlans` chuẩn 4 gói (FREE, PLUS, PRO, ENTERPRISE) kèm giá tháng và giá năm tương ứng.
- `src/messages/vi.json` & `src/messages/en.json`: Bổ sung đối xứng 100% namespace `pricing` cho header, hero, billing toggle, 4 cards, so sánh, faq, modal vietqr và footer.

---

## 3. Kiểm thử & Đảm bảo chất lượng (Verification)
- **TypeScript:** Chạy `npx tsc --noEmit` -> **0 lỗi** (Exit code 0).
- **Dark & Light Mode:** Sử dụng các lớp CSS Tailwind đối xứng (`bg-white dark:bg-[#131314]`, `text-slate-900 dark:text-[#e3e3e3]`, `border-slate-200 dark:border-[#3c4043]`, `text-blue-600 dark:text-[#a8c7fa]`).
- **i18n:** Toàn bộ text hiển thị thông qua `useTranslations('pricing.*')`, không hardcode ngôn ngữ.
- **API State:** Kết nối TanStack Query `useMySubscription`, `useStorageSummary`, `useSubscribePlan`.
