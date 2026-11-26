# Nâng Cấp Toàn Màn Hình Canvas Đồ Thị & Modal Chi Tiết Thực Thể Tri Thức Giàu Thông Tin

- **Ngày thực hiện:** 23/11/2026
- **Kế hoạch đã phê duyệt:** `fullscreen_knowledge_graph_and_rich_entity_modal_plan.md`
- **Phạm vi:**
  - `src/features/knowledge-graph/components/focus/FloatingNodeCard.tsx`
  - `src/features/knowledge-graph/components/focus/KnowledgeFocusView.tsx`
  - `src/features/knowledge-graph/components/analytics/KnowledgeAnalyticsView.tsx`
  - `src/features/knowledge-graph/components/nodes/KnowledgeNode.tsx`
  - `src/features/knowledge-graph/services/knowledge-graph.service.ts`
  - `src/features/knowledge-graph/hooks/useGraphData.ts`
  - `src/features/dashboard/components/DashboardHeader.tsx`
  - `src/messages/vi.json` & `src/messages/en.json`

---

## 1. Mục tiêu và Yêu cầu Người dùng
1. **Khắc phục triệt để lỗi phân loại thực thể tri thức**: Thuật toán Dijkstra (và các giải thuật/khái niệm cốt lõi) từng bị hiển thị nhầm thành nhãn "Chủ đề" với icon thư mục màu vàng `folder_special` thay vì "Thực thể tri thức".
2. **Nâng cấp Modal chi tiết thực thể tri thức (`FloatingNodeCard.tsx`)**:
   - Thay thế popover nhỏ hẹp 3 chỉ số bằng Modal phong cách Google Material Design 3 rộng rãi (`w-[520px] max-w-[calc(100vw-2rem)] rounded-3xl`).
   - Cung cấp thanh điều hướng 4 tab hoàn chỉnh:
     - **Tổng quan (`overview`)**: Tên thực thể, định nghĩa đầy đủ (giữ nguyên ngắt dòng), nguồn học liệu, thẻ Luận cứ / Giả thuyết, danh sách Kiến thức tiên quyết & Kiến thức kế tiếp có thể click chuyển node ngay lập tức.
     - **Quy trình (`processes`)**: Danh sách các bước giải thuật tuần tự kèm số thứ tự (1, 2, 3...) và nội dung hành động chi tiết.
     - **Bài tập (`exercises`)**: Đề bài tập rèn luyện và các bước giải quyết.
     - **Ví dụ & Code (`examples`)**: Đoạn mã giải thuật hoặc ví dụ thực tế.
3. **Chuẩn hóa Chế độ Toàn màn hình (Fullscreen Canvas Mode)**:
   - Thay thế toàn bộ thuật ngữ "Chế độ Tập trung" (Focus Mode) gây hiểu nhầm thành **"Toàn màn hình"** (`Fullscreen`).
   - Nút kích hoạt trên Header và Analytics View dùng icon `fullscreen`, hỗ trợ phím tắt `F` để bật/tắt toàn màn hình.
   - Khi ở toàn màn hình, thanh trạng thái hiển thị "Toàn màn hình", nút thoát hiển thị "Thoát toàn màn hình" (`fullscreen_exit` / `ESC` / `F`).

---

## 2. Chi tiết Triển khai Kỹ thuật
1. **`KnowledgeNode.tsx`**:
   - Thắt chặt điều kiện kiểm tra chủ đề: Chỉ coi node là Chủ đề khi `normKind === 'TOPIC'` và nhãn không chứa từ khóa thuật toán/thực thể (`dijkstra`, `thuật toán`, `algorithm`, `giải thuật`, `KnowledgeEntity`, `Concept`).
   - Cập nhật ưu tiên giao diện cho các thuật toán: Thẻ Tonal tím Google `#E8DEF8`, icon `schema`, chip `Thuật toán / Quy trình`.
2. **`knowledge-graph.service.ts` & `useGraphData.ts`**:
   - Trong `unpackRawNode`, loại bỏ việc lấy tên thực thể làm giá trị chủ đề dự phòng (`topicVal`).
   - Trong `mapRawGraphToCanvasData`, tự động chuẩn hóa `rawKind` thành `KnowledgeEntity` nếu tên node biểu thị một giải thuật.
   - Thêm bộ lọc trong `isGenericTopicName` và `deriveTopicDisplayName` ánh xạ giải thuật vào chủ đề học phần chuẩn (`Lý thuyết Đồ thị`).
3. **`FloatingNodeCard.tsx`**:
   - Tái cấu trúc thành Modal Material 3 kích thước 520px với 4 tab độc lập.
   - Hiển thị trọn vẹn mô tả/định nghĩa giải thuật từ tài liệu gốc.
   - Hiển thị đầy đủ danh sách bước quy trình, bài tập, ví dụ và luận cứ.
   - Nút hành động "Vào bài học" và "Hỏi Gia sư AI" tích hợp trực tiếp ở chân modal.
4. **`KnowledgeFocusView.tsx`, `KnowledgeAnalyticsView.tsx`, `DashboardHeader.tsx`**:
   - Đổi nhãn sang "Toàn màn hình" / "Thoát toàn màn hình" và icon `fullscreen` / `fullscreen_exit`.
   - Bổ sung lắng nghe sự kiện phím `f` / `F` và `Escape` để chuyển đổi toàn màn hình mượt mà.

---

## 3. Kết quả Kiểm thử
- **TypeScript (`npx tsc --noEmit`)**: 0 lỗi (Exit Code 0).
- **Next.js Production Build (`npm run build`)**: Thành công 100% trên toàn bộ 42 static & dynamic routes.
- **Material 3 Design Tokens**: Đảm bảo tuân thủ bề mặt tonal, bo góc `rounded-2xl` & `rounded-3xl`, không dùng border cứng.
