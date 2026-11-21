# Tách Biệt Lưu Trữ & Hiển Thị Đồ Thị Tri Thức và Tinh Chỉnh Giao Diện

- **Ngày thực hiện:** 2026-11-20
- **Phạm vi:** `src/features/knowledge-graph/`
- **Mục tiêu:**
  1. Hiển thị chính xác tên thực thể tri thức (lấy từ tài liệu `Thuật toán Sắp xếp nổi bọt`), thay thế nhãn generic "Khái niệm tri thức" và các chuỗi UUID kỹ thuật.
  2. Tách biệt tầng Lưu trữ (Storage trên Neo4j) và tầng Hiển thị (View trên FE): Gom toàn bộ các node vệ tinh (Định nghĩa, Bước quy trình, Bài tập, Ví dụ, Luận cứ, Đoạn trích) vào trong Thực thể tri thức tương ứng. Mặc định 2D canvas và Ma trận chỉ vẽ Chủ đề + Khái niệm tri thức và liên kết học tập.
  3. Bổ sung nút toggle "Hiện chi tiết phụ trợ" (tắt mặc định) cho phép bung rộng dữ liệu Neo4j khi cần soi chi tiết.
  4. Sửa triệt để lỗi logic Tiền đề và Kế tiếp trong Inspector Panel: Không để Đoạn trích, Bước quy trình thành tiền đề/kế tiếp của Khái niệm tri thức.
  5. Nạp toàn bộ dữ liệu Định nghĩa, Quy trình (thứ tự 1, 2, 3...), Bài tập, Ví dụ, Đoạn trích vào 4 tab của Inspector Panel.
  6. Sửa cột "Độ phức tạp" trong Bảng ma trận: loại bỏ raw enum `PROCESS_STEP` và gán nhãn tiếng Việt rõ ràng.
  7. Ẩn các mã định danh kỹ thuật (`INGESTION_...`, `Neo4j`) khỏi giao diện người học, chuẩn hóa ngôn từ thân thiện.
  8. Sửa nút "Làm mờ thông minh" trên Filter Bar không bị co cụm thành hình tròn 4 dòng chữ.

---

## 1. Tóm tắt thay đổi

### File sửa đổi:
- `src/features/knowledge-graph/types.ts`: Bổ sung các trường `isAuxiliary`, `definitionText`, `processes`, `exercises`, `examples`, `arguments`, `chunks` vào `KnowledgeNodeData` và `KnowledgeEdgeData`.
- `src/features/knowledge-graph/services/knowledge-graph.service.ts`:
  - `cleanDocTitle`: loại bỏ phần mở rộng file (`.docx`, `.pdf`, `.pptx`, `.txt`, `.md`).
  - `extractNodeDisplayLabel`: ưu tiên lấy tên khái niệm thật hoặc fallback sang tên tài liệu đã làm sạch.
  - `mapRawGraphToCanvasData`: unpack nested `properties` từ Neo4j; gom các node vệ tinh thành các mảng chi tiết và gắn vào thực thể cốt lõi; đánh dấu `isAuxiliary` cho node/edge vệ tinh; lọc sạch `prerequisites` và `successors` của thực thể cốt lõi để chỉ nối giữa các khái niệm với nhau.
- `src/features/knowledge-graph/hooks/useGraphData.ts`:
  - Bổ sung state `showAuxiliaryNodes` (mặc định `false`) và `auxiliaryCount`.
  - Tính toán `displayNodesData` và `displayEdgesData` lọc bỏ các node phụ trợ khi ở chế độ mặc định.
  - Căn chỉnh toạ độ canvas linh hoạt theo số lượng node hiển thị.
- `src/features/knowledge-graph/components/analytics/GraphFilterBar.tsx`:
  - Thêm nút chuyển đổi "Hiện chi tiết phụ trợ (N)" / "Ẩn chi tiết phụ trợ (N)".
  - Sửa class của nút "Làm mờ thông minh" với `whitespace-nowrap shrink-0` để không bị co rúm thành hình tròn 4 dòng chữ.
- `src/features/knowledge-graph/components/analytics/KnowledgeAnalyticsView.tsx`:
  - Kết nối `showAuxiliaryNodes`, `onToggleAuxiliaryNodes`, `auxiliaryCount` từ `useGraphData`.
  - Cập nhật phụ đề: `{nodesData.length} khái niệm tri thức · {edgesData.length} liên kết học tập (đã gom gọn N chi tiết phụ trợ)`.
  - Thay đổi nhãn "Tài liệu Neo4j" -> "Tài liệu", "Sửa bản nháp Neo4j" -> "Chỉnh sửa bản nháp".
- `src/features/knowledge-graph/components/analytics/KnowledgeMatrixTable.tsx`:
  - Cập nhật `getComplexityDisplay`: chuẩn hóa nhãn tiếng Việt (`Cơ bản`, `Bước quy trình`, `Quy trình`, `Bài tập`, `Định nghĩa`, `Đoạn trích`), xóa bỏ hoàn toàn enum `PROCESS_STEP` chưa dịch.
  - Cập nhật `getCategoryName` tiếng Việt chuẩn xác.
- `src/features/knowledge-graph/components/analytics/NodeInspectorPanel.tsx`:
  - Header: Ẩn mã `INGESTION_...` với học viên; đổi badge thành "Khái niệm cốt lõi".
  - Nạp đầy đủ 4 tab (Tổng quan, Quy trình, Bài tập, Ví dụ) từ dữ liệu đã gom trong node khi `conceptDetail` rỗng.
  - Sắp xếp các bước quy trình 1, 2, 3... tăng dần.
  - Hiển thị danh sách đoạn trích tài liệu gốc trong tab Tổng quan.
  - Lọc sạch `prereqs` và `successors` để không bao giờ chứa các node vệ tinh.
  - Dọn dẹp câu chữ: "Lịch sử phiên bản", "Chỉnh sửa bản nháp".

---

## 2. Kết quả kiểm thử
- `npx tsc --noEmit`: Đạt 0 lỗi.
- `npm run build`: Biên dịch production thành công toàn bộ 35/35 routes với Turbopack (exit code 0).
