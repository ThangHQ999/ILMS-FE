# Sửa trang Phân tích quiz

**Ngày 25/11/2026**

Đối chiếu đường dẫn từ tab Bài tập với API quiz, thay giao diện mẫu bằng kết quả theo lớp và kiểm tra qua luồng tạo đề, nộp bài, chấm điểm và đọc báo cáo.

## Phát hiện và thay đổi

| Phát hiện | Thay đổi đã triển khai |
|---|---|
| Đường dẫn chứa ID quiz nhưng trang dùng tên đề, điểm và danh sách sinh viên mẫu. Khi API lỗi, lớp service cũng có thể trả về dữ liệu mẫu. | Đọc đúng quiz, lớp và môn. Hiển thị các trạng thái tải, đường dẫn sai, thiếu quyền, lỗi tải và chưa có điểm. |
| Điểm mẫu che khuất sĩ số, số đã nộp và thang điểm thật. | Hiển thị số đã nộp trên sĩ số, số có điểm, điểm trung bình, điểm cao nhất, tỷ lệ đạt và phổ điểm theo thang của đề. |
| Biểu đồ và gợi ý cũ không phản ánh đáp án đã chấm. | Xếp các câu có tỷ lệ đúng thấp trước. Mỗi câu có số lượt đúng, sai, bỏ trống và số lượt có dữ liệu so với số sinh viên đã chấm. Hiển thị đường dẫn đến bản đồ nhiệt đúng lớp và môn. |
| Danh sách và các thao tác cũ dùng dữ liệu minh họa. | Bảng kết quả có tên, trạng thái, điểm và thời điểm nộp. Hỗ trợ tìm tên có hoặc không dấu, lọc trạng thái, sắp xếp, phân trang và xuất CSV theo bộ lọc. |

## Quy tắc tính

- Mỗi sinh viên đang học đóng góp tối đa một lượt đã chấm. Lượt đã chấm gần nhất vẫn được dùng khi sinh viên bắt đầu lượt mới. Nếu hai lượt có cùng thời điểm nộp, số thứ tự lượt làm quyết định.
- Điểm 0 hiển thị theo thang điểm của đề. Điểm chưa có hiển thị `—`. Tỷ lệ đạt cần ngưỡng đạt và ít nhất một điểm đã chấm.
- Từng câu chỉ tổng hợp từ dữ liệu đáp án đã lưu. Một bản ghi đã chấm nhưng trống được tính là bỏ trống. Một câu thiếu bản ghi đáp án lịch sử được loại khỏi mẫu của câu.
- CSV bao gồm tất cả kết quả qua bộ lọc hiện tại, kể cả các trang khác. Trang hiển thị thời gian theo cấu hình ngôn ngữ của ứng dụng.

## Kiểm thử

| Kiểm tra | Kết quả |
|---|---|
| Next.js production build và TypeScript | Đạt. |
| Gradle build và bộ kiểm thử BE | 243 test đạt. |
| Tạo nháp, xuất bản và nộp bài trên MariaDB riêng | Đạt. Quiz 20 điểm cho thấy điểm 0 và 20, trung bình 10, tỷ lệ đạt 50%, 2/3 sinh viên đã nộp. Hai câu lần lượt cho 1 đúng, 1 sai và 1 đúng, 1 bỏ trống. |
| Phân quyền và ngữ cảnh | Sinh viên nhận `403`, quiz gắn sai lớp nhận `404`, đường dẫn chỉ có quiz vẫn xác định đúng lớp. |
| Service FE với API thật và phản hồi phiên bản trước | Đạt. Kiểm tra điểm 0, điểm trống, câu bỏ trống, phạm vi lớp và từ chối phản hồi mẫu cũ. |
| Đường dẫn người dùng cung cấp | HTTP `200`. Phiên Cốc Cốc hiện tại không hỗ trợ công cụ duyệt nên phần hiển thị sau đăng nhập và tương tác trực tiếp trên quiz này còn chờ xác minh. |

FE build dùng bản sao tạm. Kiểm thử nộp bài dùng dữ liệu tổng hợp trong DB riêng. Lint chưa chạy vì repo không có lệnh lint. Phiên BE cần nạp bản code mới để trả số liệu theo câu và theo sinh viên.

## Tệp chính

- Giao diện và route `TeacherQuizAnalyticsView.tsx`, `src/app/assignments/analytics/page.tsx`.
- Kết nối API `useQuizzes.ts`, `quiz.service.ts`, `quiz.schema.ts`.
- Bản dịch tiếng Việt và tiếng Anh trong `src/messages`.
- Hợp đồng FE trong `docs/api-spec.md`.
