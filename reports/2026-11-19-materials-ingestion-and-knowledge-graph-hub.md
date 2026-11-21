# Tích hợp End-to-End 4 Bề mặt Học liệu AI & Đồ thị Tri thức Neo4j

- **Ngày:** 2026-11-19
- **Tóm tắt kế hoạch:** Đồng bộ hóa hoàn chỉnh Frontend (4 bề mặt: Tab Tài liệu khóa học, Trung tâm Xử lý & Duyệt AI `/materials` & `/materials/tasks`, Tab Đồ thị tri thức khóa học, Studio `/knowledge-graph`) với pipeline Spring Boot + FastAPI 4-Agents + MySQL/Neo4j/ChromaDB, loại bỏ 100% dữ liệu mock.
- **Kế hoạch đã duyệt:** `C:/Users/Admin/.gemini/antigravity/brain/cc08f642-fa3d-447a-9679-f1aedbaf3722/implementation_plan.md`

---

```text
STATUS: COMPLETE
SUMMARY: Đã hoàn thiện trọn bộ 4 giai đoạn: chuẩn hóa Data Layer & API Contract (7 trạng thái AI ingestion, autoPublish=true|false, live polling, gỡ 100% mock ở materials & knowledge-graph, chốt chuẩn GET /api/v1/courses/{courseId}/knowledge-graph); nâng cấp Tab Tài liệu khóa học 3 tầng có phân quyền Teacher/Student; hợp nhất /materials và /materials/tasks thành Trung tâm Xử lý & Duyệt AI Master-Detail (Stepper 5 chặng, cảnh báo BLOCKER/parser_warnings, Thực thể & Bằng chứng, nút toggle </> Raw JSON, Upload Luồng B chọn khóa học thật); nâng cấp Tab Đồ thị khóa học 2 chế độ + Card 4 tab Neo4j nối Socratic AI và Studio /knowledge-graph có Scope Selector + Revisions/Audit + tạo Draft Neo4j.
FILES:
  created:
    - src/features/materials/schemas/ingestion.schema.ts
    - src/features/materials/services/ingestion.service.ts
    - src/features/materials/hooks/useIngestionJobs.ts
    - src/features/materials/components/hub/PipelineStepper.tsx
    - src/features/materials/components/hub/DraftEntitiesChecklist.tsx
    - src/features/materials/components/hub/DirectUploadModal.tsx
    - src/features/materials/components/hub/JobDetailReviewPanel.tsx
    - src/features/materials/components/hub/MaterialsHubPageView.tsx
    - src/features/courses/components/detail/CourseConceptInspectorCard.tsx
    - src/features/knowledge-graph/hooks/useKnowledgeGraphQueries.ts
    - reports/2026-11-19-materials-ingestion-and-knowledge-graph-hub.md
  modified:
    - src/features/courses/schemas/course.schema.ts
    - src/features/courses/services/course.service.ts
    - src/features/courses/hooks/useCourse.ts
    - src/features/courses/components/detail/CourseDetailPageView.tsx
    - src/features/courses/components/detail/CourseMaterialsTab.tsx
    - src/features/courses/components/detail/CourseKnowledgeGraphTab.tsx
    - src/features/courses/components/detail/CourseAiTutorTab.tsx
    - src/app/courses/[id]/page.tsx
    - src/features/materials/schemas/materials-tasks.schema.ts
    - src/features/materials/services/materials-tasks.service.ts
    - src/features/materials/hooks/useMaterialsTasks.ts
    - src/features/materials/index.ts
    - src/app/materials/page.tsx
    - src/app/materials/tasks/page.tsx
    - src/app/tasks/page.tsx
    - src/features/knowledge-graph/types.ts
    - src/features/knowledge-graph/knowledge-graph.schema.ts
    - src/features/knowledge-graph/services/knowledge-graph.service.ts
    - src/features/knowledge-graph/hooks/useGraphData.ts
    - src/features/knowledge-graph/components/KnowledgeGraphPageView.tsx
    - src/features/knowledge-graph/components/analytics/KnowledgeAnalyticsView.tsx
    - src/features/knowledge-graph/components/analytics/NodeInspectorPanel.tsx
    - src/features/knowledge-graph/components/analytics/GraphFilterBar.tsx
    - src/features/knowledge-graph/components/analytics/ShortestPathModal.tsx
    - src/features/knowledge-graph/components/focus/KnowledgeFocusView.tsx
    - src/features/knowledge-graph/index.ts
    - src/app/knowledge-graph/page.tsx
    - src/messages/vi.json
    - src/messages/en.json
    - TASKS.md
  deleted: none
CHECKS: lint not run (package.json chưa có script lint) · typecheck ✔ (npx tsc --noEmit: 0 lỗi) · i18n parity ✔ (vi=1950, en=1950) · tests not run (chưa có test runner) · build ✔ (npx next build --webpack: 35/35 trang thành công)
ASSUMPTIONS:
  - Backend hỗ trợ đồng thời GET /api/v1/courses/{courseId}/knowledge-graph (đã chốt dùng làm chuẩn chính) và các endpoint §16.1–§16.2 trong docs/api-spec.md.
  - Khi người dùng mở /knowledge-graph mà không có query ?courseId= hay ?materialId=, FE tự động chọn đồ thị đã xuất bản đầu tiên từ GET /api/v1/knowledge-graphs/published.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa chạy kiểm thử tương tác trình duyệt end-to-end với Backend Spring Boot + FastAPI thật đang chạy local.
  - Next.js 16.4.3 Turbopack phát sinh cảnh báo bảo mật (advisory) và lỗi PostCSS child process trên Windows khi chạy next build mặc định; cần lưu ý nâng cấp phiên bản Next.js khi có thể.
DOCS: updated TASKS.md, src/messages/vi.json, src/messages/en.json
DEPLOYMENT: not deployed
NEXT: Khởi chạy backend Spring Boot + FastAPI local và test thử 1 vòng khép kín: Upload file trong Tab Tài liệu -> Bóc tách AI -> Theo dõi & Duyệt tại /materials/tasks -> Xem kết quả ở Tab Đồ thị môn học và /knowledge-graph.
```

## Review
- Đã rà soát toàn bộ diff trên 3 phân hệ (`courses`, `materials`, `knowledge-graph`): không có cross-feature imports sai kiến trúc, không có `any` mới, không có `console.log`, không còn dữ liệu mock ở tầng dịch vụ/hooks.
- Đã phát hiện và sửa 2 lỗi ngay trong quá trình tự kiểm tra:
  1. Lỗi tham số thứ 2 của Zod `.transform` trong `conceptStepSchema` (`knowledge-graph.schema.ts`) -> đã tách `normalizeSteps`.
  2. Lớp Tailwind không tồn tại `pt-22` ở `MaterialsHubPageView.tsx` -> đã sửa thành `pt-24`.
- Đã bọc `<Suspense>` cho toàn bộ 4 page route dùng `useSearchParams()` (`/courses/[id]`, `/materials`, `/materials/tasks`, `/knowledge-graph`).

## Polish Pass (Hoàn thiện sâu Focus Mode, Neo4j Governance, Draft Sync & i18n)
- **Focus Mode (`FloatingNodeCard.tsx`, `KnowledgeFocusView.tsx`, `KnowledgeGraphPageView.tsx`)**:
  - Gỡ bỏ `alert(...)`, fallback cứng `O(log N) / O(N)` và `'seg-tree'`.
  - Hiển thị định nghĩa Neo4j thật, bước đầu tiên của quy trình, bộ đếm thật (`Quy trình / Bài tập / Ví dụ`), và điều hướng thật tới bài học liên kết (`/courses/{courseId}/lessons/{lessonId}`) & AI Tutor (`/courses/{courseId}?tab=aiTutor` hoặc `/ai-tutor`).
- **Neo4j Publication Governance (`NodeInspectorPanel.tsx`, `KnowledgeAnalyticsView.tsx`, `KnowledgeGraphPageView.tsx`)**:
  - Bổ sung thao tác **Thu hồi phiên bản đã xuất bản (`Withdraw`)** kèm xác nhận + lý do tùy chọn và **Thử xuất bản lại (`Retry Publication`)** cho Giảng viên/Admin.
- **Draft Graph Sync (`DraftGraphEditor.tsx`)**:
  - Chuyển sang `useDraftRevisionGraph` tự động retry mỗi `2.5s` trong lúc backend đồng bộ bản nháp lên Neo4j (`5s`/lần), bổ sung thẻ node phân màu theo loại (`Topic`, `KnowledgeEntity`, `Definition`, `Process`, `Exercise`, `Example`, `Argument`).
- **i18n (`vi.json`, `en.json`)**:
  - Mở rộng đối xứng 100% (`vi = 2003`, `en = 2003` khóa) cho 3 namespace `materialsHub`, `courseMaterials`, `courseKg` và nối `useTranslations` vào toàn bộ các component chính.
  - Kiểm tra sau polish: `npx tsc --noEmit` **PASS (0 lỗi)** · i18n parity **PASS (2003 = 2003)**.
