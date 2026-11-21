# Xây dựng Trang Tạo lớp học (`/classes/create`), Upload Ảnh nền & Hiển thị Background Lớp học

- **Ngày:** 2026-11-17
- **Tóm tắt kế hoạch:** Tạo `src/lib/upload.ts` (`POST /api/v1/uploads/image`), chuẩn hóa `createClassRequestSchema` và `createClass()` theo `ClassCreateRequestDTO` trong `docs/api-spec.md` §6.1, xây dựng route `/classes/create` (`CreateClassPageView`) phong cách tối giản Material 3 kèm Live Preview Card, chuyển nút `+ Tạo lớp học` sang trang mới và hiển thị `backgroundUrl` làm lớp nền kèm gradient scrim trên `ClassCardItem` và `ClassDetailBanner`.

```text
STATUS: COMPLETE
SUMMARY: Hoàn thiện trang Tạo lớp học mới (/classes/create) chuẩn Material 3 và api-spec.md, tích hợp service upload ảnh nền Cloud (/api/v1/uploads/image), chuyển điều hướng nút + Tạo lớp học sang /classes/create, và hiển thị ảnh nền backgroundUrl kèm lớp phủ gradient dễ đọc trên danh sách (/classes) và banner chi tiết (/classes/[id]).
FILES:
  created:
    - src/lib/upload.ts
    - src/features/classes/components/CreateClassPageView.tsx
    - src/app/classes/create/page.tsx
    - src/app/classes/create/loading.tsx
    - src/app/classes/create/error.tsx
  modified:
    - src/features/classes/schemas/class.schema.ts
    - src/features/classes/services/class.service.ts
    - src/features/classes/index.ts
    - src/features/classes/components/ClassHeroSection.tsx
    - src/features/classes/components/ClassStateViews.tsx
    - src/features/classes/components/ClassCardItem.tsx
    - src/features/classes/components/detail/ClassDetailBanner.tsx
    - src/messages/vi.json
    - src/messages/en.json
    - TASKS.md
CHECKS: lint not configured · typecheck ✔ (npx tsc --noEmit) · i18n parity ✔ (1925 keys) · build ✔ (npm run build, 34/34 pages)
ASSUMPTIONS:
  - Backend hỗ trợ POST /api/v1/uploads/image (multipart/form-data: file, folder) trả về FileUploadResponseDTO có secureUrl hoặc url.
  - Sau khi tạo lớp thành công, người dùng được điều hướng thẳng vào /classes/{id}.
RISKS / LIMITATIONS:
  - [NOT VERIFIED] Chưa kiểm thử end-to-end luồng upload ảnh Cloudinary và tạo lớp thật trên trình duyệt.
  - Next.js 16.4.3 vẫn có cảnh báo bảo mật cần nâng cấp (đang chờ dọn dung lượng ổ C:/D:).
DOCS: updated TASKS.md
DEPLOYMENT: not deployed
NEXT: Mở /classes → bấm "+ Tạo lớp học" để vào /classes/create, thử upload ảnh nền, kiểm tra Live Preview và tạo lớp mới.
```

## Review

- **Chuẩn `docs/api-spec.md`:** `createClass` gửi đúng `ClassCreateRequestDTO` (`name`, `title`, `description`, `academicYear`, `major`, `maxCapacity`, `visibility`, `requireApproval`, `isCodeActive`, `backgroundUrl`, `startAt`, `endAt`) và `uploadImage` kiểm tra định dạng ảnh + giới hạn 10MB trước khi gọi `POST /uploads/image`.
- **Hiển thị Background hợp lý:** Cả `ClassCardItem` và `ClassDetailBanner` đều đặt ảnh nền trong wrapper `pointer-events-none absolute inset-0 rounded-3xl overflow-hidden` kèm gradient scrim thích ứng Light/Dark, không làm cắt menu `⋮` và luôn đảm bảo độ tương phản chữ phía trước.
- **i18n & Build:** `vi.json` và `en.json` đối xứng 100% (`1925` khóa), `npx tsc --noEmit` và `npm run build` đạt 0 lỗi (34/34 route).
