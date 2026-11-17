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

## 2. Phân hệ Xác thực & OAuth2 (Auth & OAuth2)

### 2.1. Xác thực truyền thống (`/api/v1/auth`)

| Method | Endpoint | Quyền hạn | Mô tả | Request Body | Response Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Public | Đăng ký tài khoản người dùng mới | `RegisterRequestDTO` | `UserResponseDTO` |
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
    "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg"
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
| **POST** | `/api/v1/users/avatar` *(hoặc `/api/v1/user/avatar`)* | `isAuthenticated()` | Tải lên và cập nhật ảnh đại diện người dùng | `multipart/form-data` (`file`) |
| **PUT** | `/api/v1/users/password` *(hoặc `/api/v1/user/password`)* | `isAuthenticated()` | Đổi mật khẩu tài khoản trong trang Cài đặt (Settings) | `ChangePasswordRequestDTO` |
| **GET** | `/api/v1/users/{id}` | `hasAuthority('USER_VIEW')` or `hasAuthority('USER_MANAGE')` | Xem thông tin chi tiết người dùng theo ID | Path: `id` (UUID) |
| **PUT** | `/api/v1/users/{id}` | `hasAuthority('USER_VIEW')` or `hasAuthority('USER_MANAGE')` | Cập nhật hồ sơ người dùng theo ID | `UserUpdateRequestDTO` |
| **PATCH** | `/api/v1/users/{id}/role` | `hasAuthority('USER_MANAGE')` | Gán vai trò hệ thống mới cho User | `UserUpdateRoleRequest`: `{ "role": "ROLE_ADMIN" }` |
| **GET** | `/api/v1/users/me/timetable` | `isAuthenticated()` | Xem thời khóa biểu cá nhân của học sinh / giảng viên | `?startDate=2026-11-01&endDate=2026-11-30` (ISO Date) |

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
  "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg",
  "socialAccounts": {
    "google": { "email": "vana.nguyen@gmail.com", "isLinked": true },
    "github": { "username": "vananguyen", "isLinked": true },
    "apple": { "isLinked": false }
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
| **GET** | `/api/v1/users/notification-settings` *(hoặc `/api/v1/user/notification-settings`)* | `isAuthenticated()` | Lấy riêng cấu hình thông báo (push, email, reminder categories) | None |
| **PUT / PATCH** | `/api/v1/users/notification-settings` *(hoặc `/api/v1/user/notification-settings`)* | `isAuthenticated()` | Cập nhật riêng cấu hình thông báo của người dùng | JSON Object notification settings |

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
| **GET** | `/api/v1/courses/{id}` | `hasAuthority('COURSE_VIEW')` | Xem chi tiết thông tin khóa học | Path: `id` |
| **GET** | `/api/v1/courses/users/{userId}` | `hasAuthority('COURSE_VIEW')` | Danh sách khóa học của một giảng viên | `?page=0&size=10` |
| **PUT / PATCH** | `/api/v1/courses/{id}` | `hasAuthority('COURSE_UPDATE')` | Cập nhật thông tin khóa học (chủ khóa học / Admin) | `CourseUpdateRequestDTO` |
| **PATCH** | `/api/v1/courses/{id}/instructor` | `hasAuthority('SYSTEM_CONFIG')` | Đổi giảng viên phụ trách chính của môn học | `UpdateCourseInstructorRequestDTO`: `{ "instructorId": "uuid..." }` |
| **DELETE** | `/api/v1/courses/{id}/soft` | `hasAuthority('COURSE_DELETE')` | Xóa mềm khóa học (`deleted_at`) | None |
| **PATCH** | `/api/v1/courses/{id}/status` | `hasAuthority('COURSE_UPDATE')` | Cập nhật trạng thái khóa học (`DRAFT`, `PUBLISHED`, `ARCHIVED`, `CLOSED`) | `UpdateCourseStatusRequestDTO`: `{ "status": "PUBLISHED" }` |
| **PATCH** | `/api/v1/courses/{id}/restore` | `hasAuthority('SYSTEM_CONFIG')` | Khôi phục khóa học đã bị xóa mềm | None |
| **DELETE** | `/api/v1/courses/{id}/hard` | `hasAuthority('SYSTEM_CONFIG')` | Xóa vĩnh viễn khóa học (chỉ Admin, chặn khi còn học viên/bài tập) | Path: `id` |
| **GET** | `/api/v1/courses/{courseId}/classes` | `hasAuthority('COURSE_VIEW')` | Danh sách các lớp học đang học môn này | `?academicYear=&page=0&size=10` |

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

#### Payload `CourseCreateRequestDTO`:
```json
{
  "title": "Cấu trúc dữ liệu và Giải thuật",
  "code": "IT3010",
  "description": "Môn học cơ sở ngành CNTT",
  "credits": 3,
  "coverImageUrl": "https://res.cloudinary.com/.../cover.jpg",
  "status": true
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
  "lessonType": "THEORY",
  "orderIndex": 1,
  "isPublished": true,
  "videoUrl": "https://res.cloudinary.com/.../video.mp4",
  "durationSeconds": 2700
}
```
*(Giá trị `lessonType`: `THEORY`, `VIDEO`, `QUIZ`, `ASSIGNMENT`).*

---

### 5.3. Tài liệu học tập đính kèm (Materials)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả | Định dạng dữ liệu |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/lessons/{lessonId}/materials` | `hasAuthority('COURSE_VIEW')` | Lấy danh sách tài liệu của bài học | Trả về `List<MaterialSummaryResponseDTO>` |
| **GET** | `/api/v1/materials/{materialId}` | `hasAuthority('COURSE_VIEW')` | Xem chi tiết 1 tài liệu | Trả về `MaterialResponseDTO` |
| **POST** | `/api/v1/lessons/{lessonId}/materials` | `hasAuthority('MATERIAL_UPLOAD')` | Upload tài liệu đính kèm bài học | `multipart/form-data`: `file`, `title`, `description`, `isDownloadable` |
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
  "maxStudents": 60,
  "enrollmentKey": "MATKHAU123"
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
  "thumbnailUrl": "https://res.cloudinary.com/.../thumb.png",
  "backgroundUrl": "https://res.cloudinary.com/.../banner.jpg",
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
    "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg"
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
  "credits": 3,
  "teacherId": "11111111-2222-3333-4444-555555555555",
  "teacherName": "Trần Văn Giảng Viên",
  "assignedTeacher": {
    "id": "11111111-2222-3333-4444-555555555555",
    "fullName": "Trần Văn Giảng Viên",
    "email": "giangvien@ilms.edu.vn",
    "avatarUrl": "https://res.cloudinary.com/.../teacher.jpg"
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

### 7.2. Ca học & Điểm danh (`/api/v1/classes/{classId}/lesson-sessions`)
*(Hỗ trợ cả alias URL: `/api/v1/classes/{classId}/lessonSessions`)*

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/lesson-sessions` | `hasAuthority('CLASS_VIEW')` | Lấy danh sách các ca học của lớp |
| **POST** | `/api/v1/classes/{classId}/lesson-sessions` | `hasAuthority('ATTENDANCE_MANAGE')` | Tạo lịch ca học mới cho lớp (`LessonSessionCreateDTO`) |
| **GET** | `/api/v1/classes/{classId}/lesson-sessions/{lessonSessionId}/attendances` | `hasAuthority('CLASS_VIEW')` | Lấy danh sách bảng điểm danh của ca học |
| **POST** | `/api/v1/classes/{classId}/lesson-sessions/{lessonSessionId}/attendances` | `hasAuthority('ATTENDANCE_MANAGE')` | Điểm danh hàng loạt học sinh (`BatchAttendanceRequestDTO`) |

#### Payload `LessonSessionCreateDTO`:
```json
{
  "roomId": "9c9c9c9c-0000-0000-0000-000000000001",
  "timeSlotId": "9c9c9c9c-0000-0000-0000-000000000002",
  "sessionDate": "2026-11-20",
  "note": "Học thực hành lập trình mạng Socket"
}
```

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
  "bloomLevel": "ANALYZE",
  "explanation": "BCNF loại bỏ triệt để các phụ thuộc hàm mà vế trái không phải là siêu khóa.",
  "codeSnippet": "SELECT * FROM users WHERE status = 'ACTIVE';",
  "codeLanguage": "sql",
  "diagramData": null,
  "imageUrl": null,
  "ploId": "9c9c9c9c-0000-0000-0000-000000000003",
  "answers": [
    { "content": "Phụ thuộc hàm vào một phần của khóa chính", "isCorrect": false },
    { "content": "Phụ thuộc hàm giữa các thuộc tính khóa", "isCorrect": true },
    { "content": "Thuộc tính đa trị", "isCorrect": false }
  ],
  "conceptIds": ["9c9c9c9c-0000-0000-0000-000000000010"]
}
```
*(Giá trị `questionType`: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `ESSAY`.*
*Giá trị `difficultyLevel`: `EASY`, `MEDIUM`, `HARD`.*
*Giá trị `bloomLevel`: `REMEMBER`, `UNDERSTAND`, `APPLY`, `ANALYZE`, `EVALUATE`, `CREATE`).*

---

## 10. Đề kiểm tra Trắc nghiệm & Làm bài (Quizzes & Quiz Play)

Base path: `/api/v1/quizzes`

### 10.1. Quản lý Đề kiểm tra (Quiz Management)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/quizzes` | `hasAuthority('CLASS_VIEW')` | Lấy danh sách bài kiểm tra (`?classId=&status=&page=0&size=10`) |
| **GET** | `/api/v1/quizzes/{id}` | `hasAuthority('CLASS_VIEW')` | Chi tiết cấu hình bài quiz |
| **POST** | `/api/v1/quizzes` | `hasAuthority('ASSESSMENT_MANAGE')` | Tạo bài kiểm tra mới (`QuizRequestDTO`) |
| **PUT** | `/api/v1/quizzes/{id}` | `hasAuthority('ASSESSMENT_MANAGE')` | Cập nhật cấu hình bài kiểm tra |
| **DELETE** | `/api/v1/quizzes/{id}` | `hasAuthority('ASSESSMENT_MANAGE')` | Xóa bài kiểm tra |
| **PATCH** | `/api/v1/quizzes/{id}/publish` | `hasAuthority('ASSESSMENT_MANAGE')` | Công bố đề thi cho lớp học (Chuyển trạng thái `PUBLISHED`) |
| **PATCH** | `/api/v1/quizzes/{id}/unpublish` | `hasAuthority('ASSESSMENT_MANAGE')` | Hủy công bố đề thi (Chuyển về `DRAFT`) |
| **POST** | `/api/v1/quizzes/{id}/questions` | `hasAuthority('ASSESSMENT_MANAGE')` | Thêm câu hỏi đơn lẻ: `{ "questionId": "uuid...", "point": 1.0, "orderIndex": 1 }` |
| **POST** | `/api/v1/quizzes/{id}/questions/batch` | `hasAuthority('ASSESSMENT_MANAGE')` | Thêm câu hỏi theo lô (`BatchQuizQuestionRequestDTO`) |
| **DELETE** | `/api/v1/quizzes/{id}/questions/{questionId}` | `hasAuthority('ASSESSMENT_MANAGE')` | Xóa câu hỏi khỏi đề kiểm tra |
| **POST** | `/api/v1/quizzes/generate-ai` | `hasAuthority('ASSESSMENT_MANAGE')` | Khởi tạo đề thi / Exam Blueprint bằng AI từ Syllabus hoặc tài liệu |
| **POST** | `/api/v1/quizzes/import` | `hasAuthority('ASSESSMENT_MANAGE')` | Nhập đề thi từ file Excel (.xlsx) hoặc Moodle XML |
| **GET** | `/api/v1/quizzes/{id}/export` | `hasAuthority('CLASS_VIEW')` | Xuất đề thi hoặc bảng điểm (`?format=xlsx` hoặc `pdf`) |

#### Payload `QuizRequestDTO`:
```json
{
  "classId": "9c9c9c9c-0000-0000-0000-000000000001",
  "title": "Kiểm tra 15 phút: Chuẩn hóa CSDL",
  "description": "Làm bài trắc nghiệm 10 câu",
  "status": "PUBLISHED",
  "chapter": "Chương 4: Chuẩn hóa CSDL & Dạng chuẩn 3NF/BCNF",
  "durationMinutes": 15,
  "maxAttempts": 2,
  "passingScore": 5.0,
  "scoringStrategy": "HIGHEST_SCORE",
  "shuffleQuestions": true,
  "shuffleAnswers": true,
  "fullscreenLock": true,
  "tabSwitchLimit": 3,
  "lockAnswersUntilDeadline": true,
  "proctoringEnabled": true,
  "ploIds": ["9c9c9c9c-0000-0000-0000-000000000003", "9c9c9c9c-0000-0000-0000-000000000005"],
  "startTime": "2026-11-20T08:00:00Z",
  "endTime": "2026-11-20T23:59:59Z"
}
```
*(Trường `status`: `DRAFT`, `PUBLISHED`, `LIVE`, `COMPLETED`, `ARCHIVED`.*  
*Trường `scoringStrategy`: `HIGHEST_SCORE`, `LATEST_ATTEMPT`, `AVERAGE_SCORE`).*

#### Payload `BatchQuizQuestionRequestDTO`:
```json
{
  "questions": [
    { "questionId": "9c9c9c9c-0000-0000-0000-000000000011", "point": 1.0, "orderIndex": 1 },
    { "questionId": "9c9c9c9c-0000-0000-0000-000000000012", "point": 1.0, "orderIndex": 2 }
  ]
}
```

#### Payload Sinh đề AI `QuizGenerateAiRequestDTO`:
```json
{
  "classId": "9c9c9c9c-0000-0000-0000-000000000001",
  "prompt": "Tạo 20 câu hỏi trắc nghiệm đánh giá kiến thức Tầng Giao vận TCP/UDP",
  "documentSourceUrl": "https://storage.ilms.edu.vn/materials/Chapter4_Transport_Layer.pdf",
  "questionCount": 20,
  "difficultyDistribution": {
    "remember": 30,
    "understand": 40,
    "apply": 20,
    "analyze": 10
  }
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

### 10.3. Giám sát Phòng thi Trực tuyến & Chống gian lận (Quiz Proctoring & Live Monitoring)

Base path: `/api/v1/quizzes/{id}/proctor`

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/quizzes/{id}/proctor/sessions` | `hasAuthority('ASSESSMENT_MANAGE')` | Lấy danh sách trạng thái trực tiếp của các thí sinh trong phòng thi |
| **POST** | `/api/v1/quizzes/{id}/proctor/events` | `hasAuthority('SUBMISSION_CREATE')` | Ghi nhận sự kiện vi phạm (Chuyển tab, mất tiêu điểm, nghi vấn camera) |

#### Payload `ProctorViolationEventDTO`:
```json
{
  "attemptId": "uuid...",
  "eventType": "TAB_SWITCH",
  "detail": "Rời khỏi màn hình làm bài lần thứ 2",
  "occurredAt": "2026-11-20T08:15:30Z"
}
```
*(Trường `eventType`: `TAB_SWITCH`, `FULLSCREEN_EXIT`, `MULTIPLE_FACES`, `NO_FACE`, `COPY_PASTE`).*


---


### 10.4. Khiếu nại Điểm thi & Phúc khảo Quiz (Quiz Complaints & Regrading)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/quizzes/{id}/complaints` | `hasAuthority('ASSESSMENT_MANAGE')` | Danh sách các khiếu nại chấm lại của bài Quiz |
| **POST** | `/api/v1/quizzes/{id}/complaints` | `hasAuthority('SUBMISSION_CREATE')` | Sinh viên gửi đơn khiếu nại điểm câu hỏi |
| **POST** | `/api/v1/complaints/{id}/resolve` | `hasAuthority('ASSESSMENT_MANAGE')` | Giảng viên xử lý khiếu nại (Đồng ý sửa điểm hoặc bác đơn) |

#### Payload `ResolveComplaintRequestDTO`:
```json
{
  "status": "APPROVED",
  "adjustedScore": 8.5,
  "instructorNote": "Đồng ý câu hỏi #14 có cách diễn đạt gây hiểu nhầm về Backoff time. Đã cộng 0.5 điểm."
}
```
*(Trường `status`: `APPROVED`, `REJECTED`).*


---


### 10.5. Thống kê & Phổ điểm Quiz Toàn lớp (Quiz Analytics & Bloom Distribution)

| Method | Endpoint | Quyền hạn (SpEL) | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/quizzes/{id}/analytics` | `hasAuthority('CLASS_VIEW')` | Thống kê phổ điểm, độ phân cách, tỉ lệ đạt chuẩn PLO và phân bố Bloom |

#### Response mẫu `QuizAnalyticsResponseDTO`:
```json
{
  "quizId": "uuid...",
  "totalParticipants": 58,
  "averageScore": 8.2,
  "highestScore": 10.0,
  "lowestScore": 4.5,
  "passRate": 88.0,
  "scoreDistribution": {
    "0-4": 2,
    "5-6": 5,
    "7-8": 25,
    "9-10": 26
  },
  "bloomDistribution": {
    "remember": 85.0,
    "understand": 80.5,
    "apply": 74.0,
    "analyze": 68.5
  },
  "discriminationIndex": 0.74
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
  "fileAttachmentUrl": "https://res.cloudinary.com/.../debai.pdf"
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
    "https://res.cloudinary.com/.../baocao.pdf"
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

## 14. Tải lên Tệp tin Đa phương tiện (Cloudinary Uploads)

Base path: `/api/v1/uploads`  
Header bắt buộc: `Content-Type: multipart/form-data`  
*Toàn bộ Controller được bảo vệ bởi `@PreAuthorize("hasAuthority('MATERIAL_UPLOAD')")`.*

| Method | Endpoint | Mô tả | Form Data Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/uploads` | Tải lên tệp tin tổng hợp (ảnh/video/PDF/Word) | `file` (MultipartFile), `folder` (optional string) |
| **POST** | `/api/v1/uploads/image` | Tải lên hình ảnh (Avatar, ảnh bìa, sơ đồ) | `file` (ảnh tối đa 10MB), `folder` (optional) |
| **POST** | `/api/v1/uploads/video` | Tải lên video bài giảng | `file` (video tối đa 100MB), `folder` (optional) |
| **DELETE** | `/api/v1/uploads` | Xóa tệp tin đã lưu trên Cloud | Query: `?publicId=ilms/...&resourceType=image` |

#### Phản hồi mẫu `FileUploadResponseDTO`:
```json
{
  "publicId": "ilms/materials/csdl_chuanhoa",
  "url": "http://res.cloudinary.com/.../csdl_chuanhoa.pdf",
  "secureUrl": "https://res.cloudinary.com/.../csdl_chuanhoa.pdf",
  "format": "pdf",
  "resourceType": "raw",
  "bytes": 5242880,
  "originalFilename": "Giao_trinh_chuan_hoa.pdf"
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
  "expected_state_version": 1
}
```

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
| **GET** | `/api/v1/materials/ingestion` | Danh sách các tiến trình xử lý tài liệu (`ingestion_jobs`) |
| **GET** | `/api/v1/materials/ingestion/{jobId}` | Trạng thái chi tiết của job (`QUEUED`, `PROCESSING`, `SUCCESS`, `FAILED`) |
| **GET** | `/api/v1/materials/ingestion/{jobId}/drafts/{revisionId}/graph` | Lấy dữ liệu đồ thị bản nháp sơ bộ do AI sinh ra |
| **POST** | `/api/v1/materials/ingestion/{jobId}/retry` | Thử lại tiến trình nếu bị lỗi |
| **POST** | `/api/v1/materials/ingestion/{jobId}/drafts` | Chỉnh sửa bản nháp đồ thị tri thức (`EditRequest`) |
| **POST** | `/api/v1/materials/ingestion/{jobId}/review` | Giảng viên duyệt bản nháp đồ thị để xuất bản chính thức (`ReviewRequest`) |
| **GET** | `/api/v1/materials/{materialId}/ingestion/{jobId}/file` | Tải xuống tệp gốc của job |

---

### 16.2. Quản lý Đồ thị Tri thức Neo4j (`/api/v1/knowledge-graphs`)

*Toàn bộ Controller được bảo vệ bởi `@PreAuthorize("hasAuthority('KNOWLEDGE_GRAPH_READ')")`.*

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
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
| **GET** | `/api/v1/storage/summary` | `STORAGE_VIEW` | Thống kê tổng quan dung lượng đã dùng, hạn mức gói, % sử dụng, cảnh báo sắp đầy |
| **GET** | `/api/v1/storage/breakdown` | `STORAGE_VIEW` | Phân tích dung lượng chi tiết theo loại file (PDF, DOCX, VIDEO...) và theo môn học |
| **GET** | `/api/v1/storage/files` | `STORAGE_VIEW` | Danh sách tệp cá nhân kèm bộ lọc `courseId`, `fileType`, `search`, sắp xếp theo size/ngày |
| **DELETE** | `/api/v1/storage/files/{materialId}` | `STORAGE_VIEW` | Xóa tài liệu để giải phóng dung lượng lưu trữ |
| **GET** | `/api/v1/subscriptions/plans` | `PLAN_VIEW` | Lấy danh sách các gói dịch vụ đang hoạt động công khai trên hệ thống |
| **GET** | `/api/v1/subscriptions/my-subscription` | `SUBSCRIPTION_MANAGE` | Thông tin gói thuê bao hiện tại, hạn sử dụng, % dung lượng, hạn mức AI, môn học, lớp |
| **POST** | `/api/v1/subscriptions/subscribe` | `SUBSCRIPTION_MANAGE` | Đăng ký hoặc nâng cấp gói dịch vụ mới |
| **POST** | `/api/v1/subscriptions/cancel-auto-renew` | `SUBSCRIPTION_MANAGE` | Hủy tính năng tự động gia hạn gói khi hết chu kỳ |
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
    "limits": {
      "maxStorageBytes": 53687091200,
      "maxStorageFormatted": "50.0 GB",
      "usedStorageBytes": 524288000,
      "usedStorageFormatted": "500.0 MB",
      "storageRemainingBytes": 53162803200,
      "storageRemainingFormatted": "49.5 GB",
      "storageUsagePercentage": 0.98,
      "maxUploadFileSizeBytes": 209715200,
      "maxUploadFileSizeFormatted": "200.0 MB",
      "maxCoursesCreated": 20,
      "currentCoursesCreated": 4,
      "maxClassesCreated": 15,
      "currentClassesCreated": 3,
      "maxStudentsPerClass": 100,
      "aiDailyRequests": 200,
      "knowledgeGraphMonthlyQuota": 50,
      "allowCustomThemes": true,
      "prioritySupport": true
    }
  }
}
```

##### 4. `POST /api/v1/subscriptions/subscribe`

> [!IMPORTANT]
> **Quy tắc cốt lõi về ID (UUID v4):** Tất cả ID thực thể trong hệ thống (`planId`, `userId`, `courseId`, `classId`...) đều là **chuỗi UUID 36 ký tự** chuẩn lấy từ API (ví dụ: `1fa85f64-5717-4562-b3fc-2c963f66afa6`).
> Tuyệt đối không gửi các mock slug tự đặt (như `"plan-pro"`, `"plan-plus"`). Backend hỗ trợ cơ chế linh hoạt nhận diện cả UUID lẫn Plan Code (`"PRO"`, `"PLUS"`, `"ENTERPRISE"`).

Request:
```json
{
  "planId": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
  "paymentMethod": "VNPAY",
  "autoRenew": true,
  "notes": "Nâng cấp gói Pro học kỳ 1"
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

## 18. Bảng Tra cứu Mã Lỗi Hệ thống (ErrorCode Reference)

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
| **409** | `EMAIL_EXISTED` | Email này đã được đăng ký trên hệ thống |
| **409** | `ALREADY_CLASS_MEMBER` | Bạn đã là thành viên của lớp học này rồi |
| **409** | `COURSE_ALREADY_ASSIGNED` | Môn học đã được gán cho lớp này từ trước |
| **409** | `ROOM_SCHEDULE_CONFLICT` | Trùng lịch phòng học vào thời gian đã chọn |
| **409** | `CLASS_OWNER_CANNOT_BE_REMOVED` | Không thể xóa hoặc hạ quyền chủ sở hữu của lớp học |
| **409** | `KNOWLEDGE_GRAPH_CONFLICT` | Đồ thị đã thay đổi. Hãy tải phiên bản hiện hành mới nhất |
| **409** | `PLAN_ALREADY_EXISTS` | Mã gói dịch vụ đã tồn tại trên hệ thống |
| **400** | `CLASS_NOT_DELETED` | Lớp học đang hoạt động bình thường, không thể khôi phục |
| **400** | `COURSE_NOT_DELETED` | Môn học chưa bị xóa nên không thể khôi phục |
| **400** | `MISSING_CORRECT_ANSWER` | Câu hỏi bắt buộc phải có ít nhất một đáp án đúng |
| **400** | `STORAGE_QUOTA_EXCEEDED` | Dung lượng lưu trữ đám mây của bạn đã hết. Vui lòng nâng cấp gói cước hoặc xóa bớt tệp |
| **400** | `FILE_SIZE_EXCEEDED_PLAN_LIMIT` | Kích thước tệp vượt quá giới hạn tối đa của gói tài khoản hiện tại |
| **413** | `FILE_SIZE_EXCEEDED` | Kích thước tệp tin vượt quá giới hạn cho phép |
| **429** | `AI_DAILY_LIMIT_EXCEEDED` | Bạn đã dùng hết lượt hỏi Trợ lý AI hôm nay. Vui lòng quay lại vào ngày mai hoặc nâng cấp gói Pro |
| **502** | `SOCRATIC_STREAM_FAILED` | Kết nối gia sư AI bị gián đoạn. Vui lòng thử lại |
| **502** | `KNOWLEDGE_GRAPH_UNAVAILABLE` | Dịch vụ đồ thị tri thức tạm thời không khả dụng |
