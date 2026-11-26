# Nâng cấp Trang làm bài kiểu Azota & Màn hình Kết quả có Sidebar/Header

- **Ngày:** 2026-11-26
- **Tóm tắt kế hoạch:** Tách `AssessmentPlayer` thành 2 giao diện chuyên biệt: (1) `AzotaInProgressPlayer` toàn màn hình tập trung giống Azota khi đang làm bài (0ms chọn đáp án + auto-save ngầm 700ms, thanh tên thí sinh, đồng hồ, phóng to/thu nhỏ cỡ chữ, đánh dấu cờ, lưới `01..N` 5 cột), và (2) `AssessmentStatusShellView` đặt trong layout chuẩn có đầy đủ `DashboardSidebar` + `DashboardHeader` cho màn hình Kết quả (`SUBMITTED`) và trạng thái chuẩn bị (`READY` / `WAITING_FOR_RESULTS` / `CLOSED`).

```text
STATUS: COMPLETE
SUMMARY: Thiết kế lại hoàn chỉnh trang `/classes/[id]/assessments/[assessmentId]/play`. Màn hình Kết quả và Chuẩn bị (`AssessmentStatusShellView`) nay hiển thị đầy đủ `DashboardSidebar`, `DashboardHeader`, thẻ điểm chi tiết (`score/maxScore`, `%` hoàn thành, số câu đã làm, nút xem Bảng điểm) và danh sách bài làm đã nộp. Màn hình đang làm bài (`AzotaInProgressPlayer`) bám sát bố cục Azota (thanh top bar có `Thí sinh`, thời gian, nút zoom cỡ chữ, đánh dấu câu, lưới `01..N` 5 cột, vòng tròn đáp án `A/B/C/D` tách khung) với cơ chế chọn tức thì 0ms + auto-save ngầm.
FILES:
  created:
    - src/features/assignments/components/assessment-player/AzotaInProgressPlayer.tsx
    - src/features/assignments/components/assessment-player/AssessmentStatusShellView.tsx
  modified:
    - src/features/assignments/components/AssessmentPlayer.tsx
CHECKS: lint ✘ (package.json không có script lint) · typecheck ✔ (npx tsc --noEmit) · tests not run · build not run
ASSUMPTIONS:
  - Khi học sinh đang làm bài (`IN_PROGRESS`), ẩn `DashboardSidebar` để tối đa không gian làm bài tập trung giống Azota; khi chưa bắt đầu hoặc đã nộp bài xem kết quả, hiển thị đầy đủ `DashboardSidebar` và `DashboardHeader`.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm thử runtime trên trình duyệt với Backend thật và chưa chạy `npm run build`.
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Mở lại trang làm bài và trang kết quả Quiz/Exam để kiểm tra cả Light/Dark mode, zoom cỡ chữ, đánh dấu câu và tốc độ chọn đáp án.
```
