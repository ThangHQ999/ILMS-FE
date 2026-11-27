# Classwork Grid/List View & Student Score Badges

- **Date:** 2026-11-27
- **Plan Summary:** Thêm bộ chuyển đổi hiển thị Dạng lưới / Danh sách (mặc định Dạng lưới) cho `ClassworkPanel` và hiển thị điểm/trạng thái của học sinh trên mỗi thẻ bài tập, quiz, bài kiểm tra từ dữ liệu thật `/gradebook/me`.

```text
STATUS: COMPLETE
SUMMARY: Đã tách ClassworkItemCard hỗ trợ 2 bố cục Lưới (mặc định, 1–3 cột) và Danh sách kèm nút chuyển đổi trên thanh công cụ của ClassworkPanel; khi người xem là học sinh (!canManage), tự động nạp useCourseClassGradebook(..., false, 0, true) từ /gradebook/me và hiển thị badge điểm thực tế hoặc trạng thái (Đã chấm / Chờ chấm / Chờ công bố / Đang làm / Chưa nộp) trên từng thẻ Bài tập, Quiz, Bài kiểm tra.
FILES: created src/features/assignments/utils/classworkGrades.ts, src/features/assignments/components/classwork/ClassworkItemCard.tsx, src/features/assignments/__tests__/classwork-grades.test.ts, reports/2026-11-27-classwork-grid-list-view-and-student-scores.md · modified src/features/assignments/hooks/useClasswork.ts, src/features/assignments/components/classwork/ClassworkPanel.tsx, src/messages/vi.json, src/messages/en.json, TASKS.md
CHECKS: lint not run · typecheck ✔ · tests ✘/partial (classwork-grades.test.ts 3/3 ✔, i18n symmetry 3695 keys ✔; assignment-lists.test.ts 6/11 pass, 5 pre-existing legacy failures unrelated to ClassworkPanel) · build not run
ASSUMPTIONS: Endpoint GET /classes/{classId}/courses/{courseId}/gradebook/me trả về đúng schema courseClassGradebookSchema và khớp deliveryId / assessmentId với các item trong ClassworkPanel.
RISKS / LIMITATIONS: Chưa chạy kiểm thử tương tác trực tiếp trên trình duyệt với API backend thật và chưa chạy production build [NOT VERIFIED: live browser E2E, build]. 5 test legacy trong assignment-lists.test.ts (verify_assignments_view_polish_and_modal, verify_back_links_right_alignment, verify_remove_class_banner, verify_student_assignments_and_exams_tables, verify_teacher_delete_and_borders) đã thất bại sẵn trên các component cũ không thuộc phạm vi sửa lần này.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Mở tab Bài tập và đánh giá dưới vai trò học sinh để kiểm tra hiển thị mặc định dạng Lưới, chuyển qua Danh sách và đối chiếu điểm từng bài với dữ liệu BE thật.
```
