# Modular Block-Based Lesson Workspace (Notion-style)

- **Ngày:** 2026-11-18
- **Tóm tắt kế hoạch:** Xây dựng Không gian bài giảng dạng khối (Modular Block Canvas) hỗ trợ 2 chế độ Biên soạn (`canEdit` + Slash Command `/` + Kéo thả Fractional Indexing + Auto-save debounce 1000ms) và Học tập (Video progress, Slide/PDF, Code Sandbox, Inline Quiz, Mermaid/Vis3D Diagram, nút "Hỏi Cú AI về khối này") kết nối toàn bộ API trong `docs/api-spec.md` §5.2.1 & §15.2.
- **Kế hoạch đã duyệt:** `C:/Users/Admin/.gemini/antigravity/brain/cc08f642-fa3d-447a-9679-f1aedbaf3722/implementation_plan.md`

```text
STATUS: COMPLETE
SUMMARY: Đã xây dựng hoàn chỉnh Giao diện bài giảng dạng khối (Modular Block Canvas) gồm Editor Mode & Viewer Mode, kết nối đầy đủ 9 endpoint lesson_blocks/progress và tích hợp ngữ cảnh từng khối vào Cú AI Socratic nổi.
FILES: created lesson-block.schema.ts, fractional-index.ts, lesson-block.service.ts, useLessonBlocks.ts, block-registry.ts, SlashCommandMenu.tsx, BlockWrapper.tsx, BasicBlocks.tsx, VideoBlock.tsx, SlideBlock.tsx, CodeSandboxBlock.tsx, QuizBlock.tsx, DiagramBlock.tsx, LessonBlockCanvas.tsx; modified constants.ts, useSocraticLessonContext.ts, GlobalSocraticCoach.tsx, ai-chat.service.ts, useSocraticChat.ts, SocraticAICoach.tsx, LessonBottomWorkspaceBar.tsx, LessonLearningWorkspace.tsx
CHECKS: lint not run (package.json không có script "lint") · typecheck ✔ · tests not run · build not run
ASSUMPTIONS: Backend cung cấp đúng các endpoint tại /api/v1/lessons/{lessonId}/blocks/*, trả cờ canEdit chính xác và hỗ trợ block_context trong /api/v1/student/chat/stream; chưa cài thêm @dnd-kit hay @monaco-editor (dùng HTML5 Drag & Drop + editor thuần không thêm dependency).
RISKS / LIMITATIONS: Chưa chạy npm run build và chưa kiểm thử E2E trực tiếp với Spring Boot backend đang chạy [NOT VERIFIED]; CodeSandboxBlock mới thực thi được JavaScript trong sandboxed iframe (Python/Java/C++ cần nối Judge0).
DOCS: updated TASKS.md, reports/2026-11-18-modular-block-lesson-workspace.md
DEPLOYMENT: not applicable
NEXT: Mở một bài học với tài khoản chủ môn học / sinh viên để kiểm tra trực tiếp Editor Mode (thêm khối, kéo thả, auto-save), Inline Quiz, Video progress và nút "Hỏi Cú AI" trên từng khối.
```

## Review
- Kiểm tra an toàn:
  - Các URL nhúng ở `VideoBlock`, `SlideBlock`, `ImageBlock` đều kiểm tra whitelist giao thức `https?://`.
  - Thực thi mã JavaScript trong `CodeSandboxBlock` chạy cô lập trong `<iframe sandbox="allow-scripts">` (không cấp `allow-same-origin`).
  - Phân quyền chế độ biên soạn tuân thủ cờ `canEdit` trả về từ `GET /api/v1/lessons/{lessonId}/blocks` theo quy định tại `docs/api-spec.md`.
- Kiểm tra TypeScript: `npx tsc --noEmit` đạt mã thoát `0` sau chỉnh sửa cuối cùng.
