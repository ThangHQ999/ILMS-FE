# Fix Student Direct Chat & Remove Project Group UI

- **Date:** 2026-11-27
- **Plan Summary:** Kết nối luồng nhắn tin trực tiếp với học viên qua `/chat?userId=<id>` (tuân thủ ranh giới feature `10-code.md` §2) và gỡ bỏ toàn bộ UI/copy liên quan đến "nhóm đồ án".

```text
STATUS: COMPLETE
SUMMARY: Đã sửa nút nhắn tin riêng trong bảng thành viên lớp & ngăn hồ sơ học viên để điều hướng tới /chat?userId=<id>, xử lý tự tạo/mở hội thoại 1-1 qua useCreateDirectConversation trong ChatPageView (chặn tự chat với chính mình và an toàn với React StrictMode), đồng thời gỡ bỏ mục "Gán vào nhóm đồ án", khối "Nhóm đồ án lớn" và cụm từ "nhóm làm đồ án" trong i18n.
FILES: modified src/features/chat/components/ChatPageView.tsx, src/features/classes/components/detail/ClassMembersTab.tsx, src/features/classes/components/detail/StudentDetailDrawer.tsx, src/messages/vi.json, src/messages/en.json, TASKS.md · created reports/2026-11-27-fix-student-direct-chat-and-remove-project-group.md
CHECKS: lint not run · typecheck ✔ · tests ✔ (14/14 chat unit tests + i18n symmetry + 0 hits scan) · build not run
ASSUMPTIONS: ClassMember.id được map từ rec.userId ?? userObj?.id ?? rec.id trong class-detail.service.ts khớp với targetUserId của POST /api/v1/chat/conversations/direct.
RISKS / LIMITATIONS: Chưa chạy kiểm thử tương tác trực tiếp trên trình duyệt với backend thật cho thao tác click nút chat từ bảng thành viên [NOT VERIFIED: live E2E browser click with backend].
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Mở /classes/[id] tab Thành viên, bấm icon chat hoặc "Nhắn tin riêng" trong hồ sơ học viên để xác nhận điều hướng và tạo phòng chat 1-1 với backend.
```
