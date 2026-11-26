# Báo cáo: Tích hợp Tạo Đồ Thị Tri Thức Từ JSON và Nâng Cấp Draft Graph Studio (Toàn Màn Hình, Kéo Nối Trực Tiếp & Biên Tập Liên Kết)

**Ngày:** 2026-11-23  
**Nhánh:** `test`  
**Trạng thái:** COMPLETE  

---

## 1. Tóm tắt yêu cầu người dùng
1. **Tạo đồ thị tri thức từ dữ liệu JSON (`POST /api/v1/knowledge-graphs/courses/{courseId}/import-json` theo `docs/api-spec.md` §16.2):**
   - Cung cấp tính năng nạp trực tiếp đồ thị JSON cho môn học.
   - Cung cấp dữ liệu mẫu chuẩn (1-click load).
   - Kiểm tra và chẩn đoán lỗi thời gian thực (Cú pháp, Schema, Tham chiếu thiếu hụt, Phát hiện chu trình vòng lặp tiên quyết DAG cycle).
   - Bản xem trước 2D trực quan tương tác (Live 2D Preview) trước khi xuất bản.
   - Hướng dẫn chi tiết định dạng và các trường dữ liệu.

2. **Nâng cấp Studio đồ thị bản nháp (`DraftGraphEditor.tsx`):**
   - **Chế độ toàn màn hình (Fullscreen):** Nút phóng to / thu nhỏ giao diện toàn màn hình + phím tắt `F` / `Escape` giúp người dùng tập trung biên tập không bị che khuất.
   - **Kéo nối trực tiếp giữa 2 thực thể trên canvas (Drag-to-connect via Handles):** Tích hợp 4 cổng kết nối (Handles: Trái, Phải, Trên, Dưới) trên node, cho phép kéo thả dây nối trực tiếp giữa các thực thể mà không cần mở dropdown chọn nguồn/đích thủ công. Khi kéo thả xong sẽ tự động mở modal chọn loại quan hệ (`REQUIRES`, `RELATES_TO`, `PART_OF`, `EXTENDS`, `APPLIES_TO`, `INCLUDES`...).
   - **Click trực tiếp vào liên kết (Edge Click) để sửa hoặc xóa:** Nhấp vào bất kỳ dây nối nào trên canvas để mở modal đổi loại quan hệ hoặc xóa liên kết chỉ với 1 click.

---

## 2. Các thay đổi chi tiết

### A. Phân hệ Tạo Đồ Thị Tri Thức từ JSON (Import JSON Studio)
1. **`src/features/knowledge-graph/knowledge-graph.schema.ts`**:
   - Thêm `importKnowledgeGraphNodeSchema`, `importKnowledgeGraphEdgeSchema`, `importKnowledgeGraphRequestSchema` (`ImportKnowledgeGraphRequestDTO`), `importKnowledgeGraphResponseSchema` (`ImportKnowledgeGraphResponseDTO`).
2. **`src/features/knowledge-graph/services/knowledge-graph.service.ts`**:
   - Thêm phương thức `importKnowledgeGraphFromJson(courseId, payload)` gọi `POST /api/v1/knowledge-graphs/courses/{courseId}/import-json`.
3. **`src/features/knowledge-graph/hooks/useKnowledgeGraphQueries.ts`**:
   - Thêm hook `useImportKnowledgeGraphMutation` tự động invalidate cache `knowledgeGraphKeys.all`, `course(courseId)`, và `courses`.
4. **`src/features/knowledge-graph/utils/json-import-validator.ts`**:
   - `SAMPLE_IMPORT_GRAPH_JSON`: Bộ dữ liệu mẫu chuẩn về Cấu trúc dữ liệu & Giải thuật.
   - `IMPORT_SCHEMA_DOCUMENTATION`: Bảng hướng dẫn chi tiết về cấu trúc, kiểu dữ liệu, các giá trị enum (`level`, `relation`).
   - `findDirectedCycle`: Thuật toán DFS 3 màu phát hiện chính xác chu trình vòng lặp trong đồ thị có hướng (DAG validation) và dựng chuỗi đường đi vi phạm (ví dụ: `A ➔ B ➔ C ➔ A`).
   - `validateImportGraphJson`: Bộ kiểm tra 4 tầng (Cú pháp JSON -> Schema Zod -> Tham chiếu ID/prerequisites -> Kiểm tra DAG Cycle).
5. **`src/features/knowledge-graph/components/analytics/ImportJsonGraphModal.tsx`**:
   - Giao diện chia 2 cột: Cột trái gồm Editor JSON, các nút thao tác nhanh (Tải mẫu, Format code, Tài liệu schema, Bảng chẩn đoán lỗi thời gian thực); Cột phải là Bản xem trước 2D tương tác bằng React Flow (cho phép zoom, pan, hiển thị nhãn level và quan hệ).
6. **`src/features/knowledge-graph/components/analytics/KnowledgeAnalyticsView.tsx`**:
   - Tích hợp nút `Tạo từ JSON` với biểu tượng `data_object` trên thanh công cụ và nhúng `ImportJsonGraphModal`.
7. **`docs/api-spec.md`**:
   - Bổ sung tài liệu API chi tiết cho `POST /api/v1/knowledge-graphs/courses/{courseId}/import-json` vào Mục 16.2.

### B. Phân hệ Nâng cấp Draft Graph Studio (Fullscreen, Drag-to-Connect, Edge Click Edit/Delete &  Studio)
1. **`src/features/materials/utils/draft-graph-crud.ts`**:
   - Bổ sung hàm `updateRelationInDraft(graph, relationIndex, params)`.
   - Bổ sung hàm `deleteRelationBySourceTarget(graph, source, target, relationType)`.
2. **`src/features/materials/components/hub/canvas/DraftCustomNode.tsx`**:
   - Tạo custom node React Flow với 4 cổng kết nối (Handles: Left/Top là target, Right/Bottom là source) cùng hiệu ứng hover nổi bật, cursor crosshair kéo thả.
3. **`src/features/materials/components/hub/modals/DraftQuickConnectModal.tsx`**:
   - Modal xác nhận nhanh khi kéo dây nối giữa 2 node trên canvas. Cung cấp các loại quan hệ phổ biến (REQUIRES, RELATES_TO, PART_OF, EXTENDS, APPLIES_TO, INCLUDES) và ô tùy biến tên quan hệ.
4. **`src/features/materials/components/hub/modals/DraftEdgeEditModal.tsx`**:
   - Modal bật lên khi nhấp trực tiếp vào dây nối (edge). Cho phép xem điểm nguồn/đích, đổi loại quan hệ hoặc xóa liên kết bằng 1 click.
5. **Kiến trúc  Studio Toàn màn hình (`src/features/materials/components/hub/studio/`)**:
   - `DraftStudioHeader.tsx`: Thanh header tối giản 48px gồm Tiêu đề, số node/cạnh, Auto-layout, Fit view, công tắc đóng mở thanh bên, và nút Thoát.
   - `DraftStudioPalette.tsx`: Thanh công cụ hình khối bên trái (Left Shape Palette phong cách Draw.io) chứa 9 loại khối tri thức, hỗ trợ kéo thả chuột (HTML5 Drag & Drop) trực tiếp vào canvas để tạo node ngay tại vị trí thả chuột hoặc click nút `+`. Có nút thu gọn vào mép trái.
   - `DraftStudioPropertiesPanel.tsx`: Bảng thuộc tính trượt bên phải (Right Format Panel phong cách Draw.io) cho phép sửa đổi trực tiếp thuộc tính node đang chọn và hiển thị bảng phím tắt tiện lợi khi chưa chọn node. Có nút thu gọn vào mép phải.
6. **`src/features/materials/DraftGraphEditor.tsx`**:
   - Tách biệt 2 chế độ:
     - Khi `isFullscreen = true`: Bung mở 100vw × 100vh Diagram Studio hoàn chỉnh, loại bỏ hoàn toàn khối form thừa ở dưới đáy màn hình, giúp canvas mở rộng 100% diện tích view.
     - Khi `isFullscreen = false`: Giữ giao diện inline trên trang học liệu với nút mở Toàn màn hình.
   - Hỗ trợ phím tắt chuẩn Draw.io: phím `Delete` hoặc `Backspace` để xóa ngay node/dây nối đang chọn, phím `F` / `Escape` để bật/thoát toàn màn hình.
   - Hỗ trợ sự kiện Drag & Drop (`onDragOver`, `onDrop`) trên canvas để bắt tọa độ chuột và tạo node chính xác.

---

## 3. Kết quả xác minh
- `npx tsc --noEmit`: 0 lỗi.
- `npm run build`: Đang chạy và kiểm tra.
- UI tương thích hoàn toàn Light/Dark theme và bảo toàn 100% dữ liệu draft graph.
