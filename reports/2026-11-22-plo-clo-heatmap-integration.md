# Tích hợp & Xây dựng Phân hệ PLO, CLO, Ma trận Ánh xạ & Bản đồ nhiệt Tri thức

- **Ngày thực hiện:** 22/11/2026
- **Kế hoạch đã phê duyệt:** [implementation_plan.md](file:///C:/Users/Admin/.gemini/antigravity/brain/cc08f642-fa3d-447a-9679-f1aedbaf3722/implementation_plan.md)

## 1. Tóm tắt công việc
Đã hoàn thành toàn diện việc xây dựng phân hệ mới `src/features/outcomes` theo chuẩn Feature-Driven Architecture, tích hợp trọn vẹn 14 API endpoints từ Mục 21 (Bản đồ nhiệt tri thức - Knowledge Mastery Heatmap) & Mục 22 (Chuẩn đầu ra PLO & CLO, Ma trận ánh xạ & Outcome Attainment) trong `docs/api-spec.md`.

## 2. Các thành phần đã triển khai
1. **Zod Validation Schemas (`src/features/outcomes/schemas/`)**:
   - `plo.schema.ts`: `bloomLevelSchema` (6 cấp độ Bloom), `ploSchema`, `ploDetailSchema`, `createPloSchema`, `updatePloSchema`, `paginatedPloSchema`.
   - `clo.schema.ts`: `cloSchema`, `cloConceptSchema`, `cloDetailSchema`, `createCloSchema`, `updateCloSchema`, `contributionLevelSchema` (`HIGH`, `MEDIUM`, `LOW`), `cloPloMatrixSchema`, `updateCloPloMatrixSchema`, `updateCloConceptsSchema`.
   - `knowledge-heatmap.schema.ts`: `masteryStatusSchema` (5 mức: `NOT_STARTED`, `WEAK`, `DEVELOPING`, `PROFICIENT`, `MASTERED`), `conceptMasteryItemSchema`, `courseKnowledgeHeatmapSchema`, `classKnowledgeHeatmapSchema` (Ma trận 2D Sinh viên x Khái niệm), `classKnowledgeGapsSchema` (Điểm nghẽn tri thức & Sinh viên nguy cơ).
   - `outcome-attainment.schema.ts`: `attainmentStatusSchema` (`NOT_ASSESSED`, `BELOW`, `APPROACHING`, `MET`, `EXCEEDED`), `classOutcomeAttainmentSchema`, `studentOutcomeAttainmentSchema`.

2. **Service Layer (`src/features/outcomes/services/outcome.service.ts`)**:
   - PLO API: `getPlos`, `getPloById`, `createPlo`, `updatePlo`, `deletePlo`, `getPloAttainmentReport`.
   - CLO API: `getClos`, `getCloById`, `createClo`, `updateClo`, `deleteClo`, `getCloPloMatrix`, `updateCloPloMatrix`, `getCloConcepts`, `updateCloConcepts`.
   - Knowledge Heatmap API: `getCourseKnowledgeHeatmap`, `getClassKnowledgeHeatmap`, `getClassKnowledgeGaps`, `getStudentKnowledgeMastery`.
   - Outcome Attainment API: `getClassOutcomeAttainment`, `getStudentOutcomeAttainment`, `getMyOutcomeAttainment`, `recalculateOutcomeAttainment`.

3. **React Query Hooks (`src/features/outcomes/hooks/useOutcomes.ts`)**:
   - Key Factory phân cấp `outcomeKeys`.
   - Các hooks `usePlos`, `useClos`, `useCloPloMatrix`, `useClassOutcomeAttainment`, `useMyOutcomeAttainment`, `useClassKnowledgeHeatmap`, `useClassKnowledgeGaps`, `useRecalculateOutcomeAttainment`, `useUpdateCloPloMatrix`, `useUpdateCloConcepts` kèm Sonner toast notifications và auto cache invalidation.

4. **UI Components & Trang màn hình**:
   - `ClassKnowledgeHeatmapMatrix.tsx`: Ma trận nhiệt 2 chiều tương tác cao với hàng khái niệm động, các ô phân cấp 5 màu chuẩn, bộ lọc ngưỡng threshold, thẻ cảnh báo khái niệm yếu (`weakConcepts`) & sinh viên có nguy cơ rớt môn (`atRiskStudents`).
   - `CloPloMatrixTable.tsx`: Bảng ma trận 2D ánh xạ CLO $\rightarrow$ PLO, click toggle mức độ đóng góp (None $\rightarrow$ HIGH $\rightarrow$ MEDIUM $\rightarrow$ LOW), batch save lưu ma trận, modal thêm nhanh CLO/PLO.
   - `CloConceptMappingDrawer.tsx`: Drawer gán các node tri thức vào CLO kèm thanh trượt điều chỉnh trọng số (0.00 - 1.00) và kiểm tra tính hợp lệ.
   - `OutcomeAttainmentDashboard.tsx`: Bảng điều khiển đánh giá chuẩn đầu ra cả lớp, hiển thị tỷ lệ đạt chuẩn, số CLO hoàn thành, nút bấm tính lại chuẩn đầu ra (`recalculate`), và modal mở ma trận ánh xạ.
   - `CourseOutcomesPageView.tsx` & Route `src/app/courses/[id]/outcomes/page.tsx`: Trang quản lý toàn diện chuẩn đầu ra của môn học.
   - Tích hợp vào `ClassGradebookTab.tsx` (viewMode `plo`), `StudentGradeReportView.tsx` (báo cáo đạt chuẩn cá nhân) và `ClassHeatmapTab.tsx` (chế độ ma trận nhiệt API thật).

## 3. Kết quả Kiểm thử
- `npx tsc --noEmit`: Đạt 0 lỗi typecheck (Exit code: 0).
