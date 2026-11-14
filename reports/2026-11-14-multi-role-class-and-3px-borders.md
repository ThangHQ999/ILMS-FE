# Không gian Chi tiết Lớp học Đa vai trò (Học viên - Giảng viên) & Chuẩn hóa độ dày khung viền 3px

- **Ngày thực hiện:** 2026-11-14
- **Nhánh:** `tung_anh_branch`
- **Mục tiêu:** Hiện thực hóa thiết kế HTML Không gian Chi tiết Lớp học Đa vai trò (Multi-role Class Detail Workspace) cho Sinh viên và Giảng viên, kèm yêu cầu tăng toàn bộ độ dày khung viền lên 3px (`border-[3px]`) trên toàn hệ thống các tab chi tiết lớp học và môn học.

## Chi tiết triển khai

1. **Kiến trúc Đa vai trò (Multi-Role Simulator & Dual UX):**
   - Hỗ trợ 3 góc nhìn vai trò: `student` (Học viên), `teacher` (Giảng viên), `owner` (Chủ sở hữu lớp).
   - Thanh Role Simulator nhanh cho phép chuyển đổi 1-click giữa các vai trò ngay tại sub-header của trang chi tiết lớp học.
   - Thích ứng giao diện theo vai trò: Tab Cài đặt / Quản trị chỉ hiển thị với Giảng viên và Chủ lớp; chuyển sang Học viên sẽ tự động chuyển hướng về Bảng tin (Stream).

2. **Các Tab Đa vai trò mới:**
   - `ClassStreamTab.tsx`:
     - *Góc nhìn Học viên:* Banner hạn chót bài nộp khẩn cấp (Bài tập lớn 01 OSPF), Thẻ KPI học tập cá nhân (Tiến độ 68%, GPA 8.6, Đạt chuẩn PLO).
     - *Góc nhìn Giảng viên:* Khung soạn thông báo nhanh, 3 thẻ Cảnh báo Sư phạm (5 bài nộp chờ chấm, 3 SV nguy cơ trượt, Gửi nhắc nhở 1-click).
     - *Chung:* Dòng tin ghim thông báo đổi phòng học kèm bình luận tương tác, Bài viết tài liệu Slide, Lịch học tuần này và Kho giáo trình chuẩn.
   - `ClassModulesTab.tsx`:
     - 4 Chương học (Chương 1-2 hoàn thành 100%, Chương 3 đang học 60%, Chương 4 bị khóa).
     - Điều khiển Giảng viên: Thêm module mới (kèm modal), Sắp xếp thứ tự chương học.
   - `ClassAssignmentsTab.tsx`:
     - *Góc nhìn Học viên:* Bài tập Lab 01 đang diễn ra kèm modal nộp bài; Bài tập Lab 00 đã chấm (9.5/10) kèm rubric và nhận xét từ giảng viên.
     - *Góc nhìn Giảng viên:* Trung tâm chấm bài Lab 01 với bảng điểm sinh viên, ô nhập điểm trực tiếp, chấm điểm theo rubric và gửi email nhắc nộp.
   - `ClassAnalyticsSettingsTab.tsx`:
     - 4 thẻ KPI phân tích lớp (Tỷ lệ hoàn thành 84.2%, Điểm TB 8.12, Lượt hỏi AI Tutor 1,420, SV cần hỗ trợ 3).
     - Biểu đồ phân bố điểm số Gaussian Bell Curve dạng SVG nội suy.
     - Khu vực cấu hình mã tự ghi danh và chính sách xét duyệt sinh viên.

3. **Trợ lý Socratic AI Tutor Context-Aware RAG:**
   - Nút hành động nổi (Floating Action Button) cố định góc dưới bên phải với hiệu ứng radar ping.
   - Drawer Popover đối thoại với AI Tutor có sẵn gợi ý câu hỏi nhanh về giao thức mạng, RFC, và thuật toán đồ thị.

4. **Chuẩn hóa toàn bộ độ dày khung viền lên 3px (`border-[3px]`):**
   - Áp dụng triệt để `border-[3px] border-slate-300 dark:border-slate-700` cho toàn bộ thẻ bài học, bảng điểm, container, bento grid, popover và modal popup ở cả phân hệ Lớp học (`/classes/[id]`) và phân hệ Môn học (`/courses/[id]`).

5. **Sửa lỗi hiển thị & Điều hướng:**
   - Khắc phục triệt để lỗi gãy chữ "Không gian học tập" trên Header bằng cách bổ sung `shrink-0 flex-nowrap whitespace-nowrap` cho container breadcrumb.
   - Đảm bảo điều hướng từ thẻ môn học "Open Subject ->" vào `/courses/[id]` diễn ra mượt mà, không gặp lỗi 404, có cơ chế fallback mock data cho mọi ID môn học.

## Kiểm tra chất lượng (Verification)
- `npx tsc --noEmit`: PASS (0 errors).
- `npm run build`: PASS (Next.js 16.4.6 Turbopack build thành công 25/25 routes tĩnh & động).

