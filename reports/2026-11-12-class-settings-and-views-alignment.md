# Hoàn thiện Giao diện Lớp học & Tab Cài đặt Quản trị (Classes Views & Settings Tab)

- **Date:** 2026-11-12
- **Scope:** Phân hệ Lớp học (`/classes` & `/classes/[id]?tab=settings`)
- **Deliverables:**
  1. Đồng bộ Pixel-Perfect 100% hai chế độ hiển thị màn hình Các lớp học (`/classes`) đối chiếu trực tiếp theo 3 ảnh mẫu:
     - **Chế độ Giảng dạy (Faculty View) dạng Danh sách (List View)** (Ảnh 1 & Ảnh 3).
     - **Chế độ Học viên (Student View) dạng Lưới thẻ 2x2 (Grid View)** (Ảnh 2).
  2. Triển khai hoàn chỉnh giao diện Tab Cài đặt lớp & Quản trị (`ClassSettingsTab.tsx`) chuẩn 2 cột theo thiết kế mẫu.

---

## Chi tiết thay đổi

### 1. Đồng bộ hiển thị Các lớp học (`/classes`)
- **Chế độ Giảng dạy (Faculty List View - Ảnh 1 & 3):**
  - Card Bento mở rộng toàn chiều rộng (`grid-cols-1`), banner đồ họa vector topology chuyên ngành (CSDL, CTDL, OOP, MMT), nhãn vai trò `CHỦ LỚP` / `GIẢNG VIÊN`, nhãn trạng thái `Hoạt động` với chấm xanh animate-pulse.
  - Thông số lớp học: `42 học viên` & `2 giảng viên` (CSDL), `38 học viên` & `2 giảng viên` (CTDL), `45 học viên` & `1 giảng viên` (OOP), `36 học viên` & `2 giảng viên` (MMT).
  - Dải cảnh báo tương tác: Hộp cảnh báo màu vàng cho yêu cầu duyệt học viên ("3 yêu cầu tham gia đang chờ duyệt →"), hộp cảnh báo hoạt động gần nhất ("Hoạt động gần nhất 2 giờ trước • Tuần 8"), dải báo hạn màu đỏ ("Bài thực hành Lab 3 sắp đến hạn vào ngày mai • 23:59").
  - Nút hành động: `Vào không gian lớp →` màu xanh thương hiệu đồng nhất.
- **Chế độ Học viên (Student Grid View - Ảnh 2):**
  - Bố cục lưới 2 cột (`grid-cols-1 md:grid-cols-2`), hiển thị trọn vẹn 4 thẻ lớp học đang tham gia.
  - Huy hiệu điểm quá trình `Điểm QT: 8.8 / 10`, `Điểm QT: 7.5 / 10`, `Điểm QT: 9.2 / 10`, `Điểm QT: 8.0 / 10`.
  - Thanh tiến độ học tập kèm số Node tri thức đã mở (`42/50`, `28/40`, `36/40`, `20/45`).
  - Hộp cảnh báo kèm nút thao tác trực tiếp: Nộp ngay (Lab 05), Làm Quiz (Quiz 04), Xuất sắc (Đã nộp toàn bộ bài tập), Ôn ngay (Socratic AI gợi ý).
  - Phân trang: `Hiển thị 1 - 4 trên 4 lớp học`, nút Trước, [1], Tiếp theo.
  - Sandbox State Previews kiểm thử 5 kịch bản (Danh sách hiện tại, Skeleton, Trống, Không tìm thấy theo lọc, Tab Đã lưu trữ).

### 2. Tab Cài đặt lớp & Quản trị (`/classes/[id]?tab=settings`)
- **Cột trái (4 cột / Sticky top):**
  - Thẻ nhận diện mã lớp hệ thống `CNTT-K22-01` kèm trạng thái Hoạt động.
  - Danh mục Menu điều hướng 6 khu vực:
    1. Thông tin chung & Nhận diện
    2. Mã lớp & Cơ chế Ghi danh
    3. Phân quyền GV & Trợ giảng (TA)
    4. Cấu hình AI Tutor & Tri thức
    5. Tích hợp & Xuất dữ liệu LMS
    6. Vùng nguy hiểm (Lưu trữ / Xóa)
  - Widget trạng thái Hệ thống & Đồng bộ Cloud (Dung lượng 3.8 GB / 10 GB, Ping 24ms, Đồng bộ đám mây vừa xong).
- **Cột phải (8 cột / Form chi tiết):**
  - **Mục 1:** Tên lớp học, Mã lớp hệ thống (khóa chỉ đọc bởi P. Đào tạo), Niên khóa & Học kỳ, Sĩ số tối đa (60 SV), Trạng thái vận hành, Mô tả & Đề cương tóm tắt.
  - **Mục 2:** Khối mã bảo mật Enrollment Secret Key (`MATKHAU123`), sao chép mã 1-click, tạo mã mới ngẫu nhiên, sao chép liên kết mời trực tiếp; 3 công tắc chính sách (Tự đăng ký, Yêu cầu GV phê duyệt, Chỉ cho phép email trường @edu.vn).
  - **Mục 3:** Phân quyền Chủ nhiệm môn (TS. Lê Hoàng Nam) và Trợ giảng TA (ThS. Trần Phương Thảo), nút thêm cán bộ.
  - **Mục 4:** Cấu hình AI Tutor v4.2 bật/tắt 24/7, 2 thẻ lựa chọn phương pháp sư phạm (Socratic vs Direct Fix), định mức hỏi đáp mỗi ngày (35 lượt/SV/ngày), nguồn dữ liệu Grounding (Slide, Bài giảng, Kiến thức CS mở rộng).
  - **Mục 5:** Tích hợp xuất Bảng điểm & PLO (.xlsx), đồng bộ Moodle LMS, sao lưu toàn bộ kho lớp SCORM/Zip.
  - **Mục 6 (Vùng nguy hiểm):** Lưu trữ lớp học (Read-only) và Xóa vĩnh viễn không gian lớp với cảnh báo xác nhận.
  - **Sticky Bottom Action Bar:** Cố định đáy màn hình, thông báo tự động lưu nháp, nút Hủy thay đổi và nút Lưu cấu hình lớp học.

---

## Kiểm tra chất lượng (Verification)
- `npx tsc --noEmit`: Đạt 0 lỗi biên dịch TypeScript strict.
- Next.js Dev Server (Port 3000): Hoạt động ổn định, `GET /classes 200 OK`, `GET /classes/csdl-k22-01 200 OK`.
- Hỗ trợ đầy đủ Dark Mode & Light Mode, responsive mượt mà trên mọi kích thước màn hình.

