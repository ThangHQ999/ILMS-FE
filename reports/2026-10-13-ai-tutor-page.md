# Báo cáo: Xây dựng trang Gia sư AI Socratic (/ai-tutor)

- **Ngày thực hiện:** 2026-10-13
- **Yêu cầu:** Xây dựng trang AI Chat / AI Tutor chuẩn Feature-Driven Architecture, render tin nhắn bằng Markdown, hỗ trợ 2 trạng thái màn hình (Welcome New Chat Capsule & Active Chat Canvas), có ProtectedRoute, Light/Dark mode, và Đa ngôn ngữ (next-intl).

---

## 1. Tóm tắt kết quả
- **STATUS:** COMPLETE
- **Route:** `src/app/ai-tutor/page.tsx`
- **Feature Code:** `src/features/ai-tutor/`
- **Tính năng nổi bật:**
  1. **ProtectedRoute Guard:** Tự động kiểm tra phiên đăng nhập bằng `useCurrentUser()`, bảo vệ trang an toàn và chuyển hướng về `/login` nếu chưa đăng nhập.
  2. **Sidebar bên trái tối giản chuẩn Claude / ChatGPT:** Nút tạo chat mới (`⌘K`), cuộn danh sách lịch sử phân nhóm theo ngày (*Hôm nay*, *7 ngày qua*), đổi tên/xóa chat, thông tin Profile học viên kèm thẻ PRO.
  3. **Header thanh thoát (~52px):** Trạng thái *Socratic Mode*, Dropdown chọn môn học, huy hiệu chuẩn đầu ra *PLO 04: Giải thuật tối ưu*, nút tải xuống biên bản học tập (`.md`), nút chuyển đổi toàn màn hình.
  4. **Welcome Canvas (Khi tạo mới phiên chat):** Hiển thị lời chào cá nhân hóa, Capsule Input Box tích hợp công cụ toán LaTeX, ghi âm, chế độ gợi ý prompt (*Hỏi đáp phản biện*, *Debug gợi ý mã*, *Trắc nghiệm kiểm tra*) cùng lưới 4 chủ đề CS đề xuất (Dijkstra, Segment Tree 4*N, AVL vs Red-Black, DP Quiz).
  5. **Active Chat Canvas (Đang trò chuyện):** Render tin nhắn Markdown đầy đủ, khối mã C++ tối màu với nút sao chép code một chạm, bảng biểu kỹ thuật so sánh độ phức tạp O(N log N) / O(N²), thẻ câu hỏi tư duy Socratic màu xanh nhã nhặn, thanh công cụ đánh giá câu trả lời (Copy, Like, Dislike, Replay).
  6. **Đa ngôn ngữ & Chế độ Sáng / Tối:** Thiết lập đầy đủ namespace `aiTutor` trong cả `vi.json` và `en.json`, tương thích mượt mà với Dark/Light mode của toàn hệ thống.

---

## 2. Danh sách tệp đã tạo & chỉnh sửa
- **Tạo mới:**
  - `src/features/ai-tutor/types.ts`
  - `src/features/ai-tutor/schemas/ai-tutor.schema.ts`
  - `src/features/ai-tutor/constants.ts`
  - `src/features/ai-tutor/services/ai-tutor.service.ts`
  - `src/features/ai-tutor/hooks/useAiTutorChat.ts`
  - `src/features/ai-tutor/hooks/useChatHistory.ts`
  - `src/features/ai-tutor/components/AiTutorMarkdownRenderer.tsx`
  - `src/features/ai-tutor/components/AiTutorSidebar.tsx`
  - `src/features/ai-tutor/components/AiTutorHeader.tsx`
  - `src/features/ai-tutor/components/AiTutorWelcomeCanvas.tsx`
  - `src/features/ai-tutor/components/AiTutorChatCanvas.tsx`
  - `src/features/ai-tutor/components/AiTutorInputBar.tsx`
  - `src/features/ai-tutor/components/AiTutorPageView.tsx`
  - `src/features/ai-tutor/index.ts`
  - `src/app/ai-tutor/page.tsx`
- **Cập nhật:**
  - `src/messages/vi.json` & `src/messages/en.json` (bổ sung namespace `aiTutor`)
  - `src/features/dashboard/components/DashboardSidebar.tsx` (liên kết mục "Gia sư AI" trỏ đến `/ai-tutor`)

---

## 3. Kiểm tra & Đánh giá (Validation)
- `npx tsc --noEmit`: 0 lỗi.
- `npm run build`: Thành công 100%, route `/ai-tutor` được biên dịch hợp lệ.
- **Browser Subagent Test:** Đã kiểm tra thực tế:
  - Khởi động `/ai-tutor` mượt mà, đầy đủ các thành phần.
  - Chuyển sang màn hình New Chat Welcome khi bấm nút "Đoạn chat mới" (`⌘K`).
  - Tương tác click thẻ gợi ý "Giải thích thuật toán Dijkstra" kích hoạt luồng hội thoại và nhận phản hồi Socratic.
  - Nút Fullscreen mở rộng tối đa không gian chat.
