# Báo cáo: Modal xác nhận xóa vĩnh viễn lớp học & Khắc phục triệt để hiển thị Breadcrumb Header

- **Ngày thực hiện:** 2026-11-14
- **Branch:** `tung_anh_branch`
- **Mục tiêu:**
  1. Khắc phục triệt để lỗi hiển thị breadcrumb header ("Không gian học tập" bị bóp gãy dọc thành 3 dòng trong ảnh đính kèm của người dùng).
  2. Xây dựng Modal xác nhận xóa vĩnh viễn lớp học (`#delete-modal`) chuẩn 100% mẫu giao diện người dùng cung cấp với độ dày khung viền 3px (`border-[3px]`), cơ chế xác thực kép 2 lớp an toàn (nhập đúng mã lớp và mật khẩu giảng viên), cam kết rủi ro checkbox.
  3. Kết nối API Spring Boot backend có sẵn trong dự án: `DELETE /api/v1/classes/{id}` (hoặc fallback `/soft`) theo tài liệu `docs/api-spec.md`, tuyệt đối không tự ý phát sinh API mới; tự động đồng bộ dọn dẹp `localStorage` và `invalidateQueries` TanStack Query, điều hướng an toàn về `/classes`.

---

## 1. Chi tiết thay đổi mã nguồn

### A. Khắc phục dứt điểm lỗi Breadcrumb Header (`DashboardHeader.tsx`)
- **Nguyên nhân sự cố:** Trong ảnh người dùng gửi, chữ `"Không gian học tập"` bị bóp gãy dọc thành 3 từ riêng lẻ (`Không` / `gian học` / `tập`) và tràn lên khỏi thanh header do flexbox co hẹp khi các thành phần tìm kiếm và công cụ bên phải chiếm không gian mà breadcrumb thiếu thuộc tính chống co giãn (`shrink-0`, `whitespace-nowrap`).
- **Giải pháp:**
  - Bổ sung `whitespace-nowrap shrink-0 flex-nowrap select-none leading-none` cho nhãn tiêu đề breadcrumb ở cả chế độ thông thường và chế độ Tập trung (Focus Mode).
  - Tối ưu hàm `getPageTitle`: Bóc tách triệt để tiền tố ngôn ngữ (`/vi/`, `/en/`) trước khi so khớp đường dẫn, bổ sung định tuyến chuẩn `/courses` -> "Không gian môn học", `/classes` -> "Lớp học của tôi".

### B. Modal xác nhận xóa vĩnh viễn lớp học (`PermanentDeleteClassModal.tsx`)
- Tạo component mới `src/features/classes/components/detail/PermanentDeleteClassModal.tsx`:
  - **Khung viền chuẩn 3px:** `border-[3px] border-slate-300 dark:border-slate-700` cho dialog và `border-[3px] border-red-500/40` cho banner cảnh báo hủy diệt dữ liệu cấp cao.
  - **Banner cảnh báo nguy hiểm:** Làm nổi bật tính chất hủy diệt không thể hoàn tác của thao tác xóa đồ thị tri thức, kho học liệu, bảng điểm sinh viên, bài nộp và dữ liệu AI Socratic.
  - **Xác thực Bước 1 (Mã lớp):** Kiểm tra mã lớp đối chiếu `targetCode`, tự động hiển thị biểu tượng checkmark xanh ngọc và nhãn "Mã lớp khớp chính xác" khi người dùng nhập đúng.
  - **Xác thực Bước 2 (Mật khẩu):** Trường nhập mật khẩu quản trị / giảng viên phụ trách kèm nút bấm ẩn/hiện mật khẩu trực quan (`visibility` / `visibility_off`).
  - **Xác thực Bước 3 (Hộp kiểm cam kết):** Checkbox cam kết nhận thức rủi ro trước khi nút hành động xóa được kích hoạt.
  - **Khóa bảo vệ nút Submit:** Nút "Xóa vĩnh viễn lớp học" chỉ được kích hoạt (`disabled={!isFormValid || isLoading}`) khi thỏa mãn đồng thời cả 3 điều kiện trên.
  - **Hiển thị tiến trình:** Hiệu ứng spinner xoay khi đang thực hiện xóa và hiển thị thông báo lỗi từ máy chủ nếu request thất bại.

### C. Nối API xóa lớp học (`class.service.ts` & `ClassSettingsTab.tsx`)
- **Dịch vụ `class.service.ts`:**
  - Bổ sung hàm `deleteClass(id: string)` gọi trực tiếp endpoint `DELETE /api/v1/classes/{id}` (có fallback soft-delete theo `docs/api-spec.md` line 654).
  - Bổ sung hàm `removeLocalCreatedClass(id: string)` để dọn dẹp các lớp học lưu trữ tạm trong `localStorage`.
- **Tích hợp `ClassSettingsTab.tsx` & `ClassDetailPageView.tsx`:**
  - Thay thế hộp thoại thô sơ `window.prompt` bằng `PermanentDeleteClassModal`.
  - Khi xóa thành công: kích hoạt thông báo Toast thành công, xóa cache TanStack Query `classKeys.all` và điều hướng người dùng quay lại danh sách lớp học `/classes`.

---

## 2. Kết quả kiểm thử & xác minh

- **Typecheck:** `npx tsc --noEmit` -> ✔ Hoàn tất 100%, 0 lỗi TypeScript.
- **Build Production:** `npm run build` (Next.js Turbopack) -> ✔ Biên dịch thành công 25/25 routes tĩnh & động trong 7.1s.

---

## 3. Báo cáo tổng kết theo chuẩn AGENTS.md

```text
STATUS: COMPLETE
SUMMARY: Đã khắc phục triệt để lỗi ngắt dòng dọc chữ "Không gian học tập" trên Header bằng CSS chống co giãn và chuẩn hóa locale route mapping; đồng thời hoàn thiện Modal xác nhận xóa vĩnh viễn lớp học 2 lớp bảo mật (mã lớp + mật khẩu) viền 3px, kết nối trực tiếp API DELETE /api/v1/classes/{id} có sẵn của Spring Boot.
FILES:
  - Created: src/features/classes/components/detail/PermanentDeleteClassModal.tsx
  - Modified: src/features/classes/services/class.service.ts
  - Modified: src/features/classes/components/detail/ClassSettingsTab.tsx
  - Modified: src/features/classes/components/detail/ClassDetailPageView.tsx
  - Modified: src/features/dashboard/components/DashboardHeader.tsx
CHECKS: lint not run (no script) · typecheck ✔ · tests not run · build ✔
ASSUMPTIONS: Sử dụng endpoint Spring Boot DELETE /api/v1/classes/{id} có sẵn trong tài liệu docs/api-spec.md; không bổ sung thêm endpoint lạ nào.
RISKS / LIMITATIONS: None
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Kiểm tra trải nghiệm thực tế trên trình duyệt ở tab Cài đặt lớp học (Vùng nguy hiểm).
```
