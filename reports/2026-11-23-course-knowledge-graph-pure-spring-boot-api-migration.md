# Báo cáo: Chuyển đổi Thao tác Đồ thị Môn học sang REST API Spring Boot Thuần

- **Ngày:** 2026-11-23
- **Mục tiêu:** Thay thế hoàn toàn quy trình bóc tách bản nháp AI cổ điển (`/materials/ingestion/{jobId}/drafts`) bằng các API chuyên biệt ở cấp độ Khóa học (`/api/v1/knowledge-graphs/courses/{courseId}/*`) chạy trực tiếp trên Spring Boot thuần, tối ưu hóa tốc độ và thao tác CRUD in-place trên Canvas.

---

## 1. Các thay đổi chính

### 1.1. Data Layer & Zod Schemas (`knowledge-graph.schema.ts`)
- Thêm `createKnowledgeNodeRequestSchema` & type `CreateKnowledgeNodeRequestDTO` (`label`, `description`, `level`, `category`, `prerequisites`, `linkedLessonIds`).
- Thêm `updateKnowledgeNodeRequestSchema` & type `UpdateKnowledgeNodeRequestDTO`.
- Thêm `manageKnowledgeEdgeRequestSchema` & type `ManageKnowledgeEdgeRequestDTO` (`sourceNodeId`, `targetNodeId`, `relationType`, `weight`).
- Chuẩn hóa `importKnowledgeGraphRequestSchema` & `importKnowledgeGraphResponseSchema` cho endpoint lưu phẳng đồ thị.

### 1.2. Service Layer (`knowledge-graph.service.ts`)
- `createCourseKnowledgeNode(courseId, payload)`: `POST /api/v1/knowledge-graphs/courses/{courseId}/nodes`
- `updateCourseKnowledgeNode(courseId, nodeId, payload)`: `PUT /api/v1/knowledge-graphs/courses/{courseId}/nodes/{nodeId}`
- `deleteCourseKnowledgeNode(courseId, nodeId)`: `DELETE /api/v1/knowledge-graphs/courses/{courseId}/nodes/{nodeId}`
- `createCourseKnowledgeEdge(courseId, payload)`: `POST /api/v1/knowledge-graphs/courses/{courseId}/edges`
- `deleteCourseKnowledgeEdge(courseId, payload)`: `DELETE /api/v1/knowledge-graphs/courses/{courseId}/edges` (với `{ data: payload }`)
- `importKnowledgeGraphFromJson(courseId, payload)`: `POST /api/v1/knowledge-graphs/courses/{courseId}/import-json`

### 1.3. TanStack Query Hooks (`useKnowledgeGraphQueries.ts`)
- Thêm các mutation hooks:
  - `useCreateCourseKnowledgeNodeMutation()`
  - `useUpdateCourseKnowledgeNodeMutation()`
  - `useDeleteCourseKnowledgeNodeMutation()`
  - `useCreateCourseKnowledgeEdgeMutation()`
  - `useDeleteCourseKnowledgeEdgeMutation()`
  - `useImportKnowledgeGraphMutation()`
- Tự động invalidate đồng bộ `knowledgeGraphKeys.course(courseId)`, `knowledgeGraphKeys.all`, và cache liên quan.

### 1.4. UI Layer (`KnowledgeGraphPageView.tsx` & `KnowledgeAnalyticsView.tsx`)
- Loại bỏ hoàn toàn `useStartMaterialGraphDraftMutation` và việc chuyển hướng trang sang `/materials/tasks?jobId=...`.
- Tích hợp `handleSaveCourseGraph` để xuất toàn bộ canvas phẳng (nodes + edges) và gọi `POST /api/v1/knowledge-graphs/courses/{courseId}/import-json`.
- Tích hợp CRUD in-place trực tiếp trên Canvas đồ thị:
  - Thêm thực thể: gọi `createCourseKnowledgeNode`.
  - Cập nhật thông tin thực thể: gọi `updateCourseKnowledgeNode`.
  - Xóa thực thể: gọi `deleteCourseKnowledgeNode`.
  - Nối 2 thực thể: gọi `createCourseKnowledgeEdge`.
  - Xóa dây liên kết: gọi `deleteCourseKnowledgeEdge`.
- Cập nhật giao diện `KnowledgeAnalyticsView`: Nút "Lưu đồ thị khóa học" nổi bật, thanh công cụ biên tập in-place trực tiếp trên canvas.

---

## 2. Kết quả kiểm thử & xác thực
- **TypeScript strict (`npx tsc --noEmit`):** Pass 100%, 0 lỗi.
- **Next.js Production Build (`npm run build`):** Pass 100%, tất cả 42/42 trang biên dịch thành công.
