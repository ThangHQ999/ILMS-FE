# Tối ưu lượt tải đầu của Bảng tin

**Ngày 25/11/2026**

## Luồng mới

- Bảng tin tải `GET /api/v1/classes/{classId}/overview` cho banner, thống kê, thông báo và tối đa bốn ca sắp tới. Tab Tài liệu và tab Lịch học tải dữ liệu chi tiết theo tab.
- Tài liệu xem trước lấy tối đa bốn mục khi khối xem trước xuất hiện. Các biểu mẫu tạo hoặc sửa ca học tải danh mục phòng.
- FE tái sử dụng cache tổng quan, thông tin lớp và số liệu khi đổi tab. Thay đổi thông báo và lịch làm mới tổng quan theo ID lớp. Lịch học báo lỗi và cho thử lại theo URL chính.

## Kết quả

- Next.js build, TypeScript và 248 test BE đạt.
- Kiểm thử lớp riêng với cookie tổng hợp xác nhận một GET khi mở Bảng tin, thêm một GET khi kích hoạt xem trước, không gọi lại tổng quan khi đổi tab rồi quay lại với cache còn mới. Sau khi đăng thông báo, FE gửi đúng một GET để làm mới tổng quan.
- Trong năm lượt đo API với cùng dữ liệu thử nghiệm, nhóm 7 GET cũ chạy song song có trung vị 143 ms và 12.250 byte dữ liệu JSON. Một GET tổng quan có trung vị 85 ms và 6.245 byte. Đây là số đo HTTP trên môi trường riêng.
- Luồng Lịch học với phản hồi `401` chỉ gửi một request và hiển thị tùy chọn thử lại. Tốc độ render trên phiên đăng nhập của lớp người dùng chưa được đo.
- Đường dẫn lớp người dùng cung cấp trả HTTP `200`. BE localhost đã nạp `/overview` và `/materials` qua DevTools.

## Cập nhật phần ca học

Lớp được đối chiếu có ba ca đã qua. Ca gần nhất là ngày 24/11, từ 07:00 đến 09:40. Bảng tin nhận thêm `recentSession` trong phản hồi tổng quan, ghi rõ **Ca gần nhất đã qua** và có nút **Xem lịch học**. Trạng thái lớp chưa xếp ca và lịch ngoài quyền xem có thông báo riêng.
