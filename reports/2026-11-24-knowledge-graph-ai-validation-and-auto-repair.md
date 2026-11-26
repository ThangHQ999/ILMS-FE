# Triển Khai Tính Năng Kiểm Tra Đồ Thị & AI Tự Động Sửa Lỗi (Graph Validation & AI Auto-Repair)

- **Ngày thực hiện:** 24/11/2026
- **Kế hoạch đã phê duyệt:** `knowledge_graph_ai_validation_repair_plan.md`
- **Tài liệu tham chiếu:** `docs/api-spec.md` (§16.1 & §16.2), `reports/2026-11-23-knowledge-graph-ai-auto-repair.md`

---

## 1. Mục tiêu & Bối cảnh
Tính năng giải quyết bài toán kiểm soát chất lượng và tính toàn vẹn sư phạm của Đồ thị Tri thức:
- Giảng viên hoặc AI khi dựng đồ thị phức tạp có thể tạo ra chu trình phụ thuộc ngược lặp vô hạn ($A \to B \to A$), cạnh trỏ tới nút không tồn tại, hoặc các nút mồ côi thiếu mô tả.
- Frontend tích hợp trực tiếp 3 endpoint chuẩn RESTful của Spring Boot:
  1. `POST /api/v1/knowledge-graphs/courses/{courseId}/validate` (Quét kiểm tra lỗi đồ thị)
  2. `POST /api/v1/knowledge-graphs/courses/{courseId}/ai-repair` (AI phân tích và tự động can thiệp sửa mã JSON)
  3. `POST /api/v1/knowledge-graphs/courses/{courseId}/apply-ai-repair` (Lưu đè và xuất bản đồ thị đã sửa)

---

## 2. Chi tiết Triển khai Kỹ thuật

### A. Tầng Dữ liệu & Zod Schemas (`src/features/knowledge-graph/knowledge-graph.schema.ts`)
- `graphValidationIssueSchema`: Định nghĩa từng vấn đề (id, code, severity: BLOCKER/WARNING/INFO, targetId, targetType: NODE/EDGE/GRAPH, message, suggestion).
- `graphValidationResponseSchema`: Trạng thái `valid`, `totalBlockers`, `totalWarnings`, và danh sách `issues`.
- `aiRepairActionSchema`: Hành động can thiệp của AI (`REMOVE_EDGE`, `REVERSE_EDGE`, `ADD_DESCRIPTION`, `LINK_ORPHAN`, `OTHER`, `targetId`, `description`).
- `graphAiRepairResponseSchema`: Tóm tắt sư phạm của AI (`summary`), bảng thay đổi (`changes`), danh sách nút & cạnh đã sửa (`repairedNodes`, `repairedEdges`), `remainingIssues`.
- `applyAiRepairRequestSchema`: Payload lưu đè kết quả AI (`repairSummary`, `repairedNodes`, `repairedEdges`).

### B. Tầng Service API (`src/features/knowledge-graph/services/knowledge-graph.service.ts`)
- `validateCourseKnowledgeGraph(courseId, snapshot)`: Gửi snapshot các nút và liên kết hiện tại trên Canvas lên backend để thuật toán DFS 3 màu quét kiểm tra.
- `aiRepairCourseKnowledgeGraph(courseId, payload)`: Gửi đồ thị kèm prompt hướng dẫn sư phạm tùy chọn cho AI xử lý.
- `applyAiRepairCourseKnowledgeGraph(courseId, payload)`: Lưu đè đồ thị đã sửa vào cơ sở dữ liệu Neo4j & xuất bản ngay.

### C. Tầng Hooks TanStack Query (`src/features/knowledge-graph/hooks/useKnowledgeGraphQueries.ts`)
- `useValidateCourseGraphMutation`: Thực thi validate với trạng thái `isPending`.
- `useAiRepairCourseGraphMutation`: Thực thi AI repair với trạng thái `isPending`.
- `useApplyAiRepairCourseGraphMutation`: Lưu bản sửa, tự động `invalidateQueries` cache đồ thị khóa học.

### D. Giao diện Modal Material Design 3 (`GraphAiRepairModal.tsx`)
- Tạo mới tại `src/features/knowledge-graph/components/analytics/GraphAiRepairModal.tsx`:
  - **Giai đoạn 1 (Validation Report):** Hiển thị banner trạng thái (xanh nếu đạt chuẩn 100%, đỏ nếu có lỗi), bộ lọc phân loại BLOCKER/CẢNH BÁO, thẻ chi tiết từng lỗi kèm nút "🔍 Định vị", ô nhập chỉ dẫn cho AI, nút "Quét lại" và nút CTA **"✨ AI Gợi ý & Sửa lỗi"**.
  - **Giai đoạn 2 (AI Thinking & Shimmer):** Hiệu ứng xoay Gradient Google Gemini và mô tả tiến trình phân tích topo.
  - **Giai đoạn 3 (Preview & Diff Comparison):** Hiển thị banner tóm tắt sư phạm của AI, bảng chi tiết từng hành động cắt cạnh/đảo chiều/thêm mô tả với badge màu trực quan, bảng so sánh số nút/cạnh và số lỗi còn lại (`0 Đạt chuẩn DAG`).
  - **Cụm nút quyết định:** "Từ chối & Giữ nguyên" (giữ nguyên trạng thái cũ để tự sửa thủ công) và "✅ Chấp nhận bản sửa (Accept)" (lưu đè DB và cập nhật canvas ngay lập tức).

### E. Tích hợp trên Canvas (`KnowledgeAnalyticsView.tsx` & `KnowledgeFocusView.tsx`)
- Nút **"🔍 Kiểm tra đồ thị"** tích hợp nổi bật trên Studio Ribbon của `KnowledgeAnalyticsView.tsx` (ngay cạnh "Tạo từ JSON") và trên thanh điều khiển Toàn màn hình của `KnowledgeFocusView.tsx`.
- Tự động truyền snapshot đồ thị hiện tại và làm mới giao diện ngay khi chấp nhận bản sửa.

### F. Tích hợp Bản nháp Chờ duyệt (`AWAITING_REVIEW` - Materials Ingestion)
- Tạo component chuyên dụng `DraftAiRepairModal.tsx` (`src/features/materials/components/hub/modals/DraftAiRepairModal.tsx`):
  - Chạy quy trình quét lỗi DFS và AI Auto-Repair trực tiếp trên bản nháp học liệu (`draftText` / `draft.graph`).
  - Gắn nút **"Kiểm tra đồ thị (AI)"** trên thanh tác vụ của `JobDetailReviewPanel.tsx`, banner cảnh báo Blocker, và thanh footer cố định khi xem xét bản nháp.
  - Tích hợp nút kiểm tra trên thanh công cụ Canvas `DraftGraphEditor.tsx`, `DraftStudioHeader.tsx`, và `DraftFocusToolbar.tsx`.
  - Giảng viên bấm **"✅ Áp dụng vào bản nháp (Accept)"**: AI tự động ngắt các cạnh lặp chu trình, bổ sung mô tả học thuật chuẩn, cập nhật state JSON và tự động kích hoạt `saveDraftMutation` để lưu đè bản nháp, sẵn sàng cho việc Duyệt & Xuất bản (Publish).

### G. Chuẩn hóa Phân loại Thực thể & Rich Node Popover
- **Bảo vệ Phân loại Thực thể Tri thức:** Thuật toán Dijkstra, các giải thuật và khái niệm cốt lõi được bảo vệ nghiêm ngặt để luôn là `KnowledgeEntity` (`category: 'algo'`), tuyệt đối không bị nhận diện nhầm thành `CHỦ ĐỀ` hay hiển thị icon thư mục `folder_special`.
- **Nâng cấp Popover Chi tiết Nút (`FloatingNodeCard.tsx`):**
  - Đồng bộ giao diện thẻ đa tầng phong phú: 4 Tab chuyên biệt (Tổng quan, Quy trình từng bước, Bài tập rèn luyện, Ví dụ minh họa).
  - Hiển thị Định nghĩa chuẩn sư phạm, Luận cứ cốt lõi, Điểm thành thạo, và các nút điều hướng tương tác (`Vào bài học`, `Hỏi Gia sư AI`).
  - Đảm bảo nút đóng `X` hoạt động chính xác và mượt mà trên toàn bộ các chế độ xem đồ thị.

---

## 3. Kết quả Kiểm thử
- **TypeScript (`npx tsc --noEmit`)**: 0 lỗi (Exit Code 0).
- **Next.js Production Build (`npm run build`)**: Thành công 100% trên toàn bộ 42 static & dynamic routes.
