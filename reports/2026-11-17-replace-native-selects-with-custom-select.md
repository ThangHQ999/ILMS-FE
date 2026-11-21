# Thay thế toàn bộ `<select>` mặc định bằng `CustomSelect`

- **Ngày:** 2026-11-17
- **Tóm tắt kế hoạch:** Nâng cấp `src/components/shared/CustomSelect.tsx` (hỗ trợ `variant="pill"`, `min-w-full w-max` cho menu popup và thuộc tính a11y `listbox`/`option`) rồi thay thế toàn bộ `<select>` mặc định của trình duyệt trên tất cả 21 file trong `src/features/`.

```text
STATUS: COMPLETE
SUMMARY: Loại bỏ hoàn toàn thẻ <select> mặc định của trình duyệt trên toàn bộ 21 file thuộc 9 phân hệ (classes, assignments, courses, knowledge-graph, lesson-sessions, materials, competency, timetable, dashboard, error-pages) và thay bằng CustomSelect đồng bộ Light/Dark mode.
FILES:
  modified:
    - src/components/shared/CustomSelect.tsx
    - src/features/classes/components/ClassFilterToolbar.tsx
    - src/features/classes/components/MobileFilterBottomSheet.tsx
    - src/features/classes/components/CreateClassModal.tsx
    - src/features/classes/components/detail/ClassMembersTab.tsx
    - src/features/classes/components/detail/ClassSubjectsTab.tsx
    - src/features/classes/components/detail/CreateSubjectModal.tsx
    - src/features/classes/components/detail/ClassMaterialsTab.tsx
    - src/features/classes/components/detail/ClassGradebookTab.tsx
    - src/features/classes/components/detail/ClassSettingsTab.tsx
    - src/features/classes/components/detail/modules/ClassModuleModals.tsx
    - src/features/assignments/components/AssignmentFilterToolbar.tsx
    - src/features/assignments/components/ClassCourseMatrixView.tsx
    - src/features/competency/components/analytics/CompetencyHeaderDock.tsx
    - src/features/courses/components/detail/CourseSyllabusTab.tsx
    - src/features/courses/components/detail/CurriculumAuthoringModal.tsx
    - src/features/dashboard/components/TeacherOverview/TeacherCreateAnnouncementModal.tsx
    - src/features/error-pages/components/ForbiddenView.tsx
    - src/features/knowledge-graph/components/analytics/KnowledgeAnalyticsView.tsx
    - src/features/knowledge-graph/components/analytics/NodeInspectorPanel.tsx
    - src/features/knowledge-graph/components/analytics/ShortestPathModal.tsx
    - src/features/lesson-sessions/components/CreateSessionModal.tsx
    - src/features/lesson-sessions/components/LessonSessionTable.tsx
    - src/features/materials/DraftGraphEditor.tsx
    - src/features/materials/MaterialsWorkspace.tsx
    - src/features/timetable/components/TimetableSwapRoomModal.tsx
    - TASKS.md
CHECKS: lint not configured · grep `<select` (0 matches in src/) ✔ · typecheck ✔ (npx tsc --noEmit) · build ✔ (npm run build, 33/33 pages)
ASSUMPTIONS: Các dropdown lọc và form đều dùng controlled value/onChange với CustomSelect.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm tra trực quan từng popup dropdown trên trình duyệt ở các vị trí sát mép phải màn hình.
  - Next.js 16.4.3 hiển thị cảnh báo lỗ hổng bảo mật cần nâng cấp (đang chờ dọn dung lượng ổ C:/D:).
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Mở /classes và các tab bên trong /classes/[id] trên trình duyệt để trải nghiệm dropdown CustomSelect mới ở cả Light và Dark mode.
```

## Review

- **Không còn `<select>` mặc định:** Kiểm tra `Select-String -Pattern "<select"` trên toàn bộ `src/` trả về 0 kết quả.
- **Tái sử dụng chuẩn Feature-Driven:** Mọi phân hệ đều import `CustomSelect` từ `@/components/shared`, không tự viết lại dropdown riêng lẻ.
- **TypeScript & Build:** `npx tsc --noEmit` và `npm run build` đều đạt 0 lỗi (33/33 route).
