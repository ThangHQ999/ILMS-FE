# Báo cáo: Điều chỉnh logic điều hướng trang (Auth & Onboarding Routing)

- **Ngày thực hiện:** 2026-10-13
- **Yêu cầu:** 
  1. Người dùng chưa đăng nhập khi vào trang chủ (`/`) sẽ vào thẳng trang Landing Page, không bị đá sang trang Onboarding.
  2. Người dùng đã đăng nhập khi truy cập trang web mặc định (`/`) sẽ tự động được chuyển hướng về trang Dashboard (`/dashboard`).
  3. Tại trang Onboarding (`/onboarding`), sau khi đồng ý thiết lập xong (hoặc bỏ qua) thì chuyển hướng người dùng sang trang Dashboard (`/dashboard`).
  4. Đăng nhập thành công tại trang Login (`/login`) cũng đưa thẳng vào Dashboard (`/dashboard`).

---

## 1. Tóm tắt kết quả
- **STATUS:** COMPLETE
- Đã khắc phục triệt để tình trạng người dùng bị vòng lặp điều hướng sang `/onboarding`.
- Các luồng điều hướng được định hình rõ ràng và nhất quán:
  - Khách vãng lai / chưa đăng nhập -> `http://localhost:3000/` hiển thị trực tiếp `LandingPageView`.
  - Người dùng đã xác thực phiên (`isSuccess && user`) -> tự động chuyển hướng sang `/dashboard`.
  - Đăng ký mới tại `/register` -> dẫn tới `/onboarding` để cấu hình giao diện lần đầu.
  - Hoàn tất hoặc bỏ qua tại `/onboarding` -> dẫn thẳng vào `/dashboard`.
  - Đăng nhập tại `/login` -> dẫn thẳng vào `/dashboard`.

---

## 2. Danh sách tệp đã chỉnh sửa
- `src/app/page.tsx`: Sửa đích chuyển hướng khi đã đăng nhập từ `/onboarding` sang `/dashboard`; hiển thị trực tiếp `LandingPageView` khi chưa đăng nhập.
- `src/features/onboarding/hooks/useOnboarding.ts`: Sửa đích sau khi submit preferences từ `/` sang `/dashboard`.
- `src/features/auth/hooks/useLoginForm.ts`: Sửa đích sau khi đăng nhập thành công từ `/` sang `/dashboard`.

---

## 3. Kiểm tra & Đánh giá (Validation)
- `npx tsc --noEmit`: 0 lỗi.
- `npm run build`: Thành công 100%, tất cả route đều hợp lệ.
- **Browser Subagent**: Đã thực hiện kiểm tra thực tế:
  1. Mở `http://localhost:3000/` -> Giữ nguyên trang chủ và hiển thị đầy đủ giao diện Landing Page (không bị redirect).
  2. Mở `http://localhost:3000/onboarding` -> Bấm nút hoàn tất thiết lập -> Chuyển hướng thành công sang `/dashboard`.
