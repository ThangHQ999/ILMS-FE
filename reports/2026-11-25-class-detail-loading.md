# Tải dữ liệu trên trang Chi tiết lớp

**Ngày 25/11/2026**

## Kết quả kiểm tra

- Bảng tin và tab Tài liệu trước đây chờ danh sách môn rồi gửi một request tài liệu cho mỗi môn. Tab Tài liệu còn gọi danh sách hàng đợi AI chung để lấy badge. Hook Chi tiết lớp tải danh sách môn có thể gán dù người xem đang ở tab khác.
- Preflight GET và POST từ `http://localhost:3000` đến API thông báo lớp trả `200`. GET không gửi phiên đăng nhập trả `401`. Với tài khoản thử nghiệm có quyền, đọc và đăng thông báo trả `200`. Chưa xác nhận nguyên nhân của request trong phiên trình duyệt người dùng.
- Chuông thông báo khởi tạo GET danh sách ngay khi header được dựng, dù bảng thông báo đang đóng.

## Thay đổi

- Bảng tin tải tối đa bốn tài liệu xem trước sau khi xác định lớp. Tab Tài liệu nạp giao diện khi mở, gọi API theo lớp và nhận từng trang 10 mục. Tìm kiếm và lọc chạy trên tập dữ liệu đầy đủ ở BE. Danh mục môn có thể gán tải trong tab Môn học.
- Khi GET thông báo lớp lỗi, FE hiển thị lỗi xác thực, thiếu quyền hoặc lỗi tải kèm nút thử lại. Thời điểm thông báo lấy từ trường `createTime` của BE. Phản hồi xác nhận POST không sinh thẻ thông báo giả.
- Chuông chỉ gọi GET trang đầu danh sách khi mở. Bảng dùng lại cache còn mới trong 30 giây. Badge số chưa đọc và SSE tiếp tục cập nhật, còn danh sách đóng chỉ được đánh dấu cần làm mới.

## Kiểm thử

- Next.js production build, TypeScript và 245 test BE đạt. Kiểm thử TypeScript–API với tài khoản thử nghiệm xác nhận FE lấy lớp bằng một request và nhận đúng dữ liệu phân trang, mã môn và loại tài liệu.
- Lớp thử nghiệm có ba môn cần 3 request tài liệu ở luồng cũ và 1 request ở luồng mới. Đây là số request phần tài liệu, chưa đo thời gian render sau đăng nhập trên lớp của người dùng.
- Kiểm thử hook chuông xác nhận 0 request danh sách khi đóng, 1 khi mở lần đầu và dùng cache khi mở lại. Mô phỏng cập nhật từ SSE xác nhận dữ liệu được tải lại ở lần mở kế tiếp.
- Gửi thử thông báo và tạo tài liệu mẫu trên DB riêng. Phiên BE đang chạy trên localhost cần nạp bản mới để dùng API tài liệu theo lớp.
