# Báo cáo: Màn hình Học tập Chi tiết 3 Cột (Modern 3-Column Learning Workspace) & Khung viền 3px

- **Ngày thực hiện:** 2026-11-14
- **Nhánh:** `tung_anh_branch`
- **Mục tiêu:** Hiện thực hóa màn hình học tập chi tiết theo thiết kế mẫu HTML, cấu trúc bố cục 3 cột hiện đại, video player tương tác, sơ đồ tuần tự SVG có khả năng phóng to, đàm thoại gợi mở với Socratic AI Tutor, và chuẩn hóa khung viền dày 3px.

---

## 1. Các thành phần đã triển khai (Implemented Components)
1. **`LessonWorkspaceHeader.tsx`:**
   - Hệ thống 2 tầng header:
     - Header tầng 1 (Top Navigation): Breadcrumb "Chương 03 • Bài 02: Xây dựng Cấu trúc Layout 3 Cột Hiện đại", 4 tab phụ ("Không gian học", "Đề cương", "Tài nguyên", "Hỏi đáp"), nút Trợ giúp, Profile avatar, thanh tiến độ tổng thể 64%.
     - Header tầng 2 (Workstation Controls): Nút back CS-202, badge `CS-202 • Nhóm 01`, tiêu đề bài "Bài 3.2: Cơ chế truyền tin cậy (RDT) & Bắt tay 3 bước TCP", nút bật/tắt Cây giáo trình, Focus Mode (ẩn cả hai thanh bên), Sổ tay ghi chú nháp có thông báo, bật/tắt Socratic AI, Profile pill `NM` Trần Nhật Minh 21120485 kèm đèn online, thanh tiến độ bài học 68%.

2. **`LessonSyllabusSidebar.tsx` (Cột 1 - Left Sidebar w-80):**
   - Header hiển thị tiến độ 68% (15/22), mã học phần `CS-202 • HK2 2024-2025`.
   - Thanh tìm kiếm bài học thời gian thực.
   - Accordion 4 chương:
     - Chương 01: Mô hình OSI & TCP/IP (4/4 Bài - Hoàn thành).
     - Chương 02: Tầng Ứng dụng (DNS, HTTP) (4/4 Bài - Hoàn thành).
     - Chương 03: Tầng Giao vận (Transport Layer) - Bài 3.1 hoàn thành, Bài 3.2 đang học (hiệu ứng pulse phát sáng), Bài 3.3 tiếp theo, Bài 3.4 Wireshark lab, Quiz 03 khóa.
     - Chương 04: Tầng Mạng (Khóa).

3. **`LessonVideoPlayer.tsx` (Cột 2 - Interactive Video Player):**
   - Khung hình 16:9 với hoạt họa nền SVG mạng truyền gói TCP SYN/ACK.
   - Dấu mốc HD 1080p, giảng viên TS. Lê Hoàng Nam, nút Bookmark khoảnh khắc, nút Share.
   - Thanh tua tiến trình với 4 mốc chương (Chapter Markers: 02:15, 08:40, 15:30, 22:10).
   - Bộ điều khiển đầy đủ: Play/Pause, Tua ±10s, Âm lượng, Bộ đếm thời gian 14:20/28:45, Thay đổi tốc độ phát (1.0x -> 1.25x -> 1.5x -> 2.0x), Phụ đề Tiếng Việt, Cài đặt chất lượng, Toàn màn hình.
   - Dải nút mốc bài học (Video Chapters Strip) chuyển trực tiếp timestamp.

4. **`LessonAcademicDocument.tsx` (Cột 2 - Academic Reader):**
   - Định dạng bài báo học thuật chuẩn RFC 793 / RFC 9293.
   - Phần 1: Nguyên lý thiết lập kết nối hướng dòng.
   - Knowledge Callout Card (bóng đèn): Phân tích câu hỏi kinh điển "Tại sao cần 3 bước mà không phải 2 bước?".
   - Sơ đồ Tuần tự Bắt tay 3 bước Inline SVG (Host A <-> Host B, SYN, SYN-ACK, ACK) kèm Modal xem phóng to toàn màn hình.
   - Phần 2: Cú pháp Socket TCP Python 3.11 trong khung Code Box phong cách macOS kèm nút sao chép mã nguồn vào clipboard.
   - Tab Chuẩn đầu ra (4 KPIs) / Tài nguyên đính kèm (PDF, PCAPNG) / Thảo luận lớp học (hỏi đáp sinh viên - giảng viên và ô bình luận).

5. **`LessonSocraticAiSidebar.tsx` (Cột 3 - Right Sidebar w-96):**
   - Header Trợ lý Socratic AI Tutor, Graph RAG 12 nodes, nút đóng.
   - Luồng đàm thoại thời gian thực gợi mở về kỹ thuật Piggybacking trong gói tin ACK bước 3.
   - 3 chip câu hỏi gợi ý phản biện 1-click ("Tại sao không dùng 2 bước?", "Tấn công SYN Flood", "Quick Quiz").
   - Khung nhập tin nhắn tích hợp mic thu âm, chèn code, gửi tin nhắn và phím tắt Shift+Enter.

6. **`LessonBottomWorkspaceBar.tsx`:**
   - Thanh công cụ cố định chân trang: Nút lùi về bài 3.1, Chỉ báo tự động lưu tiến độ đa thiết bị, Nút "Đánh dấu đã hiểu" (tích xanh), Nút CTA "Hoàn thành & Tiếp theo" chuyển tiếp bài 3.3.

7. **`LessonNotesDrawer.tsx`:**
   - Ngăn kéo ghi chú nháp cá nhân với nội dung mẫu định dạng Markdown, tự động lưu vào `localStorage`.

8. **`LessonLearningWorkspace.tsx`:**
   - Component điều phối trung tâm liên kết toàn bộ 7 thành phần trên, quản lý Focus Mode, toast phản hồi.

9. **Định tuyến (Routing):**
   - Tạo mới route thin `src/app/courses/[id]/lessons/[lessonId]/page.tsx`.
   - Kết nối sự kiện click từ `CourseDetailPageView.tsx` và `ClassModulesTab.tsx`.

10. **Quy chuẩn viền 3px:**
    - Toàn bộ khung thẻ, trình phát video, thanh sidebar, modal phóng to, code box, callout card đều áp dụng `border-[3px] border-slate-300 dark:border-slate-700`.

---

## 2. Kiểm tra chất lượng (Verification)
- `npx tsc --noEmit`: PASS (0 errors).
- `npm run build`: PASS (Next.js 16.4.6 Turbopack build thành công 100%, bổ sung route `/courses/[id]/lessons/[lessonId]`).

---

## 3. Trạng thái (Status)
**STATUS:** COMPLETE

