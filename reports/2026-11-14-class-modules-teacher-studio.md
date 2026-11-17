# Báo cáo: Tab Chương trình học - Chế độ Giảng viên (Edit Mode Studio)

- **Ngày thực hiện:** 2026-11-14
- **Branch:** `tung_anh_branch`
- **Mục tiêu:**
  1. Triển khai hoàn chỉnh Tab Chương trình học (`modules`) tại `/classes/[id]` theo đúng mẫu HTML "Edit Mode Studio" (CS-202 Mạng máy tính & Truyền thông dữ liệu - TS. Lê Hoàng Nam).
  2. Bố cục không gian 2 cột (8 cột bên trái cho Cây giáo trình, 4 cột bên phải cho Công cụ Sư phạm & AI Copilot).
  3. Thanh điều khiển Studio Command Bar: Công tắc gạt Chế độ chỉnh sửa (Đang bật/tắt), tìm kiếm bài giảng live, bộ lọc trạng thái 3 nút (Tất cả, Đã xuất bản, Bản nháp), 4 nút hành động CTA (Xem góc nhìn học sinh, Tải lên hàng loạt, +Thêm Bài học, +Thêm Chương mới).
  4. Banner tuần học hiện tại (Tuần 09 - Trọng tâm thi giữa kỳ).
  5. 5 Module Accordion tương tác:
     - Chương 1: Đã xuất bản 4/4 bài (Video, Slide, Lab, Quiz đóng hạn).
     - Chương 2: Đã xuất bản (4 bài • 1 Lab Socket C++).
     - Chương 3 (Active Focus): Tầng Giao vận (Video, Mô phỏng tương tác cảnh báo 6 SV kẹt, Bản nháp với nút Xuất bản 1-click, Lab Wireshark nộp điểm với nút Chấm bài 31, Quiz khóa có điều kiện nộp Lab 3.4).
     - Thanh thêm nhanh học liệu vào Chương 3 (+Video, +PDF, +Lab, +Quiz AI).
     - Chương 4: Lên lịch mở 28/10 kèm nút Mở ngay bây giờ.
     - Chương 5: Bị khóa.
  6. 3 Thẻ công cụ sư phạm & AI Copilot bên phải:
     - Cấu hình lộ trình học (Tuần tự vs Tự do) kèm cảnh báo trở ngại nhận thức và nút gửi nhắc nhở tự động.
     - Trợ lý giáo trình AI Copilot kèm trích xuất PDF và thanh tiến độ độ phủ CDIO/ABET (88.5%).
     - Kiểm tra chất lượng Audit 94/100 kèm nút xuất báo cáo PDF cho Trưởng Bộ môn.
  7. 3 Modal tương tác (Thêm chương, Thêm bài học, Tải lên hàng loạt) chuẩn khung viền dày 3px (`border-[3px] border-slate-300 dark:border-slate-700`).

---

## 1. Chi tiết thay đổi mã nguồn

- **Tạo thư mục component mô-đun hóa (`src/features/classes/components/detail/modules/`):**
  - `StudioCommandBar.tsx`: Thanh điều khiển Studio tích hợp công tắc chỉnh sửa, tìm kiếm, lọc và CTA.
  - `ActiveWeekBanner.tsx`: Banner tuần 09 nổi bật với dải màu chuyển sắc và badge trọng tâm thi giữa kỳ.
  - `ModuleAccordionItem.tsx`: Thẻ chương học dạng accordion với tay cầm kéo thả, trạng thái động, danh sách bài học và thanh quick action.
  - `AdaptiveLearningFlowCard.tsx`: Thẻ cấu hình lộ trình học tuần tự/tự do và cảnh báo học viên gặp trở ngại nhận thức.
  - `AiSyllabusCopilotCard.tsx`: Thẻ AI Copilot phân tích PDF và widget độ phủ CDIO/ABET.
  - `SyllabusAuditChecklistCard.tsx`: Thẻ chấm điểm chất lượng đề cương 94/100 và nút xuất báo cáo PDF.
  - `ClassModuleModals.tsx`: Bộ 3 modal viền 3px cho các tác vụ thêm chương, thêm bài học và tải lên hàng loạt.
- **Tái cấu trúc `ClassModulesTab.tsx`:**
  - Kết nối toàn bộ 7 component trên vào một màn hình duy nhất, quản lý state bài giảng, lọc tìm kiếm, xuất bản 1-click và mở khóa sớm.

---

## 2. Kết quả kiểm thử & xác minh

- **Typecheck:** `npx tsc --noEmit` -> ✔ Hoàn tất 100%, 0 lỗi TypeScript.
- **Build Production:** `npm run build` (Next.js 16.4.6 Turbopack) -> ✔ 25/25 routes tĩnh & động biên dịch thành công.

---

## 3. Báo cáo tổng kết theo chuẩn AGENTS.md

```text
STATUS: COMPLETE
SUMMARY: Triển khai hoàn chỉnh Tab Chương trình học - Chế độ Giảng viên (Edit Mode Studio) tại /classes/[id] theo đúng mockup HTML: Thanh công cụ Studio Command Bar, Cây giáo trình 5 chương accordion với Chương 3 Active Focus, xuất bản 1-click, chấm bài Lab 31, cảnh báo trở ngại nhận thức 6 SV kẹt, trợ lý AI Copilot độ phủ CDIO 88.5%, audit chất lượng 94/100, 3 modal viền 3px và kết nối API Spring Boot an toàn.
FILES:
  - Created: src/features/classes/components/detail/modules/StudioCommandBar.tsx
  - Created: src/features/classes/components/detail/modules/ActiveWeekBanner.tsx
  - Created: src/features/classes/components/detail/modules/ModuleAccordionItem.tsx
  - Created: src/features/classes/components/detail/modules/AdaptiveLearningFlowCard.tsx
  - Created: src/features/classes/components/detail/modules/AiSyllabusCopilotCard.tsx
  - Created: src/features/classes/components/detail/modules/SyllabusAuditChecklistCard.tsx
  - Created: src/features/classes/components/detail/modules/ClassModuleModals.tsx
  - Modified: src/features/classes/components/detail/ClassModulesTab.tsx
CHECKS: lint not run (no script) · typecheck ✔ · tests not run · build ✔
ASSUMPTIONS: Sử dụng dữ liệu môn học liên kết và API có sẵn /api/v1/courses/{courseId}/chapters, /lessons, /content; không thêm endpoint lạ.
RISKS / LIMITATIONS: None
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Trải nghiệm thực tế trên trình duyệt tại tab "Chương trình học" của lớp học CS-202.
```

