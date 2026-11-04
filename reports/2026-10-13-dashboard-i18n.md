# Báo cáo: Đa ngôn ngữ (i18n) cho trang Dashboard người dùng

- **Ngày thực hiện:** 2026-10-13
- **Mục tiêu:** Chuyển đổi toàn bộ văn bản UI tĩnh của trang Dashboard sang hệ thống đa ngôn ngữ `next-intl` (đối xứng hoàn toàn tiếng Việt `vi.json` và tiếng Anh `en.json`), ngoại trừ nội dung tin nhắn chat của AI Socratic Coach theo yêu cầu riêng của người dùng.

---

## 1. Tóm tắt kết quả
- **STATUS:** COMPLETE
- Đã thiết lập namespace `dashboard` hoàn chỉnh trong cả `src/messages/vi.json` và `src/messages/en.json` với hơn 70 khóa dịch bao phủ cả hai chế độ (Analytics View và Focus View).
- Chuyển đổi 100% các thành phần UI sang hook `useTranslations('dashboard')` của `next-intl`:
  - `DashboardPageView.tsx`: Dòng trạng thái tải dữ liệu `loading`.
  - `DashboardHeader.tsx`: Breadcrumbs, nút chuyển chế độ Focus/Analytics, thanh tìm kiếm.
  - `DashboardSidebar.tsx`: Các mục điều hướng, tooltip thu gọn, thẻ trạng thái Cloud Lab Storage.
  - `NotificationDropdown.tsx`: Tiêu đề, các tab bộ lọc thông báo, nút đánh dấu đã đọc tất cả, trạng thái trống, liên kết chuyển đến cài đặt.
  - `AnalyticsView.tsx`: Banner chào mừng, huy hiệu PRO LEARNER, bộ lọc thời gian (7 ngày, tháng này, toàn khóa), nút kích hoạt chế độ Focus.
  - `MetricStatCards.tsx`: 4 thẻ chỉ số thống kê (chuỗi học tập, thời lượng học tuần, node kiến thức đã mở, bài tập sắp đến hạn).
  - `CompetencyHeatmap.tsx`: Tiêu đề heatmap, chú giải mức độ thành thạo, tiêu đề khung PLO, nhãn tuần `weekLabel` và tooltip từng ngày.
  - `AIInsightCard.tsx`: Thẻ thông báo phát hiện lỗ hổng tri thức, độ chính xác, thời lượng, câu hỏi, độ khó, chỉ số phục hồi PLO, nút làm test ngay.
  - `CourseProgressTable.tsx`: Danh sách các khóa học đang tham gia, bộ lọc tiến độ, tiêu đề 6 cột bảng dữ liệu, các nút hành động (Tiếp tục học, Ôn luyện, Báo cáo).
  - `FocusView.tsx`: Tiêu đề `zenTitle`, châm ngôn `zenSubtitle`.
  - `ZenHeaderBanner.tsx`: Trạng thái Deep Work & Zen Learning, chỉ số độ yên tĩnh `zenQuiet`.
  - `HeroLearningCard.tsx`: Thông tin chi tiết bài học đang dang dở (Chương 3 BST), thanh tiến độ, các nút học ngay, tóm tắt giáo trình, lưu bài học.
  - `AITaskChecklist.tsx`: Tiêu đề danh sách nhiệm vụ AI đề xuất hôm nay, bộ đếm số nhiệm vụ đã hoàn thành.
  - `SocraticAICoach.tsx`: Các nút điều khiển thu nhỏ thành FAB, toàn màn hình, thanh kéo resize, menu tùy chọn gia sư AI, danh sách gợi ý tư duy nhanh `quickChips`, nhãn nhập liệu và tooltip nút gửi.
  - **Giữ nguyên:** Toàn bộ tin nhắn chat AI trong `useSocraticChat.ts` không can thiệp, tuân thủ đúng yêu cầu người dùng.

---

## 2. Danh sách tệp chỉnh sửa
- `src/messages/vi.json`
- `src/messages/en.json`
- `src/features/dashboard/components/DashboardPageView.tsx`
- `src/features/dashboard/components/DashboardHeader.tsx`
- `src/features/dashboard/components/DashboardSidebar.tsx`
- `src/features/dashboard/components/NotificationDropdown.tsx`
- `src/features/dashboard/components/AnalyticsView/AnalyticsView.tsx`
- `src/features/dashboard/components/AnalyticsView/MetricStatCards.tsx`
- `src/features/dashboard/components/AnalyticsView/CompetencyHeatmap.tsx`
- `src/features/dashboard/components/AnalyticsView/AIInsightCard.tsx`
- `src/features/dashboard/components/AnalyticsView/CourseProgressTable.tsx`
- `src/features/dashboard/components/FocusView/FocusView.tsx`
- `src/features/dashboard/components/FocusView/ZenHeaderBanner.tsx`
- `src/features/dashboard/components/FocusView/HeroLearningCard.tsx`
- `src/features/dashboard/components/FocusView/AITaskChecklist.tsx`
- `src/features/dashboard/components/FocusView/SocraticAICoach.tsx`

---

## 3. Kiểm tra & Đánh giá (Validation)
- `npx tsc --noEmit`: Đạt (0 lỗi cú pháp hoặc lỗi kiểu).
- `npm run build`: Đạt (biên dịch Next.js 16 App Router thành công, tất cả các route đều hợp lệ).
- Trình duyệt thực tế (Browser Subagent): Kiểm tra trực tiếp trên `http://localhost:3000/dashboard`, chuyển đổi linh hoạt giữa chế độ Phân tích (Analytics View) và Chế độ Tập trung (Focus View), giao diện hiển thị chính xác và bố cục ổn định.
