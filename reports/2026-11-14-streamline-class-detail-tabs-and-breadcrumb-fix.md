# Báo cáo: Tối ưu hóa thanh Tab Chi tiết Lớp học & Sửa lỗi Breadcrumb Header

- **Ngày thực hiện:** 2026-11-14
- **Nhánh:** `tung_anh_branch`
- **Mục tiêu:**
  1. Tinh gọn thanh điều hướng lớp học (`ClassDetailBanner.tsx`) còn đúng 5 tab trọng tâm theo chuẩn thiết kế HTML template:
     - `stream`: Tổng quan & Bảng tin (icon `forum`)
     - `modules`: Chương trình học (icon `account_tree`, có liên kết nhanh xem môn học)
     - `assignments`: Bài tập & Đánh giá (icon `assignment`, badge `2`)
     - `people`: Thành viên (icon `groups`, badge `48`)
     - `settings`: Cài đặt & Thống kê (icon `analytics`, GV/Owner)
  2. Nâng cấp Tab **Bài tập & Đánh giá** (`ClassAssignmentsTab.tsx`):
     - Tích hợp bộ chuyển đổi chế độ xem nội bộ (Sub-view Switcher): `[ Danh sách Bài tập & Lab (4) | Bảng điểm & Ma trận PLO (ABET) ]`.
     - Chế độ sinh viên: Bài tập đang mở (Lab 01 OSPF, còn 2 ngày, modal nộp file), bài tập đã chấm (Lab 00 Wireshark, 9.5/10 kèm Rubric nhận xét từ TS. Lê Hoàng Nam).
     - Chế độ giảng viên: Bảng trung tâm chấm bài Lab 01 với nhập điểm trực tiếp, lưu điểm, nút gửi email nhắc nhở học viên trễ hạn, cùng tích hợp đầy đủ `ClassGradebookTab` khi chuyển sang sub-tab Bảng điểm & PLO.
  3. Hoàn thiện Hero Course Banner Strip với badge vai trò người dùng đa tầng (`OWNER`, `GV`, `HV`) có đèn LED xanh lá và thông tin ngữ cảnh bên phải (`Mã môn: IT005.O21 | Phòng Lab: H6-302`).
  4. Sửa triệt để lỗi hiển thị breadcrumb header ("Không gian học tập" bị ngắt dòng thành nhiều dòng dọc):
     - Thêm `whitespace-nowrap`, `shrink-0`, `flex-nowrap` trên toàn bộ cấu trúc header breadcrumbs.
     - Tự động tách tiền tố ngôn ngữ (`/vi`, `/en`) trong hàm `getPageTitle` để đảm bảo match chính xác tên trang (`/courses` -> "Không gian môn học").
  5. Chuẩn hóa độ dày khung viền toàn bộ giao diện lên **3px** (`border-[3px] border-slate-300 dark:border-slate-700`).

---

## Danh sách tệp thay đổi (Files)
- `src/features/classes/components/detail/ClassDetailBanner.tsx`: Cập nhật hero banner, tinh giản còn 5 tabs chuẩn, gắn thông tin ngữ cảnh mã môn/phòng lab, chuẩn hóa border 3px.
- `src/features/classes/components/detail/ClassAssignmentsTab.tsx`: Tích hợp sub-view switcher [Bài tập & Lab | Bảng điểm & PLO], hoàn thiện giao diện chấm bài giảng viên & nộp bài sinh viên, loại bỏ code thừa.
- `src/features/classes/components/detail/ClassDetailPageView.tsx`: Cập nhật định tuyến tab, truyền dữ liệu bảng điểm PLO và kết nối nút mở môn học liên kết.
- `src/features/classes/components/detail/ClassModulesTab.tsx`: Bổ sung liên kết nhanh đến môn học liên kết (`onViewSubjects`, `subjectsCount`).
- `src/features/dashboard/components/DashboardHeader.tsx`: Cập nhật xử lý loại bỏ locale prefix trong `getPageTitle`, cố định `whitespace-nowrap` chống vỡ dòng.

---

## Kiểm tra chất lượng (Verification)
- `npx tsc --noEmit`: PASS (0 errors).
- `npm run build`: PASS (25/25 routes tĩnh và động biên dịch thành công 100% bằng Turbopack).

---

## Trạng thái (Status)
**STATUS:** COMPLETE
