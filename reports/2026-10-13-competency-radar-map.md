# Xây dựng trang Bản đồ Năng lực & Cây Kỹ năng (/competency)

- **Ngày thực hiện:** 2026-10-13
- **Mục tiêu:** Xây dựng tính năng Bản đồ Năng lực (Competency Radar & Skill Tree Map) chuẩn Feature-Driven Architecture, hỗ trợ 2 chế độ hiển thị (Analytics Mode và Zen Focus Mode), tích hợp con AI chat nhỏ Gia sư Socratic AI Coach ở cả 2 chế độ, đầy đủ 3 sub-views (Cá nhân, Cây kỹ năng DAG, Bản đồ nhiệt toàn lớp) và bảo vệ bằng Auth Guard.

---

## 1. Kết quả triển khai

### A. Chế độ Phân tích (Analytics Mode)
- Tái sử dụng trọn vẹn layout có sẵn của Dashboard (`DashboardSidebar` + `DashboardHeader`) mà không phụ thuộc vào layout thô trong HTML mẫu.
- **Header & Benchmark Dock:**
  - Bộ chọn khóa học: CS-301, CP-402, SE-208.
  - Nút Đồng bộ Socratic AI (kèm animation xoay vòng và thông báo trạng thái đồng bộ).
  - Nút Chế độ Tập trung (chuyển sang Focus Mode) & Nút Xuất PDF.
  - Các checkbox so sánh chuẩn: TB Lớp (71.5%), Chuẩn đầu ra PLO (80.0%), Mục tiêu cá nhân (90.0%).
- **3 Sub-views (Segmented Controls):**
  1. **Chế độ xem Cá nhân (Student Profile Tab):**
     - Biểu đồ Radar SVG tương tác 6 chiều (Thuật toán, CTDL Nâng cao, Độ phức tạp, C++ Code, Quy hoạch động, Đồ thị), highlight cảnh báo Warm Amber tại điểm trũng Quy hoạch động (58%).
     - Thẻ Cấp độ thông thạo: 4 mức năng lực (Xuất sắc, Thành thạo, Đang tiến bộ, Cần củng cố - dùng tone màu Warm Amber, loại bỏ màu đỏ gay gắt) và Mini Trendline SVG qua 12 tuần (+27.5%).
     - Thẻ Socratic AI Engine (Next Best Actions): Củng cố Quy hoạch động (Bitmask tỷ lệ sai 42%) với 3 nhiệm vụ vi mô.
     - Ribbon 4 chỉ số nhanh: 38/45 kỹ năng, 142 bài ICPC Accepted, 3 Lỗ hổng, Top 8% Khoa CNTT.
  2. **Cây Kỹ năng Môn học (Skill Tree Tab):**
     - Hệ thống Directed Acyclic Graph (DAG) 4 Stage (Nền tảng, Trung cấp, Nâng cao, Chuyên gia/Locked) với các đường kết nối SVG connector mượt mà.
     - Drill-Down Detail Inspector Panel bên phải hiển thị chi tiết node được chọn, điều kiện tiên quyết (Prerequisites), mở khóa kỹ năng tiếp theo, nút luyện quiz và nút hỏi AI.
  3. **Bản đồ nhiệt Toàn lớp (Class Heatmap Tab):**
     - Bảng ma trận 42 sinh viên x 6 kỹ năng cột, highlight tài khoản hiện tại (Trần Nhật Minh • You), thang màu trực quan (<60%, 75%, 90%), hàng tổng kết Trung bình cả lớp.

### B. Chế độ Tập trung (Zen Focus Mode)
- Giao diện Zen tối giản toàn màn hình với nền ambient glow và grid lines.
- **Minimal Zen Header:**
  - Tag trạng thái `BẢN ĐỒ NĂNG LỰC • FOCUS MODE`.
  - Dropdown hàng đợi 4 nhiệm vụ hôm nay (Queue: 1. Quy hoạch động 45%, 2. Cây nhị phân BST 60%, 3. Dijkstra 55%, 4. Quick Sort 85%).
  - Chuỗi 5 ngày 🔥, +120 XP hôm nay.
  - Nút **Thoát chế độ tập trung** (icon close + <kbd>ESC</kbd>): Chuyển người dùng quay trở lại Chế độ phân tích mượt mà.
- **Hero Linear Quest Card:**
  - Tập trung giải quyết điểm trũng then chốt nhất (Quy hoạch động 45% -> 60%).
  - Vạch beam-progress phát sáng sinh động.
  - 2 bước hành động ngay:
    - *Bước 1 (3 phút):* Ôn tập lý thuyết cốt lõi -> Mở Modal Flashcard Knapsack 0/1 (Định nghĩa trạng thái dp[i][w] và công thức truy hồi).
    - *Bước 2 (5 phút):* Làm bài tập chẩn đoán (3 câu) -> Mở Modal Quiz trắc nghiệm.
- **Tương tác Modal & Quiz Chẩn đoán:**
  - Trả lời đúng Option B: Thông báo thành công, mở khóa nút "Hoàn tất & Nâng vạch năng lực (+15%)".
  - Khi hoàn tất: Thanh năng lực tự động animate tăng từ 45% lên 60%, toast thông báo chúc mừng xuất hiện, và AI gửi lời khen ngợi.
  - Trả lời sai: Tự động kích hoạt con AI chat nhỏ để Socratic AI giải thích ngay tại điểm nghẽn.

### C. Con AI Chat nhỏ (Gia sư Socratic AI Coach)
- Sử dụng trực tiếp chính component [`SocraticAICoach`](file:///d:/ILMS-FE/src/features/dashboard/components/FocusView/SocraticAICoach.tsx) từ Dashboard ở **cả 2 chế độ** (Analytics & Focus Mode).
- **Trạng thái Thu nhỏ (Minimized):** Render Floating Action Button (FAB) kéo thả tự do khắp màn hình (`draggable`), có viên thuốc badge *"Socratic AI Coach • drag_indicator"* và quả cầu tròn xanh với icon `smart_toy`. Vị trí lưu đồng bộ vào `localStorage`.
- **Trạng thái Mở rộng (Expanded):** Hộp chat Socratic AI Coach hoàn chỉnh với avatar psychology, badge PRO, trạng thái Online, nút thu nhỏ `dock_to_right`, nút toàn màn hình `open_in_full`, menu 3 chấm, quick thinking prompts ("Explain AVL left rotation", "Review yesterday's Quiz questions"...), Markdown renderer và thanh kéo co giãn chiều rộng.
- Hỗ trợ prop `floatingDock={true}` để dock nổi ở góc dưới phải mà không phá vỡ cấu trúc grid của các trang.

### D. Bảo vệ xác thực (Auth Guard)
- Route `/competency` được bảo vệ bằng hook `useCurrentUser()`.
- Chưa đăng nhập -> Chuyển hướng tự động về `/login`.

---

## 2. Kiểm thử và Xác thực (Verification)
- `npx tsc --noEmit`: 0 lỗi biên dịch.
- Browser subagent tự động kiểm thử toàn bộ luồng:
  - Mở `/competency` chế độ phân tích, chuyển đổi mượt mà 3 tabs (Cá nhân, Cây kỹ năng, Bản đồ nhiệt).
  - Mở chế độ tập trung `/competency?mode=focus`.
  - Mở modal Flashcard lý thuyết -> Chuyển sang Quiz -> Chọn đáp án đúng B -> Vạch năng lực tăng lên 60% và có toast.
  - Bấm Thoát chế độ tập trung -> Đưa về chế độ phân tích thành công.
  - Mở / thu nhỏ con AI chat nhỏ ở cả 2 chế độ.

---

## 3. Trạng thái
- **STATUS:** COMPLETE
- **FILES CREATED / MODIFIED:**
  - `src/features/competency/types.ts`
  - `src/features/competency/competency.schema.ts`
  - `src/features/competency/services/competency.service.ts`
  - `src/features/competency/hooks/useCompetencyData.ts`
  - `src/features/competency/hooks/useCompetencyMode.ts`
  - `src/features/competency/components/common/CompetencyAICoach.tsx`
  - `src/features/competency/components/analytics/CompetencyHeaderDock.tsx`
  - `src/features/competency/components/analytics/CompetencyRadarCard.tsx`
  - `src/features/competency/components/analytics/MasteryProgressCard.tsx`
  - `src/features/competency/components/analytics/SocraticActionCard.tsx`
  - `src/features/competency/components/analytics/StudentProfileTab.tsx`
  - `src/features/competency/components/analytics/SkillTreeCanvas.tsx`
  - `src/features/competency/components/analytics/SkillInspectorPanel.tsx`
  - `src/features/competency/components/analytics/SkillTreeTab.tsx`
  - `src/features/competency/components/analytics/ClassHeatmapTab.tsx`
  - `src/features/competency/components/analytics/CompetencyAnalyticsView.tsx`
  - `src/features/competency/components/focus/FocusZenHeader.tsx`
  - `src/features/competency/components/focus/FocusHeroQuestCard.tsx`
  - `src/features/competency/components/focus/FocusTheoryModal.tsx`
  - `src/features/competency/components/focus/FocusQuizModal.tsx`
  - `src/features/competency/components/focus/CompetencyFocusView.tsx`
  - `src/features/competency/components/CompetencyPageView.tsx`
  - `src/features/competency/index.ts`
  - `src/app/competency/page.tsx`
  - `src/features/dashboard/components/DashboardSidebar.tsx`
  - `src/features/dashboard/components/DashboardHeader.tsx`
  - `src/messages/vi.json`
  - `src/messages/en.json`
  - `TASKS.md`
