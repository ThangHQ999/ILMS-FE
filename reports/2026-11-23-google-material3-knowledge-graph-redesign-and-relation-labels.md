# Báo Cáo: Tối Giản Hóa Giao Diện Đồ Thị Tri Thức Chuẩn Google Material 3 & Tích Hợp 22 Loại Quan Hệ Tự Do

- **Ngày:** 2026-11-23
- **Mục tiêu:** Tái thiết kế toàn diện không gian Canvas đồ thị tri thức (`/knowledge-graph`) theo triết lý tối giản của Google (Gemini Material Design 3) và mở rộng hệ thống 22 loại quan hệ tri thức chuẩn (`RelationLabel`) kèm khả năng tùy biến tự do.

---

## 1. Các hạng mục cải tiến chính

### 1.1. Chuẩn hóa Node dạng Thẻ Google Tonal Card ([KnowledgeNode.tsx](file:///d:/ILMS%20project/ILMS-FE/src/features/knowledge-graph/components/nodes/KnowledgeNode.tsx))
- **Loại bỏ hiệu ứng rườm rà:** Xóa bỏ hoàn toàn các vòng sáng neon nhấp nháy (`animate-ping`, `animate-pulse`, viền nhiều lớp).
- **Thẻ bo góc mềm mại (`rounded-2xl`):** Kích thước chuẩn `w-[210px]` với bảng màu Tonal trang nhã (Google Blue `#D3E3FD`, Purple `#E8DEF8`, Green `#C4EED0`, Amber `#FCEBA4`).
- **Typography & Iconography:** Icon nằm trong khối vuông bo góc mềm mại, tên khái niệm 13px font-semibold sắc nét, phụ đề tiến độ thành thạo dạng Google Pill.
- **Handles ẩn thông minh (Smart Invisible Handles):** 4 cổng kết nối tròn 10px ẩn hoàn toàn ở trạng thái tĩnh (`opacity-0`), chỉ hiện lên nhẹ nhàng khi di chuột (`group-hover:opacity-100`) hoặc khi nối dây.

### 1.2. Nhãn cạnh (Edge Label) dạng Google Pill ([GoogleKnowledgeEdge.tsx](file:///d:/ILMS%20project/ILMS-FE/src/features/knowledge-graph/components/canvas/GoogleKnowledgeEdge.tsx))
- Tạo component cạnh `GoogleKnowledgeEdge` sử dụng `EdgeLabelRenderer` chuẩn của `@xyflow/react`.
- Nhãn hiển thị dạng viên thuốc `rounded-full` với font 11px font-medium, padding `px-3 py-1`, tự động chuyển màu hài hòa theo Light mode và Dark mode (thay thế triệt để hộp chữ nhật nền trắng viền đen thô ráp mặc định).

### 1.3. Dọn dẹp Controls trùng lặp & Mở rộng Canvas ([GraphCanvas.tsx](file:///d:/ILMS%20project/ILMS-FE/src/features/knowledge-graph/components/canvas/GraphCanvas.tsx))
- Xóa bỏ hoàn toàn cụm nút `<Controls />` màu trắng vuông vức ở góc dưới bên trái.
- Giữ lại duy nhất 1 thanh dock điều khiển nổi bo tròn `rounded-full` ở góc dưới bên phải.
- Kích hoạt `proOptions={{ hideAttribution: true }}` ẩn watermark ReactFlow.
- Mở rộng chiều cao Canvas `h-[700px] xl:h-[calc(100vh-220px)] min-h-[580px]`.
- Cân chỉnh thông số D3 Force Layout (`forceCollide` radius 110, `link` distance 220, repulsive charge -650) tạo khoảng cách thoáng đãng cho các thẻ node.

### 1.4. Hệ thống 22 Loại Quan Hệ Tri Thức Chuẩn & Tùy Biến Tự Do ([types.ts](file:///d:/ILMS%20project/ILMS-FE/src/features/knowledge-graph/types.ts) & [QuickConnectModal.tsx](file:///d:/ILMS%20project/ILMS-FE/src/features/knowledge-graph/components/analytics/QuickConnectModal.tsx))
- Định nghĩa kiểu `RelationLabel` gồm 22 loại quan hệ được chia thành 6 nhóm ngữ nghĩa sư phạm:
  1. **Phân loại & Thứ bậc:** `IS_A`, `HAS_CATEGORY`, `HAS_SUBTYPE`, `CLASSIFIED_INTO`, `IS_VARIANT_OF`
  2. **Thành phần & Bao hàm:** `PART_OF`, `COMPOSED_OF`, `CONTAINS`
  3. **Tiên quyết & Phụ thuộc:** `REQUIRES`, `DEPENDS_ON`, `APPLIES_TO`
  4. **Liên kết & Đối chiếu:** `ASSOCIATED_WITH`, `USES`, `CONTRASTS_WITH`, `IMPROVES_UPON`
  5. **Nguyên nhân & Hệ quả:** `CAUSES`, `LEADS_TO`, `SOLVES`, `PRODUCES`, `YIELDS`
  6. **Nguồn gốc & Tác giả:** `CREATED_BY`, `DISCOVERED_BY`
- Hàm tiện ích `getRelationDisplayLabel()` chuẩn hóa tên tiếng Việt ngắn gọn, thân thiện trên đồ thị.
- Hỗ trợ tính năng **Tùy biến tự do (Custom Relation)**: Cho phép người dùng nhập bất kỳ loại quan hệ tùy ý (tự động chuẩn hóa UPPERCASE và dấu gạch dưới).
- Đồng bộ hệ thống quan hệ này trên cả `DraftQuickConnectModal` và `DraftEdgeEditModal`.

---

## 2. Kết quả kiểm thử
- `npx tsc --noEmit`: 0 lỗi.
- Đã đồng bộ `TASKS.md`.
