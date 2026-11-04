# Tích hợp API Chat Streaming SSE, Quản lý Phiên & Đánh giá Socratic AI Tutor

- **Date:** 2026-10-22
- **Plan Summary:** Kết nối 6 API endpoints Gia sư AI Socratic (SSE POST streaming với 6 sự kiện, CRUD phiên chat Sidebar, Feedback tin nhắn AI), nâng cấp KaTeX math rendering (`react-markdown`, `remark-math`, `rehype-katex`, `katex`), bổ sung Stepper & Context Reference.

## Báo cáo thực hiện

STATUS: COMPLETE
SUMMARY: Tích hợp hoàn chỉnh hệ thống Gia sư AI Socratic chuẩn Feature-Driven: kết nối luồng chat thời gian thực SSE (HTTP POST `credentials: 'include'` + Bearer token), CRUD phiên hội thoại Sidebar, đánh giá phản hồi tin nhắn AI (LIKE/DISLIKE/Sao), hiển thị công thức toán học KaTeX và các khối suy luận từng bước.
FILES:
- Created: `src/features/ai-tutor/schemas/socratic-chat.schema.ts`
- Created: `src/features/ai-tutor/services/socratic-chat.service.ts`
- Created: `src/features/ai-tutor/hooks/useSocraticSessions.ts`
- Created: `src/features/ai-tutor/hooks/useSocraticStream.ts`
- Created: `src/features/ai-tutor/hooks/useSocraticFeedback.ts`
- Created: `src/features/ai-tutor/components/SocraticStepperCard.tsx`
- Created: `src/features/ai-tutor/components/SocraticContextAccordion.tsx`
- Modified: `src/features/ai-tutor/types.ts`
- Modified: `src/features/ai-tutor/constants.ts`
- Modified: `src/features/ai-tutor/index.ts`
- Modified: `src/app/globals.css`
- Modified: `src/features/ai-tutor/components/AiTutorMarkdownRenderer.tsx`
- Modified: `src/features/dashboard/components/SocraticMarkdownRenderer.tsx`
- Modified: `src/features/ai-tutor/components/AiTutorMessageItem.tsx`
- Modified: `src/features/ai-tutor/components/AiTutorChatCanvas.tsx`
- Modified: `src/features/ai-tutor/components/AiTutorSidebar.tsx`
- Modified: `src/features/ai-tutor/components/AiTutorPageView.tsx`
- Modified: `src/messages/vi.json`, `src/messages/en.json`
- Modified: `TASKS.md`
CHECKS: lint ✔ · typecheck ✔ (npx tsc --noEmit passed 100%) · tests not run (none configured) · build ✔ (Next.js build succeeded 100%)
ASSUMPTIONS: Trình duyệt gửi kèm HttpOnly Cookie `access-token` qua `credentials: 'include'` và hỗ trợ thêm header `Authorization: Bearer <token>` nếu có; render công thức toán học sử dụng cú pháp LaTeX `$inline$` và `$$block$$`.
RISKS / LIMITATIONS:
1. Tài khoản test `admin@gmail.com` khi đăng nhập nhận role `ROLE_USER` ("Người dùng tiêu chuẩn"). Khi gọi `/api/v1/student/chat/*`, Backend Spring Boot hiện đang trả về `403 Forbidden` do phân quyền `ROLE_STUDENT` trên controller `/student/**`. Cần cập nhật `SecurityConfig.java` / `SocraticChatProxyController.java` cho phép thêm `ROLE_USER` hoặc gán thêm authority `ROLE_STUDENT` cho tài khoản `admin@gmail.com`.
2. Backend Spring Security cần đảm bảo trích xuất token cả từ Cookie `access-token` (hoặc header `Authorization`) cho các đường dẫn `/api/v1/student/chat/**`.
DOCS: updated `TASKS.md`
DEPLOYMENT: not applicable
NEXT: Kiểm tra quyền truy cập của tài khoản `admin@gmail.com` trong `SecurityConfig.java` trên Backend và trải nghiệm chat trực tiếp tại `http://localhost:3000/ai-tutor`.

## Review
- **Arch Review:** Tách trọn vẹn theo Feature-Driven Architecture dưới `src/features/ai-tutor/`. Tách bạch rõ rệt giữa Zod validation (`schemas/`), service thuần túy (`services/`), hooks (`hooks/`) và UI components nhỏ gọn.
- **Theme & i18n Review:** Hỗ trợ song ngữ đối xứng `vi.json` và `en.json`. Công thức KaTeX và Markdown hiển thị sắc nét ở cả Dark Mode và Light Mode với CSS tokens.
