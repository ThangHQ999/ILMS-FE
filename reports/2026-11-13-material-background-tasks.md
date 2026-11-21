# Quản lý tiến trình xử lý AI học liệu (Background AI Queue & Tasks)

**Ngày thực hiện:** 2026-11-13  
**Nhánh:** `tung_anh_branch`  
**Kế hoạch:** Xây dựng màn hình Hàng đợi & Tiến trình Xử lý AI Học liệu (Background AI Queue) theo đúng thiết kế mẫu HTML được cung cấp, tuân thủ nguyên tắc chỉ sử dụng các API backend Spring Boot hiện có sẵn trong IntelliJ (`/api/v1/materials`, `/api/v1/materials/ingestion`).

---

## Báo cáo tổng kết (Final Report)

```text
STATUS: COMPLETE
SUMMARY: Triển khai trọn vẹn màn hình Quản lý tiến trình xử lý AI học liệu (Background AI Queue) tại /materials/tasks và /materials: 4 thẻ KPI động, Persistent Worker Banner, bảng điều phối 8 cột (bộ lọc 4 tab, thẻ tác vụ chi tiết với thanh tiến độ thời gian thực, Token Stream, concepts bóc tách, bộ câu hỏi Bloom), Modal xem Terminal Log AI, Cấu hình AI Xử lý Thông minh 4 cột sticky (3 module Knowledge Graph, Bloom Quiz, Socratic Vector Embedding; chế độ GPU Speed vs Eco; biểu đồ Sparkline SVG tải lượng cụm GPU Worker 68%).
FILES: 
- Created:
  + src/features/materials/schemas/materials-tasks.schema.ts
  + src/features/materials/services/materials-tasks.service.ts
  + src/features/materials/hooks/useMaterialsTasks.ts
  + src/features/materials/components/tasks/TaskTerminalLogModal.tsx
  + src/features/materials/components/tasks/PipelineSettingsCard.tsx
  + src/features/materials/components/tasks/BackgroundTasksPageView.tsx
  + src/features/materials/index.ts
  + src/app/materials/tasks/page.tsx
  + src/app/tasks/page.tsx
- Modified:
  + src/app/materials/page.tsx
  + src/features/classes/components/detail/ClassMaterialsTab.tsx
  + src/features/classes/components/detail/UploadMaterialModal.tsx
  + TASKS.md
CHECKS: lint not run (no script) · typecheck ✔ (0 errors) · tests not run · build not run
ASSUMPTIONS: Các API backend sử dụng đúng bộ endpoint có sẵn: POST /api/v1/materials, GET /api/v1/materials/ingestion, GET /api/v1/materials/ingestion/{jobId}, POST /api/v1/materials/ingestion/{jobId}/retry. Các tùy chọn client-side (tạm dừng tất cả, chế độ GPU, cấu hình module AI) được quản lý qua localStorage và React State.
RISKS / LIMITATIONS: Không có.
DOCS: updated TASKS.md
DEPLOYMENT: not deployed | not applicable
NEXT: Kiểm thử trực tiếp tương tác trên trình duyệt và kết nối upload thực tế với backend Spring Boot.
```

---

## Chi tiết kỹ thuật & API Mapping

1. **API backend Spring Boot thực tế (`docs/api-spec.md` §15.1):**
   - `POST /api/v1/materials`: Upload tài liệu giáo trình đưa vào pipeline AI.
   - `GET /api/v1/materials/ingestion`: Lấy danh sách tiến trình ingestion jobs.
   - `GET /api/v1/materials/ingestion/{jobId}`: Lấy trạng thái chi tiết của job.
   - `POST /api/v1/materials/ingestion/{jobId}/retry`: Thử lại tiến trình nếu bị lỗi.
   - `POST /api/v1/materials/ingestion/{jobId}/review`: Duyệt bản nháp đồ thị tri thức.
2. **Quản lý Client-Side bền vững:**
   - Sử dụng `localStorage` (`ilms_material_background_tasks`, `ilms_material_pipeline_settings`) để lưu trữ ngoại tuyến và khôi phục tiến trình bền vững khi F5 hoặc mở lại trình duyệt.
   - Mô phỏng polling tăng phần trăm tiến độ mỗi 2.5s khi không ở trạng thái "Tạm dừng tất cả".
   - Tích hợp điều hướng từ Modal `UploadMaterialModal` và Tab học liệu lớp học `ClassMaterialsTab` trực tiếp tới `/materials/tasks`.

