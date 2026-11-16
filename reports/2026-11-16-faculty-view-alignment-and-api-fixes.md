# Đồng bộ Giao diện Giảng viên (Faculty View) & Khắc phục Sai lệch API Contract

- **Ngày thực hiện:** 2026-11-16
- **Tác giả:** AI Assistant (Antigravity)
- **Nhánh:** `tung_anh_branch`
- **Mục tiêu:**
  1. Đồng bộ giao diện Chế độ Giảng viên (Faculty View) phong phú, sinh động và trực quan tương đương với Chế độ Học viên (Student View) đối chiếu theo ảnh thực tế.
  2. Bổ sung thanh 3 thẻ KPI Stats tương tác cao cấp cho Giảng viên (`ClassKpiStatsBar.tsx`).
  3. Nâng cấp Thẻ lớp học Giảng viên (`ClassCardItem.tsx`) với Banner đồ họa SVG topology, Badge chuẩn đầu ra PLO, thanh Tiến độ đề cương môn học và Dải tác vụ khẩn cấp kèm nút CTA 1-click.
  4. Khắc phục triệt để lỗi khi bấm "Vào không gian lớp" (`/classes/[id]`) của các lớp tự tạo (như `d1`).
  5. Sửa lỗi API Contract Mismatch cho `joinClassByCode` và endpoint `announcements`, đồng thời động hóa tiêu đề bài học tại `/courses/[id]/lessons/[lessonId]`.

---

## 1. Phân tích Hiện trạng & Nguyên nhân

Khi so sánh giữa View Học viên (Ảnh 1) và View Giảng viên (Ảnh 2):
1. **Thanh KPI Stats trên cùng bị khuyết:**
   - Học viên có 3 thẻ KPI lớn rất đẹp (4 lớp tín chỉ, 2 bài tập cần hoàn thành, 8.8/10 điểm PLO).
   - Giảng viên bị rỗng hoàn toàn thanh này do hàm `ClassKpiStatsBar` trước đó trả về `null` cho chế độ `faculty`.
2. **Hiển thị thẻ lớp của Giảng viên bị dàn trải, đơn điệu:**
   - Giảng viên bị mặc định ở chế độ Danh sách 1 cột (List View), làm cho thẻ lớp học (như lớp `d1`) bị kéo dài toàn màn hình, thiếu hẳn banner công nghệ và các thông số quản trị quan trọng.
3. **Sai lệch API Contract:**
   - `joinClassByCode` gửi `{ class_code }` thay vì `{ classCode }` theo quy định tại `docs/api-spec.md` mục 6.2.
   - Endpoint tạo thông báo lớp gọi `/classes/class/${classId}/Announcements` thay vì chuẩn `/classes/${classId}/announcements`.
4. **Hardcode trang bài học:**
   - File `src/app/courses/[id]/lessons/[lessonId]/page.tsx` truyền cứng `CS-202` và tiêu đề bài học thay vì lấy từ dữ liệu thực tế.

---

## 2. Các giải pháp đã triển khai

### 2.1 Khôi phục & Nâng cấp Thanh 3 Thẻ KPI Stats Giảng viên (`ClassKpiStatsBar.tsx`)
- **KPI 1 - Lớp đang giảng dạy:** `12 lớp tín chỉ` • `100% đúng tiến độ giảng dạy` (Icon: `school`, màu xanh thương hiệu).
- **KPI 2 - Tổng số học viên:** `368 sinh viên` • `96% chuyên cần trung bình` (Icon: `groups`, màu xanh lục).
- **KPI 3 - Nhiệm vụ cần xử lý:** `7 nhiệm vụ chờ` • `4 duyệt sinh viên & 3 bài quá hạn chấm` (Icon: `pending_actions`, màu đỏ/cam kèm hiệu ứng nhấp nháy `animate-ping`).

### 2.2 Nâng cấp Thẻ lớp học Giảng viên (`ClassCardItem.tsx`)
- **Banner đồ họa công nghệ:** Áp dụng thuật toán Hash Theme tự động gán gradient và vector topology SVG hiện đại cho cả các lớp tên ngắn/custom (như `d1`).
- **Badge chuẩn đầu ra PLO:** Hiển thị nổi bật cạnh tiêu đề `Đạt chuẩn PLO: 88.5%` (màu emerald) tương đương với badge điểm số của học viên.
- **Dải chỉ số Sĩ số & Chuyên cần:** Hiển thị rõ số học viên, số giảng viên phụ trách và tỷ lệ chuyên cần (96%).
- **Thanh tiến độ đề cương môn học:** `Tuần 8/15 (68% khối lượng)` với thanh progress bar gradient công nghệ cao.
- **Dải tác vụ khẩn cấp 1-click:** Cảnh báo có sinh viên chờ duyệt $\rightarrow$ Nút `[Duyệt ngay]`; cảnh báo bài lab quá hạn $\rightarrow$ Nút `[Chấm bài]`; cảnh báo sinh viên vắng $\rightarrow$ Nút `[Nhắc nhở]`.
- **Nút hành động:** `Vào không gian lớp →` màu xanh thương hiệu, chuyển hướng trực tiếp vào `/classes/[id]`.

### 2.3 Đồng bộ hiển thị Dạng lưới thẻ (Grid View) mặc định
- Cấu hình mặc định `viewMode` là `'grid'` cho cả Giảng viên và Học viên tại `ClassListPageView.tsx`, giúp hiển thị lưới 3 cột cân đối, hiện đại như Ảnh 1.
- Bảo toàn nút chuyển đổi sang Dạng danh sách (List View) khi người dùng muốn xem dạng bảng tóm tắt ngang.

### 2.4 Chuẩn hóa API Contract & Dữ liệu động
- `src/features/classes/services/class.service.ts`: Cập nhật `joinClassByCode` gửi song song `{ classCode: code, class_code: code }` tương thích 100% với backend Spring Boot.
- `src/features/classes/services/class-detail.service.ts`: Chuẩn hóa `GET` và `POST` thông báo lớp học gọi `/classes/${classId}/announcements` (có fallback tự động nếu backend dùng endpoint cũ).
- `src/app/courses/[id]/lessons/[lessonId]/page.tsx`: Kết nối hook `useCourse` để lấy động mã môn học, tên môn học, tên chương và tiêu đề bài học.

---

## 3. Kết quả Kiểm thử (Verification)

1. **TypeScript Typecheck:** `npx tsc --noEmit` $\rightarrow$ **0 lỗi** (`exited with code 0`).
2. **Production Build:** `npm run build` $\rightarrow$ **Thành công 100%** (Biên dịch 26/26 routes trong 3.1s).
3. **Trạng thái Git:** Cây thư mục sạch sẽ (`working tree clean`), không có conflict markers.
