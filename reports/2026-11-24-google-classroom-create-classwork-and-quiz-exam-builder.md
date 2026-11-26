# Triển khai Luồng Tạo Bài tập Đa dạng Kiểu Google Classroom trong Chi tiết Lớp học

- **Ngày:** 2026-11-24
- **Tóm tắt:** Xây dựng giao diện tạo & giao bài thống nhất 2 cột kiểu Google Classroom trong tab Bài tập & Đánh giá (`ClassAssignmentsTab`), hỗ trợ Lời nhắn, Bài tập tự luận/nộp tệp, Bộ câu hỏi Trắc nghiệm (Quiz) và Bài kiểm tra (Exam).

```text
STATUS: COMPLETE
SUMMARY: Đã triển khai hoàn chỉnh nút "+ Tạo" 4 lựa chọn và trình soạn thảo 2 cột kiểu Google Classroom (CreateClassworkDrawer + QuizQuestionPickerPanel) trong ClassAssignmentsTab, kết nối API cho Lời nhắn (postClassAnnouncement), Bài tập tự luận (createAssignment + uploadFile), Quiz (createQuiz + addQuestionsBatchToQuiz + publishQuiz) và Exam (createExam + addExamQuestion + publishExam), đồng thời hiển thị danh sách Quiz & Bài kiểm tra ngay trong tab Bài tập của lớp.
FILES: created src/features/classes/components/detail/QuizQuestionPickerPanel.tsx, src/features/classes/components/detail/CreateClassworkDrawer.tsx, reports/2026-11-24-google-classroom-create-classwork-and-quiz-exam-builder.md · modified src/features/classes/components/detail/ClassAssignmentsTab.tsx, TASKS.md
CHECKS: lint ✘ (package.json không có script lint) · typecheck ✔ (npx tsc --noEmit) · tests not run · build not run
ASSUMPTIONS: Lời nhắn (NOTICE) được đăng vào luồng Thông báo lớp (postClassAnnouncement) để không tạo cột điểm rác trong Bảng điểm.
RISKS / LIMITATIONS: Chưa kiểm thử runtime trên trình duyệt sau lượt sửa cuối; nếu Backend chưa có câu hỏi trong Ngân hàng câu hỏi, giảng viên có thể dùng tab "+ Soạn câu mới" để tạo trực tiếp.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Mở /classes/{id}?tab=assignments trên trình duyệt để trải nghiệm nút "+ Tạo" và tạo thử Quiz/Bài tập.
```
