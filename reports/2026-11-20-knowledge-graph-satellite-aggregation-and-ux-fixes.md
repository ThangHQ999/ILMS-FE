# Fix Knowledge Graph Satellite Node Aggregation, Clean Matrix & AI Tutor Context

Date: 2026-11-20
Summary: Gom toàn bộ các node vệ tinh (quy trình, bài tập, ví dụ, định nghĩa, đoạn trích) vào thực thể tri thức chính; loại bỏ node phụ trợ khỏi bảng ma trận; tạo giao diện chi tiết phụ trợ chuyên dụng; sửa Minimap thời gian thực; nạp đầy đủ ngữ cảnh cho popup Trợ lý AI.

STATUS: COMPLETE
SUMMARY:
- Kiến trúc Đồ thị Tri thức đã chuẩn hóa: Các nút vệ tinh (Bước quy trình #1..#11, Đoạn trích #9, Bài tập, Định nghĩa, Ví dụ) không còn bị hiển thị sai thành Thực thể tri thức độc lập. Toàn bộ nội dung của chúng đã được gom tự động theo cạnh quan hệ (Graph Edges) vào Thực thể tri thức chính (Thuật toán Sắp xếp nổi bọt).
- Thẻ xem nhanh (FloatingNodeCard) & Bảng chi tiết (NodeInspectorPanel) tại thực thể chính: Hiển thị đầy đủ số lượng bước quy trình (ví dụ: Quy trình (8)), bài tập (1), ví dụ, định nghĩa trích xuất từ tài liệu nguồn; không còn bị 0 hoặc hiện placeholder rỗng.
- Khi người dùng click vào chi tiết phụ trợ trên canvas (như Bước quy trình #5): Hiển thị "Thẻ chi tiết phụ trợ" chuyên dụng, hiển thị rõ thao tác bước giải thuật, liên kết thực thể chính kèm nút bấm `[← Mở Thực thể tri thức chính]`, không bị nhồi 4 tab hay định nghĩa giả.
- Bảng Ma trận tri thức (KnowledgeMatrixTable): Lọc sạch sẽ 100% các nút vệ tinh phụ trợ, chỉ hiển thị đúng các Thực thể tri thức trọng tâm; các chủ đề hiển thị tên danh mục học thuật chuẩn (ví dụ: Thuật toán Sắp xếp) thay vì "Chủ đề #12".
- Minimap (Vùng nhìn): Thay thế hình minh họa tĩnh cũ bằng MiniMap tương tác thực tế từ `@xyflow/react`, đồng bộ hoàn toàn với vị trí và màu sắc node trên canvas.
- Hỏi Gia sư AI (AI Tutor / Coach): Click nút sẽ mở ngay khung chat AI nhỏ nổi trên góc màn hình (`GlobalSocraticCoach`), nạp toàn bộ ngữ cảnh thực thể (tên, định nghĩa, các bước quy trình, bài tập, ví dụ, học liệu nguồn) mà không bị chuyển trang toàn màn hình.

FILES:
- Modified:
  - `src/features/knowledge-graph/types.ts`
  - `src/features/knowledge-graph/services/knowledge-graph.service.ts`
  - `src/features/knowledge-graph/components/analytics/NodeInspectorPanel.tsx`
  - `src/features/knowledge-graph/components/analytics/KnowledgeMatrixTable.tsx`
  - `src/features/knowledge-graph/components/analytics/GraphFilterBar.tsx`
  - `src/features/knowledge-graph/components/focus/FloatingNodeCard.tsx`
  - `src/features/knowledge-graph/components/focus/DraggableMinimap.tsx`
  - `src/features/knowledge-graph/hooks/useGraphData.ts`
  - `src/features/dashboard/components/FocusView/SocraticAICoach.tsx`

CHECKS:
- lint: ✔ (Next.js build checks passed)
- typecheck: ✔ (`npx tsc --noEmit` passed with 0 errors)
- tests: not run (no specific test file for knowledge graph layout)
- build: ✔ (`npm run build` compiled 35/35 routes successfully)

ASSUMPTIONS:
- Các nút vệ tinh (như PROCESS_STEP, CHUNK, EXERCISE, DEFINITION) liên kết trực tiếp với Thực thể tri thức chính qua quan hệ Neo4j; nếu đồ thị chỉ có 1 thực thể chính duy nhất thì tự động gán fallback về thực thể đó.

RISKS / LIMITATIONS:
- Cần chạy nâng cấp bảo mật Next.js khi dự án bước vào chu kỳ bảo trì phụ thuộc tiếp theo.

DOCS:
- updated `TASKS.md`

DEPLOYMENT:
- not deployed (local development build verified)

NEXT:
- Tiến hành tích hợp API thời khóa biểu cá nhân và lớp học vào các component theo kế hoạch.
