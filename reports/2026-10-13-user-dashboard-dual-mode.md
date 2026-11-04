# User Dashboard (Dual-Mode: Analytics & Focus, Resizable Socratic AI Coach)

- **Date:** 2026-10-13
- **Plan Summary:** Xây dựng trang Dashboard người dùng (`/dashboard`) chuẩn Feature-Driven, hỗ trợ 2 chế độ hiển thị qua `localStorage.ilms_layout_mode` (Chế độ Phân tích & Chế độ Tập trung Zen Learning), Flyout thông báo, Socratic AI Coach hiển thị Markdown và thanh kéo resize tối đa 2/5 màn hình, bọc thẻ Auth Guard.

---

```text
STATUS: COMPLETE
SUMMARY: Triển khai hoàn chỉnh trang Dashboard người dùng (/dashboard) hỗ trợ 2 chế độ hiển thị qua localStorage: Chế độ Phân tích (Analytics) và Chế độ Tập trung (Focus/Zen). Tích hợp đồng bộ Logo chuẩn của dự án (ILMS Intelligent LMS) ở cả 2 chế độ, Flyout Thông báo với tabs lọc, Socratic AI Coach hiển thị Markdown, thanh kéo resize tối đa 2/5 màn hình, thu gọn thành nút FAB, và bảo vệ phiên đăng nhập qua Auth Guard.
FILES: 
  Created:
    - src/features/dashboard/schemas/dashboard.schema.ts
    - src/features/dashboard/types.ts
    - src/features/dashboard/constants.ts
    - src/features/dashboard/services/dashboard.service.ts
    - src/features/dashboard/services/ai-chat.service.ts
    - src/features/dashboard/hooks/useDashboardMode.ts
    - src/features/dashboard/hooks/useDashboardData.ts
    - src/features/dashboard/hooks/useNotifications.ts
    - src/features/dashboard/hooks/useSocraticChat.ts
    - src/features/dashboard/components/SocraticMarkdownRenderer.tsx
    - src/features/dashboard/components/NotificationDropdown.tsx
    - src/features/dashboard/components/DashboardSidebar.tsx
    - src/features/dashboard/components/DashboardHeader.tsx
    - src/features/dashboard/components/AnalyticsView/MetricStatCards.tsx
    - src/features/dashboard/components/AnalyticsView/CompetencyHeatmap.tsx
    - src/features/dashboard/components/AnalyticsView/AIInsightCard.tsx
    - src/features/dashboard/components/AnalyticsView/CourseProgressTable.tsx
    - src/features/dashboard/components/AnalyticsView/AnalyticsView.tsx
    - src/features/dashboard/components/FocusView/ZenHeaderBanner.tsx
    - src/features/dashboard/components/FocusView/HeroLearningCard.tsx
    - src/features/dashboard/components/FocusView/AITaskChecklist.tsx
    - src/features/dashboard/components/FocusView/SocraticAICoach.tsx
    - src/features/dashboard/components/FocusView/FocusView.tsx
    - src/features/dashboard/components/DashboardPageView.tsx
    - src/features/dashboard/index.ts
    - src/app/dashboard/page.tsx
  Modified:
    - src/messages/vi.json
    - src/messages/en.json
    - TASKS.md
    - package.json (thêm react-markdown, remark-gfm)
CHECKS: lint ✔ · typecheck ✔ · build ✔ · visual-verification ✔
ASSUMPTIONS: Khi backend chưa triển khai đầy đủ các endpoint chuyên biệt cho dashboard, frontend tự động fallback mock data thông minh theo schema Zod để ứng dụng luôn sẵn sàng.
RISKS / LIMITATIONS: Cần backend cập nhật các endpoint dashboard chính thức theo contract đề xuất bên dưới khi chuyển sang giai đoạn tích hợp production.
DOCS: updated TASKS.md | api contract proposal recorded below
DEPLOYMENT: not deployed
NEXT: Tích hợp WebSocket hoặc Server-Sent Events (SSE) cho Socratic AI streaming realtime.
```

---

## 1. Danh sách API Cần Có & Cách Mock Dữ Liệu

### A. API Đã có trong `docs/api-spec.md`
1. **`GET /auth/me`**: Lấy thông tin user hiện tại (`UserProfile` gồm `id`, `roleName`, `email`, `firstName`, `middleName`, `lastName`). Sử dụng trong Auth Guard và lời chào Welcome Banner.

---

### B. API Đề xuất Mới (Cần cho Dashboard & Đã được Mock)

| STT | Phương thức & Endpoint | Mục đích | Cách Mock dữ liệu trong `dashboard.service.ts` |
|---|---|---|---|
| 1 | `GET /dashboard/analytics` | Lấy 4 chỉ số Bento: Chuỗi học tập, Thời lượng học tuần, Node kiến thức đã mở, Bài tập sắp đến hạn. | `streakDays: 5`, `studyHoursThisWeek: 24.5`, `knowledgeNodesUnlocked: 150`, `knowledgeNodesTotal: 220`, `approachingDeadlinesCount: 2` |
| 2 | `GET /dashboard/competency` | Bản đồ nhiệt (Heatmap 12 tuần x 7 ngày) và 5 trụ cột năng lực (PLO Framework). | Mảng 84 ô heatmap mức 0-4 (empty, weak, medium, good, master) và 5 chỉ số PLO (Cấu trúc dữ liệu nâng cao 88%, Thuật toán Đồ thị 76%, Quy hoạch động 42%, Toán rời rạc 85%, Độ phức tạp I/O 91%) |
| 3 | `GET /dashboard/ai-insight` | Khuyến nghị AI và đề xuất bài test thích ứng chẩn đoán lỗ hổng kiến thức. | Phát hiện hổng Quy hoạch động (Knapsack & Bitmask), bài test 5 phút, 4 câu hỏi, +120 XP, phục hồi 15% PLO Đồ thị |
| 4 | `GET /me/courses` | Danh sách tiến trình các khóa học đang theo học. | 3 khóa học: ICPC Track (84%), CS-301 Thiết kế thuật toán (65%), Lập trình C++ Tối ưu (100% hoàn thành) |
| 5 | `GET /notifications` | Danh sách thông báo chia theo 4 tab (Tất cả, Chưa đọc, Khóa học & Quiz, Hệ thống AI). | 5 thông báo mẫu với trạng thái đã đọc/chưa đọc, icon, màu sắc và link hành động |
| 6 | `PATCH /notifications/:id/read` | Đánh dấu 1 thông báo là đã đọc. | Optimistic mutation cập nhật `isRead: true` trong React Query cache |
| 7 | `POST /notifications/read-all` | Đánh dấu tất cả thông báo là đã đọc. | Optimistic mutation đặt tất cả `isRead: true` và unreadCount = 0 |
| 8 | `POST /ai/coach/chat` | Tương tác trò chuyện với Socratic AI Coach. | Nhận prompt, xử lý logic từ khóa (xoay AVL, quiz, v.v.), trả về câu trả lời định dạng Markdown có khối code C++ sau delay 600ms |

---

## 2. Danh sách Biến Môi Trường (Environment Variables)

- Không phát sinh biến môi trường bí mật mới.
- Ứng dụng tiếp tục sử dụng biến chuẩn duy nhất:
  - `NEXT_PUBLIC_API_URL`: URL gốc của backend API (ví dụ: `http://localhost:8080/api/v1`).
  - Khi backend chính thức hoàn thiện các API trên, service layer sẽ tự động chuyển từ Mock Fallback sang Real Backend mà không cần sửa giao diện.

---

## 3. Các Tính Năng Đã Xác Minh Trực Quan (Browser Subagent)
1. **Chế độ Phân tích (Analytics Mode)**:
   - Sidebar 260px đầy đủ logo, các mục điều hướng, và widget Cloud Lab storage (78%).
   - Header hiển thị breadcrumb, search `Ctrl + K`, nút Chế độ Tập trung, nút Chuông thông báo có badge số lượng `3` và Avatar người dùng.
   - 4 Bento Stat Cards hiển thị sắc nét với hiệu ứng đổ bóng.
   - Bản đồ nhiệt 12 tuần và 5 trụ cột năng lực PLO.
   - Thẻ AI Insights với đề xuất bài test thích ứng.
   - Bảng tiến trình khóa học hỗ trợ lọc và tìm kiếm trực tiếp.
2. **Flyout Thông báo (Notification Dropdown)**:
   - Click nút chuông mở dropdown 420px nổi bật.
   - Hỗ trợ chuyển qua lại giữa 4 tabs: *Tất cả (8), Chưa đọc (3), Khóa học & Quiz, Hệ thống AI*.
   - Nút "Đã đọc tất cả" đánh dấu tất cả thông báo thành đã đọc và xóa badge số lượng.
3. **Chế độ Tập trung (Focus Mode / Zen Learning)**:
   - Chuyển đổi mượt mà qua `localStorage.getItem('ilms_layout_mode')`.
   - Sidebar thu gọn về 80px với các icon tinh gọn.
   - Header có nút "Thoát chế độ tập trung" để quay lại Analytics Mode.
   - Banner ngày và chỉ số Độ yên tĩnh: 100%.
   - Thẻ bài học trọng tâm Hero Card (Cây nhị phân tìm kiếm BST-MOD-03) có nút tương tác "Lưu lại bài" (Bookmark toggle).
   - Checklist nhiệm vụ AI hôm nay với checkbox đánh dấu hoàn thành và link CodeLab IDE.
4. **Socratic AI Coach**:
   - **Thanh kéo Resize ngang (Resizer handle)** ở cạnh trái: Kéo chuột để mở rộng cột AI mượt mà, **giới hạn tối đa 40% (2/5) chiều ngang màn hình** theo đúng yêu cầu.
   - **Markdown Renderer**: Hiển thị code C++, danh sách, chữ in đậm, blockquote trích dẫn chuẩn đẹp.
   - Nút thu gọn thành **FAB góc phải dưới**, click FAB để mở lại ngay lập tức.
   - Nút phóng to **Toàn màn hình** và menu tùy chọn 3 chấm.
   - Các chip gợi ý tư duy nhanh điền prompt tự động.
