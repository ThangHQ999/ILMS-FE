# Remove Class Card Attendance & Study Session Modal

- **Date:** 2026-11-27
- **Plan Summary:** Gỡ bỏ chỉ số "Chuyên cần: 100%" trên card lớp học (`ClassCardItem`, `FacultyClassListView`) và tách form tạo lịch học nhóm trong chat (`StudySessionPanel`) thành `CreateStudySessionModal` hiển thị qua portal.

```text
STATUS: COMPLETE
SUMMARY: Đã xóa chỉ số "Chuyên cần: X%" / "X% CC" khỏi thẻ lớp học và chế độ danh sách giảng viên; đồng thời thay form mở inline trong StudySessionPanel bằng modal căn giữa (CreateStudySessionModal render qua createPortal, hỗ trợ Escape/backdrop, nút chọn nhanh 30/60/90/120 phút, mô tả tùy chọn và sửa lỗi lặp hai dấu "+" trên nút Tạo lịch học nhóm).
FILES: created src/features/chat/components/modals/CreateStudySessionModal.tsx, reports/2026-11-27-remove-class-card-attendance-and-study-session-modal.md · modified src/features/classes/components/ClassCardItem.tsx, src/features/classes/components/FacultyClassListView.tsx, src/features/chat/components/drawer/StudySessionPanel.tsx, src/messages/vi.json, src/messages/en.json, TASKS.md
CHECKS: lint not run · typecheck ✔ · tests ✔ (14/14 chat unit tests + i18n symmetry 3702 keys + class card attendance 0 hits scan) · build not run
ASSUMPTIONS: Người dùng muốn xóa "Chuyên cần: 100%" ở cả chế độ xem lưới (ClassCardItem) và danh sách giảng viên (FacultyClassListView), và giữ form tạo lịch học nhóm kết nối API POST /chat/conversations/{id}/study-sessions hiện có qua modal mới.
RISKS / LIMITATIONS: Chưa kiểm thử click mở modal và lưu dữ liệu thực tế trên trình duyệt với backend đang chạy [NOT VERIFIED: live browser E2E, build].
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Kiểm tra trang /classes ở chế độ thẻ & danh sách để xác nhận đã ẩn "Chuyên cần: 100%", và bấm "+ Tạo lịch học nhóm" trong ngăn phải của /chat để thử modal mới.
```
