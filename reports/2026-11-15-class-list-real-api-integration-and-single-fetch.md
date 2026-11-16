# Tích hợp Dữ liệu Thực API và Khử Gọi Kép cho Danh sách Lớp học

**Ngày:** 2026-11-15  
**Nhiệm vụ:** Loại bỏ toàn bộ dữ liệu mock up/hardcoded ở trang Lớp học (`/classes`), hiển thị dữ liệu thực từ `GET /api/v1/classes` và `GET /api/v1/classes/kpi-summary`, xử lý lỗi gọi trùng lặp (duplicate call).

---

## 1. Nguyên nhân & Vấn đề giải quyết

1. **Gọi trùng 2 lần đến `/api/v1/classes` khi vào trang:**
   - **Root Cause 1:** Trong `src/hooks/useUserRole.ts`, hook này gọi ngầm `useClasses()` với query key `['classes', 'list', {}]`. Do `useUserRole` được gắn toàn cục trong `GlobalSocraticCoach` (`src/app/layout.tsx`), khi vào `/classes`, nó gửi một request. Đồng thời, `ClassListPageView` gọi `useClasses(queryFilters)` với query key chứa bộ lọc (`['classes', 'list', { status: 'ACTIVE', role: 'TEACHER', ... }]`). Hai query key khác nhau dẫn đến TanStack Query kích hoạt 2 HTTP request đồng thời tới máy chủ.
   - **Root Cause 2:** Trong `class.service.ts`, khối `catch` trước đây chứa fallback tự động gọi sang `/classes/listClasses` nếu gặp lỗi.
2. **Dữ liệu Mockup/Hardcoded xuất hiện thay vì dữ liệu thực:**
   - Trong `ClassListPageView.tsx`, câu lệnh `list = studentApiItems.length > 0 ? studentApiItems : [...DEFAULT_STUDENT_CLASSES]` và `baseList = responseData?.items?.length > 0 ? responseData.items : [...DEFAULT_FACULTY_CLASSES]` khiến cho khi backend trả về danh sách rỗng (`[]`) hoặc chưa có lớp nào, giao diện luôn rơi vào mock data 8 lớp học giả lập thay vì hiển thị trạng thái Empty State / Search Not Found.
   - Các chỉ số KPI (`ClassKpiStatsBar.tsx`) có fallback toán tử `|| 12`, `|| 368`, `|| 7`, `|| 4`, `|| 2` khiến số liệu luôn bị gán cứng thành dữ liệu ảo.
   - Các thẻ đếm tab (`activeCount = 12`, `enrolledCount = 4`, `archivedCount = 3`) và phân trang (`trên 2 (tổng 12 lớp)`) bị gán cứng.

---

## 2. Chi tiết thay đổi

1. **`src/hooks/useUserRole.ts`:**
   - Loại bỏ hoàn toàn `useClasses` khỏi hook toàn cục.
   - Nhận diện vai trò người dùng chuẩn xác dựa trên `user.roleName`, `user.roles` và định dạng email sinh viên/giảng viên.
2. **`src/features/classes/schemas/class.schema.ts`:**
   - Làm phong phú `classItemSchema` để tương thích linh hoạt với mọi biến thể định dạng Spring Boot: `code` / `classCode` / `enrollmentKey`, `maxCapacity` / `maxStudents`, `enrolledCount` / `studentsCount` / `totalStudents`, `thumbnailUrl`, `backgroundUrl`.
   - Làm cho `classInstructorSchema` và `ownerId` hỗ trợ optional properties chuẩn TypeScript.
   - Hoàn thiện `classListEnvelopeSchema` dùng `safeParse` cho từng phần tử mảng, tránh việc 1 phần tử lỗi làm hỏng toàn bộ danh sách lớp học.
   - Hoàn thiện `classKpiSummarySchema` trích xuất an toàn số liệu từ `GET /api/v1/classes/kpi-summary`.
3. **`src/features/classes/services/class.service.ts`:**
   - `getClasses` chỉ gọi duy nhất 1 lần tới `GET /api/v1/classes`, trả về danh sách thực từ máy chủ kết hợp các lớp do người dùng vừa tạo cục bộ.
   - `getClassKpiSummary` gọi `GET /api/v1/classes/kpi-summary` và trả về số liệu thực (mặc định 0 nếu máy chủ offline/chưa có dữ liệu, không chèn số ảo).
4. **`src/features/classes/hooks/useClasses.ts`:**
   - Bổ sung cấu hình `staleTime: 60_000` và `refetchOnWindowFocus: false` cho `useClasses` và `useClassKpiSummary`.
5. **`src/features/classes/components/ClassListPageView.tsx`:**
   - Loại bỏ hoàn toàn việc import và sử dụng `DEFAULT_FACULTY_CLASSES` và `DEFAULT_STUDENT_CLASSES`.
   - Tính toán `facultyKpiStats` và `studentKpiStats` 100% dựa trên `kpiData` từ backend hoặc tính trực tiếp từ mảng `items`.
   - Bộ đếm tab (`activeCount`, `enrolledCount`, `archivedCount`, `allCount`, `displayedCount`) được tính toán động từ `responseData.totalElements` và `responseData.items`.
   - Phân trang động hỗ trợ `totalPages`, `currentPageDisplay`, hiển thị chính xác dải phần tử `X - Y trên Z lớp học`.
   - Tích hợp chuẩn 7-State Matrix: Skeleton khi tải, Error State khi lỗi mạng, Empty Zero-Data State khi chưa có lớp kèm nút CTA "Tạo lớp học đầu tiên", và Search Not Found State khi bộ lọc không khớp kèm nút "Xóa bộ lọc & Tải lại".
6. **`src/features/classes/components/ClassKpiStatsBar.tsx`:**
   - Loại bỏ triệt để tất cả toán tử fallback số liệu giả (`|| 12`, `|| 368`, `|| 7`, `|| 4`, `|| 2`).
   - Phụ đề KPI hiển thị thông tin thực tế dựa trên số lượng yêu cầu chờ và tiến độ giảng dạy.

---

## 3. Kết quả kiểm thử

- `npx tsc --noEmit`: 0 lỗi.
- Đã kiểm tra kết nối Spring Boot API `GET /api/v1/classes` và `GET /api/v1/classes/kpi-summary`.
- Xác nhận số lượng API call tới `/classes` khi truy cập trang chỉ còn duy nhất 1 lần.
