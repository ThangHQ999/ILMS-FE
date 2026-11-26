# Tối ưu request trang Ca học

Trang `/lesson-sessions` trước đây dùng hook Chi tiết lớp, tải dữ liệu thông tin lớp, thống kê, môn học và thông báo ngoài dữ liệu lịch. Trang cũng lấy danh sách phòng ngay khi mở. FE nay chỉ tải danh sách lớp cho bộ lọc và lịch của tuần trên màn hình đầu. Hai endpoint lịch hiện tại hỗ trợ lọc khoảng ngày ở backend.

| Thao tác | GET cho dữ liệu trang |
| --- | --- |
| Mở lịch cá nhân sau đăng nhập, cache trống | 2, gồm bộ lọc lớp và thời khóa biểu của tuần |
| Sang tuần mới hoặc chọn lớp | 1 cho lịch tương ứng |
| Quay về tuần vừa xem khi dữ liệu còn mới | 0 |
| Mở biểu mẫu ca học lần đầu | 1 cho phòng học |
| Mở lại biểu mẫu trong thời gian cache | 0 |
| Mở điểm danh từ lịch tổng | 2, gồm học viên đang hoạt động và điểm danh của ca |
| Mở danh sách lịch sử lần đầu | 1 cho lịch đầy đủ |

Lịch dùng cache theo lớp và khoảng ngày. Nút **Điểm danh hôm nay** dùng lại dữ liệu tuần hiện tại khi giảng viên đang xem tuần khác và cache còn mới. Menu chọn lớp cung cấp tên lớp sẵn có. Khi vào bằng liên kết tới một lớp ngoài danh sách đã tải, FE lấy riêng thông tin lớp đó. Điểm danh, sửa và xóa dùng mã lớp của ca đã chọn. Giảng viên chọn một lớp trước khi tạo ca mới từ lịch cá nhân.

## Kiểm thử

- Chạy TypeScript, Next.js production build trên bản sao kiểm thử và kiểm tra whitespace. HTTP của `/lesson-sessions` tại `localhost:3000` trả `200`.
- Dùng các hook của trang với TanStack Query và API backend chạy riêng. Kiểm tra khoảng thứ Hai đến Chủ nhật, tuần trống cache, tuần có cache, bộ lọc lớp, danh sách lịch sử và liên kết điểm danh ngoài tuần đang xem. Xác nhận lưu điểm danh thành công và lỗi lịch chỉ phát sinh một GET.
- Bộ đếm trên đo request dữ liệu do trang Ca học khởi tạo. Phiên đăng nhập và thanh điều hướng có các request dùng chung của ứng dụng. Kiểm tra lint bị giới hạn vì `package.json` hiện thiếu script `lint`.
