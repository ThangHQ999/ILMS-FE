# Triển khai Tính năng Quên mật khẩu (Forgot Password)

**Ngày thực hiện:** 2026-10-12  
**Mục tiêu kế hoạch:** Xây dựng trang Quên mật khẩu tại route `/forgot-password` theo chuẩn Feature-Driven trong module `src/features/auth`, bám sát thiết kế mẫu gồm 2 trạng thái: **Form nhập email** và **Thông báo gửi email thành công kèm đếm ngược gửi lại**. Tương thích hoàn hảo cả 2 chế độ Sáng / Tối, hỗ trợ đa ngôn ngữ `next-intl` (`vi` / `en`) và kết nối API `POST /auth/forgot-password`.

---

## Báo cáo thực hiện

STATUS: COMPLETE
SUMMARY: Triển khai hoàn chỉnh tính năng Quên mật khẩu (`/forgot-password`) gồm 2 trạng thái: Form nhập email và Màn hình thành công (Success State). Tích hợp Zod schema, hook TanStack Query kết nối API `POST /auth/forgot-password`, bộ đếm lùi 60 giây cho nút gửi lại email, tương thích đầy đủ Light/Dark mode, dot-matrix decor SVG và 100% bản dịch song ngữ `vi` / `en`.
FILES: 
- created:
  - `src/features/auth/hooks/useForgotPassword.ts`
  - `src/features/auth/hooks/useForgotPasswordForm.ts`
  - `src/features/auth/components/ForgotPasswordForm.tsx`
  - `src/features/auth/components/ForgotPasswordSuccess.tsx`
  - `src/features/auth/components/ForgotPasswordPageView.tsx`
  - `reports/2026-10-12-auth-forgot-password.md`
- modified:
  - `src/features/auth/schemas/auth.schema.ts`
  - `src/features/auth/services/auth.service.ts`
  - `src/features/auth/types.ts`
  - `src/features/auth/index.ts`
  - `src/app/forgot-password/page.tsx`
  - `src/messages/vi.json`
  - `src/messages/en.json`
  - `TASKS.md`
CHECKS: lint ✔ · typecheck ✔ (`tsc --noEmit`) · tests not run · build ✔ (`next build`)
ASSUMPTIONS: Bộ đếm lùi 60s được kích hoạt sau mỗi lần gửi yêu cầu để ngăn chặn spam request. Nếu gặp lỗi kết nối API khi môi trường dev chưa có backend thực tế, giao diện vẫn thông báo lỗi rõ ràng hoặc xử lý fallback an toàn.
RISKS / LIMITATIONS: Không có.
DOCS: updated `TASKS.md`
DEPLOYMENT: not applicable
NEXT: Xây dựng trang Đặt lại mật khẩu (Reset Password) với token (`/reset-password`).

---

## Chi tiết kết quả kiểm tra trực quan
1. **Trạng thái 1: Form nhập Email**:
   - Biểu tượng ổ khóa bảo mật với hiệu ứng ping tỏa sáng xung quanh.
   - Nhãn "Địa chỉ Email" kèm huy hiệu "Bảo mật" (Shield icon).
   - Ô nhập email có tiền tố biểu tượng thư, gợi ý định dạng email `edu.vn` hoặc email cá nhân đã xác thực.
   - Nút hành động "Gửi liên kết khôi phục" với hiệu ứng spinner xoay tròn khi đang xử lý.
   - Nút điều hướng "Quay lại Đăng nhập" ở chân thẻ.
2. **Trạng thái 2: Gửi email thành công (Success State)**:
   - Biểu tượng tích xanh lá `CheckCircle2` với vòng sóng ping xanh bảo mật.
   - Tiêu đề "Đã gửi email khôi phục", đoạn mô tả hiển thị nổi bật email vừa nhập dưới dạng pill nổi (`<bold>{email}</bold>`).
   - Thẻ chi tiết người nhận kèm huy hiệu "Đã gửi" và thông báo kiểm tra hòm thư Spam.
   - Nút "Mở ứng dụng Email" (`mailto:`).
   - Nút "Gửi lại email (60s)" với bộ đếm lùi thời gian thực từ 60s về 0s, tự động mở khóa nút khi hết thời gian chờ.
3. **Chuyển đổi giao diện Sáng / Tối**:
   - Nút theme toggle trên header hoạt động mượt mà ở cả 2 trạng thái.
   - Chế độ Sáng hiển thị nền `#f6fafe`, vòm sáng pastel và họa tiết dot-matrix.
   - Chế độ Tối hiển thị nền `#0B0F19`, thẻ nền `#161B26` và điểm nhấn Tech Cyan `#38BDF8`.
