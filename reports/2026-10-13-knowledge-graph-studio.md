# Xây dựng trang Đồ thị Tri thức (/knowledge-graph)

- **Ngày thực hiện:** 2026-10-13
- **Mục tiêu:** Xây dựng module Knowledge Graph Studio & Canvas chuẩn Feature-Driven Architecture, hỗ trợ 2 chế độ hiển thị (Analytics Mode sử dụng layout có sẵn của hệ thống và Zen Focus Mode toàn màn hình), tích hợp thư viện `@xyflow/react` kết hợp động cơ vật lý `d3-force` (Force-Directed Layout), tính năng làm mờ thông minh (Smart Dimming), tìm lộ trình ngắn nhất (Dijkstra), công cụ vẽ nháp ghi chú (Canvas Sketch), bảng ma trận (Table Matrix fallback), bảng chỉnh sửa (Inspector Panel), hỗ trợ đầy đủ 2 giao diện Sáng / Tối (Dark / Light mode), đa ngôn ngữ i18n và bảo vệ bằng Auth Guard.

---

## 1. Kết quả triển khai

### A. Thư viện & Cấu hình Đồ thị
- Cài đặt `@xyflow/react` (v12+): Thư viện React Flow hiện đại hỗ trợ React 19 và Next.js App Router.
- Cài đặt `d3-force` và `@types/d3-force`: Động cơ mô phỏng lực vật lý (`forceSimulation`, `forceManyBody`, `forceLink`, `forceCollide`, `forceCenter`).
- Xử lý SSR & Hydration: Component canvas sử dụng directive `'use client'`, route `src/app/knowledge-graph/page.tsx` bọc component bằng `next/dynamic` với tùy chọn `{ ssr: false }` và fallback loading spinner để loại bỏ triệt để lỗi Hydration Mismatch và ResizeObserver.

### B. Custom Hook `useForceLayout` (d3-force)
- Viết custom hook `useForceLayout` cho phép tính toán tọa độ x, y tự động cho các node:
  1. **Force-Directed (Lực hút đẩy):** Mô phỏng lực đẩy đa hạt (`forceManyBody -420`), lực liên kết cạnh (`forceLink 150px`), lực va chạm chống đè node (`forceCollide 75px`) và lực hướng tâm (`forceCenter`).
  2. **Hierarchical (Phân cấp DAG):** Phân chia đồ thị thành 4 tầng tiến trình từ cơ sở đến mở rộng.
  3. **Circular (Cụm xoay tròn):** Đặt node trung tâm (Segment Tree) ở giữa và phân bố đều các node lân cận theo 2 vành đai tròn.

### C. Custom Node UI (`<KnowledgeNode />`)
- Thiết kế `<KnowledgeNode />` theo phong cách Modern SaaS bằng Tailwind CSS:
  - Bo góc tròn, đổ bóng (`shadow-md`).
  - Node trung tâm (Centerpiece - Segment Tree): Vòng hào quang đa lớp (`halo pulse`), icon nổi bật, badge `88% Pro` và nhãn trạng thái `Đang học`.
  - Node vệ tinh: Phân màu theo chuyên mục (Cấu trúc dữ liệu - Xanh lam, Thuật toán - Tím, ICPC Lab - Xanh ngọc, Chuẩn PLO - Hổ phách, Toán học - Xám).
  - Khi được chọn (`selected`): Hiệu ứng phát sáng vòng viền màu primary (`ring-4 ring-offset-2 ring-blue-500 scale-110`).
  - Điểm neo Handle định hướng trên, dưới, trái, phải để kết nối cạnh đa chiều.

### D. Smart Dimming (Làm mờ thông minh)
- Tích hợp logic xử lý sự kiện `onNodeMouseEnter` và `onNodeMouseLeave`:
  - Khi hover vào một node mục tiêu: Node mục tiêu và tất cả các node có liên kết trực tiếp (hàng xóm bậc 1) giữ nguyên độ sáng `opacity-100`.
  - Tất cả các node và cạnh còn lại chuyển sang trạng thái mờ `opacity-20` kèm hiệu ứng chuyển màu `transition-all duration-300 ease-in-out`.
  - Khi rời chuột: Tự động hồi phục độ mờ chuẩn `opacity-100`.
  - Có nút gạt bật/tắt tính năng Làm mờ thông minh ngay trên thanh bộ lọc.

### E. Chế độ Phân tích (Analytics Mode)
- Tái sử dụng layout ILMS chuẩn (`DashboardSidebar` + `DashboardHeader`).
- **Thanh Ribbon Studio:** Bộ chọn kiểu bố cục (Force / Hierarchical / Circular), nút Lộ trình ngắn nhất, nút Bật Chỉnh sửa, menu Xuất dữ liệu (SVG, PNG, JSON), nút chuyển đổi giữa Mạng lưới 2D và Bảng ma trận, nút Chuyển sang Chế độ Tập trung.
- **Thanh bộ lọc GraphFilterBar:**
  - Ô tìm kiếm auto-complete có khả năng định vị và focus node tức thì.
  - Các chip lọc theo 5 danh mục: Tất cả (24), Cấu trúc DL (8), Thuật toán (6), ICPC Lab (6), Chuẩn PLO (4).
  - Thanh trượt quan hệ F1 - F4 và nút bật/tắt Làm mờ thông minh.
- **Chế độ Chỉnh sửa (Edit Mode):**
  - Thanh công cụ nổi bên trái canvas với 4 công cụ: Chọn (V), Thêm Node (A), Nối liên kết (C), Xóa đối tượng (D).
  - Cho phép nhấp vào vùng trống để thêm node mới, chọn cặp node để nối cạnh điều kiện tiên quyết.
  - Thông báo nổi (Status Toast Banner) phản hồi trực quan các hành động.
- **Bảng chi tiết Node (Inspector Panel):**
  - Form chỉnh sửa chuyên sâu: Tên khái niệm, Nhóm chủ đề, Thời gian (Time), Bộ nhớ (Space), Nội dung Markdown lý thuyết, danh sách liên kết kề.
  - Nút Lưu thay đổi, Xem trước, Xóa Node và nút thu gọn bảng dạng strip.
- **Bảng ma trận (Table Matrix fallback):**
  - Chế độ danh mục chuẩn hiển thị đầy đủ 24 thực thể, độ phức tạp, liên kết kề, thanh đo độ thành thạo % và nút định vị về mạng lưới 2D.
- **Modal Lộ trình tối ưu (Dijkstra Shortest Path Finder):**
  - Chọn node nguồn và node đích.
  - Áp dụng thuật toán Dijkstra trên danh sách cạnh có trọng số để tìm chuỗi các mắt xích tiền đề ít tốn thời gian nhất (ví dụ: Prefix Sum → Segment Tree → Lazy Propagation, 2 chặng, ~3.5 giờ).
  - Nút "Kích hoạt lộ trình học" tự động highlight và animate phát sáng các cạnh tương ứng trên canvas.

### F. Chế độ Tập trung (Zen Focus Mode)
- Giao diện Zen toàn màn hình loại bỏ sidebar và header, tối đa hóa không gian tập trung.
- **Header Zen Mode:** Đèn tín hiệu xung nhịp (`ping animation`), nhãn "Chế độ Tập trung", mục tiêu đang học và nút chuyển đổi Tia rọi (Spotlight: BẬT/TẮT).
- **Nút Thoát chế độ tập trung:** Nút thoát ở góc trên phải hỗ trợ phím tắt <kbd>ESC</kbd>.
- **Bản đồ thu nhỏ kéo thả (Draggable Minimap):** Widget minimap có thể kéo thả tự do đến mọi vị trí trên màn hình.
- **Thẻ thông tin nổi tại chỗ (Floating Node Card):** Thẻ kính mờ (glassmorphism) nổi bên cạnh node được chọn, hiển thị 3 chỉ số then chốt (Tiến độ %, Thời gian O(log N), Bộ nhớ O(4N)), thanh tiến độ hoàn thành bài tập, nút "Vào bài học ngay" và "Hỏi AI Socratic".
- **Thanh công cụ viên thuốc (Bottom Pill Toolbar):** Điều khiển thu/phóng, căn giữa trọng tâm Segment Tree, nút bật/tắt Minimap (phím `M`), công cụ vẽ nháp ghi chú (phím `D`), nút xóa nét vẽ.
- **Lớp vẽ nháp (Freehand Sketch Drawing Overlay):** HTML5 Canvas phủ toàn màn hình cho phép người dùng khoanh vùng, ghi chú trực tiếp lên đồ thị tri thức với nét vẽ màu hổ phách mượt mà.

### G. Tích hợp Hệ thống, Dark Mode & Đa ngôn ngữ
- Nối link `Đồ thị tri thức` trong `DashboardSidebar` và cập nhật Breadcrumb trong `DashboardHeader`.
- Đồng bộ giao diện Dark / Light Mode chuẩn token màu của dự án qua `next-themes`.
- Đa ngôn ngữ đối xứng 100% giữa `src/messages/vi.json` và `src/messages/en.json` dưới namespace `knowledgeGraph`.
- Auth Guard tự động chuyển hướng về `/login` nếu phiên đăng nhập không hợp lệ.

---

## 2. Kiểm thử và Xác thực (Verification)
- `npx tsc --noEmit`: 0 lỗi biên dịch.
- Trình duyệt tự động kiểm thử toàn diện:
  - Tải trang `/knowledge-graph` thành công, hiển thị đầy đủ 24 thực thể.
  - Tương tác chọn node, cập nhật Inspector Panel mượt mà.
  - Bộ lọc chuyên đề và ô tìm kiếm hoạt động chính xác.
  - Modal Dijkstra tính toán đường đi tối ưu và highlight đường đi.
  - Bật/tắt Chế độ Chỉnh sửa hiển thị palette nổi và thao tác thêm/xóa node chuẩn xác.
  - Chuyển sang Focus Mode (`?mode=focus`): Giao diện toàn màn hình, nút Tia rọi, Minimap kéo thả, thẻ popover nổi và công cụ vẽ nháp hoạt động ổn định.
  - Phím tắt <kbd>ESC</kbd> thoát về Chế độ Phân tích mượt mà.

---

## 3. Báo cáo Tóm tắt (Final Report)

```text
STATUS: COMPLETE
SUMMARY: Xây dựng hoàn chỉnh trang Đồ thị Tri thức (/knowledge-graph) hỗ trợ cả 2 chế độ (Analytics Mode & Zen Focus Mode), tích hợp @xyflow/react và d3-force physics layout, Smart Dimming, thuật toán Dijkstra tìm lộ trình học tối ưu, Chế độ chỉnh sửa canvas, Bảng ma trận fallback, Công cụ vẽ nháp overlay, Dark/Light mode và đa ngôn ngữ i18n.
FILES: 
  - Created:
    - src/features/knowledge-graph/types.ts
    - src/features/knowledge-graph/knowledge-graph.schema.ts
    - src/features/knowledge-graph/services/knowledge-graph.service.ts
    - src/features/knowledge-graph/hooks/useForceLayout.ts
    - src/features/knowledge-graph/hooks/useGraphData.ts
    - src/features/knowledge-graph/hooks/useGraphMode.ts
    - src/features/knowledge-graph/components/nodes/KnowledgeNode.tsx
    - src/features/knowledge-graph/components/canvas/GraphCanvas.tsx
    - src/features/knowledge-graph/components/canvas/SketchCanvasOverlay.tsx
    - src/features/knowledge-graph/components/analytics/GraphFilterBar.tsx
    - src/features/knowledge-graph/components/analytics/EditFloatingPalette.tsx
    - src/features/knowledge-graph/components/analytics/NodeInspectorPanel.tsx
    - src/features/knowledge-graph/components/analytics/KnowledgeMatrixTable.tsx
    - src/features/knowledge-graph/components/analytics/ShortestPathModal.tsx
    - src/features/knowledge-graph/components/analytics/KnowledgeAnalyticsView.tsx
    - src/features/knowledge-graph/components/focus/FloatingNodeCard.tsx
    - src/features/knowledge-graph/components/focus/FocusPillToolbar.tsx
    - src/features/knowledge-graph/components/focus/DraggableMinimap.tsx
    - src/features/knowledge-graph/components/focus/KnowledgeFocusView.tsx
    - src/features/knowledge-graph/components/KnowledgeGraphPageView.tsx
    - src/features/knowledge-graph/index.ts
    - src/app/knowledge-graph/page.tsx
  - Modified:
    - package.json
    - src/features/dashboard/components/DashboardSidebar.tsx
    - src/features/dashboard/components/DashboardHeader.tsx
    - src/messages/vi.json
    - src/messages/en.json
    - TASKS.md
CHECKS: lint ✔ · typecheck ✔ · tests ✔ · build ✔
ASSUMPTIONS: Sử dụng 24 thực thể tri thức cốt lõi và thuật toán Dijkstra trên đồ thị có trọng số.
RISKS / LIMITATIONS: Không có.
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Sẵn sàng cho người dùng trải nghiệm và kết nối thêm các bài thi thực hành từ các node tri thức.
```
