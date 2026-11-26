# Nghiệm thu đợt triển khai giao bài, bảng điểm và heatmap

Ngày 25/11/2026

## Luồng sử dụng

Trong **Chi tiết môn → Bài tập**, giảng viên chọn lớp rồi bấm **+ Tạo**. Chọn **Lời nhắn**, **Bài tập văn bản**, **Quiz** hoặc **Bài kiểm tra**. Form hiển thị những trường của loại đang chọn. Có thể lưu nháp và mở lại từ danh sách bài. Lời nhắn xuất hiện trong tab Bài tập sau khi công bố.

Quiz và bài kiểm tra dùng chung bộ chọn câu hỏi. Giảng viên có thể chọn câu trong ngân hàng, soạn câu mới hoặc xem bộ của một quiz trong môn để dùng lại. Khi dùng lại cho bài kiểm tra, mỗi câu cần có bản gốc riêng trong ngân hàng. Người làm bài nhìn thấy trạng thái, thời gian theo máy chủ, số câu đã lưu và điểm khi được phép xem.

**Bảng điểm** hiển thị từng bài tính điểm, từng sinh viên và trạng thái nộp. Giảng viên mở bài văn bản để chấm, còn sinh viên xem hàng của mình. Bài kiểm tra đã nộp hiển thị **Chờ công bố điểm** cho tới khi giảng viên công bố kết quả sau giờ đóng. Từ Bảng điểm, giảng viên mở **Bản đồ nhiệt** cho đúng lớp và môn.

## Các lỗi đã xử lý

| Vấn đề trong UAT trước | Cách xử lý |
|---|---|
| Danh sách kỳ thi và grade report trả 500 | Migration bổ sung và đối chiếu schema theo liên kết có sẵn. Hai API cũ trả 200 khi chạy lại |
| Tạo câu hỏi ngân hàng trả 500 | BE ánh xạ trường tường minh. FE gửi đúng môn và mã khái niệm |
| Studio báo đã giao dù bước gắn câu hoặc công bố bị lỗi | Lưu nháp, lưu bộ câu và công bố tuần tự. Mỗi bước chờ xác nhận từ BE. Khi thử lại, form dùng ID nháp đã có |
| Bộ câu hỏi đã lưu không hiện trong bộ chọn | BE trả số câu và tổng điểm thực theo quiz. FE tải nội dung bộ đã chọn để xem trước |
| Đường làm quiz rơi vào trang không có | Danh sách giao bài trỏ tới trang làm bài theo lớp và assessment ID |
| FE báo lỗi ở danh sách và heatmap dù BE trả dữ liệu | Chuẩn hóa trường phân trang `last` trong bộ đọc chung. Dùng `deliveryId` khi điều hướng từ bảng điểm |
| Bài vừa giao chỉ hiện sau khi tải lại trang | Danh sách và bảng điểm tải lại khi quay về tab. Form giữ dữ liệu đang sửa nếu lần lưu thất bại |
| Điểm mặc định 1 khiến trình duyệt chặn công bố khi mở lại nháp | Đồng bộ giới hạn và bước nhập điểm với định dạng hai chữ số thập phân |
| Sinh viên trong lớp bị ẩn nút nộp bài văn bản | Dùng vai trò lớp xác nhận từ API. Màn chấm bài nhận cả chủ lớp và giảng viên có vai trò phù hợp |
| Heatmap đánh đồng 0% với chưa làm và cảnh báo từ mẫu quá nhỏ | Hiển thị số câu đã chấm và độ phủ. Học sinh chưa có bằng chứng có ô riêng. Cảnh báo cá nhân cần ba câu đã chấm của khái niệm |

## Kiểm tra tích hợp

- Chrome kiểm tra đường đi từ **+ Tạo** đến bốn lựa chọn, công bố lời nhắn và thấy trên danh sách ngay khi quay lại. Giảng viên dùng lại bộ câu, lưu nháp, mở lại và công bố quiz. Sinh viên mở từ danh sách, chọn đáp án, tải lại vẫn còn đáp án, nộp và thấy điểm. Bảng điểm sinh viên chỉ hiển thị hàng của mình.
- Chrome kiểm tra giảng viên giao bài văn bản, sinh viên nhập bài và nộp. Giảng viên mở bài nộp từ ô bảng điểm, ghi nhận xét, chấm 8,5/10 và thấy điểm đã cập nhật.
- Chrome cũng mở được bằng chứng từ heatmap, hiển thị trạng thái đã công bố điểm thi ở trang giảng viên, điểm 10/10 ở trang sinh viên và nhãn khái niệm đã duyệt trong bộ chọn câu hỏi.
- MariaDB cục bộ chạy thành công 75 migration bằng Flyway. Bốn migration mới cũng đã được thử trên bản DB UAT có dữ liệu cũ. Bộ BE đạt 240/240 test, ILMS-AI đạt 4/4 test và FE qua TypeScript.
- Đã dùng tài khoản tổng hợp giảng viên và sinh viên để kiểm tra API. Bài văn bản được chấm 7,5/10. Quiz nhận 0/10 và 10/10. Bảng điểm sinh viên có đúng một hàng. Các thao tác sang lượt làm hoặc kết quả của sinh viên khác bị từ chối.
- Bài kiểm tra giữ điểm cho tới khi công bố. Lượt có đáp án lưu trước giờ đóng được chấm. Lượt hết hạn trống là chưa nộp. Các bộ câu hỏi nháp thay toàn bộ trong một giao dịch và giữ bản cũ khi lưu bộ không hợp lệ.
- Heatmap thử với ba sinh viên có các ô 100%, 0% và chưa có dữ liệu. Độ phủ 2/3, trung bình 50% trước và sau khi đổi trang. Đã mở bằng chứng từng câu và xác nhận đủ ba câu thì mới thêm cảnh báo cá nhân.
- Spring Boot dùng worker header gọi router FastAPI trên MariaDB cục bộ. Mã và nhãn của đồ thị đã duyệt trả về đúng môn. Đã kiểm tra publication ngoài môn, người gọi thiếu khóa worker và sinh viên gọi danh mục.

## Phạm vi bàn giao

Đợt này dùng một lượt cho quiz và kiểm tra, với câu một đáp án hoặc Đúng/Sai. Bài văn bản nộp qua form văn bản. Tích hợp lưu tệp đính kèm với dịch vụ bên ngoài chưa được nghiệm thu. Các bản ghi lịch sử thiếu liên kết lớp–môn được giữ để đối soát trước khi tính vào bảng điểm mới. Kiểm thử chạy với dữ liệu tổng hợp trong môi trường cục bộ. Trạng thái triển khai môi trường dùng chung đang chờ.

[Kế hoạch triển khai](../docs/assessment-gradebook-heatmap-implementation-plan.md) · [UAT trước triển khai](2026-11-25-assessment-gradebook-heatmap-uat.md) · [Báo cáo BE](<D:/ILMS project/ILMS-BE/reports/2026-11-25-assessment-gradebook-and-heatmap.md>) · [Báo cáo AI](<D:/ILMS project/ILMS-AI/.reports/2026-11-25-assessment-concept-catalog.md>)
