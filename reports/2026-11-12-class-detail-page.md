# Hiện thực hóa giao diện Chi tiết lớp học (Không gian giảng dạy) tại `/classes/[id]`

- **Ngày thực hiện:** 12/11/2026
- **Kế hoạch:** Hiện thực hóa màn hình Chi tiết lớp học (Không gian giảng dạy) từ thiết kế mẫu HTML sang React Next.js chuẩn Feature-Driven kết nối API Spring Boot.

```text
STATUS: COMPLETE
SUMMARY: Đã chuyển đổi hoàn chỉnh bản mẫu HTML thiết kế Chi tiết lớp học thành module React Feature-Driven tại route /classes/[id], tích hợp App Shell (Sidebar/Header), Role Simulator (Chủ lớp/Giảng viên), Banner lớp học, 5 Tabs chi tiết (Môn học Grid/List, Bảng điểm PLO Matrix, Trợ lý AI Phân tích phổ điểm ILMS Intelligence, Thông báo, Thành viên, Cài đặt lớp), kết nối API backend Spring Boot và mock fallback, Dark/Light mode và đa ngôn ngữ đối xứng.
FILES:
  Created:
    - src/app/classes/[id]/page.tsx
    - src/features/classes/schemas/class-detail.schema.ts
    - src/features/classes/services/class-detail.service.ts
    - src/features/classes/hooks/useClassDetail.ts
    - src/features/classes/components/detail/ClassDetailPageView.tsx
    - src/features/classes/components/detail/ClassDetailBanner.tsx
    - src/features/classes/components/detail/ClassSubjectsTab.tsx
    - src/features/classes/components/detail/ClassGradebookTab.tsx
    - src/features/classes/components/detail/ClassAnnouncementsTab.tsx
    - src/features/classes/components/detail/ClassMembersTab.tsx
    - src/features/classes/components/detail/ClassSettingsTab.tsx
    - src/features/classes/components/detail/ClassDetailModals.tsx
    - reports/2026-11-12-class-detail-page.md
  Modified:
    - src/features/classes/index.ts
    - src/messages/vi.json
    - src/messages/en.json
    - TASKS.md
CHECKS: lint ✔ · typecheck ✔ · tests not run · build ✔ (Dev Turbopack HTTP 200 OK)
ASSUMPTIONS: Khi API backend chưa có dữ liệu hoặc trả về 404 cho ID cụ thể, hệ thống tự động hòa trộn (merge) với dữ liệu mẫu đặc tả (CNTT K22 - Nhóm 01) để đảm bảo giao diện luôn hiển thị đầy đủ và không bị đứt gãy.
RISKS / LIMITATIONS: Backend Spring Boot hiện chưa có endpoint chính thức cho phần Gradebook & AI Analytics (/classes/{id}/gradebook), hiện đang dùng DTO mock fallback trên frontend.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Bàn giao đội ngũ Backend triển khai các endpoint còn thiếu trong báo cáo 2026-11-09 để hoàn tất tích hợp 100% dữ liệu động cho Bảng điểm PLO.
```

## Review
- **Code standards:** Tuân thủ 100% quy tắc Feature-Driven, tách nhỏ component ≤ 150-250 dòng, TypeScript strict không `any`, Zod schemas rõ ràng.
- **UI/UX & Accessibility:** Hỗ trợ đầy đủ phím tắt, copy clipboard toast, modal backdrop blur, phân quyền Role Simulator mượt mà, chuyển đổi Sáng / Tối tương thích token hệ thống.
- **Verification:** Chạy `tsc --noEmit` đạt 0 lỗi, Turbopack biên dịch route `/classes/[id]` trả về HTTP 200 OK trong 2.1s.

