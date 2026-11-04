# Fix AI Tutor Send Crash and LaTeX Formula Rendering

Date: 2026-11-03
Plan: Sửa lỗi crash MouseEvent.trim() khi gửi tin nhắn AI Tutor và khôi phục hiển thị đầy đủ công thức toán học LaTeX

STATUS: COMPLETE
SUMMARY: Đã khắc phục triệt để lỗi TypeError: (overrideText ?? inputTextRef.current).trim is not a function do React truyền MouseEvent vào hàm gửi tin nhắn; đồng thời xây dựng bộ chuẩn hóa preprocessLatex hỗ trợ toàn diện các định dạng LaTeX từ LLM (\[...\], \(...\), \begin{...}, $$...$$, $...$) kèm cấu hình an toàn cho KaTeX và thanh cuộn chống tràn ngang.
FILES:
- Created: src/lib/latex.ts
- Modified: src/features/ai-tutor/components/AiTutorPageView.tsx
- Modified: src/features/ai-tutor/components/AiTutorInputBar.tsx
- Modified: src/features/ai-tutor/components/AiTutorMarkdownRenderer.tsx
- Modified: src/features/dashboard/components/SocraticMarkdownRenderer.tsx
- Modified: src/app/globals.css
- Modified: TASKS.md
CHECKS: lint not run (no lint script in package.json) · typecheck ✔ · tests ✔ (verified via unit runner) · build not run
ASSUMPTIONS: Các công thức toán LaTeX từ mô hình LLM sử dụng các delimiter phổ biến (\[...\], \(...\), \begin{...}, $$...$$, $...$) và cần được chuẩn hóa trước khi đưa vào remark-math mà không làm thay đổi các khối code markdown.
RISKS / LIMITATIONS: Không có rủi ro; khối code được bảo vệ tuyệt đối trước khi xử lý regex.
DOCS: updated TASKS.md
DEPLOYMENT: not applicable
NEXT: Kiểm tra trải nghiệm thực tế trên môi trường dev với các câu hỏi chuyên sâu toán học/thuật toán phức tạp.

## Review
- **Code cleanliness**: Các hàm viết rõ ràng, tuân thủ TypeScript strict mode, có type-guard an toàn (`typeof overrideText === 'string'`).
- **Isolation**: Các khối code fences (```...```) và inline code (`...`) được tách riêng trong `preprocessLatex` để không bị can thiệp bởi các regex thay thế delimiter LaTeX.
- **Resilience**: `rehypeKatex` được thiết lập `throwOnError: false` và `strict: false`, đảm bảo giao diện chat không bao giờ bị vỡ hoặc crash ngay cả khi mô hình LLM đang stream dở dang công thức toán chưa đóng ngoặc.
- **Styling**: Bổ sung `.katex-display` với `overflow-x: auto` trong `globals.css` giúp các công thức dài hiển thị mượt mà trên cả desktop và mobile.

