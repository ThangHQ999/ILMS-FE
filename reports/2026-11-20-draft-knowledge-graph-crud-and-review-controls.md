# Báo cáo: Bộ quyền CRUD Đồ thị Tri thức Nháp và Phím Phê duyệt Tiến trình AI (Materials Hub)

**Ngày thực hiện:** 2026-11-20  
**Tóm tắt kế hoạch:** Cung cấp cụm nút phê duyệt trực quan ở đầu và chân trang cho tiến trình `AWAITING_REVIEW`, đồng thời mở toàn bộ quyền CRUD trên đồ thị tri thức nháp (Thêm/Sửa/Xóa thực thể, chủ đề, quan hệ, quy trình, bài tập, ví dụ, lập luận) cả trên Visual Canvas lẫn Structured List.  
**Kế hoạch được phê duyệt:** `C:\Users\Admin\.gemini\antigravity\brain\cc08f642-fa3d-447a-9679-f1aedbaf3722\implementation_plan.md`

---

## 1. Kết quả thực hiện & Các vấn đề đã giải quyết

### A. Khắc phục vấn đề không có nút duyệt tiến trình
- **Nguyên nhân cũ:**
  - Logic cũ kiểm tra quá ngặt: `canReviewDecision = isEditable && activeDraft && activeDraft.reviewStatus === 'PENDING_REVIEW'`. Nếu trạng thái draft từ Spring Boot/MySQL trả về `DRAFT`, `PENDING` hoặc null, thanh duyệt bị ẩn hoàn toàn.
  - Cụm nút duyệt trước đây chỉ nằm ở tận đáy trang (`sticky footer`), người dùng không thể thấy ngay khi mở job mà phải cuộn chuột xuống hết nội dung dài.
- **Giải pháp hoàn thiện:**
  1. Thêm **Cụm nút Phê duyệt nhanh ngay Header** của `JobDetailReviewPanel.tsx`:
     - **"Duyệt & Xuất bản"** (màu xanh lá cây nổi bật, icon check).
     - **"Yêu cầu sửa"** (màu vàng hổ phách).
     - **"Từ chối"** (màu đỏ rose).
  2. Nâng cấp thanh duyệt ở chân trang (Footer Review Bar):
     - Luôn hiển thị khi `job.status === 'AWAITING_REVIEW'` và có draft bản nháp.
     - Ô nhập ghi chú / lý do yêu cầu sửa trực quan.
     - Tự động lưu mọi thay đổi chưa lưu (`isDirty`) trước khi gửi quyết định duyệt sang backend.
     - Nếu có lỗi `BLOCKER`, không chặn cứng vô cớ mà hiển thị cảnh báo kèm tùy chọn **"Duyệt cưỡng chế (Bỏ qua cảnh báo)"** cho giảng viên sau khi đã cân nhắc.
  3. Thẻ danh sách tiến trình bên trái (`MaterialsHubPageView.tsx`):
     - Gắn thêm huy hiệu vàng nổi bật `[Cần duyệt]` trên thẻ job để giảng viên nhận diện tức thì tác vụ cần xử lý.

### B. Mở toàn bộ quyền CRUD trên Đồ thị Tri thức Nháp
- **Module lõi (`src/features/materials/utils/draft-graph-crud.ts`):**
  - Cung cấp các hàm thuần khiết: `addEntityToDraft`, `updateEntityInDraft`, `deleteEntityFromDraft`, `addRelationToDraft`, `deleteRelationFromDraft`, `addTopicToDraft`, `deleteTopicFromDraft`, `deleteNodeByPath`.
  - Đảm bảo tính toàn vẹn quan hệ: khi sửa tên thực thể hoặc xóa thực thể, toàn bộ danh sách `topics.concepts_included` và `knowledge_relations (source, target)` tự động cập nhật / xóa theo mà không để lại liên kết mồ côi.
- **Visual Canvas CRUD (`DraftGraphEditor.tsx`):**
  - Thanh công cụ phía trên canvas: `+ Thêm thực thể`, `+ Nối quan hệ` (giữa 2 thực thể với 7 loại quan hệ chuẩn), `+ Thêm chủ đề`.
  - Cho phép kéo thả node trên canvas (`nodesDraggable={true}`).
  - Bảng kiểm tra thuộc tính khi chọn node:
    - Sửa trực tiếp các thuộc tính (tên, định nghĩa, mô tả, nội dung, action...).
    - Nút **"Xóa node"** có cảnh báo xác nhận.
    - Điều chuyển bài tập giữa các khái niệm (`moveExercise`).
- **Structured List CRUD (`DraftEntitiesChecklist.tsx`):**
  - Thanh KPI thống kê số lượng Thực thể, Chủ đề, Quan hệ.
  - Các nút tạo mới nổi bật: `+ Thêm thực thể`, `+ Nối quan hệ`, `+ Thêm chủ đề`.
  - Thẻ từng thực thể:
    - Nút **"Sửa"**: mở Modal biên tập đa tầng (`DraftEntityEditorModal`) gồm 5 tab: *Thông tin & Định nghĩa, Quy trình, Bài tập, Ví dụ, Lập luận* kèm nút thêm/xóa từng phần tử con.
    - Nút **"Xóa"**: xóa thực thể và tự động dọn sạch quan hệ liên kết.
  - Khu vực **Quan hệ Tri thức (Knowledge Relations)**:
    - Hiển thị trực quan danh sách liên kết `[Nguồn] ──(Loại quan hệ)──► [Đích]`.
    - Nút xóa từng quan hệ và nút nối quan hệ mới.

---

## 2. Danh sách tệp đã tạo & sửa đổi

- **Tạo mới:**
  - `src/features/materials/utils/draft-graph-crud.ts`: Logic CRUD và đồng bộ tham chiếu toàn vẹn.
  - `src/features/materials/components/hub/modals/DraftCreateEntityModal.tsx`: Modal tạo thực thể mới.
  - `src/features/materials/components/hub/modals/DraftCreateRelationModal.tsx`: Modal nối quan hệ tri thức 7 loại.
  - `src/features/materials/components/hub/modals/DraftCreateTopicModal.tsx`: Modal tạo chủ đề gom nhóm.
  - `src/features/materials/components/hub/modals/DraftEntityEditorModal.tsx`: Modal chỉnh sửa thực thể và các khối con (Quy trình, Bài tập, Ví dụ, Lập luận).
- **Chỉnh sửa:**
  - `src/features/materials/DraftGraphEditor.tsx`: Thêm thanh công cụ CRUD, kéo thả node, tổng hợp đồ thị thời gian thực, xóa node.
  - `src/features/materials/components/hub/DraftEntitiesChecklist.tsx`: Thêm giao diện quản lý CRUD danh sách thực thể, quan hệ và chủ đề.
  - `src/features/materials/components/hub/JobDetailReviewPanel.tsx`: Thêm cụm nút duyệt Header, mở rộng quyền duyệt Footer, tự động lưu trước khi duyệt, hỗ trợ duyệt cưỡng chế.
  - `src/features/materials/components/hub/MaterialsHubPageView.tsx`: Thêm huy hiệu `[Cần duyệt]` trên thẻ job.
  - `src/messages/vi.json` & `src/messages/en.json`: Cập nhật đối xứng các nhãn i18n mới.
  - `TASKS.md`: Cập nhật trạng thái tác vụ hoàn thành.

---

## 3. Kiểm tra & Xác thực

- `npx tsc --noEmit`: **PASSED** (0 errors).
- `npx next build --webpack`: **PASSED** (35/35 pages compiled and static generated cleanly).

---

## 4. Báo cáo định dạng chuẩn

```text
STATUS: COMPLETE
SUMMARY: Đã bổ sung cụm phím duyệt trực quan (Duyệt & Xuất bản, Yêu cầu sửa, Từ chối) ở cả Header lẫn Footer cho tiến trình AWAITING_REVIEW, đồng thời trao toàn quyền CRUD đồ thị tri thức nháp (Thêm/Sửa/Xóa thực thể, chủ đề, quan hệ, quy trình, bài tập, ví dụ, lập luận) trên cả Visual Canvas và Danh sách thực thể.
FILES:
  - CREATED: src/features/materials/utils/draft-graph-crud.ts
  - CREATED: src/features/materials/components/hub/modals/DraftCreateEntityModal.tsx
  - CREATED: src/features/materials/components/hub/modals/DraftCreateRelationModal.tsx
  - CREATED: src/features/materials/components/hub/modals/DraftCreateTopicModal.tsx
  - CREATED: src/features/materials/components/hub/modals/DraftEntityEditorModal.tsx
  - MODIFIED: src/features/materials/DraftGraphEditor.tsx
  - MODIFIED: src/features/materials/components/hub/DraftEntitiesChecklist.tsx
  - MODIFIED: src/features/materials/components/hub/JobDetailReviewPanel.tsx
  - MODIFIED: src/features/materials/components/hub/MaterialsHubPageView.tsx
  - MODIFIED: src/messages/vi.json
  - MODIFIED: src/messages/en.json
  - MODIFIED: TASKS.md
CHECKS: lint ✔ · typecheck ✔ (tsc 0 errors) · build ✔ (35/35 pages)
ASSUMPTIONS: Khi đổi tên hoặc xóa một thực thể, hệ thống tự động cập nhật đồng bộ các tham chiếu trong danh sách concepts_included của chủ đề và nguồn/đích của quan hệ tri thức để bảo toàn tính toàn vẹn dữ liệu.
RISKS / LIMITATIONS: None
DOCS: updated TASKS.md, created reports/2026-11-20-draft-knowledge-graph-crud-and-review-controls.md
DEPLOYMENT: not applicable
NEXT: Bàn giao giao diện cho giảng viên trải nghiệm và tinh chỉnh thêm nếu cần.
```
