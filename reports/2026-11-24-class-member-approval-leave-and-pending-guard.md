# Hoàn thiện Phân hệ Lớp học: Duyệt thành viên, Cấu hình ghi danh, Rời lớp & Chặn truy cập PENDING

- **Ngày:** 2026-11-24
- **Tóm tắt:** Sửa lỗi đếm và bổ sung UI duyệt/từ chối thành viên `PENDING`, sửa lưu cấu hình `requireApproval` & `isCodeActive`, thêm nút Rời lớp cho `STUDENT`/`TEACHER`, chặn người dùng `PENDING` vào chi tiết lớp và thêm tab "Chờ duyệt" tại `/classes`.

```text
STATUS: COMPLETE
SUMMARY: Đã triển khai đủ 5 hạng mục cho phân hệ Lớp học: (1) getClassMembers hỗ trợ Spring Page + ?status=PENDING và UI bấm badge Chờ duyệt để Phê duyệt/Từ chối trong ClassMembersTab; (2) ClassSettingsTab gửi requireApproval và isCodeActive khi lưu cấu hình; (3) Thêm leaveClass API + nút Rời khỏi lớp học (ẩn với OWNER); (4) Chặn người dùng PENDING xem nội dung trong ClassDetailPageView; (5) Thêm tab Chờ duyệt và khóa link vào lớp PENDING ở /classes.
FILES: modified src/features/classes/schemas/class.schema.ts, src/features/classes/services/class.service.ts, src/features/classes/services/class-detail.service.ts, src/features/classes/hooks/useClasses.ts, src/features/classes/hooks/useClassDetail.ts, src/features/classes/components/detail/ClassMembersTab.tsx, src/features/classes/components/detail/ClassSettingsTab.tsx, src/features/classes/components/detail/ClassDetailBanner.tsx, src/features/classes/components/detail/ClassDetailPageView.tsx, src/features/classes/components/ClassFilterToolbar.tsx, src/features/classes/components/ClassListPageView.tsx, src/features/classes/components/ClassCardGrid.tsx, src/features/classes/components/ClassCardItem.tsx, TASKS.md
CHECKS: lint ✘ (package.json không có script lint) · typecheck ✔ (npx tsc --noEmit) · tests not run · build not run
ASSUMPTIONS: Tab "Chờ duyệt" tại /classes lọc theo memberStatus === 'PENDING' (parse từ memberStatus/membershipStatus/myStatus/enrollmentStatus); nếu Backend chưa trả field này trong GET /api/v1/classes thì tab sẽ trống.
RISKS / LIMITATIONS: Toggle @edu.vn trong ClassSettingsTab được đánh dấu "Sắp ra mắt" (disabled) vì UpdateClassRequestDTO chưa hỗ trợ. Chưa kiểm thử runtime trên trình duyệt sau lượt sửa cuối.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Kiểm tra trực tiếp trên trình duyệt tại /classes và /classes/{id}?tab=people, ?tab=settings.
```
