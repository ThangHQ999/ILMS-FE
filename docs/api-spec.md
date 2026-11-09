# API SPEC — ILMS (Intelligent Learning Management System)

> **Status: OFFICIALLY ALIGNED CONTRACT.**  
> Đồng bộ 100% với Backend Spring Boot 3.3.4 (`com.example.ilms`).  
> Tài liệu chuẩn cho Frontend (Next.js / React / Axios / TanStack Query) kết nối và tích hợp toàn diện.

---

## 1. Quy ước chung (Conventions & Envelope)

### 1.1. Base URL & Protocol
- **Base URL:** `NEXT_PUBLIC_API_URL` (Mặc định dev: `http://localhost:8080/api/v1`)
- **Format:** `application/json; charset=UTF-8`
- **Mã định danh (ID):** UUID v4 dạng chuỗi chuẩn (`36 ký tự`, ví dụ: `9c9c9c9c-9c9c-9c9c-9c9c-9c9c9c9c9c01`).
- **Thời gian (Date/Time):** ISO-8601 UTC string (`yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`).
- **Ngôn ngữ:** Hỗ trợ header `Accept-Language: vi|en` (mặc định tiếng Việt).

### 1.2. Cơ chế Xác thực (Authentication & Cookie Lifecycle)
- **Kiến trúc:** Stateless JWT lưu ngầm an toàn qua **HttpOnly Cookie** (`Set-Cookie` từ server):
  - `access-token`: Thời hạn 24h, tự động đính kèm trên mọi request.
  - `refresh-token`: Thời hạn 7 ngày, dùng để tự động xoay vòng và làm mới phiên đăng nhập.
- **Lưu ý đặc biệt cho Axios / Fetch trên Frontend:**
  ```typescript
  // Axios instance cấu hình bắt buộc:
  export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
    withCredentials: true, // BẮT BUỘC để trình duyệt tự gửi & nhận HttpOnly Cookie
    headers: {
      "Content-Type": "application/json",
    },
  });
  ```
  *(Backend không trả JWT trong body JSON của `/auth/login`, mà cấp qua `Set-Cookie` header).*

---

### 1.3. Cấu trúc Response chuẩn

#### Success Envelope (`ApiResponse<T>`)
Áp dụng cho mọi API trả về đơn lẻ hoặc danh sách tĩnh:
```json
{
  "status": 0,
  "message": "Thành công",
  "data": { },
  "timestamp": "2026-11-08T18:30:00.000Z"
}
```

#### Paginated Envelope (`PageResponse<T>` / `PaginatedData<T>`)
Áp dụng cho các endpoint tìm kiếm, phân trang (`data` là object phân trang):
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
  "timestamp": "2026-11-08T18:30:00.000Z"
}
```
*Query Params chuẩn:* `?page=0&size=10&search=keyword&sort=createdAt,desc` *(Lưu ý: Spring Boot sử dụng số trang bắt đầu từ 0)*.

#### Error Envelope (`ErrorResponse`)
Khi xảy ra lỗi (4xx, 5xx):
```json
{
  "status": 40001,
  "message": "Tên khóa học đã tồn tại trong hệ thống",
  "timestamp": "2026-11-08T18:30:00.000Z",
  "errors": {
    "email": "Email không hợp lệ",
    "password": "Mật khẩu phải có ít nhất 6 ký tự"
  }
}
```

---

## 2. Phân hệ Xác thực & OAuth2 (Auth & OAuth2)

### 2.1. Xác thực truyền thống (`/api/v1/auth`)

| Method | Endpoint | Quyền hạn | Mô tả | Request Body | Response Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Public | Đăng ký tài khoản mới | `RegisterRequestDTO` | `UserResponseDTO` |
| **POST** | `/api/v1/auth/login` | Public | Đăng nhập hệ thống | `LoginRequestDTO` | `UserResponseDTO` (+ Cookies) |
| **POST** | `/api/v1/auth/logout` | User | Đăng xuất (xóa Cookie) | None | `null` |
| **GET** | `/api/v1/auth/me` | User | Lấy thông tin tài khoản đang login | None | `UserResponseDTO` |
| **GET** | `/api/v1/auth/send-email-forgot-password` | Public | Gửi mail quên mật khẩu (Query: `?email=...`) | None | `null` |
| **POST** | `/api/v1/auth/forgot-password` | Public | Gửi link reset mật khẩu vào email | `ForgotPasswordRequestDTO` | `null` |
| **GET** | `/api/v1/auth/verify-reset-token` | Public | Xác thực token reset (Query: `?token=...`) | None | `null` |
| **POST** | `/api/v1/auth/reset-password` | Public | Đặt mật khẩu mới sau khi xác thực | `ResetPasswordRequestDTO` | `null` |
| **POST** | `/api/v1/auth/change-password` | User | Đổi mật khẩu tài khoản | `ChangePasswordRequestDTO` | `null` |

#### Chi tiết Payload `Auth`:
- **`LoginRequestDTO`**:
  ```json
  {
    "email": "student@example.com",
    "password": "Password123@"
  }
  ```
- **`RegisterRequestDTO`**:
  ```json
  {
    "email": "student@example.com",
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
    "email": "student@example.com",
    "firstName": "Hải",
    "middleName": "Thanh",
    "lastName": "Nguyễn"
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

| Method | Endpoint | Quyền | Mô tả | Params / Body |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/auth/oauth/{provider}/url` | Public | Lấy URL ủy quyền (`provider` = `google` hoặc `github`) | Path: `provider` |
| **GET** | `/api/v1/auth/oauth/{provider}/login` | Public | Redirect 302 trực tiếp sang trang đăng nhập của Provider | Path: `provider` |
| **GET** | `/api/v1/auth/oauth/google` | Public | Callback xử lý OAuth2 từ Google (`?code=...`) | Redirect 302 về Frontend kèm Cookie |
| **GET** | `/api/v1/auth/oauth/github` | Public | Callback xử lý OAuth2 từ GitHub (`?code=...`) | Redirect 302 về Frontend kèm Cookie |
| **POST** | `/api/v1/auth/oauth/{provider}` | Public | SPA trực tiếp gửi Authorization Code để đổi Session | Body: `OAuthCodeRequestDTO` |

- **`OAuthCodeRequestDTO`**: `{ "code": "4/0ASVkm...", "state": "optional" }`
- **`OAuthUrlResponseDTO`**: `{ "provider": "google", "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }`

---

## 3. Phân hệ Người dùng & Quản trị Hệ thống (Users, Roles & Permissions)

### 3.1. User API (`/api/v1/users`)
| Method | Endpoint | Quyền | Mô tả | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/users/{id}` | User/Admin | Lấy chi tiết thông tin người dùng | None |
| **PUT** | `/api/v1/users/{id}` | User/Admin | Cập nhật hồ sơ người dùng | `UserUpdateRequestDTO` |
| **PATCH** | `/api/v1/users/{id}/role` | Admin | Cập nhật vai trò hệ thống (`ROLE_ADMIN` / `ROLE_USER`) | `{ "role": "ROLE_ADMIN" }` |

### 3.2. Role API (`/api/v1/roles`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/roles` | Admin | Lấy danh sách vai trò (`?search=&all=false&page=0&size=10`) |
| **GET** | `/api/v1/roles/{id}` | Admin | Chi tiết vai trò kèm danh sách quyền hạn |
| **POST** | `/api/v1/roles` | Admin | Tạo vai trò mới: `{ "code": "MANAGER", "name": "Quản lý", "description": "...", "permissionIds": [] }` |
| **PUT** | `/api/v1/roles/{id}` | Admin | Sửa tên/mô tả vai trò: `{ "name": "...", "description": "..." }` |
| **DELETE** | `/api/v1/roles/{id}` | Admin | Xóa vai trò (chặn xóa role hệ thống hoặc role đang có user) |
| **GET** | `/api/v1/roles/{id}/permissions` | Admin | Lấy danh sách quyền hạn đang gán cho vai trò |
| **PUT** | `/api/v1/roles/{id}/permissions` | Admin | Cập nhật toàn bộ quyền cho vai trò: `{ "permissionIds": ["uuid-1", "uuid-2"] }` |

### 3.3. Permission API (`/api/v1/permissions`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/permissions` | Admin | Danh sách quyền hạn (`?search=&module=&all=false&page=0&size=20`) |
| **GET** | `/api/v1/permissions/modules` | Admin | Lấy danh mục các module phân quyền (`List<String>`) |
| **GET** | `/api/v1/permissions/{id}` | Admin | Chi tiết quyền hạn |
| **POST** | `/api/v1/permissions` | Admin | Tạo quyền: `{ "code": "COURSE_CREATE", "name": "...", "module": "COURSE", "description": "..." }` |
| **PUT** | `/api/v1/permissions/{id}` | Admin | Sửa quyền: `{ "name": "...", "module": "COURSE", "description": "..." }` |
| **DELETE** | `/api/v1/permissions/{id}` | Admin | Xóa quyền |

---

## 4. Phân hệ Khóa học (Courses)

Base path: `/api/v1/courses`

| Method | Endpoint | Quyền | Mô tả | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/courses` | User | Tìm kiếm khóa học | `?search=&status=&semester=&academicYear=&page=0&size=10` |
| **GET** | `/api/v1/courses/{id}` | User | Chi tiết khóa học theo ID | None |
| **GET** | `/api/v1/courses/users/{userId}` | User/Admin | Danh sách khóa học được gán cho một người dùng | `?page=0&size=10` |
| **POST** | `/api/v1/courses` | Teacher/Admin | Tạo mới khóa học | `CourseCreateRequestDTO` |
| **PUT** | `/api/v1/courses/{id}` | Owner/Admin | Cập nhật thông tin môn học | `CourseUpdateRequestDTO` |
| **PATCH** | `/api/v1/courses/{id}/instructor` | Owner/Admin | Đổi giảng viên phụ trách | `{ "instructorId": "uuid..." }` |
| **DELETE** | `/api/v1/courses/{id}/soft` | Owner/Admin | Xóa mềm khóa học (`deleted_at`) | None |
| **PATCH** | `/api/v1/courses/{id}/restore` | Admin | Khôi phục khóa học đã xóa mềm | None |
| **GET** | `/api/v1/courses/{courseId}/content` | Member/Teacher | Cây nội dung toàn bộ khóa học (Chương + Bài học) | Trả về `CourseContentTreeResponseDTO` |

#### Payload mẫu `CourseUpdateRequestDTO`:
```json
{
  "title": "Cấu trúc dữ liệu và giải thuật nâng cao",
  "description": "Môn học chuyên sâu về đồ thị và cây",
  "code": "DSA2026",
  "credits": 3,
  "coverImageUrl": "https://res.cloudinary.com/..."
}
```

---

## 5. Phân hệ Chương mục & Bài học (Chapters & Lessons)

### 5.1. Chương học (Chapters)
| Method | Endpoint | Mô tả | Payload / Model |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/courses/{courseId}/chapters` | Lấy danh sách chương của môn học | Trả về `List<ChapterSummaryResponseDTO>` |
| **GET** | `/api/v1/chapters/{chapterId}` | Chi tiết chương học | Trả về `ChapterDetailResponseDTO` |
| **POST** | `/api/v1/courses/{courseId}/chapters` | Tạo chương mới | `ChapterCreateRequestDTO` (`title`, `description`, `orderIndex`) |
| **PUT** | `/api/v1/chapters/{chapterId}` | Sửa tiêu đề, mô tả chương | `ChapterUpdateRequestDTO` (`title`, `description`) |
| **PATCH** | `/api/v1/chapters/{chapterId}/order` | Đổi thứ tự hiển thị | `ChapterUpdateOrderRequestDTO` (`orderIndex`) |
| **DELETE** | `/api/v1/chapters/{chapterId}` | Xóa chương (xóa mềm) | None |

### 5.2. Bài học (Lessons)
| Method | Endpoint | Mô tả | Payload / Model |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/chapters/{chapterId}/lessons` | Danh sách bài học trong chương | Trả về `List<LessonSummaryResponseDTO>` |
| **GET** | `/api/v1/lessons/{lessonId}` | Chi tiết bài học | Trả về `LessonDetailResponseDTO` |
| **POST** | `/api/v1/chapters/{chapterId}/lessons` | Tạo bài học mới | `LessonCreateRequestDTO` |
| **PUT** | `/api/v1/lessons/{lessonId}` | Cập nhật bài học | `LessonUpdateRequestDTO` |
| **PATCH** | `/api/v1/lessons/{lessonId}/order` | Đổi vị trí bài học | `LessonUpdateOrderRequestDTO` (`orderIndex`) |
| **DELETE** | `/api/v1/lessons/{lessonId}` | Xóa bài học | None |

#### Payload `LessonCreateRequestDTO`:
```json
{
  "title": "Bài 1: Tổng quan về Đồ thị vô hướng",
  "content": "Nội dung bài giảng markdown hoặc HTML...",
  "lessonType": "VIDEO", // VIDEO, THEORY, QUIZ, ASSIGNMENT
  "orderIndex": 1,
  "isPublished": true,
  "videoUrl": "https://res.cloudinary.com/.../lesson1.mp4",
  "durationSeconds": 3600
}
```

---

## 6. Phân hệ Lớp học & Thành viên (Classes & Members)

Base path: `/api/v1/classes`

### 6.1. Quản lý lớp học (Class Management)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/listClasses` | User | Danh sách lớp học (`?search=&status=&page=0&size=10`) |
| **GET** | `/api/v1/classes/{id}` | Member/Admin | Xem thông tin chi tiết lớp học (`ClassResponseDTO`) |
| **POST** | `/api/v1/classes` | Teacher/Admin | Tạo lớp học mới (`ClassCreateRequestDTO`) |
| **PUT** | `/api/v1/classes/{id}` | Owner/Admin | Cập nhật thông tin lớp (`UpdateClassRequestDTO`) |
| **PATCH** | `/api/v1/classes/{id}/code-status` | Owner/Teacher | Đóng/mở mã tham gia lớp (`?isClosed=true|false`) |
| **PATCH** | `/api/v1/classes/{id}/owner` | Owner/Admin | Chuyển quyền chủ lớp: `{ "ownerId": "uuid..." }` |
| **DELETE** | `/api/v1/classes/{id}/soft` | Owner/Admin | Xóa lớp học (xóa mềm `deleted_at`) |
| **PATCH** | `/api/v1/classes/{id}/restore` | Admin | Khôi phục lớp học bị xóa mềm |
| **DELETE** | `/api/v1/classes/{id}/hard` | Admin | Xóa vĩnh viễn lớp học |

#### Payload `ClassCreateRequestDTO`:
```json
{
  "name": "D21CNPM01",
  "title": "Lớp Công nghệ phần mềm 01 - K21",
  "description": "Lớp chuyên ngành kỹ nghệ phần mềm",
  "academicYear": "2021-2026",
  "major": "Công nghệ thông tin",
  "maxStudents": 60,
  "enrollmentKey": "MATKHAU123"
}
```

### 6.2. Thành viên & Lời mời (Class Members & Invitations)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/members` | Member | Danh sách thành viên (`?status=&role=&page=0&size=10`) |
| **GET** | `/api/v1/classes/{classId}/members/{userId}` | Member | Xem chi tiết 1 thành viên |
| **POST** | `/api/v1/classes/join-by-code` | User | Học sinh tham gia lớp bằng mã: `{ "classCode": "AB12CD" }` |
| **POST** | `/api/v1/classes/{classId}/members/invite-by-email` | Owner/Teacher | Mời thành viên: `{ "email": "user@gmail.com", "role": "STUDENT" }` |
| **POST** | `/api/v1/classes/invitations/accept` | User | Chấp nhận lời mời tham gia: `{ "token": "uuid-token" }` |
| **POST** | `/api/v1/classes/{classId}/approve` | Owner/Teacher | Duyệt học viên vào lớp: `{ "userId": "uuid..." }` |
| **PATCH** | `/api/v1/classes/{classId}/members/{userId}/role` | Owner | Đổi role lớp (`TEACHER`/`STUDENT`): `{ "role": "TEACHER" }` |
| **DELETE** | `/api/v1/classes/{classId}/members/{userId}` | Owner/Teacher | Xóa thành viên ra khỏi lớp |
| **POST** | `/api/v1/classes/{classId}/leave` | Student | Tự rời khỏi lớp học |

### 6.3. Gán Môn học vào Lớp (`/api/v1/classes/{classId}/courses`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/courses` | Member | Danh sách môn học được giảng dạy trong lớp này |
| **POST** | `/api/v1/classes/{classId}/courses` | Admin | Gán 1 môn học vào lớp (`AssignCourseToClassRequestDTO`) |
| **POST** | `/api/v1/classes/{classId}/courses/batch` | Admin | Gán hàng loạt môn học (`BatchAssignCoursesRequestDTO`) |

---

## 7. Phân hệ Xếp lịch học, Phòng học & Điểm danh (Scheduling, Rooms & Attendance)

### 7.1. Phòng học (`/api/v1/rooms`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/rooms` | User | Lấy danh sách phòng học (`List<RoomResponseDTO>`) |
| **POST** | `/api/v1/rooms` | Admin | Thêm phòng học: `{ "name": "A2-301", "type": "LAB", "description": "Phòng máy tính 40 máy" }` |
| **PUT** | `/api/v1/rooms/{roomId}` | Admin | Sửa thông tin phòng |
| **DELETE** | `/api/v1/rooms/{roomId}` | Admin | Xóa phòng học |

### 7.2. Buổi học & Điểm danh (`/api/v1/classes/{classId}/lessonSessions`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/lessonSessions` | Member | Lấy danh sách buổi học của lớp |
| **POST** | `/api/v1/classes/{classId}/lessonSessions` | Teacher | Tạo lịch buổi học mới (Quan hệ 3 ngôi: Lớp + Phòng + Ca) |
| **GET** | `/api/v1/classes/{classId}/lessonSessions/{sessionId}/attendances` | Teacher | Lấy bảng điểm danh buổi học |
| **POST** | `/api/v1/classes/{classId}/lessonSessions/{sessionId}/attendances` | Teacher | Điểm danh hàng loạt học sinh |

#### Payload `LessonSessionCreateDTO`:
```json
{
  "roomId": "9c9c9c9c-0000-0000-0000-000000000001",
  "timeSlotId": "9c9c9c9c-0000-0000-0000-000000000002",
  "sessionDate": "2026-11-15",
  "note": "Học thực hành Module 3"
}
```

#### Payload Điểm danh `BatchAttendanceRequestDTO`:
```json
{
  "attendances": [
    {
      "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "status": "PRESENT", // PRESENT, ABSENT, LATE, EXCUSED
      "note": "Có mặt đúng giờ"
    }
  ]
}
```

---

## 8. Bảng tin Lớp học & Thông báo Realtime SSE (Announcements)

Base path: `/api/v1/classes`

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/class/{classId}/Announcements` | Member | Lấy danh sách bài đăng thông báo lớp (`PageResponse<AnnouncementResponseDTO>`) |
| **POST** | `/api/v1/classes/class/{classId}/Announcements` | Teacher | Đăng thông báo mới: `{ "title": "...", "content": "..." }` |
| **PATCH** | `/api/v1/classes/class/{classId}/Announcements/{id}/pin` | Teacher | Ghim / Bỏ ghim bài đăng thông báo |
| **GET** | `/api/v1/classes/{classId}/announcements/stream` | Member | **SSE Stream (Realtime)** lắng nghe thông báo mới tức thì |

---

## 9. Ngân hàng Câu hỏi & Khái niệm Kiến thức (Questions & Concepts)

### 9.1. Nhãn Khái niệm Kiến thức (`/api/v1/question-concepts`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **GET** | `/api/v1/question-concepts` | Lấy danh sách khái niệm (`?keyword=...`) |
| **GET** | `/api/v1/question-concepts/{id}` | Xem chi tiết khái niệm |
| **POST** | `/api/v1/question-concepts` | Tạo khái niệm: `{ "code": "BCNF", "name": "Chuẩn BCNF", "description": "..." }` |
| **PUT** | `/api/v1/question-concepts/{id}` | Cập nhật khái niệm |
| **DELETE** | `/api/v1/question-concepts/{id}` | Xóa khái niệm |

### 9.2. Ngân hàng câu hỏi (`/api/v1/questions`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| **GET** | `/api/v1/questions` | Tìm kiếm câu hỏi (`?search=&page=0&size=10`) |
| **GET** | `/api/v1/questions/{id}` | Xem chi tiết câu hỏi kèm đáp án |
| **POST** | `/api/v1/questions` | Tạo câu hỏi mới (`QuestionRequestDTO`) |
| **PUT** | `/api/v1/questions/{id}` | Cập nhật câu hỏi |
| **DELETE** | `/api/v1/questions/{id}` | Xóa câu hỏi |

#### Payload mẫu `QuestionRequestDTO`:
```json
{
  "content": "Điều kiện nào sau đây là bắt buộc để một lược đồ quan hệ đạt chuẩn 3NF?",
  "questionType": "SINGLE_CHOICE", // SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, ESSAY
  "difficultyLevel": "MEDIUM",      // EASY, MEDIUM, HARD
  "explanation": "Thuộc tính không khóa phải phụ thuộc trực tiếp vào khóa chính, không bắc cầu.",
  "answers": [
    { "content": "Mọi phụ thuộc hàm X -> A thì A là thuộc tính khóa hoặc X là siêu khóa", "isCorrect": true },
    { "content": "Không có thuộc tính đa trị", "isCorrect": false }
  ],
  "conceptIds": ["uuid-concept-1"]
}
```

---

## 10. Đề kiểm tra Trắc nghiệm (Quizzes)

Base path: `/api/v1/quizzes`

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/quizzes` | User | Danh sách bài quiz (`?page=0&size=10`) |
| **GET** | `/api/v1/quizzes/{id}` | User | Chi tiết bài quiz kèm danh sách câu hỏi |
| **POST** | `/api/v1/quizzes` | Teacher | Tạo bài kiểm tra trắc nghiệm mới |
| **PUT** | `/api/v1/quizzes/{id}` | Teacher | Cập nhật cấu hình bài quiz |
| **DELETE** | `/api/v1/quizzes/{id}` | Teacher | Xóa bài quiz |
| **POST** | `/api/v1/quizzes/{id}/questions` | Teacher | Thêm câu hỏi vào đề: `{ "questionId": "uuid...", "orderIndex": 1, "point": 1.0 }` |
| **DELETE** | `/api/v1/quizzes/{id}/questions/{questionId}` | Teacher | Xóa câu hỏi khỏi đề thi |

---

## 11. Bài tập, Nộp bài & Chấm điểm (Assignments, Submissions & Gradings)

### 11.1. Bài tập về nhà (`/api/v1`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/assignments` | Member | Lấy danh sách bài tập của lớp |
| **GET** | `/api/v1/assignments/{id}` | Member | Xem chi tiết bài tập |
| **POST** | `/api/v1/classes/{classId}/assignments` | Teacher | Giao bài tập mới (`AssignmentRequestDTO`) |
| **DELETE** | `/api/v1/assignments/{id}` | Teacher | Xóa bài tập |

#### Payload `AssignmentRequestDTO`:
```json
{
  "courseId": "9c9c9c9c-0000-0000-0000-000000000001",
  "lessonId": "9c9c9c9c-0000-0000-0000-000000000003",
  "title": "Bài tập lớn: Thiết kế CSDL Chuẩn 3NF",
  "description": "Viết báo cáo phân tích lược đồ quan hệ và chuẩn hóa",
  "dueDate": "2026-11-30T23:59:59Z",
  "fileAttachmentUrl": "https://res.cloudinary.com/.../debai.pdf"
}
```

### 11.2. Nộp bài (Submissions)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/assignments/{assignmentId}/submissions` | Teacher | Danh sách bài nộp của cả lớp |
| **GET** | `/api/v1/assignments/{assignmentId}/my-submission` | Student | Xem bài nộp của chính mình |
| **GET** | `/api/v1/submissions/{id}` | Member | Chi tiết một bài nộp |
| **POST** | `/api/v1/assignments/{assignmentId}/submissions` | Student | Nộp bài: `{ "content": "Link github...", "attachmentIds": [] }` |
| **PATCH** | `/api/v1/submissions/{id}/grade` | Teacher | Chấm điểm bài nộp: `{ "score": 9.5, "feedback": "Rất tốt" }` |
| **POST** | `/api/v1/assignments/{assignmentId}/submissions/grade/batch` | Teacher | Chấm điểm hàng loạt học sinh |
| **DELETE** | `/api/v1/submissions/{id}` | Student/Teacher | Hủy/xóa bài nộp |

### 11.3. Chấm điểm độc lập (`/api/v1/gradings`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/submissions/{submissionId}/grading` | Teacher | Tạo phiếu chấm điểm mới |
| **GET** | `/api/v1/submissions/{submissionId}/grading` | Member | Lấy phiếu chấm điểm theo submission |
| **GET** | `/api/v1/gradings/{id}` | Member | Chi tiết phiếu chấm |
| **POST** | `/api/v1/gradings/batch` | Teacher | Nhập điểm hàng loạt |
| **DELETE** | `/api/v1/gradings/{id}` | Teacher | Xóa bản ghi điểm |

---

## 12. Kỳ thi & Đề thi tự luận/tổng hợp (Exams & Questions)

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/classes/{classId}/exams` | Member | Danh sách kỳ thi của lớp |
| **GET** | `/api/v1/exams/{id}` | Member | Xem chi tiết kỳ thi |
| **POST** | `/api/v1/classes/{classId}/exams` | Teacher | Tạo kỳ thi mới (`ExamRequestDTO`) |
| **PATCH** | `/api/v1/exams/{id}/publish` | Teacher | Công bố đề thi cho học sinh |
| **PATCH** | `/api/v1/exams/{id}/unpublish` | Teacher | Đóng/hủy công bố đề |
| **DELETE** | `/api/v1/exams/{id}` | Teacher | Xóa kỳ thi |
| **GET** | `/api/v1/exams/{examId}/questions` | Member | Danh sách câu hỏi trong đề thi |
| **POST** | `/api/v1/exams/{examId}/questions/consumes` | Teacher | Gán câu hỏi vào đề: `{ "questionId": "uuid...", "score": 2.0, "orderIndex": 1 }` |
| **DELETE** | `/api/v1/exams/{examId}/questions/{id}` | Teacher | Xóa câu hỏi khỏi đề thi |

---

## 13. Tải lên Tệp tin (Cloudinary Uploads)

Base path: `/api/v1/uploads`  
Header: `Content-Type: multipart/form-data`

| Method | Endpoint | Mô tả | Form Data Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/uploads` | Tải file tổng hợp (ảnh/video/tài liệu) | `file` (MultipartFile), `folder` (string optional) |
| **POST** | `/api/v1/uploads/image` | Tải ảnh (Avatar, bìa khóa học, minh họa) | `file` (MultipartFile, max 10MB) |
| **POST** | `/api/v1/uploads/video` | Tải video bài giảng | `file` (MultipartFile, max 100MB) |
| **DELETE** | `/api/v1/uploads` | Xóa file trên Cloud | Query: `?publicId=ilms/...&resourceType=image` |

#### Trả về mẫu `FileUploadResponseDTO`:
```json
{
  "publicId": "ilms/materials/document_sample",
  "url": "http://res.cloudinary.com/.../document_sample.pdf",
  "secureUrl": "https://res.cloudinary.com/.../document_sample.pdf",
  "format": "pdf",
  "resourceType": "raw",
  "bytes": 5242880,
  "originalFilename": "Giao_trinh_CSDL.pdf"
}
```

---

## 14. Gia sư AI Socratic & SSE Stream Protocol 2 (Socratic AI Tutor)

Base path: `/api/v1/student/chat`

### 14.1. Quản lý Phiên hội thoại Socratic (Sessions)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/student/chat/sessions` | Student | Lấy danh sách lịch sử phiên chat (`?page=0&size=15`) |
| **GET** | `/api/v1/student/chat/sessions/{sessionId}` | Student | Chi tiết phiên chat kèm lịch sử tin nhắn & step metadata |
| **PATCH** | `/api/v1/student/chat/sessions/{sessionId}` | Student | Đổi tên tiêu đề phiên chat |
| **DELETE** | `/api/v1/student/chat/sessions/{sessionId}` | Student | Xóa phiên hội thoại |
| **PATCH** | `/api/v1/student/chat/messages/{messageId}/feedback` | Student | Đánh giá tin nhắn: `{ "feedback_rating": "LIKE", "user_feedback": "Giải thích rất dễ hiểu" }` |

---

### 14.2. SSE Stream Protocol 2 (`/api/v1/student/chat/stream`)
- **HTTP Method:** `POST`
- **Headers:** `Accept: text/event-stream`, `Content-Type: application/json`
- **Request Body (`SocraticChatStreamRequestDto`):**
  ```json
  {
    "session_id": "9c9c9c9c-0000-0000-0000-000000000001",
    "subject": "CSDL",
    "message": "Em chưa hiểu vì sao chuẩn BCNF lại chặt chẽ hơn chuẩn 3NF?",
    "material_ids": ["uuid-material-1"],
    "active_canonical_code": "CHUAN_HOA_BCNF",
    "client_request_id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    "expected_state_version": 1
  }
  ```

#### Quy ước các Server-Sent Events (SSE Events) theo Protocol 2:
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
| **`done`** | Hoàn thành turn, xác nhận đã lưu DB thành công | `{ "message_id": "uuid", "full_content": "...", "step_progress": { ... } }` |
| **`error`** | Báo lỗi gián đoạn | `{ "error_code": "SOCRATIC_STREAM_FAILED", "message": "Lỗi kết nối AI" }` |

*Lưu ý xử lý phía Frontend:*
- Các dòng comment (`: heartbeat`) gửi định kỳ 15 giây để chống timeout kết nối; Frontend bỏ qua comment này.
- Khi nhận event `token`, nối dần vào giao diện. Khi nhận `done`, lấy `done.full_content` để chốt nội dung cuối cùng và hiển thị stepper từ `step_progress`.

---

## 15. Xử lý Tài liệu & Đồ thị Tri thức (Material Ingestion & Knowledge Graphs)

### 15.1. Ingestion Pipeline (`/api/v1/materials`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/materials` | Teacher | Upload tài liệu giáo trình (`multipart/form-data: file`) để đưa vào pipeline AI |
| **GET** | `/api/v1/materials/ingestion` | Teacher | Danh sách các tiến trình xử lý tài liệu (`ingestion_jobs`) |
| **GET** | `/api/v1/materials/ingestion/{jobId}` | Teacher | Trạng thái chi tiết của job (`QUEUED`, `PROCESSING`, `SUCCESS`, `FAILED`) |
| **GET** | `/api/v1/materials/ingestion/{jobId}/drafts/{revisionId}/graph` | Teacher | Lấy dữ liệu đồ thị bản nháp sơ bộ do AI sinh ra |
| **POST** | `/api/v1/materials/ingestion/{jobId}/review` | Teacher | Giảng viên duyệt bản nháp đồ thị để xuất bản chính thức |
| **POST** | `/api/v1/materials/ingestion/{jobId}/retry` | Teacher | Thử lại tiến trình nếu bị lỗi |

### 15.2. Quản lý Đồ thị Tri thức Neo4j (`/api/v1/knowledge-graphs`)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/knowledge-graphs/published` | User | Lấy đồ thị tri thức đã xuất bản của môn học |
| **GET** | `/api/v1/knowledge-graphs/published/concepts/{canonicalCode}` | User | Chi tiết 1 khái niệm, định nghĩa, quy trình, bài tập |
| **GET** | `/api/v1/knowledge-graphs/materials/{materialId}/revisions` | Teacher | Lịch sử các phiên bản đồ thị (`material_publications`) |
| **POST** | `/api/v1/knowledge-graphs/drafts/{jobId}/changes` | Teacher | Chỉnh sửa Node/Edge trên bản nháp đồ thị |
| **POST** | `/api/v1/knowledge-graphs/materials/{materialId}/publications/{id}/withdraw` | Teacher | Thu hồi phiên bản đồ thị đã xuất bản |

---

## 16. Bảng tra cứu Mã lỗi Hệ thống (ErrorCode Reference)

Dành cho Frontend Interceptor hiển thị thông báo Toast / Alert chính xác:

| HTTP Status | ErrorCode | Thông báo hiển thị Tiếng Việt |
| :---: | :--- | :--- |
| **401** | `UNAUTHORIZED` | Yêu cầu xác thực tài khoản |
| **401** | `INVALID_TOKEN` / `TOKEN_EXPIRED` | Token không hợp lệ hoặc đã hết hạn |
| **401** | `PASSWORD_INCORRECT` | Mật khẩu không chính xác |
| **401** | `INVALID_CREDENTIALS` | Email hoặc mật khẩu không chính xác |
| **403** | `CLASS_ACCESS_DENIED` | Bạn không có quyền thực hiện thao tác trong lớp này |
| **403** | `COURSE_FORBIDDEN` | Bạn không có quyền thao tác với môn học này |
| **403** | `CHAPTER_FORBIDDEN` | Bạn không có quyền quản lý chương học này |
| **403** | `LESSON_FORBIDDEN` | Bạn không có quyền quản lý bài học này |
| **404** | `USER_NOT_FOUND` | Không tìm thấy người dùng |
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
| **409** | `EMAIL_EXISTED` | Email đã được đăng ký trên hệ thống |
| **409** | `ALREADY_CLASS_MEMBER` | Bạn đã là thành viên của lớp học này rồi |
| **409** | `COURSE_ALREADY_ASSIGNED` | Môn học đã được gán cho lớp này từ trước |
| **409** | `ROOM_SCHEDULE_CONFLICT` | Trùng lịch phòng học vào thời gian đã chọn |
| **409** | `CLASS_OWNER_CANNOT_BE_REMOVED` | Không thể xóa chủ sở hữu khỏi lớp học |
| **409** | `KNOWLEDGE_GRAPH_CONFLICT` | Đồ thị đã thay đổi. Hãy tải revision hiện hành |
| **400** | `CLASS_NOT_DELETED` | Lớp học đang hoạt động bình thường, không thể khôi phục |
| **400** | `COURSE_NOT_DELETED` | Môn học chưa bị xóa nên không thể khôi phục |
| **400** | `MISSING_CORRECT_ANSWER` | Câu hỏi bắt buộc phải có ít nhất một đáp án đúng |
| **413** | `FILE_SIZE_EXCEEDED` | Kích thước tệp vượt quá giới hạn cho phép |
| **502** | `SOCRATIC_STREAM_FAILED` | Kết nối gia sư AI bị gián đoạn. Vui lòng thử lại |
| **502** | `KNOWLEDGE_GRAPH_UNAVAILABLE` | Dịch vụ đồ thị tạm thời không khả dụng |
