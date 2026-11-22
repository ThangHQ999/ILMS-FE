# API SPEC — ILMS (Intelligent Learning Management System)

> **Status: OFFICIALLY ALIGNED CONTRACT (Version 2.1 — Full RBAC & Two-Tier Authorization)**  
> Đồng bộ 100% với Backend Spring Boot 3.3.4 (`com.example.ilms`).  
> Tài liệu kỹ thuật chuẩn dành cho Frontend (Next.js 14+ / React / Axios / TanStack Query) tích hợp và kết nối toàn diện.

---

## 1. Quy ước chung (Conventions & Envelope)

### 1.1. Base URL & Protocol
- **Base URL:** Biến môi trường `NEXT_PUBLIC_API_URL` (Mặc định môi trường dev: `http://localhost:8080/api/v1`).
- **Format:** `application/json; charset=UTF-8` (Ngoại trừ các endpoint Upload/Tải file dùng `multipart/form-data` hoặc download stream).
- **Mã định danh (ID):** UUID v4 dạng chuỗi chuẩn 36 ký tự (Ví dụ: `3fa85f64-5717-4562-b3fc-2c963f66afa6`).
- **Thời gian (Date/Time):** Chuỗi ISO-8601 UTC (`yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`).
- **Ngôn ngữ hỗ trợ:** Header `Accept-Language: vi|en` (mặc định phản hồi tiếng Việt theo `SuccessCode`/`ErrorCode`).

### 1.2. Cơ chế Xác thực (Authentication & Cookie Lifecycle)
- **Kiến trúc:** Stateless JWT lưu ngầm an toàn qua **HttpOnly Cookie** (`Set-Cookie` do Server phát hành, chống tấn công XSS):
  - `access-token`: Thời hạn 24h, tự động đính kèm trên mọi request từ Browser.
  - `refresh-token`: Thời hạn 7 ngày, dùng để tự động làm mới phiên đăng nhập khi `access-token` hết hạn.
- **Lưu ý bắt buộc cho Axios / Fetch trên Frontend:**
  ```typescript
  // lib/api-client.ts
  import axios from "axios";

  export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
    withCredentials: true, // BẮT BUỘC: Cho phép trình duyệt tự động gửi và nhận HttpOnly Cookie
    headers: {
      "Content-Type": "application/json",
    },
  });
  ```
  *(Lưu ý: Backend KHÔNG trả JWT token trong JSON Body của API login/register mà cấp thông qua HTTP response header `Set-Cookie`).*

---

### 1.3. Cấu trúc Response chuẩn (API Envelopes)

#### A. Success Envelope (`ApiResponse<T>`)
Áp dụng cho mọi API trả về đối tượng đơn lẻ hoặc danh sách tĩnh:
```json
{
  "status": 0,
  "message": "Thao tác thành công",
  "data": { },
  "timestamp": "2026-11-12T15:30:00.000Z"
}
```

#### B. Paginated Envelope (`ApiResponse<PageResponse<T>>`)
Áp dụng cho các endpoint tìm kiếm, lọc danh sách có phân trang:
```json
{
  "status": 0,
  "message": "Lấy danh sách thành công",
  "data": {
    "items": [ { } ],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 48,
    "totalPages": 5,
    "last": false
  },
  "timestamp": "2026-11-12T15:30:00.000Z"
}
```
*Query Params phân trang chuẩn:* `?page=0&size=10&search=keyword&sort=createdAt,desc` *(Lưu ý: Spring Boot đánh số trang bắt đầu từ `0`)*.

#### C. Error Envelope (`ErrorResponse`)
Khi xảy ra lỗi nghiệp vụ, xác thực hoặc kiểm tra tính hợp lệ dữ liệu (HTTP 4xx, 5xx):
```json
{
  "status": 40001,
  "message": "Tên khóa học đã tồn tại trong hệ thống",
  "timestamp": "2026-11-12T15:30:00.000Z",
  "errors": {
    "email": "Email không đúng định dạng",
    "password": "Mật khẩu phải có độ dài từ 6 ký tự"
  }
}
```

---

### 1.4. Ma trận Phân quyền 2 Tầng & Hướng dẫn Tích hợp Frontend (Authorization Matrix & Frontend Guide)

Hệ thống ILMS áp dụng mô hình bảo mật và kiểm soát truy cập **2 Tầng độc lập (Two-Tier Security Architecture)**. Con AI Frontend (hoặc Developer) bắt buộc phải nắm vững 2 tầng này để:
1. **Thiết lập Route Protection / Middleware:** Chặn chuyển trang trái phép (`/admin/**`, `/classes/[id]/manage/**`).
2. **Conditional UI Rendering:** Ẩn / hiện nút bấm, tab điều hướng và các trường dữ liệu theo đúng vai trò.
3. **Gọi đúng Endpoint:** Học sinh gọi endpoint cá nhân (`/me`), Giảng viên gọi endpoint quản lý.

```
+---------------------------------------------------------------------------------------------------+
|                                  TẦNG 1: SYSTEM RBAC (HỆ THỐNG TOÀN CỤC)                          |
|                                                                                                   |
|    [PUBLIC]               [ROLE_USER]                                      [ROLE_ADMIN]           |
|  (Khách vãng lai)     (Người dùng đã đăng ký)                          (Quản trị viên hệ thống)    |
|  - Xem công khai     - Tạo/Quản lý môn học cá nhân                     - Toàn quyền cấu hình     |
|  - Đăng ký/Đăng nhập - Tạo lớp, tham gia lớp học                        - Quản lý User/Role/Room  |
|                      - Sử dụng Trợ lý ảo AI & Học tập                  - Khôi phục dữ liệu đã xóa|
+---------------------------------------------------------------------------------------------------+
                                            │
                                            ▼
+---------------------------------------------------------------------------------------------------+
|                             TẦNG 2: NGỮ CẢNH LỚP HỌC & TÀI NGUYÊN (CONTEXTUAL SCOPES)             |
|                                                                                                   |
|  A. Vai trò trong Lớp (class_members.role + status)  B. Quyền sở hữu Môn học (courses.owner_id)   |
|     - OWNER: Chủ phòng / Giảng viên lập lớp             - Course Owner: Giảng viên tạo môn học    |
|     - TEACHER: Giảng viên / Trợ giảng lớp                                                         |
|     - STUDENT: Sinh viên chính thức (ACTIVE)         C. Quyền tự sở hữu (Resource Self-Ownership) |
|     - PENDING: Chờ duyệt tham gia lớp                   - Chỉ xem & sửa bài tập, điểm của chính mình|
+---------------------------------------------------------------------------------------------------+
```

---

#### 1.4.1. Bảng Ma trận Tầng 1: Phân quyền Hệ thống (System RBAC Matrix)

Dữ liệu nguồn lấy từ `user.roleName` sau khi Frontend gọi API `GET /api/v1/auth/me`.

| Mã Quyền hạn (Permission Code) | Phân hệ (Module) | PUBLIC | ROLE_USER | ROLE_ADMIN | Ý nghĩa & Hành vi trên Giao diện Frontend |
| :--- | :---: | :---: | :---: | :---: | :--- |
| *(Public Anonymous)* | AUTH | ✔ | ✔ | ✔ | Truy cập trang Đăng ký, Đăng nhập, Quên mật khẩu, Landing Page |
| `USER_VIEW` | USER | ✘ | ✔ (Self) | ✔ (All) | Xem thông tin Profile cá nhân; Admin xem danh sách tất cả User |
| `USER_MANAGE` | USER | ✘ | ✘ | ✔ | Menu Quản lý người dùng: Tạo tài khoản, khóa User, đổi role hệ thống |
| `SYSTEM_CONFIG` | CONFIG | ✘ | ✘ | ✔ | Màn hình Quản trị hệ thống: Quản lý Role, Permission, Phòng học (Room), Khôi phục môn/lớp bị xóa |
| `COURSE_CREATE` | COURSE | ✘ | ✔ | ✔ | Nút **"+ Tạo khóa học mới"** trên thanh công cụ khóa học |
| `COURSE_VIEW` | COURSE | ✘ | ✔ | ✔ | Xem danh mục khóa học, chi tiết đề cương Chương - Bài học |
| `COURSE_UPDATE` | COURSE | ✘ | ✔ (Owner) | ✔ | Nút **"Chỉnh sửa môn học"**, thêm/sửa/xóa Chương, Bài học |
| `COURSE_DELETE` | COURSE | ✘ | ✔ (Owner) | ✔ | Nút **"Xóa môn học"** (Xóa mềm `deleted_at`) |
| `MATERIAL_UPLOAD` | MATERIAL | ✘ | ✔ (Owner) | ✔ | Nút **"Tải lên tài liệu / Video / Ảnh"** đính kèm bài giảng |
| `CLASS_CREATE` | CLASS | ✘ | ✔ | ✔ | Nút **"+ Tạo lớp học mới"** trên trang Lớp học |
| `CLASS_VIEW` | CLASS | ✘ | ✔ | ✔ | Xem danh sách lớp học, bảng tin, thời khóa biểu, tài liệu lớp |
| `CLASS_UPDATE` | CLASS | ✘ | ✔ (Owner) | ✔ | Nút **"Cài đặt lớp"**: Đổi tên, bật/tắt mã code, duyệt đơn, mời SV |
| `CLASS_DELETE` | CLASS | ✘ | ✔ (Owner) | ✔ | Nút **"Xóa lớp học"** (Chỉ Owner của lớp hoặc Admin thấy nút này) |
| `ATTENDANCE_MANAGE`| ATTENDANCE | ✘ | ✔ (Context) | ✔ | Nút **"Điểm danh ca học"** trong sổ điểm danh buổi học |
| `QUESTION_BANK_MANAGE`| QUESTION | ✘ | ✔ | ✔ | Nút **"Soạn câu hỏi mới"**, sửa/xóa câu hỏi trong Ngân hàng đề |
| `ASSESSMENT_MANAGE`| ASSESSMENT | ✘ | ✔ (Context) | ✔ | Nút **"Giao bài tập"**, **"Tạo đề thi"**, **"Tạo Quiz"**, **"Chấm điểm"** |
| `SUBMISSION_CREATE`| SUBMISSION | ✘ | ✔ | ✔ | Nút **"Nộp bài tập"**, **"Bắt đầu làm Quiz"** (Dành cho học sinh) |
| `AI_ASSISTANT_USE` | SOCRATIC | ✘ | ✔ | ✔ | Cửa sổ Gia sư AI Socratic chat stream, xem lịch sử phiên chat |
| `KNOWLEDGE_GRAPH_READ` | GRAPH | ✘ | ✔ | ✔ | Màn hình xem Đồ thị tri thức trực quan 2D/3D (Mermaid / Neo4j) |
| `KNOWLEDGE_GRAPH_EDIT` | GRAPH | ✘ | ✔ (Owner) | ✔ | Chỉnh sửa bản nháp Đồ thị tri thức bóc tách từ tài liệu |
| `KNOWLEDGE_GRAPH_REVIEW`| GRAPH | ✘ | ✔ (Owner) | ✔ | Duyệt và Xuất bản (Publish) Đồ thị tri thức |
| `KNOWLEDGE_HEATMAP_VIEW`| HEATMAP | ✘ | ✔ | ✔ | Xem Bản đồ nhiệt tri thức môn học & Ma trận nhiệt lớp học |
| `PLO_VIEW` | PLO | ✘ | ✔ | ✔ | Xem danh sách Chuẩn đầu ra chương trình đào tạo (PLO) |
| `PLO_MANAGE` | PLO | ✘ | ✘ | ✔ | Thêm, sửa, xóa Chuẩn đầu ra PLO cấp chương trình |
| `CLO_VIEW` | CLO | ✘ | ✔ | ✔ | Xem danh sách Chuẩn đầu ra học phần (CLO) của môn học |
| `CLO_MANAGE` | CLO | ✘ | ✔ (Owner) | ✔ | Thêm, sửa, xóa CLO, gắn Bloom level, target score |
| `CLO_PLO_MAPPING_MANAGE`| CLO_PLO | ✘ | ✔ (Owner) | ✔ | Chỉnh sửa Ma trận ánh xạ CLO - PLO và Concept - CLO |
| `OUTCOME_ATTAINMENT_VIEW`| ATTAINMENT | ✘ | ✔ | ✔ | Báo cáo mức độ đạt chuẩn CLO/PLO của học sinh & lớp học |

---

#### 1.4.2. Bảng Ma trận Tầng 2: Ngữ cảnh Lớp học (Contextual Class Roles)

Một người dùng mang `ROLE_USER` có thể đóng nhiều vai trò khác nhau tùy theo từng lớp học:
- Được xác định qua bảng `class_members` (`role`: `OWNER`, `TEACHER`, `STUDENT` và `status`: `ACTIVE`, `PENDING`).
- Dưới đây là ma trận phân quyền quyết định **nút bấm và màn hình nào được hiển thị** khi người dùng truy cập vào lớp học `/classes/{classId}`:

| Chức năng & Nút thao tác trên Giao diện | Chủ lớp (`OWNER`) | Giảng viên (`TEACHER`) | Học viên (`STUDENT`) | Chờ duyệt (`PENDING`) | Khách ngoài lớp |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Xem Bảng tin, Mô tả lớp học** | ✔ | ✔ | ✔ | ✘ | ✘ (Chỉ thấy mã lớp) |
| **Xem danh sách Thành viên lớp** | ✔ | ✔ | ✔ | ✘ | ✘ |
| **Đăng / Ghim Thông báo (`Announcement`)**| ✔ | ✔ | ✘ | ✘ | ✘ |
| **Chỉnh sửa thông tin lớp, Đóng/mở Mã lớp**| ✔ | ✘ | ✘ | ✘ | ✘ |
| **Gán môn học vào lớp (`Class Courses`)** | ✔ | ✘ | ✘ | ✘ | ✘ |
| **Mời thành viên qua Email / Phê duyệt đơn**| ✔ | ✔ | ✘ | ✘ | ✘ |
| **Thăng chức Trợ giảng / Chuyển role lớp**| ✔ | ✘ | ✘ | ✘ | ✘ |
| **Xóa / Đuổi học viên khỏi lớp** | ✔ | ✔ (Chỉ đuổi SV) | ✘ | ✘ | ✘ |
| **Chuyển giao quyền Chủ lớp (`Change Owner`)**| ✔ | ✘ | ✘ | ✘ | ✘ |
| **Xóa mềm lớp học** | ✔ | ✘ | ✘ | ✘ | ✘ |
| **Tự rời khỏi lớp học (`Leave Class`)** | ✘ (Bảo vệ Owner) | ✔ | ✔ | ✘ | ✘ |
| **Tạo lịch Ca học mới / Xếp phòng** | ✔ | ✔ | ✘ | ✘ | ✘ |
| **Thực hiện Điểm danh học viên** | ✔ | ✔ | ✘ | ✘ | ✘ |
| **Xem lịch sử điểm danh của mình** | ✔ | ✔ | ✔ (Chỉ xem của mình)| ✘ | ✘ |
| **Giao bài tập mới (`Create Assignment`)**| ✔ | ✔ | ✘ | ✘ | ✘ |
| **Sửa / Gia hạn / Xóa bài tập** | ✔ | ✔ | ✘ | ✘ | ✘ |
| **Nộp bài tập / Nộp lại bài tập** | ✘ | ✘ | ✔ | ✘ | ✘ |
| **Xem danh sách tất cả bài nộp của lớp** | ✔ | ✔ | ✘ | ✘ | ✘ |
| **Chấm điểm bài tập & Nhận xét** | ✔ | ✔ | ✘ | ✘ | ✘ |
| **Tạo / Sửa / Xóa bài trắc nghiệm (`Quiz`)**| ✔ | ✔ | ✘ | ✘ | ✘ |
| **Làm bài Quiz (`Quiz Play & Submit`)** | ✘ | ✘ | ✔ | ✘ | ✘ |
| **Xem kết quả Quiz cả lớp** | ✔ | ✔ | ✘ (Chỉ xem điểm mình)| ✘ | ✘ |
| **Tạo đề thi / Công bố đề (`Exam`)** | ✔ | ✔ | ✘ | ✘ | ✘ |
| **Xem Bảng điểm tổng hợp cả lớp (`GradeReport`)**| ✔ | ✔ | ✘ | ✘ | ✘ |
| **Xem Bảng điểm cá nhân (`/grade-reports/me`)**| ✔ | ✔ | ✔ | ✘ | ✘ |
| **Nhập / Chỉnh sửa điểm tổng kết** | ✔ | ✔ | ✘ | ✘ | ✘ |

---

#### 1.4.3. Hướng dẫn Lập trình Frontend (Implementation Code Patterns)

Để con AI hoặc lập trình viên Frontend tích hợp chính xác và tái sử dụng tốt, Frontend nên xây dựng các helper types và logic phân quyền theo mẫu chuẩn sau:

##### 1. Khai báo TypeScript Types chuẩn
```typescript
// types/auth.ts
export type SystemRole = 'ROLE_ADMIN' | 'ROLE_USER';
export type ClassRole = 'OWNER' | 'TEACHER' | 'STUDENT';
export type MemberStatus = 'ACTIVE' | 'PENDING' | 'BLOCKED';

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName: SystemRole;
  avatarUrl?: string;
}

export interface ClassMemberContext {
  userId: string;
  classId: string;
  role: ClassRole;
  status: MemberStatus;
}
```

##### 2. Các hàm Helper kiểm tra quyền (Permission Utility)
```typescript
// utils/permissions.ts
import { CurrentUser, ClassMemberContext } from '@/types/auth';

/** Kiểm tra người dùng có phải Quản trị viên hệ thống */
export const isAdmin = (user: CurrentUser | null): boolean => {
  return user?.roleName === 'ROLE_ADMIN';
};

/** Kiểm tra người dùng có quyền quản trị lớp học (Chủ lớp hoặc Giảng viên/Trợ giảng) */
export const canManageClass = (
  user: CurrentUser | null,
  member: ClassMemberContext | null
): boolean => {
  if (isAdmin(user)) return true;
  if (!member || member.status !== 'ACTIVE') return false;
  return member.role === 'OWNER' || member.role === 'TEACHER';
};

/** Kiểm tra người dùng có phải Chủ sở hữu lớp học */
export const isClassOwner = (
  user: CurrentUser | null,
  member: ClassMemberContext | null
): boolean => {
  if (isAdmin(user)) return true;
  return member?.role === 'OWNER' && member.status === 'ACTIVE';
};

/** Kiểm tra học viên có quyền nộp bài / làm kiểm tra */
export const isEnrolledStudent = (
  member: ClassMemberContext | null
): boolean => {
  return member?.role === 'STUDENT' && member?.status === 'ACTIVE';
};

/** Kiểm tra người dùng có quyền sửa nội dung khóa học */
export const canEditCourse = (
  user: CurrentUser | null,
  courseOwnerId: string
): boolean => {
  if (isAdmin(user)) return true;
  return user?.id === courseOwnerId;
};
```

##### 3. Ví dụ áp dụng Conditional Rendering trên React Component
```tsx
// components/class/ClassHeaderActions.tsx
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClassMember } from '@/hooks/useClassMember';
import { canManageClass, isClassOwner } from '@/utils/permissions';

export const ClassHeaderActions: React.FC<{ classId: string }> = ({ classId }) => {
  const { user } = useAuth();
  const { member } = useClassMember(classId);

  return (
    <div className="flex items-center gap-3">
      {/* Nút Điểm danh & Giao bài: Chỉ OWNER và TEACHER thấy */}
      {canManageClass(user, member) && (
        <>
          <button className="btn-primary" onClick={openCreateAssignmentModal}>
            + Giao bài tập
          </button>
          <button className="btn-secondary" onClick={navigateToAttendance}>
            Điểm danh ca học
          </button>
        </>
      )}

      {/* Nút Cài đặt lớp & Đóng/mở mã lớp: Chỉ OWNER của lớp hoặc ADMIN thấy */}
      {isClassOwner(user, member) && (
        <button className="btn-outline" onClick={openClassSettingsModal}>
          ⚙️ Cài đặt lớp học
        </button>
      )}
    </div>
  );
};
```

---

#### 1.4.4. Các Bất Biến An Toàn Cốt Lõi Frontend Bắt Buộc Tuân Thủ (Security Invariants)

1. **Tuyệt đối không hiển thị đáp án đúng (`isCorrect`) trước khi nộp bài:**
   - Khi gọi API `GET /api/v1/quizzes/{id}/play`, Backend đã loại bỏ `isCorrect` và `score`. Frontend không được tự ý giả định hay lưu lộ thông tin đáp án trong Redux / LocalStorage.
2. **Bảo vệ quyền Chủ sở hữu lớp (`Class OWNER`):**
   - Trong bảng danh sách thành viên lớp (`ClassMemberTable`), hàng của thành viên mang `role === 'OWNER'` **bắt buộc phải ẩn hoặc disable nút "Xóa khỏi lớp"** và **dropdown "Đổi vai trò"**.
   - Chủ sở hữu lớp không thể tự rời lớp (`Leave Class`), nút này phải được ẩn với `OWNER`.
3. **Phân lập Dữ liệu Cá nhân Học sinh (Self-Isolation):**
   - Nếu là tài khoản `STUDENT`, giao diện bảng điểm chỉ được hiển thị dữ liệu lấy từ API `/api/v1/classes/{classId}/grade-reports/me`, tuyệt đối không gọi endpoint danh sách lớp `/grade-reports` vì Backend sẽ trả về `403 CLASS_ACCESS_DENIED`.
4. **Chống Double-Submit (Khóa nút khi thực thi):**
   - Các nút nộp bài kiểm tra trắc nghiệm (`/quizzes/{id}/attempts/{attemptId}/submit`), nộp bài tập (`/assignments/{id}/submissions`), và gán môn học theo lô (`/classes/{id}/courses/batch`) phải lập tức chuyển sang trạng thái `disabled` kèm hiệu ứng Loading ngay khi click chuột để tránh gây trùng lặp giao dịch và xung đột khóa bi quan.

---

#### 1.4.5. Bảng Ma trận Hạn mức & Quota Gói Dịch vụ (Subscription Plan Limits & Quotas)

Hệ thống ILMS áp dụng cơ chế chốt chặn quota (Quota Barrier) theo 4 cấp bậc gói thuê bao (`FREE`, `PLUS`, `PRO`, `ENTERPRISE`). Khi người dùng vượt quá hạn mức, Backend sẽ lập tức từ chối và phản hồi lỗi nghiệp vụ (HTTP 4xx):

| Tính năng / Hạn mức Quota | Gói Cơ bản (`FREE`) | Gói Nâng cao (`PLUS`) | Gói Chuyên nghiệp (`PRO`) | Gói Doanh nghiệp (`ENTERPRISE`) | Mã lỗi khi vượt hạn mức |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Dung lượng ổ lưu trữ Cloud** | **1 GB** | **15 GB** | **50 GB** | **200 GB+** | `STORAGE_QUOTA_EXCEEDED` (HTTP 400) |
| **Kích thước tệp tải lên tối đa** | 25 MB / file | 100 MB / file | 500 MB / file | 2 GB / file | `FILE_SIZE_EXCEEDED_PLAN_LIMIT` (HTTP 400) |
| **Số lượng khóa học quản lý** | 3 khóa học | 15 khóa học | 50 khóa học | Không giới hạn | `COURSE_CREATION_LIMIT_REACHED` (HTTP 403) |
| **Số lượng lớp học quản lý** | 2 lớp học | 10 lớp học | 30 lớp học | Không giới hạn | `CLASS_CREATION_LIMIT_REACHED` (HTTP 403) |
| **Số học viên tối đa / lớp** | 30 học viên | 60 học viên | 150 học viên | 500 học viên | `CLASS_CAPACITY_LIMIT_REACHED` |
| **Lượt tương tác Trợ lý AI / ngày** | 20 lượt | 300 lượt | 1.000 lượt | Không giới hạn | `AI_DAILY_LIMIT_EXCEEDED` (HTTP 429) |
| **Đồ thị tri thức tương tác** | 5 đồ thị | 30 đồ thị | 150 đồ thị | Không giới hạn | `KNOWLEDGE_GRAPH_QUOTA_EXCEEDED` (HTTP 400) |
| **Tự động phát sinh Quiz AI** | ✘ | ✔ | ✔ | ✔ | `FEATURE_NOT_IN_PLAN` |
| **Tự động chấm bài tự luận AI** | ✘ | ✘ | ✔ | ✔ | `FEATURE_NOT_IN_PLAN` |
| **Tên miền riêng & Thương hiệu** | ✘ | ✘ | ✘ | ✔ | `FEATURE_NOT_IN_PLAN` |
| **Cấp độ hỗ trợ kỹ thuật** | Tiêu chuẩn (Email) | Ưu tiên (Ticket 24h) | Hỗ trợ 1-1 (SLA 4h) | Chuyên biệt 24/7 (SLA 99.9%) | — |

> [!TIP]
> **Xử lý UI Frontend khi bắt gặp lỗi Quota:**
> - Bắt lỗi `COURSE_CREATION_LIMIT_REACHED` hoặc `CLASS_CREATION_LIMIT_REACHED`: Hiển thị Modal/Dialog chúc mừng người dùng đã phát triển nhiều khóa/lớp học kèm nút CTA `"Nâng cấp gói cước ngay"` dẫn sang `/subscription/plans`.
> - Bắt lỗi `STORAGE_QUOTA_EXCEEDED` hoặc `FILE_SIZE_EXCEEDED_PLAN_LIMIT`: Hiển thị cảnh báo dung lượng và gợi ý xóa bớt tài liệu tại `/storage` hoặc nâng cấp gói dung lượng lớn hơn.
> - Bắt lỗi `AI_DAILY_LIMIT_EXCEEDED`: Hiển thị thông báo đã dùng hết lượt AI hôm nay và đồng hồ đếm ngược reset lúc 00:00 UTC (07:00 sáng giờ VN).


---

## 2. Phân hệ Xác thực & OAuth2 (Auth & OAuth2)

### 2.1. Xác thực truyền thống (`/api/v1/auth`)

| Method | Endpoint | Quyền hạn | Mô tả | Request Body | Response Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Public | Đăng ký tài khoản người dùng mới (Hệ thống tự động gửi email xác thực tài khoản chuẩn Google style) | `RegisterRequestDTO` | `UserResponseDTO` |
| **GET** | `/api/v1/auth/verify-email` | Public | Xác thực và kích hoạt tài khoản qua token từ email | Query: `?token=...` | `null` |
| **POST** | `/api/v1/auth/resend-verification` | Public | Gửi lại email xác thực tài khoản | Query: `?email=...` | `null` |
| **POST** | `/api/v1/auth/login` | Public | Đăng nhập hệ thống (Server set HttpOnly Cookies) | `LoginRequestDTO` | `UserResponseDTO` |
| **POST** | `/api/v1/auth/logout` | `isAuthenticated()` | Đăng xuất (Server xóa HttpOnly Cookies) | None | `null` |
| **POST** | `/api/v1/auth/refresh-token` | Public (Cookie) | Tự động làm mới phiên đăng nhập (Đọc HttpOnly cookie `refreshToken` / `refresh-token`) | None (Cookie) | `{ "refreshed": true }` |
| **GET** | `/api/v1/auth/me` | `isAuthenticated()` | Lấy thông tin tài khoản đang đăng nhập | None | `UserResponseDTO` |
| **GET** | `/api/v1/auth/send-email-forgot-password` | Public | Gửi mail yêu cầu đặt lại mật khẩu | Query: `?email=...` | `null` |
| **POST** | `/api/v1/auth/forgot-password` | Public | Gửi link khôi phục mật khẩu vào email | `ForgotPasswordRequestDTO` | `null` |
| **GET** | `/api/v1/auth/verify-reset-token` | Public | Kiểm tra tính hợp lệ của token reset | Query: `?token=...` | `null` |
| **POST** | `/api/v1/auth/reset-password` | Public | Đặt mật khẩu mới sau khi xác thực | `ResetPasswordRequestDTO` | `null` |
| **POST** | `/api/v1/auth/change-password` | `isAuthenticated()` | Đổi mật khẩu tài khoản đang đăng nhập | `ChangePasswordRequestDTO` | `null` |

#### Payload mẫu:
- **`ResetPasswordRequestDTO`**:
  ```json
  {
    "token": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "newPassword": "NewPassword123@",
    "confirmPassword": "NewPassword123@"
  }
  ```
- **`LoginRequestDTO`**:
  ```json
  {
    "email": "teacher@example.com",
    "password": "Password123@"
  }
  ```
- **`RegisterRequestDTO`**:
  ```json
  {
    "email": "teacher@example.com",
    "password": "Password123@",
    "firstName": "Hải",
    "middleName": "Thanh",
    "lastName": "Nguyễn"
  }
  ```
- **`UserResponseDTO`**:
  ```json
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "roleName": "ROLE_USER",
    "email": "teacher@example.com",
    "firstName": "Hải",
    "middleName": "Thanh",
    "lastName": "Nguyễn",
    "avatarUrl": "https://lh3.googleusercontent.com/d/1g9b0p3..."
  }
  ```
- **`ChangePasswordRequestDTO`**:
  ```json
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "oldPassword": "OldPassword123@",
    "newPassword": "NewPassword123@"
  }
  ```

---

### 2.2. Đăng nhập mạng xã hội OAuth2 (`/api/v1/auth/oauth`)

| Method | Endpoint | Quyền hạn | Mô tả | Params / Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/auth/oauth/{provider}/url` | Public | Lấy URL ủy quyền (`provider`: `google` hoặc `github`) | Path: `provider` |
| **GET** | `/api/v1/auth/oauth/{provider}/login` | Public | Chuyển hướng 302 trực tiếp sang trang SSO Provider | Path: `provider` |
| **GET** | `/api/v1/auth/oauth/google` | Public | Callback xử lý OAuth2 Google (`?code=...`) | Redirect 302 về Frontend kèm Cookie |
| **GET** | `/api/v1/auth/oauth/github` | Public | Callback xử lý OAuth2 GitHub (`?code=...`) | Redirect 302 về Frontend kèm Cookie |
| **POST** | `/api/v1/auth/oauth/{provider}` | Public | SPA gửi Authorization Code để đổi phiên đăng nhập | Body: `OAuthCodeRequestDTO` |

- **`OAuthCodeRequestDTO`**: `{ "code": "4/0ASVkm...", "state": "optional_string" }`
- **`OAuthUrlResponseDTO`**: `{ "provider": "google", "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }`

---

## 3. Phân hệ Quản trị Người dùng & Cài đặt (Users, Profile & Preferences)

### 3.1. Quản lý Người dùng & Hồ sơ cá nhân (`/api/v1/users`)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả | Request Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/users` | `hasAuthority('USER_MANAGE')` | Admin tạo người dùng mới | `UserCreateRequestDTO` |
| **GET** | `/api/v1/users/profile` *(hoặc `/api/v1/user/profile`)* | `isAuthenticated()` | Lấy toàn bộ thông tin hồ sơ người dùng đang đăng nhập | None |
| **PUT** | `/api/v1/users/profile` *(hoặc `/api/v1/user/profile`)* | `isAuthenticated()` | Cập nhật hồ sơ cá nhân (Tên hiển thị, SĐT, ngày sinh, bio) | `UpdateProfileRequestDTO` |
| **POST** | `/api/v1/users/avatar` *(hoặc `/api/v1/user/avatar`)* | `isAuthenticated()` | Tải lên và cập nhật ảnh đại diện người dùng (Lưu trữ 100% Google Drive, link CDN direct nhúng thẻ `<img>`) | `multipart/form-data` (`file`) |
| **PUT** | `/api/v1/users/password` *(hoặc `/api/v1/user/password`)* | `isAuthenticated()` | Đổi mật khẩu tài khoản trong trang Cài đặt (Settings) | `ChangePasswordRequestDTO` |
| **GET** | `/api/v1/users/{id}` | `hasAuthority('USER_VIEW')` or `hasAuthority('USER_MANAGE')` | Xem thông tin chi tiết người dùng theo ID | Path: `id` (UUID) |
| **PUT** | `/api/v1/users/{id}` | `hasAuthority('USER_VIEW')` or `hasAuthority('USER_MANAGE')` | Cập nhật hồ sơ người dùng theo ID | `UserUpdateRequestDTO` |
| **PATCH** | `/api/v1/users/{id}/role` | `hasAuthority('USER_MANAGE')` | Gán vai trò hệ thống mới cho User | `UserUpdateRoleRequest`: `{ "role": "ROLE_ADMIN" }` |
| **GET** | `/api/v1/users/me/timetable` | `isAuthenticated()` | Xem thời khóa biểu cá nhân của học sinh / giảng viên (hỗ trợ lọc tùy chọn theo ngày, lớp, môn học) | `?startDate=&endDate=&classId=&courseId=` (tùy chọn) |

#### Payload `UserProfileResponseDTO`:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "displayName": "Nguyễn Văn A",
  "username": "nguyenvana",
  "email": "vana.nguyen@ilms.edu.vn",
  "isEmailVerified": true,
  "phone": "0912345678",
  "isPhoneVerified": false,
  "birthDate": "2002-05-15",
  "role": "ROLE_USER",
  "bio": "Sinh viên Khoa học Máy tính đam mê AI và phát triển hệ thống",
  "avatarUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
  "socialAccounts": {
    "google": { "email": "vana.nguyen@gmail.com", "isLinked": true },
    "github": { "username": "vananguyen", "isLinked": true },
    "apple": { "isLinked": false }
  }
}
```

#### Phản hồi `POST /api/v1/users/avatar`:
```json
{
  "status": 200,
  "message": "Cập nhật ảnh đại diện thành công",
  "data": {
    "avatarUrl": "https://lh3.googleusercontent.com/d/1g9b0p3..."
  }
}
```

#### Payload `UpdateProfileRequestDTO`:
```json
{
  "displayName": "Nguyễn Văn A",
  "phone": "0912345678",
  "birthDate": "2002-05-15",
  "bio": "Sinh viên Khoa học Máy tính đam mê AI"
}
```

#### Payload `ChangePasswordRequestDTO` (Đổi mật khẩu Settings):
```json
{
  "currentPassword": "OldPassword123@",
  "newPassword": "NewPassword123@",
  "confirmPassword": "NewPassword123@"
}
```

#### Response `GET /api/v1/users/me/timetable` (`List<LessonSessionResponseDTO>`):
Dành cho trang Thời khóa biểu cá nhân của Học sinh & Giảng viên, tự động tổng hợp tất cả các buổi học/ca học của những lớp mà người dùng đang tham gia:
```json
{
  "status": 200,
  "message": "Lấy thông tin ca học thành công",
  "data": [
    {
      "classId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "lessonSessionId": "7bb18a92-1234-4567-89ab-cdef01234567",
      "classCode": "D21CNPM01",
      "className": "Lớp Công nghệ phần mềm 01",
      "courseId": "9c9c9c9c-0000-0000-0000-000000000001",
      "courseCode": "INT1306",
      "courseName": "Cấu trúc dữ liệu và Giải thuật",
      "teacherId": "11111111-2222-3333-4444-555555555555",
      "teacherName": "Trần Văn Giảng Viên",
      "roomId": "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a01",
      "roomName": "Phòng 302-A2",
      "timeSlotId": "2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a01",
      "timeSlotName": "Kíp 1 (Sáng)",
      "sessionDate": "2026-11-24",
      "startShift": 1,
      "endShift": 2,
      "startTime": "07:00:00",
      "endTime": "08:50:00",
      "note": "Học lý thuyết Đồ thị liên thông"
    }
  ],
  "timestamp": "2026-11-20T19:00:00.000Z"
}
```
*Query Params hỗ trợ:* `?startDate=2026-11-01&endDate=2026-11-30&classId=&courseId=` (Mặc định không truyền sẽ lấy toàn bộ lịch học).

---

### 3.2. Cấu hình Cá nhân hóa & Giao diện Người dùng (`/api/v1/user/preferences`)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả | Payload / Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/user/preferences` | `isAuthenticated()` | Lấy toàn bộ cấu hình giao diện, màu sắc, font, ngôn ngữ, gia sư AI & privacy của người dùng | None |
| **PATCH** | `/api/v1/user/preferences` | `isAuthenticated()` | Cập nhật một phần cấu hình cá nhân hóa (Focus mode, theme, màu sắc, font, ...) | `UpdateUserPreferencesRequestDTO` (Partial JSON) |
| **PUT** | `/api/v1/user/preferences` | `isAuthenticated()` | Ghi đè toàn bộ cấu hình cá nhân hóa | `UpdateUserPreferencesRequestDTO` |
| **GET** | `/api/v1/user/preferences/notifications` | `isAuthenticated()` | Lấy riêng cấu hình thông báo (push, email, reminder categories) | None |
| **PUT** | `/api/v1/user/preferences/notifications` | `isAuthenticated()` | Cập nhật riêng cấu hình thông báo của người dùng | `NotificationSettingsDTO` |

#### Payload `NotificationSettingsDTO`:
```json
{
  "channels": {
    "push": true,
    "email": true,
    "sms": false
  },
  "categories": {
    "tutorAndAiMessages": true,
    "deadlineReminders": true,
    "streaksAndRankings": true,
    "webinarsAndPromotions": false
  }
}
```

#### Payload `UserPreferencesDTO`:
```json
{
  "themeMode": "light",
  "primaryColor": "#0066f5",
  "secondaryColor": "#0284c7",
  "tertiaryColor": "#6366f1",
  "neutralColor": "#64748b",
  "fontFamily": "Plus Jakarta Sans",
  "fontSize": "100%",
  "highContrast": false,
  "defaultDashboardMode": "analytics",
  "sidebarCollapsed": false,
  "language": "vi",
  "timezone": "Asia/Ho_Chi_Minh",
  "dateFormat": "DD/MM/YYYY",
  "aiPersona": "socratic",
  "aiResponseDepth": "balanced",
  "targetWeeklyStudyHours": 20.0,
  "dailyStreakGoal": 7,
  "notificationSettings": {
    "channels": { "push": true, "email": true, "sms": false },
    "categories": { "deadlineReminders": true, "tutorAndAiMessages": true, "streaksAndRankings": true, "webinarsAndPromotions": false }
  },
  "privacySettings": {
    "scoreVisibility": "classmates_only",
    "searchableByEmail": true
  },
  "updatedAt": "2026-11-14T08:00:00.000Z"
}
```

---

### 3.3. Quản lý Vai trò Hệ thống (`/api/v1/roles`)

*Toàn bộ Controller được bảo vệ bởi `@PreAuthorize("hasAuthority('SYSTEM_CONFIG')")`.*

| Method | Endpoint | Mô tả | Payload / Query |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/roles` | Lấy danh sách vai trò hệ thống | `?search=&all=false&page=0&size=10&sort=createdAt,desc` |
| **GET** | `/api/v1/roles/{id}` | Xem chi tiết vai trò theo ID | Path: `id` |
| **POST** | `/api/v1/roles` | Tạo vai trò mới | `RoleRequestDTO`: `{ "code": "ASSISTANT", "name": "Trợ giảng", "description": "Hỗ trợ chấm điểm" }` |
| **PUT** | `/api/v1/roles/{id}` | Cập nhật thông tin vai trò | `RoleUpdateRequestDTO`: `{ "name": "Trợ giảng cao cấp", "description": "..." }` |
| **DELETE** | `/api/v1/roles/{id}` | Xóa vai trò (chặn xóa vai trò hệ thống hoặc có User) | Path: `id` |
| **GET** | `/api/v1/roles/{id}/permissions` | Lấy danh sách các quyền đang gán cho vai trò | Trả về `List<PermissionResponseDTO>` |
| **PUT** | `/api/v1/roles/{id}/permissions` | Cập nhật toàn bộ quyền cho vai trò | `RoleAssignPermissionsRequestDTO`: `{ "permissionIds": ["uuid-1", "uuid-2"] }` |

---

### 3.4. Quản lý Quyền hạn (`/api/v1/permissions`)

*Toàn bộ Controller được bảo vệ bởi `@PreAuthorize("hasAuthority('SYSTEM_CONFIG')")`.*

| Method | Endpoint | Mô tả | Payload / Query |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/permissions` | Danh sách quyền hạn | `?search=&module=&all=false&page=0&size=20` |
| **GET** | `/api/v1/permissions/modules` | Lấy danh mục các Module phân quyền trong hệ thống | Trả về `List<String>` |
| **GET** | `/api/v1/permissions/{id}` | Chi tiết quyền hạn | Path: `id` |
| **POST** | `/api/v1/permissions` | Tạo mã quyền hạn mới | `PermissionRequestDTO`: `{ "code": "EXAM_SPECIAL_EDIT", "name": "Sửa đề thi đặc biệt", "module": "ASSESSMENT", "description": "..." }` |
| **PUT** | `/api/v1/permissions/{id}` | Cập nhật thông tin quyền hạn | `PermissionUpdateRequestDTO`: `{ "name": "...", "module": "...", "description": "..." }` |
| **DELETE** | `/api/v1/permissions/{id}` | Xóa mã quyền hạn | Path: `id` |

---

## 4. Phân hệ Khóa học (Courses)

Base path: `/api/v1/courses`

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả | Query / Body |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/courses` | `hasAuthority('COURSE_CREATE')` | Tạo mới khóa học | `CourseCreateRequestDTO` |
| **GET** | `/api/v1/courses` | `hasAuthority('COURSE_VIEW')` | Tìm kiếm và xem danh sách khóa học | `?search=&status=&isArchived=false&page=0&size=10` |
| **GET** | `/api/v1/courses/{id}` | `hasAuthority('COURSE_VIEW')` | Xem chi tiết môn học kèm thống kê Banner (`CourseDetailResponseDTO`) | Path: `id` |
| **GET** | `/api/v1/courses/{courseId}/materials` | `hasAuthority('COURSE_VIEW')` | Danh sách tài liệu/học liệu của môn học (phân trang, lọc theo loại file và tìm kiếm) | `?fileType=&search=&page=0&size=20` |
| **POST** | `/api/v1/courses/{courseId}/materials` | `hasAuthority('MATERIAL_UPLOAD')` | Tải lên tài liệu/học liệu cấp môn học (không bắt buộc bài học) | `multipart/form-data`: `file`, `title`, `description`, `isDownloadable` |
| **GET** | `/api/v1/courses/{courseId}/knowledge-graph` | `hasAuthority('KNOWLEDGE_GRAPH_READ') or hasAuthority('COURSE_VIEW')` | Lấy đồ thị tri thức tổng hợp toàn bộ môn học (`CourseKnowledgeGraphResponseDTO`) | Path: `courseId` |
| **GET** | `/api/v1/courses/users/{userId}` | `hasAuthority('COURSE_VIEW')` | Danh sách khóa học của một giảng viên | `?page=0&size=10` |
| **PUT / PATCH** | `/api/v1/courses/{id}` | `hasAuthority('COURSE_UPDATE')` | Cập nhật thông tin khóa học (chủ khóa học / Admin) | `CourseUpdateRequestDTO` |
| **PATCH** | `/api/v1/courses/{id}/instructor` | `hasAuthority('SYSTEM_CONFIG')` | Đổi giảng viên phụ trách chính của môn học | `UpdateCourseInstructorRequestDTO`: `{ "instructorId": "uuid..." }` |
| **DELETE** | `/api/v1/courses/{id}/soft` | `hasAuthority('COURSE_DELETE')` | Xóa mềm khóa học (`deleted_at`) | None |
| **PATCH** | `/api/v1/courses/{id}/status` | `hasAuthority('COURSE_UPDATE')` | Cập nhật trạng thái khóa học (`DRAFT`, `PUBLISHED`, `ARCHIVED`, `CLOSED`) | `UpdateCourseStatusRequestDTO`: `{ "status": "PUBLISHED" }` |
| **PATCH** | `/api/v1/courses/{id}/restore` | `hasAuthority('SYSTEM_CONFIG')` | Khôi phục khóa học đã bị xóa mềm | None |
| **DELETE** | `/api/v1/courses/{id}/hard` | `hasAuthority('SYSTEM_CONFIG')` | Xóa vĩnh viễn khóa học (chỉ Admin, chặn khi còn học viên/bài tập) | Path: `id` |
| **GET** | `/api/v1/courses/{courseId}/classes` | `hasAuthority('COURSE_VIEW')` | Danh sách các lớp học đang học môn này | `?academicYear=&page=0&size=10` |
| **GET** | `/api/v1/courses/{courseId}/timetable` | `hasAuthority('COURSE_VIEW')` | Thời khóa biểu các lớp học của môn học | `?startDate=&endDate=` (ISO Date) |

#### Payload mẫu bổ sung phân hệ Khóa học:
- **`UpdateCourseStatusRequestDTO`**:
  ```json
  {
    "status": "PUBLISHED" // DRAFT, PUBLISHED, ARCHIVED, CLOSED
  }
  ```
- **`CourseClassResponseDTO`** (Lớp học được gán môn):
  ```json
  {
    "courseId": "9c9c9c9c-0000-0000-0000-000000000001",
    "courseCode": "IT3010",
    "classId": "9c9c9c9c-0000-0000-0000-000000000002",
    "classCode": "D21CNPM01",
    "className": "Lớp Công nghệ phần mềm 01",
    "totalStudents": 45,
    "semester": "Học kỳ 1",
    "academicYear": "2026-2027"
  }
  ```
- **`GET /api/v1/courses/{courseId}/timetable`** (`List<LessonSessionResponseDTO>`):
  Lấy toàn bộ lịch học của các lớp đang theo học môn học này (dành cho Giảng viên phụ trách môn hoặc Sinh viên theo dõi lịch học):
  ```json
  [
    {
      "classId": "9c9c9c9c-0000-0000-0000-000000000002",
      "lessonSessionId": "7bb18a92-1234-4567-89ab-cdef01234567",
      "classCode": "D21CNPM01",
      "className": "Lớp Công nghệ phần mềm 01",
      "courseId": "9c9c9c9c-0000-0000-0000-000000000001",
      "courseCode": "IT3010",
      "courseName": "Cấu trúc dữ liệu và Giải thuật",
      "teacherId": "11111111-2222-3333-4444-555555555555",
      "teacherName": "TS. Nguyễn Văn A",
      "roomId": "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a01",
      "roomName": "Lab 302",
      "timeSlotId": "2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a01",
      "timeSlotName": "Kíp 1",
      "sessionDate": "2026-11-25",
      "startShift": 1,
      "endShift": 2,
      "startTime": "07:00:00",
      "endTime": "08:50:00",
      "note": "Thực hành Cây nhị phân tìm kiếm"
    }
  ]
  ```
  *Query Params hỗ trợ:* `?startDate=2026-11-01&endDate=2026-11-30` (Lọc theo khoảng ngày).

#### Payload `CourseCreateRequestDTO`:
```json
{
  "name": "Cấu trúc dữ liệu và Giải thuật",
  "description": "Môn học cơ sở ngành CNTT",
  "visibility": "PUBLIC",
  "backgroundUrl": "https://lh3.googleusercontent.com/d/1g9b0p3..."
}
```

#### Payload `CourseUpdateRequestDTO`:
```json
{
  "name": "Cấu trúc dữ liệu và Giải thuật nâng cao",
  "description": "Cập nhật mô tả môn học...",
  "visibility": "PUBLIC",
  "backgroundUrl": "https://lh3.googleusercontent.com/d/1g9b0p3..."
}
```

#### Response `CourseResponseDTO`:
```json
{
  "id": "9c9c9c9c-0000-0000-0000-000000000001",
  "courseCode": "IT3010",
  "name": "Cấu trúc dữ liệu và Giải thuật",
  "description": "Môn học cơ sở ngành CNTT",
  "visibility": "PUBLIC",
  "status": "DRAFT",
  "backgroundUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
  "createdAt": "2026-11-17T10:00:00.000Z",
  "updatedAt": "2026-11-17T10:00:00.000Z",
  "deletedAt": null,
  "ownerId": "9c9c9c9c-0000-0000-0000-000000000002"
}
```

#### Response `CourseDetailResponseDTO` (`GET /api/v1/courses/{id}`):
```json
{
  "id": "9c9c9c9c-0000-0000-0000-000000000001",
  "courseCode": "IT3010",
  "name": "Cấu trúc dữ liệu và Giải thuật",
  "description": "Môn học cơ sở ngành CNTT",
  "visibility": "PUBLIC",
  "status": "PUBLISHED",
  "backgroundUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
  "thumbnailUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
  "credits": 3,
  "instructorName": "TS. Nguyễn Văn A",
  "instructorAvatar": "https://lh3.googleusercontent.com/a/...",
  "semester": "Học kỳ 1 (2026-2027)",
  "currentWeek": 8,
  "specialFeature": "Trợ lý AI Socratic & Đồ thị tri thức",
  "specialFeatureIcon": "Sparkles",
  "chaptersCount": 4,
  "lecturesCount": 11,
  "knowledgeNodesCount": 30,
  "quizzesCount": 5,
  "teachingProgress": 36,
  "hasAiTutor": true,
  "ownerId": "9c9c9c9c-0000-0000-0000-000000000002",
  "createdAt": "2026-11-17T10:00:00.000Z",
  "updatedAt": "2026-11-17T10:00:00.000Z",
  "deletedAt": null
}
```

#### Response `CourseMaterialItemDTO` (`GET /api/v1/courses/{courseId}/materials`):
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "courseId": "9c9c9c9c-0000-0000-0000-000000000001",
  "courseTitle": "Cấu trúc dữ liệu và Giải thuật",
  "lessonId": "4bb96f75-6828-4673-c4fd-3d074g77bgb7",
  "lessonTitle": "1.1 Ôn tập tiệm cận thời gian & không gian",
  "chapterId": "5cc07g86-7939-5784-d5ge-4e185h88chc8",
  "chapterTitle": "Chương 1: Tổng quan & Đánh giá độ phức tạp",
  "title": "Slide Chương 1.pdf",
  "description": "Tài liệu bài giảng tổng quan",
  "originalFileName": "slide-chuong-1.pdf",
  "fileType": "PDF",
  "mimeType": "application/pdf",
  "fileSizeBytes": 2516582,
  "fileSizeFormatted": "2.4 MB",
  "url": "https://drive.google.com/file/d/1g9b0p3.../view",
  "downloadUrl": "/api/v1/materials/3fa85f64-5717-4562-b3fc-2c963f66afa6/download",
  "isDownloadable": true,
  "uploadStatus": "READY",
  "aiIngestionStatus": "SUCCESS",
  "conceptsCount": 14,
  "ingestionJobId": "7dd18a92-1234-4567-89ab-cdef01234567",
  "draftRevisionId": "8ee29b03-2345-5678-9abc-def012345678",
  "aiErrorCode": null,
  "uploadedBy": "9c9c9c9c-0000-0000-0000-000000000002",
  "uploadedByName": "TS. Nguyễn Văn A",
  "createdAt": "2026-11-18T10:00:00.000Z",
  "updatedAt": "2026-11-18T10:00:00.000Z"
}
```
*(Giá trị `aiIngestionStatus` thực tế đọc từ `ingestion_jobs` & `material_publications`: `NOT_EXTRACTED` | `QUEUED` | `PROCESSING` | `AWAITING_REVIEW` | `SUCCESS` | `FAILED`).*

#### Response `CourseKnowledgeGraphResponseDTO` (`GET /api/v1/courses/{courseId}/knowledge-graph`):
```json
{
  "courseId": "9c9c9c9c-0000-0000-0000-000000000001",
  "courseTitle": "Cấu trúc dữ liệu và Giải thuật",
  "totalNodes": 2,
  "totalEdges": 1,
  "nodes": [
    {
      "id": "node-1",
      "label": "Độ phức tạp thuật toán",
      "level": "BEGINNER",
      "category": "Algorithms",
      "masteryPercent": 80,
      "status": "MASTERED",
      "prerequisites": [],
      "linkedLessonIds": ["4bb96f75-6828-4673-c4fd-3d074g77bgb7"]
    },
    {
      "id": "node-2",
      "label": "Ký pháp Big-O",
      "level": "BEGINNER",
      "category": "Complexity",
      "masteryPercent": 60,
      "status": "IN_PROGRESS",
      "prerequisites": ["node-1"],
      "linkedLessonIds": ["4bb96f75-6828-4673-c4fd-3d074g77bgb7"]
    }
  ],
  "edges": [
    {
      "source": "node-1",
      "target": "node-2",
      "relation": "PREREQUISITE"
    }
  ]
}
```

#### Response `UserCourseResponseDTO` (`GET /api/v1/courses/users/{userId}`):
```json
{
  "classId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "className": "D21CNPM01",
  "classCode": "D21CNPM01",
  "courseId": "9c9c9c9c-0000-0000-0000-000000000001",
  "name": "Cấu trúc dữ liệu và Giải thuật",
  "description": "Môn học cơ sở ngành CNTT",
  "backgroundUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
  "ownerId": "9c9c9c9c-0000-0000-0000-000000000002",
  "registeredAt": "2026-11-01T08:00:00"
}
```

---

## 5. Phân hệ Chương học, Bài học & Tài liệu học tập (Chapters, Lessons & Materials)

### 5.1. Chương học (Chapters)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả | Request Body / Query |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/courses/{courseId}/chapters` | `hasAuthority('COURSE_UPDATE')` | Tạo chương mới trong khóa học | `ChapterCreateRequestDTO` |
| **GET** | `/api/v1/courses/{courseId}/chapters` | `hasAuthority('COURSE_VIEW')` | Lấy danh sách chương của môn học | `?includeDeleted=false` |
| **GET** | `/api/v1/chapters/{chapterId}` | `hasAuthority('COURSE_VIEW')` | Chi tiết chương học | Path: `chapterId` |
| **PUT** | `/api/v1/chapters/{chapterId}` | `hasAuthority('COURSE_UPDATE')` | Cập nhật tiêu đề, mô tả chương | `ChapterUpdateRequestDTO` |
| **PATCH** | `/api/v1/chapters/{chapterId}/order` | `hasAuthority('COURSE_UPDATE')` | Đổi thứ tự hiển thị của chương | `ChapterUpdateOrderRequestDTO`: `{ "orderIndex": 2 }` |
| **DELETE** | `/api/v1/chapters/{chapterId}` | `hasAuthority('COURSE_UPDATE')` | Xóa chương học (xóa mềm) | Path: `chapterId` |
| **GET** | `/api/v1/courses/{courseId}/content` | `hasAuthority('COURSE_VIEW')` | Lấy toàn bộ cây nội dung (Chương + Bài học) | Trả về `CourseContentTreeResponseDTO` |

---

### 5.2. Bài học (Lessons)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả | Request Body / Query |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/chapters/{chapterId}/lessons` | `hasAuthority('COURSE_UPDATE')` | Tạo bài học mới trong chương | `LessonCreateRequestDTO` |
| **GET** | `/api/v1/chapters/{chapterId}/lessons` | `hasAuthority('COURSE_VIEW')` | Lấy danh sách bài học thuộc chương | `?includeDeleted=false` |
| **GET** | `/api/v1/lessons/{lessonId}` | `hasAuthority('COURSE_VIEW')` | Chi tiết bài học | Path: `lessonId` |
| **PUT** | `/api/v1/lessons/{lessonId}` | `hasAuthority('COURSE_UPDATE')` | Cập nhật nội dung bài học | `LessonUpdateRequestDTO` |
| **PATCH** | `/api/v1/lessons/{lessonId}/order` | `hasAuthority('COURSE_UPDATE')` | Cập nhật thứ tự bài học trong chương | `LessonUpdateOrderRequestDTO`: `{ "orderIndex": 3 }` |
| **DELETE** | `/api/v1/lessons/{lessonId}` | `hasAuthority('COURSE_UPDATE')` | Xóa bài học | Path: `lessonId` |

#### Payload `LessonCreateRequestDTO`:
```json
{
  "title": "Thuật toán tìm kiếm theo chiều sâu (DFS)",
  "content": "Nội dung bài học dạng Markdown hoặc HTML...",
  "lessonType": "MODULAR",
  "orderIndex": 1,
  "duration": 45
}
```
*(Giá trị `lessonType`: `VIDEO`, `TEXT`, `QUIZ`, `DOCUMENT`, `MODULAR`. Trong `GET /api/v1/courses/{courseId}/content`, mỗi bài học có thêm `contentMode`: `LEGACY` | `MODULAR` và `status` thực tế theo tiến độ người dùng: `NOT_STARTED` | `IN_PROGRESS` | `COMPLETED`).*

---

### 5.2.1. Modular Block-Based Lesson Workspace (Notion-style) & Tiến độ học tập (FE & BE Contract)

> **Quy tắc hiển thị chế độ Biên soạn (Editor Mode) phía Frontend:**
> Vì mọi tài khoản `ROLE_USER` trong DB đều có quyền `COURSE_UPDATE` ở tầng hệ thống, **FE không được** chỉ kiểm tra `COURSE_UPDATE` để hiện nút Biên soạn. Thay vào đó, FE dựa trực tiếp vào cờ **`canEdit`** do API `GET /api/v1/lessons/{lessonId}/blocks` trả về (hoặc kiểm tra `course.ownerId === currentUser.id || currentUser.role === 'ROLE_ADMIN'`).

#### Danh sách Endpoints & Ma trận Phân quyền 2 Tầng:

| Method | Endpoint | System RBAC (`@PreAuthorize`) | Ngữ cảnh Course / Class (Service Layer) | Mô tả & Payload |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/lessons/{lessonId}/blocks` | `hasAuthority('COURSE_VIEW')` | `ADMIN`, `course.owner`, môn `PUBLIC + PUBLISHED`, hoặc thành viên lớp có gán môn | Lấy toàn bộ blocks theo `orderIndex` tăng dần + `lessonProgress` + `studentState`. *(Nếu không phải `canEdit`, BE tự ẩn `correctIndex` và `explanation` của `QUIZ` chưa hoàn thành)* |
| **POST** | `/api/v1/lessons/{lessonId}/blocks` | `hasAuthority('COURSE_UPDATE')` | Chỉ `ROLE_ADMIN` hoặc `course.owner` | Chèn 1 block mới (`LessonBlockCreateRequestDTO`), tự tính `orderIndex` nếu truyền `prevBlockId`/`nextBlockId` |
| **PATCH** | `/api/v1/lessons/{lessonId}/blocks/{blockId}` | `hasAuthority('COURSE_UPDATE')` | Chỉ `ROLE_ADMIN` hoặc `course.owner` | Cập nhật `type`, `content`, `materialId`, `metadata` (có hỗ trợ `expectedVersion` chống ghi đè) |
| **PATCH** | `/api/v1/lessons/{lessonId}/blocks/{blockId}/reorder` | `hasAuthority('COURSE_UPDATE')` | Chỉ `ROLE_ADMIN` hoặc `course.owner` | Kéo-thả đổi vị trí (`orderIndex` hoặc `prevBlockId`/`nextBlockId`); tự rebalance về bội số `1000.0` nếu khoảng cách `< 1e-6` |
| **PATCH** | `/api/v1/lessons/{lessonId}/blocks/batch` | `hasAuthority('COURSE_UPDATE')` | Chỉ `ROLE_ADMIN` hoặc `course.owner` | Auto-save debounce 1000ms: tạo/cập nhật/xóa mềm hàng loạt block trong 1 transaction |
| **DELETE** | `/api/v1/lessons/{lessonId}/blocks/{blockId}` | `hasAuthority('COURSE_UPDATE')` | Chỉ `ROLE_ADMIN` hoặc `course.owner` | Xóa mềm 1 block (`deleted_at`) |
| **POST** | `/api/v1/lessons/{lessonId}/blocks/{blockId}/quiz-attempt` | `hasAuthority('LESSON_PROGRESS_UPDATE') or hasAuthority('COURSE_VIEW')` | Người dùng xem được bài học | Sinh viên nộp đáp án Inline Quiz → chấm điểm, lưu `lesson_block_progress`, cập nhật `lesson_progress` |
| **PATCH** | `/api/v1/lessons/{lessonId}/blocks/{blockId}/video-progress` | `hasAuthority('LESSON_PROGRESS_UPDATE') or hasAuthority('COURSE_VIEW')` | Người dùng xem được bài học | Lưu mốc giây xem video (`watchedSeconds`); đạt `>= 85%` tự đánh dấu hoàn thành block |
| **PUT** | `/api/v1/lessons/{lessonId}/progress` | `hasAuthority('LESSON_PROGRESS_UPDATE') or hasAuthority('COURSE_VIEW')` | Người dùng xem được bài học | Đánh dấu hoàn thành bài học dạng đọc (`TEXT`/`SLIDE`) hoặc lưu `lastAccessedBlockId` |

#### Chuẩn JSON `content` theo 8 loại Block chính (kèm `IMAGE`, `DIVIDER`):

| `type` | Cấu trúc `content` JSON | Ghi chú FE / BE |
| :--- | :--- | :--- |
| `HEADING` | `{ "level": 1 \| 2 \| 3, "text": "1. Nguyên lý bắt tay 3 bước" }` | Tự sinh Mục lục (TOC) |
| `TEXT` | `{ "markdown": "Công thức độ phức tạp $O(n \\log n)$..." }` | `MarkdownContent` + KaTeX |
| `CALLOUT` | `{ "variant": "INFO" \| "TIP" \| "WARNING" \| "THEOREM", "title": "Định lý", "markdown": "..." }` | Material 3 Alert surface |
| `VIDEO` | `{ "url": "https://...", "sourceType": "YOUTUBE" \| "DRIVE" \| "MP4", "durationSeconds": 620, "caption": "...", "chapters": [{ "timeSec": 135, "title": "Giới thiệu" }] }` | Nếu upload nội bộ, gắn thêm `materialId` |
| `SLIDE` | `{ "materialId": "uuid?", "url": "https://...", "fileName": "Chuong1.pdf", "totalPages": 24, "embedType": "PDF" \| "GOOGLE_SLIDES" }` | Khuyến nghị fallback `/api/v1/materials/{materialId}/download` |
| `CODE_SANDBOX` | `{ "language": "javascript" \| "python" \| "java" \| "cpp" \| "sql", "title": "Cài đặt QuickSort", "initialCode": "...", "expectedOutput": "...", "allowRun": true, "readOnly": false }` | JS chạy iframe `sandbox="allow-scripts"` |
| `QUIZ` | `{ "question": "JWT gồm mấy phần?", "options": ["2", "3", "4"], "correctIndex": 1, "explanation": "Header, Payload, Signature", "allowRetry": true }` | **BE ẩn `correctIndex` & `explanation`** ở `GET /blocks` với SV chưa hoàn thành |
| `DIAGRAM` | `{ "engine": "MERMAID" \| "VIS3D", "code": "flowchart TD...", "caption": "Sơ đồ luồng TCP" }` | `MermaidRenderer` / `Vis3dRenderer` |
| `IMAGE` / `DIVIDER` | `IMAGE`: `{ "url": "...", "caption": "..." }` · `DIVIDER`: `{}` | Mở rộng tương thích Notion |

#### Response `LessonBlocksWorkspaceResponseDTO` (`GET /api/v1/lessons/{lessonId}/blocks`):
```json
{
  "lessonId": "4bb96f75-6828-4673-c4fd-3d074g77bgb7",
  "lessonTitle": "1.1 Ôn tập tiệm cận thời gian & không gian",
  "contentMode": "MODULAR",
  "canEdit": true,
  "legacyContent": null,
  "rebalanced": false,
  "lessonProgress": {
    "lessonId": "4bb96f75-6828-4673-c4fd-3d074g77bgb7",
    "status": "IN_PROGRESS",
    "progressPercent": 50,
    "lastAccessedBlockId": "a1b2c3d4-0000-0000-0000-000000000001",
    "completedAt": null
  },
  "blocks": [
    {
      "id": "a1b2c3d4-0000-0000-0000-000000000001",
      "lessonId": "4bb96f75-6828-4673-c4fd-3d074g77bgb7",
      "type": "HEADING",
      "content": { "level": 2, "text": "Khái niệm Big-O" },
      "orderIndex": 1000.0,
      "materialId": null,
      "metadata": null,
      "version": 0,
      "studentState": null,
      "createdAt": "2026-11-18T21:00:00",
      "updatedAt": "2026-11-18T21:00:00"
    },
    {
      "id": "a1b2c3d4-0000-0000-0000-000000000002",
      "lessonId": "4bb96f75-6828-4673-c4fd-3d074g77bgb7",
      "type": "QUIZ",
      "content": {
        "question": "Độ phức tạp tìm kiếm nhị phân là?",
        "options": ["O(n)", "O(log n)", "O(n^2)"],
        "allowRetry": true
      },
      "orderIndex": 2000.0,
      "materialId": null,
      "metadata": null,
      "version": 0,
      "studentState": {
        "isCompleted": false,
        "interactionState": { "selectedIndex": 0, "isCorrect": false, "attempts": 1 }
      },
      "createdAt": "2026-11-18T21:00:00",
      "updatedAt": "2026-11-18T21:00:00"
    }
  ]
}
```

#### Payloads thao tác Block & Progress:
- **`POST /api/v1/lessons/{lessonId}/blocks`** (`LessonBlockCreateRequestDTO`):
  ```json
  {
    "type": "TEXT",
    "content": { "markdown": "Nội dung bài giảng..." },
    "prevBlockId": "a1b2c3d4-0000-0000-0000-000000000001",
    "nextBlockId": "a1b2c3d4-0000-0000-0000-000000000002"
  }
  ```
  *(Có thể truyền trực tiếp `orderIndex`, hoặc truyền `prevBlockId` / `nextBlockId` để BE tự tính trung bình cộng).*
- **`PATCH /api/v1/lessons/{lessonId}/blocks/{blockId}/reorder`** (`LessonBlockReorderRequestDTO`):
  ```json
  { "orderIndex": 1500.0 }
  ```
  *(Hoặc `{ "prevBlockId": "...", "nextBlockId": "..." }` — trả về `LessonBlocksWorkspaceResponseDTO` kèm `rebalanced: true|false`).*
- **`PATCH /api/v1/lessons/{lessonId}/blocks/batch`** (`LessonBlockBatchRequestDTO` — Auto-save debounce 1000ms):
  ```json
  {
    "upserts": [
      {
        "id": "a1b2c3d4-0000-0000-0000-000000000001",
        "type": "HEADING",
        "content": { "level": 2, "text": "Tiêu đề đã sửa" },
        "orderIndex": 1000.0,
        "expectedVersion": 0
      },
      {
        "type": "CALLOUT",
        "content": { "variant": "TIP", "title": "Mẹo nhớ nhanh", "markdown": "..." },
        "orderIndex": 2500.0
      }
    ],
    "deleteBlockIds": []
  }
  ```
- **`POST /api/v1/lessons/{lessonId}/blocks/{blockId}/quiz-attempt`**:
  - Request: `{ "selectedIndex": 1 }`
  - Response (`BlockQuizAttemptResponseDTO`):
    ```json
    {
      "blockId": "a1b2c3d4-0000-0000-0000-000000000002",
      "isCorrect": true,
      "selectedIndex": 1,
      "correctIndex": 1,
      "explanation": "Tìm kiếm nhị phân chia đôi mảng ở mỗi bước.",
      "lessonProgressPercent": 100,
      "lessonStatus": "COMPLETED"
    }
    ```
- **`PATCH /api/v1/lessons/{lessonId}/blocks/{blockId}/video-progress`**:
  - Request: `{ "watchedSeconds": 540, "durationSeconds": 620, "isCompleted": false }`
  - Response: `LessonProgressResponseDTO` (`status`, `progressPercent`, `lastAccessedBlockId`, `completedAt`).
- **`PUT /api/v1/lessons/{lessonId}/progress`**:
  - Request: `{ "isCompleted": true, "lastAccessedBlockId": "a1b2c3d4-0000-0000-0000-000000000001" }`

---

### 5.3. Tài liệu học tập đính kèm (Materials)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả | Định dạng dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/lessons/{lessonId}/materials` | `hasAuthority('COURSE_VIEW')` | Lấy danh sách tài liệu của bài học | Trả về `List<MaterialSummaryResponseDTO>` |
| **GET** | `/api/v1/courses/{courseId}/materials` | `hasAuthority('COURSE_VIEW')` | Lấy toàn bộ tài liệu học liệu của môn học (phân trang, lọc fileType, search) | Trả về `PageResponse<CourseMaterialItemDTO>` (`?fileType=&search=&page=0&size=20`) |
| **GET** | `/api/v1/materials/{materialId}` | `hasAuthority('COURSE_VIEW')` | Xem chi tiết 1 tài liệu | Trả về `MaterialResponseDTO` |
| **POST** | `/api/v1/lessons/{lessonId}/materials` | `hasAuthority('MATERIAL_UPLOAD')` | Upload tài liệu đính kèm bài học | `multipart/form-data`: `file`, `title`, `description`, `isDownloadable` |
| **POST** | `/api/v1/courses/{courseId}/materials` | `hasAuthority('MATERIAL_UPLOAD')` | Upload tài liệu trực tiếp ở cấp môn học (không thuộc bài học) | `multipart/form-data`: `file`, `title`, `description`, `isDownloadable` |
| **POST** | `/api/v1/materials/{materialId}/extract` | `hasAuthority('MATERIAL_UPLOAD') or hasAuthority('KNOWLEDGE_GRAPH_EDIT')` | Kéo file từ Google Drive vào pipeline `ingestion_jobs` → FastAPI bóc tách tri thức (`?autoPublish=true\|false`, mặc định `true`) | Path: `materialId` (Trả về `CourseMaterialItemDTO` với `aiIngestionStatus = QUEUED \| PROCESSING` và `ingestionJobId`) |
| **PUT** | `/api/v1/materials/{materialId}` | `hasAuthority('MATERIAL_UPLOAD')` | Sửa thông tin tài liệu | `MaterialUpdateRequestDTO`: `{ "title": "...", "description": "..." }` |
| **PATCH** | `/api/v1/materials/{materialId}/downloadable` | `hasAuthority('MATERIAL_UPLOAD')` | Bật/tắt quyền cho phép học sinh tải xuống | `MaterialUpdateDownloadableRequestDTO`: `{ "isDownloadable": true }` |
| **PUT** | `/api/v1/materials/{materialId}/file` | `hasAuthority('MATERIAL_UPLOAD')` | Thay thế tệp đính kèm mới | `multipart/form-data`: `file` |
| **GET** | `/api/v1/materials/{materialId}/download` | `hasAuthority('COURSE_VIEW')` | Tải xuống tệp tài liệu trực tiếp | Binary stream kèm Content-Disposition Header |
| **DELETE** | `/api/v1/materials/{materialId}` | `hasAuthority('MATERIAL_UPLOAD')` | Xóa tài liệu | Path: `materialId` |

---

## 6. Phân hệ Lớp học, Thành viên & Gán Môn học (Classes, Members & ClassCourses)

Base path: `/api/v1/classes`

### 6.1. Quản trị Lớp học (Class Management)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/classes` | `hasAuthority('CLASS_CREATE')` | Tạo lớp học mới (`ClassCreateRequestDTO`) |
| **GET** | `/api/v1/classes` hoặc `/listClasses` | `hasAuthority('CLASS_VIEW')` | Lấy danh sách lớp học (`?search=&visibility=&major=&semester=&role=&sort=&page=0&size=10`) |
| **GET** | `/api/v1/classes/kpi-summary` | `hasAuthority('CLASS_VIEW')` | Thống kê KPI tổng quan lớp học (`activeClassesCount`, `totalStudentsCount`, `pendingRequestsCount`, `ungradedAssignmentsCount`) |
| **GET** | `/api/v1/classes/{id}` | `hasAuthority('CLASS_VIEW')` | Chi tiết lớp học (`ClassResponseDTO` có thêm `enrolledCount`, `isCodeClosed`, `semester`, `teachingRole`, `instructor`) |
| **GET** | `/api/v1/classes/{id}/stats` | `hasAuthority('CLASS_VIEW')` | Thống kê số lượng môn học, học viên, giảng viên của lớp (`coursesCount`, `studentsCount`, `teachersCount`) |
| **POST** | `/api/v1/classes/{id}/regenerate-code` | `hasAuthority('CLASS_UPDATE')` | Làm mới / sinh lại mã tham gia lớp học (`RegenerateCodeResponseDTO`) |
| **PUT** | `/api/v1/classes/{id}` | `hasAuthority('CLASS_UPDATE')` | Cập nhật thông tin lớp học (`UpdateClassRequestDTO`) |
| **PATCH** | `/api/v1/classes/{id}/code-status` | `hasAuthority('CLASS_UPDATE')` | Bật/Tắt tính năng tham gia bằng mã lớp (`?isClosed=true|false`) |
| **PATCH** | `/api/v1/classes/{id}/owner` | `hasAuthority('CLASS_UPDATE')` | Chuyển quyền chủ sở hữu lớp (`ChangeClassOwnerRequestDTO`) |
| **DELETE** | `/api/v1/classes/{id}` hoặc `/{id}/soft` | `hasAuthority('CLASS_UPDATE')` | Xóa mềm lớp học (`deleted_at`) |
| **PATCH** | `/api/v1/classes/{id}/restore` | `hasAuthority('SYSTEM_CONFIG')` | Khôi phục lớp học đã bị xóa mềm |

#### Payload `ClassCreateRequestDTO`:
```json
{
  "name": "D21CNPM01",
  "title": "Lớp Công nghệ phần mềm 01 - Khóa 2021",
  "description": "Lớp học kỳ 1 năm 2026-2027",
  "academicYear": "2021-2026",
  "major": "Công nghệ thông tin",
  "maxCapacity": 60,
  "visibility": "PUBLIC",
  "requireApproval": true,
  "isCodeActive": true,
  "thumbnailUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
  "backgroundUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
  "startAt": "2026-09-01T07:00:00",
  "endAt": "2027-01-15T18:00:00"
}
```
*(Ghi chú: `requireApproval` và `isCodeActive` mặc định là `true` nếu không truyền; `visibility` nhận `PUBLIC` hoặc `PRIVATE`, mặc định là `PUBLIC`).*

#### Payload `UpdateClassRequestDTO`:
```json
{
  "name": "D21CNPM01 - Cập nhật",
  "title": "Lớp Công nghệ phần mềm 01",
  "description": "Cập nhật mô tả lớp học...",
  "academicYear": "2026-2027",
  "major": "Công nghệ phần mềm",
  "maxCapacity": 75,
  "visibility": "PUBLIC",
  "requireApproval": true,
  "isCodeActive": true,
  "thumbnailUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
  "backgroundUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
  "startAt": "2026-09-01T07:00:00",
  "endAt": "2027-01-15T18:00:00"
}
```

#### Response `ClassKpiSummaryDTO` (`GET /api/v1/classes/kpi-summary`):
```json
{
  "activeClassesCount": 8,
  "totalStudentsCount": 342,
  "pendingRequestsCount": 14,
  "ungradedAssignmentsCount": 27
}
```

#### Response `ClassBannerStatsDTO` (`GET /api/v1/classes/{id}/stats`):
```json
{
  "coursesCount": 5,
  "studentsCount": 42,
  "teachersCount": 2
}
```

#### Response `RegenerateCodeResponseDTO` (`POST /api/v1/classes/{id}/regenerate-code`):
```json
{
  "classId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "newEnrollmentKey": "K8X29PLA"
}
```

#### Response `ClassResponseDTO` (Mở rộng đầy đủ metadata):
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "D21CNPM01",
  "title": "Lớp Công nghệ phần mềm 01",
  "description": "Lớp học kỳ 1 năm 2026-2027",
  "academicYear": "2026-2027",
  "major": "Công nghệ phần mềm",
  "maxCapacity": 60,
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  "thumbnailUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
  "backgroundUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
  "classCode": "K8X29PLA",
  "requireApproval": true,
  "isCodeActive": true,
  "isCodeClosed": false,
  "isArchived": false,
  "enrolledCount": 42,
  "semester": "2026-2027",
  "teachingRole": "OWNER",
  "instructor": {
    "id": "11111111-2222-3333-4444-555555555555",
    "fullName": "Nguyễn Văn Chủ Nhiệm",
    "email": "teacher@ilms.edu.vn",
    "avatarUrl": "https://lh3.googleusercontent.com/d/1g9b0p3..."
  },
  "createdAt": "2026-11-01T08:00:00.000Z",
  "updatedAt": "2026-11-14T08:30:00.000Z"
}
```

---

### 6.2. Thành viên & Lời mời tham gia lớp (Class Members & Invitations)

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/members` | `hasAuthority('CLASS_VIEW')` | Danh sách thành viên lớp (`?role=&status=&search=&page=0&size=10`) |
| **GET** | `/api/v1/classes/{classId}/members/{userId}` | `hasAuthority('CLASS_VIEW')` | Chi tiết 1 thành viên trong lớp |
| **POST** | `/api/v1/classes/join-by-code` | `isAuthenticated()` | Học sinh tự tham gia lớp bằng mã: `{ "classCode": "AB12CD" }` |
| **POST** | `/api/v1/classes/{classId}/members/invite-by-email` | `hasAuthority('CLASS_UPDATE')` | Giảng viên mời qua email: `{ "email": "student@gmail.com", "role": "STUDENT" }` |
| **POST** | `/api/v1/classes/invitations/accept` | `isAuthenticated()` | Chấp nhận lời mời tham gia: `{ "token": "uuid-token" }` |
| **POST** | `/api/v1/classes/{classId}/approve` | `hasAuthority('CLASS_UPDATE')` | Duyệt học viên vào lớp: `{ "userId": "uuid..." }` |
| **POST** | `/api/v1/classes/{classId}/reject` | `hasAuthority('CLASS_UPDATE')` | Từ chối yêu cầu tham gia lớp học: `{ "userId": "uuid...", "reason": "Lý do từ chối" }` |
| **PATCH** | `/api/v1/classes/{classId}/members/{userId}/role` | `hasAuthority('CLASS_UPDATE')` | Thay đổi role trong lớp (`TEACHER` hoặc `STUDENT`): `{ "role": "TEACHER" }` |
| **DELETE** | `/api/v1/classes/{classId}/members/{userId}` | `hasAuthority('CLASS_UPDATE')` | Xóa thành viên ra khỏi lớp |
| **POST** | `/api/v1/classes/{classId}/leave` | `isAuthenticated()` | Học sinh tự rời khỏi lớp học |

#### Payload `RejectClassMemberRequestDTO`:
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "reason": "Hồ sơ chưa đủ điều kiện nhập học vào lớp chuyên đề này"
}
```

---

### 6.3. Gán Môn học vào Lớp (`/api/v1/classes/{classId}/courses`)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/courses` | `hasAuthority('CLASS_VIEW')` | Danh sách môn học được giảng dạy trong lớp (`?status=&semester=&page=0&size=10`). Trả về `ClassCourseResponseDTO` gồm `credits` và `assignedTeacher` (`UserSummaryDTO`) |
| **GET** | `/api/v1/classes/{classId}/courses/available` | `hasAuthority('CLASS_VIEW')` | Danh sách môn học khả dụng chưa được gán vào lớp (`?search=&page=0&size=10`) |
| **POST** | `/api/v1/classes/{classId}/courses` | `hasAuthority('CLASS_UPDATE')` or `hasAuthority('SYSTEM_CONFIG')` | Gán 1 môn học vào lớp (`AssignCourseToClassRequestDTO`) |
| **POST** | `/api/v1/classes/{classId}/courses/batch` | `hasAuthority('CLASS_UPDATE')` or `hasAuthority('SYSTEM_CONFIG')` | Gán hàng loạt môn học vào lớp (`BatchAssignCoursesRequestDTO`) |
| **PUT** | `/api/v1/classes/{classId}/courses/{courseId}` | `hasAuthority('CLASS_UPDATE')` or `hasAuthority('SYSTEM_CONFIG')` | Cập nhật cấu hình môn học trong lớp (`UpdateClassCourseMetadataRequestDTO`) |
| **DELETE** | `/api/v1/classes/{classId}/courses/{courseId}` | `hasAuthority('CLASS_UPDATE')` or `hasAuthority('SYSTEM_CONFIG')` | Gỡ bỏ 1 môn học khỏi lớp |
| **DELETE** | `/api/v1/classes/{classId}/courses/batch` | `hasAuthority('CLASS_UPDATE')` or `hasAuthority('SYSTEM_CONFIG')` | Gỡ bỏ hàng loạt môn học khỏi lớp (`BatchRemoveCoursesRequestDTO`) |

#### Payload `ClassCourseResponseDTO`:
```json
{
  "classId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "className": "D21CNPM01",
  "courseId": "8fa85f64-5717-4562-b3fc-2c963f66afa8",
  "courseCode": "INT1306",
  "courseTitle": "Cấu trúc dữ liệu và Giải thuật",
  "backgroundUrl": "https://lh3.googleusercontent.com/d/1XyZ...",
  "credits": 3,
  "teacherId": "11111111-2222-3333-4444-555555555555",
  "teacherName": "Trần Văn Giảng Viên",
  "assignedTeacher": {
    "id": "11111111-2222-3333-4444-555555555555",
    "fullName": "Trần Văn Giảng Viên",
    "email": "giangvien@ilms.edu.vn",
    "avatarUrl": "https://lh3.googleusercontent.com/d/1g9b0p3..."
  },
  "semester": "HK1",
  "academicYear": "2026-2027",
  "startDate": "2026-09-05",
  "endDate": "2027-01-15",
  "status": "ACTIVE",
  "assignedAt": "2026-09-01T10:00:00.000Z"
}
```

---

## 7. Phân hệ Phòng học, Ca học & Điểm danh (Rooms, Lesson Sessions & Attendance)

### 7.1. Phòng học (`/api/v1/rooms`)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/rooms` | `hasAuthority('SYSTEM_CONFIG')` or `hasAuthority('CLASS_VIEW')` | Lấy danh sách tất cả phòng học |
| **POST** | `/api/v1/rooms` | `hasAuthority('SYSTEM_CONFIG')` | Tạo phòng học mới: `{ "name": "Lab 302", "type": "LAB", "description": "..." }` |
| **PUT** | `/api/v1/rooms/{roomId}` | `hasAuthority('SYSTEM_CONFIG')` | Cập nhật thông tin phòng học |
| **DELETE** | `/api/v1/rooms/{roomId}` | `hasAuthority('SYSTEM_CONFIG')` | Xóa phòng học |

---

### 7.2. Kíp học chuẩn (`/api/v1/time-slots`)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả | Request Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/time-slots` | `hasAuthority('CLASS_VIEW') or hasAuthority('SYSTEM_CONFIG')` | Lấy danh sách các kíp học chuẩn xếp theo giờ bắt đầu | None |
| **POST** | `/api/v1/time-slots` | `hasAuthority('SYSTEM_CONFIG')` | Tạo kíp học mới (Admin) | `TimeSlotRequestDTO` |
| **PUT** | `/api/v1/time-slots/{id}` | `hasAuthority('SYSTEM_CONFIG')` | Cập nhật kíp học | `TimeSlotRequestDTO` |
| **DELETE** | `/api/v1/time-slots/{id}` | `hasAuthority('SYSTEM_CONFIG')` | Xóa kíp học (chặn nếu đang có ca học dùng) | Path: `id` |

---

### 7.3. Ca học & Điểm danh (`/api/v1/classes/{classId}/lesson-sessions`)
*(Hỗ trợ cả alias URL: `/api/v1/classes/{classId}/lessonSessions`)*

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/lesson-sessions` | `hasAuthority('CLASS_VIEW')` | Lấy danh sách ca học của lớp (lọc `?startDate=&endDate=&courseId=`) |
| **POST** | `/api/v1/classes/{classId}/lesson-sessions` | `hasAuthority('ATTENDANCE_MANAGE')` | Tạo lịch 1 ca học mới cho lớp (`LessonSessionCreateDTO`) |
| **POST** | `/api/v1/classes/{classId}/lesson-sessions/recurring` | `hasAuthority('ATTENDANCE_MANAGE')` | Lên lịch định kỳ hàng loạt theo các thứ trong tuần (`RecurringLessonSessionRequestDTO`) |
| **PUT** | `/api/v1/classes/{classId}/lesson-sessions/{lessonSessionId}` | `hasAuthority('ATTENDANCE_MANAGE')` | Cập nhật ca học (dời ngày, đổi phòng, đổi giờ, đổi môn/GV) |
| **DELETE** | `/api/v1/classes/{classId}/lesson-sessions/{lessonSessionId}` | `hasAuthority('ATTENDANCE_MANAGE')` | Xóa ca học (`?force=true` nếu muốn xóa ca đã có điểm danh) |
| **GET** | `/api/v1/classes/{classId}/lesson-sessions/{lessonSessionId}/attendances` | `hasAuthority('CLASS_VIEW')` | Lấy danh sách bảng điểm danh của ca học |
| **POST** | `/api/v1/classes/{classId}/lesson-sessions/{lessonSessionId}/attendances` | `hasAuthority('ATTENDANCE_MANAGE')` | Điểm danh hàng loạt học sinh (`BatchAttendanceRequestDTO`) |

#### Payload `LessonSessionCreateDTO`:
```json
{
  "roomId": "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a01",
  "courseId": "eeeeeeee-eeee-eeee-ffff-ffffffffffff",
  "teacherId": "cccccccc-cccc-cccc-dddd-dddddddddddd",
  "timeSlotId": "2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a01",
  "sessionDate": "2026-11-20",
  "startTime": "07:00:00",
  "endTime": "08:50:00",
  "startShift": 1,
  "endShift": 2,
  "note": "Học thực hành lập trình mạng Socket"
}
```

#### Payload `RecurringLessonSessionRequestDTO`:
```json
{
  "roomId": "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a01",
  "courseId": "eeeeeeee-eeee-eeee-ffff-ffffffffffff",
  "teacherId": "cccccccc-cccc-cccc-dddd-dddddddddddd",
  "timeSlotId": "2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a01",
  "startDate": "2026-11-20",
  "endDate": "2026-12-30",
  "daysOfWeek": ["MONDAY", "THURSDAY"],
  "skipConflicts": false,
  "note": "Lịch học lý thuyết định kỳ"
}
```

#### Response `LessonSessionResponseDTO` (Chi tiết ca học lớp):
```json
{
  "classId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lessonSessionId": "7bb18a92-1234-4567-89ab-cdef01234567",
  "classCode": "D21CNPM01",
  "className": "Lớp Công nghệ phần mềm 01",
  "courseId": "eeeeeeee-eeee-eeee-ffff-ffffffffffff",
  "courseCode": "INT1306",
  "courseName": "Cấu trúc dữ liệu và Giải thuật",
  "teacherId": "cccccccc-cccc-cccc-dddd-dddddddddddd",
  "teacherName": "Trần Văn Giảng Viên",
  "roomId": "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a01",
  "roomName": "Lab 302",
  "timeSlotId": "2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a01",
  "timeSlotName": "Kíp 1",
  "sessionDate": "2026-11-20",
  "startShift": 1,
  "endShift": 2,
  "startTime": "07:00:00",
  "endTime": "08:50:00",
  "note": "Học thực hành lập trình mạng Socket (hoặc Lịch học bù)"
}
```

#### Response `RecurringLessonSessionResponseDTO`:
```json
{
  "createdCount": 12,
  "skippedCount": 1,
  "createdSessions": [
    {
      "lessonSessionId": "7bb18a92-1234-4567-89ab-cdef01234567",
      "sessionDate": "2026-11-24",
      "startTime": "07:00:00",
      "endTime": "08:50:00"
    }
  ],
  "skippedConflicts": [
    {
      "sessionDate": "2026-12-01",
      "conflictCode": "ROOM_SCHEDULE_CONFLICT",
      "reason": "Phòng Lab 302 đã có lớp khác đăng ký vào khung giờ này"
    }
  ]
}
```

> [!NOTE]
> **Quy tắc Nghiệp vụ Thời khóa biểu & Xếp lịch học:**
> 1. **Lịch học bù / Buổi học phát sinh:** Giảng viên gọi `POST /api/v1/classes/{classId}/lesson-sessions` để thêm 1 ca học lẻ vào ngày bất kỳ. Hệ thống sẽ tự động đồng bộ vào thời khóa biểu lớp và thời khóa biểu cá nhân của toàn bộ học viên trong lớp.
> 2. **Xóa ca học:** Giảng viên gọi `DELETE /api/v1/classes/{classId}/lesson-sessions/{lessonSessionId}`. Nếu ca học đã phát sinh điểm danh, hệ thống sẽ trả về lỗi `LESSON_SESSION_HAS_ATTENDANCES`. Để xóa bắt buộc (xóa ca kèm xóa toàn bộ dữ liệu điểm danh đã nhập), truyền query parameter `?force=true`.

#### Payload `BatchAttendanceRequestDTO`:
```json
{
  "attendances": [
    {
      "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "status": "PRESENT",
      "note": "Có mặt đúng giờ"
    },
    {
      "studentId": "4bb96f75-6828-4673-c4fd-3d074g77bgb7",
      "status": "LATE",
      "note": "Đi muộn 15 phút"
    }
  ]
}
```
*(Giá trị `status`: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).*

---

## 8. Bảng tin Lớp học & Thông báo Realtime SSE (Announcements)

Base path: `/api/v1/classes/{classId}/announcements`

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/announcements` | `hasAuthority('CLASS_VIEW')` | Danh sách thông báo lớp (`?page=0&size=10`) |
| **POST** | `/api/v1/classes/{classId}/announcements` | `hasAuthority('CLASS_UPDATE')` | Đăng thông báo mới (`AnnouncementCreateRequestDTO`) |
| **PUT** | `/api/v1/classes/{classId}/announcements/{announcementId}` | `hasAuthority('CLASS_UPDATE')` | Chỉnh sửa thông báo (`AnnouncementUpdateRequestDTO`) |
| **DELETE** | `/api/v1/classes/{classId}/announcements/{announcementId}` | `hasAuthority('CLASS_UPDATE')` | Xóa thông báo (Tác giả hoặc Chủ nhiệm lớp / Admin) |
| **PATCH** | `/api/v1/classes/{classId}/announcements/{announcementId}/pin` | `hasAuthority('CLASS_UPDATE')` | Ghim hoặc bỏ ghim thông báo (`?pin=true|false`) |
| **GET** | `/api/v1/classes/{classId}/announcements/stream` | `hasAuthority('CLASS_VIEW')` | **SSE Stream (Realtime):** Luồng Server-Sent Events nhận thông báo mới |

#### Payload `AnnouncementCreateRequestDTO`:
```json
{
  "title": "Nhắc nhở: Hạn nộp Bài tập lớn tuần 10",
  "content": "Các nhóm chú ý nộp báo cáo đúng 23h59 Chủ nhật trên hệ thống."
}
```

#### Payload `AnnouncementUpdateRequestDTO`:
```json
{
  "title": "Nhắc nhở cập nhật: Hạn nộp Bài tập lớn tuần 10",
  "content": "Các nhóm chú ý nộp báo cáo đã gia hạn đến 12h00 Thứ Hai.",
  "isPinned": true
}
```

---

## 9. Ngân hàng Câu hỏi & Khái niệm Kiến thức (Question Bank & Concepts)

### 9.1. Khái niệm Kiến thức (`/api/v1/question-concepts`)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/question-concepts` | `hasAuthority('QUESTION_BANK_MANAGE')` or `hasAuthority('COURSE_VIEW')` | Danh sách khái niệm (`?keyword=&questionId=`) |
| **GET** | `/api/v1/question-concepts/{id}` | `hasAuthority('QUESTION_BANK_MANAGE')` or `hasAuthority('COURSE_VIEW')` | Xem chi tiết khái niệm |
| **POST** | `/api/v1/question-concepts` | `hasAuthority('SYSTEM_CONFIG')` | Tạo khái niệm mới (`QuestionConceptRequestDTO`) |
| **PUT** | `/api/v1/question-concepts/{id}` | `hasAuthority('SYSTEM_CONFIG')` | Cập nhật khái niệm |
| **DELETE** | `/api/v1/question-concepts/{id}` | `hasAuthority('SYSTEM_CONFIG')` | Xóa khái niệm |

---

### 9.2. Ngân hàng Câu hỏi (`/api/v1/questions`)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/questions` | `hasAuthority('QUESTION_BANK_MANAGE')` or `hasAuthority('COURSE_VIEW')` | Tìm kiếm câu hỏi (`?search=&difficultyLevel=&conceptId=&page=1&size=10&sort=createdAt,desc`) |
| **GET** | `/api/v1/questions/{id}` | `hasAuthority('QUESTION_BANK_MANAGE')` or `hasAuthority('COURSE_VIEW')` | Xem chi tiết câu hỏi kèm danh sách đáp án |
| **POST** | `/api/v1/questions` | `hasAuthority('QUESTION_BANK_MANAGE')` | Tạo câu hỏi mới (`QuestionRequestDTO`) |
| **PUT** | `/api/v1/questions/{id}` | `hasAuthority('QUESTION_BANK_MANAGE')` | Cập nhật nội dung câu hỏi và đáp án |
| **DELETE** | `/api/v1/questions/{id}` | `hasAuthority('QUESTION_BANK_MANAGE')` | Xóa câu hỏi khỏi ngân hàng |

#### Payload `QuestionRequestDTO`:
```json
{
  "content": "Trong cơ sở dữ liệu quan hệ, dạng chuẩn BCNF khắc phục nhược điểm nào của chuẩn 3NF?",
  "questionType": "SINGLE_CHOICE",
  "difficultyLevel": "MEDIUM",
  "explanation": "BCNF loại bỏ triệt để các phụ thuộc hàm mà vế trái không phải là siêu khóa.",
  "answers": [
    { "content": "Phụ thuộc hàm vào một phần của khóa chính", "isCorrect": false },
    { "content": "Phụ thuộc hàm giữa các thuộc tính khóa", "isCorrect": true },
    { "content": "Thuộc tính đa trị", "isCorrect": false }
  ],
  "conceptIds": ["9c9c9c9c-0000-0000-0000-000000000010"]
}
```
*(Giá trị `questionType`: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `ESSAY`. Giá trị `difficultyLevel`: `EASY`, `MEDIUM`, `HARD`).*

---

## 10. Đề kiểm tra Trắc nghiệm & Làm bài (Quizzes & Quiz Play)

Base path: `/api/v1/quizzes`

### 10.1. Quản lý Đề kiểm tra (Quiz Management)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/quizzes` | `hasAuthority('CLASS_VIEW')` | Lấy danh sách bài kiểm tra (`?classId=&page=0&size=10`) |
| **GET** | `/api/v1/quizzes/{id}` | `hasAuthority('CLASS_VIEW')` | Chi tiết cấu hình bài quiz |
| **POST** | `/api/v1/quizzes` | `hasAuthority('ASSESSMENT_MANAGE')` | Tạo bài kiểm tra mới (`QuizRequestDTO`) |
| **PUT** | `/api/v1/quizzes/{id}` | `hasAuthority('ASSESSMENT_MANAGE')` | Cập nhật cấu hình bài kiểm tra |
| **DELETE** | `/api/v1/quizzes/{id}` | `hasAuthority('ASSESSMENT_MANAGE')` | Xóa bài kiểm tra |
| **POST** | `/api/v1/quizzes/{id}/questions` | `hasAuthority('ASSESSMENT_MANAGE')` | Thêm câu hỏi vào đề: `{ "questionId": "uuid...", "point": 1.0, "orderIndex": 1 }` |
| **DELETE** | `/api/v1/quizzes/{id}/questions/{questionId}` | `hasAuthority('ASSESSMENT_MANAGE')` | Xóa câu hỏi khỏi đề kiểm tra |

#### Payload `QuizRequestDTO`:
```json
{
  "classId": "9c9c9c9c-0000-0000-0000-000000000001",
  "title": "Kiểm tra 15 phút: Chuẩn hóa CSDL",
  "description": "Làm bài trắc nghiệm 10 câu",
  "durationMinutes": 15,
  "maxAttempts": 2,
  "shuffleQuestions": true,
  "shuffleAnswers": true,
  "startTime": "2026-11-20T08:00:00Z",
  "endTime": "2026-11-20T23:59:59Z"
}
```

---

### 10.2. Tham gia Làm bài Trắc nghiệm (Quiz Play & Attempts)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/quizzes/{id}/play` | `hasAuthority('CLASS_VIEW')` | Lấy đề thi thực tế (kèm câu hỏi & đáp án đã xáo trộn) |
| **POST** | `/api/v1/quizzes/{id}/attempts` | `hasAuthority('SUBMISSION_CREATE')` | **Bắt đầu lượt làm bài mới** (Tạo bản ghi `IN_PROGRESS`) |
| **POST** | `/api/v1/quizzes/{id}/attempts/{attemptId}/submit` | `hasAuthority('SUBMISSION_CREATE')` | **Nộp bài và chấm điểm tự động** (Khóa bi quan chống double submit) |
| **GET** | `/api/v1/quizzes/{id}/attempts/{attemptId}/result` | `hasAuthority('CLASS_VIEW')` or `hasAuthority('ASSESSMENT_MANAGE')` | Xem kết quả chi tiết, điểm số và giải thích |

#### Payload nộp bài `QuizSubmitRequestDTO`:
```json
{
  "answers": [
    {
      "questionId": "9c9c9c9c-0000-0000-0000-000000000021",
      "selectedAnswerIds": ["9c9c9c9c-0000-0000-0000-000000000031"]
    }
  ]
}
```

---

## 11. Bài tập, Nộp bài & Chấm điểm (Assignments, Submissions & Gradings)

### 11.1. Bài tập về nhà (Assignments)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/assignments` | `hasAuthority('CLASS_VIEW')` | Danh sách bài tập của lớp (`?lessonId=&search=&page=0&size=10`) |
| **GET** | `/api/v1/assignments/{id}` | `hasAuthority('CLASS_VIEW')` | Xem chi tiết bài tập |
| **POST** | `/api/v1/classes/{classId}/assignments` | `hasAuthority('ASSESSMENT_MANAGE')` | Giao bài tập mới (`AssignmentRequestDTO`) |
| **PUT / PATCH** | `/api/v1/assignments/{id}` | `hasAuthority('ASSESSMENT_MANAGE')` | Cập nhật thông tin bài tập |
| **DELETE** | `/api/v1/assignments/{id}` | `hasAuthority('ASSESSMENT_MANAGE')` | Xóa bài tập |

#### Payload `AssignmentRequestDTO`:
```json
{
  "courseId": "9c9c9c9c-0000-0000-0000-000000000001",
  "lessonId": "9c9c9c9c-0000-0000-0000-000000000003",
  "title": "Bài tập lớn: Thiết kế CSDL Quản lý bán hàng",
  "description": "Viết báo cáo phân tích lược đồ quan hệ và chuẩn hóa BCNF",
  "dueDate": "2026-11-30T23:59:59Z",
  "fileAttachmentUrl": "https://drive.google.com/file/d/1g9b0p3.../view"
}
```

---

### 11.2. Nộp bài tập (Submissions)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/assignments/{assignmentId}/submissions` | `hasAuthority('ASSESSMENT_MANAGE')` | Giáo viên xem danh sách bài nộp (`?status=&search=&page=0&size=10`) |
| **GET** | `/api/v1/assignments/{assignmentId}/my-submission` | `hasAuthority('CLASS_VIEW')` | Học sinh xem bài nộp của chính mình |
| **GET** | `/api/v1/submissions/{id}` | `hasAuthority('CLASS_VIEW')` or `hasAuthority('ASSESSMENT_MANAGE')` | Xem chi tiết một bài nộp |
| **POST** | `/api/v1/assignments/{assignmentId}/submissions` | `hasAuthority('SUBMISSION_CREATE')` | Học sinh nộp bài tập (`SubmissionRequestDTO`) |
| **PUT / PATCH** | `/api/v1/assignments/{assignmentId}/submissions` | `hasAuthority('SUBMISSION_CREATE')` | Chỉnh sửa/Nộp lại bài tập |
| **PATCH** | `/api/v1/submissions/{id}/grade` | `hasAuthority('ASSESSMENT_MANAGE')` | Chấm điểm bài nộp (`SubmissionGradeRequestDTO`) |
| **POST** | `/api/v1/assignments/{assignmentId}/submissions/grade/batch` | `hasAuthority('ASSESSMENT_MANAGE')` | Chấm điểm hàng loạt học sinh (`BatchGradeSubmissionsRequestDTO`) |
| **DELETE** | `/api/v1/submissions/{id}` | `isAuthenticated()` | Xóa bài nộp |

#### Payload `SubmissionRequestDTO`:
```json
{
  "content": "Kính gửi thầy cô link GitHub repo và file báo cáo PDF đính kèm.",
  "attachmentUrls": [
    "https://drive.google.com/file/d/1g9b0p3.../view"
  ]
}
```

---

### 11.3. Phiếu Chấm điểm Độc lập (Gradings)

Base path: `/api/v1/gradings`

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/submissions/{submissionId}/grading` | `hasAuthority('ASSESSMENT_MANAGE')` | Tạo phiếu chấm điểm mới |
| **GET** | `/api/v1/submissions/{submissionId}/grading` | `hasAuthority('CLASS_VIEW')` or `hasAuthority('ASSESSMENT_MANAGE')` | Lấy phiếu chấm điểm theo bài nộp |
| **GET** | `/api/v1/gradings/{id}` | `hasAuthority('CLASS_VIEW')` or `hasAuthority('ASSESSMENT_MANAGE')` | Xem chi tiết phiếu chấm điểm |
| **PUT / PATCH** | `/api/v1/gradings/{id}` | `hasAuthority('ASSESSMENT_MANAGE')` | Cập nhật điểm và nhận xét |
| **POST** | `/api/v1/gradings/batch` | `isAuthenticated()` | Nhập điểm hàng loạt (`BatchCreateGradingsRequestDTO`) |
| **DELETE** | `/api/v1/gradings/{id}` | `isAuthenticated()` | Xóa bản ghi điểm |

---

## 12. Bảng điểm Tổng hợp Lớp học (Grade Reports)

Base path: `/api/v1/classes/{classId}/grade-reports`

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/grade-reports` | `hasAuthority('ASSESSMENT_MANAGE')` | Giáo viên lấy danh sách bảng điểm tổng hợp của lớp (`?search=&page=0&size=10`) |
| **GET** | `/api/v1/classes/{classId}/grade-reports/me` | `hasAuthority('CLASS_VIEW')` | Học sinh tự xem bảng điểm cá nhân của mình trong lớp |
| **GET** | `/api/v1/classes/{classId}/grade-reports/users/{studentId}` | `hasAuthority('ASSESSMENT_MANAGE')` | Giáo viên xem chi tiết bảng điểm của một học sinh |
| **POST** | `/api/v1/classes/{classId}/grade-reports` | `hasAuthority('ASSESSMENT_MANAGE')` | Tạo bảng điểm cho học sinh (`GradeReportRequestDTO`) |
| **PUT / PATCH** | `/api/v1/classes/{classId}/grade-reports/users/{studentId}` | `hasAuthority('ASSESSMENT_MANAGE')` | Cập nhật bảng điểm cho học sinh |

---

## 13. Kỳ thi & Câu hỏi Đề thi (Exams & Exam Questions)

### 13.1. Quản lý Kỳ thi (Exams)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/exams` | `hasAuthority('CLASS_VIEW')` | Danh sách kỳ thi của lớp (`?courseId=&examType=&status=&page=0&size=10`) |
| **GET** | `/api/v1/exams/{id}` | `hasAuthority('CLASS_VIEW')` | Xem chi tiết thông tin kỳ thi |
| **POST** | `/api/v1/classes/{classId}/exams` | `hasAuthority('ASSESSMENT_MANAGE')` | Tạo kỳ thi mới (`ExamRequestDTO`) |
| **PUT / PATCH** | `/api/v1/exams/{id}` | `hasAuthority('ASSESSMENT_MANAGE')` | Cập nhật kỳ thi |
| **PATCH** | `/api/v1/exams/{id}/publish` | `hasAuthority('ASSESSMENT_MANAGE')` | Công bố đề thi cho học sinh |
| **PATCH** | `/api/v1/exams/{id}/unpublish` | `hasAuthority('ASSESSMENT_MANAGE')` | Hủy công bố đề thi |
| **DELETE** | `/api/v1/exams/{id}` | `hasAuthority('ASSESSMENT_MANAGE')` | Xóa kỳ thi |

#### Payload `ExamRequestDTO`:
```json
{
  "courseId": "9c9c9c9c-0000-0000-0000-000000000001",
  "title": "Thi kết thúc học phần: Cơ sở dữ liệu",
  "description": "Hình thức thi kết hợp trắc nghiệm và tự luận",
  "examType": "FINAL",
  "durationMinutes": 90,
  "startTime": "2026-12-15T07:30:00Z",
  "endTime": "2026-12-15T09:30:00Z"
}
```

---

### 13.2. Câu hỏi trong Đề thi (Exam Questions)

Base path: `/api/v1/exams/{examId}/questions`

*Toàn bộ Controller được bảo vệ bởi `@PreAuthorize("hasAuthority('ASSESSMENT_MANAGE')")`.*

| Method | Endpoint | Mô tả | Payload / Model |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/exams/{examId}/questions` | Lấy danh sách câu hỏi trong đề thi | Trả về `List<ExamQuestionResponseDTO>` |
| **GET** | `/api/v1/exams/{examId}/questions/{id}` | Chi tiết một câu hỏi trong đề thi | Path: `id` |
| **POST** | `/api/v1/exams/{examId}/questions` | Gán câu hỏi vào đề thi | `AddExamQuestionRequestDTO`: `{ "questionId": "uuid...", "score": 2.0, "orderIndex": 1 }` |
| **PUT / PATCH** | `/api/v1/exams/{examId}/questions/{id}` | Cập nhật điểm số hoặc thứ tự câu hỏi | `UpdateExamQuestionRequestDTO`: `{ "score": 2.5, "orderIndex": 1 }` |
| **DELETE** | `/api/v1/exams/{examId}/questions/{id}` | Gỡ câu hỏi ra khỏi đề thi | Path: `id` |

---

## 14. Tải lên Tệp tin & Lưu trữ Đám mây (Unified Google Drive Uploads)

Base path: `/api/v1/uploads`  
Header bắt buộc: `Content-Type: multipart/form-data`  
*Toàn bộ Controller được bảo vệ bởi `@PreAuthorize("hasAuthority('MATERIAL_UPLOAD') or isAuthenticated()")`.*

Toàn bộ việc upload tệp tin (ảnh, video, PDF, giáo trình, bài tập, slide) được **gộp chung xử lý qua Google Drive**. File tự động được cấp quyền xem công khai (`anyone: reader`), lưu vết người tải lên (`uploadedBy`), kiểm tra hạn mức dung lượng gói cước (`QuotaService`), và trả về đồng thời link xem Google Drive (`fileUrl`/`url`), link nhúng ảnh CDN trực tiếp cho thẻ `<img>` (`directUrl`/`secureUrl`), và link tải về (`downloadUrl`).

| Method | Endpoint | Mô tả | Form Data Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/uploads` | **API Upload duy nhất dùng chung cho toàn bộ hệ thống** (Ảnh, Video, PDF, Slide, Word...) | `file` (MultipartFile), `title` (optional string) |
| **POST** | `/api/v1/uploads/image` | Alias upload ảnh (tương thích ngược, tự động gọi upload chung) | `file` (MultipartFile) |
| **POST** | `/api/v1/uploads/video` | Alias upload video (tương thích ngược, tự động gọi upload chung) | `file` (MultipartFile) |
| **POST** | `/api/v1/uploads/drive` *(hoặc `/document`)* | Alias upload tài liệu / drive (tương thích ngược) | `file` (MultipartFile), `title` (optional string) |
| **DELETE** | `/api/v1/uploads` | Xóa tệp tin khỏi hệ thống và xóa vĩnh viễn trên Google Drive để giải phóng dung lượng | Query: `?publicId=1g9b0p3...` |

#### Phản hồi chuẩn `FileUploadResponseDTO`:
```json
{
  "status": 200,
  "message": "Tải tệp lên thành công",
  "data": {
    "publicId": "1g9b0p3...",
    "fileId": "1g9b0p3...",
    "materialId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "url": "https://drive.google.com/file/d/1g9b0p3.../view",
    "secureUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
    "fileUrl": "https://drive.google.com/file/d/1g9b0p3.../view",
    "directUrl": "https://lh3.googleusercontent.com/d/1g9b0p3...",
    "downloadUrl": "https://drive.google.com/uc?id=1g9b0p3...&export=download",
    "format": "pdf",
    "fileType": "PDF",
    "mimeType": "application/pdf",
    "resourceType": "raw",
    "bytes": 5242880,
    "fileSizeBytes": 5242880,
    "fileSizeFormatted": "5.0 MB",
    "createdAt": "2026-11-18T00:30:00.000Z",
    "originalFilename": "Giao_trinh_Co_so_du_lieu.pdf"
  },
  "timestamp": "2026-11-18T00:30:00.000Z"
}
```

---

## 15. Gia sư AI Socratic & SSE Stream Protocol 2 (Socratic AI Tutor)

Base path: `/api/v1/student/chat`  
*Toàn bộ Controller được bảo vệ bởi `@PreAuthorize("hasAuthority('AI_ASSISTANT_USE')")`.*

### 15.1. Quản lý Phiên hội thoại (Sessions)

| Method | Endpoint | Mô tả | Params / Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/student/chat/sessions` | Lấy danh sách lịch sử phiên chat học tập | `?subject=&pageNumber=0&pageSize=10` |
| **GET** | `/api/v1/student/chat/sessions/{sessionId}` | Chi tiết phiên chat kèm lịch sử tin nhắn & step metadata | Path: `sessionId` |
| **PATCH** | `/api/v1/student/chat/sessions/{sessionId}` | Đổi tên tiêu đề phiên chat | Body: `{ "title": "Ôn tập chuẩn BCNF" }` |
| **DELETE** | `/api/v1/student/chat/sessions/{sessionId}` | Xóa phiên hội thoại | Path: `sessionId` |
| **PATCH** | `/api/v1/student/chat/messages/{messageId}/feedback` | Đánh giá tin nhắn của AI (Like/Dislike) | `MessageFeedbackRequestDto`: `{ "feedback_rating": "LIKE", "user_feedback": "Giải thích rất trực quan" }` |

---

### 15.2. Server-Sent Events (SSE) Stream Protocol 2
Endpoint mở luồng SSE stream trả lời từ AI theo thời gian thực:
- **POST** `/api/v1/student/chat/stream` hoặc `/stream-emitter` (Servlet SseEmitter chống đệm)
- **POST** `/api/v1/student/chat/stream-flux` (Reactive Flux stream)
- **GET** `/api/v1/student/chat/stream` (Dành cho chuẩn Web EventSource qua URL param)

#### Request Body POST (`SocraticChatStreamRequestDto`):
```json
{
  "session_id": "9c9c9c9c-0000-0000-0000-000000000001",
  "subject": "CSDL",
  "message": "Em chưa hiểu vì sao chuẩn BCNF lại chặt chẽ hơn chuẩn 3NF?",
  "material_ids": ["9c9c9c9c-0000-0000-0000-000000000003"],
  "active_canonical_code": "CHUAN_HOA_BCNF",
  "client_request_id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
  "expected_state_version": 1,
  "block_context": {
    "id": "a1b2c3d4-0000-0000-0000-000000000002",
    "type": "CODE_SANDBOX",
    "title": "Cài đặt QuickSort",
    "content_text": "function partition(arr, low, high) { ... }"
  }
}
```
*(Trường `block_context` là tùy chọn: dùng khi sinh viên bấm **"Hỏi Cú AI về khối này"** trong Modular Block Canvas).*

#### Quy chuẩn các SSE Event theo Protocol 2:
| Event Name | Ý nghĩa nghiệp vụ | Payload JSON Structure |
| :--- | :--- | :--- |
| **`session_init`** | Khởi tạo phiên, trả về context đồ thị và step hiện tại | `{ "session_id": "uuid", "active_canonical_code": "...", "step_progress": { ... } }` |
| **`status`** | Thông báo tiến trình thực hiện của AI (stage/state/message) | `{ "stage": "retrieval", "message": "Đang tra cứu đồ thị tri thức BCNF..." }` |
| **`token`** | Text streaming từng token hiển thị dần lên UI | `{ "delta": "Chuẩn " }` |
| **`content_replace`** | Thay thế toàn bộ text tạm thời (nếu AI định hình lại câu trả lời) | `{ "full_content": "..." }` |
| **`context_ref`** | Trích dẫn tài liệu & Node đồ thị tri thức đã tham khảo | `{ "chunk_ids": ["c1", "c2"], "node_ids": ["KE_BCNF"] }` |
| **`step_update`** | Cập nhật bước học tập trong bài tập hoặc quy trình giải | `{ "step_progress": { "step_id": "s1", "number": 2, "total": 5, "instruction": "Xác định khóa ứng viên", "completed": false } }` |
| **`diagram_ready`** | Kích hoạt hiển thị sơ đồ Mermaid hoặc đồ thị trực quan | `{ "diagram_type": "mermaid", "content": "graph TD; A-->B;" }` |
| **`exercise_ready`**| Hiển thị bài tập luyện tập phản hồi | `{ "exercise_id": "uuid", "title": "Tìm phụ thuộc hàm", "total_steps": 3 }` |
| **`done`** | Hoàn thành lượt chat, xác nhận đã lưu DB thành công | `{ "message_id": "uuid", "full_content": "...", "step_progress": { ... } }` |
| **`error`** | Báo lỗi gián đoạn | `{ "error_code": "SOCRATIC_STREAM_FAILED", "message": "Lỗi kết nối AI" }` |

*Lưu ý xử lý phía Frontend:*
- Các dòng comment (`: heartbeat`) gửi định kỳ 15 giây để chống timeout kết nối; Frontend bỏ qua comment này.
- Khi nhận event `token`, nối dần vào giao diện. Khi nhận `done`, lấy `done.full_content` để chốt nội dung cuối cùng và hiển thị stepper từ `step_progress`.

---

## 16. Xử lý Tài liệu & Đồ thị Tri thức Neo4j (Material Ingestion & Knowledge Graphs)

### 16.1. Pipeline Nhập liệu Tài liệu vào AI (`/api/v1/materials`)

*Phân quyền: `hasAuthority('KNOWLEDGE_GRAPH_EDIT') or hasAuthority('KNOWLEDGE_GRAPH_REVIEW') or hasAuthority('KNOWLEDGE_GRAPH_READ')`.*

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **POST** | `/api/v1/materials` | Upload tài liệu giáo trình (`multipart/form-data: file, title, subject, courseId`) để đưa vào pipeline AI |
| **POST** | `/api/v1/materials/{materialId}/extract` | Kích hoạt bóc tách tri thức AI từ tài liệu đã upload (`?autoPublish=true|false`, mặc định `true`). Trả về `CourseMaterialItemDTO` |
| **GET** | `/api/v1/materials/ingestion` | Danh sách các tiến trình xử lý tài liệu (`ingestion_jobs`) |
| **GET** | `/api/v1/materials/ingestion/{jobId}` | Trạng thái chi tiết của job (`QUEUED`, `PROCESSING`, `SUCCESS`, `FAILED`) |
| **GET** | `/api/v1/materials/ingestion/{jobId}/drafts/{revisionId}/graph` | Lấy dữ liệu đồ thị bản nháp sơ bộ do AI sinh ra |
| **POST** | `/api/v1/materials/ingestion/{jobId}/retry` | Thử lại tiến trình bóc tách nếu bị lỗi |
| **POST** | `/api/v1/materials/ingestion/{jobId}/drafts` | Chỉnh sửa bản nháp đồ thị tri thức (`EditRequest`) |
| **POST** | `/api/v1/materials/ingestion/{jobId}/review` | Giảng viên duyệt bản nháp đồ thị để xuất bản chính thức (`ReviewRequest`) |
| **GET** | `/api/v1/materials/{materialId}/ingestion/{jobId}/file` | Tải xuống tệp gốc của job |

#### Luồng 5 Giai đoạn Bóc tách Tri thức AI (AI Ingestion & Publication Pipeline):
1. **Giai đoạn 1 (`QUEUED`):** File tài liệu được đưa vào hàng đợi xử lý bóc tách tri thức.
2. **Giai đoạn 2 (`AI_DRAFT` / `PROCESSING`):** Hệ thống điều phối 4 AI Agents chuyên biệt (Trích xuất khái niệm, Định nghĩa, Quan hệ phụ thuộc, Kiểm tra tính nhất quán).
3. **Giai đoạn 3 (`DRAFT_READY`):** Bản nháp đồ thị tri thức sơ bộ đã hoàn tất, sinh ra `draftRevisionId`.
4. **Giai đoạn 4 (`AWAITING_REVIEW` / `REVIEWED`):** Chờ Giảng viên rà soát các concepts và mối quan hệ. Nếu gọi qua endpoint `/extract?autoPublish=true`, hệ thống tự động duyệt để tiến thẳng sang Giai đoạn 5.
5. **Giai đoạn 5 (`PUBLISHED`):** Đồ thị tri thức chính thức được ghi vào cơ sở dữ liệu đồ thị Neo4j. Tài liệu chuyển trạng thái `aiIngestionStatus = SUCCESS`.
*Khi gặp sự cố (ví dụ lỗi mạng AI hoặc định dạng tài liệu):* Job chuyển sang `FAILED` kèm `aiErrorCode`. Giảng viên có thể gọi `POST /api/v1/materials/ingestion/{jobId}/retry` để thử lại từ mốc thất bại gần nhất.

---

### 16.2. Quản lý Đồ thị Tri thức Neo4j (`/api/v1/knowledge-graphs`)

*Toàn bộ Controller được bảo vệ bởi `@PreAuthorize("hasAuthority('KNOWLEDGE_GRAPH_READ')")`.*

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **GET** | `/api/v1/knowledge-graphs/courses/{courseId}` | Lấy đồ thị tri thức tổng hợp toàn bộ môn học (`CourseKnowledgeGraphResponseDTO`) |
| **GET** | `/api/v1/knowledge-graphs/published` | Danh sách đồ thị tri thức đã xuất bản (`?courseId=&subject=&q=&after=&limit=30`) |
| **GET** | `/api/v1/knowledge-graphs/published/materials/{materialId}` | Lấy toàn bộ cây đồ thị tri thức đã xuất bản của tài liệu (`?nodeId=&depth=2&limit=200`) |
| **GET** | `/api/v1/knowledge-graphs/published/concepts/{canonicalCode}` | Chi tiết 1 khái niệm, định nghĩa, quy trình, bài tập liên quan |
| **GET** | `/api/v1/knowledge-graphs/materials/{materialId}/revisions` | Lịch sử các phiên bản đồ thị |
| **GET** | `/api/v1/knowledge-graphs/drafts/{jobId}/revisions/{revisionId}` | Lấy chi tiết bản nháp đồ thị |
| **GET** | `/api/v1/knowledge-graphs/drafts/{jobId}` | Lấy phiên bản nháp mới nhất |
| **POST** | `/api/v1/knowledge-graphs/materials/{materialId}/drafts` | Bắt đầu một bản nháp chỉnh sửa mới |
| **POST** | `/api/v1/knowledge-graphs/drafts/{jobId}/changes` | Chỉnh sửa Node/Edge trên bản nháp |
| **POST** | `/api/v1/knowledge-graphs/drafts/{jobId}/review` | Đệ trình và duyệt xuất bản bản nháp |
| **DELETE** | `/api/v1/knowledge-graphs/drafts/{jobId}` | Hủy bỏ bản nháp |
| **POST** | `/api/v1/knowledge-graphs/materials/{materialId}/publications/{publicationId}/withdraw` | Thu hồi phiên bản đồ thị đã xuất bản |
| **GET** | `/api/v1/knowledge-graphs/publications/{publicationId}` | Trạng thái của phiên bản xuất bản |
| **POST** | `/api/v1/knowledge-graphs/publications/{publicationId}/retry` | Thử lại xuất bản đồ thị nếu lỗi |
| **GET** | `/api/v1/knowledge-graphs/materials/{materialId}/audit` | Xem nhật ký kiểm toán (Audit log) của đồ thị |

---

## 17. Phân hệ Quản lý Dung lượng Đám mây & Gói dịch vụ (Cloud Storage & Subscriptions)

Hệ thống cho phép người dùng theo dõi dung lượng lưu trữ cá nhân (dựa trên các tài liệu `materials` đã tải lên), cơ cấu dung lượng theo định dạng file/môn học, quản lý danh sách file và giải phóng dung lượng. Đồng thời cung cấp tính năng đăng ký, nâng cấp gói dịch vụ (`FREE`, `PLUS`, `PRO`, `ENTERPRISE`) và bộ API quản trị dành riêng cho Admin.

### 17.1. API Dành cho Người dùng (Cloud Storage & My Subscription)

| Method | Endpoint | Quyền hạn (Authority) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| **POST** | `/api/v1/storage/upload` | `MATERIAL_UPLOAD` or `isAuthenticated()` | Tải lên tệp tin/tài liệu độc lập lên Google Drive (lưu vết cá nhân, tính quota, trả về link xem/tải ngay) |
| **GET** | `/api/v1/storage/summary` | `STORAGE_VIEW` or `isAuthenticated()` | Thống kê tổng quan dung lượng đã dùng, hạn mức gói, % sử dụng, cảnh báo sắp đầy (mọi user đăng nhập đều xem được) |
| **GET** | `/api/v1/storage/breakdown` | `STORAGE_VIEW` or `isAuthenticated()` | Phân tích dung lượng chi tiết theo loại file (PDF, DOCX, VIDEO...) và theo môn học |
| **GET** | `/api/v1/storage/files` | `STORAGE_VIEW` or `isAuthenticated()` | Danh sách tệp cá nhân kèm bộ lọc `courseId`, `fileType`, `search`, sắp xếp theo size/ngày |
| **DELETE** | `/api/v1/storage/files/{materialId}` | `STORAGE_VIEW` or `isAuthenticated()` | Xóa tài liệu khỏi hệ thống và xóa vĩnh viễn trên Google Drive để giải phóng dung lượng |
| **GET** | `/api/v1/subscriptions/plans` | `PLAN_VIEW` | Lấy danh sách các gói dịch vụ đang hoạt động công khai trên hệ thống |
| **GET** | `/api/v1/subscriptions/my-subscription` | `SUBSCRIPTION_MANAGE` | Thông tin gói thuê bao hiện tại, hạn sử dụng, % dung lượng, hạn mức AI, môn học, lớp |
| **POST** | `/api/v1/subscriptions/subscribe` | `SUBSCRIPTION_MANAGE` | Đăng ký hoặc nâng cấp gói dịch vụ mới (mô hình Gemini: nâng cấp ngay, gia hạn cộng dồn, hạ cấp lên lịch) |
| **POST** | `/api/v1/subscriptions/cancel-auto-renew` | `SUBSCRIPTION_MANAGE` | Hủy tính năng tự động gia hạn gói khi hết chu kỳ |
| **POST** | `/api/v1/subscriptions/cancel-scheduled` | `SUBSCRIPTION_MANAGE` | Hủy kế hoạch hạ cấp / gói dịch vụ đang được lên lịch |
| **GET** | `/api/v1/subscriptions/history` | `SUBSCRIPTION_MANAGE` | Lịch sử giao dịch và thanh toán gói dịch vụ của tài khoản |

#### A. Chi tiết Payload Người dùng

##### 1. `GET /api/v1/storage/summary`
Response:
```json
{
  "status": 200,
  "message": "Lấy thông tin dung lượng lưu trữ thành công",
  "data": {
    "usedStorageBytes": 524288000,
    "usedStorageFormatted": "500.0 MB",
    "maxStorageBytes": 1073741824,
    "maxStorageFormatted": "1.0 GB",
    "usagePercentage": 48.83,
    "totalFilesCount": 24,
    "planName": "Gói Cơ bản (Miễn phí)",
    "planCode": "FREE",
    "isStorageNearLimit": false,
    "maxUploadFileSizeBytes": 26214400,
    "maxUploadFileSizeFormatted": "25.0 MB"
  }
}
```

##### 2. `GET /api/v1/storage/breakdown`
Response:
```json
{
  "status": 200,
  "message": "Lấy phân tích dung lượng lưu trữ thành công",
  "data": {
    "byFileType": [
      {
        "fileType": "PDF",
        "fileCount": 15,
        "totalBytes": 314572800,
        "totalBytesFormatted": "300.0 MB",
        "percentage": 60.0
      },
      {
        "fileType": "MP4",
        "fileCount": 2,
        "totalBytes": 157286400,
        "totalBytesFormatted": "150.0 MB",
        "percentage": 30.0
      }
    ],
    "byCourse": [
      {
        "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "courseName": "Lập trình Web nâng cao",
        "fileCount": 10,
        "totalBytes": 209715200,
        "totalBytesFormatted": "200.0 MB",
        "percentage": 40.0
      }
    ]
  }
}
```

##### 3. `GET /api/v1/subscriptions/my-subscription`
Response:
```json
{
  "status": 200,
  "message": "Lấy thông tin gói thuê bao thành công",
  "data": {
    "subscriptionId": "8fa85f64-5717-4562-b3fc-2c963f66afa6",
    "planId": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
    "planCode": "PRO",
    "planName": "Gói Chuyên nghiệp (Pro)",
    "status": "ACTIVE",
    "startDate": "2026-11-01T00:00:00Z",
    "endDate": "2026-12-01T00:00:00Z",
    "daysRemaining": 17,
    "autoRenew": true,
    "nextPlanCode": "PLUS",
    "nextPlanName": "Gói Nâng cao (Plus)",
    "nextPlanStartDate": "2026-12-01T00:00:00Z",
    "limits": {
      "maxStorageBytes": 53687091200,
      "maxStorageFormatted": "50.0 GB",
      "usedStorageBytes": 524288000,
      "usedStorageFormatted": "500.0 MB",
      "storageRemainingBytes": 53162803200,
      "storageRemainingFormatted": "49.5 GB",
      "storageUsagePercentage": 0.98,
      "maxUploadFileSizeBytes": 524288000,
      "maxUploadFileSizeFormatted": "500.0 MB",
      "maxCoursesCreated": 50,
      "currentCoursesCreated": 4,
      "maxClassesCreated": 30,
      "currentClassesCreated": 3,
      "maxStudentsPerClass": 150,
      "aiDailyRequests": 1000,
      "knowledgeGraphMonthlyQuota": 150,
      "allowCustomThemes": true,
      "prioritySupport": true
    }
  }
}
```

> [!NOTE]
> **Quy tắc Vòng đời Thuê bao theo Chuẩn Gemini (Subscription Lifecycle Rules):**
> 1. **Nâng cấp gói (Upgrade - ví dụ FREE -> PRO hoặc PLUS -> PRO):**
>    - Kích hoạt gói mới có hiệu lực **ngay lập tức** (`status: ACTIVE`).
>    - Gói cũ chuyển sang trạng thái `UPGRADED`, tự động hủy mọi gói đang lên lịch (`SCHEDULED`).
> 2. **Gia hạn cùng gói (Renew - ví dụ PRO mua tiếp PRO):**
>    - Thời hạn sử dụng được **cộng dồn** liên tục: `endDate = endDate.plusDays(durationDays)`.
> 3. **Hạ cấp gói (Downgrade - ví dụ PRO xuống PLUS):**
>    - Gói hạ cấp được đưa vào trạng thái hẹn giờ **`SCHEDULED`** (`nextPlanCode: PLUS`), bắt đầu từ ngày gói hiện tại hết hạn.
>    - Người dùng được bảo toàn 100% quyền lợi gói cao cấp hiện tại đến hết chu kỳ đã thanh toán.
>    - Người dùng có thể hủy lệnh hạ cấp bất kỳ lúc nào qua API `POST /api/v1/subscriptions/cancel-scheduled`.
> 4. **Hết hạn & Fallback về gói Miễn phí (Expiration & Graceful Degradation):**
>    - Tác vụ Cron nền quét định kỳ mỗi giờ (`scanAndDowngradeExpiredSubscriptions`).
>    - Khi gói hết hạn mà không có gói gia hạn / gói hẹn giờ, tài khoản tự động chuyển về gói **`FREE`** (1 GB storage, 3 khóa học, 2 lớp học, 20 lượt AI/ngày).
>    - **Bảo toàn dữ liệu người dùng:** Hệ thống KHÔNG tự ý xóa các môn học, lớp học hay tài liệu đã tạo trước đó. Người dùng chỉ bị chặn tạo thêm môn học mới (`COURSE_CREATION_LIMIT_REACHED`), lớp mới (`CLASS_CREATION_LIMIT_REACHED`) hoặc tải thêm file mới (`STORAGE_QUOTA_EXCEEDED`) cho đến khi nâng cấp lại gói cước.

##### 4. `POST /api/v1/subscriptions/subscribe`

> [!WARNING]
> **Quy định Quan trọng về Thanh toán Gói cước (Payment Guard):**
> - API `POST /api/v1/subscriptions/subscribe` **CHỈ DÙNG để đăng ký gói Miễn phí (`FREE`, price = 0)** hoặc người dùng tự chuyển về gói miễn phí.
> - Nếu người dùng truyền `planId` của các gói trả phí (`PLUS`, `PRO`, `ENTERPRISE` có `price > 0`), hệ thống sẽ **TỪ CHỐI** và trả về lỗi **`400 Bad Request`** (Mã lỗi: **`PAYMENT_REQUIRED`**):
>   ```json
>   {
>     "status": 400,
>     "message": "Gói dịch vụ này yêu cầu thanh toán. Vui lòng tạo đơn hàng thanh toán qua VietQR tại /api/v1/payments/orders",
>     "timestamp": "2026-11-21T00:00:00.000Z"
>   }
>   ```
> - **Luồng đăng ký gói trả phí bắt buộc:** Người dùng/Frontend phải gọi `POST /api/v1/payments/orders` (xem Mục 18) để tạo đơn hàng thanh toán VietQR SePay. Gói trả phí CHỈ ĐƯỢC KÍCH HOẠT khi Webhook SePay ghi nhận giao dịch chuyển khoản thành công!

> [!IMPORTANT]
> **Quy tắc cốt lõi về ID (UUID v4):** Tất cả ID thực thể trong hệ thống (`planId`, `userId`, `courseId`, `classId`...) đều là **chuỗi UUID 36 ký tự** chuẩn lấy từ API (ví dụ: `1fa85f64-5717-4562-b3fc-2c963f66afa6`).
> Tuyệt đối không gửi các mock slug tự đặt (như `"plan-pro"`, `"plan-plus"`). Backend hỗ trợ cơ chế linh hoạt nhận diện cả UUID lẫn Plan Code (`"PRO"`, `"PLUS"`, `"ENTERPRISE"`).

Request (Chỉ hợp lệ cho gói `FREE`):
```json
{
  "planId": "11111111-1111-1111-1111-111111111111",
  "paymentMethod": "FREE",
  "autoRenew": false,
  "notes": "Đăng ký gói miễn phí"
}
```

##### 5. `GET /api/v1/subscriptions/history`
Lấy danh sách lịch sử tất cả các lần thanh toán, gia hạn, nâng cấp gói dịch vụ của người dùng hiện tại (sắp xếp mới nhất lên đầu).

**Request Headers:** HttpOnly Cookie `access-token`.

**Query Parameters:**
- `page` (integer, optional, default: `0`): Số thứ tự trang (0-indexed).
- `size` (integer, optional, default: `10`): Số lượng giao dịch mỗi trang (tối đa 100).

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Lấy lịch sử giao dịch thuê bao thành công",
  "data": {
    "items": [
      {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "userEmail": "student@example.com",
        "planId": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
        "planName": "Gói Pro Chuyên nghiệp",
        "planCode": "PRO",
        "amount": 99000.00,
        "currency": "VND",
        "paymentMethod": "VIETQR_SEPAY",
        "paymentStatus": "PAID",
        "transactionCode": "ILMSPRO678901",
        "notes": "Thanh toán VietQR SePay qua mã đơn ILMSPRO678901",
        "paidAt": "2026-11-22T21:30:00",
        "createdAt": "2026-11-22T21:28:15"
      }
    ],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 1,
    "totalPages": 1,
    "isLast": true
  }
}
```

---

### 17.2. API Dành cho Quản trị viên (Admin Subscriptions & Storage Management)

| Method | Endpoint | Quyền hạn (Authority) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| **GET** | `/api/v1/admin/subscriptions/plans` | `PLAN_MANAGE` | Danh sách toàn bộ gói cước (kèm gói đã tắt, phân trang & tìm kiếm) |
| **POST** | `/api/v1/admin/subscriptions/plans` | `PLAN_MANAGE` | Tạo mới gói cước dịch vụ |
| **PUT** | `/api/v1/admin/subscriptions/plans/{id}` | `PLAN_MANAGE` | Cập nhật cấu hình giá, thời hạn, hạn mức quota của gói |
| **PATCH** | `/api/v1/admin/subscriptions/plans/{id}/status` | `PLAN_MANAGE` | Bật/tắt trạng thái mở bán của gói cước (`?isActive=true|false`) |
| **GET** | `/api/v1/admin/subscriptions/subscribers` | `PLAN_MANAGE` | Danh sách người dùng thuê bao (lọc theo gói, trạng thái, tìm kiếm email/tên) |
| **PATCH** | `/api/v1/admin/subscriptions/users/{userId}/override-storage` | `STORAGE_MANAGE` | Cấp hạn mức dung lượng Cloud riêng cho người dùng đặc biệt |
| **GET** | `/api/v1/admin/storage/overview` | `STORAGE_MANAGE` | Báo cáo dung lượng lưu trữ toàn trường và Top 10 tài khoản sử dụng nhiều nhất |

---

## 18. Cổng Thanh Toán Tự Động VietQR & SePay Webhook (Payment & Real-time IPN)

Hệ thống tích hợp cổng thanh toán chuyển khoản ngân hàng tự động **VietQR qua SePay**, cung cấp luồng thanh toán không chạm (touchless payment), xác nhận tức thời theo thời gian thực (Real-time) qua **Server-Sent Events (SSE)** và Webhook IPN chuẩn ngân hàng.

### 18.1. Luồng Thanh Toán Tự Động (Payment & Real-time Flow)

```
[Người dùng / Frontend]
        |
        | 1. POST /api/v1/payments/orders (kèm planId)
        v
[ILMS Backend] ----> Lưu PaymentOrder (status: PENDING, code: ILMS123456, timeout: 15p)
        |      ----> Sinh link VietQR SePay động
        v
[Frontend] <------- Trả về { orderCode, qrUrl, amount, expiredAt, ... }
        |
        +---- 2. Mở kết nối SSE: GET /api/v1/payments/stream/{orderCode} (Lắng nghe sự kiện)
        |     (Hoặc định kỳ polling GET /api/v1/payments/orders/{orderCode} nếu trình duyệt ngắt SSE)
        |
        | 3. Người dùng mở App Ngân hàng quét VietQR & bấm Chuyển khoản
        v
[Ngân hàng Việt Nam (NAPAS)]
        |
        | 4. Biến động số dư tài khoản thụ hưởng
        v
[Hệ thống SePay]
        |
        | 5. POST /api/v1/payments/webhook (Header: Authorization: Apikey ...)
        v
[ILMS Backend]
        |-- Xác thực Apikey SePay
        |-- Bỏ qua nếu transferType != "in"
        |-- Trích xuất orderCode (từ trường code hoặc Regex ILMS\\d+ trong content)
        |-- Kiểm tra Idempotency (nếu đơn đã PAID -> bỏ qua)
        |-- Kiểm tra số tiền chuyển khớp/đủ (transferAmount >= order.amount)
        |-- Cập nhật đơn: status = PAID, paidAt = now, referenceCode
        |-- Kích hoạt gói dịch vụ: SubscriptionService.activatePlanForPaidUser(...)
        |-- Bắn sự kiện SSE PAYMENT_SUCCESS tới luồng stream của orderCode
        v
[Frontend] <------- Nhận event "PAYMENT_SUCCESS" qua SSE stream!
        |
        +---- Chuyển hướng người dùng sang trang "Thanh toán thành công" & cập nhật quyền lợi.
```

---

### 18.2. Danh Sách Endpoints Thanh Toán

| Method | Endpoint | Quyền hạn (Authority) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| **POST** | `/api/v1/payments/orders` | `ROLE_USER` / Đã đăng nhập | Tạo đơn thanh toán gói dịch vụ & sinh link VietQR động SePay (Mã đơn: `ILMS TENGOI 6SO`) |
| **GET** | `/api/v1/payments/orders/{orderCode}` | `Public` | Tra cứu trạng thái đơn hàng (Tự động cập nhật `EXPIRED` nếu quá hạn) |
| **POST** | `/api/v1/payments/orders/{orderCode}/confirm` | `SUBSCRIPTION_MANAGE` | Xác nhận thanh toán thủ công (Kích hoạt ngay gói cước & bắn SSE/Notification) |
| **GET** | `/api/v1/payments/stream/{orderCode}` | `Public` | Stream Server-Sent Events (SSE) cập nhật trạng thái thanh toán real-time |
| **POST** | `/api/v1/payments/webhook` | `Public` (Kiểm tra Apikey) | Webhook nhận thông báo biến động số dư từ SePay IPN |

---

### 18.3. Chi tiết API Thanh Toán

##### 1. `POST /api/v1/payments/orders`
Tạo đơn thanh toán mới cho gói dịch vụ học tập / lưu trữ Cloud.

**Request Headers:** HttpOnly Cookie `access-token`.

**Request Body:**
```json
{
  "planId": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 199000,
  "description": "Nang cap goi Pro 1 thang"
}
```
*(Ghi chú: Nếu không truyền `amount`, hệ thống tự động lấy giá niêm yết từ `SubscriptionPlan`).*

**Response:**
```json
{
  "status": 201,
  "message": "Tạo đơn hàng thanh toán thành công",
  "data": {
    "orderCode": "ILMS PLUS 362936",
    "amount": 199000,
    "qrUrl": "https://qr.sepay.vn/img?acc=0865609122&bank=MB&amount=199000&des=ILMS+PLUS+362936&template=compact",
    "bankCode": "MB",
    "accountNumber": "0865609122",
    "accountName": "HOANG QUANG THANG",
    "expiredAt": "2026-11-21T00:30:00.000Z",
    "status": "PENDING",
    "description": "Thanh toan don ILMS PLUS 362936 goi Gói Nâng cao (Plus)",
    "planId": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
    "paidAt": null
  },
  "timestamp": "2026-11-21T00:15:00.000Z"
}
```

> [!NOTE]
> **Định dạng Mã Thanh Toán Chuẩn (`orderCode`):**
> Mã đơn hàng và nội dung quét QR VietQR có định dạng chuẩn: **`ILMS <TEN_GOI> <MA_6_SO>`** (Ví dụ: `ILMS PLUS 362936`, `ILMS PRO 582194`, `ILMS ENTERPRISE 192847`).
> Khi quét mã VietQR, app ngân hàng sẽ tự động điền đúng định dạng này, giúp người dùng dễ dàng nhận biết gói cước đang thanh toán.
> Backend hỗ trợ cơ chế bóc tách thông minh: Dù ngân hàng có tự động lược bỏ khoảng trắng thành `ILMSPLUS362936` hay giữ nguyên `ILMS PLUS 362936`, hệ thống đều tự động khớp và xử lý thành công!

##### 2. `GET /api/v1/payments/orders/{orderCode}`
Kiểm tra trạng thái đơn hàng. Nếu đơn đang `PENDING` nhưng thời gian hiện tại đã vượt quá `expiredAt`, backend sẽ tự động cập nhật sang `EXPIRED`.

**Response (Khi đã thanh toán):**
```json
{
  "status": 200,
  "message": "Lấy thông tin đơn hàng thanh toán thành công",
  "data": {
    "orderCode": "ILMS PLUS 362936",
    "amount": 199000,
    "qrUrl": "https://qr.sepay.vn/img?acc=0865609122&bank=MB&amount=199000&des=ILMS+PLUS+362936&template=compact",
    "bankCode": "MB",
    "accountNumber": "0865609122",
    "accountName": "HOANG QUANG THANG",
    "expiredAt": "2026-11-21T00:30:00.000Z",
    "status": "PAID",
    "description": "Thanh toan don ILMS PLUS 362936 goi Gói Nâng cao (Plus)",
    "planId": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
    "paidAt": "2026-11-21T00:20:15.000Z"
  },
  "timestamp": "2026-11-21T00:20:16.000Z"
}
```

##### 3. `POST /api/v1/payments/orders/{orderCode}/confirm` (Xác nhận thủ công)
API cho phép Quản trị viên (hoặc môi trường kiểm thử dev) xác nhận thủ công đơn hàng đã được chuyển khoản.
- Chuyển `status: "PAID"`.
- Kích hoạt ngay gói thuê bao cho người dùng.
- Bắn sự kiện SSE `PAYMENT_SUCCESS` để giao diện frontend tự động cập nhật.
- Gửi thông báo Notification đến chuông thông báo.

##### 4. `GET /api/v1/payments/stream/{orderCode}`
Mở kết nối Server-Sent Events (SSE) để Frontend nhận thông báo thanh toán thành công tức thì mà không cần polling liên tục.

- **Content-Type:** `text/event-stream`
- **Sự kiện khi vừa kết nối thành công:**
  - `event`: `INIT`
  - `data`: `Connected to payment stream for order: ILMS682941`
- **Sự kiện khi thanh toán thành công:**
  - `event`: `PAYMENT_SUCCESS`
  - `data`: (JSON chuỗi của `PaymentOrderResponseDTO`)
- **Mã mẫu tích hợp Frontend (Next.js / React):**
  ```typescript
  const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/payments/stream/${orderCode}`);
  
  eventSource.addEventListener("PAYMENT_SUCCESS", (event) => {
    const orderData = JSON.parse(event.data);
    toast.success("Thanh toán thành công! Gói cước của bạn đã được kích hoạt.");
    router.push("/subscription/success");
    eventSource.close();
  });

  eventSource.onerror = () => {
    // Nếu kết nối lỗi, đóng stream và fallback sang polling
    eventSource.close();
  };
  ```

##### 4. `POST /api/v1/payments/webhook`
Webhook nhận IPN từ SePay khi có biến động số dư tài khoản ngân hàng.

**Request Headers:**
- `Authorization: Apikey <SEPAY_API_KEY>`
- `Content-Type: application/json`

**Request Body (Format chuẩn từ SePay):**
```json
{
  "id": 123456,
  "gateway": "MBBank",
  "transactionDate": "2026-11-17 18:32:15",
  "accountNumber": "0123456789",
  "code": "ILMS682941",
  "content": "ILMS682941 chuyen khoan nang cap pro",
  "transferType": "in",
  "transferAmount": 199000,
  "accumulated": 15000000,
  "subAccount": null,
  "referenceCode": "MB1234567890"
}
```

**Response (SePay yêu cầu trả về HTTP 200 OK):**
```json
{
  "success": true
}
```

---

### 18.4. Cấu hình Tham số SePay & Triển khai Production (Configuration & FAQ)

#### A. Các biến cấu hình hệ thống (`application.properties`):
```properties
# Mã ngân hàng thụ hưởng nhận tiền (MB, VCB, ACB, TPB...)
sepay.bank-code=${SEPAY_BANK_CODE:MB}

# Số tài khoản ngân hàng thụ hưởng nhận tiền
sepay.account-no=${SEPAY_ACCOUNT_NO:0123456789}

# Tên chủ tài khoản thụ hưởng hiển thị khi quét mã QR
sepay.account-name=${SEPAY_ACCOUNT_NAME:HOANG QUANG THANG}

# Giao diện hiển thị VietQR (compact: tối giản, qronly: chỉ mã QR, template: đầy đủ logo ngân hàng)
sepay.qr-template=${SEPAY_QR_TEMPLATE:compact}

# API Key bảo mật dùng để xác thực Webhook IPN gửi từ SePay (Authorization: Apikey <SEPAY_API_KEY>)
sepay.api-key=${SEPAY_API_KEY}
```

#### B. Cơ chế Tự động Kích hoạt Gói & Câu hỏi thường gặp:
1. **Chuyển khoản xong gói có được tự động đăng ký/kích hoạt không?**
   - **CÓ 100% TỰ ĐỘNG.** Khi người dùng chuyển khoản thành công bằng bất kỳ app ngân hàng nào (qua hệ thống NAPAS 247), biến động số dư được SePay ghi nhận và bắn ngay Webhook IPN sang `/api/v1/payments/webhook`. Backend tự động khớp mã đơn `ILMS...`, kiểm tra số tiền đủ và kích hoạt gói cước ngay lập tức qua `SubscriptionService.activatePlanForPaidUser(...)`. Đồng thời phát sự kiện SSE `PAYMENT_SUCCESS` giúp trình duyệt của người dùng tự động chuyển sang trang thành công mà không cần chờ đợi.
2. **Cấu hình Webhook IPN trên SePay có thể điền sau được không?**
   - **HOÀN TOÀN ĐƯỢC.** Trong giai đoạn test nội bộ hoặc đang phát triển, bạn chưa cần đăng ký URL công khai với SePay. Khi chuẩn bị đưa hệ thống lên Production hoặc thử nghiệm tích hợp đầu-cuối qua tunnel (như ngrok / Cloudflare Tunnel), bạn chỉ cần vào Dashboard của SePay, dán URL webhook `https://your-domain.com/api/v1/payments/webhook` và copy API Key cấu hình vào biến môi trường `SEPAY_API_KEY`.
3. **SePay có trừ phí trên mỗi giao dịch chuyển khoản không?**
   - **KHÔNG.** Giao dịch là chuyển khoản ngân hàng trực tiếp (P2P / Direct Bank Transfer) từ người dùng sang số tài khoản ngân hàng của bạn, SePay không thu phí chiết khấu % trên từng đơn hàng chuyển khoản (0% transaction fee).

---

## 19. Bảng Tra cứu Mã Lỗi Hệ thống (ErrorCode Reference)

Dành cho Frontend Interceptor hiển thị thông báo Toast / Modal / Alert chính xác:

| HTTP Status | ErrorCode | Ý nghĩa & Thông báo hiển thị Tiếng Việt |
| :---: | :--- | :--- |
| **401** | `UNAUTHORIZED` | Yêu cầu xác thực tài khoản |
| **401** | `INVALID_TOKEN` / `TOKEN_EXPIRED` | Phiên đăng nhập không hợp lệ hoặc đã hết hạn |
| **401** | `PASSWORD_INCORRECT` | Mật khẩu hiện tại không chính xác |
| **401** | `INVALID_CREDENTIALS` | Email hoặc mật khẩu không chính xác |
| **403** | `CLASS_ACCESS_DENIED` | Bạn không có quyền thực hiện thao tác trong lớp này |
| **403** | `COURSE_FORBIDDEN` | Bạn không có quyền thao tác với môn học này |
| **403** | `CHAPTER_FORBIDDEN` | Bạn không có quyền quản lý chương học này |
| **403** | `LESSON_FORBIDDEN` | Bạn không có quyền quản lý bài học này |
| **403** | `COURSE_CREATION_LIMIT_REACHED` | Bạn đã đạt số lượng môn học tối đa của gói hiện tại. Vui lòng nâng cấp gói để tạo thêm môn học |
| **403** | `CLASS_CREATION_LIMIT_REACHED` | Bạn đã đạt số lượng lớp học tối đa của gói hiện tại. Vui lòng nâng cấp gói để tạo thêm lớp học |
| **404** | `USER_NOT_FOUND` | Không tìm thấy thông tin người dùng |
| **404** | `CLASS_NOT_FOUND` | Không tìm thấy lớp học |
| **404** | `COURSE_NOT_FOUND` | Không tìm thấy môn học |
| **404** | `CHAPTER_NOT_FOUND` | Không tìm thấy chương học |
| **404** | `LESSON_NOT_FOUND` | Không tìm thấy bài học |
| **404** | `MATERIAL_NOT_FOUND` | Không tìm thấy tài liệu |
| **404** | `SESSION_NOT_FOUND` | Ca học không tồn tại |
| **404** | `LESSON_BLOCK_NOT_FOUND` | Không tìm thấy khối bài học |
| **404** | `TIME_SLOT_NOT_FOUND` | Kíp học không tồn tại |
| **400** | `INVALID_BLOCK_DATA` | Dữ liệu khối bài học không hợp lệ |
| **409** | `LESSON_BLOCK_VERSION_CONFLICT` | Khối bài học đã được thay đổi từ phiên làm việc khác, vui lòng tải lại |
| **404** | `QUESTION_NOT_FOUND` | Không tìm thấy câu hỏi hoặc câu hỏi đã bị xóa |
| **404** | `QUIZ_NOT_FOUND` | Bài kiểm tra không tồn tại |
| **404** | `ASSIGNMENT_NOT_FOUND` | Bài tập không tồn tại |
| **404** | `EXAM_NOT_FOUND` | Không tìm thấy kỳ thi |
| **404** | `SUBMISSION_NOT_FOUND` | Không tìm thấy bài nộp |
| **404** | `ROOM_NOT_FOUND` | Phòng học không tồn tại |
| **404** | `ANNOUNCEMENT_NOT_FOUND` | Thông báo không tồn tại |
| **404** | `KNOWLEDGE_GRAPH_NOT_FOUND` | Không tìm thấy đồ thị hoặc bạn không có quyền truy cập |
| **404** | `PLAN_NOT_FOUND` | Gói dịch vụ không tồn tại |
| **404** | `SUBSCRIPTION_NOT_FOUND` | Không tìm thấy thông tin gói thuê bao của người dùng |
| **404** | `NOTIFICATION_NOT_FOUND` | Thông báo không tồn tại |
| **403** | `NOTIFICATION_ACCESS_DENIED` | Bạn không có quyền thao tác với thông báo này |
| **404** | `ORDER_NOT_FOUND` | Đơn hàng thanh toán không tồn tại hoặc mã đơn không hợp lệ |
| **400** | `INVALID_ORDER_DATA` | Dữ liệu đơn hàng hoặc số tiền thanh toán không hợp lệ |
| **409** | `EMAIL_EXISTED` | Email này đã được đăng ký trên hệ thống |
| **409** | `ALREADY_CLASS_MEMBER` | Bạn đã là thành viên của lớp học này rồi |
| **409** | `COURSE_ALREADY_ASSIGNED` | Môn học đã được gán cho lớp này từ trước |
| **409** | `ROOM_SCHEDULE_CONFLICT` | Trùng lịch phòng học vào thời gian đã chọn |
| **409** | `TIME_SLOT_NAME_EXISTS` | Tên kíp học đã tồn tại |
| **409** | `TIME_SLOT_IN_USE` | Không thể xóa kíp học đang được sử dụng trong lịch học |
| **409** | `SESSION_HAS_ATTENDANCES` | Không thể xóa ca học đã có dữ liệu điểm danh (truyền ?force=true để xóa kèm điểm danh) |
| **409** | `CLASS_OWNER_CANNOT_BE_REMOVED` | Không thể xóa hoặc hạ quyền chủ sở hữu của lớp học |
| **409** | `KNOWLEDGE_GRAPH_CONFLICT` | Đồ thị đã thay đổi. Hãy tải phiên bản hiện hành mới nhất |
| **409** | `PLAN_ALREADY_EXISTS` | Mã gói dịch vụ đã tồn tại trên hệ thống |
| **400** | `CLASS_NOT_DELETED` | Lớp học đang hoạt động bình thường, không thể khôi phục |
| **400** | `COURSE_NOT_DELETED` | Môn học chưa bị xóa nên không thể khôi phục |
| **400** | `MISSING_CORRECT_ANSWER` | Câu hỏi bắt buộc phải có ít nhất một đáp án đúng |
| **400** | `RECURRING_SCHEDULE_LIMIT_EXCEEDED` | Số lượng buổi học tạo định kỳ vượt quá giới hạn tối đa (100 buổi/lần) |
| **400** | `STORAGE_QUOTA_EXCEEDED` | Dung lượng lưu trữ đám mây của bạn đã hết. Vui lòng nâng cấp gói cước hoặc xóa bớt tệp |
| **400** | `FILE_SIZE_EXCEEDED_PLAN_LIMIT` | Kích thước tệp vượt quá giới hạn tối đa của gói tài khoản hiện tại |
| **413** | `FILE_SIZE_EXCEEDED` | Kích thước tệp tin vượt quá giới hạn cho phép |
| **422** | `INVALID_KNOWLEDGE_GRAPH` | Dữ liệu chỉnh sửa đồ thị không hợp lệ |
| **422** | `KNOWLEDGE_GRAPH_REVIEW_REQUIRED` | Cần sửa lỗi và xác nhận các nội dung cần rà soát trước khi duyệt |
| **429** | `AI_DAILY_LIMIT_EXCEEDED` | Bạn đã dùng hết lượt hỏi Trợ lý AI hôm nay. Vui lòng quay lại vào ngày mai hoặc nâng cấp gói Pro |
| **502** | `SOCRATIC_STREAM_FAILED` | Kết nối gia sư AI bị gián đoạn. Vui lòng thử lại |
| **502** | `KNOWLEDGE_GRAPH_UNAVAILABLE` | Dịch vụ đồ thị tri thức tạm thời không khả dụng |

---

## 20. Phân hệ Thông báo & Realtime Notification (In-App Notifications & SSE Stream)

Base path: `/api/v1/notifications`

Hệ thống thông báo hợp nhất (Unified Notification System) phục vụ chuông thông báo Header, Toast thông báo nổi tức thì qua Server-Sent Events (SSE), và quản lý lịch sử thông báo cá nhân của người dùng.

### 20.1. Danh Sách Endpoints Thông Báo

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả chức năng |
| :---: | :--- | :--- | :--- |
| **GET** | `/api/v1/notifications` | `hasAuthority('NOTIFICATION_VIEW')` | Lấy danh sách thông báo cá nhân phân trang (hỗ trợ lọc `isRead`, `type`, `search`) |
| **GET** | `/api/v1/notifications/unread-count` | `hasAuthority('NOTIFICATION_VIEW')` | Đếm số lượng thông báo chưa đọc (hiển thị Badge icon chuông Header) |
| **PATCH** | `/api/v1/notifications/{id}/read` | `hasAuthority('NOTIFICATION_VIEW')` | Đánh dấu một thông báo là đã đọc (bảo vệ chống IDOR) |
| **PATCH** | `/api/v1/notifications/read-all` | `hasAuthority('NOTIFICATION_VIEW')` | Đánh dấu tất cả thông báo của người dùng là đã đọc |
| **DELETE** | `/api/v1/notifications/{id}` | `hasAuthority('NOTIFICATION_VIEW')` | Xóa một thông báo cá nhân |
| **GET** | `/api/v1/notifications/stream` | `hasAuthority('NOTIFICATION_VIEW')` | **SSE Stream (Real-time):** Mở kết nối Server-Sent Events nhận thông báo tức thời |
| **POST** | `/api/v1/notifications/broadcast` | `hasAuthority('NOTIFICATION_MANAGE')` | Admin phát sóng thông báo hệ thống / bảo trì toàn trường |

---

### 20.2. Chi tiết Payloads Phân Hệ Thông Báo

#### 1. `GET /api/v1/notifications`
Query Parameters:
- `isRead` (optional boolean): `false` (chỉ lấy chưa đọc), `true` (chỉ lấy đã đọc), không truyền (lấy tất cả).
- `type` (optional enum): `SYSTEM`, `CLASS_ANNOUNCEMENT`, `ASSIGNMENT_DUE`, `GRADE_RELEASED`, `ATTENDANCE_WARNING`, `AI_RECOMMENDATION`.
- `search` (optional string): Tìm kiếm theo từ khóa trong tiêu đề hoặc nội dung.
- `page` (optional int, default `0`), `size` (optional int, default `10`).

Response (`ApiResponse<PageResponse<NotificationResponseDTO>>`):
```json
{
  "status": 200,
  "message": "Lấy danh sách thông báo thành công",
  "data": {
    "items": [
      {
        "id": "7fa85f64-5717-4562-b3fc-2c963f66afa1",
        "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "title": "Nhắc hạn nộp: Bài tập Lab 1",
        "content": "Bài tập Cấu trúc dữ liệu Lab 1 sắp hết hạn lúc 23:59 hôm nay. Vui lòng hoàn thành và nộp bài đúng hạn.",
        "type": "ASSIGNMENT_DUE",
        "priority": "HIGH",
        "isRead": false,
        "readAt": null,
        "actionUrl": "/classes/9c9c9c9c-0000-0000-0000-000000000002/assignments/8fa85f64-5717-4562-b3fc-2c963f66afa8",
        "referenceType": "ASSIGNMENT",
        "referenceId": "8fa85f64-5717-4562-b3fc-2c963f66afa8",
        "metadata": "{\"courseName\":\"Cấu trúc dữ liệu và Giải thuật\",\"dueDate\":\"2026-11-20T23:59:00\"}",
        "createdAt": "2026-11-20T10:00:00.000Z",
        "expiresAt": null
      }
    ],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  },
  "timestamp": "2026-11-20T20:00:00.000Z"
}
```

#### 2. `GET /api/v1/notifications/unread-count`
Response:
```json
{
  "status": 200,
  "message": "Lấy số lượng thông báo chưa đọc thành công",
  "data": {
    "unreadCount": 3
  },
  "timestamp": "2026-11-20T20:00:00.000Z"
}
```

#### 3. `GET /api/v1/notifications/stream` (Realtime SSE)
Frontend kết nối bằng `EventSource`:
```typescript
const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/notifications/stream`, {
  withCredentials: true // Gửi kèm HttpOnly cookie access-token
});

eventSource.addEventListener("NOTIFICATION", (event) => {
  const notification = JSON.parse(event.data);
  // 1. Tăng unread count trên Header
  incrementUnreadCount();
  // 2. Bắn Toast notification ở góc màn hình
  toast.info(notification.title, {
    description: notification.content,
    action: {
      label: "Xem ngay",
      onClick: () => router.push(notification.actionUrl)
    }
  });
});
```

#### 4. `POST /api/v1/notifications/broadcast` (Admin Only)
Request:
```json
{
  "title": "Bảo trì nâng cấp hệ thống",
  "content": "Hệ thống ILMS sẽ tiến hành bảo trì định kỳ từ 01:00 đến 03:00 sáng ngày 22/11/2026.",
  "type": "SYSTEM",
  "priority": "HIGH",
  "actionUrl": "/announcements/system",
  "targetUserIds": []
}
```
*(Nếu `targetUserIds` để mảng rỗng `[]` hoặc `null`, hệ thống tự động phát sóng đến toàn bộ người dùng).*

---

## 21. Bản Đồ Nhiệt Tri Thức (Knowledge Mastery Heatmap)

Module **Bản Đồ Nhiệt Tri Thức (Knowledge Mastery Heatmap)** cho phép trực quan hóa mức độ nắm vững từng khái niệm (Concept Mastery) của sinh viên và lớp học dựa trên:
1. **Điểm trắc nghiệm (Quiz Question Accuracy - trọng số 70%):** Tỷ lệ trả lời chính xác các câu hỏi gắn với khái niệm trong các bài Quiz.
2. **Tiến độ học tập Socratic AI (Socratic Concept Progress - trọng số 30%):** Mức độ hoàn thành các cuộc hội thoại đào sâu và gợi ý từ Trợ lý Socratic.

### 21.1. Thang Đo Độ Thành Thục (Mastery Levels)
| Trạng thái | Khoảng điểm | Ý nghĩa trên Giao diện | Màu sắc gợi nghị |
| :--- | :---: | :--- | :---: |
| `NOT_STARTED` | < 1.0% | Chưa học / Chưa có dữ liệu đánh giá | Xám (`#9ca3af`) |
| `WEAK` | 1.0% - 39.9% | Kiến thức yếu, tồn tại lỗ hổng (Gap) | Đỏ (`#ef4444`) |
| `DEVELOPING` | 40.0% - 69.9% | Đang phát triển / Nắm cơ bản | Vàng cam (`#f59e0b`) |
| `PROFICIENT` | 70.0% - 84.9% | Thành thạo / Đạt yêu cầu | Xanh lá nhạt (`#10b981`) |
| `MASTERED` | 85.0% - 100% | Xuất sắc / Làm chủ hoàn toàn | Xanh ngọc đậm (`#059669`) |

---

### 21.2. Danh sách Endpoints

| Method | Endpoint | Quyền hạn | Mô tả | Query Parameters |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/courses/{courseId}/knowledge-heatmap` | `KNOWLEDGE_HEATMAP_VIEW` | Lấy bản đồ nhiệt tri thức cá nhân của người dùng trên toàn bộ cây khái niệm môn học | `scope` (optional: `PERSONAL` mặc định, hoặc `AGGREGATE`) |
| **GET** | `/api/v1/classes/{classId}/knowledge-heatmap` | `KNOWLEDGE_HEATMAP_VIEW` (Teacher / Owner / Admin) | Ma trận nhiệt 2 chiều (Sinh viên x Khái niệm) của toàn bộ lớp học | `courseId` *(bắt buộc)*, `page` *(default 0)*, `size` *(default 50)* |
| **GET** | `/api/v1/classes/{classId}/students/{studentId}/knowledge-mastery` | `KNOWLEDGE_HEATMAP_VIEW` (Teacher / Admin hoặc chính sinh viên) | Báo cáo chi tiết độ thành thục từng khái niệm của 1 sinh viên trong lớp | `courseId` *(bắt buộc)* |
| **GET** | `/api/v1/classes/{classId}/knowledge-gaps` | `KNOWLEDGE_HEATMAP_VIEW` (Teacher / Owner / Admin) | Báo cáo các "điểm nghẽn tri thức" và danh sách sinh viên có nguy cơ rớt môn | `courseId` *(bắt buộc)*, `threshold` *(optional, default 50.0)* |

---

### 21.3. Chi tiết API & Ví dụ Phản hồi

#### 1. `GET /api/v1/courses/{courseId}/knowledge-heatmap?scope=PERSONAL`
Phản hồi (`ApiResponse<CourseKnowledgeHeatmapResponseDTO>`):
```json
{
  "status": 200,
  "message": "Lấy bản đồ nhiệt tri thức môn học thành công",
  "data": {
    "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "courseName": "Cấu trúc dữ liệu và Giải thuật",
    "totalConcepts": 12,
    "averageMasteryScore": 76.5,
    "concepts": [
      {
        "conceptId": "concept_binary_search_tree",
        "conceptName": "Cây nhị phân tìm kiếm (BST)",
        "chapterTitle": "Chương 4: Cây và Đồ thị",
        "masteryScore": 88.0,
        "status": "MASTERED",
        "quizAccuracy": 90.0,
        "socraticProgress": 85.0,
        "totalQuestionsAttempted": 10
      },
      {
        "conceptId": "concept_avl_tree",
        "conceptName": "Cây cân bằng AVL",
        "chapterTitle": "Chương 4: Cây và Đồ thị",
        "masteryScore": 45.0,
        "status": "DEVELOPING",
        "quizAccuracy": 50.0,
        "socraticProgress": 35.0,
        "totalQuestionsAttempted": 6
      }
    ]
  },
  "timestamp": "2026-11-21T20:00:00.000Z"
}
```

#### 2. `GET /api/v1/classes/{classId}/knowledge-heatmap?courseId={courseId}&page=0&size=50`
Phản hồi (`ApiResponse<ClassKnowledgeHeatmapResponseDTO>`):
```json
{
  "status": 200,
  "message": "Lấy ma trận nhiệt tri thức lớp học thành công",
  "data": {
    "classId": "9c9c9c9c-0000-0000-0000-000000000002",
    "className": "Lớp KTPM01 - Cấu trúc dữ liệu",
    "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "courseName": "Cấu trúc dữ liệu và Giải thuật",
    "conceptHeaders": [
      {
        "conceptId": "concept_binary_search_tree",
        "conceptName": "Cây nhị phân tìm kiếm (BST)",
        "chapterTitle": "Chương 4: Cây và Đồ thị"
      },
      {
        "conceptId": "concept_avl_tree",
        "conceptName": "Cây cân bằng AVL",
        "chapterTitle": "Chương 4: Cây và Đồ thị"
      }
    ],
    "rows": [
      {
        "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "studentName": "Nguyễn Văn A",
        "studentEmail": "vana@example.com",
        "avatarUrl": "https://lh3.googleusercontent.com/d/avatar1",
        "averageScore": 66.5,
        "conceptScores": {
          "concept_binary_search_tree": 88.0,
          "concept_avl_tree": 45.0
        }
      }
    ],
    "classAverages": [
      {
        "conceptId": "concept_binary_search_tree",
        "conceptName": "Cây nhị phân tìm kiếm (BST)",
        "averageScore": 78.5,
        "status": "PROFICIENT"
      },
      {
        "conceptId": "concept_avl_tree",
        "conceptName": "Cây cân bằng AVL",
        "averageScore": 42.0,
        "status": "DEVELOPING"
      }
    ]
  },
  "timestamp": "2026-11-21T20:00:00.000Z"
}
```

#### 3. `GET /api/v1/classes/{classId}/knowledge-gaps?courseId={courseId}&threshold=50.0`
Query params: `courseId` *(bắt buộc UUID)*, `threshold` *(optional Double, mặc định 50.0)*.
Phản hồi (`ApiResponse<ClassKnowledgeGapsResponseDTO>`):
```json
{
  "status": 200,
  "message": "Lấy báo cáo điểm nghẽn tri thức thành công",
  "data": {
    "classId": "9c9c9c9c-0000-0000-0000-000000000002",
    "className": "Lớp KTPM01 - Cấu trúc dữ liệu",
    "threshold": 50.0,
    "weakConcepts": [
      {
        "conceptId": "concept_avl_tree",
        "conceptName": "Cây cân bằng AVL",
        "chapterTitle": "Chương 4: Cây và Đồ thị",
        "averageScore": 42.0,
        "weakStudentCount": 18,
        "totalStudents": 35
      }
    ],
    "atRiskStudents": [
      {
        "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
        "studentName": "Trần Văn B",
        "studentEmail": "vanb@example.com",
        "avatarUrl": null,
        "averageScore": 38.5,
        "weakConceptCount": 5
      }
    ]
  },
  "timestamp": "2026-11-21T20:00:00.000Z"
}
```

---

## 22. Phân Hệ Chuẩn Đầu Ra PLO & CLO (Program & Course Learning Outcomes)

Phân hệ quản trị chất lượng giáo dục và kiểm chuẩn đầu ra theo chuẩn quốc tế (ABET / AUN-QA):
- **PLO (Program Learning Outcomes):** Chuẩn đầu ra cấp Chương trình đào tạo.
- **CLO (Course Learning Outcomes):** Chuẩn đầu ra cấp Môn học / Học phần.
- **CLO - PLO Matrix:** Ma trận ánh xạ mức độ đóng góp của từng CLO vào PLO.
- **Concept - CLO Mapping:** Ánh xạ các khái niệm trong Đồ thị tri thức (Knowledge Graph) vào CLO với trọng số (Weight từ `0.00` đến `1.00`).
- **Outcome Attainment:** Đánh giá định lượng mức độ đạt chuẩn của sinh viên và lớp học dựa trên kết quả kiểm tra thực tế.

### 22.1. Định Nghĩa Mức Đóng Góp & Thang Đo Bloom
- **Bloom Taxonomy (`bloomLevel`):**
  - `REMEMBER` (Nhớ)
  - `UNDERSTAND` (Hiểu)
  - `APPLY` (Vận dụng)
  - `ANALYZE` (Phân tích)
  - `EVALUATE` (Đánh giá)
  - `CREATE` (Sáng tạo)
- **Mức độ đóng góp CLO $\rightarrow$ PLO (`contributionLevel`):**
  - `HIGH` (Đóng góp cao - Trọng số 3)
  - `MEDIUM` (Đóng góp trung bình - Trọng số 2)
  - `LOW` (Đóng góp thấp - Trọng số 1)
- **Trạng thái Đạt chuẩn (`attainmentStatus`):**
  - `NOT_ASSESSED`: Chưa có dữ liệu đánh giá
  - `BELOW`: Chưa đạt (< 50.0%)
  - `APPROACHING`: Tiệm cận đạt (50.0% - 69.9%)
  - `MET`: Đạt chuẩn (70.0% - 84.9%)
  - `EXCEEDED`: Vượt chuẩn ($\ge$ 85.0%)

---

### 22.2. Danh sách Endpoints Chuẩn Đầu Ra Chương Trình (PLO)

Base path: `/api/v1/plos`

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/plos` | `PLO_VIEW` | Lấy danh sách PLO phân trang (`search`, `page`, `size`) |
| **GET** | `/api/v1/plos/{ploId}` | `PLO_VIEW` | Chi tiết 1 PLO kèm danh sách các CLO đang ánh xạ tới nó |
| **POST** | `/api/v1/plos` | `PLO_MANAGE` (Admin) | Tạo mới Chuẩn đầu ra PLO |
| **PUT** | `/api/v1/plos/{ploId}` | `PLO_MANAGE` (Admin) | Chỉnh sửa thông tin PLO |
| **DELETE** | `/api/v1/plos/{ploId}` | `PLO_MANAGE` (Admin) | Xóa mềm PLO (`deleted_at`) |
| **GET** | `/api/v1/plos/{ploId}/attainment-report` | `OUTCOME_ATTAINMENT_VIEW` | Báo cáo tỷ lệ đạt PLO qua các môn học trong toàn chương trình |

#### Request tạo mới PLO (`POST /api/v1/plos`):
```json
{
  "code": "PLO-01",
  "description": "Khả năng áp dụng kiến thức toán học, khoa học tự nhiên và nền tảng máy tính vào giải quyết các bài toán kỹ thuật phần mềm phức tạp.",
  "bloomLevel": "APPLY",
  "orderIndex": 1
}
```

#### Phản hồi Chi tiết PLO (`ApiResponse<PloDetailResponseDTO>`):
```json
{
  "status": 200,
  "message": "Lấy thông tin chuẩn đầu ra PLO thành công",
  "data": {
    "id": "7fa85f64-5717-4562-b3fc-2c963f66afa2",
    "code": "PLO-01",
    "description": "Khả năng áp dụng kiến thức toán học, khoa học tự nhiên và nền tảng máy tính...",
    "bloomLevel": "APPLY",
    "orderIndex": 1,
    "createdById": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "createdByName": "Quản trị viên",
    "createdAt": "2026-11-21T10:00:00.000Z",
    "updatedAt": "2026-11-21T10:00:00.000Z",
    "linkedClos": [
      {
        "id": "5fa85f64-5717-4562-b3fc-2c963f66afa1",
        "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "courseTitle": "Cấu trúc dữ liệu và Giải thuật",
        "code": "CLO-01",
        "description": "Cài đặt và thao tác trên cấu trúc Cây nhị phân",
        "bloomLevel": "APPLY"
      }
    ]
  },
  "timestamp": "2026-11-21T20:00:00.000Z"
}
```

---

### 22.3. Danh sách Endpoints Chuẩn Đầu Ra Môn Học (CLO & Ma Trận Ánh Xạ)

Base path: `/api/v1/courses/{courseId}`

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/courses/{courseId}/clos` | `CLO_VIEW` | Danh sách CLO của môn học |
| **GET** | `/api/v1/courses/{courseId}/clos/{cloId}` | `CLO_VIEW` | Chi tiết 1 CLO kèm danh sách PLO và Concepts liên kết |
| **POST** | `/api/v1/courses/{courseId}/clos` | `CLO_MANAGE` (Owner/Admin) | Thêm mới CLO cho môn học |
| **PUT** | `/api/v1/courses/{courseId}/clos/{cloId}` | `CLO_MANAGE` (Owner/Admin) | Chỉnh sửa CLO |
| **DELETE** | `/api/v1/courses/{courseId}/clos/{cloId}` | `CLO_MANAGE` (Owner/Admin) | Xóa mềm CLO |
| **GET** | `/api/v1/courses/{courseId}/clo-plo-matrix` | `CLO_VIEW` | Lấy Ma trận ánh xạ 2 chiều CLO - PLO của môn học |
| **PUT** | `/api/v1/courses/{courseId}/clo-plo-matrix` | `CLO_PLO_MAPPING_MANAGE` | Cập nhật ma trận CLO - PLO theo lô (Batch update) |
| **GET** | `/api/v1/courses/{courseId}/clos/{cloId}/concepts` | `CLO_VIEW` | Lấy danh sách Concepts đã được gán vào CLO cụ thể |
| **PUT** | `/api/v1/courses/{courseId}/clos/{cloId}/concepts` | `CLO_PLO_MAPPING_MANAGE` | Gán danh sách Khái niệm (Concepts) vào CLO kèm trọng số |

#### Request tạo mới CLO (`POST /api/v1/courses/{courseId}/clos`):
```json
{
  "code": "CLO-01",
  "description": "Cài đặt và thao tác trên cấu trúc Cây nhị phân và Cây cân bằng AVL",
  "bloomLevel": "APPLY",
  "orderIndex": 1
}
```

#### Request cập nhật Ma trận CLO - PLO (`PUT /api/v1/courses/{courseId}/clo-plo-matrix`):
```json
{
  "mappings": [
    {
      "cloId": "5fa85f64-5717-4562-b3fc-2c963f66afa1",
      "ploId": "7fa85f64-5717-4562-b3fc-2c963f66afa2",
      "contributionLevel": "HIGH"
    },
    {
      "cloId": "5fa85f64-5717-4562-b3fc-2c963f66afa1",
      "ploId": "7fa85f64-5717-4562-b3fc-2c963f66afa3",
      "contributionLevel": "MEDIUM"
    }
  ]
}
```

#### Request gán Concept vào CLO (`PUT /api/v1/courses/{courseId}/clos/{cloId}/concepts`):
*(Lưu ý: `weight` nhận giá trị thập phân từ `0.00` đến `1.00`).*
```json
{
  "concepts": [
    {
      "conceptId": "concept_binary_search_tree",
      "conceptName": "Cây nhị phân tìm kiếm (BST)",
      "weight": 1.00
    },
    {
      "conceptId": "concept_avl_tree",
      "conceptName": "Cây cân bằng AVL",
      "weight": 0.80
    }
  ]
}
```

---

### 22.4. Danh sách Endpoints Đánh Giá Mức Độ Đạt Chuẩn (Outcome Attainment)

| Method | Endpoint | Quyền hạn | Mô tả & Tham số bắt buộc |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/outcome-attainment` | `OUTCOME_ATTAINMENT_VIEW` (Teacher / Admin) | Báo cáo tổng thể CLO & PLO của toàn bộ lớp học.<br>Query params: `courseId` *(bắt buộc UUID)* |
| **GET** | `/api/v1/classes/{classId}/students/{studentId}/outcome-attainment` | `OUTCOME_ATTAINMENT_VIEW` (Teacher / Admin hoặc chính sinh viên) | Báo cáo chi tiết mức độ đạt CLO & PLO của một sinh viên trong lớp.<br>Query params: `courseId` *(bắt buộc UUID)* |
| **GET** | `/api/v1/me/outcome-attainment` | `OUTCOME_ATTAINMENT_VIEW` (Sinh viên) | Sinh viên tự xem báo cáo mức độ đạt chuẩn đầu ra của chính mình.<br>Query params: `classId` *(bắt buộc UUID)*, `courseId` *(bắt buộc UUID)* |
| **POST** | `/api/v1/classes/{classId}/outcome-attainment/recalculate` | `CLO_MANAGE` (Teacher / Admin) | Kích hoạt tính toán lại chuẩn đầu ra cho cả lớp từ kết quả kiểm tra thực tế.<br>Query params: `courseId` *(bắt buộc UUID)* |

#### Phản hồi Báo cáo Lớp học (`ApiResponse<ClassOutcomeAttainmentResponseDTO>`):
```json
{
  "status": 200,
  "message": "Lấy báo cáo đạt chuẩn đầu ra lớp học thành công",
  "data": {
    "classId": "9c9c9c9c-0000-0000-0000-000000000002",
    "className": "Lớp KTPM01 - Cấu trúc dữ liệu",
    "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "courseName": "Cấu trúc dữ liệu và Giải thuật",
    "totalStudents": 35,
    "cloAttainments": [
      {
        "cloId": "5fa85f64-5717-4562-b3fc-2c963f66afa1",
        "cloCode": "CLO-01",
        "cloName": "Cài đặt và thao tác trên cấu trúc Cây nhị phân",
        "bloomLevel": "APPLY",
        "targetScore": 70.0,
        "averageAttainmentScore": 78.4,
        "attainmentRate": 85.7,
        "studentsMetCount": 30,
        "status": "MET"
      }
    ],
    "ploSummaries": [
      {
        "ploId": "7fa85f64-5717-4562-b3fc-2c963f66afa2",
        "ploCode": "PLO-01",
        "ploName": "Nền tảng Toán học và Khoa học máy tính",
        "targetScore": 70.0,
        "averageAttainmentScore": 76.2,
        "status": "MET"
      }
    ]
  },
  "timestamp": "2026-11-21T20:00:00.000Z"
}
```

#### Phản hồi Báo cáo Cá nhân Sinh viên (`ApiResponse<StudentOutcomeAttainmentResponseDTO>`):
```json
{
  "status": 200,
  "message": "Lấy báo cáo đạt chuẩn đầu ra thành công",
  "data": {
    "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "studentName": "Nguyễn Văn A",
    "avatarUrl": "https://lh3.googleusercontent.com/d/avatar1",
    "classId": "9c9c9c9c-0000-0000-0000-000000000002",
    "className": "Lớp KTPM01 - Cấu trúc dữ liệu",
    "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "courseTitle": "Cấu trúc dữ liệu và Giải thuật",
    "overallAttainmentRate": 80.0,
    "metCloCount": 4,
    "totalCloCount": 5,
    "cloAttainments": [
      {
        "cloId": "5fa85f64-5717-4562-b3fc-2c963f66afa1",
        "cloCode": "CLO-01",
        "cloDescription": "Cài đặt và thao tác trên cấu trúc Cây nhị phân",
        "bloomLevel": "APPLY",
        "targetScore": 70.0,
        "attainmentScore": 82.5,
        "status": "MET",
        "conceptBreakdowns": [
          {
            "conceptId": "concept_binary_search_tree",
            "conceptName": "Cây nhị phân tìm kiếm (BST)",
            "weight": 1.0,
            "accuracy": 88.0,
            "totalQuestions": 10
          }
        ]
      }
    ],
    "ploAttainments": [
      {
        "ploId": "7fa85f64-5717-4562-b3fc-2c963f66afa2",
        "ploCode": "PLO-01",
        "ploDescription": "Khả năng áp dụng kiến thức toán học, khoa học tự nhiên...",
        "bloomLevel": "APPLY",
        "targetScore": 70.0,
        "calculatedScore": 80.5,
        "status": "MET"
      }
    ]
  },
  "timestamp": "2026-11-21T20:00:00.000Z"
}
```

