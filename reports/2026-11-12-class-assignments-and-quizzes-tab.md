# Triển khai Tab Bài tập & Quiz (Course Hub CS-202) và Giải quyết Xung đột Git

- **Ngày:** 12/11/2026
- **Phân hệ:** Quản lý Bài tập & Đề kiểm tra (`src/features/assignments/`) & Chi tiết lớp học (`/classes/[classId]`)
- **Tài liệu tham chiếu:** `docs/api-spec.md` (Mục 10, 11, 14) và bản thiết kế Stitch UI screen `1a3a530c33034689837fb36a9b090f96`.

---

```text
STATUS: COMPLETE
SUMMARY: Tái cấu trúc toàn diện giao diện HTML raw của Tab "Bài tập & Quiz" (Course Hub CS-202) sang phân hệ Feature-Driven chuẩn dự án, kết nối API Spring Boot kèm Resilient Mock Fallback, chuẩn hóa 100% Semantic Design Tokens, Dark/Light mode và đa ngôn ngữ đối xứng i18n; đồng thời giải quyết toàn bộ xung đột merge conflict trong DashboardHeader.tsx và TASKS.md.
FILES:
  Created:
    - src/features/assignments/schemas/assignment.schema.ts
    - src/features/assignments/constants.ts
    - src/features/assignments/types.ts
    - src/features/assignments/services/assignment.service.ts
    - src/features/assignments/hooks/useAssignments.ts
    - src/features/assignments/hooks/useGradeProgress.ts
    - src/features/assignments/hooks/useAiRecommendation.ts
    - src/features/assignments/hooks/useStudentPerformance.ts
    - src/features/assignments/hooks/useClassHubInfo.ts
    - src/features/assignments/components/ClassHubHeader.tsx
    - src/features/assignments/components/AssignmentFilterToolbar.tsx
    - src/features/assignments/components/AssignmentActiveCluster.tsx
    - src/features/assignments/components/AssignmentCompletedCluster.tsx
    - src/features/assignments/components/AssignmentUpcomingCluster.tsx
    - src/features/assignments/components/GradeWeightsPanel.tsx
    - src/features/assignments/components/SocraticAiMentorPanel.tsx
    - src/features/assignments/components/PersonalPerformancePanel.tsx
    - src/features/assignments/components/AssignmentsTabView.tsx
    - src/features/assignments/index.ts
    - src/app/classes/[classId]/page.tsx
    - reports/2026-11-12-class-assignments-and-quizzes-tab.md
  Modified:
    - src/features/dashboard/components/DashboardHeader.tsx (resolved conflicts, kept new components: RoleSwitcher, ThemeToggle, LanguageSwitcher)
    - src/messages/vi.json (added classHub and assignments namespaces)
    - src/messages/en.json (added symmetrical classHub and assignments namespaces)
    - TASKS.md (resolved conflicts and logged completed task)
CHECKS:
  - typecheck: ✔ passed (0 errors via `tsc -p ./ILMS-FE/tsconfig.json --noEmit`)
  - build: ✔ passed (`next build` compiled 22 static/dynamic routes successfully in 34.0s)
ASSUMPTIONS:
  - Khi chưa có backend hoặc API trả về rỗng, hệ thống tự động sử dụng Resilient Mock Data để hiển thị đầy đủ thông tin chuẩn xác theo thiết kế mockup.
RISKS / LIMITATIONS:
  - Tính năng làm bài thi trắc nghiệm trực tuyến (Online Exam Interface) và modal chấm bài chi tiết của Giảng viên sẽ được tiếp tục triển khai trong sprint tới.
DOCS:
  - Cập nhật TASKS.md và biên soạn báo cáo chi tiết tại `reports/2026-11-12-class-assignments-and-quizzes-tab.md`.
DEPLOYMENT: not applicable
NEXT: Xây dựng modal nộp bài tập (Upload/GitHub link) và màn hình làm bài Quiz trắc nghiệm tương tác thời gian thực.
```

---

## Chi tiết giải quyết xung đột (Merge Conflict Resolution)

1. **`src/features/dashboard/components/DashboardHeader.tsx`**:
   - Giữ nguyên và tích hợp đầy đủ các component mới: `RoleSwitcher`, `ThemeToggle`, `LanguageSwitcher` cùng với `NotificationDropdown` và `UserMenuDropdown`.
   - Đảm bảo hiển thị hoàn chỉnh ở cả 2 chế độ: Focus Mode (56px) và Analytics Mode (64px).

2. **`TASKS.md`**:
   - Giữ lại cả 2 báo cáo ngày 05/11/2026 (EduPulse LMS sessions/attendance) và ngày 09/11/2026 (Class Management gap analysis).
   - Ghi nhận hạng mục hoàn thành ngày 12/11/2026 cho Tab Bài tập & Quiz.

