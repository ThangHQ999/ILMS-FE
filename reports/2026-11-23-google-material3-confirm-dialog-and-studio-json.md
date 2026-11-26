# Triển khai Hộp thoại Xác nhận Chuẩn Google Material 3 và Tính năng Chèn Nhóm Thực Thể từ JSON Studio

Ngày thực hiện: 23/11/2026
Kế hoạch đã duyệt: `confirm_dialog_material3_migration_plan.md`

## 1. Tóm tắt kết quả triển khai
- **Xóa bỏ 100% popup trình duyệt:** Thay thế toàn bộ các lệnh `window.confirm`, `confirm()` và `alert()` nguyên thủy trên 12 tệp trong toàn bộ dự án bằng **ConfirmDialog phong cách Google Material 3**.
- **Xây dựng `ConfirmDialog` & `useConfirm()` toàn cục:**
  - Thiết kế bo tròn đặc trưng Google Material 3 (`rounded-3xl` 28px).
  - Tonal icon container: Danger (đỏ), Warning (vàng hổ phách), Info (xanh dương).
  - Nút bấm pill: Nút Hủy nhẹ nhàng, nút Xác nhận nổi bật.
  - Phím tắt `Escape` để hủy, `Enter` để xác nhận, bấm ra ngoài scrim backdrop để đóng.
  - Hook Promise-based `const confirm = useConfirm()` cho phép gọi `const ok = await confirm(...)` tiện lợi, trực tiếp.
- **Tính năng Chèn Nhóm Thực thể từ JSON (Draw.io Style):**
  - Tạo mới `DraftJsonStudioModal.tsx` và `draft-json-importer.ts`.
  - Hỗ trợ xem toàn bộ JSON đồ thị bản nháp, copy 1-click hoặc tải file `.json`.
  - Hỗ trợ dán đoạn mã JSON (1 thực thể, danh sách nhiều thực thể, hoặc cụm topic + thực thể + quan hệ) và bấm **"Chèn vào đồ thị & Render ngay"** để tự động tạo node/cạnh trên canvas.
  - Cung cấp sẵn nút **"Tải mẫu JSON chuẩn"** và tùy chọn gộp `Merge` hoặc `Replace All`.
- **Khắc phục lỗi trang Studio (`/materials/draft-studio`):**
  - Bổ sung cơ chế fallback draft an toàn, loại bỏ hoàn toàn lỗi crash màn hình *"Không thể tải đồ thị bản nháp"*.

## 2. Danh sách tệp đã tạo & chỉnh sửa
### Tệp tạo mới:
- `src/components/shared/ConfirmDialog.tsx`
- `src/components/shared/ConfirmProvider.tsx`
- `src/features/materials/utils/draft-json-importer.ts`
- `src/features/materials/components/hub/modals/DraftJsonStudioModal.tsx`

### Tệp chỉnh sửa:
- `src/components/shared/index.ts`
- `src/providers/index.tsx`
- `src/features/materials/components/hub/modals/DraftNodeEditModal.tsx`
- `src/features/materials/DraftGraphEditor.tsx`
- `src/features/materials/components/hub/modals/DraftEntityEditorModal.tsx`
- `src/features/materials/components/hub/DraftEntitiesChecklist.tsx`
- `src/features/materials/components/hub/JobDetailReviewPanel.tsx`
- `src/features/materials/MaterialsWorkspace.tsx`
- `src/features/courses/components/detail/CourseMaterialsTab.tsx`
- `src/features/assignments/components/teacher/TeacherExamManagementView.tsx`
- `src/features/assignments/components/teacher/TeacherQuestionBankView.tsx`
- `src/features/settings/components/modals/ManageStorageFilesModal.tsx`
- `src/features/settings/components/tabs/BillingTab.tsx`
- `src/features/classes/components/detail/ClassGradebookTab.tsx`
- `src/features/error-pages/components/ForbiddenView.tsx`
- `src/features/assignments/components/AssignmentsTabView.tsx`
- `src/features/materials/components/hub/studio/DraftStudioHeader.tsx`
- `src/features/materials/components/hub/studio/DraftStudioPalette.tsx`
- `src/app/materials/draft-studio/page.tsx`
- `TASKS.md`

## 3. Kiểm tra chất lượng (Verification)
- `npx tsc --noEmit`: 0 lỗi.
- `npm run build`: Thành công 100% (42/42 routes biên dịch hoàn hảo).
- Kiểm tra mã nguồn: 0 lệnh native `confirm(` hay `alert(` còn tồn tại trong logic giao diện người dùng.
