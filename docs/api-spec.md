# API SPEC — ILMS

> **Status: PROPOSED CONTRACT.** Written from the PRD so the frontend can start. Replace with the real backend/OpenAPI spec as soon as it exists. Agents: if an endpoint is missing or differs from the real backend, **ask — never invent fields**.

## 1. Conventions
- Base URL: `NEXT_PUBLIC_API_URL` (ví dụ: `http://localhost:8080/api/v1`)
- Format: JSON, UTF-8. Dates: ISO 8601 UTC strings. IDs: UUID strings.
- Auth: Custom JWT. Gửi qua Header `Authorization: Bearer <token>` (Hoặc lấy từ Cookie tùy cấu hình frontend). Unauthenticated → `401`, forbidden → `403`.
- Locale: send `Accept-Language: vi|en`.

### Success envelope (Khớp với `ApiResponse<T>`)
```json
{ 
  "status": 0, 
  "message": "Thành công", 
  "data": { }, 
  "timestamp": "2026-10-10T09:32:45.547Z" 
}
```
### Paginated data (matches `PaginatedResponse<T>`)
```json
{ 
  "status": 0, 
  "message": "string", 
  "data": { 
    "items": [], 
    "pageNumber": 0, 
    "pageSize": 10, 
    "totalElements": 0, 
    "totalPages": 0, 
    "last": true 
  },
  "timestamp": "2026-10-10T09:32:45.547Z"
}
```
Query: `?page=1&pageSize=10&sort=createdAt:desc&search=...`

### Error envelope (becomes `ApiError`)
```json
{ 
  "status": 40001, 
  "message": "Tên khóa học đã tồn tại", 
  "data": null,
  "timestamp": "2026-10-10T09:32:45.547Z"
}
```
Field errors use i18n keys so the UI can translate them.

### Common error codes
| HTTP | code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid input (`details.fieldErrors`) |
| 401 | `UNAUTHENTICATED` | Missing/expired session |
| 403 | `FORBIDDEN` | Not allowed |
| 404 | `NOT_FOUND` | Resource missing |
| 409 | `CONFLICT` | Duplicate/invalid state (e.g. already enrolled) |
| 422 | `BUSINESS_RULE` | Rule violated (e.g. delete course with enrollments) |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

## 2. Auth

| Method | Path | Purpose | Request Body | Response `data` Object |
|---|---|---|---|---|
| POST | `/auth/login` | Xác thực người dùng (Login) | `{ "email": "...", "password": "..." }` | `UserProfile` |
| POST | `/auth/register` | Đăng ký tài khoản mới | `{ "email": "...", "password": "...", "firstName": "...", "middleName": "...", "lastName": "..." }` | `UserProfile` |
| POST | `/auth/logout` | Đăng xuất (Clear session) | | Xóa Cookie |
| GET | `/auth/me` | Lấy thông tin user hiện tại | | `UserProfile` |

### Schema Model: `UserProfile`
Đây là cục dữ liệu nằm bên trong trường `data` của `ApiResponse<T>` (áp dụng cho `/auth/login` và `/auth/me`).

*Lưu ý cho AI: Backend trả JWT Token ngầm qua `Set-Cookie: HttpOnly` header trong endpoint `/auth/login`, KHÔNG CÓ trường token trong body JSON. Axios interceptor cần được cấu hình `withCredentials: true` để tự động đính kèm cookie này cho các request sau.*

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "roleName": "ADMIN",
  "email": "user@example.com",
  "firstName": "Nguyễn",
  "middleName": "Văn",
  "lastName": "A"
}


## Socratic SSE protocol 2 (2026-11-02)

POST chat/socratic/stream accepts protocol_version (1 or 2), client_request_id (UUID) and optional expected_state_version. Spring derives student_id from the authenticated user. Protocol 1 remains the default for existing callers; the tutor UI sends 2. Each new explicit send gets a new request ID. Retry transport with the same payload/ID; automatic retry is not implemented by this change.

Forward event names and JSON unchanged, without buffering: session_init, status, token, content_replace, context_ref, step_update, diagram_ready, exercise_ready, done, error. Comments are heartbeats. Status contains stage/state/message and describes real tasks, never private chain-of-thought. The UI localizes stage labels. Tokens append provisional text; content_replace replaces the whole draft; done.full_content replaces text and confirms persistence. Error or EOF before done marks the draft incomplete, never successful. Unknown events are ignored; artifact rendering remains outside this change.


## Confirmed exercise step metadata (2026-11-02)

session_init/step_update/done and history messages can contain nullable step_progress: {step_id, exercise_id, number, total, instruction, completed}. Only this explicit metadata permits numbered step UI. Internal current_step_number is not display evidence. step_number_at_turn can be null. Missing metadata hides badges and the stepper, including old history; no frontend fallback total. Spring forwards metadata in historical DTOs and SSE pass-through.
