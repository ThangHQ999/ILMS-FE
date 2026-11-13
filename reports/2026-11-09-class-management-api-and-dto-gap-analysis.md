# BÁO CÁO PHÂN TÍCH KHOẢNG TRỐNG API & DTO PHÂN HỆ LỚP HỌC (CLASS MANAGEMENT)

- **Dự án:** ILMS - Hệ thống quản lý học tập thông minh tích hợp AI
- **Ngày lập:** 09/11/2026
- **Phân hệ:** Quản lý Lớp học (`classes`) — Gồm **Trang Danh sách lớp học** (`/classes`) và **Trang Chi tiết lớp học** (`/classes/[classId]`)
- **Tài liệu tham chiếu:** `docs/api-spec.md` (Mục 6, 7, 8) và 2 bản thiết kế HTML Mockup từ người dùng.
- **Mục đích:** Rà soát toàn bộ giao diện người dùng (UI/UX) đã thiết kế, đối chiếu với đặc tả API Spring Boot hiện tại để lập danh mục chi tiết các API cần bổ sung và các trường DTO còn thiếu, phục vụ bàn giao và đồng bộ với đội ngũ Backend.

---

## 1. TỔNG QUAN HIỆN TRẠNG DATA LAYER

### A. Các API Backend đã có trong `docs/api-spec.md`
Backend Spring Boot hiện đã quy định một số endpoint cốt lõi cho lớp học:
1. `GET /api/v1/classes/listClasses`: Lấy danh sách lớp (`?search=&status=&page=0&size=10`).
2. `GET /api/v1/classes/{id}`: Xem chi tiết lớp học (`ClassResponseDTO`).
3. `POST /api/v1/classes`: Tạo lớp học mới (`ClassCreateRequestDTO`).
4. `PUT /api/v1/classes/{id}`: Cập nhật thông tin lớp (`UpdateClassRequestDTO`).
5. `PATCH /api/v1/classes/{id}/code-status`: Đóng/mở mã mời tham gia lớp (`?isClosed=true|false`).
6. `PATCH /api/v1/classes/{id}/owner`: Chuyển quyền chủ lớp.
7. `DELETE /api/v1/classes/{id}/soft`: Xóa mềm lớp học.
8. `PATCH /api/v1/classes/{id}/restore`: Khôi phục lớp xóa mềm.
9. `GET /api/v1/classes/{classId}/members`: Lấy danh sách thành viên.
10. `POST /api/v1/classes/{classId}/approve`: Duyệt học viên vào lớp.
11. `PATCH /api/v1/classes/{classId}/members/{userId}/role`: Đổi quyền thành viên.
12. `DELETE /api/v1/classes/{classId}/members/{userId}`: Xóa thành viên ra khỏi lớp.
13. `GET /api/v1/classes/{classId}/courses`: Lấy danh sách môn học của lớp.
14. `POST /api/v1/classes/{classId}/courses`: Gán môn học vào lớp.
15. `GET /api/v1/classes/class/{classId}/Announcements`: Danh sách bài đăng thông báo.
16. `POST /api/v1/classes/class/{classId}/Announcements`: Đăng thông báo mới.
17. `PATCH /api/v1/classes/class/{classId}/Announcements/{id}/pin`: Ghim bài đăng thông báo.
18. `GET /api/v1/classes/{classId}/announcements/stream`: SSE lắng nghe thông báo thời gian thực.

### B. Khoảng trống (Gaps) so với yêu cầu giao diện thực tế
Mặc dù đã có các API CRUD cơ bản, hệ thống đang **thiếu 12 API chức năng** và **nhiều trường dữ liệu quan trọng trong DTO**, dẫn đến việc giao diện phải tự tính nhẩm, mock hoặc không có endpoint tương ứng để thực hiện thao tác người dùng.

---

## 2. CHI TIẾT CÁC API CÒN THIẾU (MISSING ENDPOINTS)

### Nhóm 1: Thống kê & Bộ lọc Danh sách lớp học (`/classes`)

#### 1.1. Thống kê KPI tổng quan lớp học
- **Method & Endpoint:** `GET /api/v1/classes/kpi-summary`
- **Mục đích:** Cung cấp số liệu cho 4 thẻ KPI Bar đầu trang Danh sách lớp học.
- **Quyền:** `TEACHER`, `ADMIN`
- **Response DTO:**
  ```json
  {
    "status": 200,
    "message": "Success",
    "data": {
      "activeClassesCount": 8,
      "totalStudentsCount": 342,
      "pendingRequestsCount": 14,
      "ungradedAssignmentsCount": 27
    }
  }
  ```
- **Mức độ ưu tiên:** **P1**

#### 1.2. Mở rộng bộ lọc cho API danh sách lớp
- **Method & Endpoint:** `GET /api/v1/classes/listClasses`
- **Hiện trạng:** Chỉ nhận `?search=&status=&page=&size=`.
- **Cần bổ sung Query Params:**
  - `major` *(String)*: Lọc theo chuyên ngành (ví dụ: `Khoa học Máy tính`, `Kỹ thuật Phần mềm`).
  - `semester` *(String)*: Lọc theo học kỳ (ví dụ: `HK1-2026-2027`).
  - `role` *(String: `ALL | PRIMARY_INSTRUCTOR | TA`)*: Lọc lớp mình làm chủ nhiệm hoặc làm trợ giảng.
  - `sort` *(String: `updated_desc | name_asc | students_desc`)*: Sắp xếp theo ngày cập nhật, tên lớp, hoặc số lượng sinh viên.
- **Mức độ ưu tiên:** **P0**

---

### Nhóm 2: Môn học trực thuộc (`/classes/{classId}/courses`)

#### 2.1. Gỡ môn học ra khỏi lớp (Unassign Course)
- **Method & Endpoint:** `DELETE /api/v1/classes/{classId}/courses/{courseId}`
- **Mục đích:** Xóa môn học khỏi lớp khi phân phối nhầm hoặc hủy môn (UI có nút "Gỡ môn").
- **Quyền:** `OWNER`, `ADMIN`
- **Response:** `200 OK` hoặc `204 No Content`.
- **Mức độ ưu tiên:** **P0**

#### 2.2. Phân công giảng viên phụ trách môn học cụ thể
- **Method & Endpoint:** `PATCH /api/v1/classes/{classId}/courses/{courseId}/instructor`
- **Mục đích:** Gán giảng viên/trợ giảng chịu trách nhiệm giảng dạy môn học đó trong lớp.
- **Request Body:**
  ```json
  {
    "instructorId": "uuid-giang-vien",
    "role": "PRIMARY_INSTRUCTOR" // hoặc "TA"
  }
  ```
- **Mức độ ưu tiên:** **P1**

#### 2.3. Danh sách môn học khả dụng để gán vào lớp
- **Method & Endpoint:** `GET /api/v1/classes/{classId}/courses/available`
- **Mục đích:** Trả về danh sách môn học của trường chưa được gán vào lớp này, phục vụ Modal "Thêm môn học có sẵn".
- **Response DTO:** `List<CourseSimpleResponseDTO>`
- **Mức độ ưu tiên:** **P1**

---

### Nhóm 3: Bảng tin & Thông báo (`/classes/class/{classId}/Announcements`)

#### 3.1. Chỉnh sửa thông báo
- **Method & Endpoint:** `PUT /api/v1/classes/class/{classId}/Announcements/{id}`
- **Mục đích:** Giảng viên sửa nội dung bài thông báo đã đăng.
- **Request Body:**
  ```json
  {
    "title": "Thông báo dời lịch kiểm tra giữa kỳ",
    "content": "Nội dung Markdown mới...",
    "attachmentUrls": ["https://storage.../tailieu.pdf"]
  }
  ```
- **Mức độ ưu tiên:** **P1**

#### 3.2. Xóa thông báo
- **Method & Endpoint:** `DELETE /api/v1/classes/class/{classId}/Announcements/{id}`
- **Mục đích:** Xóa bài đăng thông báo cũ hoặc nhầm lẫn.
- **Quyền:** Người tạo bài viết hoặc `OWNER`/`ADMIN`.
- **Mức độ ưu tiên:** **P1**

#### 3.3. Bình luận và thảo luận dưới bài thông báo
- **Endpoints:**
  - `GET /api/v1/classes/announcements/{id}/comments`: Lấy danh sách bình luận.
  - `POST /api/v1/classes/announcements/{id}/comments`: Gửi bình luận phản hồi.
- **Mục đích:** Sinh viên trao đổi, hỏi đáp thắc mắc dưới bài viết của giảng viên.
- **Mức độ ưu tiên:** **P2**

---

### Nhóm 4: Thành viên, Yêu cầu gia nhập & Điểm danh (`/classes/{classId}/members`)

#### 4.1. Từ chối yêu cầu gia nhập lớp
- **Method & Endpoint:** `POST /api/v1/classes/{classId}/reject`
- **Mục đích:** Giảng viên từ chối sinh viên xin vào lớp kèm lý do. (Hiện backend mới chỉ có `/approve`).
- **Request Body:**
  ```json
  {
    "userId": "uuid-sinh-vien",
    "reason": "Không thuộc danh sách sinh viên khoa CNTT"
  }
  ```
- **Mức độ ưu tiên:** **P0**

#### 4.2. Duyệt hàng loạt yêu cầu vào lớp
- **Method & Endpoint:** `POST /api/v1/classes/{classId}/members/batch-approve`
- **Mục đích:** Thao tác 1-click "Duyệt tất cả" khi đầu kỳ có nhiều sinh viên đăng ký.
- **Request Body:**
  ```json
  {
    "userIds": ["uuid-1", "uuid-2", "uuid-3"]
  }
  ```
- **Mức độ ưu tiên:** **P2**

---

### Nhóm 5: Cài đặt lớp & Header Banner

#### 5.1. Làm mới / Tạo lại mã tham gia lớp
- **Method & Endpoint:** `POST /api/v1/classes/{id}/regenerate-code`
- **Mục đích:** Đổi mã ngẫu nhiên mới khi mã tham gia cũ bị lộ ra ngoài lớp.
- **Response:**
  ```json
  {
    "classId": "uuid-lop-hoc",
    "newEnrollmentKey": "CS2026-X9Y"
  }
  ```
- **Mức độ ưu tiên:** **P1**

#### 5.2. Thống kê nhanh trên Header Banner lớp học
- **Method & Endpoint:** `GET /api/v1/classes/{id}/stats`
- **Mục đích:** Trả về các chỉ số hiển thị trên Banner đầu trang chi tiết:
  ```json
  {
    "coursesCount": 4,
    "studentsCount": 42,
    "teachersCount": 3
  }
  ```
- **Mức độ ưu tiên:** **P1**

---

## 3. CHI TIẾT CÁC TRƯỜNG DTO CÒN THIẾU (MISSING DTO FIELDS)

### 3.1. Đối tượng `ClassResponseDTO` / `ClassItem`
Hiện tại Backend trả về: `id`, `name`, `title`, `description`, `academicYear`, `major`, `maxStudents`, `enrollmentKey`.

**Các trường DTO bắt buộc cần bổ sung**:
| Tên trường | Kiểu dữ liệu | Ý nghĩa & Vị trí hiển thị trên UI |
| :--- | :--- | :--- |
| `semester` | `String` | Học kỳ hiển thị trên badge thẻ lớp (ví dụ: `"Học kỳ 1 (2026-2027)"` hoặc `"HK1"`). |
| `enrolledCount` | `Number` | Số học viên thực tế đã vào lớp. Dùng để tính toán tỷ lệ lấp đầy sĩ số: `enrolledCount / maxStudents * 100%`. |
| `isCodeClosed` | `Boolean` | Cờ trạng thái mã mời đang Bật hay Đã khóa (dù có endpoint cập nhật `code-status`, nhưng DTO chi tiết lớp cần trả về cờ này). |
| `schedule` | `Object` | Thông tin phòng học và buổi học chính: `{ "room": "A2-301", "dayOfWeek": "Thứ 2", "timeSlot": "Ca 2" }`. |
| `teachingRole` | `String` | Vai trò của user đối với lớp: `'PRIMARY_INSTRUCTOR' \| 'TA' \| 'STUDENT'`. |
| `instructor` | `Object` | Thông tin Giảng viên chủ nhiệm: `{ "id": "...", "fullName": "...", "email": "...", "avatar": "..." }`. |
| `stats` | `Object` | Chỉ số cảnh báo badge vàng trên thẻ: `{ "pendingRequestsCount": 3, "ungradedAssignmentsCount": 12 }`. |

---

### 3.2. Đối tượng Môn học trong lớp `CourseInClassDTO`
Khi gọi `GET /api/v1/classes/{classId}/courses`, cần bổ sung:
| Tên trường | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `courseCode` | `String` | Mã môn học định danh (ví dụ: `"IT3010"`). |
| `credits` | `Number` | Số tín chỉ của môn (ví dụ: `3`). |
| `assignedTeacher` | `Object` | Giảng viên phụ trách môn: `{ "fullName": "...", "email": "...", "avatar": "..." }`. |
| `progressPercent` | `Number` | Tiến độ % hoàn thành môn học của cả lớp (ví dụ: `68%`). |
| `status` | `String` | Trạng thái: `'IN_PROGRESS' \| 'COMPLETED' \| 'UPCOMING'`. |

---

### 3.3. Đối tượng Thông báo lớp học `AnnouncementResponseDTO`
Khi gọi `GET /api/v1/classes/class/{classId}/Announcements`, cần bổ sung:
| Tên trường | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `author` | `Object` | Thông tin người đăng: `{ "id": "...", "fullName": "...", "avatar": "...", "role": "..." }`. |
| `isPinned` | `Boolean` | Đã được ghim lên đầu bảng tin hay chưa. |
| `attachments` | `Array<FileDTO>` | Danh sách file đính kèm: `[{ "name": "...", "url": "...", "fileSize": 1024, "type": "pdf" }]`. |
| `commentsCount` | `Number` | Số lượng phản hồi/bình luận của sinh viên. |

---

### 3.4. Đối tượng Thành viên lớp học `ClassMemberDTO`
Khi gọi `GET /api/v1/classes/{classId}/members`, cần bổ sung:
| Tên trường | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `studentCode` / `teacherCode` | `String` | Mã số sinh viên (MSSV) hoặc Mã cán bộ hiển thị trên bảng danh sách. |
| `attendanceRate` | `Number` | Tỷ lệ chuyên cần (% buổi học có mặt). |
| `averageScore` | `Number` | Điểm trung bình các bài tập / bài kiểm tra đã làm. |
| `status` | `String` | Trạng thái: `'ACTIVE' \| 'PENDING' \| 'SUSPENDED'`. Phục vụ phân tab "Đang học" và "Chờ duyệt". |

---

## 4. GIẢI PHÁP RESILIENT DATA LAYER TẠI FRONTEND

Để đảm bảo Frontend vẫn hoạt động mượt mà, không phụ thuộc tuyệt đối vào tiến độ Backend:
1. **Zod Resilient Schema** ([class.schema.ts](file:///d:/ILMS-FE/src/features/classes/schemas/class.schema.ts)): Toàn bộ các trường còn thiếu đều được định nghĩa dạng `.optional().default(...)`. Khi Backend bổ sung trường nào, Frontend sẽ tự động nhận trường đó mà không bị lỗi parse.
2. **Mock Fallback Strategy**:
   - Nếu Backend trả về rỗng hoặc chưa có endpoint (`courses`, `announcements`, `members`), Frontend tự động sử dụng bộ Mock Data nội bộ chuẩn UI SaaS để trình diễn đầy đủ chức năng.
3. **Role Simulator Switcher**:
   - Tích hợp công tắc chuyển đổi giữa quyền "Chủ lớp" (Owner) và "Giảng viên bộ môn" (Teacher) ngay trên Header để kiểm thử phân quyền giao diện (ẩn/hiện nút Thêm môn, Cài đặt lớp, Duyệt sinh viên).

---

## 5. KẾ HOẠCH HÀNH ĐỘNG & ĐỀ XUẤT CHO BACKEND

| Hạng mục | Mức độ | Trách nhiệm | Mục tiêu hoàn thành |
| :--- | :---: | :--- | :---: |
| Bổ sung trường `semester`, `enrolledCount`, `isCodeClosed` vào `ClassResponseDTO` | **P0** | Backend | Tuần tới |
| Triển khai endpoint `DELETE /classes/{classId}/courses/{courseId}` (Gỡ môn) | **P0** | Backend | Tuần tới |
| Triển khai endpoint `POST /classes/{classId}/reject` (Từ chối yêu cầu vào lớp) | **P0** | Backend | Tuần tới |
| Bổ sung DTO đầy đủ cho `CourseInClassDTO` và `ClassMemberDTO` | **P1** | Backend | Sprint sau |
| Triển khai endpoint `GET /api/v1/classes/kpi-summary` (Thống kê đầu trang) | **P1** | Backend | Sprint sau |
| Hỗ trợ đổi mã mời `POST /api/v1/classes/{id}/regenerate-code` | **P1** | Backend | Sprint sau |

