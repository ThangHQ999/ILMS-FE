# Báo cáo: Triển khai Modal Soạn thông báo lớp học mới (Create Announcement Modal)

- **Ngày:** 15/11/2026
- **Mục tiêu:** Hiện thực hóa hoàn chỉnh Modal đăng thông báo mới cho lớp học theo đúng mẫu thiết kế HTML/Tailwind được cung cấp, tuân thủ nghiêm ngặt quy tắc độ dày viền 3px (`border-[3px] border-slate-300 dark:border-slate-700`), hỗ trợ đa lớp (Multi-class broadcast), soạn thảo phong phú (Rich Editor) kèm trợ lý AI trau chuốt giọng văn, đính kèm tệp kéo thả và các tùy chọn phân phối nâng cao (Ghim, Email khẩn, Push di động, Lên lịch phát tin).

---

## 1. Các thành phần đã triển khai

### A. Component `CreateAnnouncementModal.tsx` (`src/features/classes/components/detail/CreateAnnouncementModal.tsx`)
1. **Khung bao & Đầu trang:**
   - Dải accent strip gradient nhận diện thương hiệu `bg-gradient-to-r from-blue-500 via-indigo-600 to-sky-400`.
   - Header với icon `campaign` trên nền bo tròn mềm mại, tiêu đề *Soạn thông báo lớp học mới*, badge *Toàn thể lớp* và nút đóng Esc.
2. **Khu vực 1: Lớp học nhận thông báo (Multi-class Distribution):**
   - Thẻ hiển thị lớp học hiện tại (`CS-202: Cấu trúc dữ liệu`) kèm sĩ số sinh viên.
   - Nút `+ Thêm lớp cùng học phần (CS-202L, CS-203)...` mở menu popover cho phép giảng viên chọn gửi thông báo đồng thời cho nhiều lớp học cùng lúc.
3. **Khu vực 2: Tiêu đề thông báo:**
   - Ô nhập tiêu đề rõ ràng, trực quan, có bộ đếm ký tự thời gian thực `X/120 ký tự` và cảnh báo màu khi vượt ngưỡng 110 ký tự.
4. **Khu vực 3: Trình soạn thảo Rich-Text & Trợ lý AI:**
   - Thanh công cụ định dạng trực quan: In đậm (Ctrl+B), In nghiêng (Ctrl+I), Gạch chân (Ctrl+U), Danh sách có/không thứ tự, Chèn liên kết, Chèn ảnh, Khung mã nguồn (Bash/Code snippet), Bảng biểu.
   - Nút **"AI trau chuốt giọng văn"** kết nối mô phỏng với ILMS AI Engine v3: Tự động chuẩn hóa văn phong học vụ trang trọng và nổi bật các mốc deadline.
   - Chỉ báo **"Tự động sao lưu bản nháp"** với đèn LED xanh nhấp nháy, tự động lưu nội dung đang soạn vào `localStorage` mỗi 30 giây để tránh mất mát dữ liệu.
   - Khung xem trước dòng lệnh terminal (`git commit ... && git push origin main`).
5. **Khu vực 4: Đính kèm tệp tài liệu & công văn:**
   - Vùng kéo thả tệp Dropzone trực quan (Drag & Drop + Duyệt file từ máy).
   - Danh sách tệp đã staged tải lên với huy hiệu định dạng PDF (đỏ), PPTX (xanh dương), dung lượng, trạng thái an toàn và nút gỡ bỏ tệp (X).
6. **Khu vực 5: Tùy chọn phân phối nâng cao:**
   - 3 thẻ tùy chọn tương tác:
     - 📌 **Ghim đầu trang:** Giữ thông báo luôn nằm vị trí đầu tiên của bảng tin lớp.
     - ✉️ **Gửi email khẩn:** Gửi bản sao trực tiếp đến toàn bộ hộp thư sinh viên @hcmut.edu.vn.
     - 📱 **Push di động:** Phát thông báo tức thời qua app EduTech ILMS trên iOS / Android.
7. **Chân trang điều khiển:**
   - Tính năng **Lên lịch đăng tự động** với bộ chọn ngày giờ `datetime-local` mở rộng.
   - Nút **Lưu bản nháp** lưu trạng thái vào localStorage và thông báo toast.
   - Nút **Đăng thông báo ngay** gửi payload thông báo, kích hoạt mutation và cập nhật tức thì bảng tin.

---

## 2. Tích hợp hệ thống
- **Đăng ký Export:** Re-export từ [`src/features/classes/components/detail/ClassDetailModals.tsx`](file:///d:/FE_ILMS/ILMS-FE/src/features/classes/components/detail/ClassDetailModals.tsx) và [`src/features/classes/index.ts`](file:///d:/FE_ILMS/ILMS-FE/src/features/classes/index.ts).
- **Tab Luồng tin (Stream):** Trong [`ClassStreamTab.tsx`](file:///d:/FE_ILMS/ILMS-FE/src/features/classes/components/detail/ClassStreamTab.tsx), bổ sung nút **"Soạn thông báo đầy đủ"** ở đầu khung soạn tin nhanh.
- **Tab Thông báo (Announcements):** Trong [`ClassAnnouncementsTab.tsx`](file:///d:/FE_ILMS/ILMS-FE/src/features/classes/components/detail/ClassAnnouncementsTab.tsx), gắn nút **"+ Tạo thông báo mới"** và **"Lên lịch phát tin"** mở thẳng modal này.
- **Trang chủ Chi tiết lớp học:** Trong [`ClassDetailPageView.tsx`](file:///d:/FE_ILMS/ILMS-FE/src/features/classes/components/detail/ClassDetailPageView.tsx), quản lý state `isCreateAnnouncementOpen`, xử lý callback `postAnnouncementMutation.mutate` và tự động refetch / cập nhật danh sách thông báo.

---

## 3. Kiểm định chất lượng
- `npx tsc --noEmit`: 0 lỗi type.
- `npm run build`: 26/26 routes biên dịch thành công 100% với Turbopack trong 10.1s.

