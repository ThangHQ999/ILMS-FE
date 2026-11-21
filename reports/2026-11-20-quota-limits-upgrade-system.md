# Báo cáo Triển khai: Hệ thống Nhận diện Hạn mức Quota & Điều hướng Nâng cấp Gói cước (Quota Upgrade System)

- **Ngày thực hiện:** 2026-11-20
- **Phạm vi:** Toàn bộ ứng dụng ILMS (Axios Interceptor, Global Modal, Socratic AI Tutor, Form Tạo lớp / Môn học, API Documentation)
- **Tình trạng:** COMPLETE

---

## 1. Mục tiêu & Bối cảnh
Khi tài khoản người dùng chạm trần hạn mức sử dụng (Quota) theo từng gói dịch vụ (Free / Plus / Pro), Backend trả về mã lỗi chuẩn gồm `HTTP Status`, mã enum lỗi định danh `error`, và thông điệp giải thích tiếng Việt `message`.
Frontend cần bắt tự động các mã lỗi này, hiển thị cửa sổ bật lên (Modal) toàn cục giải thích rõ ràng và cung cấp đường dẫn một chạm đưa người dùng đến trang nâng cấp gói `/pricing`.

### Danh sách 6 Mã Lỗi Hạn Mức từ Backend:
1. `STORAGE_QUOTA_EXCEEDED` (400 Bad Request): *"Dung lượng lưu trữ đám mây của bạn đã hết. Vui lòng nâng cấp gói cước hoặc xóa bớt tệp"*
2. `FILE_SIZE_EXCEEDED_PLAN_LIMIT` (400 Bad Request): *"Kích thước tệp vượt quá giới hạn tối đa của gói tài khoản hiện tại"*
3. `COURSE_CREATION_LIMIT_REACHED` (403 Forbidden): *"Bạn đã đạt số lượng môn học tối đa của gói hiện tại. Vui lòng nâng cấp gói để tạo thêm môn học"*
4. `CLASS_CREATION_LIMIT_REACHED` (403 Forbidden): *"Bạn đã đạt số lượng lớp học tối đa của gói hiện tại. Vui lòng nâng cấp gói để tạo thêm lớp học"*
5. `AI_DAILY_LIMIT_EXCEEDED` (429 Too Many Requests): *"Bạn đã dùng hết lượt hỏi Trợ lý AI hôm nay. Vui lòng quay lại vào ngày mai hoặc nâng cấp gói cước"*
6. `KNOWLEDGE_GRAPH_QUOTA_EXCEEDED` (403 Forbidden): *"Bạn đã đạt giới hạn bóc tách Đồ thị tri thức của tháng này. Vui lòng nâng cấp gói cước để tiếp tục"*

---

## 2. Các thay đổi kỹ thuật chi tiết

### 2.1. Cấu hình & Quản lý Hạn mức Toàn cục (`src/constants/quota-limits.ts`)
- Định nghĩa kiểu `QuotaErrorCode` và hằng số mapping `QUOTA_ERRORS` cho 6 mã lỗi.
- Mỗi mã lỗi bao gồm: tiêu đề tiếng Việt chuẩn UX, thông báo mặc định, huy hiệu danh mục, icon Material Symbols, điểm nhấn quyền lợi (`benefitHighlight`), và URL chuyển hướng mặc định `/pricing` (riêng Storage có nút phụ đi tới `/settings?tab=billing`).
- Xây dựng cơ chế phát sự kiện tùy biến qua trình duyệt `ilms_quota_exceeded` (`triggerQuotaUpgradeModal(info)`).

### 2.2. Nâng cấp Data Layer & Axios Interceptor (`src/types/common.ts`, `src/lib/axios.ts`)
- Mở rộng lớp `ApiError` chứa thuộc tính `errorCode?: string`.
- Trong `src/lib/axios.ts`:
  - Trích xuất `errorCode` từ `error.response?.data?.error`.
  - Thiết lập Interceptor kiểm tra: nếu mã lỗi thuộc danh sách Quota, tự động kích hoạt `triggerQuotaUpgradeModal(...)` giúp toàn bộ mọi endpoint trong hệ thống (dù gọi từ hook, service hay background) đều tự động bật cửa sổ nâng cấp mà không cần lặp code.

### 2.3. Modal Nâng cấp Gói cước Toàn cục (`src/components/shared/QuotaUpgradeModal.tsx`)
- Thiết kế theo ngôn ngữ Google Material 3 với hiệu ứng làm mờ nền (backdrop blur), bo góc mềm mại, huy hiệu trạng thái và danh sách quyền lợi gói cước cao cấp.
- Lắng nghe sự kiện `ilms_quota_exceeded`, tự động hiển thị thông tin chính xác theo lỗi người dùng vừa gặp phải.
- Tích hợp nút CTA nổi bật `"Nâng cấp gói cước ngay"` dẫn thẳng sang `/pricing`.
- Được gắn cố định tại `src/app/layout.tsx` bên trong `<Providers>`, hoạt động xuyên suốt 100% các trang.

### 2.4. Trợ lý Socratic AI Chat In-Place (`src/features/dashboard`)
- Tại `ai-chat.service.ts`: Khi gặp lỗi 429 hoặc `AI_DAILY_LIMIT_EXCEEDED`, gọi ngay `triggerQuotaUpgradeModal`.
- Tại `useSocraticChat.ts`:
  - Định dạng tin nhắn phản hồi thân thiện, thông báo rõ ràng về việc hết lượt hỏi hôm nay.
  - Tự động đính kèm Card hành động (Attachment Card) với nút `"Nâng cấp ngay"` trỏ trực tiếp đến `/pricing`.
- Tại `SocraticAICoach.tsx`: Mở rộng Attachment Card để hiển thị nút liên kết `<Link href="/pricing">`.

### 2.5. Các biểu mẫu Tạo Lớp học & Tạo Môn học
- `src/features/classes/components/CreateClassPageView.tsx` & `CreateClassModal.tsx`: Khi gặp lỗi chạm hạn mức số lớp (`CLASS_CREATION_LIMIT_REACHED`), banner lỗi hiển thị nút bấm inline `[Nâng cấp gói ngay →]` giúp người dùng thao tác trực tiếp mà không bị bế tắc.
- `src/features/courses/components/CreateCoursePageView.tsx`: Khi gặp lỗi chạm hạn mức số môn học (`COURSE_CREATION_LIMIT_REACHED`), banner lỗi hiển thị nút inline `[Nâng cấp gói ngay →]`.

### 2.6. Khắc phục lỗi React Rules of Hooks (`NodeInspectorPanel.tsx`)
- Khắc phục lỗi thứ tự hook thay đổi giữa các lần render bằng cách chuyển toàn bộ `useMemo` và hook truy vấn lên trên các câu lệnh return sớm (`if (isCollapsed) return null;`, `if (!node) return null;`).

### 2.7. Đồng bộ Tài liệu Kỹ thuật (`docs/api-spec.md`)
- Cập nhật Mục 19 (ErrorCode Reference) và bổ sung Mục 19.1 chi tiết về Quota & Plan Limits, cấu trúc JSON trả về từ backend và cơ chế bắt lỗi ở tầng giao diện.

---

## 3. Kiểm thử & Đảm bảo Chất lượng
- **Typecheck:** `npx tsc --noEmit` hoàn tất với **0 lỗi**.
- **Production Build:** `npm run build` biên dịch thành công toàn bộ **35/35 routes** (Static & Dynamic).
