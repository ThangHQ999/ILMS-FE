# Nâng cấp Tab Cài đặt lớp: Tự động cuộn theo danh mục (Scroll-spy Bidirectional Sync)

- **Date:** 2026-11-13
- **Feature:** Chi tiết lớp học — Tab Cài đặt lớp (`/classes/[id]?tab=settings`)
- **Deliverables:**
  1. Tích hợp `IntersectionObserver` tự động bắt vị trí cuộn và kích hoạt highlight danh mục tương ứng ở cột trái trong thời gian thực.
  2. Bổ sung hàm cuộn mượt `scrollToTargetSection` kèm bù trừ chiều cao `headerOffset = 88px` (64px header + 24px padding).
  3. Phân biệt trạng thái active thông thường (`bg-blue-600 text-white shadow-sm`) và trạng thái nguy hiểm của mục 6 (`bg-rose-600 text-white shadow-sm`).
  4. Đồng bộ trọn vẹn 6 phân khu:
     - **Phần 1: Thông tin chung & Nhận diện lớp** (`section-general`)
     - **Phần 2: Mã lớp & Cơ chế ghi danh (Enrollment)** (`section-enrollment`)
     - **Phần 3: Phân quyền Giảng viên & Trợ giảng (TA)** (`section-roles`)
     - **Phần 4: Cấu hình Trợ giảng AI Tutor & Tri thức** (`section-ai-tutor`)
     - **Phần 5: Tích hợp & Xuất dữ liệu LMS** (`section-integration`)
     - **Phần 6: Vùng nguy hiểm (Danger Zone)** (`section-danger-zone`)
  5. Thanh cố định đáy màn hình (Sticky Bottom Action Bar) với nút Hủy và Lưu cấu hình.

## Kiểm tra chất lượng (Verification)
- TypeScript strict (`npx tsc --noEmit`): 0 lỗi.
- Next.js dev server: HTTP 200 OK trên route `/classes/csdl-k22-01`.
- Đã đẩy commit `61f2cf2` lên nhánh remote `origin/tung_anh_branch`.
