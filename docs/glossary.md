# GLOSSARY — ILMS (EN ⇄ VI)

> Use these terms consistently in code, API, and `vi.json`/`en.json`. Add new terms here **before** using them. `[ASSUMED]` = confirm with the domain owner.

| EN term (code/API) | Vietnamese (UI) | Definition / notes |
|---|---|---|
| Learner / Student (`student`) | Học viên | Person who takes courses. UI says "Học viên", not "sinh viên", unless the org is a university `[ASSUMED]` |
| Instructor (`instructor`) | Giảng viên | Creates and teaches courses |
| Administrator (`admin`) | Quản trị viên | Full system access |
| Manager (`manager`) | Quản lý | Oversees groups/reports |
| Course | Khóa học | A structured learning unit |
| Section / Module | Chương | Group of lessons inside a course |
| Lesson | Bài học | Single unit of content |
| Enrollment | Ghi danh | Link between learner and course |
| Progress | Tiến độ | % of required lessons completed |
| Completion | Hoàn thành | Learner finished all required lessons |
| Assignment | Bài tập | Work submitted for grading |
| Submission | Bài nộp | A learner's answer to an assignment |
| Quiz | Bài kiểm tra | Set of questions, may be auto-graded |
| Question bank | Ngân hàng câu hỏi | Reusable questions |
| Attempt | Lượt làm bài | One try at a quiz |
| Grade / Score | Điểm | Result of assessment |
| Gradebook | Sổ điểm | All grades per course/learner |
| Class / Cohort | Lớp học | Group of learners `[ASSUMED]` |
| Attendance | Điểm danh | Presence record `[ASSUMED]` |
| Certificate | Chứng chỉ | Issued on completion `[ASSUMED]` |
| Announcement | Thông báo | Message to learners |
| Category | Danh mục | Course classification |
| Draft | Bản nháp | Course not visible to learners |
| Published | Đã xuất bản | Visible/enrollable |
| Archived | Đã lưu trữ | Hidden, history kept |
| Dashboard | Bảng điều khiển | Summary view per role |
| Report | Báo cáo | Aggregated data/export |

Status labels: enrollment `active`=Đang học, `completed`=Hoàn thành, `dropped`=Đã bỏ, `pending`=Chờ duyệt.